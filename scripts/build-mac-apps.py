#!/usr/bin/env python3
"""Build mac/apps.js — the data behind https://jamesai.dev/mac/.

What it does
  1. For each app in CATALOG, reads the REAL launch count and last-used date
     that macOS Spotlight keeps (kMDItemUseCount / kMDItemLastUsedDate).
  2. Merges the hand-checked price / link / one-line description from
     mac/prices.json (keyed by the "name" field in CATALOG).
  3. Writes mac/apps.js as `window.MAC = {...}`.

Re-run any time to refresh the numbers:
    python3 scripts/build-mac-apps.py

Only apps listed in CATALOG are published — anything else installed on the
machine stays private. Icons are extracted once into mac/icons/<icon>.png.
"""
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRICES = ROOT / "mac" / "prices.json"
OUT = ROOT / "mac" / "apps.js"

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


def spotlight(app_path: Path):
    """Return (launch_count or None, last_used ISO string or None)."""
    def attr(name):
        # Query one attribute per call: mdls prints multiple attributes in its
        # own (alphabetical) order, not the order they were requested in.
        v = subprocess.run(["mdls", "-raw", "-name", name, str(app_path)],
                           capture_output=True, text=True).stdout.strip()
        return None if v in ("", "(null)") else v

    count = attr("kMDItemUseCount")
    uses = int(count) if count and count.isdigit() else None
    date = attr("kMDItemLastUsedDate")
    last = datetime.strptime(date, "%Y-%m-%d %H:%M:%S %z").isoformat() if date else None
    return uses, last


def sort_price(p: dict) -> float:
    """Rough monthly-USD figure, only used for the 'price low to high' sort."""
    return float(p.get("sortPrice", 0))


def main():
    prices = {p["name"]: p for p in json.loads(PRICES.read_text())}
    apps = []
    for filename, key, icon, cat in CATALOG:
        uses, last = spotlight(Path("/Applications") / f"{filename}.app")
        if key in MINE:
            url, zh, en = MINE[key]
            p = {"url": url, "model": "free", "price": "Free", "priceZh": "免费", "zh": zh, "en": en, "verified": True}
        else:
            p = prices[key]
        apps.append({
            "name": p.get("display", key),
            "icon": icon,
            "cat": cat,
            "url": p["url"],
            "model": p["model"],
            "price": {"zh": p.get("priceZh", p["price"]), "en": p["price"]},
            # True only when the price was read off an official page on pricesCheckedAt.
            "verified": bool(p.get("verified", key in MINE)),
            "sortPrice": sort_price(p),
            "desc": {"zh": p["zh"], "en": p["en"]},
            "uses": uses,
            "last": last,
        })
    data = {
        "scannedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        # Date the prices in mac/prices.json were last checked against official sites.
        "pricesCheckedAt": "2026-11-26",
        "apps": apps,
    }
    OUT.write_text("/* Generated by scripts/build-mac-apps.py — do not edit by hand. */\n"
                   "window.MAC = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print(f"wrote {OUT} · {len(apps)} apps")


if __name__ == "__main__":
    main()
