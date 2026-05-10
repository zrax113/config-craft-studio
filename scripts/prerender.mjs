// Prerender the SSR shell into dist/client/index.html so static hosts
// (Vercel, Netlify, GitHub Pages, …) can serve the SPA via rewrites.
//
// We import the built worker bundle directly and call its fetch() handler
// with a synthetic Request("/"). The output is plain HTML that hydrates
// into the full TanStack Router client on first paint.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = process.cwd();
const serverEntry = path.join(root, "dist/server/index.js");
const outFile = path.join(root, "dist/client/index.html");

if (!fs.existsSync(serverEntry)) {
  console.error("[prerender] dist/server/index.js missing — did `vite build` run?");
  process.exit(1);
}

const mod = await import(url.pathToFileURL(serverEntry).href);
const handler = mod.default ?? mod;
if (!handler || typeof handler.fetch !== "function") {
  console.error("[prerender] Worker bundle has no default.fetch export.");
  process.exit(1);
}

async function render(pathname) {
  const res = await handler.fetch(
    new Request(`http://localhost${pathname}`, { method: "GET" }),
    {},
    { waitUntil() {}, passThroughOnException() {} },
  );
  if (res.status >= 400) {
    throw new Error(`Prerender ${pathname} -> HTTP ${res.status}`);
  }
  return await res.text();
}

const html = await render("/");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html);
console.log(`[prerender] wrote ${outFile} (${html.length} bytes)`);

// Also generate a 404 page so static hosts that look for /404.html find one.
try {
  const notFound = await render("/__lovable_404__");
  fs.writeFileSync(path.join(root, "dist/client/404.html"), notFound);
} catch {
  fs.writeFileSync(path.join(root, "dist/client/404.html"), html);
}
