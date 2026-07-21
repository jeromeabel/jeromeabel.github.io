---
title: Figma ↔ Blog perfect fit — implementation plan
created: 2026-07-21
---

# Figma ↔ Blog perfect fit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Figma a trustworthy mockup surface and astrobook a trustworthy dev surface for the Blog UI, with the three-way fit code ↔ astrobook ↔ Figma proven by deterministic scripts wherever technically possible.

**Architecture:** Four independently-landable stages. Stage 1 builds a deterministic token pipeline (`extract` → interactive Figma `dump` → `diff`) adapted from the existing `fe-figma-verify` skill scripts. Stage 2 fixes astrobook capture to use real-width **preview** routes plus width-decorator components, rehabbing pixel-check. Stage 3 proves layout with a computed-geometry diff (web Playwright vs Figma node read). Stages 3b/4 build the legacy-9 Figma page and the responsive/dark template frames.

**Tech Stack:** Node 20 ESM scripts (no new deps), `node:test` built-in runner, Playwright 1.61 (already a devDep), astrobook 0.13.2, Figma MCP (`mcp__plugin_figma_figma__*`), Tailwind CSS v4 `@theme` tokens.

## Global Constraints

- **No new dependencies.** Everything uses existing devDeps (`playwright`, `pixelmatch`, `pngjs`) + Node built-ins (`node:fs`, `node:test`, `node:path`, `node:url`). Verified: repo has no test runner — use `node --test`, not vitest/jest.
- **Package manager is pnpm.** All script wiring goes in `package.json` `scripts`; run with `pnpm <name>`.
- **Root font-size is 16px.** `Layout.astro` sets no `html` override; all rem→px is `rem × 16`. A guard enforces this — do not bypass it.
- **Code is truth.** Every token/geometry conflict is repaired **Figma-side**, never by editing `src/styles/global.css` to match Figma.
- **Figma DS file id:** `Wf4iomVMYUXlFIBV3Z8bx4` (build `ds-blog-v3-01`). Never trust stored node IDs — resolve nodes by **name** via Pass 0 live-inventory before any write (IDs are volatile).
- **Fidelity bar:** token + layout exact (script-verified), side-by-side screenshots identical to the eye. Machine 0-pixel Figma↔web is explicitly NOT the bar.
- **MCP writes are LLM-mediated** — before any `use_figma` call, read the `/figma-use` skill first in the session. Keep writes to one batched call per stage; the diff/verdict layers around them are deterministic files that survive session death.
- **Source scripts to adapt** live at
  `/home/jabel/code/allo-media/frontend-ai/.claude/skills/fe-figma-verify/scripts/`
  (`extract-code-tokens.mjs`, `extract-code-tokens.test.mjs`, `diff-tokens.mjs`, `diff-tokens.test.mjs`) and the paste-in dump + audit passes in that skill's `SKILL.md`. `token-map.json` has no reference copy — Task 2 writes it from scratch. They target the Uhlive DS (13px root, PrimeVue, SCSS) — reuse structure, re-source for this repo.
- **Viewport matrix:** 3 widths (1280 desktop / 768 tablet / 390 mobile) × 2 themes (light/dark).

---

## File Structure

**Created:**
- `scripts/figma/extract-code-tokens.mjs` — parse `src/styles/global.css` → `tokens.code.json`.
- `scripts/figma/extract-code-tokens.test.mjs` — `node:test` for the extractor.
- `scripts/figma/diff-tokens.mjs` — code↔Figma token diff (warn-only, adapted verbatim).
- `scripts/figma/diff-tokens.test.mjs` — `node:test` for the diff.
- `scripts/figma/token-map.json` — code-token-name → Figma `Collection/Mode/var` path + ignore list.
- `scripts/figma/dump-tokens.md` — the paste-into-`use_figma` dump script + how to save `tokens.figma.json`.
- `scripts/figma/extract-web-geometry.mjs` — Playwright over preview routes → `geometry.web.json`.
- `scripts/figma/diff-geometry.mjs` — web↔Figma computed-geometry diff → repair worklist.
- `scripts/figma/diff-geometry.test.mjs` — `node:test` for the geometry diff.
- `src/components/styleguide/StoryContainer.astro` — `<div class="container"><slot/></div>` decorator.
- `src/components/styleguide/StorySection.astro` — container + live section spacing decorator.
- `docs/specs/01_active/figma-blog-fit/notes.md` — running log of residual pixel/geometry fails + one-line reasons, and the story→decorator mapping.

**Modified:**
- `package.json` — add `figma:verify`, `test`, `geometry:web` scripts.
- `scripts/pixel-check.mjs` — preview routes, `waitUntil: 'load'`, 3×2 matrix, dark-theme injection.
- `scripts/pixel-manifest.mjs` — re-anchor 11 broken selectors; store decorator assignment.
- `src/components/blog/PostList.astro` — `getAllPosts` → `getAllBlogPosts`.
- `src/components/blog/PostList.stories.ts` — new story (create if absent).
- Various `*.stories.ts` — attach `decorators` per live-parent context.

**Generated (git-ignored, add to `.gitignore`):** `tokens.code.json`, `tokens.figma.json`, `geometry.web.json`, `geometry.figma.json`, `.pixel-report/`.

---

## STAGE 1 — Token pipeline (deterministic core)

### Task 1: Deterministic code-token extractor

**Files:**
- Create: `scripts/figma/extract-code-tokens.mjs`
- Test: `scripts/figma/extract-code-tokens.test.mjs`
- Reference source (adapt): `/home/jabel/code/allo-media/frontend-ai/.claude/skills/fe-figma-verify/scripts/extract-code-tokens.mjs`

**Interfaces:**
- Produces: `tokens.code.json` = `{ rootPx: 16, tokens: [{ name, raw, px, class, source }] }`.
  - Color tokens: `name` = `"light/color-background"` / `"dark/color-background"`, `raw` = `"#f5ffe1"` (lowercased hex), `px` = `null`, `class` = `"color"`.
  - Font tokens: `name` = `"font-sans"`, `raw` = collapsed stack string, `class` = `"font"`.
  - Container tokens: `name` = `"container-max-width"` / `"container-padding-inline"`, `px` = number, `class` = `"px-css"`.

- [ ] **Step 1: Write the failing test**

Create `scripts/figma/extract-code-tokens.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/figma/extract-code-tokens.test.mjs`
Expected: FAIL — extractor file does not exist yet (`Cannot find module .../extract-code-tokens.mjs`).

- [ ] **Step 3: Write the extractor**

Create `scripts/figma/extract-code-tokens.mjs`:

