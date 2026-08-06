---
created: 2026-08-06
status: plan — ready to execute
---

# Design System Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Figma file `Blog Design System v1.0` into a single shareable URL that a senior-frontend recruiter can read top-to-bottom and come away knowing what was decided, why, and how it maps to shipped code — with tokens, elements and components named in current industry vocabulary, token binding verified, and every page shown in both desktop and mobile.

**Architecture:** The `📚 Docs` page is rebuilt around a smallest-to-largest spine — `00 Read me` → `01 Tokens` → `02 Elements` → `03 Components` → `04 Pages` — replacing the current 12 property-named sections. The 12 property decisions are not deleted; each is re-homed inline next to the thing it governs. Every specimen stays a live `createInstance()` of a real library component, so fixing a component fixes the docs. Responsive views are produced by Figma **variable modes**, not by hand-resized duplicates: the existing `3 Responsive` collection (Desktop/Tablet/Mobile) is finished so that `container/gutter` and `section/rhythm-y` actually differ per mode, page containers get `maxWidth` bound to `container/max-width`, and each page frame pins one `(Theme, Responsive)` mode pair.

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
- **Decision copy is verbatim.** `decisions.md` in this folder holds every validated caption harvested from the live Docs sheet (which carried them from the old `SPEC / Specimen` page). Rebuilding re-homes those strings; it does not reword them. Paraphrasing a validated decision is a defect.
- **The sheet must read as one visual identity, not three.** The thesis is the three-layer model from `artistic-direction`: **Chrome** (nav, header, footer, buttons, toggles, icons — precise and quiet, for the engineer register), **Content** (cards, rows, prose, metadata — hierarchy and scanability), **Hand** (the five author-drawn SVGs — the single controlled escape valve for the artist register). The rule that binds them: only one layer is expressive at a time; Chrome and Content stay precise so the Hand layer reads as deliberate. Every decision card carries a layer tag, and chapter `00` states the thesis outright. A reader scanning only the tags should come away with it.
- **Copy tone:** conversational, concrete, no marketing abstractions, numbers carry context, no overclaims. See the `copy-tone-no-marketing` memory and `design-expert/references/copywriting.md`.
- **Both themes ship together.** Every Docs chapter exists in a Light frame and a Dark frame; the Dark frame is a clone with the `2 Theme` mode reapplied, never hand-recoloured.
- **Atomic-design jargon is dropped (research review 2026-08-06).** No major system (Material, Carbon, Polaris, Atlassian, GOV.UK, Primer) organizes docs by atoms/molecules/organisms, and Brad Frost himself no longer uses the labels. Chapters are `02 Elements` and `03 Components`; description prefixes are `Element ·`, `Component ·`, `Section ·`. The composition order (small → large) is kept; the labels are not.
- **The file is not stable yet.** Only Home and Blog page templates exist. Cover status is `v1.0 — in progress`, never `stable`, until all pages land.

## Reference data captured 2026-08-06

**Pages**

| Page | ID |
|---|---|
| `📖 Cover` | `0:1` |
| `📚 Docs` | `2545:671` |
| `🎨 Foundations` | `5:14` — 3 frames: `Foundations · Colors` `6:2`, `Foundations · Typography` `8:2`, `Tailwind Font Sizes` `365:55`. `Foundations · Scale` is gone. |
| `🧩 Components` | `461:759` — 8 SECTIONs, 33 masters |
| `📄 Pages` | `2558:18264` |

**`🗄️ Archive & XP` was deleted from this file on 2026-08-06** — its content lives in the backup `Wf4iomVMYUXlFIBV3Z8bx4`. Five pages remain. The removal left one defect that Task 2b fixes: three instances on the live page frames still reference an **orphaned local `Icon` component set `52:136`** whose parent chain no longer reaches a page. The live set is `Icon` `461:6204`.

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

**Component master inventory (`🧩 Components`, 33 masters) and its level classification**

| Level | Masters (name — id) |
|---|---|
| **Elements** (17) | `Icon` `461:6204` · `NavLink` `2001:1309` · `NavLinkHome` `2001:1312` · `Link/CTA` `2012:6179` · `Link/Secondary` `2041:275` · `Link/SecondarySm` `2350:737` · `Link/TextCTA` `2041:313` · `Link/Icon` `2093:6332` · `ThemeToggle` `16:11` · `MotionToggle` `16:12` · `H1` `2119:7406` · `H2` `2034:213` · `PreviewTitle` `2041:465` · `PageDescription` `2119:7440` · `PostMetadataTime` `2040:482` · `PostMetadataTopic` `2371:10414` · `SerieMeta` `2375:10662` |
| **Components** (8) | `PostRow` `2124:7937` · `SerieCard` `2367:7205` · `PostCardPreviewBig` `2385:7139` · `PostCardPreviewSmall` `2385:7149` · `WorkCardPreviewSmall` `2045:378` · `HeroText` `2012:6142` · `HeroAnimation` `2012:315` · `ContactContent` `131:101` |
| **Sections** (8) | `Header` `2001:1669` · `Footer` `2099:2560` · `Hero` `2012:6305` · `BlogPreviewSection` `2041:560` · `ArchiveTable` `2124:8011` · `SerieCardList` `2119:7557` · `WorkPreviewSection` `2045:428` · `ContactPreviewSection` `2114:7281` |

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

### Task 2b: Reconnect the orphaned `Icon` instances left by the Archive deletion

Deleting `🗄️ Archive & XP` took a second `Icon` component set (`52:136`) with it, but three instances on the live page frames still point at it. They render, so nothing looks wrong — but their master is unreachable, so a library fix will never reach them and duplicating or publishing the file degrades them.

**This must run before Task 3.** Task 3 clones each page frame three times; fixing three orphans now avoids fixing twelve later.

**Files:**
- Modify: `📄 Pages` `2558:18264` — frames `2558:18265` (Home), `2558:18273` (Blog)

**Interfaces:**
- Consumes: the live `Icon` set `461:6204` on `🧩 Components`
- Produces: zero instances whose main component's ancestry fails to reach a page. Task 3 Step 5 and Task 11 Step 6 both re-assert this.

