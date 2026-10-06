// Deploy only the runtime, never recordings, source reference assets, or tools.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist', 'site');
if (path.resolve(out) !== path.resolve(root, 'dist/site') || path.dirname(out) !== path.join(root, 'dist')) throw new Error('Unsafe output path');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'src'), { recursive: true });
const files = ['index.html', 'music.mp3', 'favicon.svg', '_headers', '_redirects', ...fs.readdirSync(path.join(root, 'src')).filter(f => /\.(js|css)$/.test(f)).map(f => `src/${f}`)];
// Normalize text so Windows previews and Linux CI produce the same content ID.
const source = Object.fromEntries(files.map(f => {
  const raw = fs.readFileSync(path.join(root, f));
  return [f, f === 'music.mp3' ? raw : Buffer.from(raw.toString('utf8').replace(/\r\n/g, '\n'))];
}));
const hashes = Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(source[f]).digest('hex')]));
const version = crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex').slice(0, 12);
for (const file of files) {
  let data = source[file];
  if (file.endsWith('.html')) data = Buffer.from(data.toString().replace(/(src|href)="(src\/[^"?]+\.(?:js|css))"/g, (_, attr, url) => `${attr}="${url}?v=${version}"`));
  if (data.length > 24 * 1024 * 1024) throw new Error(`Asset too large: ${file}`);
  fs.writeFileSync(path.join(out, file), data);
}
let commit = 'local';
try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch (_) {}
fs.writeFileSync(path.join(out, 'version.json'), JSON.stringify({ version, commit, builtAt: new Date().toISOString(), files: hashes }, null, 2));
console.log(`Built ${files.length} runtime files into dist/site (version ${version}, commit ${commit}).`);
