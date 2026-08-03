---
title: Plan 3 — retire Color Tokens, add 3 Responsive
created: 2026-07-29
---

# Figma Variables — Plan 3: Cleanup & Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebind and delete the last legacy collection (`Color Tokens`, 392 vars / 29 live bindings), then add `3 Responsive` — a three-mode collection for the values that genuinely vary by viewport width — leaving the file at exactly three collections, all machine-verified against code.

**Architecture:** Two independent halves. The cleanup half is the same value-based rebind machinery as Plan 2, applied to colours instead of numbers, with one extra guard: `explicitVariableModes` overrides may point at `Color Tokens`' collection id, and deleting a collection under a live mode override silently drops the override. The responsive half adds two code tokens (`--spacing-section`, `--spacing-section-lg`) so section rhythm stops being a magic utility pair and starts being a checked token — the only thing in the container/rhythm family that actually varies by width.

**Tech Stack:** Tailwind CSS v4 (`@theme`, `@utility`), Node `node --test`, Figma Plugin API via `use_figma`.

**Depends on:** Plan 2 complete — Figma holds `1 Primitives`, `2 Theme`, `Color Tokens` and nothing else; `pnpm figma:verify` clean.

## Global Constraints

- Figma file key: **`ihWIWmvtQPTWgUxlrVjC2c`** ("Blog Design System v1.0"). `Wf4iomVMYUXlFIBV3Z8bx4` is the read-only backup until this migration completes — never write to it. v1.0 is a fork, so all collection and node ids are unchanged.
- **Read the `figma-use` skill before any `use_figma` call in a session.** Pass `skillNames: "figma-use"`.
- `use_figma` is atomic — a failed script changes nothing. On error: stop, read, fix, retry once.
- One `setCurrentPageAsync` per `use_figma` call. Multi-page work fans out as parallel calls in a single message.
- Figma numbers are **pixels**; CSS is rem; the diff converts rem × 16.
- Mode count is plan-capped (Professional: 4 per collection). `3 Responsive` uses 3 — at the limit minus one, so do not add a fourth width without checking the plan tier.
- **Every variable must define a value in every mode.** Mode-invariant values in `3 Responsive` are duplicated across all three modes on purpose; that is the cost of the mode axis, not a modeling mistake.
- Zero visual change on the Figma canvas and zero visual change in the browser. Screenshot the same reference frames as Plan 2 Task 2, before and after.

## What actually varies by width (measured, not assumed)

Grepped across `src/` on 2026-07-29:

| Value                   | Mobile (390) | Tablet (768) | Desktop (1280)  | Varies?                                                  |
| ----------------------- | ------------ | ------------ | --------------- | -------------------------------------------------------- |
| Section vertical rhythm | 32 (`py-8`)  | 32           | 96 (`lg:py-24`) | **yes** — 7 page-level call sites, all `py-8 … lg:py-24` |
| Container gutter        | 16           | 16           | 16              | no (`padding-inline: 1rem`, constant)                    |
| Container max-width     | 1280         | 1280         | 1280            | no (`var(--breakpoint-xl)`, constant)                    |

So **one** of the three is a real responsive knob today. Gutter and max-width go into `3 Responsive` anyway because they are the same axis of concern and belong next to the knob that does move — but this plan does not pretend they vary. The payoff is that changing them later becomes a token edit rather than a hunt through `@utility container`.

The `lg:` breakpoint is 1024, which sits between the Tablet (768) and Desktop (1280) modes — so at 768 the rhythm is still the mobile value. Tablet and Desktop are not interchangeable; Tablet mode carries 32, not 96. Getting this backwards is the easiest error in this plan.

Three call sites deliberately stay raw and are **not** tokenized — they are not page-section rhythm: `src/components/app/Footer.astro:23` (`py-8 md:py-16`), `src/components/skills/Skills.astro:10` (`py-16`), `src/components/styleguide/StorySection.astro:6` (`py-16 md:py-24`, styleguide chrome).

## File Structure

