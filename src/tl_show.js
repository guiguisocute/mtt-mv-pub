// Bars 12-23: the opening number (theme A, full band). The boast was made in bars 9-10;
// now the original EX turns play at MV strength: his telescoping fists punch in through the
// walls on chains of white blocks, a yellow block sliding along each - shoot it as it slides
// over and the arm snaps back (12-17; the walls on the snare only open where a block is shot,
// the zipper of 16-17 on the eighths),
// umbrella bots lobbing hearts that the soul bursts in the air (18-19), falling bombs
// shot into plus blasts - shoot, sidestep out of the column, shoot (20-23).
// Pacifist: every shot is stopped by one of his props, never by him.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const MB = L.menuBox, B = L.box;
  const yT = B.y + 32, yB = B.y + 100; // soul rows (318 / 385)
  const CX = B.x + B.w / 2;

  H.rateAnchor(at(24), 5406);

  // ---------------------------------------------------------------- bars 12-17: fists with yellow blocks
  // Every arm reaches in a beat before its shot and sinks at V px/s; the block is shot at
  // y = Y_SHOT and the arm is back through its wall long before it could reach the soul's row.
  // A wall is two fists meeting knuckle to knuckle: only the shot arm opens, the soul slips
  // into that side and the other arm sweeps past it.
  const V = 100, Y_SHOT = 340;
  const shots = []; // [tShot, x]
  const steps = []; // sidesteps after a wall: [t, x]
  const leg = (tShot, side, bx, shot = true, tA = tShot - BEAT, tip, amp) => {
    H.fist({ tA, side, bx, tip, amp, y0: Y_SHOT - (tShot - tA) * V, vy: V, tShot: shot ? tShot : null, pop: '+' + (31 + (shots.length * 29) % 70) });
    if (shot) shots.push([tShot, bx]);
  };
  const one = (b, k, s, side, bx) => leg(at(b, k, s), side, bx);
  // (a wall: the two fists meet in the middle, each yellow block slides only on its own chain,
  // a fist's width back from the knuckles)
  const wall = (b, k, bxL, bxR, shootL, step) => {
    const t = at(b, k), mid = (bxL + bxR) / 2;
    leg(t, -1, bxL - 16, shootL, t - BEAT, mid, 5); leg(t, 1, bxR + 16, !shootL, t - BEAT, mid, 5);
    steps.push([t, step]);
  };
  one(12, 1, 0, -1, 462); one(12, 2, 0, 1, 500); one(12, 3, 0, -1, 446);
  one(13, 0, 0, 1, 514); one(13, 1, 0, -1, 470); one(13, 2, 0, 1, 496); one(13, 3, 0, -1, 452);
  one(14, 0, 0, -1, 480); wall(14, 1, 470, 490, true, 458); one(14, 2, 0, -1, 450); wall(14, 3, 486, 506, false, 518);
  one(15, 0, 0, 1, 520); wall(15, 1, 474, 494, true, 462); one(15, 2, 0, -1, 452); wall(15, 3, 482, 502, false, 514);
  one(16, 0, 0, 1, 518);
  // the zipper: left and right arms overlapping on every eighth, fists crossing the middle
  for (let e = 2; e < 14; e++) { const b = 16 + (e >> 3), s = (e % 8) * 2; one(b, 0, s, e % 2 ? 1 : -1, e % 2 ? 474 : 486); }
  // and a last wall on beat 4 with both blocks shot
  leg(at(17, 3), -1, 454, true, at(17, 2), 480, 5); leg(at(17, 3, 2), 1, 506, true, at(17, 2), 480, 5);
  // the soul: under each block just before its shot leaves, out of a wall's closed side after
  const flight = (yB - 10 - (Y_SHOT + 6)) / H.SHOT;
  shots.sort((a, b) => a[0] - b[0]);
  shots.forEach(([t, x], i) => {
    const tf = t - flight, prev = i ? shots[i - 1][0] + (steps.some((s) => s[0] === shots[i - 1][0]) ? 0.1 : 0.01) : tf - 0.3;
    const dur = Math.min(S16 * 1.3, (tf - prev) * 0.8);
    H.soulTo(tf - dur, tf - 0.008, x, yB, 'outExpo');
  });
  for (const [t, x] of steps) H.soulTo(t + 0.02, t + 0.1, x, yB, 'outExpo');
  // he conducts from the stage: a new pose every beat, a stomp on the snare
  const KP = ['kickL', 'pointUp', 'kickR', 'flex', 'hips', 'kickL', 'split', 'kickR'];
  for (let b = 12; b < 18; b++) for (let k = 0; k < 4; k++) {
    const i = (b - 12) * 4 + k;
    TL.pose.set(at(b, k), KP[i % 8]); TL.face.set(at(b, k), [3, 7, 5, 1][i % 4]);
    if (k % 2) H.punch(at(b, k), 0.55);
  }
  for (let b = 12; b < 16; b++) {
    const s = b % 2 ? 1 : -1;
    H.cam(at(b), at(b + 1), { x: 480 + s * 8, y: 262 + (b - 12) * 8, zoom: 1.16 + (b - 12) * 0.05, pitch: 0.08 + (b - 12) * 0.03, roll: s * 0.02, yaw: 0 }, 'inOut');
  }
  H.cam(at(16), at(16, 0, 3), { x: 480, y: 318, zoom: 1.6, pitch: 0.24, roll: 0, yaw: 0 }, 'outExpo');
  H.cam(at(16, 1), at(17, 3), { x: 480, y: 322, zoom: 1.75, pitch: 0.28, roll: 0.02 }, 'inOut');
  TL.tv.set(at(16), { cam: 'CAM 5' });
  H.hit(at(17, 3, 2), 0.8, { flash: 0.2, flashCol: [1, 1, 0.5] });
  H.sfx(at(17, 3, 2), 'Cheer', 0.35);
  H.bubble(at(14), at(15) - 0.05, ['看我的手臂！'], { x: 560, y: 70, tx: 540, ty: 110, step: S16 });
  H.soulTo(at(17, 3, 2) + 0.05, at(18) - S16 * 2, CX, yB, 'inOut');

  // ---------------------------------------------------------------- bars 18-19: umbrella bots, hearts burst in the air
  // (the bots are cast members: they float off once they have thrown; only the hearts are shot)
  H.cam(at(17, 3), at(18), { x: 480, y: 238, zoom: 1.22, pitch: -0.12, roll: 0 }, 'inOut');
  TL.tv.set(at(18), { cam: 'CAM 3' });
  H.bubble(at(18), at(19) - 0.05, ['戏剧性！'], { x: 560, y: 70, tx: 540, ty: 110, step: S16 / 2 });
  H.bubble(at(19), at(20) - 0.05, ['演员们！'], { x: 560, y: 70, tx: 540, ty: 110, step: S16 / 2 });
  TL.pose.set(at(18), 'shrug'); TL.pose.set(at(18, 2), 'wave'); TL.pose.set(at(19), 'tpose'); TL.pose.set(at(19, 2), 'pointUpL');
  TL.face.set(at(18), 7); TL.face.set(at(19), 3);
  const botX = [[420, 452, 484, 516], [516, 484, 452, 420]];
  for (let w = 0; w < 2; w++) {
    const bar = 18 + w, tIn = at(bar - 1, 3);
    botX[w].forEach((bx, i) => {
      const tThrow = at(bar, i), tHit = tThrow + 0.2;
      const hx = bx + 18;
      const hearts = H.umbrella({ t0: tIn + i * S16 * 0.5, x: bx, y0: -60, y1: 238 + (i % 2) * 10, throws: [tThrow], t1: at(bar, 3, 2) + i * S16 * 0.5, hearts: [{ vx: 0, vy: 240, tPop: tHit }] });
      const hy = H.posOf(hearts[0], tHit)[1];
      H.soulTo(tThrow - S16 * 1.6, tThrow - S16 * 0.4, hx, yB, 'outExpo');
      H.shootAt(tHit, hy, { x: hx, pop: '+' + (41 + i * 13 + w * 7) });
      H.punch(tHit, 0.4);
    });
  }

  // ---------------------------------------------------------------- bars 20-23: bombs -> plus blasts, shoot and sidestep
  // Four lanes; the soul fires straight up at the bomb over its lane and is out of that
  // column before the vertical beam lights. Beams go down through the box (a short stub
  // up), the horizontal arm runs along the bomb row above the box.
  // Quarter notes (20-21) from the bottom row with long beams; eighths (22-23) from the top
  // row - a short shot, so the soul leaves its column only after the previous beam is out
  // (beam 0.15 s < an eighth) and is clear of its own before that one lights.
  const BL = [432, 468, 504, 540], seq = [0, 2, 1, 3, 0, 2, 1, 3, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3];
  const bombRow = B.y - 30;
  const hits = [];
  for (const b of [20, 21]) for (let k = 0; k < 4; k++) hits.push({ t: at(b, k), y: yB, dur: 0.22 });
  for (let s = 0; s < 8; s++) hits.push({ t: at(22, 0, s * 2), y: yT, dur: 0.15 });
  for (let s = 0; s < 6; s++) hits.push({ t: at(23, 0, s * 2), y: yT, dur: 0.15 });
  const span = { x0: B.x - 260, x1: B.x + B.w + 260, y0: bombRow - 30, y1: B.y + B.h + 6 };
  H.soulTo(at(19, 3, 2), at(20) - 0.2, BL[seq[0]], yB, 'outExpo');
  hits.forEach(({ t: tHit, y, dur }, i) => {
    const x = BL[seq[i]], nx = BL[seq[i + 1] ?? seq[i]];
    const flight = (y - 10 - bombRow) / H.SHOT, tf = tHit - flight;
    H.prop({ tHit, x, ty: bombRow, kind: 'bomb', v: 420, span, beamDur: dur, beamW: 16, pop: '+' + (60 + (i * 37) % 90) });
    // sidestep into the next bomb's lane right after the shot leaves
    if (i + 1 < hits.length) {
      const ny = hits[i + 1].y;
      if (ny === y) H.soulTo(tf + 0.012, tf + 0.1, nx, y, 'outExpo');
      else { H.soulTo(tf + 0.012, tf + 0.1, nx, y, 'outExpo'); H.soulTo(tHit + dur + 0.02, hits[i + 1].t - 0.12, nx, ny, 'inOut'); }
    } else H.soulTo(tf + 0.012, tf + 0.1, CX, y, 'outExpo'); // the last one: out of its column too
    TL.boxHits.push({ t: tHit, side: 'top', u: (x - B.x) / B.w, amt: -6 });
    if (i % 2 === 0) H.cam(tHit, tHit + 0.18, { roll: (i % 4 ? 0.03 : -0.03) }, 'outExpo');
  });
  H.cam(at(20), at(22), { x: 480, y: 262, zoom: 1.28, pitch: 0.12, roll: 0 }, 'inOut');
  H.cam(at(22), at(23, 2), { x: 480, y: 280, zoom: 1.5, pitch: 0.24, yaw: 0.12 }, 'inOut');
  TL.tv.set(at(20), { cam: 'CAM 1' }); TL.tv.set(at(22), { cam: 'CAM 4' });
  TL.post.to(at(22), at(23, 2), { ca: 1.2, bloom: 1.15 }, 'in');
  for (let k = 0; k < 8; k++) { TL.pose.set(at(20 + (k >> 2), k % 4), ['hips', 'dance1', 'flex', 'dance2'][k % 4]); }
  TL.pose.set(at(22), 'split'); TL.pose.set(at(22, 2), 'cross'); TL.pose.set(at(23), 'kickR'); TL.pose.set(at(23, 1), 'kickL');
  TL.face.set(at(20), 1); TL.face.set(at(22), 5); TL.face.set(at(23), 3);
  // bar 23 beat 3: "I'M THE STAR!" - a whip out to the full stage
  const t233 = at(23, 2, 2);
  TL.pose.set(t233, 'pointUp'); TL.face.set(t233, 7);
  H.bubble(t233, at(24) - 0.02, ['我是主角！'], { x: 560, y: 64, tx: 540, ty: 110, step: S16 / 2 });
  H.cam(t233, at(24), { x: 480, y: 228, zoom: 1.0, pitch: 0, roll: 0, yaw: 0 }, 'outExpo');
  H.hit(t233, 1, { flash: 0.3 });
  H.sfx(t233, 'Cheer', 0.4);
  H.soulTo(at(23, 3), at(24), CX, yB, 'inOut');
  TL.post.to(at(23, 3), at(24), { ca: 0.6, bloom: 1 }, 'inOut');
});
