#!/usr/bin/env node
// ============================================================================
// Illustration lab CLI + contact sheet. All logic lives in ./lib (see
// docs/specs/01_active/illustration-system/studio-design.md §4).
//
// Usage:
//   node images/scripts/illustrate.mjs                     # everything
//   node images/scripts/illustrate.mjs --styles duotone,riso
//   node images/scripts/illustrate.mjs --sizes thumb,square
//   node images/scripts/illustrate.mjs --match nuxt        # filter by slug
//   node images/scripts/illustrate.mjs --limit 3
//   node images/scripts/illustrate.mjs --sheet             # + contact sheet
//   node images/scripts/illustrate.mjs --out images/out/review
//   node images/scripts/illustrate.mjs --force             # ignore manifest
// ============================================================================
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SETTINGS } from "./settings.mjs";
import {
  color as paletteColor,
  lighten as paletteLighten,
  contrastRatio as paletteContrast,
} from "./lib/util.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import { loadCrops, loadIllustration } from "./lib/store.mjs";
import { resolveSettings } from "./lib/resolve.mjs";
import {
  applicableStyles,
  renderEntry,
  openManifest,
  flushManifest,
} from "./lib/render.mjs";
import { accentOf } from "./lib/styles.mjs";

const color = (k) => paletteColor(SETTINGS.palette, k);

// ============================================================================
// Contact sheet — one HTML grid, style × size × slug
// ============================================================================
export function writeSheet(out) {
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
  openManifest(out);
  const force = process.argv.includes("--force");

  const paper = paletteLighten(
    SETTINGS.palette,
    "paper",
    SETTINGS.duotone.paperLift,
  );
  console.log(
    `duotone ink→paper ${color("ink")}→${paper} ` +
      `(lift ${SETTINGS.duotone.paperLift}) — contrast ${paletteContrast(SETTINGS.palette, "ink", paper).toFixed(2)}:1\n`,
  );

  const crops = loadCrops();
  const illustration = loadIllustration();
  let entries = scanContent().filter((e) => e.slug.includes(match));
  entries = entries.slice(0, limit);

  let rendered = 0;
  let skipped = 0;
  for (const entry of entries) {
    const { effective: eff } = resolveSettings(
      entry.slug,
      illustration,
      SETTINGS,
    );
    const applicable = applicableStyles(entry, styles, eff);
    for (const sizeName of sizeNames) {
      if (eff.settings.sizes[sizeName] === undefined) {
        console.error(`unknown size: ${sizeName}`);
        continue;
      }
      for (const styleName of applicable) {
        try {
          const did = renderEntry(entry, styleName, sizeName, {
            out,
            crops,
            illustration,
            force,
          });
          if (did) rendered++;
          else skipped++;
        } catch (err) {
          console.error(
            `${entry.slug} ${styleName} ${sizeName} FAILED: ${err.message}`,
          );
        }
      }
    }
    console.log(
      `${entry.slug} → ${applicable.join(",")} × ${sizeNames.join(",")}${entry.img ? "" : ` (accent: ${accentOf(eff, entry.slug)})`}`,
    );
  }

  if (process.argv.includes("--sheet")) writeSheet(out);
  flushManifest();
  console.log(
    `\n${entries.length} entries → ${out} (${rendered} rendered, ${skipped} skipped)`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