```js
#!/usr/bin/env node
// extract-code-tokens.mjs — deterministic token extractor (zero LLM tokens).
// Parses src/styles/global.css (@theme, @variant dark, @utility container) into
// tokens.code.json for the figma-blog-fit token pipeline. Code is truth.
// Usage: node scripts/figma/extract-code-tokens.mjs [outPath]  (default ./tokens.code.json)
// Exit: 0 ok · 1 ROOT FONT-SIZE GUARD failed (16px assumption broken — every rem→px
//       conversion would be wrong; do NOT bypass) · 2 source/block missing · 3 unparseable value.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CSS = join(REPO, "src/styles/global.css");
const LAYOUT = join(REPO, "src/layouts/Layout.astro");
const ROOT_PX = 16;
// Tailwind v4 default breakpoint scale (px) — container max-width resolves through this.
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

function read(p) {
  try { return readFileSync(p, "utf8"); }
  catch { console.error(`MISSING SOURCE: ${p}`); process.exit(2); }
}
const round = (n) => Math.round(n * 1000) / 1000;
const tokens = [];
const push = (name, raw, px, cls, source) => tokens.push({ name, raw, px, class: cls, source });

// Brace-matched block body extractor (handles nested {} inside a block).
function block(css, header) {
  const start = css.indexOf(header);
  if (start === -1) { console.error(`MISSING BLOCK: ${header} in global.css`); process.exit(2); }
  let depth = 0, body = "";
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") { depth++; if (depth === 1) continue; }
    if (ch === "}") { depth--; if (depth === 0) return body; }
    if (depth >= 1) body += ch;
  }
  console.error(`UNCLOSED BLOCK: ${header}`); process.exit(2);
}

const css = read(CSS);

// 1. Root font-size guard — Layout.astro must not override html font-size.
{
  const layout = read(LAYOUT);
  const m = layout.match(/html[^{]*\{[^}]*font-size:\s*([\d.]+)px/s);
  if (m && Number(m[1]) !== ROOT_PX) {
    console.error(
      `ROOT FONT-SIZE GUARD FAILED: Layout.astro sets ${m[1]}px, expected ${ROOT_PX}px — ` +
        `all rem→px conversions invalid. Update ROOT_PX only after verifying the app change.`,
    );
    process.exit(1);
  }
}

// 2. @theme — font stacks + light semantic colors
{
  const theme = block(css, "@theme");
  for (const m of theme.matchAll(/--(font-[\w-]+):\s*([\s\S]*?);/g))
    push(m[1], m[2].replace(/\s+/g, " ").trim(), null, "font", "global.css @theme");
  for (const m of theme.matchAll(/--(color-[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g))
    push(`light/${m[1]}`, m[2].toLowerCase(), null, "color", "global.css @theme");
}

// 3. @variant dark — dark color overrides
{
  const dark = block(css, "@variant dark");
  for (const m of dark.matchAll(/--(color-[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g))
    push(`dark/${m[1]}`, m[2].toLowerCase(), null, "color", "global.css @variant dark");
}

// 4. @utility container — max-width (breakpoint var → px) + inline padding
{
  const c = block(css, "@utility container");
  const varMatch = c.match(/max-width:\s*var\(--breakpoint-([\w]+)\)/);
  const litMatch = c.match(/max-width:\s*([\d.]+)(rem|px)/);
  if (varMatch) {
    const px = BREAKPOINTS[varMatch[1]];
    if (px == null) { console.error(`UNKNOWN BREAKPOINT: --breakpoint-${varMatch[1]}`); process.exit(3); }
    push("container-max-width", `var(--breakpoint-${varMatch[1]})`, px, "px-css", "global.css @utility container");
  } else if (litMatch) {
    const px = litMatch[2] === "rem" ? round(Number(litMatch[1]) * ROOT_PX) : Number(litMatch[1]);
    push("container-max-width", `${litMatch[1]}${litMatch[2]}`, px, "px-css", "global.css @utility container");
  } else { console.error("UNPARSEABLE container max-width"); process.exit(3); }

  const pad = c.match(/padding-inline:\s*([\d.]+)(rem|px)/);
  if (pad) {
    const px = pad[2] === "rem" ? round(Number(pad[1]) * ROOT_PX) : Number(pad[1]);
    push("container-padding-inline", `${pad[1]}${pad[2]}`, px, "px-css", "global.css @utility container");
  }
}

tokens.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name));
const out = process.argv[2] ?? "tokens.code.json";
writeFileSync(out, JSON.stringify({ rootPx: ROOT_PX, tokens }, null, 2) + "\n");
console.log(`${tokens.length} tokens -> ${out}`);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/figma/extract-code-tokens.test.mjs`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Smoke-run against the real repo and eyeball**