| File                                         | Responsibility                                               | Change     |
| -------------------------------------------- | ------------------------------------------------------------ | ---------- |
| `src/styles/global.css`                      | add `--spacing-section` / `--spacing-section-lg` to `@theme` | Modify     |
| 7 page files                                 | `py-8 … lg:py-24` → `py-section … lg:py-section-lg`          | Modify     |
| `scripts/figma/extract-code-tokens.mjs`      | emit the two spacing-section tokens                          | Modify     |
| `scripts/figma/extract-code-tokens.test.mjs` | cover them                                                   | Modify     |
| `scripts/figma/token-map.json`               | map container + section tokens to `3 Responsive/<mode>/…`    | Modify     |
| Figma `Color Tokens`                         |                                                              | **Delete** |
| Figma `3 Responsive`                         | 3 modes × 4 variables                                        | **Create** |

---

### Task 1: Audit the 29 `Color Tokens` bindings and the mode overrides

Nothing is deleted until both are known. A collection with a live `explicitVariableModes` override cannot be removed safely — Figma drops the override silently and the affected frames fall back to the default mode.

**Files:** none (Figma reads only)

**Interfaces:**

- Produces: a remap table `{ oldVarId: newVarId }` consumed by Task 2, and a list of nodes carrying `Color Tokens` mode overrides.

- [ ] **Step 1: Read the `figma-use` skill**

Required before any `use_figma` call this session.

- [ ] **Step 2: Find every binding and every mode override**

One call per page, fanned out in parallel in a single message. Page ids: `📖 Cover` `0:1`, `🎨 Foundations` `5:14`, `🧩 Components` `52:2`, `📄 Pages` `44:328`, `Pages Experiment` `442:5352`, `Components (new)` (page id **not confirmed from this static checkout — reconfirm live before execution**, page ids can drift between sessions). `🗄️ Legacy` (`78:2`) is dropped from this list: it does not exist in the live v1.0 fork (confirmed via `getNodeByIdAsync` returning `null`, Plan 2 Task 2/5). `Components (new)` is added: it does exist and was discovered live during Plan 2 Task 6 carrying 1,045+ bindings — it was not in this plan's original page inventory.

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const ct = cols.find((c) => c.name === "Color Tokens");
if (!ct) return { page: page.name, note: "Color Tokens already gone" };

const cache = {};
async function isCT(id) {
  if (!(id in cache)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    cache[id] = v
      ? { hit: v.variableCollectionId === ct.id, name: v.name }
      : { hit: false, name: "?" };
  }
  return cache[id];
}
function collect(obj, field, out) {
  if (!obj || typeof obj !== "object") return;
  if (obj.type === "VARIABLE_ALIAS" && obj.id) {
    out.push({ id: obj.id, field });
    return;
  }
  for (const k of Object.keys(obj))
    collect(obj[k], field === null ? k : field, out);
}

const bindings = [],
  overrides = [];
