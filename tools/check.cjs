// Validate choreography: node tools/check.cjs [t0] [t1] [--cut=tiktok]
//  * no white attack ever touches the soul (blue: only while still, orange: only while moving)
//  * perfect route: FIGHT is never selected, HP stays 20 / 20
//  * first person: no obstacle reaches the camera
//  * every sound effect exists, every character drawn has a glyph
const { chromium, pageUrl, SWIFT } = require('./pw.cjs');
(async () => {
  const argv = process.argv.slice(2);
  const [t0 = '0', t1 = ''] = argv.filter((a) => !a.startsWith('--'));
  const cut = (argv.find((a) => a.startsWith('--cut=')) || '').slice(6);
  const browser = await chromium.launch({ args: SWIFT });
  const page = await browser.newPage({ viewport: { width: 320, height: 180 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[console]', m.text()); });
  await page.goto(pageUrl(cut === 'tiktok' ? '?render=1&w=180&h=320&cut=tiktok' : '?render=1&w=320&h=180' + (cut ? `&cut=${cut}` : '')));
  await page.waitForFunction(() => window.MV && window.MV.ready, null, { timeout: 60000 });
  const hits = await page.evaluate(([a, b]) => window.MV.checkHits(+a, b ? +b : window.MV.T.end), [t0, t1]);
  console.log(hits.length ? `soul: ${hits.length} collisions` : 'OK: no collisions');
  for (const h of hits.slice(0, 40)) console.log(JSON.stringify(h));
  const pac = await page.evaluate(() => window.MV.checkPacifist());
  console.log(pac.length ? `PERFECT ROUTE BROKEN: ${pac.length} samples` : 'OK: perfect route (FIGHT never selected, HP 20 / 20)');
  for (const h of pac.slice(0, 20)) console.log(JSON.stringify(h));
  const pov = await page.evaluate(() => (window.MV.checkPov ? window.MV.checkPov() : []));
  console.log(pov.length ? `first person: ${pov.length} samples too close` : 'OK: first person clear');
  for (const h of pov.slice(0, 20)) console.log(JSON.stringify(h));
  // every sound effect scheduled must exist (a sample in assets.js or a synth recipe)
  const snd = await page.evaluate(() => {
    const MV = window.MV, have = new Set([...Object.keys(window.MV_ASSETS.sfx), ...(window.MV_SYNTH ? window.MV_SYNTH.names : [])]);
    return MV.TL.sfx.filter((e) => !have.has(e.name)).map((e) => ({ name: e.name, bar: +MV.T.barOf(e.t).toFixed(2) }));
  });
  console.log(snd.length ? `sound: ${snd.length} unknown effects` : 'OK: every sound effect exists');
  for (const h of snd.slice(0, 20)) console.log(JSON.stringify(h));
  // every character the source draws has a glyph (make_font.py / fill_glyphs.py), never '?'
  const fs = require('fs'), path = require('path'), dir = path.resolve(__dirname, '../src');
  const have = await page.evaluate(() => Object.keys(window.MV_GLYPHS));
  const used = new Set();
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.js') && !/^(glyphs|assets|analysis)\.js$/.test(f)) for (const ch of fs.readFileSync(path.join(dir, f), 'utf8').match(/[^\x00-\x7f]/g) || []) used.add(ch);
  const noGlyph = [...used].filter((ch) => !have.includes(ch) && !'♥★←→↑↓◀▶●'.includes(ch) && /\S/.test(ch));
  console.log(noGlyph.length ? `font: no glyph for ${noGlyph.join('')} (run tools/make_font.py or tools/fill_glyphs.py)` : 'OK: every character has a glyph');
  await browser.close();
})();
