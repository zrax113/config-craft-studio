// Prerender the SSR shell into dist/client/index.html so static hosts
// (Vercel, Netlify, Cloudflare Pages, GitHub Pages, …) can serve the SPA
// via SPA rewrites. Also drops in host-agnostic fallback files:
//   - _redirects         (Netlify, Cloudflare Pages, Render)
//   - 404.html           (GitHub Pages, generic)
//   - vercel-output      (handled separately by vercel.json)
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = process.cwd();
const serverEntry = path.join(root, "dist/server/index.js");
const outDir = path.join(root, "dist/client");
const indexFile = path.join(outDir, "index.html");

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
  if (res.status >= 400 && res.status !== 404) {
    throw new Error(`Prerender ${pathname} -> HTTP ${res.status}`);
  }
  return await res.text();
}

fs.mkdirSync(outDir, { recursive: true });

const html = await render("/");
fs.writeFileSync(indexFile, html);
console.log(`[prerender] wrote ${indexFile} (${html.length} bytes)`);

// 404 fallback for GitHub Pages and any host that serves /404.html on misses.
try {
  const notFound = await render("/__forgeyaml_404__");
  fs.writeFileSync(path.join(outDir, "404.html"), notFound);
} catch {
  fs.writeFileSync(path.join(outDir, "404.html"), html);
}

// Netlify / Cloudflare Pages / Render — single-line SPA rewrite.
fs.writeFileSync(
  path.join(outDir, "_redirects"),
  "/*    /index.html   200\n",
);

// Netlify config (alternative to vercel.json) so users can also deploy there
// without touching the project. Written next to the build output so Netlify's
// "Publish directory = dist/client" picks it up automatically.
fs.writeFileSync(
  path.join(outDir, "_headers"),
  [
    "/assets/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
    "/configs/*",
    "  Cache-Control: public, max-age=300, must-revalidate",
    "",
  ].join("\n"),
);

console.log("[prerender] wrote 404.html + _redirects + _headers");
