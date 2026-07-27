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
  hash,
  rng,
  lerp,
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
  contrastRatio as paletteContrast,
} from "./lib/util.mjs";
import { magick, potrace, imageSize, grainArgs } from "./lib/magick.mjs";
import { cropBox, resolveCrop } from "./lib/geometry.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import { loadCrops } from "./lib/store.mjs";

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
// Styles — fn(src, out, ctx) with ctx = { slug, size, w, h }
// src is already cropped+resized to w×h (except size "cover" = original).
// ============================================================================
// Shared pipeline up to the dithered grayscale — `+level-colors <dark>,<light>`
// and an output path complete it. Dithers at `pixelate`% then point-scales
// back, so the dots stay chunky instead of hairline.
function ditherArgs(src, w, h) {
  const s = SETTINGS.dither;
  const op =
    s.method === "FloydSteinberg"
      ? ["-dither", "FloydSteinberg", "-monochrome"]
      : ["-ordered-dither", s.method];
  return [
    src,
    "-colorspace",
    "Gray",
    "-blur",
    s.preBlur,
    "-level",
    s.level,
    "-sigmoidal-contrast",
    s.sigmoidal,
    "-resize",
    `${s.pixelate}%`,
    ...op,
    "-filter",
    "Point",
    "-resize",
    `${w}x${h}!`,
  ];
}

