---
created: 2026-08-06
status: plan — ready to execute
---

# Design System Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Figma file `Blog Design System v1.0` into a single shareable URL that a senior-frontend recruiter can read top-to-bottom and come away knowing what was decided, why, and how it maps to shipped code — with atoms/molecules/organisms/tokens named as such, token binding verified, and every page shown in both desktop and mobile.

**Architecture:** The `📚 Docs` page is rebuilt around an atomic spine — `00 Read me` → `01 Tokens` → `02 Atoms` → `03 Molecules & Organisms` → `04 Pages` — replacing the current 12 property-named sections. The 12 property decisions are not deleted; each is re-homed inline next to the thing it governs. Every specimen stays a live `createInstance()` of a real library component, so fixing a component fixes the docs. Responsive views are produced by Figma **variable modes**, not by hand-resized duplicates: the existing `3 Responsive` collection (Desktop/Tablet/Mobile) is finished so that `container/gutter` and `section/rhythm-y` actually differ per mode, page containers get `maxWidth` bound to `container/max-width`, and each page frame pins one `(Theme, Responsive)` mode pair.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file key `ihWIWmvtQPTWgUxlrVjC2c`). No repo code changes except documentation sync in Task 12. Verification is `use_figma` read-back assertions plus `get_screenshot`; there is no test runner for Figma work.

## Global Constraints

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c` (`Blog Design System v1.0`). Never write to `Wf4iomVMYUXlFIBV3Z8bx4` — read-only backup.
- **Skill contract:** every `use_figma` call passes `skillNames: "figma-use"`, uses `return` (never `figma.notify`/`closePlugin`), switches page at most once per call via `await figma.setCurrentPageAsync(page)`, and returns all created/mutated node IDs.
- **Node IDs are volatile.** Every ID in this plan is a hint captured 2026-08-06. Before mutating, re-resolve by **name** and fail loudly if the name is missing. Never blind-write to a hardcoded ID.
- **Specimens must be live instances.** Anything demonstrating a component is `component.createInstance()`. Hand-drawn frames imitating a component are a defect (this is the Task 9 rule from `artistic-direction`, and it holds here).
- **Settled design rules are inputs, not open questions.** Source of truth: `.specs/02_archives/artistic-direction/design.md` and the `design-expert` skill. Do not re-litigate radius, hover verbs, accent budget, or the button vocabulary while writing docs.
- **Radius vocabulary is exactly three:** `full` (pressable), `lg`/8px (holds media), `0` (reading surface). No `sm`/`md`/`xl`.
- **Hover is one verb per surface, ≤150ms.** A hover variant identical to its default is a bug; so is a hover changing two things.
- **Figma's own chrome is excluded from every audit.** `COMPONENT_SET` frames render `cornerRadius: 5` and a dashed purple boundary; `SECTION` frames carry `cornerRadius: 2`. Skip node types `COMPONENT_SET` and `SECTION` in every radius/dashed/binding sweep or false positives return.
- **Copy tone:** conversational, concrete, no marketing abstractions, numbers carry context, no overclaims. See the `copy-tone-no-marketing` memory and `design-expert/references/copywriting.md`.
- **Both themes ship together.** Every Docs chapter exists in a Light frame and a Dark frame; the Dark frame is a clone with the `2 Theme` mode reapplied, never hand-recoloured.

## Reference data captured 2026-08-06

**Pages**

| Page | ID |
|---|---|
| `📖 Cover` | `0:1` |
| `📚 Docs` | `2545:671` |
| `🎨 Foundations` | `5:14` |
| `🧩 Components` | `461:759` |
| `Pages` | `2558:18264` |
| `🗄️ Archive & XP` | `442:5352` |

**Docs frames:** Light `2545:672`, Dark `2547:7597` (1600 × 4707 each).

**Docs sections (light frame):** Border `2545:674`, Radius `2545:7178`, Icons `2545:7216`, Buttons `2545:7234`, Hover `2545:7268`, Type `2545:7464`, Numbers `2545:7479`, Spacing `2545:7497`, Colour `2545:7501`, Backgrounds `2545:7516`, Illustration `2546:282`, Motion `2546:297`.

**Pages frames:** `v3/Home — 1920 — Dark` `2558:18265`, `v3/Blog — 1920 — Dark` `2558:18273`.

**Variable collections**

| Collection | ID | Modes (id) | Count |
|---|---|---|---|
| `1 Primitives` | `VariableCollectionId:2013:2` | `Mode 1` (`2013:0`) | 451 |
| `2 Theme` | `VariableCollectionId:3:2` | `Light`, `Dark` (`3:1`) | 15 |
| `3 Responsive` | `VariableCollectionId:2245:42` | `Desktop` (`2245:0`), `Tablet` (`2245:1`), `Mobile` (`2245:2`) | 4 |

**Primitive variable IDs needed by this plan**

| Name | ID | Value |
|---|---|---|
| `spacing/4` | `VariableID:2020:70` | 16 |
| `spacing/6` | `VariableID:2020:77` | 24 |
| `spacing/8` | `VariableID:2020:82` | 32 |
| `spacing/12` | `VariableID:2020:58` | 48 |
| `spacing/16` | `VariableID:2020:60` | 64 |
| `spacing/24` | `VariableID:2020:64` | 96 |
| `container/7xl` | `VariableID:2016:104` | 1280 |

**`3 Responsive` current state (the bug this plan fixes):** `container/max-width` and `container/gutter` alias the *same* primitive in all three modes (`breakpoint/xl` = 1280, `spacing/4` = 16), so switching mode changes nothing except `section/rhythm-y`. `viewport/width` is already correct: 1280 / 768 / 390.

**Component master inventory (`🧩 Components`, 33 masters) and its atomic classification**

| Atomic level | Masters (name — id) |
|---|---|
| **Atoms** (17) | `Icon` `461:6204` · `NavLink` `2001:1309` · `NavLinkHome` `2001:1312` · `Link/CTA` `2012:6179` · `Link/Secondary` `2041:275` · `Link/SecondarySm` `2350:737` · `Link/TextCTA` `2041:313` · `Link/Icon` `2093:6332` · `ThemeToggle` `16:11` · `MotionToggle` `16:12` · `H1` `2119:7406` · `H2` `2034:213` · `PreviewTitle` `2041:465` · `PageDescription` `2119:7440` · `PostMetadataTime` `2040:482` · `PostMetadataTopic` `2371:10414` · `SerieMeta` `2375:10662` |
| **Molecules** (8) | `PostRow` `2124:7937` · `SerieCard` `2367:7205` · `PostCardPreviewBig` `2385:7139` · `PostCardPreviewSmall` `2385:7149` · `WorkCardPreviewSmall` `2045:378` · `HeroText` `2012:6142` · `HeroAnimation` `2012:315` · `ContactContent` `131:101` |
| **Organisms** (8) | `Header` `2001:1669` · `Footer` `2099:2560` · `Hero` `2012:6305` · `BlogPreviewSection` `2041:560` · `ArchiveTable` `2124:8011` · `SerieCardList` `2119:7557` · `WorkPreviewSection` `2045:428` · `ContactPreviewSection` `2114:7281` |

**Text styles (30):** `Hero/Title` 48 Bubbler One · `Heading/H1` 60 Bubbler One · `Heading/H2` 30 IBM Plex Sans SemiBold · `Heading/H3` 22 SemiBold · `Body/3xl` 30 Regular · `Body/xl` 20 · `Body/l` 18 · `Body/base` 16 · `Body/s` 14 · `Body/xs` 12 · `Body/xs/medium` 12 Medium · `Body/xl/medium` 20 Medium · `Body/base/medium` 16 Medium · `Body/4xl/semibold` 36 SemiBold · `Label/Meta` 14 Medium · `Chip/Mono` 12 Fira Code · `Code/Base` 14 Fira Code · plus 11 `Tailwind/text-*` mirror styles.

**Token-binding audit baseline (697 nodes scanned on `🧩 Components`, 2026-08-06)**

| Gap class | Count |
|---|---|
| unbound `itemSpacing` | 99 |
| TEXT with no text style | 82 |
| unbound strokes | 32 |
| unbound `cornerRadius` | 31 |
| unbound fills | 11 |

---

### Task 1: Make the `3 Responsive` collection actually responsive

Right now every mode resolves to the same gutter, so a "Mobile" frame is a Desktop frame at a narrower width. Give each mode its own gutter and a sane rhythm ladder.

**Files:**
- Modify: Figma variable collection `3 Responsive` (`VariableCollectionId:2245:42`) — variables `container/gutter`, `section/rhythm-y`, `container/max-width`
- Test: read-back assertion in the same `use_figma` call

**Interfaces:**
- Consumes: primitive variable IDs from the reference table above
- Produces: `container/gutter` = 32 / 24 / 16 and `section/rhythm-y` = 96 / 64 / 48 across Desktop / Tablet / Mobile. Task 2 binds page nodes to these. Task 3 pins frames to these modes. Task 7 documents them.

- [ ] **Step 1: Read the current per-mode values so the change is provable**

```js
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const before = {};
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  before[v.name] = Object.fromEntries(col.modes.map(m => [m.name, JSON.stringify(v.valuesByMode[m.modeId])]));
}
return { modes: col.modes, before };
```

Expected: `container/gutter` shows the identical alias string in all three modes. That identical-string result is the bug — record it in the task notes.

- [ ] **Step 2: Set per-mode aliases**

`setValueForMode` takes an alias object, not a raw number, so the responsive layer keeps referencing the primitive layer rather than hardcoding pixels.

```js
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const mode = Object.fromEntries(col.modes.map(m => [m.name, m.modeId]));
const byName = {};
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  byName[v.name] = v;
}
const alias = id => ({ type: "VARIABLE_ALIAS", id });
const PRIM = {
  s4:  "VariableID:2020:70",  // 16
  s6:  "VariableID:2020:77",  // 24
  s8:  "VariableID:2020:82",  // 32
  s12: "VariableID:2020:58",  // 48
  s16: "VariableID:2020:60",  // 64
  s24: "VariableID:2020:64",  // 96
  c7xl:"VariableID:2016:104", // 1280
};

