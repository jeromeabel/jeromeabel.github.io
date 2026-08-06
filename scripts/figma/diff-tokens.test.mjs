import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(dirname(fileURLToPath(import.meta.url)), "diff-tokens.mjs");

function runDiff(code, figma, map) {
  const dir = mkdtempSync(join(tmpdir(), "difftok-"));
  const p = (n, o) => {
    const f = join(dir, n);
    writeFileSync(f, JSON.stringify(o));
    return f;
  };
  const out = execFileSync(
    "node",
    [script, p("c.json", code), p("f.json", figma), p("m.json", map)],
    { encoding: "utf8" },
  );
  rmSync(dir, { recursive: true });
  return out;
}

const code = {
  rootPx: 16,
  tokens: [
    {
      name: "light/color-background",
      raw: "#f5ffe1",
      px: null,
      class: "color",
      source: "x",
    },
    {
      name: "dark/color-background",
      raw: "#1e1e1e",
      px: null,
      class: "color",
      source: "x",
    },
    {
      name: "container-max-width",
      raw: "var(--breakpoint-xl)",
      px: 1280,
      class: "px-css",
      source: "y",
    },
    {
      name: "font-sans",
      raw: "IBM Plex Sans",
      px: null,
      class: "font",
      source: "z",
    },
  ],
};
const figma = {
  collections: [
    {
      name: "Color",
      modes: ["Light", "Dark"],
      variables: [
        {
          name: "Light/background",
          type: "COLOR",
          value: "#f5ffe1",
          description: "",
        },
        {
          name: "Dark/background",
          type: "COLOR",
          value: "#101010",
          description: "",
        }, // drift
        {
          name: "Light/zombie",
          type: "COLOR",
          value: "#000000",
          description: "",
        }, // orphan
      ],
    },
    {
      name: "Scale",
      modes: ["Mode 1"],
      variables: [
        { name: "container-max", type: "FLOAT", value: 1280, description: "" },
      ],
    },
  ],
  textStyles: [],
};
const map = {
  map: {
    "light/color-background": "Color/Light/background",
    "dark/color-background": "Color/Dark/background",
    "container-max-width": "Scale/container-max",
  },
  ignore: ["font-sans"],
};

test("clean match stays out of every section", () => {
  const out = runDiff(code, figma, map);
  assert.doesNotMatch(out, /light\/color-background/);
  assert.doesNotMatch(out, /container-max-width/);
});
test("value mismatch reported with both values", () => {
  assert.match(
    runDiff(code, figma, map),
    /## Value mismatch[\s\S]*dark\/color-background.*1e1e1e.*101010/,
  );
});
test("orphaned figma variable reported", () => {
  assert.match(
    runDiff(code, figma, map),
    /## Orphaned in Figma[\s\S]*Light\/zombie/,
  );
});
test("ignored token stays silent", () => {
  assert.doesNotMatch(runDiff(code, figma, map), /font-sans/);
});
test("unreadable input exits 0 (warn-only invariant)", () => {
  assert.doesNotThrow(() =>
    execFileSync(
      "node",
      [script, "/tmp/nope1.json", "/tmp/nope2.json", "/tmp/nope3.json"],
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    ),
  );
});
test("empty figma/code JSON objects (malformed structure) exits 0", () => {
  const out = runDiff({}, {}, { map: {}, ignore: [] });
  // With empty code.tokens and figma.collections, all sections should be empty
  assert.match(out, /## Unmapped[\s]*_none_/);
  assert.match(out, /## Missing in Figma[\s]*_none_/);
});
test("missing 'map' key in token-map.json defaults to empty", () => {
  const out = runDiff({ tokens: [] }, { collections: [] }, { ignore: [] });
  // Should not throw and should exit 0
  assert.match(out, /## Unmapped[\s]*_none_/);
});
test("figma collection missing 'variables' array exits 0", () => {
  const out = runDiff(
    { tokens: [] },
    { collections: [{ name: "Color", modes: ["Light"] }] },
    { map: {}, ignore: [] },
  );
  assert.match(out, /## Missing in Figma[\s]*_none_/);
});
test("token-map value that isn't a string exits 0", () => {
  const out = runDiff(
    { tokens: [] },
    { collections: [] },
    { map: { x: 123 }, ignore: [] },
  );
  assert.match(out, /## Orphaned in Figma[\s]*_none_/);
});
test("null top-level figma/code JSON and wrong-typed nested fields all exit 0", () => {
  assert.doesNotThrow(() =>
    runDiff(null, { collections: [] }, { map: {}, ignore: [] }),
  );
  assert.doesNotThrow(() =>
    runDiff({ tokens: [] }, null, { map: {}, ignore: [] }),
  );
  assert.doesNotThrow(() =>
    runDiff({ tokens: [] }, { collections: [null] }, { map: {}, ignore: [] }),
  );
  assert.doesNotThrow(() =>
    runDiff({ tokens: [null] }, { collections: [] }, { map: {}, ignore: [] }),
  );
  assert.doesNotThrow(() =>
    runDiff(
      { tokens: [{ name: "x" }] },
      { collections: [] },
      { map: {}, ignore: 5 },
    ),
  );
  assert.doesNotThrow(() =>
    runDiff(
      { tokens: [] },
      { collections: [{ name: "Color", variables: {} }] },
      { map: {}, ignore: [] },
    ),
  );
});