// The seeded fluid-gradient background, as an SVG string. Used both by the
// `mesh` style and as the backdrop of every `*-mesh` composite.
function meshSvg(slug, theme, w, h) {
  const s = SETTINGS.mesh;
  const r = rng(`${slug}:${theme}`);
  const bg = theme === "light" ? color("paper") : color("ink");
  const tint = theme === "light" ? color("ink") : color("paper");
  const accent = color(accentFor(slug));
  const vb = s.viewBox;

  const shapes = [];
  for (let i = 0; i < s.blobs; i++) {
    const isAccent = i === s.blobs - 1;
    const fill = isAccent ? accent : tint;
    const op = lerp(r, isAccent ? s.accentOpacity : s.tintOpacity).toFixed(2);
    const cx = Math.round(lerp(r, [vb * 0.1, vb * 0.9]));
    const cy = Math.round(lerp(r, [vb * 0.1, vb * 0.9]));
    const rx = Math.round(lerp(r, s.radius));
    const ry = Math.round(lerp(r, s.radius));
    const rot = Math.round(lerp(r, [-45, 45]));
    shapes.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vb} ${vb}" preserveAspectRatio="xMidYMid slice">
<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s.blur}"/></filter>
<rect width="${vb}" height="${vb}" fill="${bg}"/>
<g filter="url(#b)">${shapes.join("")}</g>
</svg>`;
}

// Rasterize the mesh backdrop (with grain) to a temp PNG; caller removes it.
function meshBackdrop(out, slug, w, h) {
  const s = SETTINGS.mesh;
  const svg = `${out}/.bg_${slug}.svg`;
  const png = `${out}/.bg_${slug}.png`;
  writeFileSync(svg, meshSvg(slug, SETTINGS.onMesh.theme, w, h));
  magick([svg, ...grainArgs(w, h, s.grain, `${slug}:bg:${w}x${h}`), png]);
  rmSync(svg, { force: true });
  return png;
}

// Multiply a prepared subject over the mesh backdrop.
function compositeOnMesh(subjectArgs, out, { slug, size, w, h }, name) {
  const o = SETTINGS.onMesh;
  const bg = meshBackdrop(out, slug, w, h);
  const subject = `${out}/.subj_${slug}.png`;
  magick([
    ...subjectArgs,
    "-alpha",
    "set",
    "-channel",
    "A",
    "-evaluate",
    "set",
    `${o.subjectOpacity * 100}%`,
    "+channel",
    subject,
  ]);
  magick([
    bg,
    subject,
    "-compose",
    "Multiply",
    "-composite",
    `${out}/${slug}_${name}_${size}.png`,
  ]);
  rmSync(bg, { force: true });
  rmSync(subject, { force: true });
}

const STYLES = {
  duotone(src, out, { slug, size }) {
    const s = SETTINGS.duotone;
    const paper = lighten("paper", s.paperLift);
    magick([
      src,
      "-colorspace",
      "Gray",
      "-level",
      s.level,
      "-sigmoidal-contrast",
      s.sigmoidal,
      "+level-colors",
      `${color("ink")},${paper}`,
      `${out}/${slug}_duotone_${size}.png`,
    ]);
    const accent = accentFor(slug);
    magick([
      src,
      "-colorspace",
      "Gray",
      "-level",
      s.level,
      "-sigmoidal-contrast",
      s.sigmoidal,
      "+level-colors",
      `${color("ink")},${color(accent)}`,
      `${out}/${slug}_duotone-${accent}_${size}.png`,
    ]);
  },

  riso(src, out, { slug, size, w, h }) {
    const s = SETTINGS.riso;
    magick([
      src,
      "-colorspace",
      "Gray",
      "-level",
      s.level,
      "-posterize",
      String(s.posterizeSteps),
      "+level-colors",
      `${color("ink")},${color("paper")}`,
      ...grainArgs(w, h, s.grain, `${slug}:riso:${w}x${h}`),
      `${out}/${slug}_riso_${size}.png`,
    ]);
  },

  dither(src, out, { slug, size, w, h }) {
    const [dark, light] = SETTINGS.dither.colors.map(color);
    magick([
      ...ditherArgs(src, w, h),
      "+level-colors",
      `${dark},${light}`,
      `${out}/${slug}_dither_${size}.png`,
    ]);
    // dither + duotone accent: same dots, accent as the light end.
    const accent = accentFor(slug);
    magick([
      ...ditherArgs(src, w, h),
      "+level-colors",
      `${dark},${color(accent)}`,
      `${out}/${slug}_dither-${accent}_${size}.png`,
    ]);
  },

  vector(src, out, { slug, size, w, h }) {
    const s = SETTINGS.vector;
    const svg = `${out}/.vec_${slug}_${size}.svg`;
    const pgm = `${out}/.vec_${slug}_${size}.pgm`;
    magick([src, "-colorspace", "Gray", "-normalize", pgm]);
    potrace([
      pgm,
      "--svg",
      "-k",
      String(s.threshold),
      "-t",
      String(s.turdSize),
      "-a",
      String(s.alphaMax),
      "-o",
      svg,
    ]);
    magick([
      "-background",
      color("paper"),
      svg,
      "-fill",
      color("ink"),
      "-opaque",
      "black",
      "-resize",
      `${w}x${h}!`,
      `${out}/${slug}_vector_${size}.png`,
    ]);
    rmSync(pgm, { force: true });
    rmSync(svg, { force: true });
  },

  framed(src, out, { slug, size, w, h }) {
    const s = SETTINGS.framed;
    const inner = `${Math.round(w * s.inset)}x${Math.round(h * s.inset)}`;
    magick([
      src,
      "-resize",
      `${inner}>`,
      "-background",
      "none",
      "(",
      "+clone",
      "-background",
      "black",
      "-shadow",
      s.shadow,
      ")",
      "+swap",
      "-background",
      s.frameBg,
      "-layers",
      "merge",
      "-gravity",
      "center",
      "-extent",
      `${w}x${h}`,
      `${out}/${slug}_framed_${size}.png`,
    ]);
  },

  mesh(_src, out, { slug, size, w, h }) {
    const s = SETTINGS.mesh;
    for (const theme of s.themes) {
      const tmp = `${out}/.mesh_${slug}_${theme}.svg`;
      writeFileSync(tmp, meshSvg(slug, theme, w, h));
      magick([
        tmp,
        ...grainArgs(w, h, s.grain, `${slug}:mesh-${theme}:${w}x${h}`),
        `${out}/${slug}_mesh-${theme}_${size}.png`,
      ]);
      rmSync(tmp);
    }
  },

  // Contrasty grayscale photo multiplied over the fluid-gradient background.
  "photo-mesh"(src, out, ctx) {
    const o = SETTINGS.onMesh;
    compositeOnMesh(
      [
        src,
        "-colorspace",
        "Gray",
        "-level",
        o.level,
        "-sigmoidal-contrast",
        o.sigmoidal,
      ],
      out,
      ctx,
      "photo-mesh",
    );
  },

  // Dithered subject over the fluid-gradient background.
  "dither-mesh"(src, out, ctx) {
    const [dark, light] = SETTINGS.dither.colors.map(color);
    compositeOnMesh(
      [...ditherArgs(src, ctx.w, ctx.h), "+level-colors", `${dark},${light}`],
      out,
      ctx,
      "dither-mesh",
    );
  },

  // Traced hand drawing over the fluid-gradient background.
  "vector-mesh"(src, out, ctx) {
    const s = SETTINGS.vector;
    const { slug, size, w, h } = ctx;
    const svg = `${out}/.vm_${slug}_${size}.svg`;
    const pgm = `${out}/.vm_${slug}_${size}.pgm`;
    magick([src, "-colorspace", "Gray", "-normalize", pgm]);
    potrace([
      pgm,
      "--svg",
      "-k",
      String(s.threshold),
      "-t",
      String(s.turdSize),
      "-a",
      String(s.alphaMax),
      "-o",
      svg,
    ]);
    compositeOnMesh(
      [
        "-background",
        "white",
        svg,
        "-fill",
        color("ink"),
        "-opaque",
        "black",
        "-resize",
        `${w}x${h}!`,
      ],
      out,
      ctx,
      "vector-mesh",
    );
    rmSync(pgm, { force: true });
    rmSync(svg, { force: true });
  },
};

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
