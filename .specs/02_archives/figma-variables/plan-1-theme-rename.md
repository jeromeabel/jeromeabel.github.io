---
title: Plan 1 — theme rename + font correction
created: 2026-07-29
---

# Figma Variables — Plan 1: Theme Rename + Font Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the 8 project colour tokens to their semantic names in both `global.css` and the Figma `Color` collection (renamed in place to `2 Theme`), delete the `background-accent` token, and correct the three font families Figma has wrong.

**Architecture:** Code is truth. `src/styles/global.css` is renamed first, then `src/` is swept mechanically, then Figma's `Color` collection is **renamed in place** (never recreated — its id `VariableCollectionId:3:2` is referenced by frame-level `explicitVariableModes` overrides on every dark frame). The existing `scripts/figma/` token pipeline (`extract-code-tokens.mjs` → `diff-tokens.mjs` through `token-map.json`) is the verification gate: after both sides move, `pnpm figma:verify` must report zero `Missing in Figma`, zero `Value mismatch`, zero `Unmapped`.

**Tech Stack:** Astro 5, Tailwind CSS v4 (CSS-native `@theme`), Node `node --test`, Figma Plugin API via the `use_figma` MCP tool.

## Global Constraints

- Figma file key: **`ihWIWmvtQPTWgUxlrVjC2c`** — "Blog Design System v1.0", the live design file from 2026-07-29 onward. All `use_figma` and `get_screenshot` calls in this plan target it.
  - The previous file `Wf4iomVMYUXlFIBV3Z8bx4` (build `ds-blog-v3-01`) is a **read-only backup** for the duration of this migration. Never write to it. It stays referenced in `.specs/02_archives/**` as the historical record — do not rewrite those.
  - v1.0 is a fork of the backup, so **the node and collection ids below are identical in both** (verified 2026-07-29: `VariableCollectionId:3:2` present with 8 vars and modes Light `3:0` / Dark `3:1`; 📄 Pages at `44:328`; 26 dark-frame `explicitVariableModes` overrides on `3:2`). Anything scripted against ids still works — only the `fileKey` argument changes.
  - v1.0 also carries work the backup does not: pages `Components (new)` (`461:759`) and `Pages Experiment` (`442:5352`), plus an empty collection `Primitives` (`VariableCollectionId:453:2`). This plan touches none of them.
- **Never delete or recreate the `Color` collection** (`VariableCollectionId:3:2`). Rename it. Dark frames carry `explicitVariableModes = { "VariableCollectionId:3:2": "3:1" }`; replacing the collection breaks every one of them.
- **Read the `figma-use` skill before any `use_figma` call in a session.** Pass `skillNames: "figma-use"`.
- `use_figma` is atomic — a failed script changes nothing. On error: stop, read the message, fix, retry. Do not retry verbatim.
- Naming rule: **Figma name = the CSS custom property minus `--`, with Tailwind's namespace as the folder.** `--color-foreground-muted` → `color/foreground-muted` → `text-foreground-muted`.
- Units: Figma number variables store **pixels**; CSS stays in rem; `diff-tokens.mjs` converts `rem × 16`.
- `tracking/*` stays reference-only — never bind letter-spacing (Figma coerces it to px and destroys size-independence).
- This plan makes **zero visual change**. Every hex value is preserved; only names move.
- Commit at the end of each task. Prefix: `refactor(tokens):` for code, `docs:` for spec updates.

## Rename table (load-bearing — used by every task)

| Old CSS var                       | New CSS var                 | Old Figma leaf                  | New Figma leaf            |
| --------------------------------- | --------------------------- | ------------------------------- | ------------------------- |
| `--color-background`              | `--color-background`        | `color/background`              | `color/background`        |
| `--color-foreground`              | `--color-foreground`        | `color/foreground`              | `color/foreground`        |
| `--color-muted-background`        | `--color-surface`           | `color/muted-background`        | `color/surface`           |
| `--color-muted-background-accent` | `--color-surface-hover`     | `color/muted-background-accent` | `color/surface-hover`     |
| `--color-muted`                   | `--color-foreground-muted`  | `color/muted`                   | `color/foreground-muted`  |
| `--color-foreground-accent`       | `--color-foreground-strong` | `color/foreground-accent`       | `color/foreground-strong` |
| `--color-muted-border`            | `--color-border`            | `color/muted-border`            | `color/border`            |
| `--color-background-accent`       | **deleted**                 | `color/background-accent`       | **deleted**               |

