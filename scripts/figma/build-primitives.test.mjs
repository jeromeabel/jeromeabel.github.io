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
  // Tailwind v4 redefined colors using different oklch values than v3.
  // These values are derived directly from node_modules/tailwindcss/theme.css
  // by converting oklch→sRGB using Björn Ottosson's reference formula.
  // Examples:
  // - blue/500: theme.css has oklch(62.3% 0.214 259.815) → #2b7fff
  // - red/500: theme.css has oklch(63.7% 0.237 25.331) → #fb2c36
  // - slate/900: theme.css has oklch(20.8% 0.042 265.755) → #0f172b
  // v3 published hex values differ (e.g., v3 blue/500 was #3b82f6), but
  // since Color Primitives has zero bindings (nothing on canvas uses it),
  // the visual difference is imperceptible. The script generates from the
  // installed Tailwind version for reproducibility and future upgrades.
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

test("spacing scale synthesized from base unit (36 total: DEFAULT + 35 canonical keys)", () => {
  // Tailwind v4 only defines --spacing as base unit; script synthesizes the full scale.
  assert.equal(byName["spacing/0"].value, 0);
  assert.equal(byName["spacing/px"].value, 1);
  assert.equal(byName["spacing/4"].value, 16); // 4 * 4px
  assert.equal(byName["spacing/8"].value, 32); // 8 * 4px
  assert.equal(byName["spacing/96"].value, 384); // 96 * 4px
  const spacingVars = variables.filter((v) => v.name.startsWith("spacing/"));
  assert.equal(
    spacingVars.length,
    36,
    "DEFAULT (parsed) + 35 synthesized keys",
  );
});

test("achromatic colors (zero-chroma oklch) convert to hex not string", () => {
  // Tailwind v4 writes zero-chroma colors as oklch(L% 0 none) where 'none' replaces hue.
  // These should convert to COLOR type (hex), not fall through to STRING.
  const achromatic = variables.filter(
    (v) =>
      v.name.startsWith("color/neutral/") || v.name.startsWith("color/zinc/"),
  );
  assert.ok(achromatic.length > 0, "neutral and zinc colors exist");
  assert.ok(
    achromatic.every((v) => v.type === "COLOR"),
    "all achromatic colors are COLOR type (not STRING)",
  );
  assert.ok(
    achromatic.every((v) => /^#[0-9a-f]{6}$/.test(v.value)),
    "all achromatic colors have valid hex values",
  );
});
