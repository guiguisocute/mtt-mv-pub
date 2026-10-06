// Bars 0-11: the reveal, kept brisk. Bars 0-3 (dry brass stabs): a silhouette in the
// smoke, a hard cut to another "TV camera" and a new pose on every stab, his line one
// word per stab. Bar 4 (the bass comes in): the smoke is blown away and METTATON EX
// stands there in full - marquee on, a pose on every beat. Bar 8 (lead + pad): the
// line lands - "unforgettable!" - and the show's UI slams in; 9-10: ACT -> BOAST;
// 11 (the swell into the full band): the box closes round the soul. Bar 12: fight.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const [ex, ey] = L.enemy;
  const MB = L.menuBox, B = L.box;

  H.rateAnchor(at(8), 3995);
  H.rateAnchor(at(11), 4312);

  // ---------------------------------------------------------------- the silhouette appears in the smoke
  TL.boxForm.set(at(0) - 0.4, 0);
  TL.enemy.set(at(0) - 0.4, { a: 0, x: ex, y: ey, sil: 1, silCol: '#000000', reveal: 1, bob: 0, shake: 0, sx: 1 });
  TL.enemy.to(at(0) - 0.4, at(0), { a: 1 }, 'in2');
  TL.pose.set(at(0) - 0.4, 'idle');
  TL.face.set(0, 0);
  // the floor spotlights stay on as stage lights: crossed behind him, then swinging on the bass
  const sweepFor = (t, side) => {
    const b = T.barOf(t);
    if (b < 4 || b >= 12) return 0;
    const k = Math.floor(T.beatOf(t)), u = T.beatOf(t) - k;
    const m0 = T.A.bass[k - 1] ?? 40, m1 = T.A.bass[k] ?? 40;
    const f = (m) => ((m < 0 ? 40 : m) - 40) / 14; // E2 = 0, D3 = 0.7
    return side * (0.1 - U.lerp(f(m0), f(m1), U.eOutExpo(Math.min(1, u * 6))) * 0.5);
  };
  const dim = (t) => { const b = T.barOf(t); return b < 4 ? 1 : b < 11 ? 0.26 : 0.26 * U.clamp(12 - b); };
  H.stageLights({ t0: at(0), t1: at(12), lights: [
    { p: [236, 462], on: at(0), aim: () => [480, 170], sweep: (t) => sweepFor(t, -1), k: dim },
    { p: [724, 462], on: at(0), aim: () => [480, 170], sweep: (t) => sweepFor(t, 1), flip: true, k: dim },
  ] });
  TL.post.set(at(0), { bloom: 0.75 });

  // ---------------------------------------------------------------- bars 0-3: one camera per bar, a pose per stab
  // The stabs hit the picture (a zoom punch, an impact frame on the bar's first) and snap
  // the silhouette into a new pose; the camera itself only changes once a bar and glides.
  const STAB_A = [0, 4, 8, 11, 12, 14], STAB_B = [2, 8, 11, 12];
  const stabs = [];
  for (let b = 0; b < 4; b++) for (const s of b % 2 ? STAB_B : STAB_A) stabs.push({ b, s, t: at(b, 0, s) });
  const SHOTS = [
    [{ x: 480, y: 196, zoom: 1.25, pitch: -0.2, roll: 0, yaw: 0 }, { x: 480, y: 188, zoom: 1.4, pitch: -0.14, roll: 0.02, yaw: 0 }], // wide, low
    [{ x: 488, y: 150, zoom: 2.1, pitch: 0, roll: -0.08, yaw: 0.14 }, { x: 486, y: 140, zoom: 2.3, pitch: 0, roll: -0.05, yaw: 0.1 }], // closer, from the left
    [{ x: 480, y: 184, zoom: 1.45, pitch: 0.3, roll: 0.05, yaw: -0.12 }, { x: 480, y: 178, zoom: 1.6, pitch: 0.24, roll: 0.03, yaw: -0.08 }], // high, from the right
    [{ x: 480, y: 170, zoom: 1.7, pitch: 0, roll: 0, yaw: 0 }, { x: 480, y: 160, zoom: 2.2, pitch: 0, roll: 0, yaw: 0 }], // push in to the reveal
  ];
  for (let b = 0; b < 4; b++) { H.cut(at(b), SHOTS[b][0]); H.cam(at(b), at(b + 1) - 0.01, SHOTS[b][1], b === 3 ? 'in2' : 'inOut'); if (b) H.sfx(at(b), 'CineCut', 0.16); }
  const POSES1 = ['idle', 'flex', 'pointUp', 'kickR', 'tpose', 'hips', 'cross', 'pointUpL', 'shrug', 'split', 'wave', 'kickL', 'dance1', 'flex', 'tpose', 'hips', 'pointUp', 'dance2', 'kneel', 'idle'];
  stabs.forEach((st, i) => {
    TL.pose.set(st.t, POSES1[i]);
    const big = st.s === 0 || (st.b % 2 && st.s === 2);
    H.punch(st.t, big ? 1.4 : 0.8);
    if (big) TL.impact(st.t, { inv: 0.035, bw: 0.035, amp: 6, ca: 6, dur: 0.3 });
    TL.burst(st.t, { x: ex + (U.hash(i) - 0.5) * 120, y: 180 + U.hash(i + 3) * 80, n: 18, speed: [80, 260], life: [0.25, 0.6], colors: ['#ffffff', '#d8d8d8'], size: [3, 6], z: -90, glow: 0.3 });
  });
  // his line: one whole phrase popping in per bar (the original's words)
  const LINES = ['哦……', '你按了我的开关。', '这么想看我的新身体吗？', '真没礼貌……'];
  LINES.forEach((ln, b) => {
    const t = at(b, 0, b % 2 ? 2 : 0);
    H.bubble(t, at(b + 1) - 0.02, [ln], { x: 536, y: 58, tx: 520, ty: 100, times: [...ln].map((_, j) => t + j * 0.02), scale: 1, z: 58, every: 3 });
  });
  H.rim(at(2), at(4));

  // ---------------------------------------------------------------- bar 4: the smoke is blown away - METTATON EX
  const t4 = at(4);
  TL.enemy.set(t4, { sil: 0, reveal: 1, bob: 1, glow: 0.22 });
  H.bigHit(t4, { flash: 0.7 });
  H.sfx(t4, 'MttYeah', 0.7);
  H.sfx(t4, 'Cheer', 0.5);
  H.sfx(t4, 'OrchHit', 0.35);
  H.marquee(t4, 1e9);
  TL.stage.set(t4, { lit: 1, chase: 1 });
  TL.post.set(t4, { bloom: 1, bg: 0.8, vig: 0.4 });
  TL.post.to(t4, at(4, 1), { letter: 0 }, 'outExpo');
  TL.burst(t4, { x: ex, y: 180, n: 60, speed: [200, 600], life: [0.4, 0.9], colors: ['#ffffff', '#e0e0e0', MV.COL.pink], size: [3, 6], z: 60 });
  H.confetti(t4 + 0.02, 480, 40, { n: 50 });
  H.sfx(t4 + 0.02, 'Sparkles', 0.3);
  // a pose on every beat, the camera orbiting the stage
  const POSES2 = ['flex', 'hips', 'kickR', 'tpose', 'dance1', 'dance2', 'pointUp', 'shrug', 'split', 'cross', 'kickL', 'pointUpL', 'wave', 'flex', 'kneel', 'tpose'];
  const FACES2 = [7, 3, 5, 1, 7, 3, 2, 8, 5, 1, 3, 7, 2, 3, 8, 7];
  for (let k = 0; k < 16; k++) {
    const t = at(4, k);
    TL.pose.set(t, POSES2[k]);
    TL.face.set(t, FACES2[k]);
    H.punch(t, k % 4 === 0 ? 0.9 : 0.45);
    TL.enemy.to(t, t + 0.06, { x: ex + (k % 2 ? 6 : -6) }, 'outExpo');
    if (k % 2 === 0) H.flashbulb(t + S16 * 2, 0.25); // the press is here
  }
  TL.enemy.set(at(8), { x: ex });
  H.cut(t4, { x: 480, y: 188, zoom: 1.6, pitch: 0.28, roll: -0.06, yaw: 0.26 });
  H.cam(t4, at(6), { x: 480, y: 176, zoom: 1.75, pitch: 0.1, roll: 0.06, yaw: -0.24 }, 'inOut');
  H.cam(at(6), at(7, 2), { x: 480, y: 196, zoom: 1.4, pitch: 0.28, roll: -0.04, yaw: 0.2 }, 'inOut');
  H.cam(at(7, 2), at(8), { x: 486, y: 122, zoom: 2.8, pitch: 0, roll: 0.03, yaw: 0 }, 'inExpo');
  H.bubble(at(4), at(5, 2), ['不过你很幸运，', '我早就等不及让大家', '看看这副身体了！'], { x: 548, y: 44, tx: 532, ty: 100, step: S16 / 3, scale: 1, every: 2 });
  H.bubble(at(5, 2), at(7), ['作为谢礼……'], { x: 548, y: 60, tx: 532, ty: 100, step: S16 / 2, scale: 1 });
  H.bubble(at(7), at(8) - 0.02, ['我会让你人生的最后一刻', '变得……'], { x: 318, y: 40, tx: 452, ty: 100, step: S16 / 3, scale: 1 });
  TL.face.set(at(7, 2), 2); // the wink
  H.sfx(at(7, 2), 'Sparkle', 0.4);
  for (let s = 0; s < 4; s++) H.punch(at(7, 3, s), 0.4 + s * 0.3);

  // ---------------------------------------------------------------- bar 8: "unforgettable!" - the show's UI slams in
  const t8 = at(8);
  H.bubble(t8 - 0.02, at(9, 2), ['无与伦比般美妙！'], { x: 540, y: 56, tx: 520, ty: 100, times: [...'无与伦比般美妙！'].map(() => t8), scale: 1 });
  H.bigHit(t8, { flash: 0.6 });
  H.sfx(t8, 'Cheer', 0.55);
  H.sfx(t8, 'Applause', 0.35);
  H.confetti(t8, 480, 60, { n: 70, speed: [150, 520] });
  H.sfx(t8, 'Sparkles', 0.35);
  H.sfx(t8 - 0.02, 'Slam', 0.3); // (the ratings panel drops in)
  H.confetti(t8 + 0.05, 200, 40, { n: 30, ang: [-Math.PI * 0.6, -Math.PI * 0.1] });
  H.confetti(t8 + 0.05, 760, 40, { n: 30, ang: [-Math.PI * 0.9, -Math.PI * 0.4] });
  TL.pose.set(t8, 'flex'); TL.face.set(t8, 7);
  H.cut(t8, { x: 480, y: 262, zoom: 1.02, pitch: 0.05, roll: 0, yaw: 0 });
  H.cam(t8, at(8, 2), { x: 480, y: 258, zoom: 1.04, pitch: 0 }, 'outExpo');
  TL.box.set(t8 - 0.001, Object.assign({ draw: 0, fill: 1 }, MB));
  TL.box.to(t8, at(8, 1), { draw: 1 }, 'outExpo');
  H.sfx(at(8, 1), 'Select', 0.3);
  TL.hud.set(t8 - 0.001, { a: 0 });
  TL.hud.to(at(8, 1), at(8, 1) + 0.12, { a: 1 }, 'outExpo');
  H.punch(at(8, 1), 0.8);
  TL.btn.forEach((b, i) => {
    const t = at(8, 2, i * 2);
    b.set(t8 - 0.001, { a: 0, dy: 16, sel: 0 });
    b.to(t, t + 0.14, { a: 1, dy: 0 }, 'outBack');
    H.punch(t, 0.35);
    H.sfx(t, 'Slam', 0.16);
  });
  TL.rating.set(t8 - 0.001, { a: 0, dy: -60 });
  TL.rating.to(t8, t8 + 0.3, { a: 1, dy: 0 }, 'outBack');
  TL.tv.set(t8 - 0.001, { a: 0 });
  TL.tv.to(t8, t8 + 0.2, { a: 1, cam: 'CAM 1' }, 'out');
  H.narrate(at(8, 1), at(9), '* 镁塔顿 EX 首次亮相！', { step: S16 / 2 });
  TL.pose.set(at(8, 3), 'pointUp'); TL.face.set(at(8, 3), 3);

  // ---------------------------------------------------------------- bars 9-10: ACT -> BOAST
  TL.btn[1].set(at(8, 3, 2), { sel: 1 });
  TL.soul.set(at(8, 3, 2), { a: 1, x: L.btnX[1] + 16, y: L.btnY + 21, rot: 0 });
  H.sfx(at(8, 3, 2), 'MenuCursor', 0.4);
  H.actMenu(at(9), at(9, 1, 2), [[at(9), 0], [at(9, 0, 2), 1]], { select: at(9, 1) });
  TL.btn[1].set(at(9, 1), { sel: 0 });
  TL.soul.set(at(9, 1), { a: 0 });
  H.narrate(at(9, 1, 2), at(10, 2), '* 你说自己一次也不会被碰到。', { step: S16 / 2 });
  H.narrate(at(10, 2), at(11), '* 收视率暴涨！', { step: S16 / 2, color: '#ffff40' });
  H.score(at(10, 2), 1);
  H.pop(at(10, 2), 290, 110, '+317', { color: MV.COL.pink, scale: 2 });
  H.sfx(at(10, 2), 'Cheer', 0.4);
  TL.pose.set(at(9, 1), 'hips'); TL.face.set(at(9, 1), 8);
  H.bubble(at(9, 3), at(10, 2), ['哦？真是大胆！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 2 });
  TL.pose.set(at(10, 2), 'flex'); TL.face.set(at(10, 2), 7);
  H.cam(at(9, 1), at(10, 2), { x: 480, y: 250, zoom: 1.16 }, 'inOut');

  // ---------------------------------------------------------------- bar 11: the swell - the box closes round the soul
  const CX = B.x + B.w / 2;
  H.box(at(11), at(11, 2), B, 'outBack');
  TL.soul.set(at(11), { a: 1, x: CX, y: MB.y + MB.h / 2, rot: Math.PI });
  H.soulTo(at(11), at(11, 2), CX, B.y + 100, 'outExpo');
  H.sfx(at(11, 2), 'Ding', 0.3);
  TL.ring(at(11, 2), CX, B.y + 100, { r0: 6, r1: 40, color: '#ffff40' });
  TL.pose.set(at(11), 'kneel'); TL.face.set(at(11), 3);
  TL.pose.set(at(11, 3), 'pointUp');
  H.cam(at(11), at(11, 3, 3), { x: 480, y: 238, zoom: 1.34, pitch: 0.06 }, 'in2');
  for (let s = 0; s < 4; s++) { H.punch(at(11, 3, s), 0.4 + s * 0.3); TL.glitch(at(11, 3, s), at(11, 3, s) + 0.04, 0.15 + s * 0.1); }
  H.cut(at(12), { x: 480, y: 250, zoom: 1.12, pitch: 0, roll: 0, yaw: 0 });
  H.bigHit(at(12), { flash: 0.3, inv: 0.03, bw: 0.03 });
  TL.tv.set(at(12), { cam: 'CAM 2' });
});

