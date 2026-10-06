// ACT ONE (silent, 0 - T.pre = 14 s): the switch. A pixel stage play with sound
// effects only, at the original's pace: the box form turns round to find the
// "mirror", the yellow soul flies up and presses the switch on his back, OH YES, the
// stage goes white, two spotlights clunk on into rolling smoke - and the music
// starts on the silhouette (bar 0).
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const MB = L.menuBox, [bx, by] = L.boxEnemy;
  const PRE = T.pre;

  // ---------------------------------------------------------------- set dressing
  const T_ON = 0.5;
  TL.enemy.set(0, { a: 0, bx, by, sx: 1 });
  TL.boxForm.set(0, 1);
  TL.boxBody.set(0, 'idle0');
  TL.boxArms.set(0, 'armMic0');
  TL.box.set(0, Object.assign({ draw: 1, fill: 1 }, MB));
  TL.hud.set(0, { a: 0 });
  TL.btn.forEach((b, i) => b.set(0, { a: 0, sel: i === 1 ? 1 : 0 }));
  TL.soul.set(0, { a: 0, x: L.btnX[1] + 16, y: L.btnY + 21, rot: 0 });
  TL.post.set(0, { bg: 0, vig: 0.7, grid: 0.05, bloom: 1, ca: 0.4 });
  H.cut(0, { x: 480, y: 262, zoom: 1.12, pitch: 0.06, roll: 0, yaw: 0 });
  // the house lights snap on
  H.sfx(T_ON, 'LightSwitch', 0.6);
  TL.enemy.set(T_ON, { a: 1 });
  TL.hud.set(T_ON, { a: 1 });
  TL.btn.forEach((b) => b.set(T_ON, { a: 1 }));
  TL.post.set(T_ON, { vig: 0.5 });
  H.blackout(0, T_ON, 1, 1);
  // a top light cone on the star of the show (behind everything)
  const tOh = 9.3, tYes = 11.2, tDark = 11.9;
  TL.add({
    t0: T_ON, t1: tYes + 0.4, z: -300,
    draw(ctx, emi, t) {
      const a = t < tYes ? 1 : U.clamp(1 - (t - tYes) / 0.3);
      const flick = 0.9 + 0.1 * U.noise(t * 23);
      ctx.save(); ctx.globalAlpha = 0.1 * a * flick; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(bx - 30, -140); ctx.lineTo(bx + 30, -140); ctx.lineTo(bx + 150, 262); ctx.lineTo(bx - 150, 262); ctx.closePath(); ctx.fill();
      ctx.restore();
      D.rect(ctx, bx - 150, 250, 300, 12, '#ffffff', 0.06 * a);
      if (emi) { emi.globalAlpha = 0.06 * a; emi.fillStyle = '#ffffff'; emi.fillRect(bx - 90, -140, 180, 400); emi.globalAlpha = 1; }
    },
  });
  // idle: the screen face cycles its light patterns
  for (let t = T_ON, i = 0; t < 3.95; t += 0.24, i++) TL.boxBody.set(t, 'idle' + (i % 4));
  for (let t = T_ON, i = 0; t < 3.95; t += 0.48, i++) TL.boxArms.set(t, 'armMic' + (i % 2));

  // ---------------------------------------------------------------- the mirror
  H.narrate(0.7, 3.9, '* 你告诉镁塔顿他身后有一面镜子。', { step: 0.085 });
  H.bubble(2.45, 3.95, ['哦？？？一面镜子？'], { x: 600, y: 78, tx: 590, ty: 110, step: 0.07, scale: 1 });
  // spin round to face the "mirror": squash through zero width, come out as the back view
  const spin = (t0, frame, arms) => {
    TL.enemy.to(t0, t0 + 0.12, { sx: 0.05 }, 'in2');
    TL.boxBody.set(t0 + 0.12, frame);
    TL.boxArms.set(t0 + 0.12, arms);
    TL.enemy.to(t0 + 0.12, t0 + 0.26, { sx: 1 }, 'out2');
    H.sfx(t0, 'SwipeShort', 0.35);
    H.punch(t0 + 0.12, 0.5);
  };
  spin(4.0, 'switchOff', 'armBack0');
  H.bubble(4.35, 5.45, ['我必须以完美的姿态', '面对镜子……'], { x: 600, y: 70, tx: 590, ty: 110, step: 0.06, scale: 1 });
  for (let t = 4.3, i = 0; t < 6.5; t += 0.16, i++) TL.boxArms.set(t, 'armBack' + (i % 2));
  H.cam(4.0, 5.4, { x: 480, y: 250, zoom: 1.3, pitch: 0.04 }, 'inOut');

  // ---------------------------------------------------------------- the soul presses the switch
  const tGo = 5.5, tTap = 6.55;
  const sw = [bx - 6, by - 2]; // the switch, from the back-view art (42..60, 40..50 on the 108x92 canvas)
  TL.btn[1].set(tGo, { sel: 0 });
  TL.soul.set(tGo - 0.001, { a: 1, x: L.btnX[1] + 16, y: L.btnY + 21, rot: 0 });
  H.sfx(tGo, 'MenuSelect', 0.45);
  TL.aura.to(tGo, tGo + 0.2, { v: 1 }, 'out');
  // a curved rise: out of the button, through the top of the dialogue box, up to the switch
  TL.soul.to(tGo, tGo + 0.22, { y: L.btnY - 18, rot: Math.PI }, 'outExpo');
  TL.soul.to(tGo + 0.22, tTap - 0.08, { x: sw[0] - 4, y: sw[1] + 16 }, 'inOut');
  TL.soul.to(tTap - 0.08, tTap, { x: sw[0], y: sw[1] + 4 }, 'in2');
  H.boxHit(tGo + 0.42, 'top', (L.btnX[1] + 16 - MB.x) / MB.w + 0.05, -12);
  H.sfx(tGo + 0.42, 'Squeak', 0.4);
  // the camera rides with the soul, framed a little ahead of it so the target (the switch on
  // his back) is always in shot above; the plane tilts back as it climbs
  const leadCam = (t, zoom, pitch, roll) => { const s = TL.soul.at(t); return { x: U.lerp(s.x, sw[0], 0.35), y: U.lerp(s.y, sw[1], 0.4) - 10, zoom, pitch, roll, yaw: 0 }; };
  H.cut(tGo, leadCam(tGo, 1.7, 0.3, -0.05));
  [0.25, 0.5, 0.75].forEach((k, i) => { const t = U.lerp(tGo, tTap, k); H.cam(U.lerp(tGo, tTap, k - 0.25), t, leadCam(t, 1.8 + k * 1.2, 0.3 - k * 0.14, -0.05 + k * 0.06), i ? 'lin' : 'in2'); });
  H.cam(U.lerp(tGo, tTap, 0.75), tTap, { x: sw[0], y: sw[1] + 10, zoom: 3.4, pitch: 0.12, roll: 0.02, yaw: 0 }, 'out2');
  TL.post.to(tGo, tGo + 0.2, { letter: 1, vig: 0.65 }, 'out');
  // the tap
  TL.boxBody.set(tTap, 'switchOn');
  H.sfx(tTap, 'SwitchPull', 0.8);
  H.bigHit(tTap, { amp: 10, flash: 0.5 });
  TL.burst(tTap, { x: sw[0] + 4, y: sw[1], n: 26, speed: [80, 260], life: [0.15, 0.4], colors: ['#ffffff', '#ffff40'], size: [2, 3], z: 60 });
  TL.soul.to(tTap, tTap + 0.1, { y: sw[1] + 16 }, 'outExpo');
  TL.soul.to(tTap + 0.5, tTap + 1.6, { x: 480, y: 352 }, 'inOut');
  TL.aura.to(tTap + 0.5, tTap + 1.2, { v: 0 }, 'inOut');
  TL.post.to(tTap + 0.1, tTap + 0.8, { letter: 0, vig: 0.5 }, 'inOut');
  H.cam(tTap + 0.05, 7.25, { x: 500, y: 200, zoom: 1.7, pitch: 0.02, roll: 0, yaw: 0 }, 'outExpo');
  H.cam(7.25, 8.7, { x: 490, y: 215, zoom: 1.55 }, 'inOut');

  // ---------------------------------------------------------------- short circuit
  TL.boxArms.set(tTap + 0.05, 'armShock');
  TL.enemy.to(tTap, tTap + 0.1, { shake: 3 }, 'out');
  const zaps = [6.7, 7.1, 7.55, 7.95, 8.35, 8.7];
  zaps.forEach((tz, i) => {
    H.zap(tz, bx + (i % 2 ? 58 : -60) + (U.hash(i) - 0.5) * 20, by - 20 + (U.hash(i + 5) - 0.5) * 60);
    if (i % 2 === 0) H.sfx(tz, 'Shock', 0.3);
    TL.glitch(tz, tz + 0.05, 0.25);
    TL.boxArms.set(tz, i % 2 ? 'armShocked' : 'armShock');
  });
  H.bubble(6.8, 7.3, ['唔……'], { x: 600, y: 90, tx: 590, ty: 120, step: 0.12 });
  H.bubble(7.3, 7.8, ['我……'], { x: 604, y: 86, tx: 590, ty: 120, step: 0.12 });
  H.bubble(7.8, 8.3, ['你是……'], { x: 598, y: 92, tx: 590, ty: 120, step: 0.1 });
  H.bubble(8.3, 9.2, ['……按钮……'], { x: 596, y: 88, tx: 590, ty: 120, step: 0.1 });
  TL.enemy.to(7.8, 9.2, { shake: 6 }, 'in');
  spin(8.8, 'idle0', 'armShocked');

  // ---------------------------------------------------------------- OH YES
  H.sfx(tOh, 'OhYes', 0.95);
  H.hit(tOh, 1.2, { flash: 0.3 });
  // the arms fold in over the long "OHHHH", the box shaking harder and harder
  for (let i = 0; i < 6; i++) TL.boxBody.set(tOh + 0.15 + i * 0.16, 'armsIn' + i);
  TL.boxArms.set(tOh + 0.15, 'none');
  TL.enemy.to(tOh, tYes, { shake: 14 }, 'in2');
  H.cam(tOh, tYes, { x: 480, y: 170, zoom: 2.3, roll: 0.05 }, 'in2');
  for (let k = 0; k < 10; k++) H.punch(tOh + 0.2 + k * 0.19, 0.4 + k * 0.12);
  // light pours out of the seams: rays turning round the box, brightening to white
  TL.add({
    t0: tOh, t1: tYes + 0.3, z: -50,
    draw(ctx, emi, t) {
      const u = U.clamp((t - tOh) / (tYes - tOh));
      const n = 16, rot = (t - tOh) * (0.6 + u * 2.4);
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * U.TAU, len = 120 + 900 * U.eOut(u) * (0.6 + 0.4 * U.hash(i * 3.3)), w = 0.03 + 0.05 * u;
        ctx.save(); ctx.translate(bx, by - 10); ctx.rotate(a);
        ctx.globalAlpha = (0.25 + 0.6 * u) * (i % 2 ? 0.6 : 1);
        ctx.fillStyle = i % 3 === 0 ? '#fff6a0' : '#ffffff';
        ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(len, -len * w); ctx.lineTo(len, len * w); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      if (emi) { emi.globalAlpha = 0.5 * u; emi.fillStyle = '#ffffff'; emi.fillRect(bx - 200 - 400 * u, by - 200 - 400 * u, 400 + 800 * u, 400 + 800 * u); emi.globalAlpha = 1; }
    },
  });
  H.whiteout(tYes - 0.9, tYes, 0, 1, 'in2');
  H.bigHit(tYes, { amp: 24, flash: 0 });
  H.whiteout(tYes, tDark, 1, 1);
  TL.enemy.set(tYes, { a: 0, shake: 0 });
  TL.hud.set(tYes, { a: 0 });
  TL.btn.forEach((b) => b.set(tYes, { a: 0 }));
  TL.box.set(tYes, { draw: 0, fill: 0 });
  TL.soul.set(tYes, { a: 0 });
  TL.boxForm.set(tYes, 0);

  // ---------------------------------------------------------------- darkness, two spotlights, smoke
  H.whiteout(tDark, tDark + 0.06, 1, 0, 'out');
  const spotL = [236, 462], spotR = [724, 462], aim = [480, 170];
  const onL = tDark + 0.05, onR = tDark + 0.45;
  H.sfx(onL, 'LightSwitch', 0.8);
  H.sfx(onR, 'LightSwitch', 0.8);
  H.punch(onL, 1.2); H.punch(onR, 1.2);
  H.stageLights({ t0: onL - 0.01, t1: T.at(0), lights: [
    { p: spotL, on: onL, aim: () => aim },
    { p: spotR, on: onR, aim: () => aim, flip: true },
  ] });
  H.cut(tDark, { x: 480, y: 262, zoom: 1.02, pitch: 0.16, roll: 0, yaw: 0 });
  H.cam(tDark, PRE + 0.2, { x: 480, y: 240, zoom: 1.2, pitch: 0.1 }, 'inOut');
  TL.post.set(tDark, { vig: 0.55, bg: 0.25, bloom: 1.2, letter: 0.6 });
  // smoke rolls in from the floor and piles up round the spot where he will stand;
  // it is blown away on the bar-4 reveal
  H.smokeBank(onL, T.at(4, 0, 2), aim[0], 262, { n: 16, spread: 460, fade: [T.at(4), T.at(4, 0, 2)] });
});

