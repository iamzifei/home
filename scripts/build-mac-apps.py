#!/usr/bin/env python3
"""Build the shared app catalog and James's own profile for jamesai.dev/mac.

Outputs
  mac/catalog.json      bundle id -> name, icon, category, official link,
                        price, one-line blurb (zh-Hans / zh-Hant / en).
                        Shared by every profile; apps nobody has catalogued
                        yet still render, just without a price or blurb.
  James's profile      scanned with the same code everyone runs (mac/scan.py)
                        and published through the same API, using the edit
                        key saved in ~/.config/jamesai/mac.json.

Inputs
  mac/prices.json       hand-checked links, prices and blurbs.
  CATALOG below         which installed apps go into the catalog, with icon
                        slug and category. Icons live in mac/icons/<slug>.png.

Run (commit + push afterwards if catalog.json changed):
    python3 scripts/build-mac-apps.py

Affiliate links: add "ref": "<url>" to an entry in mac/prices.json. Pages use
it instead of "url", mark the link rel="sponsored", and show a disclosure.
"""
import importlib.util
import json
import plistlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRICES = ROOT / "mac" / "prices.json"
CATALOG_OUT = ROOT / "mac" / "catalog.json"
PRICES_CHECKED = "2026-11-26"

sys.path.insert(0, str(ROOT / "tools"))
from hant import to_hant  # noqa: E402  (Simplified -> Traditional, with UI-word fixes)

_spec = importlib.util.spec_from_file_location("scan", ROOT / "mac" / "scan.py")
scan = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(scan)

# (bundle filename in /Applications, key in prices.json, icon slug, category)
# Categories: ai, dev, web, chat, work, media, files, mine
CATALOG = [
    ("ChatGPT", "ChatGPT", "chatgpt", "ai"),
    ("Claude", "Claude", "claude", "ai"),
    ("Doubao", "Doubao", "doubao", "ai"),
    ("Cherry Studio", "Cherry Studio", "cherry-studio", "ai"),
    ("T3 Code (Beta)", "T3 Code", "t3-code-beta", "ai"),
    ("WorkBuddy", "WorkBuddy", "workbuddy", "ai"),
    ("Typeless", "Typeless", "typeless", "ai"),
    ("ChatCut", "ChatCut", "chatcut", "ai"),
    ("CodexBar", "CodexBar", "codexbar", "ai"),
    ("Grok Bot", "Grok", "grok-bot", "ai"),
    ("Antigravity", "Antigravity", "antigravity", "ai"),
    ("Ghostty", "Ghostty", "ghostty", "dev"),
    ("Xcode", "Xcode", "xcode", "dev"),
    ("Termius", "Termius", "termius", "dev"),
    ("Visual Studio Code", "Visual Studio Code", "visual-studio-code", "dev"),
    ("GitHub Desktop", "GitHub Desktop", "github-desktop", "dev"),
    ("DBeaver", "DBeaver", "dbeaver", "dev"),
    ("Postgres", "Postgres.app", "postgres", "dev"),
    ("Apifox", "Apifox", "apifox", "dev"),
    ("Tailscale", "Tailscale", "tailscale", "dev"),
    ("Kaku", "Kaku", "kaku", "dev"),
    ("Dia", "Dia", "dia", "web"),
    ("Search", "Search", "search", "web"),
    ("Google Chrome", "Google Chrome", "google-chrome", "web"),
    ("WeChat", "WeChat", "wechat", "chat"),
    ("Telegram", "Telegram", "telegram", "chat"),
    ("WhatsApp", "WhatsApp", "whatsapp", "chat"),
    ("Discord", "Discord", "discord", "chat"),
    ("Lark", "Lark", "lark", "chat"),
    ("VooV Meeting", "VooV Meeting", "voov-meeting", "chat"),
    ("zoom.us", "Zoom", "zoomus", "chat"),
    ("Slack", "Slack", "slack", "chat"),
    ("Obsidian", "Obsidian", "obsidian", "work"),
    ("Enpass", "Enpass", "enpass", "work"),
    ("网易有道翻译", "Youdao", "youdao", "work"),
    ("Input Source Pro", "Input Source Pro", "input-source-pro", "work"),
    ("Keka", "Keka", "keka", "work"),
    ("Amphetamine", "Amphetamine", "amphetamine", "work"),
    ("CleanShot X", "CleanShot X", "cleanshot-x", "work"),
    ("Dimble", "Dimble", "dimble", "work"),
    ("Yosei", "Yosei", "yosei", "work"),
    ("Zotero", "Zotero", "zotero", "work"),
    ("Microsoft Word", "Microsoft 365", "microsoft-word", "work"),
    ("Movist", "Movist", "movist", "media"),
    ("VideoFusion-macOS", "JianYing", "videofusion-macos", "media"),
    ("Canva", "Canva", "canva", "media"),
    ("Zipic", "Zipic", "zipic", "media"),
    ("Openscreen", "Openscreen", "openscreen", "media"),
    ("Recordly", "Recordly", "recordly", "media"),
    ("Blender", "Blender", "blender", "media"),
    ("BaiduNetdisk_mac", "Baidu Netdisk", "baidunetdiskmac", "files"),
    ("Weiyun", "Weiyun", "weiyun", "files"),
    ("Blip", "Blip", "blip", "files"),
    ("UURemote", "UURemote", "uuremote", "files"),
    ("pcsuite", "vivo", "pcsuite", "files"),
    # Made by me — links point at jamesai.dev, all free.
    ("ClipStack", "ClipStack", "clipstack", "mine"),
    ("AudioSwitch", "AudioSwitch", "audioswitch", "mine"),
    ("Tapper", "Tapper", "tapper", "mine"),
    ("Veil", "Veil", "veil", "mine"),
    ("Candela", "Candela", "candela", "mine"),
    ("Inkstone", "Inkstone", "inkstone", "mine"),
]

