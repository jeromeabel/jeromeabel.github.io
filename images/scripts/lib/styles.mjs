// Style renderers — { outputs(slug, size, eff) → string[], apply(src, out, ctx) }
// with ctx = { slug, size, w, h, eff }.
// src is already cropped+resized to w×h (except size "cover" = original).
import { writeFileSync, rmSync } from "node:fs";
import {
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
} from "./util.mjs";
import { magick, potrace, grainArgs } from "./magick.mjs";
import { generateBlobs, meshSvg } from "./mesh.mjs";

// Per-render helpers over the EFFECTIVE settings (three-tier merged).
const pal = (eff) => eff.settings.palette;
const C = (eff, k) => paletteColor(pal(eff), k);
export const accentOf = (eff, slug) =>
  eff.accent ?? paletteAccent(pal(eff), slug);

function meshColors(eff, slug, theme) {
  return {
    bg: theme === "light" ? C(eff, "paper") : C(eff, "ink"),
    tint: theme === "light" ? C(eff, "ink") : C(eff, "paper"),
    accent: C(eff, accentOf(eff, slug)),
  };
}

// Shared pipeline up to the dithered grayscale — `+level-colors <dark>,<light>`
// and an output path complete it. Dithers at `pixelate`% then point-scales
// back, so the dots stay chunky instead of hairline.
export function ditherArgs(src, w, h, s) {
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

function blobsFor(eff, slug, theme) {
  // Materialized blobs are the truth; otherwise derive from seed (§6).
  return (
    eff.mesh?.blobs ?? generateBlobs(`${eff.seed}:${theme}`, eff.settings.mesh)
  );
}

// meshBackdrop — replaces the old inline meshSvg(slug, theme, w, h) call:
function meshBackdrop(out, { slug, w, h, eff }) {
  const s = eff.settings.mesh;
  const theme = eff.settings.onMesh.theme;
  const svg = `${out}/.bg_${slug}.svg`;
  const png = `${out}/.bg_${slug}.png`;
  writeFileSync(
    svg,
    meshSvg(blobsFor(eff, slug, theme), meshColors(eff, slug, theme), s, w, h),
  );
  magick([svg, ...grainArgs(w, h, s.grain, `${slug}:bg:${w}x${h}`), png]);
  rmSync(svg, { force: true });
  return png;
}

// Multiply a prepared subject over the mesh backdrop.
function compositeOnMesh(subjectArgs, out, ctx, name) {
  const { slug, size, w, h, eff } = ctx;
  const opacity = eff.mix?.opacity ?? eff.settings.onMesh.subjectOpacity;
  const blend = eff.mix?.blend ?? "Multiply";
  const bg = meshBackdrop(out, ctx);
  const subject = `${out}/.subj_${slug}.png`;
  magick([
    ...subjectArgs,
    "-alpha",
    "set",
    "-channel",
    "A",
    "-evaluate",
    "set",
    `${opacity * 100}%`,
    "+channel",
    subject,
  ]);
  magick([
    bg,
    subject,
    "-compose",
    blend,
    "-composite",
    `${out}/${slug}_${name}_${size}.png`,
  ]);
  rmSync(bg, { force: true });
  rmSync(subject, { force: true });
}

// The pre-composite subject pipeline of a *-mesh style: magick args producing
// the subject ALONE (no mesh, no opacity — the studio layers those live).
// Returns null for styles that have no subject/backdrop split.
export function subjectSpec(styleName, src, ctx) {
  const { slug, size, w, h, eff } = ctx;
  if (styleName === "photo-mesh") {
    const o = eff.settings.onMesh;
    return {
      args: [
        src,
        "-colorspace",
        "Gray",
        "-level",
        o.level,
        "-sigmoidal-contrast",
        o.sigmoidal,
      ],
      cleanup() {},
    };
  }
  if (styleName === "dither-mesh") {
    const [dark, light] = eff.settings.dither.colors.map((c) => C(eff, c));
    return {
      args: [
        ...ditherArgs(src, w, h, eff.settings.dither),
        "+level-colors",
        `${dark},${light}`,
      ],
      cleanup() {},
    };
  }
  if (styleName === "vector-mesh") {
    const s = eff.settings.vector;
    const svg = `${ctx.out}/.vm_${slug}_${size}.svg`;
    const pgm = `${ctx.out}/.vm_${slug}_${size}.pgm`;
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
    return {
      args: [
        "-background",
        "white",
        svg,
        "-fill",
        C(eff, "ink"),
        "-opaque",
        "black",
        "-resize",
        `${w}x${h}!`,
      ],
      cleanup() {
        rmSync(pgm, { force: true });
        rmSync(svg, { force: true });
      },
    };
  }
  return null;
}

export const STYLES = {
  duotone: {
    outputs: (slug, size, eff) => [
      `${slug}_duotone_${size}.png`,
      `${slug}_duotone-${accentOf(eff, slug)}_${size}.png`,
    ],
    apply(src, out, { slug, size, eff }) {
      const s = eff.settings.duotone;
      const paper = paletteLighten(pal(eff), "paper", s.paperLift);
      magick([
        src,
        "-colorspace",
        "Gray",
        "-level",
        s.level,
        "-sigmoidal-contrast",
        s.sigmoidal,
        "+level-colors",
        `${C(eff, "ink")},${paper}`,
        `${out}/${slug}_duotone_${size}.png`,
      ]);
      const accent = accentOf(eff, slug);
      magick([
        src,
        "-colorspace",
        "Gray",
        "-level",
        s.level,
        "-sigmoidal-contrast",
        s.sigmoidal,
        "+level-colors",
        `${C(eff, "ink")},${C(eff, accent)}`,
        `${out}/${slug}_duotone-${accent}_${size}.png`,
      ]);
    },
  },

  riso: {
    outputs: (slug, size) => [`${slug}_riso_${size}.png`],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.riso;
      magick([
        src,
        "-colorspace",
        "Gray",
        "-level",
        s.level,
        "-posterize",
        String(s.posterizeSteps),
        "+level-colors",
        `${C(eff, "ink")},${C(eff, "paper")}`,
        ...grainArgs(w, h, s.grain, `${slug}:riso:${w}x${h}`),
        `${out}/${slug}_riso_${size}.png`,
      ]);
    },
  },

  dither: {
    outputs: (slug, size, eff) => [
      `${slug}_dither_${size}.png`,
      `${slug}_dither-${accentOf(eff, slug)}_${size}.png`,
    ],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.dither;
      const [dark, light] = s.colors.map((c) => C(eff, c));
      magick([
        ...ditherArgs(src, w, h, s),
        "+level-colors",
        `${dark},${light}`,
        `${out}/${slug}_dither_${size}.png`,
      ]);
      // dither + duotone accent: same dots, accent as the light end.
      const accent = accentOf(eff, slug);
      magick([
        ...ditherArgs(src, w, h, s),
        "+level-colors",
        `${dark},${C(eff, accent)}`,
        `${out}/${slug}_dither-${accent}_${size}.png`,
      ]);
    },
  },

  vector: {
    outputs: (slug, size) => [`${slug}_vector_${size}.png`],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.vector;
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
        C(eff, "paper"),
        svg,
        "-fill",
        C(eff, "ink"),
        "-opaque",
        "black",
        "-resize",
        `${w}x${h}!`,
        `${out}/${slug}_vector_${size}.png`,
      ]);
      rmSync(pgm, { force: true });
      rmSync(svg, { force: true });
    },
  },

  framed: {
    outputs: (slug, size) => [`${slug}_framed_${size}.png`],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.framed;
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
  },

  mesh: {
    outputs: (slug, size, eff) =>
      eff.settings.mesh.themes.map((t) => `${slug}_mesh-${t}_${size}.png`),
    apply(_src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.mesh;
      for (const theme of s.themes) {
        const tmp = `${out}/.mesh_${slug}_${theme}.svg`;
        writeFileSync(
          tmp,
          meshSvg(
            blobsFor(eff, slug, theme),
            meshColors(eff, slug, theme),
            s,
            w,
            h,
          ),
        );
        magick([
          tmp,
          ...grainArgs(w, h, s.grain, `${slug}:mesh-${theme}:${w}x${h}`),
          `${out}/${slug}_mesh-${theme}_${size}.png`,
        ]);
        rmSync(tmp);
      }
    },
  },

  // Contrasty grayscale photo multiplied over the fluid-gradient background.
  "photo-mesh": {
    outputs: (slug, size) => [`${slug}_photo-mesh_${size}.png`],
    apply(src, out, ctx) {
      const spec = subjectSpec("photo-mesh", src, ctx);
      compositeOnMesh(spec.args, out, ctx, "photo-mesh");
      spec.cleanup();
    },
  },

  // Dithered subject over the fluid-gradient background.
  "dither-mesh": {
    outputs: (slug, size) => [`${slug}_dither-mesh_${size}.png`],
    apply(src, out, ctx) {
      const spec = subjectSpec("dither-mesh", src, ctx);
      compositeOnMesh(spec.args, out, ctx, "dither-mesh");
      spec.cleanup();
    },
  },

  // Traced hand drawing over the fluid-gradient background.
  "vector-mesh": {
    outputs: (slug, size) => [`${slug}_vector-mesh_${size}.png`],
    apply(src, out, ctx) {
      const spec = subjectSpec("vector-mesh", src, ctx);
      compositeOnMesh(spec.args, out, ctx, "vector-mesh");
      spec.cleanup();
    },
  },
};
