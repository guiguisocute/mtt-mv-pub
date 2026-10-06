// Choreography toolkit. Every attack / camera move is scheduled on the music
// grid (T.at(bar, beat, sixteenth)); negative bars / plain seconds before T.pre
// are the silent prologue. Sections live in src/tl_*.js.
(function () {
  const MV = window.MV, U = MV.U, D = MV.D, T = MV.T, TL = MV.TL, L = MV.LAYOUT;
  const { Track, Steps } = MV;
  const R = Math.round;

  // ---------------------------------------------------------------- tracks
  TL.cam = new Track({ x: 480, y: 270, zoom: 1, roll: 0, pitch: 0, yaw: 0 });
  // portrait framing on top of the (16:9-authored) camera: zoom factor k, world offsets dx / dy,
  // and fy = shift as a fraction of the view height (+ lifts the picture, - drops it)
  TL.pcam = new Track({ k: 0.6, dx: 0, dy: 0, fy: 0 });
  // things the portrait framing must keep in shot: {t0, t1, rect(t) -> [x0, y0, x1, y1]}; and
  // moments it must treat as a cut (besides the camera's own)
  TL.focus = [];
  TL.frameCuts = [];
  TL.box = new Track(Object.assign({ draw: 1, alpha: 1, fill: 1, th: 5, glow: 1 }, L.box));
  TL.soul = new Track({ x: 480, y: 350, rot: Math.PI, sc: 1, sq: 1, a: 0 });
  TL.soulCol = new Steps('yellow');
  TL.aura = new Track({ v: 0 });
  // Mettaton. EX: x, y = feet centre; box form: bx, by = canvas centre
  TL.enemy = new Track({ x: L.enemy[0], y: L.enemy[1], bx: L.boxEnemy[0], by: L.boxEnemy[1], a: 0, reveal: 1, rot: 0, sc: 2, sx: 1, glow: 0.18, ghost: 0, sil: 0, bob: 1, shake: 0, dim: 0 });
  TL.pose = new Steps('idle');
  TL.face = new Steps(0);
  TL.body = new Steps(0);
  TL.limbs = new Track({ arms: 1, legs: 1 });
  TL.boxForm = new Steps(0);
  TL.boxBody = new Steps('idle0');
  TL.boxArms = new Steps('none');
  TL.hud = new Track({ a: 1, nameA: 1, lvA: 1, barA: 1, hp: 20, jit: 0 });
  TL.btn = [0, 1, 2, 3].map(() => new Track({ a: 1, sel: 0, dx: 0, dy: 0 }));
  TL.rating = new Track({ v: 3995, a: 0, dx: 0, dy: 0 });
  TL.tv = new Track({ a: 0, combo: 0, cam: 'CAM 1' });
  TL.post = new Track({ bloom: 1, vig: 0.35, desat: 0, tint: 0, tintAmt: 0, grid: 0.12, scan: 0.05, letter: 0, bg: 1, bgHue: 0, ca: 0.6, glitch: 0 });
  TL.boxHits = [];

  // sections register builders; they run after the assets are loaded
  MV.sections = [];
  MV.buildTimeline = () => { MV.sections.forEach((f) => f()); MV.H.buildRating(); MV.H.buildCombo(); };

  // ---------------------------------------------------------------- sound effects
  // {t, name, vol}: played live through WebAudio and mixed into the export
  TL.sfx = [];
  const sfxLast = {};
  const H = (MV.H = {});
  H.sfx = (t, name, vol = 1) => {
    // limiter: one trigger of the same sound per 40 ms
    const k = name + Math.round(t / 0.04);
    if (sfxLast[k]) { sfxLast[k].vol = Math.max(sfxLast[k].vol, vol); return; }
    TL.sfx.push((sfxLast[k] = { t: +t.toFixed(4), name, vol }));
  };
  H.swell = (tHit, vol = 0.5, name = 'Swell') => H.sfx(tHit - (window.MV_SYNTH ? window.MV_SYNTH.len(name) : 1), name, vol);
  const at = (H.at = T.at);
  H.S16 = T.s16; H.BEAT = T.beat; H.BAR = T.bar;
  H.soulAt = (t) => TL.soul.at(t);
  H.C0 = [L.box.x + L.box.w / 2, L.box.y + L.box.h / 2];
  // music analysis lookups (slot = 16th index from bar 0)
  H.slot = (b, k = 0, s = 0) => Math.round(b * 16 + k * 4 + s);
  H.acc = (b, k, s, band = 'full') => T.acc(H.slot(b, k, s), band);
  H.lead = (b, k = 0, s = 0) => T.A.lead[H.slot(b, k, s)] ?? -1;
  H.bass = (b, k = 0) => T.A.bass[Math.round(b * 4 + k)] ?? -1;
  // 16th positions in bar b where `band` hits above th
  H.hits = (b, band = 'tone', th = 0.5) => { const o = []; for (let s = 0; s < 16; s++) if (H.acc(b, 0, s, band) > th) o.push(s); return o; };

  // ---------------------------------------------------------------- camera helpers
  H.cam = (t0, t1, v, ease = 'inOut') => TL.cam.to(t0, t1, v, ease);
  H.cut = (t, v) => TL.cam.set(t, v);
  H.punch = (t, k = 1, o = {}) => TL.impact(t, Object.assign({ amp: 3 * k, zoom: 0.035 * k, ca: 1.6 * k, dur: 0.25 }, o));
  H.hit = (t, k = 1, o = {}) => TL.impact(t, Object.assign({ amp: 9 * k, zoom: 0.06 * k, ca: 5 * k, flash: 0.22 * k, dur: 0.45 }, o));
  H.bigHit = (t, o = {}) => TL.impact(t, Object.assign({ amp: 18, zoom: 0.12, ca: 14, flash: 0.9, inv: 0.05, bw: 0.034, rot: 0.03, dur: 0.7 }, o));

  // keep a world rect in the portrait frame over [t0, t1] (rect: [x0, y0, x1, y1] or a function of t)
  H.focus = (t0, t1, rect) => { if (MV.PORTRAIT) TL.focus.push({ t0, t1, rect: typeof rect === 'function' ? rect : () => rect }); };

  // ---------------------------------------------------------------- soul helpers
  H.soulTo = (t0, t1, x, y, ease = 'outExpo', extra = {}) => TL.soul.to(t0, t1, Object.assign({ x, y }, extra), ease);
  H.dash = (t, x, y, dur = T.s16 * 1.5, spin = 0) => {
    const p = TL.soul.at(t);
    TL.soul.to(t, t + dur, { x, y, rot: p.rot + spin }, 'outExpo');
    if (spin) TL.soul.set(t + dur + 0.001, { rot: Math.PI });
    TL.burst(t, { x: p.x, y: p.y, n: 8, speed: [30, 90], life: [0.15, 0.35], colors: ['#ffff40', '#ffffff'], z: 30, size: 2 });
  };

  // ---------------------------------------------------------------- box helpers
  H.box = (t0, t1, v, ease = 'outBack') => TL.box.to(t0, t1, v, ease);
  H.boxHit = (t, side, u, amt = 10) => TL.boxHits.push({ t, side, u, amt });

  // ---------------------------------------------------------------- ratings
  // Anchors fix the number at given times; every scored event between two anchors
  // takes a share of that interval's rise proportional to its weight, so the
  // count jumps exactly on the hits and still lands on each anchor.
  TL.rateAnchors = [];
  TL.rateEvents = [];
  H.rateAnchor = (t, v) => TL.rateAnchors.push({ t, v });
  H.score = (t, w = 1) => TL.rateEvents.push({ t, w });
  H.buildRating = () => {
    const A2 = TL.rateAnchors.sort((a, b) => a.t - b.t);
    const E = TL.rateEvents.sort((a, b) => a.t - b.t);
    if (!A2.length) return;
    TL.rating.set(A2[0].t, { v: A2[0].v });
    for (let i = 0; i + 1 < A2.length; i++) {
      const a = A2[i], b = A2[i + 1];
      const ev = E.filter((e) => e.t > a.t && e.t <= b.t);
      const W = ev.reduce((s, e) => s + e.w, 0);
      if (!W) { TL.rating.to(a.t, b.t, { v: b.v }, 'inOut'); continue; }
      let v = a.v;
      for (const e of ev) {
        v += ((b.v - a.v) * e.w) / W;
        TL.rating.to(e.t, e.t + 0.12, { v: Math.round(v) }, 'outExpo');
      }
    }
  };
  // floating "+123" where a hit scores
  H.pop = (t, x, y, str, o = {}) =>
    TL.add({
      t0: t, t1: t + (o.dur || 0.6), z: 62,
      draw(ctx, emi, tt) {
        const u = (tt - t) / (o.dur || 0.6);
        const yy = y - 26 * U.eOut(u), sc = u < 0.08 ? 3 : 2;
        D.text(ctx, str, x, yy, { scale: o.scale || sc, align: 'center', color: o.color || MV.COL.pink, alpha: u > 0.7 ? (1 - u) / 0.3 : 1, outline: '#000000', glow: emi, glowA: 0.4 });
      },
    });

  // combo counter (screen overlay): every scored hit adds one, a miss never happens
  TL.comboTimes = [];
  H.combo = (t) => TL.comboTimes.push(t);
  H.buildCombo = () => {
    const ts = TL.comboTimes.sort((a, b) => a - b);
    ts.forEach((t, i) => TL.tv.to(t, t + 0.001, { combo: i + 1 }, 'step'));
  };
  TL.comboAt = (t) => { let last = -1e9; for (const x of TL.comboTimes) { if (x > t) break; last = x; } return last; };

  // ---------------------------------------------------------------- the yellow soul's shots
  // A shot flies straight up from the soul at SHOT px/s. With a target height it
  // stops there at tHit (burst, score pop); without one it leaves the screen.
  const SHOT = 1100;
  H.SHOT = SHOT;
  TL.shots = [];
  // fire at time t; o: {ty (hit height), score (weight, default 1), pop (string), big}
  H.shoot = (t, o = {}) => {
    const s = TL.soul.at(t);
    const x = o.x ?? s.x, y0 = s.y - 10;
    const ty = o.ty ?? -400;
    const tHit = t + (y0 - ty) / SHOT;
    H.sfx(t, 'HeartShot', o.vol ?? 0.3);
    TL.burst(t, { x, y: y0, n: 3, speed: [20, 60], ang: [-Math.PI * 0.8, -Math.PI * 0.2], life: [0.08, 0.16], colors: ['#ffff80'], size: 2, z: 31 });
    TL.add({
      t0: t, t1: o.ty !== undefined ? tHit : t + 1, z: 32, kind: 'shot',
      at: (tt) => [x, y0 - (tt - t) * SHOT],
      draw(ctx, emi, tt) {
        const y = y0 - (tt - t) * SHOT;
        D.shot(ctx, emi, x, y, { len: o.big ? 22 : 12, w: o.big ? 8 : 4 });
      },
    });
    if (o.ty !== undefined) {
      TL.burst(tHit, { x, y: ty, n: o.big ? 22 : 9, speed: [60, 200], life: [0.12, 0.3], colors: ['#ffff40', '#ffffff', MV.COL.pink], size: [2, 3], z: 45 });
      if (o.score !== 0) {
        H.score(tHit, o.score ?? 1);
        H.combo(tHit);
        if (o.pop !== false) H.pop(tHit, x, ty - 12, o.pop || '+' + (o.popN ?? 50 + ((R(tHit * 997) % 7) * 17)), { color: o.popCol });
      }
    }
    return tHit;
  };
  // fire so that the shot lands at (x, ty) exactly at tHit (the soul is assumed to be under x)
  H.shootAt = (tHit, ty, o = {}) => {
    const s = TL.soul.at(tHit);
    const tf = tHit - (s.y - 10 - ty) / SHOT;
    return H.shoot(tf, Object.assign({ ty }, o));
  };
  // a stream of plain shots (no target) at the given times
  H.volley = (times, o = {}) => times.forEach((t) => H.shoot(t, Object.assign({ vol: 0.18 }, o)));
  // Mettaton's body (torso + head, the part a stray shot could strike) in world space at t,
  // for the pacifist check. Limbs are not counted: he flings them into his own attacks.
  H.enemyBounds = (t) => {
    const en = TL.enemy.at(t);
    if (TL.boxForm.at(t) > 0.5) return { x0: en.bx - 54, x1: en.bx + 54, y0: en.by - 90, y1: en.by + 90 };
    const s = en.sc / 2, lg = TL.limbs.at(t).legs < 0.5;
    return { x0: en.x - 76 * s, x1: en.x + 76 * s, y0: en.y - 196 * s, y1: en.y - (lg ? 60 : 64) * s };
  };

  // ---------------------------------------------------------------- text
  const VOICES = ['Mtt1', 'Mtt2', 'Mtt3', 'Mtt4', 'Mtt5', 'Mtt6', 'Mtt7', 'Mtt8', 'Mtt9'];
  const voice = (x) => VOICES[Math.min(8, Math.floor(U.hash(x) * 9))];
  // typed text: chars revealed at times[i] (or evenly on a step)
  H.say = (t0, t1, str, o = {}) => {
    const chars = [...str];
    const step = o.step ?? T.s16;
    const times = o.times || chars.map((_, i) => t0 + i * step);
    if (o.sfx !== false) times.forEach((tt, i) => {
      if (chars[i] === ' ' || chars[i] === '…' || chars[i] === '。') return;
      const v = o.voice === 'mtt' ? voice(tt * 13.7) : o.voice || 'BattleText';
      H.sfx(tt, v, o.vol ?? 0.3);
    });
    if (!o.screen) {
      // (portrait: the whole line, from its first letter, stays in shot)
      const sc = o.scale || 2, full = D.textWidth(str, { scale: sc }), w = o.wrap ? Math.min(o.wrap, full) : full, rows = o.wrap ? Math.ceil(full / o.wrap) : 1;
      H.focus(t0, t1, (t) => {
        const x = typeof o.x === 'function' ? o.x(t) : o.x ?? L.menuBox.x + 26, y = typeof o.y === 'function' ? o.y(t) : o.y ?? L.menuBox.y + 22;
        const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
        return [x0 - 4, y - 4, x0 + w + 4, y + rows * 18 * sc];
      });
    }
    return TL.add({
      t0, t1, z: o.z ?? 30, screen: o.screen,
      draw(ctx, emi, t) {
        let n = 0;
        for (const tt of times) if (t >= tt) n++;
        n = Math.min(n, chars.length);
        const x = typeof o.x === 'function' ? o.x(t) : o.x ?? L.menuBox.x + 26;
        const y = typeof o.y === 'function' ? o.y(t) : o.y ?? L.menuBox.y + 22;
        const fo = o.fadeOut ?? 0.12, fade = t > t1 - fo ? (t1 - t) / fo : 1;
        const shown = chars.slice(0, n).join('');
        if (o.wrap) {
          let line = '', ly = y, lines = [];
          for (const ch of shown) { line += ch; if (D.textWidth(line, o) > o.wrap) { lines.push(line.slice(0, -1)); line = ch; } }
          lines.push(line);
          lines.forEach((ln, i) => D.text(ctx, ln, x, ly + i * 18 * (o.scale || 2), { color: o.color || '#ffffff', scale: o.scale || 2, alpha: fade, glow: o.glow ? emi : null, shake: o.shake, seed: t * 30 }));
        } else D.text(ctx, shown, x, y, { color: o.color || '#ffffff', scale: o.scale || 2, alpha: fade, glow: o.glow ? emi : null, shake: o.shake, seed: t * 30, align: o.align, outline: o.outline });
      },
    });
  };
  // Mettaton speech bubble, typed with his voice. lines: array of strings; each line's
  // characters are revealed over [ta, tb] (or o.times per char across all lines)
  H.bubble = (t0, t1, lines, o = {}) => {
    const all = lines.join('');
    const n = [...all].length;
    const times = o.times || [...all].map((_, i) => t0 + (o.delay ?? 0.05) + i * (o.step ?? T.s16 / 2));
    times.forEach((tt, i) => { const ch = [...all][i]; if (ch !== ' ' && ch !== '…' && i % (o.every ?? 1) === 0) H.sfx(tt, o.voice ? o.voice : voice(tt * 9.1), o.vol ?? 0.35); });
    const sc = o.scale || 1;
    const w = o.w || Math.max(...lines.map((l) => D.textWidth(l, { scale: sc }))) + 20 * sc;
    const h = o.h || lines.length * 18 * sc + 14 * sc;
    // portrait: a bubble beside him is pulled in toward the centre so the narrow frame holds it
    // (a phone-call bubble's spiky ellipse reaches well past its text box)
    const mx = o.jagged ? w * 0.19 + 4 : 4, my = o.jagged ? h * 0.35 + 4 : 4;
    const bx = (t) => { const x = typeof o.x === 'function' ? o.x(t) : o.x; return MV.PORTRAIT && !o.screen ? U.clamp(x, 480 - 240 + mx, Math.max(480 - 240 + mx, 480 + 240 - w - mx)) : x; };
    const by = (t) => (typeof o.y === 'function' ? o.y(t) : o.y);
    if (!o.screen) H.focus(t0, t1, (t) => [bx(t) - mx, by(t) - my, bx(t) + w + mx, by(t) + h + my]);
    return TL.add({
      t0, t1, z: o.z ?? 58, screen: o.screen,
      draw(ctx, emi, t) {
        let k = 0;
        for (const tt of times) if (t >= tt) k++;
        const shown = [];
        let left = k;
        for (const ln of lines) { const c = [...ln]; shown.push(c.slice(0, Math.max(0, left)).join('')); left -= c.length; }
        const pop = U.eOutBack(U.clamp((t - t0) / 0.1));
        const fade = t > t1 - 0.1 ? (t1 - t) / 0.1 : 1;
        const x = bx(t), y = by(t);
        D.bubble(ctx, x, y, w, h, shown, { tx: o.tx, ty: o.ty, alpha: fade, pop, scale: sc, jagged: o.jagged });
        if (emi && !o.screen) D.rect(emi, x, y, w, h, '#ffffff', 0.06 * fade);
      },
    });
  };
  // a line of dialogue box narration ("* ...") typed in the menu box
  H.narrate = (t0, t1, str, o = {}) => H.say(t0, t1, str, Object.assign({ step: T.s16 / 2 }, o));

  // ---------------------------------------------------------------- portrait framing
  // A vertical frame is far narrower than the 16:9 one the camera was authored for. For every
  // moment of [t0, t1] this measures how far the hand-set portrait view (TL.cam + TL.pcam) would
  // have to open up to hold every live focus rect and the soul, then eases that in (quickly, a
  // moment early) and out (slowly), and bakes the result into TL.pcam (k, dx). Where nothing is
  // missing the view is left exactly as it was. "In shot" means inside
  // the app's safe area: below the top bar - and below the screen HUD while it is up - and above
  // the caption area (MV.PSAFE).
  H.framePortrait = (t0, t1) => {
    const dt = 1 / 60, n = Math.ceil((t1 - t0) / dt) + 1, LEAD = 6, ATT = 2500 * dt, REL = 350 * dt;
    const aspect = 1080 / 1920, P = 8;
    const eL = new Float32Array(n), eR = new Float32Array(n), eV = new Float32Array(n);
    const base = [];
    const focus = TL.focus.slice().sort((a, b) => a.t0 - b.t0);
    for (let i = 0; i < n; i++) {
      const t = t0 + i * dt, c = TL.cam.at(t), p = TL.pcam.at(t);
      const z = c.zoom * p.k, hw = (MV.VH * aspect) / z / 2, hh = MV.VH / z / 2;
      const cx = c.x + p.dx, cy = c.y + p.dy + (p.fy * MV.VH) / z;
      base.push([c, p, cx, hw]);
      let l = Infinity, r = -Infinity, top = Infinity, bot = -Infinity;
      const add = (x0, y0, x1, y1) => { l = Math.min(l, x0); r = Math.max(r, x1); top = Math.min(top, y0); bot = Math.max(bot, y1); };
      for (const f of focus) {
        if (f.t0 > t) break;
        if (t > f.t1) continue;
        const [x0, y0, x1, y1] = f.rect(t);
        add(x0 - P, y0 - P, x1 + P, y1 + P);
      }
      const s = TL.soul.at(t);
      if (s.a > 0.5 && !(TL.pov && t >= TL.pov.t0 && t < TL.pov.t1)) add(s.x - 24, s.y - 24, s.x + 24, s.y + 24);
      if (l === Infinity) continue;
      const hud = TL.rating.at(t).a > 0.01 || TL.tv.at(t).a > 0.01;
      const fTop = 1 - (2 * (hud ? MV.PSAFE[0] : MV.PTOP)) / MV.SH, fBot = 1 - (2 * (MV.SH - MV.PSAFE[1])) / MV.SH;
      eL[i] = Math.max(0, cx - hw - l);
      eR[i] = Math.max(0, r - (cx + hw));
      eV[i] = Math.max(0, Math.max((cy - top) / fTop, (bot - cy) / fBot) - hh) * aspect;
    }
    // ease: open a moment early and fast, close slowly - but never across a cut (a camera cut, or a
    // hard change a section marked in TL.frameCuts): there the framing changes with the picture
    const cutAt = new Uint8Array(n); // cutAt[i]: a cut falls between sample i-1 and i
    for (const tc of TL.cam.segs.filter((g) => g.t1 === g.t0).map((g) => g.t0).concat(TL.frameCuts)) {
      const i = Math.ceil((tc - t0) / dt - 1e-9);
      if (i > 0 && i < n) cutAt[i] = 1;
    }
    const ease = (e) => {
      const a = new Float32Array(n);
      for (let i = 0; i < n; i++) { let m = e[i]; for (let j = i + 1; j < Math.min(n, i + LEAD) && !cutAt[j]; j++) m = Math.max(m, e[j]); a[i] = m; }
      for (let i = 1; i < n; i++) if (!cutAt[i]) a[i] = Math.max(a[i], a[i - 1] - REL);
      for (let i = n - 2; i >= 0; i--) if (!cutAt[i + 1]) a[i] = Math.max(a[i], a[i + 1] - ATT);
      return a;
    };
    const L2 = ease(eL), R2 = ease(eR), V2 = ease(eV);
    const K = [], DX = [];
    for (let i = 0; i < n; i++) {
      const [c, p, cx, hw] = base[i];
      const l = cx - hw - L2[i] - V2[i], r = cx + hw + R2[i] + V2[i];
      K.push(+(((MV.VH * aspect) / (r - l)) / c.zoom).toFixed(4));
      DX.push(+((l + r) / 2 - c.x).toFixed(2));
    }
    TL.pcam.bake(t0, dt, { k: K, dx: DX });
  };

  // ---------------------------------------------------------------- particles / fx
  H.confetti = (t, x, y, o = {}) =>
    TL.burst(t, Object.assign({ x, y, n: 40, speed: [120, 420], ang: [-Math.PI * 0.95, -Math.PI * 0.05], life: [0.8, 1.6], g: 380, drag: 1.6, colors: ['#ff4fd8', '#ffff40', '#3ee0ff', '#ffffff', '#ff7f27'], size: [2, 4], z: 70 }, o));
  // camera-flash strobe: a bright white frame + a whiter-than-white flash ring
  H.flashbulb = (t, k = 1, snd = true) => { if (snd) H.sfx(t, 'Flash', Math.min(0.4, 0.15 + 0.2 * k)); TL.impact(t, { amp: 2 * k, flash: 0.75 * k, ca: 3 * k, dur: 0.25 }); };
})();