**Order matters when sweeping** — longest match first, or `muted-background-accent` gets half-rewritten by the `muted-background` rule.

## Measured usage (verified 2026-07-29, `src/` only)

| Utility                      | Occurrences                                                         |
| ---------------------------- | ------------------------------------------------------------------- |
| `text-muted`                 | 60                                                                  |
| `border-muted-border`        | 30                                                                  |
| `bg-muted-background`        | 18                                                                  |
| `border-muted`               | 4                                                                   |
| `bg-muted-background-accent` | 2                                                                   |
| `text-foreground-accent`     | 2 (+1 `dark:` variant, +2 `var()` reads in `TableOfContents.astro`) |
| `text-background-accent`     | 1                                                                   |

38 files. `border-muted` (4 sites: `ValueCard.astro:25`, `ContactText.astro:45`, `Link.astro:15,17`) are dashed borders deliberately painted with the _text_ muted colour — they become `border-foreground-muted`. That reads odd but is the honest mechanical result; changing them to `border-border` would be a **visual change** (`#5b5b5b` → `#d1ddbb`) and is explicitly out of scope. Noted as a follow-up, not done here.

## File Structure

| File                                         | Responsibility                          | Change                                                                                         |
| -------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `scripts/figma/token-map.json`               | code-token-name → Figma path mapping    | Modify — new names, new collection prefix `2 Theme`, fonts move out of `ignore`                |
| `scripts/figma/extract-code-tokens.mjs`      | parse `global.css` → `tokens.code.json` | Modify — emit `font-*-primary` tokens (first family only) so the font fix is machine-checkable |
| `scripts/figma/extract-code-tokens.test.mjs` | tests for the extractor                 | Modify — cover the new font-primary tokens                                                     |
| `src/styles/global.css`                      | token definitions                       | Modify — rename 7, delete 1                                                                    |
| `src/**/*.astro`                             | consumers                               | Modify — mechanical sweep, 38 files                                                            |
| Figma `Color` collection                     | themed colour source of truth           | Rename in place → `2 Theme`; rename 7 vars, delete 1, set scopes, add 3 font vars              |
| `tokens.figma.json`                          | dump artifact at repo root              | Regenerate                                                                                     |

---

### Task 1: Teach the extractor to emit checkable font tokens

Today `font-sans` / `font-title` / `font-mono` sit in `token-map.json`'s `ignore` list because the CSS value is a full fallback stack (`"IBM Plex Sans", sans-serif, …`) and Figma stores only the family (`"IBM Plex Sans"`). That makes the font correction unverifiable. Emit a second token per font carrying only the first family.

**Files:**

- Modify: `scripts/figma/extract-code-tokens.mjs:76-83` (the `@theme` block)
- Test: `scripts/figma/extract-code-tokens.test.mjs`

**Interfaces:**

- Produces: token objects `{ name: "font-sans-primary", raw: "IBM Plex Sans", px: null, class: "font", source: "global.css @theme" }` — consumed by Task 2's `token-map.json` and by `diff-tokens.mjs` (which compares `t.raw` for `class === "font"`).

- [ ] **Step 1: Write the failing test**

Append to `scripts/figma/extract-code-tokens.test.mjs`:

```js
test("emits a *-primary token holding only the first font family", () => {
  const { tokens } = JSON.parse(readFileSync(OUT, "utf8"));
  const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));

  assert.equal(byName["font-sans-primary"].raw, "IBM Plex Sans");
  assert.equal(byName["font-title-primary"].raw, "Bubbler One");
  assert.equal(byName["font-mono-primary"].raw, "Fira Code");
  assert.equal(byName["font-sans-primary"].class, "font");

  // the full stack token still exists, unchanged
  assert.match(byName["font-sans"].raw, /^"IBM Plex Sans", sans-serif/);
});
```

If the existing test file does not already define `OUT` and run the extractor, mirror whatever harness the other tests in that file use — read the file first and follow its established pattern rather than inventing a second one.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — `Cannot read properties of undefined (reading 'raw')` on `font-sans-primary`.

- [ ] **Step 3: Write the implementation**

In `scripts/figma/extract-code-tokens.mjs`, inside the `// 2. @theme` block, after the existing `--font-*` loop:

```js
for (const m of theme.matchAll(/--(font-[\w-]+):\s*([\s\S]*?);/g)) {
  const stack = m[2].replace(/\s+/g, " ").trim();
  // First family only — Figma FONT_FAMILY variables hold one family, not a
  // fallback stack, so this is the value the diff can actually compare.
  const first = stack
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
  push(`${m[1]}-primary`, first, null, "font", "global.css @theme");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS, all tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/figma/extract-code-tokens.mjs scripts/figma/extract-code-tokens.test.mjs
git commit -m "feat(figma): extract font-*-primary tokens for family-level diffing"
```

---

### Task 2: Rename the tokens in `global.css` and update the token map

**Files:**

- Modify: `src/styles/global.css:28-49`
- Modify: `scripts/figma/token-map.json`
- Modify: `src/components/work/WorkCardImage.astro:52`

**Interfaces:**

- Consumes: `font-*-primary` token names from Task 1.
- Produces: the CSS custom properties `--color-surface`, `--color-surface-hover`, `--color-foreground-muted`, `--color-foreground-strong`, `--color-border` — consumed by Task 3's sweep and by Figma in Task 4.

- [ ] **Step 1: Rewrite the `@theme` and `@variant dark` blocks**

Replace `src/styles/global.css:28-37` (`@theme` colour lines) with:

```css
--color-background: #f5ffe1;
--color-foreground: #1e1e1e;
--color-foreground-strong: #101010;

--color-foreground-muted: #5b5b5b;
--color-border: #d1ddbb;
--color-surface: #e0eec4;
--color-surface-hover: #d1ddbb;
```

Replace `src/styles/global.css:39-49` (`@variant dark` block body) with:

```css
@variant dark {
  --color-background: #1e1e1e;
  --color-foreground: #ececec;
  --color-foreground-strong: #f7f7f7;

  --color-foreground-muted: #9b9b9b;
  --color-border: #4c4c4c;
  --color-surface: #343434;
  --color-surface-hover: #4c4c4c;
}
```

Both `--color-background-accent` declarations are gone. Every remaining hex is byte-identical to before.

- [ ] **Step 2: Rewrite the single `background-accent` call site**

`src/components/work/WorkCardImage.astro:52` currently reads:

```astro
class="font-title text-background-accent dark:text-foreground-accent text-3xl
lg:text-4xl"
```

The light hex is `#f7f7f7` and the dark hex is `#101010` — the pair exists only to fake a mode-invariant near-white over an image. Replace with a genuinely mode-invariant colour:

```astro
class="font-title text-3xl text-white lg:text-4xl"
```

This is a deliberate ~3% luminance change on one label (`#f7f7f7` → `#ffffff` in light mode, `#101010` → `#ffffff` in dark mode). The dark-mode change is the larger one: the label was near-black over the image and becomes white. **Look at this card in both themes before committing** (Task 3, Step 4) — if the dark rendering is wrong, the fallback is `text-foreground-strong` in dark, which preserves today's exact appearance.

- [ ] **Step 3: Update `scripts/figma/token-map.json`**

Replace the whole file with:

```json
{
  "map": {
    "light/color-background": "2 Theme/Light/color/background",
    "light/color-foreground": "2 Theme/Light/color/foreground",
    "light/color-foreground-strong": "2 Theme/Light/color/foreground-strong",
    "light/color-foreground-muted": "2 Theme/Light/color/foreground-muted",
    "light/color-border": "2 Theme/Light/color/border",
    "light/color-surface": "2 Theme/Light/color/surface",
    "light/color-surface-hover": "2 Theme/Light/color/surface-hover",
    "dark/color-background": "2 Theme/Dark/color/background",
    "dark/color-foreground": "2 Theme/Dark/color/foreground",
    "dark/color-foreground-strong": "2 Theme/Dark/color/foreground-strong",
    "dark/color-foreground-muted": "2 Theme/Dark/color/foreground-muted",
    "dark/color-border": "2 Theme/Dark/color/border",
    "dark/color-surface": "2 Theme/Dark/color/surface",
    "dark/color-surface-hover": "2 Theme/Dark/color/surface-hover",
    "font-sans-primary": "2 Theme/Light/font/sans",
    "font-title-primary": "2 Theme/Light/font/title",
    "font-mono-primary": "2 Theme/Light/font/mono"
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

The full-stack `font-*` tokens stay ignored (a fallback stack has no Figma counterpart); the `-primary` variants are the checkable ones. `container-*` stays ignored until Plan 3 introduces `3 Responsive`.

- [ ] **Step 4: Verify the extractor still parses cleanly**

Run: `node scripts/figma/extract-code-tokens.mjs tokens.code.json && pnpm test`
Expected: `17 tokens -> tokens.code.json` (14 colours + 3 font stacks + 3 font-primary + 2 container = count will differ; the assertion that matters is **exit 0** and all tests passing). Then confirm the new names are present:

```bash
grep -c "color-surface\|color-foreground-muted\|color-border" tokens.code.json
```

Expected: non-zero, and `grep -c background-accent tokens.code.json` returns `0`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/components/work/WorkCardImage.astro scripts/figma/token-map.json
git commit -m "refactor(tokens): rename theme colours to semantic names, drop background-accent"
```

