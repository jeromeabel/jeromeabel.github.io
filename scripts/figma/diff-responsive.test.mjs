import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const SCRIPT = new URL("./diff-responsive.mjs", import.meta.url).pathname;

function run(expected, figma) {
  const dir = mkdtempSync(join(tmpdir(), "diff-resp-"));
  const e = join(dir, "expected.json"),
    f = join(dir, "figma.json");
  writeFileSync(e, JSON.stringify(expected));
  writeFileSync(f, JSON.stringify(figma));
  return execFileSync("node", [SCRIPT, e, f], { encoding: "utf8" });
}

const EXPECTED = {
  collection: "3 Responsive",
  modes: ["Desktop", "Mobile"],
  variables: { "text/hero-title": { Desktop: 48, Mobile: 24 } },
};
const figmaWith = (vars) => ({
  collections: [
    { name: "3 Responsive", modes: ["Desktop", "Mobile"], variables: vars },
  ],
});

test("reports nothing when every mode matches", () => {
  const out = run(
    EXPECTED,
    figmaWith([
      { name: "Desktop/text/hero-title", value: 48 },
      { name: "Mobile/text/hero-title", value: 24 },
    ]),
  );
  assert.match(out, /## Missing\n\n_none_/);
  assert.match(out, /## Value mismatch\n\n_none_/);
});

test("flags a variable absent from the dump", () => {
  const out = run(
    EXPECTED,
    figmaWith([{ name: "Desktop/text/hero-title", value: 48 }]),
  );
  assert.match(out, /Mobile\/text\/hero-title/);
});

test("flags a wrong per-mode value", () => {
  const out = run(
    EXPECTED,
    figmaWith([
      { name: "Desktop/text/hero-title", value: 48 },
      { name: "Mobile/text/hero-title", value: 36 },
    ]),
  );
  assert.match(out, /expected \*\*24\*\* vs figma \*\*36\*\*/);
});

test("tolerates ±0.5 rem-rounding drift", () => {
  const out = run(
    EXPECTED,
    figmaWith([
      { name: "Desktop/text/hero-title", value: 48.25 },
      { name: "Mobile/text/hero-title", value: 24 },
    ]),
  );
  assert.match(out, /## Value mismatch\n\n_none_/);
});

test("exits 0 and warns on a missing file rather than crashing", () => {
  const out = execFileSync("node", [SCRIPT, "/nope.json", "/nope2.json"], {
    encoding: "utf8",
  });
  assert.equal(typeof out, "string");
});
