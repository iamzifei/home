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
      "panel.alt": "The Veil settings panel at the right edge of the screen: ignore, power, mode, blur, tint, grain and App Groups",
      "skip": "Skip to the live demo",
      "nav.label": "Sections",
      "nav.what": "What it is",
      "nav.how": "How to use",
      "nav.faq": "FAQ",
      "nav.new": "What's new",
      "btn.download": "Download",
      "hero.claim": "Focus on one window. <span class=\"lo\">Everything behind it softly blurs away.</span>",
      "hero.cta1": "Download for Mac",
      "hero.cta2": "or try it right here",
      "hero.fine": "Free and open source · macOS 14+",
      "try.h2": "This desktop is fake. The blur is real.",
      "try.hint": "<span class=\"hint-pointer\">Click</span><span class=\"hint-touch\">Tap</span> any window to focus it. Drag a title bar to move it. Hold <kbd>Shift</kbd> and sweep the mouse to peek behind the veil.",
      "p.peeking": "Peeking",
      "panel.label": "Veil controls",
      "switch.label": "Veil on",
      "set.mode": "Mode",
      "v.ambient": "Ambient",
      "v.deep": "Deep",
      "p.blur": "Blur",
      "p.tint": "Tint",
      "tint.strength": "Tint strength",
      "p.grain": "Grain",
      "p.mono": "Monochrome",
      "p.trans": "Reveal",
      "v.fade": "Fade",
      "v.cursor": "From cursor",
      "v.none": "None",
      "p.peek": "Hold to peek",
      "what.claim": "What Veil is. <span class=\"lo\">A small Mac app that blurs every window except the one you are using.</span>",
      "what.1h": "Sharp where you work",
      "what.1p": "The window in front stays crisp. Everything behind it, other windows and the desktop, is softly blurred.",
      "what.2h": "It follows your clicks",
      "what.2p": "Click another window and the sharp spot moves with you. There are no window rules to set up.",
      "what.3h": "It lives in the menu bar",
      "what.3p": "No Dock icon, no main window. Click the menu-bar icon and the settings panel appears at the right edge of the screen.",
      "why.claim": "Why it helps. <span class=\"lo\">A busy screen keeps pulling your eyes away. Veil turns the noise down, so the task in front of you stands out.</span>",
      "why.1h": "Fewer glances away",
      "why.1p": "Chat badges, a second document, a browser tab: anything that moves or flashes behind your work is blurred, so it is far less likely to catch your eye.",
      "why.2h": "Nothing is hidden or closed",
      "why.2p": "Unlike full screen, your windows stay where they are. Click one and it comes back into focus at once.",
      "why.3h": "Who it is for",
      "why.3p": "Writers, developers, students and anyone who works with many windows open, on a laptop or across several displays.",
      "video.claim": "The real app. <span class=\"lo\">Switch windows, and the focus follows. No rules to write.</span>",
      "video.label": "Screen recording of Veil: windows come into focus one at a time while the rest of the desktop blurs",
      "look1.alt": "Ambient: the top of the screen stays clear, the blur builds towards the middle",
      "look1.c": "Clear at the top, blurred from the middle down.",
      "look2.alt": "Deep: everything behind the window evenly blurred",
      "look2.c": "The whole background, evenly blurred.",
      "look3.alt": "A blue tint with film grain",
      "look3.h": "Tint & grain",
      "look3.c": "Any colour, plus film grain.",
      "look4.alt": "Monochrome: the blurred background drained of colour",
      "look4.h": "Monochrome",
      "look4.c": "Drain the colour from everything behind.",
      "how.claim": "How to use it. <span class=\"lo\">Up and running in a minute: install, click the menu-bar icon, get to work.</span>",
      "how.1h": "Install",
      "how.1p": "Download <b>Veil.dmg</b>, open it and drag Veil into your Applications folder, or run <code>brew install --cask iamzifei/tap/veil</code> in Terminal. Needs macOS 14 Sonoma or later, on Apple Silicon or Intel. The app is signed and notarized by Apple, so it opens normally.",
      "how.2h": "First run",
      "how.2p": "Open Veil. A short welcome guide appears once, and Veil is already on. It needs no permissions. The only exception is the optional auto-hide of the menu bar and Dock, which asks for Automation access the first time you turn it on.",
      "how.3h": "Turn it on and off",
      "how.3p": "Click the Veil icon in the menu bar to open the settings panel; its power button turns Veil on or off. You can also shake the mouse, or press ⌃⌥⌘F. The icon shows the state: a glowing dot for Deep, a soft dot for Ambient, a ring when the front app is ignored, a faint dot when Veil is off. Right-click or Control-click it for the menu.",
      "how.4h": "Work as usual",
      "how.4p": "Click any window to bring it into focus; Veil follows. To look behind the veil for a moment, hold ⇧ and shake the mouse, or choose Peek from the menu. The veil also steps aside while you drag a file.",
      "how.5h": "Adjust it in Settings",
      "how.5p": "The panel (menu-bar icon or ⌃⌥⌘C) keeps the essentials up top: ignore the current app, power, mode, and the blur, tint and grain sliders. More settings opens the rest: App Groups, app-wide focus, several displays, auto-hide, Stage Manager, gestures, shortcuts, monochrome, transition length and reveal effect, the ignore list and scripting commands.",
      "how.sc": "Keyboard shortcuts",
      "sc.r1": "Toggle Veil",
      "sc.r2": "Switch mode",
      "sc.r3": "Ignore current app",
      "sc.r4": "Open or close Settings",
      "sc.sub": "All four work in any app and can be changed in Settings.",
      "tune.claim": "Focus, fine-tuned. <span class=\"lo\">Blur, tint, grain, App Groups, gestures, shortcuts and a URL scheme.</span>",
      "set.look": "Settings panel",
      "card1.p": "Deep blurs everything behind your window evenly. Ambient keeps the top of the screen clear and lets the blur build towards the middle. Transition sets how long the veil takes to fade, from 0 to 1.5 s; the reveal effect is a fade or a soft circle that grows from the pointer.",
      "set.focus": "Focus",
      "set.appwide": "App-wide focus",
      "set.groups": "App Groups",
      "set.newgroup": "New Group…",
      "set.groupdemo": "Editor + browser",
      "set.ignored": "Ignored apps",
      "set.add": "Add…",
      "card4.p": "Let an editor and a browser share focus so both stay sharp. Or keep every window of the front app clear, and list the apps Veil should always ignore.",
      "set.screens": "Screens",
      "set.multi": "Multi-screen mode",
      "v.perscreen": "Per screen",
      "v.global": "Global",
      "set.autohide": "Auto-hide Menu Bar & Dock",
      "set.stage": "Blur Stage Manager",
      "card5.p": "Per screen keeps the frontmost window on each display sharp. Global keeps one window sharp and veils every other screen. Hide the menu bar, the Dock or both while Veil is on, and blur the Stage Manager strip too if you like.",
      "set.gestures": "Gestures",
      "set.shake": "Shake to toggle",
      "set.shakepeek": "Hold + shake to peek",
      "set.corner": "Corner peek",
      "set.drag": "Hide while dragging files",
      "card7.p": "Shake the mouse to toggle. Hold Shift and shake to peek for at least two seconds. Park the pointer in a screen corner for a quick look. Veil steps aside while you drag a file.",
      "set.url": "URL scheme",
      "auto.sub": "Veil registers a <code>veil://</code> scheme, so anything that can open a URL can drive it: <code>toggle</code>, <code>on</code>, <code>off</code>, <code>mode/ambient</code>, <code>blur/60</code>, <code>tint/color/blue</code>, <code>grayscale/toggle</code>, <code>ignore/toggle</code> and more. The panel lists every command; click one to copy it.",
      "inst.claim": "Free, and it stays free. <span class=\"lo\">MIT licensed. No account, no tracking, no trial timer.</span>",
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
      "faq6.q": "How do I update it?",
      "faq6.a": "Veil checks for updates itself and installs them when you agree. You can also download the latest disk image from this page at any time.",
      "sib.h2": "More Mac apps by James",
      "sib.candela.d": "Every display control macOS hides",
      "sib.clipstack.d": "Clipboard history in the menu bar",
      "sib.audioswitch.d": "Audio device switching from the menu bar",
      "sib.inkstone.d": "Notes that stay your own files",
      "sib.tapper.n": "Tapper",
      "sib.tapper.d": "Turns your pointer into a cartoon glove on a long stick, for demos and screen recordings. Free, MIT.",
      "foot.made": "Made by James &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.sib": "More Mac apps by James",
      "foot.tapper": "Tapper",
      "foot.mit": "MIT licence",
      "meta.title": "Veil — Blur Background Windows on Mac | Free Focus App",
      "meta.desc": "Veil is a free, open-source Mac menu-bar app that keeps your active window sharp and blurs everything behind it. macOS 14+. Try it live, then download.",
      "meta.ogdesc": "A free, open-source Mac menu-bar app that keeps your active window sharp and softly blurs everything behind it.",
      "brew.label": "Or install with Homebrew",
      "brew.copy": "Copy",
      "brew.copied": "Copied",
      "p.off": "Off",
    },
    'zh-Hans': {
      "panel.alt": "屏幕右侧的 Veil 设置面板：忽略、电源、模式、模糊、着色、颗粒和应用分组",
      "skip": "跳到在线演示",
      "nav.label": "页面导航",
      "nav.what": "这是什么",
      "nav.how": "怎么用",
      "nav.faq": "常见问题",
      "nav.new": "更新日志",
      "btn.download": "下载",
      "hero.claim": "专注于一个窗口。<span class=\"lo\">背后的一切，轻轻模糊掉。</span>",
      "hero.cta1": "下载 Mac 版",
      "hero.cta2": "或者就在这里试试",
      "hero.fine": "免费开源 · macOS 14+",
      "try.h2": "这个桌面是假的，模糊是真的。",
      "try.hint": "<span class=\"hint-pointer\">点击</span><span class=\"hint-touch\">轻点</span>任意窗口即可聚焦，拖动标题栏可以移动窗口。按住 <kbd>Shift</kbd> 并快速晃动鼠标，可以偷看模糊层后面。",
      "p.peeking": "偷看中",
      "panel.label": "Veil 控制面板",
      "switch.label": "开启 Veil",
      "set.mode": "模式",
      "v.ambient": "氛围",
      "v.deep": "深度",
      "p.blur": "模糊",
      "p.tint": "着色",
      "tint.strength": "着色强度",
      "p.grain": "颗粒",
      "p.mono": "黑白",
      "p.trans": "显现效果",
      "v.fade": "淡入淡出",
      "v.cursor": "从指针扩散",
      "v.none": "无",
      "p.peek": "按住偷看",
      "what.claim": "Veil 是什么。<span class=\"lo\">一个 Mac 小应用：除了你正在用的窗口，其他全部模糊掉。</span>",
      "what.1h": "眼前的保持清晰",
      "what.1p": "最前面的窗口保持清晰。它后面的一切，包括其他窗口和桌面，都会被轻轻模糊。",
      "what.2h": "焦点跟着你的点击走",
      "what.2p": "点一下别的窗口，清晰的位置就跟过去。不需要设置任何窗口规则。",
      "what.3h": "住在菜单栏里",
      "what.3p": "没有程序坞图标，也没有主窗口。点一下菜单栏图标，设置面板就出现在屏幕右侧。",
      "why.claim": "有什么用。<span class=\"lo\">屏幕太乱，眼睛总被拽走。Veil 把干扰调小，让眼前这件事更显眼。</span>",
      "why.1h": "少分心",
      "why.1p": "聊天角标、另一份文档、浏览器标签页……工作背后任何会动、会闪的东西都被模糊了，就不容易再勾走你的视线。",
      "why.2h": "什么都没关、没藏",
      "why.2p": "和全屏不同，窗口都留在原处。点一下，它马上回到焦点。",
      "why.3h": "适合谁",
      "why.3p": "写作者、开发者、学生，以及所有习惯同时开很多窗口的人，不管是用笔记本还是接了好几块显示器。",
      "video.claim": "真实的应用。<span class=\"lo\">切换窗口，焦点跟着走。不用写任何规则。</span>",
      "video.label": "Veil 的屏幕录像：窗口一个接一个进入焦点，桌面其余部分被模糊",
      "look1.alt": "氛围模式：屏幕上方保持清晰，越往中间越模糊",
      "look1.c": "上方清晰，从中间往下模糊。",
      "look2.alt": "深度模式：窗口后面的一切均匀模糊",
      "look2.c": "整个背景均匀模糊。",
      "look3.alt": "蓝色着色加胶片颗粒",
      "look3.h": "着色与颗粒",
      "look3.c": "任意颜色，再加胶片颗粒。",
      "look4.alt": "黑白：模糊的背景去掉了颜色",
      "look4.h": "黑白",
      "look4.c": "让后面的一切褪成黑白。",
      "how.claim": "怎么用。<span class=\"lo\">一分钟用起来：装好，点一下菜单栏图标，开始干活。</span>",
      "how.1h": "安装",
      "how.1p": "下载 <b>Veil.dmg</b>，打开后把 Veil 拖进「应用程序」文件夹；也可以在终端运行 <code>brew install --cask iamzifei/tap/veil</code>。需要 macOS 14 Sonoma 或更高版本，Apple 芯片和 Intel 都支持。应用已签名并通过 Apple 公证，可以正常打开。",
      "how.2h": "第一次打开",
      "how.2p": "打开 Veil，会出现一次简短的新手引导，而且 Veil 已经开启。它不需要任何权限。唯一的例外是可选的「自动隐藏菜单栏和程序坞」，第一次打开这个选项时会请求「自动化」权限。",
      "how.3h": "开启和关闭",
      "how.3p": "点菜单栏里的 Veil 图标打开设置面板，面板上的电源按钮负责开关。也可以摇动鼠标，或按 ⌃⌥⌘F。图标会显示状态：发光的圆点是深度模式，柔和的圆点是氛围模式，空心圆环表示当前应用已被忽略，淡淡的圆点表示已关闭。右键或按住 Control 点图标会弹出菜单。",
      "how.4h": "照常工作",
      "how.4p": "点任意窗口让它进入焦点，Veil 会跟过去。想暂时看看背后，按住 ⇧ 摇动鼠标，或在菜单里选「偷看」。拖动文件时遮罩也会自动让开。",
      "how.5h": "在设置里调整",
      "how.5p": "设置面板（点菜单栏图标或按 ⌃⌥⌘C）最上面是常用项：忽略当前应用、电源、模式，以及模糊、着色、颗粒三个滑杆。点「更多设置」展开其余选项：应用分组、整个应用保持清晰、多块显示器、自动隐藏、台前调度、手势、快捷键、黑白、过渡时长和显现效果、忽略列表和脚本命令。",
      "how.sc": "键盘快捷键",
      "sc.r1": "开关 Veil",
      "sc.r2": "切换模式",
      "sc.r3": "忽略当前应用",
      "sc.r4": "打开或关闭设置",
      "sc.sub": "四个快捷键在任何应用里都能用，也都可以在设置里修改。",
      "tune.claim": "专注，细致可调。<span class=\"lo\">模糊、着色、颗粒、应用分组、手势、快捷键，还有 URL 协议。</span>",
      "set.look": "设置面板",
      "card1.p": "深度模式把窗口后面的一切均匀模糊；氛围模式让屏幕上方保持清晰，越往中间越模糊。「过渡」决定淡入淡出用多久，0 到 1.5 秒；显现效果可以是淡入，也可以是从指针处扩散开的柔和圆圈。",
      "set.focus": "聚焦",
      "set.appwide": "整个应用聚焦",
      "set.groups": "应用分组",
      "set.newgroup": "新建分组…",
      "set.groupdemo": "编辑器 + 浏览器",
      "set.ignored": "已忽略的应用",
      "set.add": "添加…",
      "card4.p": "把编辑器和浏览器放进同一组，两个都保持清晰。也可以让前台应用的所有窗口都保持清晰，并设置永远忽略的应用。",
      "set.screens": "屏幕",
      "set.multi": "多屏模式",
      "v.perscreen": "每个屏幕独立",
      "v.global": "全局",
      "set.autohide": "自动隐藏菜单栏和程序坞",
      "set.stage": "模糊台前调度",
      "card5.p": "选「每个屏幕独立」，每块显示器各自保持最前面的窗口清晰；选「全局」，只保留一个窗口清晰，其他屏幕全部模糊。Veil 开启时还可以自动隐藏菜单栏、程序坞或两者，台前调度的侧栏也可以一并模糊。",
      "set.gestures": "手势",
      "set.shake": "摇动鼠标以开关",
      "set.shakepeek": "按住按键并摇动以偷看",
      "set.corner": "角落偷看",
      "set.drag": "拖动文件时隐藏遮罩",
      "card7.p": "摇动鼠标开关 Veil。按住 ⇧ 再摇动可以偷看，至少持续 2 秒。把指针停在屏幕角落，快速看一眼。拖动文件时 Veil 会自动让开。",
      "set.url": "URL 协议",
      "auto.sub": "Veil 注册了 <code>veil://</code> 协议，凡是能打开 URL 的东西都能控制它：<code>toggle</code>、<code>on</code>、<code>off</code>、<code>mode/ambient</code>、<code>blur/60</code>、<code>tint/color/blue</code>、<code>grayscale/toggle</code>、<code>ignore/toggle</code> 等等。设置面板里列出了全部命令，点一下就能复制。",
      "inst.claim": "免费，而且一直免费。<span class=\"lo\">MIT 开源。无需账号，不追踪，没有试用期。</span>",
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
      "faq6.q": "怎么更新？",
      "faq6.a": "Veil 会自己检查更新，经你同意后安装。你也可以随时在这个页面下载最新的磁盘映像。",
      "sib.h2": "James 的其他 Mac 应用",
      "sib.candela.d": "macOS 藏起来的显示器控制",
      "sib.clipstack.d": "菜单栏剪贴板历史",
      "sib.audioswitch.d": "菜单栏音频设备切换",
      "sib.inkstone.d": "笔记就是你自己的文件",
      "sib.tapper.n": "敲黑板 Tapper",
      "sib.tapper.d": "把鼠标指针变成长杆上的卡通手套，演示和录屏时一眼看清你指哪儿。免费，MIT 开源。",
      "foot.made": "由 James 制作 &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.sib": "James 的其他 Mac 应用",
      "foot.tapper": "敲黑板",
      "foot.mit": "MIT 许可",
      "meta.title": "Veil — Mac 背景窗口模糊工具，专注当前窗口 | 免费开源",
      "meta.desc": "Veil 是免费开源的 Mac 菜单栏应用：正在用的窗口保持清晰，背后的窗口和桌面轻轻模糊，帮你专注。支持 macOS 14 及以上，可先在浏览器里试玩。",
      "brew.label": "或者用 Homebrew 安装",
      "brew.copy": "复制",
      "brew.copied": "已复制",
      "meta.ogdesc": "免费开源的 macOS 菜单栏应用，让当前窗口保持清晰，背后轻轻模糊。",
      "p.off": "关",
    },
    'zh-Hant': {
      "panel.alt": "螢幕右側的 Veil 設定面板：忽略、電源、模式、模糊、著色、顆粒和 App 群組",
      "skip": "跳到線上試玩",
      "nav.label": "頁面導覽",
      "nav.what": "這是什麼",
      "nav.how": "怎麼用",
      "nav.faq": "常見問題",
      "nav.new": "更新紀錄",
      "btn.download": "下載",
      "hero.claim": "專注在一個視窗。<span class=\"lo\">後面的一切，輕輕模糊掉。</span>",
      "hero.cta1": "下載 Mac 版",
      "hero.cta2": "或者就在這裡試試",
      "hero.fine": "免費開源 · macOS 14+",
      "try.h2": "這個桌面是假的，模糊是真的。",
      "try.hint": "<span class=\"hint-pointer\">點一下</span><span class=\"hint-touch\">輕觸</span>任意視窗即可聚焦，拖曳標題列可以移動視窗。按住 <kbd>Shift</kbd> 並快速移動滑鼠，可以偷看模糊層後面。",
      "p.peeking": "偷看中",
      "panel.label": "Veil 控制面板",
      "switch.label": "開啟 Veil",
      "set.mode": "模式",
      "v.ambient": "氛圍",
      "v.deep": "深度",
      "p.blur": "模糊",
      "p.tint": "著色",
      "tint.strength": "著色強度",
      "p.grain": "顆粒",
      "p.mono": "黑白",
      "p.trans": "顯現效果",
      "v.fade": "淡入淡出",
      "v.cursor": "從指標擴散",
      "v.none": "無",
      "p.peek": "按住偷看",
      "what.claim": "Veil 是什麼。<span class=\"lo\">一個 Mac 小 App：除了你正在使用的視窗，其他全部模糊掉。</span>",
      "what.1h": "眼前的保持清晰",
      "what.1p": "最前面的視窗保持清晰。它後面的一切，包括其他視窗和桌面，都會被輕輕模糊。",
      "what.2h": "焦點跟著你的點擊走",
      "what.2p": "點一下別的視窗，清晰的位置就跟過去。不需要設定任何視窗規則。",
      "what.3h": "待在選單列裡",
      "what.3p": "沒有 Dock 圖示，也沒有主視窗。點一下選單列圖示，設定面板就出現在螢幕右側。",
      "why.claim": "有什麼用。<span class=\"lo\">螢幕太亂，眼睛總被拉走。Veil 把干擾調小，讓眼前這件事更顯眼。</span>",
      "why.1h": "少分心",
      "why.1p": "聊天標記、另一份文件、瀏覽器分頁……工作背後任何會動、會閃的東西都被模糊了，就不容易再吸走你的視線。",
      "why.2h": "什麼都沒關、沒藏",
      "why.2p": "和全螢幕不同，視窗都留在原處。點一下，它馬上回到焦點。",
      "why.3h": "適合誰",
      "why.3p": "寫作者、開發者、學生，以及所有習慣同時開很多視窗的人，不管是用筆電還是接了好幾個螢幕。",
      "video.claim": "真正的 App。<span class=\"lo\">切換視窗，焦點跟著走。不用寫任何規則。</span>",
      "video.label": "Veil 的螢幕錄影：視窗一個接一個進入焦點，桌面其餘部分被模糊",
      "look1.alt": "氛圍模式：螢幕上方保持清晰，越往中間越模糊",
      "look1.c": "上方清晰，從中間往下模糊。",
      "look2.alt": "深度模式：視窗後面的一切均勻模糊",
      "look2.c": "整個背景均勻模糊。",
      "look3.alt": "藍色著色加底片顆粒",
      "look3.h": "著色與顆粒",
      "look3.c": "任意顏色，再加底片顆粒。",
      "look4.alt": "黑白：模糊的背景去掉了顏色",
      "look4.h": "黑白",
      "look4.c": "讓後面的一切褪成黑白。",
      "how.claim": "怎麼用。<span class=\"lo\">一分鐘用起來：裝好，點一下選單列圖示，開始工作。</span>",
      "how.1h": "安裝",
      "how.1p": "下載 <b>Veil.dmg</b>，打開後把 Veil 拖進「應用程式」資料夾；也可以在終端機執行 <code>brew install --cask iamzifei/tap/veil</code>。需要 macOS 14 Sonoma 或更新版本，Apple 晶片和 Intel 都支援。App 已簽署並通過 Apple 公證，可以正常開啟。",
      "how.2h": "第一次開啟",
      "how.2p": "開啟 Veil，會出現一次簡短的新手引導，而且 Veil 已經開啟。它不需要任何權限。唯一的例外是選用的「自動隱藏選單列與 Dock」，第一次開啟這個選項時會要求「自動化」權限。",
      "how.3h": "開啟和關閉",
      "how.3p": "點選單列裡的 Veil 圖示打開設定面板，面板上的電源按鈕負責開關。也可以搖動滑鼠，或按 ⌃⌥⌘F。圖示會顯示狀態：發光的圓點是深度模式，柔和的圓點是氛圍模式，空心圓環表示目前的 App 已被忽略，淡淡的圓點表示已關閉。按右鍵或按住 Control 點圖示會跳出選單。",
      "how.4h": "照常工作",
      "how.4p": "點任一視窗讓它進入焦點，Veil 會跟過去。想暫時看看後面，按住 ⇧ 搖動滑鼠，或在選單裡選「偷看」。拖移檔案時遮罩也會自動讓開。",
      "how.5h": "在設定裡調整",
      "how.5p": "設定面板（點選單列圖示或按 ⌃⌥⌘C）最上面是常用項目：忽略目前的 App、電源、模式，以及模糊、著色、顆粒三個滑桿。點「更多設定」展開其餘選項：App 群組、整個 App 保持清晰、多個螢幕、自動隱藏、幕前調度、手勢、快捷鍵、黑白、過渡時長和顯現效果、忽略清單和腳本指令。",
      "how.sc": "鍵盤快捷鍵",
      "sc.r1": "開關 Veil",
      "sc.r2": "切換模式",
      "sc.r3": "忽略目前的 App",
      "sc.r4": "打開或關閉設定",
      "sc.sub": "四個快捷鍵在任何 App 裡都能用，也都可以在設定裡修改。",
      "tune.claim": "專注，細緻可調。<span class=\"lo\">模糊、著色、顆粒、App 群組、手勢、快捷鍵，還有 URL 協定。</span>",
      "set.look": "設定面板",
      "card1.p": "深度模式把視窗後面的一切均勻模糊；氛圍模式讓螢幕上方保持清晰，越往中間越模糊。「過渡」決定淡入淡出用多久，0 到 1.5 秒；顯現效果可以是淡入，也可以是從指標處擴散開的柔和圓圈。",
      "set.focus": "聚焦",
      "set.appwide": "整個 App 聚焦",
      "set.groups": "App 群組",
      "set.newgroup": "新增群組…",
      "set.groupdemo": "編輯器 + 瀏覽器",
      "set.ignored": "已忽略的 App",
      "set.add": "加入…",
      "card4.p": "把編輯器和瀏覽器放進同一組，兩個都保持清晰。也可以讓前景 App 的所有視窗都保持清晰，並設定永遠忽略的 App。",
      "set.screens": "螢幕",
      "set.multi": "多螢幕模式",
      "v.perscreen": "每個螢幕獨立",
      "v.global": "全域",
      "set.autohide": "自動隱藏選單列與 Dock",
      "set.stage": "模糊「幕前調度」",
      "card5.p": "選「每個螢幕獨立」，每個螢幕各自保持最前面的視窗清晰；選「全域」，只保留一個視窗清晰，其他螢幕全部模糊。Veil 開啟時還可以自動隱藏選單列、Dock 或兩者，「幕前調度」的側欄也可以一併模糊。",
      "set.gestures": "手勢",
      "set.shake": "搖動滑鼠以開關",
      "set.shakepeek": "按住按鍵並搖動以偷看",
      "set.corner": "角落偷看",
      "set.drag": "拖移檔案時隱藏遮罩",
      "card7.p": "搖動滑鼠開關 Veil。按住 ⇧ 再搖動可以偷看，至少持續 2 秒。把游標停在螢幕角落，快速看一眼。拖移檔案時 Veil 會自動讓開。",
      "set.url": "URL 協定",
      "auto.sub": "Veil 註冊了 <code>veil://</code> 協定，凡是能開啟 URL 的東西都能控制它：<code>toggle</code>、<code>on</code>、<code>off</code>、<code>mode/ambient</code>、<code>blur/60</code>、<code>tint/color/blue</code>、<code>grayscale/toggle</code>、<code>ignore/toggle</code> 等等。設定面板裡列出了全部指令，點一下就能拷貝。",
      "inst.claim": "免費，而且一直免費。<span class=\"lo\">MIT 開源。不需帳號，不追蹤，沒有試用期。</span>",
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
      "faq6.q": "要怎麼更新？",
      "faq6.a": "Veil 會自己檢查更新，經你同意後安裝。你也可以隨時在這個頁面下載最新的磁碟映像檔。",
      "sib.h2": "James 的其他 Mac 應用",
      "sib.candela.d": "macOS 藏起來的顯示器控制",
      "sib.clipstack.d": "選單欄剪貼簿歷史",
      "sib.audioswitch.d": "選單欄音訊裝置切換",
      "sib.inkstone.d": "筆記就是你自己的檔案",
      "sib.tapper.n": "敲黑板 Tapper",
      "sib.tapper.d": "把滑鼠游標變成長桿上的卡通手套，簡報和錄影時一眼看清你指哪裡。免費，MIT 開源。",
      "foot.made": "由 James 製作 &middot; <a href=\"https://jamesai.dev\">jamesai.dev</a>",
      "foot.sib": "James 的其他 Mac 應用",
      "foot.tapper": "敲黑板",
      "foot.mit": "MIT 授權",
      "meta.title": "Veil — Mac 背景視窗模糊工具，專注目前視窗 | 免費開源",
      "meta.desc": "Veil 是免費開源的 Mac 選單列 App：正在使用的視窗保持清晰，後面的視窗和桌面輕輕模糊，幫你專注。支援 macOS 14 以上，可先在瀏覽器裡試玩。",
      "brew.label": "或者用 Homebrew 安裝",
      "brew.copy": "複製",
      "brew.copied": "已複製",
      "meta.ogdesc": "免費開源的 macOS 選單列 App，讓目前的視窗保持清晰，後面輕輕模糊。",
      "p.off": "關",
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
    // A page opened with ?lang= is its own canonical (it is one of the hreflang alternates);
    // without the parameter the canonical stays the bare /veil/ URL.
    try {
      if (new URLSearchParams(location.search).get('lang')) {
        var canon = 'https://jamesai.dev/veil/?lang=' + lang;
        var link = document.querySelector('link[rel="canonical"]');
        if (link) link.setAttribute('href', canon);
        setMeta('meta[property="og:url"]', canon);
      }
    } catch (e) {}
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
