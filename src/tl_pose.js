// Bars 24-39: POSE. The soul picks "摆姿势"... and cannot: it is a heart. Mettaton, ever the
// director: "then do it YOUR way!" - and the show turns into rhythm games a heart can play.
// 25-31: the soul as the CURSOR (an osu! homage in the show's own clothes). The box throws
//        its walls wide over the stage and he calls camera marks onto it on the brass hits:
//        TV focus brackets close in on each numbered mark, the soul takes the shot (a
//        flashbulb, a ratings pop), runs of marquee bulbs lead mark to mark and make the
//        slider tracks it rides, his leg kicks across the rows it is not in, and a ring of
//        bulbs round his heart core is the spinner. Bar 28, "smile for the camera!": the
//        stage goes dark but for a follow spot on the soul, until the flashbulb pops on 29.
// 32-37: the field narrows into sixteen falling lanes (a CHUNITHM homage).
// 38-39: the essay (the original turn).
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const MB = L.menuBox;
  const [ex, ey] = L.enemy;
  const YHIT = 452, YTOP = 300; // the falling lanes (32-37)

  H.rateAnchor(at(32), 6118);
  H.rateAnchor(at(38), 6640);
  H.rateAnchor(at(40), 7044);

  // ---------------------------------------------------------------- bar 24: POSE... you can't
  const t24 = at(24);
  H.box(t24, t24 + 0.12, MB, 'outExpo');
  TL.soul.set(t24 + 0.05, { a: 0 });
  H.actMenu(t24 + 0.05, at(24, 1, 2), [[t24 + 0.05, 1], [at(24, 0, 2), 2]], { select: at(24, 1) });
  H.narrate(at(24, 1, 2), at(24, 3), '* 你试着摆个姿势……', { step: S16 / 2 });
  H.narrate(at(24, 3), at(25), '* 但你是一颗心。', { step: S16 / 2 });
  // the heart wiggles, trying
  TL.soul.set(at(24, 1, 2), { a: 1, x: 480, y: MB.y + 96, rot: Math.PI });
  for (let s = 0; s < 6; s++) {
    TL.soul.to(at(24, 1, 2 + s), at(24, 1, 3 + s), { rot: Math.PI + (s % 2 ? 0.35 : -0.35), sq: s % 2 ? 1.2 : 0.85 }, 'outExpo');
    H.sfx(at(24, 1, 2 + s), 'Squeak', 0.14);
  }
  TL.soul.to(at(24, 3), at(24, 3, 1), { rot: Math.PI, sq: 1 }, 'out');
  H.sfx(at(24, 3), 'Rimshot', 0.35);
  TL.pose.set(at(24, 1), 'shrug'); TL.face.set(at(24, 1), 8);
  H.bubble(at(24, 3, 2), at(25, 2), ['那就用你自己的方式！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 3 });
  TL.pose.set(at(24, 3, 2), 'pointUp'); TL.face.set(at(24, 3, 2), 3);

  // ---------------------------------------------------------------- 25-31: the cursor
  const PF = { x: 296, y: 78, w: 368, h: 336 };
  const X0 = PF.x + 34, X1 = PF.x + PF.w - 34, Y0 = PF.y + 34, Y1 = PF.y + PF.h - 34;
  const t25 = at(25), AR = BEAT * 1.5;
  H.box(at(24, 3, 3), t25, Object.assign({ fill: 0, th: 3 }, PF), 'outExpo');
  TL.hud.to(at(24, 3, 2), t25, { a: 0 }, 'out');
  TL.btn.forEach((b) => b.to(at(24, 3, 2), t25, { a: 0, dy: 30 }, 'in2'));
  TL.rating.to(at(24, 3, 2), t25, { dx: -92 }, 'outExpo');
  H.cam(at(24, 3, 2), t25, { x: 480, y: 246, zoom: 1.06, pitch: 0.04, roll: 0, yaw: 0 }, 'inOut');
  TL.tv.set(t25, { cam: 'CAM 3' });
  H.sfx(t25, 'SegaPower2', 0.4);
  H.hit(t25, 1, { flash: 0.3, flashCol: [1, 0.6, 0.9] });
  H.osuField(t25, at(32), PF);

  // ---- the chart: the brass hits, a new combo on every downbeat, one slider per bar where
  // the longest rest lets it run
  const objs = [];
  for (let b = 25; b < 31; b++) {
    const hs = [];
    for (let s = 2; s <= 14; s++) { const v = H.acc(b, 0, s, 'tone'); if (v > 0.4) hs.push([s, v]); }
    hs.sort((a, c) => c[1] - a[1]);
    const pick = [0, ...hs.slice(0, 6).map((h) => h[0]).sort((a, c) => a - c)].filter((s, i, a) => i === 0 || s - a[i - 1] >= 2);
    const bar = pick.map((s, i) => ({ t: at(b, 0, s), b, s, n: i + 1, m: H.lead(b, 0, s), big: s === 0 }));
    // the slider: the object followed by the longest gap (at least 5 sixteenths)
    let best = null;
    bar.forEach((o, i) => { const g = (i + 1 < bar.length ? bar[i + 1].s : 16) - o.s; if (g >= 5 && (!best || g > best.g)) best = { o, g }; });
    if (best) { best.o.len16 = Math.min(best.g - 2, 6); best.o.rev = best.o.len16 >= 4 && b % 2 === 1; }
    objs.push(...bar);
  }
  // ---- placement: distance grows with the gap, the turn follows the melody's contour
  const place = (x, y, a, d) => {
    for (let k = 0; k < 14; k++) {
      const nx = x + Math.cos(a) * d, ny = y + Math.sin(a) * d;
      if (nx > X0 && nx < X1 && ny > Y0 && ny < Y1) return [nx, ny, a];
      a += 0.62;
    }
    return [U.clamp(x, X0, X1), U.clamp(y, Y0, Y1), a];
  };
  let ang = -0.4, prevM = 69;
  objs.forEach((o, i) => {
    if (i === 0) { o.x = 392; o.y = 292; }
    else {
      const p = objs[i - 1], g = (o.t - p.tEnd) / S16;
      const d = U.clamp(26 + g * 25, 44, 150);
      ang += (o.m >= prevM ? 1 : -1) * (0.7 + 0.8 * U.hash(i * 3.7));
      [o.x, o.y, ang] = place(p.ex, p.ey, ang, d);
    }
    if (o.m > 0) prevM = o.m;
    o.tEnd = o.t; o.ex = o.x; o.ey = o.y;
    if (o.len16) {
      const [tx, ty] = place(o.x, o.y, ang + (i % 2 ? 0.9 : -0.9), 78);
      const mx = (o.x + tx) / 2, my = (o.y + ty) / 2, nx = -(ty - o.y), ny = tx - o.x, nl = Math.hypot(nx, ny) || 1;
      o.c = [mx + (nx / nl) * 30, my + (ny / nl) * 30]; o.tx = tx; o.ty = ty;
      o.path = (u) => { const v = 1 - u; return [v * v * o.x + 2 * v * u * o.c[0] + u * u * tx, v * v * o.y + 2 * v * u * o.c[1] + u * u * ty]; };
      o.tEnd = o.t + o.len16 * S16;
      o.prog = (t) => { const u = U.clamp((t - o.t) / (o.tEnd - o.t)); return o.rev ? (u < 0.5 ? u * 2 : 2 - u * 2) : u; };
      [o.ex, o.ey] = o.path(o.rev ? 0 : 1);
    }
  });
  // ---- the soul: aims at each head, arriving on the note; rides each slider as its ball
  let pEnd = at(24, 3, 3);
  objs.forEach((o, i) => {
    const gap = o.t - pEnd;
    H.soulTo(Math.max(pEnd + 0.015, o.t - Math.max(0.1, gap * 0.8)), o.t - 0.008, o.x, o.y, gap < S16 * 2.5 ? 'lin' : 'inOut');
    if (o.path) {
      const dt = 1 / 240, X = [], Y = [];
      for (let t = o.t; t <= o.tEnd + 1e-6; t += dt) { const [x, y] = o.path(o.prog(t)); X.push(+x.toFixed(2)); Y.push(+y.toFixed(2)); }
      TL.soul.bake(o.t, dt, { x: X, y: Y });
      TL.soul.set(o.tEnd + 0.001, { x: o.ex, y: o.ey });
    }
    const next = objs[i + 1];
    H.osuObj(o, AR, next && next.b === o.b ? next : null);
    pEnd = o.tEnd;
  });
  // ---- bar 31: the spinner, round his core
  const tS0 = at(31), tS1 = at(31, 3), core = D.mttPts(ex, ey).core, SR = 58;
  const spinA = (t) => { const u = U.clamp((t - tS0) / (tS1 - tS0)); return -Math.PI / 2 + U.TAU * (1.3 * u + 3.7 * u * u); };
  H.soulTo(pEnd + 0.015, tS0 - 0.005, core[0] + Math.cos(spinA(tS0)) * SR, core[1] + Math.sin(spinA(tS0)) * SR, 'inOut');
  {
    const dt = 1 / 240, X = [], Y = [];
    for (let t = tS0; t <= tS1 + 1e-6; t += dt) { const a = spinA(t); X.push(+(core[0] + Math.cos(a) * SR).toFixed(2)); Y.push(+(core[1] + Math.sin(a) * SR).toFixed(2)); }
    TL.soul.bake(tS0, dt, { x: X, y: Y });
    TL.soul.set(tS1 + 0.001, { x: X[X.length - 1], y: Y[Y.length - 1] });
  }
  H.osuSpinner(tS0, tS1, core, spinA, SR);
  TL.pose.set(tS0, 'tpose'); TL.face.set(tS0, 7);
  TL.pose.set(at(31, 1), 'pointUp'); TL.pose.set(at(31, 2), 'pointUpL');
  // ---- his legs kick right across the playfield on the snare, each brushing past the cursor:
  // the row is the one ~30 px off the soul's path for as long as the leg is out (above it: side
  // -1, below: 1, either: 0). A spark flies off the soul as the boot goes by. On beat 2 of bar
  // 30 a scissor - one leg above the soul, one below, a short hold.
  const sweepRow = (t, side, hold) => {
    let best = null;
    for (let y = Y0; y <= Y1; y += 2) {
      let dmin = 1e9, sgn = 0;
      for (let d = t - 0.4; d <= t + hold + 0.4; d += 0.01) { const sy = TL.soul.at(d).y; if (Math.abs(sy - y) < dmin) { dmin = Math.abs(sy - y); sgn = Math.sign(y - sy); } }
      if (dmin < 28 || (side && sgn !== side)) continue;
      if (!best || Math.abs(dmin - 30) < best[1]) best = [y, Math.abs(dmin - 30)];
    }
    return best ? best[0] : null;
  };
  const sweep = (t, dir, side = 0, hold = BEAT * 0.5) => {
    const y = sweepRow(t, side, hold);
    if (y == null) return;
    const ev = H.legSweep({ tHit: t, y, dir, hold });
    // the boot passes the soul: a spark off its near side, a notch of rating
    for (let tt = t - 0.3; tt < t; tt += 1 / 240) {
      const s = TL.soul.at(tt);
      if ((ev.tipAt(tt) - s.x) * dir < 0) continue;
      TL.burst(tt, { x: s.x, y: s.y + Math.sign(y - s.y) * 10, n: 8, speed: [60, 180], ang: dir > 0 ? [-0.6, 0.6] : [Math.PI - 0.6, Math.PI + 0.6], life: [0.1, 0.25], colors: ['#ffffff', '#ffff80'], size: 2, z: 45 });
      H.score(tt, 0.3);
      break;
    }
  };
  for (const [b, k, s, dir] of [[25, 3, 0, -1], [26, 3, 2, 1], [27, 3, 0, -1], [29, 1, 2, -1], [29, 3, 2, 1], [30, 3, 0, 1]]) {
    sweep(at(b, k, s), dir);
    TL.pose.set(at(b, k, s) - 0.06, dir > 0 ? 'kickL' : 'kickR');
  }
  sweep(at(30, 1), 1, -1, BEAT * 0.25); sweep(at(30, 1), -1, 1, BEAT * 0.25);
  TL.pose.set(at(30, 1) - 0.06, 'split');
  // ---- bar 28: "smile for the camera!" in FLASHLIGHT; the flashbulb pops on 29
  H.bubble(at(28), at(29) - 0.05, ['对着镜头笑一个！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 3 });
  H.osuFlashlight(at(28), at(29));
  H.flashbulb(at(29), 1.6);
  H.sfx(at(29), 'Cheer', 0.4);
  TL.pose.set(at(29), 'flex'); TL.face.set(at(29), 2);
  // ---- camera: leans after the cursor bar by bar, dives into the spinner, then drops to the lanes
  for (let b = 25; b < 31; b++) {
    let sx = 0, sy = 0;
    for (let i = 0; i < 8; i++) { const p = TL.soul.at(at(b, i / 2)); sx += p.x / 8; sy += p.y / 8; }
    H.cam(at(b), at(b + 1), { x: 480 + (sx - 480) * 0.2, y: 246 + (sy - 246) * 0.15, zoom: b === 28 ? 1.22 : 1.08, pitch: 0.04, roll: (b % 2 ? 1 : -1) * 0.015, yaw: 0 }, 'inOut');
  }
  H.cam(at(31), at(31, 2), { x: 480, y: 204, zoom: 1.5, pitch: 0, roll: 0 }, 'inOut');
  H.cam(at(31, 3), at(32), { x: 480, y: 328, zoom: 1.26, pitch: 0.62, roll: 0, yaw: 0 }, 'in2');
  TL.rating.to(at(31, 3), at(32), { dx: 0 }, 'inOut');

  // ---------------------------------------------------------------- 32-37: the wide slider (a CHUNITHM homage)
  // The playfield folds down into a 16-lane field; notes of any width fall to the judgement
  // line: red taps and gold EX taps on the brass, green AIR arrows (the soul springs up and
  // fires), a blue SLIDE the soul rides, orange HOLDs, cyan FLICKs; hearts rain where it is not.
  const CW = { x: 360, y: 288, w: 240, h: 196 }, LW = CW.w / 16;
  const lx = (c, w = 1) => CW.x + (c + w / 2) * LW;
  const t32 = at(32);
  H.soulTo(tS1 + 0.02, at(31, 3, 3), 480, YHIT, 'inOut');
  H.box(at(31, 3), t32, Object.assign({ fill: 1, th: 5 }, CW), 'outExpo');
  H.chuniField(t32, at(38), CW, YHIT, YTOP);
  H.sfx(t32, 'SegaPower', 0.45);
  H.hit(t32, 1, { flash: 0.3, flashCol: [1, 0.5, 0.3] });
  TL.tv.set(t32, { cam: 'CAM CHUNI' });
  const pitchC = (m) => U.clamp(Math.round(((m < 0 ? 69 : m) - 65) * 1.4), 0, 12);
  let sx = TL.soul.at(t32 - 0.2).x;
  // the soul goes only as far as it must: to the nearest point of each note's span
  const reach = (t, c, w) => {
    const x0 = lx(c, 0) - LW / 2 + 6, x1 = lx(c + w - 1, 0) + LW / 2 + 2;
    const tx = U.clamp(sx, Math.min(x0 + 4, lx(c, w)), Math.max(x1 - 4, lx(c, w)));
    if (Math.abs(tx - sx) > 1) H.soulTo(t - S16 * 1.3, t - S16 * 0.3, tx, YHIT, 'outExpo');
    sx = tx;
  };
  const tap = (t, c, w, kind) => { reach(t, c, w); H.chuni({ tHit: t, c, w, kind, cw: CW, yHit: YHIT, y0: YTOP }); };
  // 32-33: taps on the eighths (width by accent), an AIR on each downbeat
  for (const b of [32, 33]) for (let e = 0; e < 8; e++) {
    const t = at(b, 0, e * 2), acc = H.acc(b, 0, e * 2, 'tone');
    if (e === 0) { tap(t, 5, 6, 'air'); continue; }
    if (acc < 0.2 && e % 2) continue;
    const w = acc > 0.6 ? 5 : 3, c = U.clamp(pitchC(H.lead(b, 0, e * 2)) + (e % 2 ? 2 : -2), 0, 16 - w);
    tap(t, c, w, acc > 0.6 ? 'ex' : 'tap');
  }
  // 34-35: a blue slide weaving across the field; taps strung along it; an AIR at its end
  const sl = [[at(34), 4], [at(34, 1), 10], [at(34, 2), 12], [at(34, 3), 6], [at(35), 2], [at(35, 1), 7], [at(35, 2), 13], [at(35, 3), 8]];
  const slideX = (t) => {
    if (t <= sl[0][0]) return lx(sl[0][1]);
    for (let i = 1; i < sl.length; i++) if (t < sl[i][0]) { const u = (t - sl[i - 1][0]) / (sl[i][0] - sl[i - 1][0]); return U.lerp(lx(sl[i - 1][1]), lx(sl[i][1]), (1 - Math.cos(u * Math.PI)) / 2); }
    return lx(sl[sl.length - 1][1]);
  };
  const s0 = at(34) - S16 * 2, s1 = at(35, 3, 2);
  H.soulTo(s0 - S16 * 1.5, s0, slideX(s0), YHIT, 'outExpo');
  { const dt = 1 / 240, X = [], Y = []; for (let t = s0; t <= s1; t += dt) { X.push(+slideX(t).toFixed(2)); Y.push(YHIT); } TL.soul.bake(s0, dt, { x: X, y: Y }); TL.soul.set(s1 + 0.001, { x: X[X.length - 1], y: YHIT }); }
  sx = slideX(s1);
  H.slideRibbon(s0, s1, slideX, YHIT, YTOP, CW);
  for (const [t, c] of sl) H.chuni({ tHit: t, c: Math.max(0, c - 1), w: 3, kind: 'tap', cw: CW, yHit: YHIT, y0: YTOP, onSlide: true, x: slideX(t) });
  for (let s = 1; s < 16; s += 2) { H.score(at(34, 0, s), 0.4); H.score(at(35, 0, s), 0.4); H.sfx(at(34, 0, s), 'HitTick', 0.18); H.sfx(at(35, 0, s), 'HitTick', 0.18); }
  tap(at(35, 3, 2), 4, 8, 'air');
  // 36: two orange holds, then flicks; 37: EX taps on every eighth, an AIR to finish
  const hold = (t, c, w, beats) => { reach(t, c, w); H.chuni({ tHit: t, c, w, kind: 'hold', len: beats * BEAT, cw: CW, yHit: YHIT, y0: YTOP }); };
  hold(at(36), 2, 5, 1.5);
  hold(at(36, 2), 9, 5, 1);
  tap(at(36, 3, 2), 1, 4, 'flick');
  for (let e = 0; e < 7; e++) tap(at(37, 0, e * 2), [11, 3, 9, 1, 12, 5, 8][e], 4, 'ex');
  tap(at(37, 3, 2), 4, 8, 'air');
  // hearts raining through the columns the soul keeps clear of (36-37)
  for (const b of [36, 37]) for (let e = 0; e < 8; e++) {
    const tc = at(b, 0, e * 2 + 1);
    const far = [0, 3, 6, 9, 12, 15].map((c) => lx(c)).filter((x) => [-0.18, 0, 0.18].every((d) => Math.abs(x - TL.soul.at(tc + d).x) > 36));
    if (!far.length) continue;
    const x = far[(b * 3 + e) % far.length];
    H.heart({ t0: tc - 0.7, t1: tc + 0.4, path: (t) => [x, YHIT + (t - tc) * 300], clip: 'box', z: 8 });
  }
  for (let b = 32; b < 38; b++) {
    const cx = TL.soul.at(at(b + 1)).x;
    H.cam(at(b), at(b + 1), { x: 480 + (cx - 480) * 0.25, y: 328, zoom: 1.26, pitch: 0.62, roll: (cx - 480) / 2600, yaw: 0 }, 'inOut');
  }
  H.bubble(at(34), at(35) - 0.05, ['收视率在飙升！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 3 });
  // he conducts: a pose on every snare
  const P3 = ['pointUp', 'kickR', 'tpose', 'kickL', 'flex', 'split', 'hips', 'pointUpL', 'dance1', 'dance2', 'cross', 'wave'];
  let pi = 0;
  for (let b = 25; b < 38; b++) {
    if (b === 31) continue; // (the spinner has its own)
    for (const k of [1, 3]) { TL.pose.set(at(b, k), P3[pi++ % P3.length]); TL.face.set(at(b, k), [3, 7, 1, 5][pi % 4]); }
  }

  // ---------------------------------------------------------------- 38-39: the essay
  const t38 = at(38);
  TL.hud.to(t38, t38 + 0.1, { a: 1 }, 'out');
  TL.btn.forEach((b) => b.to(t38, t38 + 0.14, { a: 1, dy: 0 }, 'outBack'));
  H.box(t38, t38 + 0.12, MB, 'outExpo');
  H.cam(t38, t38 + 0.3, { x: 480, y: 262, zoom: 1.04, pitch: 0, roll: 0, yaw: 0 }, 'outExpo');
  TL.soul.to(t38, t38 + 0.1, { x: 480, y: MB.y + 104, rot: Math.PI }, 'outExpo');
  TL.pose.set(t38, 'hips'); TL.face.set(t38, 8);
  H.essay(t38, at(40));
});

// ---------------------------------------------------------------- rhythm-game pieces
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const R = Math.round, S16 = T.s16, BEAT = T.beat;

  // ---- the cursor game (an osu! homage, dressed as the show). Every hit circle is a camera
  // mark on the stage - a white pixel ring round its cue number, drawn like the battle box's
  // own line - and a TV camera's focus brackets close in on it; the soul "takes the shot": a
  // flashbulb pop and a ratings bonus. Follow points and slider tracks are runs of the
  // proscenium's marquee bulbs; the spinner is a ring of them round his heart core.
  const CR = 16, BULB = '#fff3b0', BULB_OFF = '#5a4a28', PINK = MV.COL.pink, YEL = MV.COL.soulYellow;
  const disc = (ctx, x, y, r, col, a = 1) => {
    ctx.globalAlpha = a; ctx.fillStyle = col;
    for (let dy = -r; dy < r; dy += 2) { const w = Math.sqrt(Math.max(0, r * r - (dy + 1) * (dy + 1))); ctx.fillRect(R(x - w), R(y + dy), R(w * 2), 2); }
    ctx.globalAlpha = 1;
  };
  const mark = (ctx, emi, x, y, n, a) => {
    disc(ctx, x, y, CR + 2, '#000000', 0.85 * a);
    D.pixelRing(ctx, x, y, CR, 3, '#ffffff', a);
    D.pixelRing(ctx, x, y, CR - 5, 1, PINK, 0.9 * a);
    if (n) D.text(ctx, String(n), x, y - 8, { scale: 1, align: 'center', color: '#ffffff', alpha: a });
    if (emi) D.pixelRing(emi, x, y, CR, 6, PINK, 0.25 * a);
  };
  // a TV camera's viewfinder: four corner brackets round (x, y), half-size r
  const brackets = (ctx, x, y, r, col, a) => {
    const L = Math.max(4, R(r * 0.42));
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const cx = R(x + sx * r), cy = R(y + sy * r);
      D.rect(ctx, sx > 0 ? cx - L : cx, sy > 0 ? cy - 2 : cy, L, 2, col, a);
      D.rect(ctx, sx > 0 ? cx - 2 : cx, sy > 0 ? cy - L : cy, 2, L, col, a);
    }
  };
  const bulb = (ctx, emi, x, y, on, a = 1) => {
    D.rect(ctx, x - 2, y - 2, 4, 4, on ? BULB : BULB_OFF, a);
    if (on) { D.rect(ctx, x - 1, y - 1, 2, 2, '#ffffff', a); if (emi) D.rect(emi, x - 5, y - 5, 10, 10, BULB, 0.45 * a); }
  };
  // the playfield: the widened box, the stage dimmed inside it
  H.osuField = (t0, t1, pf) =>
    TL.add({
      t0, t1, z: -60,
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0) / 0.25) * U.clamp((t1 - t) / 0.25);
        D.rect(ctx, pf.x, pf.y, pf.w, pf.h, '#0a0414', 0.42 * k);
      },
    });
  // one hit object: o {t, tEnd, x, y, n, big, path, prog, c, tx, ty, rev, ex, ey}; next = the
  // next object of the same run (the follow bulbs lead to it)
  H.osuObj = (o, AR, next) => {
    const tA = o.t - AR, dur = o.tEnd - o.t;
    TL.add({
      t0: tA, t1: o.tEnd + 0.02, z: 22,
      draw(ctx, emi, t) {
        const a = U.clamp((t - tA) / 0.15);
        if (o.path) {
          // the track: a double row of bulbs chasing toward the tail, lit steady behind the soul
          const fade = t > o.tEnd - 0.06 ? U.clamp((o.tEnd + 0.02 - t) / 0.08) : 1;
          const reached = t < o.t ? 0 : o.rev ? (t < o.t + dur / 2 ? o.prog(t) : 1) : o.prog(t);
          const n = 14;
          for (let i = 0; i <= n; i++) {
            const u = i / n, [x, y] = o.path(u), [x2, y2] = o.path(Math.min(1, u + 0.02));
            const dl = Math.hypot(x2 - x, y2 - y) || 1, nx = (-(y2 - y) / dl) * 9, ny = ((x2 - x) / dl) * 9;
            const on = u <= reached || (i + Math.floor(-t * 14)) % 3 === 0;
            bulb(ctx, emi, x + nx, y + ny, on, a * fade); bulb(ctx, emi, x - nx, y - ny, on, a * fade);
          }
          mark(ctx, emi, o.tx, o.ty, 0, a * fade);
          if (o.rev && t < o.t + dur / 2) {
            const dx = o.c[0] - o.tx, dy = o.c[1] - o.ty, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
            for (let i = 0; i < 4; i++) for (const s of [-1, 1]) D.rect(ctx, o.tx + ux * (6 - i * 3) - uy * s * i * 3 - 1, o.ty + uy * (6 - i * 3) + ux * s * i * 3 - 1, 3, 3, YEL, a);
          }
          // riding it: the camera keeps the soul framed
          if (t >= o.t) {
            const s = TL.soul.at(t);
            D.pixelRing(ctx, s.x, s.y, CR * 1.4, 2, PINK, fade);
            brackets(ctx, s.x, s.y, CR + 8, YEL, fade);
            if (emi) D.pixelRing(emi, s.x, s.y, CR * 1.4, 4, PINK, 0.4 * fade);
          }
        }
        // the mark, until it is shot; the focus brackets closing on it (red: recording)
        if (t < o.t) {
          mark(ctx, emi, o.x, o.y, o.n, a);
          const u = (t - tA) / AR, r = CR + 4 + CR * 2.4 * (1 - U.eOut(u));
          brackets(ctx, o.x, o.y, r, u > 0.88 ? '#ff2030' : YEL, a);
          if (emi) brackets(emi, o.x, o.y, r, YEL, 0.5 * a);
        }
      },
    });
    // follow bulbs to the next mark: they light in turn as it comes, go dark behind the soul
    if (next) {
      const x0 = o.ex, y0 = o.ey, x1 = next.x, y1 = next.y, dist = Math.hypot(x1 - x0, y1 - y0);
      if (dist > CR * 2 + 12) TL.add({
        t0: next.t - AR, t1: next.t, z: 21,
        draw(ctx, emi, t) {
          const grow = U.clamp((t - (next.t - AR)) / (AR * 0.6)), pass = U.clamp((t - o.tEnd) / (next.t - o.tEnd));
          const n = Math.floor((dist - CR * 2) / 11);
          for (let i = 1; i <= n; i++) {
            const u = (CR + i * 11) / dist;
            if (u < pass || u > grow) continue;
            bulb(ctx, emi, U.lerp(x0, x1, u), U.lerp(y0, y1, u), true, 0.85);
          }
        },
      });
    }
    // the shot (and the slider's end): a flashbulb on the mark, a ratings pop
    const hit = (t, x, y, big) => {
      TL.add({
        t0: t, t1: t + 0.35, z: 44,
        draw(ctx, emi, tt) {
          const u = (tt - t) / 0.35;
          disc(ctx, x, y, R(CR * (1 + u * 0.8)), '#ffffff', 0.9 * (1 - u));
          brackets(ctx, x, y, CR + 6 + u * 12, YEL, 1 - u);
          if (emi) D.rect(emi, x - 30, y - 30, 60, 60, '#ffffff', 0.6 * (1 - u));
        },
      });
      const v = big ? 90 + (((t * 997) | 0) % 60) : 30 + (((t * 997) | 0) % 40);
      H.pop(t, x, y - 28, '+' + v, { color: big ? MV.COL.gold : PINK, scale: big ? 2 : 1, dur: 0.5 });
      TL.burst(t, { x, y, n: big ? 22 : 12, speed: [80, 240], life: [0.12, 0.35], colors: [PINK, '#ffffff', YEL], size: [2, 3], z: 45 });
      H.sfx(t, 'HitOsu', 0.42);
      H.sfx(t, 'HeartShot', 0.08);
      if (big) { H.sfx(t, 'HitOsuClap', 0.36); H.sfx(t, 'Flash', 0.18); }
      H.score(t, big ? 1.4 : 1);
      H.combo(t);
      H.punch(t, big ? 0.6 : 0.3);
    };
    hit(o.t, o.x, o.y, o.big);
    if (o.path) {
      hit(o.tEnd, o.ex, o.ey, false);
      // slider ticks on the eighths between, and the hitsound again at a reverse
      for (let t = o.t + T.s16 * 2; t < o.tEnd - 0.02; t += T.s16 * 2) H.sfx(t, 'HitTick', 0.22);
      if (o.rev) H.sfx((o.t + o.tEnd) / 2, 'HitOsu', 0.3);
    }
  };
  // the spinner round his core: a ring of marquee bulbs lit in a sweep behind the soul (longer
  // as it speeds up), the focus brackets closing on the heart, the bonus counting up
  H.osuSpinner = (t0, t1, core, ang, r) => {
    const [cx, cy] = core, RD = 96, NB = 28;
    TL.add({
      t0: t0 - 0.15, t1: t1 + 0.5, z: 20,
      draw(ctx, emi, t) {
        const a = U.clamp((t - t0 + 0.15) / 0.15) * U.clamp((t1 + 0.5 - t) / 0.2);
        if (t < t1) {
          disc(ctx, cx, cy, RD + 8, '#0a0414', 0.45 * a);
          D.pixelRing(ctx, cx, cy, RD + 10, 2, '#ffffff', a);
          const sa = ang(Math.max(t, t0)), u = U.clamp((t - t0) / (t1 - t0));
          for (let i = 0; i < NB; i++) {
            const q = (i / NB) * U.TAU, d = (((sa - q) % U.TAU) + U.TAU) % U.TAU;
            bulb(ctx, emi, cx + Math.cos(q) * RD, cy + Math.sin(q) * RD, d < 0.8 + u * 4.5, a);
          }
          brackets(ctx, cx, cy, Math.max(12, RD * 0.85 * (1 - u)), YEL, a);
          D.text(ctx, '+' + R(1000 * U.clamp(u * 1.04)), cx, cy + RD + 16, { scale: 2, align: 'center', color: PINK, outline: '#000000', alpha: a });
        } else {
          const u = (t - t1) / 0.5;
          for (let i = 0; i < NB; i++) { const q = (i / NB) * U.TAU; bulb(ctx, emi, cx + Math.cos(q) * (RD + u * 70), cy + Math.sin(q) * (RD + u * 70), true, 1 - u); }
          D.text(ctx, '+1000', cx, cy - 16 - u * 20, { scale: 3, align: 'center', color: MV.COL.gold, outline: '#000000', alpha: 1 - u });
        }
      },
    });
    // a whirr on the eighths, rising; the bonus
    for (let t = t0; t < t1 - 0.01; t += S16 * 2) H.sfx(t, 'Rotate', 0.08 + 0.22 * ((t - t0) / (t1 - t0)));
    for (let t = t0 + S16 * 2; t < t1; t += S16 * 2) { H.score(t, 0.25); H.combo(t); }
    H.sfx(t1, 'Star', 0.45);
    H.sfx(t1, 'Cheer', 0.4);
    H.score(t1, 3);
    H.combo(t1);
    H.hit(t1, 0.9, { flash: 0.3, flashCol: [1, 0.9, 0.6] });
    H.confetti(t1, cx, cy, { n: 60, ang: [-Math.PI, 0], speed: [160, 420] });
  };
  // the follow spot (bar 28, "smile for the camera!"): the stage goes dark but for one spot on
  // the soul, its beam coming down from the rig (drawn in the world, over the playfield, under
  // the soul, his speech and the TV graphics)
  H.osuFlashlight = (t0, t1) => {
    const shade = (c, x, y, r, a) => {
      c.save(); c.globalAlpha = a; c.fillStyle = '#000000';
      c.beginPath(); c.rect(-MV.PADX, -MV.PADY, MV.VW + MV.PADX * 2, MV.VH + MV.PADY * 2); c.arc(x, y, r, 0, U.TAU, true); c.fill('evenodd');
      c.restore();
    };
    TL.add({
      t0, t1, z: 38,
      draw(ctx, emi, t) {
        const s = TL.soul.at(t), k = U.eOutExpo(U.clamp((t - t0) / 0.15)), r = U.lerp(420, 60, k);
        shade(ctx, s.x, s.y, r, 0.95);
        shade(ctx, s.x, s.y, r - 14, 0.4);
        ctx.save(); ctx.globalAlpha = 0.09 * k; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(s.x - 12, -MV.PADY); ctx.lineTo(s.x + 12, -MV.PADY); ctx.lineTo(s.x + r * 0.85, s.y); ctx.lineTo(s.x - r * 0.85, s.y); ctx.closePath(); ctx.fill();
        ctx.restore();
        if (emi) shade(emi, s.x, s.y, r, 1);
      },
    });
    H.sfx(t0, 'LightSwitch', 0.5);
  };

  // ---- CHUNITHM-style pieces. The field: 16 lanes, a red judgement line, the AIR zone glow.
  const CHU = { tap: '#ff3a3a', ex: '#ffd23a', air: '#3aff6a', flick: '#3ae8ff', hold: '#ff9a2a' };
  H.chuniField = (t0, t1, cw, yHit, yTop) =>
    TL.add({
      t0, t1, z: 1, clip: 'box',
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0) / 0.2) * U.clamp((t1 - t) / 0.2), LW = cw.w / 16;
        for (let i = 0; i <= 16; i++) D.rect(ctx, cw.x + i * LW, cw.y, 1, cw.h, i % 4 === 0 ? '#9a8ab0' : '#3a2a50', 0.8 * k);
        const beat = (t - T.off) / T.beat, ph = beat - Math.floor(beat);
        D.rect(ctx, cw.x, yTop + ph * (yHit - yTop), cw.w, 1, '#ffffff', 0.15 * k);
        D.rect(ctx, cw.x, yHit + 12, cw.w, 4, '#ff3a3a', k);
        D.rect(ctx, cw.x, yHit + 13, cw.w, 1, '#ffffff', k);
        if (emi) D.rect(emi, cw.x, yHit + 8, cw.w, 12, '#ff3a3a', 0.4 * k);
      },
    });
  // a note: {tHit, c (first lane), w (lanes), kind: tap|ex|air|flick|hold, len, onSlide, x}
  H.chuni = (o) => {
    const LW = o.cw.w / 16, travel = T.beat * 1.25, t0 = o.tHit - travel;
    const x0 = o.onSlide ? o.x - (o.w * LW) / 2 : o.cw.x + o.c * LW, W = o.w * LW;
    const col = CHU[o.kind];
    const yAt = (t) => U.lerp(o.y0, o.yHit, (t - t0) / travel);
    const tEnd = o.kind === 'hold' ? o.tHit + o.len : o.tHit;
    TL.add({
      t0, t1: tEnd, z: 4, clip: 'box',
      draw(ctx, emi, t) {
        const y = Math.min(yAt(t), o.yHit);
        if (o.kind === 'hold') {
          const yTail = yAt(t - o.len);
          D.rect(ctx, x0 + 3, Math.max(o.y0, yTail), W - 6, y - Math.max(o.y0, yTail), col, 0.55);
          D.rect(ctx, x0 + W / 2 - 1, Math.max(o.y0, yTail), 2, y - Math.max(o.y0, yTail), '#ffffff', 0.8);
          if (emi) D.rect(emi, x0, Math.max(o.y0, yTail), W, y - Math.max(o.y0, yTail), col, 0.25);
        }
        D.rect(ctx, x0 + 1, y - 4, W - 2, 8, col);
        D.rect(ctx, x0 + 1, y - 4, W - 2, 2, '#ffffff');
        D.rect(ctx, x0 + 1, y + 3, W - 2, 1, '#000000', 0.5);
        if (o.kind === 'air' || o.kind === 'flick') {
          // chevrons above the note (AIR: up, FLICK: sideways)
          for (let j = 0; j < 3; j++) for (let i = -3; i <= 3; i++) {
            const px = x0 + W / 2 + i * 3, py = y - 10 - j * 7 - (3 - Math.abs(i)) * 2;
            D.rect(ctx, o.kind === 'flick' ? x0 + W / 2 + j * 7 - (3 - Math.abs(i)) * 2 - 8 : px, o.kind === 'flick' ? y - 12 + i * 3 : py, 3, 3, col);
          }
        }
        if (emi) D.rect(emi, x0, y - 7, W, 14, col, 0.45);
      },
    });
    // the hit: a column of light, sparks, the judgement
    TL.add({
      t0: o.tHit, t1: o.tHit + 0.3, z: 42,
      draw(ctx, emi, t) {
        const u = (t - o.tHit) / 0.3;
        D.rect(ctx, x0, o.yHit - 90 * (1 - u), W, 90 * (1 - u), col, 0.35 * (1 - u));
        if (emi) D.rect(emi, x0, o.yHit - 90 * (1 - u), W, 90 * (1 - u), col, 0.4 * (1 - u));
        D.text(ctx, 'JUSTICE', x0 + W / 2, o.yHit - 58 - u * 20, { scale: 1, align: 'center', color: '#ffd23a', outline: '#000', alpha: 1 - u });
        D.text(ctx, 'CRITICAL', x0 + W / 2, o.yHit - 42 - u * 20, { scale: 1, align: 'center', color: '#ffffff', outline: '#000', alpha: 1 - u });
      },
    });
    TL.burst(o.tHit, { x: x0 + W / 2, y: o.yHit, n: 10 + o.w * 2, spread: W, speed: [60, 200], ang: [-Math.PI * 0.9, -Math.PI * 0.1], life: [0.15, 0.4], colors: [col, '#ffffff'], size: [2, 3], z: 44 });
    H.sfx(o.tHit, { air: 'HitChuniAir', flick: 'HitChuniFlick', ex: 'HitChuniEx' }[o.kind] || 'HitChuni', o.kind === 'air' ? 0.45 : 0.4);
    H.score(o.tHit, o.kind === 'ex' || o.kind === 'air' ? 1.4 : 1);
    H.combo(o.tHit);
    H.punch(o.tHit, o.kind === 'air' ? 0.8 : 0.35);
    if (o.kind === 'air') {
      // the soul springs up off the line and fires straight up
      const s = TL.soul.at(o.tHit);
      TL.soul.to(o.tHit, o.tHit + 0.1, { y: o.yHit - 26, sq: 1.25 }, 'outExpo');
      TL.soul.to(o.tHit + 0.1, o.tHit + 0.22, { y: o.yHit, sq: 1 }, 'in2');
      H.shoot(o.tHit + 0.02, { x: s.x, ty: o.cw.y + 8, pop: 'AIR!', popCol: '#3aff6a' });
    }
    if (o.kind === 'hold') for (let k = 1; k * T.s16 * 2 < o.len; k++) { H.score(o.tHit + k * T.s16 * 2, 0.3); H.combo(o.tHit + k * T.s16 * 2); H.sfx(o.tHit + k * T.s16 * 2, 'HitTick', 0.2); }
  };
  // a blue slide ribbon (grounded, CHUNITHM-style): shows where the soul will be as it comes down
  H.slideRibbon = (t0, t1, fx, yHit, yTop, cw) =>
    TL.add({
      t0: t0 - T.beat * 1.25, t1, z: 3, clip: 'box',
      draw(ctx, emi, t) {
        const speed = (yHit - yTop) / (T.beat * 1.25);
        for (let y = yTop; y < yHit + 16; y += 2) {
          const tt = t + (yHit - y) / speed;
          if (tt < t0 || tt > t1) continue;
          const x = fx(tt);
          D.rect(ctx, x - 16, y, 32, 2, '#2a6aff', 0.45);
          D.rect(ctx, x - 17, y, 2, 2, '#bfe4ff'); D.rect(ctx, x + 15, y, 2, 2, '#bfe4ff');
          if (emi) D.rect(emi, x - 18, y, 36, 2, '#2a6aff', 0.3);
        }
      },
    });
  // the essay (bars 38-39): his question fills the screen, the soul "writes" its answer with
  // shots, the grade lands, and TIME'S UP on the last beat before the climax
  H.essay = (t0, t1) => {
    const at = T.at, PW = MV.PORTRAIT ? 480 : 660, PH = 250, PX = (MV.SW - PW) / 2, PY = MV.PORTRAIT ? 250 : 70, CXs = MV.SW / 2, CYs = PY + PH / 2;
    const q1 = '论文标题：', q2 = '你最喜欢镁塔顿哪一点？';
    const tAns = at(38, 3), tGrade = at(39, 1), tUp = at(39, 3);
    TL.add({
      t0: t0 + 0.05, t1: tUp + 0.2, z: 88, screen: true,
      draw(ctx, emi, t) {
        const pop = U.eOutBack(U.clamp((t - t0) / 0.15)), fade = U.clamp((tUp + 0.2 - t) / 0.12);
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(CXs, CYs); ctx.scale(pop, pop); ctx.translate(-CXs, -CYs);
        D.rect(ctx, PX - 4, PY - 4, PW + 8, PH + 8, '#000000');
        D.rect(ctx, PX, PY, PW, PH, '#ffffff');
        for (let y = PY + 70; y < PY + PH - 10; y += 34) D.rect(ctx, PX + 20, y + 32, PW - 40, 2, '#9ab6ff');
        ctx.restore();
        const n1 = Math.min([...q1].length, Math.max(0, Math.floor((t - t0) / (S16 / 2))));
        const n2 = Math.min([...q2].length, Math.max(0, Math.floor((t - t0 - S16 * 3) / (S16 / 2))));
        D.text(ctx, [...q1].slice(0, n1).join(''), PX + 24, PY + 18, { scale: 2, color: '#000000', alpha: fade });
        D.text(ctx, [...q2].slice(0, n2).join(''), PX + 24, PY + 56, { scale: 2, color: '#000000', alpha: fade });
        if (t >= tAns) {
          const k = U.eOutBack(U.clamp((t - tAns) / 0.12));
          D.text(ctx, '腿', PX + Math.round(PW * 0.4545) - 32 * (k * 3 - 2), PY + 120, { scale: 4 * Math.max(0.5, k), color: '#ff2090', alpha: fade });
        }
        if (t >= tGrade) {
          const k = U.eOutBack(U.clamp((t - tGrade) / 0.12));
          ctx.save(); ctx.globalAlpha = fade; ctx.translate(PX + PW - (MV.PORTRAIT ? 86 : 110), PY + 150); ctx.rotate(-0.25); ctx.scale(k, k);
          D.rect(ctx, -70, -34, 140, 68, '#ff2030'); D.rect(ctx, -64, -28, 128, 56, '#ffffff');
          D.text(ctx, '满分！', 0, -16, { scale: 2, color: '#ff2030', align: 'center' });
          ctx.restore();
        }
        if (t >= tUp) D.text(ctx, '时间到！！！', CXs, PY + PH + 60, { scale: 4, align: 'center', color: '#ffff40', outline: '#000000', alpha: fade });
      },
    });
    // the paper slaps up; the soul "writes": a burst of shots at the paper on the sixteenths
    H.sfx(t0 + 0.05, 'Slam', 0.3);
    [...q1].forEach((_, i) => { if (i % 2 === 0) H.sfx(t0 + i * (S16 / 2), 'BattleText', 0.18); });
    [...q2].forEach((_, i) => { if (i % 2 === 0) H.sfx(t0 + S16 * 3 + i * (S16 / 2), 'BattleText', 0.18); });
    for (let s = 0; s < 4; s++) { const t = at(38, 2, 2 + s); H.sfx(t, 'HeartShot', 0.25); TL.burst(t, { x: 480 + (s - 1.5) * 12, y: 330, n: 4, speed: [40, 120], ang: [-2.4, -0.7], life: [0.1, 0.2], colors: ['#ffff80'], size: 2, z: 60 }); }
    H.sfx(tAns, 'Item', 0.4);
    H.hit(tAns, 0.8, { flash: 0.2 });
    H.sfx(tGrade, 'Victor', 0.5);
    H.sfx(tGrade, 'Cheer', 0.5);
    H.score(tGrade, 3);
    H.combo(tGrade);
    H.bubble(tGrade, tUp, ['完美！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 2 });
    TL.pose.set(tGrade, 'flex'); TL.face.set(tGrade, 7);
    H.sfx(tUp, 'Dununnn', 0.5);
    H.bigHit(tUp, { flash: 0.4 });
    TL.pose.set(tUp, 'pointUp'); TL.face.set(tUp, 3);
  };
})();
