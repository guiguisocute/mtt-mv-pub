// Render selected frames to images for review.
// Usage: node tools/frames.cjs <outDir> <t1> <t2> ... [--w=960 --h=540] [--bars] (times as bar numbers)
const { chromium, pageUrl, SWIFT } = require('./pw.cjs');
const path = require('path');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const opts = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
  const [out, ...ts] = args.filter((a) => !a.startsWith('--'));
  fs.mkdirSync(out, { recursive: true });
  const w = opts.w || 960, h = opts.h || 540;
  const browser = await chromium.launch({ args: SWIFT });
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/GPU stall/.test(m.text())) console.log('[page]', m.text()); });
  await page.goto(pageUrl(`?render=1&w=${w}&h=${h}`));
  await page.waitForFunction(() => window.MV && window.MV.ready, null, { timeout: 60000 });
  for (const s of ts) {
    const t = opts.bars ? await page.evaluate((b) => window.MV.T.at(+b), s) : +s;
    const url = await page.evaluate((t) => window.MV.exportFrame(+t, 'image/png'), t);
    fs.writeFileSync(path.join(out, `f_${(+s).toFixed(3)}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await browser.close();
})();