byName["container/gutter"].setValueForMode(mode.Desktop, alias(PRIM.s8));
byName["container/gutter"].setValueForMode(mode.Tablet,  alias(PRIM.s6));
byName["container/gutter"].setValueForMode(mode.Mobile,  alias(PRIM.s4));

byName["section/rhythm-y"].setValueForMode(mode.Desktop, alias(PRIM.s24));
byName["section/rhythm-y"].setValueForMode(mode.Tablet,  alias(PRIM.s16));
byName["section/rhythm-y"].setValueForMode(mode.Mobile,  alias(PRIM.s12));

// max-width is a cap, not a width: same on every mode is correct, but point it at
// container/7xl rather than breakpoint/xl so the semantic layer reads as a container.
for (const m of ["Desktop","Tablet","Mobile"]) byName["container/max-width"].setValueForMode(mode[m], alias(PRIM.c7xl));

return { mutatedVariableIds: ["container/gutter","section/rhythm-y","container/max-width"].map(n => byName[n].id) };
```

- [ ] **Step 3: Verify resolved numbers differ per mode**

```js
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const prim = "2013:0";
const out = {};
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const row = {};
  for (const m of col.modes) {
    let val = v.valuesByMode[m.modeId];
    if (val && val.type === "VARIABLE_ALIAS") {
      const t = await figma.variables.getVariableByIdAsync(val.id);
      val = `${t.name}=${t.valuesByMode[prim]}`;
    }
    row[m.name] = val;
  }
  out[v.name] = row;
}
return out;
```

Expected exactly:

```
container/gutter    Desktop spacing/8=32   Tablet spacing/6=24   Mobile spacing/4=16
section/rhythm-y    Desktop spacing/24=96  Tablet spacing/16=64  Mobile spacing/12=48
container/max-width Desktop container/7xl=1280  (same all modes)
viewport/width      Desktop 1280  Tablet 768  Mobile 390
```

If `container/gutter` still shows one value across modes, Step 2 did not apply — stop and re-read the error rather than retrying blind.

- [ ] **Step 4: Widen scopes so the variables are pickable where they are needed**

`container/gutter` must be selectable as padding, not only as gap/width.

```js
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const ids = [];
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name === "container/gutter")    { v.scopes = ["GAP","WIDTH_HEIGHT"]; ids.push(v.id); }
  if (v.name === "section/rhythm-y")    { v.scopes = ["GAP","WIDTH_HEIGHT"]; ids.push(v.id); }
  if (v.name === "container/max-width") { v.scopes = ["WIDTH_HEIGHT"];       ids.push(v.id); }
  if (v.name === "viewport/width")      { v.scopes = ["WIDTH_HEIGHT"];       ids.push(v.id); }
}
return { mutatedVariableIds: ids };
```

Note: Figma applies padding bindings through `setBoundVariable("paddingLeft", …)` regardless of scope; scope only controls the picker UI. Setting `GAP` + `WIDTH_HEIGHT` keeps the picker honest without blocking anything.

- [ ] **Step 5: Commit the plan-side note**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs plan — task 1 responsive modes wired"
```

---

### Task 2: Bind Home and Blog page containers to the responsive variables

The two existing v3 frames have only 12 responsive bindings and are otherwise fixed-width. Rebind so a mode switch reflows them.

**Files:**
- Modify: `Pages` page `2558:18264` — frames `v3/Home — 1920 — Dark` `2558:18265`, `v3/Blog — 1920 — Dark` `2558:18273`
- Test: read-back assertion in the same call

**Interfaces:**
- Consumes: `container/gutter`, `container/max-width`, `viewport/width`, `section/rhythm-y` from Task 1
- Produces: for each page frame — frame `width` ← `viewport/width`; `PageContent (slot)` horizontal padding ← `container/gutter`; `PageContentContainer` `layoutSizingHorizontal = 'FILL'` with `maxWidth` ← `container/max-width`; vertical section gap ← `section/rhythm-y`. Task 3 clones these frames per mode.

- [ ] **Step 1: Map what is currently fixed-width inside each frame**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const report = [];
for (const f of page.children) {
  const rows = [];
  const walk = (n, d) => {
    if (d > 3) return;
    rows.push({
      d, id: n.id, name: n.name, type: n.type,
      w: Math.round(n.width),
      sizingH: n.layoutSizingHorizontal,
      padL: n.paddingLeft, padR: n.paddingRight, gap: n.itemSpacing,
      maxW: n.maxWidth,
      bound: Object.keys(n.boundVariables || {}),
    });
    (n.children || []).forEach(c => walk(c, d + 1));
  };
  walk(f, 0);
  report.push({ frame: f.name, rows });
}
return report;
```

Record which node is the outer `PageContent (slot)` and which is the inner `PageContentContainer` in each frame — the names were confirmed present on 2026-08-06, but re-resolve rather than assume depth.

- [ ] **Step 2: Bind the frame width, gutter, container cap and section rhythm**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const V = {};
for (const id of col.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

const mutated = [], missing = [];
for (const frame of page.children) {
  frame.setBoundVariable("width", V["viewport/width"]);
  mutated.push(frame.id);

  const slot = frame.findOne(n => n.name === "PageContent (slot)");
  if (!slot) { missing.push(`${frame.name}: PageContent (slot)`); continue; }
  slot.setBoundVariable("paddingLeft",  V["container/gutter"]);
  slot.setBoundVariable("paddingRight", V["container/gutter"]);
  mutated.push(slot.id);

  const inner = slot.findOne(n => n.name === "PageContentContainer");
  if (!inner) { missing.push(`${frame.name}: PageContentContainer`); continue; }
  inner.layoutSizingHorizontal = "FILL";
  inner.setBoundVariable("maxWidth", V["container/max-width"]);
  inner.setBoundVariable("itemSpacing", V["section/rhythm-y"]);
  mutated.push(inner.id);
}
return { mutatedNodeIds: mutated, missing };
```

If `missing` is non-empty, stop: the frame structure drifted from the 2026-08-06 snapshot and the names must be re-resolved before continuing.

- [ ] **Step 3: Prove the reflow works before building eight frames**

Flip the Home frame to Mobile, screenshot, flip it back. This is the cheap proof that Task 3 is worth doing.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const frame = await figma.getNodeByIdAsync("2558:18265");
const col = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const mode = Object.fromEntries(col.modes.map(m => [m.name, m.modeId]));

frame.setExplicitVariableModeForCollection(col, mode.Mobile);
const shotMobile = await frame.screenshot({ scale: 1 });
frame.setExplicitVariableModeForCollection(col, mode.Desktop);
return { width: Math.round(frame.width), explicit: frame.explicitVariableModes };
```

Expected: during the Mobile pass the frame is 390 wide, not 1920. After the reset, `width` is 1280 and `explicitVariableModes` lists the Desktop mode for `VariableCollectionId:2245:42`.

**Known risk, decide here:** the page content was composed against a 1920 canvas. At 390 the child instances will overflow horizontally unless they are `FILL`-sized. Expect the first Mobile screenshot to show overflow. That is data, not failure — record which child components need `layoutSizingHorizontal = 'FILL'` and fix them at the **master** in Task 3 Step 2, never per-instance.

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 2 page containers bound to responsive vars"
```

