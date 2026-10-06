// Pixel drawing primitives (world space = 960x540 view; the original 640x480
// battle layout sits 1:1 at +160,+30). Mettaton EX is assembled from the sheet
// parts at 2x art scale, like the game; bullets / props at 1x.
(function () {
  const MV = window.MV, U = MV.U, G = window.MV_GLYPHS;
  const D = (MV.D = {});
  MV.VW = 960; MV.VH = 540;
  MV.PADX = 240; MV.PADY = 135; // world canvas margin around the default view
  [MV.SW, MV.SH] = MV.PORTRAIT ? [540, 960] : [960, 540];
  // portrait safe area (screen px): overlays start below the app's top bar (PTOP); focus targets
  // stay between the bottom of the screen HUD and the top of the caption area (PSAFE)
  MV.PTOP = 76; MV.PSAFE = [218, 770];
  MV.ART_SCALE = 2;

  const tmp = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.imageSmoothingEnabled = false;
    return [c, x];
  };
  D.tmp = tmp;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  D.bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const R = Math.round;

  // ---------------------------------------------------------------- text
  // SimSun 16 px bitmaps (8x16 latin, 16x16 CJK) — dialogue, labels
  const glyphCache = {};
  function glyph(ch, color) {
    const key = ch + color;
    if (glyphCache[key]) return glyphCache[key];
    const g = G[ch] || G['?'];
    const w = g[0], rows = g[1];
    const [c, x] = tmp(w, 16);
    x.fillStyle = color;
    for (let j = 0; j < 16; j++) for (let i = 0; i < w; i++) if ((rows[j] >> (w - 1 - i)) & 1) x.fillRect(i, j, 1, 1);
    return (glyphCache[key] = c);
  }
  D.glyph = glyph;
  D.textWidth = (s, o = {}) => {
    let w = 0;
    for (const ch of s) w += ((G[ch] || G['?'])[0] + (o.spacing || 0)) * (o.scale || 2);
    return w;
  };
  // o: color, scale (default 2), align, alpha, glow (emi ctx), shake, seed, wave, spacing, outline
  D.text = (ctx, s, x, y, o = {}) => {
    const sc = o.scale || 2, color = MV.hex6(o.color || '#ffffff');
    const w = D.textWidth(s, o);
    if (o.align === 'center') x -= w / 2;
    else if (o.align === 'right') x -= w;
    let cx = R(x), i = 0;
    y = R(y);
    for (const ch of s) {
      const g = glyph(ch, color);
      let jx = 0, jy = 0;
      if (o.shake) { jx = R(U.noise((o.seed || 0) + i * 3.1) * o.shake); jy = R(U.noise((o.seed || 0) + i * 5.7 + 9) * o.shake); }
      if (o.wave !== undefined) jy += R(Math.sin(o.wave + i * 0.8) * (o.waveAmp ?? 3));
      ctx.globalAlpha = o.alpha ?? 1;
      if (o.outline) {
        const ol = glyph(ch, o.outline);
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(ol, cx + jx + dx * sc, y + jy + dy * sc, g.width * sc, 16 * sc);
      }
      ctx.drawImage(g, cx + jx, y + jy, g.width * sc, 16 * sc);
      if (o.glow) { o.glow.globalAlpha = (o.glowA ?? 0.6) * (o.alpha ?? 1); o.glow.drawImage(g, cx + jx - 1, y + jy - 1, g.width * sc + 2, 16 * sc + 2); o.glow.globalAlpha = 1; }
      cx += (g.width + (o.spacing || 0)) * sc;
      i++;
    }
    ctx.globalAlpha = 1;
    return w;
  };
  // original HUD font (BattleFont, 5x5 glyphs in 6x6 cells) and the big damage font
  const bitmapText = (font) => (ctx, str, x, y, o = {}) => {
    const f = MV.FONTS[font], sc = o.scale || (font === 'battle' ? 2 : 1);
    const color = MV.hex6(o.color || '#ffffff');
    const adv = (f.cw + (o.spacing || 0)) * sc;
    const w = str.length * adv;
    if (o.align === 'center') x -= w / 2;
    else if (o.align === 'right') x -= w;
    let cx = R(x), i = 0;
    for (const ch of str) {
      if (ch !== ' ' && !(o.skip && o.skip(i))) {
        const g = MV.fontGlyph(font, ch, color);
        let jx = 0, jy = 0;
        if (o.shake) { jx = R(U.noise((o.seed || 0) + i * 3.1) * o.shake); jy = R(U.noise((o.seed || 0) + i * 5.7 + 9) * o.shake); }
        ctx.globalAlpha = o.alpha ?? 1;
        ctx.drawImage(g, cx + jx, R(y) + jy, f.cw * sc, f.ch * sc);
        if (o.glow) { o.glow.globalAlpha = (o.glowA ?? 0.6) * (o.alpha ?? 1); o.glow.drawImage(g, cx + jx - 1, R(y) + jy - 1, f.cw * sc + 2, f.ch * sc + 2); o.glow.globalAlpha = 1; }
      }
      cx += adv; i++;
    }
    ctx.globalAlpha = 1;
    return w;
  };
  D.hud = bitmapText('battle');
  D.dmg = bitmapText('damage');
  D.hudWidth = (s, sc = 2) => s.length * 6 * sc;

  // ---------------------------------------------------------------- shapes
  D.pixelRing = (ctx, x, y, r, w, color, alpha = 1) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const n = Math.max(12, Math.ceil(r * 6.4));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * U.TAU;
      ctx.fillRect(R(x + Math.cos(a) * r - w / 2), R(y + Math.sin(a) * r - w / 2), w, w);
    }
    ctx.globalAlpha = 1;
  };
  D.rect = (ctx, x, y, w, h, color, a = 1) => {
    if (!ctx) return;
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.fillRect(R(x), R(y), R(w), R(h));
    ctx.globalAlpha = 1;
  };
  D.frame = (ctx, x, y, w, h, th, color, a = 1) => {
    D.rect(ctx, x, y, w, th, color, a); D.rect(ctx, x, y + h - th, w, th, color, a);
    D.rect(ctx, x, y, th, h, color, a); D.rect(ctx, x + w - th, y, th, h, color, a);
  };
  // warning zone flashing where an attack will land
  D.warn = (ctx, emi, x, y, w, h, t, color = '#ff2030') => {
    const on = Math.floor(t * 20) % 2 === 0;
    ctx.globalAlpha = on ? 1 : 0.4;
    ctx.fillStyle = color;
    ctx.fillRect(R(x), R(y), R(w), 2); ctx.fillRect(R(x), R(y + h) - 2, R(w), 2);
    ctx.fillRect(R(x), R(y), 2, R(h)); ctx.fillRect(R(x + w) - 2, R(y), 2, R(h));
    ctx.globalAlpha = on ? 0.22 : 0.08;
    ctx.fillRect(R(x), R(y), R(w), R(h));
    ctx.globalAlpha = 1;
    if (emi) { emi.globalAlpha = on ? 0.45 : 0.15; emi.fillStyle = color; emi.fillRect(R(x), R(y), R(w), R(h)); emi.globalAlpha = 1; }
  };
  D.clipRect = (ctx, x, y, w, h) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(R(x), R(y), R(w), R(h));
    ctx.clip();
  };

  // ---------------------------------------------------------------- battle box
  // b: {x,y,w,h, th, draw: 0..1 perimeter fraction, bulge: {side:[amt,u,width]}, alpha, color}
  D.box = (ctx, emi, b) => {
    const X = R(b.x), Y = R(b.y), W = R(b.w), H = R(b.h);
    const th = b.th || 4;
    const col = b.color || '#ffffff';
    const frac = b.draw ?? 1;
    if (frac <= 0 || W < 2 || H < 2) return;
    const bul = b.bulge || {};
    const off = (side, u) => {
      const q = bul[side];
      if (!q || !q[0]) return 0;
      const d = (u - q[1]) / (q[2] || 0.2);
      return q[0] * Math.exp(-d * d);
    };
    const per = 2 * (W + H), lim = frac * per;
    ctx.globalAlpha = b.alpha ?? 1;
    ctx.fillStyle = col;
    if (emi) { emi.globalAlpha = 0.12 * (b.alpha ?? 1) * (b.glow ?? 1); emi.fillStyle = col; }
    let acc = 0;
    const seg = (side, len, fn) => {
      for (let i = 0; i < len; i += 2, acc += 2) {
        if (acc > lim) return;
        const [px, py, pw, ph] = fn(i, off(side, i / len));
        ctx.fillRect(px, py, pw, ph);
        if (emi) emi.fillRect(px - 2, py - 2, pw + 4, ph + 4);
      }
    };
    seg('top', W, (i, o) => [X + i, Y - th - R(o), 2, th]);
    seg('right', H, (i, o) => [X + W + R(o), Y + i, th, 2]);
    seg('bottom', W, (i, o) => [X + W - 2 - i, Y + H + R(o), 2, th]);
    seg('left', H, (i, o) => [X - th - R(o), Y + H - 2 - i, th, 2]);
    if (frac >= 1) {
      ctx.fillRect(X - th, Y - th, th, th); ctx.fillRect(X + W, Y - th, th, th);
      ctx.fillRect(X - th, Y + H, th, th); ctx.fillRect(X + W, Y + H, th, th);
    }
    ctx.globalAlpha = 1;
    if (emi) emi.globalAlpha = 1;
  };

  // ---------------------------------------------------------------- soul
  // The yellow soul fights Mettaton upside down (it shoots upward): rot = PI.
  // o: {col, rot, scale, alpha, aura, glow, sq}
  D.soul = (ctx, emi, x, y, o = {}) => {
    const col = o.col || 'yellow';
    const name = 'soul_' + col;
    const sc = o.scale || 1;
    const glowC = col === 'yellow' ? '#ffd000' : col === 'red' ? '#ff1020' : '#ffffff';
    if (o.aura) {
      for (let k = 0; k < 8; k++) {
        const an = (k / 8) * U.TAU + (o.t || 0) * 3;
        MV.spr(ctx, MV.sil(name, col === 'yellow' ? '#fff27a' : '#ff6070'), x + R(Math.cos(an) * 2), y + R(Math.sin(an) * 2), { rot: o.rot, scale: sc, alpha: 0.3 * o.aura });
      }
      if (emi) { emi.globalAlpha = 0.3 * o.aura; MV.spr(emi, MV.sil(name, glowC), x, y, { rot: o.rot, scale: sc * 1.7 }); emi.globalAlpha = 1; }
    }
    const sq = o.sq ?? 1, sx = 1 / Math.sqrt(sq), sy = sq;
    MV.spr(ctx, name, x, y, { rot: o.rot, scale: sc, alpha: o.alpha, sx, sy });
    if (emi) { emi.globalAlpha = (o.alpha ?? 1) * (o.glow ?? 0.7); MV.spr(emi, MV.sil(name, glowC), x, y, { rot: o.rot, scale: sc * 1.4, sx, sy }); emi.globalAlpha = 1; }
  };
  // the yellow soul's shot: a short yellow slug, white-hot core
  D.shot = (ctx, emi, x, y, o = {}) => {
    const len = o.len || 12, w = o.w || 4, a = o.alpha ?? 1;
    D.rect(ctx, x - w / 2, y - len / 2, w, len, MV.COL.soulYellow, a);
    D.rect(ctx, x - w / 2 + 1, y - len / 2 + 2, w - 2, len - 4, '#ffffff', a);
    if (emi) D.rect(emi, x - w - 2, y - len / 2 - 3, w * 2 + 4, len + 6, '#ffd000', 0.55 * a);
  };
  D.hpBar = (ctx, x, y, hp, max, a = 1) => {
    const w = R(max * 1.2), h = 21, fw = R(w * U.clamp(hp / max));
    D.rect(ctx, x, y, w, h, MV.COL.hpRed, a);
    D.rect(ctx, x, y, fw, h, MV.COL.hpYellow, a);
  };

  // ---------------------------------------------------------------- Mettaton EX (sheet parts on the rig)
  // Composed at 1x on a scratch canvas (body origin at BX, BY), then scaled.
  // o: {pose, face, body (0..5), heart (core heart 0..1), armsGone, legsGone,
  //     armsOff (skip arm art but keep the stumps), sil (flat colour), lines (outline colour),
  //     reveal (0..1 dither), alpha, scale, t}
  const EW = 260, EH = 214, BX = 93, BY = 44;
  const RIG = MV.RIG;
  const cache = new Map();
  const drawPart = (x, img, piv, at, flip) => {
    const w = img.width, px = flip ? w - 1 - piv[0] : piv[0];
    const left = R(BX + at[0] - px), top = R(BY + at[1] - piv[1]);
    if (flip) { x.save(); x.translate(left + w, top); x.scale(-1, 1); x.drawImage(img, 0, 0); x.restore(); }
    else x.drawImage(img, left, top);
  };
  D.mttKey = (o) => {
    const p = typeof o.pose === 'string' ? o.pose : JSON.stringify(o.pose || 'idle');
    return [p, o.face ?? 0, o.body ?? 0, o.armsGone ? 1 : 0, o.legsGone ? 1 : 0, o.heart ?? 1].join('|');
  };
  D.mttCompose = (o = {}) => {
    const key = D.mttKey(o);
    let c = cache.get(key);
    if (c) return c;
    if (cache.size > 400) cache.clear();
    const [cv, x] = tmp(EW, EH);
    const pose = typeof o.pose === 'object' && o.pose ? o.pose : MV.POSES[o.pose || 'idle'];
    const B = RIG.body;
    const limb = (spec, side, kind) => {
      if (!spec) return;
      const [name, flip] = spec, img = MV.part(name);
      const at = kind === 'leg' ? (side === 'L' ? B.hipL : B.hipR) : side === 'L' ? B.shL : B.shR;
      drawPart(x, img, RIG[kind][name], at, flip);
    };
    if (!o.legsGone) { limb(pose.legL, 'L', 'leg'); limb(pose.legR, 'R', 'leg'); }
    x.drawImage(MV.part('body' + (o.body ?? 0)), BX, BY);
    x.drawImage(MV.part(typeof o.face === 'string' ? o.face : 'face' + (o.face ?? 0)), BX + B.face[0], BY + B.face[1]);
    if ((o.heart ?? 1) > 0.5 && (o.body ?? 0) < 5) x.drawImage(MV.part('puff0'), BX + 32, BY + 53);
    if (!o.armsGone) { limb(pose.armL, 'L', 'arm'); limb(pose.armR, 'R', 'arm'); }
    else for (const s of [B.shL, B.shR]) { x.fillStyle = '#000'; x.fillRect(BX + s[0] - 3, BY + s[1] - 3, 6, 6); x.fillStyle = '#fff'; x.fillRect(BX + s[0] - 3, BY + s[1] - 3, 6, 1); x.fillRect(BX + s[0] - 3, BY + s[1] + 2, 6, 1); }
    c = { cv, lines: null };
    cache.set(key, c);
    return c;
  };
  // world points of the rig for a figure standing with feet centre at (x, y)
  D.mttPts = (x, y, o = {}) => {
    const sc = o.scale || 2, B = RIG.body;
    const pose = typeof o.pose === 'object' && o.pose ? o.pose : MV.POSES[o.pose || 'idle'];
    const ox = x - 37 * sc, oy = y - 97 * sc;
    const P = (p) => [ox + p[0] * sc, oy + p[1] * sc];
    const end = (spec, side, kind, tbl) => {
      if (!spec) return null;
      const [name, flip] = spec, img = MV.part(name), piv = RIG[kind][name], e = RIG[tbl][name];
      const at = kind === 'leg' ? (side === 'L' ? B.hipL : B.hipR) : side === 'L' ? B.shL : B.shR;
      const ex = flip ? piv[0] - e[0] : e[0] - piv[0];
      return P([at[0] + ex, at[1] + e[1] - piv[1]]);
    };
    return {
      face: P([37, 17]), core: P(B.core), waist: P(B.waist), shL: P(B.shL), shR: P(B.shR),
      handL: end(pose.armL, 'L', 'arm', 'hand'), handR: end(pose.armR, 'R', 'arm', 'hand'),
      footL: end(pose.legL, 'L', 'leg', 'foot'), footR: end(pose.legR, 'R', 'leg', 'foot'),
    };
  };
  const [rc, rx] = tmp(EW, EH);
  D.mtt = (ctx, emi, x, y, o = {}) => {
    const sc = o.scale || 2, c = D.mttCompose(o);
    let src = c.cv;
    // (a silhouette is always whole: the dither scratch canvas must never reach the tint cache)
    if (!o.sil && o.reveal !== undefined && o.reveal < 1) {
      rx.clearRect(0, 0, EW, EH);
      rx.drawImage(src, 0, 0);
      const id = rx.getImageData(0, 0, EW, EH);
      for (let j = 0; j < EH; j++)
        for (let i = 0; i < EW; i++) {
          const vv = o.reveal * 1.5 - (1 - j / EH) * 0.5;
          if (D.bayer(i, j) > vv) id.data[(j * EW + i) * 4 + 3] = 0;
        }
      rx.putImageData(id, 0, 0);
      src = rc;
    }
    if (o.sil) src = MV.sil(c.cv, o.sil);
    else if (o.lines) src = MV.lines(c.cv, o.lines);
    const ox = R(x - (BX + 37) * sc), oy = R(y - (BY + 97) * sc);
    ctx.save();
    ctx.globalAlpha = o.alpha ?? 1;
    if (o.rot) { ctx.translate(R(x), R(y)); ctx.rotate(o.rot); ctx.translate(-R(x), -R(y)); }
    if (o.add) ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(src, ox, oy, EW * sc, EH * sc);
    ctx.restore();
    if (emi && !o.sil && (o.glow ?? 0.18) > 0) {
      if (!c.lines) c.lines = MV.lines(c.cv, '#ffffff');
      emi.save();
      emi.globalAlpha = (o.glow ?? 0.18) * (o.alpha ?? 1);
      if (o.rot) { emi.translate(R(x), R(y)); emi.rotate(o.rot); emi.translate(-R(x), -R(y)); }
      emi.drawImage(o.glowCol ? MV.sil(c.lines, o.glowCol) : c.lines, ox - 1, oy - 1, EW * sc + 2, EH * sc + 2);
      emi.restore();
    }
    return D.mttPts(x, y, o);
  };
  // a single limb flying loose (arms / legs blown off): drawn around its own centre
  D.limb = (ctx, emi, name, x, y, rot, o = {}) => {
    const img = MV.part(name), sc = o.scale || 2;
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.translate(R(x), R(y)); ctx.rotate(rot); ctx.scale((o.flip ? -1 : 1) * sc, sc);
    ctx.drawImage(img, -R(img.width / 2), -R(img.height / 2)); ctx.restore();
    if (emi) { emi.save(); emi.globalAlpha = 0.25 * (o.alpha ?? 1); emi.translate(R(x), R(y)); emi.rotate(rot); emi.scale((o.flip ? -1 : 1) * sc, sc); emi.drawImage(MV.lines(img), -R(img.width / 2), -R(img.height / 2)); emi.restore(); }
  };

  // ---------------------------------------------------------------- box form (phase one)
  // All cells share a 108x92 canvas: body + dials + wheel; arm overlays on the same canvas.
  // (x, y) = centre of the canvas in world. o: {frame, arms, scale, rot, alpha, sil, shake}
  D.boxMtt = (ctx, emi, x, y, o = {}) => {
    const sc = o.scale || 2;
    const layers = [o.frame || 'idle0'];
    if (o.arms) layers.push(o.arms);
    ctx.save();
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.translate(R(x), R(y));
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(sc * (o.sx ?? 1), sc * (o.sy ?? 1));
    for (const n of layers) {
      const img = o.sil ? MV.sil(MV.boxPart(n), o.sil) : MV.boxPart(n);
      ctx.drawImage(img, -54, -46);
    }
    ctx.restore();
    if (emi && !o.sil) {
      emi.save(); emi.globalAlpha = (o.glow ?? 0.15) * (o.alpha ?? 1); emi.translate(R(x), R(y)); if (o.rot) emi.rotate(o.rot); emi.scale(sc, sc);
      for (const n of layers) emi.drawImage(MV.lines(MV.boxPart(n)), -54, -46);
      emi.restore();
    }
  };

  // ---------------------------------------------------------------- speech bubble
  // white rounded box, black text, a tail pointing at (tx, ty). lines: array of strings.
  D.bubble = (ctx, x, y, w, h, lines, o = {}) => {
    const a = o.alpha ?? 1, sc = o.scale || 1;
    const pop = o.pop ?? 1;
    const cx = x + w / 2, cy = y + h / 2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(R(cx), R(cy)); ctx.scale(pop, pop); ctx.translate(-R(cx), -R(cy));
    ctx.fillStyle = o.fill || '#ffffff';
    if (o.jagged) {
      // phone-call bubble: a spiky outline like the original call-in bubbles, an ellipse round
      // (not inside) the text box so the corners of the text stay in it
      const n = Math.max(12, R((w + h) / 9));
      ctx.beginPath();
      for (let i = 0; i <= n * 2; i++) {
        const u = i / (n * 2), ang = u * U.TAU, r = i % 2 ? 1 : 1.16;
        const px = cx + Math.cos(ang) * (w / 2) * 1.18 * r, py = cy + Math.sin(ang) * (h / 2) * 1.45 * r;
        i ? ctx.lineTo(R(px), R(py)) : ctx.moveTo(R(px), R(py));
      }
      ctx.closePath();
      ctx.fillStyle = '#000'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    } else {
      const r = 6;
      // a dark rim so the bubble still reads over white light / smoke
      ctx.fillStyle = '#000000';
      ctx.fillRect(R(x + r - 2), R(y - 2), R(w - 2 * r + 4), R(h + 4)); ctx.fillRect(R(x - 2), R(y + r - 2), R(w + 4), R(h - 2 * r + 4));
      ctx.fillStyle = o.fill || '#ffffff';
      ctx.fillRect(R(x + r), R(y), R(w - 2 * r), R(h)); ctx.fillRect(R(x), R(y + r), R(w), R(h - 2 * r));
      ctx.fillRect(R(x + 2), R(y + 2), R(w - 4), R(h - 4));
      if (o.tx !== undefined) {
        // tail: a stepped triangle toward (tx, ty) from the nearest side
        const side = o.tx < x ? -1 : 1, bx = side < 0 ? x : x + w, by = U.clamp(o.ty, y + 10, y + h - 10);
        for (let i = 0; i < 12; i++) { const k = i / 12; ctx.fillRect(R(bx + side * i * 1.2 - (side < 0 ? 2 : 0)), R(by - 6 * (1 - k)), 2, R(12 * (1 - k))); }
      }
    }
    const col = o.jagged ? '#ffffff' : o.color || '#000000';
    lines.forEach((ln, i) => D.text(ctx, ln, x + 10 * sc, y + 8 * sc + i * 18 * sc, { scale: sc, color: col }));
    ctx.restore();
  };

  // ---------------------------------------------------------------- stage
  // spotlight fixture at (x, y) aiming along ang (0 = +x), with an optional beam cone
  D.spotlight = (ctx, emi, x, y, ang, o = {}) => {
    const on = o.on ?? 1, len = o.len || 700, spread = o.spread || 0.2, sc = o.scale || 2;
    const lens = 20 * sc; // beam starts at the lamp's mouth
    if (on > 0.01) {
      const col = o.col || '#ffffff';
      const w0 = 7 * sc;
      ctx.save();
      ctx.translate(R(x), R(y)); ctx.rotate(ang);
      ctx.globalAlpha = (o.beamA ?? 0.9) * on;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(lens, -w0); ctx.lineTo(len, -w0 - Math.tan(spread) * len); ctx.lineTo(len, w0 + Math.tan(spread) * len); ctx.lineTo(lens, w0); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (emi) {
        // (kept faint: two beams cross right behind the star, and the blurred bloom of a strong
        // beam would wash his silhouette out)
        emi.save(); emi.translate(R(x), R(y)); emi.rotate(ang); emi.globalAlpha = (o.glow ?? 0.07) * on; emi.fillStyle = col;
        emi.beginPath(); emi.moveTo(lens, -w0 - 4); emi.lineTo(len, -w0 - Math.tan(spread) * len * 1.1); emi.lineTo(len, w0 + Math.tan(spread) * len * 1.1); emi.lineTo(lens, w0 + 4); emi.closePath(); emi.fill(); emi.restore();
      }
    }
    // the fixture (sheet art: a hung lamp, head at (32, 26), aiming down-right at 0.76 rad)
    const img = MV.part('spotOff');
    ctx.save();
    ctx.translate(R(x), R(y)); ctx.rotate(ang - 0.76); ctx.scale(sc, sc);
    ctx.drawImage(img, 19, 0, 33, 45, -13, -26, 33, 45);
    ctx.restore();
    if (emi && on > 0.01) D.rect(emi, x - 10 + Math.cos(ang) * lens, y - 10 + Math.sin(ang) * lens, 20, 20, '#ffffff', 0.8 * on);
  };
  // smoke cloud (sheet art) with a pixel dissolve (k: 1 = solid, 0 = gone)
  D.smoke = (ctx, emi, x, y, o = {}) => {
    const img = MV.part('smoke'), sc = o.scale || 2, k = o.k ?? 1;
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = (o.alpha ?? 1) * (k > 0.99 ? 1 : 0.35 + 0.65 * k);
    ctx.translate(R(x), R(y)); if (o.rot) ctx.rotate(o.rot);
    ctx.scale(sc * (o.flip ? -1 : 1), sc);
    ctx.drawImage(o.col ? MV.sil(img, o.col) : img, -R(img.width / 2), -R(img.height / 2));
    ctx.restore();
    if (emi) { emi.save(); emi.globalAlpha = 0.03 * k * (o.alpha ?? 1); emi.translate(R(x), R(y)); emi.scale(sc, sc); emi.drawImage(MV.sil(img, o.col || '#ffffff'), -R(img.width / 2), -R(img.height / 2)); emi.restore(); }
  };

  // ---------------------------------------------------------------- ratings graph (top-left, like the game)
  // hist: array of values oldest -> newest (0..1 of the graph height), val: shown number
  D.rating = (ctx, emi, x, y, val, hist, o = {}) => {
    const a = o.alpha ?? 1, W = o.w || 170, H = o.h || 90;
    D.text(ctx, '收视率', x, y, { scale: 2, alpha: a, glow: o.glow ? emi : null });
    D.text(ctx, String(Math.round(val)), x + 100, y, { scale: 2, alpha: a, color: o.numCol || '#ffffff', glow: emi, glowA: 0.25 + (o.hot || 0) * 0.6, shake: o.shake, seed: o.seed });
    const gx = x - 8, gy = y + 40;
    D.rect(ctx, gx, gy, 2, H, '#ffffff', a);
    D.rect(ctx, gx, gy + H - 2, W, 2, '#ffffff', a);
    D.rect(ctx, gx + 2, gy + 4, W - 4, 1, MV.COL.ratingTop, a * 0.9);
    D.rect(ctx, gx + 2, gy + H * 0.62, W - 4, 1, MV.COL.ratingMid, a * 0.9);
    const n = hist.length;
    for (let i = 1; i < n; i++) {
      const x0 = gx + 3 + ((i - 1) / (n - 1)) * (W - 8), x1 = gx + 3 + (i / (n - 1)) * (W - 8);
      const y0 = gy + H - 4 - hist[i - 1] * (H - 10), y1 = gy + H - 4 - hist[i] * (H - 10);
      const steps = Math.max(1, R(Math.abs(y1 - y0) / 2));
      for (let s = 0; s <= steps; s++) D.rect(ctx, U.lerp(x0, x1, s / steps), U.lerp(y0, y1, s / steps), 2, 2, MV.COL.rating, a);
    }
    if (emi) D.rect(emi, gx, gy, W, H, MV.COL.rating, 0.06 * a + (o.hot || 0) * 0.15);
  };
})();
