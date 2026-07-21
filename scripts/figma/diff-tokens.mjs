#!/usr/bin/env node
// diff-tokens.mjs — deterministic code↔Figma token diff for figma-blog-fit.
// Compares tokens.code.json (extractor) against tokens.figma.json (use_figma dump)
// through token-map.json. Emits markdown sections on stdout. WARN-ONLY: always
// exit 0 — the human judges the delta (det → LLM → det sandwich).
// Usage: node diff-tokens.mjs <tokens.code.json> <tokens.figma.json> <token-map.json>
// Tolerance: FLOAT ±0.5 (covers rem×16 rounding); COLOR exact hex (lowercased).
import { readFileSync } from "node:fs";

const [codePath, figmaPath, mapPath] = process.argv.slice(2);
if (!mapPath) {
  console.error("usage: diff-tokens.mjs <code.json> <figma.json> <map.json>");
  process.exit(0);
}

let code, figma, map, ignore;
try {
  code = JSON.parse(readFileSync(codePath, "utf8"));
  figma = JSON.parse(readFileSync(figmaPath, "utf8"));
  ({ map, ignore = [] } = JSON.parse(readFileSync(mapPath, "utf8")));
} catch (err) {
  const path = err.path || "unknown";
  const reason = err.code === "ENOENT" ? "file not found" : err.message;
  console.error(`warn: unable to read ${path}: ${reason}`);
  process.exit(0);
}

// index figma variables by "Collection/var/path"
const figVars = new Map();
for (const col of figma.collections)
  for (const v of col.variables) figVars.set(`${col.name}/${v.name}`, v);

const missing = [], mismatch = [], unmapped = [];
const consumed = new Set();

for (const t of code.tokens) {
  if (ignore.includes(t.name)) continue;
  const path = map[t.name];
  if (!path) { unmapped.push(t); continue; }
  const v = figVars.get(path);
  if (!v) { missing.push({ t, path }); continue; }
  consumed.add(path);
  const expected = t.class === "color" || t.class === "font" ? t.raw : t.px;
  const ok =
    typeof expected === "number" && typeof v.value === "number"
      ? Math.abs(expected - v.value) <= 0.5
      : String(expected).toLowerCase() === String(v.value).toLowerCase();
  if (!ok) mismatch.push({ t, path, expected, actual: v.value });
}

// orphans: variables in collections the map targets, consumed by no code token
const mappedCollections = new Set(Object.values(map).map((p) => p.split("/")[0]));
const orphaned = [...figVars.keys()].filter(
  (k) => mappedCollections.has(k.split("/")[0]) && !consumed.has(k),
);

const section = (title, rows) =>
  `## ${title}\n\n${rows.length ? rows.join("\n") : "_none_"}\n`;
console.log(
  [
    section("Missing in Figma", missing.map(({ t, path }) => `- \`${t.name}\` → expected at \`${path}\` (${t.source})`)),
    section("Value mismatch", mismatch.map(({ t, path, expected, actual }) =>
      `- \`${t.name}\` @ \`${path}\`: code **${expected}** vs figma **${actual}** (${t.source})`)),
    section("Orphaned in Figma", orphaned.map((k) => `- \`${k}\` — no code token maps here`)),
    section("Unmapped", unmapped.map((t) => `- \`${t.name}\` (${t.class}, ${t.source})`)),
  ].join("\n"),
);
