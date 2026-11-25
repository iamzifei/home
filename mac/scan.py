#!/usr/bin/env python3
"""jamesai.dev/mac — scan the Mac apps (and Claude Code skills) you actually use.

    curl -fsSL https://jamesai.dev/mac/scan.py | python3

What it does, all on your own machine:
  1. Lists the apps in /Applications and ~/Applications, and reads the launch
     count and last-used date macOS Spotlight keeps for each
     (kMDItemUseCount / kMDItemLastUsedDate).
  2. If you use Claude Code, counts how many times each installed skill was
     run in the last 30 days (from ~/.claude/projects transcripts — only the
     skill NAME is read, never the conversation).
  3. Writes a page to a temp folder and opens it in your browser. There you
     tick what to share and add a reason. Nothing is uploaded until you press
     Submit, which opens GitHub with your file filled in for review.

Python 3.8+, standard library only. Read it before you run it: it is short.
"""
import json
import plistlib
import re
import subprocess
import sys
import tempfile
import time
import webbrowser
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
VALID_ID = re.compile(r"[A-Za-z0-9._\- ]{1,200}")  # same rule as scripts/validate-mac-profile.py
APP_DIRS = [Path("/Applications"), HOME / "Applications"]
SKILL_WINDOW_DAYS = 30

# Mac App Store category -> this site's categories. Anything unmapped is "other".
CATEGORY = {
    "Developer Tools": "dev", "Productivity": "work", "Utilities": "work", "Business": "chat",
    "Social Networking": "chat", "Video": "media", "Music": "media", "Photography": "media",
    "Graphics & Design": "media", "Entertainment": "media", "Reference": "work",
    "Education": "work", "Finance": "work", "News": "web", "Lifestyle": "other",
}


# ----------------------------------------------------------------------------- apps
def find_apps():
    """Top-level .app bundles, plus one folder level down (e.g. /Applications/Utilities)."""
    found = []
    for root in APP_DIRS:
        if not root.is_dir():
            continue
        for p in safe_listdir(root):
            if p.suffix == ".app":
                found.append(p)
            elif p.is_dir() and not p.name.startswith("."):
                found.extend(q for q in safe_listdir(p) if q.suffix == ".app")
    return found


def safe_listdir(d):
    """Sorted entries, or nothing if the folder can't be read (permissions)."""
    try:
        return sorted(d.iterdir())
    except OSError:
        return []


def mdls_batch(paths, attr):
    """One mdls call for many files. With -raw, values come back NUL-separated in input order."""
    if not paths:
        return []
    out = subprocess.run(["mdls", "-raw", "-name", attr] + [str(p) for p in paths],
                         capture_output=True, text=True).stdout.split("\0")
    vals = [None if v.strip() in ("", "(null)") else v.strip() for v in out]
    return (vals + [None] * len(paths))[: len(paths)]


def read_plist(app):
    try:
        with open(app / "Contents" / "Info.plist", "rb") as fh:
            return plistlib.load(fh)
    except Exception:
        return {}


def scan_apps():
    apps = find_apps()
    uses = mdls_batch(apps, "kMDItemUseCount")
    last = mdls_batch(apps, "kMDItemLastUsedDate")
    cats = mdls_batch(apps, "kMDItemAppStoreCategory")
    rows = []
    for app, u, l, c in zip(apps, uses, last, cats):
        info = read_plist(app)
        bid = info.get("CFBundleIdentifier") or app.stem
        name = info.get("CFBundleDisplayName") or info.get("CFBundleName") or app.stem
        if not VALID_ID.fullmatch(bid):
            continue  # the site's validator would reject this id; don't offer it
        last_iso = None
        if l:
            try:
                last_iso = datetime.strptime(l, "%Y-%m-%d %H:%M:%S %z").isoformat()
            except ValueError:
                pass
        rows.append({
            "id": bid, "name": str(name)[:60],
            "uses": int(u) if u and u.isdigit() else None,
            "last": last_iso, "cat": CATEGORY.get(c or "", "other"),
        })
    # De-duplicate by bundle id (two copies of one app), keeping the most used.
    best = {}
    for r in rows:
        if r["id"] not in best or (r["uses"] or 0) > (best[r["id"]]["uses"] or 0):
            best[r["id"]] = r
    return sorted(best.values(), key=lambda r: -(r["uses"] or 0))


