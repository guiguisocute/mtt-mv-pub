// Bars 64-70: CALL AND RESPONSE on tape (a Rhythm Heaven homage, a Taiko lane on top),
// built from his original REC / REW attack. "* REC": he drops bombs into the box on a
// rhythm and they hang there, recorded (blue KA notes on the drum lane). "<< REW": the
// tape runs back - the bombs rise along their paths - and the soul answers the SAME
// rhythm a bar later, shooting each one as it lifts (red DON notes; each bursts into a
// plus above the soul). Three rounds, each harder; bar 70: eight at once, on the 16ths.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const B = L.box, CX = B.x + B.w / 2;
  const SY = B.y + 108; // the soul's row
  const HANG = B.y + 42; // where the bombs hang
  const COLS = [430, 455, 480, 505, 530];
  const t0 = at(64), t1 = at(71);

  // ---------------------------------------------------------------- set: back in the box, on tape
  TL.post.set(t0, { bgHue: 0, bloom: 1.1, ca: 0.8, desat: 0, vig: 0.4 });
  TL.stage.set(t0, { hue: 0, chase: 1 });
  H.box(t0 - 0.1, t0 + 0.1, B, 'outExpo');
  TL.hud.to(t0 - 0.1, t0 + 0.1, { a: 1 }, 'out');
  TL.btn.forEach((b) => b.to(t0 - 0.1, t0 + 0.1, { a: 1, dy: 0 }, 'out'));
  H.soulTo(at(63, 3), t0, CX, SY, 'inOut');
  H.cut(t0, { x: 480, y: 262, zoom: 1.12, pitch: 0.04, roll: 0, yaw: 0 });
  H.bigHit(t0, { flash: 0.4 });
  TL.tv.set(t0, { cam: 'CAM TAPE' });
  H.bubble(t0, at(65), ['拍子都记下来了吗？', '现在——倒带！'], { x: 548, y: 50, tx: 532, ty: 104, step: S16 / 3 });

  const ROUNDS = [
    { call: 64, pat: [0, 4, 8, 12] },
    { call: 66, pat: [0, 3, 6, 8, 12] },
    { call: 68, pat: [0, 2, 4, 6, 8, 10, 12, 13, 14] },
  ];
  const drum = []; // Taiko lane notes: {t, don}
  ROUNDS.forEach((rd, ri) => {
    const cb = rd.call, rb = cb + 1;
    H.tapeIcon(at(cb), at(rb), 'rec');
    H.tapeIcon(at(rb), at(rb + 1), 'rew');
    TL.remap(at(rb), at(rb + 1), (t) => t); // (VHS lines while the tape runs back)
    H.sfx(at(rb), 'Noise', 0.25);
    const n = rd.pat.length;
    rd.pat.forEach((s, i) => {
      const tc = at(cb, 0, s), tr = at(rb, 0, s);
      const x = COLS[(i * 2 + ri) % COLS.length];
      drum.push({ t: tc, don: false }); drum.push({ t: tr, don: true });
      // the call: a bomb drops from his body, lands on the beat and hangs (recorded)
      const drop = (t) => { const u = U.clamp((t - (tc - 0.3)) / 0.3); return [U.lerp(480, x, u), U.lerp(200, HANG, u * u)]; };
      H.sfx(tc, 'BombFall', 0.25);
      H.punch(tc, 0.4);
      // the response: rewind - it lifts back up; shot while lifting
      const lift = (t) => { const u = U.clamp((t - (tr - 0.08)) / 0.4); return [U.lerp(x, 480, u), U.lerp(HANG, 200, u * u) - 6 * U.clamp((t - tr + 0.08) / 0.08)]; };
      const hitY = lift(tr)[1];
      TL.add({
        t0: tc - 0.3, t1: tr, z: 25, kind: 'white',
        pos: (t) => (t < tr - 0.08 ? drop(t) : lift(t)),
        draw(ctx, emi, t) {
          const [bx, by] = this.pos(t);
          const hot = t > tr - BEAT && Math.floor(t * 16) % 2;
          MV.spr(ctx, MV.part(hot ? 'bombB' : 'bomb'), bx, by, { rot: Math.sin(t * 7 + i) * 0.15 });
          if (emi) D.rect(emi, bx - 12, by - 12, 24, 24, '#ff3040', hot ? 0.45 : 0.15);
        },
        hit(t, px, py) { const [bx, by] = this.pos(t); return Math.abs(px - bx) < 12 && Math.abs(py - by) < 14; },
      });
      // the soul steps under it just before and fires
      H.soulTo(tr - Math.min(S16 * 1.5, 0.12), tr - 0.07, x, SY, 'outExpo');
      H.shootAt(tr, hitY, { x, pop: ['良', '良！', '好', '良'][i % 4], popCol: '#ffe24a' });
      // the burst: a plus whose vertical arm only goes up (the soul is below), horizontal across
      H.plus(tr, [x, hitY], { span: { x0: B.x - 200, x1: B.x + B.w + 200, y0: -200, y1: hitY + 6 }, beamDur: 0.14, beamW: 12, vol: 0.25, shake: 0.35 });
    });
    H.bubble(at(cb, 3), at(rb, 1), [['来，照着做！', '再来！', '跟上了吗？'][ri]], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 3 });
    TL.pose.set(at(cb), 'kickR'); TL.pose.set(at(cb, 2), 'kickL'); TL.pose.set(at(rb), 'split'); TL.pose.set(at(rb, 2), 'dance1');
    TL.face.set(at(cb), 3); TL.face.set(at(rb), 7);
    H.cam(at(cb), at(rb), { x: 480, y: 250, zoom: 1.18, roll: -0.02 }, 'inOut');
    H.cam(at(rb), at(rb + 1), { x: 480, y: 300, zoom: 1.34, roll: 0.03, pitch: 0.12 }, 'inOut');
  });
  // bar 70: eight bombs dropped in a row on beat 1, rewound on the sixteenths of beats 3-4
  const row = [0, 1, 2, 3, 4, 3, 2, 1].map((c, i) => [COLS[c] + (i > 4 ? 6 : 0), i]);
  row.forEach(([x, i]) => {
    const tc = at(70, 0, i * 0.5), tr = at(70, 2, i);
    drum.push({ t: tr, don: true });
    const drop = (t) => { const u = U.clamp((t - (tc - 0.25)) / 0.25); return [U.lerp(480, x, u), U.lerp(200, HANG - (i % 2) * 14, u * u)]; };
    const lift = (t) => { const u = U.clamp((t - (tr - 0.06)) / 0.35); const p = drop(tc); return [U.lerp(p[0], 480, u), U.lerp(p[1], 200, u * u) - 6 * U.clamp((t - tr + 0.06) / 0.06)]; };
    const hitY = lift(tr)[1];
    TL.add({
      t0: tc - 0.25, t1: tr, z: 25, kind: 'white', pos: (t) => (t < tr - 0.06 ? drop(t) : lift(t)),
      draw(ctx, emi, t) { const [bx, by] = this.pos(t); MV.spr(ctx, MV.part('bomb'), bx, by); if (emi) D.rect(emi, bx - 12, by - 12, 24, 24, '#ff3040', 0.3); },
      hit(t, px, py) { const [bx, by] = this.pos(t); return Math.abs(px - bx) < 12 && Math.abs(py - by) < 14; },
    });
    H.soulTo(tr - 0.09, tr - 0.065, x, SY, 'outExpo');
    H.shootAt(tr, hitY, { x, pop: '良', popCol: '#ffe24a' });
    H.plus(tr, [x, hitY], { span: { x0: B.x - 200, x1: B.x + B.w + 200, y0: -200, y1: hitY + 6 }, beamDur: 0.09, beamW: 10, vol: 0.2, shake: 0.3 });
  });
  H.tapeIcon(at(70, 2), at(71), 'rew');
  TL.remap(at(70, 2), at(71), (t) => t);
  H.bubble(at(70), at(70, 2), ['全部倒带！'], { x: 548, y: 60, tx: 532, ty: 104, step: S16 / 3 });
  H.cam(at(70, 2), at(71), { x: 480, y: 310, zoom: 1.5, roll: 0, pitch: 0.18 }, 'in2');
  H.sfx(at(70, 3, 3), 'Cheer', 0.5);
  H.taiko(t0, at(71), drum);
});

