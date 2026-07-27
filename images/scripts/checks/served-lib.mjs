#!/usr/bin/env node
// §10.2 guardrail: the browser runs the renderer's own modules — assert the
// studio serves lib files byte-identical to disk, and mesh generation is
// deterministic. Usage: node served-lib.mjs [port]   (studio must be running)
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { generateBlobs, meshSvg } from "../lib/mesh.mjs";
import { SETTINGS } from "../settings.mjs";

const port = process.argv[2] ?? "4380";
for (const name of ["util.mjs", "geometry.mjs", "mesh.mjs", "resolve.mjs"]) {
  const res = await fetch(`http://127.0.0.1:${port}/lib/${name}`);
  assert.ok(res.ok, `${name}: ${res.status}`);
  assert.equal(
    await res.text(),
    readFileSync(new URL(`../lib/${name}`, import.meta.url), "utf8"),
    `${name} served bytes differ from disk`,
  );
}
const colors = { bg: "#f5ffe1", tint: "#1e1e1e", accent: "#0d9488" };
const a = meshSvg(
  generateBlobs("sample:light", SETTINGS.mesh),
  colors,
  SETTINGS.mesh,
  1200,
  630,
);
const b = meshSvg(
  generateBlobs("sample:light", SETTINGS.mesh),
  colors,
  SETTINGS.mesh,
  1200,
  630,
);
assert.equal(a, b, "meshSvg not deterministic");
console.log("served-lib OK: modules byte-identical, mesh deterministic");
