import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "build-brief.mjs");

function run(args) {
  return execFileSync("node", [script, ...args], { encoding: "utf8" });
}
function runFail(args) {
  try {
    execFileSync("node", [script, ...args], {
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (err) {
    return { code: err.status, stderr: err.stderr };
  }
  assert.fail("expected a non-zero exit");
}
function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), "brief-"));
  for (const [name, body] of Object.entries(files))
    writeFileSync(join(dir, name), body);
  return dir;
}

test("expands a markdown include inline and a js include inside a fence", () => {
  const dir = fixture({
    "P9-T01-demo.md":
      "# demo\n\n<!-- include: _rules.md -->\n\n<!-- include: _prelude.js -->\n\nend\n",
    "_rules.md": "## Run rules\n\n- do not improvise\n",
    "_prelude.js": "const F = 1;\n",
  });
  const out = run([join(dir, "P9-T01-demo.md")]);
  rmSync(dir, { recursive: true });
  assert.match(out, /## Run rules\n\n- do not improvise/);
  assert.match(out, /```js\nconst F = 1;\n```/);
  assert.match(out, /^# demo/);
  assert.match(out, /end\n$/);
  assert.doesNotMatch(out, /<!-- include/);
});

test("a missing include target fails loudly instead of shipping a hole", () => {
  const dir = fixture({ "P9-T02-x.md": "<!-- include: _gone.js -->\n" });
  const { code, stderr } = runFail([join(dir, "P9-T02-x.md")]);
  rmSync(dir, { recursive: true });
  assert.equal(code, 1);
  assert.match(stderr, /missing include `_gone\.js`/);
});

test("unknown task id and missing argument both exit non-zero", () => {
  assert.match(runFail(["P9-T99"]).stderr, /unknown task/);
  assert.match(runFail([]).stderr, /usage:/);
});

test("resolves a real brief by task id with no markers left behind", () => {
  const out = run(["P2-T04"]);
  assert.doesNotMatch(out, /<!-- include/);
  assert.match(out, /## Run rules/);
  assert.match(out, /const findMaster = async/);
});

test("--list reports every brief with its task id", () => {
  const lines = run(["--list"]).trim().split("\n");
  assert.equal(lines.length, 32); // 31 planned + P2-T04b (cover fills), added 2026-08-19
  assert.match(lines[0], /^P1-T01\s+P1-T01-inventory-gates\.md$/);
});
