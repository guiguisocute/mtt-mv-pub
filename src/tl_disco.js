// Bars 55-71.
// 55 (the break: only 3-3-2 stabs): the soul picks HEEL TURN - "* you act like a villain."
//    Five stabs, five press flashbulbs, a black & white freeze each: he over-acts the fright
//    and pushes it so hard both arms pop off. (ratings: through the roof)
// 56-62 THE MIRROR BALL (the original disco turn, C# minor). One prop, one rule, one build:
//    the ball's beams are BLUE (the soul must stand still - they may pass right through it)
//    or ORANGE (the soul must keep moving). The whole stage wears the beams' colour: the
//    dance floor, the ball's glints, the stage lights.
//    56-57  the rule, slowly: one blue beam sweeps through the still soul; 57 it turns orange
//           and the soul circles the box without stopping.
//    58-59  the switch on the beat: three beams, blue on 1 and 3 (freeze), orange on 2 and 4
//           (the soul slides a cell, an arrow at its side calling the way; the floor slides too).
//    60-61  the drop: six beams, the switch on every eighth; four stage lights sweep the house.
//    62     "LIGHTS! CAMERA! BOMB!": the beams fold back into the ball, it blinks red like one
//           of his bombs, the soul shoots it and on the snare it bursts - a stage-wide cross
//           of light and a storm of mirror glitter.
// 63: HAPPY BREAKTIME (the original union-mandated break): the sign drops, a few lazy
//    pellets, a slide whistle.
// (64-70: tl_tape.js)
// 71 (drums out, eight kicks): CHECK - the stats card ("battery: low") while eight bombs
//    line up and count down 8 -> 1; bar 72: his legs are blown off.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const MB = L.menuBox, B = L.box, CX = B.x + B.w / 2;
  const [ex, ey] = L.enemy;

  H.rateAnchor(at(56), 9022);
  H.rateAnchor(at(62, 3) + 0.2, 9460);
  H.rateAnchor(at(63, 3), 9464);
  H.rateAnchor(at(64), 9580);
  H.rateAnchor(at(71), 10180);
  H.rateAnchor(at(72), 10306);

  // ---------------------------------------------------------------- bar 55: HEEL TURN, arms off
  const t55 = at(55);
  TL.post.set(t55, { desat: 1, bloom: 0.8, ca: 0.4, vig: 0.55 });
  H.cut(t55, { x: 480, y: 262, zoom: 1.04, pitch: 0, roll: 0, yaw: 0 });
  TL.tv.set(t55, { cam: 'CAM 1' });
  TL.box.set(t55, Object.assign({ draw: 1, fill: 1 }, MB));
  TL.hud.set(t55, { a: 1 });
  TL.btn.forEach((b) => b.set(t55, { a: 1, dy: 0, sel: 0 }));
  TL.body.set(t55, 0);
  H.actMenu(t55, at(55, 0, 3), [[t55, 1], [at(55, 0, 1), 3]], { select: at(55, 0, 2) });
  H.narrate(at(55, 0, 3), at(56), '* 你表现得像个反派。', { step: S16 / 3 });
  const STAB = [0, 3, 6, 8, 11];
  const pts = D.mttPts(ex, ey, { pose: 'shrug' });
  STAB.forEach((s, i) => {
    const t = at(55, 0, s);
    H.flashbulb(t, 1.2);
    TL.impact(t, { bw: 0.06, amp: 5, ca: 4, dur: 0.3 });
    H.sfx(t, i < 2 ? 'Gunshot' : 'Break1', 0.35);
  });
  TL.pose.set(t55, 'shrug'); TL.face.set(t55, 4);
  TL.pose.set(at(55, 0, 3), 'kneel'); TL.face.set(at(55, 0, 3), 6);
  H.bubble(at(55, 0, 3), at(55, 2), ['哦不！！一个反派！！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 4 });
  // the over-acted fright: the arms fly off on stabs 3 and 4 (shoulder joints spit smoke)
  TL.pose.set(at(55, 0, 6), 'tpose'); TL.face.set(at(55, 0, 6), 4);
  H.limbFly(at(55, 0, 6), 'arm6', pts.shL[0] - 40, pts.shL[1], -260, -520, -9, false);
  H.limbFly(at(55, 0, 8), 'arm6', pts.shR[0] + 40, pts.shR[1], 280, -560, 8, true);
  TL.limbs.set(at(55, 0, 6), { arms: 0 });
  for (const [t, p] of [[at(55, 0, 6), pts.shL], [at(55, 0, 8), pts.shR]]) {
    TL.burst(t, { x: p[0], y: p[1], n: 24, speed: [60, 200], life: [0.3, 0.8], colors: ['#ffffff', '#bbbbbb'], size: [3, 5], g: -60, z: 60 });
    H.sfx(t, 'Burst', 0.5);
  }
  H.score(at(55, 0, 11), 4);
  H.pop(at(55, 0, 11), 300, 110, '+382', { color: '#ffff40', scale: 3 });
  H.sfx(at(55, 0, 11), 'Cheer', 0.55);
  TL.face.set(at(55, 0, 11), 6);
  H.cam(at(55, 0, 11), at(56), { x: 480, y: 150, zoom: 2.4, roll: -0.04 }, 'outExpo');
  H.bubble(at(55, 3), at(56), ['手……手臂？'], { x: 548, y: 64, tx: 532, ty: 104, step: S16 / 2 });

  // ---------------------------------------------------------------- 56-62: THE MIRROR BALL
  const DB = { x: 404, y: 285, w: 152, h: 132 };
  const BALL = [480, 306], HOME = [480, 375];
  const t56 = at(56), tBeamEnd = at(62), tHit = at(62, 2, 2), tBoom = at(62, 3);
  TL.post.set(t56, { desat: 0, bloom: 1.25, ca: 0.8, vig: 0.4, bg: 1, bgHue: 1 });
  TL.stage.set(t56, { hue: 1, chase: 1 });
  H.box(t56, t56 + 0.15, DB, 'outExpo');
  TL.hud.to(t56, t56 + 0.2, { a: 0 }, 'out');
  TL.btn.forEach((b) => b.to(t56, t56 + 0.2, { a: 0, dy: 30 }, 'in2'));
  H.bigHit(t56, { flash: 0.5, flashCol: [1, 0.4, 0.9] });
  H.sfx(t56, 'BallChime', 0.55);
  H.sfx(t56, 'Cheer', 0.4);
  TL.tv.set(t56, { cam: 'CAM DISCO' });
  H.bubble(t56 + 0.05, at(57), ['但你在舞厅里的表现', '又会是怎么样呢？'], { x: 548, y: 46, tx: 532, ty: 104, step: S16 / 3 });

  // ---- the colour of the beams, phase by phase (it is also the colour of the whole stage)
  const PH = [[at(56, 1), at(57), 'blue'], [at(57), at(58), 'orange']];
  for (let b = 58; b < 60; b++) for (let k = 0; k < 4; k++) PH.push([at(b, k), at(b, k + 1), k % 2 ? 'orange' : 'blue']);
  for (let b = 60; b < 62; b++) for (let e = 0; e < 8; e++) PH.push([at(b, 0, e * 2), at(b, 0, e * 2 + 2), e % 2 ? 'orange' : 'blue']);
  const colAt = (t) => { for (const p of PH) if (t >= p[0] && t < p[1]) return p[2]; return null; };
  PH.forEach(([t, , c], i) => { if (i) H.sfx(t, c === 'orange' ? 'Target' : 'Bell', i < 10 ? 0.14 : 0.07); });
  H.sfx(PH[0][0], 'RainbowBeam', 0.3);

  // ---- the soul: still on blue, moving on orange
  TL.soul.set(t56 - 0.001, { a: 1 });
  H.soulTo(at(55, 3, 2), t56, HOME[0], HOME[1], 'inOut');
  // 57: one lap of the box, never stopping (orange all bar)
  {
    const c0 = [480, 347], r = 28, t0 = at(57), t1 = at(58), dt = 1 / 240, X = [], Y = [];
    for (let t = t0; t <= t1 + 1e-6; t += dt) { const a = Math.PI / 2 + (U.TAU * (t - t0)) / (t1 - t0); X.push(+(c0[0] + Math.cos(a) * r).toFixed(2)); Y.push(+(c0[1] + Math.sin(a) * r).toFixed(2)); }
    TL.soul.bake(t0, dt, { x: X, y: Y });
    TL.soul.set(t1 + 0.0005, { x: HOME[0], y: HOME[1] });
  }
  // 58-61: a step on every orange phase, gliding the whole phase long
  const DIRS = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
  const steps = [];
  let sx = HOME[0], sy = HOME[1];
  const step = (t0, t1, d, lx, ly) => {
    let [dx, dy] = DIRS[d];
    if (sx + dx * lx < 436 || sx + dx * lx > 524 || sy + dy * ly < 330 || sy + dy * ly > 404) { d = { R: 'L', L: 'R', U: 'D', D: 'U' }[d]; [dx, dy] = DIRS[d]; }
    sx += dx * lx; sy += dy * ly;
    H.soulTo(t0, t1, sx, sy, 'lin');
    steps.push({ t: t0, t1, d, lead: t1 - t0 });
    H.sfx(t0, 'Squeak', 0.14);
    H.score(t0, 0.6); H.combo(t0);
  };
  let n = 0;
  for (let b = 58; b < 60; b++) for (const k of [1, 3]) step(at(b, k), at(b, k + 1), ['R', 'U', 'L', 'D'][n++ % 4], 40, 30);
  n = 0;
  for (let b = 60; b < 62; b++) for (let e = 1; e < 8; e += 2) step(at(b, 0, e * 2), at(b, 0, e * 2 + 2), ['L', 'U', 'R', 'R', 'D', 'L', 'U', 'D'][n++ % 8], 22, 18);
  H.stepCue(steps);

  // ---- the beams. Each turns at its own speed; its starting angle is the one that lets it
  // cross the soul most often while never breaking the rule (a blue beam over a moving soul or
  // an orange one over a still soul, sampled at 480 Hz with margins round every switch)
  // [from, rad/s, until]: one beam for 56-57, a fresh set of three at 58, three more at 60
  const BEAMS = [[at(56, 1), 2.4, at(58)], [at(58), -3.1, tBeamEnd], [at(58), 3.9, tBeamEnd], [at(58), -2.6, tBeamEnd], [at(60), -4.4, tBeamEnd], [at(60), 5.0, tBeamEnd], [at(60), 4.6, tBeamEnd]];
  const smp = [];
  for (let t = at(56, 1); t < tBeamEnd; t += 1 / 480) {
    const p = TL.soul.at(t), q = TL.soul.at(t - 1 / 240);
    // (right at a switch the soul is between still and moving: no beam may be on it then)
    const nf = PH.some((ph) => Math.abs(t - ph[0]) < 0.02) || tBeamEnd - t < 0.02;
    smp.push({ t, x: p.x, y: p.y, v: Math.hypot(p.x - q.x, p.y - q.y) * 240, c: nf ? 'switch' : colAt(t) });
  }
  const angs = [];
  BEAMS.forEach(([tb, w, te], j) => {
    let best = null;
    for (let a0 = 0; a0 < U.TAU; a0 += 0.02) {
      let bad = 0, touch = 0;
      for (const s of smp) {
        if (s.t < tb || s.t >= te || H.rayDist(BALL, a0 + w * (s.t - tb), s.x, s.y) >= 13) continue;
        // (the first sweep, through the soul standing still, is the one that teaches the rule)
        if (s.c === 'switch' || (s.c === 'blue' && s.v >= 8) || (s.c === 'orange' && s.v < 25)) bad++; else touch += s.t < at(57) ? 20 : 1;
      }
      const sc = touch - bad * 1000;
      if (!best || sc > best.sc) best = { a0, sc, bad };
    }
    if (best.bad) console.warn('disco beam', j, 'breaks the colour rule', best.bad);
    const ang = (t) => best.a0 + w * (t - tb);
    if (te >= tBeamEnd) angs.push(ang);
    // one event per phase, so each carries its own colour's rule
    for (const [p0, p1, c] of PH) if (p1 > tb && p0 < te) H.discoBeam({ t0: Math.max(p0, tb), t1: Math.min(p1, te), kind: c, ang, ball: BALL, fadeIn: tb });
  });
  H.discoRetract(tBeamEnd, angs, BALL);
  H.sfx(tBeamEnd, 'Pullback', 0.35);

  // ---- the house: the floor, the ball, the stage lights all in the beams' colour
  H.danceFloor(t56, at(63), steps, colAt);
  H.discoBall(t56, tBoom, BALL, { colAt, flips: PH.map((p) => p[0]), red: tBeamEnd, hit: tHit });
  H.stageLights({
    t0: at(58), t1: tBeamEnd + 0.1, z: -210,
    lights: [[150, 468], [320, 480], [640, 480], [810, 468]].map((p, i) => ({
      p, on: at(i < 2 ? 58 : 60) + i * 0.03, flip: i >= 2, len: 820, spread: 0.08, beamA: 0.7,
      aim: () => [480 + (i - 1.5) * 170, -40],
      sweep: (t) => Math.sin(T.beatOf(t) * (T.barOf(t) >= 60 ? Math.PI : Math.PI / 2) + i * 1.7) * 0.45,
      col: (t) => (colAt(t) === 'orange' ? '#ff9a2a' : MV.COL.blue),
      k: (t) => (T.barOf(t) >= 60 ? 1 : 0.6) * U.clamp((tBeamEnd + 0.1 - t) / 0.1),
    })),
  });
  for (let i = 0; i < 4; i++) H.sfx(at(i < 2 ? 58 : 60) + i * 0.03, 'LightSwitch', 0.3);

  // ---- he dances too: armless kicks on the beat
  const KP = ['kickL', 'kickR', 'split', 'dance1', 'kickR', 'kickL', 'dance2', 'split'];
  for (let k = 0; k < 24; k++) { TL.pose.set(at(56, k), KP[k % 8]); TL.face.set(at(56, k), [7, 3, 5, 7][k % 4]); }
  H.bubble(at(60), at(60, 3), ['这才是迪斯科！'], { x: 548, y: 56, tx: 532, ty: 104, step: S16 / 3 });
  TL.post.to(at(60), at(60) + 0.2, { bloom: 1.4, ca: 1.1 }, 'out');
  H.bigHit(at(60), { flash: 0.45, flashCol: [1, 0.6, 0.3], amp: 12 });

  // ---- 62: LIGHTS! CAMERA! BOMB!
  const LINE = ['灯光！', '镜头！', '炸弹！'];
  H.bubble(tBeamEnd, tBoom, LINE, { x: 560, y: 40, tx: 540, ty: 110, times: [0, 1, 2].flatMap((k) => [...LINE[k]].map((_, j) => at(62, k) + j * 0.03)) });
  TL.post.to(tBeamEnd, tBeamEnd + 0.15, { vig: 0.7, bloom: 1.2 }, 'out');
  TL.stage.set(tBeamEnd, { chase: 0 });
  TL.pose.set(tBeamEnd, 'pointUp'); TL.pose.set(at(62, 1), 'tpose'); TL.pose.set(at(62, 2), 'kickR');
  TL.face.set(tBeamEnd, 3); TL.face.set(at(62, 2), 5);
  H.flashbulb(at(62, 1), 1);
  for (let s = 4; s < 10; s++) H.sfx(at(62, 0, s), 'PreBomb', 0.12 + s * 0.02);
  // the soul under the ball; the shot; out of the cross's column before it fires
  const SHOT_Y = BALL[1] - 6, SOUL = [480, 405], flight = (SOUL[1] - 10 - SHOT_Y) / H.SHOT;
  H.soulTo(at(62, 0, 2), at(62, 1, 2), SOUL[0], SOUL[1], 'inOut');
  H.shootAt(tHit, SHOT_Y, { x: SOUL[0], big: true, score: 0 });
  H.sfx(tHit, 'LitHit', 0.4);
  H.soulTo(tHit - flight + 0.01, tHit - flight + 0.12, 440, SOUL[1], 'outExpo');
  // the burst: a cross of light over the whole stage, the ball in shards
  H.plus(tBoom, BALL, { span: { x0: -300, x1: 1260, y0: -300, y1: DB.y + DB.h + 6 }, beamDur: 0.32, beamW: 20, vol: 0.6, shake: 1.3 });
  H.mirrorBurst(tBoom, BALL);
  H.bigHit(tBoom, { flash: 0.9, flashCol: [1, 1, 1], amp: 20 });
  H.score(tBoom, 6); H.combo(tBoom);
  H.pop(tBoom, 480, 200, '+300', { color: MV.COL.gold, scale: 3, dur: 0.8 });
  TL.pose.set(tBoom, 'split'); TL.face.set(tBoom, 7);
  TL.post.to(tBoom, tBoom + 0.3, { vig: 0.45, bloom: 1.1 }, 'out');
  TL.stage.set(tBoom, { chase: 1 });

  // ---- camera: in on the ball as it drops, round the box through the build, wider for the
  // drop, pushed in on the ball for the call, thrown back wide by the burst
  H.cut(t56, { x: 480, y: 286, zoom: 2.3, pitch: 0.1, roll: 0, yaw: 0 });
  H.cam(t56 + 0.05, at(56, 2), { x: 480, y: 262, zoom: 1.34, pitch: 0.3, roll: 0, yaw: -0.12 }, 'outExpo');
  H.cam(at(56, 2), at(58), { x: 480, y: 266, zoom: 1.28, pitch: 0.32, yaw: 0.12 }, 'inOut');
  for (let b = 58; b < 60; b++) H.cam(at(b), at(b + 1), { x: 480, y: 270, zoom: 1.3, pitch: 0.34, roll: (b % 2 ? 1 : -1) * 0.03, yaw: (b % 2 ? -1 : 1) * 0.14 }, 'inOut');
  for (let k = 0; k < 8; k++) H.cam(at(60, k), at(60, k) + 0.2, { x: 480, y: 250, zoom: 1.12, pitch: 0.26, roll: (k % 2 ? 1 : -1) * 0.045, yaw: (k % 2 ? -1 : 1) * 0.08 }, 'outExpo');
  H.cam(tBeamEnd, at(62, 2, 2), { x: 480, y: 292, zoom: 1.9, pitch: 0.14, roll: 0, yaw: 0 }, 'inOut');
  H.cam(tBoom, tBoom + 0.5, { x: 480, y: 246, zoom: 1.02, pitch: 0.1, roll: 0, yaw: 0 }, 'outExpo');

  // ---------------------------------------------------------------- 63: HAPPY BREAKTIME
  const t63 = at(63), yB = B.y + 100;
  H.box(t63 - 0.05, t63 + 0.1, B, 'outExpo');
  TL.hud.to(t63, t63 + 0.15, { a: 1 }, 'out');
  TL.btn.forEach((b) => b.to(t63, t63 + 0.15, { a: 1, dy: 0 }, 'outBack'));
  TL.post.to(t63, t63 + 0.2, { bloom: 1, ca: 0.6 }, 'out');
  H.breaktime(t63, at(64));
  H.sfx(t63, 'SlideWhistle', 0.5);
  H.bubble(t63 + 0.05, at(63, 3), ['工会规定的', '休息时间到了！'], { x: 580, y: 44, tx: 540, ty: 110, step: S16 / 3 });
  TL.pose.set(t63, 'kneel'); TL.face.set(t63, 8);
  H.cam(t63, t63 + 0.3, { x: 480, y: 250, zoom: 1.1, pitch: 0, roll: 0.02 }, 'outExpo');
  H.soulTo(t63, at(63, 0, 2), 446, yB, 'inOut');
  // a few lazy pellets; the soul pops them one by one for a point each
  [[at(63, 0, 2), 446], [at(63, 1), 514], [at(63, 1, 2), 470], [at(63, 2), 496]].forEach(([t, x], i) => {
    H.prop({ t0: t, tHit: t + 0.4, x, ty: B.y + 40, kind: 'box', v: 70, scale: 0.5, pop: '+1', popCol: '#c8c8c8' });
    H.soulTo(t + 0.2, t + 0.34, x, yB, 'inOut');
  });
  H.sfx(at(63, 3, 2), 'Rimshot', 0.35);
  H.soulTo(at(63, 3), at(63, 3, 3), CX, yB, 'inOut');

  // ---------------------------------------------------------------- bar 71: CHECK (the stats card), eight bombs count down
  const t71 = at(71);
  TL.post.to(t71, t71 + 0.1, { bgHue: 0, bloom: 1.1 }, 'out');
  TL.stage.set(t71, { hue: 0 });
  H.box(t71, t71 + 0.1, MB, 'outExpo');
  TL.hud.set(t71, { a: 1 });
  TL.btn.forEach((b) => b.set(t71, { a: 1, dy: 0 }));
  H.actMenu(t71, at(71, 0, 3), [[t71, 3], [at(71, 0, 1), 0]], { select: at(71, 0, 2) });
  TL.soul.set(at(71, 0, 3), { a: 1, x: 480, y: MB.y + 104 });
  H.statsCard(at(71, 0, 3), at(72));
  H.cut(t71, { x: 480, y: 250, zoom: 1.06, pitch: 0, roll: 0, yaw: 0 });
  TL.pose.set(t71, 'split'); TL.face.set(t71, 8);
  for (let i = 0; i < 8; i++) {
    const t = at(71, 0, i * 2), x = 300 + i * 51;
    H.countBomb(t, at(72), x, 250, 8 - i);
    H.sfx(t, 'PreBomb', 0.4);
    H.punch(t, 0.3 + i * 0.1);
  }
  H.cam(at(71, 1), at(72), { x: 480, y: 220, zoom: 1.35 }, 'in2');
});

