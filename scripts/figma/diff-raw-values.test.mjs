import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "diff-raw-values.mjs",
);

function runDiff(raw, debt) {
  const dir = mkdtempSync(join(tmpdir(), "diffraw-"));
  const p = (n, o) => {
    const f = join(dir, n);
    writeFileSync(f, JSON.stringify(o));
    return f;
  };
  const out = execFileSync(
    "node",
    [script, p("r.json", raw), p("d.json", debt)],
    { encoding: "utf8" },
  );
  rmSync(dir, { recursive: true });
  return out;
}

const debt = {
  accepted: [
    { id: "32:5", name: "plus", kind: "fill", reason: "overlay bg, dark in both themes" },
  ],
};

test("hit matching named-debt entry reported as accepted, not new", () => {
  const out = runDiff(
    [{ id: "32:5", name: "plus", page: "🧩 Components", kind: "fill" }],
    debt,
  );
  assert.match(out, /## Accepted \(named debt\)[\s\S]*plus/);
  assert.match(out, /## New raw values \(not in named-debt\.json\)\n\n_none_/);
});

test("unlisted raw value reported as new", () => {
  const out = runDiff(
    [{ id: "99:9", name: "Mystery", page: "🧩 Components", kind: "radius" }],
    debt,
  );
  assert.match(out, /## New raw values[\s\S]*Mystery.*radius/);
});

test("named-debt entry with no matching hit reported stale", () => {
  const out = runDiff([], debt);
  assert.match(out, /## Stale named-debt entries[\s\S]*plus/);
});

test("same id different kind is treated as a distinct, new finding", () => {
  const out = runDiff(
    [{ id: "32:5", name: "plus", page: "🧩 Components", kind: "stroke" }],
    debt,
  );
  assert.match(out, /## New raw values[\s\S]*plus.*stroke/);
  assert.match(out, /## Stale named-debt entries[\s\S]*plus/);
});

test("unreadable input exits 0 (warn-only invariant)", () => {
  assert.doesNotThrow(() =>
    execFileSync("node", [script, "/tmp/nope1.json", "/tmp/nope2.json"], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }),
  );
});

test("malformed shapes (non-array raw, missing accepted) exit 0", () => {
  assert.doesNotThrow(() => runDiff({}, {}));
  assert.doesNotThrow(() => runDiff(null, { accepted: null }));
  assert.doesNotThrow(() => runDiff([{ id: "x" }], debt)); // missing kind
});
