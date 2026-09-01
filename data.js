// Project catalogue. Star counts here are a fallback — index.html refreshes
// them from the GitHub API on load with a single request for the whole account.
//
// `zh-Hant` (2026-09-02): script conversion of `zh`, not a separate piece of
// writing. OpenCC s2twp for the characters and the Taiwan vocabulary, then a
// fixed correction table for the places its phrase table mis-fires on
// interface words — 发布 became 釋出 (that is releasing software, not
// publishing an article), 呼出 became 撥出 (dialling a phone), 局部 became
// 區域性, 类型 became 型別, and 直发 became 直髮, which is hair. The
// generator and the full list of corrections are in
// tools/hant.py. The pun 「在悉尼和稀泥」 is held out of the conversion
// because 雪梨 would kill it; the city everywhere else is 雪梨, to agree with
// the human-written zh-Hant in i18n.js.
//
// NOT read by a native Traditional reader. It is strictly better than what it
// replaced — Traditional readers were being served Simplified — but say so
// before treating it as reviewed.
const CATEGORIES = [
  {
    id: "apps",
    title: { zh: "macOS 应用", "zh-Hant": "macOS 應用", en: "macOS Apps" },
    note: {
      zh: "原生 Swift，Apple Silicon，零第三方依赖。", "zh-Hant": "原生 Swift，Apple Silicon，零第三方依賴。",
      en: "Native Swift, Apple Silicon, no third-party dependencies.",
    },
    featured: true,
    items: [
      {
        repo: "inkstone",
        site: "https://inkslab.app",
        name: "Inkstone",
        stars: 4,
        shot: "assets/shot-inkstone.webp",
        /* There are .mp4 and .webm siblings of `shot`, and its .webp is
           frame 0 of them — see tools/app-motion.py. */
        motion: true,
        /* The homepage row gets ONE picture; the rest are the detail page. */
        shots: [
          { src: "assets/ink-editor.webp",
            cap: { zh: "一篇笔记就是一个 .md 文件。中英混排按 W3C《中文排版需求》排，表格、行内链接、frontmatter 全是纯文本。", "zh-Hant": "一篇筆記就是一個 .md 檔案。中英混排按 W3C《中文排版需求》排，表格、行內連結、frontmatter 全是純文字。",
                   en: "One note is one .md file. Mixed CJK-Latin text is set the way the W3C layout requirements ask for; the table, the links and the frontmatter are all just text." } },
          { src: "assets/ink-graph.webp",
            cap: { zh: "关系图谱是确定性的：节点是文件，边是双链。同一批文件，永远算出同一张图。", "zh-Hant": "關係圖譜是確定性的：節點是檔案，邊是雙鏈。同一批檔案，永遠算出同一張圖。",
                   en: "The graph is deterministic: nodes are files, edges are wikilinks. The same folder always produces the same graph." } },
          { src: "assets/ink-daily.webp",
            cap: { zh: "日记、待办、双链在同一个文件里。右栏实时给出大纲、反向链接和局部图谱。", "zh-Hant": "日記、待辦、雙鏈在同一個檔案裡。右欄即時給出大綱、反向連結和局部圖譜。",
                   en: "Daily note, tasks and links in one file, with the outline, backlinks and local graph kept live beside it." } },
          { src: "assets/ink-inspector.webp",
            cap: { zh: "右栏：属性、标签、大纲、反向链接、出链、局部图谱——不用离开正文。", "zh-Hant": "右欄：屬性、標籤、大綱、反向連結、出鏈、局部圖譜——不用離開正文。",
                   en: "The inspector: properties, tags, outline, backlinks, outgoing links and a local graph, without leaving the text." } },
        ],
        tagline: {
          zh: "笔记就是你自己的文件", "zh-Hant": "筆記就是你自己的檔案",
          en: "Notes that stay your own files",
        },
        desc: {
          zh: "纯 Markdown，存在你自己选的文件夹里，没有数据库也没有导入。双链、反向链接、关系图谱、白板、日记，中英文混排按标准排版。可走 iCloud 或 GitHub 同步。macOS 与 iOS，原生 SwiftUI。", "zh-Hant": "純 Markdown，存在你自己選的資料夾裡，沒有資料庫也沒有匯入。雙鏈、反向連結、關係圖譜、白板、日記，中英文混排按標準排版。可走 iCloud 或 GitHub 同步。macOS 與 iOS，原生 SwiftUI。",
          en: "Plain Markdown in a folder you choose, with no database and no import step. Wikilinks, backlinks, a deterministic graph, a JSON Canvas board, daily notes, and mixed CJK-Latin typography set the way the standard asks for. Syncs through iCloud or a GitHub repository. macOS and iOS, native SwiftUI.",
        },
      },
      {
        repo: "Candela",
        site: "https://getcandela.app",
        name: "Candela",
        stars: 1,
        shot: "assets/shot-candela.webp",
        /* There are .mp4 and .webm siblings of `shot`, and its .webp is
           frame 0 of them — see tools/app-motion.py. */
        motion: true,
        /* The homepage row gets ONE picture; the rest are the detail page. */
        shots: [
          { src: "assets/cand-panel.webp",
            cap: { zh: "一个面板列出所有接着的屏幕。外接屏走 DDC，和显示器自己的按键同一条通道。", "zh-Hant": "一個面板列出所有接著的螢幕。外接螢幕走 DDC，和顯示器自己的按鍵同一條通道。",
                   en: "Every attached display in one panel. External monitors go over DDC — the same channel their own buttons use." } },
          { src: "assets/cand-combined.webp",
            cap: { zh: "Combined 一根滑条调完整张桌子；旁边是深色模式与 Night Shift 的直接开关。", "zh-Hant": "Combined 一根滑桿調完整張桌子；旁邊是深色模式與 Night Shift 的直接開關。",
                   en: "One Combined slider for the whole desk, with Dark Mode and Night Shift as direct switches next to it." } },
          { src: "assets/cand-tools.webp",
            cap: { zh: "预设保存常用的亮度组合；Tools 里是 HiDPI 档位这类 macOS 对第三方屏藏起来的东西。", "zh-Hant": "預設儲存常用的亮度組合；Tools 裡是 HiDPI 檔位這類 macOS 對第三方螢幕藏起來的東西。",
                   en: "Presets keep the brightness combinations you use; Tools is where the HiDPI modes macOS hides from third-party displays live." } },
        ],
        tagline: {
          zh: "macOS 藏起来的显示器控制", "zh-Hant": "macOS 藏起來的顯示器控制",
          en: "Every display control macOS hides",
        },
        desc: {
          zh: "外接显示器的真实亮度（走 DDC，和显示器自己的按键同一条通道）、macOS 对第三方屏藏起来的清晰 HiDPI 档位、在每块屏幕上都好使的亮度键，以及一根滑条调完整张桌子。免费开源，没有 Pro 版。", "zh-Hant": "外接顯示器的真實亮度（走 DDC，和顯示器自己的按鍵同一條通道）、macOS 對第三方螢幕藏起來的清晰 HiDPI 檔位、在每塊螢幕上都好使的亮度鍵，以及一根滑桿調完整張桌子。免費開源，沒有 Pro 版。",
          en: "Real brightness on external monitors over DDC — the same channel the monitor's own buttons use — the sharp HiDPI modes macOS hides from third-party displays, brightness keys that work on every screen, and one slider for the whole desk. Free and open source, with no Pro tier.",
        },
      },
      {
        repo: "clipstack",
        site: "https://getclipstack.app",
        name: "ClipStack",
        stars: 5,
        shot: "assets/shot-clipstack.webp",
        /* There are .mp4 and .webm siblings of `shot`, and its .webp is
           frame 0 of them — see tools/app-motion.py. */
        motion: true,
        /* The homepage row gets ONE picture; the rest are the detail page. */
        shots: [
          { src: "assets/clip-panel.webp",
            cap: { zh: "⇧⌘V 呼出：左边是可搜索的历史，右边是完整预览。文本、图片、文件都留得住。", "zh-Hant": "⇧⌘V 呼出：左邊是可搜尋的歷史，右邊是完整預覽。文字、圖片、檔案都留得住。",
                   en: "Shift-Cmd-V brings it up: searchable history on the left, a full preview on the right. Text, images and files all persist." } },
          { src: "assets/clip-preview.webp",
            cap: { zh: "预览带类型、大小、时间和来源应用；文本原样显示，不做截断。", "zh-Hant": "預覽帶類型、大小、時間和來源應用；文字原樣顯示，不做截斷。",
                   en: "The preview carries type, size, time and source app, and shows text verbatim rather than truncated." } },
          { src: "assets/clip-keys.webp",
            cap: { zh: "⌘1–9 直接粘第 N 条，⌘P 置顶，⌘T 常驻，esc 关掉。手不用离开键盘。", "zh-Hant": "⌘1–9 直接貼第 N 條，⌘P 置頂，⌘T 常駐，esc 關掉。手不用離開鍵盤。",
                   en: "Cmd-1 to 9 pastes the Nth entry, Cmd-P pins, Cmd-T keeps it on top, esc closes. Hands never leave the keyboard." } },
        ],
        tagline: {
          zh: "菜单栏剪贴板历史", "zh-Hant": "選單欄剪貼簿歷史",
          en: "Clipboard history in the menu bar",
        },
        desc: {
          zh: "⇧⌘V 呼出可搜索的历史面板，文本、图片、文件都留得住，右侧带完整预览，回车即粘回。连续复制多段内容时，你需要的是全部，不只是最后一段。", "zh-Hant": "⇧⌘V 呼出可搜尋的歷史面板，文字、圖片、檔案都留得住，右側帶完整預覽，按 Enter 即貼回。連續複製多段內容時，你需要的是全部，不只是最後一段。",
          en: "⇧⌘V brings up a searchable panel of everything you have copied — text, images, files — with a full preview pane. Return pastes it back. When several snippets get copied in a row, you need all of them, not just the last.",
        },
      },
      {
        repo: "audioswitch",
        site: "https://audioswitch.dev",
        name: "AudioSwitch",
        stars: 2,
        shot: "assets/shot-audioswitch.webp",
        /* There are .mp4 and .webm siblings of `shot`, and its .webp is
           frame 0 of them — see tools/app-motion.py. */
        motion: true,
        /* The homepage row gets ONE picture; the rest are the detail page. */
        shots: [
          { src: "assets/audio-panel.webp",
            cap: { zh: "输出、输入、开关，全在一个面板里。设备列表与系统设置完全一致。", "zh-Hant": "輸出、輸入、開關，全在一個面板裡。裝置列表與系統設定完全一致。",
                   en: "Output, input and switches in one panel. The device list matches System Settings exactly." } },
          { src: "assets/audio-input.webp",
            cap: { zh: "输入侧有实时电平表和音量滑块——开会前一眼看出麦克风到底在不在收音。", "zh-Hant": "輸入側有即時電平表和音量滑桿——開會前一眼看出麥克風到底在不在收音。",
                   en: "The input side carries a live level meter and a volume slider, so you can see whether the microphone is actually picking anything up." } },
          { src: "assets/audio-locks.webp",
            cap: { zh: "锁定输出/输入设备，防止会议软件擅自抢占；还有一个真正的麦克风硬开关。", "zh-Hant": "鎖定輸出/輸入裝置，防止會議軟體擅自搶佔；還有一個真正的麥克風硬開關。",
                   en: "Lock the output or input device against apps that grab them, plus a real hard switch for the microphone." } },
        ],
        tagline: {
          zh: "菜单栏音频设备切换", "zh-Hant": "選單欄音訊裝置切換",
          en: "Audio device switching from the menu bar",
        },
        desc: {
          zh: "所有输入输出设备在同一个面板里，带音量滑块、实时麦克风电平表、麦克风硬开关，以及防止会议软件抢占设备的锁定。列表与系统设置完全一致。", "zh-Hant": "所有輸入輸出裝置在同一個面板裡，帶音量滑桿、即時麥克風電平表、麥克風硬開關，以及防止會議軟體搶佔裝置的鎖定。列表與系統設定完全一致。",
          en: "Every input and output device in one panel, with volume sliders, a live microphone level meter, a hard mic-off switch, and device locking against apps that grab them. The list matches System Settings exactly.",
        },
      },
    ],
  },
  {
    id: "systems",
    title: { zh: "系统与工作流", "zh-Hant": "系統與工作流", en: "Systems & Workflows" },
    note: {
      zh: "不是单个动作，而是能自己跑下去的一整套。", "zh-Hant": "不是單個動作，而是能自己跑下去的一整套。",
      en: "Not single actions — whole loops that keep running.",
    },
    items: [
      {
        repo: "show-me-the-money",
        name: { zh: "Show Me The Money · 来财", "zh-Hant": "Show Me The Money · 來財", en: "Show Me The Money · 来财" },
        stars: 849,
        tagline: { zh: "从想法到收入的自动化商业套件", "zh-Hant": "從想法到收入的自動化商業套件", en: "Idea to revenue, on autopilot" },
        desc: {
          zh: "一套 Claude Code 技能，从选品、定价、落地页、投放到客服和复盘，把一门小生意端到端跑起来。", "zh-Hant": "一套 Claude Code 技能，從選品、定價、落地頁、投放到客服和復盤，把一門小生意端到端跑起來。",
          en: "A Claude Code skill suite that builds and runs a small business end to end — idea discovery, pricing, landing pages, ads, support, retrospectives.",
        },
      },
      {
        repo: "bookmark-is-learned",
        name: { zh: "收藏到就是学到", "zh-Hant": "收藏到就是學到", en: "收藏到就是学到" },
        stars: 365,
        tagline: { zh: "解决光收藏不看", "zh-Hant": "解決光收藏不看", en: "Fixes the read-it-later graveyard" },
        desc: {
          zh: "收藏的当下就把它学了或者扔了。不给「以后再看」留位置——因为以后不会来。", "zh-Hant": "收藏的當下就把它學了或者扔了。不給「以後再看」留位置——因為以後不會來。",
          en: "Learn it or drop it at the moment you save it. There is no later queue, because later never comes.",
        },
      },
      {
        repo: "zmm",
        name: "zmm",
        stars: 1,
        tagline: { zh: "做内容 + 看生意", "zh-Hant": "做內容 + 看生意", en: "Make content, read the business" },
        desc: {
          zh: "两套 AI 技能共用一个入口。用人话说你卡在哪，它挑对的那套来处理。只需要记一条命令：/zmm。", "zh-Hant": "兩套 AI 技能共用一個入口。用人話說你卡在哪，它挑對的那套來處理。只需要記一條命令：/zmm。",
          en: "Two skill sets behind one command. Say where you are stuck in plain language and it picks the right one. You only remember /zmm.",
        },
      },
    ],
  },
  {
    id: "publishing",
    title: { zh: "内容发布技能", "zh-Hant": "內容發佈技能", en: "Publishing Skills" },
    note: {
      zh: "写完就能发出去，不用在几个后台之间来回搬运。", "zh-Hant": "寫完就能發出去，不用在幾個後台之間來回搬運。",
      en: "Publish straight from where you wrote it, instead of shuttling between dashboards.",
    },
    items: [
      {
        repo: "wechat-article-publisher-skill",
        name: { zh: "公众号发布", "zh-Hant": "公眾號發佈", en: "WeChat Publisher" },
        stars: 156,
        tagline: { zh: "Markdown 直发微信公众号草稿", "zh-Hant": "Markdown 直發微信公眾號草稿", en: "Markdown straight to a WeChat draft" },
        desc: {
          zh: "把 Markdown 或 HTML 文章通过官方 API 发到公众号草稿箱，图片自动上传。", "zh-Hant": "把 Markdown 或 HTML 文章透過官方 API 發到公眾號草稿箱，圖片自動上傳。",
          en: "Pushes Markdown or HTML to the WeChat Official Account draft box via the official API, uploading images along the way.",
        },
      },
      {
        repo: "wechat-article-formatter-skill",
        name: { zh: "公众号排版", "zh-Hant": "公眾號排版", en: "WeChat Formatter" },
        stars: 76,
        tagline: { zh: "微信公众号文章排版", "zh-Hant": "微信公眾號文章排版", en: "Typesetting for WeChat articles" },
        desc: {
          zh: "把 Markdown 渲染成公众号能用的样式，支持自定义主题。", "zh-Hant": "把 Markdown 渲染成公眾號能用的樣式，支援自訂主題。",
          en: "Renders Markdown into styling WeChat accepts, with custom themes.",
        },
      },
      {
        repo: "linkedin-article-publisher-skill",
        name: { zh: "LinkedIn 发布", "zh-Hant": "LinkedIn 發佈", en: "LinkedIn Publisher" },
        stars: 20,
        tagline: { zh: "发布 LinkedIn 长文", "zh-Hant": "發佈 LinkedIn 長文", en: "Publish LinkedIn articles" },
        desc: {
          zh: "把 Markdown 文章发成 LinkedIn Article，保留格式。", "zh-Hant": "把 Markdown 文章發成 LinkedIn Article，保留格式。",
          en: "Turns a Markdown article into a formatted LinkedIn Article.",
        },
      },
      {
        repo: "red-publisher-skill",
        name: { zh: "小红书发布", "zh-Hant": "小紅書發佈", en: "Xiaohongshu Publisher" },
        stars: 11,
        tagline: { zh: "发布到小红书", "zh-Hant": "發佈到小紅書", en: "Publish to Xiaohongshu" },
        desc: {
          zh: "把内容发到小红书，图文一起处理。", "zh-Hant": "把內容發到小紅書，圖文一起處理。",
          en: "Posts content to Xiaohongshu, images included.",
        },
      },
      {
        repo: "xiaohongshu-images-skill",
        name: { zh: "小红书配图", "zh-Hant": "小紅書配圖", en: "Xiaohongshu Images" },
        stars: 6,
        tagline: { zh: "按内容生成 3:4 图片", "zh-Hant": "按內容生成 3:4 圖片", en: "3:4 images generated from your content" },
        desc: {
          zh: "把内容拆成一组 3:4 的小红书图片，排版直接可用。", "zh-Hant": "把內容拆成一組 3:4 的小紅書圖片，排版直接可用。",
          en: "Breaks content into a set of ready-to-post 3:4 Xiaohongshu images.",
        },
      },
    ],
  },
  {
    id: "productivity",
    title: { zh: "设计与效率技能", "zh-Hant": "設計與效率技能", en: "Design & Productivity Skills" },
    note: {
      zh: "让 Claude 去做事，而不是谈论怎么做事。", "zh-Hant": "讓 Claude 去做事，而不是談論怎麼做事。",
      en: "Make Claude do the work rather than talk about it.",
    },
    items: [
      {
        repo: "bili-music-skill",
        name: { zh: "B 站音乐", "zh-Hant": "B 站音樂", en: "Bili Music" },
        stars: 1,
        tagline: {
          zh: "B 站收藏夹变成车载歌单", "zh-Hant": "B 站收藏夾變成車載歌單",
          en: "A Bilibili favorites folder, as a car playlist",
        },
        desc: {
          zh: "把收藏夹里的视频批量转成音频，从「【SUNO V5】跳楼机-黑人福音跳楼版」这类宣传语式的标题里解析出歌手和歌名，打好标签配好封面，再送进 Apple Music、网易云或 QQ 音乐。增量同步，重复跑不会重复导入。", "zh-Hant": "把收藏夾裡的影片批次轉成音訊，從「【SUNO V5】跳樓機-黑人福音跳樓版」這類宣傳語式的標題裡解析出歌手和歌名，打好標籤配好封面，再送進 Apple Music、網易雲或 QQ 音樂。增量同步，重複跑不會重複匯入。",
          en: "Turns the videos in a favorites folder into tagged audio, pulling the artist and track name out of titles that were written as advertising, then hands them to Apple Music, NetEase or QQ Music. Incremental — re-running never imports anything twice.",
        },
      },
      {
        repo: "james-design",
        name: "james-design",
        stars: 37,
        tagline: { zh: "高保真 UI 设计技能", "zh-Hant": "高保真 UI 設計技能", en: "Hi-fi UI design skill" },
        desc: {
          zh: "让 Claude Code 产出高保真 HTML 设计稿、原型、幻灯片和动效，而不是灰底线框。", "zh-Hant": "讓 Claude Code 產出高保真 HTML 設計稿、原型、幻燈片和動效，而不是灰底線框。",
          en: "Gets Claude Code to produce hi-fi HTML designs, prototypes, slide decks and animations — not grey wireframes.",
        },
      },
      {
        repo: "gtd-coach-plugin",
        name: "GTD Coach",
        stars: 36,
        tagline: { zh: "把待办拆成能动手的计划", "zh-Hant": "把待辦拆成能動手的計劃", en: "Turns a todo list into a plan you can act on" },
        desc: {
          zh: "按你的目标把每天的待办拆成带细节的行动计划，而不是又一份清单。", "zh-Hant": "按你的目標把每天的待辦拆成帶細節的行動計劃，而不是又一份清單。",
          en: "Breaks each day's todos into a detailed action plan against your goals, instead of another list.",
        },
      },
      {
        repo: "image-upload-skill",
        name: { zh: "图床上传", "zh-Hant": "圖床上傳", en: "Image Upload" },
        stars: 6,
        tagline: { zh: "图片上传即得链接", "zh-Hant": "圖片上傳即得連結", en: "Upload an image, get a link" },
        desc: {
          zh: "把图片传到免费图床，直接返回 URL 和 Markdown。", "zh-Hant": "把圖片傳到免費圖床，直接返回 URL 和 Markdown。",
          en: "Uploads to a free host and hands back the URL and Markdown.",
        },
      },
    ],
  },
];