Run: `node scripts/figma/extract-code-tokens.mjs /tmp/tokens.code.json && cat /tmp/tokens.code.json`
Expected: 8 light colors + 8 dark colors + 3 fonts + 2 container tokens; container-max-width px = 1280 (the design's "832px" parenthetical was an estimate — extracted value supersedes it, per "code is truth"). If the extractor exits 3 on container, the CSS uses a literal not `var(--breakpoint-xl)` — that literal value is then the truth.

- [ ] **Step 6: Add `.gitignore` entries and commit**

```bash
printf '\n# figma-blog-fit generated artifacts\ntokens.code.json\ntokens.figma.json\ngeometry.web.json\ngeometry.figma.json\n.pixel-report/\n' >> .gitignore
git add scripts/figma/extract-code-tokens.mjs scripts/figma/extract-code-tokens.test.mjs .gitignore
git commit -m "feat(figma-verify): deterministic code-token extractor for global.css"
```

---

### Task 2: Token diff + `pnpm figma:verify` wiring

**Files:**
- Create: `scripts/figma/diff-tokens.mjs` (adapt verbatim from the reference source)
- Create: `scripts/figma/diff-tokens.test.mjs`
- Create: `scripts/figma/token-map.json`
- Modify: `package.json` (scripts block)
- Reference: `/home/jabel/code/allo-media/frontend-ai/.claude/skills/fe-figma-verify/scripts/diff-tokens.mjs`

**Interfaces:**
- Consumes: `tokens.code.json` (Task 1), `tokens.figma.json` (Task 3 — dump), `token-map.json`.
- Produces: markdown diff on stdout with sections `Missing in Figma`, `Value mismatch`, `Orphaned in Figma`, `Unmapped`. **Always exits 0** (warn-only; the human judges each finding as real-drift / expected-gap / map-update).
- `token-map.json` shape: `{ "map": { "<code-token-name>": "<Collection>/<Mode>/<var>" }, "ignore": ["<code-token-name>", ...] }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/figma/diff-tokens.test.mjs`:

```js
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
  const p = (n, o) => { const f = join(dir, n); writeFileSync(f, JSON.stringify(o)); return f; };
  const out = execFileSync("node", [script, p("c.json", code), p("f.json", figma), p("m.json", map)],
    { encoding: "utf8" });
  rmSync(dir, { recursive: true });
  return out;
}

const code = { rootPx: 16, tokens: [
  { name: "light/color-background", raw: "#f5ffe1", px: null, class: "color", source: "x" },
  { name: "dark/color-background", raw: "#1e1e1e", px: null, class: "color", source: "x" },
  { name: "container-max-width", raw: "var(--breakpoint-xl)", px: 1280, class: "px-css", source: "y" },
  { name: "font-sans", raw: "IBM Plex Sans", px: null, class: "font", source: "z" },
] };
const figma = { collections: [
  { name: "Color", modes: ["Light", "Dark"], variables: [
    { name: "Light/background", type: "COLOR", value: "#f5ffe1", description: "" },
    { name: "Dark/background", type: "COLOR", value: "#101010", description: "" }, // drift
    { name: "Light/zombie", type: "COLOR", value: "#000000", description: "" },    // orphan
  ] },
  { name: "Scale", modes: ["Mode 1"], variables: [
    { name: "container-max", type: "FLOAT", value: 1280, description: "" },
  ] },
], textStyles: [] };
const map = { map: {
  "light/color-background": "Color/Light/background",
  "dark/color-background": "Color/Dark/background",
  "container-max-width": "Scale/container-max",
}, ignore: ["font-sans"] };

test("clean match stays out of every section", () => {
  const out = runDiff(code, figma, map);
  assert.doesNotMatch(out, /light\/color-background/);
  assert.doesNotMatch(out, /container-max-width/);
});
test("value mismatch reported with both values", () => {
  assert.match(runDiff(code, figma, map), /## Value mismatch[\s\S]*dark\/color-background.*1e1e1e.*101010/);
});
test("orphaned figma variable reported", () => {
  assert.match(runDiff(code, figma, map), /## Orphaned in Figma[\s\S]*Light\/zombie/);
});
test("ignored token stays silent", () => {
  assert.doesNotMatch(runDiff(code, figma, map), /font-sans/);
});
test("unreadable input exits 0 (warn-only invariant)", () => {
  assert.doesNotThrow(() =>
    execFileSync("node", [script, "/tmp/nope1.json", "/tmp/nope2.json", "/tmp/nope3.json"],
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/figma/diff-tokens.test.mjs`
Expected: FAIL — `diff-tokens.mjs` does not exist.

- [ ] **Step 3: Write the diff script**

Create `scripts/figma/diff-tokens.mjs` (copied from the reference, tolerance comment updated to rem×16; logic unchanged):

```js
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
```

- [ ] **Step 4: Write the token-map skeleton**

Create `scripts/figma/token-map.json`. The Figma paths (`Color/Light/<var>`) are **provisional** — Task 3's Pass-0 inventory confirms the real collection + variable names; correct this file then. `container-*` paths are filled after the dump reveals the `Scale`/metrics collection.

```json
{
  "map": {
    "light/color-background": "Color/Light/background",
    "light/color-foreground": "Color/Light/foreground",
    "light/color-background-accent": "Color/Light/background-accent",
    "light/color-foreground-accent": "Color/Light/foreground-accent",
    "light/color-muted": "Color/Light/muted",
    "light/color-muted-border": "Color/Light/muted-border",
    "light/color-muted-background": "Color/Light/muted-background",
    "light/color-muted-background-accent": "Color/Light/muted-background-accent",
    "dark/color-background": "Color/Dark/background",
    "dark/color-foreground": "Color/Dark/foreground",
    "dark/color-background-accent": "Color/Dark/background-accent",
    "dark/color-foreground-accent": "Color/Dark/foreground-accent",
    "dark/color-muted": "Color/Dark/muted",
    "dark/color-muted-border": "Color/Dark/muted-border",
    "dark/color-muted-background": "Color/Dark/muted-background",
    "dark/color-muted-background-accent": "Color/Dark/muted-background-accent"
  },
  "ignore": [
    "font-sans",
    "font-title",
    "font-mono",
    "container-max-width",
    "container-padding-inline"
  ]
}
```

Fonts are ignored in the token diff (Figma text styles carry family names, checked in the Stage-3 geometry/visual gate instead). `container-*` start ignored; move them into `map` once Task 3 confirms the Figma metric variable names.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test scripts/figma/diff-tokens.test.mjs`
Expected: PASS — 5 tests green.

- [ ] **Step 6: Wire `pnpm figma:verify` + `pnpm test`**

Edit `package.json` `scripts` block (currently ends with `"pixel-check": "node scripts/pixel-check.mjs"`). Add:

```json
    "pixel-check": "node scripts/pixel-check.mjs",
    "test": "node --test scripts/figma/",
    "figma:verify": "node scripts/figma/extract-code-tokens.mjs tokens.code.json && node scripts/figma/diff-tokens.mjs tokens.code.json tokens.figma.json scripts/figma/token-map.json"
```

`figma:verify` extracts fresh code tokens then diffs against the last-dumped `tokens.figma.json` (Task 3 refreshes that file interactively).

- [ ] **Step 7: Verify wiring and commit**

Run: `pnpm test`
Expected: all Stage-1 tests pass (extractor + diff).

```bash
git add scripts/figma/diff-tokens.mjs scripts/figma/diff-tokens.test.mjs scripts/figma/token-map.json package.json
git commit -m "feat(figma-verify): token diff, map skeleton, figma:verify + test scripts"
```

---

### Task 3: Figma token dump (interactive MCP) + first drift verdict

**Files:**
- Create: `scripts/figma/dump-tokens.md` (the paste-in script + procedure)
- Modify: `scripts/figma/token-map.json` (correct paths to real Figma names)
- Create/append: `docs/specs/01_active/figma-blog-fit/notes.md` (verdict log)

> **Interactive task — no unit test.** Gate = `pnpm figma:verify` produces a diff whose every finding is judged real-drift / expected-gap / map-update, and all real-drifts are repaired Figma-side. `use_figma` is LLM-mediated; read `/figma-use` first.

**Interfaces:**
- Consumes: DS file `Wf4iomVMYUXlFIBV3Z8bx4`.
- Produces: `tokens.figma.json` = `{ collections: [{ name, modes: [..], variables: [{ name, type, value, description }] }], textStyles: [{ name, fontSize, fontName }] }`. For multi-mode collections, each variable is expanded to one entry per mode, `name` = `"<Mode>/<var>"` (so `Color/Light/background` addresses cleanly).

- [ ] **Step 1: Record the dump script**

Create `scripts/figma/dump-tokens.md` containing this procedure and the paste-in script (adapted from the `fe-figma-verify` SKILL dump — Uhlive changelog logic dropped, **per-mode expansion added** because this DS's Color collection has Light + Dark modes):

````markdown
# Figma token dump — figma-blog-fit

1. Read the `/figma-use` skill (required before any `use_figma` call this session).
2. Run ONE `use_figma` call on file `Wf4iomVMYUXlFIBV3Z8bx4` with the script below.
3. Save the returned JSON to `tokens.figma.json` at repo root.
4. Run `pnpm figma:verify` and record verdicts in `notes.md`.

```js
const out = { collections: [], textStyles: [] };
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const multiMode = c.modes.length > 1;
  const vars = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const m of c.modes) {
      let value = v.valuesByMode[m.modeId];
      if (value && value.type === "VARIABLE_ALIAS") {
        const ref = await figma.variables.getVariableByIdAsync(value.id);
        value = { alias: ref.name };
      } else if (v.resolvedType === "COLOR" && value) {
        const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
        value = `#${h(value.r)}${h(value.g)}${h(value.b)}`;
      }
      vars.push({ name: multiMode ? `${m.name}/${v.name}` : v.name, type: v.resolvedType, value, description: v.description });
    }
  }
  out.collections.push({ name: c.name, modes: c.modes.map((m) => m.name), variables: vars });
}
for (const s of await figma.getLocalTextStylesAsync())
  out.textStyles.push({ name: s.name, fontSize: s.fontSize, fontName: s.fontName });
