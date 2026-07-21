import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(dirname(fileURLToPath(import.meta.url)), "diff-geometry.mjs");
function run(web, figma) {
  const dir = mkdtempSync(join(tmpdir(), "diffgeo-"));
  const p = (n, o) => { const f = join(dir, n); writeFileSync(f, JSON.stringify(o)); return f; };
  const out = execFileSync("node", [script, p("w.json", web), p("f.json", figma)], { encoding: "utf8" });
  rmSync(dir, { recursive: true });
  return out;
}

const web = { "post-card": { desktop: { light: { root: { fontSize: "16px", paddingLeft: "24px", color: "rgb(30, 30, 30)" } } } } };

test("within tolerance is clean", () => {
  const figma = { "post-card": { root: { fontSize: "16px", paddingLeft: "24.3px", color: "rgb(30, 30, 30)" } } };
  assert.doesNotMatch(run(web, figma), /paddingLeft/);
});
test("over-tolerance px mismatch reported", () => {
  const figma = { "post-card": { root: { fontSize: "16px", paddingLeft: "16px", color: "rgb(30, 30, 30)" } } };
  assert.match(run(web, figma), /post-card[\s\S]*paddingLeft.*24.*16/);
});
test("color mismatch reported", () => {
  const figma = { "post-card": { root: { fontSize: "16px", paddingLeft: "24px", color: "rgb(0, 0, 0)" } } };
  assert.match(run(web, figma), /color.*30, 30, 30.*0, 0, 0/);
});
test("master absent in figma reported", () => {
  assert.match(run(web, {}), /post-card.*missing in figma/i);
});
