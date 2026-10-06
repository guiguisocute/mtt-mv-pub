// Frame composition: evaluates the timeline at time t and paints the world,
// emissive (bloom source) and screen-overlay canvases.
(function () {
  const MV = window.MV, U = MV.U, D = MV.D, TL = MV.TL, T = MV.T;
  const R = Math.round;

  // ---------------------------------------------------------------- layout
  // The original 640x480 battle layout, placed 1:1 in the 960x540 world (+160, +30).
  const L = (MV.LAYOUT = {
    enemy: [480, 277], // Mettaton EX: feet centre (boots rest on the box top, as in the game)
    boxEnemy: [480, 150], // box form: canvas centre
    box: { x: 410, y: 285, w: 140, h: 130 },
    menuBox: { x: 192, y: 280, w: 576, h: 140 },
    hudY: 432,
    name: 190, lv: 291, hpLabel: 404, hpBar: { x: 435, y: 430 }, num: 474,
    btnY: 462, btnH: 42, btnW: 110, btnX: [192, 345, 505, 660],
    rating: [197, 44],
  });

  // ---------------------------------------------------------------- UI pieces
  D.button = (ctx, emi, i, x, y, o = {}) => {
    const sel = (o.sel || 0) > 0.5;
    ctx.globalAlpha = o.a ?? 1;
    ctx.drawImage(MV.SPR['btn' + i + (sel ? 'h' : '')], R(x), R(y));
    ctx.globalAlpha = 1;
    if (sel && o.soul !== false) D.soul(ctx, emi, x + 16, y + 21, { col: 'yellow' });
    if (emi && sel) { emi.globalAlpha = 0.22 * (o.a ?? 1); emi.fillStyle = MV.COL.yellow; emi.fillRect(R(x) - 3, R(y) - 3, L.btnW + 6, L.btnH + 6); emi.globalAlpha = 1; }
  };

  // ---------------------------------------------------------------- state
  MV.state = (t) => {
    const fx = TL.fxAt(t);
    const cam = TL.cam.at(t);
    cam.x += fx.sx; cam.y += fx.sy;
    cam.zoom *= 1 + fx.zoom;
    cam.roll += fx.rot;
    const box = TL.box.at(t);
    box.bulge = {};
    for (const h of TL.boxHits) {
      const dt = t - h.t;
      if (dt < 0 || dt > 0.8) continue;
      const k = h.amt * Math.exp(-dt * 9) * Math.cos(dt * 38);
      const q = box.bulge[h.side];
      if (!q || Math.abs(k) > Math.abs(q[0])) box.bulge[h.side] = [k, h.u, 0.22];
    }
    return {
      t, fx, cam, box,
      soul: TL.soul.at(t),
      soulCol: TL.soulCol.at(t),
      aura: TL.aura.at(t).v,
      enemy: TL.enemy.at(t),
      pose: TL.pose.at(t), face: TL.face.at(t), body: TL.body.at(t), limbs: TL.limbs.at(t),
      boxForm: TL.boxForm.at(t), boxArms: TL.boxArms.at(t), boxBody: TL.boxBody.at(t),
      hud: TL.hud.at(t),
      btn: TL.btn.map((b) => b.at(t)),
      rating: TL.rating.at(t),
      post: TL.post.at(t),
    };
  };

  // ---------------------------------------------------------------- scene
  MV.Scene = class {
    constructor() {
      const W = MV.VW + MV.PADX * 2, H = MV.VH + MV.PADY * 2;
      [this.world, this.ctx] = D.tmp(W, H);
      [this.emiC, this.emi] = D.tmp(W, H);
      [this.glowA, this.gA] = D.tmp(W >> 2, H >> 2);
      [this.glowB, this.gB] = D.tmp(W >> 3, H >> 3);
      [this.screen, this.sctx] = D.tmp(MV.SW, MV.SH);
      this.W = W; this.H = H;
    }
    render(t, only3D) {
      const { ctx, emi, sctx } = this;
      const S = (this.S = MV.state(t));
      if (only3D) {
        sctx.clearRect(0, 0, MV.SW, MV.SH);
        for (const e of TL.active(t)) if (e.screen) e.draw(sctx, null, t, S);
        this.drawTV(S, t);
        return S;
      }
      for (const c of [ctx, emi]) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, this.W, this.H);
        c.setTransform(1, 0, 0, 1, MV.PADX, MV.PADY);
        c.imageSmoothingEnabled = false;
        c.globalAlpha = 1;
      }
      sctx.clearRect(0, 0, MV.SW, MV.SH);
      const evs = TL.active(t);
      const layer = (z0, z1, filter) => {
        for (const e of evs) if (e.z >= z0 && e.z < z1 && !e.screen && (!filter || filter(e))) e.draw(ctx, emi, t, S);
      };
      layer(-1000, -100); // stage backdrop, lights, smoke behind the star
      this.drawEnemy(S, t);
      layer(-100, 0);
      // arena
      const b = S.box;
      if (b.fill > 0) D.rect(ctx, b.x, b.y, b.w, b.h, '#000', b.fill);
      D.clipRect(ctx, b.x, b.y, b.w, b.h);
      D.clipRect(emi, b.x - 40, b.y - 40, b.w + 80, b.h + 80);
      layer(0, 10, (e) => e.clip === 'box');
      ctx.restore(); emi.restore();
      D.box(ctx, emi, b);
      this.drawHud(S, t);
      layer(0, 40, (e) => e.clip !== 'box');
      this.drawSoul(S, t);
      layer(40, 1000);
      for (const e of evs) if (e.screen) e.draw(sctx, null, t, S);
      this.drawTV(S, t);
      // bloom sources: quarter + eighth resolution blurs
      const { gA, gB } = this;
      gA.setTransform(1, 0, 0, 1, 0, 0); gB.setTransform(1, 0, 0, 1, 0, 0);
      gA.clearRect(0, 0, this.glowA.width, this.glowA.height);
      gB.clearRect(0, 0, this.glowB.width, this.glowB.height);
      gA.imageSmoothingEnabled = gB.imageSmoothingEnabled = true;
      gA.filter = 'blur(2px)';
      gA.drawImage(this.emiC, 0, 0, this.glowA.width, this.glowA.height);
      gA.filter = 'none';
      gB.filter = 'blur(3px)';
      gB.drawImage(this.emiC, 0, 0, this.glowB.width, this.glowB.height);
      gB.filter = 'none';
      return S;
    }
    drawEnemy(S, t) {
      const { ctx, emi } = this;
      const en = S.enemy;
      if (en.a <= 0.001) return;
      if (S.boxForm > 0.5) {
        const sh = en.shake || 0;
        const jx = sh ? R(U.noise(t * 47) * sh) : 0, jy = sh ? R(U.noise(t * 53 + 7) * sh * 0.6) : 0;
        D.boxMtt(ctx, emi, en.bx + jx, en.by + jy, { frame: S.boxBody, arms: S.boxArms === 'none' ? null : S.boxArms, alpha: en.a, rot: en.rot + (sh ? U.noise(t * 31 + 3) * sh * 0.01 : 0), sx: en.sx, sil: en.sil ? en.silCol : null, glow: en.glow });
        return;
      }
      const o = {
        pose: S.pose, face: S.face, body: S.body, armsGone: S.limbs.arms < 0.5, legsGone: S.limbs.legs < 0.5,
        alpha: en.a, reveal: en.reveal < 1 ? en.reveal : undefined, rot: en.rot, scale: en.sc, glow: en.glow,
      };
      // bob: a little breathing on the beat, a hover when the legs are gone
      const bob = en.bob * (S.limbs.legs < 0.5 ? Math.sin((t - T.off) / T.beat * Math.PI) * 6 : -Math.abs(Math.sin((t - T.off) / T.beat * Math.PI)) * 2);
      const x = en.x, y = en.y + bob;
      if (en.ghost > 0.01)
        for (let k = 4; k >= 1; k--) {
          const p = TL.enemy.at(t - k * 0.035);
          D.mtt(ctx, emi, p.x, p.y + bob, Object.assign({}, o, { lines: k % 2 ? MV.COL.pink : MV.COL.cyan, alpha: en.ghost * (0.6 - k * 0.1) * en.a, add: true, glow: 0 }));
        }
      if (en.sil > 0.5) {
        // a solid silhouette; while it is being revealed the line art dithers in over it
        D.mtt(ctx, null, x, y, Object.assign({}, o, { sil: en.silCol || '#000000' }));
        if (o.reveal !== undefined && o.reveal > 0.002) D.mtt(ctx, emi, x, y, o);
      } else {
        // dim: his line art greyed down (the final attack), his glow with it
        if (en.dim > 0.001) o.glow = (o.glow ?? 0.18) * (1 - en.dim);
        this.pts = D.mtt(ctx, emi, x, y, o);
        if (en.dim > 0.001) D.mtt(ctx, null, x, y, Object.assign({}, o, { lines: '#000000', alpha: en.dim * en.a }));
      }
    }
    drawHud(S, t) {
      const { ctx, emi } = this;
      const h = S.hud;
      if (h.a > 0.001) {
        const y = L.hudY, jit = h.jit || 0;
        D.hud(ctx, 'BOMEI', L.name, y, { alpha: h.a * h.nameA, shake: jit, seed: t * 60 });
        D.hud(ctx, 'LV 1', L.lv, y, { alpha: h.a * h.lvA, shake: jit, seed: t * 61 });
        ctx.globalAlpha = h.a * h.barA; ctx.drawImage(MV.SPR.hpLabel, L.hpLabel, y); ctx.globalAlpha = 1;
        D.hpBar(ctx, L.hpBar.x, L.hpBar.y, h.hp, 20, h.a * h.barA);
        D.hud(ctx, String(R(h.hp)) + ' / 20', L.num, y, { alpha: h.a * h.barA, shake: jit, seed: t * 62 });
      }
      for (let i = 0; i < 4; i++) {
        const bs = S.btn[i];
        if (bs.a <= 0.001) continue;
        D.button(ctx, emi, i, L.btnX[i] + (bs.dx || 0), L.btnY + (bs.dy || 0), { a: bs.a, sel: bs.sel });
      }
      this.drawRating(ctx, emi, S, t, L.rating[0] + S.rating.dx, L.rating[1] + S.rating.dy);
    }
    drawRating(ctx, emi, S, t, x, y) {
      const r = S.rating;
      if (r.a <= 0.001) return;
      const n = 42, hist = [];
      for (let i = 0; i < n; i++) {
        const tt = t - (n - 1 - i) * 0.09;
        const v = TL.rating.at(tt).v;
        // the line wobbles like the game's, more when the number is climbing
        const climb = U.clamp((v - TL.rating.at(tt - 0.3).v) / 150);
        hist.push(U.clamp((v - 2500) / 10500 + U.noise(tt * 7 + i) * (0.02 + climb * 0.06)));
      }
      const hot = U.clamp((r.v - TL.rating.at(t - 0.25).v) / 120);
      D.rating(ctx, emi, x, y, r.v, hist, { alpha: r.a, hot, shake: hot * 2, seed: t * 40, numCol: r.v >= 12000 ? MV.COL.gold : '#ffffff' });
    }
    drawSoul(S, t) {
      const { ctx, emi } = this;
      const s = S.soul;
      if (s.a <= 0.001) return;
      const p1 = TL.soul.at(t - 1 / 60);
      const sp = Math.hypot(s.x - p1.x, s.y - p1.y) * 60;
      const trail = U.clamp((sp - 150) / 600) * s.a;
      const name = 'soul_' + S.soulCol;
      if (trail > 0.02) {
        for (let k = 6; k >= 1; k--) {
          const p = TL.soul.at(t - k * 0.012);
          MV.spr(ctx, MV.sil(name, S.soulCol === 'yellow' ? '#fff27a' : '#ff3c50'), p.x, p.y, { rot: p.rot, scale: p.sc, alpha: trail * (0.6 - k * 0.08) });
          if (emi) { emi.globalAlpha = trail * (0.5 - k * 0.06); MV.spr(emi, name, p.x, p.y, { rot: p.rot, scale: p.sc * 1.3 }); emi.globalAlpha = 1; }
        }
      }
      D.soul(ctx, emi, s.x, s.y, { col: S.soulCol, rot: s.rot, scale: s.sc, sq: s.sq, alpha: s.a, aura: S.aura, t });
    }
    // broadcast graphics on the screen overlay: LIVE tally, REC, a rating ticker, the combo counter.
    drawTV(S, t) {
      const c = this.sctx, tv = TL.tv.at(t);
      const pad = 18, top = pad;
      if (tv.a <= 0.001) return;
      const a = tv.a;
      // LIVE tally
      const blink = Math.floor((t - T.off) / T.beat) % 2 === 0;
      D.rect(c, MV.SW - pad - 94, top, 94, 28, '#000000', 0.6 * a);
      D.rect(c, MV.SW - pad - 88, top + 8, 12, 12, blink ? '#ff2030' : '#701018', a);
      D.text(c, 'LIVE', MV.SW - pad - 70, top + 6, { scale: 1, alpha: a, color: '#ffffff' });
      D.text(c, tv.cam || 'CAM 1', MV.SW - pad - 88, top + 34, { scale: 1, alpha: a * 0.8, color: '#c8c8c8' });
      if (tv.combo > 0.5) {
        const k = U.clamp(1 - (t - TL.comboAt(t)) / 0.2), cx = MV.SW - pad - 120, cy = MV.SH - pad - 70;
        D.text(c, 'COMBO', cx, cy, { scale: 1, alpha: a, color: MV.COL.pink });
        D.text(c, '×' + R(tv.combo), cx, cy + 18, { scale: 2 + (k > 0.5 ? 1 : 0), alpha: a, color: '#ffffff', outline: '#000000' });
      }
    }
  };
})();