/* Everything in the catalogue that is not a repo.
 *
 * These three lists were on jamesai.dev from the start and were the biggest
 * thing missing when the site was rebuilt: two products that are not code,
 * where to find the four apps, and where to find James. They live here rather
 * than in the page because they change on the same clock as CATEGORIES — when
 * a product changes — and because a link list hard-coded into markup is a link
 * list nobody updates.
 *
 * `note` is the department's own line, in James's voice. It is printed above
 * the rows; a department with nothing to say does not get one.
 */
const WRITING = {
  title: { zh: "《搞到钱再说》与其他", "zh-Hant": "《搞到錢再說》與其他", en: "Money First, and other things" },
  kicker: { zh: "写作与产品", "zh-Hant": "寫作與產品", en: "Writing & products" },
  note: {
    zh: "两年前写的一本 PDF，讲的是先把钱赚到手再谈别的；还有一套把内容生产自动化的工作流。", "zh-Hant": "兩年前寫的一本 PDF，講的是先把錢賺到手再談別的；還有一套把內容生產自動化的工作流。",
    en: "A PDF written two years ago about getting paid before anything else, and a workflow that automates content production.",
  },
  items: [
    { name: { zh: "《搞到钱再说》· 百万副业日记", "zh-Hant": "《搞到錢再說》· 百萬副業日記", en: "Money First · A million-dollar side-hustle diary" },
      where: { zh: "PDF · 购买", "zh-Hant": "PDF · 購買", en: "PDF · buy" },
      url: "https://bit.ly/4q46f5G" },
    { name: { zh: "AI 内容写作自动化工作流", "zh-Hant": "AI 內容寫作自動化工作流", en: "AI content workflow" },
      where: { zh: "工作流 · 购买", "zh-Hant": "工作流 · 購買", en: "Workflow · buy" },
      url: "https://bit.ly/4bMfbZp" },
  ],
};

