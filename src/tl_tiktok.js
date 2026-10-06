// Vertical cut (?cut=tiktok): the whole film, reframed to 9:16. Nothing is cut and the sound is
// the same; the 16:9-authored camera is widened by TL.pcam (k), and H.framePortrait opens the
// view further wherever a focus rect (a line of narration, a speech bubble) or the soul would
// fall outside it. Extra portrait framing for shots automatic framing does not cover lives here.
// Screen overlays lay themselves out for portrait where they are defined: the ratings board /
// LIVE / COMBO in scene.js, the essay, FEVER, the Taiko lane, the reels.
MV.sections.push(function () {
  const MV = window.MV, TL = MV.TL, H = MV.H;
  if (!MV.PORTRAIT) return;
  const at = H.at;
  const frame = (t0, t1, v, ease = 'inOut') => TL.pcam.to(t0, t1, v, ease);

  // ---------------------------------------------------------------- bars 48-54: the runner
  // A side-scroller in a tall frame: a little closer, the judgement point just inside the left
  // edge so every prop has the whole width to fly in, the lanes on the middle of the screen
  const JX = 300;
  for (let b = 48; b < 54; b++) {
    const c = TL.cam.at(at(b, 2)), hw = (MV.VH * 1080) / 1920 / (c.zoom * 0.66) / 2;
    frame(b === 48 ? at(48) - 0.01 : at(b), b === 48 ? at(48) : at(b) + 0.3, { k: 0.66, dx: JX - 50 + hw - c.x, fy: 0.05 }, b === 48 ? 'lin' : 'inOut');
  }
  frame(at(54, 2), at(55), { k: 0.6, dx: 0, fy: 0 }, 'in2'); // (with the push onto his overheating core)

  // ---------------------------------------------------------------- bars 64-70: the Taiko lane
  // runs across the top under the ratings board: a touch wider and lower, so his head clears it
  frame(at(64) - 0.01, at(64), { k: 0.56, fy: -0.022 }, 'lin');
  frame(at(71), at(71, 1), { k: 0.6, fy: 0 });
});