- [x] **Step 1: Map the orphans to their live equivalents by variant**

```js
const comps = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(comps);
const liveSet = comps.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'Icon');
return {
  liveSetId: liveSet && liveSet.id,
  variants: liveSet ? liveSet.children.map(c => ({ id: c.id, name: c.name })) : [],
  props: liveSet ? liveSet.componentPropertyDefinitions : null,
};
```

Expected: a set at `461:6204` with variants named `icon=arrow-down`, `icon=arrow-right`, and the rest. Record the ids for `arrow-down` and `arrow-right` — Step 2 needs them as literals.

- [x] **Step 2: Swap each orphan onto the live variant**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);

// REPLACE with the variant ids returned by Step 1.
const LIVE = { "icon=arrow-down": "461:6205", "icon=arrow-right": "461:6211" };

const swapped = [], unresolved = [];
for (const inst of page.findAllWithCriteria({ types: ['INSTANCE'] })) {
  const mc = await inst.getMainComponentAsync();
  if (!mc) { unresolved.push({ id: inst.id, why: "no main component" }); continue; }
  let root = mc; while (root && root.type !== 'PAGE') root = root.parent;
  if (root && root.type === 'PAGE') continue;          // healthy
  const target = LIVE[mc.name];
  if (!target) { unresolved.push({ id: inst.id, master: mc.name }); continue; }
  const live = await figma.getNodeByIdAsync(target);
  inst.swapComponent(live);
  swapped.push({ id: inst.id, to: mc.name });
}
return { mutatedNodeIds: swapped.map(s => s.id), swapped, unresolved };
```

`swapComponent` preserves overrides where the two components share layer names — these are icon instances with no text overrides, so nothing is at risk. If `unresolved` is non-empty, an orphan exists that is not an Icon; do not guess a replacement, report it.

- [x] **Step 3: Verify zero orphans remain, and that the icons still look right**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const insts = page.findAllWithCriteria({ types: ['INSTANCE'] });
const orphans = [];
for (const i of insts) {
  const mc = await i.getMainComponentAsync();
  if (!mc) { orphans.push({ id: i.id, why: "null master" }); continue; }
  let root = mc; while (root && root.type !== 'PAGE') root = root.parent;
  if (!root || root.type !== 'PAGE') orphans.push({ id: i.id, master: mc.name });
}
const home = await figma.getNodeByIdAsync("2558:18265");
await home.screenshot({ scale: 0.5 });
return { instances: insts.length, orphans };
```

Expected: `orphans` empty, `instances` still 116. Check the screenshot for a missing or wrong-direction arrow — a swap onto the wrong variant is silent.

- [x] **Step 4: Sweep the whole file once**

Run the same orphan check against `📚 Docs`, `🧩 Components` and `📖 Cover` as three parallel `use_figma` calls (one `setCurrentPageAsync` each — never loop pages inside one script). Any orphan found on the Components page is more serious: a master referencing a deleted master means a broken library, not just a broken frame.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 2b reconnect orphaned Icon instances"
```

---

### Task 3: Build the eight page frames (Home/Blog × Desktop/Mobile × Light/Dark)

**Files:**
- Modify: `Pages` page `2558:18264`
- Modify: whichever component masters Task 2 Step 3 flagged as fixed-width

**Interfaces:**
- Consumes: bound frames from Task 2, mode ids from Task 1
- Produces: eight frames named exactly `Home — Desktop — Light`, `Home — Desktop — Dark`, `Home — Mobile — Light`, `Home — Mobile — Dark`, and the same four for `Blog`. Task 10 references these by name.

- [x] **Step 1: Fix fixed-width masters flagged in Task 2**

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

- [x] **Step 2: Rename the two existing frames to the Desktop/Dark slots**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const home = await figma.getNodeByIdAsync("2558:18265");
const blog = await figma.getNodeByIdAsync("2558:18273");
home.name = "Home — Desktop — Dark";
blog.name = "Blog — Desktop — Dark";
return { mutatedNodeIds: [home.id, blog.id], names: [home.name, blog.name] };
```

- [x] **Step 3: Clone into the remaining six frames and pin one mode pair each**

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

- [x] **Step 4: Lay the eight frames out in a readable grid**

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

- [x] **Step 5: Verify all eight and screenshot the mobile pair**

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

- [x] **Step 6: Commit**

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

- [x] **Step 1: Re-run the baseline audit and classify each gap**

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

- [x] **Step 2: Bind off-ladder `itemSpacing` to the spacing scale**

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

- [x] **Step 3: Bind unbound radii to the three-value vocabulary**

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

- [x] **Step 4: Assign text styles where an exact match exists**

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

- [x] **Step 5: Record the `noMatch` list as named debt, do not invent styles**

Creating a `Body/30-regular` style to close the gap would change the settled type ramp. Log instead.

```bash
# open scripts/figma/named-debt.json and append one entry per noMatch id:
#   { "id": "<node id>", "reason": "<family> <style> <size> — no matching text style", "loggedAt": "2026-08-06" }
pnpm test
```

Expected: `pnpm test` passes (the `scripts/figma/*.test.mjs` suite validates the debt file shape).

- [x] **Step 6: Re-run the Step 1 audit and diff**

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
- Consumes: the level classification table in the reference section
- Produces: every master has a non-empty description in the form `<Level> · <what it is>. <the decision it encodes>. Code: <path>` where Level is `Element`, `Component`, or `Section`. Task 8 and Task 9 read these back into the Docs sheet rather than retyping them.

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

- [ ] **Step 2: Prefix every description with its level**

```js
const page = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(page);
const LEVEL = {
  Element: ["Icon","NavLink","NavLinkHome","Link/CTA","Link/Secondary","Link/SecondarySm","Link/TextCTA","Link/Icon",
         "ThemeToggle","MotionToggle","H1","H2","PreviewTitle","PageDescription","PostMetadataTime",
         "PostMetadataTopic","SerieMeta"],
  Component: ["PostRow","SerieCard","PostCardPreviewBig","PostCardPreviewSmall","WorkCardPreviewSmall",
             "HeroText","HeroAnimation","ContactContent"],
  Section: ["Header","Footer","Hero","BlogPreviewSection","ArchiveTable","SerieCardList",
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

Re-run Step 1. Expected: zero masters with `len` of 0, and every description starting `Element · `, `Component · `, or `Section · `.

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 5 master descriptions carry level prefix"
```

