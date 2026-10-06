// Player: audio-synced live playback, scrubbing, and a frame API for export.
// The music starts at T.pre (after the silent prologue): before that and after
// the song (the silent curtain call) the clock runs on its own.
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, U = MV.U;
  const q = new URLSearchParams(location.search);
  const RENDER = q.has('render');

  MV.loadAssets().then(start).catch((e) => console.error(e));
  function start() {
  MV.buildTimeline();
  TL.finalize();
  if (MV.PORTRAIT) MV.H.framePortrait(T.cut.t0, T.cut.t1);
  const canvas = document.getElementById('mv');
  const scene = (MV.scene = new MV.Scene());
  const post = new MV.Post(canvas);
  const size3D = MV.PORTRAIT ? [270, 480] : [480, 270];
  const voxel = new MV.Voxel(post.gl, size3D[0], size3D[1]);
  const cut = T.cut;

  // audio latency calibration (seconds, + = visuals later)
  const LAT = parseFloat(q.get('lat') || '0');

  MV.renderFrame = (tReal) => {
    const t = TL.vt(tReal);
    const vhs = TL.vhsAt(tReal);
    const pov = TL.pov && t >= TL.pov.t0 && t < TL.pov.t1 ? TL.pov : null;
    const S = scene.render(t, !!pov);
    // portrait: the 16:9-authored camera is widened by k (and nudged by dx / dy / fy)
    const pc = MV.PORTRAIT ? TL.pcam.at(t) : null;
    let tex3D = null;
    if (pov) {
      const sc = pov.scene(t);
      // same widening in first person: scale the vertical field of view like the 2D zoom
      if (pc) sc.cam.fov = 2 * Math.atan(Math.tan((sc.cam.fov || 1.25) / 2) / pc.k);
      tex3D = voxel.render(sc);
    }
    const P = S.post, fx = S.fx;
    const env = T.env(t, 'rms');
    let cam = S.cam;
    if (pc) { const z = cam.zoom * pc.k; cam = Object.assign({}, cam, { zoom: z, x: cam.x + pc.dx, y: cam.y + pc.dy + (pc.fy * MV.VH) / z }); }
    // motion smear from camera velocity (keyframed camera only: shake must not smear)
    let smear = [0, 0];
    const c1 = TL.cam.at(t), c0 = TL.cam.at(t - 1 / 60);
    const vx = (c1.x - c0.x) * c1.zoom, vy = (c1.y - c0.y) * c1.zoom;
    const vr = (c1.roll - c0.roll) * 300 + (c1.yaw - c0.yaw) * 400;
    const vm = Math.hypot(vx + vr, vy);
    if (!pov && vm > 12 && vm < 140) { const k = (Math.min(vm, 60) - 12) / vm; smear = [((vx + vr) * k) / MV.VW, (vy * k) / MV.VH]; }
    const src = { world: scene.world, glowA: scene.glowA, glowB: scene.glowB, screen: scene.screen, tex3D };
    const params = {
      time: t, ca: P.ca + fx.ca, inv: fx.inv, bw: fx.bw, flash: Math.min(1, fx.flash), glitch: Math.max(P.glitch, fx.glitch),
      bloom: P.bloom * (0.85 + env * 0.4), vig: P.vig, desat: P.desat, tintAmt: Math.max(P.tintAmt, P.tint * 0.35), grid: P.grid * U.clamp(S.cam.zoom - 0.6),
      scan: P.scan + vhs * 0.25, vhs, mode3D: !!pov, letter: P.letter, bg: P.bg * (0.7 + env * 0.5), bgHue: P.bgHue, smear, seed: Math.floor(t * 30) % 97,
      flashCol: fx.flashCol || [1, 1, 1], size3D, tint: P.tintCol,
    };
    post.render(src, cam, params);
    return S;
  };

  function resize() {
    if (RENDER) {
      canvas.width = +(q.get('w') || 1920);
      canvas.height = +(q.get('h') || 1080);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = window.innerWidth, vh = window.innerHeight;
    const ar = MV.PORTRAIT ? 9 / 16 : 16 / 9;
    const w = Math.min(vw, vh * ar);
    canvas.style.width = w + 'px';
    canvas.style.height = w / ar + 'px';
    canvas.width = Math.min(MV.PORTRAIT ? 1080 : 1920, Math.round(w * dpr));
    canvas.height = Math.round(canvas.width / ar);
  }
  resize();
  window.addEventListener('resize', resize);

  // choreography validator: white attacks must never touch the soul; blue ones may
  // only pass through it while it is standing still.
  MV.checkHits = (t0 = 0, t1 = T.end, step = 1 / 240) => {
    const out = [];
    let last = null;
    for (let t = t0; t < t1; t += step) {
      const s = TL.soul.at(t);
      if (s.a < 0.5) continue;
      const p = TL.soul.at(t - step);
      const speed = Math.hypot(s.x - p.x, s.y - p.y) / step;
      for (const e of TL.active(t)) {
        if (!e.hit || e.harmless) continue;
        if (e.kind === 'blue' && speed < 15) continue;
        if (e.kind === 'orange' && speed >= 15) continue;
        if (e.hit(t, s.x, s.y)) {
          const key = e.kind + e.t0;
          if (last && last.key === key && t - last.t1 < 0.05) last.t1 = t;
          else out.push((last = { key, kind: e.kind, t0: +t.toFixed(3), t1: t, bar: +T.barOf(t).toFixed(2), speed: Math.round(speed), x: Math.round(s.x), y: Math.round(s.y) }));
        }
      }
    }
    return out.map((o) => Object.assign(o, { t1: +o.t1.toFixed(3) }));
  };
  // perfect-route validator: FIGHT is never selected, and the soul's HP never drops
  MV.checkPacifist = (step = 1 / 60) => {
    const out = [];
    for (let t = 0; t < T.end; t += step) {
      if (TL.btn[0].at(t).sel > 0.5) out.push({ t: +t.toFixed(3), what: 'FIGHT selected' });
      if (TL.hud.at(t).hp < 20) out.push({ t: +t.toFixed(3), what: 'HP below 20' });
      if (out.length > 20) break;
    }
    return out;
  };

  if (RENDER) {
    // export API used by tools/render.cjs
    MV.exportFrame = (t, type = 'image/jpeg', quality = 0.93) => {
      MV.renderFrame(t);
      return canvas.toDataURL(type, quality);
    };
    MV.ready = true;
    const t0 = parseFloat(q.get('t') || '0');
    MV.renderFrame(t0);
    return;
  }

  // ---------------------------------------------------------------- live player
  const audio = document.getElementById('audio');
  const ui = document.getElementById('ui');
  const bar = document.getElementById('bar');
  const info = document.getElementById('info');
  let playing = false, clockT = parseFloat(q.get('t') || String(cut.t0)), clockAt = performance.now();
  const inMusic = (t) => t >= T.pre && t < T.dur - 0.02;
  const now = () => {
    if (!playing) return clockT;
    const est = clockT + (performance.now() - clockAt) / 1000;
    if (!inMusic(est) || audio.paused) return Math.min(est, cut.t1);
    // follow the audio clock (coarse updates) once the music runs
    const at = audio.currentTime + T.pre;
    if (Math.abs(at - est) > 0.05) { clockT = at; clockAt = performance.now(); return at; }
    return est;
  };
  // keep the <audio> element where the clock says it should be
  const syncAudio = (t) => {
    if (!playing) return;
    if (inMusic(t)) {
      if (audio.paused) { audio.currentTime = t - T.pre; audio.play().catch(() => {}); }
    } else if (!audio.paused) audio.pause();
  };
  const play = () => {
    if (clockT >= cut.t1 - 0.01) seek(cut.t0);
    playing = true; clockAt = performance.now(); ui.classList.add('hide');
    syncAudio(clockT);
  };
  const pause = () => { clockT = now(); audio.pause(); playing = false; ui.classList.remove('hide'); };
  const seek = (t) => {
    t = U.clamp(t, cut.t0, cut.t1);
    clockT = t; clockAt = performance.now();
    if (inMusic(t)) audio.currentTime = t - T.pre;
    else { audio.pause(); audio.currentTime = 0; }
    syncAudio(t);
  };
  ui.addEventListener('click', () => (playing ? pause() : play()));
  canvas.addEventListener('click', () => (playing ? pause() : play()));
  document.getElementById('timeline').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(cut.t0 + ((e.clientX - r.left) / r.width) * (cut.t1 - cut.t0));
    e.stopPropagation();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'KeyZ' || e.code === 'Enter') { playing ? pause() : play(); e.preventDefault(); }
    if (e.code === 'ArrowRight') seek(now() + (e.shiftKey ? T.bar : 2));
    if (e.code === 'ArrowLeft') seek(now() - (e.shiftKey ? T.bar : 2));
    if (e.code === 'KeyD') info.classList.toggle('show');
  });
  // ---------------------------------------------------------------- live sound effects
  let actx = null, bufs = {}, scheduled = new Set(), sfxGain = null;
  const SFX = TL.sfx.slice().sort((a, b) => a.t - b.t);
  const initAudio = () => {
    if (actx) return;
    actx = new (window.AudioContext || window.webkitAudioContext)();
    sfxGain = actx.createGain();
    sfxGain.gain.value = 0.55;
    sfxGain.connect(actx.destination);
    for (const [k, url] of Object.entries(window.MV_ASSETS.sfx))
      fetch(url).then((r) => r.arrayBuffer()).then((b) => actx.decodeAudioData(b)).then((d) => (bufs[k] = d)).catch(() => {});
    const SYN = window.MV_SYNTH;
    if (SYN) for (const k of new Set(SFX.map((e) => e.name))) {
      if (bufs[k] || !SYN.has(k)) continue;
      const d = SYN.make(k, actx.sampleRate), b = actx.createBuffer(1, d.length, actx.sampleRate);
      b.copyToChannel(d, 0);
      bufs[k] = b;
    }
  };
  ui.addEventListener('click', initAudio);
  canvas.addEventListener('click', initAudio);
  window.addEventListener('keydown', initAudio);
  let lastSfxT = -1;
  const pumpSfx = (t) => {
    if (!actx || !playing) { lastSfxT = t; return; }
    if (t < lastSfxT - 0.05 || t > lastSfxT + 0.5) scheduled.clear(); // seek
    const ahead = 0.12;
    for (const e of SFX) {
      if (e.t < t - 0.02) continue;
      if (e.t > t + ahead) break;
      const key = e.name + e.t;
      if (scheduled.has(key) || !bufs[e.name]) continue;
      scheduled.add(key);
      const src = actx.createBufferSource(), g = actx.createGain();
      src.buffer = bufs[e.name];
      g.gain.value = e.vol;
      src.connect(g).connect(sfxGain);
      src.start(actx.currentTime + Math.max(0, e.t - t));
    }
    lastSfxT = t;
  };
  function loop() {
    if (playing && now() >= cut.t1) { playing = false; clockT = cut.t1; audio.pause(); ui.classList.remove('hide'); }
    const tc = now();
    syncAudio(tc);
    const t = tc - LAT;
    pumpSfx(t);
    MV.renderFrame(t);
    bar.style.width = (100 * (t - cut.t0)) / (cut.t1 - cut.t0) + '%';
    if (info.classList.contains('show')) {
      const b = T.barOf(t);
      info.textContent = `t=${t.toFixed(2)}  ${t < T.pre ? 'prologue' : `bar ${Math.floor(b)}  beat ${Math.floor((b % 1) * 4) + 1}`}  [${T.section(t).name}]  rating ${Math.round(TL.rating.at(t).v)}`;
    }
    requestAnimationFrame(loop);
  }
  loop();
  }
})();