for (const n of page.findAll(() => true)) {
  if (n.explicitVariableModes && n.explicitVariableModes[ct.id])
    overrides.push({
      node: n.id,
      name: n.name,
      mode: n.explicitVariableModes[ct.id],
    });
  if (!n.boundVariables) continue;
  const o = [];
  collect(n.boundVariables, null, o);
  for (const a of o) {
    const r = await isCT(a.id);
    if (r.hit)
      bindings.push({
        node: n.id,
        name: n.name,
        type: n.type,
        field: a.field,
        varId: a.id,
        varName: r.name,
      });
  }
}
return {
  page: page.name,
  ctId: ct.id,
  bindingCount: bindings.length,
  bindings,
  overrides,
};
```

Expected across all six pages: **29 bindings**. `overrides` is expected to be empty — the dark-frame overrides point at `VariableCollectionId:3:2` (now `2 Theme`), not at `Color Tokens`. **If any override turns up, stop and resolve it before Task 3**: rebind that frame to a `2 Theme` mode override, or keep `Color Tokens` and revise this plan.

**Caveat:** the total-29 figure is Plan 2 Task 5/6's file-wide `Color Tokens` binding count and likely still holds — but the *per-page* distribution needs re-verification at execution time, since the page inventory itself changed after Plan 2 (the corrected page list above — `🗄️ Legacy` dropped, `Components (new)` added — differs from what this plan was originally drafted against, and `Components (new)`'s share of the 29 is unknown until re-dumped).

- [ ] **Step 3: Resolve each bound variable to a hex and pick its `1 Primitives` target**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const ct = cols.find((c) => c.name === "Color Tokens");
const prims = cols.find((c) => c.name === "1 Primitives");
const theme = cols.find((c) => c.id === "VariableCollectionId:3:2");

const hex = (c) =>
  "#" +
  ["r", "g", "b"]
    .map((k) =>
      Math.round(c[k] * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
async function resolve(v, col) {
  let val = v.valuesByMode[col.modes[0].modeId],
    hops = 0;
  while (val && val.type === "VARIABLE_ALIAS" && hops++ < 5) {
    const ref = await figma.variables.getVariableByIdAsync(val.id);
    const rc = cols.find((c) => c.id === ref.variableCollectionId);
    val = ref.valuesByMode[rc.modes[0].modeId];
  }
  return val;
}

// index primitives + theme by hex
const byHex = {};
for (const [col, tag] of [
  [prims, "1 Primitives"],
  [theme, "2 Theme"],
])
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const val = await resolve(v, col);
    if (!val || typeof val !== "object" || !("r" in val)) continue;
    (byHex[hex(val)] ||= []).push({ id: v.id, name: v.name, col: tag });
  }

// USED_IDS = the distinct varIds from Step 2
const USED_IDS = [/* "VariableID:...", ... */];
const map = [],
  unmatched = [];
for (const id of USED_IDS) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const val = await resolve(v, ct);
  const h = val && typeof val === "object" && "r" in val ? hex(val) : null;
  const hits = h ? byHex[h] || [] : [];
  // prefer a semantic target over a raw primitive — a bound colour that has a
  // 2 Theme equivalent should become the semantic one, not a brand hex.
  const pick = hits.find((x) => x.col === "2 Theme") || hits[0];
  if (!pick) {
    unmatched.push({ id, name: v.name, hex: h });
    continue;
  }
  map.push({
    fromId: id,
    from: v.name,
    hex: h,
    toId: pick.id,
    to: `${pick.col}/${pick.name}`,
  });
}
return { mapped: map.length, unmatched, map };
```

**Read the returned `map` before acting on it.** Two judgement calls the script cannot make:

- A hit in `2 Theme` is preferred, but `2 Theme` colours are mode-dependent — binding a light-only decorative element to `color/foreground` makes it flip in dark mode. For each `2 Theme` target, confirm the node _should_ theme. If not, take the `1 Primitives` hit instead.
- `unmatched` entries are colours with no equivalent anywhere. For each: add the hex to `scripts/figma/brand-primitives.json` and re-run Plan 2 Task 3 for that one variable, or accept that the node keeps a raw paint. **Do not delete `Color Tokens` with unmatched bindings outstanding** — that would silently strip the colour to whatever raw value the paint last held.

Record the final table in `notes.md` under "Plan 3 — Color Tokens remap".

---

### Task 2: Rebind the 29 consumers

**Files:**

- Figma pages carrying the bindings (from Task 1 Step 2 — expected `🧩 Components` and `📄 Pages`)

**Interfaces:**

- Consumes: the reviewed `map` from Task 1 Step 3.

- [ ] **Step 1: Apply the rebind**

One call per page that had a nonzero `bindingCount`. `REMAP` is the reviewed map, trimmed to `{ oldId: newId }`.

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);

const REMAP = {/* "VariableID:old": "VariableID:new" */};
const cache = {};
async function target(oldId) {
  const newId = REMAP[oldId];
  if (!newId) return null;
  if (!cache[newId])
    cache[newId] = await figma.variables.getVariableByIdAsync(newId);
  return cache[newId];
}

let rebound = 0,
  paints = 0;