---

### Task 5b: Build the `Docs/` kit — five components the sheet is assembled from

**Do the docs need their own components? Yes — five of them.** The rebuilt sheet contains roughly 63 specimen cells, 17 decision cards, 3 do/don't pairs, 5 chapter headers and ~20 token rows *per frame*. Without components, changing a caption size is 63 edits; with them it is one. More importantly, the layer tag (Chrome / Content / Hand) is the mechanism that makes the identity read as cohesive — a variant property enforces it, hand-typed text drifts. `Docs/DoDont` earns its slot with three uses (research review 2026-08-06: side-by-side do/don't pairs are the most-copied rationale device across Carbon, GOV.UK and Primer).

The objection is real and is mitigated, not ignored: doc components show up in the assets panel beside product components. Every master is name-prefixed `Docs/` and lives in one `SECTION / Docs kit` on the Docs page, so a reader browsing the library sees a labelled toolbox, not clutter.

**Files:**
- Modify: `📚 Docs` `2545:671` — new `SECTION / Docs kit`

**Interfaces:**
- Consumes: `2 Theme` variables; the layer taxonomy from `decisions.md`
- Produces: `Docs/ChapterHeader`, `Docs/SpecimenCell`, `Docs/DecisionCard` (variant `layer` = Chrome | Content | Hand | All), `Docs/TokenRow`, `Docs/DoDont`. Tasks 6–10 instantiate these instead of building text stacks by hand.

- [ ] **Step 1: Create the kit section and the two simple components**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

const txt = (name, chars, family, style, size, colour, w) => {
  const t = figma.createText();
  t.name = name;
  t.fontName = { family, style };
  t.characters = chars;
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", V[colour]);
  if (w) t.resize(w, t.height);
  return t;
};

const kit = figma.createSection();
kit.name = "SECTION / Docs kit";
page.appendChild(kit);
kit.x = 3600; kit.y = 0; kit.resizeWithoutConstraints(1400, 1200);

// Docs/ChapterHeader — number, title, one-line summary
const chHead = figma.createAutoLayout("VERTICAL", { name: "Docs/ChapterHeader", itemSpacing: 12 });
chHead.appendChild(txt("number", "01", "Fira Code", "Regular", 12, "color/foreground-muted"));
chHead.appendChild(txt("title", "Tokens", "Bubbler One", "Regular", 40, "color/foreground"));
chHead.appendChild(txt("summary", "One line saying what this chapter covers.", "IBM Plex Sans", "Regular", 18, "color/foreground-muted", 720));
kit.appendChild(chHead);
const chHeadC = figma.createComponentFromNode(chHead);
chHeadC.description = "Docs kit · chapter heading. Number, title, one-line summary. Used once per chapter on both the Light and Dark sheets.";

// Docs/SpecimenCell — mono label, empty slot for a live instance, caption
const cell = figma.createAutoLayout("VERTICAL", { name: "Docs/SpecimenCell", itemSpacing: 12 });
cell.appendChild(txt("label", "Link/CTA", "Fira Code", "Regular", 12, "color/foreground-muted"));
const slot = figma.createAutoLayout("HORIZONTAL", { name: "slot", itemSpacing: 16 });
slot.paddingTop = 8; slot.paddingBottom = 8;
cell.appendChild(slot);
cell.appendChild(txt("caption", "The validated decision, verbatim.", "IBM Plex Sans", "Regular", 14, "color/foreground-muted", 640));
kit.appendChild(cell);
const cellC = figma.createComponentFromNode(cell);
cellC.description = "Docs kit · one specimen. Drop a live component instance into the `slot` child; never rebuild the component by hand. Caption text is copied verbatim from decisions.md.";

return { createdNodeIds: [kit.id, chHeadC.id, cellC.id] };
```

`createComponentFromNode` must run *after* the node is parented and its text filled — converting first then editing children risks the font-load error on a node that is now a component.

- [ ] **Step 2: Build `Docs/DecisionCard` as a variant set keyed on layer**

The layer tag is the identity mechanism, so it is a variant property, not free text.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const kit = page.children.find(n => n.name === "SECTION / Docs kit");
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

const txt = (name, chars, family, style, size, colour, w) => {
  const t = figma.createText();
  t.name = name; t.fontName = { family, style }; t.characters = chars; t.fontSize = size;
  t.textAutoResize = "HEIGHT"; t.setBoundVariable("fills", V[colour]);
  if (w) t.resize(w, t.height);
  return t;
};

const variants = [];
for (const layer of ["Chrome", "Content", "Hand", "All"]) {
  const card = figma.createAutoLayout("VERTICAL", { name: `layer=${layer}`, itemSpacing: 12 });
  card.paddingTop = 24; card.paddingBottom = 24; card.paddingLeft = 24; card.paddingRight = 24;
  card.strokeWeight = 1;
  card.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  card.setBoundVariable("strokes", V["color/border"]);

  // The tag is a chip: full radius, because a chip is the pressable vocabulary shape even
  // when it is not pressable here — consistency of shape language beats literal affordance.
  const chip = figma.createAutoLayout("HORIZONTAL", { name: "layer tag", itemSpacing: 8 });
  chip.paddingTop = 4; chip.paddingBottom = 4; chip.paddingLeft = 12; chip.paddingRight = 12;
  chip.cornerRadius = 9999;
  chip.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
  chip.setBoundVariable("fills", V[layer === "Hand" ? "color/accent-subtle" : "color/surface"]);
  chip.appendChild(txt("layer", layer.toUpperCase(), "Fira Code", "Regular", 12,
    layer === "Hand" ? "color/accent-strong" : "color/foreground-muted"));
  card.appendChild(chip);

  card.appendChild(txt("rule", "The rule, stated as a rule.", "IBM Plex Sans", "SemiBold", 20, "color/foreground", 760));
  card.appendChild(txt("body", "Why it was decided this way.", "IBM Plex Sans", "Regular", 16, "color/foreground-muted", 760));
  card.appendChild(txt("finding", "", "Fira Code", "Regular", 12, "color/foreground-muted", 760));
  kit.appendChild(card);
  variants.push(figma.createComponentFromNode(card));
}
const set = figma.combineAsVariants(variants, kit);
set.name = "Docs/DecisionCard";
set.description = "Docs kit · one design decision. The `layer` variant tags it Chrome, Content, Hand, or All — the tag is what makes the three-layer identity legible when scanning. Rule text is verbatim from decisions.md. Leave `finding` empty unless the decision has a recorded gap.";
return { createdNodeIds: [set.id], variants: variants.map(v => v.id) };
```

