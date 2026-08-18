// Project catalogue. Star counts here are a fallback — index.html refreshes
// them from the GitHub API on load with a single request for the whole account.
const CATEGORIES = [
  {
    id: "apps",
    title: { zh: "macOS 应用", en: "macOS Apps" },
    note: {
      zh: "原生 Swift，Apple Silicon，零第三方依赖。",
      en: "Native Swift, Apple Silicon, no third-party dependencies.",
    },
    featured: true,
    items: [
      {
        repo: "Candela",
        name: "Candela",
        stars: 0,
        shot: "assets/candela-card.jpg",
        tagline: {
          zh: "macOS 藏起来的显示器控制",
          en: "Every display control macOS hides",
        },
        desc: {
          zh: "外接显示器的真实亮度（走 DDC，和显示器自己的按键同一条通道）、macOS 对第三方屏藏起来的清晰 HiDPI 档位、在每块屏幕上都好使的亮度键，以及一根滑条调完整张桌子。免费开源，没有 Pro 版。",
          en: "Real brightness on external monitors over DDC — the same channel the monitor's own buttons use — the sharp HiDPI modes macOS hides from third-party displays, brightness keys that work on every screen, and one slider for the whole desk. Free and open source, with no Pro tier.",
        },
      },
      {
        repo: "clipstack",
        name: "ClipStack",
        stars: 3,
        shot: "assets/clipstack-card.jpg",
        tagline: {
          zh: "菜单栏剪贴板历史",
          en: "Clipboard history in the menu bar",
        },
        desc: {
          zh: "⇧⌘V 呼出可搜索的历史面板，文本、图片、文件都留得住，右侧带完整预览，回车即粘回。连续复制多段内容时，你需要的是全部，不只是最后一段。",
          en: "⇧⌘V brings up a searchable panel of everything you have copied — text, images, files — with a full preview pane. Return pastes it back. When several snippets get copied in a row, you need all of them, not just the last.",
        },
      },
      {
        repo: "audioswitch",
        name: "AudioSwitch",
        stars: 0,
        shot: "assets/audioswitch-card.jpg",
        tagline: {
          zh: "菜单栏音频设备切换",
          en: "Audio device switching from the menu bar",
        },
        desc: {
          zh: "所有输入输出设备在同一个面板里，带音量滑块、实时麦克风电平表、麦克风硬开关，以及防止会议软件抢占设备的锁定。列表与系统设置完全一致。",
          en: "Every input and output device in one panel, with volume sliders, a live microphone level meter, a hard mic-off switch, and device locking against apps that grab them. The list matches System Settings exactly.",
        },
      },
    ],
  },
  {
    id: "systems",
    title: { zh: "系统与工作流", en: "Systems & Workflows" },
    note: {
      zh: "不是单个动作，而是能自己跑下去的一整套。",
      en: "Not single actions — whole loops that keep running.",
    },
    items: [
      {
        repo: "show-me-the-money",
        name: "Show Me The Money · 来财",
        stars: 810,
        tagline: { zh: "从想法到收入的自动化商业套件", en: "Idea to revenue, on autopilot" },
        desc: {
          zh: "一套 Claude Code 技能，从选品、定价、落地页、投放到客服和复盘，把一门小生意端到端跑起来。",
          en: "A Claude Code skill suite that builds and runs a small business end to end — idea discovery, pricing, landing pages, ads, support, retrospectives.",
        },
      },
      {
        repo: "bookmark-is-learned",
        name: "收藏到就是学到",
        stars: 365,
        tagline: { zh: "解决光收藏不看", en: "Fixes the read-it-later graveyard" },
        desc: {
          zh: "收藏的当下就把它学了或者扔了。不给「以后再看」留位置——因为以后不会来。",
          en: "Learn it or drop it at the moment you save it. There is no later queue, because later never comes.",
        },
      },
      {
        repo: "zmm",
        name: "zmm",
        stars: 0,
        tagline: { zh: "做内容 + 看生意", en: "Make content, read the business" },
        desc: {
          zh: "两套 AI 技能共用一个入口。用人话说你卡在哪，它挑对的那套来处理。只需要记一条命令：/zmm。",
          en: "Two skill sets behind one command. Say where you are stuck in plain language and it picks the right one. You only remember /zmm.",
        },
      },
    ],
  },
  {
    id: "publishing",
    title: { zh: "内容发布技能", en: "Publishing Skills" },
    note: {
      zh: "写完就能发出去，不用在几个后台之间来回搬运。",
      en: "Publish straight from where you wrote it, instead of shuttling between dashboards.",
    },
    items: [
      {
        repo: "wechat-article-publisher-skill",
        name: { zh: "公众号发布", en: "WeChat Publisher" },
        stars: 153,
        tagline: { zh: "Markdown 直发微信公众号草稿", en: "Markdown straight to a WeChat draft" },
        desc: {
          zh: "把 Markdown 或 HTML 文章通过官方 API 发到公众号草稿箱，图片自动上传。",
          en: "Pushes Markdown or HTML to the WeChat Official Account draft box via the official API, uploading images along the way.",
        },
      },
      {
        repo: "wechat-article-formatter-skill",
        name: { zh: "公众号排版", en: "WeChat Formatter" },
        stars: 75,
        tagline: { zh: "微信公众号文章排版", en: "Typesetting for WeChat articles" },
        desc: {
          zh: "把 Markdown 渲染成公众号能用的样式，支持自定义主题。",
          en: "Renders Markdown into styling WeChat accepts, with custom themes.",
        },
      },
      {
        repo: "linkedin-article-publisher-skill",
        name: { zh: "LinkedIn 发布", en: "LinkedIn Publisher" },
        stars: 19,
        tagline: { zh: "发布 LinkedIn 长文", en: "Publish LinkedIn articles" },
        desc: {
          zh: "把 Markdown 文章发成 LinkedIn Article，保留格式。",
          en: "Turns a Markdown article into a formatted LinkedIn Article.",
        },
      },
      {
        repo: "red-publisher-skill",
        name: { zh: "小红书发布", en: "Xiaohongshu Publisher" },
        stars: 10,
        tagline: { zh: "发布到小红书", en: "Publish to Xiaohongshu" },
        desc: {
          zh: "把内容发到小红书，图文一起处理。",
          en: "Posts content to Xiaohongshu, images included.",
        },
      },
      {
        repo: "xiaohongshu-images-skill",
        name: { zh: "小红书配图", en: "Xiaohongshu Images" },
        stars: 6,
        tagline: { zh: "按内容生成 3:4 图片", en: "3:4 images generated from your content" },
        desc: {
          zh: "把内容拆成一组 3:4 的小红书图片，排版直接可用。",
          en: "Breaks content into a set of ready-to-post 3:4 Xiaohongshu images.",
        },
      },
    ],
  },
  {
    id: "productivity",
    title: { zh: "设计与效率技能", en: "Design & Productivity Skills" },
    note: {
      zh: "让 Claude 去做事，而不是谈论怎么做事。",
      en: "Make Claude do the work rather than talk about it.",
    },
    items: [
      {
        repo: "bili-music-skill",
        name: { zh: "B 站音乐", en: "Bili Music" },
        stars: 0,
        tagline: {
          zh: "B 站收藏夹变成车载歌单",
          en: "A Bilibili favorites folder, as a car playlist",
        },
        desc: {
          zh: "把收藏夹里的视频批量转成音频，从「【SUNO V5】跳楼机-黑人福音跳楼版」这类宣传语式的标题里解析出歌手和歌名，打好标签配好封面，再送进 Apple Music、网易云或 QQ 音乐。增量同步，重复跑不会重复导入。",
          en: "Turns the videos in a favorites folder into tagged audio, pulling the artist and track name out of titles that were written as advertising, then hands them to Apple Music, NetEase or QQ Music. Incremental — re-running never imports anything twice.",
        },
      },
      {
        repo: "james-design",
        name: "james-design",
        stars: 36,
        tagline: { zh: "高保真 UI 设计技能", en: "Hi-fi UI design skill" },
        desc: {
          zh: "让 Claude Code 产出高保真 HTML 设计稿、原型、幻灯片和动效，而不是灰底线框。",
          en: "Gets Claude Code to produce hi-fi HTML designs, prototypes, slide decks and animations — not grey wireframes.",
        },
      },
      {
        repo: "gtd-coach-plugin",
        name: "GTD Coach",
        stars: 35,
        tagline: { zh: "把待办拆成能动手的计划", en: "Turns a todo list into a plan you can act on" },
        desc: {
          zh: "按你的目标把每天的待办拆成带细节的行动计划，而不是又一份清单。",
          en: "Breaks each day's todos into a detailed action plan against your goals, instead of another list.",
        },
      },
      {
        repo: "image-upload-skill",
        name: { zh: "图床上传", en: "Image Upload" },
        stars: 6,
        tagline: { zh: "图片上传即得链接", en: "Upload an image, get a link" },
        desc: {
          zh: "把图片传到免费图床，直接返回 URL 和 Markdown。",
          en: "Uploads to a free host and hands back the URL and Markdown.",
        },
      },
    ],
  },
];

const LINKS = {
  github: "https://github.com/iamzifei",
  x: "https://x.com/JamesAI",
  linktree: "https://linktr.ee/jamesgong",
  kofi: "https://ko-fi.com/H2T024VDBG",
};
