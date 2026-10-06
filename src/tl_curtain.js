// ACT THREE (silent, T.dur -> T.end = 30 s): an abridged curtain call, sound effects only.
// Use verbatim excerpts from the supplied 06:53-07:56 transcript: ratings, the ghost,
// three audience calls, his decision to stay and faith in the soul, then a white power-off
// flash. Omit whole lines for time; do not replace them with invented dialogue.
// Relative timing: 0-4.2 ratings / hotline; 4.2-11.4 ghost; 11.4-17.4 more calls;
// 17.4-23.5 stay / soul; 23.5-27.2 battery / goodbye; 27.2-30 last line / flash / black.
// The final 2.8 s include the last line, a 0.2 s white flash and one full second of black.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const MB = L.menuBox, [ex, ey] = L.enemy;
  const c = T.dur; // the music has just rung out
  const w1 = (lines) => Math.max(...lines.map((l) => D.textWidth(l, { scale: 1 }))) + 20;
  let tc = c + 0.4; // the sequencer's clock
  // one of his lines: typed at `step`, held for `hold` + a little per character; x kept so the
  // bubble ends inside the frame
  const say = (lines, o = {}) => {
    const n = [...lines.join('')].length, step = o.step ?? 0.05, hold = o.hold ?? 0.8 + n * 0.022;
    const t0 = tc + (o.pause ?? 0), t1 = t0 + n * step + hold;
    H.bubble(t0, t1, lines, Object.assign({ x: Math.min(560, 792 - w1(lines)), y: 52, tx: 540, ty: 110, step }, o));
    tc = t1 + 0.12;
    return [t0, t1];
  };
  // the ghost on the line: a dull voice, a few letters at a time, the text shaking
  const PH = [ex + 104, ey - 120];
  const ghost = (lines, o = {}) => {
    const n = [...lines.join('')].length, step = o.step ?? 0.07, t0 = tc + (o.pause ?? 0.08), t1 = t0 + n * step + (o.hold ?? 0.6 + n * 0.018);
    // (beside the phone; the tall portrait frame has it over his head instead)
    const w = w1(lines), [x, y] = MV.PORTRAIT ? [480 - w / 2 + 20, 20 - lines.length * 9] : [Math.min(622, 800 - w), 104];
    H.bubble(t0, t1, lines, { x, y, tx: 606, ty: 150, step, jagged: true, voice: 'Txt1', vol: 0.25, every: 2 });
    tc = t1 + 0.08;
    return [t0, t1];
  };
  const narrate = (t0, t1, str, o) => H.narrate(t0, t1, str, Object.assign({ step: 0.07 }, o));

  // ---------------------------------------------------------------- the stage calms down; the ratings
  TL.post.to(c, c + 1, { bloom: 1, ca: 0.4, vig: 0.45 }, 'inOut');
  TL.stage.set(c + 0.6, { hue: 0, chase: 0 });
  H.box(c, c + 0.3, MB, 'outExpo');
  TL.soul.to(c, c + 0.3, { a: 0 }, 'out');
  TL.hud.to(c, c + 0.3, { a: 1 }, 'out');
  TL.btn.forEach((b) => b.to(c, c + 0.3, { a: 1, dy: 0, sel: 0 }, 'out'));
  TL.tv.to(c + 0.5, c + 1, { combo: 0 }, 'step');
  TL.pose.set(c, 'idle');
  H.cam(c, c + 1.2, { x: 480, y: 214, zoom: 1.28, pitch: 0.02, roll: 0, yaw: 0 }, 'inOut');
  narrate(c + 0.5, c + 3.2, '* 他的收视率达到了 12000！', { color: MV.COL.gold, step: 0.08 });
  TL.face.set(c + 0.3, 7);
  say(['哦，看看这收视率吧！！！']);
  TL.face.set(tc, 1);
  const [tHotline] = say(['让我们看看', '谁是第一位观众！']);
  H.cam(tHotline, tc, { x: 480, y: 210, zoom: 1.34 }, 'inOut');

  // ---------------------------------------------------------------- the phone: a quiet ghost
  const tRing = tc + 0.2;
  for (const k of [0, 0.55]) H.sfx(tRing + k, 'Phone', 0.6);
  TL.face.set(tRing, 5);
  tc = tRing + 1.1;
  H.cam(tRing, tRing + 0.6, { x: 530, y: 196, zoom: 1.42 }, 'outExpo');
  // (the lights sink to him and the phone while the ghost talks)
  const tG0 = tc;
  TL.stage.to(tG0, tG0 + 1, { a: 0.45 }, 'inOut');
  TL.post.to(tG0, tG0 + 1, { vig: 0.62 }, 'inOut');
  ghost(['你好，镁塔顿……']);
  TL.face.set(tc, 'faceU0');
  ghost(['你给我的生活', '带来了光彩。'], { hold: 1.35 });
  TL.face.set(tc, 'faceU1');
  const [tMiss] = ghost(['我会想你的……', '镁塔顿……'], { hold: 1.2 });
  H.cam(tG0, tMiss, { x: 540, y: 190, zoom: 1.56 }, 'inOut');
  H.sfx(tc - 0.3, 'Select', 0.25); // (the line clicks dead)
  H.phone(tRing, tc, PH);

  // ---------------------------------------------------------------- "no, wait!" - every phone at once
  TL.face.set(tc, 6);
  TL.stage.to(tc, tc + 0.3, { a: 1 }, 'out');
  TL.post.to(tc, tc + 0.3, { vig: 0.45 }, 'out');
  H.cam(tc, tc + 0.35, { x: 480, y: 214, zoom: 1.12 }, 'outExpo');
  H.punch(tc, 0.5);
  say(['不，等等！', '我再接一个电话！！'], { step: 0.04 });
  // (spread round him clear of each other, the ratings board and the menu box; the tall
  // portrait frame stacks them above him instead)
  const tF = tc, CALLS = [
    [['镁塔顿，', '你的节目……'], [410, 8], [260, -35]],
    [['镁塔顿，你走了之后', '我就不知道要怎么……'], [610, 28], [455, 0]],
    [['镁塔顿，', '我镁塔顿形状的', '心中空缺了一个', '镁塔顿形状的洞。'], [620, 150], [280, 150]],
  ];
  CALLS.forEach(([lines, pl, pp], i) => {
    const [x, y] = MV.PORTRAIT ? pp : pl;
    const t = tF + i * 0.32;
    H.sfx(t, 'Phone', 0.38 + 0.08 * i);
    H.punch(t, 0.35);
    H.bubble(t, tF + 4.1, lines, { x, y, tx: x + 20, ty: y + lines.length * 18 + 26, step: 0.03, jagged: true, voice: 'Txt2', vol: 0.15, every: 2 });
  });
  TL.face.set(tF + 0.1, 5);
  tc = tF + 4.3;

  // ---------------------------------------------------------------- he stays
  TL.face.set(tc, 'faceU2');
  const tStay = tc;
  say(['也许……', '我最好在这里多呆一会儿。'], { hold: 1.5 });
  H.cam(tStay, tc, { x: 480, y: 204, zoom: 1.42 }, 'inOut');
  // he turns to the soul: it lights up in the box below him, the camera takes them both in
  const tYou = tc;
  TL.soul.set(tYou, { x: 480, y: MB.y + 96, rot: Math.PI, sc: 1 });
  TL.soul.to(tYou, tYou + 0.5, { a: 1 }, 'out');
  H.cam(tYou, tYou + 1.2, { x: 480, y: 238, zoom: 1.16 }, 'inOut');
  TL.face.set(tYou, 3);
  say(['你已经向我证明了你的强大。'], { hold: 0.65 });
  say(['也许你强到……', '足以跨过艾斯戈尔的阻拦。', '我相信你。'], { hold: 0.9 });

  // ---------------------------------------------------------------- the battery, final words
  const tBat = tc;
  TL.soul.to(tBat, tBat + 0.4, { a: 0 }, 'out');
  H.cam(tBat, tBat + 1.2, { x: 480, y: 200, zoom: 1.45 }, 'inOut');
  TL.face.set(tBat, 'faceU3');
  const [tIneff] = say(['事实上，这个形态下的', '电池……十分低效。'], { hold: 1.2 });
  H.sfx(tIneff + 0.8, 'Warning', 0.25); H.sfx(tIneff + 1.2, 'Warning', 0.25);
  TL.face.set(tc, 'faceU2');
  say(['还有在座的各位……'], { step: 0.07, hold: 0.65 });
  const tLast = T.end - 2.8;
  if (tc > tLast + 1e-6) console.warn(`curtain dialogue overruns its budget by ${(tc - tLast).toFixed(2)} s`);
  TL.face.set(tLast, 3);
  const tOff = tLast + 1.6;
  H.bubble(tLast, tOff + 0.1, ['你们是绝佳的观众……'], { x: 560, y: 60, tx: 540, ty: 110, step: 0.09 });
  // Abrupt white-out as in the reference; the picture and broadcast graphics die together.
  TL.stage.set(tOff, { a: 0 });
  TL.enemy.set(tOff, { glow: 0 });
  TL.tv.set(tOff, { a: 0 });
  TL.rating.set(tOff, { a: 0 });
  TL.post.set(tOff, { vig: 0, scan: 0, letter: 0 });
  H.whiteout(tOff, tOff + 0.2, 1, 1);
  H.sfx(tOff, 'Noise', 0.3);
  H.sfx(tOff + 0.02, 'Power', 0.3);
  H.blackout(tOff + 0.2, T.end, 1, 1);
  H.battery(tIneff + 0.3, tOff, [ex + 60, ey - 170]);
  MV.curtainEnd = tOff + 1.2;
});

