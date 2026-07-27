import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "./styles.mjs";
import { resolveSettings } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

const eff = (ill = { types: {}, images: {} }, slug = "s") =>
  resolveSettings(slug, ill, SETTINGS).effective;

test("every style is an {outputs, apply} record", () => {
  for (const [name, st] of Object.entries(STYLES)) {
    assert.equal(typeof st.outputs, "function", name);
    assert.equal(typeof st.apply, "function", name);
  }
});

test("duotone outputs: paper + hash accent by default, pinned accent when set", () => {
  const d = STYLES.duotone;
  const base = d.outputs("s", "thumb", eff());
  assert.equal(base.length, 2);
  assert.equal(base[0], "s_duotone_thumb.png");
  assert.match(base[1], /^s_duotone-(teal|coral)_thumb\.png$/);
  const pinned = d.outputs(
    "s",
    "thumb",
    eff({ types: {}, images: { s: { accent: "coral" } } }),
  );
  assert.equal(pinned[1], "s_duotone-coral_thumb.png");
});

test("mesh outputs follow effective themes", () => {
  const m = STYLES.mesh.outputs("s", "cover", eff());
  assert.deepEqual(m, ["s_mesh-light_cover.png", "s_mesh-dark_cover.png"]);
});

test("single-file styles declare their one output", () => {
  assert.deepEqual(STYLES.riso.outputs("s", "small", eff()), [
    "s_riso_small.png",
  ]);
  assert.deepEqual(STYLES.framed.outputs("s", "square", eff()), [
    "s_framed_square.png",
  ]);
  assert.deepEqual(STYLES.vector.outputs("s", "thumb", eff()), [
    "s_vector_thumb.png",
  ]);
  assert.deepEqual(STYLES["photo-mesh"].outputs("s", "thumb", eff()), [
    "s_photo-mesh_thumb.png",
  ]);
  assert.deepEqual(STYLES["dither-mesh"].outputs("s", "thumb", eff()), [
    "s_dither-mesh_thumb.png",
  ]);
  assert.deepEqual(STYLES["vector-mesh"].outputs("s", "thumb", eff()), [
    "s_vector-mesh_thumb.png",
  ]);
  const di = STYLES.dither.outputs("s", "thumb", eff());
  assert.equal(di[0], "s_dither_thumb.png");
  assert.match(di[1], /^s_dither-(teal|coral)_thumb\.png$/);
});
