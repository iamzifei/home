/*
 * Veil — try-it-live hero.
 *
 * How the effect works:
 *   - Every fake window has its own z-index. Focusing a window gives it the highest one.
 *   - A single "veil" element (backdrop-filter blur + tint + grain) is placed at
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
  // Same order and colours as the app's tint row (light-appearance system colours).
  var SWATCHES = [
    ['As System', '#007aff', 'system'], ['Blue', '#007aff'], ['Purple', '#af52de'], ['Pink', '#ff2d55'],
    ['Red', '#ff3b30'], ['Orange', '#ff9500'], ['Yellow', '#ffcc00'], ['Green', '#34c759'],
    ['Graphite', '#8e8e93'], ['Black', '#0d0d0d']
  ];
  var DUR = 750;   // the app's default transition length (ms)
  var state = {
    on: true, mode: 'deep', blur: 100,
    tint: '#007aff', tintName: 'As System', tintAmt: 0,
    grain: 0.5, mono: 0, transition: 'fade', peek: false
  };

  /* Static film grain, same model as the app: each pixel black or white, laid over the
   * blur with a random opacity in [0, 0.1 × grain]. Regenerated when the slider moves. */
  var grainEl = stage.querySelector('.veil-grain');
  var grainSeed = (function () { var a = new Float32Array(128 * 128 * 2); for (var i = 0; i < a.length; i++) a[i] = Math.random(); return a; })();
  var grainFor = -1;
  function paintGrain() {
    if (!grainEl || grainFor === state.grain) return;
    grainFor = state.grain;
    var cv = document.createElement('canvas'); cv.width = cv.height = 128;
    var ctx = cv.getContext('2d'), img = ctx.createImageData(128, 128), d = img.data;
    for (var i = 0; i < 128 * 128; i++) {
      var v = grainSeed[i * 2] < 0.5 ? 0 : 255;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
      d[i * 4 + 3] = Math.round(grainSeed[i * 2 + 1] * 0.1 * state.grain * 255);
    }
    ctx.putImageData(img, 0, 0);
    grainEl.style.backgroundImage = 'url(' + cv.toDataURL() + ')';
  }

  /* ── Scaling: the stage is a fixed-size canvas scaled to the frame width.
   *  Wide frames use a 1000x640 landscape desk. Phone-width frames switch to a
   *  620x780 portrait desk with the windows re-stacked, so they stay large enough
   *  to read and to tap (about 0.58x instead of 0.36x on a 390px phone). ── */
  var LAYOUTS = {
    wide: { w: 1000, h: 640, pos: {
      'w-notes': [34, 58, 290, 262], 'w-code': [292, 96, 400, 286], 'w-chat': [716, 54, 250, 300],
      'w-music': [52, 376, 316, 208], 'w-cal': [560, 344, 380, 262] } },
    tall: { w: 620, h: 780, pos: {
      'w-notes': [20, 44, 290, 262], 'w-chat': [330, 64, 270, 286], 'w-code': [40, 240, 400, 286],
      'w-music': [300, 470, 300, 208], 'w-cal': [20, 524, 380, 236] } }
  };
  var layout = null;
  function applyLayout(name) {
    var L = LAYOUTS[name];
    layout = name; STAGE_W = L.w; STAGE_H = L.h;
    stage.style.width = L.w + 'px'; stage.style.height = L.h + 'px';
    Object.keys(L.pos).forEach(function (id) {
      var w = document.getElementById(id), p = L.pos[id];
      if (!w) return;
      w.style.left = p[0] + 'px'; w.style.top = p[1] + 'px'; w.style.width = p[2] + 'px'; w.style.height = p[3] + 'px';
    });
  }
  var scale = 1;
  function fit() {
    var want = frame.clientWidth < 640 ? 'tall' : 'wide';
    if (want !== layout) applyLayout(want);
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
    // σ = 0.5 pt per percent on a ~2560 pt-wide screen; this 1000 px desk is ~0.4 of that.
    s.setProperty('--blur', (state.blur * 0.2).toFixed(1) + 'px');
    s.setProperty('--mono', state.mono);
    s.setProperty('--tint', state.tint);
    s.setProperty('--tint-a', (0.75 * state.tintAmt).toFixed(3));
    paintGrain();
    stage.dataset.mode = state.mode;
    stage.dataset.veil = state.on ? 'on' : 'off';
    stage.dataset.peek = state.peek ? '1' : '0';
    stage.dataset.trans = (reduceMotion ? 'none' : state.transition);
  }

  /* ── Focus handling ── */
  var wins = Array.prototype.slice.call(stage.querySelectorAll('.win'));
  var zTop = 10;
  var focused = null;
  var mbApp = document.getElementById('mbApp');

  // Show / hide. Fade is handled by CSS (ease-out in, linear out); From cursor grows or
  // shrinks a soft disc (solid to 35 % of its radius) around the pointer.
  function playTransition(origin, showing) {
    if (reduceMotion || state.transition !== 'cursor' || !veil.animate) return;
    if (cursorAnim) cursorAnim.cancel();
    var o = origin || { x: STAGE_W / 2, y: STAGE_H / 2 };
    var R = Math.ceil(1.2 * Math.hypot(STAGE_W, STAGE_H));
    veil.style.setProperty('--cx', o.x + 'px'); veil.style.setProperty('--cy', o.y + 'px');
    var grow = showing !== false;
    if (!grow) veil.style.opacity = '1';
    var anim = veil.animate([{ '--r': (grow ? 0 : R) + 'px' }, { '--r': (grow ? R : 0) + 'px' }],
      { duration: grow ? DUR * 0.5 : DUR * 0.34, easing: grow ? 'cubic-bezier(0,0,.58,1)' : 'cubic-bezier(.25,.46,.45,.94)' });
    anim.onfinish = function () { veil.style.opacity = ''; };
    cursorAnim = anim;
  }
  var cursorAnim = null;

  // The window that just lost focus blurs in over 0.75 s (ease-out) instead of snapping.
  function blurOut(win) {
    if (!win || !state.on || reduceMotion || !win.animate || !supportsBdf) return;
    var px = (state.blur * 0.2).toFixed(1) + 'px';
    win.style.zIndex = zTop - 1;                        // still above the veil for now
    if (win._blurAnim) win._blurAnim.cancel();
    var a = win._blurAnim = win.animate([{ filter: 'blur(0px) grayscale(0)' }, { filter: 'blur(' + px + ') grayscale(' + state.mono + ')' }],
      { duration: DUR, easing: 'cubic-bezier(.25,.46,.45,.94)' });
    a.onfinish = function () { if (win !== focused) win.style.zIndex = zTop - 3; };
  }

  function focusWin(win, origin) {
    if (win === focused) return;
    zTop += 4;
    win.style.zIndex = zTop;
    veil.style.zIndex = zTop - 2;               // directly beneath the focused window
    var prev = focused;
    if (win._blurAnim) { win._blurAnim.cancel(); win._blurAnim = null; }   // re-focused mid blur-out: sharp now
    if (prev) prev.classList.remove('is-focus');
    win.classList.add('is-focus');
    focused = win;
    if (mbApp) mbApp.textContent = win.dataset.app;
    blurOut(prev);                              // the new window is sharp at once
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
    var r = sw.getBoundingClientRect(), st = stage.getBoundingClientRect();
    playTransition({ x: Math.min(STAGE_W, (r.left - st.left) / scale), y: STAGE_H }, state.on);
    render();
  });

  var blur = $('ctlBlur');
  function showBlur() {
    var off = (window.VeilI18n && window.VeilI18n.t('p.off')) || 'Off';
    $('outBlur').textContent = state.blur === 0 ? off : state.blur + '%';
  }
  document.addEventListener('veil:lang', showBlur);   // re-label "Off" when the language changes
  blur.addEventListener('input', function () { state.blur = +blur.value; showBlur(); render(); });

  segBind($('ctlMode'), 'mode');
  segBind($('ctlTrans'), 'transition');

  // Tint swatches + custom colour
  var tintBox = $('ctlTint');
  function pickTint(name, color, btn) {
    state.tint = color; state.tintName = name; $('outTint').textContent = name;
    tintBox.querySelectorAll('.sw').forEach(function (x) { x.setAttribute('aria-pressed', x === btn ? 'true' : 'false'); });
    if (state.tintAmt === 0) { state.tintAmt = 0.3; $('ctlTintAmt').value = 30; }   // like the app's swatches
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
