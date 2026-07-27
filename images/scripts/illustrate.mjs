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

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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

// ============================================================================
// Helpers
// ============================================================================
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// Bound to the global palette so existing call sites read exactly as before.
const color = (k) => paletteColor(SETTINGS.palette, k);
const accentFor = (slug) => paletteAccent(SETTINGS.palette, slug);
const lighten = (c, amount) => paletteLighten(SETTINGS.palette, c, amount);
const contrastRatio = (a, b) => paletteContrast(SETTINGS.palette, a, b);

function magick(args) {
  execFileSync("convert", args, { stdio: "inherit" });
}

function potrace(args) {
  execFileSync("potrace", args, { stdio: "inherit" });
}

// Re-export for crop-ui compat
export { SETTINGS } from "./settings.mjs";

export function imageSize(file) {
  const out = execFileSync("identify", ["-format", "%w %h", `${file}[0]`], {
    encoding: "utf8",
  });
  const [w, h] = out.trim().split(" ").map(Number);
  return { w, h };
}

function grainArgs(w, h, { attenuate, blend }, seedStr) {
  return [
    "-seed",
    String(hash(seedStr)),
    "(",
    "-size",
    `${w}x${h}`,
    "xc:gray50",
    "-attenuate",
    String(attenuate),
    "+noise",
    "Gaussian",
    "-colorspace",
    "Gray",
    ")",
    "-compose",
    blend,
    "-composite",
  ];
}

// Largest box at target ratio w:h centered on the focal point, shrunk by zoom.
// Shared contract with crop-ui.mjs previews — keep the math in sync.
export function cropBox(
  srcW,
  srcH,
  w,
  h,
  { focus = [0.5, 0.5], zoom = 1 } = {},
) {
  const ratio = w / h;
  let boxW = Math.min(srcW, srcH * ratio) / zoom;
  let boxH = boxW / ratio;
  const clamp = (v, max) => Math.min(Math.max(v, 0), max);
  const x = clamp(focus[0] * srcW - boxW / 2, srcW - boxW);
  const y = clamp(focus[1] * srcH - boxH / 2, srcH - boxH);
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(boxW),
    h: Math.round(boxH),
  };
}

// A crops.json entry is `{ focus, zoom, sizes?: { <size>: { focus?, zoom? } } }`.
// The root focus/zoom is the base for every size; `sizes[name]` overrides it
// field by field. Shared contract with crop-ui.mjs — keep in sync.
export function resolveCrop(entry, sizeName) {
  const base = { focus: entry?.focus ?? [0.5, 0.5], zoom: entry?.zoom ?? 1 };
  const over = entry?.sizes?.[sizeName];
  return over
    ? { focus: over.focus ?? base.focus, zoom: over.zoom ?? base.zoom }
    : base;
}

export function loadCrops() {
  const file = join(ROOT, SETTINGS.cropsFile);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

// ============================================================================
// Content scan — entries = { slug, img? } from frontmatter `img:` lines
// ============================================================================
export function scanContent() {
  const entries = [];
  const push = (file, slug) => {
    const head = readFileSync(file, "utf8").slice(0, 2000);
    const m = head.match(/^img(?:_preview)?:\s*(?:"([^"]+)"|(\S+))\s*$/m);
    const rel = m?.[1] ?? m?.[2];
    entries.push({ slug, img: rel ? resolve(dirname(file), rel) : null });
  };

  for (const coll of ["post", "work"]) {
    const base = join(ROOT, "src/content", coll);
    for (const dir of readdirSync(base, { withFileTypes: true })) {
      if (dir.isDirectory()) push(join(base, dir.name, "index.md"), dir.name);
    }
  }
  const serieBase = join(ROOT, "src/content/serie");
  for (const item of readdirSync(serieBase, { withFileTypes: true })) {
    if (item.isFile() && item.name.endsWith(".md")) {
      push(join(serieBase, item.name), item.name.replace(/\.md$/, ""));
    } else if (item.isDirectory()) {
      for (const f of readdirSync(join(serieBase, item.name))) {
        if (f.endsWith(".md")) {
          push(
            join(serieBase, item.name, f),
            `${item.name}--${f.replace(/\.md$/, "")}`,
          );
        }
      }
    }
  }
  return entries;
}

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
