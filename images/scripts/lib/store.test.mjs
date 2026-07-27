import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./content.mjs";
import {
  loadIllustration,
  saveIllustration,
  ILLUSTRATION_FILE,
} from "./store.mjs";

const file = join(ROOT, ILLUSTRATION_FILE);
const backup = existsSync(file) ? readFileSync(file, "utf8") : null;
const restore = () => {
  if (backup === null) rmSync(file, { force: true });
  else writeFileSync(file, backup);
};

test("missing file → empty maps", () => {
  rmSync(file, { force: true });
  try {
    assert.deepEqual(loadIllustration(), { types: {}, images: {} });
  } finally {
    restore();
  }
});

test("round trip is byte-identical (§10.3)", () => {
  const data = {
    types: { "hand-drawing": { style: "dither" } },
    images: { "adding-likes": { type: "hand-drawing" } },
  };
  saveIllustration(data);
  try {
    const bytes1 = readFileSync(file, "utf8");
    saveIllustration(loadIllustration());
    assert.equal(readFileSync(file, "utf8"), bytes1);
    assert.ok(bytes1.endsWith("\n"));
  } finally {
    restore();
  }
});

test("malformed file → throws naming the file, never resets (§9)", () => {
  writeFileSync(file, "{ not json");
  try {
    assert.throws(() => loadIllustration(), /illustration\.json/);
    assert.equal(readFileSync(file, "utf8"), "{ not json"); // untouched
  } finally {
    restore();
  }
});
