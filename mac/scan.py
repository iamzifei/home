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
  3. Starts a tiny web server on 127.0.0.1 (this Mac only) and opens a page
     where you tick what to share and add a reason. Nothing is uploaded until
     you press Publish; then only what you ticked is sent to jamesai.dev and
     your page is live straight away.
  4. Saves your page name and its edit key in ~/.config/jamesai/mac.json, so
     running this again updates the same page with your last choices ticked.

Python 3.8+, standard library only. Read it before you run it: it is short.
"""
import json
import plistlib
import re
import secrets
import subprocess
import sys
import threading
import urllib.error
import urllib.request
import time
import webbrowser
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
VALID_ID = re.compile(r"[A-Za-z0-9._\- ]{1,200}")  # same rule as mac-api/macapi/validate.py
VALID_SKILL = re.compile(r"[\w.\-]+(?::[\w.\-]+)?")  # same rule as mac-api/macapi/validate.py
APP_DIRS = [Path("/Applications"), HOME / "Applications"]
SKILL_WINDOW_DAYS = 30
API = "https://jamesai-mac-api.vercel.app/api/submit"
CONFIG = HOME / ".config" / "jamesai" / "mac.json"

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
                        if name in known and len(name) <= 80 and VALID_SKILL.fullmatch(name):
                            counts[name] = counts.get(name, 0) + 1
        except OSError:
            continue
    return [{"name": k, "uses": v} for k, v in sorted(counts.items(), key=lambda kv: -kv[1])]




# ----------------------------------------------------------------------------- saved settings
def load_config():
    """{"handle": last used, "tokens": {handle: edit key}, "last": last profile}."""
    try:
        cfg = json.loads(CONFIG.read_text())
    except (OSError, ValueError):
        return {"tokens": {}}
    cfg.setdefault("tokens", {})
    if cfg.get("token") and cfg.get("handle"):  # older single-key format
        cfg["tokens"].setdefault(cfg["handle"], cfg.pop("token"))
    return cfg


def save_config(cfg):
    CONFIG.parent.mkdir(parents=True, exist_ok=True)
    CONFIG.write_text(json.dumps(cfg, ensure_ascii=False, indent=1))
    CONFIG.chmod(0o600)  # the edit key lives here


def publish(profile, cfg):
    """Send the profile to jamesai.dev. Returns (http_status, response dict)."""
    body = {"profile": profile}
    token = cfg.get("tokens", {}).get(profile.get("handle"))
    if token:
        body["token"] = token
    req = urllib.request.Request(API, data=json.dumps(body).encode(), method="POST",
                                 headers={"content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except ValueError:
            return e.code, {"ok": False, "error": "server_error"}
    except OSError:
        return 0, {"ok": False, "error": "network"}


# ----------------------------------------------------------------------------- picker page
PAGE = r"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>jamesai.dev/mac</title>
<style>
:root{color-scheme:light dark;--bg:#F5F1E8;--card:#FFFDF8;--ink:#12255E;--ink3:#616C8E;--rule:#C6CBD9;--acc:#C65F38}
@media(prefers-color-scheme:dark){:root{--bg:#14161C;--card:#1A1D25;--ink:#ECE8DF;--ink3:#8B93A8;--rule:#333849;--acc:#E0784B}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC","PingFang TC",sans-serif}
.w{width:min(100% - 32px,820px);margin:0 auto;padding:32px 0 130px}h1{font:600 30px/1.2 Georgia,"Songti SC",serif;margin:0 0 6px}
p{color:var(--ink3);margin:0 0 6px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;margin-top:18px}
label.f{display:block;font-size:13px;color:var(--ink3);margin-bottom:4px}.req label.f::after{content:" *";color:var(--acc)}
input[type=text]{width:100%;font:inherit;padding:9px 11px;border:1px solid var(--rule);border-radius:10px;background:var(--card);color:var(--ink)}
input.bad{border-color:var(--acc)}.url{font-size:12.5px;color:var(--ink3);margin-top:4px}
h2{font:600 20px/1.3 Georgia,serif;margin:30px 0 4px}.row{display:grid;grid-template-columns:24px 1fr auto;gap:4px 10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--rule)}
.row input[type=checkbox]{width:18px;height:18px}.row .n{font-weight:600}.row .u{font-size:13px;color:var(--ink3);font-variant-numeric:tabular-nums}
.row input[type=text]{grid-column:2/4;padding:6px 9px;font-size:13px;display:none}.row.on input[type=text]{display:block}
.bar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--rule);padding:14px 16px;display:flex;gap:14px;justify-content:center;align-items:center}
button{font:inherit;font-weight:600;border:0;border-radius:999px;padding:11px 26px;cursor:pointer;background:var(--ink);color:var(--bg)}button:disabled{opacity:.5;cursor:wait}
#msg{font-size:14px;color:var(--acc)}#count{font-size:13px;color:var(--ink3)}
.done{text-align:center;padding:80px 0}.done h1{font-size:34px}.done a{display:inline-block;margin-top:18px;background:var(--ink);color:var(--bg);padding:11px 26px;border-radius:999px;text-decoration:none;font-weight:600}
@media(max-width:600px){.grid{grid-template-columns:1fr}}
</style></head><body><div class="w" id="w">
<h1 data-t="title"></h1><p data-t="intro"></p>
<div class="grid">
 <div class="req"><label class="f" data-t="handle"></label><input type="text" id="handle" maxlength="39" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="url" id="url"></div></div>
 <div><label class="f" data-t="name"></label><input type="text" id="name" maxlength="40"></div>
 <div style="grid-column:1/-1"><label class="f" data-t="bio"></label><input type="text" id="bio" maxlength="160"></div>
 <div><label class="f" data-t="x"></label><input type="text" id="x" maxlength="16"></div>
 <div><label class="f" data-t="github"></label><input type="text" id="github" maxlength="39"></div>
</div>
<h2 data-t="apps"></h2><p data-t="appsHint"></p><div id="apps"></div>
<h2 data-t="skills" id="skh"></h2><p data-t="skillsHint" id="skp"></p><div id="skills"></div>
</div>
<div class="bar" id="bar"><span id="count"></span><span id="msg"></span><button id="go" data-t="publish"></button></div>
<script>
var DATA = __DATA__, SAVED = __SAVED__;
var T = {
 'zh-Hans': {title:'挑选你要公开的软件',intro:'下面是这台 Mac 上的 App 和它们的真实打开次数。勾选你愿意公开的，想的话写一句为什么推荐。点「发布」之前，什么都不会离开你的电脑。',handle:'页面名字',name:'显示名（可选）',bio:'一句话介绍（可选）',x:'X 用户名（可选）',github:'GitHub 用户名（可选，用作头像）',apps:'Mac 软件',appsHint:'已勾选打开最多的几个，代理类工具不会默认勾选。取消你不想公开的。',skills:'Claude Code 技能',skillsHint:'近 30 天的调用次数，默认都不勾选。',publish:'发布',update:'更新我的页面',count:'已选 %s 个',opened:'次',why:'为什么推荐（可选）',needHandle:'先给页面起个名字（小写字母、数字或 -）',needApps:'至少勾选 1 个，最多 60 个',taken:'这个名字已经被别人用了，换一个吧',network:'连不上 jamesai.dev，检查网络后再点一次',fail:'发布失败：',sending:'正在发布…',done:'发布好了',doneSub:'你的页面已经上线，正在打开…',open:'打开我的页面',urlHint:'你的页面：'},
 'zh-Hant': {title:'挑選你要公開的軟體',intro:'下面是這台 Mac 上的 App 和它們的真實開啟次數。勾選你願意公開的，想的話寫一句為什麼推薦。按「發佈」之前，什麼都不會離開你的電腦。',handle:'頁面名稱',name:'顯示名稱（選填）',bio:'一句話介紹（選填）',x:'X 帳號（選填）',github:'GitHub 帳號（選填，用作頭像）',apps:'Mac 軟體',appsHint:'已勾選開啟最多的幾個，代理類工具不會預設勾選。取消你不想公開的。',skills:'Claude Code 技能',skillsHint:'近 30 天的呼叫次數，預設都不勾選。',publish:'發佈',update:'更新我的頁面',count:'已選 %s 個',opened:'次',why:'為什麼推薦（選填）',needHandle:'先幫頁面取個名字（小寫字母、數字或 -）',needApps:'至少勾選 1 個，最多 60 個',taken:'這個名字已經有人用了，換一個吧',network:'連不上 jamesai.dev，檢查網路後再按一次',fail:'發佈失敗：',sending:'正在發佈…',done:'發佈好了',doneSub:'你的頁面已經上線，正在開啟…',open:'開啟我的頁面',urlHint:'你的頁面：'},
 en: {title:'Pick what to share',intro:'These are the apps on this Mac with their real launch counts. Tick what you are happy to share and, if you like, say why. Nothing leaves your computer until you press Publish.',handle:'Page name',name:'Display name (optional)',bio:'One-line bio (optional)',x:'X handle (optional)',github:'GitHub username (optional, for your avatar)',apps:'Mac apps',appsHint:'Your most-opened apps are ticked; proxy tools never are. Untick anything private.',skills:'Claude Code skills',skillsHint:'Runs in the last 30 days. None ticked by default.',publish:'Publish',update:'Update my page',count:'%s selected',opened:'×',why:'Why you recommend it (optional)',needHandle:'Give your page a name first (lowercase letters, digits or -)',needApps:'Tick between 1 and 60 apps',taken:'That name is taken. Try another one.',network:'Can’t reach jamesai.dev. Check your connection and press again.',fail:'Publishing failed: ',sending:'Publishing…',done:'Published',doneSub:'Your page is live. Opening it…',open:'Open my page',urlHint:'Your page: '}
};
var nav=navigator.language||'en', L=T[/^zh-(TW|HK|MO|Hant)/i.test(nav)?'zh-Hant':/^zh/i.test(nav)?'zh-Hans':'en'];
document.querySelectorAll('[data-t]').forEach(function(e){e.textContent=L[e.dataset.t];});
var PRIVATE=/tor|vpn|clash|shadowrocket|quickfox|nexitally|surge|v2ray|proxy|wireguard/i;
var last=SAVED.last||null, lastApps={}, lastSkills={};
if(last){(last.apps||[]).forEach(function(a){lastApps[a.id]=a.note||'';});(last.skills||[]).forEach(function(s){lastSkills[s.name]=s.note||'';});}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function row(kind,i,it,on,note){return '<div class="row'+(on?' on':'')+'"><input type="checkbox" data-k="'+kind+'" data-i="'+i+'"'+(on?' checked':'')+'><div class="n">'+esc(it.name)+'</div><div class="u">'+(it.uses==null?'—':it.uses.toLocaleString()+' '+L.opened)+'</div><input type="text" maxlength="140" data-note="'+kind+i+'" placeholder="'+L.why+'" value="'+esc(note||'')+'"></div>';}
document.getElementById('apps').innerHTML=DATA.apps.map(function(a,i){
  var on = last ? (a.id in lastApps) : (i<20&&(a.uses||0)>=3&&!PRIVATE.test(a.id+' '+a.name));
  return row('a',i,a,on,lastApps[a.id]);}).join('');
if(!DATA.skills.length){['skh','skp'].forEach(function(id){document.getElementById(id).style.display='none';});}
document.getElementById('skills').innerHTML=DATA.skills.map(function(s,i){return row('s',i,s,last?(s.name in lastSkills):false,lastSkills[s.name]);}).join('');
['handle','name','bio','x','github'].forEach(function(k){var v=k==='handle'?SAVED.handle:last&&last[k];if(typeof v==='string')document.getElementById(k).value=v;});
if(SAVED.handle){document.getElementById('go').textContent=L.update;}
function slug(v){return v.toLowerCase().replace(/^@/,'').replace(/[^a-z0-9-]+/g,'-').replace(/^-+/,'').slice(0,39);}
var hEl=document.getElementById('handle');
function showUrl(){var h=slug(hEl.value);document.getElementById('url').textContent=h?L.urlHint+'jamesai.dev/mac/u/?h='+h:'';}
hEl.addEventListener('input',function(){var p=hEl.selectionStart;hEl.value=slug(hEl.value);hEl.classList.remove('bad');showUrl();});
showUrl();
function count(){var n=document.querySelectorAll('[data-k=a]:checked').length;document.getElementById('count').textContent=L.count.replace('%s',n);}
document.addEventListener('change',function(e){if(e.target.type==='checkbox'){e.target.parentNode.classList.toggle('on',e.target.checked);count();}});
count();
function pick(k,list){return list.map(function(it,i){var c=document.querySelector('[data-k="'+k+'"][data-i="'+i+'"]');if(!c.checked)return null;var o=Object.assign({},it);var n=document.querySelector('[data-note="'+k+i+'"]').value.trim();if(n)o.note=n;return o;}).filter(Boolean);}
var msg=document.getElementById('msg'), go=document.getElementById('go');
go.onclick=function(){
 msg.textContent='';
 var h=slug(hEl.value);if(!/^[a-z0-9](?:[a-z0-9-]{0,38})$/.test(h)){hEl.classList.add('bad');hEl.focus();msg.textContent=L.needHandle;return;}
 var apps=pick('a',DATA.apps);if(apps.length<1||apps.length>60){msg.textContent=L.needApps;return;}
 var p={v:1,handle:h,name:document.getElementById('name').value.trim()||h,scannedAt:DATA.scannedAt,skillsDays:DATA.skillsDays,apps:apps,skills:pick('s',DATA.skills)};
 ['bio','x','github'].forEach(function(k){var v=document.getElementById(k).value.trim().replace(/^@/,'');if(v)p[k]=v;});
 go.disabled=true;go.textContent=L.sending;
 fetch('/publish'+location.search,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(p)}).then(function(r){return r.json();}).then(function(r){
  if(r.ok){document.getElementById('bar').remove();document.getElementById('w').innerHTML='<div class="done"><h1>✓ '+L.done+'</h1><p>'+L.doneSub+'</p><a href="'+esc(r.url)+'">'+L.open+'</a></div>';setTimeout(function(){location.href=r.url;},1200);return;}
  go.disabled=false;go.textContent=SAVED.handle?L.update:L.publish;
  if(r.error==='handle_taken'){hEl.classList.add('bad');hEl.focus();msg.textContent=L.taken;}
  else if(r.error==='network'){msg.textContent=L.network;}
  else{msg.textContent=L.fail+(r.detail?[].concat(r.detail).slice(0,2).join('; '):r.error);}
 }).catch(function(){go.disabled=false;go.textContent=L.publish;msg.textContent=L.network;});
};
</script></body></html>"""


