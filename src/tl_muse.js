// Bars 48-54: a side-scrolling runner (a Muse Dash homage). Yanked out of first person,
// the stage turns sideways: two lanes (air / ground), the soul - turned to face right - at
// the judgement point on the left, Mettaton as the boss on the right hurling his props down
// the lanes on the brass melody: his little box-robot dancers and white blocks along the
// ground, hearts and umbrella bots through the air. Each is struck on its note (a slash arc,
// the prop knocked off screen), doubles hit both lanes, holds ride a lane. His BOMBS are
// hazards: red-tagged, never struck - they roll down the lane the soul is not in, and his
// leg sweeps along one lane must be dodged into the other. 52: FEVER. 53-54: the core overheats.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const [ex, ey] = L.enemy;
  const t0 = at(48), t1 = at(55);
  const AIR = 300, GND = 392, MID = (AIR + GND) / 2, JX = 300; // lanes, judgement x
  const SPEED = 640; // px/s the lanes scroll

  H.rateAnchor(at(52), 8364);
  H.rateAnchor(at(55), 8640);

  // ---------------------------------------------------------------- set: sideways stage
  TL.box.set(t0, { draw: 0, fill: 0 });
  TL.hud.set(t0, { a: 0 });
  TL.btn.forEach((b) => b.set(t0, { a: 0 }));
  TL.enemy.set(t0, { x: 790, y: GND + 22, bob: 1 });
  TL.enemy.set(t1, { x: ex, y: ey });
  TL.soul.set(t0, { a: 1, x: JX, y: GND, rot: -Math.PI / 2, sq: 1 });
  TL.soul.set(t1 - 0.001, { rot: Math.PI });
  H.cut(t0, { x: 520, y: 312, zoom: 1.06, pitch: 0, roll: 0, yaw: 0 });
  H.bigHit(t0, { flash: 0.6, flashCol: [1, 0.9, 0.5] });
  H.sfx(t0, 'CineCut', 0.4);
  TL.tv.set(t0, { cam: 'CAM RUN' });
  TL.post.set(t0, { bloom: 1.1, ca: 0.7, bg: 0.6, vig: 0.4 });
  H.runway(t0, t1, AIR, GND, JX, SPEED);

  // ---------------------------------------------------------------- the chart
  // [bar, beat, 16th, lane ('A' | 'G' | 'D' double | 'HA'/'HG' hold of `len` beats), kind]
  const CH = [];
  const laneOf = (b, k, s) => (H.lead(b, k, s) >= 74 ? 'A' : 'G');
  for (let b = 48; b < 55; b++) {
    const slots = b === 54 ? [0, 4, 8] : b % 2 ? [0, 2, 4, 8, 10, 12] : [0, 4, 6, 8, 12, 14];
    for (const s of slots) {
      const k = Math.floor(s / 4), ss = s % 4;
      let lane = laneOf(b, k, ss);
      if (s === 0 && b % 2 === 0) lane = 'D';
      CH.push([b, k, ss, lane]);
    }
  }
  // holds replace the last hits of 49 and 51
  const hold = (b, lane) => { for (let i = CH.length - 1; i >= 0; i--) if (CH[i][0] === b && CH[i][1] === 3) CH.splice(i, 1); CH.push([b, 3, 0, lane, 1]); };
  hold(49, 'HG'); hold(51, 'HA');
  CH.sort((a, b) => at(a[0], a[1], a[2]) - at(b[0], b[1], b[2]));
  const KG = ['mini', 'box'], KA = ['heart', 'umb'];
  let soulY = GND;
  const events = [];
  CH.forEach(([b, k, s, lane, len], i) => {
    const t = at(b, k, s);
    const y = lane === 'D' ? MID : lane === 'A' || lane === 'HA' ? AIR : GND;
    if (y !== soulY) {
      // hop: quick rise/drop an eighth before the note (a Muse Dash jump)
      TL.soul.to(t - S16 * 1.2, t - S16 * 0.2, { y, sq: y < soulY ? 1.25 : 0.8 }, 'outExpo');
      TL.soul.to(t - S16 * 0.2, t, { sq: 1 }, 'out');
      soulY = y;
    }
    const kinds = lane.endsWith('A') ? KA : KG;
    if (lane === 'D') { events.push({ t, y: AIR, kind: 'heart', big: true }); events.push({ t, y: GND, kind: 'mini', big: true }); }
    else if (len) events.push({ t, y, kind: 'hold', len: len * BEAT });
    else events.push({ t, y, kind: kinds[i % 2] });
  });
  const FACES = [3, 7, 5, 1];
  events.forEach((e, i) => {
    H.laneProp(e, JX, SPEED, i);
    H.score(e.t, e.big ? 1.4 : 1); H.combo(e.t);
    // the boss winds up and throws each one (he stands on the right, where they come from)
    const tThrow = e.t - (790 - 120 - JX) / SPEED;
    TL.pose.set(tThrow, ['kickR', 'pointUpL', 'tpose', 'kickL', 'hangR', 'dance1'][i % 6]);
    TL.face.set(tThrow, FACES[i % 4]);
  });
  // his leg sweeping along the lane the soul is not in (dodge): in bars 50 and 53, at the first
  // sixteenth where the soul keeps its lane from 0.35 s before to 0.35 s after
  const sweeps = [];
  for (const b of [50, 53]) {
    for (let s = 2; s < 14; s++) {
      const tt = at(b, 0, s), sy = TL.soul.at(tt).y;
      let steady = true;
      for (let d = -0.35; d <= 0.35; d += 0.02) if (Math.abs(TL.soul.at(tt + d).y - sy) > 2) { steady = false; break; }
      if (!steady) continue;
      H.laneSweep(tt, sy < MID ? GND : AIR, JX, SPEED);
      sweeps.push(tt);
      break;
    }
  }
  // his bombs: two a bar, off the beat, down the lane the soul is not in (it stays put while
  // the bomb rolls past the judgement point - at 640 px/s that takes a few hundredths)
  const bombT = [];
  for (let b = 48; b < 55; b++) {
    let n = 0;
    for (const s of [2, 10, 6, 14, 3, 11, 7, 15]) {
      if (n >= 2) break;
      const tp = at(b, 0, s), sy = TL.soul.at(tp).y;
      let steady = true;
      for (let d = -0.08; d <= 0.08; d += 0.005) if (Math.abs(TL.soul.at(tp + d).y - sy) > 2) { steady = false; break; }
      if (!steady || sweeps.some((w) => Math.abs(w - tp) < 0.7) || bombT.some((w) => Math.abs(w - tp) < BEAT * 0.9)) continue;
      H.museBomb(tp, sy < MID ? GND : AIR, JX, SPEED);
      bombT.push(tp);
      n++;
    }
  }
  // FEVER (52): the gauge fills over 48-51 and bursts
  H.fever(t0, at(52), t1);
  H.sfx(at(52), 'SegaPower', 0.5);
  H.bigHit(at(52), { flash: 0.5, flashCol: [1, 0.4, 0.9] });
  TL.post.set(at(52), { bgHue: 1, bloom: 1.3 });
  TL.aura.set(at(52), { v: 1 });
  TL.aura.set(t1 - 0.01, { v: 0 });
  TL.post.set(t1 - 0.01, { bgHue: 0 });
  // 53-54: the core overheats ("I... AGAIN!") - he is pushing himself too hard
  TL.body.set(at(53), 5); TL.face.set(at(53, 2), 6);
  H.sfx(at(53), 'MttHit', 0.4);
  H.bubble(at(53, 2), at(54, 3), ['我……再来！'], { x: 610, y: 150, tx: 740, ty: 240, step: S16 });
  for (let k = 0; k < 8; k++) H.zap(at(53, 0, k * 2 + 1), 760 + (k % 2 ? 40 : -40), 300 + (k % 3) * 20);
  // the camera: runs with the track, a jolt on each double, leans into FEVER
  for (let b = 48; b < 55; b++) {
    H.cam(at(b), at(b + 1), { x: 520 + (b % 2 ? 10 : -10), y: 312, zoom: b >= 52 ? 1.14 : 1.06, roll: b >= 52 ? (b % 2 ? 0.03 : -0.03) : 0 }, 'inOut');
  }
  H.cam(at(54, 2), t1, { x: 700, y: 260, zoom: 1.6, roll: 0 }, 'in2');
});