`combineAsVariants` needs every variant named `property=value` before the call and takes the parent as its second argument. Hand gets the accent-subtle chip because it is the one expressive layer — the tag itself demonstrates the accent budget rule.

- [ ] **Step 3: Build `Docs/TokenRow`**

Five columns: token name (mono), **role** (the token's one job, IBM Plex Sans 14 muted — the Radix model: a token is never a bare number, it's a role), and one value column per mode. Same construction pattern as Step 1's `Docs/SpecimenCell`; name the role child `role` and the three value children `mode1` / `mode2` / `mode3` so chapter 01 can address them, and set the name column to a fixed 280 and the role column to a fixed 320 so rows align down the sheet.

- [ ] **Step 3b: Build `Docs/DoDont`**

A horizontal pair of slots: `do` and `dont`, each a vertical auto-layout with a slot child (for a live instance or small mock), a 4px top bar, and a one-line caption. The bars are the only place semantic green/red appear on the sheet — bind `do` to a green primitive and `dont` to a red primitive from `1 Primitives` (they are judgement colours about the docs, not part of the site palette, so they bind to primitives deliberately — note this in the component description). Captions are Fira Code 12 muted, prefixed `DO ·` / `DON'T ·`. Same `createComponentFromNode` pattern as Step 1.

- [ ] **Step 4: Verify the kit**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const kit = page.children.find(n => n.name === "SECTION / Docs kit");
const masters = kit.findAllWithCriteria({ types: ['COMPONENT','COMPONENT_SET'] })
  .filter(n => n.parent.type !== 'COMPONENT_SET');
await kit.screenshot({ scale: 1 });
return masters.map(m => ({ id: m.id, name: m.name, type: m.type, hasDesc: !!m.description,
  variants: m.type === 'COMPONENT_SET' ? m.children.map(c => c.name) : null }));
```

Expected: exactly five masters, all named `Docs/…`, all with descriptions, `Docs/DecisionCard` a `COMPONENT_SET` with `layer=Chrome|Content|Hand|All`.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/
git commit -m "docs(specs): design-system-docs — task 5b docs kit components"
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
  "Responsive carries what changes between breakpoints. Read top to bottom, smallest to largest: tokens, then elements, then components, then whole pages.",
  "IBM Plex Sans", "Regular", 18, "color/foreground");
head.appendChild(intro);

f.insertChild(0, head);
intro.layoutSizingHorizontal = "FIXED";
intro.resize(720, intro.height);
head.layoutSizingHorizontal = "FILL";
return { createdNodeIds: [head.id, intro.id] };
```

`textAutoResize = "HEIGHT"` plus an explicit `resize` width is required for wrapping text — `FILL` alone leaves the default `WIDTH_AND_HEIGHT` mode in charge and collapses the node to a thread.

- [ ] **Step 3: State the three-layer identity — the thesis panel**

This is the panel that answers "is this a coherent visual identity or a pile of preferences". It goes directly under the intro, before anything else.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const head = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 00 Read me");
const kit = page.children.find(n => n.name === "SECTION / Docs kit");
const cardSet = kit.findOne(n => n.name === "Docs/DecisionCard");
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });

const LAYERS = [
  ["Chrome", "Nav, header, footer, buttons, toggles, icons.",
   "The operating surface. Precise and quiet — flat backgrounds, no gradients, one hover verb per surface at 150ms. This layer is where the engineer register lives; it should be unremarkable to use and hard to fault."],
  ["Content", "Cards, rows, prose, metadata.",
   "The reading surface. Three type families doing three jobs, a three-value radius vocabulary, borders reserved for aggregate entities, and metadata as a deliberate third reading layer in mono at 12px."],
  ["Hand", "Five author-drawn SVGs: hero, quality, 404, arrow-curve, footer.",
   "The one expressive layer. Black stroke on transparent, inverted in dark mode. Everything else stays precise so these read as deliberate rather than decorative — the signature is drawn, not applied as a filter."],
];

const panel = figma.createAutoLayout("VERTICAL", { name: "three-layer identity", itemSpacing: 16 });
const kicker = figma.createText();
kicker.fontName = { family: "Fira Code", style: "Regular" };
kicker.characters = "ONE IDENTITY, THREE LAYERS";
kicker.fontSize = 12; kicker.textAutoResize = "HEIGHT";
panel.appendChild(kicker);

const created = [];
for (const [layer, what, why] of LAYERS) {
  const inst = cardSet.defaultVariant.createInstance();
  inst.setProperties({ layer });
  inst.findOne(n => n.name === "rule").characters = what;
  inst.findOne(n => n.name === "body").characters = why;
  panel.appendChild(inst);
  inst.layoutSizingHorizontal = "FILL";
  created.push(inst.id);
}

const thesis = figma.createText();
thesis.fontName = { family: "IBM Plex Sans", style: "Regular" };
thesis.characters = "The rule that binds them: only one layer is expressive at a time. Chrome and Content stay precise, which is what lets the Hand layer read as intent rather than noise. Every decision in this document is tagged with the layer it governs.";
thesis.fontSize = 18; thesis.textAutoResize = "HEIGHT";
thesis.resize(760, thesis.height);
panel.appendChild(thesis);

