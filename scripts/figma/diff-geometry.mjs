#!/usr/bin/env node
// diff-geometry.mjs — deterministic web↔Figma computed-geometry diff (the
// "layout exact" prover). px↔px tolerance 0.5; colors compared normalized.
// WARN-ONLY: always exit 0 — output is a per-master repair worklist.
// Usage: node diff-geometry.mjs <geometry.web.json> <geometry.figma.json>
// Web geometry is keyed component/viewport/theme; the desktop/light root is the
// comparison basis against each Figma master (templates are desktop-1280).
import { readFileSync } from "node:fs";

const [webPath, figPath] = process.argv.slice(2);
let web, fig;
try {
  web = JSON.parse(readFileSync(webPath, "utf8"));
  fig = JSON.parse(readFileSync(figPath, "utf8"));
} catch (err) {
  console.error(`warn: unable to read input: ${err.message}`);
  process.exit(0);
}

const px = (v) =>
  typeof v === "string" && v.endsWith("px") ? parseFloat(v) : NaN;
const rows = [];
for (const [id, viewports] of Object.entries(web)) {
  const webRoot = viewports?.desktop?.light?.root;
  if (!webRoot) continue;
  const figRoot = fig[id]?.root;
  if (!figRoot) {
    rows.push(`- \`${id}\`: **missing in Figma** (no master matched)`);
    continue;
  }
  for (const [prop, wVal] of Object.entries(webRoot)) {
    const fVal = figRoot[prop];
    if (fVal == null) {
      rows.push(`- \`${id}\`.${prop}: web **${wVal}** vs figma **(absent)**`);
      continue;
    }
    const wPx = px(wVal),
      fPx = px(fVal);
    // rounded-full renders as an enormous px value in getComputedStyle
    // (browsers cap border-radius at half the box size); Figma expresses the
    // same "fully round" intent as 9999px. Both are "very round" - treat as
    // equal instead of flagging a five-decade delta.
    const bothPracticallyRound =
      prop === "borderRadius" && wPx >= 999 && fPx >= 999;
    const ok = bothPracticallyRound
      ? true
      : !Number.isNaN(wPx) && !Number.isNaN(fPx)
        ? Math.abs(wPx - fPx) <= 0.5
        : String(wVal).replace(/\s+/g, "").toLowerCase() ===
          String(fVal).replace(/\s+/g, "").toLowerCase();
    if (!ok)
      rows.push(`- \`${id}\`.${prop}: web **${wVal}** vs figma **${fVal}**`);
  }
}
console.log(
  `## Geometry worklist\n\n${rows.length ? rows.join("\n") : "_clean_"}\n`,
);