// ---------------------------------------------------------------- disco / tape pieces
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round, S16 = T.s16, BEAT = T.beat;
  const ORANGE = '#ff9a2a';
  const DIRS = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
  const shade = (c) => (c === 'orange' ? ORANGE : c === 'blue' ? MV.COL.blue : null);
  // distance from (px, py) to the ray from o at angle a (behind the origin counts as far)
  H.rayDist = (o, a, px, py) => {
    const dx = px - o[0], dy = py - o[1], ca = Math.cos(a), sa = Math.sin(a);
    const along = dx * ca + dy * sa;
    if (along < 0) return 1e9;
    return Math.abs(-dx * sa + dy * ca);
  };
  // a limb flying off, spinning, falling out of shot
  H.limbFly = (t0, name, x, y, vx, vy, spin, flip) =>
    TL.add({
      t0, t1: t0 + 1.4, z: 70,
      draw(ctx, emi, t) {
        const u = t - t0;
        D.limb(ctx, emi, name, x + vx * u, y + vy * u + 900 * u * u, spin * u, { flip });
      },
    });
  // a chunky pixel arrow pointing up (drawn round the origin), p = pixel size
  function arrow(ctx, col, p = 3) {
    const P = ['....##....', '...####...', '..######..', '.########.', '##########', '...####...', '...####...', '...####...'];
    ctx.fillStyle = col;
    for (let j = 0; j < P.length; j++) for (let i = 0; i < 10; i++) if (P[j][i] === '#') ctx.fillRect((i - 5) * p, (j - 4) * p, p, p);
  }
  // the step call: while the beams are blue an arrow blinks at the soul's side, pointing where
  // it will go; on orange it lights up and rides along with the step
  H.stepCue = (steps) =>
    TL.add({
      t0: steps[0].t - steps[0].lead, t1: steps[steps.length - 1].t1, z: 39,
      draw(ctx, emi, t) {
        for (const s of steps) {
          if (t < s.t - s.lead || t >= s.t1) continue;
          const moving = t >= s.t;
          if (!moving && Math.floor(t * 14) % 2) continue;
          const p = TL.soul.at(t), [dx, dy] = DIRS[s.d];
          const x = p.x + dx * 24, y = p.y + dy * 24;
          ctx.save(); ctx.translate(R(x), R(y)); ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
          arrow(ctx, '#000000', 3); arrow(ctx, moving ? ORANGE : '#ffffff', 2);
          ctx.restore();
          if (emi && moving) D.rect(emi, x - 12, y - 12, 24, 24, ORANGE, 0.5);
        }
      },
    });
  // one beam from the ball over [t0, t1) in one colour (the checker holds it to that colour's
  // rule); it flashes white-hot as its colour switches in
  H.discoBeam = (o) =>
    TL.add({
      t0: o.t0, t1: o.t1, z: 6, kind: o.kind, clip: 'box',
      draw(ctx, emi, t) {
        const a = o.ang(t), col = shade(o.kind), fl = U.clamp(1 - (t - o.t0) / 0.06);
        const k = o.fadeIn != null ? U.clamp((t - o.fadeIn) / 0.15) : 1, w = 4 + fl * 4;
        ctx.save(); ctx.translate(o.ball[0], o.ball[1]); ctx.rotate(a);
        ctx.globalAlpha = k; ctx.fillStyle = col; ctx.fillRect(0, -w / 2, 400, w);
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = (0.6 + fl * 0.4) * k; ctx.fillRect(0, -1, 400, 2); ctx.restore();
        if (emi) { emi.save(); emi.translate(o.ball[0], o.ball[1]); emi.rotate(a); emi.globalAlpha = (0.6 + fl * 0.4) * k; emi.fillStyle = col; emi.fillRect(0, -5, 400, 10); emi.restore(); }
      },
      hit(t, px, py) { return H.rayDist(o.ball, o.ang(t), px, py) < 9; },
    });
  // the beams folding back into the ball (harmless, white)
  H.discoRetract = (t0, angs, ball) =>
    TL.add({
      t0, t1: t0 + 0.22, z: 6, clip: 'box',
      draw(ctx, emi, t) {
        const u = U.eIn(U.clamp((t - t0) / 0.22)), len = 400 * (1 - u);
        for (const ang of angs) {
          ctx.save(); ctx.translate(ball[0], ball[1]); ctx.rotate(ang(t0));
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, -2, len, 4); ctx.restore();
          if (emi) { emi.save(); emi.translate(ball[0], ball[1]); emi.rotate(ang(t0)); emi.globalAlpha = 0.6; emi.fillStyle = '#ffffff'; emi.fillRect(0, -5, len, 10); emi.restore(); }
        }
      },
    });
  // the mirror ball: drops in on its string and turns; glints thrown round the stage in the
  // beams' colour; a flare on every switch. o: {colAt, flips, red (starts blinking red like a
  // bomb), hit (shot: shakes)}
  H.discoBall = (t0, t1, ball, o = {}) =>
    TL.add({
      t0, t1, z: 20,
      draw(ctx, emi, t) {
        const drop = U.eOutBack(U.clamp((t - t0) / 0.3)), y = U.lerp(-80, ball[1], drop);
        const col = o.colAt ? shade(o.colAt(t)) : null;
        const img = MV.part('disco' + (Math.floor((t - T.off) / (S16 * 2)) % 2));
        const jx = o.hit && t >= o.hit ? R(Math.sin(t * 120) * 3) : 0;
        D.rect(ctx, ball[0] - 1, -200, 2, y - 44 + 200, '#ffffff');
        ctx.drawImage(img, R(ball[0] - 20 + jx), R(y - 44));
        if (emi) D.rect(emi, ball[0] - 22, y - 46, 44, 44, col || '#ffffff', 0.35);
        if (o.red && t >= o.red) {
          const rate = o.hit && t >= o.hit ? 30 : 6 + (t - o.red) * 10;
          if (Math.floor((t - o.red) * rate) % 2 === 0) { ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(MV.sil(img, '#ff2030'), R(ball[0] - 20 + jx), R(y - 44)); ctx.restore(); }
          if (emi) D.rect(emi, ball[0] - 30, y - 54, 60, 60, '#ff2030', 0.45);
        }
        if (o.flips) {
          let f = null;
          for (const x of o.flips) { if (x > t) break; f = x; }
          if (f != null && t - f < 0.12 && t < (o.red ?? 1e9)) { const u = (t - f) / 0.12; D.pixelRing(ctx, ball[0], y - 22, 22 + u * 26, 3, col || '#ffffff', 1 - u); }
        }
        // glints sweeping the whole stage
        const beat = (t - T.off) / BEAT;
        for (let i = 0; i < 26; i++) {
          const a = i * 2.4 + beat * 0.8, rr = 120 + (i * 37) % 300;
          const x = ball[0] + Math.cos(a) * rr * 1.4, yy = y + Math.sin(a) * rr * 0.55 - 40;
          const c = col && i % 3 ? col : ['#ff4fd8', '#3ee0ff', '#ffff40', '#ffffff'][i % 4];
          D.rect(ctx, x - 2, yy - 2, 4, 4, c, 0.8);
          if (emi) D.rect(emi, x - 5, yy - 5, 10, 10, c, 0.4);
        }
      },
    });
  // the ball bursts: a white ring, mirror shards flung out and falling, glints, confetti
  H.mirrorBurst = (t0, [x, y]) => {
    const shards = [];
    for (let i = 0; i < 40; i++) {
      const a = U.hash(i * 3.1) * U.TAU, v = 140 + U.hash(i * 7.7) * 420;
      shards.push({ vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, s: 2 + Math.floor(U.hash(i * 5.3) * 4) });
    }
    TL.add({
      t0, t1: t0 + 1.6, z: 64,
      draw(ctx, emi, t) {
        const u = t - t0;
        if (u < 0.3) { const k = 1 - u / 0.3; D.pixelRing(ctx, x, y - 22, 20 + u * 700, 6, '#ffffff', k); if (emi) D.rect(emi, x - 220, y - 240, 440, 440, '#ffffff', 0.7 * k); }
        shards.forEach((s, i) => {
          const px = x + s.vx * u, py = y - 22 + s.vy * u + 460 * u * u, a = U.clamp(1.6 - u);
          const glint = Math.floor(t * 20 + i) % 3 === 0;
          D.rect(ctx, px - s.s / 2, py - s.s / 2, s.s, s.s, glint ? '#ffffff' : ['#c0e8ff', '#ff4fd8', '#ffff40', '#3ee0ff'][i % 4], a);
          if (emi && glint) D.rect(emi, px - 4, py - 4, 8, 8, '#ffffff', 0.5 * a);
        });
      },
    });
    H.confetti(t0 + 0.04, x, y - 20, { n: 90, ang: [0, U.TAU], speed: [120, 460] });
    H.sfx(t0, 'GlassBreak', 0.6);
    H.sfx(t0, 'Explosion', 0.45);
    H.sfx(t0 + 0.05, 'Sparkles', 0.45);
    H.sfx(t0, 'Cheer', 0.5);
  };
  // a lit dance floor on the stage plane. With steps the pattern slides a tile the way of every
  // step; with colAt the lit tiles take the beams' colour (blue / orange)
  H.danceFloor = (t0, t1, steps = [], colAt) =>
    TL.add({
      t0, t1, z: -400,
      draw(ctx, emi, t) {
        const e = Math.floor((t - T.off) / (S16 * 2)), k = U.clamp((t - t0) / 0.2) * U.clamp((t1 - t) / 0.2);
        const c = colAt ? colAt(t) : null;
        const PAL = c === 'blue' ? ['#2a6aff', '#3ee0ff', '#1f3fbf', '#6ab4ff'] : c === 'orange' ? ['#ff9a2a', '#ffd040', '#ff6a1a', '#ffb060'] : ['#ff4fd8', '#3ee0ff', '#ffff40', '#7dff5a', '#8a4dff'];
        let ox = 0, oy = 0;
        for (const s of steps) { if (s.t > t) break; ox -= DIRS[s.d][0]; oy -= DIRS[s.d][1]; }
        const e2 = steps.length ? 0 : e;
        const mod = (a, m) => ((a % m) + m) % m;
        for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 18; gx++) {
          const x = 120 + gx * 40, y = 250 + gy * 34, qx = gx + ox, qy = gy + oy;
          const on = mod(qx + qy + e2, 3) === 0 || mod(qx * 7 + qy * 3 + e2, 11) === 0;
          if (!on) { D.rect(ctx, x + 1, y + 1, 38, 32, '#1a0d24', 0.8 * k); continue; }
          const col = PAL[mod(qx + qy * 2 + e, PAL.length)];
          D.rect(ctx, x + 1, y + 1, 38, 32, col, 0.55 * k);
          if (emi) D.rect(emi, x, y, 40, 34, col, 0.18 * k);
        }
      },
    });
  // HAPPY BREAKTIME: the sign drops in on its wires in front of him and swings
  H.breaktime = (t0, t1) =>
    TL.add({
      t0, t1, z: -50,
      draw(ctx, emi, t) {
        const u = U.clamp((t - t0) / 0.35), out = U.clamp((t1 - t) / 0.2);
        const y = U.lerp(-80, 150, U.eOutBack(u)) - (1 - out) * 240, sw = Math.sin((t - t0) * 7) * 0.08 * Math.exp(-(t - t0) * 1.5);
        D.rect(ctx, 480 - 110, -200, 2, y - 40 + 200, '#ffffff'); D.rect(ctx, 480 + 108, -200, 2, y - 40 + 200, '#ffffff');
        MV.spr(ctx, MV.part('breaktime'), 480, y, { scale: 2, rot: sw });
        if (emi) D.rect(emi, 480 - 124, y - 44, 248, 88, '#ffffff', 0.12);
      },
    });
  // REC / REW badge (sheet art) on the screen overlay
  H.tapeIcon = (t0, t1, which) =>
    TL.add({
      t0, t1, z: 90, screen: true,
      draw(ctx, emi, t) {
        const blink = Math.floor((t - t0) * 4) % 2 === 0;
        if (!blink && which === 'rec') return;
        MV.spr(ctx, MV.part(which), 110, 470, { scale: 2 });
      },
    });
  // the stats card (CHECK)
  H.statsCard = (t0, t1) => {
    const MB = MV.LAYOUT.menuBox;
    H.focus(t0, t1, [MB.x + 20, MB.y + 14, MB.x + 26 + D.textWidth('* 镁塔顿 EX - 攻击 47 防御 47'), MB.y + 124]);
    return TL.add({
      t0, t1, z: 30,
      draw(ctx, emi, t) {
        const MB = MV.LAYOUT.menuBox, k = U.clamp((t - t0) / 0.06);
        const lines = ['* 镁塔顿 EX - 攻击 47 防御 47', '* 收视率突破一万！', '* 电量：'];
        lines.forEach((ln, i) => { if ((t - t0) / (S16 * 0.8) >= i * 3) D.text(ctx, ln, MB.x + 26, MB.y + 18 + i * 36, { scale: 2, alpha: k }); });
        if ((t - t0) / (S16 * 0.8) >= 6) {
          const bx = MB.x + 26 + D.textWidth('* 电量：'), blink = Math.floor(t * 8) % 2;
          for (let i = 0; i < 5; i++) D.rect(ctx, bx + i * 20, MB.y + 94, 16, 28, i < 1 ? (blink ? '#ff2030' : '#701018') : '#303030', k);
          D.text(ctx, '低', bx + 110, MB.y + 90, { scale: 2, color: '#ff2030', alpha: k });
        }
      },
    });
  };
  // a bomb in the countdown row: blinks red with its number, all go off at tBoom
  H.countBomb = (t, tBoom, x, y, n) =>
    TL.add({
      t0: t, t1: tBoom, z: 50,
      draw(ctx, emi, tt) {
        const pop = U.eOutBack(U.clamp((tt - t) / 0.1));
        MV.spr(ctx, MV.part('bomb'), x, y, { scale: 2 * pop });
        const hot = Math.floor(tt * 16) % 2 && tt > tBoom - 0.4;
        D.text(ctx, String(n), x, y - 50, { scale: 2, align: 'center', color: hot ? '#ffffff' : '#ff2030', outline: '#000' });
        if (emi) D.rect(emi, x - 20, y - 20, 40, 40, '#ff2030', 0.25 + (hot ? 0.3 : 0));
      },
    });
})();