return out;
```
````

- [ ] **Step 2: Pass 0 — live inventory (resolve names, IDs are volatile)**

Run the Pass-0 live-inventory script (from the SKILL, generic — reuse verbatim) in one `use_figma` call to get real collection + variable + master names. This is the source of truth for correcting `token-map.json`; never paste an ID from the ledger.

- [ ] **Step 3: Run the dump, save `tokens.figma.json`**

Execute the Step-1 script via `use_figma`; write the return value to `tokens.figma.json` at repo root.

- [ ] **Step 4: Correct `token-map.json` to real names**

Using the Pass-0 inventory, fix each `map` path in `scripts/figma/token-map.json` so the collection name, mode names, and variable names match Figma exactly (e.g. if the collection is `Colors` not `Color`, or variables are `bg/default` not `background`). Move `container-max-width` / `container-padding-inline` out of `ignore` and into `map` if a matching metric variable exists.

- [ ] **Step 5: Diff and judge every finding**

Run: `pnpm figma:verify`
For each line in `Value mismatch` / `Missing in Figma` / `Orphaned in Figma` / `Unmapped`, write a one-line verdict in `docs/specs/01_active/figma-blog-fit/notes.md`: `real-drift` (repair Figma), `expected-gap` (accept, add to `ignore`), or `map-update` (fix path in `token-map.json`).

- [ ] **Step 6: Repair real-drifts (one batched write)**

For every `real-drift` color: in ONE `use_figma` write call, set the Figma variable's value (per mode) to the code hex via `figma.variables.setValueForMode`. Bind tokens, never paste raw hex into node fills. Re-run `pnpm figma:verify` until `Value mismatch` and `Missing in Figma` are empty or only `expected-gap` remains.

- [ ] **Step 7: Commit**

```bash
git add scripts/figma/dump-tokens.md scripts/figma/token-map.json docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "feat(figma-verify): batched token dump procedure; token map + drift verdicts"
```

---

## STAGE 2 — Astrobook real-width stories + pixel-check rehab

### Task 4: Width-decorator components

**Files:**
- Create: `src/components/styleguide/StoryContainer.astro`
- Create: `src/components/styleguide/StorySection.astro`

**Interfaces:**
- Produces: two decorator components usable in `.stories.ts` as `decorators: [{ component: StoryContainer }]`. Astrobook applies decorators as nested wrappers around the story `<slot/>` (static HTML only — fine for containers).

- [ ] **Step 1: Write `StoryContainer.astro`**

Create `src/components/styleguide/StoryContainer.astro`:

```astro
---
// Decorator: wraps a story in the real site `.container` utility so its
// max-width + inline padding match live pages at every viewport.
---

<div class="container">
  <slot />
</div>
```

- [ ] **Step 2: Write `StorySection.astro`**

Create `src/components/styleguide/StorySection.astro`:

```astro
---
// Decorator: container + the vertical section rhythm live pages add around a
// component (only assigned to stories whose live parent adds this spacing).
---

<section class="container py-16 md:py-24">
  <slot />
</section>
```

- [ ] **Step 3: Verify they render in astrobook**

Run: `pnpm dev` then open `http://localhost:4321/styleguide/` and confirm the dev server compiles without error (decorators are referenced in Task 5; here just confirm the files build).
Expected: no Astro compile error; dev server ready.

- [ ] **Step 4: Commit**

```bash
git add src/components/styleguide/StoryContainer.astro src/components/styleguide/StorySection.astro
git commit -m "feat(styleguide): StoryContainer + StorySection width decorators"
```

---

### Task 5: Assign decorators per live-parent context

**Files:**
- Modify: manifest-covered `*.stories.ts` (attach `decorators`)
- Modify: `scripts/pixel-manifest.mjs` (record the assignment per entry)
- Append: `docs/specs/01_active/figma-blog-fit/notes.md` (the story→decorator table)

**Interfaces:**
- Consumes: `StoryContainer` / `StorySection` (Task 4).
- Produces: each manifest-covered component's story renders at its live width. Full-bleed components (Header, Footer, Hero, WorksStrip) get **no** wrapper.

- [ ] **Step 1: Derive each component's live-parent context**

For every non-skipped manifest entry, grep the live parent that renders it and note whether that parent puts it inside `.container` (→ `StoryContainer`), inside a spaced section (→ `StorySection`), or full-bleed (→ none):

Run: `rg -l "import .*(Header|Footer|Hero|WorksStrip)" src/pages src/layouts/Layout.astro` and, per component, `rg "<ComponentName" src/pages src/layouts` to see its wrapping markup.
Record the verdict per component in a table in `notes.md` (component | live parent | wrapper).

- [ ] **Step 2: Attach decorators in story files**

For each story whose verdict is `StoryContainer`, edit its `*.stories.ts` default export to add the decorator. Example — `src/components/blog/PostCard.stories.ts`:

```ts
import PostCard from "./PostCard.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default {
  component: PostCard,
  decorators: [{ component: StoryContainer }],
};
```

For `StorySection` verdicts, import `StorySection` instead. Leave full-bleed components unchanged.

- [ ] **Step 3: Record the assignment in the manifest**

In `scripts/pixel-manifest.mjs`, add a `wrapper` field to each entry documenting the decorator (`"container"` | `"section"` | `"none"`) so the mapping is reviewable alongside the selector. Example edit to the `about-aboutfacts--grid` entry:

```js
  {
    id: "about-aboutfacts--grid",
    storyPath:
      "/styleguide/dashboard/src/components/about/about-facts/grid",
    liveUrl: `${BASE}/about`,
    selector: 'dl[class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"]',
    masks: [],
    wrapper: "container",
  },
```

- [ ] **Step 4: Visually confirm a sample renders at live width**

Run: `pnpm dev`, open the **preview** route for one wrapped story, e.g.
`http://localhost:4321/styleguide/stories/src/components/blog/post-card/default`
and confirm it renders at container width (not the dashboard's ~976px cage).
Expected: story content constrained to the `.container` max-width with 1rem padding.

- [ ] **Step 5: Commit**

```bash
git add src/components/**/*.stories.ts scripts/pixel-manifest.mjs docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "feat(styleguide): assign width decorators per live-parent context"
```

---

### Task 6: Pixel-check preview routes + 3×2 matrix + dark theme

**Files:**
- Modify: `scripts/pixel-check.mjs`

**Interfaces:**
- Consumes: `scripts/pixel-manifest.mjs`, preview routes from Task 5.
- Produces: `.pixel-report/summary.json` with a row per (component × viewport × theme).

Current load-bearing lines (verified): `VIEWPORTS` array `scripts/pixel-check.mjs:14-17` (only 1280 + 390, no theme); route built `:129` as `` `http://localhost:4321${c.storyPath}` `` using the dashboard path; `waitUntil: "networkidle"` `:44`; theme never set.

- [ ] **Step 1: Add 768 viewport + theme dimension**

Replace the `VIEWPORTS` array (`scripts/pixel-check.mjs:14-17`) with the full matrix:

```js
const VIEWPORTS = [
  { w: 1280, name: "desktop" },
  { w: 768, name: "tablet" },
  { w: 390, name: "mobile" },
];
const THEMES = ["light", "dark"];
```

- [ ] **Step 2: Capture preview routes, not dashboard**

At the route construction (`:129`), derive the bare preview route from the manifest's dashboard path (single-point swap — no manifest churn):

```js
const previewPath = c.storyPath.replace("/styleguide/dashboard/", "/styleguide/stories/");
const url = `http://localhost:4321${previewPath}`;
```

- [ ] **Step 3: Swap `networkidle` → `load` and inject theme**

At the `page.goto` (`:44`), replace `waitUntil: "networkidle"` with `waitUntil: "load"` (kills the content-heavy-page flake documented in the Task-4 baseline). Before navigation, set the theme by adding `.dark` to `documentElement` via an init script (same mechanism as `src/scripts/theme.ts`), threading the current `theme` through the `shoot()` signature:

```js
await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
if (theme === "dark") {
  await page.addInitScript(() => document.documentElement.classList.add("dark"));
}
await page.goto(url, { waitUntil: "load", timeout: 30000 });
```

- [ ] **Step 4: Loop themes inside the viewport loop**

Wrap the per-viewport capture in a `for (const theme of THEMES)` loop, and include `theme` in the output filename and the `summary.json` row key so light/dark never collide:

```js
for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    // ...existing shoot(story) / shoot(live) with theme passed in,
    // filenames: `${c.id}.${vp.name}.${theme}.{expected,actual,diff}.png`
  }
}
```

- [ ] **Step 5: Run the rehabbed pixel-check**

Run: `pnpm dev` (separate shell), then `pnpm pixel-check`
Expected: runs the full matrix without `networkidle` timeouts; `.pixel-report/summary.json` written with light+dark rows. Record the new pass/fail tally in `notes.md`.

- [ ] **Step 6: Commit**

```bash
git add scripts/pixel-check.mjs docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "feat(pixel-check): preview routes, 3x2 viewport/theme matrix, load waitUntil"
```

---

### Task 7: Re-anchor broken manifest selectors + close the gate

**Files:**
- Modify: `scripts/pixel-manifest.mjs`
- Append: `docs/specs/01_active/figma-blog-fit/notes.md`

**Interfaces:**
- Consumes: the Task-6 matrix run.
- Produces: story↔live goes from 2 passes to majority-pass; every residual fail has a one-line reason in `notes.md`.

- [ ] **Step 1: Identify the still-erroring selectors**

Run: `pnpm pixel-check` and collect every entry whose result is an error/size-mismatch (the ~11 buckets identified in the dev-styleguide notes plus any new ones exposed by preview-route widths).

- [ ] **Step 2: Re-anchor each to a stable owned/CVA class**

For each broken entry, replace the brittle selector with a stable class the component owns (a CVA variant class or a semantic `role`/`data-*`), verified against the live DOM. Example pattern (do this per entry, using the real class from the component):

```js
    // was: selector matched a Tailwind utility soup string that drifted
    selector: 'article[data-story="post-card"]',
```

If a component lacks a stable hook, add a `data-story="<id>"` attribute to its root element in the `.astro` file and select on that.

- [ ] **Step 3: Re-run until majority-pass**

Run: `pnpm pixel-check`
Expected: majority of (component × viewport × theme) cells pass. For each residual fail, write a one-line reason in `notes.md` (e.g. "animated shadow — masked", "live variant differs — skip"). No silent acceptance.

- [ ] **Step 4: Commit**

```bash
git add scripts/pixel-manifest.mjs src/components docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "fix(pixel-check): re-anchor broken selectors; majority-pass gate with logged residuals"
```

---

## STAGE 3 — Component geometry sweep

### Task 8: Web geometry extractor

**Files:**
- Create: `scripts/figma/extract-web-geometry.mjs`
- Modify: `package.json` (add `geometry:web` script)

**Interfaces:**
- Consumes: preview routes + `scripts/pixel-manifest.mjs`.
- Produces: `geometry.web.json` = `{ "<component-id>": { "<viewport>": { "<theme>": { root: {..props}, descendants: [{sel, ...props}] } } } }`. Prop subset: `fontSize`, `fontFamily`, `fontWeight`, `paddingTop/Right/Bottom/Left`, `gap`, `color`, `backgroundColor`, `borderRadius`, `borderColor`, `width` — all as `getComputedStyle` strings (px).

- [ ] **Step 1: Write the extractor**

Create `scripts/figma/extract-web-geometry.mjs`:

```js
#!/usr/bin/env node
// extract-web-geometry.mjs — Playwright over astrobook preview routes; reads a
// fixed getComputedStyle subset per component root into geometry.web.json.
// The "layout exact" prover, web side. Usage: node scripts/figma/extract-web-geometry.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { MANIFEST } from "../pixel-manifest.mjs";