# ----------------------------------------------------------------------------- skills
def installed_skills():
    """Names Claude Code would accept for the Skill tool: ~/.claude/skills/<name>
    and plugin skills as <plugin>:<name>. Built-in commands (/clear, /model …)
    are therefore never counted."""
    names = set()
    base = HOME / ".claude" / "skills"
    if base.is_dir():
        names.update(p.name for p in base.iterdir() if (p / "SKILL.md").exists())
    plugins = HOME / ".claude" / "plugins"
    if plugins.is_dir():
        for skill_md in plugins.glob("**/skills/*/SKILL.md"):
            skill = skill_md.parent.name
            names.add(skill)
            plugin = plugin_name(skill_md.parent.parent.parent)
            if plugin:
                names.add(f"{plugin}:{skill}")
    return names


def plugin_name(root):
    """A plugin's real name from its manifest; the folder may be a version or hash."""
    for manifest in (root / ".claude-plugin" / "plugin.json", root / "plugin.json"):
        try:
            return json.loads(manifest.read_text())["name"]
        except (OSError, ValueError, KeyError, TypeError):
            continue
    return None


SKILL_CALL = re.compile(r'"name":"Skill","input":\{"skill":"([^"]+)"')
SLASH_CALL = re.compile(r"<command-name>/([^<\s]+)</command-name>")


def scan_skills(window_days=SKILL_WINDOW_DAYS):
    root = HOME / ".claude" / "projects"
    if not root.is_dir():
        return []
    known = installed_skills()
    cutoff = time.time() - window_days * 86400
    counts = {}
    for f in root.glob("**/*.jsonl"):
        try:
            if f.stat().st_mtime < cutoff:
                continue
            # Line by line: transcripts can be hundreds of MB in total.
            with open(f, encoding="utf-8", errors="ignore") as fh:
                for line in fh:
                    if "Skill" not in line and "command-name" not in line:
                        continue
                    for m in list(SKILL_CALL.finditer(line)) + list(SLASH_CALL.finditer(line)):
                        name = m.group(1)
                        if name in known:
                            counts[name] = counts.get(name, 0) + 1
        except OSError:
            continue
    return [{"name": k, "uses": v} for k, v in sorted(counts.items(), key=lambda kv: -kv[1])]