const failures = [];
for (const n of page.findAll(() => true)) {
  const bv = n.boundVariables;
  if (!bv) continue;
  for (const field of Object.keys(bv)) {
    const entry = bv[field];
    try {
      if (Array.isArray(entry) && (field === "fills" || field === "strokes")) {
        const src = field === "fills" ? n.fills : n.strokes;
        if (!Array.isArray(src)) continue;
        const next = [...src];
        let touched = false;
        for (let i = 0; i < entry.length; i++) {
          const alias = entry[i] && entry[i].color;
          const v = alias && (await target(alias.id));
          if (!v || !next[i] || next[i].type !== "SOLID") continue;
          // returns a NEW paint — must be captured and reassigned
          next[i] = figma.variables.setBoundVariableForPaint(
            next[i],
            "color",
            v,
          );
          touched = true;
          paints++;
        }
        if (touched) {
          if (field === "fills") n.fills = next;
          else n.strokes = next;
        }
        continue;
      }
      if (entry && entry.type === "VARIABLE_ALIAS") {
        const v = await target(entry.id);
        if (!v) continue;
        n.setBoundVariable(field, v);
        rebound++;
      }
    } catch (e) {
      failures.push(`${n.id} ${n.name} .${field}: ${e.message}`);
    }
  }
}
return { page: page.name, rebound, paints, failures, mutatedNodeIds: [] };
```

Expected: `rebound + paints` = 29 across all pages, `failures` empty.

A `Cannot write to node with unloaded font` failure means a TEXT node needs its current fonts loaded first. Re-run that page with the font preloaded:

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);
const fonts = new Set();
for (const n of page.findAll((x) => x.type === "TEXT"))
  for (const seg of n.getStyledTextSegments(["fontName"]))
    fonts.add(JSON.stringify(seg.fontName));
for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
// ... then the rebind loop above ...
```

- [ ] **Step 2: Verify zero bindings remain**

Re-run Task 1 Step 2 across all six pages. Expected `bindingCount` 0 everywhere.

- [ ] **Step 3: Screenshot the reference frames**

`get_screenshot` on the three frames recorded in Plan 2 Task 2. Identical to the "before" captures.

---

### Task 3: Delete `Color Tokens`

**Files:**

- Figma — one collection removed

- [ ] **Step 1: Delete, with a guard**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const ct = cols.find((c) => c.name === "Color Tokens");
if (!ct) return { note: "already deleted" };
const removed = { name: ct.name, id: ct.id, vars: ct.variableIds.length };
ct.remove();
const after = (await figma.variables.getLocalVariableCollectionsAsync()).map(
  (c) => ({
    name: c.name,
    vars: c.variableIds.length,
    hidden: c.hiddenFromPublishing,
  }),
);
return { removed, after };
```

Expected `after`: exactly two entries — `1 Primitives` (~480, `hidden: true`) and `2 Theme` (10, `hidden: false`).

- [ ] **Step 2: Re-dump and run the gate**

Re-run `scripts/figma/dump-tokens.md`, save to `tokens.figma.json`, then:

```bash
pnpm figma:verify
```

Expected: zero Missing, zero Mismatch, zero Unmapped.

- [ ] **Step 3: Commit**

```bash
git add tokens.figma.json docs/specs/01_active/figma-variables/notes.md
git commit -m "chore(figma): rebind and delete Color Tokens — two collections remain"
```

---

### Task 4: Make section rhythm a code token

The `3 Responsive` collection needs something real to hold. Right now section rhythm is the utility pair `py-8 … lg:py-24` repeated at 7 call sites — invisible to the token pipeline. This task turns it into two checked tokens.

**Files:**

- Modify: `src/styles/global.css` (`@theme` block)
- Modify: `scripts/figma/extract-code-tokens.mjs`
- Modify: `scripts/figma/extract-code-tokens.test.mjs`
- Modify: 7 page files

**Interfaces:**

- Produces: tokens `spacing-section` (32px) and `spacing-section-lg` (96px) in `tokens.code.json`, class `px-css`, consumed by Task 6's `token-map.json` entries.

- [ ] **Step 1: Write the failing test**

Append to `scripts/figma/extract-code-tokens.test.mjs`:

```js
test("section rhythm tokens are extracted from @theme", () => {
  const { tokens } = runExtractor(); // existing helper in this file
  const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));
  assert.equal(byName["spacing-section"].px, 32);
  assert.equal(byName["spacing-section"].raw, "2rem");
  assert.equal(byName["spacing-section"].class, "px-css");
  assert.equal(byName["spacing-section-lg"].px, 96);
  assert.equal(byName["spacing-section-lg"].raw, "6rem");
});
```

If `runExtractor()` does not exist under that name in the test file, use whatever helper the file already uses to invoke the script and parse its output — do not add a second one.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/figma/extract-code-tokens.test.mjs`
Expected: FAIL — `Cannot read properties of undefined (reading 'px')`.

- [ ] **Step 3: Add the tokens to `global.css`**

In the `@theme` block, after the font stacks and before the colours:

```css
/* Page-section vertical rhythm. Varies by width: 2rem below lg, 6rem at lg+.
     Mirrored in Figma as `3 Responsive/section/rhythm-y`. */
--spacing-section: 2rem;
--spacing-section-lg: 6rem;
```

Tailwind's `--spacing-*` namespace generates the utilities — `py-section` = `padding-block: 2rem`, `lg:py-section-lg` = `padding-block: 6rem` at ≥1024px.

- [ ] **Step 4: Teach the extractor to emit them**

In `scripts/figma/extract-code-tokens.mjs`, inside the `// 2. @theme` block, after the colour loop:

```js
for (const m of theme.matchAll(
  /--(spacing-section(?:-lg)?):\s*([\d.]+)(rem|px)\s*;/g,
)) {
  const px = m[3] === "rem" ? round(Number(m[2]) * ROOT_PX) : Number(m[2]);
  push(m[1], `${m[2]}${m[3]}`, px, "px-css", "global.css @theme");
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test scripts/figma/extract-code-tokens.test.mjs`
Expected: PASS.

- [ ] **Step 6: Swap the 7 call sites**

Exactly these, and no others. Each is `py-8 … lg:py-24` → `py-section … lg:py-section-lg`:

```
src/pages/about.astro:8
src/pages/blog.astro:24
src/pages/blog/[id].astro:58
src/pages/blog/[serie]/[post].astro:77
src/pages/blog/[serie]/index.astro:39
src/pages/work.astro:25
src/pages/work/[id].astro:45
```

That list is 7 lines because `work.astro` and `work/[id].astro` are both page-level; `blog.astro` and `work.astro` use `md:gap-24 lg:py-24` while the detail pages use `lg:gap-12 lg:py-24` — **only the `py-` utilities change, leave every `gap-` utility alone.**

Run the swap and check nothing else matched:

```bash
rtk grep -rn "py-8" src/pages/ && rtk grep -rn "lg:py-24" src/
```

After editing, `lg:py-24` must return zero hits in `src/pages/`; `src/components/styleguide/StorySection.astro` keeps its `md:py-24` (styleguide chrome, deliberately untokenized).

- [ ] **Step 7: Verify the rendered CSS is byte-identical**

```bash
pnpm build
```

Then confirm the generated stylesheet still contains a `2rem`/`6rem` padding pair for those pages. Open `pnpm preview` and check one page at 390px, 768px and 1280px — the vertical spacing must not move at any of the three. This is a rename, not a redesign.

- [ ] **Step 8: Commit**

```bash
git add src/styles/global.css src/pages scripts/figma/extract-code-tokens.mjs scripts/figma/extract-code-tokens.test.mjs
git commit -m "refactor(css): section rhythm becomes --spacing-section / --spacing-section-lg"
```

---

### Task 5: Create `3 Responsive` in Figma

**Files:**

- Figma — new collection with 3 modes

**Interfaces:**

- Consumes: `1 Primitives` (for aliasing where an exact primitive exists).
- Produces: collection `3 Responsive`, modes `Desktop` / `Tablet` / `Mobile`, 4 variables.

Values, derived from Task 4's measurements:

| Variable              | Desktop | Tablet | Mobile | Alias target               |
| --------------------- | ------- | ------ | ------ | -------------------------- |
| `container/max-width` | 1280    | 1280   | 1280   | `breakpoint/xl`            |
| `container/gutter`    | 16      | 16     | 16     | `spacing/4`                |
| `section/rhythm-y`    | 96      | 32     | 32     | `spacing/24` / `spacing/8` |
| `viewport/width`      | 1280    | 768    | 390    | raw (390 has no primitive) |

`viewport/width` exists so a designer can bind a frame's width to the mode instead of typing 390 by hand — it is the thing that makes switching a frame's mode actually resize it.

- [ ] **Step 1: Create the collection and its three modes**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
if (cols.find((c) => c.name === "3 Responsive"))
  return { note: "already exists" };

