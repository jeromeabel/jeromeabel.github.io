import { test } from "node:test";
import assert from "node:assert/strict";
import { generateBlobs, meshSvg } from "./mesh.mjs";

const cfg = {
  viewBox: 1000,
  blur: 100,
  blobs: 4,
  radius: [200, 450],
  tintOpacity: [0.05, 0.14],
  accentOpacity: [0.35, 0.6],
};
const colors = { bg: "#f5ffe1", tint: "#1e1e1e", accent: "#0d9488" };

test("generateBlobs: deterministic, last blob is the accent", () => {
  const a = generateBlobs("slug:light", cfg);
  const b = generateBlobs("slug:light", cfg);
  assert.deepEqual(a, b);
  assert.equal(a.length, 4);
  assert.equal(a[3].fill, "accent");
  assert.ok(a.slice(0, 3).every((x) => x.fill === "tint"));
  assert.ok(a[3].op >= 0.35 && a[3].op <= 0.6);
});

test("meshSvg: serializes blobs with 2-decimal opacity and slice viewBox", () => {
  const blobs = [
    { cx: 300, cy: 420, rx: 350, ry: 300, rot: -12, op: 0.1, fill: "tint" },
  ];
  const svg = meshSvg(blobs, colors, cfg, 1200, 630);
  assert.ok(svg.includes('width="1200" height="630" viewBox="0 0 1000 1000"'));
  assert.ok(svg.includes('<rect width="1000" height="1000" fill="#f5ffe1"/>'));
  assert.ok(
    svg.includes(
      '<ellipse cx="300" cy="420" rx="350" ry="300" fill="#1e1e1e" opacity="0.10" transform="rotate(-12 300 420)"/>',
    ),
  );
  assert.ok(svg.includes('stdDeviation="100"'));
});
