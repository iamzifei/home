/*
 * Veil — try-it-live hero.
 *
 * How the effect works:
 *   - Every fake window has its own z-index. Focusing a window gives it the highest one.
 *   - A single "veil" element (backdrop-filter blur + dim + tint + grain) is placed at
 *     z-index = (focused window z) - 1, so it sits directly beneath the focused window and
 *     above the wallpaper and every other window. Result: only the focused window is sharp.
 *   - If backdrop-filter is unsupported, CSS falls back to blurring the non-focused layers
 *     directly (see .no-bdf in site.css).
 */
(function () {
  'use strict';

  var frame = document.getElementById('deskFrame');
  var stage = document.getElementById('stage');
  var veil = document.getElementById('veil');
  if (!frame || !stage || !veil) return;

  var STAGE_W = 1000, STAGE_H = 640;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsBdf = window.CSS && CSS.supports &&
    (CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'));
  if (!supportsBdf) stage.classList.add('no-bdf');

  /* ── Calendar grid (November 2026 starts on a Sunday) ── */
  (function buildCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;
    var html = 'SMTWTFS'.split('').map(function (d) { return '<span class="h">' + d + '</span>'; }).join('');
    for (var d = 1; d <= 30; d++) html += '<span' + (d === 18 ? ' class="today"' : '') + '>' + d + '</span>';
    grid.innerHTML = html;
  })();

  /* ── State ── */
  var PRESETS = { ambient: { blur: 16, dim: 0.12 }, deep: { blur: 32, dim: 0.4 } };
  var SWATCHES = [
    ['Graphite', '#3a3a3f'], ['Blue', '#0a84ff'], ['Purple', '#bf5af2'], ['Pink', '#ff6fa0'],
    ['Red', '#ff453a'], ['Orange', '#ff9f0a'], ['Yellow', '#ffd60a'], ['Green', '#30d158'],
    ['As System', '#0a7aff', 'system']
  ];
  var state = {
    on: true, mode: 'deep', blur: 32, dim: 0.4,
    tint: '#3a3a3f', tintName: 'Graphite', tintAmt: 0.2,
    grain: 0.15, mono: 0, transition: 'fade', peek: false
  };

  /* ── Scaling: the stage is a fixed 1000x640 canvas scaled to the frame width ── */
  var scale = 1;
  function fit() {
    scale = frame.clientWidth / STAGE_W;
    stage.style.transform = 'scale(' + scale + ')';
    frame.style.height = Math.round(STAGE_H * scale) + 'px';
  }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(frame);
  else window.addEventListener('resize', fit);

  function stagePoint(e) {
    var r = stage.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  }

  /* ── Rendering state into CSS variables ── */
  function render() {
    var s = stage.style;
    s.setProperty('--blur', state.blur + 'px');
    s.setProperty('--dim', state.dim);
    s.setProperty('--mono', state.mono);
    s.setProperty('--tint', state.tint);
    s.setProperty('--tint-a', state.tintAmt);
    s.setProperty('--grain-a', (state.grain * 0.5).toFixed(3));
    stage.dataset.veil = state.on ? 'on' : 'off';
    stage.dataset.peek = state.peek ? '1' : '0';
    stage.dataset.trans = (reduceMotion ? 'none' : state.transition);
  }

  /* ── Focus handling ── */
  var wins = Array.prototype.slice.call(stage.querySelectorAll('.win'));
  var zTop = 10;
  var focused = null;
  var mbApp = document.getElementById('mbApp');

  function playTransition(origin) {
    if (!state.on || reduceMotion || state.transition === 'none' || !veil.animate) return;
    veil.getAnimations().forEach(function (a) { a.cancel(); });
    if (state.transition === 'cursor') {
      var o = origin || { x: STAGE_W / 2, y: STAGE_H / 2 };
      var R = Math.ceil(Math.hypot(Math.max(o.x, STAGE_W - o.x), Math.max(o.y, STAGE_H - o.y)));
      veil.animate(
        [{ clipPath: 'circle(0px at ' + o.x + 'px ' + o.y + 'px)' },
         { clipPath: 'circle(' + R + 'px at ' + o.x + 'px ' + o.y + 'px)' }],
        { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
    } else {
      veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    }
  }

  function focusWin(win, origin) {
    if (win === focused) return;
    zTop += 2;
    win.style.zIndex = zTop;
    veil.style.zIndex = zTop - 1;               // directly beneath the focused window
    if (focused) focused.classList.remove('is-focus');
    win.classList.add('is-focus');
    focused = win;
    if (mbApp) mbApp.textContent = win.dataset.app;
    playTransition(origin);
  }

  // Initial stacking order: code editor on top and focused.
  var order = ['w-notes', 'w-chat', 'w-music', 'w-cal', 'w-code'];
  order.forEach(function (id) {
    var w = document.getElementById(id);
    zTop += 2; w.style.zIndex = zTop;
  });
  zTop -= 0;
  (function init() {
    var top = document.getElementById('w-code');
    focused = top; top.classList.add('is-focus');
    veil.style.zIndex = zTop - 1;
    if (mbApp) mbApp.textContent = top.dataset.app;
  })();

  /* ── Pointer: focus on press, drag by title bar ── */
  var drag = null;
  wins.forEach(function (win) {
    win.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      focusWin(win, stagePoint(e));
      var tb = e.target.closest('.tb');
      if (!tb || !win.contains(tb)) return;
      var p = stagePoint(e);
      drag = { win: win, dx: p.x - win.offsetLeft, dy: p.y - win.offsetTop, id: e.pointerId, tb: tb };
      try { tb.setPointerCapture(e.pointerId); } catch (_) {}
    });
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var p = stagePoint(e), w = drag.win;
    var x = Math.min(STAGE_W - 60, Math.max(-w.offsetWidth + 80, p.x - drag.dx));
    var y = Math.min(STAGE_H - 30, Math.max(26, p.y - drag.dy));
    w.style.left = x + 'px'; w.style.top = y + 'px';
  });
  function endDrag(e) { if (drag && e.pointerId === drag.id) drag = null; }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* ── Peek ── */
  var peekBtn = document.getElementById('ctlPeek');
  var shiftDown = false, peekUntil = 0, peekTimer = null, buttonPeek = false;
  function setPeek(v) { if (state.peek !== v) { state.peek = v; render(); } }
  function releaseShiftPeek() {
    clearTimeout(peekTimer);
    var wait = Math.max(0, peekUntil - Date.now());      // veil stays open at least ~2 s, like the app
    peekTimer = setTimeout(function () { if (!shiftDown && !buttonPeek) setPeek(false); }, wait);
  }
  var last = null;
  frame.addEventListener('pointermove', function (e) {
    var now = performance.now();
    if (last && e.shiftKey && e.pointerType === 'mouse') {
      var dt = Math.max(1, now - last.t);
      var speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt;   // px per ms
      if (speed > 1.1) { shiftDown = true; peekUntil = Date.now() + 2000; clearTimeout(peekTimer); setPeek(true); }
    }
    last = { x: e.clientX, y: e.clientY, t: now };
  });
  window.addEventListener('keydown', function (e) { if (e.key === 'Shift') shiftDown = true; });
  window.addEventListener('keyup', function (e) {
    if (e.key === 'Shift') { shiftDown = false; if (state.peek && !buttonPeek) releaseShiftPeek(); }
  });
  window.addEventListener('blur', function () { shiftDown = false; buttonPeek = false; setPeek(false); });

  function holdStart(e) { if (e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return; if (e.type === 'keydown') e.preventDefault(); buttonPeek = true; peekBtn.classList.add('held'); setPeek(true); }
  function holdEnd(e) { if (e.type === 'keyup' && e.key !== ' ' && e.key !== 'Enter') return; buttonPeek = false; peekBtn.classList.remove('held'); if (!shiftDown) setPeek(false); }
  peekBtn.addEventListener('pointerdown', holdStart);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { peekBtn.addEventListener(t, holdEnd); });
  peekBtn.addEventListener('keydown', holdStart);
  peekBtn.addEventListener('keyup', holdEnd);
  peekBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* ── Controls ── */
  function $(id) { return document.getElementById(id); }
  function segBind(group, key, onChange) {
    var btns = group.querySelectorAll('button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        state[key] = b.dataset.v;
        if (onChange) onChange();
        render();
      });
    });
  }
  function setSeg(group, value) {
    group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === value ? 'true' : 'false'); });
  }

  var sw = $('ctlOn');
  sw.addEventListener('click', function () {
    state.on = !state.on;
    sw.setAttribute('aria-checked', String(state.on));
    render();
    if (state.on) playTransition(null);
  });

  var blur = $('ctlBlur');
  function showBlur() {
    var off = (window.VeilI18n && window.VeilI18n.t('p.off')) || 'Off';
    $('outBlur').textContent = state.blur === 0 ? off : state.blur;
  }
  document.addEventListener('veil:lang', showBlur);   // re-label "Off" when the language changes
  blur.addEventListener('input', function () { state.blur = +blur.value; showBlur(); render(); });

  segBind($('ctlMode'), 'mode', function () {
    var p = PRESETS[state.mode];
    state.blur = p.blur; state.dim = p.dim;
    blur.value = p.blur; showBlur();
  });
  segBind($('ctlTrans'), 'transition');

  // Tint swatches + custom colour
  var tintBox = $('ctlTint');
  function pickTint(name, color, btn) {
    state.tint = color; state.tintName = name; $('outTint').textContent = name;
    tintBox.querySelectorAll('.sw').forEach(function (x) { x.setAttribute('aria-pressed', x === btn ? 'true' : 'false'); });
    if (state.tintAmt === 0) { state.tintAmt = 0.3; $('ctlTintAmt').value = 30; }
    render();
  }
  SWATCHES.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sw' + (s[2] ? ' ' + s[2] : '');
    b.style.setProperty('--c', s[1]); b.title = s[0]; b.setAttribute('aria-label', s[0]);
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () { pickTint(s[0], s[1], b); });
    tintBox.appendChild(b);
  });
  var custom = document.createElement('span');
  custom.className = 'sw custom'; custom.title = 'Custom colour'; custom.setAttribute('aria-pressed', 'false');
  var ci = document.createElement('input');
  ci.type = 'color'; ci.value = '#ff7a59'; ci.setAttribute('aria-label', 'Custom tint colour');
  ci.addEventListener('input', function () { pickTint('Custom', ci.value, custom); });
  custom.appendChild(ci); tintBox.appendChild(custom);

  $('ctlTintAmt').addEventListener('input', function (e) { state.tintAmt = e.target.value / 100; render(); });
  $('ctlGrain').addEventListener('input', function (e) { state.grain = e.target.value / 100; $('outGrain').textContent = e.target.value + '%'; render(); });
  $('ctlMono').addEventListener('input', function (e) { state.mono = e.target.value / 100; $('outMono').textContent = e.target.value + '%'; render(); });

  showBlur();
  render();

  // Test hook (also handy for debugging in the console).
  window.__veilDemo = { state: state, focusWin: focusWin };
})();
