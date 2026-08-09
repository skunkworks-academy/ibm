import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'build');
const prefix = '/db2/cla96';
const port = Number(process.env.PORT || 4173);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function resolveRequest(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  if (!cleanPath.startsWith(prefix)) return null;
  let relative = cleanPath.slice(prefix.length) || '/';
  if (relative.endsWith('/')) relative += 'index.html';

  const candidates = [
    path.join(root, relative),
    path.join(root, `${relative}.html`),
    path.join(root, relative, 'index.html'),
  ];

  for (const candidate of candidates) {
    const normalized = path.normalize(candidate);
    if (!normalized.startsWith(root)) continue;
    if (fs.existsSync(normalized) && fs.statSync(normalized).isFile()) return normalized;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolveRequest(req.url || '/');
  if (!file) {
    res.writeHead(404, {'content-type': 'text/plain; charset=utf-8'});
    res.end('Not found');
    return;
  }

  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'content-type': mime[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`CLA96G preview ready on http://127.0.0.1:${port}${prefix}/`);
});
