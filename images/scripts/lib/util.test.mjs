import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hash,
  rng,
  lerp,
  color,
  accentFor,
  lighten,
  contrastRatio,
} from "./util.mjs";

const palette = {
  ink: "#1e1e1e",
  paper: "#f5ffe1",
  accents: { teal: "#0d9488", coral: "#ff5a3c" },
};

test("hash is stable fnv-1a", () => {
  assert.equal(hash("nuxt"), hash("nuxt"));
  assert.notEqual(hash("nuxt"), hash("nuxt2"));
});

test("rng is deterministic per seed", () => {
  const a = rng("s"),
    b = rng("s");
  assert.equal(a(), b());
  assert.equal(a(), b());
});

test("lerp maps [0,1) into range", () => {
  assert.equal(
    lerp(() => 0, [10, 20]),
    10,
  );
  assert.equal(
    lerp(() => 0.5, [10, 20]),
    15,
  );
});

test("color resolves accents, palette keys, and passthrough hex", () => {
  assert.equal(color(palette, "teal"), "#0d9488");
  assert.equal(color(palette, "ink"), "#1e1e1e");
  assert.equal(color(palette, "#123456"), "#123456");
});

test("accentFor picks a palette accent deterministically", () => {
  const keys = Object.keys(palette.accents);
  assert.ok(keys.includes(accentFor(palette, "any-slug")));
  assert.equal(accentFor(palette, "x"), accentFor(palette, "x"));
});

test("lighten(_, _, 1) is white, (_, _, 0) is unchanged", () => {
  assert.equal(lighten(palette, "ink", 1), "#ffffff");
  assert.equal(lighten(palette, "ink", 0), "#1e1e1e");
});

test("contrastRatio black/white is 21", () => {
  assert.ok(Math.abs(contrastRatio(palette, "#000000", "#ffffff") - 21) < 0.01);
});
