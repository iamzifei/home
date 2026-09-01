/* Every string on the site that is not content, in every language it is
   offered in.
   ===========================================================================
   WHERE THIS CAME FROM, AND WHAT IS AND IS NOT CHECKED

   The first 37 keys of each locale are lifted VERBATIM from index.html, the
   live site — they are the paragraphs (the standfirst, the department notes,
   the colophon) and they were translated by a person. Nothing here rewrites
   them, which is the whole reason the press edition reuses them instead of
   inventing its own prose: an unchecked machine paragraph in somebody's own
   voice is not worth the parity.

   The `p.*` keys are the press edition's own chrome — short labels, added
   here. zh-Hans / zh-Hant / en are written with confidence.

   ja / ko / de / fr / es were here and were dropped on 2026-09-02. Their p.*
   labels had never been read by a speaker, and the site was offering five
   languages it could not stand behind. Three it can. A browser asking for any
   of the five now resolves to English, which is what it was already getting
   for the product copy anyway.

   ⚠️  index.html KEEPS ITS OWN COPY of the 37 keys. Two copies drift. When a
   design is chosen, one of them has to go — this file, or the inline block in
   index.html — and the survivor gets loaded by both.
   =========================================================================== */

const STRINGS = {
  'zh-Hant': {
    'p.systems': '系統與技能',
    'p.skip': '跳到正文',
    'p.contents': '本期目錄',
    'p.toTop': '目錄 ↑',
    'p.lead': '卷首',
    'p.feature': '特稿',
    'p.press': '一人公司',
    'p.city': '雪梨',
    'p.issue': '第 %s 號',
    'p.issue0': '創刊',
    'p.date': '%s 年 %s 月 %s 日',
    'p.apps': '四個 macOS App',
    'p.skills': '%s 項技能與系統',
    'p.count': '%s 項',
    'p.mode': '顯示模式',
    'p.day': '日間版',
    'p.auto': '自動',
    'p.night': '夜間版',
    'p.spec.kind': '類型',
    'p.spec.stars': '星標',
    'p.spec.repo': '原始碼',
    'p.spec.site': '官網',
    'p.setIn': '內文 Iowan Old Style 與宋體',
    'p.backTop': '回到頁首 ↑',
    'p.other': '另一版設計 →',
    'html.lang': 'zh-Hant', 'data.lang': 'zh-Hant',
    'doc.title': 'James AI · 在悉尼和稀泥',
    'alias': '在悉尼和稀泥',
    'standfirst': '全端工程師，現居雪梨。開過店，賣過房，創過業。我做<strong>能自己跑起來的工具</strong>：四個原生 macOS App，和一批讓 Claude Code 真正去做事的技能，發文章、做設計、拆待辦、跑一門小生意，而不是停在討論怎麼做。原始碼公開。',
    'byline': 'AI 創業中 · 顧問 · 獨立開發，同時進行',
    'dept.work.kicker': '作品', 'dept.work.title': '在做的東西',
    'dept.work.note': '原生 Swift 寫的 macOS App，和把整套流程跑完的 Claude Code 技能。',
    'dept.writing.kicker': '寫作與產品', 'dept.writing.title': '《搞到錢再說》與其他',
    'dept.writing.note': '兩年前寫的一本 PDF，講的是先把錢賺到手再談別的；還有一套把內容生產自動化的工作流。',
    'prod.book': '《搞到錢再說》· 百萬副業日記', 'prod.book.where': 'PDF · 購買',
    'prod.workflow': 'AI 內容寫作自動化工作流', 'prod.workflow.where': '工作流 · 購買',
    'dept.links.kicker': '別處', 'dept.links.title': '找到我',
    'dept.links.note': '人在雪梨的話，每週四上午有個免費的 AI 聚會；線上日常在 X 和小紅書，深一點的話在 Telegram 群裡（也放了微信）。',
    'link.vt': 'Vibe Thursday · 雪梨每週四上午的 AI 聚會', 'link.vt.where': '線下 · 免費 · vibethursday.com',
    'link.telegram': 'James FYI · 關於我（含微信）', 'link.x': '在悉尼和稀泥',
    'link.red': '在悉尼和稀泥', 'link.red.where': '小紅書 / RED',
    'link.github': '開源儲存庫', 'link.kofi': '請我喝杯咖啡',
    'dept.sites.kicker': 'App 網站', 'dept.sites.title': '四個 Mac App',
    'dept.sites.note': '都免費、原始碼公開、Apple 晶片原生，自己更新自己。',
    'site.audioswitch': '音訊裝置切換 · audioswitch.dev',
    'site.candela': '顯示器控制 · getcandela.app',
    'site.clipstack': '剪貼簿歷史 · getclipstack.app',
    'site.inkstone': 'Markdown 筆記 · inkslab.app',
    'colophon': '用 Claude Code 構建 · MIT / CC BY-NC', 'colophon.source': '本頁原始碼',
    'lang.system': '跟隨系統',
  },
  'en': {
    'p.systems': 'Systems and skills',
    'p.skip': 'Skip to the text',
    'p.contents': 'Contents',
    'p.toTop': 'Contents ↑',
    'p.lead': 'Opening',
    'p.feature': 'Feature',
    'p.press': 'A one-person press',
    'p.city': 'Sydney',
    'p.issue': 'No. %s',
    'p.issue0': 'First issue',
    'p.date': '%s-%s-%s',
    'p.apps': 'Four macOS apps',
    'p.skills': '%s skills and systems',
    'p.count': '%s',
    'p.mode': 'Appearance',
    'p.day': 'Day',
    'p.auto': 'Auto',
    'p.night': 'Night',
    'p.spec.kind': 'Kind',
    'p.spec.stars': 'Stars',
    'p.spec.repo': 'Source',
    'p.spec.site': 'Site',
    'p.setIn': 'Set in Iowan Old Style and Songti',
    'p.backTop': 'Back to top ↑',
    'p.other': 'The other design →',
    'html.lang': 'en', 'data.lang': 'en',
    'doc.title': 'James AI · 在悉尼和稀泥',
    'alias': '在悉尼和稀泥',
    'standfirst': 'Full-stack engineer, based in Sydney. I have run a shop, sold houses, started companies. Now I build <strong>tools that keep running on their own</strong>. Four native macOS apps, and a set of skills that get Claude Code to actually do the work: publish articles, design interfaces, break down todos, run a small business, instead of talking about it. Source public.',
    'byline': 'Building an AI company · consulting · shipping alone, all at once',
    'dept.work.kicker': 'Work', 'dept.work.title': 'What I am building',
    'dept.work.note': 'macOS apps written in native Swift, and Claude Code skills that run a whole loop rather than one step.',
    'dept.writing.kicker': 'Writing & products', 'dept.writing.title': 'Money First, and other things',
    'dept.writing.note': 'A PDF I wrote two years ago about earning the money before anything else, and a workflow that automates content production.',
    'prod.book': 'Money First · a side-hustle diary', 'prod.book.where': 'PDF · buy',
    'prod.workflow': 'AI writing automation workflow', 'prod.workflow.where': 'Workflow · buy',
    'dept.links.kicker': 'Elsewhere', 'dept.links.title': 'Find me',
    'dept.links.note': 'If you are in Sydney there is a free AI meetup every Thursday morning. Online it is X and RED day to day; the longer conversations happen in the Telegram group, where my WeChat is too.',
    'link.vt': "Vibe Thursday · Sydney's weekly AI table", 'link.vt.where': 'In person · free · vibethursday.com',
    'link.telegram': 'James FYI · about me (WeChat inside)', 'link.x': '在悉尼和稀泥',
    'link.red': '在悉尼和稀泥', 'link.red.where': 'RED / Xiaohongshu',
    'link.github': 'Open-source repositories', 'link.kofi': 'Buy me a coffee',
    'dept.sites.kicker': 'App sites', 'dept.sites.title': 'Four Mac apps',
    'dept.sites.note': 'All free, source public, Apple silicon native, and they update themselves.',
    'site.audioswitch': 'Audio device switching · audioswitch.dev',
    'site.candela': 'Display control · getcandela.app',
    'site.clipstack': 'Clipboard history · getclipstack.app',
    'site.inkstone': 'Markdown notes · inkslab.app',
    'colophon': 'Built with Claude Code · MIT / CC BY-NC', 'colophon.source': 'Source of this page',
    'lang.system': 'System',
  },
}

if (typeof module !== 'undefined' && module.exports) { module.exports = { STRINGS }; }