const col = figma.variables.createVariableCollection("3 Responsive");
col.renameMode(col.modes[0].modeId, "Desktop");
const tablet = col.addMode("Tablet");
const mobile = col.addMode("Mobile");
return {
  id: col.id,
  desktop: col.modes[0].modeId,
  tablet,
  mobile,
  modeCount: col.modes.length,
};
```

If `addMode` throws `Limit of N modes reached`, the file's plan tier is below Professional. Stop and report — this plan cannot proceed on a tier that caps modes at 1.

- [ ] **Step 2: Create the four variables**

`COLLECTION_ID`, `DESKTOP`, `TABLET`, `MOBILE` are the literals returned by Step 1.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = cols.find((c) => c.id === "COLLECTION_ID");
const prims = cols.find((c) => c.name === "1 Primitives");

const primByName = {};
for (const id of prims.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  primByName[v.name] = v;
}
const alias = (name) => {
  const p = primByName[name];
  if (!p) throw new Error(`missing primitive ${name}`);
  return { type: "VARIABLE_ALIAS", id: p.id };
};

const SPEC = [
  {
    name: "container/max-width",
    scopes: ["WIDTH_HEIGHT"],
    values: {
      DESKTOP: alias("breakpoint/xl"),
      TABLET: alias("breakpoint/xl"),
      MOBILE: alias("breakpoint/xl"),
    },
  },
  {
    name: "container/gutter",
    scopes: ["GAP", "WIDTH_HEIGHT"],
    values: {
      DESKTOP: alias("spacing/4"),
      TABLET: alias("spacing/4"),
      MOBILE: alias("spacing/4"),
    },
  },
  {
    name: "section/rhythm-y",
    scopes: ["GAP", "WIDTH_HEIGHT"],
    values: {
      DESKTOP: alias("spacing/24"),
      TABLET: alias("spacing/8"),
      MOBILE: alias("spacing/8"),
    },
  },
  // 390 is a device width, not a Tailwind step — no primitive to alias, raw is correct.
  {
    name: "viewport/width",
    scopes: ["WIDTH_HEIGHT"],
    values: { DESKTOP: 1280, TABLET: 768, MOBILE: 390 },
  },
];

const MODES = {
  DESKTOP: "DESKTOP_ID",
  TABLET: "TABLET_ID",
  MOBILE: "MOBILE_ID",
};
const created = [];
for (const s of SPEC) {
  const v = figma.variables.createVariable(s.name, col, "FLOAT");
  for (const key of Object.keys(MODES))
    v.setValueForMode(MODES[key], s.values[key]);
  v.scopes = s.scopes;
  created.push({ name: s.name, id: v.id });
}
return { created, total: col.variableIds.length };
```

Expected: 4 created. A `missing primitive` throw means Plan 2's build skipped a namespace — fix there, not here.

- [ ] **Step 3: Verify the resolved values per mode**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const col = cols.find((c) => c.name === "3 Responsive");
const out = [];
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const row = { name: v.name };
  for (const m of col.modes) {
    let val = v.valuesByMode[m.modeId],
      hops = 0;
    while (val && val.type === "VARIABLE_ALIAS" && hops++ < 5) {
      const ref = await figma.variables.getVariableByIdAsync(val.id);
      const rc = cols.find((c) => c.id === ref.variableCollectionId);
      val = ref.valuesByMode[rc.modes[0].modeId];
    }
    row[m.name] = val;
  }
  out.push(row);
}
return out;
```

Expected exactly:

```
container/max-width  Desktop 1280  Tablet 1280  Mobile 1280
container/gutter     Desktop 16    Tablet 16    Mobile 16
section/rhythm-y     Desktop 96    Tablet 32    Mobile 32
viewport/width       Desktop 1280  Tablet 768   Mobile 390
```

`section/rhythm-y` Tablet must be **32**, not 96 — the `lg:` breakpoint is 1024, above the 768 Tablet mode. Getting this wrong is the single likeliest error in this plan.

---

### Task 6: Bring `3 Responsive` under the drift check

Right now `container-max-width` and `container-padding-inline` sit in `token-map.json`'s `ignore` list — they have nowhere in Figma to point. They do now.

**Files:**

- Modify: `scripts/figma/token-map.json`

**Interfaces:**

- Consumes: `tokens.code.json` names from Task 4, `3 Responsive` variable paths from Task 5.

- [ ] **Step 1: Move the container tokens out of `ignore` and map them**

In `scripts/figma/token-map.json`, delete `"container-max-width"` and `"container-padding-inline"` from `ignore`, and add to the map:

```json
  "container-max-width": "3 Responsive/Desktop/container/max-width",
  "container-padding-inline": "3 Responsive/Desktop/container/gutter",
  "spacing-section": "3 Responsive/Mobile/section/rhythm-y",
  "spacing-section-lg": "3 Responsive/Desktop/section/rhythm-y"