head.appendChild(panel);
panel.layoutSizingHorizontal = "FILL";
return { createdNodeIds: [panel.id, ...created] };
```

`setProperties({ layer })` is how a variant is selected on an instance — setting the instance `name` does nothing. Bind the two loose text fills to `color/foreground-muted` and `color/foreground` in the same call; they are omitted above only to keep the snippet readable, and leaving them unbound would break the Dark clone in Task 11.

- [ ] **Step 4: Add the how-this-maps-to-code table**

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

- [ ] **Step 5: Screenshot and read it as a stranger**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const head = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 00 Read me");
await head.screenshot({ scale: 1 });
return { id: head.id, h: Math.round(head.height) };
```

Check: no clipped text, the intro wraps at 720 rather than running the full 1600, mono rows align, muted text is legible against the background, and the three layer cards read as one argument rather than three unrelated boxes.

- [ ] **Step 6: Commit**

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

- [ ] **Step 3b: Give every Theme token a job, cross-reference the scales, and state accessibility**

Three additions from the research review (2026-08-06):

1. **Token jobs (Radix model).** Under the three-layer diagram, one `Docs/TokenRow` instance per `2 Theme` variable — all 15 — with the `role` column filled: the token's single designated use, one phrase, forbidding included where it earns it (e.g. `color/surface-hover` — "row hover tint, nothing else"; `color/accent-strong` — "the four accent slots from the budget; never passive meta"). Read the variable list live from the collection; roles come from `decisions.md` and the accent-budget rule — do not invent new roles.
2. **Cross-references (Carbon model).** One sentence appended to each re-homed section caption linking it to a sibling scale — spacing ↔ type rhythm, radius ↔ the pressable/media/reading trio, motion ↔ the hover verb table. Cross-references are what make five scales read as one decision.
3. **Accessibility card.** One `Docs/DecisionCard` (`layer=All`) at the end of the chapter: metadata contrast floor ≥ 4.5:1 AA, `prefers-reduced-motion` drops scale and keeps colour changes, focus outlines are part of the accent budget. All three are already settled rules — this card only makes them visible in one place, because accessibility is a named hiring criterion and every major system surfaces it in foundations.

- [ ] **Step 4: Screenshot and verify**

Expected: the chapter opens with the three-layer diagram, then the 15 token-job rows, then Colour → Type → Spacing → Radius → Motion each with a cross-reference sentence, then the accessibility card, then the verification panel. Each layer card has a visible 1px border in both themes. No clipped body text.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 7 tokens chapter"
```

---

### Task 8: Build the `02 Elements` chapter

**Files:**
- Modify: `📚 Docs` light frame `2545:672`
- Move into this chapter: `SECTION / Border` `2545:674`, `SECTION / Buttons` `2545:7234`, `SECTION / Icons` `2545:7216`, `SECTION / Numbers` `2545:7479`

**Interfaces:**
- Consumes: the 17 element masters and their Task 5 descriptions
- Produces: a `CHAPTER / 02 Elements` frame with one labelled cell per element, every cell a live instance

- [ ] **Step 1: Create the chapter and re-home the element-level property sections**

Same move pattern as Task 7 Step 1, with `ORDER = ["SECTION / Buttons", "SECTION / Icons", "SECTION / Numbers"]` and `f.insertChild(2, chapter)`. `SECTION / Border` is **not** here — border governs cards and rows, which live in chapter 03, so `decisions.md` homes it there.

- [ ] **Step 1b: Convert each re-homed section into a `Docs/DecisionCard` + specimen row**

The moved sections are frames with a bare uppercase title and loose captions. Give each one a decision card carrying the layer tag and the verbatim rule, with the existing live specimens kept beneath it.

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 02 Elements");
const kit = page.children.find(n => n.name === "SECTION / Docs kit");
const cardSet = kit.findOne(n => n.name === "Docs/DecisionCard");
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });

// Verbatim from decisions.md. Do not reword.
const DECISIONS = {
  "SECTION / Buttons": ["Chrome",
    "Three button styles, four components.",
    "Link/CTA · Primary, ≤1 per viewport. Link/Secondary · unlimited. Link/SecondarySm · small secondary. Link/TextCTA · Text CTA, one per section header. Link/Icon is a chrome control, not a button style, and sits outside the count.", ""],
  "SECTION / Icons": ["Chrome",
    "Three icon sizes, each with a job.",
    "16 · inline with metadata. 20 · buttons and nav. 24 · standalone.", ""],
  "SECTION / Numbers": ["Content",
    "Numbers are mono and tabular.",
    "SerieMeta · '6 PARTS' counter, muted. PostMetadataTime (day) and (no-date) · mono tabular. Numbers sit in the metadata reading layer, never in the accent budget.", ""],
};

const mutated = [];
for (const [secName, [layer, rule, body, finding]] of Object.entries(DECISIONS)) {
  const sec = chapter.findOne(n => n.name === secName);
  if (!sec) continue;
  const inst = cardSet.defaultVariant.createInstance();
  inst.setProperties({ layer });
  inst.findOne(n => n.name === "rule").characters = rule;
  inst.findOne(n => n.name === "body").characters = body;
  inst.findOne(n => n.name === "finding").characters = finding;
  sec.insertChild(1, inst);   // index 0 is the section's own uppercase title
  inst.layoutSizingHorizontal = "FILL";
  mutated.push(inst.id);
}
return { createdNodeIds: mutated };
```

Apply the same shape in Task 7 (Radius `Chrome + Content` → use `layer=All`; Type `Content`; Spacing `All`; Colour `Content`; Motion `Chrome`) and Task 9 (Border `Content`; Hover `All`; Backgrounds `Chrome`; Illustration `Hand`), pulling every string verbatim from `decisions.md`. The two recorded FINDING lines — the spacing-ladder one and the focus-ring/section-CTA one — go in the `finding` slot rather than being dropped; an honest recorded gap is worth more to this audience than a tidy sheet.

- [ ] **Step 2: Instantiate every element that is not already shown, with its name and description beside it**

