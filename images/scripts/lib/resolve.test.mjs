import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSettings, RESERVED } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

const ill = {
  types: {
    "hand-drawing": { style: "dither", dither: { pixelate: 60 } },
  },
  images: {
    "adding-likes": { type: "hand-drawing" },
    chimeres: {
      type: "hand-drawing",
      style: "photo-mesh",
      accent: "coral",
      seed: "chimeres-2",
      mix: { opacity: 0.92, blend: "Multiply" },
      dither: { pixelate: 70 },
    },
  },
};

test("absent entry: all-global, defaults intact", () => {
  const { effective, source } = resolveSettings("unknown-slug", ill, SETTINGS);
  assert.equal(effective.style, null);
  assert.equal(effective.accent, null);
  assert.equal(effective.mesh, null);
  assert.equal(effective.mix, null);
  assert.equal(effective.seed, "unknown-slug");
  assert.deepEqual(effective.settings, SETTINGS);
  assert.equal(source["dither.pixelate"], "global");
  assert.equal(source.style, "global");
});

test("type tier: style verdict and group override propagate", () => {
  const { effective, source } = resolveSettings("adding-likes", ill, SETTINGS);
  assert.equal(effective.style, "dither");
  assert.equal(effective.settings.dither.pixelate, 60);
  assert.equal(effective.settings.dither.preBlur, SETTINGS.dither.preBlur);
  assert.equal(source.style, "type");
  assert.equal(source["dither.pixelate"], "type");
  assert.equal(source["dither.preBlur"], "global");
});

test("image tier wins over type tier, field by field", () => {
  const { effective, source } = resolveSettings("chimeres", ill, SETTINGS);
  assert.equal(effective.style, "photo-mesh");
  assert.equal(effective.accent, "coral");
  assert.equal(effective.seed, "chimeres-2");
  assert.deepEqual(effective.mix, { opacity: 0.92, blend: "Multiply" });
  assert.equal(effective.settings.dither.pixelate, 70);
  assert.equal(source.style, "image");
  assert.equal(source["dither.pixelate"], "image");
});

test("input objects are never mutated", () => {
  const before = JSON.stringify(SETTINGS);
  resolveSettings("chimeres", ill, SETTINGS);
  assert.equal(JSON.stringify(SETTINGS), before);
});

test("reserved key list is the §5 contract", () => {
  assert.deepEqual(RESERVED, [
    "type",
    "style",
    "mix",
    "accent",
    "seed",
    "mesh",
  ]);
});
