// One (entry, style, size) render — the isolated step both the CLI and the
// studio jobs call (studio-design.md §7). Plan 2 adds the settings-hash
// manifest here.
import { rmSync } from "node:fs";
import { SETTINGS } from "../settings.mjs";
import { magick, imageSize } from "./magick.mjs";
import { cropBox, resolveCrop } from "./geometry.mjs";
import { STYLES } from "./styles.mjs";

export function applicableStyles(entry, requested) {
  return entry.img
    ? requested.filter((s) => s !== "mesh")
    : requested.filter((s) => s === "mesh");
}

export function renderEntry(entry, styleName, sizeName, { out, crops }) {
  const fn = STYLES[styleName];
  if (!fn) throw new Error(`unknown style: ${styleName}`);
  const dims = SETTINGS.sizes[sizeName];
  if (dims === undefined) throw new Error(`unknown size: ${sizeName}`);

  let input = entry.img;
  let w, h;
  let tmp = null;
  if (entry.img && dims) {
    const src = imageSize(entry.img);
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
    ({ w, h } = imageSize(entry.img));
  } else {
    ({ w, h } = dims ?? SETTINGS.mesh.fallback);
  }

  try {
    fn(input, out, { slug: entry.slug, size: sizeName, w, h });
  } finally {
    if (tmp) rmSync(tmp, { force: true });
  }
}
