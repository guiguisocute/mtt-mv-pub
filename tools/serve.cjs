// Dependency-free local preview: node tools/serve.cjs [port] [directory]
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', process.argv[3] || '.');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.mp3':'audio/mpeg', '.json':'application/json', '.svg':'image/svg+xml' };
http.createServer((req, res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); } catch (_) { res.writeHead(400).end(); return; }
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (file === root) file = path.join(root, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  const size = fs.statSync(file).size, headers = { 'Content-Type':types[path.extname(file)]||'application/octet-stream', 'Cache-Control':'no-store', 'Accept-Ranges':'bytes' };
  const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const from = Number(range[1]), to = range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
    if (from >= size || to < from) { res.writeHead(416, { 'Content-Range':`bytes */${size}` }).end(); return; }
    res.writeHead(206, { ...headers, 'Content-Range':`bytes ${from}-${to}/${size}`, 'Content-Length':to-from+1 });
    if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start:from,end:to}).pipe(res);
  } else { res.writeHead(200, { ...headers, 'Content-Length':size });if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res); }
}).listen(Number(process.argv[2]) || 4173, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${Number(process.argv[2]) || 4173}`));