```

The code side has no mode axis — CSS expresses the same variation as two separate custom properties. So each code token maps to the **one mode where it is authoritative**: `spacing-section` is what the mobile mode shows, `spacing-section-lg` is what the desktop mode shows. Mapping both to the same mode would compare 32 against 96 and fail forever.

`viewport/width` is intentionally unmapped — it is a Figma-only affordance with no CSS counterpart. Add it to `ignore` on the Figma side if `diff-tokens.mjs` reports it as Orphaned.

- [ ] **Step 2: Re-dump and run the gate**

Re-run `scripts/figma/dump-tokens.md` (which must handle three modes — it iterates `collection.modes`, so no change is needed, but confirm the output contains `3 Responsive/Tablet/...` paths), save to `tokens.figma.json`, then:

```bash
pnpm figma:verify
```

Expected: zero Missing, zero Mismatch, zero Unmapped, zero Orphaned.

A "Value mismatch: container-max-width code 1280 figma 80" means the alias resolved to `breakpoint/xl`'s rem value instead of px — check Plan 2's build converted `80rem` → `1280`.

- [ ] **Step 3: Run the full check**

```bash
pnpm test && pnpm build && pnpm figma:verify
```

All three clean.

- [ ] **Step 4: Commit**

```bash
git add scripts/figma/token-map.json tokens.code.json tokens.figma.json
git commit -m "feat(figma): 3 Responsive collection under the drift check"
```

---

### Task 7: Close the spec

**Files:**

- Modify: `docs/specs/01_active/figma-variables/design.md`
- Modify: `docs/specs/01_active/figma-variables/notes.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Mark migration steps 4–5 shipped in `design.md`**

Record the final state: three collections, `1 Primitives` (~480, hidden from publishing), `2 Theme` (10, Light/Dark), `3 Responsive` (4, Desktop/Tablet/Mobile). Note the measured fact that only `section/rhythm-y` varies by mode today, and that gutter/max-width are colocated by concern rather than by variance.

- [ ] **Step 2: Add the transferable lessons to `notes.md`**

At minimum:

- _A mode axis is only worth its cost if something on it moves._ Three of four `3 Responsive` variables are constant across modes; the collection is justified by the one that isn't, plus the affordance of binding frame width to the mode.
- _Breakpoint and mode are different axes._ `lg:` = 1024 sits between the 768 and 1280 modes, so the Tablet mode carries the mobile value. Copying a `lg:` value into a tablet mode is the default mistake.
- _Deleting a collection under a live `explicitVariableModes` override drops the override silently._ Audit overrides before any collection removal, not just bindings.
- _One code token per mode-where-authoritative._ CSS has no mode axis, so a responsive Figma variable maps to a single mode in the drift check — mapping the pair to one mode makes the gate permanently red.

- [ ] **Step 3: Update `CLAUDE.md`**

The Illustration Lab section is unrelated, but the token pipeline now has a fourth script. Add `pnpm figma:primitives` to the commands table with a one-line description, next to `pnpm figma:verify`.

- [ ] **Step 4: Archive the spec**

```bash
./docs/specs/specs.sh archive figma-variables
git add docs/specs CLAUDE.md
git commit -m "docs(specs): archive figma-variables — three-collection structure shipped"
```

---

## Exit criteria

- Figma holds exactly three collections: `1 Primitives` (hidden), `2 Theme` (Light/Dark), `3 Responsive` (Desktop/Tablet/Mobile).
- Zero bindings to any deleted collection; the three reference frames screenshot-identical to Plan 2's "before" captures.
- `--spacing-section` / `--spacing-section-lg` exist in `global.css` and are used at the 7 page-level call sites; browser rendering unchanged at 390 / 768 / 1280.
- `pnpm test && pnpm build && pnpm figma:verify` all clean, with `container-*` and `spacing-section*` no longer in `token-map.json`'s `ignore` list.
- `design.md` records the resolved binding audit; `notes.md` carries the transferable lessons; the topic is in `docs/specs/02_archives/`.