// ---------------------------------------------------------------- stage helpers used across the film
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round;
  // full-screen black / white overlays (screen space)
  const overlay = (col) => (t0, t1, a0, a1, ease = 'lin') =>
    TL.add({
      t0, t1: Math.max(t1, t0 + 1e-3), z: 95, screen: true,
      draw(ctx, emi, t) {
        const u = t1 > t0 ? U.clamp((t - t0) / (t1 - t0)) : 1;
        D.rect(ctx, 0, 0, MV.SW, MV.SH, col, U.lerp(a0, a1, MV.EASE[ease](u)));
      },
    });
  H.blackout = overlay('#000000');
  H.whiteout = overlay('#ffffff');
  // a crackle of electricity (box-form sheet "zap" frames)
  H.zap = (t, x, y, o = {}) => {
    if (o.sfx !== false) H.sfx(t, 'Shock', o.vol ?? 0.18);
    return TL.add({
      t0: t, t1: t + (o.dur || 0.18), z: o.z ?? 40,
      draw(ctx, emi, tt) {
        const f = Math.floor((tt - t) / 0.04) % 3;
        MV.spr(ctx, MV.boxPart('zap' + f), x, y, { scale: o.scale || 2, rot: (U.hash(t * 7) - 0.5) * 1.2 });
        if (emi) D.rect(emi, x - 30, y - 30, 60, 60, '#ffffa0', 0.35);
      },
    });
  };
  // floor spotlights: {p, on (time), aim()->[x,y], flip, sweep(t)->angle offset, col, k(t) dimmer}
  H.stageLights = (o) =>
    TL.add({
      t0: o.t0, t1: o.t1, z: o.z ?? -200,
      draw(ctx, emi, t) {
        for (const l of o.lights) {
          if (t < l.on) continue;
          const [ax, ay] = l.aim(t);
          const ang = Math.atan2(ay - l.p[1], ax - l.p[0]) + (l.sweep ? l.sweep(t) : 0);
          const flick = t - l.on < 0.12 ? (Math.floor((t - l.on) * 60) % 2 ? 0.3 : 1) : 1;
          D.spotlight(ctx, emi, l.p[0], l.p[1], ang, { on: flick * (l.k ? l.k(t) : 1), len: l.len || 720, spread: l.spread || 0.13, beamA: l.beamA ?? 0.85, col: l.col ? l.col(t) : '#ffffff', flip: l.flip });
        }
      },
    });
  // a bank of rolling smoke clouds (sheet "smoke") around (cx, cy); dissolves over fade
  // o: {n, spread, fade: [t0, t1], col}
  H.smokeBank = (t0, t1, cx, cy, o = {}) => {
    const n = o.n || 14;
    const puffs = [];
    // a few big clouds low at the back, a crowd of small ones round the feet; the upper
    // body stays clear so the crossing beams light up the silhouette from behind
    for (let i = 0; i < n; i++) {
      const h = (k) => U.hash(i * 7.3 + k), big = i < (o.big ?? 4);
      puffs.push({
        d: h(1) * 0.9, big,
        x: cx + (h(2) - 0.5) * (o.spread || 520) * (big ? 1.2 : 1),
        y: cy + (big ? 40 + h(3) * 30 : (h(3) - 0.35) * 70),
        s: big ? 2 : 1, vx: (h(5) - 0.5) * 36, vy: -4 - h(6) * 10, flip: h(7) > 0.5, rot: (h(8) - 0.5) * 0.3,
      });
    }
    puffs.sort((a, b) => (a.big === b.big ? a.y - b.y : a.big ? -1 : 1));
    return TL.add({
      t0, t1, z: o.z ?? -150,
      draw(ctx, emi, t) {
        const fade = o.fade ? 1 - U.clamp((t - o.fade[0]) / (o.fade[1] - o.fade[0])) : 1;
        // blown outward as it fades
        const blow = o.fade ? U.eOut(U.clamp((t - o.fade[0]) / (o.fade[1] - o.fade[0]))) : 0;
        for (const p of puffs) {
          const tt = t - t0 - p.d;
          if (tt < 0) continue;
          const grow = U.eOut(U.clamp(tt / 0.9));
          const k = fade * (o.thin ? o.thin(t, p) : 1);
          const px = p.x + p.vx * tt + (p.x - cx) * blow * 1.5, py = p.y + p.vy * tt + (1 - grow) * 40 + blow * 60;
          D.smoke(ctx, emi, px, py, { scale: p.s, flip: p.flip, rot: p.rot + tt * 0.03, k, alpha: (p.big ? 0.55 : 0.8) * grow, col: o.col });
        }
      },
    });
  };
})();