const ELSEWHERE = {
  title: { zh: "找到我", "zh-Hant": "找到我", en: "Find me" },
  kicker: { zh: "别处", "zh-Hant": "別處", en: "Elsewhere" },
  note: {
    zh: "人在悉尼的话，每周四上午有个免费的 AI 局；线上日常在 X 和小红书，深一点的话在 Telegram 群里（也放了微信）。", "zh-Hant": "人在雪梨的話，每週四上午有個免費的 AI 聚會；線上日常在 X 和小紅書，深一點的話在 Telegram 群裡（也放了微信）。",
    en: "If you are in Sydney there is a free AI meetup on Thursday mornings; day to day I am on X and RED, and deeper conversation happens in the Telegram group (WeChat is in there too).",
  },
  items: [
    { name: { zh: "Vibe Thursday · 悉尼每周四上午的 AI 局", "zh-Hant": "Vibe Thursday · 雪梨每週四上午的 AI 聚會", en: "Vibe Thursday · Sydney, Thursday mornings" },
      where: { zh: "线下 · 免费 · vibethursday.com", "zh-Hant": "線下 · 免費 · vibethursday.com", en: "In person · free · vibethursday.com" },
      url: "https://vibethursday.com" },
    { name: { zh: "James FYI · 关于我（含微信）", "zh-Hant": "James FYI · 關於我（含微信）", en: "James FYI · about me (WeChat inside)" },
      where: { zh: "Telegram", "zh-Hant": "Telegram", en: "Telegram" },
      url: "https://t.me/+BA7dxgMiP6Q0OWI9" },
    { name: { zh: "在悉尼和稀泥", "zh-Hant": "在悉尼和稀泥", en: "在悉尼和稀泥" },
      where: { zh: "X · @JamesAI", "zh-Hant": "X · @JamesAI", en: "X · @JamesAI" },
      url: "https://x.com/JamesAI" },
    { name: { zh: "在悉尼和稀泥", "zh-Hant": "在悉尼和稀泥", en: "在悉尼和稀泥" },
      where: { zh: "小红书 / RED", "zh-Hant": "小紅書 / RED", en: "RED / Xiaohongshu" },
      url: "https://www.xiaohongshu.com/user/profile/5af26425e8ac2b0a9bc030d2" },
    { name: { zh: "开源仓库", "zh-Hant": "開源儲存庫", en: "Open source" },
      where: { zh: "GitHub · @iamzifei", "zh-Hant": "GitHub · @iamzifei", en: "GitHub · @iamzifei" },
      url: "https://github.com/iamzifei" },
    { name: { zh: "请我喝杯咖啡", "zh-Hant": "請我喝杯咖啡", en: "Buy me a coffee" },
      where: { zh: "Ko-fi", "zh-Hant": "Ko-fi", en: "Ko-fi" },
      url: "https://ko-fi.com/james_ai/tip" },
  ],
};