```js
const comps = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(comps);
const ELEMENTS = ["Icon","NavLink","NavLinkHome","Link/CTA","Link/Secondary","Link/SecondarySm","Link/TextCTA",
  "Link/Icon","ThemeToggle","MotionToggle","H1","H2","PreviewTitle","PageDescription",
  "PostMetadataTime","PostMetadataTopic","SerieMeta"];
const found = {};
for (const name of ELEMENTS) {
  const m = comps.findOne(n => (n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.name === name);
  found[name] = m ? { id: m.id, type: m.type, desc: m.description,
    defaultVariant: m.type === "COMPONENT_SET" ? m.defaultVariant.id : m.id } : null;
}
return found;
```

A `COMPONENT_SET` cannot be instantiated directly — instantiate `set.defaultVariant`. Carry the returned `defaultVariant` ids into the next call as string literals.

- [ ] **Step 3: Build the element grid on the Docs page**

```js
const page = await figma.getNodeByIdAsync("2545:671");
await figma.setCurrentPageAsync(page);
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 02 Elements");
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) { const v = await figma.variables.getVariableByIdAsync(id); V[v.name] = v; }

// REPLACE with the {name: defaultVariant id} pairs returned by Step 2.
const CELLS = [["Link/CTA", "2012:6180"], ["Link/Secondary", "2041:276"]];

const grid = figma.createAutoLayout("VERTICAL", { name: "element specimens", itemSpacing: 32 });
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
const chapter = (await figma.getNodeByIdAsync("2545:672")).findOne(n => n.name === "CHAPTER / 02 Elements");
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
git commit -m "docs(specs): design-system-docs — task 8 elements chapter"
```

---

### Task 9: Build the `03 Components` chapter

**Files:**
- Modify: `📚 Docs` light frame `2545:672`
- Move into this chapter: `SECTION / Border` `2545:674`, `SECTION / Hover` `2545:7268`, `SECTION / Backgrounds` `2545:7516`, `SECTION / Illustration` `2546:282`

**Interfaces:**
- Consumes: the 8 component + 8 section masters and their Task 5 descriptions
- Produces: a `CHAPTER / 03 Components` frame with two labelled sub-groups (components, then page sections)

- [ ] **Step 1: Create the chapter, insert at index 3, and re-home Border / Hover / Backgrounds / Illustration**

Same move pattern as Task 7 Step 1. Order within the chapter: component grid → section grid → `SECTION / Border` → `SECTION / Hover` → `SECTION / Backgrounds` → `SECTION / Illustration`. Hover and Border belong here because both are properties of a *surface*, and surfaces are components and sections — an element like `H2` has neither a hover verb nor an aggregate boundary.

Then apply the Task 8 Step 1b decision-card pattern with these four, verbatim from `decisions.md`: Border `layer=Content` ("Border marks an aggregate entity" — PostRow hairline, SerieCard full border, PostCardPreviewSmall borderless); Hover `layer=All` (the nine-row verb table, one verb per surface, ≤150ms); Backgrounds `layer=Chrome` (Header flat `--color-background`, Footer flat `--color-surface`, no gradients); Illustration `layer=Hand` (the signature-layer paragraph and the five per-asset captions).

- [ ] **Step 1c: Add the decisions that have no specimen**

Five settled rules have no demonstrable Figma specimen and are currently invisible on the sheet. A recruiter cannot see an absence, so state them as specimen-free `Docs/DecisionCard` instances at the end of this chapter: one chip per card/row (serie wins over topic); display font is page-level only, so card titles use sans bold; metadata is the third reading layer, mono uppercase ~12px muted but ≥4.5:1; the folder icon means serie and nothing else; and dashed is removed from the library entirely, surviving only in the hero self-draw start state as an animating `stroke-dasharray`, not a CSS border. The last one matters most — it is the decision that killed the round-1 identity hypothesis, and it reads as a considered rejection rather than an oversight only if it is written down.

- [ ] **Step 1d: Do/don't pairs for the three contested calls**

Three `Docs/DoDont` instances, one per decision that was actually contested during the benchmark rounds — a do/don't pair earns its space only where the wrong answer is tempting:

1. **Title hover** — DO: underline decoration appears, text colour unchanged. DON'T: title repaints teal (collides with the adjacent teal serie chip).
2. **Chips** — DO: one chip, serie chip wins. DON'T: serie chip + topic chip on the same row.
3. **Accent budget** — DO: teal on the serie chip and section CTA only. DON'T: teal on dates, read time, `6 parts` meta (accent falsely promises a click target).

The DO slot holds a live instance (`PostRow` covers 1 and 2); the DON'T slot holds a **detached, deliberately wrong copy** — the one sanctioned exception to the live-instance rule, because the whole point is showing what the library forbids. Name each detached copy `dont-mock — <rule>` so the Task 11 audits can allowlist them.

- [ ] **Step 1e: PostRow deep dive — one component treated as a case study**

Hiring research (2026-08-06): one component documented deep beats all documented shallow. PostRow carries the most decisions per square pixel — chip logic, hover verb, border idiom, metadata layer — so it gets an extended cell after the component grid: problem (a row must expose serie membership, topic, date, read time without competing with the title) → the 8-blog benchmark that settled chip and hover behaviour (`references/benchmarks.md`) → the decisions, verbatim from `decisions.md` → `Code: src/components/blog/PostRow.astro`. Four short blocks, built from `Docs/SpecimenCell` + `Docs/DecisionCard`, ~600px total. No new copy — everything is harvested from existing validated sources.

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

- [ ] **Step 3: Build the component and section grids**

Reuse the Task 8 Step 3 script with `CELLS` replaced by the component list, then again for the section list, appending each grid into the chapter. Sections are wide — set each section cell's instance `layoutSizingHorizontal = "FILL"` after appending so `Header` and `Footer` span the sheet rather than sitting at their authored width.

- [ ] **Step 4: Verify and screenshot**

Same verification as Task 8 Step 4 against the `03` chapter. Expected: `broken` empty, `instances` at least 16 plus whatever the moved sections contain.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/design-system-docs/plan.md
git commit -m "docs(specs): design-system-docs — task 9 components chapter"
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

