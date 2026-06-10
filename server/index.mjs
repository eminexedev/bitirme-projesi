import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = join(rootDir, 'dist');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  res.statusCode = 200;
  res.setHeader('Content-Type', mimeTypes[extname(filePath)] ?? 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const filePath = join(distDir, requestedPath === '/' ? 'index.html' : requestedPath);
  const safePath = filePath.startsWith(distDir) && existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : join(distDir, 'index.html');

  sendFile(res, safePath);
}).listen(port, () => {
  console.log(`SecureKey server running at http://127.0.0.1:${port}`);
});
