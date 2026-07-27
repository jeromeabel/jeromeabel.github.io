#!/usr/bin/env node
// ============================================================================
// Illustration lab — one script, all styles, all sizes, centralized settings.
//
// Scans content collections for cover images (frontmatter `img:` in index.md),
// crops each cover per output size (focal point + zoom from images/crops.json,
// set via crop-ui.mjs), applies every enabled style via ImageMagick, and
// generates seeded mesh backgrounds for entries without a cover.
//
// Usage:
//   node images/scripts/illustrate.mjs                     # everything
//   node images/scripts/illustrate.mjs --styles duotone,riso
//   node images/scripts/illustrate.mjs --sizes thumb,square
//   node images/scripts/illustrate.mjs --match nuxt        # filter by slug
//   node images/scripts/illustrate.mjs --limit 3
//   node images/scripts/illustrate.mjs --sheet             # + contact sheet
//   node images/scripts/illustrate.mjs --out images/out/review
// ============================================================================

import { mkdirSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SETTINGS } from "./settings.mjs";
import {
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
  contrastRatio as paletteContrast,
} from "./lib/util.mjs";
import { magick, imageSize } from "./lib/magick.mjs";
import { cropBox, resolveCrop } from "./lib/geometry.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import { loadCrops } from "./lib/store.mjs";
import { STYLES } from "./lib/styles.mjs";

// ============================================================================
// Helpers
// ============================================================================

// Bound to the global palette so existing call sites read exactly as before.
const color = (k) => paletteColor(SETTINGS.palette, k);
const accentFor = (slug) => paletteAccent(SETTINGS.palette, slug);
const lighten = (c, amount) => paletteLighten(SETTINGS.palette, c, amount);
const contrastRatio = (a, b) => paletteContrast(SETTINGS.palette, a, b);

// Compat re-exports — crop-ui.mjs consumes these until the studio absorbs it
// (studio-plan-3). Remove them there.
export { SETTINGS } from "./settings.mjs";
export { ROOT, scanContent } from "./lib/content.mjs";
export { loadCrops } from "./lib/store.mjs";
export { cropBox, resolveCrop } from "./lib/geometry.mjs";
export { imageSize } from "./lib/magick.mjs";

// ============================================================================
// Contact sheet — one HTML grid, style × size × slug
// ============================================================================
function writeSheet(out) {
  const files = readdirSync(out)
    .filter((f) => f.endsWith(".png"))
    .sort();
  const byStyle = {};
  for (const f of files) {
    const m = f.match(/^(.+)_([a-z-]+(?:-[a-z]+)?)_([a-z]+)\.png$/);
    if (!m) continue;
    const [, slug, style, size] = m;
    ((byStyle[style] ??= {})[slug] ??= {})[size] = f;
  }
  const sizeNames = Object.keys(SETTINGS.sizes);
  let html = `<!doctype html><meta charset="utf-8"><title>Contact sheet</title>
<style>
body{background:#f5ffe1;color:#1e1e1e;font:14px/1.5 ui-monospace,monospace;padding:2rem}
h2{margin:3rem 0 1rem;border-bottom:2px solid #1e1e1e;padding-bottom:.3rem}
table{border-collapse:collapse}td,th{padding:.4rem;text-align:left;vertical-align:top}
th{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:#5b5b5b}
img{display:block;border:1px solid #d1ddbb;max-width:340px;height:auto}
.slug{font-size:.75rem;color:#5b5b5b;max-width:12ch;word-break:break-all}
@media(prefers-color-scheme:dark){body{background:#1e1e1e;color:#ececec}th,.slug{color:#9b9b9b}img{border-color:#4c4c4c}}
</style><h1>Contact sheet</h1><p>${new Date().toISOString().slice(0, 16)} — ${files.length} images</p>`;
  for (const [style, slugs] of Object.entries(byStyle)) {
    html += `<h2>${style}</h2><table><tr><th></th>${sizeNames.map((s) => `<th>${s}</th>`).join("")}</tr>`;
    for (const [slug, sizes] of Object.entries(slugs)) {
      html += `<tr><td class="slug">${slug}</td>${sizeNames
        .map(
          (s) =>
            `<td>${sizes[s] ? `<img loading="lazy" src="${sizes[s]}">` : ""}</td>`,
        )
        .join("")}</tr>`;
    }
    html += "</table>";
  }
  writeFileSync(join(out, "index.html"), html);
  console.log(`sheet → ${join(out, "index.html")}`);
}

// ============================================================================
// Main
// ============================================================================
function main() {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 ? process.argv[i + 1] : fallback;
  };

  const styles = arg("styles", SETTINGS.styles.join(",")).split(",");
  const sizeNames = arg("sizes", Object.keys(SETTINGS.sizes).join(",")).split(
    ",",
  );
  const match = arg("match", "");
  const limit = Number(arg("limit", Infinity));
  const out = resolve(ROOT, arg("out", SETTINGS.out));
  mkdirSync(out, { recursive: true });

  // Contrast readout for the duotone paper end — tune `paperLift` against it.
  const paper = lighten("paper", SETTINGS.duotone.paperLift);
  console.log(
    `duotone ink→paper ${color("ink")}→${paper} ` +
      `(lift ${SETTINGS.duotone.paperLift}) — contrast ${contrastRatio("ink", paper).toFixed(2)}:1\n`,
  );

  const crops = loadCrops();
  let entries = scanContent().filter((e) => e.slug.includes(match));
  entries = entries.slice(0, limit);

  for (const entry of entries) {
    const applicable = entry.img
      ? styles.filter((st) => st !== "mesh")
      : styles.filter((st) => st === "mesh");
    const src = entry.img ? imageSize(entry.img) : null;

    for (const sizeName of sizeNames) {
      const dims = SETTINGS.sizes[sizeName];
      if (dims === undefined) {
        console.error(`unknown size: ${sizeName}`);
        continue;
      }

      // resolve per-size input + final dimensions
      let input = entry.img;
      let w, h;
      let tmp = null;
      if (entry.img && dims) {
        const box = cropBox(
          src.w,
          src.h,
          dims.w,
          dims.h,
          resolveCrop(crops[entry.slug], sizeName),
        );
        tmp = `${out}/.crop_${entry.slug}_${sizeName}.png`;
        magick([
          entry.img,
          "-crop",
          `${box.w}x${box.h}+${box.x}+${box.y}`,
          "+repage",
          "-resize",
          `${dims.w}x${dims.h}!`,
          tmp,
        ]);
        input = tmp;
        ({ w, h } = dims);
      } else if (entry.img) {
        ({ w, h } = src);
      } else {
        ({ w, h } = dims ?? SETTINGS.mesh.fallback);
      }

      for (const styleName of applicable) {
        const fn = STYLES[styleName];
        if (!fn) {
          console.error(`unknown style: ${styleName}`);
          continue;
        }
        try {
          fn(input, out, { slug: entry.slug, size: sizeName, w, h });
        } catch (err) {
          console.error(
            `${entry.slug} ${styleName} ${sizeName} FAILED: ${err.message}`,
          );
        }
      }
      if (tmp) rmSync(tmp, { force: true });
    }
    console.log(
      `${entry.slug} → ${applicable.join(",")} × ${sizeNames.join(",")}${entry.img ? "" : ` (accent: ${accentFor(entry.slug)})`}`,
    );
  }

  if (process.argv.includes("--sheet")) writeSheet(out);
  console.log(`\n${entries.length} entries → ${out}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
