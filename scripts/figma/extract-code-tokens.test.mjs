import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "extract-code-tokens.mjs");
const out = join(here, "tokens.code.test-output.json");

function run() {
  execFileSync("node", [script, out], { stdio: "pipe" });
  const data = JSON.parse(readFileSync(out, "utf8"));
  rmSync(out);
  return data;
}
const byName = (d, n) => d.tokens.find((t) => t.name === n);

test("root px recorded as 16", () => {
  assert.equal(run().rootPx, 16);
});
test("light semantic colors extracted, lowercased hex", () => {
  const d = run();
  assert.equal(byName(d, "light/color-background").raw, "#f5ffe1");
  assert.equal(byName(d, "light/color-foreground").raw, "#1e1e1e");
  assert.equal(byName(d, "light/color-muted-background-accent").raw, "#d1ddbb");
});
test("dark overrides extracted separately", () => {
  const d = run();
  assert.equal(byName(d, "dark/color-background").raw, "#1e1e1e");
  assert.equal(byName(d, "dark/color-foreground").raw, "#ececec");
});
test("all 8 semantic colors present in both modes", () => {
  const d = run();
  const light = d.tokens.filter((t) => t.name.startsWith("light/color-"));
  const dark = d.tokens.filter((t) => t.name.startsWith("dark/color-"));
  assert.equal(light.length, 8);
  assert.equal(dark.length, 8);
});
test("font stacks extracted and whitespace-collapsed", () => {
  const d = run();
  assert.match(byName(d, "font-sans").raw, /^"IBM Plex Sans", sans-serif/);
  assert.ok(byName(d, "font-title"));
  assert.ok(byName(d, "font-mono"));
});
test("container max-width resolves --breakpoint-xl to 1280px", () => {
  const d = run();
  assert.equal(byName(d, "container-max-width").px, 1280);
  assert.equal(byName(d, "container-padding-inline").px, 16); // 1rem × 16
});
test("root font-size guard scans global.css (no false positives on real file)", () => {
  // Verifies the guard's new global.css scan doesn't fail on the actual codebase.
  // global.css has no html//:root font-size override; extractor should run cleanly.
  const d = run();
  assert.equal(d.rootPx, 16, "extractor completed with guard passing");
});
test("emits a *-primary token holding only the first font family", () => {
  const d = run();
  const byNameMap = Object.fromEntries(d.tokens.map((t) => [t.name, t]));

  assert.equal(byNameMap["font-sans-primary"].raw, "IBM Plex Sans");
  assert.equal(byNameMap["font-title-primary"].raw, "Bubbler One");
  assert.equal(byNameMap["font-mono-primary"].raw, "Fira Code");
  assert.equal(byNameMap["font-sans-primary"].class, "font");

  // the full stack token still exists, unchanged
  assert.match(byNameMap["font-sans"].raw, /^"IBM Plex Sans", sans-serif/);
});