// ---------------------------------------------------------------- runner pieces
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round, S16 = T.s16, BEAT = T.beat;
  // the sideways stage: floor and ceiling rails, scrolling tiles, lamp posts passing, lane guides
  H.runway = (t0, t1, AIR, GND, JX, SPEED) =>
    TL.add({
      t0, t1, z: -300,
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0) / 0.2) * U.clamp((t1 - t) / 0.2), sc = (t - t0) * SPEED;
        const hue = T.barOf(t) >= 52;
        // floor
        D.rect(ctx, -100, GND + 22, 1200, 3, '#ffffff', k);
        for (let x = -120 - (sc % 60); x < 1100; x += 60) {
          const lit = Math.floor((x + sc) / 60 + (t - T.off) / BEAT * 2) % 4 === 0;
          D.rect(ctx, x, GND + 28, 56, 26, lit ? (hue ? '#ff4fd8' : '#3a2a4a') : '#140a1c', k);
          if (emi && lit && hue) D.rect(emi, x, GND + 28, 56, 26, '#ff4fd8', 0.2 * k);
        }
        // ceiling rail with bulbs
        D.rect(ctx, -100, AIR - 46, 1200, 2, '#8a6aa0', k);
        for (let x = -120 - ((sc * 0.6) % 40); x < 1100; x += 40) {
          const on = Math.floor((x + sc * 0.6) / 40 + (t - T.off) / BEAT * 2) % 3 === 0;
          D.rect(ctx, x, AIR - 52, 6, 6, on ? '#fff3b0' : '#5a5040', k);
          if (emi && on) D.rect(emi, x - 4, AIR - 56, 14, 14, '#fff3b0', 0.4 * k);
        }
        // lamp posts sweeping past in the back (parallax)
        for (let x = -200 - ((sc * 0.35) % 260); x < 1100; x += 260) { D.rect(ctx, x, 120, 6, GND - 98, '#2a2036', k); D.rect(ctx, x - 8, 112, 22, 10, '#fff3b0', 0.6 * k); }
        // lanes: faint guides; the hit itself supplies the crescent-shaped slash
        for (const y of [AIR, GND]) {
          D.rect(ctx, JX, y, 700, 1, '#ffffff', 0.12 * k);
        }
      },
    });
  // a prop running down a lane to the judgement point; struck there (slash arc, knocked away)
  // e: {t, y, kind: 'bomb'|'mini'|'heart'|'umb'|'hold', len, big}
  H.laneProp = (e, JX, SPEED, i) => {
    const xAt = (t) => JX + (e.t - t) * SPEED;
    const tIn = e.t - (1000 - JX) / SPEED;
    const tEnd = e.kind === 'hold' ? e.t + e.len : e.t;
    const img = { box: 'boom0', mini: 'mini' + (i % 12), heart: 'heartW', umb: 'umb' + (i % 8) }[e.kind];
    TL.add({
      t0: tIn, t1: tEnd, z: 28,
      draw(ctx, emi, t) {
        if (e.kind === 'hold') {
          // a hold: a glowing bar whose head sits at the judgement point until its tail passes
          const x0 = Math.max(JX, xAt(t)), x1 = xAt(t) + e.len * SPEED;
          D.rect(ctx, x0, e.y - 7, x1 - x0, 14, '#ff4fd8', 0.85);
          D.rect(ctx, x0, e.y - 2, x1 - x0, 4, '#ffffff');
          if (emi) D.rect(emi, x0, e.y - 12, x1 - x0, 24, '#ff4fd8', 0.4);
          if (t >= e.t) for (let s = 0; s < 3; s++) D.rect(ctx, JX + U.hash(t * 60 + s) * 16, e.y - 10 + U.hash(t * 50 + s) * 20, 2, 2, '#ffffff');
          return;
        }
        const x = xAt(t), bob = e.kind === 'umb' || e.kind === 'heart' ? Math.sin(t * 8 + i) * 4 : 0;
        MV.spr(ctx, MV.part(img), x, e.y + bob, { scale: e.kind === 'heart' || e.kind === 'box' ? 2 : 1 });
        if (emi) D.rect(emi, x - 12, e.y - 12, 24, 24, '#ffffff', 0.18);
      },
    });
    if (e.kind === 'hold') {
      for (let s = 0; s < Math.round(e.len / (S16 * 2)); s++) { H.sfx(e.t + s * S16 * 2, s ? 'HitTick' : 'HitMuse', s ? 0.22 : 0.42); if (s) { H.score(e.t + s * S16 * 2, 0.3); H.combo(e.t + s * S16 * 2); } }
    } else {
      // the strike: a yellow crescent across the prop, the prop spun off up and away
      TL.add({
        t0: e.t, t1: e.t + 0.5, z: 45,
        draw(ctx, emi, t) {
          const u = (t - e.t) / 0.5;
          if (u < 0.35) {
            const k = 1 - u / 0.35;
            for (let a = -1.2; a <= 1.2; a += 0.08) {
              const r = 30 + (e.big ? 10 : 0);
              D.rect(ctx, JX + 10 + Math.cos(a) * r - 2, e.y + Math.sin(a) * r - 2, 5, 5, '#ffe24a', k);
              if (emi) D.rect(emi, JX + 10 + Math.cos(a) * r - 4, e.y + Math.sin(a) * r - 4, 9, 9, '#ffd000', 0.5 * k);
            }
          }
          const x = JX + 20 + u * 420, y = e.y - Math.sin(u * Math.PI) * 120 - u * 60;
          ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(R(x), R(y)); ctx.rotate(u * 9);
          const im = MV.part(img), sc = e.kind === 'heart' || e.kind === 'box' ? 2 : 1; ctx.scale(sc, sc); ctx.drawImage(im, -R(im.width / 2), -R(im.height / 2)); ctx.restore();
          if (u < 0.3) D.text(ctx, e.big ? 'GREAT!!' : 'PERFECT', JX, e.y - 44 - u * 40, { scale: 1, align: 'center', color: '#ff4fd8', outline: '#000', alpha: 1 - u / 0.3 });
        },
      });
      H.sfx(e.t, 'HitMuse', e.big ? 0.5 : 0.42);
      if (e.kind === 'box') H.sfx(e.t, 'Break1', 0.14);
      if (e.big) H.sfx(e.t, 'Bell', 0.12);
      H.punch(e.t, e.big ? 0.8 : 0.4);
      TL.burst(e.t, { x: JX + 16, y: e.y, n: 12, speed: [80, 240], ang: [-1.2, 1.2], life: [0.15, 0.35], colors: ['#ffe24a', '#ffffff', '#ff4fd8'], size: [2, 3], z: 44 });
    }
  };
  // a bomb rolling down a lane: a hazard, never struck. Red ring, a red "!" tag above,
  // and a red plate under the bomb.
  H.museBomb = (tp, y, JX, SPEED) => {
    const xAt = (t) => JX + (tp - t) * SPEED;
    const tIn = tp - (1000 - JX) / SPEED, tOut = tp + (JX + 80) / SPEED;
    H.sfx(tIn + 0.15, 'PreBomb', 0.18);
    H.sfx(tp - 0.4, 'Warning', 0.14);
    H.sfx(tp, 'Arrow', 0.16);
    return TL.add({
      t0: tIn, t1: tOut, z: 29, kind: 'white',
      draw(ctx, emi, t) {
        const x = xAt(t), blink = Math.floor(t * 12) % 2;
        for (let i = 0; i < 4; i++) D.rect(ctx, x - 16 + i * 9, y + 15, 5, 3, '#ff2030', 0.9);
        D.pixelRing(ctx, x, y, 17, 2, blink ? '#ff2030' : '#ff8a8a');
        MV.spr(ctx, MV.part(blink ? 'bombB' : 'bomb'), x, y, { rot: Math.sin(t * 9) * 0.2 });
        D.rect(ctx, x - 8, y - 44, 16, 18, '#ff2030'); D.frame(ctx, x - 8, y - 44, 16, 18, 1, '#ffffff');
        D.text(ctx, '!', x, y - 43, { scale: 1, align: 'center', color: '#ffffff' });
        D.rect(ctx, x - 1, y - 26, 2, 6, '#ff2030');
        if (emi) D.rect(emi, x - 18, y - 18, 36, 36, '#ff2030', 0.3 + 0.2 * blink);
      },
      hit(t, px, py) { const x = xAt(t); return Math.abs(px - x) < 14 && Math.abs(py - y) < 16; },
    });
  };
  // his leg sweeping flat along a lane from the right (white: never touch it)
  H.laneSweep = (tc, y, JX, SPEED) => {
    const img = MV.part('legBarR');
    // in fast, holds for a moment at full stretch, pulls back out fast
    const x0At = (t) => (t < tc ? JX - 60 + (tc - t) * SPEED * 1.5 : t < tc + 0.1 ? JX - 60 : JX - 60 + (t - tc - 0.1) * SPEED * 2.5);
    H.sfx(tc - 0.2, 'Swipe', 0.4);
    return TL.add({
      t0: tc - 0.7, t1: tc + 0.5, z: 26, kind: 'white',
      draw(ctx, emi, t) {
        const x = x0At(t);
        ctx.drawImage(img, R(x - 66), R(y - 13));
        D.rect(ctx, x + 150, y - 6, 900, 12, '#000000'); D.rect(ctx, x + 150, y - 7, 900, 1, '#ffffff'); D.rect(ctx, x + 150, y + 6, 900, 1, '#ffffff');
        if (emi) D.rect(emi, x - 66, y - 10, 1100, 20, '#ff4fd8', 0.15);
      },
      hit(t, px, py) { const x = x0At(t); return Math.abs(py - y) < 14 && px > x - 70; },
    });
  };
  // FEVER gauge along the top; bursts into FEVER!! at tFever
  H.fever = (t0, tFever, t1) =>
    TL.add({
      t0, t1, z: 85, screen: true,
      draw(ctx, emi, t) {
        const k = U.clamp((t - t0) / 0.3) * U.clamp((t1 - t) / 0.3), fill = U.clamp((t - t0) / (tFever - t0));
        const w = 360, x = 300, y = 18, on = t >= tFever;
        D.rect(ctx, x - 3, y - 3, w + 6, 20, '#000000', 0.7 * k);
        const col = on ? ['#ff4fd8', '#ffe24a', '#3ee0ff'][Math.floor(t * 12) % 3] : '#ff4fd8';
        D.rect(ctx, x, y, w * fill, 14, col, k);
        D.text(ctx, on ? 'FEVER!!' : 'FEVER', x + w + 12, y - 2, { scale: 1, color: on ? col : '#ffffff', alpha: k, outline: '#000' });
        if (on && t < tFever + 0.6) D.text(ctx, 'FEVER!!', MV.SW / 2, y + 102, { scale: 4, align: 'center', color: col, outline: '#000', alpha: 1 - (t - tFever) / 0.6 });
      },
    });
})();
