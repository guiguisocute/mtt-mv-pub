// Bars 40-47: the climax opens in FIRST PERSON. "TIME'S UP!" - the camera dives into the
// soul and the show becomes a voxel Beat Saber: a neon runway, Mettaton towering at its
// end beside the ratings billboard, arrow blocks rushing at the eye on the brass melody
// (4 lanes x 2 rows), each cut in its arrow's direction (the block splits, the blade
// streaks across the screen). His leg sweeps come as walls to jump / duck, bombs must be
// let past. At the end of 47 the camera is yanked back out into the 2D stage.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D, L = MV.LAYOUT, V3 = MV.V3;
  const at = H.at, S16 = H.S16, BEAT = H.BEAT;
  const R = Math.round;

  H.rateAnchor(at(44), 7488);
  H.rateAnchor(at(48), 7931);

  // ---------------------------------------------------------------- the dive (end of bar 39)
  const p0 = at(40), p1 = at(48);
  const tDive = at(39, 3, 2);
  H.cam(tDive, p0, { x: 480, y: 384, zoom: 7, pitch: 0.2, roll: 0.2 }, 'in5');
  TL.glitch(p0 - 0.05, p0 + 0.03, 0.6);
  H.bigHit(p0, { flash: 1, flashCol: [1, 1, 0.6], inv: 0, bw: 0 });
  H.sfx(p0, 'Saber', 0.7);
  H.sfx(p0, 'Cheer', 0.5);
  TL.tv.set(p0, { cam: 'CAM POV' });
  TL.post.set(p0, { bloom: 1.2, ca: 0.8, vig: 0.45, letter: 0 });

  // ---------------------------------------------------------------- 3D space: runway along -y, z up, eye at 14
  // A note is hit when it crosses y = HIT (40 units ahead): lanes x = +-8 / +-24, rows z = 6 / 22.
  const HIT = -40, SPAWN = -560, TRAVEL = BEAT * 1.5, EYE = 14;
  const LX = [-24, -8, 8, 24], RZ = [7, 21];
  const cam = new MV.Track({ x: 0, y: 0, z: EYE, yaw: 0, pitch: -0.04, roll: 0, fov: 1.25 });
  cam.set(p0 - 0.001, { x: 0, y: 60, z: 60, pitch: -1.2, fov: 1.5 });
  cam.to(p0, p0 + 0.35, { y: 0, z: EYE, pitch: -0.04, fov: 1.25 }, 'outExpo');
  const notes = [], bombs = [], walls = [], bolts = [], shards = [];
  const noteY = (n, t) => HIT - (n.t - t) * ((HIT - SPAWN) / TRAVEL);
  // chart: [bar, beat, 16th, lane, row, dir, big]
  const CH = [];
  const phrase = (p, mir, extra) => {
    const Lm = (l) => (mir ? 3 - l : l);
    const dm = (d) => (mir && (d === 'left' || d === 'right') ? (d === 'left' ? 'right' : 'left') : d);
    const P = [
      [0, 0, 0, 1, 0, 'down', 1], [0, 0, 0, 2, 0, 'down', 1], [0, 1, 0, 2, 1, 'up', 1], [0, 2, 0, 0, 0, 'left', 0], [0, 3, 0, 3, 0, 'right', 0], [0, 3, 2, 2, 1, 'up', 0],
      [1, 0, 0, 1, 1, 'up', 0], [1, 0, 3, 2, 1, 'up', 0], [1, 1, 0, 3, 0, 'right', 0], [1, 2, 0, 0, 0, 'down', 0], [1, 2, 2, 1, 1, 'up', 1], [1, 3, 0, 2, 1, 'up', 0], [1, 3, 2, 3, 0, 'down', 0],
      [2, 0, 0, 2, 1, 'up', 1], [2, 1, 0, 1, 1, 'left', 0], [2, 2, 0, 0, 0, 'down', 0], [2, 3, 0, 3, 0, 'right', 0], [2, 3, 2, 2, 0, 'down', 0],
      // the walk up: a staircase from bottom left to top right on the bass E F# G A
      [3, 0, 0, 0, 0, 'up', 0], [3, 1, 0, 1, 0, 'up', 0], [3, 1, 2, 1, 1, 'up', 0], [3, 2, 0, 2, 1, 'up', 0], [3, 2, 2, 3, 0, 'up', 0], [3, 3, 0, 3, 1, 'up', 1], [3, 3, 0, 0, 1, 'up', 1],
    ];
    for (const [db, k, s, l, r, d, big] of P) CH.push([p + db, k, s, Lm(l), r, dm(d), big]);
    if (extra) for (let k = 0; k < 4; k++) CH.push([p + 2, k, 2, Lm((k + 1) % 4), k % 2, k % 2 ? 'up' : 'down', 0]);
  };
  phrase(40, false, false);
  phrase(44, true, true);
  const ANG = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
  CH.forEach(([b, k, s, l, r, d, big]) => {
    const t = at(b, k, s), col = l < 2 ? MV.COL.pink : '#ffe24a';
    const n = { t, x: LX[l], z: RZ[r], dir: d, big, col, lane: l };
    notes.push(n);
    // the cut: halves fly apart across the stroke, sparks, the blade on screen, score
    const ca = ANG[d] + Math.PI / 2;
    for (const s2 of [-1, 1]) shards.push({ t0: t, n, s: s2, dx: Math.cos(ca) * s2, dz: -Math.sin(ca) * s2 });
    H.sfx(t, 'HitSaber', big ? 0.5 : 0.4);
    if (big) H.sfx(t, 'Bell', 0.12);
    H.score(t, big ? 1.5 : 1);
    H.combo(t);
    H.punch(t, big ? 0.7 : 0.35);
    H.blade(t, n, cam, d, col, big);
  });
  // obstacles: [bar, beat, 16th, kind]
  const OB = [[41, 3, 3, 'bombL'], [42, 1, 2, 'low'], [43, 0, 2, 'bombR'], [44, 2, 2, 'bombR'], [45, 1, 2, 'sideL'], [45, 2, 2, 'sideR'], [46, 1, 2, 'high'], [47, 0, 2, 'bombL']];
  for (const [b, k, s, kind] of OB) {
    const t = at(b, k, s);
    if (kind.startsWith('bomb')) {
      const side = kind === 'bombL' ? -1 : 1; // the bomb comes down one side, the eye leans to the other
      bombs.push({ t, x: side * 10, z: EYE });
      cam.to(t - 0.14, t - 0.03, { x: -side * 14, roll: side * 0.14 }, 'outExpo');
      cam.to(t + 0.06, t + 0.22, { x: 0, roll: 0 }, 'inOut');
      H.sfx(t - 0.2, 'PreBomb', 0.3);
      H.sfx(t, 'Arrow', 0.25);
    } else if (kind === 'low') {
      walls.push({ t, kind, x0: -40, x1: 40, z0: 0, z1: 9 });
      cam.hop(t - 0.14, t + 0.12, { z: EYE }, -14, 'z', 'lin');
      cam.to(t - 0.14, t - 0.02, { pitch: -0.35 }, 'out'); cam.to(t - 0.02, t + 0.14, { pitch: -0.04 }, 'inOut');
      H.sfx(t - 0.08, 'Swipe', 0.35);
    } else if (kind === 'high') {
      walls.push({ t, kind, x0: -40, x1: 40, z0: 17, z1: 30 });
      cam.to(t - 0.14, t - 0.03, { z: 6, pitch: 0.3 }, 'outExpo'); cam.to(t + 0.05, t + 0.16, { z: EYE, pitch: -0.04 }, 'outExpo');
      H.sfx(t - 0.08, 'Swipe', 0.35);
    } else {
      const side = kind === 'sideL' ? -1 : 1; // his arm, reaching across one half
      walls.push({ t, kind, x0: side < 0 ? -40 : 3, x1: side < 0 ? -3 : 40, z0: 0, z1: 34 });
      cam.to(t - 0.14, t - 0.03, { x: -side * 20, roll: side * 0.22 }, 'outExpo'); cam.to(t + 0.05, t + 0.18, { x: 0, roll: 0 }, 'inOut');
      H.sfx(t - 0.08, 'Swipe', 0.35);
    }
  }
  // bar 47, beat 4: lightning cracks down the tunnel on the sixteenths - his core is opening
  for (let i = 0; i < 4; i++) {
    const t = at(47, 3, i);
    const a = (i * 2.39) % U.TAU, rr = 18 + (i % 2) * 6;
    bolts.push({ t, x: Math.cos(a) * rr, z: EYE + Math.sin(a) * rr * 0.6 });
    H.sfx(t - 0.05, 'Shock', 0.2);
  }
  // the whole run: a push on every phrase; then yanked back out of the soul
  for (let b = 40; b < 48; b++) {
    if (b % 4 === 0) { cam.to(at(b), at(b) + 0.2, { fov: 1.45 }, 'outExpo'); cam.to(at(b) + 0.2, at(b, 1), { fov: 1.25 }, 'inOut'); }
  }
  cam.to(at(47, 3, 2), p1, { fov: 1.6, y: 120, z: EYE + 40, pitch: -0.6 }, 'in2');

  // ---------------------------------------------------------------- scene
  let mttCanvas = null;
  // the ratings panel on the screen while the eye is in the soul (same graph as the stage HUD;
  // portrait: the screen HUD carries the board all the time)
  if (!MV.PORTRAIT) TL.add({
    t0: p0, t1: p1, z: 83, screen: true,
    draw(ctx, emi, t) {
      const k = U.clamp((t - p0) / 0.3) * U.clamp((p1 - t) / 0.2), n = 42, hist = [];
      for (let i = 0; i < n; i++) {
        const tt = t - (n - 1 - i) * 0.09, v = TL.rating.at(tt).v;
        const climb = U.clamp((v - TL.rating.at(tt - 0.3).v) / 150);
        hist.push(U.clamp((v - 2500) / 10500 + U.noise(tt * 7 + i) * (0.02 + climb * 0.06)));
      }
      const v = TL.rating.at(t).v, hot = U.clamp((v - TL.rating.at(t - 0.25).v) / 120);
      D.rect(ctx, 26, 18, 190, 150, '#000000', 0.55 * k);
      D.rating(ctx, null, 44, 30, v, hist, { alpha: k, hot, shake: hot * 2, seed: t * 40 });
    },
  });
  const WHITE = [1, 1, 1], PINK = [1, 0.31, 0.85], CYAN = [0.24, 0.88, 1], GOLD = [1, 0.85, 0.3];
  const hex3 = (h) => [1, 3, 5].map((i) => parseInt(MV.hex6(h).slice(i, i + 2), 16) / 255);
  TL.pov = {
    t0: p0, t1: p1,
    scene(t) {
      const c = cam.at(t);
      if (t > p0 + 0.3) { const fx = TL.fxAt(t); c.x += fx.sx * 0.15; c.z += fx.sy * 0.06; c.roll += fx.rot + fx.sx * 0.002; c.fov *= 1 - Math.min(0.3, fx.zoom * 0.6); }
      const beat = (t - T.off) / BEAT, pulse = T.pulse(t, BEAT, 0.18);
      // the star at the end of the runway (a live billboard of his pose) and the ratings board
      const pose = TL.pose.at(t), face = TL.face.at(t), body = TL.body.at(t);
      mttCanvas = D.mttCompose({ pose, face, body }).cv;
      // (the ratings are on the screen HUD, crisp - a far-off texture would shimmer)
      const bills = [
        { src: mttCanvas, dynamic: true, p: [0, -470, 150], w: 440, h: 362, nofog: true, emi: 0.35 },
      ];
      // arrows on the notes, bombs
      for (const n of notes) {
        if (t < n.t - TRAVEL || t >= n.t) continue;
        const y = noteY(n, t);
        bills.push({ src: H.noteImg(n.col), p: [n.x, y + (n.big ? 6 : 5) + 0.3, n.z], w: n.big ? 11.5 : 9.5, h: n.big ? 11.5 : 9.5, rot: -ANG[n.dir], emi: 0.8, nofog: true });
      }
      for (const b of bombs) {
        if (t < b.t - TRAVEL || t > b.t + 0.2) continue;
        const y = HIT - (b.t - t) * ((HIT - SPAWN) / TRAVEL) + 40;
        bills.push({ src: MV.part('bomb'), p: [b.x, y, b.z], w: 12, h: 15, rot: Math.sin(t * 10) * 0.3, emi: Math.floor(t * 12) % 2 ? 0.6 : 0 });
      }
      for (const b of bolts) {
        if (t < b.t - 0.5 || t > b.t + 0.15) continue;
        const y = (t - b.t) * 900 - 10;
        bills.push({ src: MV.part('bolt'), p: [b.x, y, b.z], w: 10, h: 10, rot: t * 20, emi: 0.9, nofog: true });
      }
      return {
        cam: c, fog: 0.0016, bills,
        build(v) {
          // runway: dark tiles scrolling toward the eye, neon edges, beat pulses
          const scroll = ((t - T.off) * 420) % 40;
          for (let y = -700; y < 60; y += 40) {
            const yy = y + scroll, lit = Math.floor((yy - scroll) / 40 + beat * 2) % 4 === 0;
            v.box(-44, yy, -2, 88, 38, 2, lit ? [0.25, 0.06, 0.3] : [0.06, 0.02, 0.1], lit ? 0.3 : 0);
            v.box(-46, yy, -1, 2, 38, 2, PINK, 0.9); v.box(44, yy, -1, 2, 38, 2, CYAN, 0.9);
          }
          // lane guides
          for (const x of [-16, 0, 16]) v.box(x - 0.3, -700, -0.5, 0.6, 760, 0.4, [0.5, 0.3, 0.6], 0.4);
          // pillars of bulbs along both sides, chasing on the beat
          for (let i = 0; i < 12; i++) {
            const y = -40 - i * 60 + (scroll * 1.5 % 60);
            for (const s of [-1, 1]) {
              v.box(s * 70 - 3, y, 0, 6, 6, 60, [0.1, 0.08, 0.12], 0);
              for (let k = 0; k < 5; k++) { const on = (i + k + Math.floor(beat * 2)) % 3 === 0; v.box(s * 70 - 4, y - 1, 6 + k * 11, 8, 8, 4, on ? GOLD : [0.3, 0.25, 0.1], on ? 1 : 0.2); }
            }
          }
          // laser fans from behind the star, swinging on the beat
          for (let i = 0; i < 6; i++) {
            const a = Math.sin(beat * 0.5 + i) * 0.5 + (i - 2.5) * 0.25, org = [0, -620, 40];
            const d = V3.norm([Math.sin(a), 1, Math.cos(a) * 0.3 + 0.1]), Lz = 700;
            const u = d, vv = V3.norm(V3.cross(u, [0, 0, 1])), nn = V3.cross(u, vv);
            v.obox(V3.add(org, V3.mul(u, Lz / 2)), u, vv, nn, Lz / 2, 0.4, 0.4, i % 2 ? PINK : CYAN, 0.6 + pulse * 0.4);
          }
          // the notes: a coloured cube each, cut in two on the hit
          for (const n of notes) {
            if (t < n.t - TRAVEL || t >= n.t) continue;
            const y = noteY(n, t), s = n.big ? 5.5 : 4.5, col = hex3(n.col);
            v.box(n.x - s, y - s, n.z - s, s * 2, s * 2, s * 2, col, 0.35);
          }
          for (const sh of shards) {
            const u = t - sh.t0;
            if (u < 0 || u > 0.5) continue;
            const n = sh.n, s = n.big ? 5.5 : 4.5, d = 4 + 70 * u;
            const cx = n.x + sh.dx * d, cz = n.z + sh.dz * d - 60 * u * u, cy = HIT + 30 * u;
            const spin = u * 8 * sh.s, uu = [Math.cos(spin), 0, Math.sin(spin)], vv = [0, 1, 0], nn = V3.cross(uu, vv);
            v.obox([cx, cy, cz], uu, vv, nn, s * 0.5, s, s, hex3(n.col), 0.6 * (1 - u * 2));
            for (let k = 0; k < 3; k++) { const q = U.hash(k + sh.t0 * 9) - 0.5; v.box(n.x + q * 40 * u * 3, HIT + 20 * u, n.z + (U.hash(k + 3 + sh.t0) - 0.3) * 50 * u, 1.2, 1.2, 1.2, [1, 1, 0.6], 1); }
          }
          // walls: his legs / arm, glowing pink edges
          for (const w of walls) {
            if (t < w.t - TRAVEL || t > w.t + 0.3) continue;
            const y = HIT - (w.t - t) * ((HIT - SPAWN) / TRAVEL) + 40;
            v.box(w.x0, y - 3, w.z0, w.x1 - w.x0, 6, w.z1 - w.z0, [0.05, 0.03, 0.06], 0.1);
            v.box(w.x0, y - 3.5, w.z1 - 1, w.x1 - w.x0, 7, 1.2, PINK, 1);
            v.box(w.x0, y - 3.5, w.z0, w.x1 - w.x0, 7, 1.2, PINK, 1);
          }
        },
      };
    },
  };
  // first person safety: no bomb, wall or bolt may reach the eye
  MV.checkPov = (step = 1 / 240) => {
    const out = [];
    for (let t = p0 + 0.4; t < p1; t += step) {
      const c = cam.at(t), e = [c.x, c.y, c.z];
      for (const b of bombs) {
        const y = HIT - (b.t - t) * ((HIT - SPAWN) / TRAVEL) + 40;
        if (Math.abs(y - e[1]) < 6 && Math.hypot(b.x - e[0], b.z - e[2]) < 9) out.push({ t: +t.toFixed(3), what: 'bomb' });
      }
      for (const w of walls) {
        const y = HIT - (w.t - t) * ((HIT - SPAWN) / TRAVEL) + 40;
        if (Math.abs(y - e[1]) < 4 && e[0] > w.x0 - 2 && e[0] < w.x1 + 2 && e[2] > w.z0 - 2 && e[2] < w.z1 + 2) out.push({ t: +t.toFixed(3), what: 'wall ' + w.kind });
      }
      for (const b of bolts) {
        const y = (t - b.t) * 900 - 10;
        if (Math.abs(y - e[1]) < 5 && Math.hypot(b.x - e[0], b.z - e[2]) < 5) out.push({ t: +t.toFixed(3), what: 'bolt' });
      }
    }
    return out;
  };
});