# ----------------------------------------------------------------------------- local server
def serve(data, cfg, timeout_minutes=30):
    """Serve the picker on 127.0.0.1 and forward Publish to jamesai.dev.
    Returns the published URL, or None if the window was closed / timed out."""
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    saved = {"handle": cfg.get("handle"), "last": cfg.get("last")}
    page = (PAGE.replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
                .replace("__SAVED__", json.dumps(saved, ensure_ascii=False).replace("</", "<\\/"))).encode()
    result = {}
    nonce = secrets.token_urlsafe(16)  # only the page we open knows it

    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):  # keep the terminal quiet
            pass

        def _json(self, status, obj):
            b = json.dumps(obj).encode()
            self.send_response(status)
            self.send_header("content-type", "application/json")
            self.end_headers()
            self.wfile.write(b)

        def _host_ok(self):
            # Blocks DNS rebinding: only our own 127.0.0.1:<port> may talk to us.
            return self.headers.get("host") == f"127.0.0.1:{self.server.server_port}"

        def do_GET(self):
            if not self._host_ok() or self.path != f"/?k={nonce}":
                return self._json(404, {"ok": False})
            self.send_response(200)
            self.send_header("content-type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(page)

        def do_POST(self):
            # Only the page we served can reach this: the server listens on
            # 127.0.0.1 and requires a same-origin JSON request.
            # Must be our page: right host, right origin, the one-time key from
            # the URL we opened, and a sane body size.
            if (not self._host_ok() or self.path != f"/publish?k={nonce}"
                    or self.headers.get("origin") != f"http://127.0.0.1:{self.server.server_port}"
                    or "application/json" not in (self.headers.get("content-type") or "")):
                return self._json(403, {"ok": False})
            n = int(self.headers.get("content-length") or 0)
            if not 0 < n <= 256 * 1024:
                return self._json(413, {"ok": False})
            try:
                profile = json.loads(self.rfile.read(n))
            except ValueError:
                return self._json(400, {"ok": False})
            status, resp = publish(profile, cfg)
            if resp.get("ok"):
                cfg["handle"] = resp["handle"]
                if resp.get("token"):
                    cfg.setdefault("tokens", {})[resp["handle"]] = resp["token"]
                cfg["last"] = profile
                save_config(cfg)
                result["url"] = resp["url"]
                stop(3)
            self._json(200, resp)

    srv = ThreadingHTTPServer(("127.0.0.1", 0), H)

    def stop(after):
        # Daemon timers: they must never keep the process alive after we finish.
        t = threading.Timer(after, srv.shutdown)
        t.daemon = True
        t.start()

    stop(timeout_minutes * 60)
    url = f"http://127.0.0.1:{srv.server_port}/?k={nonce}"
    print(f"Opening {url}  (Ctrl+C to quit)")
    webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    return result.get("url")


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
    url = serve(data, load_config())
    if url:
        print(f"\nPublished: {url}\nRun the same command again any time to update it.")
    else:
        print("\nClosed without publishing.")


if __name__ == "__main__":
    main()