---

### Task 3: Sweep `src/` for the renamed utilities

**Files:**

- Modify: 38 files under `src/` (mechanical)

**Interfaces:**

- Consumes: the CSS custom property names produced in Task 2.

- [ ] **Step 1: Run the sweep, longest-match first**

Order is load-bearing. Run exactly this sequence:

```bash
FILES=$(grep -rlE "muted|foreground-accent" src/)
sed -i \
  -e 's/muted-background-accent/surface-hover/g' \
  -e 's/muted-background/surface/g' \
  -e 's/muted-border/border/g' \
  -e 's/foreground-accent/foreground-strong/g' \
  -e 's/\bborder-muted\b/border-foreground-muted/g' \
  -e 's/\btext-muted\b/text-foreground-muted/g' \
  -e 's/--color-muted\b/--color-foreground-muted/g' \
  $FILES
```

The two `\b`-anchored `-muted` rules must run **after** the `muted-border` / `muted-background` rules, otherwise they would eat the prefix of the longer names.

- [ ] **Step 2: Verify no stale names survive**

```bash
grep -rnE "muted-background|muted-border|foreground-accent|background-accent|\b(text|bg|border)-muted\b" src/
```

Expected: **no output**. If `TableOfContents.astro:76-77` still shows `var(--color-foreground-accent)`, the `foreground-accent` rule missed it — fix by hand.

Then check the new names landed:

```bash
grep -rc "text-foreground-muted" src/ | grep -v ":0" | wc -l   # expect ~20 files
grep -rn "border-border" src/ | wc -l                          # expect 30
```

- [ ] **Step 3: Build and format**

```bash
pnpm format:write && pnpm build
```

Expected: build succeeds. A Tailwind v4 build **will not fail** on an undefined colour utility — it silently emits nothing — so the build passing is necessary, not sufficient. Step 4 is the real gate.

- [ ] **Step 4: Visual verification (the real gate)**

```bash
pnpm dev
```

Open `localhost:4321` and check, in **both light and dark**:

1. Home — card surfaces (`bg-surface`) are still the pale-lime / dark-grey blocks, not transparent.
2. Any page footer / bordered list — dashed and solid borders still visible (`border-border`, `border-foreground-muted`).
3. Header — theme toggle and motion toggle still change background on hover (`hover:bg-surface-hover`).
4. `/work` — the card title over the image (the `text-white` change from Task 2 Step 2). **This is the one intended visual delta.** If it reads badly in dark mode, revert that one class to `text-foreground-strong dark:text-foreground-strong` and note it.
5. A serie post — the current entry in the contents list is still emphasised (`text-foreground-strong`), and the active TOC entry still has its accent colour.

Any element that lost its colour means a utility name did not resolve — grep that component for the old name.

- [ ] **Step 5: Commit**

```bash
git add -A src/
git commit -m "refactor(tokens): sweep src/ to renamed semantic colour utilities"
```

---

### Task 4: Rename the Figma `Color` collection in place and scope it

**Files:**

- Figma file `ihWIWmvtQPTWgUxlrVjC2c` ("Blog Design System v1.0"), collection `VariableCollectionId:3:2`

**Interfaces:**

- Consumes: the new leaf names from the rename table.
- Produces: collection named `2 Theme` holding 7 colour variables — the paths `token-map.json` (Task 2) points at, and the collection Plan 2 re-points to brand aliases.