// ---------------------------------------------------------------- saber strokes on screen
(function () {
  const MV = window.MV, TL = MV.TL, T = MV.T, H = MV.H, U = MV.U, D = MV.D;
  const R = Math.round;
  const ANG = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
  // the stroke through a note as the first-person camera sees it (projected at the hit plane):
  // a swing, not a mark - the blade's head sweeps along a shallow arc in the cut direction and
  // crosses the note on the beat, a comet trail thickening toward the head, a chevron pointing
  // where it goes and sparks flung on ahead; then the slash mark shrinks away into its end.
  const SWING = 0.12, FADE = 0.22;
  H.blade = (t, n, cam, dir, col, big) =>
    TL.add({
      t0: t - SWING / 2, t1: t + SWING / 2 + FADE, z: 80, screen: true,
      draw(ctx, emi, tt) {
        // (portrait: the first-person view is widened by TL.pcam k on a screen twice as tall)
        const c = cam.at(t), k = 9.3 * (1.25 / c.fov) * (MV.PORTRAIT ? (MV.SH / 540) * TL.pcam.at(t).k : 1);
        const sx = MV.SW / 2 + (n.x - c.x) * k, sy = MV.SH / 2 - (n.z - c.z) * k;
        const a = ANG[dir] + c.roll, L2 = big ? 200 : 165, bow = (big ? 30 : 22) * (n.lane % 2 ? 1 : -1);
        // local frame: the swing runs from v = +L2 to v = -L2 (rotated into the cut direction)
        const us = U.clamp((tt - (t - SWING / 2)) / SWING), head = L2 - 2 * L2 * U.eInOut(us);
        const uf = U.clamp((tt - (t + SWING / 2)) / FADE), tail = U.lerp(L2, -L2 * 0.9, U.eIn(uf));
        const pt = (v) => [bow * (1 - (v / L2) ** 2), v];
        ctx.save(); ctx.translate(R(sx), R(sy)); ctx.rotate(a);
        // the trail: a crescent from the tail to the head - a coloured glow, the blade colour, a
        // white-hot core - thickening and brightening toward the head
        const alpha = 1 - uf, W0 = big ? 30 : 22, steps = Math.max(2, Math.ceil(Math.abs(head - tail) / 3));
        for (const [wk, colr, ak] of [[1.9, col, 0.3], [1, col, 1], [0.38, '#ffffff', 1]])
          for (let i = 0; i <= steps; i++) {
            const q = i / steps, v = U.lerp(tail, head, q), [x] = pt(v), w = W0 * wk * (0.2 + 0.8 * q * q);
            ctx.globalAlpha = alpha * ak * (0.1 + 0.9 * q);
            ctx.fillStyle = colr; ctx.fillRect(R(x - w / 2), R(v - 2), Math.max(1, R(w)), 4);
          }
        if (uf < 0.7) {
          // a solid arrowhead leading the blade, pointing along the swing (local -v)
          const [hx, hy] = pt(head), s2 = big ? 26 : 20, ka = 1 - uf / 0.7;
          for (const [colr, grow] of [['#000000', 3], ['#ffffff', 0]]) {
            ctx.globalAlpha = ka; ctx.fillStyle = colr;
            for (let i = 0; i < s2 + grow; i++) ctx.fillRect(R(hx - i * 0.9), R(hy - s2 - grow + i), Math.max(1, R(i * 1.8)), 1);
          }
          // sparks flung on ahead of the blade, in a cone
          if (tt >= t) for (let i = 0; i < 12; i++) {
            const h = U.hash(i * 3.7 + t * 11), h2 = U.hash(i * 5.3 + t * 7), d = (tt - t) * (300 + h * 360), sp = (h2 - 0.5) * 1.1;
            ctx.fillStyle = i % 3 ? col : '#ffffff';
            ctx.fillRect(R(hx + Math.sin(sp) * d), R(hy - s2 - Math.cos(sp) * d), 4, 4);
          }
        }
        ctx.restore(); ctx.globalAlpha = 1;
        if (tt >= t && tt - t < 0.15) D.text(ctx, big ? 'PERFECT!' : 'PERFECT', sx, sy - 70 - (tt - t) * 160, { scale: 2, align: 'center', color: col, outline: '#000000', alpha: 1 - (tt - t) / 0.15 });
      },
    });
  // a note's arrow face texture, per colour (shared with the 2D highway)
  const cache = {};
  H.noteImg = (col) => {
    if (cache[col]) return cache[col];
    const src = MV.part('arrowBlock'), [c, x] = D.tmp(src.width, src.height);
    x.drawImage(src, 0, 0);
    const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(MV.hex6(col).slice(i, i + 2), 16));
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && d[i] > 200) { d[i] = r; d[i + 1] = g; d[i + 2] = b; }
    x.putImageData(id, 0, 0);
    return (cache[col] = c);
  };
})();
