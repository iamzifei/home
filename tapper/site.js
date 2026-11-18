/* Tapper site behaviour that is not the glove demo:
 *   1. header turns solid (fill + thick rule) once the page scrolls past the top
 *   2. feature rows fade up as they enter the viewport
 *   3. "works everywhere" sticky stack: each screenshot slides up over the previous one as you scroll
 *   4. phone-width download bar appears after the hero and hides again at the final CTA
 */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Header
  const header = document.getElementById('siteHeader');
  const onScrollHeader = () => header.classList.toggle('is-solid', window.scrollY > 24);

  // 2. Reveal: anything whose top has entered the lower 88% of the viewport (or is already above it)
  //    gets .is-in. Checked on scroll rather than with IntersectionObserver so a fast jump (anchor link,
  //    End key) past a row still reveals it.
  let reveals = [...document.querySelectorAll('.reveal')];
  function onScrollReveal() {
    if (!reveals.length) return;
    const limit = window.innerHeight * 0.88;
    reveals = reveals.filter(el => {
      if (reduce || el.getBoundingClientRect().top < limit) { el.classList.add('is-in'); return false; }
      return true;
    });
  }

  // 3. Sticky stack. Progress p runs 0..1 over the track's scroll range; card i (i >= 1) slides in
  //    during the slice [(i-1)/(n-1), i/(n-1)]. Cards underneath shrink a little so the pile reads as a stack.
  const track = document.getElementById('whereTrack');
  const cards = [...document.querySelectorAll('#whereStack .shot')];
  function layoutStack() {
    if (reduce || !track) return;
    const r = track.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / (range || 1)));
    const n = cards.length;
    const pos = p * (n - 1);                          // 0 .. n-1, fractional
    cards.forEach((c, i) => {
      const local = i === 0 ? 1 : Math.min(1, Math.max(0, pos - (i - 1)));
      const eased = 1 - Math.pow(1 - local, 3);
      const depth = Math.max(0, pos - i);             // how far later cards have covered this one
      const scale = 1 - Math.min(depth, 3) * 0.04;
      const lift = -Math.min(depth, 3) * 1.6;         // % of card height, peeks out above
      c.style.transform = `translateY(${(1 - eased) * 115 + lift}%) scale(${scale})`;
      c.style.zIndex = String(i + 1);
    });
  }

  // 4. Mobile bar
  const mbar = document.getElementById('mbar');
  const hero = document.getElementById('stage');
  const final = document.getElementById('get');
  function onScrollBar() {
    if (!mbar) return;
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const atFinal = final.getBoundingClientRect().top < window.innerHeight;
    mbar.classList.toggle('is-on', pastHero && !atFinal);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScrollHeader(); onScrollReveal(); layoutStack(); onScrollBar(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScrollHeader(); onScrollReveal(); layoutStack(); onScrollBar();
})();