- [ ] **Step 1: Read the `figma-use` skill**

Required before any `use_figma` call this session. Do not skip.

- [ ] **Step 2: Rename the collection and its variables, delete `background-accent`, set scopes**

One `use_figma` call, `fileKey: "ihWIWmvtQPTWgUxlrVjC2c"`, `skillNames: "figma-use"`:

```js
const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(
  (c) => c.id === "VariableCollectionId:3:2",
);
if (!col)
  throw new Error(
    "Color collection VariableCollectionId:3:2 not found — do NOT create a new one",
  );

const RENAME = {
  "color/muted-background-accent": "color/surface-hover",
  "color/muted-background": "color/surface",
  "color/muted-border": "color/border",
  "color/foreground-accent": "color/foreground-strong",
  "color/muted": "color/foreground-muted",
};
const SCOPES = {
  "color/background": ["FRAME_FILL", "SHAPE_FILL"],
  "color/surface": ["FRAME_FILL", "SHAPE_FILL"],
  "color/surface-hover": ["FRAME_FILL", "SHAPE_FILL"],
  "color/foreground": ["TEXT_FILL"],
  "color/foreground-muted": ["TEXT_FILL"],
  "color/foreground-strong": ["TEXT_FILL"],
  "color/border": ["STROKE_COLOR"],
};

const renamed = [],
  deleted = [],
  scoped = [];
for (const id of [...col.variableIds]) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name === "color/background-accent") {
    v.remove();
    deleted.push(id);
    continue;
  }
  if (RENAME[v.name]) {
    v.name = RENAME[v.name];
    renamed.push(v.name);
  }
}
// second pass — scopes keyed by the NEW names
for (const id of [...col.variableIds]) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (SCOPES[v.name]) {
    v.scopes = SCOPES[v.name];
    scoped.push(v.name);
  }
}
col.name = "2 Theme";
return {
  collection: col.name,
  id: col.id,
  renamed,
  deleted,
  scoped,
  remaining: col.variableIds.length,
};
```

Expected return: `renamed` has 5 entries, `deleted` has 1, `scoped` has 7, `remaining` is 7, `id` is still `VariableCollectionId:3:2`.

**If `deleted` is empty**, `color/background-accent` was already gone — fine, continue. **If `remaining` is not 7**, stop and inspect before proceeding.

- [ ] **Step 3: Verify dark frames survived**

The whole point of renaming rather than replacing is that `explicitVariableModes` overrides keep pointing at `VariableCollectionId:3:2`. Confirm with one read-only `use_figma` call:

```js
const page = await figma.getNodeByIdAsync("44:328"); // 📄 Pages
await figma.setCurrentPageAsync(page);
const darkFrames = page.findAll(
  (n) =>
    n.explicitVariableModes &&
    n.explicitVariableModes["VariableCollectionId:3:2"],
);
return {
  count: darkFrames.length,
  sample: darkFrames.slice(0, 5).map((n) => n.name),
};
```

Expected: `count` > 0 and the sample names are the `— Dark` frames. A count of `0` means the overrides were lost — stop and restore from Figma version history.

- [ ] **Step 4: Screenshot a dark frame**

Use `get_screenshot` on one `— Dark` page frame from the sample. It must still render dark. If it renders light, the mode override is gone — restore from version history.

---

### Task 5: Correct the font families and move them into `2 Theme`

Figma's `Typography` collection declares `family/sans` = Inter, `family/serif` = Merriweather, `family/mono` = JetBrains Mono. The site uses **IBM Plex Sans / Bubbler One / Fira Code**, and has no serif at all — it has `--font-title`. Figma is simply wrong.

Verified: **no node in the file binds a font family** (the only `Typography` bindings anywhere are 33 `fontWeight` bindings). So creating the corrected variables in `2 Theme` costs nothing in rebinding — the old `family/*` variables die with the `Typography` collection in Plan 2.

**Files:**

- Figma file `ihWIWmvtQPTWgUxlrVjC2c` ("Blog Design System v1.0"), collection `2 Theme` (`VariableCollectionId:3:2`)

**Interfaces:**

- Produces: `font/sans`, `font/title`, `font/mono` in `2 Theme` — the paths `token-map.json` points at (Task 2 Step 3).

