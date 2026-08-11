# iamzifei.github.io/home

[中文](README.md) · **English**

My homepage: open-source macOS apps, Claude Code skills, and 《搞到钱再说》.

🔗 **[Live site](https://iamzifei.github.io/home/)**

## What this is

A static single page that groups everything scattered across a few dozen repos
by what it is for, with a description and a screenshot each — so a visitor knows
within thirty seconds what I have built and which piece is useful to them.

- **Bilingual**, toggled top-right, Chinese by default, choice kept in `localStorage`
- **Light and dark**, following the system, with no colour hard-coded anywhere
- **Mobile first**, verified from 390px upward, no horizontal overflow
- **Zero dependencies** — one HTML file, one data file, a few images, no build step
- Star counts refresh from the GitHub API on load in a single request, falling
  back silently to the values in the data file

## Editing the content

The catalogue lives in [`data.js`](data.js). Adding a project means adding an
object:

```js
{
  repo: "your-repo",              // GitHub repo name; the link is derived from it
  name: { zh: "中文名", en: "English name" },   // a plain string if both are the same
  stars: 0,                       // fallback; overwritten by live data
  shot: "assets/xxx.jpg",         // featured categories only, 16:10
  tagline: { zh: "一句话", en: "One line" },
  desc: { zh: "两三句", en: "Two or three sentences" },
}
```

Categories marked `featured: true` render as large screenshot cards; the rest use
compact text cards. Page copy (headings, buttons, footer) is in the `COPY` object
at the top of `index.html`.

### Screenshot rules

Featured cards crop to **16:10** (`object-fit: cover`). The raw screenshots in
each repo have wildly different proportions, so they are composed once through
[`scripts/make-cards.py`](scripts/make-cards.py):

```bash
python3 scripts/make-cards.py
```

It centres a screenshot of any aspect ratio on a 1600×1000 gradient with a soft
shadow, so a tall panel and a wide window sit side by side at the same height.

## Local preview

```bash
python3 -m http.server 8899
# open http://localhost:8899
```

Edit, refresh. There is no build.

## Layout

```
index.html    the page itself: styles, copy, rendering, scroll animation
data.js       the catalogue (categories → items)
assets/       screenshots and icons
scripts/      screenshot composition
```

## About the motion

Elements fade up as they scroll into view, staggered 60ms apart within a group,
capped at six. Hovering lifts a card slightly, scales its screenshot slowly, and
nudges the arrow right.

Every one of those is switched off entirely under
`prefers-reduced-motion: reduce` — not shortened, removed, landing straight on
the final state. Anyone who asked the OS for less motion should see no movement
at all.

## License

Page code MIT. Screenshots and copy belong to their respective projects.
