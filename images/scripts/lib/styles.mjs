// Style renderers — fn(src, out, ctx) with ctx = { slug, size, w, h }.
// src is already cropped+resized to w×h (except size "cover" = original).
import { writeFileSync, rmSync } from "node:fs";
import { SETTINGS } from "../settings.mjs";
import {
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
} from "./util.mjs";
import { magick, potrace, grainArgs } from "./magick.mjs";
import { generateBlobs, meshSvg } from "./mesh.mjs";

const color = (k) => paletteColor(SETTINGS.palette, k);
const accentFor = (slug) => paletteAccent(SETTINGS.palette, slug);
const lighten = (c, amount) => paletteLighten(SETTINGS.palette, c, amount);

function meshColors(slug, theme) {
  return {
    bg: theme === "light" ? color("paper") : color("ink"),
    tint: theme === "light" ? color("ink") : color("paper"),
    accent: color(accentFor(slug)),
  };
}

// Shared pipeline up to the dithered grayscale — `+level-colors <dark>,<light>`
// and an output path complete it. Dithers at `pixelate`% then point-scales
// back, so the dots stay chunky instead of hairline.
export function ditherArgs(src, w, h) {
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

// meshBackdrop — replaces the old inline meshSvg(slug, theme, w, h) call:
function meshBackdrop(out, slug, w, h) {
  const s = SETTINGS.mesh;
  const theme = SETTINGS.onMesh.theme;
  const svg = `${out}/.bg_${slug}.svg`;
  const png = `${out}/.bg_${slug}.png`;
  const blobs = generateBlobs(`${slug}:${theme}`, s);
  writeFileSync(svg, meshSvg(blobs, meshColors(slug, theme), s, w, h));
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

export const STYLES = {
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
      const blobs = generateBlobs(`${slug}:${theme}`, s);
      writeFileSync(tmp, meshSvg(blobs, meshColors(slug, theme), s, w, h));
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
