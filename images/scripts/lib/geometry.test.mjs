import { test } from "node:test";
import assert from "node:assert/strict";
import { cropBox, resolveCrop } from "./geometry.mjs";

test("cropBox centers at default focus, full width when ratios match", () => {
  const b = cropBox(1200, 630, 575, 300, {});
  // target ratio 575/300 ≈ 1.9167 > src 1200/630 ≈ 1.9048 → width-bound
  assert.equal(b.w, 1200);
  assert.equal(b.h, Math.round(1200 / (575 / 300)));
  assert.equal(b.x, 0);
});

test("cropBox zoom shrinks the box and clamps at edges", () => {
  const b = cropBox(1000, 1000, 100, 100, { focus: [1, 1], zoom: 2 });
  assert.equal(b.w, 500);
  assert.equal(b.h, 500);
  assert.equal(b.x, 500); // clamped to srcW - boxW
  assert.equal(b.y, 500);
});

test("resolveCrop: size override wins field by field", () => {
  const entry = { focus: [0.2, 0.2], zoom: 1.5, sizes: { thumb: { zoom: 2 } } };
  assert.deepEqual(resolveCrop(entry, "thumb"), { focus: [0.2, 0.2], zoom: 2 });
  assert.deepEqual(resolveCrop(entry, "square"), {
    focus: [0.2, 0.2],
    zoom: 1.5,
  });
  assert.deepEqual(resolveCrop(undefined, "thumb"), {
    focus: [0.5, 0.5],
    zoom: 1,
  });
});
