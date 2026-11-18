/*
 * Veil site — small page behaviours that are not part of the live demo:
 *   - .rise blocks fade up the first time they scroll into view
 *   - each settings card (.cp) is sharp only while it is near the middle of the viewport,
 *     and soft-blurred otherwise: the page itself shows what Veil does.
 * Without JavaScript nothing is hidden (the hiding rules are scoped to html.js).
 */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!('IntersectionObserver' in window)) return;
  root.classList.add('js');

  var rise = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); rise.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rise').forEach(function (el) { rise.observe(el); });

  // A card is "in focus" while it crosses the middle band of the viewport.
  var focus = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('in', e.isIntersecting); });
  }, { rootMargin: '-30% 0px -30% 0px' });
  document.querySelectorAll('.cp').forEach(function (el) { focus.observe(el); });
})();