// ---------------------------------------------------------------- the drum lane (a Taiko homage)
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round, BEAT = T.beat;
  // notes scroll right to left into the drum face on the left: blue rim (KA, his call),
  // red face (DON, the soul's answer); the face flashes and the judgement pops on each
  H.taiko = (t0, t1, notes) => {
    const Y = MV.PORTRAIT ? MV.PTOP + 186 : 70, X0 = MV.PORTRAIT ? 70 : 200, W = MV.PORTRAIT ? MV.SW - X0 : 720, SPEED = 300 / BEAT; // px per second
    notes.forEach((n) => H.sfx(n.t, n.don ? 'TaikoDon' : 'TaikoKa', n.don ? 0.5 : 0.42));
    TL.add({
      t0, t1, z: 84, screen: true,
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0) / 0.25) * U.clamp((t1 - t) / 0.25);
        D.rect(ctx, X0 - 60, Y - 30, W + 60, 60, '#1a0d10', 0.85 * k);
        D.rect(ctx, X0 - 60, Y - 32, W + 60, 2, '#ff7f27', k); D.rect(ctx, X0 - 60, Y + 30, W + 60, 2, '#ff7f27', k);
        // the drum face
        const last = notes.filter((n) => n.t <= t && t - n.t < 0.12).pop();
        D.pixelRing(ctx, X0, Y, 22, 3, '#ffffff', k);
        if (last) {
          const u = (t - last.t) / 0.12;
          D.pixelRing(ctx, X0, Y, 22 + u * 18, 4, last.don ? '#ff3030' : '#30a0ff', k * (1 - u));
          for (let r = 4; r < 18; r += 3) D.pixelRing(ctx, X0, Y, r, 3, last.don ? '#ff3030' : '#30a0ff', k * (1 - u));
        }
        for (const n of notes) {
          const x = X0 + (n.t - t) * SPEED;
          if (x < X0 - 4 || x > X0 + W) continue;
          const col = n.don ? '#ff3030' : '#30a0ff';
          for (let r = 2; r < 14; r += 2) D.pixelRing(ctx, x, Y, r, 3, col, k);
          D.pixelRing(ctx, x, Y, 15, 2, '#ffffff', k);
          D.pixelRing(ctx, x, Y, 16, 2, '#000000', k);
        }
        for (const n of notes) if (t >= n.t && t < n.t + 0.35) D.text(ctx, n.don ? '良' : '咔', X0, Y - 62 - (t - n.t) * 40, { scale: 2, align: 'center', color: n.don ? '#ffe24a' : '#9ad8ff', outline: '#000', alpha: k * (1 - (t - n.t) / 0.35) });
      },
    });
  };
})();
