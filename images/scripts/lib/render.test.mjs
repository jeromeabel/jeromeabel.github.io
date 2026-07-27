import { test } from "node:test";
import assert from "node:assert/strict";
import { renderKey } from "./render.mjs";
import { resolveSettings } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

const entry = { slug: "s", img: null }; // no file → mtime "none", no fs access
const eff = (ill) =>
  resolveSettings("s", ill ?? { types: {}, images: {} }, SETTINGS).effective;

test("renderKey is stable for identical inputs", () => {
  assert.equal(
    renderKey(entry, "mesh", "thumb", eff(), { focus: [0.5, 0.5], zoom: 1 }),
    renderKey(entry, "mesh", "thumb", eff(), { focus: [0.5, 0.5], zoom: 1 }),
  );
});

test("renderKey changes when settings, crop, style or size change", () => {
  const base = renderKey(entry, "mesh", "thumb", eff(), { zoom: 1 });
  const tweaked = eff({ types: {}, images: { s: { mesh: { blur: 50 } } } });
  assert.notEqual(
    renderKey(entry, "mesh", "thumb", tweaked, { zoom: 1 }),
    base,
  );
  assert.notEqual(renderKey(entry, "mesh", "thumb", eff(), { zoom: 2 }), base);
  assert.notEqual(renderKey(entry, "mesh", "small", eff(), { zoom: 1 }), base);
  assert.notEqual(
    renderKey(entry, "duotone", "thumb", eff(), { zoom: 1 }),
    base,
  );
});
