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
import { STYLES } from "./styles.mjs";

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

  let input = entry.img;
  let w, h;
  let tmp = null;
  if (entry.img && dims) {
    const src = imageSize(entry.img);
    const box = cropBox(src.w, src.h, dims.w, dims.h, crop);
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
    ({ w, h } = imageSize(entry.img));
  } else {
    ({ w, h } = dims ?? eff.settings.mesh.fallback);
  }

  try {
    st.apply(input, out, { slug: entry.slug, size: sizeName, w, h, eff, out });
  } finally {
    if (tmp) rmSync(tmp, { force: true });
  }
  if (manifest) manifest[key] = val;
  return true;
}
