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

// ============================================================================
// SETTINGS — every tunable number lives here. Nothing below this block
// contains a magic value.
// ============================================================================
export const SETTINGS = {
  palette: {
    ink: "#1e1e1e",
    paper: "#f5ffe1",
    accents: { teal: "#0d9488", coral: "#ff5a3c" },
  },

  // Output formats. `null` = original dimensions, no crop. Numbers are
  // placeholders until the final layout is decided.
  sizes: {
    cover: null,
    thumb: { w: 575, h: 300 },
    small: { w: 240, h: 140 },
    square: { w: 600, h: 600 },
  },

  // dark→ink, light→paper. Level clips flat gray ends, sigmoidal steepens
  // the midtones (fixes "not enough contrast").
  // `paperLift` (0–1) blends the paper end toward white for a lighter
  // background; `pnpm illustrate` prints the resulting WCAG contrast ratio.
  duotone: {
    level: "14%,86%",
    sigmoidal: "7x50%", // SxM: strength x midpoint
    paperLift: 0.35,
  },

  // 4-step posterize + grain, ink/paper mapped.
  riso: {
    posterizeSteps: 4,
    level: "8%,92%",
    grain: { attenuate: 0.25, blend: "Multiply" },
  },

  // Stipple was too harsh on drawings: pre-blur softens edges, ordered
  // dither is gentler than Floyd-Steinberg monochrome.
  // `pixelate` (% of target size) dithers at reduced resolution and scales
  // back with a Point filter — chunkier dots, the "more pixellized" knob.
  dither: {
    preBlur: "0x0.6",
    level: "22%,78%",
    sigmoidal: "6x50%",
    pixelate: 50,
    method: "o8x8,4", // ordered-dither map,levels ("FloydSteinberg" also valid)
    colors: ["ink", "paper"], // dark color, light color (palette keys or hex)
  },

  // Vectorized hand drawing: mkbitmap + potrace → clean curves, no pixel
  // noise. `threshold` 0–1 (higher = more black), `turdSize` drops specks.
  vector: {
    threshold: 0.5,
    turdSize: 4,
    alphaMax: 1,
  },

  // Composites: subject multiplied over the seeded fluid-gradient mesh.
  // `dither-mesh` uses the dither output, `photo-mesh` a plain contrasty
  // grayscale, `vector-mesh` the traced drawing.
  onMesh: {
    theme: "light",
    level: "12%,88%",
    sigmoidal: "6x50%",
    subjectOpacity: 0.92,
  },

  // Dark-framed screenshot (UI captures, data tables). Inner image scales to
  // `inset` × canvas.
  framed: {
    inset: 0.8,
    shadow: "60x10+0+10",
    frameBg: "#18181b",
  },

  // Seeded fluid-mesh background for entries without a cover. Rendered at
  // each size's dimensions (cover falls back to `fallback` dims).
  mesh: {
    fallback: { w: 1200, h: 630 },
    viewBox: 1000,
    blur: 100,
    blobs: 4, // total shapes; last one is always the accent
    radius: [200, 450],
    tintOpacity: [0.05, 0.14],
    accentOpacity: [0.35, 0.6],
    grain: { attenuate: 0.28, blend: "SoftLight" },
    themes: ["light", "dark"],
  },

  styles: [
    "duotone",
    "riso",
    "dither",
    "vector",
    "framed",
    "mesh",
    "photo-mesh",
    "dither-mesh",
    "vector-mesh",
  ],
  out: "images/out/review",
  cropsFile: "images/crops.json",
};

// ============================================================================
// Helpers
// ============================================================================
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const color = (key) =>
  SETTINGS.palette.accents[key] ?? SETTINGS.palette[key] ?? key;

function hash(str) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — deterministic RNG from slug hash
function rng(seed) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (r, [min, max]) => min + r() * (max - min);
const accentFor = (slug) => {
  const keys = Object.keys(SETTINGS.palette.accents);
  return keys[hash(slug) % keys.length];
};

function magick(args) {
  execFileSync("convert", args, { stdio: "inherit" });
}

function potrace(args) {
  execFileSync("potrace", args, { stdio: "inherit" });
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = ([r, g, b]) =>
  "#" +
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// Blend a color toward white. amount 0 = untouched, 1 = pure white.
const lighten = (c, amount) =>
  hex(rgb(color(c)).map((v) => v + (255 - v) * amount));

// WCAG 2.x relative luminance + contrast ratio — the answer to "how do I
// find the best contrast?": tune `paperLift` until this prints the ratio you
// want. 4.5 = AA for text over the image, 3.0 = AA for large text/graphics,
// 7.0 = AAA. Below ~3 the duotone reads flat.
function contrastRatio(a, b) {
  const lum = (c) => {
    const [r, g, bl] = rgb(color(c)).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

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
