import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = join(mkdtempSync(join(tmpdir(), "prim-")), "primitives.json");
execFileSync("node", ["scripts/figma/build-primitives.mjs", OUT]);
const { variables } = JSON.parse(readFileSync(OUT, "utf8"));
const byName = Object.fromEntries(variables.map((v) => [v.name, v]));

test("oklch converts to sRGB hexes (Tailwind v4 values)", () => {
  // Generated from installed Tailwind v4's oklch theme values.
  // Slight channel differences from published v3 values are acceptable since
  // Color Primitives has zero bindings — invisible to canvas (see notes.md).
  assert.equal(byName["color/blue/500"].value, "#2b7fff");
  assert.equal(byName["color/red/500"].value, "#fb2c36");
  assert.equal(byName["color/slate/900"].value, "#0f172b");
  assert.equal(byName["color/emerald/400"].value, "#00d492");
});

test("rem values convert to pixels", () => {
  assert.equal(byName["spacing/DEFAULT"].value, 4);
  assert.equal(byName["radius/lg"].value, 8);
  assert.equal(byName["radius/2xl"].value, 16);
  assert.equal(byName["text/xl"].value, 20);
  assert.equal(byName["breakpoint/xl"].value, 1280);
  assert.equal(byName["container/7xl"].value, 1280);
});

test("unitless values stay unitless", () => {
  assert.equal(byName["font-weight/medium"].value, 500);
  assert.equal(byName["leading/normal"].value, 1.5);
});

test("colour names fold into hue folders, other namespaces do not split on the leaf", () => {
  assert.equal(byName["color/blue/500"].type, "COLOR");
  assert.ok(byName["drop-shadow/md"], "compound namespaces stay intact");
  assert.ok(
    !variables.some((v) => v.name.startsWith("color/blue-")),
    "hue must be a folder",
  );
});

test("tracking is present but carries a reference-only marker", () => {
  assert.equal(byName["tracking/wide"].referenceOnly, true);
});

test("spacing/DEFAULT exists exactly once — no per-property forks", () => {
  assert.equal(variables.filter((v) => v.name === "spacing/DEFAULT").length, 1);
  assert.ok(
    !variables.some((v) => v.name.startsWith("gap/")),
    "no gap/* aliases",
  );
  assert.ok(
    !variables.some((v) => v.name.startsWith("padding/")),
    "no padding/* aliases",
  );
});

test("brand primitives are appended", () => {
  assert.equal(byName["color/brand/lime-100"].value, "#f5ffe1");
  assert.equal(byName["color/brand/gray-800"].value, "#1e1e1e");
  assert.equal(byName["color/white"].value, "#ffffff");
  assert.equal(byName["color/black"].value, "#000000");
});