// ---------------------------------------------------------------- stage dressing used across the film
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  // the show's proscenium: rows of marquee bulbs round the top of the stage.
  // TL.stage: lit (0..1 of the bulbs switched on, in order), chase (running light), hue, a
  TL.stage = new MV.Track({ a: 1, lit: 0, chase: 0, hue: 0 });
  H.marquee = (t0, t1) =>
    TL.add({
      t0, t1, z: -500,
      draw(ctx, emi, t) {
        const st = TL.stage.at(t);
        if (st.a <= 0.001 || st.lit <= 0.001) return;
        const bulbs = [];
        for (let x = 150; x <= 810; x += 22) bulbs.push([x, 8]);
        for (let y = 30; y <= 250; y += 22) { bulbs.push([150, y]); bulbs.push([810, y]); }
        bulbs.sort((a, b) => Math.abs(a[0] - 480) - Math.abs(b[0] - 480) || a[1] - b[1]);
        const beat = (t - T.off) / T.beat;
        bulbs.forEach(([x, y], i) => {
          if (i / bulbs.length > st.lit) return;
          const on = st.chase > 0.01 ? ((i + Math.floor(beat * 2)) % 3 === 0 ? 1 : 0.35) : 1;
          const col = st.hue > 0.5 ? ['#ff4fd8', '#ffff40', '#3ee0ff'][i % 3] : '#fff3b0';
          D.rect(ctx, x - 3, y - 3, 6, 6, col, st.a * on);
          D.rect(ctx, x - 1, y - 1, 2, 2, '#ffffff', st.a * on);
          if (emi) D.rect(emi, x - 7, y - 7, 14, 14, col, 0.5 * st.a * on);
        });
      },
    });
  // coloured rim light on the silhouette (pink from the left, cyan from the right)
  H.rim = (t0, t1) =>
    TL.add({
      t0, t1, z: -95,
      draw(ctx, emi, t, S) {
        const en = S.enemy;
        if (en.sil < 0.5) return;
        const k = U.clamp((t - t0) / (t1 - t0));
        const o = { pose: S.pose, face: S.face, body: S.body, lines: MV.COL.pink, alpha: 0.35 * k, glow: 0 };
        D.mtt(ctx, null, en.x - 2, en.y, o);
        D.mtt(ctx, null, en.x + 2, en.y, Object.assign({}, o, { lines: MV.COL.cyan }));
      },
    });
})();