MINE = {
    "ClipStack": ("https://jamesai.dev/product.html?p=clipstack", "剪贴板历史，⇧⌘V 呼出", "Clipboard history on ⇧⌘V"),
    "AudioSwitch": ("https://jamesai.dev/product.html?p=audioswitch", "一键切换音频输入输出设备", "Switch audio devices from the menu bar"),
    "Tapper": ("https://jamesai.dev/tapper/", "敲黑板：讲解时指针变手套", "Turn the pointer into a glove when presenting"),
    "Veil": ("https://jamesai.dev/veil/", "只让当前窗口清晰，其余变模糊", "Blur everything but the window you're in"),
    "Candela": ("https://jamesai.dev/product.html?p=Candela", "外接显示器亮度与输入控制", "Brightness and input for external displays"),
    "Inkstone": ("https://jamesai.dev/product.html?p=inkstone", "原生 Markdown 笔记", "A native Markdown notebook"),
}


# Skills James publishes. Only general-purpose ones: skills that describe how
# the businesses are run (daily-workflow, revenue-monitor, fde-boss, …) stay
# private even though they are used more.
PUBLIC_SKILLS = {
    "humanizer-zh": "https://github.com/iamzifei/humanizer-zh",
    "seo-geo": None, "plan-anchor": None, "openseo:seo-audit": None,
    "letsfinddomain-skill": None, "james-web-ship": None, "aikey-cut": None,
    "aikey-cover": None, "aikey-title": None, "impeccable:impeccable": None,
    "chatcut-talking-head-guide": None, "article-pipeline": None, "lark-mail": None,
}


def tri(zh, en):
    """One string per site language; zh-Hant is converted from zh-Hans."""
    return {"zh-Hans": zh, "zh-Hant": to_hant(zh), "en": en}


def bundle_id(filename):
    with open(Path("/Applications") / f"{filename}.app" / "Contents" / "Info.plist", "rb") as fh:
        return plistlib.load(fh)["CFBundleIdentifier"]


def main():
    prices = {p["name"]: p for p in json.loads(PRICES.read_text())}
    catalog, mine_ids = {}, []
    for filename, key, icon, cat in CATALOG:
        try:
            bid = bundle_id(filename)
        except FileNotFoundError:
            # Uninstalled since the list was written: leave it out rather than fail.
            print(f"skip (not installed): {filename}")
            continue
        if key in MINE:
            url, zh, en = MINE[key]
            p = {"url": url, "model": "free", "price": "Free", "priceZh": "免费", "zh": zh, "en": en, "verified": True}
        else:
            p = prices[key]
        disp = p.get("display")
        entry = {
            "name": tri(disp["zh"], disp["en"]) if disp else key,
            "icon": icon, "cat": cat, "url": p["url"], "model": p["model"],
            "price": tri(p.get("priceZh", p["price"]), p["price"]),
            "sortPrice": float(p.get("sortPrice", 0)),
            "desc": tri(p["zh"], p["en"]),
            # True only when the price was read off an official page.
            "verified": bool(p.get("verified")),
        }
        if p.get("ref"):
            entry["ref"] = p["ref"]
        catalog[bid] = entry
        mine_ids.append(bid)
    CATALOG_OUT.write_text(json.dumps({"checkedAt": PRICES_CHECKED, "apps": catalog}, ensure_ascii=False, indent=1) + "\n")

    # James's profile = his scan, limited to the catalogued apps and public skills.
    scanned = {a["id"]: a for a in scan.scan_apps()}
    apps = [{k: v for k, v in scanned[i].items() if k != "cat"} for i in mine_ids if i in scanned]
    skills = []
    for s in scan.scan_skills():
        if s["name"] in PUBLIC_SKILLS:
            if PUBLIC_SKILLS[s["name"]]:
                s["url"] = PUBLIC_SKILLS[s["name"]]
            skills.append(s)
    from datetime import datetime, timezone
    profile = {
        "v": 1, "handle": "iamzifei", "name": "James", "x": "JamesAI", "github": "iamzifei",
        "bio": tri("一个人做软件，在悉尼。这是我 Mac 上真正在用的东西。", "I build software on my own in Sydney. These are the apps I actually use.") | {"zh-Hant": "一個人做軟體，在雪梨。這是我 Mac 上真正在用的東西。"},
        "scannedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "skillsDays": scan.SKILL_WINDOW_DAYS, "apps": apps, "skills": skills,
    }
    cfg = scan.load_config()
    status, resp = scan.publish(profile, cfg)
    if not resp.get("ok"):
        sys.exit(f"publish failed ({status}): {resp}")
    cfg.update({"handle": resp["handle"], "last": profile})
    if resp.get("token"):
        cfg["tokens"][resp["handle"]] = resp["token"]
    scan.save_config(cfg)
    print(f"catalog: {len(catalog)} apps · published {resp['url']}: {len(apps)} apps, {len(skills)} skills")


if __name__ == "__main__":
    main()