Then set the title to `Design system`, the kicker to `JEROMEABEL.NET · V1.0 · IN PROGRESS · 2026`, and the standfirst to: `Tokens, components and page templates for a personal site and technical blog. Astro 5, Tailwind v4. Every specimen is a live component instance.` Below the standfirst, four mono muted lines (Fira Code 12 — the cover-content set every practitioner source converges on): `STATUS   v1.0 — in progress · Home & Blog shipped, stable when all pages land` · `OWNER    Jérôme Abel · dev@jeromeabel.net` · `UPDATED  <date of execution>` · `LINKS    dev.jeromeabel.net · github.com/jeromeabel/jeromeabel.github.io`. No changelog on the cover. Load each node's *current* font via `getStyledTextSegments(['fontName'])` before writing characters.

- [ ] **Step 3: Decide the fate of `🎨 Foundations`**

It now holds **three** frames — `Foundations · Colors` `6:2`, `Foundations · Typography` `8:2`, `Tailwind Font Sizes` `365:55` (`Foundations · Scale` `8:34` is already gone). `Tailwind Font Sizes` (2776 × 2542) is a primitive dump that duplicates the eleven `Tailwind/text-*` styles and adds nothing a reader needs; Colors and Typography overlap chapter 01 but are a legitimate deep-dive.

Delete the dump rather than re-archiving it — it is a regenerable mirror of the installed Tailwind (`pnpm figma:primitives`), not a record of anything. Then rename the page **away from the word "Foundations"** — canonically, Foundations *is* the token story, which now lives in chapter 01; a reader who knows the vocabulary would look here first and find an appendix. Name it what it holds:

```js
const src = await figma.getNodeByIdAsync("5:14");
await figma.setCurrentPageAsync(src);
const dump = src.children.find(n => n.name === "Tailwind Font Sizes");
const removedId = dump ? dump.id : null;
if (dump) dump.remove();
src.name = "🎨 Color & Type (deep dive)";
return { removedNodeIds: removedId ? [removedId] : [], pageName: src.name, remaining: src.children.map(c => c.name) };
```

Expected: `remaining` is `["Foundations · Colors", "Foundations · Typography"]`. If deleting feels too strong at execution time, `appendChild` it into the backup file's archive instead — but do not leave it in this file.

- [ ] **Step 4: Confirm the Archive removal left nothing dangling**

`🗄️ Archive & XP` was deleted from this file on 2026-08-06; its content lives in the backup `Wf4iomVMYUXlFIBV3Z8bx4`. Nothing to move — but a page deletion silently takes any component masters that lived on it, which is exactly what happened to the `Icon` set `52:136` (Task 2b). Re-assert that no master anywhere is unreachable:

```js
const missing = [];
for (const p of figma.root.children) missing.push({ page: p.name, id: p.id });
const comps = await figma.getNodeByIdAsync("461:759");
await figma.setCurrentPageAsync(comps);
const sets = comps.findAllWithCriteria({ types: ['COMPONENT_SET'] });
const dupes = {};
for (const s of sets) { dupes[s.name] = (dupes[s.name] || 0) + 1; }
return { pages: missing, componentSets: sets.map(s => ({ id: s.id, name: s.name })),
  duplicateNames: Object.entries(dupes).filter(([, n]) => n > 1) };
```

Expected: five pages, no `duplicateNames`. A duplicate set name is how the orphaned `Icon` situation arose in the first place — two sets called `Icon`, one of them on a page that later got deleted.

Also delete the old archive's leftovers from `scripts/figma/named-debt.json` in Task 12 if any logged node ids belonged to that page — a debt entry pointing at a deleted node is noise.

- [ ] **Step 5: Rename `📚 Docs` and order the page list so it reads top-down**

"Docs" carries no scent — no major system has a section by that name, because the whole artifact is docs. Name the shareable page what it is:

```js
const docs = figma.root.children.find(p => p.name === "📚 Docs");
if (docs) docs.name = "📚 Design system";
const want = ["📖 Cover", "📚 Design system", "🧩 Components", "📄 Pages", "🎨 Color & Type (deep dive)"];
const byName = Object.fromEntries(figma.root.children.map(p => [p.name, p]));
const moved = [];
want.forEach((n, i) => { if (byName[n]) { figma.root.insertChild(i, byName[n]); moved.push(n); } });
return { order: figma.root.children.map(p => p.name), moved };
```

`Pages` was already renamed `📄 Pages` on 2026-08-06, so every page now carries an emoji and the sidebar scans. Emoji verdict from the research review: keep — Figma's own best-practices guide sanctions static wayfinding emojis; the only documented hazard is *status* emojis in published libraries, which this file has none of.

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

Expected: two frames, each with chapters `CHAPTER / 00 Read me` → `01 Tokens` → `02 Elements` → `03 Components` → `04 Pages`, `broken: 0` on both, and matching instance counts between Light and Dark — the `dont-mock — *` detached copies from Task 9 Step 1d are the only allowlisted non-instances.

- [ ] **Step 7: Screenshot both full sheets and read them end to end**

Ask of the result: can a stranger name the three token layers, the three button styles, the hover verb for a row, and the difference between an element and a section, without opening anything else? If not, the gap is a copy gap — fix the caption, not the layout.

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

Replace the five-row table (which still lists `🗄️ Legacy` `78:2` and `📄 Pages` `44:328`) with the five live pages — `📖 Cover`, `📚 Design system`, `🧩 Components`, `📄 Pages`, `🎨 Color & Type (deep dive)` — and their real ids from Task 11 Step 6. Keep the "Node IDs are volatile" warning and the `get_metadata` page-list gotcha — both are still true and both were load-bearing during this work.

- [ ] **Step 2: Replace the component-master table with the level classification**

The current table groups by SECTION. Regroup by Element / Component / Section, using the 33-master table from this plan's reference section, and note that each master's `description` now carries its level as a prefix.

- [ ] **Step 3: Add a Responsive section to the Tokens block**

Document the three collections with their mode counts and the per-mode resolved values from Task 1 Step 3, and state the mechanism: page frames pin `(Theme, Responsive)` mode pairs; mobile frames are mode switches, not duplicates.

- [ ] **Step 4: Add a change-log entry**

