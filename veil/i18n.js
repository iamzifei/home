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
 * "Veil", "Ambient", "Deep" and the transition names are the app's own UI labels and stay in English.
 */
(function () {
  'use strict';

  var DICT = {
    'en': {
      "skip": "Skip to the live demo",
      "nav.features": "Features",
      "nav.shortcuts": "Shortcuts",
      "nav.automation": "Automation",
      "nav.faq": "FAQ",
      "btn.download": "Download",
      "hero.eyebrow": "Free &amp; open source &middot; macOS 14+",
      "hero.h1": "Focus on <em>one</em> window.",
      "hero.lede": "Veil keeps the window you are working in sharp and softly blurs everything behind it, so your attention stays on a single thing. It lives in the menu bar and gets out of the way.",
      "hero.cta1": "Download for macOS",
      "hero.cta2": "Try it right here",
      "hero.fine": "Universal build (Apple Silicon + Intel) &middot; MIT licence &middot; no account, no tracking",
      "try.h2": "Try it. This desktop is fake, the effect is not.",
      "try.hint": "<span class=\"hint-pointer\">Click</span><span class=\"hint-touch\">Tap</span> any window to focus it. Drag a title bar to move it. Hold <kbd>Shift</kbd> and sweep the mouse to peek behind the veil.",
      "p.blur": "Blur",
      "p.tint": "Tint",
      "p.grain": "Grain",
      "p.mono": "Monochrome",
      "p.trans": "Transition",
      "p.peek": "Hold to peek",
      "p.peeking": "Peeking",
      "p.off": "Off",
      "video.h2": "The real app, in thirty seconds",
      "video.sub": "Switch windows and the focus follows. No setup, no window rules to write.",
      "feat.h2": "Quiet by design, flexible when you want it",
      "feat.sub": "Everything below is in the app today.",
      "card1.h": "Ambient and Deep",
      "card1.p": "Ambient is a light blur with a slight dim, good for all-day use. Deep blurs harder and darkens more, for the moments you need the room to disappear.",
      "card2.h": "Blur you can dial",
      "card2.p": "Set the radius to taste. At zero Veil becomes a blur-free mode: just dim, tint, grain or monochrome, which is gentler on busy desktops.",
      "card3.h": "Tint, grain, monochrome",
      "card3.p": "Pick Graphite, a system or preset colour, or any custom one, with its own strength. Add film grain, or drain the colour out of everything behind.",
      "card4.h": "App Groups",
      "card4.p": "Let an editor and a browser share focus so both stay sharp. Or keep every window of the front app clear, and list the apps Veil should always ignore.",
      "card5.h": "Multi-display",
      "card5.p": "Per screen keeps the frontmost window on each display sharp. Global keeps one window sharp and veils every other screen.",
      "card6.h": "Menu bar and Dock",
      "card6.p": "Optionally hide the menu bar and Dock while Veil is active. The Stage Manager strip stays visible, or you can blur it too.",
      "card7.h": "Gestures",
      "card7.p": "Shake the mouse to toggle. Hold Shift and shake to peek. Push into a screen corner for a quick look. Veil steps aside while you drag a file.",
      "card8.h": "Transitions",
      "card8.p": "A soft fade, a cursor reveal that opens as a circle from the pointer, or none at all. Reduced-motion settings are respected.",
      "card9.h": "Native and light",
      "card9.p": "Written in Swift for Apple Silicon and Intel. The core feature needs no permissions and no screen recording.",
      "sc.h2": "Gestures and shortcuts",
      "sc.sub": "Four global shortcuts, all rebindable in Settings.",
      "sc.kb": "Keyboard",
      "sc.ptr": "Pointer",
      "sc.action": "Action",
      "sc.default": "Default",
      "sc.gesture": "Gesture",
      "sc.effect": "What it does",
      "sc.r1": "Toggle Veil",
      "sc.r2": "Switch mode",
      "sc.r3": "Ignore current app",
      "sc.r4": "Open controls",
      "sc.g1": "Shake the mouse",
      "sc.g1d": "Toggle Veil on or off. Sensitivity is adjustable.",
      "sc.g2": "<kbd>⇧</kbd> + shake",
      "sc.g2d": "Peek behind the veil. Lasts at least 2 seconds and holds while the key is down.",
      "sc.g3": "Screen corner",
      "sc.g3d": "Push the pointer into a corner to peek.",
      "sc.g4": "Drag a file",
      "sc.g4d": "The veil hides automatically so you can reach your drop target.",
      "auto.h2": "Script it with a URL",
      "auto.sub": "Veil registers a <code>veil://</code> scheme, so anything that can open a URL can drive it: the shell, AppleScript, Shortcuts, Raycast, a keyboard-maestro macro.",
      "auto.l1": "<code>veil://toggle</code>, <code>on</code>, <code>off</code> and <code>peek</code>",
      "auto.l2": "<code>veil://mode/deep</code> to pick a mode",
      "auto.l3": "<code>veil://set?…</code> to change any setting in one call",
      "inst.h2": "Install",
      "inst.sub": "Needs macOS 14 Sonoma or later. Apple Silicon and Intel.",
      "inst.s1": "<b>Download</b> the disk image.",
      "inst.s2": "<b>Drag Veil</b> into your Applications folder.",
      "inst.s3": "<b>Open it.</b> A small icon appears in the menu bar. Click any window and you are focused.",
      "inst.dl": "Download Veil.dmg",
      "inst.src": "View source",
      "inst.note": "First launch: if macOS says it can’t verify the developer, right-click Veil and choose Open.",
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
      "video.label": "Screen recording of Veil blurring the background while a text window stays sharp",
    },
    'zh-Hans': {
      "skip": "跳到在线演示",
      "nav.features": "功能",
      "nav.shortcuts": "快捷键",
      "nav.automation": "自动化",
      "nav.faq": "常见问题",
      "btn.download": "下载",
      "hero.eyebrow": "免费开源 &middot; macOS 14+",
      "hero.h1": "专注于<em>一个</em>窗口。",
      "hero.lede": "Veil 让你正在用的窗口保持清晰，把背后的一切轻轻模糊掉，注意力就留在眼前这一件事上。它住在菜单栏里，不打扰你。",
      "hero.cta1": "下载 macOS 版",
      "hero.cta2": "现在就试试",
      "hero.fine": "通用版本（Apple 芯片 + Intel） &middot; MIT 许可 &middot; 无需账号，不追踪",
      "try.h2": "来试试。这个桌面是假的，效果是真的。",
      "try.hint": "<span class=\"hint-pointer\">点击</span><span class=\"hint-touch\">轻点</span>任意窗口即可聚焦，拖动标题栏可以移动窗口。按住 <kbd>Shift</kbd> 并快速晃动鼠标，可以偷看模糊层后面。",
      "p.blur": "模糊",
      "p.tint": "色调",
      "p.grain": "颗粒",
      "p.mono": "单色",
      "p.trans": "过渡",
      "p.peek": "按住偷看",
      "p.peeking": "偷看中",
      "p.off": "关",
      "video.h2": "三十秒看懂 Veil",
      "video.sub": "切换窗口，焦点跟着走。不用设置，也不用写窗口规则。",
      "feat.h2": "默认安静，需要时可以细调",
      "feat.sub": "下面这些都已经在应用里了。",
      "card1.h": "Ambient 与 Deep 两种模式",
      "card1.p": "Ambient（轻柔）是轻度模糊加一点点变暗，适合整天开着。Deep（深度）模糊更强、画面更暗，需要把周围彻底隐去时用。",
      "card2.h": "可调的模糊",
      "card2.p": "模糊半径随你调。调到 0 就是无模糊模式：只保留变暗、色调、颗粒或黑白，在杂乱的桌面上更柔和。",
      "card3.h": "色调、颗粒、黑白",
      "card3.p": "可选石墨灰、系统强调色、其他预设色，或任意自定义颜色，并可调强度。还能加胶片颗粒，或把背后的颜色抽掉。",
      "card4.h": "应用组（App Groups）",
      "card4.p": "把编辑器和浏览器放进同一组，两个都保持清晰。也可以让前台应用的所有窗口都保持清晰，并设置永远忽略的应用。",
      "card5.h": "多显示器",
      "card5.p": "Per screen 模式下，每块显示器各自保持最前面的窗口清晰；Global 模式下，只保留一个窗口清晰，其他屏幕全部模糊。",
      "card6.h": "菜单栏与 Dock",
      "card6.p": "开启后可自动隐藏菜单栏和 Dock。Stage Manager 侧栏默认保持可见，也可以一并模糊。",
      "card7.h": "手势",
      "card7.p": "晃动鼠标切换开关。按住 ⇧ 再晃动可以偷看。把指针推到屏幕角落，快速看一眼。拖动文件时 Veil 会自动让开。",
      "card8.h": "过渡效果",
      "card8.p": "Fade（淡入淡出）、Cursor reveal（从指针处展开一个圆）或 None（无）。支持系统的“减少动态效果”设置。",
      "card9.h": "原生且轻量",
      "card9.p": "用 Swift 编写，同时支持 Apple 芯片和 Intel。核心功能不需要任何权限，也不录制屏幕。",
      "sc.h2": "手势与快捷键",
      "sc.sub": "四个全局快捷键，都可以在设置里修改。",
      "sc.kb": "键盘",
      "sc.ptr": "鼠标",
      "sc.action": "操作",
      "sc.default": "默认",
      "sc.gesture": "手势",
      "sc.effect": "效果",
      "sc.r1": "开关 Veil",
      "sc.r2": "切换模式",
      "sc.r3": "忽略当前应用",
      "sc.r4": "打开控制面板",
      "sc.g1": "晃动鼠标",
      "sc.g1d": "开关 Veil，灵敏度可调。",
      "sc.g2": "<kbd>⇧</kbd> + 晃动",
      "sc.g2d": "偷看模糊层后面。至少持续 2 秒，按住按键时一直保持。",
      "sc.g3": "屏幕角落",
      "sc.g3d": "把指针推到角落即可偷看。",
      "sc.g4": "拖动文件",
      "sc.g4d": "模糊层会自动隐藏，方便你找到放置位置。",
      "auto.h2": "用 URL 脚本控制",
      "auto.sub": "Veil 注册了 <code>veil://</code> 协议，凡是能打开 URL 的东西都能控制它：终端、AppleScript、快捷指令、Raycast、Keyboard Maestro 宏。",
      "auto.l1": "<code>veil://toggle</code>、<code>on</code>、<code>off</code> 和 <code>peek</code>",
      "auto.l2": "<code>veil://mode/deep</code> 选择模式",
      "auto.l3": "<code>veil://set?…</code> 一次修改任意设置",
      "inst.h2": "安装",
      "inst.sub": "需要 macOS 14 Sonoma 或更高版本，支持 Apple 芯片和 Intel。",
      "inst.s1": "<b>下载</b>磁盘映像。",
      "inst.s2": "<b>把 Veil 拖进</b>「应用程序」文件夹。",
      "inst.s3": "<b>打开它。</b>菜单栏里会出现一个小图标。点任意窗口，就进入专注。",
      "inst.dl": "下载 Veil.dmg",
      "inst.src": "查看源代码",
      "inst.note": "第一次打开时，如果 macOS 提示无法验证开发者，在「应用程序」里右键 Veil → 打开。",
      "faq.h2": "常见问题",
      "faq1.q": "真的免费吗？",
      "faq1.a": "是的。Veil 采用 MIT 许可，开源。没有付费版，没有试用期限，也不用注册账号。源代码都在 GitHub 上，可以阅读、编译、修改。",
      "faq2.q": "需要什么权限吗？",
      "faq2.a": "核心功能不需要。模糊背景不用「屏幕录制」或「辅助功能」权限。唯一可选的是「自动化」权限，只有在你开启自动隐藏菜单栏和 Dock 时才会请求。",
      "faq3.q": "会拖慢我的 Mac 吗？",
      "faq3.a": "不会。模糊交给系统合成器完成，和 macOS 自己的半透明界面用的是同一套机制。Veil 不截取屏幕，也不自己处理画面，空闲时几乎不占资源。",
      "faq4.q": "能让两个应用同时保持清晰吗？",
      "faq4.a": "可以。把它们放进同一个 App Group，比如编辑器和浏览器，它们就共享焦点。也可以让前台应用的所有窗口都保持清晰，或把某些应用加入忽略列表。",
      "faq5.q": "支持多显示器吗？",
      "faq5.a": "支持。选 Per screen，每块显示器各自保持最前面的窗口清晰；选 Global，则所有显示器只保留一个清晰的窗口。",
      "foot.made": "由 James 制作 &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.mit": "MIT 许可",
      "meta.title": "Veil — 专注于一个窗口",
      "meta.desc": "Veil 是免费开源的 macOS 菜单栏应用，让你正在用的窗口保持清晰，把背后的一切轻轻模糊。可以直接在浏览器里试玩。",
      "meta.ogdesc": "免费开源的 macOS 菜单栏应用，让当前窗口保持清晰，背后轻轻模糊。",
      "nav.label": "页面导航",
      "panel.label": "Veil 控制面板",
      "switch.label": "开启 Veil",
      "tint.strength": "色调强度",
      "video.label": "屏幕录像：一个文字窗口保持清晰，背景被模糊",
    },
    'zh-Hant': {
      "skip": "跳到線上試玩",
      "nav.features": "功能",
      "nav.shortcuts": "快捷鍵",
      "nav.automation": "自動化",
      "nav.faq": "常見問題",
      "btn.download": "下載",
      "hero.eyebrow": "免費開源 &middot; macOS 14+",
      "hero.h1": "專注在<em>一個</em>視窗。",
      "hero.lede": "Veil 讓你正在使用的視窗保持清晰，把後面的一切輕輕模糊，注意力就留在眼前這件事上。它待在選單列裡，不會打擾你。",
      "hero.cta1": "下載 macOS 版",
      "hero.cta2": "現在就試試",
      "hero.fine": "通用版本（Apple 晶片 + Intel） &middot; MIT 授權 &middot; 不需帳號，不追蹤",
      "try.h2": "來試試。這個桌面是假的，效果是真的。",
      "try.hint": "<span class=\"hint-pointer\">點一下</span><span class=\"hint-touch\">輕觸</span>任意視窗即可聚焦，拖曳標題列可以移動視窗。按住 <kbd>Shift</kbd> 並快速移動滑鼠，可以偷看模糊層後面。",
      "p.blur": "模糊",
      "p.tint": "色調",
      "p.grain": "顆粒",
      "p.mono": "單色",
      "p.trans": "轉場",
      "p.peek": "按住偷看",
      "p.peeking": "偷看中",
      "p.off": "關",
      "video.h2": "三十秒看懂 Veil",
      "video.sub": "切換視窗，焦點跟著走。不用設定，也不用寫視窗規則。",
      "feat.h2": "預設安靜，需要時可以細調",
      "feat.sub": "下面這些都已經在 App 裡了。",
      "card1.h": "Ambient 與 Deep 兩種模式",
      "card1.p": "Ambient（輕柔）是輕度模糊加一點點變暗，適合整天開著。Deep（深度）模糊更強、畫面更暗，需要把周圍徹底隱去時使用。",
      "card2.h": "可調的模糊",
      "card2.p": "模糊半徑隨你調。調到 0 就是無模糊模式：只保留變暗、色調、顆粒或黑白，在雜亂的桌面上更柔和。",
      "card3.h": "色調、顆粒、黑白",
      "card3.p": "可選石墨灰、系統強調色、其他預設色，或任意自訂顏色，並可調強度。還能加底片顆粒，或把背後的顏色抽掉。",
      "card4.h": "App 群組（App Groups）",
      "card4.p": "把編輯器和瀏覽器放進同一組，兩個都保持清晰。也可以讓前景 App 的所有視窗都保持清晰，並設定永遠忽略的 App。",
      "card5.h": "多螢幕",
      "card5.p": "Per screen 模式下，每個螢幕各自保持最前面的視窗清晰；Global 模式下，只保留一個視窗清晰，其他螢幕全部模糊。",
      "card6.h": "選單列與 Dock",
      "card6.p": "開啟後可自動隱藏選單列和 Dock。Stage Manager 側欄預設保持可見，也可以一併模糊。",
      "card7.h": "手勢",
      "card7.p": "晃動滑鼠切換開關。按住 ⇧ 再晃動可以偷看。把游標推到螢幕角落，快速看一眼。拖曳檔案時 Veil 會自動讓開。",
      "card8.h": "轉場效果",
      "card8.p": "Fade（淡入淡出）、Cursor reveal（從游標處展開一個圓）或 None（無）。支援系統的「減少動態效果」設定。",
      "card9.h": "原生且輕量",
      "card9.p": "以 Swift 撰寫，同時支援 Apple 晶片和 Intel。核心功能不需要任何權限，也不錄製螢幕。",
      "sc.h2": "手勢與快捷鍵",
      "sc.sub": "四個全域快捷鍵，都可以在設定裡修改。",
      "sc.kb": "鍵盤",
      "sc.ptr": "滑鼠",
      "sc.action": "動作",
      "sc.default": "預設",
      "sc.gesture": "手勢",
      "sc.effect": "效果",
      "sc.r1": "開關 Veil",
      "sc.r2": "切換模式",
      "sc.r3": "忽略目前的 App",
      "sc.r4": "開啟控制面板",
      "sc.g1": "晃動滑鼠",
      "sc.g1d": "開關 Veil，靈敏度可調。",
      "sc.g2": "<kbd>⇧</kbd> + 晃動",
      "sc.g2d": "偷看模糊層後面。至少持續 2 秒，按住按鍵時一直保持。",
      "sc.g3": "螢幕角落",
      "sc.g3d": "把游標推到角落即可偷看。",
      "sc.g4": "拖曳檔案",
      "sc.g4d": "模糊層會自動隱藏，方便你找到放置的位置。",
      "auto.h2": "用 URL 腳本控制",
      "auto.sub": "Veil 註冊了 <code>veil://</code> 協定，凡是能開啟 URL 的東西都能控制它：終端機、AppleScript、捷徑、Raycast、Keyboard Maestro 巨集。",
      "auto.l1": "<code>veil://toggle</code>、<code>on</code>、<code>off</code> 和 <code>peek</code>",
      "auto.l2": "<code>veil://mode/deep</code> 選擇模式",
      "auto.l3": "<code>veil://set?…</code> 一次修改任何設定",
      "inst.h2": "安裝",
      "inst.sub": "需要 macOS 14 Sonoma 或更新版本，支援 Apple 晶片和 Intel。",
      "inst.s1": "<b>下載</b>磁碟映像檔。",
      "inst.s2": "<b>把 Veil 拖進</b>「應用程式」資料夾。",
      "inst.s3": "<b>開啟它。</b>選單列會出現一個小圖示。點任一視窗，就進入專注。",
      "inst.dl": "下載 Veil.dmg",
      "inst.src": "查看原始碼",
      "inst.note": "第一次開啟時，如果 macOS 提示無法驗證開發者，在「應用程式」裡按右鍵 Veil → 打開。",
      "faq.h2": "常見問題",
      "faq1.q": "真的免費嗎？",
      "faq1.a": "是的。Veil 採用 MIT 授權，開放原始碼。沒有付費版，沒有試用期限，也不用註冊帳號。原始碼都在 GitHub 上，可以閱讀、編譯、修改。",
      "faq2.q": "需要任何權限嗎？",
      "faq2.a": "核心功能不需要。模糊背景不需要「螢幕錄製」或「輔助使用」權限。唯一可選的是「自動化」權限，只有在你開啟自動隱藏選單列和 Dock 時才會請求。",
      "faq3.q": "會拖慢我的 Mac 嗎？",
      "faq3.a": "不會。模糊交給系統合成器處理，和 macOS 自己的半透明介面用的是同一套機制。Veil 不擷取螢幕，也不自己處理畫面，閒置時幾乎不佔資源。",
      "faq4.q": "能讓兩個 App 同時保持清晰嗎？",
      "faq4.a": "可以。把它們放進同一個 App Group，例如編輯器和瀏覽器，它們就會共用焦點。也可以讓前景 App 的所有視窗都保持清晰，或把某些 App 加入忽略清單。",
      "faq5.q": "支援多螢幕嗎？",
      "faq5.a": "支援。選 Per screen，每個螢幕各自保持最前面的視窗清晰；選 Global，則所有螢幕只保留一個清晰的視窗。",
      "foot.made": "由 James 製作 &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.mit": "MIT 授權",
      "meta.title": "Veil — 專注在一個視窗",
      "meta.desc": "Veil 是免費開源的 macOS 選單列 App，讓你正在使用的視窗保持清晰，把後面的一切輕輕模糊。可以直接在瀏覽器裡試玩。",
      "meta.ogdesc": "免費開源的 macOS 選單列 App，讓目前的視窗保持清晰，後面輕輕模糊。",
      "nav.label": "頁面導覽",
      "panel.label": "Veil 控制面板",
      "switch.label": "開啟 Veil",
      "tint.strength": "色調強度",
      "video.label": "螢幕錄影：一個文字視窗保持清晰，背景被模糊",
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
