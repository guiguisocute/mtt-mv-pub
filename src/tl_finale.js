// Bars 72-82: the FINAL turn, all original EX interaction (the video's last round).
// 72: the eight countdown bombs go off under him - his legs are blown away and he hovers,
//     "you're tough... now witness my TRUE power!" - the heart core is his only weapon left.
// 72-79: the original final attack as a true bullet hell: he dims to grey, his heart core
//     burns and sprays lightning bolts, with ball blocks among them for the soul to shoot
//     apart. Four phrases with one idea each (the soul's path is laid down first, the bolts
//     are fired round it; near misses spark and score):
//   72-73 bolt rain + 3-way bolts aimed at the soul, a block into its column on each offbeat,
//         lightning down the columns it is not in;
//   74-75 the spiral: three arms spun out of the core, a counter-spiral at 75 makes a lattice,
//         the soul threads a figure of eight through it (a block drops each time it crosses
//         under the core), the camera rolling with the spin;
//   76-77 rings: one each beat, a gap in each - the soul dashes into the open ones, and shoots
//         out the block plugging every other one;
//   78-79 the squeeze: white walls close to a sliver, bolt rain and volleys in it, a jink every
//         eighth, a block down the soul's lane on each eighth of 79; on 79's last snare
//         lightning strikes both walls, they burst and every bullet in flight pops.
//   On the big "and of four" hits (72, 78) the soul shoots the core.
// 80: snare roll: the ratings board fills the screen as a slot machine, the reels spinning,
//     his voice breaking up; the soul holds its fire.
// 81: five closing stabs = five reels slamming 1 2 0 0 0; on the last, the final shot.
//     12000. (82: ring-out; the silent curtain call is tl_curtain.js)
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const B = L.box, MB = L.menuBox, CX = B.x + B.w / 2, yB = B.y + 100;
  const [ex, ey] = L.enemy;
  const core = D.mttPts(ex, ey - 10).core; // (he hovers 10 px up once the legs are gone; the bob is small)
  const coreHitY = core[1] + 12;

  H.rateAnchor(at(76), 11066);
  H.rateAnchor(at(80), 11650);
  H.rateAnchor(at(81, 3), 12000);

  // ---------------------------------------------------------------- 72: the countdown bombs go off
  const t72 = at(72);
  for (let i = 0; i < 8; i++) {
    const x = 300 + i * 51, y = 250, t = t72 + i * 0.012;
    TL.burst(t, { x, y, n: 26, speed: [120, 420], life: [0.25, 0.7], colors: ['#ffffff', '#ffe24a', '#ff7f27', '#ff3040'], size: [3, 6], z: 60 });
    TL.ring(t, x, y, { r0: 6, r1: 70, color: '#ffe24a', dur: 0.4 });
  }
  H.sfx(t72, 'Explosion', 0.7); H.sfx(t72, 'BombSplode', 0.5); H.sfx(t72, 'HeavyDamage', 0.4);
  H.bigHit(t72, { flash: 1, flashCol: [1, 0.85, 0.6], amp: 26 });
  TL.glitch(t72, t72 + 0.12, 0.8);
  // his legs, blown away
  H.limbFly(t72 + 0.02, 'leg0', ex - 26, ey - 36, -340, -620, -10, false);
  H.limbFly(t72 + 0.02, 'leg0', ex + 26, ey - 36, 360, -600, 11, true);
  TL.limbs.set(t72, { arms: 0, legs: 0 });
  TL.enemy.to(t72, t72 + 0.4, { y: ey - 10 }, 'outBack');
  TL.body.set(t72, 0);
  TL.face.set(t72, 6); TL.face.set(at(72, 1), 3);
  TL.post.set(t72, { desat: 0, bgHue: 0, bloom: 1.2, ca: 0.9, vig: 0.45 });
  TL.stage.set(t72, { hue: 0, chase: 1 });
  // the box closes round the soul
  H.box(t72, t72 + 0.12, B, 'outExpo');
  H.soulTo(t72, at(72, 0, 2), CX, yB, 'outExpo');
  TL.soul.set(t72, { a: 1, rot: Math.PI });
  H.cut(t72, { x: 480, y: 236, zoom: 1.2, pitch: 0.06, roll: 0, yaw: 0 });
  TL.tv.set(t72, { cam: 'CAM 1' });
  H.bubble(at(72, 0, 2), at(72, 2), ['哈，真是顽强……'], { x: 560, y: 56, tx: 540, ty: 110, step: S16 / 3 });
  H.bubble(at(72, 2), at(73, 1), ['见证我身为明星的', '真正力量吧！'], { x: 560, y: 46, tx: 540, ty: 110, step: S16 / 3 });

  // ---- the final attack's look: he dims to grey, his heart core burns (until the walls burst)
  TL.enemy.to(at(72, 1), at(72, 1) + 0.3, { dim: 0.62 }, 'out');
  TL.enemy.to(at(79, 3, 2), at(79, 3, 2) + 0.25, { dim: 0 }, 'out');
  H.heartCore(at(72, 1), at(79, 3, 2) + 0.1, core);

  // ---- the heart core: shot on the big "and of four" hits (s14 of 72, 74, 76, 78)
  const coreHit = (t, pop) => {
    H.shootAt(t, coreHitY, { x: core[0], big: true, pop, popCol: MV.COL.gold, score: 3 });
    H.sfx(t, 'MttHit', 0.5);
    H.hit(t, 1, { flash: 0.35, flashCol: [1, 0.4, 0.8] });
    TL.face.set(t, 4); TL.face.set(t + 0.25, 3);
    TL.enemy.to(t, t + 0.05, { shake: 5 }, 'out'); TL.enemy.to(t + 0.05, t + 0.3, { shake: 0 }, 'out');
    TL.burst(t, { x: core[0], y: core[1], n: 34, speed: [100, 340], life: [0.25, 0.6], colors: ['#ffffff', MV.COL.pink, MV.COL.gold], size: [2, 4], z: 62 });
    TL.ring(t, core[0], core[1], { r0: 8, r1: 60, color: MV.COL.pink, dur: 0.35 });
  };

  // ---------------------------------------------------------------- 72-79: the final barrage
  // A true bullet hell as in the original final attack: he dims to grey, only his heart core
  // burns, and it sprays lightning bolts; in among them come ball blocks (the white box with the
  // black ball) that the soul shoots apart. Four phrases, one idea each: 72-73 bolt rain (blocks
  // dropping into the soul's column on the offbeats) and aimed 3-way bolts under his lightning;
  // 74-75 the spiral (a counter-spiral joins at 75: a lattice; blocks fall out of the core as the
  // soul crosses under it); 76-77 rings, a gap in each - every other ring's gap is plugged by a
  // block the soul shoots out; 78-79 the squeeze - walls in, bolt rain and volleys in the sliver,
  // a block down the soul's lane on every eighth of 79.
  // The soul's path is laid down first. Then every bullet is fired at it, and any that would
  // pass nearer than its clearance is never fired - that is what opens the gaps it slips
  // through. One that passes within GRAZE more is a near miss: a spark on the soul, a notch
  // more rating. A block the soul shoots ends where the shot meets it.
  const CLR = { heart: 20, bolt: 18, block: 26 }, GRAZE = 10;
  const BOX = { x0: B.x - 30, x1: B.x + B.w + 30, y0: B.y - 30, y1: B.y + B.h + 30 };

  // ---- the soul's path
  // 72-73: a step each beat (to the side, up and down a little); centre on 72.3 for the core shot
  for (const [t, x, y] of [[at(72, 1), 456, 380], [at(72, 2), 504, 392], [at(72, 3), 480, 385], [at(73), 454, 372], [at(73, 1), 500, 390], [at(73, 2), 462, 376], [at(73, 3), 498, 392], [at(74), 480, 378]])
    H.soulTo(t - 0.16, t - 0.02, x, y, 'inOut');
  // 74-75: a figure of eight through the spiral, easing in and out over a beat; it crosses under
  // the core (x 480) on beats 2 and 4 + an eighth
  const REF8 = at(74, 3, 2);
  {
    const t0 = at(74), t1 = at(76), P = at(75) - at(74), dt = 1 / 240, X = [], Y = [];
    for (let t = t0; t <= t1 + 1e-6; t += dt) {
      const A = 34 * U.smooth(U.clamp((t - t0) / BEAT)) * U.smooth(U.clamp((t1 - t) / BEAT)), ph = (U.TAU * (t - REF8)) / P;
      X.push(+(480 + A * Math.sin(ph)).toFixed(2)); Y.push(+(378 + 0.4 * A * Math.sin(2 * ph)).toFixed(2));
    }
    TL.soul.bake(t0, dt, { x: X, y: Y });
    TL.soul.set(t1 + 0.0005, { x: 480, y: 378 });
  }
  // 76-77: open rings (0, 2, 4): a dash into the gap just before the ring arrives; block rings
  // (1, 3, 5): the gap comes where the soul already is, plugged by a block it shoots out
  const RING_T = [0, 1, 2, 3, 4, 5].map((k) => at(76, k)), RING_X = [452, 452, 508, 508, 462, 462], RING_Y = 390, RV = 190, R0 = 22; // (bullets leave the rim of the heart core)
  const arrive = RING_T.map((te, k) => te + (Math.hypot(RING_X[k] - core[0], RING_Y - core[1]) - R0) / RV);
  arrive.forEach((ta, k) => { if (k % 2 === 0) H.soulTo(ta - 0.26, ta - 0.1, RING_X[k], RING_Y, 'outExpo'); });
  // 78-79: in the sliver, a jink every eighth (centre on 78.3 for the core shot)
  H.soulTo(Math.max(arrive[5] + 0.12, at(77, 3, 3)), at(78) - 0.02, 480, 390, 'inOut');
  const JINK = [];
  for (let e = 2; e < 15; e++) {
    const t = at(78, 0, e * 2), x = e === 6 || e === 7 ? 480 : e % 2 ? 494 : 466;
    JINK.push([e, t, x]);
    H.soulTo(t - 0.1, t - 0.02, x, 390 + (e % 3) * 4 - 4, 'outExpo');
  }
  H.soulTo(at(79, 3), at(79, 3) + 0.12, 480, 390, 'outExpo');

  // the soul's path, sampled (for the bullets and the strikes to be placed round it)
  const s0 = at(72), SA = [];
  for (let t = s0; t < at(80); t += 1 / 240) { const p = TL.soul.at(t); SA.push([p.x, p.y]); }
  const soulAt = (t) => SA[U.clamp(Math.round((t - s0) * 240), 0, SA.length - 1)];
  let lastGraze = -1;
  // on 79's last snare the walls burst and every bullet still in flight pops
  const tClear = at(79, 3, 2);
  // b: {kind, t0, t1, pos(t), ...H.bullet options}
  const fire = (b) => {
    b.kind = b.kind || 'bolt';
    if (b.t0 < tClear && b.t1 > tClear) b.t1 = tClear;
    let dmin = 1e9, tmin = 0;
    for (let t = b.t0; t < b.t1; t += 1 / 240) {
      const [x, y] = b.pos(t);
      if (x < BOX.x0 || x > BOX.x1 || y < BOX.y0 || y > BOX.y1) continue;
      const [sx, sy] = soulAt(t), d = Math.hypot(sx - x, sy - y);
      if (d < dmin) { dmin = d; tmin = t; }
    }
    if (dmin < CLR[b.kind]) return false;
    H.bullet(b);
    if (b.t1 === tClear) { const [x, y] = b.pos(tClear); TL.burst(tClear, { x, y, n: 5, speed: [40, 140], life: [0.15, 0.35], colors: ['#ffffff', MV.COL.pink, MV.COL.gold], size: 2, z: 46 }); }
    if (b.kind !== 'block' && dmin < CLR[b.kind] + GRAZE && tmin - lastGraze > 0.06) {
      lastGraze = tmin;
      const [sx, sy] = soulAt(tmin);
      TL.burst(tmin, { x: sx, y: sy, n: 6, speed: [50, 150], life: [0.1, 0.25], colors: ['#ffffff', '#ffff80'], size: 2, z: 45 });
      H.score(tmin, 0.15);
    }
    return true;
  };
  // a straight shot from (x, y) at angle a, speed v, from t0 until it has left the stage
  const shot = (t0, x, y, a, v, o = {}) => fire(Object.assign({ t0, t1: t0 + 720 / v, pos: (t) => [x + Math.cos(a) * v * (t - t0), y + Math.sin(a) * v * (t - t0)] }, o));
  const fromCore = (t, a, v, o) => shot(t, core[0] + Math.cos(a) * R0, core[1] + Math.sin(a) * R0, a, v, o);
  // a ball block on path pos(t), shot apart by the soul at tHit (the shot flies up from the
  // soul, so pos(tHit) is straight above it)
  const blockShot = (t0, tHit, pos, o = {}) => {
    const [bx, by] = pos(tHit);
    if (!fire(Object.assign({ kind: 'block', t0, t1: tHit, tPop: tHit, pos }, o))) return false;
    H.shootAt(tHit, by, { x: bx, pop: o.pop, big: o.big, popCol: o.popCol });
    H.sfx(tHit, 'Break1', 0.3);
    return true;
  };
  // a block dropping straight down at v into the column the soul shoots from at tHit, met at
  // `above` px over the soul
  const dropBlock = (tHit, above, v, yTop, o) => {
    const sy = soulAt(tHit)[1], ty = sy - above, tf = tHit - (sy - 10 - ty) / H.SHOT, x = soulAt(tf)[0];
    return blockShot(tHit - (ty - yTop) / v, tHit, (t) => [x, ty - (tHit - t) * v], o);
  };
  const flashes = new Set();
  const muzzle = (t, big) => { const k = Math.round(t / (S16 * 2)); if (flashes.has(k)) return; flashes.add(k); TL.ring(t, core[0], core[1], { r0: 6, r1: big ? 44 : 24, color: MV.COL.pink, dur: 0.2 }); H.sfx(t, 'ABullet', big ? 0.3 : 0.16); };
  const CAND = [428, 446, 464, 482, 500, 518, 536];
  const strikeAway = (t) => {
    const ok = CAND.filter((x) => { for (let d = -0.02; d <= 0.14; d += 0.01) if (Math.abs(soulAt(t + d)[0] - x) < 26) return false; return true; });
    if (!ok.length) return;
    ok.sort((a, b) => Math.abs(soulAt(t)[0] - b) - Math.abs(soulAt(t)[0] - a));
    H.strike({ t, x: ok[Math.floor(U.hash(t * 3.1) * Math.min(3, ok.length))], from: core });
  };

  // ---- 72-73: bolt rain, a block into the soul's column on each offbeat, 3-way bolts aimed at
  // it, lightning
  for (let e = 3; e < 16; e++) {
    const t = at(72, 0, e * 2);
    for (let j = 0; j < 3; j++) {
      const x = 420 + Math.floor(U.hash(e * 7.1 + j * 3.3) * 11) * 12;
      shot(t, x, B.y - 90, Math.PI / 2, 250);
    }
  }
  for (const [b, k] of [[72, 1], [72, 2], [73, 0], [73, 1], [73, 2], [73, 3]]) dropBlock(at(b, k, 2), 60, 280, B.y - 90);
  for (let k = 2; k < 8; k++) {
    const t = at(72, k), [sx, sy] = soulAt(t), a = Math.atan2(sy - core[1], sx - core[0]);
    for (const d of [-0.2, 0, 0.2]) fromCore(t, a + d, 300);
    muzzle(t, true);
  }
  for (const t of [at(72, 2, 2), at(73, 0, 2), at(73, 2, 2)]) strikeAway(t);
  coreHit(at(72, 3, 2), '+512');

  // ---- 74-75: the spiral - three arms of bolts, a counter-spiral at 75 (cyan-lit); a block
  // drops out of the core each time the soul crosses under it
  const SP = [[at(74), at(76), 2.3, 0, MV.COL.pink], [at(75), at(76), -2.3, 0.5, MV.COL.cyan]];
  for (const [ta, tb, w, a0, glow] of SP)
    for (let t = ta; t < tb - 0.01; t += S16) {
      for (let k = 0; k < 3; k++) fromCore(t, a0 + w * (t - at(74)) + (k * U.TAU) / 3, 200, { glow });
      muzzle(t, false);
    }
  for (const [tHit, big] of [[at(74, 1, 2), false], [REF8, true], [at(75, 1, 2), false], [at(75, 3, 2), true]]) {
    const t0 = tHit - (soulAt(tHit)[1] - 70 - core[1] - R0) / 240;
    if (dropBlock(tHit, 70, 240, core[1] + R0, big ? { big: true, pop: '+' + (200 + Math.round(U.hash(tHit) * 99)) } : {})) muzzle(t0, true);
  }
  H.coreRays(at(74), at(76), core, (t) => 2.3 * (t - at(74)));
  H.bubble(at(74), at(74, 3), ['转起来吧！'], { x: 580, y: 54, tx: 540, ty: 110, step: S16 / 2 });

  // ---- 76-77: rings of bolts with a gap where the soul will be (its two edge bolts graze it);
  // every other ring has a block in the gap for the soul to shoot out
  RING_T.forEach((te, k) => {
    const N = 28, ga = Math.atan2(RING_Y - core[1], RING_X[k] - core[0]), dist = Math.hypot(RING_X[k] - core[0], RING_Y - core[1]), g = 25 / dist;
    const o = { glow: k % 2 ? MV.COL.pink : '#ffff80' };
    for (let i = 0; i < N; i++) fromCore(te, ga + g + (i / (N - 1)) * (U.TAU - 2 * g), RV, o);
    if (k % 2) {
      const c = Math.cos(ga), sn = Math.sin(ga), pos = (t) => { const r = R0 + RV * (t - te); return [core[0] + c * r, core[1] + sn * r]; };
      blockShot(te, te + (dist - 45 - R0) / RV, pos);
    }
    muzzle(te, true);
    H.sfx(te, 'SpearAppear', 0.2);
  });
  for (const t of [at(76, 3, 2), at(77, 0, 2), at(77, 2, 2)]) strikeAway(t);
  H.bubble(at(76), at(76, 3), ['节目……', '不能停……'], { x: 580, y: 50, tx: 540, ty: 110, step: S16 / 2 });
  H.bubble(at(77, 2), at(78), ['戏……'], { x: 580, y: 60, tx: 540, ty: 110, step: S16, jagged: true });

  // ---- 78-79: the squeeze; rain and bolts in the sliver, then a block down the soul's lane
  // on every eighth of 79 until the walls burst
  const G = new MV.Track({ xl: B.x, xr: B.x + B.w });
  G.to(at(78), at(78) + 0.1, { xl: 430, xr: 530 }, 'outExpo');
  G.to(at(78, 1), at(78, 1) + 0.1, { xl: 444, xr: 516 }, 'outExpo');
  G.to(at(78, 2), at(78, 2) + 0.1, { xl: 452, xr: 508 }, 'outExpo');
  G.to(at(79, 3, 2), at(79, 3, 2) + 0.14, { xl: B.x - 24, xr: B.x + B.w + 24 }, 'outExpo');
  H.squeeze(at(78) - 0.01, at(79, 3, 3), (t) => { const g = G.at(t); return [g.xl, g.xr]; });
  for (let k = 0; k < 3; k++) { H.sfx(at(78, k), 'DoorShut', 0.3); H.punch(at(78, k), 0.6); }
  H.sfx(at(79, 3, 2), 'Break2', 0.5);
  // the rain falls on the side the soul is not on when it gets there
  const fall = 260, y0 = B.y - 90, tPass = (390 - y0) / fall;
  for (let s = 2; s < 30; s++) {
    const t = at(78, 0, s), x = soulAt(t + tPass)[0] < 480 ? 494 : 466;
    shot(t, x, y0, Math.PI / 2, fall);
    if (s >= 16 && s % 2 === 0) shot(t, 480 + (s % 4 ? -26 : 26), y0, Math.PI / 2, fall);
  }
  for (const [e, t] of JINK) if (e >= 8 && e <= 13) dropBlock(t + 0.07, 55, fall, y0);
  for (let k = 0; k < 7; k++) {
    const t = at(78, k), [sx, sy] = soulAt(t), a = Math.atan2(sy - core[1], sx - core[0]);
    for (const d of [-0.12, 0, 0.12]) fromCore(t, a + d, 320);
    muzzle(t, true);
  }
  coreHit(at(78, 3, 2), '+701');
  H.strike({ t: at(79, 3, 2), x: 440, from: core }); H.strike({ t: at(79, 3, 2), x: 520, from: core });
  H.bigHit(at(79, 3, 2), { flash: 0.5, flashCol: [1, 0.9, 0.5], amp: 16 });
  H.bubble(at(78), at(78, 3), ['灯……灯光……'], { x: 580, y: 60, tx: 540, ty: 110, step: S16, jagged: true });
  H.bubble(at(79), at(79, 3), ['够了！'], { x: 580, y: 60, tx: 540, ty: 110, step: S16 / 2 });
  TL.face.set(at(79), 5);

  // ---- camera: steady for the rain, rolling with the spiral, swinging with the rings, in
  // tight on the sliver, thrown back as the walls burst
  H.cam(at(72, 1), at(74), { x: 480, y: 262, zoom: 1.24, pitch: 0.1, roll: 0, yaw: 0 }, 'inOut');
  for (let k = 0; k < 8; k++) H.cam(at(74, k), at(74, k + 1), { x: 480, y: 250, zoom: 1.1, pitch: 0.08, roll: Math.sin(k * 0.9) * 0.07, yaw: 0 }, 'inOut');
  for (let k = 0; k < 8; k++) H.cam(at(76, k), at(76, k) + 0.3, { x: 480 + (k % 2 ? 10 : -10), y: 276, zoom: 1.3, pitch: 0.14, roll: (k % 2 ? 1 : -1) * 0.03, yaw: (k % 2 ? -1 : 1) * 0.08 }, 'outExpo');
  H.cam(at(78), at(79), { x: 480, y: 318, zoom: 1.7, pitch: 0.22, roll: 0.02, yaw: 0 }, 'inOut');
  H.cam(at(79), at(79, 3, 2), { x: 480, y: 322, zoom: 1.95, pitch: 0.24, roll: -0.02 }, 'inOut');
  H.cam(at(79, 3, 2), at(80), { x: 480, y: 250, zoom: 1.2, pitch: 0.06, roll: 0 }, 'outExpo');
  TL.post.to(at(74), at(74) + 0.2, { bloom: 1.3, ca: 1 }, 'out');
  TL.post.to(at(78), at(78) + 0.2, { bloom: 1.2, ca: 1.3 }, 'out');

  // ---------------------------------------------------------------- 80-81: the slot machine, 12000
  const t80 = at(80), tFinal = at(81, 3);
  H.box(t80 - 0.1, t80 + 0.1, B, 'outExpo');
  H.soulTo(at(79, 3, 2), t80, CX, yB, 'inOut');
  TL.rating.to(t80 - 0.1, t80 + 0.1, { a: 0 }, 'out');
  TL.rating.to(T.dur - 0.1, T.dur + 0.3, { a: 1 }, 'out');
  const stops = [4, 6, 8, 10, 12].map((s) => at(81, 0, s));
  H.slotReels(t80, stops, T.dur);
  H.sfx(t80, 'DrumRoll', 0.35);
  for (let k = 0; k < 8; k++) TL.glitch(at(80, 0, k * 2), at(80, 0, k * 2) + 0.04, 0.2 + k * 0.05);
  H.bubble(at(80), at(81), ['镜……镜……'], { x: 580, y: 60, tx: 540, ty: 110, step: S16 * 1.5, jagged: true });
  TL.face.set(at(80), 6);
  H.cam(t80, at(81), { x: 480, y: 210, zoom: 1.12, pitch: 0, roll: 0, yaw: 0 }, 'in2');
  // the stabs: a reel slams on each; the last is the final shot into the core
  stops.forEach((t, i) => {
    H.sfx(t, i < 4 ? 'Slam' : 'OrchHit', i < 4 ? 0.5 : 0.6);
    H.hit(t, 0.6 + i * 0.15, { flash: 0.15 + i * 0.05, flashCol: [1, 0.85, 0.3] });
  });
  H.shootAt(tFinal, coreHitY, { x: core[0], big: true, pop: false, score: 0 });
  H.sfx(tFinal, 'MttHit', 0.6);
  H.sfx(tFinal, 'Explosion', 0.4);
  H.sfx(tFinal, 'Applause', 0.6);
  H.sfx(tFinal, 'Cheer', 0.6);
  H.sfx(tFinal + 0.05, 'Sparkles', 0.5);
  H.score(tFinal, 1); H.combo(tFinal);
  H.bigHit(tFinal, { flash: 1, flashCol: [1, 0.9, 0.5], amp: 22 });
  TL.burst(tFinal, { x: core[0], y: core[1], n: 70, speed: [150, 520], life: [0.4, 1], colors: ['#ffffff', MV.COL.gold, MV.COL.pink], size: [3, 6], z: 62 });
  for (let i = 0; i < 4; i++) {
    H.confetti(tFinal + i * 0.18, 150 + i * 30, 30, { n: 50, ang: [-Math.PI * 0.55, -Math.PI * 0.05] });
    H.confetti(tFinal + i * 0.18 + 0.09, 810 - i * 30, 30, { n: 50, ang: [-Math.PI * 0.95, -Math.PI * 0.45] });
  }
  TL.pose.set(tFinal, 'pointUp'); TL.face.set(tFinal, 7);
  TL.stage.set(tFinal, { hue: 1, chase: 1 });
  TL.post.set(tFinal, { bloom: 1.3, ca: 0.6 });
  H.cam(tFinal, T.dur, { x: 480, y: 200, zoom: 1.3, pitch: 0, roll: 0 }, 'out');
  for (const t of [at(80), at(81)]) H.flashbulb(t, 0.8);
  for (let k = 0; k < 6; k++) H.flashbulb(tFinal + 0.3 + k * 0.23, 0.5);
});

