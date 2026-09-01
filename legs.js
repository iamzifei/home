/* 航段 — the legs of the route.
 *
 * WHAT THIS FILE IS
 *   The site has three content files, separate because they change on three
 *   different clocks:
 *
 *     data.js   the catalogue — changes when a product changes
 *     issues.js the serial run — grows by one entry when the bot compiles one
 *     legs.js   the route      — changes a few times in a life
 *
 * ⚠️ HOW MUCH OF THIS IS EVIDENCE, AND HOW MUCH IS INFERENCE
 *   James asked for the gaps to be filled in from what is known about him and
 *   his projects, so they are. Every `years` value below is tagged so a wrong
 *   one is a one-line fix rather than a hunt:
 *
 *     实测  read off something checkable — first-commit dates in ~/Dev, or
 *           James's own copy
 *     推测  my inference. NOT checked against anything. If it is wrong it is
 *           wrong by years, not months.
 *
 *   The two middle legs (the shop, the property years) have NO evidence behind
 *   them at all — there is nothing in the repos, the memory files or the site's
 *   own copy that dates them. They are placed to sit sensibly between the
 *   engineer years and the first venture with code behind it. Correct them.
 *
 *   `place` and `role` come from James's own line on the site — 「全栈工程师，
 *   现居悉尼。开过店，卖过房，创过业。」 — plus SZX → SYD from the boarding
 *   pass. Those are his words and are not inference.
 *
 * THE EVIDENCE, so it can be re-checked
 *   git -C ~/Dev/<repo> log --reverse --format=%as | head -1
 *     taro-car        2020-02-27   first venture in this machine's history
 *     nailARt-app     2023-03-29
 *     orrisapi        2023-04-22   CCAPI — the API line starts
 *     imaginepro-web  2023-06-23
 *     sunoapi-web     2024-03-27   MusicAPI — 「JA2024 = 2024 出海那年」
 *
 * TO EDIT
 *   `years` prints verbatim, any format. An empty string prints nothing at all
 *   — no dash, no placeholder. Same for `note`. Exactly one leg may be
 *   `current: true`; it is the only filled waypoint on the rail and the only
 *   BOARDING row on the departures board.
 *
 * ORDER
 *   Earliest first. The renderer numbers them LEG 01, 02 … in array order.
 */
const LEGS = [
  {
    code: "SZX",
    place: { zh: "深圳", en: "Shenzhen" },
    role:  { zh: "全栈工程师", en: "Full-stack engineer" },
    years: "2012–2016",                    // 推测 — no evidence, correct me
    note: {
      zh: "写别人的需求，学会了把东西做出来这件事本身。",
      en: "Building other people's requirements, and learning how to finish things.",
    },
  },
  {
    code: "SHP",
    place: { zh: "开过店", en: "Ran a shop" },
    role:  { zh: "线下生意", en: "A business with a door on it" },
    years: "2016–2018",                    // 推测 — no evidence, correct me
    note: {
      zh: "第一次自己付房租。卖不出去的东西不会因为做得好就卖得出去。",
      en: "The first rent I paid myself. Nothing sells because it was built well.",
    },
  },
  {
    code: "PRP",
    place: { zh: "卖过房", en: "Sold property" },
    role:  { zh: "中介", en: "Agent" },
    years: "2018–2020",                    // 推测 — no evidence, correct me
    note: {
      zh: "一单顶半年。也是在这里学会了报价、跟进、和被拒绝。",
      en: "One deal could carry half a year. Quoting, following up, being turned down.",
    },
  },
  {
    code: "VEN",
    place: { zh: "创过业", en: "Founded companies" },
    role:  { zh: "从 0 到 1", en: "Zero to one" },
    years: "2020–2023",                    // 实测（起点）— taro-car 2020-02-27
    note: {
      zh: "小程序、工具、几个没活下来的产品。做得出来不等于有人要。",
      en: "Mini-programs, tools, a few products that did not survive. Shipping is not demand.",
    },
  },
  {
    code: "SYD",
    place: { zh: "悉尼", en: "Sydney" },
    role:  { zh: "一人公司", en: "One-person company" },
    years: "2023 —",                       // 实测（起点）— orrisapi 2023-04-22
    note: {
      zh: "API 与工具，卖给全世界。2024 年出海，现在四个 macOS 应用和几条 API 线，一个人在跑。",
      en: "APIs and tools, sold worldwide. Four macOS apps and a handful of API lines, run by one person.",
    },
    current: true,
  },
];

if (typeof module !== "undefined" && module.exports) { module.exports = { LEGS }; }
