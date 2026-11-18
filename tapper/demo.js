/* Tapper live demo: a cartoon glove on a spring-loaded stick that replaces the pointer inside #stage
 * (the whole hero section).
 *
 * Rig geometry (all in the glove's local frame, origin = fingertip):
 *   - Sprite PNGs are 320x472, drawn at 4px per unit => base scale 0.25 (~80x118 CSS px).
 *   - Fingertip hotspot is at sprite pixel (160, 32); the cuff (stick attach point) is at (176, 448).
 *   - The rig is rotated about the fingertip, so the fingertip always sits exactly under the pointer.
 *
 * Physics: the far end of the stick is a damped spring mass (k=90, c=13) pulled toward a rest point
 * that sits at a fixed angle (REST_ANGLE, leaning bottom-right) from the fingertip. When the pointer
 * moves fast the mass lags and wobbles; the rig angle is the direction fingertip -> mass.
 */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  if (!stage) return;
  const rig = document.getElementById('rig');
  const gloveImg = document.getElementById('gloveImg');
  const stickSvg = document.getElementById('stickSvg');
  const burstLayer = document.getElementById('bursts');
  const hint = document.getElementById('hint');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Constants -------------------------------------------------------------------------------
  const SPR = { w: 320, h: 472, tipX: 160, tipY: 32, cuffX: 176, cuffY: 448 };
  const BASE = 0.25;                 // CSS px per sprite px at scale 1
  const REST_ANGLE = 0.42;           // rad from vertical, stick leans toward bottom-right
  const ANGLE_MIN = -0.35, ANGLE_MAX = 1.25;
  const K = 90, C = 13;              // spring stiffness and damping
  const MOODS = [
    { name: 'Shy finger',    scale: 0.70, stick: 230, jab: 10 },
    { name: 'Polite point',  scale: 0.85, stick: 270, jab: 12 },
    { name: 'Clear signal',  scale: 1.00, stick: 310, jab: 13 },
    { name: 'Hard to miss',  scale: 1.30, stick: 370, jab: 15 },
    { name: 'In your face',  scale: 1.60, stick: 440, jab: 16 },
  ];
  // Same order as the real app's colour menu (macOS system colours).
  const COLORS = ['#000000', '#FFFFFF', '#FF9500', '#FF3B30', '#FF2D55', '#AF52DE', '#007AFF', '#34C759'];
  const SPRITES = { tiny: 'assets/glove-tiny.png', paw: 'assets/glove-paw.png', middle: 'assets/glove-middle.png' };
  const JAB_MS = 120;

  // ---- State -----------------------------------------------------------------------------------
  const st = {
    mood: 2, color: 0, style: 'tiny', sound: false,
    tip: { x: 0, y: 0 },             // fingertip position in stage coordinates
    mass: { x: 0, y: 0 }, vel: { x: 0, y: 0 },
    interacted: false,
    jabStart: -1e9,
    clicks: [],
    last: performance.now(),
    visible: true,
    first: true,
  };

  const m = () => MOODS[st.mood];
  // Localised strings come from i18n.js (loaded first); fall back to English names if it is absent.
  const T = (k, fb) => (window.TapperI18n ? window.TapperI18n.t(k) : fb);
  const sc = () => BASE * m().scale;                       // px per sprite pixel
  const ropeLen = () => (SPR.cuffY - SPR.tipY) * sc() + m().stick; // fingertip -> far end of stick

  // ---- Rig layout (re-run when mood / colour / style change) ------------------------------------
  function layoutRig() {
    const s = sc();
    gloveImg.style.width = SPR.w * s + 'px';
    gloveImg.style.height = SPR.h * s + 'px';
    gloveImg.style.left = -SPR.tipX * s + 'px';
    gloveImg.style.top = -SPR.tipY * s + 'px';

    // Stick: a tapered bar, drawn as an SVG polygon so the outline tapers with it. A CSS mask on the
    // <svg> fades the far end to transparent.
    const topY = (SPR.cuffY - SPR.tipY) * s - 6 * s;         // start slightly under the cuff
    const len = m().stick + 6 * s;
    const w0 = 8 + 8 * m().scale, w1 = w0 * 0.45, pad = 3;
    const W = w0 + pad * 2;
    stickSvg.setAttribute('width', W);
    stickSvg.setAttribute('height', len);
    stickSvg.setAttribute('viewBox', `0 0 ${W} ${len}`);
    const cx = W / 2;
    stickSvg.style.left = (SPR.cuffX - SPR.tipX) * s - cx + 'px';
    stickSvg.style.top = topY + 'px';
    stickSvg.innerHTML =
      `<polygon points="${cx - w0 / 2},0 ${cx + w0 / 2},0 ${cx + w1 / 2},${len} ${cx - w1 / 2},${len}" ` +
      `fill="${COLORS[st.color]}" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>`;
  }

  // Where the glove rests: just inside the right end of the park target, pointing at it.
  const parkEl = document.querySelector('[data-park]');
  function parkPoint() {
    const r = stage.getBoundingClientRect();
    if (!parkEl) return { x: r.width * 0.6, y: r.height * 0.6 };
    const b = parkEl.getBoundingClientRect();
    return { x: b.right - r.left - 22, y: b.bottom - r.top - 12 };
  }

  // ---- Physics + render loop ---------------------------------------------------------------------
  function restPoint() {
    const R = ropeLen();
    return { x: st.tip.x + R * Math.sin(REST_ANGLE), y: st.tip.y + R * Math.cos(REST_ANGLE) };
  }
  function resetMass() {
    const r = restPoint();
    st.mass.x = r.x; st.mass.y = r.y; st.vel.x = 0; st.vel.y = 0;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dtRaw = Math.min(0.05, (now - st.last) / 1000);
    st.last = now;
    if (!st.visible) return;

    // While the pointer is not over the stage, the glove rests pointing at the Download button
    // ([data-park]). It glides back there when the pointer leaves, and teleports there on first paint.
    if (!st.interacted) {
      const p = parkPoint();
      if (st.first) { st.first = false; st.tip.x = p.x; st.tip.y = p.y; resetMass(); }
      else if (Math.abs(st.tip.x - p.x) > 0.5 || Math.abs(st.tip.y - p.y) > 0.5) {
        const k = reduceMotion ? 1 : Math.min(1, dtRaw * 7);
        st.tip.x += (p.x - st.tip.x) * k; st.tip.y += (p.y - st.tip.y) * k;
        if (reduceMotion) resetMass();
      }
    }

    let angle = REST_ANGLE;
    if (!reduceMotion) {
      // Sub-step the integrator for stability at low frame rates.
      const steps = Math.max(1, Math.ceil(dtRaw / (1 / 120)));
      const dt = dtRaw / steps;
      const rest = restPoint();
      for (let i = 0; i < steps; i++) {
        const ax = -K * (st.mass.x - rest.x) - C * st.vel.x;
        const ay = -K * (st.mass.y - rest.y) - C * st.vel.y;
        st.vel.x += ax * dt; st.vel.y += ay * dt;
        st.mass.x += st.vel.x * dt; st.mass.y += st.vel.y * dt;
      }
      angle = Math.atan2(st.mass.x - st.tip.x, st.mass.y - st.tip.y);
      angle = Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, angle));
    }

    // Jab: slide forward along the pointing direction (rig-local -Y) and back.
    let jab = 0;
    if (!reduceMotion) {
      const t = (now - st.jabStart) / JAB_MS;
      if (t >= 0 && t < 1) jab = Math.sin(Math.PI * t) * m().jab;
    }
    // CSS rotate() is clockwise-positive, our angle is measured toward +x (right), hence the minus.
    rig.style.transform =
      `translate3d(${st.tip.x.toFixed(2)}px,${st.tip.y.toFixed(2)}px,0) rotate(${(-angle).toFixed(4)}rad) translate(0,${(-jab).toFixed(2)}px)`;
  }

  // ---- Click burst -------------------------------------------------------------------------------
  const NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function spawnBurst(x, y, big) {
    const k = m().scale;
    const svg = el('svg', { viewBox: '-140 -140 280 280', class: 'burst' + (big ? ' star' : '') });
    svg.style.left = x + 'px';
    svg.style.top = y + 'px';

    if (big) {
      // Jagged white starburst with a black outline, behind the strokes.
      const spikes = 12, pts = [];
      for (let i = 0; i < spikes * 2; i++) {
        const a = (i / (spikes * 2)) * Math.PI * 2 + Math.random() * 0.12;
        const r = (i % 2 ? 36 : 70 + Math.random() * 14) * k;
        pts.push((Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1));
      }
      svg.appendChild(el('polygon', { points: pts.join(' '), fill: '#fff', stroke: '#000', 'stroke-width': 4, 'stroke-linejoin': 'round' }));
    }

    // 7-9 radial strokes, each drawn twice: wide white outline then narrower black core.
    const n = 7 + Math.floor(Math.random() * 3);
    const off = Math.random() * Math.PI * 2;
    const lines = [];
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const r0 = (big ? 44 : 28) * k * 0.9 + 6;
      const r1 = r0 + (22 + Math.random() * 16) * (0.6 + k * 0.4);
      lines.push({ x0: Math.cos(a) * r0, y0: Math.sin(a) * r0, x1: Math.cos(a) * r1, y1: Math.sin(a) * r1 });
    }
    for (const [w, col] of [[9, '#fff'], [4.5, '#000']]) {
      for (const l of lines) {
        svg.appendChild(el('line', { x1: l.x0.toFixed(1), y1: l.y0.toFixed(1), x2: l.x1.toFixed(1), y2: l.y1.toFixed(1), stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }));
      }
    }
    burstLayer.appendChild(svg);
    setTimeout(() => svg.remove(), 520);
  }

  function poke() {
    const now = performance.now();
    st.jabStart = now;
    st.clicks = st.clicks.filter(t => now - t < 700);
    st.clicks.push(now);
    const big = st.clicks.length >= 3 || st.mood >= 3;       // mood 4+ (index 3+) always starbursts
    spawnBurst(st.tip.x, st.tip.y, big);
    knock();
  }

  // ---- Sound: a short synthesized "knock" -----------------------------------------------------------
  let audio = null;
  function knock() {
    if (!st.sound || !audio) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator(), g = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g).connect(audio.destination);
    osc.start(t); osc.stop(t + 0.18);
    // Tiny noise click for the "wood" transient.
    const len = Math.floor(audio.sampleRate * 0.02), buf = audio.createBuffer(1, len, audio.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g2 = audio.createGain();
    f.type = 'lowpass'; f.frequency.value = 1400; g2.gain.value = 0.35;
    src.buffer = buf; src.connect(f).connect(g2).connect(audio.destination); src.start(t);
  }

  // ---- Pointer handling ------------------------------------------------------------------------------
  function setTip(e, teleport) {
    const r = stage.getBoundingClientRect();
    st.tip.x = e.clientX - r.left;
    st.tip.y = e.clientY - r.top;
    if (!st.interacted) { st.interacted = true; hint.classList.add('is-gone'); }
    if (teleport) resetMass();
  }
  stage.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') setTip(e, false); });
  // Mouse leaves the hero: the glove glides back to its resting spot.
  stage.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') st.interacted = false; });
  stage.addEventListener('pointerdown', e => {
    // On touch the glove appears where you tap; there is no hover to follow beforehand.
    setTip(e, e.pointerType === 'touch');
    poke();
  });

  // ---- Controls --------------------------------------------------------------------------------------
  function radioGroup(container, onPick) {
    const items = [...container.querySelectorAll('[role="radio"]')];
    const pick = (btn, focus) => {
      items.forEach(b => { b.setAttribute('aria-checked', b === btn ? 'true' : 'false'); b.tabIndex = b === btn ? 0 : -1; });
      if (focus) btn.focus();
      onPick(btn);
    };
    items.forEach((b, i) => {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
      b.addEventListener('click', () => pick(b, false));
      b.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        pick(items[(i + d + items.length) % items.length], true);
      });
    });
  }

  radioGroup(document.getElementById('styles'), b => { st.style = b.dataset.style; gloveImg.src = SPRITES[st.style]; });
  radioGroup(document.getElementById('swatches'), b => { st.color = +b.dataset.color; layoutRig(); });

  const moodInput = document.getElementById('mood');
  const moodOut = document.getElementById('moodOut');
  function applyMood() {
    st.mood = +moodInput.value - 1;
    moodOut.textContent = `${moodInput.value}/5 · ${T('mood.' + moodInput.value, m().name)}`;
    layoutRig(); resetMass();
  }
  moodInput.addEventListener('input', applyMood);

  const soundBtn = document.getElementById('sound');
  function renderSoundState() {
    soundBtn.querySelector('.state').textContent = st.sound ? T('sound.on', 'On') : T('sound.off', 'Off');
  }
  soundBtn.addEventListener('click', () => {
    st.sound = !st.sound;
    soundBtn.setAttribute('aria-pressed', String(st.sound));
    renderSoundState();
    if (st.sound) {
      // AudioContext must be created from a user gesture.
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      knock();
    }
  });

  // Don't burn CPU when the stage is scrolled away.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { st.visible = es[0].isIntersecting; }, { threshold: 0 }).observe(stage);
  }

  // Preload the other sprites so switching styles is instant.
  Object.values(SPRITES).forEach(s => { const i = new Image(); i.src = s; });

  gloveImg.src = SPRITES[st.style];
  applyMood();
  renderSoundState();
  // Re-render the strings this script owns whenever the language changes.
  document.addEventListener('tapperlang', () => { applyMood(); renderSoundState(); });
  requestAnimationFrame(t => { st.last = t; frame(t); });

  // Test hook (also handy for debugging in the console).
  window.__tapper = st;
})();