# ----------------------------------------------------------------------------- picker page
PAGE = r"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>jamesai.dev/mac</title>
<style>
:root{color-scheme:light dark;--bg:#F5F1E8;--card:#FFFDF8;--ink:#12255E;--ink3:#616C8E;--rule:#C6CBD9;--acc:#C65F38}
@media(prefers-color-scheme:dark){:root{--bg:#14161C;--card:#1A1D25;--ink:#ECE8DF;--ink3:#8B93A8;--rule:#333849;--acc:#E0784B}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC",sans-serif}
.w{width:min(100% - 32px,860px);margin:0 auto;padding:32px 0 120px}h1{font:600 30px/1.2 Georgia,"Songti SC",serif;margin:0 0 8px}
p{color:var(--ink3)}label.f{display:block;margin:12px 0 4px;font-size:13px;color:var(--ink3)}
input[type=text]{width:100%;font:inherit;padding:8px 10px;border:1px solid var(--rule);border-radius:8px;background:var(--card);color:var(--ink)}
h2{font:600 20px/1.3 Georgia,serif;margin:28px 0 8px}.row{display:grid;grid-template-columns:24px 1fr 110px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--rule)}
.row .n{font-weight:600}.row .s{font-size:12px;color:var(--ink3)}.row input[type=text]{grid-column:2/4;padding:5px 8px;font-size:13px}
.row .u{text-align:right;font-size:13px;color:var(--ink3);font-variant-numeric:tabular-nums}
.bar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--rule);padding:12px 16px;display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap}
button{font:inherit;border:0;border-radius:999px;padding:9px 18px;cursor:pointer;background:var(--ink);color:var(--bg)}button.alt{background:transparent;color:var(--ink);border:1px solid var(--rule)}
#msg{font-size:13px;color:var(--acc);width:100%;text-align:center}
</style></head><body><div class="w">
<h1 data-t="title"></h1><p data-t="intro"></p>
<label class="f" data-t="handle"></label><input type="text" id="handle" placeholder="github-username" autocomplete="off">
<label class="f" data-t="name"></label><input type="text" id="name" maxlength="40">
<label class="f" data-t="bio"></label><input type="text" id="bio" maxlength="160">
<label class="f" data-t="x"></label><input type="text" id="x" maxlength="15" placeholder="optional">
<h2 data-t="apps"></h2><p data-t="appsHint"></p><div id="apps"></div>
<h2 data-t="skills" id="skh"></h2><div id="skills"></div>
</div>
<div class="bar"><span id="msg"></span><button class="alt" id="dl" data-t="download"></button><button id="go" data-t="submit"></button></div>
<script>
var DATA = __DATA__;
var T = {
 zh: {title:'挑选你要公开的软件',intro:'下面是这台 Mac 上的 App 和它们的真实打开次数。勾选你愿意公开的，可以给每个写一句为什么推荐。点「提交」之前，这些数据都只在你电脑上。',handle:'GitHub 用户名（必填，你的页面地址会是 jamesai.dev/mac/u/?h=这个名字）',name:'显示名',bio:'一句话介绍（可选）',x:'X / Twitter 用户名（可选）',apps:'Mac 软件',appsHint:'默认勾选了打开次数最多的 30 个，最多 60 个。请取消不想公开的。',skills:'Claude Code 技能（近 30 天调用次数，默认都不勾选）',download:'下载 JSON',submit:'用 GitHub 提交',needHandle:'先填 GitHub 用户名',tooMany:'最多选 60 个 App',opened:'次',why:'为什么推荐（可选，140 字内）',done:'已在新标签页打开 GitHub：点「Propose changes」→「Create pull request」就完成了。',paste:'内容已复制。在新打开的 GitHub 页面里点编辑区按 ⌘V 粘贴，再点「Propose changes」→「Create pull request」。'},
 en: {title:'Pick what to share',intro:'These are the apps on this Mac with their real launch counts. Tick the ones you are happy to share, and add a reason if you like. Until you press Submit, none of this leaves your computer.',handle:'GitHub username (required — your page will be jamesai.dev/mac/u/?h=this)',name:'Display name',bio:'One-line bio (optional)',x:'X / Twitter handle (optional)',apps:'Mac apps',appsHint:'Your 30 most-opened apps are pre-ticked (max 60). Untick anything private.',skills:'Claude Code skills (runs in the last 30 days, none ticked by default)',download:'Download JSON',submit:'Submit with GitHub',needHandle:'Enter your GitHub username first',tooMany:'Pick at most 60 apps',opened:'×',why:'Why you recommend it (optional, 140 chars)',done:'GitHub opened in a new tab: press “Propose changes”, then “Create pull request”.',paste:'Copied. In the GitHub tab, click the editor and press ⌘V, then “Propose changes” → “Create pull request”.'}
};
// Proxy / anonymity tools are never pre-ticked: sharing them can be sensitive.
var PRIVATE=/tor|vpn|clash|shadowrocket|quickfox|nexitally|surge|v2ray|proxy|wireguard/i;
var L = /^zh/i.test(navigator.language) ? T.zh : T.en;
document.querySelectorAll('[data-t]').forEach(function(e){e.textContent=L[e.dataset.t];});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function row(kind,i,it,on){return '<div class="row"><input type="checkbox" data-k="'+kind+'" data-i="'+i+'"'+(on?' checked':'')+'><div><div class="n">'+esc(it.name)+'</div><div class="s">'+esc(it.id||'')+'</div></div><div class="u">'+(it.uses==null?'—':it.uses.toLocaleString()+' '+L.opened)+'</div><input type="text" maxlength="140" data-note="'+kind+i+'" placeholder="'+L.why+'"></div>';}
document.getElementById('apps').innerHTML=DATA.apps.map(function(a,i){return row('a',i,a,i<30&&(a.uses||0)>=3&&!PRIVATE.test(a.id+' '+a.name));}).join('');
if(!DATA.skills.length){document.getElementById('skh').style.display='none';}
document.getElementById('skills').innerHTML=DATA.skills.map(function(s,i){return row('s',i,s,false);}).join('');
function build(){
 var h=document.getElementById('handle').value.trim().replace(/^@/,'');
 if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(h)){alert(L.needHandle);return null;}
 var pick=function(k,list){return list.map(function(it,i){var c=document.querySelector('[data-k="'+k+'"][data-i="'+i+'"]');if(!c||!c.checked)return null;var o=Object.assign({},it);var n=document.querySelector('[data-note="'+k+i+'"]').value.trim();if(n)o.note=n;return o;}).filter(Boolean);};
 var apps=pick('a',DATA.apps);if(apps.length>60){alert(L.tooMany);return null;}
 var p={v:1,handle:h,name:document.getElementById('name').value.trim()||h,scannedAt:DATA.scannedAt,skillsDays:DATA.skillsDays,apps:apps,skills:pick('s',DATA.skills)};
 var bio=document.getElementById('bio').value.trim();if(bio)p.bio=bio;
 var x=document.getElementById('x').value.trim().replace(/^@/,'');if(x)p.x=x;
 return p;}