const SITES = {
  title: { zh: "四个 Mac 应用", "zh-Hant": "四個 Mac 應用", en: "Four Mac apps" },
  kicker: { zh: "应用站点", "zh-Hant": "應用站點", en: "App sites" },
  note: { zh: "都免费、源码公开、Apple 芯片原生，自己更新自己。", "zh-Hant": "都免費、原始碼公開、Apple 晶片原生，自己更新自己。",
          en: "All free, source public, native on Apple silicon, and they update themselves." },
  items: [
    { name: { zh: "AudioSwitch", "zh-Hant": "AudioSwitch", en: "AudioSwitch" },
      where: { zh: "音频设备切换 · audioswitch.dev", "zh-Hant": "音訊裝置切換 · audioswitch.dev", en: "Audio device switching · audioswitch.dev" },
      url: "https://audioswitch.dev" },
    { name: { zh: "Candela", "zh-Hant": "Candela", en: "Candela" },
      where: { zh: "显示器控制 · getcandela.app", "zh-Hant": "顯示器控制 · getcandela.app", en: "Display control · getcandela.app" },
      url: "https://getcandela.app" },
    { name: { zh: "ClipStack", "zh-Hant": "ClipStack", en: "ClipStack" },
      where: { zh: "剪贴板历史 · getclipstack.app", "zh-Hant": "剪貼簿歷史 · getclipstack.app", en: "Clipboard history · getclipstack.app" },
      url: "https://getclipstack.app" },
    { name: { zh: "Inkstone", "zh-Hant": "Inkstone", en: "Inkstone" },
      where: { zh: "Markdown 笔记 · inkslab.app", "zh-Hant": "Markdown 筆記 · inkslab.app", en: "Markdown notes · inkslab.app" },
      url: "https://inkslab.app" },
  ],
};

const COLOPHON = {
  zh: "用 Claude Code 构建 · MIT / CC BY-NC", "zh-Hant": "用 Claude Code 構建 · MIT / CC BY-NC",
  en: "Built with Claude Code · MIT / CC BY-NC",
};

const LINKS = {
  github: "https://github.com/iamzifei",
  x: "https://x.com/JamesAI",
  linktree: "https://linktr.ee/jamesgong",
  kofi: "https://ko-fi.com/H2T024VDBG",
};