---

### Task 3: Build the eight page frames (Home/Blog × Desktop/Mobile × Light/Dark)

**Files:**
- Modify: `Pages` page `2558:18264`
- Modify: whichever component masters Task 2 Step 3 flagged as fixed-width

**Interfaces:**
- Consumes: bound frames from Task 2, mode ids from Task 1
- Produces: eight frames named exactly `Home — Desktop — Light`, `Home — Desktop — Dark`, `Home — Mobile — Light`, `Home — Mobile — Dark`, and the same four for `Blog`. Task 10 references these by name.

- [ ] **Step 1: Fix fixed-width masters flagged in Task 2**

For each master name flagged, set the offending container to `FILL` at the source component. Example shape — substitute the real names from the Task 2 report:

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const TARGETS = ["Header", "Footer", "BlogPreviewSection", "ArchiveTable"]; // replace with Task 2's actual list
const mutated = [], skipped = [];
for (const name of TARGETS) {
  const master = page.findOne(n => (n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.name === name);
  if (!master) { skipped.push(name); continue; }
  const inner = master.findOne(n => n.layoutMode && n.layoutMode !== "NONE" && n.layoutSizingHorizontal === "FIXED");
  if (!inner) { skipped.push(`${name}: no fixed child`); continue; }
  inner.layoutSizingHorizontal = "FILL";
  mutated.push(inner.id);
}
return { mutatedNodeIds: mutated, skipped };
```

`FILL` only applies to a child of an auto-layout parent — if it throws `FILL can only be set on children of auto-layout frames`, the parent needs `layoutMode` first. Do not force it on absolute-positioned children.

- [ ] **Step 2: Rename the two existing frames to the Desktop/Dark slots**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const home = await figma.getNodeByIdAsync("2558:18265");
const blog = await figma.getNodeByIdAsync("2558:18273");
home.name = "Home — Desktop — Dark";
blog.name = "Blog — Desktop — Dark";
return { mutatedNodeIds: [home.id, blog.id], names: [home.name, blog.name] };
```

- [ ] **Step 3: Clone into the remaining six frames and pin one mode pair each**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const resp  = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const T = Object.fromEntries(theme.modes.map(m => [m.name, m.modeId]));
const R = Object.fromEntries(resp.modes.map(m => [m.name, m.modeId]));

const base = { Home: await figma.getNodeByIdAsync("2558:18265"), Blog: await figma.getNodeByIdAsync("2558:18273") };
const COMBOS = [["Desktop","Light"],["Mobile","Light"],["Mobile","Dark"]];
const created = [];
let x = 0;
for (const pageName of ["Home","Blog"]) {
  base[pageName].setExplicitVariableModeForCollection(theme, T.Dark);
  base[pageName].setExplicitVariableModeForCollection(resp,  R.Desktop);
  for (const [bp, th] of COMBOS) {
    const clone = base[pageName].clone();
    clone.name = `${pageName} — ${bp} — ${th}`;
    clone.setExplicitVariableModeForCollection(theme, T[th]);
    clone.setExplicitVariableModeForCollection(resp,  R[bp]);
    page.appendChild(clone);
    created.push({ id: clone.id, name: clone.name });
  }
}
return { createdNodeIds: created.map(c => c.id), created };
```

- [ ] **Step 4: Lay the eight frames out in a readable grid**

Recruiters read left-to-right. Put Desktop left, Mobile right; Light row above Dark row; Home block above Blog block.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const GAP = 160, COL_X = { Desktop: 0, Mobile: 1600 };
const ROW_Y = {};
let y = 0;
for (const p of ["Home", "Blog"]) {
  for (const th of ["Light", "Dark"]) {
    let rowH = 0;
    for (const bp of ["Desktop", "Mobile"]) {
      const f = page.children.find(n => n.name === `${p} — ${bp} — ${th}`);
      if (!f) continue;
      f.x = COL_X[bp]; f.y = y;
      rowH = Math.max(rowH, f.height);
    }
    ROW_Y[`${p}-${th}`] = y;
    y += rowH + GAP;
  }
}
return { rows: ROW_Y, placed: page.children.map(n => ({ name: n.name, x: n.x, y: n.y })) };
```

- [ ] **Step 5: Verify all eight and screenshot the mobile pair**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const expected = [];
for (const p of ["Home","Blog"]) for (const bp of ["Desktop","Mobile"]) for (const th of ["Light","Dark"])
  expected.push(`${p} — ${bp} — ${th}`);
const rows = expected.map(name => {
  const f = page.children.find(n => n.name === name);
  return f ? { name, w: Math.round(f.width), modes: f.explicitVariableModes } : { name, MISSING: true };
});
const mob = page.children.find(n => n.name === "Home — Mobile — Light");
if (mob) await mob.screenshot();
return { count: page.children.length, rows };
```

Expected: eight rows, no `MISSING`; every Desktop frame `w: 1280`, every Mobile frame `w: 390`; each `explicitVariableModes` names both collection ids. Inspect the screenshot for horizontal overflow, clipped text, and overlapping instances — if any appear, return to Step 1 with the specific master named, and fix it at the master.

- [ ] **Step 6: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 3 eight responsive page frames"
```

---

### Task 4: Triage and fix the token-binding gaps

Baseline from 2026-08-06: 99 unbound `itemSpacing`, 82 unstyled TEXT, 32 unbound strokes, 31 unbound radii, 11 unbound fills across 697 nodes on `🧩 Components`. Not all are defects — illustration vector paths are meant to be unbound. Fix the real ones, allowlist the rest.

**Files:**
- Modify: masters on `🧩 Components` `461:759`
- Modify: `scripts/figma/named-debt.json`
- Test: re-run the same audit script and diff against baseline

**Interfaces:**
- Consumes: the audit script below (reuse it verbatim in Task 5 and Task 11 so the numbers are comparable)
- Produces: a `RESULT` object `{ scanned, fill, stroke, radius, gap, textStyle }` that Task 7 renders into the Docs "Verification" panel

- [ ] **Step 1: Re-run the baseline audit and classify each gap**

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const gaps = { fill: [], stroke: [], radius: [], gap: [], textStyle: [] };
let scanned = 0;
const walk = (n) => {
  scanned++;
  const bv = n.boundVariables || {};
  const isChrome = n.type === 'COMPONENT_SET' || n.type === 'SECTION';
  // A vector path inside an illustration is authored art, not a token target.
  const isArt = /^(path|g|rect|svg)[0-9-]*$/i.test(n.name) || n.type === 'VECTOR';
  if (!isChrome && !isArt) {
    if (Array.isArray(n.fills) && n.fills.some(f => f.visible !== false && f.type === 'SOLID') && !(bv.fills && bv.fills.length))
      gaps.fill.push(`${n.id} ${n.name}`);
    if (Array.isArray(n.strokes) && n.strokes.length && !(bv.strokes && bv.strokes.length))
      gaps.stroke.push(`${n.id} ${n.name}`);
    if (typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !bv.topLeftRadius)
      gaps.radius.push(`${n.id} ${n.name} r=${n.cornerRadius}`);
    if (n.layoutMode && n.layoutMode !== 'NONE' && n.itemSpacing > 0 && !bv.itemSpacing)
      gaps.gap.push(`${n.id} ${n.name} g=${n.itemSpacing}`);
  }
  if (n.type === 'TEXT' && (!n.textStyleId || n.textStyleId === figma.mixed))
    gaps.textStyle.push(`${n.id} ${n.name.slice(0,40)} ${n.fontSize}/${n.fontName && n.fontName.style}`);
  (n.children || []).forEach(walk);
};
page.children.forEach(walk);
return { scanned, counts: Object.fromEntries(Object.entries(gaps).map(([k,v]) => [k, v.length])), gaps };
```

Excluding art nodes should drop `fill` and `stroke` sharply from the 11/32 baseline. Whatever remains in `fill`/`stroke` is chrome and is a real defect.

- [ ] **Step 2: Bind off-ladder `itemSpacing` to the spacing scale**

`g=10` is the recurring offender and is not on the 4px ladder. Round each gap to the nearest scale step and bind it; report anything that does not land on a step.

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2013:2");
const M = prim.modes[0].modeId;
const scale = [];
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (/^spacing\/\d+$/.test(v.name)) scale.push({ v, px: v.valuesByMode[M] });
}
scale.sort((a, b) => a.px - b.px);

const bound = [], offLadder = [];
const walk = (n) => {
  const bv = n.boundVariables || {};
  if (n.type !== 'COMPONENT_SET' && n.type !== 'SECTION'
      && n.layoutMode && n.layoutMode !== 'NONE' && n.itemSpacing > 0 && !bv.itemSpacing) {
    const exact = scale.find(s => s.px === n.itemSpacing);
    if (exact) { n.setBoundVariable('itemSpacing', exact.v); bound.push(`${n.id} ${n.name} ${n.itemSpacing}`); }
    else {
      const near = scale.reduce((a, b) => Math.abs(b.px - n.itemSpacing) < Math.abs(a.px - n.itemSpacing) ? b : a);
      offLadder.push(`${n.id} ${n.name} g=${n.itemSpacing} → nearest ${near.v.name}=${near.px}`);
    }
  }
  (n.children || []).forEach(walk);
};
page.children.forEach(walk);
return { mutatedNodeIds: bound, boundCount: bound.length, offLadder };
```

Do **not** auto-snap the `offLadder` entries. Read the list, decide per case, and apply the snap in a follow-up call — `g=10` on `H1`/`HeroAnimation`/`PageDescription` should become `spacing/2` (8) or `spacing/3` (12) depending on what the component visually needs, and `g=300`/`g=183` on `HeaderContent`/`FooterContainer` are almost certainly a `SPACE_BETWEEN` layout expressed as a gap — those get `primaryAxisAlignItems = 'SPACE_BETWEEN'` and `itemSpacing = 0` instead of a binding.

- [ ] **Step 3: Bind unbound radii to the three-value vocabulary**

Radius is `full`, `lg`, or `0`. Anything else is a defect, not a value to preserve.

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2013:2");
const M = prim.modes[0].modeId;
let full = null, lg = null;
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name === 'radius/full') full = v;
  if (v.name === 'radius/lg')   lg = v;
}
const bound = [], odd = [];
const walk = (n) => {
  const bv = n.boundVariables || {};
  if (n.type !== 'COMPONENT_SET' && n.type !== 'SECTION'
      && typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !bv.topLeftRadius) {
    const target = n.cornerRadius >= 999 ? full : (n.cornerRadius === 8 ? lg : null);
    if (target) {
      for (const c of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])
        n.setBoundVariable(c, target);
      bound.push(`${n.id} ${n.name} r=${n.cornerRadius}`);
    } else odd.push(`${n.id} ${n.name} r=${n.cornerRadius}`);
  }
  (n.children || []).forEach(walk);
};
page.children.forEach(walk);
return { mutatedNodeIds: bound, boundCount: bound.length, offVocabulary: odd };
```

Expected: `offVocabulary` is empty. If it is not, those nodes violate the settled radius rule and must be set to `full`, `lg`, or `0` — that is a design fix, not a binding fix, and it should be applied at the master.

- [ ] **Step 4: Assign text styles where an exact match exists**

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const styles = await figma.getLocalTextStylesAsync();
const key = s => `${s.fontName.family}|${s.fontName.style}|${s.fontSize}`;
// Tailwind/* are a primitive mirror, not semantic styles — never auto-assign them.
const semantic = styles.filter(s => !s.name.startsWith('Tailwind/'));
const byKey = new Map(semantic.map(s => [key(s), s]));

const applied = [], noMatch = [];
const texts = page.findAllWithCriteria({ types: ['TEXT'] })
  .filter(t => !t.textStyleId || t.textStyleId === figma.mixed);
for (const t of texts) {
  if (t.fontName === figma.mixed || t.fontSize === figma.mixed) { noMatch.push(`${t.id} MIXED`); continue; }
  await figma.loadFontAsync(t.fontName);
  const m = byKey.get(key({ fontName: t.fontName, fontSize: t.fontSize }));
  if (m) { await t.setTextStyleIdAsync(m.id); applied.push(`${t.id} → ${m.name}`); }
  else noMatch.push(`${t.id} ${t.name.slice(0,30)} ${t.fontName.family} ${t.fontName.style} ${t.fontSize}`);
}
return { mutatedNodeIds: applied.map(a => a.split(' ')[0]), appliedCount: applied.length, applied, noMatch };
```

