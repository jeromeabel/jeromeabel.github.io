// One (entry, style, size) render — the isolated step both the CLI and the
// studio jobs call (studio-design.md §7). Plan 2 adds the settings-hash
// manifest here.
import {
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { SETTINGS } from "../settings.mjs";
import { hash } from "./util.mjs";
import { magick, imageSize } from "./magick.mjs";
import { cropBox, resolveCrop } from "./geometry.mjs";
import { resolveSettings } from "./resolve.mjs";
import { STYLES, subjectSpec } from "./styles.mjs";

export function applicableStyles(entry, requested, eff) {
  const base = entry.img
    ? requested.filter((s) => s !== "mesh")
    : requested.filter((s) => s === "mesh");
  if (eff?.style) return base.includes(eff.style) ? [eff.style] : [];
  return base;
}

// Settings-hash manifest (§7) — skip re-rendering outputs that are already
// clean for the current (source, style, size, effective settings, crop).
let manifest = null;
let manifestPath = null;

export function openManifest(out) {
  manifestPath = join(out, ".manifest.json");
  manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : {};
}

export function flushManifest() {
  if (manifestPath)
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

export function renderKey(entry, styleName, sizeName, eff, crop) {
  const mtime = entry.img ? String(statSync(entry.img).mtimeMs) : "none";
  return hash(
    JSON.stringify([entry.img, mtime, styleName, sizeName, eff, crop]),
  ).toString(16);
}

export function prepareInput(entry, eff, crop, sizeName, dir) {
  const dims = eff.settings.sizes[sizeName];
  if (dims === undefined) throw new Error(`unknown size: ${sizeName}`);
  if (!/^[A-Za-z0-9_-]+$/.test(sizeName))
    throw new Error(`unknown size: ${sizeName}`);
  if (entry.img && dims) {
    const src = imageSize(entry.img);
    const box = cropBox(src.w, src.h, dims.w, dims.h, crop);
    const tmp = join(dir, `.crop_${entry.slug}_${sizeName}.png`);
    magick([
      entry.img,
      "-crop",
      `${box.w}x${box.h}+${box.x}+${box.y}`,
      "+repage",
      "-resize",
      `${dims.w}x${dims.h}!`,
      tmp,
    ]);
    return {
      input: tmp,
      w: dims.w,
      h: dims.h,
      cleanup: () => rmSync(tmp, { force: true }),
    };
  }
  if (entry.img) {
    const { w, h } = imageSize(entry.img);
    return { input: entry.img, w, h, cleanup() {} };
  }
  const { w, h } = dims ?? eff.settings.mesh.fallback;
  return { input: null, w, h, cleanup() {} };
}

// Subject layer for the studio's live preview (studio-design.md §3): the
// pre-composite subject for *-mesh styles (mesh + opacity applied by the
// browser), or the finished raster for flat styles.
export function renderLayer(entry, eff, crop, sizeName, styleName, dir) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const prep = prepareInput(entry, eff, crop, sizeName, dir);
  try {
    const ctx = {
      slug: entry.slug,
      size: sizeName,
      w: prep.w,
      h: prep.h,
      eff,
      out: dir,
    };
    const spec = subjectSpec(styleName, prep.input, ctx);
    if (spec) {
      const outFile = join(dir, `.layer_${entry.slug}.png`);
      try {
        magick([...spec.args, outFile]);
      } finally {
        spec.cleanup();
      }
      return outFile;
    }
    st.apply(prep.input, dir, ctx);
    return join(dir, st.outputs(entry.slug, sizeName, eff)[0]);
  } finally {
    prep.cleanup();
  }
}

export function renderExact(entry, eff, crop, sizeName, styleName, dir) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const prep = prepareInput(entry, eff, crop, sizeName, dir);
  try {
    st.apply(prep.input, dir, {
      slug: entry.slug,
      size: sizeName,
      w: prep.w,
      h: prep.h,
      eff,
      out: dir,
    });
    return join(dir, st.outputs(entry.slug, sizeName, eff)[0]);
  } finally {
    prep.cleanup();
  }
}

export function renderEntry(
  entry,
  styleName,
  sizeName,
  { out, crops, illustration, force = false },
) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const { effective: eff } = resolveSettings(
    entry.slug,
    illustration ?? { types: {}, images: {} },
    SETTINGS,
  );
  const dims = eff.settings.sizes[sizeName];
  if (dims === undefined) throw new Error(`unknown size: ${sizeName}`);

  const crop = resolveCrop(crops?.[entry.slug], sizeName);
  const key = `${entry.slug}|${styleName}|${sizeName}`;
  const val = renderKey(entry, styleName, sizeName, eff, crop);
  const outputs = st.outputs(entry.slug, sizeName, eff);
  if (
    !force &&
    manifest &&
    manifest[key] === val &&
    outputs.every((f) => existsSync(join(out, f)))
  ) {
    return false;
  }

  const prep = prepareInput(entry, eff, crop, sizeName, out);
  try {
    st.apply(prep.input, out, {
      slug: entry.slug,
      size: sizeName,
      w: prep.w,
      h: prep.h,
      eff,
      out,
    });
  } finally {
    prep.cleanup();
  }
  if (manifest) manifest[key] = val;
  return true;
}