const VIEWPORTS = [
  { w: 1280, name: "desktop" },
  { w: 768, name: "tablet" },
  { w: 390, name: "mobile" },
];
const THEMES = ["light", "dark"];
const PROPS = [
  "fontSize", "fontFamily", "fontWeight",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "gap", "color", "backgroundColor", "borderRadius", "borderTopColor", "width",
];

const browser = await chromium.launch();
const result = {};
for (const c of MANIFEST) {
  if (c.skip) continue;
  const previewPath = c.storyPath.replace("/styleguide/dashboard/", "/styleguide/stories/");
  result[c.id] = {};
  for (const vp of VIEWPORTS) {
    result[c.id][vp.name] = {};
    for (const theme of THEMES) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.w, height: 1200 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      if (theme === "dark") await page.addInitScript(() => document.documentElement.classList.add("dark"));
      await page.goto(`http://localhost:4321${previewPath}`, { waitUntil: "load", timeout: 30000 });
      const root = await page.$(c.selector);
      const props = root
        ? await root.evaluate((el, keys) => {
            const cs = getComputedStyle(el);
            const o = {};
            for (const p of keys) o[p] = cs[p];
            return o;
          }, PROPS)
        : null;
      result[c.id][vp.name][theme] = { root: props };
      await page.close();
    }
  }
  console.log(`geometry: ${c.id}`);
}
await browser.close();
writeFileSync("geometry.web.json", JSON.stringify(result, null, 2) + "\n");
console.log(`-> geometry.web.json (${Object.keys(result).length} components)`);
```

- [ ] **Step 2: Wire the script**

Add to `package.json` `scripts`: `"geometry:web": "node scripts/figma/extract-web-geometry.mjs"`.

- [ ] **Step 3: Run it against the dev server**

Run: `pnpm dev` (separate shell), then `pnpm geometry:web`
Expected: `geometry.web.json` written with a root prop block per component × 3 viewports × 2 themes. `width` reflects real container/full-bleed widths (proves the preview route carries live geometry).

- [ ] **Step 4: Commit**

```bash
git add scripts/figma/extract-web-geometry.mjs package.json
git commit -m "feat(geometry): web-side computed-style extractor over preview routes"
```

---

### Task 9: Figma geometry read (interactive MCP)

**Files:**
- Append: `scripts/figma/dump-tokens.md` (a "geometry read" section)
- Create: `geometry.figma.json` (git-ignored)

> **Interactive task — no unit test.** Gate = `geometry.figma.json` exists with the same prop subset per master as `geometry.web.json`, addressable by component name.

**Interfaces:**
- Produces: `geometry.figma.json` = `{ "<master-name>": { root: {..px props}, ... } }`. Same prop keys as web (converted to px: rem×16), so Task 10 diffs them directly.

- [ ] **Step 1: Record the traversal script**

Append to `scripts/figma/dump-tokens.md` a Figma geometry-read section: one batched `use_figma` traversal per component page reading, off each master node + its variable bindings, the same subset (font size/family/weight, padding, gap, fill, stroke color, corner radius, width). Use `get_metadata` first to scope node IDs (token economy), then the traversal.

- [ ] **Step 2: Run the read, save `geometry.figma.json`**

Execute via `use_figma`; write the return to `geometry.figma.json`. Convert any rem-bound values to px (× 16) so units match the web side.

- [ ] **Step 3: Commit the procedure**

```bash
git add scripts/figma/dump-tokens.md
git commit -m "docs(geometry): figma-side geometry read procedure"
```

---

### Task 10: Geometry diff → repair worklist

**Files:**
- Create: `scripts/figma/diff-geometry.mjs`
- Create: `scripts/figma/diff-geometry.test.mjs`

**Interfaces:**
- Consumes: `geometry.web.json` (Task 8), `geometry.figma.json` (Task 9).
- Produces: markdown worklist per master of prop mismatches; px↔px comparison, tolerance 0.5px; colors compared as normalized values. Warn-only exit 0.

- [ ] **Step 1: Write the failing test**

Create `scripts/figma/diff-geometry.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(dirname(fileURLToPath(import.meta.url)), "diff-geometry.mjs");
function run(web, figma) {
  const dir = mkdtempSync(join(tmpdir(), "diffgeo-"));
  const p = (n, o) => { const f = join(dir, n); writeFileSync(f, JSON.stringify(o)); return f; };
  const out = execFileSync("node", [script, p("w.json", web), p("f.json", figma)], { encoding: "utf8" });
  rmSync(dir, { recursive: true });
  return out;
}

const web = { "post-card": { desktop: { light: { root: { fontSize: "16px", paddingLeft: "24px", color: "rgb(30, 30, 30)" } } } } };