// ---------------------------------------------------------------- curtain pieces
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round;
  // the phone (box-form sheet art) ringing beside him: shakes while it rings, then held still
  H.phone = (t0, t1, [x, y]) =>
    TL.add({
      t0, t1, z: 30,
      draw(ctx, emi, t) {
        const a = U.clamp((t - t0) / 0.15) * U.clamp((t1 - t) / 0.2), ring = t < t0 + 0.9;
        const jx = ring ? R(Math.sin(t * 90) * 2) : 0;
        MV.spr(ctx, MV.boxPart('phone'), x + jx, y, { scale: 2, alpha: a, rot: ring ? Math.sin(t * 60) * 0.12 : 0 });
        if (ring && Math.floor(t * 8) % 2) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) D.rect(ctx, x + s * (30 + i * 6), y - 20 + i * 8, 3, 8 - i * 2, '#ffffff', a);
        if (emi) D.rect(emi, x - 24, y - 50, 48, 100, '#ffffff', 0.12 * a);
      },
    });
  // a battery icon over him running down, the last cell blinking red
  H.battery = (t0, t1, [x, y]) =>
    TL.add({
      t0, t1, z: 60,
      draw(ctx, emi, t) {
        const a = U.clamp((t - t0) / 0.15) * U.clamp((t1 - t) / 0.2), u = U.clamp((t - t0) / (t1 - t0 - 0.5));
        D.frame(ctx, x - 30, y - 12, 56, 24, 2, '#ffffff', a); D.rect(ctx, x + 26, y - 5, 4, 10, '#ffffff', a);
        const n = Math.max(1, 4 - Math.floor(u * 4)), blink = Math.floor(t * 6) % 2;
        for (let i = 0; i < n; i++) D.rect(ctx, x - 26 + i * 13, y - 8, 10, 16, n === 1 ? (blink ? '#ff2030' : '#701018') : '#7dff5a', a);
      },
    });
})();
