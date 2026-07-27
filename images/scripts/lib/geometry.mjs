// Crop math — pure, zero imports. Served to the browser verbatim by the
// studio (studio-design.md §4); this is the single copy that replaces the
// hand-synced duplicate that lived in crop-ui.mjs.

// Largest box at target ratio w:h centered on the focal point, shrunk by zoom.
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
// field by field.
export function resolveCrop(entry, sizeName) {
  const base = { focus: entry?.focus ?? [0.5, 0.5], zoom: entry?.zoom ?? 1 };
  const over = entry?.sizes?.[sizeName];
  return over
    ? { focus: over.focus ?? base.focus, zoom: over.zoom ?? base.zoom }
    : base;
}