Both scripts below run with `fileKey: "ihWIWmvtQPTWgUxlrVjC2c"`, `skillNames: "figma-use"`.

- [ ] **Step 1: Confirm the families exist in this Figma file**

```js
const fonts = await figma.listAvailableFontsAsync();
const want = ["IBM Plex Sans", "Bubbler One", "Fira Code"];
const have = {};
for (const w of want)
  have[w] = fonts
    .filter((f) => f.fontName.family === w)
    .map((f) => f.fontName.style);
return have;
```

Expected: each family maps to a non-empty style list. If any is empty, the font is not available to the file — record it in `notes.md` and still create the variable (a `FONT_FAMILY` variable holds a string; it does not require the font to be installed to be _stored_, only to be _applied_ to text).

- [ ] **Step 2: Create the three font variables in `2 Theme`**

```js
const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(
  (c) => c.id === "VariableCollectionId:3:2",
);
const [lightMode, darkMode] = col.modes.map((m) => m.modeId);

const FONTS = {
  "font/sans": "IBM Plex Sans",
  "font/title": "Bubbler One",
  "font/mono": "Fira Code",
};
const created = [];
for (const [name, family] of Object.entries(FONTS)) {
  const v = figma.variables.createVariable(name, col, "STRING");
  // Every variable must define a value per mode. These are brand knobs, not
  // themed values — the duplication across Light/Dark is Figma-forced, and is
  // accepted here to avoid a fourth collection.
  v.setValueForMode(lightMode, family);
  v.setValueForMode(darkMode, family);
  v.scopes = ["FONT_FAMILY"];
  created.push({ name, id: v.id });
}
return { created, total: col.variableIds.length };
```

Expected: 3 created, `total` is 10 (7 colours + 3 fonts).

- [ ] **Step 3: Re-dump `tokens.figma.json`**

Run the dump script from `scripts/figma/dump-tokens.md` (one `use_figma` call, the script in that file, unchanged) against `fileKey: "ihWIWmvtQPTWgUxlrVjC2c"` and save the returned JSON to `tokens.figma.json` at repo root. The dump must come from v1.0, not the backup file — a dump from the backup would show the pre-rename names and fail Step 4.

- [ ] **Step 4: Run the verification gate**

```bash
pnpm figma:verify
```

Expected output: `Missing in Figma` = `_none_`, `Value mismatch` = `_none_`, `Unmapped` = `_none_`.

`Orphaned in Figma` will list nothing for `2 Theme` (all 10 variables are mapped or ignored). If anything appears under Missing/Mismatch, the Figma leaf name does not match `token-map.json` — fix the Figma name, not the map (code is truth).

- [ ] **Step 5: Commit**

```bash
git add tokens.code.json tokens.figma.json
git commit -m "chore(figma): rename Color -> 2 Theme, correct font families, refresh token dump"
```

---

### Task 6: Record the outcome

**Files:**

- Modify: `.specs/01_active/figma-variables/design.md` (Migration order section)
- Modify: `.specs/01_active/figma-variables/notes.md` (if anything new was learned)

- [ ] **Step 1: Mark steps 1–2 done in `design.md`**

Under `## Migration order`, mark items 1 and 2 as shipped with the commit hashes.

- [ ] **Step 2: Record any surprise in `notes.md`**

Specifically: whether the `text-white` change on `WorkCardImage` held in dark mode, whether `pnpm figma:verify` came back clean on the first try, and the mid-plan switch to Figma file `ihWIWmvtQPTWgUxlrVjC2c` ("Blog Design System v1.0") with `Wf4iomVMYUXlFIBV3Z8bx4` demoted to backup — including the finding that v1.0 is a fork carrying identical collection/node ids.

- [ ] **Step 3: Commit**

```bash
git add .specs/01_active/figma-variables/
git commit -m "docs(specs): figma-variables — steps 1-2 shipped"
```

---

## Exit criteria

- `pnpm figma:verify` reports zero Missing / zero Mismatch / zero Unmapped.
- `pnpm build` succeeds; `pnpm test` passes.
- `grep -rE "muted-background|muted-border|foreground-accent|background-accent" src/` returns nothing.
- Dark page frames in Figma still render dark (mode overrides intact).
- No visual change on the live site except the one intended `WorkCardImage` label.

Plan 2 (`plan-2-primitives-merge.md`) picks up from here.