```markdown
- **2026-08-06** — Docs page renamed `📚 Design system` and restructured onto a
  smallest-to-largest spine (`00 Read me` → `01 Tokens` → `02 Elements` → `03 Components` →
  `04 Pages`); the 12 property sections were re-homed, not deleted. Atomic-design labels
  dropped after a web-research review (no major system uses them). Wired `3 Responsive` so
  `container/gutter` (32/24/16) and `section/rhythm-y` (96/64/48) differ per mode — they
  previously aliased one primitive in all three modes, making "Mobile" a Desktop frame at a
  narrower width. Home and Blog each ship 4 frames (Desktop 1280 / Mobile 390 × Light / Dark)
  driven by pinned mode pairs. Token audit on 697 Components-page nodes: bound off-ladder
  itemSpacing and unbound radii, assigned text styles where an exact match existed, logged the
  rest as named debt. `🎨 Foundations` renamed `🎨 Color & Type (deep dive)`; the
  `Tailwind Font Sizes` dump deleted (regenerable via `pnpm figma:primitives`).
```

- [ ] **Step 5: Update `CLAUDE.md`**

The "Figma Design Tokens" section describes the drift-check tooling but not the file's documentation structure. Add two sentences naming the `📚 Design system` page as the shareable entry point and the three token collections.

- [ ] **Step 6: Fill in the spec stub**

`.specs/01_active/design-system-docs/spec.md` is still the generated placeholder (`<what>. <why>.`). Write the real what/why, link this plan, and set `Size: M`.

- [ ] **Step 7: Verify nothing in the repo still points at dead nodes**

```bash
rtk grep -rn "78:2\|44:328\|442:5352\|52:136\|SPEC / Specimen\|🗄️ Legacy\|Archive & XP" --include=*.md . | grep -v node_modules | grep -v 02_archives
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

**Spec coverage.** "Carry the validated decision for each UI property of the old SPECIMEN page" → `decisions.md` harvests all twelve verbatim, and Tasks 7/8/9 Step 1b re-home them as `Docs/DecisionCard` instances; Task 9 Step 1c adds the five settled rules that have no specimen. "Cohesive identity serving chrome + engineer + artistic" → the three-layer thesis panel in Task 6 Step 3, plus a layer tag on every decision card via the `Docs/DecisionCard` variant. "Do we need doc components" → answered yes in Task 5b, with the count (five) and the reasoning. "Improve, clean, update the documentation" → Tasks 6–11. "Shareable for senior frontend recruiters" → Task 6 (read-me), Task 11 (cover, page order, archive tidy). "Design decisions clearly documented" → the 12 property sections are re-homed inline in Tasks 7–9 rather than deleted, plus per-master descriptions in Task 5. "Atoms / molecules / organisms / tokens clearly documented" → the spec asked for atomic naming, but the 2026-08-06 research review (user-approved) replaced the labels with Element / Component / Section — same classification, same small-to-large order, current vocabulary; Task 5 classification, Tasks 7–9 chapters. "Token usage must be verified" → Task 4 audit and fixes, Task 7 verification panel. "How to show desktop and mobile" → Tasks 1–3 and the Task 10 chapter.

**Known soft spots, stated rather than hidden.**

0. Deleting a Figma page silently orphans any component master on it. That is how `Icon` `52:136` ended up unreachable while three live instances still pointed at it — and nothing looked broken, which is what makes it worth checking rather than assuming. Task 2b fixes it and Task 11 Step 4 re-asserts it; the duplicate-set-name check there is the cheap early warning for the same class of problem.
1. Task 2 Step 3 is the real risk. Content composed at 1920 will overflow at 390 and the fix is at the masters, which is unbounded work. If overflow is widespread, the honest fallback is to ship Home responsive and document Blog desktop-only — say so, do not quietly narrow the scope.
2. Task 4 Step 4 (font load per text node across 697 nodes) may exceed a single call's budget. Splitting it across calls is expected, not a failure.
3. Task 8 Step 3 and Task 10 Step 2 carry literal `CELLS` / `PAGE_COMPONENTS` placeholders that are filled from the immediately preceding discovery step's return value. They are deliberate — component ids cannot be known before Task 3 and Task 5 run — but they must be substituted, not left as-is.
4. The Task 7 verification panel hardcodes the 2026-08-06 baseline. Replace the `ROWS` array with Task 4's real after-numbers before shipping; a stale panel is worse than no panel.

## Research review amendments (2026-08-06, user-approved)

Three parallel web-research passes (90+ sources: design-system doc IA, Figma file conventions, decision-exposure survey of Carbon/Polaris/Atlassian/GOV.UK/Material/Primer/Radix) produced these changes, each confirmed by the user:

1. **Atomic labels dropped.** Chapters `02 Elements` / `03 Components`; description prefixes `Element ·` / `Component ·` / `Section ·`. No major system uses atoms/molecules/organisms in docs; Brad Frost himself dropped the labels. Composition order kept.
2. **`📚 Docs` → `📚 Design system`** (Task 11 Step 5) — "Docs" as a section name exists in no major system.
3. **`🎨 Foundations (reference)` → `🎨 Color & Type (deep dive)`** (Task 11 Step 3) — canonically "Foundations" *is* the token story, which lives in chapter 01; the word must not point at the appendix.
4. **Cover carries status/owner/date/links** (Task 11 Step 2); status is `v1.0 — in progress`, not stable, until all pages exist (user's call).
5. **Emojis kept** — static wayfinding only, sanctioned by Figma's own guidance; never status emojis.
6. **Four additive panels:** Theme token jobs + scale cross-references + accessibility card (Task 7 Step 3b), do/don't pairs for the three contested calls (Task 9 Step 1d), PostRow deep-dive case study (Task 9 Step 1e), `Docs/DoDont` as the fifth kit component (Task 5b Step 3b).

Validated as-is by the same research: three-layer identity thesis (closest precedent: Carbon's productive/expressive duality), rationale inline GOV.UK-style, token story leading for the hiring audience, descriptions on masters, variable modes for responsive/theme, cover page existence, unhedged absolute phrasing.