The font load before mutation is mandatory — skipping it throws `Cannot write to node with unloaded font`. Split this across two or three calls if it times out; `findAllWithCriteria` over 697 nodes plus a font load per node is the heaviest step in the plan.

- [ ] **Step 5: Record the `noMatch` list as named debt, do not invent styles**

Creating a `Body/30-regular` style to close the gap would change the settled type ramp. Log instead.

```bash
# open scripts/figma/named-debt.json and append one entry per noMatch id:
#   { "id": "<node id>", "reason": "<family> <style> <size> — no matching text style", "loggedAt": "2026-08-06" }
pnpm test
```

Expected: `pnpm test` passes (the `scripts/figma/*.test.mjs` suite validates the debt file shape).

- [ ] **Step 6: Re-run the Step 1 audit and diff**

Run the Step 1 script again unchanged. Expected: `gap` and `radius` at or near zero, `textStyle` reduced by `appliedCount`, `fill`/`stroke` containing only genuine chrome defects. Record the before/after pair — Task 7 renders it.

- [ ] **Step 7: Commit**

```bash
git add scripts/figma/named-debt.json .specs/01_active/design-system-docs/plan.md
git commit -m "chore(figma): bind off-ladder spacing and radii, assign text styles, log remaining debt"
```

---

### Task 5: Give every master a description that a recruiter can read

Most masters already carry a `description`. Fill the empty ones and make the existing ones consistent, because Figma surfaces `description` in the inspect panel and in the assets sidebar — it is documentation that travels with the component.

**Files:**
- Modify: masters on `🧩 Components` `461:759`

**Interfaces:**
- Consumes: the atomic classification table in the reference section
- Produces: every master has a non-empty description in the form `<Level> · <what it is>. <the decision it encodes>. Code: <path>`. Task 8 and Task 9 read these back into the Docs sheet rather than retyping them.

- [ ] **Step 1: List masters with empty or thin descriptions**

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const masters = page.findAllWithCriteria({ types: ['COMPONENT','COMPONENT_SET'] })
  .filter(n => n.parent.type !== 'COMPONENT_SET');
return masters
  .map(n => ({ id: n.id, name: n.name, len: (n.description || '').length, desc: n.description || '' }))
  .sort((a, b) => a.len - b.len);
```

Known-empty on 2026-08-06: `PreviewTitle` `2041:465`, `PageDescription` `2119:7440`, `WorkCardPreviewSmall` `2045:378`.

- [ ] **Step 2: Prefix every description with its atomic level**

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const LEVEL = {
  Atom: ["Icon","NavLink","NavLinkHome","Link/CTA","Link/Secondary","Link/SecondarySm","Link/TextCTA","Link/Icon",
         "ThemeToggle","MotionToggle","H1","H2","PreviewTitle","PageDescription","PostMetadataTime",
         "PostMetadataTopic","SerieMeta"],
  Molecule: ["PostRow","SerieCard","PostCardPreviewBig","PostCardPreviewSmall","WorkCardPreviewSmall",
             "HeroText","HeroAnimation","ContactContent"],
  Organism: ["Header","Footer","Hero","BlogPreviewSection","ArchiveTable","SerieCardList",
             "WorkPreviewSection","ContactPreviewSection"],
};
const FILL_IN = {
  "PreviewTitle": "Card and row title. IBM Plex Sans 600 — never the display font, which kills scanning at card size. Hover verb is an underline, never an accent repaint (accent would collide with the serie chip). Code: src/components/blog/PostRow.astro",
  "PageDescription": "Standfirst under a page H1. IBM Plex Sans 400 in color/foreground-muted, one or two lines. Not a component slot for marketing copy — it says what the page holds.",
  "WorkCardPreviewSmall": "Work preview card, image left. Borderless — the image is the frame — matching PostCardPreviewSmall so blog and work share one card grammar. Code: src/components/work/WorksPreview.astro",
};
const mutated = [], unclassified = [];
const masters = page.findAllWithCriteria({ types: ['COMPONENT','COMPONENT_SET'] })
  .filter(n => n.parent.type !== 'COMPONENT_SET');
for (const m of masters) {
  const level = Object.keys(LEVEL).find(k => LEVEL[k].includes(m.name));
  if (!level) { unclassified.push(m.name); continue; }
  const body = FILL_IN[m.name] || m.description || '';
  if (!body) { unclassified.push(`${m.name}: still empty`); continue; }
  m.description = body.startsWith(`${level} · `) ? body : `${level} · ${body}`;
  mutated.push(m.id);
}
return { mutatedNodeIds: mutated, count: mutated.length, unclassified };
```

