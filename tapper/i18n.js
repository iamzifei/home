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
      'nav.faq': 'FAQ',
      'nav.github': 'GitHub',
      'nav.download': 'Download',
      'lang.aria': 'Language',

      'hero.h1': 'Point like <span class="hl">you mean it.</span>',
      'hero.lede': 'Tapper swaps your pointer for a cartoon glove on a long, wobbly stick. Nobody watching your demo, call or recording will ever ask “wait, where are you pointing?” again.',
      'cta.github': 'View on GitHub',
      'hero.fine': 'Free forever · MIT open source · macOS 14 or later',

      'stage.aria': 'Interactive demo: inside this area your pointer becomes the Tapper glove. Click to poke.',
      'hint.mouse': 'Psst: up here, your pointer is a glove. Click to poke.',
      'hint.touch': 'Tap anywhere up here to poke.',

      'ctl.hand': 'Hand',
      'ctl.hand.aria': 'Hand style',
      'style.tiny.title': 'Pointing index finger',
      'style.paw.title': 'Cat paw with pink beans',
      'style.middle.title': 'Cheeky middle finger',
      'ctl.mood': 'Pointer mood',
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

      'video.aria': 'Screen recording of Tapper on macOS: the glove follows the pointer and pokes on click',

      'feat.h2': 'Impossible to miss. On purpose.',
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
      'f7.t': 'Presentation mode',
      'f7.p': 'Clicks only poke, they never reach the app underneath. The keyboard keeps working, so slides advance as usual.',
      'f8.t': 'Multi-display, recording-ready',
      'f8.p': 'Works across every display and shows up in screen shares and recordings, because it’s drawn on screen.',
      'f9.t': 'Scriptable',
      'f9.p': 'A <code>tapper://</code> URL scheme lets Shortcuts, Raycast, Stream Deck or a shell script drive it.',

      'faq.h2': 'FAQ',
      'faq.q1': 'Is it really free?',
      'faq.a1': 'Yes. Tapper is open source under the MIT licence: free to download, use, share and modify. The code is on GitHub.',
      'faq.q2': 'What permissions does it need?',
      'faq.a2': 'Presentation mode needs Accessibility permission, because that is how macOS lets an app stop clicks from reaching other apps. macOS asks the first time you turn it on. If you never use Presentation mode, you never need to grant it.',
      'faq.q3': 'Does it record anything?',
      'faq.a3': 'No. Tapper draws a glove and reacts to your clicks so it can poke. It doesn’t record your screen, your keystrokes or what you click on. It’s open source, so you can read exactly what it does.',
      'faq.q4': 'Will viewers see the glove in screen shares and recordings?',
      'faq.a4': 'Yes, when you share or record your whole screen. The glove is drawn on screen, so it appears there across all your displays. If you share a single window, the glove sits above that window and is not part of it.',
      'faq.q5': 'Which Macs does it run on?',
      'faq.a5': 'Any Mac running macOS 14 or later. It’s a native Swift app and a universal binary, so it runs natively on both Apple silicon and Intel.',

      'final.h2': 'Go on. Give them something to look at.',
      'final.download': 'Download Tapper',
      'final.again': 'Try the demo again',

      'foot.made': 'Made by James · <a href="https://jamesai.dev">jamesai.dev</a>',
      'foot.aria': 'Footer',
      'foot.license': 'MIT License',
      'foot.github': 'GitHub',
      'sib.h2': 'More Mac apps by James',
      'sib.candela.d': 'Every display control macOS hides',
      'sib.clipstack.d': 'Clipboard history in the menu bar',
      'sib.audioswitch.d': 'Audio device switching from the menu bar',
      'sib.inkstone.d': 'Notes that stay your own files',
      'sib.veil.d': 'Keeps the window you\'re working in sharp and softly blurs everything behind it. Free, MIT.',
      'foot.sib': 'More Mac apps by James',

      'cta.free': 'Download for Mac — free',
      'dock.aria': 'Glove settings',
      'demo.tag': 'Quick demo',
      'demo.cap': 'Recorded from the real app on a Mac: three hands, a few colours, and what fast clicking does.',
      'where.h2': 'Zoom, Meet, Teams, OBS, whatever.<br>They’ll all see it*',
      'where.note': '*when you share or record your whole screen',
      'where.share': 'Sharing screen',
      'where.l1': 'Slides',
      'where.l2': 'Spreadsheets',
      'where.l3': 'Code reviews',
      'where.l4': 'Whiteboards',
      'where.a1': 'The cat-paw glove on an orange stick pokes the tallest bar of a chart in a slide deck',
      'where.a2': 'The pointing glove on a blue stick pokes a +38% cell in a spreadsheet',
      'where.a3': 'The middle-finger glove on a purple stick pokes a highlighted line of code',
      'where.a4': 'The cat-paw glove on a pink stick pokes a sticky note that says Ship on Friday',
      'fk.t': 'Hotkey ready',
      'fk.p': 'Show or hide the glove from any app. Your normal arrow comes straight back.',
      'faq.q6': 'How do I install it?',
      'faq.a6': `<li><strong>Download</strong> <a href="${DL}">Tapper.dmg</a> and drag Tapper into Applications.</li><li><strong>Open it.</strong> Tapper lives in the menu bar. It is signed with a Developer ID and notarized by Apple.</li><li><strong>Turn the glove on.</strong> On first launch the glove is off. Choose “Show pointer” from the menu-bar icon, or press ${KBD_P}.</li>`,
      'faq.q7': 'Can I control it from a script?',
      'faq.a7': 'Yes. Tapper answers to <code>tapper://</code> links, so Shortcuts, Raycast, Stream Deck, a shell script or a link in your slide notes can drive it.',
      'faq.a7b': '<code>set</code> accepts <code>style</code> (tiny, paw, middle), <code>mood</code> (0 to 4), <code>color</code> (0 to 7, in the order of the colour menu: Black, White, Orange, Red, Pink, Purple, Blue, Green), <code>sound</code> and <code>animate</code>.',
      'faq.q8': 'Can I still click normally?',
      'faq.a8': `Yes. Only the look changes: clicks, drags and selections land exactly where the fingertip is. If you want clicks to only poke, turn on Presentation mode with ${KBD_T}.`,
      'note.p': 'Free and open source, for real. No account, no tracking, no paid tier. The whole app is MIT-licensed <a href="https://github.com/iamzifei/tapper">on GitHub</a>.',
      'foot.releases': 'Release notes',
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
      'nav.faq': '常见问题',
      'nav.github': 'GitHub',
      'nav.download': '下载',
      'lang.aria': '语言',

      'hero.h1': '重点，<span class="hl">敲黑板！</span>',
      'hero.lede': '敲黑板（Tapper）把鼠标指针换成一只挂在长杆上、会晃的卡通手套。看你演示、开会或录屏的人，不会再问「你刚才指的是哪儿？」',
      'cta.github': '在 GitHub 上查看',
      'hero.fine': '永久免费 · MIT 开源 · 需要 macOS 14 或更高版本',

      'stage.aria': '互动演示：在这块区域里，你的鼠标指针会变成敲黑板的手套。点一下，手套就戳一下。',
      'hint.mouse': '悄悄说：在这一块，你的指针已经变成手套了。点一下试试。',
      'hint.touch': '在这一块随便点一下，看它戳。',

      'ctl.hand': '手型',
      'ctl.hand.aria': '手型',
      'style.tiny.title': '食指',
      'style.paw.title': '猫爪，带粉色肉垫',
      'style.middle.title': '中指',
      'ctl.mood': '指针脾气',
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

      'video.aria': 'Tapper 在 macOS 上的录屏：手套跟着指针走，点击时戳一下',

      'feat.h2': '想看不见都难。',
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
      'f7.t': '演示模式',
      'f7.p': '点击只会戳，不会传给下面的应用。键盘照常使用，翻页不受影响。',
      'f8.t': '多块屏幕，录屏也看得见',
      'f8.p': '支持多块屏幕。手套是画在屏幕上的，所以共享屏幕和录屏里都看得到。',
      'f9.t': '能用脚本控制',
      'f9.p': '<code>tapper://</code> 链接可以接入「快捷指令」、Raycast、Stream Deck，或者 shell 脚本。',

      'faq.h2': '常见问题',
      'faq.q1': '真的免费吗？',
      'faq.a1': '真的。Tapper 以 MIT 协议开源，可以免费下载、使用、分享和修改。代码在 GitHub 上。',
      'faq.q2': '需要什么权限？',
      'faq.a2': '只有演示模式需要「辅助功能」权限，因为 macOS 要求有这个权限，应用才能拦下点击、不让它传给别的应用。第一次打开演示模式时 macOS 会询问。不用演示模式，就不需要授权。',
      'faq.q3': '会记录什么吗？',
      'faq.a3': '不会。Tapper 只是画一只手套，并在你点击时戳一下。它不录你的屏幕，不记你的键盘输入，也不记你点了什么。它是开源的，具体做了什么，可以直接看代码。',
      'faq.q4': '共享屏幕和录屏时，别人看得到手套吗？',
      'faq.a4': '看得到，前提是共享或录制整个屏幕。手套是画在屏幕上的，所以多块屏幕都会出现。如果只共享某一个窗口，手套浮在那个窗口上面，不算窗口的一部分，对方就看不到。',
      'faq.q5': '哪些 Mac 能用？',
      'faq.a5': '只要是 macOS 14 或更高版本的 Mac 就行。它是原生 Swift 应用，也是通用二进制，Apple 芯片和 Intel 都能原生运行。',

      'final.h2': '来吧，给他们一个看点。',
      'final.download': '下载敲黑板',
      'final.again': '再试一次',

      'foot.made': '作者：James · <a href="https://jamesai.dev">jamesai.dev</a>',
      'foot.aria': '页脚',
      'foot.license': 'MIT 协议',
      'foot.github': 'GitHub',
      'sib.h2': 'James 的其他 Mac 应用',
      'sib.candela.d': 'macOS 藏起来的显示器控制',
      'sib.clipstack.d': '菜单栏剪贴板历史',
      'sib.audioswitch.d': '菜单栏音频设备切换',
      'sib.inkstone.d': '笔记就是你自己的文件',
      'sib.veil.d': '正在用的窗口保持清晰，后面的一切柔和地模糊掉。免费，MIT 开源。',
      'foot.sib': 'James 的其他 Mac 应用',

      'cta.free': '免费下载 Mac 版',
      'dock.aria': '手套设置',
      'demo.tag': '快速演示',
      'demo.cap': '在真实 Mac 上用真 App 录的：三种手型、几种颜色，还有连点会发生什么。',
      'where.h2': '腾讯会议、Zoom、Teams、OBS，随便哪个。<br>大家都看得见*',
      'where.note': '*共享或录制整个屏幕时',
      'where.share': '正在共享屏幕',
      'where.l1': '幻灯片',
      'where.l2': '表格',
      'where.l3': '代码评审',
      'where.l4': '白板',
      'where.a1': '橙色长杆上的猫爪手套，戳着幻灯片里柱状图最高的那根柱子',
      'where.a2': '蓝色长杆上的食指手套，戳着表格里 +38% 那一格',
      'where.a3': '紫色长杆上的中指手套，戳着一行高亮的代码',
      'where.a4': '粉色长杆上的猫爪手套，戳着写着 Ship on Friday 的便利贴',
      'fk.t': '快捷键随叫随到',
      'fk.p': '在任何应用里都能显示或收起手套。原来的箭头马上回来。',
      'faq.q6': '怎么安装？',
      'faq.a6': `<li><strong>下载</strong> <a href="${DL}">Tapper.dmg</a>，把 Tapper 拖进「应用程序」。</li><li><strong>打开它。</strong>Tapper 在菜单栏里运行，已用 Developer ID 签名并通过 Apple 公证。</li><li><strong>把手套打开。</strong>首次启动时手套是关着的。在菜单栏图标里选「Show pointer」，或按 ${KBD_P}。</li>`,
      'faq.q7': '能用脚本控制吗？',
      'faq.a7': '能。Tapper 能响应 <code>tapper://</code> 链接，「快捷指令」、Raycast、Stream Deck、shell 脚本，或者幻灯片备注里的一个链接，都能控制它。',
      'faq.a7b': '<code>set</code> 支持 <code>style</code>（tiny、paw、middle）、<code>mood</code>（0 到 4）、<code>color</code>（0 到 7，顺序和颜色菜单一致：黑、白、橙、红、粉、紫、蓝、绿）、<code>sound</code> 和 <code>animate</code>。',
      'faq.q8': '还能正常点击吗？',
      'faq.a8': `能。变的只是样子：点击、拖动、选中都落在指尖的位置。如果想让点击只戳、不点中东西，按 ${KBD_T} 打开演示模式。`,
      'note.p': '真的免费，真的开源。不用注册，不做追踪，没有付费版。整个 App 都以 MIT 协议开源在 <a href="https://github.com/iamzifei/tapper">GitHub</a> 上。',
      'foot.releases': '更新日志',
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
      'nav.faq': '常見問題',
      'nav.github': 'GitHub',
      'nav.download': '下載',
      'lang.aria': '語言',

      'hero.h1': '重點，<span class="hl">敲黑板！</span>',
      'hero.lede': '敲黑板（Tapper）把滑鼠游標換成一隻掛在長桿上、會晃的卡通手套。看你簡報、開會或錄影的人，不會再問「你剛才指的是哪裡？」',
      'cta.github': '在 GitHub 上查看',
      'hero.fine': '永久免費 · MIT 開源 · 需要 macOS 14 或更新版本',

      'stage.aria': '互動示範：在這塊區域裡，你的滑鼠游標會變成敲黑板的手套。點一下，手套就戳一下。',
      'hint.mouse': '偷偷說：在這一塊，你的游標已經變成手套了。點一下試試。',
      'hint.touch': '在這一塊隨便點一下，看它戳。',

      'ctl.hand': '手型',
      'ctl.hand.aria': '手型',
      'style.tiny.title': '食指',
      'style.paw.title': '貓爪，帶粉紅肉球',
      'style.middle.title': '中指',
      'ctl.mood': '游標脾氣',
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

      'video.aria': 'Tapper 在 macOS 上的螢幕錄影：手套跟著游標走，點擊時戳一下',

      'feat.h2': '想看不到都難。',
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
      'f7.t': '簡報模式',
      'f7.p': '點擊只會戳，不會傳給下面的 App。鍵盤照常使用，翻頁不受影響。',
      'f8.t': '多螢幕，錄影也看得到',
      'f8.p': '支援多個螢幕。手套是畫在螢幕上的，所以分享螢幕和錄影裡都看得到。',
      'f9.t': '可以用腳本控制',
      'f9.p': '<code>tapper://</code> 連結可以接上「捷徑」、Raycast、Stream Deck，或是 shell 腳本。',

      'faq.h2': '常見問題',
      'faq.q1': '真的免費嗎？',
      'faq.a1': '真的。Tapper 以 MIT 授權開源，可以免費下載、使用、分享和修改。程式碼在 GitHub 上。',
      'faq.q2': '需要什麼權限？',
      'faq.a2': '只有簡報模式需要「輔助使用」權限，因為 macOS 要有這個權限，App 才能攔下點擊、不讓它傳給別的 App。第一次開啟簡報模式時 macOS 會詢問。不用簡報模式，就不需要授權。',
      'faq.q3': '會記錄什麼嗎？',
      'faq.a3': '不會。Tapper 只是畫一隻手套，並在你點擊時戳一下。它不錄你的螢幕，不記你的鍵盤輸入，也不記你點了什麼。它是開源的，實際做了什麼，可以直接看原始碼。',
      'faq.q4': '分享螢幕和錄影時，別人看得到手套嗎？',
      'faq.a4': '看得到，前提是分享或錄製整個螢幕。手套是畫在螢幕上的，所以每個螢幕都會出現。如果只分享某一個視窗，手套浮在那個視窗上面，不算視窗的一部分，對方就看不到。',
      'faq.q5': '哪些 Mac 能用？',
      'faq.a5': '只要是 macOS 14 或更新版本的 Mac 就行。它是原生 Swift App，也是通用二進位，Apple 晶片和 Intel 都能原生執行。',

      'final.h2': '來吧，給他們一個看點。',
      'final.download': '下載敲黑板',
      'final.again': '再試一次',

      'foot.made': '作者：James · <a href="https://jamesai.dev">jamesai.dev</a>',
      'foot.aria': '頁尾',
      'foot.license': 'MIT 授權',
      'foot.github': 'GitHub',
      'sib.h2': 'James 的其他 Mac 應用',
      'sib.candela.d': 'macOS 藏起來的顯示器控制',
      'sib.clipstack.d': '選單欄剪貼簿歷史',
      'sib.audioswitch.d': '選單欄音訊裝置切換',
      'sib.inkstone.d': '筆記就是你自己的檔案',
      'sib.veil.d': '正在用的視窗保持清晰，後面的一切柔和地模糊掉。免費，MIT 開源。',
      'foot.sib': 'James 的其他 Mac 應用',

      'cta.free': '免費下載 Mac 版',
      'dock.aria': '手套設定',
      'demo.tag': '快速示範',
      'demo.cap': '在真的 Mac 上用真的 App 錄的：三種手型、幾種顏色，還有連點會發生什麼事。',
      'where.h2': 'Zoom、Google Meet、Teams、OBS，隨便哪個。<br>大家都看得到*',
      'where.note': '*分享或錄製整個螢幕時',
      'where.share': '正在分享螢幕',
      'where.l1': '投影片',
      'where.l2': '試算表',
      'where.l3': '程式碼審查',
      'where.l4': '白板',
      'where.a1': '橘色長桿上的貓爪手套，戳著投影片裡長條圖最高的那一根',
      'where.a2': '藍色長桿上的食指手套，戳著試算表裡 +38% 那一格',
      'where.a3': '紫色長桿上的中指手套，戳著一行醒目標示的程式碼',
      'where.a4': '粉紅長桿上的貓爪手套，戳著寫著 Ship on Friday 的便利貼',
      'fk.t': '快速鍵隨叫隨到',
      'fk.p': '在任何 App 裡都能顯示或收起手套。原本的箭頭馬上回來。',
      'faq.q6': '怎麼安裝？',
      'faq.a6': `<li><strong>下載</strong> <a href="${DL}">Tapper.dmg</a>，把 Tapper 拖進「應用程式」。</li><li><strong>打開它。</strong>Tapper 在選單列裡執行，已用 Developer ID 簽署並通過 Apple 公證。</li><li><strong>把手套打開。</strong>首次啟動時手套是關著的。在選單列圖示裡選「Show pointer」，或按 ${KBD_P}。</li>`,
      'faq.q7': '可以用腳本控制嗎？',
      'faq.a7': '可以。Tapper 能回應 <code>tapper://</code> 連結，「捷徑」、Raycast、Stream Deck、shell 腳本，或是投影片備忘稿裡的一個連結，都能控制它。',
      'faq.a7b': '<code>set</code> 支援 <code>style</code>（tiny、paw、middle）、<code>mood</code>（0 到 4）、<code>color</code>（0 到 7，順序和顏色選單一致：黑、白、橘、紅、粉紅、紫、藍、綠）、<code>sound</code> 和 <code>animate</code>。',
      'faq.q8': '還能正常點擊嗎？',
      'faq.a8': `可以。變的只是樣子：點擊、拖曳、選取都落在指尖的位置。如果想讓點擊只戳、不點到東西，按 ${KBD_T} 開啟簡報模式。`,
      'note.p': '真的免費，真的開源。不用註冊，不做追蹤，沒有付費版。整個 App 都以 MIT 授權開源在 <a href="https://github.com/iamzifei/tapper">GitHub</a> 上。',
      'foot.releases': '更新紀錄',
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
