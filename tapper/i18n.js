/* Tapper site i18n: English (en), Simplified Chinese (zh-Hans), Traditional Chinese / Taiwan (zh-Hant).
 *
 * How it works
 *   - index.html carries the English text as a no-JS fallback and tags every translatable node:
 *       data-i18n="key"            -> element.textContent
 *       data-i18n-html="key"       -> element.innerHTML (only where the string needs markup)
 *       data-i18n-attr="attr:key;attr:key" -> attributes such as aria-label / title / alt
 *   - Everything lives in the DICT object below. Missing keys fall back to English.
 *   - Language choice: ?lang= param > localStorage > navigator.languages > English.
 *   - Product naming: Chinese brand is 敲黑板; the app, its menus and the URL scheme stay "Tapper".
 *   - Public API: window.TapperI18n = { t(key), set(lang), get(), LANGS, DICT }.
 *     A "tapperlang" event fires on document whenever the language is applied.
 */
(() => {
  'use strict';

  const LANGS = ['en', 'zh-Hans', 'zh-Hant'];
  const STORE_KEY = 'tapper-lang';
  const DL = 'https://github.com/iamzifei/tapper/releases/latest/download/Tapper.dmg';
  const KBD_P = '<kbd>⌃</kbd> <kbd>⌥</kbd> <kbd>P</kbd>';
  const KBD_T = '<kbd>⌃</kbd> <kbd>⌥</kbd> <kbd>T</kbd>';

  const DICT = {
    /* ------------------------------------------------------------------ English */
    en: {
      'meta.title': 'Tapper — point like you mean it',
      'meta.desc': 'Tapper is a free, open-source macOS menu-bar app that turns your mouse pointer into a cartoon glove on a long stick. Perfect for demos, screen shares and tutorials. Try it live.',
      'meta.og': 'A cartoon glove on a long stick replaces your Mac pointer. Free, open source, made for demos and screen shares.',
      'skip': 'Skip to content',
      'brand': 'Tapper',
      'brand.aria': 'Tapper home',
      'nav.aria': 'Main',
      'nav.features': 'Features',
      'nav.shortcuts': 'Shortcuts',
      'nav.faq': 'FAQ',
      'nav.github': 'GitHub',
      'nav.download': 'Download',
      'lang.aria': 'Language',

      'hero.eyebrow': 'Free · Open source · macOS',
      'hero.h1': 'Point like <span class="hl">you mean it.</span>',
      'hero.lede': 'Tapper swaps your pointer for a cartoon glove on a long, wobbly stick. Nobody watching your demo, call or recording will ever ask “wait, where are you pointing?” again.',
      'cta.download': 'Download for Mac',
      'cta.github': 'View on GitHub',
      'hero.fine': 'Requires macOS 14 or later · Universal binary · MIT licensed',

      'stage.aria': 'Interactive demo: move your pointer over this slide to see the Tapper glove follow it, and click to poke.',
      'slide.window': 'Q4 review — slides',
      'slide.kicker': 'Q4 REVIEW',
      'slide.title': 'Signups doubled. Here’s why.',
      'slide.b1': 'New onboarding cut drop-off in half',
      'slide.b2': 'Referral loop went live in week 3',
      'slide.b3': 'Support tickets stayed flat',
      'slide.tag': 'this one!',
      'hint.mouse': 'Move your mouse here, then click',
      'hint.touch': 'Tap or drag on the slide',

      'ctl.hand': 'Hand',
      'ctl.hand.aria': 'Hand style',
      'style.tiny.title': 'Pointing index finger',
      'style.paw.title': 'Cat paw with pink beans',
      'style.middle.title': 'Cheeky middle finger',
      'ctl.mood': 'Pointer mood',
      'mood.end1': 'Shy finger',
      'mood.end2': 'In your face',
      'mood.1': 'Shy finger',
      'mood.2': 'Polite point',
      'mood.3': 'Clear signal',
      'mood.4': 'Hard to miss',
      'mood.5': 'In your face',
      'ctl.color': 'Stick colour',
      'ctl.color.aria': 'Stick colour',
      'color.0': 'Black', 'color.1': 'White', 'color.2': 'Orange', 'color.3': 'Red',
      'color.4': 'Pink', 'color.5': 'Purple', 'color.6': 'Blue', 'color.7': 'Green',
      'ctl.sound': 'Knock sound',
      'sound.label': 'Sound:',
      'sound.on': 'On',
      'sound.off': 'Off',

      'video.h2': 'See it on a real Mac.',
      'video.lede': 'Same glove, same spring, drawn over every window and every display.',
      'video.aria': 'Screen recording of Tapper on macOS: the glove follows the pointer and pokes on click',

      'feat.h2': 'Impossible to miss. On purpose.',
      'feat.lede': 'Everything you need to make your pointer the loudest thing on screen, and nothing you don’t.',
      'f1.t': 'A glove, not an arrow',
      'f1.p': 'The system arrow is hidden on every display. The glove follows your pointer, and its fingertip is exactly where you’re aiming.',
      'f2.t': 'A stick with a mind of its own',
      'f2.p': 'It hangs toward the bottom-right, fades out at the far end, and swings on a spring. Move fast and it lags and wobbles.',
      'f3.t': 'Three hands',
      'f3.p': 'Tiny hand with a pointing finger, Cat paw with pink beans, or Middle child, for the cheeky ones.',
      'f4.t': 'Click to poke',
      'f4.p': 'Every click jabs forward with comic impact lines. Click fast and the hits get bigger, all the way to a starburst.',
      'f5.t': 'Pointer mood',
      'f5.p': 'Five steps from “Shy finger” to “In your face”: size, stick length and how hard it pokes, all in one slider.',
      'f6.t': 'Make it yours',
      'f6.p': 'Pick a stick colour, switch click animation on or off, and turn on a knock sound with its own volume.',
      'f7.t': 'Presentation mode',
      'f7.p': 'Clicks only poke, they never reach the app underneath. The keyboard keeps working, so slides advance as usual.',
      'f8.t': 'Multi-display, recording-ready',
      'f8.p': 'Works across every display and shows up in screen shares and recordings, because it’s drawn on screen.',
      'f9.t': 'Scriptable',
      'f9.p': 'A <code>tapper://</code> URL scheme lets Shortcuts, Raycast, Stream Deck or a shell script drive it.',
      'f10.t': 'Native and light',
      'f10.p': 'Written in Swift, ships as a universal binary for Apple silicon and Intel, and runs on macOS 14 or later.',

      'keys.h2': 'Two shortcuts. That’s the whole job.',
      'keys.lede': 'Global hotkeys, so they work no matter which app is in front.',
      'keys.th1': 'Action', 'keys.th2': 'Shortcut', 'keys.th3': 'What it does',
      'keys.r1.a': 'Show / Hide pointer',
      'keys.r1.d': 'Swaps the glove in or out. Your normal arrow comes straight back.',
      'keys.r2.a': 'Presentation mode',
      'keys.r2.d': 'Clicks only poke. Handy for slides. Needs Accessibility permission.',
      'keys.r3.a': 'Poke',
      'keys.r3.k': 'Click',
      'keys.r3.d': 'Jabs the glove and bursts impact lines at the fingertip. Click fast for bigger hits.',

      'pm.h2': 'Present without accidents.',
      'pm.p': 'Ever clicked a link mid-demo just to make a point? In Presentation mode, clicks stop at the glove. They poke, they burst, and nothing underneath gets activated.',
      'pm.l1': 'Your keyboard still works, so arrow keys keep flipping slides.',
      'pm.l2': `Toggle it from anywhere with ${KBD_T}.`,
      'pm.l3': 'macOS needs to grant Accessibility permission the first time you use it.',
      'pm.card.t': 'How a click behaves',
      'pm.card.1': '<strong>Normal:</strong> the glove pokes and the click lands on the app.',
      'pm.card.2': '<strong>Presentation mode:</strong> the glove pokes and the click goes nowhere.',

      'auto.h2': 'Drive it from anywhere.',
      'auto.lede': 'Tapper answers to <code>tapper://</code> links. Use them from Shortcuts, Raycast, Stream Deck, a script, or a link in your slide notes.',
      'auto.c1': '# Show, hide or toggle the glove',
      'auto.c2': '# Give it a poke, or flip Presentation mode',
      'auto.c3': '# Set everything in one go',
      'auto.note': '<code>set</code> accepts <code>style</code>, <code>mood</code>, <code>color</code> (0 to 7, in the same order as the colour menu: Black, White, Orange, Red, Pink, Purple, Blue, Green) and <code>sound</code>.',

      'inst.h2': 'Install in a minute.',
      'inst.lede': 'Needs macOS 14 (Sonoma) or later. Works on Apple silicon and Intel.',
      'inst.1': `<strong>Download</strong> <a href="${DL}">Tapper.dmg</a> and drag Tapper into Applications.`,
      'inst.2': '<strong>Open it.</strong> Tapper lives in the menu bar. <span class="muted">First launch: if macOS says it can’t verify the developer, right-click → Open.</span>',
      'inst.3': `<strong>Turn the glove on.</strong> On first launch the glove is off. Choose “Show pointer” from the menu-bar icon, or press ${KBD_P}.`,
      'inst.source': 'Source on GitHub',

      'faq.h2': 'Questions, answered.',
      'faq.q1': 'Is it really free?',
      'faq.a1': 'Yes. Tapper is open source under the MIT licence: free to download, use, share and modify. The code is on GitHub.',
      'faq.q2': 'What permissions does it need?',
      'faq.a2': 'Presentation mode needs Accessibility permission, because that is how macOS lets an app stop clicks from reaching other apps. macOS asks the first time you turn it on. If you never use Presentation mode, you never need to grant it.',
      'faq.q3': 'Does it record anything?',
      'faq.a3': 'No. Tapper draws a glove and reacts to your clicks so it can poke. It doesn’t record your screen, your keystrokes or what you click on. It’s open source, so you can read exactly what it does.',
      'faq.q4': 'Will viewers see the glove in screen shares and recordings?',
      'faq.a4': 'Yes. The glove is drawn on screen, so it appears in screen shares and recordings, across all your displays.',
      'faq.q5': 'Which Macs does it run on?',
      'faq.a5': 'Any Mac running macOS 14 or later. It’s a native Swift app and a universal binary, so it runs natively on both Apple silicon and Intel.',

      'final.h2': 'Go on. Give them something to look at.',
      'final.download': 'Download Tapper',
      'final.again': 'Try the demo again',

      'foot.made': 'Made by James · <a href="https://jamesai.dev">jamesai.dev</a>',
      'foot.aria': 'Footer',
      'foot.license': 'MIT License',
      'foot.github': 'GitHub',
    },

    /* ------------------------------------------------------------ 简体中文 */
    'zh-Hans': {
      'meta.title': '敲黑板（Tapper）— 让所有人看清你指哪儿',
      'meta.desc': '敲黑板（Tapper）是一款免费开源的 macOS 菜单栏小工具，把鼠标指针变成挂在长杆上的卡通手套。演示、共享屏幕、做教程都用得上，网页上就能试玩。',
      'meta.og': '一只挂在长杆上的卡通手套，替代你 Mac 上的鼠标指针。免费开源，专为演示和共享屏幕而做。',
      'skip': '跳到正文',
      'brand': '敲黑板',
      'brand.aria': '敲黑板首页',
      'nav.aria': '主导航',
      'nav.features': '功能',
      'nav.shortcuts': '快捷键',
      'nav.faq': '常见问题',
      'nav.github': 'GitHub',
      'nav.download': '下载',
      'lang.aria': '语言',

      'hero.eyebrow': '免费 · 开源 · macOS',
      'hero.h1': '重点，<span class="hl">敲黑板！</span>',
      'hero.lede': '敲黑板（Tapper）把鼠标指针换成一只挂在长杆上、会晃的卡通手套。看你演示、开会或录屏的人，不会再问「你刚才指的是哪儿？」',
      'cta.download': '下载 Mac 版',
      'cta.github': '在 GitHub 上查看',
      'hero.fine': '需要 macOS 14 或更高版本 · 通用二进制（Universal）· MIT 协议',

      'stage.aria': '互动演示：在这张幻灯片上移动鼠标，手套会跟着指针走；点一下，手套就会戳一下。',
      'slide.window': 'Q4 复盘 — 幻灯片',
      'slide.kicker': 'Q4 复盘',
      'slide.title': '注册量翻了一倍，原因在这儿。',
      'slide.b1': '新的新手引导，让流失减少一半',
      'slide.b2': '推荐机制在第 3 周上线',
      'slide.b3': '客服工单数量没变',
      'slide.tag': '就是它！',
      'hint.mouse': '把鼠标移到这里，再点一下',
      'hint.touch': '在幻灯片上点按或拖动',

      'ctl.hand': '手型',
      'ctl.hand.aria': '手型',
      'style.tiny.title': '食指',
      'style.paw.title': '猫爪，带粉色肉垫',
      'style.middle.title': '中指',
      'ctl.mood': '指针脾气',
      'mood.end1': 'Shy finger',
      'mood.end2': 'In your face',
      'mood.1': 'Shy finger（害羞）',
      'mood.2': '客气地指',
      'mood.3': '清楚明了',
      'mood.4': '想看不见都难',
      'mood.5': 'In your face（怼脸）',
      'ctl.color': '杆子颜色',
      'ctl.color.aria': '杆子颜色',
      'color.0': '黑', 'color.1': '白', 'color.2': '橙', 'color.3': '红',
      'color.4': '粉', 'color.5': '紫', 'color.6': '蓝', 'color.7': '绿',
      'ctl.sound': '敲击声',
      'sound.label': '声音：',
      'sound.on': '开',
      'sound.off': '关',

      'video.h2': '真机上的样子。',
      'video.lede': '同样的手套，同样的弹簧，盖在每个窗口、每块屏幕上。',
      'video.aria': 'Tapper 在 macOS 上的录屏：手套跟着指针走，点击时戳一下',

      'feat.h2': '想看不见都难。',
      'feat.lede': '让指针成为屏幕上最显眼的东西。需要的都有，不需要的一个不加。',
      'f1.t': '是手套，不是箭头',
      'f1.p': '每块屏幕上的系统箭头都会隐藏，换成手套跟着指针走。指尖就是你点的位置。',
      'f2.t': '有点脾气的长杆',
      'f2.p': '杆子朝右下方垂着，远端渐渐淡出，像弹簧一样摆动。鼠标动得快，它就会滞后、甩动。',
      'f3.t': '三种手型',
      'f3.p': 'Tiny hand（食指）、Cat paw（猫爪，带粉色肉垫）、Middle child（中指，调皮用）。',
      'f4.t': '点一下，戳一下',
      'f4.p': '每次点击，手套往前一戳，指尖炸开漫画式的冲击线。点得越快，冲击越大，最后变成爆炸星形。',
      'f5.t': '指针脾气',
      'f5.p': '从 Shy finger 到 In your face，共五档。一个滑块同时调大小、杆长和戳的力度。',
      'f6.t': '按你的喜好调',
      'f6.p': '可以换杆子颜色，开关点击动画，也能打开敲击声并调音量。',
      'f7.t': '演示模式',
      'f7.p': '点击只会戳，不会传给下面的应用。键盘照常使用，翻页不受影响。',
      'f8.t': '多块屏幕，录屏也看得见',
      'f8.p': '支持多块屏幕。手套是画在屏幕上的，所以共享屏幕和录屏里都看得到。',
      'f9.t': '能用脚本控制',
      'f9.p': '<code>tapper://</code> 链接可以接入「快捷指令」、Raycast、Stream Deck，或者 shell 脚本。',
      'f10.t': '原生，轻量',
      'f10.p': '用 Swift 写成，是 Universal 通用版（Apple 芯片和 Intel 都能原生运行），需要 macOS 14 或更高版本。',

      'keys.h2': '两个快捷键，够了。',
      'keys.lede': '全局快捷键，不管哪个应用在最前面都能用。',
      'keys.th1': '操作', 'keys.th2': '快捷键', 'keys.th3': '作用',
      'keys.r1.a': '显示 / 隐藏指针',
      'keys.r1.d': '换上或收起手套。原来的箭头马上回来。',
      'keys.r2.a': '演示模式',
      'keys.r2.d': '点击只会戳。放幻灯片很方便。需要「辅助功能」权限。',
      'keys.r3.a': '戳',
      'keys.r3.k': '点击',
      'keys.r3.d': '手套往前一戳，指尖炸开冲击线。点得越快，冲击越大。',

      'pm.h2': '演示时不手滑。',
      'pm.p': '演示到一半，为了强调某处，结果点开了链接？在演示模式下，点击到手套就停了。它会戳、会炸开，但下面的东西不会被点中。',
      'pm.l1': '键盘照常使用，方向键继续翻页。',
      'pm.l2': `在任何地方按 ${KBD_T} 即可开关。`,
      'pm.l3': '第一次使用时，macOS 会请你授予「辅助功能」权限。',
      'pm.card.t': '点击会发生什么',
      'pm.card.1': '<strong>普通模式：</strong>手套戳一下，点击也会落到应用上。',
      'pm.card.2': '<strong>演示模式：</strong>手套戳一下，点击不会传给任何应用。',

      'auto.h2': '随处都能控制。',
      'auto.lede': 'Tapper 能响应 <code>tapper://</code> 链接。可以在「快捷指令」、Raycast、Stream Deck、脚本里用，也能放进幻灯片备注。',
      'auto.c1': '# 显示、隐藏或切换手套',
      'auto.c2': '# 戳一下，或切换演示模式',
      'auto.c3': '# 一次设好所有选项',
      'auto.note': '<code>set</code> 支持 <code>style</code>、<code>mood</code>、<code>color</code>（0 到 7，顺序和颜色菜单一致：黑、白、橙、红、粉、紫、蓝、绿）和 <code>sound</code>。',

      'inst.h2': '一分钟装好。',
      'inst.lede': '需要 macOS 14（Sonoma）或更高版本，Apple 芯片和 Intel 都能用。',
      'inst.1': `<strong>下载</strong> <a href="${DL}">Tapper.dmg</a>，把 Tapper 拖进「应用程序」。`,
      'inst.2': '<strong>打开它。</strong>Tapper 在菜单栏里运行。 <span class="muted">第一次打开时，如果 macOS 提示无法验证开发者，在「应用程序」里右键 Tapper → 打开。</span>',
      'inst.3': `<strong>把手套打开。</strong>首次启动时手套是关着的。在菜单栏图标里选「Show pointer」，或按 ${KBD_P}。`,
      'inst.source': 'GitHub 源码',

      'faq.h2': '常见问题',
      'faq.q1': '真的免费吗？',
      'faq.a1': '真的。Tapper 以 MIT 协议开源，可以免费下载、使用、分享和修改。代码在 GitHub 上。',
      'faq.q2': '需要什么权限？',
      'faq.a2': '只有演示模式需要「辅助功能」权限，因为 macOS 要求有这个权限，应用才能拦下点击、不让它传给别的应用。第一次打开演示模式时 macOS 会询问。不用演示模式，就不需要授权。',
      'faq.q3': '会记录什么吗？',
      'faq.a3': '不会。Tapper 只是画一只手套，并在你点击时戳一下。它不录你的屏幕，不记你的键盘输入，也不记你点了什么。它是开源的，具体做了什么，可以直接看代码。',
      'faq.q4': '共享屏幕和录屏时，别人看得到手套吗？',
      'faq.a4': '看得到。手套是画在屏幕上的，所以共享屏幕和录屏里都会出现，多块屏幕也一样。',
      'faq.q5': '哪些 Mac 能用？',
      'faq.a5': '只要是 macOS 14 或更高版本的 Mac 就行。它是原生 Swift 应用，也是通用二进制，Apple 芯片和 Intel 都能原生运行。',

      'final.h2': '来吧，给他们一个看点。',
      'final.download': '下载敲黑板',
      'final.again': '再试一次',

      'foot.made': '作者：James · <a href="https://jamesai.dev">jamesai.dev</a>',
      'foot.aria': '页脚',
      'foot.license': 'MIT 协议',
      'foot.github': 'GitHub',
    },

    /* ------------------------------------------------------------ 繁體中文（台灣） */
    'zh-Hant': {
      'meta.title': '敲黑板（Tapper）— 讓大家看清楚你指哪裡',
      'meta.desc': '敲黑板（Tapper）是一款免費開源的 macOS 選單列小工具，把滑鼠游標變成掛在長桿上的卡通手套。簡報、分享螢幕、錄教學都用得上，網頁上就能試玩。',
      'meta.og': '一隻掛在長桿上的卡通手套，取代你 Mac 上的滑鼠游標。免費開源，專為簡報和分享螢幕而做。',
      'skip': '跳到內文',
      'brand': '敲黑板',
      'brand.aria': '敲黑板首頁',
      'nav.aria': '主選單',
      'nav.features': '功能',
      'nav.shortcuts': '快速鍵',
      'nav.faq': '常見問題',
      'nav.github': 'GitHub',
      'nav.download': '下載',
      'lang.aria': '語言',

      'hero.eyebrow': '免費 · 開源 · macOS',
      'hero.h1': '重點，<span class="hl">敲黑板！</span>',
      'hero.lede': '敲黑板（Tapper）把滑鼠游標換成一隻掛在長桿上、會晃的卡通手套。看你簡報、開會或錄影的人，不會再問「你剛才指的是哪裡？」',
      'cta.download': '下載 Mac 版',
      'cta.github': '在 GitHub 上查看',
      'hero.fine': '需要 macOS 14 或更新版本 · 通用二進位（Universal）· MIT 授權',

      'stage.aria': '互動示範：在這張投影片上移動滑鼠，手套會跟著游標走；點一下，手套就會戳一下。',
      'slide.window': 'Q4 檢討 — 投影片',
      'slide.kicker': 'Q4 檢討',
      'slide.title': '註冊數翻了一倍，原因在這裡。',
      'slide.b1': '新的新手引導，讓流失減少一半',
      'slide.b2': '推薦機制在第 3 週上線',
      'slide.b3': '客服單數量沒有變',
      'slide.tag': '就是它！',
      'hint.mouse': '把滑鼠移到這裡，再點一下',
      'hint.touch': '在投影片上點一下或拖曳',

      'ctl.hand': '手型',
      'ctl.hand.aria': '手型',
      'style.tiny.title': '食指',
      'style.paw.title': '貓爪，帶粉紅肉球',
      'style.middle.title': '中指',
      'ctl.mood': '游標脾氣',
      'mood.end1': 'Shy finger',
      'mood.end2': 'In your face',
      'mood.1': 'Shy finger（害羞）',
      'mood.2': '客氣地指',
      'mood.3': '清楚明瞭',
      'mood.4': '想看不到都難',
      'mood.5': 'In your face（貼臉）',
      'ctl.color': '桿子顏色',
      'ctl.color.aria': '桿子顏色',
      'color.0': '黑', 'color.1': '白', 'color.2': '橘', 'color.3': '紅',
      'color.4': '粉紅', 'color.5': '紫', 'color.6': '藍', 'color.7': '綠',
      'ctl.sound': '敲擊聲',
      'sound.label': '聲音：',
      'sound.on': '開',
      'sound.off': '關',

      'video.h2': '真機上的樣子。',
      'video.lede': '一樣的手套，一樣的彈簧，蓋在每個視窗、每個螢幕上。',
      'video.aria': 'Tapper 在 macOS 上的螢幕錄影：手套跟著游標走，點擊時戳一下',

      'feat.h2': '想看不到都難。',
      'feat.lede': '讓游標成為螢幕上最顯眼的東西。需要的都有，不需要的一個不加。',
      'f1.t': '是手套，不是箭頭',
      'f1.p': '每個螢幕上的系統箭頭都會隱藏，換成手套跟著游標走。指尖就是你點的位置。',
      'f2.t': '有點脾氣的長桿',
      'f2.p': '桿子朝右下方垂著，遠端漸漸淡出，像彈簧一樣擺動。滑鼠動得快，它就會落後、甩動。',
      'f3.t': '三種手型',
      'f3.p': 'Tiny hand（食指）、Cat paw（貓爪，帶粉紅肉球）、Middle child（中指，調皮用）。',
      'f4.t': '點一下，戳一下',
      'f4.p': '每次點擊，手套往前一戳，指尖炸開漫畫風的衝擊線。點得越快，衝擊越大，最後變成爆炸星形。',
      'f5.t': '游標脾氣',
      'f5.p': '從 Shy finger 到 In your face，共五段。一個滑桿同時調整大小、桿長和戳的力道。',
      'f6.t': '照你的喜好調',
      'f6.p': '可以換桿子顏色，開關點擊動畫，也能開啟敲擊聲並調整音量。',
      'f7.t': '簡報模式',
      'f7.p': '點擊只會戳，不會傳給下面的 App。鍵盤照常使用，翻頁不受影響。',
      'f8.t': '多螢幕，錄影也看得到',
      'f8.p': '支援多個螢幕。手套是畫在螢幕上的，所以分享螢幕和錄影裡都看得到。',
      'f9.t': '可以用腳本控制',
      'f9.p': '<code>tapper://</code> 連結可以接上「捷徑」、Raycast、Stream Deck，或是 shell 腳本。',
      'f10.t': '原生，輕巧',
      'f10.p': '用 Swift 寫成，是 Universal 通用版（Apple 晶片和 Intel 都能原生執行），需要 macOS 14 或更新版本。',

      'keys.h2': '兩個快速鍵，夠了。',
      'keys.lede': '全域快速鍵，不管哪個 App 在最前面都能用。',
      'keys.th1': '操作', 'keys.th2': '快速鍵', 'keys.th3': '作用',
      'keys.r1.a': '顯示 / 隱藏游標',
      'keys.r1.d': '換上或收起手套。原本的箭頭馬上回來。',
      'keys.r2.a': '簡報模式',
      'keys.r2.d': '點擊只會戳。播投影片很方便。需要「輔助使用」權限。',
      'keys.r3.a': '戳',
      'keys.r3.k': '點擊',
      'keys.r3.d': '手套往前一戳，指尖炸開衝擊線。點得越快，衝擊越大。',

      'pm.h2': '簡報時不手滑。',
      'pm.p': '簡報到一半，為了強調某處，結果點開了連結？在簡報模式下，點擊碰到手套就停了。它會戳、會炸開，但下面的東西不會被點到。',
      'pm.l1': '鍵盤照常使用，方向鍵繼續翻頁。',
      'pm.l2': `在任何地方按 ${KBD_T} 即可開關。`,
      'pm.l3': '第一次使用時，macOS 會請你授予「輔助使用」權限。',
      'pm.card.t': '點擊會發生什麼事',
      'pm.card.1': '<strong>一般模式：</strong>手套戳一下，點擊也會落到 App 上。',
      'pm.card.2': '<strong>簡報模式：</strong>手套戳一下，點擊不會傳給任何 App。',

      'auto.h2': '隨處都能控制。',
      'auto.lede': 'Tapper 能回應 <code>tapper://</code> 連結。可以在「捷徑」、Raycast、Stream Deck、腳本裡使用，也能放進投影片備忘稿。',
      'auto.c1': '# 顯示、隱藏或切換手套',
      'auto.c2': '# 戳一下，或切換簡報模式',
      'auto.c3': '# 一次設好所有選項',
      'auto.note': '<code>set</code> 支援 <code>style</code>、<code>mood</code>、<code>color</code>（0 到 7，順序和顏色選單一致：黑、白、橘、紅、粉紅、紫、藍、綠）和 <code>sound</code>。',

      'inst.h2': '一分鐘裝好。',
      'inst.lede': '需要 macOS 14（Sonoma）或更新版本，Apple 晶片和 Intel 都能用。',
      'inst.1': `<strong>下載</strong> <a href="${DL}">Tapper.dmg</a>，把 Tapper 拖進「應用程式」。`,
      'inst.2': '<strong>打開它。</strong>Tapper 在選單列裡執行。 <span class="muted">第一次開啟時，如果 macOS 提示無法驗證開發者，在「應用程式」裡按右鍵 Tapper → 打開。</span>',
      'inst.3': `<strong>把手套打開。</strong>首次啟動時手套是關著的。在選單列圖示裡選「Show pointer」，或按 ${KBD_P}。`,
      'inst.source': 'GitHub 原始碼',

      'faq.h2': '常見問題',
      'faq.q1': '真的免費嗎？',
      'faq.a1': '真的。Tapper 以 MIT 授權開源，可以免費下載、使用、分享和修改。程式碼在 GitHub 上。',
      'faq.q2': '需要什麼權限？',
      'faq.a2': '只有簡報模式需要「輔助使用」權限，因為 macOS 要有這個權限，App 才能攔下點擊、不讓它傳給別的 App。第一次開啟簡報模式時 macOS 會詢問。不用簡報模式，就不需要授權。',
      'faq.q3': '會記錄什麼嗎？',
      'faq.a3': '不會。Tapper 只是畫一隻手套，並在你點擊時戳一下。它不錄你的螢幕，不記你的鍵盤輸入，也不記你點了什麼。它是開源的，實際做了什麼，可以直接看原始碼。',
      'faq.q4': '分享螢幕和錄影時，別人看得到手套嗎？',
      'faq.a4': '看得到。手套是畫在螢幕上的，所以分享螢幕和錄影裡都會出現，多個螢幕也一樣。',
      'faq.q5': '哪些 Mac 能用？',
      'faq.a5': '只要是 macOS 14 或更新版本的 Mac 就行。它是原生 Swift App，也是通用二進位，Apple 晶片和 Intel 都能原生執行。',

      'final.h2': '來吧，給他們一個看點。',
      'final.download': '下載敲黑板',
      'final.again': '再試一次',

      'foot.made': '作者：James · <a href="https://jamesai.dev">jamesai.dev</a>',
      'foot.aria': '頁尾',
      'foot.license': 'MIT 授權',
      'foot.github': 'GitHub',
    },
  };

  // ---- Language detection ----------------------------------------------------------------------
  function normalise(code) {
    if (!code) return null;
    const c = String(code).toLowerCase().replace('_', '-');
    if (c === 'en' || c.startsWith('en-')) return 'en';
    if (c.startsWith('zh')) {
      // zh-TW / zh-HK / zh-MO / zh-Hant* => Traditional; any other zh => Simplified.
      return /^zh-(tw|hk|mo|hant)/.test(c) ? 'zh-Hant' : 'zh-Hans';
    }
    return null;
  }
  function stored() { try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; } }
  function store(lang) { try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* private mode etc. */ } }

  function detect() {
    let q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { /* ignore */ }
    const fromQuery = normalise(q);
    if (fromQuery) return { lang: fromQuery, fromUser: true };
    const fromStore = LANGS.includes(stored()) ? stored() : null;
    if (fromStore) return { lang: fromStore, fromUser: false };
    for (const l of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language])) {
      const n = normalise(l);
      if (n) return { lang: n, fromUser: false };
    }
    return { lang: 'en', fromUser: false };
  }

  // ---- Applying a language -----------------------------------------------------------------------
  let current = 'en';
  const t = key => {
    const v = DICT[current][key];
    return v !== undefined ? v : (DICT.en[key] !== undefined ? DICT.en[key] : key);
  };

  function setMeta(sel, value) {
    const e = document.querySelector(sel);
    if (e) e.setAttribute('content', value);
  }

  function apply(lang) {
    current = lang;
    const root = document.documentElement;
    root.lang = lang;
    document.title = t('meta.title');
    setMeta('meta[name="description"]', t('meta.desc'));
    setMeta('meta[property="og:title"]', t('meta.title'));
    setMeta('meta[property="og:description"]', t('meta.og'));
    setMeta('meta[name="twitter:title"]', t('meta.title'));
    setMeta('meta[name="twitter:description"]', t('meta.og'));

    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-attr]').forEach(e => {
      e.dataset.i18nAttr.split(';').forEach(pair => {
        const i = pair.indexOf(':');
        if (i > 0) e.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
      });
    });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.dispatchEvent(new CustomEvent('tapperlang', { detail: { lang } }));
  }

  function set(lang, persist) {
    if (!LANGS.includes(lang)) return;
    if (persist !== false) store(lang);
    apply(lang);
  }

  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => set(b.dataset.lang)));

  window.TapperI18n = { t, set: l => set(l, false), get: () => current, LANGS, DICT };

  const d = detect();
  apply(d.lang);                      // detection alone is not persisted; only an explicit click or ?lang= is
  if (d.fromUser) store(d.lang);
})();