// ---------------------------------------------------------------- Mettaton EX attacks (original moves)
(function () {
  const MV = window.MV, U = MV.U, D = MV.D, T = MV.T, TL = MV.TL, H = MV.H, L = MV.LAYOUT;
  const R = Math.round;

  // ---- LEG SWEEP: his long leg (sheet "legBar", 216x26 at 1x) kicks right across the box at
  // height y and slams into the far wall. o: {tHit (the boot hits the far wall), y, dir (+1 =
  // from the left), hold, warn (s of warning lane), scale, speed}
  // First a flashing lane; then the leg whips in with afterimages and a wake of speed lines (an
  // impact frame as it enters), the boot dents the far wall in a spray of sparks, holds, and
  // pulls back. (Silent: the picture carries it, the music is loud enough here.)
  H.legSweep = (o) => {
    const dir = o.dir ?? 1, sc = o.scale || 1.8, img = MV.part(dir > 0 ? 'legBarL' : 'legBarR');
    const len = 216 * sc, thick = 12 * sc, speed = o.speed || 1800, hold = o.hold ?? T.beat * 0.5;
    const b0 = TL.box.at(o.tHit);
    const farX = dir > 0 ? b0.x + b0.w - 3 : b0.x + 3, nearX = dir > 0 ? b0.x : b0.x + b0.w;
    const tEnter = o.tHit - Math.abs(farX - nearX) / speed;
    const tipAt = (t) => {
      if (t < o.tHit) return farX - dir * (o.tHit - t) * speed;
      if (t < o.tHit + hold) return farX;
      return farX - dir * (t - o.tHit - hold) * speed * 1.3;
    };
    const t0 = o.tHit - (len + 300) / speed, t1 = o.tHit + hold + (len + 300) / (speed * 1.3);
    // the sheet leg points right with its boot at x~150: the boot tip is the lead edge
    const leftAt = (t) => tipAt(t) - (dir > 0 ? 150 * sc : 66 * sc);
    const warn = o.warn ?? T.s16 * 4;
    TL.add({
      t0: o.tHit - warn, t1: tEnter + 0.05, z: 2, clip: 'box',
      draw(ctx, emi, t) {
        const b = TL.box.at(t);
        D.warn(ctx, emi, b.x, o.y - thick / 2 - 4, b.w, thick + 8, t);
        if (Math.floor(t * 12) % 2 === 0) D.text(ctx, '!', dir > 0 ? b.x + 14 : b.x + b.w - 14, o.y - 16, { scale: 2, align: 'center', color: '#ff2030', outline: '#000000' });
      },
    });
    TL.impact(tEnter, { amp: 10, dx: dir * 1.2, zoom: 0.04, ca: 9, inv: 0.025, dur: 0.4 });
    H.hit(o.tHit, o.shake ?? 0.9, { dx: dir, flash: 0.12 });
    const u = (o.y - b0.y) / b0.h;
    H.boxHit(o.tHit, dir > 0 ? 'right' : 'left', dir > 0 ? u : 1 - u, 16);
    TL.burst(o.tHit, { x: farX, y: o.y, n: 22, speed: [120, 380], ang: dir > 0 ? [Math.PI * 0.55, Math.PI * 1.45] : [-Math.PI * 0.45, Math.PI * 0.45], life: [0.15, 0.4], colors: ['#ffffff', '#ffe24a', '#ff7f27'], size: [2, 3], z: 46 });
    return TL.add({
      t0, t1, z: o.z ?? 26, kind: 'white',
      draw(ctx, emi, t) {
        const tip = tipAt(t), y = o.y, v = Math.abs(tipAt(t) - tipAt(t - 1 / 60)) * 60;
        // afterimages and a wake of speed lines while it is moving fast
        if (v > 400) {
          for (let k = 3; k >= 1; k--) {
            ctx.save(); ctx.globalAlpha = 0.34 - k * 0.08; ctx.translate(R(leftAt(t - k * 0.018)), R(y - 13 * sc)); ctx.scale(sc, sc);
            ctx.drawImage(MV.sil(img, k % 2 ? MV.COL.pink : MV.COL.cyan), 0, 0); ctx.restore();
          }
          for (let i = 0; i < 10; i++) {
            const h = U.hash(i * 7.3 + R(t * 30)), l = 40 + h * 90;
            D.rect(ctx, tip - dir * (30 + i * 26 + h * 20), y - 30 + i * 6 + (h - 0.5) * 6, -dir * l, 1, '#ffffff', 0.55);
          }
        }
        ctx.save(); ctx.translate(R(leftAt(t)), R(y - 13 * sc)); ctx.scale(sc, sc);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        if (emi) { emi.globalAlpha = 0.35; emi.drawImage(MV.lines(img), R(leftAt(t)), R(y - 13 * sc), 216 * sc, 26 * sc); emi.globalAlpha = 1; }
      },
      hit(t, px, py) {
        const tip = tipAt(t);
        const x0 = dir > 0 ? tip - 150 * sc : tip, x1 = dir > 0 ? tip : tip + 150 * sc;
        return px > x0 - 4 && px < x1 + 4 && Math.abs(py - o.y) < thick / 2 + 4;
      },
      tipAt,
    });
  };

  // ---- TELESCOPING FIST WITH A YELLOW BLOCK (the original first EX turn): his arm shoots in
  // through one wall of the box - a white fist (the sheet's glove) on a chain of white blocks
  // running out of the wall, one yellow block sliding to and fro along the chain - and the arm
  // sinks toward the soul. Shot in the yellow block (as it slides over the soul's aim), the
  // arm snaps back through the wall; left alone it sweeps on down.
  // o: {tA (starts reaching in), side (-1: from the left wall, 1: from the right), tip (the
  //     fist's knuckles), bx (where the yellow block is at tShot), amp (slide half-width),
  //     y0 (row y at tA), vy (px/s down), tShot (null: never shot), pop}
  const FIST = 20, LINK = 12; // fist size, chain pitch (10 px blocks)
  H.fist = (o) => {
    const b = TL.box.at(o.tA);
    const wall = o.side < 0 ? b.x - 4 : b.x + b.w + 4;
    const tip = o.tip ?? o.bx - o.side * 34;
    const amp = o.amp ?? 14, PER = T.beat * 2, tRef = o.tShot ?? o.tA + T.beat;
    const IN = 0.09, OUT = 0.13, tBack = o.tShot != null ? o.tShot + 0.06 : Infinity;
    const yAt = (t) => o.y0 + (t - o.tA) * o.vy;
    // (knuckles: from behind the wall out to the tip; back out through the wall when shot)
    const tipAt = (t) => {
      if (t >= tBack) return U.lerp(tip, wall + o.side * (FIST + 4), U.eIn(U.clamp((t - tBack) / OUT)));
      return U.lerp(wall + o.side * (FIST + 4), tip, U.eOutExpo(U.clamp((t - o.tA) / IN)));
    };
    // the yellow block: slides through bx at tShot (and holds there once hit), kept on the chain
    const yellowAt = (t) => {
      const tp = tipAt(t);
      const x = o.tShot != null && t >= o.tShot ? o.bx : o.bx + amp * Math.sin((U.TAU * (t - tRef)) / PER);
      return o.side < 0 ? Math.min(x, tp - FIST - 6) : Math.max(x, tp + FIST + 6);
    };
    const t1 = o.tShot != null ? tBack + OUT + 0.02 : o.tA + (b.y + b.h + 40 - o.y0) / o.vy;
    H.sfx(o.tA, 'SwipeShort', o.vol ?? 0.12);
    H.boxHit(o.tA + IN, o.side < 0 ? 'left' : 'right', o.side < 0 ? 1 - (yAt(o.tA) - b.y) / b.h : (yAt(o.tA) - b.y) / b.h, 5);
    if (o.tShot != null) {
      H.shootAt(o.tShot, yAt(o.tShot) + 6, { x: o.bx, pop: o.pop, popCol: '#ffe24a' });
      H.sfx(o.tShot, 'LitHit', 0.28);
      H.sfx(tBack, 'Pullback', 0.22);
      TL.burst(o.tShot, { x: o.bx, y: yAt(o.tShot), n: 12, speed: [60, 200], life: [0.12, 0.3], colors: ['#ffff40', '#ffffff', '#ffb000'], size: [2, 3], z: 46 });
    }
    return TL.add({
      t0: o.tA, t1, z: o.z ?? 8, kind: 'white', clip: 'box', // (box-clipped layers are z 0..10)
      draw(ctx, emi, t) {
        const y = yAt(t), tp = tipAt(t);
        // the chain, from behind the fist back out through the wall
        for (let x = tp + o.side * (FIST + 2 + LINK / 2); o.side < 0 ? x > wall - 12 : x < wall + 12; x += o.side * LINK) {
          D.rect(ctx, x - 5, y - 5, 10, 10, '#ffffff');
          D.rect(ctx, x - 5, y + 4, 10, 1, '#9a9a9a');
        }
        if (emi) D.rect(emi, Math.min(tp, wall), y - 6, Math.abs(tp - wall), 12, '#ffffff', 0.12);
        // the fist, knuckles first (the glove clenches as it is yanked back)
        MV.spr(ctx, MV.part(t >= tBack ? 'cup1' : 'cup0'), tp + o.side * (FIST / 2), y, { rot: o.side < 0 ? Math.PI / 2 : -Math.PI / 2 });
        if (emi) D.rect(emi, Math.min(tp, tp + o.side * FIST) - 2, y - 11, FIST + 4, 22, '#ffffff', 0.2);
        // the yellow block: slides while live, flashes hollow when shot
        let f = 0;
        if (o.tShot != null && t >= o.tShot) f = 1 + Math.min(2, Math.floor((t - o.tShot) / 0.03));
        const yx = yellowAt(t);
        MV.spr(ctx, MV.part('yblock' + f), yx, y, { scale: 0.7 });
        if (emi) D.rect(emi, yx - 10, y - 10, 20, 20, '#ffe040', f === 3 ? 0.2 : 0.55);
      },
      hit(t, px, py) {
        const y = yAt(t), tp = tipAt(t);
        const x0 = Math.min(wall, tp), x1 = Math.max(wall, tp);
        if (Math.abs(tp - wall) < 4 || px < x0 - 6 || px > x1 + 6) return false;
        // (the fist is taller than the chain)
        return Math.abs(py - y) < (Math.abs(px - (tp + o.side * FIST / 2)) < FIST / 2 + 6 ? 17 : 13);
      },
    });
  };

  // ---- UMBRELLA BOTS: a mini Mettaton floats down under an umbrella and lobs hearts.
  // Pacifist: the soul never shoots a bot, only the hearts it throws (o.shotHearts);
  // when its act is over the bot floats back up and off stage.
  // o: {t0, x, y0, y1 (float to), throws: [t...], t1 (starts leaving), heart: {vx, vy, t1, tPop}}
  H.umbrella = (o) => {
    const fall = o.fall ?? 40; // px/s drift after arriving
    const tLeave = o.t1 ?? o.t0 + 2;
    const posAt = (t) => {
      const u = U.clamp((t - o.t0) / 0.35);
      let y = U.lerp(o.y0, o.y1, U.eOut(u)) + Math.max(0, Math.min(t, tLeave) - o.t0 - 0.35) * fall;
      if (t > tLeave) y -= (t - tLeave) ** 2 * 900;
      return [o.x + Math.sin((t - o.t0) * 5 + o.x) * 4, y];
    };
    o.posAt = posAt;
    const hearts = (o.throws || []).map((tt, i) => {
      const [x, y] = posAt(tt);
      H.sfx(tt, 'Arrow', 0.2);
      const hv = (o.hearts && o.hearts[i]) || {};
      return H.heart(Object.assign({ t0: tt, x0: x + 18, y0: y + 18, vx: 0, vy: 240, t1: tt + 1.6 }, hv));
    });
    TL.add({
      t0: o.t0, t1: tLeave + 0.5, z: o.z ?? 24, kind: 'prop',
      draw(ctx, emi, t) {
        const [x, y] = posAt(t);
        let f = Math.floor((t - o.t0) / 0.06) % 8;
        for (const tt of o.throws || []) if (t >= tt - 0.2 && t < tt + 0.2) f = 8 + Math.min(2, Math.floor((t - tt + 0.2) / 0.13));
        MV.spr(ctx, MV.part('umb' + f), x, y, { scale: o.scale || 1 });
        if (emi) { emi.globalAlpha = 0.18; MV.spr(emi, MV.lines(MV.part('umb' + f)), x, y); emi.globalAlpha = 1; }
      },
    });
    return hearts;
  };
  // ---- HEART BULLET: white heart, linear drift (o.path(t) overrides). With tPop the soul's
  // shot bursts it there (confetti, score) - the event ends at tPop.
  H.heart = (o) => {
    const t1 = o.tPop ?? o.t1;
    const ev = TL.add({
      t0: o.t0, t1, z: o.z ?? 27, kind: 'white', clip: o.clip ?? null,
      pos(t) { if (o.path) return o.path(t); const d = t - o.t0; return [o.x0 + (o.vx || 0) * d, o.y0 + (o.vy || 0) * d + 0.5 * (o.g || 0) * d * d]; },
      draw(ctx, emi, t) {
        const [x, y] = this.pos(t);
        MV.spr(ctx, MV.part(o.black ? 'heartB' : 'heartW'), x, y, { scale: o.scale || 1, rot: o.rot ? o.rot(t) : 0 });
        if (emi) D.rect(emi, x - 8, y - 8, 16, 16, '#ffffff', 0.25);
      },
      hit(t, px, py) { const [x, y] = this.pos(t); return Math.hypot(px - x, py - y) < 10 * (o.scale || 1) + 3; },
    });
    if (o.tPop) {
      const [px, py] = ev.pos(o.tPop);
      TL.burst(o.tPop, { x: px, y: py, n: 16, speed: [60, 220], life: [0.2, 0.5], colors: ['#ffffff', MV.COL.pink, '#ffff40'], size: [2, 3], z: 46 });
      H.sfx(o.tPop, 'Burst', 0.22);
    }
    return ev;
  };
  // position of a heart (or any event with pos) at time t
  H.posOf = (ev, t) => ev.pos(t);

  // ---- BOMB BLOCK -> PLUS BLAST. A block (1x, 20x20) drifts; shot at tBoom it swells into a
  // plus and fires beams along its row and column (the original bomb box).
  // o: {t0, pos(t)->[x,y], tBoom, span:{x0,x1,y0,y1} (beam extent), yellow (the flashing variant)}
  H.bombBlock = (o) => {
    const tB = o.tBoom, dur = o.beamDur ?? 0.28;
    const posAt = (t) => o.pos(Math.min(t, tB));
    TL.add({
      t0: o.t0, t1: tB + 0.02, z: o.z ?? 25,
      draw(ctx, emi, t) {
        const [x, y] = posAt(t);
        const warm = o.warm ? U.clamp((t - (tB - o.warm)) / o.warm) : 0;
        const name = warm > 0 ? 'yblock' + Math.min(3, Math.floor(warm * 4)) : 'boom0';
        MV.spr(ctx, MV.part(name), x, y, { scale: o.scale || 1 });
        if (emi && warm > 0) D.rect(emi, x - 12, y - 12, 24, 24, '#ffff40', 0.4 * warm);
      },
    });
    H.plus(tB, () => posAt(tB), o);
  };
  H.plus = (tB, where, o = {}) => {
    const dur = o.beamDur ?? 0.28;
    const W = o.beamW ?? 18;
    H.sfx(tB, 'Bomb', o.vol ?? 0.4);
    H.hit(tB, o.shake ?? 0.6, { flash: 0.12 });
    const p = () => (typeof where === 'function' ? where() : where);
    TL.add({
      t0: tB, t1: tB + dur + 0.12, z: o.z ?? 34, kind: 'white',
      draw(ctx, emi, t) {
        const [x, y] = p();
        const u = (t - tB) / dur;
        // the block swells into the plus (6 frames), then the beams thin out (7 frames)
        const f = Math.min(6, Math.floor((t - tB) / 0.02));
        if (u < 1) MV.spr(ctx, MV.part('boom' + f), x, y, { scale: (o.scale || 1) * (1 + 0.3 * Math.exp(-(t - tB) * 20)) });
        const w = W * (u < 0.15 ? U.eOut(u / 0.15) : u < 1 ? 1 : Math.max(0, 1 - (u - 1) / 0.12 * 8)) * (1 + 0.08 * Math.sin(t * 90));
        if (w < 0.5) return;
        const S2 = o.span || { x0: x - 1200, x1: x + 1200, y0: y - 900, y1: y + 900 };
        // white beams with the sheet's black inner stripes
        D.rect(ctx, S2.x0, y - w / 2, S2.x1 - S2.x0, w, '#ffffff');
        D.rect(ctx, x - w / 2, S2.y0, w, S2.y1 - S2.y0, '#ffffff');
        if (w > 8) { D.rect(ctx, S2.x0, y - 1, S2.x1 - S2.x0, 2, '#000000', 0.8); D.rect(ctx, x - 1, S2.y0, 2, S2.y1 - S2.y0, '#000000', 0.8); }
        if (emi) { D.rect(emi, S2.x0, y - w, S2.x1 - S2.x0, w * 2, '#ffffff', 0.5); D.rect(emi, x - w, S2.y0, w * 2, S2.y1 - S2.y0, '#ffffff', 0.5); }
      },
      hit(t, px, py) {
        const u = (t - tB) / dur;
        if (u < 0.1 || u > 1) return false;
        const [x, y] = p();
        const S2 = o.span || { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 };
        // (each arm only where it is drawn)
        return (Math.abs(px - x) < W / 2 + 5 && py > S2.y0 && py < S2.y1) || (Math.abs(py - y) < W / 2 + 5 && px > S2.x0 && px < S2.x1);
      },
    });
  };
  // ---- FALLING PROP, shot by the soul: a white block / heart / bomb drops from above and is
  // met by a shot at (x, ty) exactly at tHit. A bomb then bursts into the plus (its vertical
  // beam runs down through the box: the soul must be gone from that column in time).
  // o: {tHit, x, ty, kind: 'box'|'heart'|'heartB'|'bomb'|'arrow', v (fall speed), score, pop, span, noShot}
  H.prop = (o) => {
    const v = o.v ?? 360, t0 = o.t0 ?? o.tHit - (o.ty + 80) / v;
    const kind = o.kind || 'box';
    const img = { box: 'boom0', heart: 'heartW', heartB: 'heartB', bomb: 'bomb', arrow: 'arrowBlock' }[kind];
    const pos = (t) => [o.x + (o.sway ? Math.sin((t - t0) * 6 + o.x) * o.sway : 0), o.ty - (o.tHit - t) * v];
    const ev = TL.add({
      t0, t1: o.tHit, z: o.z ?? 28, kind: 'white', pos,
      draw(ctx, emi, t) {
        const [x, y] = pos(t);
        MV.spr(ctx, MV.part(img), x, y, { scale: o.scale || 1, rot: kind === 'bomb' ? Math.sin(t * 9) * 0.2 : 0 });
        if (emi) D.rect(emi, x - 10, y - 10, 20, 20, kind === 'bomb' ? '#ff4040' : '#ffffff', 0.2);
      },
      hit(t, px, py) { const [x, y] = pos(t); return Math.abs(px - x) < 12 && Math.abs(py - y) < 12; },
    });
    if (!o.noShot) H.shootAt(o.tHit, o.ty, { x: o.x, score: o.score, pop: o.pop, popCol: o.popCol });
    const [px, py] = pos(o.tHit);
    if (kind === 'bomb') H.plus(o.tHit, [px, py], { span: o.span, beamDur: o.beamDur, beamW: o.beamW, vol: 0.35 });
    else {
      TL.burst(o.tHit, { x: px, y: py, n: 14, speed: [60, 220], life: [0.15, 0.4], colors: kind.startsWith('heart') ? ['#ffffff', MV.COL.pink, '#ff9ae8'] : ['#ffffff', '#ffff40'], size: [2, 3], z: 46 });
      H.sfx(o.tHit, kind.startsWith('heart') ? 'Burst' : 'Break1', 0.18);
    }
    return ev;
  };

  // ---- ACT menu: the four options in the dialogue box, the soul hopping between them
  // picks: [[t, index]...] (index 0..3: 查看 自夸 / 摆姿势 翻脸), t1 = menu gone
  H.ACT = ['查看', '自夸', '摆姿势', '翻脸'];
  H.actMenu = (t0, t1, picks, o = {}) => {
    const MB = L.menuBox;
    const optPos = (i) => [MB.x + 60 + (i % 2) * 280, MB.y + 26 + Math.floor(i / 2) * 36];
    TL.add({
      t0, t1, z: 30,
      draw(ctx, emi, t) {
        H.ACT.forEach((s, i) => { const [x, y] = optPos(i); D.text(ctx, '* ' + s, x, y, { scale: 2 }); });
      },
    });
    picks.forEach(([t, i], k) => {
      const [x, y] = optPos(i);
      TL.soul.set(t, { x: x - 22, y: y + 16, a: 1 });
      H.sfx(t, k ? 'MenuCursor' : 'MenuSelect', 0.4);
    });
    if (o.select) H.sfx(o.select, 'MenuSelect', 0.5);
    return optPos;
  };

  // ---- LIGHTNING BOLT: spun out of the core, flies straight
  H.bolt = (o) =>
    TL.add({
      t0: o.t0, t1: o.t1, z: o.z ?? 27, kind: 'white',
      pos(t) { const d = t - o.t0; return [o.x0 + o.vx * d, o.y0 + o.vy * d]; },
      draw(ctx, emi, t) {
        const [x, y] = this.pos(t);
        MV.spr(ctx, MV.part('bolt'), x, y, { rot: Math.atan2(o.vy, o.vx) + Math.PI / 2, scale: o.scale || 1 });
        if (emi) D.rect(emi, x - 10, y - 10, 20, 20, '#ffffa0', 0.4);
      },
      hit(t, px, py) { const [x, y] = this.pos(t); return Math.hypot(px - x, py - y) < 9; },
    });
})();
