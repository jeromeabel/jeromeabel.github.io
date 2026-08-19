#!/usr/bin/env node
// diff-raw-values.mjs — deterministic Pass-2 (Tokenization rule) diff.
// Compares raw-values.figma.json (use_figma dump, dump-raw-values.md) against
// named-debt.json (accepted-exception allowlist by node id + kind).
// WARN-ONLY: always exit 0 — the human judges only what's flagged as new
// (det → LLM → det sandwich, same shape as diff-tokens.mjs).
// Usage: node diff-raw-values.mjs <raw-values.figma.json> <named-debt.json>
import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [rawPath, debtPath, tokensArg] = process.argv.slice(2);
if (!debtPath) {
  console.error(
    "usage: diff-raw-values.mjs <raw-values.figma.json> <named-debt.json>",
  );
  process.exit(0);
}

let raw, debt;
try {
  raw = JSON.parse(readFileSync(rawPath, "utf8"));
  debt = JSON.parse(readFileSync(debtPath, "utf8"));
} catch (err) {
  const path = err.path || "unknown";
  const reason = err.code === "ENOENT" ? "file not found" : err.message;
  console.error(`warn: unable to read ${path}: ${reason}`);
  process.exit(0);
}

// Freshness guard. raw-values.figma.json is NOT derived from the .fig export —
// it comes from a live use_figma walk (dump-raw-values.md). So `figma:dump`
// refreshes tokens.figma.json and leaves this file untouched, and the diff below
// will happily report on a snapshot from days ago without saying so. Compare the
// two mtimes and shout when they disagree. Still warn-only: the report is the
// point, and a missing tokens dump is not this script's problem.
try {
  const tokensPath =
    tokensArg ?? resolve(dirname(rawPath), "tokens.figma.json");
  const rawAt = statSync(rawPath).mtime;
  const tokensAt = statSync(tokensPath).mtime;
  const iso = (d) => d.toISOString().slice(0, 16).replace("T", " ");
  console.log(
    `_raw dump ${iso(rawAt)} · token dump ${iso(tokensAt)} · ${Array.isArray(raw) ? raw.length : 0} rows_\n`,
  );
  if (rawAt < tokensAt) {
    const hours = ((tokensAt - rawAt) / 3_600_000).toFixed(1);
    console.log(
      `> ⚠️ **STALE INPUT** — \`${rawPath}\` predates the token dump by ${hours}h.\n` +
        "> It is not produced by `figma:dump`; re-run the live walk in\n" +
        "> `scripts/figma/dump-raw-values.md` before trusting anything below.\n",
    );
  }
} catch {
  // no tokens dump to compare against — nothing to assert, carry on
}

try {
  const hits = Array.isArray(raw) ? raw : [];
  const accepted = Array.isArray(debt?.accepted) ? debt.accepted : [];
  const key = (h) => `${h?.id}:${h?.kind}`;
  const debtMap = new Map(accepted.map((a) => [`${a.id}:${a.kind}`, a]));

  const fresh = [],
    known = [];
  for (const h of hits) {
    if (!h || typeof h.id !== "string" || typeof h.kind !== "string") continue;
    const entry = debtMap.get(key(h));
    if (entry) known.push({ h, entry });
    else fresh.push(h);
  }

  // stale allowlist entries: named debt with no matching raw hit in this dump
  const hitKeys = new Set(hits.filter((h) => h?.id && h?.kind).map(key));
  const stale = accepted.filter((a) => !hitKeys.has(`${a.id}:${a.kind}`));

  const section = (title, rows) =>
    `## ${title}\n\n${rows.length ? rows.join("\n") : "_none_"}\n`;
  console.log(
    [
      section(
        "New raw values (not in named-debt.json)",
        fresh.map(
          (h) => `- \`${h.name}\` (${h.id}) on ${h.page ?? "?"} — ${h.kind}`,
        ),
      ),
      section(
        "Accepted (named debt)",
        known.map(
          ({ h, entry }) =>
            `- \`${h.name}\` (${h.id}) — ${h.kind}: ${entry.reason}`,
        ),
      ),
      section(
        "Stale named-debt entries (no matching raw value found — bind removed or id drifted)",
        stale.map((a) => `- \`${a.name}\` (${a.id}) — ${a.kind}: ${a.reason}`),
      ),
    ].join("\n"),
  );
} catch (err) {
  console.error(
    `warn: diff computation failed on malformed input: ${err.message}`,
  );
  process.exit(0);
}
