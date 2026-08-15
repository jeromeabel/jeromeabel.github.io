#!/usr/bin/env node
// diff-responsive.mjs — asserts the 3 Responsive collection matches its committed
// expectation in every mode. The type/spacing variables have no CSS custom property
// to map from (they come from Tailwind utility classes inside components), so
// diff-tokens.mjs cannot see them — this is their deterministic check.
// WARN-ONLY: always exit 0 — the human judges the delta.
// Usage: node diff-responsive.mjs <responsive-expected.json> <tokens.figma.json>
import { readFileSync } from "node:fs";

const [expPath, figPath] = process.argv.slice(2);
if (!figPath) {
  console.error(
    "usage: diff-responsive.mjs <expected.json> <tokens.figma.json>",
  );
  process.exit(0);
}

let exp, fig;
try {
  exp = JSON.parse(readFileSync(expPath, "utf8"));
  fig = JSON.parse(readFileSync(figPath, "utf8"));
} catch (err) {
  const path = err.path || "unknown";
  console.error(
    `warn: unable to read ${path}: ${err.code === "ENOENT" ? "file not found" : err.message}`,
  );
  process.exit(0);
}

// Same defensive posture as diff-tokens.mjs: the Figma dump is hand-produced and
// its shape cannot be fully trusted. One guard for the whole body, warn and exit 0.
try {
  const col = (fig?.collections ?? []).find((c) => c?.name === exp.collection);
  const byName = new Map((col?.variables ?? []).map((v) => [v?.name, v]));

  const missing = [],
    mismatch = [],
    extra = [];
  const consumed = new Set();

  for (const [name, modes] of Object.entries(exp.variables ?? {})) {
    for (const mode of exp.modes ?? []) {
      const path = `${mode}/${name}`;
      const want = modes[mode];
      const got = byName.get(path);
      if (!got) {
        missing.push(path);
        continue;
      }
      consumed.add(path);
      const ok =
        typeof want === "number" && typeof got.value === "number"
          ? Math.abs(want - got.value) <= 0.5
          : String(want).toLowerCase() === String(got.value).toLowerCase();
      if (!ok) mismatch.push({ path, want, got: got.value });
    }
  }
  for (const path of byName.keys()) if (!consumed.has(path)) extra.push(path);

  const section = (title, rows) =>
    `## ${title}\n\n${rows.length ? rows.join("\n") : "_none_"}\n`;
  console.log(
    [
      section(
        "Missing",
        missing.map((p) => `- \`${p}\` — not in the Figma dump`),
      ),
      section(
        "Value mismatch",
        mismatch.map(
          ({ path, want, got }) =>
            `- \`${path}\`: expected **${want}** vs figma **${got}**`,
        ),
      ),
      section(
        "Extra in Figma (in the collection, not in the expectation)",
        extra.map((p) => `- \`${p}\``),
      ),
    ].join("\n"),
  );
} catch (err) {
  console.error(
    `warn: diff computation failed on malformed input: ${err.message}`,
  );
  process.exit(0);
}