Expected: `count` is 33 and `unclassified` is empty. A name in `unclassified` means a master was added or renamed since 2026-08-06 — classify it before continuing rather than skipping it.

- [ ] **Step 3: Verify**

Re-run Step 1. Expected: zero masters with `len` of 0, and every description starting `Atom · `, `Molecule · `, or `Organism · `.

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 5 master descriptions carry atomic level"
```

---

### Task 6: Build the `00 Read me` chapter

The current Docs sheet opens cold on the word "BORDER". A recruiter needs to know in ten seconds what they are looking at.

**Files:**
- Modify: `📚 Docs` `2545:671` — frames `2545:672` (Light), `2547:7597` (Dark)

**Interfaces:**
- Consumes: nothing
- Produces: a `CHAPTER / 00 Read me` frame as the first child of the Docs light frame, and a `chapterHeader(title, kicker)` construction pattern reused by Tasks 7–10

- [ ] **Step 1: Give the Docs frame a real vertical auto-layout with token-bound rhythm**

The current 4707px-tall frame has a large dead band after the Hover section, which is what an absolute-positioned or mis-gapped stack looks like.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const f = await figma.getNodeByIdAsync("2545:672");
const before = { layoutMode: f.layoutMode, gap: f.itemSpacing, h: Math.round(f.height),
  children: f.children.map(c => ({ name: c.name, y: Math.round(c.y), h: Math.round(c.height) })) };
f.layoutMode = "VERTICAL";
f.primaryAxisSizingMode = "AUTO";
f.counterAxisSizingMode = "FIXED";
f.itemSpacing = 96;
f.paddingTop = 96; f.paddingBottom = 96; f.paddingLeft = 96; f.paddingRight = 96;
return { mutatedNodeIds: [f.id], before, after: { h: Math.round(f.height) } };
```

Expected: `after.h` is meaningfully smaller than `before.h` of 4707 — the dead band collapses because auto-layout removes the gap that absolute positioning left behind.

- [ ] **Step 2: Build the masthead and prepend it**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const f = await figma.getNodeByIdAsync("2545:672");
await figma.loadFontAsync({ family: "Bubbler One", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });

const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

const txt = (chars, family, style, size, colourVar) => {
  const t = figma.createText();
  t.fontName = { family, style };
  t.characters = chars;
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", V[colourVar]);
  return t;
};

const head = figma.createAutoLayout("VERTICAL", { name: "CHAPTER / 00 Read me", itemSpacing: 24 });
head.appendChild(txt("BLOG DESIGN SYSTEM v1.0", "Fira Code", "Regular", 12, "color/foreground-muted"));
head.appendChild(txt("Design system", "Bubbler One", "Regular", 60, "color/foreground"));

const intro = txt(
  "The design system behind jeromeabel.net — a personal site and technical blog built with Astro 5 and Tailwind v4. " +
  "Every specimen on this page is a live instance of the component it documents, so the sheet cannot drift from the library. " +
  "Tokens flow in three layers: Primitives mirror Tailwind, Theme adds semantic names with Light and Dark modes, " +
  "Responsive carries what changes between breakpoints. Read top to bottom: tokens, then atoms, then molecules and organisms, then whole pages.",
  "IBM Plex Sans", "Regular", 18, "color/foreground");
head.appendChild(intro);

f.insertChild(0, head);
intro.layoutSizingHorizontal = "FIXED";
intro.resize(720, intro.height);
head.layoutSizingHorizontal = "FILL";
return { createdNodeIds: [head.id, intro.id] };
```

`textAutoResize = "HEIGHT"` plus an explicit `resize` width is required for wrapping text — `FILL` alone leaves the default `WIDTH_AND_HEIGHT` mode in charge and collapses the node to a thread.

- [ ] **Step 3: Add the how-this-maps-to-code table**

Three rows, mono, muted. Keep it factual — no claims about impact.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const head = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 00 Read me");
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

const ROWS = [
  ["Tokens",     "src/styles/global.css  @theme {}"],
  ["Components", "src/components/{app,ui,blog,work,hero,about,contact}/"],
  ["Pages",      "src/pages/  — Astro file-based routing"],
  ["Drift check","pnpm figma:verify  ·  scripts/figma/"],
];
const table = figma.createAutoLayout("VERTICAL", { name: "code map", itemSpacing: 8 });
for (const [k, v] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", { name: k, itemSpacing: 24 });
  for (const [s, colour] of [[k, "color/foreground"], [v, "color/foreground-muted"]]) {
    const t = figma.createText();
    t.fontName = { family: "Fira Code", style: "Regular" };
    t.characters = s; t.fontSize = 12; t.textAutoResize = "WIDTH_AND_HEIGHT";
    t.setBoundVariable("fills", V[colour]);
    row.appendChild(t);
  }
  row.children[0].resize(120, row.children[0].height);
  table.appendChild(row);
}
head.appendChild(table);
return { createdNodeIds: [table.id] };
```

- [ ] **Step 4: Screenshot and read it as a stranger**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const head = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 00 Read me");
await head.screenshot({ scale: 1 });
return { id: head.id, h: Math.round(head.height) };
```

Check: no clipped text, the intro wraps at 720 rather than running the full 1600, mono rows align, muted text is legible against the background.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 6 read-me chapter"
```

---

### Task 7: Build the `01 Tokens` chapter

**Files:**
- Modify: `📚 Docs` light frame `2545:672`
- Move into this chapter: `SECTION / Colour` `2545:7501`, `SECTION / Type` `2545:7464`, `SECTION / Spacing` `2545:7497`, `SECTION / Radius` `2545:7178`, `SECTION / Motion` `2546:297`

**Interfaces:**
- Consumes: the three collections from Task 1; the audit result from Task 4 Step 6
- Produces: a `CHAPTER / 01 Tokens` frame containing the three-layer diagram, the Theme mode table, the Responsive mode table, the re-homed property sections, and the verification panel

- [ ] **Step 1: Create the chapter frame and re-home the five property sections into it**

`appendChild` moves a node; it does not copy. The existing sections and their live instances survive the move intact.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const f = await figma.getNodeByIdAsync("2545:672");
const chapter = figma.createAutoLayout("VERTICAL", { name: "CHAPTER / 01 Tokens", itemSpacing: 64 });
f.insertChild(1, chapter);
chapter.layoutSizingHorizontal = "FILL";
const ORDER = ["SECTION / Colour", "SECTION / Type", "SECTION / Spacing", "SECTION / Radius", "SECTION / Motion"];
const moved = [], missing = [];
for (const name of ORDER) {
  const sec = f.children.find(c => c.name === name);
  if (!sec) { missing.push(name); continue; }
  chapter.appendChild(sec);
  moved.push(sec.id);
}
return { createdNodeIds: [chapter.id], movedNodeIds: moved, missing };
```

- [ ] **Step 2: Draw the three-layer token diagram at the top of the chapter**

This is the single most important panel for the recruiter audience — it is the thing that distinguishes a token system from a colour list.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 01 Tokens");
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }
const mk = (chars, family, style, size, colour, w) => {
  const t = figma.createText();
  t.fontName = { family, style }; t.characters = chars; t.fontSize = size;
  t.textAutoResize = "HEIGHT"; t.setBoundVariable("fills", V[colour]);
  if (w) t.resize(w, t.height);
  return t;
};

const LAYERS = [
  ["1 Primitives", "451 variables · 1 mode",
   "A mirror of the Tailwind v4 scale — every colour ramp, spacing step, radius, font size. Regenerated from the installed Tailwind with pnpm figma:primitives, so it is never hand-maintained. Nothing in a component binds to this layer directly."],
  ["2 Theme", "15 variables · Light / Dark",
   "The semantic layer, and the only one components are allowed to bind to. color/background, color/foreground, color/foreground-muted, color/border, color/surface, color/surface-hover, color/surface-raised, the four accent steps, and the three font families. Each aliases a primitive, per mode — which is why the Dark sheet is a clone with a mode switch, not a hand-recolour."],
  ["3 Responsive", "4 variables · Desktop / Tablet / Mobile",
   "What changes between breakpoints and nothing else: viewport/width 1280/768/390, container/gutter 32/24/16, section/rhythm-y 96/64/48, container/max-width 1280 as a cap. Page frames pin a mode from this collection and reflow — the mobile frames in chapter 04 are not resized duplicates."],
];
const diagram = figma.createAutoLayout("VERTICAL", { name: "token layers", itemSpacing: 24 });
diagram.appendChild(mk("THREE TOKEN LAYERS", "Fira Code", "Regular", 12, "color/foreground-muted"));
for (const [name, meta, body] of LAYERS) {
  const card = figma.createAutoLayout("VERTICAL", { name, itemSpacing: 8 });
  card.paddingTop = 24; card.paddingBottom = 24; card.paddingLeft = 24; card.paddingRight = 24;
  card.strokeWeight = 1;
  card.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  card.setBoundVariable("strokes", V["color/border"]);
  card.appendChild(mk(name, "IBM Plex Sans", "SemiBold", 20, "color/foreground"));
  card.appendChild(mk(meta, "Fira Code", "Regular", 12, "color/foreground-muted"));
  card.appendChild(mk(body, "IBM Plex Sans", "Regular", 16, "color/foreground", 900));
  diagram.appendChild(card);
  card.layoutSizingHorizontal = "FILL";
}
chapter.insertChild(0, diagram);
diagram.layoutSizingHorizontal = "FILL";
return { createdNodeIds: [diagram.id] };
```