document.getElementById('dl').onclick=function(){var p=build();if(!p)return;var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,1)],{type:'application/json'}));a.download=p.handle+'.json';a.click();};
document.getElementById('go').onclick=function(){var p=build();if(!p)return;
 // GitHub rejects URLs over ~8 KB (414). Short submissions ride in the URL;
 // long ones go via the clipboard and the reader pastes into GitHub's editor.
 var base='https://github.com/iamzifei/home/new/main/mac/u?filename='+encodeURIComponent(p.handle+'.json');
 var full=base+'&value='+encodeURIComponent(JSON.stringify(p));
 if(full.length<=6000){window.open(full,'_blank');document.getElementById('msg').textContent=L.done;return;}
 var txt=JSON.stringify(p,null,1);
 (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).catch(function(){var t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();})
  .then(function(){window.open(base,'_blank');document.getElementById('msg').textContent=L.paste;});};
</script></body></html>"""


def main():
    if sys.platform != "darwin":
        sys.exit("This scanner only runs on macOS.")
    print("Scanning apps…", flush=True)
    apps = scan_apps()
    print(f"  {len(apps)} apps")
    print("Counting Claude Code skills…", flush=True)
    skills = scan_skills()
    print(f"  {len(skills)} skills used in the last {SKILL_WINDOW_DAYS} days")
    data = {
        "scannedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "skillsDays": SKILL_WINDOW_DAYS, "apps": apps, "skills": skills,
    }
    # </ inside the JSON would close the <script>; escape it.
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    out = Path(tempfile.mkdtemp(prefix="jamesai-mac-")) / "pick.html"
    out.write_text(PAGE.replace("__DATA__", blob), encoding="utf-8")
    print(f"Opening {out}")
    webbrowser.open(out.as_uri())


if __name__ == "__main__":
    main()
