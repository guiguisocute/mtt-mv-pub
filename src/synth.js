// Procedural sound effects: the note hitsounds of the rhythm-game homages (osu!, CHUNITHM,
// Beat Saber, Muse Dash, Taiko - synthesised here, in the spirit of each game's own), plus
// reverse swells, whooshes and a glitch stutter. Deterministic (seeded noise), shared by the
// live player (WebAudio buffers) and tools/render.cjs.
(function (root) {
  const TAU = Math.PI * 2;
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
    };
  };
  // RBJ biquad; set() may be called every sample for sweeps
  const biquad = (sr) => {
    let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const f = {
      set(type, fc, q = 0.707) {
        const w = (TAU * Math.min(fc, sr * 0.45)) / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * q);
        let c0, c1, c2;
        if (type === 'lp') { c0 = (1 - cw) / 2; c1 = 1 - cw; c2 = c0; }
        else if (type === 'hp') { c0 = (1 + cw) / 2; c1 = -(1 + cw); c2 = c0; }
        else { c0 = al; c1 = 0; c2 = -al; } // band-pass, 0 dB peak
        const a0 = 1 + al;
        b0 = c0 / a0; b1 = c1 / a0; b2 = c2 / a0; a1 = (-2 * cw) / a0; a2 = (1 - al) / a0;
        return f;
      },
      run(x) { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; },
    };
    return f;
  };
  const finish = (o, sr, peak) => {
    let m = 0;
    for (let i = 0; i < o.length; i++) m = Math.max(m, Math.abs(o[i]));
    const n = Math.min(o.length, Math.round(sr * 0.006)); // de-click the tail
    for (let i = 0; i < o.length; i++) o[i] *= (m > 0 ? peak / m : 0) * (i >= o.length - n ? (o.length - 1 - i) / n : 1);
    return o;
  };
  const buf = (sr, sec) => new Float32Array(Math.round(sr * sec));

  const LEN = { Whoosh: 0.42, Swell: 1.0, SwellShort: 0.5, Glitch: 0.26 };
  const SOUNDS = {
    // air pass-by: noise through a band-pass sweeping up
    Whoosh(sr) {
      const o = buf(sr, LEN.Whoosh), nz = rng(47), bp = biquad(sr), hp = biquad(sr).set('hp', 250);
      for (let i = 0; i < o.length; i++) {
        const u = i / o.length;
        bp.set('bp', 450 * Math.pow(9, u), 1.1);
        o[i] = hp.run(bp.run(nz())) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 2);
      }
      return finish(o, sr, 0.8);
    },
    // reverse cymbal: rises to the downbeat and stops dead on it (schedule at tHit - LEN)
    Swell(sr) { return swell(sr, LEN.Swell, 53); },
    SwellShort(sr) { return swell(sr, LEN.SwellShort, 59); },
    // digital stutter: sample-and-hold noise and square blips, chopped into 16 ms grains
    Glitch(sr) {
      const o = buf(sr, LEN.Glitch), nz = rng(97), g = Math.round(sr * 0.016);
      let hold = 0, rate = 1, f = 200, on = 1;
      for (let i = 0; i < o.length; i++) {
        if (i % g === 0) { rate = 2 + Math.floor((nz() + 1) * 20); f = 90 + (nz() + 1) * 500; on = nz() > -0.45 ? 1 : 0; }
        if (i % rate === 0) hold = nz();
        const sq = Math.sin((TAU * f * i) / sr) > 0 ? 1 : -1;
        o[i] = on * (hold * 0.6 + sq * 0.35) * (1 - i / o.length);
      }
      return finish(o, sr, 0.7);
    },
  };
  // ---- hitsound building blocks. env(t, a, d): attack a s, exponential decay rate d
  const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) * d));
  // a sine whose pitch glides f0 -> f1 over g s (phase integrated, so the glide is clean)
  const glide = (sr, f0, f1, g) => { let ph = 0; return (t) => { ph += (TAU * (f1 + (f0 - f1) * Math.exp(-t / g))) / sr; return Math.sin(ph); }; };
  const hit = (sec, seed, peak, fn) => (sr) => {
    const o = buf(sr, sec), nz = rng(seed);
    fn(o, sr, nz);
    return finish(o, sr, peak);
  };
  Object.assign(SOUNDS, {
    // osu!: the soft "normal" hit - a noise click over a short falling tick
    HitOsu: hit(0.12, 11, 0.8, (o, sr, nz) => {
      const hp = biquad(sr).set('hp', 1800), bp = biquad(sr).set('bp', 2400, 1.4), tone = glide(sr, 1500, 900, 0.012);
      for (let i = 0; i < o.length; i++) { const t = i / sr; o[i] = hp.run(nz()) * env(t, 0.0005, 180) * 0.8 + bp.run(nz()) * env(t, 0.001, 60) * 0.6 + tone(t) * env(t, 0.001, 45) * 0.5; }
    }),
    // osu!: the clap on a new combo - three quick bursts and a short room
    HitOsuClap: hit(0.2, 13, 0.85, (o, sr, nz) => {
      const bp = biquad(sr).set('bp', 1300, 1.1), hp = biquad(sr).set('hp', 700);
      for (let i = 0; i < o.length; i++) {
        const t = i / sr, burst = [0, 0.009, 0.017].reduce((m, t0) => m + (t >= t0 ? Math.exp(-(t - t0) * 260) : 0), 0);
        o[i] = hp.run(bp.run(nz())) * (burst + 0.35 * env(t, 0.02, 22));
      }
    }),
    // slider / hold ticks: a tiny high click
    HitTick: hit(0.04, 17, 0.55, (o, sr, nz) => {
      const hp = biquad(sr).set('hp', 4000);
      for (let i = 0; i < o.length; i++) { const t = i / sr; o[i] = (Math.sin(TAU * 3200 * t) * 0.6 + hp.run(nz()) * 0.5) * env(t, 0.0005, 140); }
    }),
    // CHUNITHM: a bright tap - a hissing tick over metallic partials
    HitChuni: hit(0.1, 19, 0.75, (o, sr, nz) => {
      const hp = biquad(sr).set('hp', 4200);
      for (let i = 0; i < o.length; i++) {
        const t = i / sr, m = Math.sin(TAU * 2637 * t) + 0.7 * Math.sin(TAU * 3951 * t) + 0.45 * Math.sin(TAU * 5274 * t);
        o[i] = hp.run(nz()) * env(t, 0.0005, 150) * 0.9 + m * env(t, 0.0005, 55) * 0.3;
      }
    }),
    // CHUNITHM EX tap: the tap and a bell on top
    HitChuniEx: hit(0.4, 23, 0.8, (o, sr, nz) => {
      const hp = biquad(sr).set('hp', 4200);
      for (let i = 0; i < o.length; i++) {
        const t = i / sr, bell = Math.sin(TAU * 1568 * t) + 0.6 * Math.sin(TAU * 3136 * t + 0.4) + 0.3 * Math.sin(TAU * 4704 * t);
        o[i] = hp.run(nz()) * env(t, 0.0005, 150) * 0.8 + bell * env(t, 0.001, 11) * 0.3;
      }
    }),
    // CHUNITHM AIR: a tick and a rush upward
    HitChuniAir: hit(0.2, 29, 0.8, (o, sr, nz) => {
      const bp = biquad(sr), hp = biquad(sr).set('hp', 600);
      for (let i = 0; i < o.length; i++) { const t = i / sr, u = t / 0.2; bp.set('bp', 900 * Math.pow(8, u), 1.3); o[i] = hp.run(bp.run(nz())) * Math.sin(Math.PI * Math.min(1, u * 1.1)) + Math.sin(TAU * 2637 * t) * env(t, 0.0005, 90) * 0.3; }
    }),
    // CHUNITHM FLICK: a quick swish down
    HitChuniFlick: hit(0.1, 31, 0.75, (o, sr, nz) => {
      const bp = biquad(sr);
      for (let i = 0; i < o.length; i++) { const t = i / sr, u = t / 0.1; bp.set('bp', 6500 * Math.pow(0.22, u), 1.6); o[i] = bp.run(nz()) * Math.sin(Math.PI * u) ** 0.6; }
    }),
    // Beat Saber: the cut - a crack, a slash sweeping down, a thump in the chest
    HitSaber: hit(0.24, 37, 0.85, (o, sr, nz) => {
      const bp = biquad(sr), hp = biquad(sr).set('hp', 2500), thump = glide(sr, 140, 55, 0.03);
      for (let i = 0; i < o.length; i++) {
        const t = i / sr, u = Math.min(1, t / 0.11);
        bp.set('bp', 7000 * Math.pow(0.12, u), 1.2);
        o[i] = bp.run(nz()) * env(t, 0.003, 18) * 0.9 + hp.run(nz()) * env(t, 0.0005, 200) * 0.7 + thump(t) * env(t, 0.002, 30) * 0.6;
      }
    }),
    // Muse Dash: a punchy hit - a kick, a snap and a bright blip
    HitMuse: hit(0.16, 41, 0.85, (o, sr, nz) => {
      const hp = biquad(sr).set('hp', 2200), kick = glide(sr, 220, 55, 0.025);
      for (let i = 0; i < o.length; i++) {
        const t = i / sr, sq = Math.sin(TAU * 880 * t) > 0 ? 1 : -1;
        o[i] = kick(t) * env(t, 0.001, 24) * 0.8 + hp.run(nz()) * env(t, 0.0005, 90) * 0.6 + sq * env(t, 0.0005, 110) * 0.18;
      }
    }),
    // Taiko: DON (the drum face) and KA (the rim)
    TaikoDon: hit(0.34, 43, 0.9, (o, sr, nz) => {
      const lp = biquad(sr).set('lp', 500), body = glide(sr, 175, 118, 0.03);
      for (let i = 0; i < o.length; i++) { const t = i / sr, b = body(t); o[i] = b * env(t, 0.002, 12) * 0.9 + b * b * b * env(t, 0.002, 30) * 0.2 + lp.run(nz()) * env(t, 0.0005, 70) * 0.5; }
    }),
    TaikoKa: hit(0.09, 47, 0.8, (o, sr, nz) => {
      const bp = biquad(sr).set('bp', 2400, 4);
      for (let i = 0; i < o.length; i++) {
        const t = i / sr, tri = (2 / Math.PI) * Math.asin(Math.sin(TAU * 1650 * t));
        o[i] = bp.run(nz()) * env(t, 0.0005, 70) * 1.4 + tri * env(t, 0.0005, 80) * 0.35 + Math.sin(TAU * 820 * t) * env(t, 0.0005, 60) * 0.3;
      }
    }),
  });
  function swell(sr, len, seed) {
    const o = buf(sr, len), nz = rng(seed), hp = biquad(sr).set('hp', 2600), bp = biquad(sr);
    for (let i = 0; i < o.length; i++) {
      const u = i / o.length;
      bp.set('bp', 3000 + 6000 * u, 0.9);
      const x = nz();
      o[i] = (hp.run(x) * 0.7 + bp.run(x) * 0.8) * Math.pow(u, 3.2);
    }
    return finish(o, sr, 0.75);
  }

  const cache = {};
  const API = {
    names: Object.keys(SOUNDS),
    has: (name) => Object.prototype.hasOwnProperty.call(SOUNDS, name),
    len: (name) => LEN[name] || 0,
    // mono Float32Array at sample rate sr
    make(name, sr) { const k = name + '@' + sr; return cache[k] || (cache[k] = SOUNDS[name](sr)); },
  };
  if (typeof module === 'object' && module.exports) module.exports = API;
  else root.MV_SYNTH = API;
})(typeof window !== 'undefined' ? window : globalThis);