Note the border: a full 1px border marks an **aggregate entity** — a container of parts — which is exactly what each layer card is. That is the settled border rule applied, not an arbitrary style choice.

- [ ] **Step 3: Add the verification panel using Task 4's real numbers**

Substitute the actual before/after counts from Task 4 Step 6. Do not round them and do not omit the residual debt — an honest number is the point.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 01 Tokens");
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

// REPLACE with the real before/after pair returned by Task 4 Step 6.
const ROWS = [
  ["itemSpacing unbound", "99", "0"],
  ["cornerRadius unbound", "31", "0"],
  ["strokes unbound (chrome)", "32", "0"],
  ["fills unbound (chrome)", "11", "0"],
  ["TEXT without a text style", "82", "TBD — logged as named debt"],
];
const panel = figma.createAutoLayout("VERTICAL", { name: "token verification", itemSpacing: 8 });
const mk = (s, colour, w) => { const t = figma.createText();
  t.fontName = { family: "Fira Code", style: "Regular" }; t.characters = s; t.fontSize = 12;
  t.textAutoResize = "HEIGHT"; t.setBoundVariable("fills", V[colour]); if (w) t.resize(w, t.height); return t; };
panel.appendChild(mk("TOKEN COVERAGE — 697 nodes scanned on the Components page, 2026-08-06", "color/foreground-muted"));
for (const [k, before, after] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", { name: k, itemSpacing: 16 });
  row.appendChild(mk(k, "color/foreground", 320));
  row.appendChild(mk(before, "color/foreground-muted", 60));
  row.appendChild(mk("→", "color/foreground-muted", 24));
  row.appendChild(mk(after, "color/foreground", 240));
  panel.appendChild(row);
}
chapter.appendChild(panel);
panel.layoutSizingHorizontal = "FILL";
return { createdNodeIds: [panel.id] };
```

- [ ] **Step 4: Screenshot and verify**

Expected: the chapter opens with the three-layer diagram, then Colour → Type → Spacing → Radius → Motion, then the verification panel. Each layer card has a visible 1px border in both themes. No clipped body text.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 7 tokens chapter"
```

---

### Task 8: Build the `02 Atoms` chapter

**Files:**
- Modify: `📚 Docs` light frame `2545:672`
- Move into this chapter: `SECTION / Border` `2545:674`, `SECTION / Buttons` `2545:7234`, `SECTION / Icons` `2545:7216`, `SECTION / Numbers` `2545:7479`

**Interfaces:**
- Consumes: the 17 atom masters and their Task 5 descriptions
- Produces: a `CHAPTER / 02 Atoms` frame with one labelled cell per atom, every cell a live instance

- [ ] **Step 1: Create the chapter and re-home the four atom-level property sections**

Same move pattern as Task 7 Step 1, with `ORDER = ["SECTION / Buttons", "SECTION / Icons", "SECTION / Numbers", "SECTION / Border"]` and `f.insertChild(2, chapter)`.

- [ ] **Step 2: Instantiate every atom that is not already shown, with its name and description beside it**

```js
const comps = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(comps);
const ATOMS = ["Icon","NavLink","NavLinkHome","Link/CTA","Link/Secondary","Link/SecondarySm","Link/TextCTA",
  "Link/Icon","ThemeToggle","MotionToggle","H1","H2","PreviewTitle","PageDescription",
  "PostMetadataTime","PostMetadataTopic","SerieMeta"];
const found = {};
for (const name of ATOMS) {
  const m = comps.findOne(n => (n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.name === name);
  found[name] = m ? { id: m.id, type: m.type, desc: m.description,
    defaultVariant: m.type === "COMPONENT_SET" ? m.defaultVariant.id : m.id } : null;
}
return found;
```

A `COMPONENT_SET` cannot be instantiated directly — instantiate `set.defaultVariant`. Carry the returned `defaultVariant` ids into the next call as string literals.

- [ ] **Step 3: Build the atom grid on the Docs page**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 02 Atoms");
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

// REPLACE with the {name: defaultVariant id} pairs returned by Step 2.
const CELLS = [["Link/CTA", "2012:6180"], ["Link/Secondary", "2041:276"]];

const grid = figma.createAutoLayout("VERTICAL", { name: "atom specimens", itemSpacing: 32 });
const created = [], failed = [];
for (const [name, compId] of CELLS) {
  const master = await figma.getNodeByIdAsync(compId);
  if (!master || master.type !== "COMPONENT") { failed.push(name); continue; }
  const cell = figma.createAutoLayout("VERTICAL", { name: `${name} cell`, itemSpacing: 12 });
  const label = figma.createText();
  label.fontName = { family: "Fira Code", style: "Regular" };
  label.characters = name; label.fontSize = 12; label.textAutoResize = "HEIGHT";
  label.setBoundVariable("fills", V["color/foreground-muted"]);
  cell.appendChild(label);
  cell.appendChild(master.createInstance());
  const desc = figma.createText();
  desc.fontName = { family: "IBM Plex Sans", style: "Regular" };
  desc.characters = (master.parent.type === "COMPONENT_SET" ? master.parent.description : master.description) || "";
  desc.fontSize = 14; desc.textAutoResize = "HEIGHT";
  desc.setBoundVariable("fills", V["color/foreground-muted"]);
  cell.appendChild(desc);
  desc.layoutSizingHorizontal = "FIXED";
  desc.resize(760, desc.height);
  grid.appendChild(cell);
  created.push(cell.id);
}
chapter.appendChild(grid);
grid.layoutSizingHorizontal = "FILL";
return { createdNodeIds: created, failed };
```

The description is read from the master, not retyped — so Task 5's descriptions and this sheet can never disagree.

- [ ] **Step 4: Verify every cell resolves to a real component**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 02 Atoms");
const insts = chapter.findAllWithCriteria({ types: ['INSTANCE'] });
const broken = [];
for (const i of insts) { const mc = await i.getMainComponentAsync(); if (!mc) broken.push(i.id); }
await chapter.screenshot({ scale: 1 });
return { instances: insts.length, broken };
```

Expected: `broken` is empty and `instances` is at least 17.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 8 atoms chapter"
```

---

### Task 9: Build the `03 Molecules & Organisms` chapter

**Files:**
- Modify: `📚 Docs` light frame `2545:672`
- Move into this chapter: `SECTION / Hover` `2545:7268`, `SECTION / Backgrounds` `2545:7516`, `SECTION / Illustration` `2546:282`

**Interfaces:**
- Consumes: the 8 molecule + 8 organism masters and their Task 5 descriptions
- Produces: a `CHAPTER / 03 Molecules & Organisms` frame with two labelled sub-groups

- [ ] **Step 1: Create the chapter, insert at index 3, and re-home Hover / Backgrounds / Illustration**

Same move pattern as Task 7 Step 1. Order within the chapter: molecule grid → organism grid → `SECTION / Hover` → `SECTION / Backgrounds` → `SECTION / Illustration`. Hover belongs here because a hover verb is a property of a *surface*, and surfaces are molecules and organisms — an atom like `H2` has no hover.

- [ ] **Step 2: Constrain the Illustration section**

At 1336px tall it is the single biggest section on the sheet and visually dominates a page about components. Cap each illustration cell.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const sec = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "SECTION / Illustration");
const before = Math.round(sec.height);
const resized = [];
for (const cell of sec.findAll(n => n.name === "Frame cell")) {
  const art = cell.children.find(c => c.type !== "TEXT");
  if (!art) continue;
  const scale = 240 / Math.max(art.width, art.height);
  if (scale < 1) { art.rescale(scale); resized.push(art.id); }
}
return { mutatedNodeIds: resized, before, after: Math.round(sec.height) };
```

The 200px minimum-render rule is a floor, not a target — 240px keeps the line weight legible while letting five illustrations sit in one band. Expected: `after` well under 600.

