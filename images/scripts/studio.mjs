#!/usr/bin/env node
// ============================================================================
// Illustration Studio — local tuning UI (studio-design.md). Serves the crop +
// effects app, renders previews via the same lib the CLI uses, and runs batch
// steps as jobs. Local-only: binds 127.0.0.1, Origin-checked POSTs (§9).
//
// Usage:
//   node images/scripts/studio.mjs            # http://127.0.0.1:4380, opens browser
//   node images/scripts/studio.mjs --port 5000 --no-open
// ============================================================================
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { execFile } from "node:child_process";
import { SETTINGS } from "./settings.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import {
  loadCrops,
  saveCrops,
  loadIllustration,
  saveIllustration,
} from "./lib/store.mjs";
import { pageHtml } from "./studio/page.mjs";

const portArg = process.argv.indexOf("--port");
const port = portArg > -1 ? Number(process.argv[portArg + 1]) : 4380;

// Malformed illustration.json must refuse to boot, not silently reset (§9).
loadIllustration();

const entries = scanContent();
const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
const scriptsDir = new URL(".", import.meta.url);

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const LIB_WHITELIST = ["util.mjs", "geometry.mjs", "mesh.mjs", "resolve.mjs"];
const STUDIO_WHITELIST = ["crop.mjs", "fx.mjs", "run.mjs"];

export function sendErr(res, code, msg) {
  res.writeHead(code, { "content-type": "text/plain; charset=utf-8" });
  res.end(msg);
}

// Local-only guard: Host must be loopback; POSTs with a foreign Origin are
// CSRF attempts — reject (§9, closes the crop-ui findings).
export function requestOk(req) {
  const host = req.headers.host ?? "";
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return false;
  if (req.method === "POST" && req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function serveModule(res, dir, name, whitelist) {
  if (!whitelist.includes(name))
    return sendErr(res, 404, `not served: ${name}`);
  let content;
  try {
    content = readFileSync(new URL(`${dir}/${name}`, scriptsDir));
  } catch {
    return sendErr(res, 404, `not found: ${dir}/${name}`);
  }
  res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
  res.end(content);
}

const server = createServer(async (req, res) => {
  if (!requestOk(req)) return sendErr(res, 403, "forbidden origin/host");
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(pageHtml());
    } else if (url.pathname.startsWith("/lib/")) {
      serveModule(res, "lib", url.pathname.slice(5), LIB_WHITELIST);
    } else if (url.pathname.startsWith("/studio/")) {
      serveModule(res, "studio", url.pathname.slice(8), STUDIO_WHITELIST);
    } else if (url.pathname === "/api/data") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          slugs: entries.map((e) => ({ slug: e.slug, hasImg: !!e.img })),
          crops: loadCrops(),
          illustration: loadIllustration(),
          settings: SETTINGS,
          sizes: SETTINGS.sizes,
          styles: SETTINGS.styles,
        }),
      );
    } else if (url.pathname.startsWith("/img/")) {
      const slug = decodeURIComponent(url.pathname.slice(5));
      const entry = bySlug[slug];
      if (!entry?.img || !existsSync(entry.img)) {
        const msg = !entry ? `unknown slug: ${slug}` : `no cover: ${slug}`;
        return sendErr(res, 404, msg);
      }
      res.writeHead(200, {
        "content-type":
          MIME[extname(entry.img).toLowerCase()] ?? "application/octet-stream",
      });
      res.end(readFileSync(entry.img));
    } else if (url.pathname === "/api/save" && req.method === "POST") {
      const { crops, illustration } = await readJson(req);
      saveCrops(crops);
      saveIllustration(illustration);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          crops: Object.keys(crops).length,
          images: Object.keys(illustration.images ?? {}).length,
        }),
      );
    } else {
      sendErr(res, 404, `not found: ${url.pathname}`);
    }
  } catch (err) {
    sendErr(res, err instanceof SyntaxError ? 400 : 500, err.message);
  }
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`studio → ${url} (${entries.length} entries)`);
  if (!process.argv.includes("--no-open"))
    execFile("xdg-open", [url], () => {});
});
