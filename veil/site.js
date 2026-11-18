/*
 * Veil site — small page behaviours that are not part of the live demo:
 *   - .rise blocks fade up the first time they scroll into view
 *   - with prefers-reduced-motion, the demo video does not autoplay
 *   - each settings card (.cp) is sharp only while it is near the middle of the viewport,
 *     and soft-blurred otherwise: the page itself shows what Veil does.
 * Without JavaScript nothing is hidden (the hiding rules are scoped to html.js).
 */
(function () {
  'use strict';
  var root = document.documentElement;

  // Reduced motion: don't autoplay the demo loop; show its controls instead.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.removeAttribute('autoplay'); v.pause(); v.controls = true;
    });
  }

  // Chinese headlines: keep each clause together so a line never ends on one or two
  // stray characters ("…跟著 / 走。"). Clauses are split after CJK punctuation and set
  // inline-block; a clause longer than the line still wraps inside itself.
  function keepPhrases() {
    if (!/^zh/.test(root.lang)) return;
    document.querySelectorAll('.claim, .say').forEach(function (h) {
      var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) if (!n.parentNode.classList.contains('ph')) nodes.push(n);
      nodes.forEach(function (t) {
        var parts = t.nodeValue.match(/[^，。：、；！？]+[，。：、；！？]*/g);
        if (!parts || parts.length < 2) return;
        var frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          var span = document.createElement('span'); span.className = 'ph'; span.textContent = p; frag.appendChild(span);
        });
        t.parentNode.replaceChild(frag, t);
      });
    });
  }
  keepPhrases();
  document.addEventListener('veil:lang', keepPhrases);

  // Homebrew "Copy" buttons: copy the command, say "Copied" for 1.5 s. Where the Clipboard API
  // is missing (plain http, old Safari) the command text is selected instead, one keystroke away.
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var timer;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var tr = function (k) { return window.VeilI18n ? window.VeilI18n.t(k) : k; };
      function select() {
        var code = btn.parentNode.querySelector('code');
        try { var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
      }
      function done() {
        btn.textContent = tr('brew.copied'); btn.classList.add('done');
        clearTimeout(timer);
        timer = setTimeout(function () { btn.textContent = tr('brew.copy'); btn.classList.remove('done'); }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, select);
      else select();
    });
  });

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