- [ ] **Step 3: Build the molecule and organism grids**

Reuse the Task 8 Step 3 script with `CELLS` replaced by the molecule list, then again for the organism list, appending each grid into the chapter. Organisms are wide — set each organism cell's instance `layoutSizingHorizontal = "FILL"` after appending so `Header` and `Footer` span the sheet rather than sitting at their authored width.

- [ ] **Step 4: Verify and screenshot**

Same verification as Task 8 Step 4 against the `03` chapter. Expected: `broken` empty, `instances` at least 16 plus whatever the moved sections contain.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 9 molecules and organisms chapter"
```

---

### Task 10: Build the `04 Pages` chapter

**Files:**
- Modify: `📚 Docs` light frame `2545:672`
- Reference: the eight frames on `Pages` `2558:18264` from Task 3

**Interfaces:**
- Consumes: the eight named frames from Task 3
- Produces: a `CHAPTER / 04 Pages` frame showing desktop and mobile side by side, at a scale that fits the 1600px sheet

- [ ] **Step 1: Turn each of the eight page frames into a component so the chapter can instance them**

A frame cannot be instanced; a component can. Converting the page frames to components is what keeps the Docs chapter live rather than a set of stale screenshots.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const made = [];
for (const f of [...page.children]) {
  if (f.type !== "FRAME") continue;
  const c = figma.createComponentFromNode(f);
  c.description = `Page template · ${c.name}. Theme and Responsive modes are pinned on this frame; the content is instances of the same components documented in chapters 02 and 03.`;
  made.push({ id: c.id, name: c.name });
}
return { createdNodeIds: made.map(m => m.id), made };
```

- [ ] **Step 2: Build the chapter — one row per page, desktop left, mobile right, light row then dark row**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const f = await figma.getNodeByIdAsync("2545:672");
const chapter = figma.createAutoLayout("VERTICAL", { name: "CHAPTER / 04 Pages", itemSpacing: 64 });
f.appendChild(chapter);
chapter.layoutSizingHorizontal = "FILL";
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

// REPLACE with the {name: component id} pairs returned by Step 1.
const PAGE_COMPONENTS = {};

const created = [], missing = [];
for (const p of ["Home", "Blog"]) {
  for (const th of ["Light", "Dark"]) {
    const row = figma.createAutoLayout("HORIZONTAL", { name: `${p} — ${th}`, itemSpacing: 48 });
    row.counterAxisAlignItems = "MIN";
    const label = figma.createText();
    label.fontName = { family: "Fira Code", style: "Regular" };
    label.characters = `${p.toUpperCase()} — ${th.toUpperCase()} — 1280 / 390`;
    label.fontSize = 12; label.textAutoResize = "HEIGHT";
    label.setBoundVariable("fills", V["color/foreground-muted"]);
    const wrap = figma.createAutoLayout("VERTICAL", { name: `${p} ${th} cell`, itemSpacing: 16 });
    wrap.appendChild(label);
    for (const bp of ["Desktop", "Mobile"]) {
      const id = PAGE_COMPONENTS[`${p} — ${bp} — ${th}`];
      if (!id) { missing.push(`${p} — ${bp} — ${th}`); continue; }
      const master = await figma.getNodeByIdAsync(id);
      const inst = master.createInstance();
      inst.rescale(0.5);   // 1280 → 640, 390 → 195; the pair fits the 1600 sheet with room to label
      row.appendChild(inst);
    }
    wrap.appendChild(row);
    chapter.appendChild(wrap);
    created.push(wrap.id);
  }
}
return { createdNodeIds: created, missing };
```

`rescale` on an instance scales the render without detaching it — the instance still tracks its master, so a component fix still propagates here.

- [ ] **Step 3: Add the caption explaining the mechanism**

This is the paragraph that answers "how do you handle responsive" for a reader who will not open the variables panel. Wrap at 900px, `IBM Plex Sans` 16, `color/foreground`:

> Mobile is not a resized duplicate. Each frame pins two variable modes — one from `2 Theme` (Light or Dark) and one from `3 Responsive` (Desktop or Mobile). The frame's width is bound to `viewport/width`, its gutter to `container/gutter`, its section rhythm to `section/rhythm-y`, and the content container is capped by `container/max-width`. Switching the mode reflows the frame; the content stays instances of the same components documented above. Four frames per page, one source of truth.

- [ ] **Step 4: Verify and screenshot**

Expected: four labelled rows, each with a desktop render and a narrow mobile render beside it, `missing` empty, and every instance still bound to a master.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 10 pages chapter"
```

---

### Task 11: Regenerate the Dark sheet, tidy the file, prepare it to share

**Files:**
- Modify: `📚 Docs` `2545:671` — replace the Dark frame `2547:7597`
- Modify: `📖 Cover` `0:1`
- Modify: `🎨 Foundations` `5:14`
- Modify: `🗄️ Archive & XP` `442:5352`

**Interfaces:**
- Consumes: the finished light frame from Tasks 6–10
- Produces: a Dark frame that is a clone with the mode reapplied, a real cover, and a file whose page list reads as intentional

- [ ] **Step 1: Rebuild the Dark sheet as a clone, never by hand-recolouring**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const light = await figma.getNodeByIdAsync("2545:672");
const oldDark = page.children.find(n => n.name.includes("Dark"));
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const T = Object.fromEntries(theme.modes.map(m => [m.name, m.modeId]));

