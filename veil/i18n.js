/*
 * Veil site — translations (English, Simplified Chinese, Traditional Chinese).
 *
 * Markup uses:
 *   data-i18n="key"        -> element.textContent
 *   data-i18n-html="key"   -> element.innerHTML (only where the string contains markup)
 *   data-i18n-attr="attr:key;attr2:key2" -> attributes such as aria-label
 * The English text in index.html is the no-JS fallback and must match the "en" dictionary.
 *
 * Language order of precedence: ?lang= parameter, saved choice (localStorage), navigator.languages.
 * Setting names (Ambient, Deep, Fade…) follow the app's own localisation (Resources/*.lproj), so the site matches what users see.
 */
(function () {
  'use strict';

  var DICT = {
    'en': {
      "skip": "Skip to the live demo",
      "nav.features": "Features",
      "nav.faq": "FAQ",
      "btn.download": "Download",
      "hero.eyebrow": "Free &amp; open source &middot; macOS 14+",
      "hero.cta1": "Download for Mac",
      "hero.cta2": "or try it right here",
      "hero.fine": "Free, MIT licence, no account",
      "try.h2": "This desktop is fake. The blur is real.",
      "try.hint": "<span class=\"hint-pointer\">Click</span><span class=\"hint-touch\">Tap</span> any window to focus it. Drag a title bar to move it. Hold <kbd>Shift</kbd> and sweep the mouse to peek behind the veil.",
      "p.blur": "Blur",
      "p.tint": "Tint",
      "p.grain": "Grain",
      "p.mono": "Monochrome",
      "p.trans": "Transition",
      "p.peek": "Hold to peek",
      "p.peeking": "Peeking",
      "p.off": "Off",
      "card1.p": "Ambient is a light blur with a slight dim, good for all-day use. Deep blurs harder and darkens more. Set the blur to zero for a blur-free mode: just dim, tint, grain or monochrome.",
      "card4.p": "Let an editor and a browser share focus so both stay sharp. Or keep every window of the front app clear, and list the apps Veil should always ignore.",
      "card5.p": "Per screen keeps the frontmost window on each display sharp. Global keeps one window sharp and veils every other screen. Hide the menu bar and Dock while Veil is on, and blur the Stage Manager strip too if you like.",
      "card7.p": "Shake the mouse to toggle. Hold Shift and shake to peek for at least two seconds. Park the pointer in a screen corner for a quick look. Veil steps aside while you drag a file.",
      "sc.sub": "Four global shortcuts, all rebindable in Settings.",
      "sc.r1": "Toggle Veil",
      "sc.r2": "Switch mode",
      "sc.r3": "Ignore current app",
      "sc.r4": "Open controls",
      "auto.sub": "Veil registers a <code>veil://</code> scheme, so anything that can open a URL can drive it: <code>toggle</code>, <code>on</code>, <code>off</code>, <code>peek</code>, <code>mode/deep</code>, or <code>set?…</code> to change any setting in one call.",
      "inst.s1": "<b>Download</b> the disk image.",
      "inst.s2": "<b>Drag Veil</b> into your Applications folder.",
      "inst.s3": "<b>Open it.</b> A small icon appears in the menu bar. Click any window and you are focused.",
      "inst.dl": "Download Veil.dmg",
      "inst.src": "View source",
      "inst.note": "macOS 14 Sonoma or later · Apple Silicon and Intel · signed with a Developer ID and notarized by Apple.",
      "faq.h2": "Questions",
      "faq1.q": "Is it really free?",
      "faq1.a": "Yes. Veil is MIT-licensed and open source. There is no paid tier, no trial timer and no account. You can read, build and change the code on GitHub.",
      "faq2.q": "Does it need any permissions?",
      "faq2.a": "Not for the core feature. Blurring the background works without Screen Recording or Accessibility access. The only optional permission is Automation, which Veil asks for if you turn on auto-hiding the menu bar and Dock.",
      "faq3.q": "Will it slow my Mac down?",
      "faq3.a": "No. Veil hands the blur to the system compositor, the same machinery macOS uses for its own translucent surfaces. It does not capture your screen or process frames itself, so idle cost is close to nothing.",
      "faq4.q": "Can I keep two apps sharp at once?",
      "faq4.a": "Yes. Put them in an App Group, for example your editor and your browser, and they share focus. You can also keep all windows of the front app sharp, and add apps to an ignore list.",
      "faq5.q": "Does it work with several displays?",
      "faq5.a": "Yes. Choose Per screen so each display keeps its own frontmost window sharp, or Global to keep a single window sharp across all displays.",
      "foot.made": "Made by James &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.mit": "MIT licence",
      "meta.title": "Veil — focus on one window",
      "meta.desc": "Veil is a free, open-source macOS menu-bar app that keeps the window you are working in sharp and softly blurs everything behind it. Try it live in your browser.",
      "meta.ogdesc": "A free, open-source macOS menu-bar app that keeps your active window sharp and softly blurs everything behind it.",
      "nav.label": "Sections",
      "panel.label": "Veil controls",
      "switch.label": "Veil on",
      "tint.strength": "Tint strength",
      "video.label": "Screen recording of Veil: windows come into focus one at a time while the rest of the desktop blurs",
      "sib.h2": "More Mac apps by James",
      "sib.candela.d": "Every display control macOS hides",
      "sib.clipstack.d": "Clipboard history in the menu bar",
      "sib.audioswitch.d": "Audio device switching from the menu bar",
      "sib.inkstone.d": "Notes that stay your own files",
      "sib.tapper.d": "Turns your pointer into a cartoon glove on a long stick, for demos and screen recordings. Free, MIT.",
      "sib.tapper.n": "Tapper",
      "foot.tapper": "Tapper",
      "foot.sib": "More Mac apps by James",
      "nav.new": "What's new",
      "hero.claim": "Focus on one window. <span class=\"lo\">Everything behind it softly blurs away.</span>",
      "v.ambient": "Ambient",
      "v.deep": "Deep",
      "v.fade": "Fade",
      "v.cursor": "Cursor reveal",
      "v.none": "None",
      "v.perscreen": "Per screen",
      "v.global": "Global",
      "video.claim": "The real app. <span class=\"lo\">Switch windows, and the focus follows. No rules to write.</span>",
      "look1.c": "Light blur, slight dim. For all day.",
      "look2.c": "Harder blur, darker room.",
      "look3.h": "Tint & grain",
      "look3.c": "Any colour, plus film grain.",
      "look4.h": "Blur-free",
      "look4.c": "No blur, just dim and monochrome.",
      "look1.alt": "Ambient: a light blur with a slight dim",
      "look2.alt": "Deep: a stronger blur and a darker room",
      "look3.alt": "A blue tint with film grain",
      "look4.alt": "Blur-free monochrome: the background is drained of colour but not blurred",
      "tune.claim": "Focus, fine-tuned. <span class=\"lo\">Blur, tint, grain, App Groups, gestures, shortcuts and a URL scheme.</span>",
      "set.look": "Look",
      "set.mode": "Mode",
      "set.focus": "Focus",
      "set.appwide": "App-wide focus",
      "set.groups": "App Groups",
      "set.newgroup": "New Group…",
      "set.groupdemo": "Editor + browser",
      "set.ignored": "Ignored apps",
      "set.add": "Add…",
      "set.screens": "Screens",
      "set.multi": "Multi-screen mode",
      "set.autohide": "Auto-hide Menu Bar & Dock",
      "set.stage": "Blur Stage Manager",
      "set.gestures": "Gestures",
      "set.shake": "Shake to toggle",
      "set.shakepeek": "Hold + shake to peek",
      "set.corner": "Corner peek",
      "set.drag": "Hide while dragging files",
      "set.shortcuts": "Shortcuts",
      "set.url": "URL scheme",
      "inst.claim": "Free, and it stays free. <span class=\"lo\">MIT licensed. No account, no tracking, no trial timer.</span>",
      "faq6.q": "How do I update it?",
      "faq6.a": "Veil checks for updates itself and installs them when you agree. You can also download the latest disk image from this page at any time.",
    },
    'zh-Hans': {
      "skip": "跳到在线演示",
      "nav.features": "功能",
      "nav.faq": "常见问题",
      "btn.download": "下载",
      "hero.eyebrow": "免费开源 &middot; macOS 14+",
      "hero.cta1": "下载 Mac 版",
      "hero.cta2": "或者就在这里试试",
      "hero.fine": "免费，MIT 开源，无需账号",
      "try.h2": "这个桌面是假的，模糊是真的。",
      "try.hint": "<span class=\"hint-pointer\">点击</span><span class=\"hint-touch\">轻点</span>任意窗口即可聚焦，拖动标题栏可以移动窗口。按住 <kbd>Shift</kbd> 并快速晃动鼠标，可以偷看模糊层后面。",
      "p.blur": "模糊",
      "p.tint": "着色",
      "p.grain": "颗粒",
      "p.mono": "黑白",
      "p.trans": "过渡效果",
      "p.peek": "按住偷看",
      "p.peeking": "偷看中",
      "p.off": "关",
      "card1.p": "氛围模式是轻度模糊加一点点变暗，适合整天开着；深度模式模糊更强、画面更暗。把模糊调到 0 就是无模糊模式：只保留变暗、着色、颗粒或黑白。",
      "card4.p": "把编辑器和浏览器放进同一组，两个都保持清晰。也可以让前台应用的所有窗口都保持清晰，并设置永远忽略的应用。",
      "card5.p": "选「每个屏幕独立」，每块显示器各自保持最前面的窗口清晰；选「全局」，只保留一个窗口清晰，其他屏幕全部模糊。Veil 开启时还可以自动隐藏菜单栏和程序坞，台前调度的侧栏也可以一并模糊。",
      "card7.p": "摇动鼠标开关 Veil。按住 ⇧ 再摇动可以偷看，至少持续 2 秒。把指针停在屏幕角落，快速看一眼。拖动文件时 Veil 会自动让开。",
      "sc.sub": "四个全局快捷键，都可以在设置里修改。",
      "sc.r1": "开关 Veil",
      "sc.r2": "切换模式",
      "sc.r3": "忽略当前应用",
      "sc.r4": "打开控制面板",
      "auto.sub": "Veil 注册了 <code>veil://</code> 协议，凡是能打开 URL 的东西都能控制它：<code>toggle</code>、<code>on</code>、<code>off</code>、<code>peek</code>、<code>mode/deep</code>，或者用 <code>set?…</code> 一次修改任意设置。",
      "inst.s1": "<b>下载</b>磁盘映像。",
      "inst.s2": "<b>把 Veil 拖进</b>「应用程序」文件夹。",
      "inst.s3": "<b>打开它。</b>菜单栏里会出现一个小图标。点任意窗口，就进入专注。",
      "inst.dl": "下载 Veil.dmg",
      "inst.src": "查看源代码",
      "inst.note": "需要 macOS 14 Sonoma 或更高版本 · 支持 Apple 芯片和 Intel · 已用 Developer ID 签名并通过 Apple 公证。",
      "faq.h2": "常见问题",
      "faq1.q": "真的免费吗？",
      "faq1.a": "是的。Veil 采用 MIT 许可，开源。没有付费版，没有试用期限，也不用注册账号。源代码都在 GitHub 上，可以阅读、编译、修改。",
      "faq2.q": "需要什么权限吗？",
      "faq2.a": "核心功能不需要。模糊背景不用「屏幕录制」或「辅助功能」权限。唯一可选的是「自动化」权限，只有在你开启自动隐藏菜单栏和 Dock 时才会请求。",
      "faq3.q": "会拖慢我的 Mac 吗？",
      "faq3.a": "不会。模糊交给系统合成器完成，和 macOS 自己的半透明界面用的是同一套机制。Veil 不截取屏幕，也不自己处理画面，空闲时几乎不占资源。",
      "faq4.q": "能让两个应用同时保持清晰吗？",
      "faq4.a": "可以。把它们放进同一个应用分组，比如编辑器和浏览器，它们就共享焦点。也可以让前台应用的所有窗口都保持清晰，或把某些应用加入忽略列表。",
      "faq5.q": "支持多显示器吗？",
      "faq5.a": "支持。选「每个屏幕独立」，每块显示器各自保持最前面的窗口清晰；选「全局」，所有显示器只保留一个清晰的窗口。",
      "foot.made": "由 James 制作 &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.mit": "MIT 许可",
      "meta.title": "Veil — 专注于一个窗口",
      "meta.desc": "Veil 是免费开源的 macOS 菜单栏应用，让你正在用的窗口保持清晰，把背后的一切轻轻模糊。可以直接在浏览器里试玩。",
      "meta.ogdesc": "免费开源的 macOS 菜单栏应用，让当前窗口保持清晰，背后轻轻模糊。",
      "nav.label": "页面导航",
      "panel.label": "Veil 控制面板",
      "switch.label": "开启 Veil",
      "tint.strength": "着色强度",
      "video.label": "Veil 的屏幕录像：窗口一个接一个进入焦点，桌面其余部分被模糊",
      "sib.h2": "James 的其他 Mac 应用",
      "sib.candela.d": "macOS 藏起来的显示器控制",
      "sib.clipstack.d": "菜单栏剪贴板历史",
      "sib.audioswitch.d": "菜单栏音频设备切换",
      "sib.inkstone.d": "笔记就是你自己的文件",
      "sib.tapper.d": "把鼠标指针变成长杆上的卡通手套，演示和录屏时一眼看清你指哪儿。免费，MIT 开源。",
      "sib.tapper.n": "敲黑板 Tapper",
      "foot.tapper": "敲黑板",
      "foot.sib": "James 的其他 Mac 应用",
      "nav.new": "更新日志",
      "hero.claim": "专注于一个窗口。<span class=\"lo\">背后的一切，轻轻模糊掉。</span>",
      "v.ambient": "氛围",
      "v.deep": "深度",
      "v.fade": "淡入淡出",
      "v.cursor": "光标揭开",
      "v.none": "无",
      "v.perscreen": "每个屏幕独立",
      "v.global": "全局",
      "video.claim": "真实的应用。<span class=\"lo\">切换窗口，焦点跟着走。不用写任何规则。</span>",
      "look1.c": "轻度模糊，略微变暗，适合整天开着。",
      "look2.c": "模糊更强，周围更暗。",
      "look3.h": "着色与颗粒",
      "look3.c": "任意颜色，再加胶片颗粒。",
      "look4.h": "无模糊",
      "look4.c": "不模糊，只变暗、变黑白。",
      "look1.alt": "氛围模式：轻度模糊，略微变暗",
      "look2.alt": "深度模式：模糊更强，周围更暗",
      "look3.alt": "蓝色着色加胶片颗粒",
      "look4.alt": "无模糊黑白：背景去掉颜色，但不模糊",
      "tune.claim": "专注，细致可调。<span class=\"lo\">模糊、着色、颗粒、应用分组、手势、快捷键，还有 URL 协议。</span>",
      "set.look": "外观",
      "set.mode": "模式",
      "set.focus": "聚焦",
      "set.appwide": "整个应用聚焦",
      "set.groups": "应用分组",
      "set.newgroup": "新建分组…",
      "set.groupdemo": "编辑器 + 浏览器",
      "set.ignored": "已忽略的应用",
      "set.add": "添加…",
      "set.screens": "屏幕",
      "set.multi": "多屏模式",
      "set.autohide": "自动隐藏菜单栏和程序坞",
      "set.stage": "模糊台前调度",
      "set.gestures": "手势",
      "set.shake": "摇动鼠标以开关",
      "set.shakepeek": "按住按键并摇动以偷看",
      "set.corner": "角落偷看",
      "set.drag": "拖动文件时隐藏遮罩",
      "set.shortcuts": "快捷键",
      "set.url": "URL 协议",
      "inst.claim": "免费，而且一直免费。<span class=\"lo\">MIT 开源。无需账号，不追踪，没有试用期。</span>",
      "faq6.q": "怎么更新？",
      "faq6.a": "Veil 会自己检查更新，经你同意后安装。你也可以随时在这个页面下载最新的磁盘映像。",
    },
    'zh-Hant': {
      "skip": "跳到線上試玩",
      "nav.features": "功能",
      "nav.faq": "常見問題",
      "btn.download": "下載",
      "hero.eyebrow": "免費開源 &middot; macOS 14+",
      "hero.cta1": "下載 Mac 版",
      "hero.cta2": "或者就在這裡試試",
      "hero.fine": "免費，MIT 開源，不需帳號",
      "try.h2": "這個桌面是假的，模糊是真的。",
      "try.hint": "<span class=\"hint-pointer\">點一下</span><span class=\"hint-touch\">輕觸</span>任意視窗即可聚焦，拖曳標題列可以移動視窗。按住 <kbd>Shift</kbd> 並快速移動滑鼠，可以偷看模糊層後面。",
      "p.blur": "模糊",
      "p.tint": "著色",
      "p.grain": "顆粒",
      "p.mono": "黑白",
      "p.trans": "轉場效果",
      "p.peek": "按住偷看",
      "p.peeking": "偷看中",
      "p.off": "關",
      "card1.p": "氛圍模式是輕度模糊加一點點變暗，適合整天開著；深度模式模糊更強、畫面更暗。把模糊調到 0 就是無模糊模式：只保留變暗、著色、顆粒或黑白。",
      "card4.p": "把編輯器和瀏覽器放進同一組，兩個都保持清晰。也可以讓前景 App 的所有視窗都保持清晰，並設定永遠忽略的 App。",
      "card5.p": "選「每個螢幕獨立」，每個螢幕各自保持最前面的視窗清晰；選「全域」，只保留一個視窗清晰，其他螢幕全部模糊。Veil 開啟時還可以自動隱藏選單列與 Dock，「幕前調度」的側欄也可以一併模糊。",
      "card7.p": "搖動滑鼠開關 Veil。按住 ⇧ 再搖動可以偷看，至少持續 2 秒。把游標停在螢幕角落，快速看一眼。拖移檔案時 Veil 會自動讓開。",
      "sc.sub": "四個全域快捷鍵，都可以在設定裡修改。",
      "sc.r1": "開關 Veil",
      "sc.r2": "切換模式",
      "sc.r3": "忽略目前的 App",
      "sc.r4": "開啟控制面板",
      "auto.sub": "Veil 註冊了 <code>veil://</code> 協定，凡是能開啟 URL 的東西都能控制它：<code>toggle</code>、<code>on</code>、<code>off</code>、<code>peek</code>、<code>mode/deep</code>，或者用 <code>set?…</code> 一次修改任何設定。",
      "inst.s1": "<b>下載</b>磁碟映像檔。",
      "inst.s2": "<b>把 Veil 拖進</b>「應用程式」資料夾。",
      "inst.s3": "<b>開啟它。</b>選單列會出現一個小圖示。點任一視窗，就進入專注。",
      "inst.dl": "下載 Veil.dmg",
      "inst.src": "查看原始碼",
      "inst.note": "需要 macOS 14 Sonoma 或更新版本 · 支援 Apple 晶片和 Intel · 已用 Developer ID 簽署並通過 Apple 公證。",
      "faq.h2": "常見問題",
      "faq1.q": "真的免費嗎？",
      "faq1.a": "是的。Veil 採用 MIT 授權，開放原始碼。沒有付費版，沒有試用期限，也不用註冊帳號。原始碼都在 GitHub 上，可以閱讀、編譯、修改。",
      "faq2.q": "需要任何權限嗎？",
      "faq2.a": "核心功能不需要。模糊背景不需要「螢幕錄製」或「輔助使用」權限。唯一可選的是「自動化」權限，只有在你開啟自動隱藏選單列和 Dock 時才會請求。",
      "faq3.q": "會拖慢我的 Mac 嗎？",
      "faq3.a": "不會。模糊交給系統合成器處理，和 macOS 自己的半透明介面用的是同一套機制。Veil 不擷取螢幕，也不自己處理畫面，閒置時幾乎不佔資源。",
      "faq4.q": "能讓兩個 App 同時保持清晰嗎？",
      "faq4.a": "可以。把它們放進同一個 App 群組，例如編輯器和瀏覽器，它們就會共用焦點。也可以讓前景 App 的所有視窗都保持清晰，或把某些 App 加入忽略清單。",
      "faq5.q": "支援多螢幕嗎？",
      "faq5.a": "支援。選「每個螢幕獨立」，每個螢幕各自保持最前面的視窗清晰；選「全域」，所有螢幕只保留一個清晰的視窗。",
      "foot.made": "由 James 製作 &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.mit": "MIT 授權",
      "meta.title": "Veil — 專注在一個視窗",
      "meta.desc": "Veil 是免費開源的 macOS 選單列 App，讓你正在使用的視窗保持清晰，把後面的一切輕輕模糊。可以直接在瀏覽器裡試玩。",
      "meta.ogdesc": "免費開源的 macOS 選單列 App，讓目前的視窗保持清晰，後面輕輕模糊。",
      "nav.label": "頁面導覽",
      "panel.label": "Veil 控制面板",
      "switch.label": "開啟 Veil",
      "tint.strength": "著色強度",
      "video.label": "Veil 的螢幕錄影：視窗一個接一個進入焦點，桌面其餘部分被模糊",
      "sib.h2": "James 的其他 Mac 應用",
      "sib.candela.d": "macOS 藏起來的顯示器控制",
      "sib.clipstack.d": "選單欄剪貼簿歷史",
      "sib.audioswitch.d": "選單欄音訊裝置切換",
      "sib.inkstone.d": "筆記就是你自己的檔案",
      "sib.tapper.d": "把滑鼠游標變成長桿上的卡通手套，簡報和錄影時一眼看清你指哪裡。免費，MIT 開源。",
      "sib.tapper.n": "敲黑板 Tapper",
      "foot.tapper": "敲黑板",
      "foot.sib": "James 的其他 Mac 應用",
      "nav.new": "更新紀錄",
      "hero.claim": "專注在一個視窗。<span class=\"lo\">後面的一切，輕輕模糊掉。</span>",
      "v.ambient": "氛圍",
      "v.deep": "深度",
      "v.fade": "淡入淡出",
      "v.cursor": "游標揭開",
      "v.none": "無",
      "v.perscreen": "每個螢幕獨立",
      "v.global": "全域",
      "video.claim": "真正的 App。<span class=\"lo\">切換視窗，焦點跟著走。不用寫任何規則。</span>",
      "look1.c": "輕度模糊，稍微變暗，適合整天開著。",
      "look2.c": "模糊更強，周圍更暗。",
      "look3.h": "著色與顆粒",
      "look3.c": "任意顏色，再加底片顆粒。",
      "look4.h": "無模糊",
      "look4.c": "不模糊，只變暗、變黑白。",
      "look1.alt": "氛圍模式：輕度模糊，稍微變暗",
      "look2.alt": "深度模式：模糊更強，周圍更暗",
      "look3.alt": "藍色著色加底片顆粒",
      "look4.alt": "無模糊黑白：背景去掉顏色，但不模糊",
      "tune.claim": "專注，細緻可調。<span class=\"lo\">模糊、著色、顆粒、App 群組、手勢、快捷鍵，還有 URL 協定。</span>",
      "set.look": "外觀",
      "set.mode": "模式",
      "set.focus": "聚焦",
      "set.appwide": "整個 App 聚焦",
      "set.groups": "App 群組",
      "set.newgroup": "新增群組…",
      "set.groupdemo": "編輯器 + 瀏覽器",
      "set.ignored": "已忽略的 App",
      "set.add": "加入…",
      "set.screens": "螢幕",
      "set.multi": "多螢幕模式",
      "set.autohide": "自動隱藏選單列與 Dock",
      "set.stage": "模糊「幕前調度」",
      "set.gestures": "手勢",
      "set.shake": "搖動滑鼠以開關",
      "set.shakepeek": "按住按鍵並搖動以偷看",
      "set.corner": "角落偷看",
      "set.drag": "拖移檔案時隱藏遮罩",
      "set.shortcuts": "快捷鍵",
      "set.url": "URL 協定",
      "inst.claim": "免費，而且一直免費。<span class=\"lo\">MIT 開源。不需帳號，不追蹤，沒有試用期。</span>",
      "faq6.q": "要怎麼更新？",
      "faq6.a": "Veil 會自己檢查更新，經你同意後安裝。你也可以隨時在這個頁面下載最新的磁碟映像檔。",
    },
  };

  var LANGS = ['en', 'zh-Hans', 'zh-Hant'];
  var STORE_KEY = 'veil-lang';
  var current = 'en';

  /* Map any language tag to one of our three languages (or null if unknown). */
  function normalise(tag) {
    if (!tag) return null;
    var t = String(tag).toLowerCase().replace('_', '-');
    if (t === 'en' || t.indexOf('en-') === 0) return 'en';
    if (t === 'zh' || t.indexOf('zh-') === 0) {
      return /hant|-tw$|-hk$|-mo$|-tw-|-hk-|-mo-/.test(t) ? 'zh-Hant' : 'zh-Hans';
    }
    return null;
  }

  function detect() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (normalise(q)) return normalise(q);
    } catch (e) {}
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var n = normalise(list[i]);
      if (n) return n;
    }
    return 'en';
  }

  function t(key) {
    var d = DICT[current];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    return DICT.en[key];
  }

  function setMeta(sel, value) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute('content', value);
  }

  function apply(lang) {
    current = lang;
    var d = DICT[lang];
    var missing = [];
    function get(key) {
      if (!Object.prototype.hasOwnProperty.call(d, key)) { missing.push(key); return null; }
      return d[key];
    }
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = get(el.getAttribute('data-i18n')); if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = get(el.getAttribute('data-i18n-html')); if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length !== 2) return;
        var v = get(p[1].trim()); if (v !== null) el.setAttribute(p[0].trim(), v);
      });
    });

    document.title = d['meta.title'];
    setMeta('meta[name="description"]', d['meta.desc']);
    setMeta('meta[property="og:title"]', d['meta.title']);
    setMeta('meta[property="og:description"]', d['meta.ogdesc']);
    setMeta('meta[name="twitter:title"]', d['meta.title']);
    setMeta('meta[name="twitter:description"]', d['meta.ogdesc']);

    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    window.__i18nMissing = missing;
    document.dispatchEvent(new CustomEvent('veil:lang', { detail: lang }));
  }

  function choose(lang) {
    apply(lang);
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { choose(b.getAttribute('data-lang')); });
  });

  window.VeilI18n = { t: t, dict: DICT, langs: LANGS, set: choose, get: function () { return current; } };
  apply(detect());
})();
