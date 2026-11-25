/* ===========================================================================
   mac/common.js — shared by /mac/ (the hub) and /mac/u/ (one person's page).

   Owns three things so the two pages never disagree:
     1. Language: zh-Hans / zh-Hant / en. Same storage key as the homepage
        ('press.lang'); ?lang= in the URL wins. Anything else resolves to en.
     2. Theme: auto / day / night, cycled by one button. Same storage key as
        the homepage ('jamesai.press'). The pre-paint half of this lives in a
        tiny inline <script> in each page's <head> so there is no flash.
     3. Small helpers (escaping, text picking, dates) and every UI string.
   =========================================================================== */
(function () {
  var LANGS = ['zh-Hans', 'zh-Hant', 'en'];
  var LANG_LABEL = { 'zh-Hans': '简体', 'zh-Hant': '繁體', en: 'English' };

  var STR = {
    'zh-Hans': {
      home: 'jamesai.dev', hubLink: '大家在用', theme: { system: '自动', day: '日间', night: '夜间' },
      cats: { ai: 'AI', dev: '开发', web: '浏览器', chat: '沟通', work: '效率', media: '影音设计', files: '存储传输', mine: '自己做的', other: '其他' },
      freq: { daily: '天天开', week: '本周用过', month: '本月用过', idle: '装着备用' },
      model: { free: '免费', freemium: '免费 + 付费版', 'one-time': '买断', subscription: '订阅', 'open-source': '开源免费' },
      priceFilter: { all: '全部', free: '免费', freemium: '免费 + 付费版', 'one-time': '买断', subscription: '订阅' },
      all: '全部', catLab: '分类', freqLab: '频率', priceLab: '价格', sort: '排序',
      sorts: { use: '打开次数', recent: '最近使用', name: '名称', price: '价格低到高' },
      count: '%s 个', opened: '打开 %s 次', never: '无打开记录', last: '最近 %s', site: '官网',
      unverified: '以官网为准', empty: '没有符合这些条件的。', unknownPrice: '价格未收录',
      // hub
      hubLive: '%s 人的真实数据', hubTitle: '大家真正在用的 Mac 软件',
      hubSub: '每一条推荐都带着证据：这个 App 在推荐人的 Mac 上被打开了多少次、最近一次是什么时候。数据来自 macOS 自己的记录，不是「我觉得好用」。',
      tabApps: '软件榜', tabSkills: '技能榜', tabPeople: '推荐人',
      people: '%s 人在用', totalOpens: '共打开 %s 次', skillUses: '共调用 %s 次',
      statPeople: '位推荐人', statApps: '个 App', statOpens: '次打开',
      personApps: '%s 个 App', personSkills: '%s 个技能', seePage: '看 TA 的页面 →',
      joinTitle: '做你自己的这一页', joinSub: '在 Mac 的「终端」里粘贴这一行，回车。它只在你电脑上扫描，然后打开一个页面让你勾选要公开哪些、写一句理由。点「发布」，你的页面马上上线；以后再跑一次就是更新。',
      joinSteps: ['粘贴命令，回车', '勾选、写理由', '点「发布」，马上上线'], copy: '复制', copied: '已复制',
      joinNote: '不用注册账号。点「发布」之前，什么都不会离开你的电脑。用 Claude Code 的话，直接把这行发给它也行。',
      // profile
      profileTitle: '%s 的 Mac 软件', profileSub: '这些是 %s 的 Mac 上装着、并且真的在用的软件。打开次数和最近使用时间来自 macOS Spotlight 的记录。',
      scanned: '扫描于 %s', apps: '个 App', launches: '次打开', freeToUse: '个可免费用',
      skillsTitle: 'Claude Code 技能', skillsSub: '近 %s 天里在 Claude Code 中实际调用的次数。', skillsUses: '调用 %s 次',
      howTitle: '数据从哪来',
      how: 'macOS 会为每个 App 记一个打开次数（kMDItemUseCount）和最近使用时间（kMDItemLastUsedDate），这页原样读出来。一直挂在后台的 App（比如 Claude、菜单栏工具）次数会偏低：它衡量的是「启动」，不是「使用时长」。数据由本人扫描后提交，以诚实为准。',
      notFound: '没找到这个人', notFoundSub: '这个页面可能还没提交，或者链接写错了。', back: '回到大家在用',
      affiliate: '部分「官网」按钮是联盟链接，通过它购买我们会拿到一点佣金，你付的价格不变。',
      foot: '价格核对于 %s，以官网为准'
    },
    'zh-Hant': {
      home: 'jamesai.dev', hubLink: '大家在用', theme: { system: '自動', day: '日間', night: '夜間' },
      cats: { ai: 'AI', dev: '開發', web: '瀏覽器', chat: '溝通', work: '效率', media: '影音設計', files: '儲存傳輸', mine: '自己做的', other: '其他' },
      freq: { daily: '天天開', week: '本週用過', month: '本月用過', idle: '裝著備用' },
      model: { free: '免費', freemium: '免費 + 付費版', 'one-time': '買斷', subscription: '訂閱', 'open-source': '開源免費' },
      priceFilter: { all: '全部', free: '免費', freemium: '免費 + 付費版', 'one-time': '買斷', subscription: '訂閱' },
      all: '全部', catLab: '分類', freqLab: '頻率', priceLab: '價格', sort: '排序',
      sorts: { use: '開啟次數', recent: '最近使用', name: '名稱', price: '價格低到高' },
      count: '%s 個', opened: '開啟 %s 次', never: '無開啟紀錄', last: '最近 %s', site: '官網',
      unverified: '以官網為準', empty: '沒有符合這些條件的。', unknownPrice: '價格未收錄',
      hubLive: '%s 人的真實資料', hubTitle: '大家真正在用的 Mac 軟體',
      hubSub: '每一條推薦都附上證據：這個 App 在推薦人的 Mac 上被開啟了幾次、最近一次是什麼時候。資料來自 macOS 自己的紀錄，不是「我覺得好用」。',
      tabApps: '軟體榜', tabSkills: '技能榜', tabPeople: '推薦人',
      people: '%s 人在用', totalOpens: '共開啟 %s 次', skillUses: '共呼叫 %s 次',
      statPeople: '位推薦人', statApps: '個 App', statOpens: '次開啟',
      personApps: '%s 個 App', personSkills: '%s 個技能', seePage: '看 TA 的頁面 →',
      joinTitle: '做你自己的這一頁', joinSub: '在 Mac 的「終端機」裡貼上這一行，按 Enter。它只在你的電腦上掃描，然後開啟一個頁面讓你勾選要公開哪些、寫一句理由。按「發佈」，你的頁面馬上上線；之後再跑一次就是更新。',
      joinSteps: ['貼上指令，按 Enter', '勾選、寫理由', '按「發佈」，馬上上線'], copy: '複製', copied: '已複製',
      joinNote: '不用註冊帳號。按「發佈」之前，什麼都不會離開你的電腦。用 Claude Code 的話，直接把這行傳給它也可以。',
      profileTitle: '%s 的 Mac 軟體', profileSub: '這些是 %s 的 Mac 上裝著、而且真的在用的軟體。開啟次數和最近使用時間來自 macOS Spotlight 的紀錄。',
      scanned: '掃描於 %s', apps: '個 App', launches: '次開啟', freeToUse: '個可免費用',
      skillsTitle: 'Claude Code 技能', skillsSub: '近 %s 天在 Claude Code 中實際呼叫的次數。', skillsUses: '呼叫 %s 次',
      howTitle: '資料從哪來',
      how: 'macOS 會為每個 App 記錄開啟次數（kMDItemUseCount）和最近使用時間（kMDItemLastUsedDate），這頁原樣讀出來。一直掛在背景的 App（例如 Claude、選單列工具）次數會偏低：它衡量的是「啟動」，不是「使用時長」。資料由本人掃描後提交，以誠實為準。',
      notFound: '找不到這個人', notFoundSub: '這個頁面可能還沒提交，或是連結寫錯了。', back: '回到大家在用',
      affiliate: '部分「官網」按鈕是聯盟連結，透過它購買我們會拿到一點佣金，你付的價格不變。',
      foot: '價格核對於 %s，以官網為準'
    },
    en: {
      home: 'jamesai.dev', hubLink: 'Everyone', theme: { system: 'Auto', day: 'Light', night: 'Dark' },
      cats: { ai: 'AI', dev: 'Developer', web: 'Browsers', chat: 'Communication', work: 'Productivity', media: 'Media & design', files: 'Files & sync', mine: 'Self-made', other: 'Other' },
      freq: { daily: 'Every day', week: 'This week', month: 'This month', idle: 'Installed, idle' },
      model: { free: 'Free', freemium: 'Free + paid', 'one-time': 'One-time', subscription: 'Subscription', 'open-source': 'Open source' },
      priceFilter: { all: 'All', free: 'Free', freemium: 'Free + paid', 'one-time': 'One-time', subscription: 'Subscription' },
      all: 'All', catLab: 'Type', freqLab: 'Use', priceLab: 'Price', sort: 'Sort',
      sorts: { use: 'Most opened', recent: 'Recently used', name: 'Name', price: 'Price: low to high' },
      count: '%s apps', opened: 'Opened %s×', never: 'No launch record', last: 'last %s', site: 'Website',
      unverified: 'check site', empty: 'Nothing matches these filters.', unknownPrice: 'Price not listed',
      hubLive: 'Real data from %s people', hubTitle: 'The Mac apps people actually use',
      hubSub: 'Every recommendation comes with evidence: how many times the app was opened on that person’s Mac, and when it was last used. The numbers come from macOS itself, not from “I think it’s good”.',
      tabApps: 'Apps', tabSkills: 'Skills', tabPeople: 'People',
      people: '%s using', totalOpens: '%s opens', skillUses: '%s runs',
      statPeople: 'people', statApps: 'apps', statOpens: 'opens',
      personApps: '%s apps', personSkills: '%s skills', seePage: 'See their page →',
      joinTitle: 'Make your own page', joinSub: 'Paste this line into Terminal on your Mac and press Return. It scans locally, then opens a page where you tick what to share and say why. Press Publish and your page is live; run it again any time to update.',
      joinSteps: ['Paste, press Return', 'Tick apps, add reasons', 'Press Publish — live instantly'], copy: 'Copy', copied: 'Copied',
      joinNote: 'No sign-up. Nothing leaves your computer until you press Publish. Using Claude Code? Just hand it this line.',
      profileTitle: '%s’s Mac apps', profileSub: 'Apps installed on %s’s Mac and actually used. Launch counts and last-used dates come from macOS Spotlight.',
      scanned: 'Scanned %s', apps: 'apps', launches: 'launches', freeToUse: 'free to use',
      skillsTitle: 'Claude Code skills', skillsSub: 'Times each skill was actually run in Claude Code over the last %s days.', skillsUses: 'Run %s×',
      howTitle: 'Where the numbers come from',
      how: 'macOS keeps a launch count (kMDItemUseCount) and a last-used date (kMDItemLastUsedDate) for every app; this page reads them as they are. Apps that stay open all day (Claude, menu-bar tools) show low counts: it measures launches, not hours. Each person scans and submits their own data, on their honour.',
      notFound: 'Nobody here yet', notFoundSub: 'This page hasn’t been submitted, or the link is wrong.', back: 'Back to everyone',
      affiliate: 'Some “Website” buttons are affiliate links: buying through them pays us a small commission at no cost to you.',
      foot: 'Prices checked %s; see each official site'
    }
  };

  /* ---------- language ---------- */
  function pickLang() {
    var s = 'system';
    try {
      var q = new URLSearchParams(location.search).get('lang');
      s = q || localStorage.getItem('press.lang') || 'system';
    } catch (e) {}
    if (LANGS.indexOf(s) >= 0) return s;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    if (/^zh-(TW|HK|MO|Hant)/i.test(nav)) return 'zh-Hant';
    if (/^zh/i.test(nav)) return 'zh-Hans';
    return 'en';
  }

  var M = {
    /* Profiles and the hub index live in Vercel Blob, written by mac-api. */
    DATA: 'https://1yz29bdzoe7fwktz.public.blob.vercel-storage.com',
    /* One profile, always the newest version (see mac-api/api/u.py). */
    API: 'https://jamesai-mac-api.vercel.app/api',
    lang: pickLang(),
    LANGS: LANGS,
    S: function () { return STR[M.lang]; },
    /* Pick a localized value: plain string, or an object keyed by language.
       zh-Hant falls back to zh-Hans, everything falls back to en. */
    t: function (v) {
      if (v == null) return '';
      if (typeof v === 'string') return v;
      return v[M.lang] || (M.lang === 'zh-Hant' && v['zh-Hans']) || v.en || v['zh-Hans'] || '';
    },
    /* Function replacement: a user string like "$&" must not be read as a pattern. */
    f: function (s, v) { return String(s).replace('%s', function () { return v; }); },
    /* Own-property lookup, so an id like "__proto__" can never hit Object.prototype. */
    own: function (o, k) { return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined; },
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    num: function (n) { return Number(n || 0).toLocaleString(M.lang === 'en' ? 'en-US' : 'zh-CN'); },
    date: function (d) {
      var x = new Date(d);
      if (isNaN(x)) return '';
      return M.lang === 'en' ? x.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
        : x.getFullYear() + ' 年 ' + (x.getMonth() + 1) + ' 月 ' + x.getDate() + ' 日';
    },
    shortDate: function (d) {
      var x = new Date(d);
      if (isNaN(x)) return '';
      return M.lang === 'en' ? x.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
        : (x.getMonth() + 1) + ' 月 ' + x.getDate() + ' 日';
    },
    /* Every page calls this once its own content is painted, passing a
       repaint callback that runs again on language change. */
    chrome: function (repaint) {
      var bar = document.getElementById('bar-tools');
      function themeNow() { try { return localStorage.getItem('jamesai.press') || 'system'; } catch (e) { return 'system'; } }
      function render() {
        var s = M.S(), th = themeNow();
        document.documentElement.lang = M.lang;
        bar.innerHTML = '<select id="lang-sel" aria-label="Language">' + LANGS.map(function (l) {
          return '<option value="' + l + '"' + (l === M.lang ? ' selected' : '') + '>' + LANG_LABEL[l] + '</option>';
        }).join('') + '</select>'
          + '<button id="theme-btn" type="button" title="Theme">' + { system: '◐', day: '☀', night: '☾' }[th] + ' ' + s.theme[th] + '</button>';
        document.getElementById('lang-sel').onchange = function (e) {
          M.lang = e.target.value;
          try { localStorage.setItem('press.lang', M.lang); } catch (err) {}
          /* Keep a shared link in the language the reader chose. */
          try { var u = new URL(location.href); u.searchParams.set('lang', M.lang); history.replaceState(null, '', u); } catch (err) {}
          render(); repaint();
        };
        document.getElementById('theme-btn').onclick = function () {
          var next = { system: 'day', day: 'night', night: 'system' }[themeNow()];
          try { localStorage.setItem('jamesai.press', next); } catch (err) {}
          window.__applyTheme(next);
          render();
        };
      }
      render(); repaint();
    }
  };

  /* Re-apply 'auto' when the OS flips between light and dark. */
  try {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      var v = 'system';
      try { v = localStorage.getItem('jamesai.press') || 'system'; } catch (e) {}
      if (v === 'system') window.__applyTheme('system');
    });
  } catch (e) {}

  window.MacKit = M;
})();
