/* 机上杂志 — 期刊清单 / In-flight Magazine, the run of issues.
 *
 * WHAT THIS FILE IS
 *   The site has two kinds of content. `data.js` is the STATIC catalogue: the
 *   products, changed by hand when a product changes. This file is the SERIAL
 *   one: one entry per issue, newest last. The magazine on the site is always
 *   the last entry; everything before it goes on the shelf.
 *
 * HOW THE BOT APPENDS
 *   Push one object onto ISSUES. Nothing else in the site needs editing — the
 *   page reads the length of this array for the issue number, takes the last
 *   entry as the current issue, and shelves the rest.
 *
 *     {
 *       no:    2,                        // integer, sequential
 *       date:  "2026-09-01",             // ISO, the day it was compiled
 *       title: "…",                      // the issue's own line, 8–16 字
 *       cover: "mag-opener",             // asset stem in /assets, without the
 *                                        //   -w suffix; both a portrait
 *                                        //   (<stem>.webp) and a landscape
 *                                        //   (<stem>-w.webp) must exist
 *       news: [                          // may be empty; the section is then
 *         {                              //   omitted rather than faked
 *           title:  "…",                 // the headline, in the site's voice
 *           source: "…",                 // who published it
 *           url:    "https://…",
 *           date:   "2026-09-01",
 *           note:   "…"                  // optional: one line on why it matters
 *         }
 *       ]
 *     }
 *
 * A RULE FOR WHATEVER WRITES HERE
 *   Every `news` entry needs a real `url` and a real `source`. An item without
 *   somewhere to check it does not go in. The page renders the source as a link
 *   precisely so that a reader can go and check, which is the only thing that
 *   makes a bot-compiled digest worth reading.
 */
const ISSUES = [
  {
    no: 1,
    date: "2026-08-31",
    title: "创刊号",
    cover: "mag-opener",
    /* Empty on purpose. The bot has not run yet, and the alternative to an
       empty news list is an invented one. The page omits the section. */
    news: []
  }
];

if (typeof module !== "undefined" && module.exports) { module.exports = { ISSUES }; }