light.name = "DOCS / Design System — Light";
light.setExplicitVariableModeForCollection(theme, T.Light);
const dark = light.clone();
dark.name = "DOCS / Design System — Dark";
dark.setExplicitVariableModeForCollection(theme, T.Dark);
dark.x = light.x + light.width + 200;
dark.y = light.y;
const removedId = oldDark ? oldDark.id : null;
if (oldDark) oldDark.remove();
return { createdNodeIds: [dark.id], removedNodeIds: removedId ? [removedId] : [], counts: { light: light.children.length, dark: dark.children.length } };
```

Expected: `light` and `dark` child counts are identical. Screenshot the dark frame and confirm it repainted itself — any element still showing light-mode colour has an unbound fill and is a Task 4 miss, so fix it at the source rather than recolouring the clone.

**Illustration caveat:** the five illustration vectors are intentionally unbound and were previously handled by cloning with every channel flipped. After this clone they will render black-on-dark. Re-apply the channel flip to the dark copies only:

```js
const dark = (await figma.getNodeByIdAsync("2545:671")).children.find(n => n.name.includes("Dark"));
const sec = dark.findOne(n => n.name === "SECTION / Illustration");
const flipped = [];
for (const n of sec.findAll(v => Array.isArray(v.fills) && v.fills.length)) {
  n.fills = n.fills.map(p => p.type === "SOLID"
    ? { ...p, color: { r: 1 - p.color.r, g: 1 - p.color.g, b: 1 - p.color.b } }
    : (p.gradientStops ? { ...p, gradientStops: p.gradientStops.map(s => ({ ...s, color: { ...s.color, r: 1 - s.color.r, g: 1 - s.color.g, b: 1 - s.color.b } })) } : p));
  flipped.push(n.id);
}
for (const n of sec.findAll(v => Array.isArray(v.strokes) && v.strokes.length)) {
  n.strokes = n.strokes.map(p => p.type === "SOLID"
    ? { ...p, color: { r: 1 - p.color.r, g: 1 - p.color.g, b: 1 - p.color.b } } : p);
  flipped.push(n.id);
}
return { mutatedNodeIds: [...new Set(flipped)] };
```

This is what `dark:invert` does in CSS, reproduced in Figma. It is a known, documented compromise — say so in the section caption rather than leaving it to be discovered.

- [ ] **Step 2: Rebuild the cover**

The cover is the thumbnail in Figma's file browser and the first thing a shared link shows. Title, subtitle, one line of context.

```js
const page = await figma.getNodeByIdAsync("0:1");
await figma.setCurrentPageAsync(page);
const cover = page.children[0];
await figma.loadFontAsync({ family: "Bubbler One", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const texts = cover.findAllWithCriteria({ types: ['TEXT'] });
return { coverId: cover.id, existing: texts.map(t => ({ id: t.id, chars: t.characters, size: t.fontSize })) };
```

Then set the title to `Design system`, the kicker to `JEROMEABEL.NET · v1.0 · 2026`, and the standfirst to: `Tokens, components and page templates for a personal site and technical blog. Astro 5, Tailwind v4. Every specimen is a live component instance.` Load each node's *current* font via `getStyledTextSegments(['fontName'])` before writing characters.

- [ ] **Step 3: Decide the fate of `🎨 Foundations`**

It holds four frames; `Tailwind Font Sizes` (`365:55`, 2776 × 2542) is a primitive dump that duplicates the `Tailwind/text-*` styles and adds nothing a reader needs. `Foundations · Colors` / `Typography` / `Scale` overlap chapter 01.

Move `Tailwind Font Sizes` to `🗄️ Archive & XP`, keep the other three as the deep-dive reference, and rename the page `🎨 Foundations (reference)` so a reader knows chapter 01 is the front door and this is the appendix.

```js
const src = await figma.getNodeByIdAsync("5:14");
await figma.setCurrentPageAsync(src);
const dump = src.children.find(n => n.name === "Tailwind Font Sizes");
const archive = await figma.getNodeByIdAsync("442:5352");
if (dump) archive.appendChild(dump);
src.name = "🎨 Foundations (reference)";
return { movedNodeIds: dump ? [dump.id] : [], pageName: src.name };
```

- [ ] **Step 4: Corral the loose nodes on `🗄️ Archive & XP`**

Around 110 top-level nodes sit loose there — screenshots, stray text, orphan frames. Anyone opening the file sees it. Wrap everything in one collapsed section so the page reads as an archive rather than a mess.

```js
const page = await figma.getNodeByIdAsync("442:5352");
await figma.setCurrentPageAsync(page);
const loose = page.children.filter(n => n.type !== "SECTION");
const box = figma.createSection();
box.name = "ARCHIVE — pre-v3 material, kept as negative reference";
page.appendChild(box);
let x = 0;
for (const n of loose) { box.appendChild(n); n.x = x; n.y = 0; x += n.width + 80; }
return { movedNodeIds: loose.map(n => n.id), count: loose.length };
```

- [ ] **Step 5: Order the page list so it reads top-down**

```js
const want = ["📖 Cover", "📚 Docs", "🧩 Components", "🎨 Foundations (reference)", "Pages", "🗄️ Archive & XP"];
const byName = Object.fromEntries(figma.root.children.map(p => [p.name, p]));
const moved = [];
want.forEach((n, i) => { if (byName[n]) { figma.root.insertChild(i, byName[n]); moved.push(n); } });
return { order: figma.root.children.map(p => p.name), moved };
```

Rename `Pages` to `📄 Pages` in the same pass so every page carries an emoji and the sidebar scans.

- [ ] **Step 6: Final whole-file verification**

```js
const pages = figma.root.children.map(p => p.name);
const docs = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(docs);
const out = [];
for (const frame of docs.children) {
  const insts = frame.findAllWithCriteria({ types: ['INSTANCE'] });
  const broken = [];
  for (const i of insts) { const mc = await i.getMainComponentAsync(); if (!mc) broken.push(i.id); }
  out.push({ frame: frame.name, h: Math.round(frame.height), chapters: frame.children.map(c => c.name),
    instances: insts.length, broken: broken.length });
}
return { pages, docs: out };
```

Expected: two frames, each with chapters `CHAPTER / 00 Read me` → `01 Tokens` → `02 Atoms` → `03 Molecules & Organisms` → `04 Pages`, `broken: 0` on both, and matching instance counts between Light and Dark.

- [ ] **Step 7: Screenshot both full sheets and read them end to end**

Ask of the result: can a stranger name the three token layers, the three button styles, the hover verb for a row, and the difference between an atom and an organism, without opening anything else? If not, the gap is a copy gap — fix the caption, not the layout.

- [ ] **Step 8: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 11 dark sheet, cover, file tidy"
```

---

### Task 12: Sync the repo documentation to match the file

The repo's Figma knowledge file still describes the pre-cleanup structure — five pages, a `🗄️ Legacy` page that no longer exists, a `📄 Pages` node map from the old file. Anyone (human or agent) trusting it will write to the wrong nodes.

**Files:**
- Modify: `.claude/skills/figma-verify/knowledge/figma-ds-file.md`
- Modify: `.claude/skills/design-expert/references/artistic-direction.md`
- Modify: `CLAUDE.md`
- Modify: `.specs/01_active/design-system-docs/spec.md`

**Interfaces:**
- Consumes: the final page list and node ids from Task 11 Step 6
- Produces: a knowledge file that matches the live file, so the next Pass-0 inventory confirms rather than contradicts it

- [ ] **Step 1: Rewrite the Pages table in `figma-ds-file.md`**

Replace the five-row table (which still lists `🗄️ Legacy` `78:2` and `📄 Pages` `44:328`) with the six live pages and their real ids from Task 11 Step 6. Keep the "Node IDs are volatile" warning and the `get_metadata` page-list gotcha — both are still true and both were load-bearing during this work.

- [ ] **Step 2: Replace the component-master table with the atomic classification**

The current table groups by SECTION. Regroup by Atom / Molecule / Organism, using the 33-master table from this plan's reference section, and note that each master's `description` now carries its level as a prefix.

- [ ] **Step 3: Add a Responsive section to the Tokens block**

Document the three collections with their mode counts and the per-mode resolved values from Task 1 Step 3, and state the mechanism: page frames pin `(Theme, Responsive)` mode pairs; mobile frames are mode switches, not duplicates.

- [ ] **Step 4: Add a change-log entry**

```markdown
- **2026-08-06** — Docs page restructured onto an atomic spine (`00 Read me` → `01 Tokens` →
  `02 Atoms` → `03 Molecules & Organisms` → `04 Pages`); the 12 property sections were re-homed,
  not deleted. Wired `3 Responsive` so `container/gutter` (32/24/16) and `section/rhythm-y`
  (96/64/48) differ per mode — they previously aliased one primitive in all three modes, making
  "Mobile" a Desktop frame at a narrower width. Home and Blog each ship 4 frames
  (Desktop 1280 / Mobile 390 × Light / Dark) driven by pinned mode pairs. Token audit on
  697 Components-page nodes: bound off-ladder itemSpacing and unbound radii, assigned text styles
  where an exact match existed, logged the rest as named debt. `🎨 Foundations` renamed
  `(reference)`; the `Tailwind Font Sizes` dump moved to Archive.
```

- [ ] **Step 5: Update `CLAUDE.md`**

The "Figma Design Tokens" section describes the drift-check tooling but not the file's documentation structure. Add two sentences naming the `📚 Docs` page as the shareable entry point and the three token collections.

- [ ] **Step 6: Fill in the spec stub**

`.specs/01_active/design-system-docs/spec.md` is still the generated placeholder (`<what>. <why>.`). Write the real what/why, link this plan, and set `Size: M`.

- [ ] **Step 7: Verify nothing in the repo still points at dead nodes**

```bash
rtk grep -rn "78:2\|44:328\|SPEC / Specimen\|🗄️ Legacy" --include=*.md . | grep -v node_modules | grep -v 02_archives
```

Expected: no hits outside `.specs/02_archives/` (archived specs are historical records and are left alone).

- [ ] **Step 8: Commit and archive the spec**

```bash
pnpm format:write
git add -A
git commit -m "docs(figma): sync DS knowledge file to the restructured Figma documentation"
./.specs/specs.sh archive design-system-docs
git add .specs && git commit -m "docs(specs): archive design-system-docs"
```

---

## Self-review notes

**Spec coverage.** "Improve, clean, update the documentation" → Tasks 6–11. "Shareable for senior frontend recruiters" → Task 6 (read-me), Task 11 (cover, page order, archive tidy). "Design decisions clearly documented" → the 12 property sections are re-homed inline in Tasks 7–9 rather than deleted, plus per-master descriptions in Task 5. "Atoms / molecules / organisms / tokens clearly documented" → Task 5 classification, Tasks 7–9 chapters. "Token usage must be verified" → Task 4 audit and fixes, Task 7 verification panel. "How to show desktop and mobile" → Tasks 1–3 and the Task 10 chapter.

**Known soft spots, stated rather than hidden.**

1. Task 2 Step 3 is the real risk. Content composed at 1920 will overflow at 390 and the fix is at the masters, which is unbounded work. If overflow is widespread, the honest fallback is to ship Home responsive and document Blog desktop-only — say so, do not quietly narrow the scope.
2. Task 4 Step 4 (font load per text node across 697 nodes) may exceed a single call's budget. Splitting it across calls is expected, not a failure.
3. Task 8 Step 3 and Task 10 Step 2 carry literal `CELLS` / `PAGE_COMPONENTS` placeholders that are filled from the immediately preceding discovery step's return value. They are deliberate — component ids cannot be known before Task 3 and Task 5 run — but they must be substituted, not left as-is.
4. The Task 7 verification panel hardcodes the 2026-08-06 baseline. Replace the `ROWS` array with Task 4's real after-numbers before shipping; a stale panel is worse than no panel.