test("within tolerance is clean", () => {
  const figma = { "post-card": { root: { fontSize: "16px", paddingLeft: "24.3px", color: "rgb(30, 30, 30)" } } };
  assert.doesNotMatch(run(web, figma), /paddingLeft/);
});
test("over-tolerance px mismatch reported", () => {
  const figma = { "post-card": { root: { fontSize: "16px", paddingLeft: "16px", color: "rgb(30, 30, 30)" } } };
  assert.match(run(web, figma), /post-card[\s\S]*paddingLeft.*24.*16/);
});
test("color mismatch reported", () => {
  const figma = { "post-card": { root: { fontSize: "16px", paddingLeft: "24px", color: "rgb(0, 0, 0)" } } };
  assert.match(run(web, figma), /color.*30, 30, 30.*0, 0, 0/);
});
test("master absent in figma reported", () => {
  assert.match(run(web, {}), /post-card.*missing in figma/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/figma/diff-geometry.test.mjs`
Expected: FAIL — `diff-geometry.mjs` does not exist.

- [ ] **Step 3: Write the diff script**

Create `scripts/figma/diff-geometry.mjs`:

```js
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

const px = (v) => (typeof v === "string" && v.endsWith("px") ? parseFloat(v) : NaN);
const rows = [];
for (const [id, viewports] of Object.entries(web)) {
  const webRoot = viewports?.desktop?.light?.root;
  if (!webRoot) continue;
  const figRoot = fig[id]?.root;
  if (!figRoot) { rows.push(`- \`${id}\`: **missing in Figma** (no master matched)`); continue; }
  for (const [prop, wVal] of Object.entries(webRoot)) {
    const fVal = figRoot[prop];
    if (fVal == null) { rows.push(`- \`${id}\`.${prop}: web **${wVal}** vs figma **(absent)**`); continue; }
    const wPx = px(wVal), fPx = px(fVal);
    const ok = !Number.isNaN(wPx) && !Number.isNaN(fPx)
      ? Math.abs(wPx - fPx) <= 0.5
      : String(wVal).replace(/\s+/g, "").toLowerCase() === String(fVal).replace(/\s+/g, "").toLowerCase();
    if (!ok) rows.push(`- \`${id}\`.${prop}: web **${wVal}** vs figma **${fVal}**`);
  }
}
console.log(`## Geometry worklist\n\n${rows.length ? rows.join("\n") : "_clean_"}\n`);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/figma/diff-geometry.test.mjs`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Run against real data + record worklist**

Run: `node scripts/figma/diff-geometry.mjs geometry.web.json geometry.figma.json`
Expected: per-master worklist. Paste into `notes.md`. This is the Stage-3 repair input.

- [ ] **Step 6: Commit**

```bash
git add scripts/figma/diff-geometry.mjs scripts/figma/diff-geometry.test.mjs
git commit -m "feat(geometry): web↔figma geometry diff with repair worklist"
```

---

### Task 11: Master repairs + per-master screenshot gate (interactive)

**Files:**
- Modify: Figma masters (via `use_figma`)
- Append: `docs/specs/01_active/figma-blog-fit/notes.md`

> **Interactive task — no unit test.** Gate per master: `diff-geometry` clean-or-named-debt, and Figma `get_screenshot` vs the story PNG judged visually identical (token+layout bar, not pixel-diff).

- [x] **Step 1: Run the strictness audit passes**

Run Pass 1 (unbound fills/strokes) and Pass 2 (detached instances) from the `fe-figma-verify` SKILL (generic, reuse verbatim) over each component page. Fold Pass-1 unbound-hex flags into the repair worklist.

- [x] **Step 2: Repair masters, in sweep order**

Sweep order: chrome (Header/Footer) → cards → templates → ui atoms. Per master, in batched `use_figma` writes: fix the worklist geometry deltas on the **master only, never assembled templates** (F2); bind token variables, never paste raw hex (F4); use real collection content, never invented strings (F9).

- [x] **Step 3: Re-diff until clean or named-debt**

Run: `node scripts/figma/diff-geometry.mjs geometry.web.json geometry.figma.json` (re-run the Task-9 read first if masters changed geometry).
Expected: worklist empty, or each remaining line has a named-debt reason in `notes.md`.

- [x] **Step 4: Screenshot gate per master**

For each repaired master, `get_screenshot` and compare to that component's story preview PNG. Judge visually identical (bar is token+layout, not pixel). Log any accepted visual delta in `notes.md`.

- [x] **Step 5: Commit the notes**

```bash
git add docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "docs(geometry): master repair log + screenshot-gate results"
```

---

## STAGE 3b — Legacy 9 in Figma

### Task 12: Fix PostList + story so all 9 render

**Files:**
- Modify: `src/components/blog/PostList.astro:3`
- Create: `src/components/blog/PostList.stories.ts`

**Interfaces:**
- Consumes: `getAllBlogPosts` from `src/utils/repository.ts` (verified export, lines 14-21).
- Produces: `PostList` renders; a story exists so all 9 legacy components have a preview route.

Verified: `PostList.astro:3` currently `import { getAllPosts } from "src/utils/repository";` — `getAllPosts` is NOT exported; `getAllBlogPosts` IS.

- [x] **Step 1: Fix the import**

Edit `src/components/blog/PostList.astro:3`:

```astro
import { getAllBlogPosts } from "src/utils/repository";
```

Then update the call site in the same file (find `getAllPosts(` and rename to `getAllBlogPosts(`). This intentionally breaks the "restored verbatim" property from the dev-styleguide spec — legacy components are kept as variant material, superseding the delete-vs-adopt verdict.

- [x] **Step 2: Create the story**

Create `src/components/blog/PostList.stories.ts`:

```ts
import PostList from "./PostList.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";

export default {
  component: PostList,
  decorators: [{ component: StoryContainer }],
};

export const Default = { args: {} };
```

- [x] **Step 3: Verify it renders**

Run: `pnpm dev`, open `http://localhost:4321/styleguide/stories/src/components/blog/post-list/default`
Expected: PostList renders a list of real posts, no `getAllPosts` error.

- [x] **Step 4: Commit**

```bash
git add src/components/blog/PostList.astro src/components/blog/PostList.stories.ts
git commit -m "fix(blog): PostList getAllPosts→getAllBlogPosts + story (legacy variant material)"
```

---

### Task 13: Build the 🗄️ Legacy Figma page (interactive)

**Files:**
- Modify: Figma file (new page `🗄️ Legacy`, 9 masters)
- Append: `docs/specs/01_active/figma-blog-fit/notes.md`

> **Interactive task — no unit test.** Legacy components have no live page — their story preview route IS the reference. Gate: 9 masters built, bound to S0 variables/text styles, real collection content, geometry read + screenshot-judged against each story preview. The story↔live pixel-check cell is skipped (nothing live to diff).

- [ ] **Step 1: Extract legacy geometry**

Ensure the 9 legacy components are in the manifest (add entries with `skip`-for-live but included for geometry) or run `extract-web-geometry` against their preview routes directly. Produce their `geometry.web.json` blocks.

- [ ] **Step 2: Build 9 masters on a new page**

In batched `use_figma` writes: create page `🗄️ Legacy`; build WorkCard, WorkCardImage, WorksPreview, BlogPreview, PostCard, PostList, SerieList, SerieListItem, SeriePostCard as masters. Bind existing S0 variables + text styles (F4), use real collection content (F9). Keep them on a separate page so variant experiments stay out of the live catalog.

- [ ] **Step 3: Geometry + screenshot gate**

Run the Task-9 read over the legacy masters, then `node scripts/figma/diff-geometry.mjs` for those ids; screenshot-gate each against its story preview. Log results in `notes.md`.

- [ ] **Step 4: Commit the notes**

```bash
git add docs/specs/01_active/figma-blog-fit/notes.md scripts/pixel-manifest.mjs
git commit -m "docs(legacy): 🗄️ Legacy Figma page build + geometry/screenshot log"
```

---

## STAGE 3c — Missing component masters (unblocks Task 14)

> **Why this stage exists:** Task 9's live inventory (notes.md) found the `🧩 Components` page
> holds masters for only **15 of the 40** manifest components; Task 13 added the legacy 9. That
> leaves **25 manifest components with no master**. Task 14 builds template frames from
> **instances only** (F2) — a component with no master has no instance, so Home/Blog/Work/About
> cannot be assembled faithfully until these masters exist. This stage closes the gap.
>
> **Scope triage of the 25 missing (per analysis 2026-07-21):**
> - **4 = text styles, NOT masters** — `ui-h1`, `ui-h2`, `ui-p`, `ui-prose`. Covered by S0 text
>   styles (`Title/H1`, `Heading/H2`, `Body/Base`). No build; documented in Step 0 below.
> - **4 = utility/image plumbing, skip** — `ui-customimage`, `contact-contactimage`,
>   `ui-socialshare`, `hero-herosocials`. Astro image/effect wrappers, not DS content. No build.
> - **5 = page-section compositions** — `hero-hero`, `about-aboutstrip`, `blog-selectedwriting`,
>   `work-worksstrip`, `contact-contact`. Built as **Task 14 template frame sections**, not
>   standalone masters. No build here.
> - **12 = genuine missing masters** — built here in 3 batches.
>
> Web geometry for all 12 already exists in `geometry.web.json` (they are manifest ids captured
> by Task 8) — no `extract-web-geometry` re-run needed; only the Figma-side read + build + diff.

### Task 13b: Build the 12 missing component masters (interactive)

**Files:**
- Modify: Figma file (`🧩 Components` page — extend existing sections / add new ones; these are
  live v3 components, so they belong on Components, **not** the 🗄️ Legacy page)
- Append: `docs/specs/01_active/figma-blog-fit/notes.md`

> **Interactive task — no unit test.** Same gate as Task 13 per master: bound to S0
> variables/text styles, real collection content (F9), instances-only where a master already
> exists (F2), `diff-geometry` clean-or-named-debt, `get_screenshot` judged visually identical to
> the story preview PNG (token+layout bar, not pixel-diff). Read `/figma-use` before any
> `use_figma` call. One batched write per batch.

- [x] **Step 0: Record the no-build set in notes.md**

Before building, write a short section in `notes.md` listing the 13 documented no-build ids (4
text-style + 4 utility + 5 template-section) with the one-line reason each, so the gap is closed
on paper and never re-surfaces as "missing" without explanation. Cross-reference: text-style ids
map to S0 text styles; section ids map to Task 14 frames.

- [x] **Step 1: Batch A — Blog masters (4)**

Build masters for `blog-postlistitem`, `blog-relatedwork`, `blog-seriecontents`,
`blog-seriepostlistitem`. Per master, in one batched `use_figma` write: build on the `🧩
Components` page (extend the relevant section or add one), bind S0 variables + text styles (F4),
use real collection content (F9). Story preview routes for reflow/content reference:
`http://localhost:4321/styleguide/stories/src/components/blog/<kebab>/default`
(`post-list-item`, `related-work`, `serie-contents`, `serie-post-list-item`).

- [x] **Step 2: Batch B — Work masters (4)**

Same procedure for `work-archivetable`, `work-relatedwriting`, `work-workgallerycard`,
`work-workheader`. Preview routes under `.../work/<kebab>/...` (`work-gallery-card` has `square`
+ `video` variants — build both as a component set or note the single canonical variant chosen).

- [x] **Step 3: Batch C — About + text-block masters (4)**

Same procedure for `about-aboutfacts`, `about-abouttext`, `hero-herotext`, `contact-contacttext`.

- [x] **Step 4: Geometry + screenshot gate (per batch)**

After each batch, run the Task-9 Figma geometry read over the new masters, then
`node scripts/figma/diff-geometry.mjs geometry.web.json geometry.figma.json` filtered to the batch
ids. Screenshot-gate each master against its story preview. The known non-actionable categories
from Task 10/11/13 apply (font-prop "(absent)" on non-TEXT roots, container-width deltas,
`gap: "normal"` string quirk) — log any batch-specific delta or named-debt in `notes.md`.

- [x] **Step 5: Commit the notes**

```bash
git add docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "docs(masters): 12 missing component masters (blog/work/about batches) + no-build set"
```

---

## STAGE 4 — Responsive + dark template frames

### Task 14: 24 template frames (interactive)

**Files:**
- Modify: Figma file (template frames)
- Append: `docs/specs/01_active/figma-blog-fit/notes.md`

> **Interactive task — no unit test.** Gate: 4 templates (Home / Blog / Work / About) × 3 widths (1280/768/390) × 2 themes = 24 frames, instances-only, superseded builds archived (F8). Screenshot-judged against live/story at each width+theme.

- [ ] **Step 1: Build responsive frames**

Per template, add 768 + 390 frames beside the existing desktop-1280. Reuse the repaired masters as **instances only** (F2 — never edit masters inside templates). Copy reflow from the story/live screenshots at those widths.

- [ ] **Step 2: Build dark duplicates**

Per frame, create a dark duplicate via explicit variable-mode override (Pro-tier modes verified in S0). 4 × 3 × 2 = 24 frames total.

- [ ] **Step 3: Archive superseded builds (F8)**

Retire any prior desktop-only template build in the same pass so the file has one canonical set.

- [ ] **Step 4: Screenshot gate + final audit**

Screenshot-judge each frame against live/story at its width+theme. Re-run the adapted strictness audit (Pass 0 inventory, Pass 1 unbound fills, Pass 2 detached instances) — must be clean. Log in `notes.md`.

- [ ] **Step 5: Final verify + commit**

Run: `pnpm test && pnpm figma:verify`
Expected: all tests pass; token diff clean or expected-gap only.

```bash
git add docs/specs/01_active/figma-blog-fit/notes.md
git commit -m "docs(templates): 24 responsive+dark template frames; final audit log"
```

- [ ] **Step 6: Archive the spec**

Run: `./docs/specs/specs.sh archive figma-blog-fit`
Expected: stamps `shipped:` and updates `INDEX.md`.

---

## Success criteria (from design)

- `diff-tokens` clean, both modes (Task 3).
- `diff-geometry` clean or named-debt per master, including the legacy 9 (Tasks 10, 11, 13).
- pixel-check majority green at preview routes; every residual fail explained (Tasks 6, 7).
- Figma: 24 template frames + repaired masters + 🗄️ Legacy page; strictness audit (Pass 0/1/2) clean (Tasks 11, 13, 14).
- Standing drift check `pnpm figma:verify` runs any time (Task 2).

## Notes on adaptation from `fe-figma-verify`

- `diff-tokens.mjs` copied near-verbatim; only the tolerance comment (rem×13 → rem×16), the `expected` class check (`color`/`font` use `raw`), and float tolerance (0.05 → 0.5) changed.
- `extract-code-tokens.mjs` is a re-source, not a copy: same push/block/guard structure, new source blocks for `global.css`; ROOT_PX 13 → 16; guard reads `Layout.astro` instead of `index.html`.
- Dump script reused with **per-mode expansion** (this DS's Color collection has Light + Dark; the Uhlive dump read `modes[0]` only). Uhlive changelog / DS-HASH passes dropped.
- Pass 0 (live inventory), Pass 1 (unbound fills), Pass 2 (detached instances) reused verbatim. Passes 3/4/4b (PrimeOne collection drift, changelog freshness, foundation-page hash) are Uhlive-specific — dropped.