// ---------------------------------------------------------------- finale pieces
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round;
  const line = (ctx, x0, y0, x1, y1, w, col, a = 1) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
    for (let i = 0; i <= n; i++) D.rect(ctx, U.lerp(x0, x1, i / n) - w / 2, U.lerp(y0, y1, i / n) - w / 2, w, w, col, a);
  };
  // a lightning strike down one column of the box: a warning stripe, then a jagged bolt from
  // the core to the box top and a white-hot column to the floor. o: {t, x, w, warn, dur, from}
  H.strike = (o) => {
    const warn = o.warn ?? 0.3, dur = o.dur ?? 0.12, W = o.w ?? 12, [cx, cy] = o.from || [480, 197];
    TL.add({ t0: o.t - warn, t1: o.t, z: 2, clip: 'box', draw(ctx, emi, t) { const b = TL.box.at(t); D.warn(ctx, emi, o.x - W / 2 - 2, b.y, W + 4, b.h, t, '#ffe040'); } });
    H.sfx(o.t, 'Shock', 0.24);
    H.sfx(o.t, 'Impact', 0.12);
    H.punch(o.t, 0.35);
    return TL.add({
      t0: o.t, t1: o.t + dur + 0.08, z: 36, kind: 'white',
      draw(ctx, emi, t) {
        const u = (t - o.t) / dur, b = TL.box.at(t);
        if (u > 1) { D.rect(ctx, o.x - 1, b.y, 2, b.h, '#ffffa0', 1 - (t - o.t - dur) / 0.08); return; }
        let px = cx, py = cy;
        const flick = Math.floor(t * 40);
        for (let i = 1; i <= 7; i++) {
          const k = i / 7, nx = U.lerp(cx, o.x, k) + (i < 7 ? (U.hash(i * 3.3 + o.t * 7 + flick) - 0.5) * 22 : 0), ny = U.lerp(cy, b.y, k);
          line(ctx, px, py, nx, ny, 3, '#ffffa0'); if (emi) line(emi, px, py, nx, ny, 7, '#ffff80', 0.6);
          px = nx; py = ny;
        }
        const w = W * (u < 0.25 ? 0.4 + (u / 0.25) * 0.6 : 1);
        D.rect(ctx, o.x - w / 2 - 2, b.y, w + 4, b.h, '#ffe040');
        D.rect(ctx, o.x - w / 2, b.y, w, b.h, '#ffffff');
        if (emi) D.rect(emi, o.x - W, b.y, W * 2, b.h, '#ffff80', 0.6);
      },
      hit(t, px, py) { const u = (t - o.t) / dur; if (u < 0 || u > 1) return false; const b = TL.box.at(t); return Math.abs(px - o.x) < W / 2 + 5 && py > b.y - 4 && py < b.y + b.h + 4; },
    });
  };
  // a bullet of the final barrage on any path, in the original final attack's shapes.
  // o: {kind: 'bolt' (lightning: each keeps a tilt and a flip of its own, like the game's) |
  //     'block' (the ball block: with tPop the soul's shot breaks it there) | 'heart', t0, t1,
  //     pos(t) -> [x, y], glow (bloom colour)}
  // It pops in to full size as it leaves the core.
  const SPR = { heart: 'heartW', bolt: 'bolt', block: 'ball' };
  H.bullet = (o) => {
    const kind = o.kind || 'bolt', img = MV.part(SPR[kind]);
    const seed = U.hash(o.t0 * 13.7 + o.pos(o.t0)[0] * 0.37 + o.pos(o.t0 + 0.1)[1] * 0.11);
    const tilt = (seed - 0.5) * 0.9, flip = seed * 7 % 1 > 0.5;
    const ev = TL.add({
      t0: o.t0, t1: o.t1, z: o.z ?? (kind === 'block' ? 26 : 27), kind: 'white', pos: o.pos,
      draw(ctx, emi, t) {
        const [x, y] = o.pos(t), u = t - o.t0, sc = Math.min(1, 0.5 + u * 8);
        if (kind === 'bolt') {
          MV.spr(ctx, img, x, y, { scale: sc, rot: tilt + Math.sin(u * 7 + seed * 20) * 0.12, flip });
          if (emi) D.rect(emi, x - 9, y - 9, 18, 18, o.glow || '#ffff80', 0.35);
        } else if (kind === 'block') {
          // (a white flash the instant before the shot lands)
          const hot = o.tPop != null && t > o.tPop - 0.035;
          MV.spr(ctx, hot ? MV.sil(img, '#ffffff') : img, x, y, { scale: sc });
          if (emi) D.rect(emi, x - 12, y - 12, 24, 24, '#ffffff', hot ? 0.6 : 0.15);
        } else {
          MV.spr(ctx, img, x, y, { scale: sc });
          if (emi) D.rect(emi, x - 8, y - 8, 16, 16, o.glow || '#ffffff', 0.3);
        }
      },
      hit(t, px, py) {
        const [x, y] = o.pos(t);
        if (kind === 'block') return Math.abs(px - x) < 16 && Math.abs(py - y) < 16;
        return Math.hypot(px - x, py - y) < (kind === 'bolt' ? 10 : 13);
      },
    });
    if (kind === 'block' && o.tPop != null) {
      // broken apart: white and black chunks
      const [x, y] = o.pos(o.tPop);
      TL.burst(o.tPop, { x, y, n: 14, speed: [80, 260], life: [0.2, 0.45], colors: ['#ffffff', '#ffffff', '#000000'], size: [3, 5], g: 500, drag: 1.5, z: 47 });
      TL.ring(o.tPop, x, y, { r0: 8, r1: 34, color: '#ffffff', dur: 0.25 });
      H.punch(o.tPop, 0.3);
    }
    return ev;
  };
  // his heart core in the final attack (the sheet's black heart): bright over his dimmed body,
  // beating on the quarter notes; bullets leave its rim
  H.heartCore = (t0, t1, [cx, cy]) =>
    TL.add({
      t0, t1, z: -50,
      draw(ctx, emi, t) {
        const k = Math.min(U.clamp((t - t0) / 0.2), U.clamp((t1 - t) / 0.15)), p = T.pulse(t, T.beat, 0.15);
        MV.spr(ctx, MV.part('heartB'), cx, cy + 2, { scale: 2 + 0.25 * p, alpha: k });
        if (emi) { D.rect(emi, cx - 26, cy - 24, 52, 50, '#ffffff', (0.12 + 0.2 * p) * k); D.rect(emi, cx - 30, cy - 28, 60, 58, MV.COL.pink, 0.1 * k); }
      },
    });
  // the spiral's spokes: three short rays turning with the stream at the core (angle a(t))
  H.coreRays = (t0, t1, [cx, cy], a) =>
    TL.add({
      t0, t1, z: 26,
      draw(ctx, emi, t) {
        const k = Math.min(U.clamp((t - t0) / 0.15), U.clamp((t1 - t) / 0.2)), p = T.pulse(t, T.s16, 0.07);
        for (let i = 0; i < 3; i++) {
          const ang = a(t) + (i * U.TAU) / 3, c = Math.cos(ang), s = Math.sin(ang), r1 = 44 + 12 * p;
          line(ctx, cx + c * 28, cy + s * 28, cx + c * r1, cy + s * r1, 2, MV.COL.pink, k);
          if (emi) line(emi, cx + c * 28, cy + s * 28, cx + c * r1, cy + s * r1, 6, MV.COL.pink, 0.5 * k);
        }
        D.pixelRing(ctx, cx, cy, 30 + 3 * p, 2, '#ffffff', 0.8 * k);
        if (emi) D.pixelRing(emi, cx, cy, 32, 5, MV.COL.pink, 0.6 * k);
      },
    });
  // the squeeze: stacks of white blocks growing in from both walls; gap(t) -> [xl, xr] inner edges
  H.squeeze = (t0, t1, gap) =>
    TL.add({
      t0, t1, z: 8, kind: 'white', clip: 'box',
      draw(ctx, emi, t) {
        const b = TL.box.at(t), [xl, xr] = gap(t);
        for (let y = b.y; y < b.y + b.h; y += 20) {
          for (let x = xl - 10; x > b.x - 30; x -= 20) MV.spr(ctx, MV.part('boom0'), x, y + 10);
          for (let x = xr + 10; x < b.x + b.w + 30; x += 20) MV.spr(ctx, MV.part('boom0'), x, y + 10);
        }
        D.rect(ctx, xl - 1, b.y, 2, b.h, '#ff4fd8', 0.8); D.rect(ctx, xr - 1, b.y, 2, b.h, '#ff4fd8', 0.8);
        if (emi) { D.rect(emi, b.x, b.y, xl - b.x, b.h, '#ffffff', 0.08); D.rect(emi, xr, b.y, b.x + b.w - xr, b.h, '#ffffff', 0.08); }
      },
      hit(t, px, py) { const [xl, xr] = gap(t); return px < xl + 8 || px > xr - 8; },
    });
  // the ratings board as a slot machine: five reels spinning, each slamming to a digit of 12000
  // at its stop; a marquee of bulbs round it
  H.slotReels = (t0, stops, t1) => {
    const DIG = '12000';
    TL.add({
      t0, t1, z: 87, screen: true,
      draw(ctx, emi, t) {
        const pop = U.eOutBack(U.clamp((t - t0) / 0.25)), fade = U.clamp((t1 - t) / 0.4);
        const RW = 60, RH = 84, GAP = 10, W = 5 * RW + 4 * GAP + 40, H2 = RH + 70;
        const cx = MV.SW / 2, cy = 150;
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(cx, cy); ctx.scale(pop, pop); ctx.translate(-cx, -cy);
        const x0 = cx - W / 2, y0 = cy - H2 / 2;
        const done = t >= stops[4];
        D.rect(ctx, x0, y0, W, H2, '#0c0414', 0.92);
        D.frame(ctx, x0, y0, W, H2, 4, done ? MV.COL.gold : '#ff4fd8');
        // bulbs chasing round the frame
        const n = 36, ph = Math.floor(t * (done ? 16 : 10));
        for (let i = 0; i < n; i++) {
          const q = i / n, per = 2 * (W + H2), d = q * per;
          const [bx, by] = d < W ? [x0 + d, y0] : d < W + H2 ? [x0 + W, y0 + d - W] : d < 2 * W + H2 ? [x0 + W - (d - W - H2), y0 + H2] : [x0, y0 + H2 - (d - 2 * W - H2)];
          D.rect(ctx, bx - 3, by - 3, 6, 6, (i + ph) % 3 === 0 ? '#fff3b0' : '#5a4020');
        }
        D.text(ctx, '收视率', cx, y0 + 10, { scale: 2, align: 'center', color: done ? MV.COL.gold : '#ffffff' });
        for (let i = 0; i < 5; i++) {
          const rx = x0 + 20 + i * (RW + GAP), ry = y0 + 52;
          D.rect(ctx, rx, ry, RW, RH, '#1c1028');
          ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, RW, RH); ctx.clip();
          if (t < stops[i]) {
            const sp = (t - t0) * (14 + i * 3) + i * 3.7, f = sp - Math.floor(sp);
            for (let j = -1; j <= 1; j++) {
              const d = ((Math.floor(sp) + j) % 10 + 10) % 10;
              D.text(ctx, String(d), rx + RW / 2, ry + RH / 2 - 24 + (j - f) * 56, { scale: 3, align: 'center', color: '#c8c8c8' });
            }
          } else {
            const k = U.eOutBack(U.clamp((t - stops[i]) / 0.12));
            D.text(ctx, DIG[i], rx + RW / 2, ry + RH / 2 - 24 - (1 - k) * 30, { scale: 3, align: 'center', color: MV.COL.gold, outline: '#000000' });
          }
          ctx.restore();
          D.frame(ctx, rx, ry, RW, RH, 2, t >= stops[i] ? MV.COL.gold : '#ffffff');
          if (t >= stops[i] && t < stops[i] + 0.15) D.rect(ctx, rx, ry, RW, RH, '#ffffff', 1 - (t - stops[i]) / 0.15);
        }
        ctx.restore();
      },
    });
    stops.forEach((t) => H.sfx(t, 'Ding', 0.35));
    for (let t = t0; t < stops[0]; t += T.s16 * 2) H.sfx(t, 'Squeak', 0.06);
  };
})();
