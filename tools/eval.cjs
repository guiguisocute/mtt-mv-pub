// Evaluate a JS expression in the loaded player (render mode) and print the result.
// Usage: node tools/eval.cjs "MV.TL.enemy.at(MV.T.at(1))"
const { chromium, pageUrl, SWIFT } = require('./pw.cjs');
(async () => {
  const browser = await chromium.launch({ args: SWIFT });
  const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => console.log('[console]', m.text()));
  await page.goto(pageUrl('?render=1&w=320&h=180'));
  await page.waitForFunction(() => window.MV && window.MV.ready, null, { timeout: 60000 });
  for (const expr of process.argv.slice(2)) {
    const r = await page.evaluate((e) => { const MV = window.MV; try { return JSON.stringify(eval(e), null, 0); } catch (err) { return 'ERR ' + err.message; } }, expr);
    console.log(expr, '=>', r);
  }
  await browser.close();
})();
