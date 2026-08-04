/** Production server: serves dist/ plus the API. Plain Node 24+, no deps. */
import {createReadStream, statSync} from "node:fs";
import http from "node:http";
import path from "node:path";

import {handleApi} from "./api.ts";

const PORT = Number(process.env.PORT ?? 3000);
const DIST = path.resolve(import.meta.dirname, "..", "dist");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  if (handleApi(req, res)) {
    return;
  }

  const pathname = new URL(req.url ?? "/", "http://local").pathname;
  const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/u, "");
  let file = path.join(DIST, safe);
  const stats = statSync(file, {throwIfNoEntry: false});
  if (!stats || stats.isDirectory()) {
    file = path.join(DIST, "index.html");
  }

  const ext = path.extname(file);
  res.writeHead(200, {
    "content-type": MIME[ext] ?? "application/octet-stream",
    // bundle filenames are content-hashed
    "cache-control":
      ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`tosti-wachtrij running at http://localhost:${PORT}`);
});
