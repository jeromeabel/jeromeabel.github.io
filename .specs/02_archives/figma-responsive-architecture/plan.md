---
title: Figma responsive architecture — implementation plan
created: 2026-08-13
---

# Figma Responsive Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse Magnet-DS from 8 editable page frames to 4 masters + 4 dark instances, move every responsive _number_ onto a cascading `3 Responsive` variable (4 → 18), and put a `breakpoint=Desktop|Mobile` variant axis on the seven masters whose `layoutMode` actually flips.

**Architecture:** Numbers cascade, direction switches. Figma variables can hold `COLOR`/`FLOAT`/`STRING`/`BOOLEAN` only — `layoutMode` cannot be bound — so every numeric responsive value becomes a `3 Responsive` variable read through the page frame's pinned mode pair, and only direction flips get a variant axis. Dark views become instances of the Light masters with `2 Theme` pinned to Dark, which makes theme drift structurally impossible.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file `ihWIWmvtQPTWgUxlrVjC2c`); Node 22 ESM scripts under `scripts/figma/` with `node --test`; pnpm.

**Spec:** `.specs/01_active/figma-responsive-architecture/design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c` (Magnet-DS). Pages: 📚 Design system `2545:671`, 🧩 Components `461:759`, 📄 Pages `2558:18264`.
- **Collection IDs:** `1 Primitives` = `VariableCollectionId:2013:2` (mode `2013:0`), `2 Theme` = `VariableCollectionId:3:2` (Light `3:0`, Dark `3:1`), `3 Responsive` = `VariableCollectionId:2245:42` (Desktop `2245:0`, Tablet `2245:1`, Mobile `2245:2`).
- **Run `/figma-use` once per session before any `use_figma` call.** Mandatory — it carries the Plugin API rules.
- **Node IDs in this plan and in `.claude/skills/figma-verify/knowledge/figma-ds-file.md` are hints, not truth.** Resolve every target by NAME off the Task 1 inventory before writing. Fail loudly if a name is missing; never write to a pasted ID.
- **One batched `use_figma` call per operation.** Multiple round-trips for one dump or one write is the documented cost mistake.
- **Code is truth for values; Figma is truth for nothing** — except the two items in design §6 where Figma deliberately leads (header hamburger, 3-column serie grid).
- **Write to masters only, never instances.** Instance `layoutMode` is read-only via the Plugin API (verified 2026-08-13) — it silently no-ops.
- **After every axis flip**, explicitly re-set children's `layoutSizingHorizontal`/`layoutSizingVertical`, then re-read via a fresh `getNodeByIdAsync` — geometry read in the same tick returns stale values.
- **Root font size is 16px.** Mode widths: Mobile 390 / Tablet 768 / Desktop 1280. Tailwind breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- **Mode cap:** Figma Professional allows 4 modes per collection. `3 Responsive` holds 3 — do not add a fourth.
- Figma edits are not in git. Each Figma task records what it did in `.specs/01_active/figma-responsive-architecture/progress.md` and commits that, so the work has a reviewable trail.
- Conventional commits. Prefix `docs(specs):` for spec/progress files, `feat(figma):`/`chore(figma):` for `scripts/figma/` changes.

## File Structure

Repo-side files this plan creates or modifies:

| File                                                                | Responsibility                                                                                                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.specs/01_active/figma-responsive-architecture/inventory.md`       | **Create.** Task 1 live Pass-0 inventory: name → id for every page, master and `3 Responsive` variable, plus the three gate verdicts the design defers to "first plan step". |
| `.specs/01_active/figma-responsive-architecture/progress.md`        | **Create.** Append-only log, one entry per Figma task. The git trail for un-versioned Figma work.                                                                            |
| `scripts/figma/responsive-expected.json`                            | **Create.** Committed expectation for all 18 `3 Responsive` variables × 3 modes. The thing design §7 asks `figma:verify` to check but current tooling cannot.                |
| `scripts/figma/diff-responsive.mjs`                                 | **Create.** Deterministic diff of `responsive-expected.json` against `tokens.figma.json`. Warn-only, exit 0, same det→LLM→det shape as its siblings.                         |
| `scripts/figma/diff-responsive.test.mjs`                            | **Create.** `node --test` coverage for the above.                                                                                                                            |
| `scripts/figma/diff-tokens.mjs`                                     | **Modify.** Honour a new `orphanIgnore` prefix list so the 14 new Responsive variables don't drown the "Orphaned in Figma" section.                                          |
| `scripts/figma/diff-tokens.test.mjs`                                | **Modify.** Cover `orphanIgnore`.                                                                                                                                            |
| `scripts/figma/token-map.json`                                      | **Modify.** Add `orphanIgnore`; correct `container-padding-inline` mapping commentary.                                                                                       |
| `scripts/figma/named-debt.json`                                     | **Modify.** Add a `variableDebt` array for `leading/hero-body`'s three raw px values.                                                                                        |
| `package.json`                                                      | **Modify.** Add `figma:verify-responsive` script.                                                                                                                            |
| `.claude/skills/figma-verify/knowledge/figma-ds-file.md`            | **Modify.** New master roster, new Responsive table, change-log entry.                                                                                                       |
| `.claude/skills/design-expert/references/figma-variables-method.md` | **Modify.** §3 "Current project uses pattern 3" is no longer true — it becomes the Hybrid.                                                                                   |
| `.specs/00_backlog/header-mobile-drawer.md`                         | **Create.** Code debt from design §6.1.                                                                                                                                      |
| `.specs/00_backlog/blog-serie-grid-3col.md`                         | **Create.** Code debt from design §6.2.                                                                                                                                      |
| `.specs/00_backlog/figma-blog-mobile-sections.md`                   | **Delete.** Closed by Tasks 8–9.                                                                                                                                             |

---

### Task 1: Live inventory and the three deferred gates

The design defers three questions to "first plan step". None of the later tasks may start before this task answers them, because each one can change the task list.

**Files:**

- Create: `.specs/01_active/figma-responsive-architecture/inventory.md`
- Create: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Produces: `inventory.md` §Masters (name → id → page → section), §Responsive variables (name → per-mode resolved value), §Gate A/B/C verdicts. Every later task resolves its targets by name from this table.

- [ ] **Step 1: Load the Figma Plugin API rules**

Run the `/figma-use` skill. This is mandatory once per session and non-negotiable — the batched-call and read-back rules in it are what keep the later write tasks from corrupting masters.

- [ ] **Step 2: Run the Pass-0 inventory + gates as ONE batched `use_figma` call**

Do not use `get_metadata` for the page list — it returned only `Cover` on a 5-page file. This script is the only reliable enumeration.

```js
figma.skipInvisibleInstanceChildren = true;

// --- Pass 0: pages + masters -------------------------------------------
const pages = [],
  components = [];
function walk(node, page) {
  const isMaster = node.type === "COMPONENT" || node.type === "COMPONENT_SET";
  const insideSet = node.parent && node.parent.type === "COMPONENT_SET";
  if (isMaster && !insideSet)
    components.push({
      page: page.name,
      section:
        node.parent && node.parent.type === "SECTION"
          ? node.parent.name
          : "(top)",
      name: node.name,
      id: node.id,
      type: node.type,
    });
  if (node.type === "COMPONENT_SET") return;
  if ("children" in node) for (const c of node.children) walk(c, page);
}
for (const p of figma.root.children) {
  // NOT loadAllPagesAsync
  await p.loadAsync();
  pages.push({ name: p.name, id: p.id, childCount: p.children.length });
  for (const c of p.children) walk(c, p);
}

// --- 3 Responsive current state ----------------------------------------
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const prim = cols.find((c) => c.name === "1 Primitives");
const respVars = [];
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const byMode = {};
  for (const m of resp.modes) {
    let val = v.valuesByMode[m.modeId],
      hops = 0,
      alias = null;
    while (val && val.type === "VARIABLE_ALIAS" && hops++ < 5) {
      const t = await figma.variables.getVariableByIdAsync(val.id);
      alias = t.name;
      val = t.valuesByMode[Object.keys(t.valuesByMode)[0]];
    }
    byMode[m.name] = { value: val, alias };
  }
  respVars.push({ name: v.name, id: v.id, type: v.resolvedType, byMode });
}
const respModes = resp.modes.map((m) => ({ name: m.name, modeId: m.modeId }));

// --- Gate A: does the Footer master contain an illustration? ------------
const footer = components.find((c) => c.name === "Footer");
let gateA = { found: false };
if (footer) {
  const n = await figma.getNodeByIdAsync(footer.id);
  const art = n.findAll(
    (x) =>
      x.type === "VECTOR" ||
      x.type === "BOOLEAN_OPERATION" ||
      (Array.isArray(x.fills) && x.fills.some((f) => f.type === "IMAGE")),
  );
  gateA = {
    found: art.length > 0,
    id: footer.id,
    nodes: art.map((x) => ({ name: x.name, id: x.id, type: x.type })),
    layerNames: n.children.map((c) => `${c.type}:${c.name}`),
  };
}

// --- Gate B: do the "— Mobile" section masters differ beyond direction? -
const tree = (n, d = 0) =>
  d > 3
    ? []
    : [
        `${"  ".repeat(d)}${n.type}:${n.name}` +
          ("layoutMode" in n ? ` [${n.layoutMode}]` : ""),
      ].concat(
        "children" in n ? n.children.flatMap((c) => tree(c, d + 1)) : [],
      );
const PAIRS = [
  "PostCardPreviewSmall",
  "BlogPreviewSection",
  "WorkPreviewSection",
  "ContactPreviewSection",
];
const gateB = [];
for (const base of PAIRS) {
  const d = components.find((c) => c.name === base);
  const m = components.find((c) => c.name === `${base} — Mobile`);
  gateB.push({
    base,
    desktopId: d?.id ?? null,
    mobileId: m?.id ?? null,
    desktopTree: d ? tree(await figma.getNodeByIdAsync(d.id)) : null,
    mobileTree: m ? tree(await figma.getNodeByIdAsync(m.id)) : null,
  });
}

// --- Gate C: what is the work small-card list master actually called? ---
const gateC = components
  .filter((c) => /work/i.test(c.name))
  .map((c) => ({ name: c.name, id: c.id, section: c.section }));

return {
  pages,
  componentCount: components.length,
  components,
  respModes,
  respVars,
  gateA,
  gateB,
  gateC,
};
```

- [ ] **Step 3: Write `inventory.md` from the return value**

Record, verbatim from the call — do not summarise away IDs:

1. **§Pages** — name, id, childCount.
2. **§Masters** — the full `components` array as a markdown table (name / id / page / section / type), sorted by section then name. Note the total count; the 33 in the knowledge file dates from 2026-08-06 and is stale.
3. **§Responsive variables** — the current 4, with per-mode value and alias name. Confirm `container/gutter` currently reads 32/24/16 and `section/rhythm-y` 96/64/48 — both are wrong per design §2 and Task 2 corrects them.
4. **§Gate A — Footer illustration.** If `gateA.found` is false, write: _"Footer has no illustration. Design §3 'Illustrations' applies to `HeroAnimation` alone; Task 12 drops the Footer half."_ If true, list the nodes and classify each as flat shape / shadow image / halo per design §3.
5. **§Gate B — section merge.** For each pair, diff `desktopTree` against `mobileTree`. Verdict per pair: **MERGE-SAFE** if the trees differ only in `[layoutMode]` markers (and in ordering caused by a reverse), else **KEEPS-OWN-AXIS** with the specific extra difference quoted. A pair whose `mobileId` is null needs no deletion — record it as N/A. Task 11 obeys these verdicts; it does not re-decide them.
6. **§Gate C — work list master name.** Design §3 names `WorkPreviewSmallList`, which does not appear in the 2026-08-06 roster (that roster has `WorkCardPreviewSmall` and `WorkPreviewSection`). Pick, from `gateC`, the master that is a horizontal _list of_ `WorkCardPreviewSmall` instances and record its real name. If no such list master exists — i.e. `WorkPreviewSection` holds the cards directly — record that instead; Task 7 then puts the axis on `WorkPreviewSection` and Gate B's `WorkPreviewSection` verdict becomes moot.

- [ ] **Step 4: Create the progress log**

```markdown
# Figma responsive architecture — execution log

Figma edits are not versioned. One entry per task: what was written, what was
read back to prove it, and any deviation from the plan.

## Task 1 — inventory and gates (YYYY-MM-DD)

- Masters found: <n> (knowledge-file roster said 33 on 2026-08-06)
- Gate A: <verdict>
- Gate B: <per-pair verdicts>
- Gate C: work list master is `<name>` (`<id>`)
```

- [ ] **Step 5: Sanity-check the inventory against the design's assumptions**

Confirm each of these named masters exists in §Masters: `H1`, `H2`, `HeroText`, `HeroAnimation`, `Hero`, `Header`, `Footer`, `NavLink`, `NavLinkHome`, `SerieCardList`, `ArchiveTable`, `PostCardPreviewSmall`. Any miss is a STOP — report it and do not proceed to Task 2, because a missing name means the design was written against a stale roster and later tasks would write to the wrong node.

- [ ] **Step 6: Commit**

```bash
git add .specs/01_active/figma-responsive-architecture/inventory.md \
        .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — live inventory and gate verdicts"
```

---

### Task 2: `3 Responsive` — 14 new variables and 2 corrected ladders

**Files:**

- Modify (Figma): collection `3 Responsive` (`VariableCollectionId:2245:42`)
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 1 `inventory.md` §Responsive variables (proves the two wrong ladders), §Masters.
- Produces: 18 variables in `3 Responsive`, named exactly as below. Tasks 4, 5, 9, 10, 12 bind nodes to these names. Task 3 encodes the same table as `responsive-expected.json`.

The full target state. Aliases point at `1 Primitives` variables by name; `leading/hero-body` is the single raw-value row.

| Variable                           | Mobile (`2245:2`)      | Tablet (`2245:1`) | Desktop (`2245:0`) | Scope        |
| ---------------------------------- | ---------------------- | ----------------- | ------------------ | ------------ |
| `text/page-title`                  | `text/4xl` (36)        | `text/5xl` (48)   | `text/6xl` (60)    | FONT_SIZE    |
| `text/section-title`               | `text/xl` (20)         | `text/2xl` (24)   | `text/3xl` (30)    | FONT_SIZE    |
| `text/hero-title`                  | `text/2xl` (24)        | `text/4xl` (36)   | `text/5xl` (48)    | FONT_SIZE    |
| `text/hero-body`                   | `text/lg` (18)         | `text/xl` (20)    | `text/2xl` (24)    | FONT_SIZE    |
| `text/nav-link`                    | `text/base` (16)       | `text/xl` (20)    | `text/xl` (20)     | FONT_SIZE    |
| `leading/hero-body`                | **raw 28**             | **raw 28**        | **raw 30**         | LINE_HEIGHT  |
| `header/padding-y`                 | `spacing/4` (16)       | `spacing/4` (16)  | `spacing/6` (24)   | GAP          |
| `header/nav-gap`                   | `spacing/4` (16)       | `spacing/6` (24)  | `spacing/10` (40)  | GAP          |
| `footer/padding-y`                 | `spacing/8` (32)       | `spacing/16` (64) | `spacing/16` (64)  | GAP          |
| `footer/gap`                       | `spacing/6` (24)       | `spacing/8` (32)  | `spacing/8` (32)   | GAP          |
| `footer/link-gap`                  | `spacing/2` (8)        | `spacing/6` (24)  | `spacing/6` (24)   | GAP          |
| `footer/inner-gap`                 | `spacing/4` (16)       | `spacing/8` (32)  | `spacing/8` (32)   | GAP          |
| `hero/text-gap`                    | `spacing/2` (8)        | `spacing/4` (16)  | `spacing/4` (16)   | GAP          |
| `serie-list/gap`                   | `spacing/4` (16)       | `spacing/4` (16)  | `spacing/8` (32)   | GAP          |
| `container/gutter` **(corrected)** | `spacing/4` (16)       | `spacing/4` (16)  | `spacing/4` (16)   | GAP          |
| `section/rhythm-y` **(corrected)** | `spacing/8` (32)       | `spacing/8` (32)  | `spacing/24` (96)  | GAP          |
| `container/max-width` (unchanged)  | `container/7xl` (1280) | `container/7xl`   | `container/7xl`    | WIDTH_HEIGHT |
| `viewport/width` (unchanged)       | raw 390                | raw 768           | raw 1280           | WIDTH_HEIGHT |

`container/gutter` currently holds 32/24/16 and `section/rhythm-y` 96/64/48. Both are ladders that do not exist in code: `global.css:6` pins `padding-inline: 1rem` at every width, and `global.css:30-31` defines only `--spacing-section: 2rem` / `--spacing-section-lg: 6rem` with the switch at `lg`. Correcting them is a bug fix, not a preference.

- [ ] **Step 1: Write the variables in ONE batched `use_figma` call**

The script is idempotent — create-or-update by name — so a re-run after a partial failure is safe.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const prim = cols.find((c) => c.name === "1 Primitives");
if (!resp || !prim)
  throw new Error("collection missing — re-run Task 1 inventory");

const modeId = (n) => {
  const m = resp.modes.find((x) => x.name === n);
  if (!m) throw new Error(`mode ${n} missing`);
  return m.modeId;
};
const M = modeId("Mobile"),
  T = modeId("Tablet"),
  D = modeId("Desktop");

// index primitives by name
const primByName = new Map();
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  primByName.set(v.name, v);
}
const alias = (name) => {
  const p = primByName.get(name);
  if (!p) throw new Error(`primitive ${name} missing`);
  return figma.variables.createVariableAlias(p);
};

// index existing responsive vars by name (idempotent upsert)
const respByName = new Map();
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  respByName.set(v.name, v);
}

// [name, mobile, tablet, desktop, scope] — raw numbers stay numbers
const SPEC = [
  ["text/page-title", "text/4xl", "text/5xl", "text/6xl", "FONT_SIZE"],
  ["text/section-title", "text/xl", "text/2xl", "text/3xl", "FONT_SIZE"],
  ["text/hero-title", "text/2xl", "text/4xl", "text/5xl", "FONT_SIZE"],
  ["text/hero-body", "text/lg", "text/xl", "text/2xl", "FONT_SIZE"],
  ["text/nav-link", "text/base", "text/xl", "text/xl", "FONT_SIZE"],
  ["leading/hero-body", 28, 28, 30, "LINE_HEIGHT"],
  ["header/padding-y", "spacing/4", "spacing/4", "spacing/6", "GAP"],
  ["header/nav-gap", "spacing/4", "spacing/6", "spacing/10", "GAP"],
  ["footer/padding-y", "spacing/8", "spacing/16", "spacing/16", "GAP"],
  ["footer/gap", "spacing/6", "spacing/8", "spacing/8", "GAP"],
  ["footer/link-gap", "spacing/2", "spacing/6", "spacing/6", "GAP"],
  ["footer/inner-gap", "spacing/4", "spacing/8", "spacing/8", "GAP"],
  ["hero/text-gap", "spacing/2", "spacing/4", "spacing/4", "GAP"],
  ["serie-list/gap", "spacing/4", "spacing/4", "spacing/8", "GAP"],
  // corrections to already-shipped variables
  ["container/gutter", "spacing/4", "spacing/4", "spacing/4", "GAP"],
  ["section/rhythm-y", "spacing/8", "spacing/8", "spacing/24", "GAP"],
];

const written = [];
for (const [name, m, t, d, scope] of SPEC) {
  let v = respByName.get(name);
  if (!v) v = figma.variables.createVariable(name, resp, "FLOAT");
  const put = (mode, val) =>
    v.setValueForMode(mode, typeof val === "number" ? val : alias(val));
  put(M, m);
  put(T, t);
  put(D, d);
  v.scopes = [scope];
  v.setVariableCodeSyntax("WEB", name);
  written.push({ name, id: v.id, created: !respByName.has(name) });
}
return { written, total: resp.variableIds.length };
```

- [ ] **Step 2: Read back and verify all 18 resolve correctly in all three modes**

Separate `use_figma` call — a read in the same tick as the write can return stale values.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const out = [];
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const row = { name: v.name, scopes: v.scopes };
  for (const m of resp.modes) {
    let val = v.valuesByMode[m.modeId],
      hops = 0;
    while (val && val.type === "VARIABLE_ALIAS" && hops++ < 5) {
      const t = await figma.variables.getVariableByIdAsync(val.id);
      val = t.valuesByMode[Object.keys(t.valuesByMode)[0]];
    }
    row[m.name] = val;
  }
  out.push(row);
}
return {
  count: resp.variableIds.length,
  vars: out.sort((a, b) => a.name.localeCompare(b.name)),
};
```

Expected: `count` is **18**. Every row matches the resolved-value column of the table above — `text/page-title` reads Mobile 36 / Tablet 48 / Desktop 60, `container/gutter` reads 16/16/16, `section/rhythm-y` reads 32/32/96. Any mismatch is a STOP: fix it before Task 3, since every later binding trusts these numbers.

- [ ] **Step 3: Log and commit**

Append the read-back table to `progress.md` under `## Task 2 — responsive variables`, then:

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — 3 Responsive grown to 18 variables"
```

---

### Task 3: Tooling — deterministic check of the 18 responsive variables

Design §7 asks `figma:verify` to confirm the 18 variables are "present and correct in all three modes". It cannot today: `diff-tokens.mjs` only compares variables that a `token-map.json` entry points at, and the new type/spacing values have no CSS custom property to map from — they come from Tailwind utility classes inside components. Worse, `3 Responsive` is a _mapped_ collection, so every new variable × mode lands in the "Orphaned in Figma" section: ~50 lines of noise that would hide a real orphan.

Two changes, both TDD, both repo-side — no Figma access needed.

**Files:**

- Create: `scripts/figma/responsive-expected.json`
- Create: `scripts/figma/diff-responsive.mjs`
- Create: `scripts/figma/diff-responsive.test.mjs`
- Modify: `scripts/figma/diff-tokens.mjs:86-92`
- Modify: `scripts/figma/diff-tokens.test.mjs`
- Modify: `scripts/figma/token-map.json`
- Modify: `package.json:12-18`

**Interfaces:**

- Consumes: `tokens.figma.json` as produced by `pnpm figma:dump` — multi-mode collections emit one entry per mode, named `Mode/var/path`, under `collections[].variables[]` with a resolved scalar `value`.
- Produces: `pnpm figma:verify-responsive`, used by Task 14.

- [ ] **Step 1: Write `responsive-expected.json`**

```json
{
  "collection": "3 Responsive",
  "modes": ["Desktop", "Tablet", "Mobile"],
  "variables": {
    "text/page-title": { "Desktop": 60, "Tablet": 48, "Mobile": 36 },
    "text/section-title": { "Desktop": 30, "Tablet": 24, "Mobile": 20 },
    "text/hero-title": { "Desktop": 48, "Tablet": 36, "Mobile": 24 },
    "text/hero-body": { "Desktop": 24, "Tablet": 20, "Mobile": 18 },
    "text/nav-link": { "Desktop": 20, "Tablet": 20, "Mobile": 16 },
    "leading/hero-body": { "Desktop": 30, "Tablet": 28, "Mobile": 28 },
    "header/padding-y": { "Desktop": 24, "Tablet": 16, "Mobile": 16 },
    "header/nav-gap": { "Desktop": 40, "Tablet": 24, "Mobile": 16 },
    "footer/padding-y": { "Desktop": 64, "Tablet": 64, "Mobile": 32 },
    "footer/gap": { "Desktop": 32, "Tablet": 32, "Mobile": 24 },
    "footer/link-gap": { "Desktop": 24, "Tablet": 24, "Mobile": 8 },
    "footer/inner-gap": { "Desktop": 32, "Tablet": 32, "Mobile": 16 },
    "hero/text-gap": { "Desktop": 16, "Tablet": 16, "Mobile": 8 },
    "serie-list/gap": { "Desktop": 32, "Tablet": 16, "Mobile": 16 },
    "container/gutter": { "Desktop": 16, "Tablet": 16, "Mobile": 16 },
    "section/rhythm-y": { "Desktop": 96, "Tablet": 32, "Mobile": 32 },
    "container/max-width": { "Desktop": 1280, "Tablet": 1280, "Mobile": 1280 },
    "viewport/width": { "Desktop": 1280, "Tablet": 768, "Mobile": 390 }
  }
}
```

- [ ] **Step 2: Write the failing test**

Create `scripts/figma/diff-responsive.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const SCRIPT = new URL("./diff-responsive.mjs", import.meta.url).pathname;

function run(expected, figma) {
  const dir = mkdtempSync(join(tmpdir(), "diff-resp-"));
  const e = join(dir, "expected.json"),
    f = join(dir, "figma.json");
  writeFileSync(e, JSON.stringify(expected));
  writeFileSync(f, JSON.stringify(figma));
  return execFileSync("node", [SCRIPT, e, f], { encoding: "utf8" });
}

const EXPECTED = {
  collection: "3 Responsive",
  modes: ["Desktop", "Mobile"],
  variables: { "text/hero-title": { Desktop: 48, Mobile: 24 } },
};
const figmaWith = (vars) => ({
  collections: [
    { name: "3 Responsive", modes: ["Desktop", "Mobile"], variables: vars },
  ],
});

test("reports nothing when every mode matches", () => {
  const out = run(
    EXPECTED,
    figmaWith([
      { name: "Desktop/text/hero-title", value: 48 },
      { name: "Mobile/text/hero-title", value: 24 },
    ]),
  );
  assert.match(out, /## Missing\n\n_none_/);
  assert.match(out, /## Value mismatch\n\n_none_/);
});

test("flags a variable absent from the dump", () => {
  const out = run(
    EXPECTED,
    figmaWith([{ name: "Desktop/text/hero-title", value: 48 }]),
  );
  assert.match(out, /Mobile\/text\/hero-title/);
});

test("flags a wrong per-mode value", () => {
  const out = run(
    EXPECTED,
    figmaWith([
      { name: "Desktop/text/hero-title", value: 48 },
      { name: "Mobile/text/hero-title", value: 36 },
    ]),
  );
  assert.match(out, /expected \*\*24\*\* vs figma \*\*36\*\*/);
});

test("tolerates ±0.5 rem-rounding drift", () => {
  const out = run(
    EXPECTED,
    figmaWith([
      { name: "Desktop/text/hero-title", value: 48.25 },
      { name: "Mobile/text/hero-title", value: 24 },
    ]),
  );
  assert.match(out, /## Value mismatch\n\n_none_/);
});

test("exits 0 and warns on a missing file rather than crashing", () => {
  const out = execFileSync("node", [SCRIPT, "/nope.json", "/nope2.json"], {
    encoding: "utf8",
  });
  assert.equal(typeof out, "string");
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `node --test scripts/figma/diff-responsive.test.mjs`
Expected: FAIL — `Cannot find module .../diff-responsive.mjs`.

- [ ] **Step 4: Write `diff-responsive.mjs`**

```js
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test scripts/figma/diff-responsive.test.mjs`
Expected: PASS, 5/5.

- [ ] **Step 6: Write the failing test for `orphanIgnore`**

Append to `scripts/figma/diff-tokens.test.mjs` — match the file's existing harness for building temp fixtures rather than inventing a second one; the assertion is what matters:

```js
test("orphanIgnore suppresses listed prefixes from the orphan section", () => {
  const code = {
    tokens: [
      {
        name: "container-max-width",
        class: "size",
        px: 1280,
        source: "global.css",
      },
    ],
  };
  const figma = {
    collections: [
      {
        name: "3 Responsive",
        variables: [
          { name: "Desktop/container/max-width", value: 1280 },
          { name: "Mobile/text/hero-title", value: 24 },
        ],
      },
    ],
  };
  const map = {
    map: { "container-max-width": "3 Responsive/Desktop/container/max-width" },
    orphanIgnore: [
      "3 Responsive/Mobile/text/",
      "3 Responsive/Tablet/text/",
      "3 Responsive/Desktop/text/",
    ],
  };
  const out = runDiff(code, figma, map); // existing helper in this file
  assert.match(out, /## Orphaned in Figma\n\n_none_/);
});

test("an orphan outside orphanIgnore is still reported", () => {
  const code = { tokens: [] };
  const figma = {
    collections: [
      {
        name: "3 Responsive",
        variables: [{ name: "Desktop/container/max-width", value: 1280 }],
      },
    ],
  };
  const map = {
    map: { x: "3 Responsive/nothing" },
    orphanIgnore: ["3 Responsive/Mobile/text/"],
  };
  const out = runDiff(code, figma, map);
  assert.match(out, /Desktop\/container\/max-width/);
});
```

- [ ] **Step 7: Run it and confirm it fails**

Run: `node --test scripts/figma/diff-tokens.test.mjs`
Expected: FAIL on the first new test — the orphan section still lists `3 Responsive/Mobile/text/hero-title`.

- [ ] **Step 8: Implement `orphanIgnore` in `diff-tokens.mjs`**

At `diff-tokens.mjs:20`, widen the destructure:

```js
({
  map,
  ignore = [],
  orphanIgnore = [],
} = JSON.parse(readFileSync(mapPath, "utf8")));
```

At `diff-tokens.mjs:90-92`, replace the `orphaned` computation:

```js
const orphaned = [...figVars.keys()].filter(
  (k) =>
    mappedCollections.has(k.split("/")[0]) &&
    !consumed.has(k) &&
    !orphanIgnore.some((prefix) => k.startsWith(prefix)),
);
```

- [ ] **Step 9: Add `orphanIgnore` to `token-map.json`**

Insert after the `map` object, before `ignore`. These are the paths that are real Figma variables with no CSS custom property behind them — `diff-responsive.mjs` checks them instead.

```json
  "orphanIgnore": [
    "3 Responsive/Desktop/text/", "3 Responsive/Tablet/text/", "3 Responsive/Mobile/text/",
    "3 Responsive/Desktop/leading/", "3 Responsive/Tablet/leading/", "3 Responsive/Mobile/leading/",
    "3 Responsive/Desktop/header/", "3 Responsive/Tablet/header/", "3 Responsive/Mobile/header/",
    "3 Responsive/Desktop/footer/", "3 Responsive/Tablet/footer/", "3 Responsive/Mobile/footer/",
    "3 Responsive/Desktop/hero/", "3 Responsive/Tablet/hero/", "3 Responsive/Mobile/hero/",
    "3 Responsive/Desktop/serie-list/", "3 Responsive/Tablet/serie-list/", "3 Responsive/Mobile/serie-list/",
    "3 Responsive/Tablet/container/", "3 Responsive/Mobile/container/",
    "3 Responsive/Tablet/section/", "3 Responsive/Tablet/viewport/",
    "3 Responsive/Desktop/viewport/", "3 Responsive/Mobile/viewport/"
  ],
```

- [ ] **Step 10: Record `leading/hero-body` as variable-level debt**

`named-debt.json`'s `accepted` array is keyed by node `id:kind` and diffed against a node walk, so a _variable_ holding a raw number can never produce a matching hit — putting it in `accepted` would make it a permanent "Stale named-debt entry". This corrects design §7's wording: the entry goes in a sibling `variableDebt` array that `diff-raw-values.mjs` ignores by construction.

Add as a new top-level key in `scripts/figma/named-debt.json`, alongside `accepted`:

```json
  "variableDebt": [
    {
      "collection": "3 Responsive",
      "name": "leading/hero-body",
      "values": { "Desktop": 30, "Tablet": 28, "Mobile": 28 },
      "reason": "Tailwind's size-paired default leadings (28px on text-lg and text-xl) are not on the leading/* ratio ladder, and Desktop's leading-tight resolves to 24 x 1.25 = 30. Forcing these onto a ratio primitive would change the rendering."
    }
  ],
```

- [ ] **Step 11: Wire the npm script**

In `package.json`, after `figma:verify-raw`:

```json
    "figma:verify-responsive": "node scripts/figma/diff-responsive.mjs scripts/figma/responsive-expected.json tokens.figma.json",
```

- [ ] **Step 12: Run the full test suite**

Run: `pnpm test`
Expected: PASS — all `scripts/figma/*.test.mjs`, including the two new `diff-tokens` cases and the five `diff-responsive` cases.

- [ ] **Step 13: Format and commit**

```bash
pnpm format:write
git add scripts/figma/diff-responsive.mjs scripts/figma/diff-responsive.test.mjs \
        scripts/figma/responsive-expected.json scripts/figma/diff-tokens.mjs \
        scripts/figma/diff-tokens.test.mjs scripts/figma/token-map.json \
        scripts/figma/named-debt.json package.json
git commit -m "feat(figma): deterministic check for the 18 responsive variables"
```

---

### Task 4: Bind the six responsive type ramps

Design §1 reverses `.specs/02_archives/figma-variables/design.md:219-238`, which ruled the type scale a component-encapsulated concern. That call assumed a single viewport. Components stay the semantic layer; they now read their size from a responsive token instead of carrying a flat one.

**A Figma text _style_ cannot bind to a variable.** Each node below must have its flat `Tailwind/text-*` style detached _before_ the font-size binding, or it reads as "modified style". Record which style each node carried — Task 15 writes that mapping onto the 📚 Design system page, which is the mitigation for the lost at-a-glance traceability.

**Files:**

- Modify (Figma masters, resolved by name from Task 1): `H1`, `H2`, `HeroText`, `NavLink`, `NavLinkHome`
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 2's variables `text/page-title`, `text/section-title`, `text/hero-title`, `text/hero-body`, `leading/hero-body`.
- Produces: five masters whose TEXT nodes have `boundVariables.fontSize` set and `textStyleId` empty. Task 14 verifies.

| Master        | Node           | Variable                               | Code source                                        |
| ------------- | -------------- | -------------------------------------- | -------------------------------------------------- |
| `H1`          | its TEXT child | `text/page-title`                      | `ui/H1.astro` — `text-4xl sm:text-5xl lg:text-6xl` |
| `H2`          | its TEXT child | `text/section-title`                   | `ui/H2.astro` — `text-xl md:text-2xl lg:text-3xl`  |
| `HeroText`    | title TEXT     | `text/hero-title`                      | `hero/HeroText.astro:7`                            |
| `HeroText`    | body TEXT      | `text/hero-body` + `leading/hero-body` | `hero/HeroText.astro:11`                           |
| `NavLink`     | its TEXT child | `text/nav-link`                        | `app/Header.astro:35` — `text-base md:text-xl`     |
| `NavLinkHome` | its TEXT child | `text/nav-link`                        | same                                               |

- [ ] **Step 1: Read the current state of the six nodes**

One `use_figma` call. This is the record of what the mitigation doc must contain.

```js
const NAMES = ["H1", "H2", "HeroText", "NavLink", "NavLinkHome"];
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const n of p.findAll(
    (x) => x.type === "COMPONENT" && NAMES.includes(x.name),
  )) {
    for (const t of n.findAllWithCriteria({ types: ["TEXT"] })) {
      const st = t.textStyleId
        ? await figma.getStyleByIdAsync(t.textStyleId)
        : null;
      out.push({
        master: n.name,
        masterId: n.id,
        node: t.name,
        id: t.id,
        chars: t.characters.slice(0, 40),
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        style: st ? st.name : null,
        bound: Object.keys(t.boundVariables ?? {}),
      });
    }
  }
}
return out;
```

Expect `H1` and `H2` to have exactly one TEXT node each, and `HeroText` to have two — a title and a body. If `HeroText` has more, identify title vs body by `fontSize` (the larger is the title) and record the choice in `progress.md`.

- [ ] **Step 2: Detach the styles and bind the sizes in ONE batched call**

`setRangeBoundVariable` needs the font loaded; load every font the node uses before touching it.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const V = new Map();
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V.set(v.name, v);
}
const need = (n) => {
  const v = V.get(n);
  if (!v) throw new Error(`var ${n} missing`);
  return v;
};

// masterName -> [{ match(textNode) -> bool, fontSize, lineHeight? }]
const PLAN = {
  H1: [{ pick: (ts) => ts[0], size: "text/page-title" }],
  H2: [{ pick: (ts) => ts[0], size: "text/section-title" }],
  NavLink: [{ pick: (ts) => ts[0], size: "text/nav-link" }],
  NavLinkHome: [{ pick: (ts) => ts[0], size: "text/nav-link" }],
  HeroText: [
    {
      pick: (ts) => ts.slice().sort((a, b) => b.fontSize - a.fontSize)[0],
      size: "text/hero-title",
    },
    {
      pick: (ts) => ts.slice().sort((a, b) => a.fontSize - b.fontSize)[0],
      size: "text/hero-body",
      leading: "leading/hero-body",
    },
  ],
};

const done = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const m of p.findAll((x) => x.type === "COMPONENT" && PLAN[x.name])) {
    const texts = m.findAllWithCriteria({ types: ["TEXT"] });
    for (const rule of PLAN[m.name]) {
      const t = rule.pick(texts);
      if (!t) throw new Error(`no TEXT node for ${m.name}`);
      for (const f of t.getRangeAllFontNames(0, t.characters.length))
        await figma.loadFontAsync(f);
      const prevStyle = t.textStyleId
        ? (await figma.getStyleByIdAsync(t.textStyleId))?.name
        : null;
      await t.setTextStyleIdAsync(""); // detach: styles cannot bind
      t.setRangeBoundVariable(
        0,
        t.characters.length,
        "fontSize",
        need(rule.size),
      );
      if (rule.leading)
        t.setRangeBoundVariable(
          0,
          t.characters.length,
          "lineHeight",
          need(rule.leading),
        );
      done.push({
        master: m.name,
        node: t.name,
        id: t.id,
        prevStyle,
        size: rule.size,
        leading: rule.leading ?? null,
      });
    }
  }
}
return done;
```

- [ ] **Step 3: Read back and verify**

Fresh `use_figma` call — same read script as Step 1.

Expected, for each of the six rows: `style` is `null`, `bound` contains `fontSize` (and `lineHeight` on the HeroText body), and `fontSize` resolves to the **Desktop** value (60 / 30 / 48 / 24 / 20 / 20) since masters sit on the Components page under the default Desktop mode. A row still carrying a `style` name means the detach did not take — STOP and re-run Step 2 for that node only.

- [ ] **Step 4: Log and commit**

Append to `progress.md` a `## Task 4` section containing the **style → variable mapping table** from Step 2's `prevStyle` values. Task 15 copies this table into Figma verbatim; do not paraphrase it.

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — six type ramps bound to responsive tokens"
```

---

### Task 5: Bind the eight responsive spacing tokens

**Files:**

- Modify (Figma masters, resolved by name): `Header`, `Footer`, `HeroText`, `SerieCardList`
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 2's spacing variables.
- Produces: bound `paddingTop`/`paddingBottom`/`itemSpacing` fields. Task 6 (Footer axis) and Task 10 (Header axis) build on these masters — bind before flipping, so the variant children inherit the bindings.

| Master                    | Field                         | Variable           | Code source                                    |
| ------------------------- | ----------------------------- | ------------------ | ---------------------------------------------- |
| `Header`                  | `paddingTop`, `paddingBottom` | `header/padding-y` | `Header.astro:25` — `py-4 lg:py-6`             |
| `Header` → nav row        | `itemSpacing`                 | `header/nav-gap`   | `Header.astro:27` — `gap-4 md:gap-6 lg:gap-10` |
| `Footer`                  | `paddingTop`, `paddingBottom` | `footer/padding-y` | `Footer.astro:23` — `py-8 md:py-16`            |
| `Footer` → outer stack    | `itemSpacing`                 | `footer/gap`       | `Footer.astro:25` — `gap-6 md:gap-8`           |
| `Footer` → link wrapper   | `itemSpacing`                 | `footer/inner-gap` | `Footer.astro:34` — `gap-4 sm:gap-8`           |
| `Footer` → each link list | `itemSpacing`                 | `footer/link-gap`  | `Footer.astro:35,44` — `gap-2 md:gap-6`        |
| `HeroText`                | `itemSpacing`                 | `hero/text-gap`    | `HeroText.astro:6` — `gap-2 md:gap-4`          |
| `SerieCardList`           | `itemSpacing`                 | `serie-list/gap`   | `blog.astro:55` — `gap-4 lg:gap-8`             |

- [ ] **Step 1: Dump the auto-layout tree of the four masters**

```js
const NAMES = ["Header", "Footer", "HeroText", "SerieCardList"];
const tree = (n, d = 0) =>
  d > 3
    ? []
    : [
        {
          depth: d,
          type: n.type,
          name: n.name,
          id: n.id,
          layoutMode: "layoutMode" in n ? n.layoutMode : null,
          itemSpacing: "itemSpacing" in n ? n.itemSpacing : null,
          padding:
            "paddingTop" in n
              ? [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft]
              : null,
          bound: Object.keys(n.boundVariables ?? {}),
        },
      ].concat(
        "children" in n ? n.children.flatMap((c) => tree(c, d + 1)) : [],
      );
const out = {};
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const m of p.findAll(
    (x) => x.type === "COMPONENT" && NAMES.includes(x.name),
  ))
    out[m.name] = tree(m);
}
return out;
```

Read the returned trees and write down the concrete node id for each of the eight rows above. The layer names are not guessable from code — `Footer`'s "outer stack" is whichever child has `layoutMode` matching the `flex-col-reverse md:flex-row` wrapper, the "link wrapper" is the auto-layout frame holding two or more link lists, and each "link list" is a VERTICAL frame of `Link/*` instances. If any row cannot be identified confidently, STOP and record the ambiguity — a wrong binding here is silent and shows up only in Task 14's geometry diff.

- [ ] **Step 2: Bind the eight fields in ONE batched call**

Replace the `TARGETS` entries with the node ids you resolved in Step 1.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const V = new Map();
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V.set(v.name, v);
}
const need = (n) => {
  const v = V.get(n);
  if (!v) throw new Error(`var ${n} missing`);
  return v;
};

// [nodeId, [field, ...], variableName] — ids from Step 1, resolved by name, not pasted
const TARGETS = [
  ["<Header id>", ["paddingTop", "paddingBottom"], "header/padding-y"],
  ["<Header nav row id>", ["itemSpacing"], "header/nav-gap"],
  ["<Footer id>", ["paddingTop", "paddingBottom"], "footer/padding-y"],
  ["<Footer outer stack id>", ["itemSpacing"], "footer/gap"],
  ["<Footer link wrapper id>", ["itemSpacing"], "footer/inner-gap"],
  ["<Footer link list A id>", ["itemSpacing"], "footer/link-gap"],
  ["<Footer link list B id>", ["itemSpacing"], "footer/link-gap"],
  ["<HeroText id>", ["itemSpacing"], "hero/text-gap"],
  ["<SerieCardList id>", ["itemSpacing"], "serie-list/gap"],
];

const done = [];
for (const [id, fields, varName] of TARGETS) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`node ${id} missing — re-run Step 1`);
  for (const f of fields) node.setBoundVariable(f, need(varName));
  done.push({ id, name: node.name, fields, varName });
}
return done;
```

- [ ] **Step 3: Read back and verify**

Fresh `use_figma` call — re-run Step 1's dump script.

Expected: every targeted node's `bound` array now contains the bound field names, and its numeric value equals the **Desktop** column (`Header` padding 24, nav gap 40; `Footer` padding 64, gap 32, inner-gap 32, link-gap 24; `HeroText` gap 16; `SerieCardList` gap 32). A node whose number did not move to the Desktop value was bound to the wrong variable — fix before proceeding.

- [ ] **Step 4: Log and commit**

Append `## Task 5` to `progress.md` with the resolved node ids per row (Task 14 re-checks these).

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — eight spacing tokens bound"
```

---

### Task 6: `Hero` and `Footer` variant sets

Both are structural masters whose `layoutMode` genuinely flips. `Hero` is a **bug fix**: the source analysis recorded it as the same component across breakpoints, but `hero/Hero.astro:8` stacks it below `lg` and Figma's Hero has never stacked.

**Files:**

- Modify (Figma): `Hero`, `Footer` → COMPONENT_SET with `breakpoint=Desktop|Mobile`
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 5's `Footer` bindings — the Mobile variant must inherit them.
- Produces: two COMPONENT_SETs named `Hero` and `Footer`, each with variants `breakpoint=Desktop` and `breakpoint=Mobile`. Tasks 10 and 13 switch instances onto these variants by property name — the property is spelled `breakpoint` (lowercase) and the values `Desktop`/`Mobile` exactly.

| Master   | Desktop                                               | Mobile                                        | Code source                                    |
| -------- | ----------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `Hero`   | HORIZONTAL, text and illustration equal FILL siblings | VERTICAL                                      | `hero/Hero.astro:8` — `flex-col … lg:flex-row` |
| `Footer` | HORIZONTAL outer, HORIZONTAL link wrapper             | VERTICAL reverse outer, VERTICAL link wrapper | `Footer.astro:25,34`                           |

At the Desktop mode width (1280), `HeroText.astro:5` resolves to `flex-1` — the `lg:flex-2` band ends at `xl` — so the Desktop variant keeps text and illustration as **equal** FILL siblings, not 2:1.

`Footer`'s Mobile variant stacks **twice**: the outer row reverses _and_ the inner link wrapper goes vertical. The inner flip gates at `sm`, the outer at `md`; both put Tablet on the Desktop side, so a 2-value axis is still correct.

- [ ] **Step 1: Create the variant sets**

`figma.combineAsVariants` needs two siblings. Clone the master, rename both, then combine.

```js
const OUT = [];
for (const name of ["Hero", "Footer"]) {
  let master = null;
  for (const p of figma.root.children) {
    await p.loadAsync();
    const hit = p.findOne((x) => x.type === "COMPONENT" && x.name === name);
    if (hit) {
      master = hit;
      await figma.setCurrentPageAsync(p);
      break;
    }
  }
  if (!master) throw new Error(`${name} master not found`);
  if (master.parent && master.parent.type === "COMPONENT_SET") {
    OUT.push({ name, skipped: "already a variant set" });
    continue;
  }
  const parent = master.parent;
  const mobile = master.clone();
  master.name = "breakpoint=Desktop";
  mobile.name = "breakpoint=Mobile";
  parent.appendChild(mobile);
  const set = figma.combineAsVariants([master, mobile], parent);
  set.name = name;
  OUT.push({
    name,
    setId: set.id,
    variants: set.children.map((c) => ({ name: c.name, id: c.id })),
  });
}
return OUT;
```

- [ ] **Step 2: Flip the Mobile variants and re-set child sizing**

Flipping `layoutMode` auto-remaps children from FILL/HUG to FIXED/FILL and collapses dimensions. Every flip needs an explicit sizing fix-up in the same call.

```js
const flip = (frame, mode) => {
  frame.layoutMode = mode; // "VERTICAL" | "HORIZONTAL"
  for (const c of frame.children) {
    if ("layoutSizingHorizontal" in c) c.layoutSizingHorizontal = "FILL";
    if ("layoutSizingVertical" in c) c.layoutSizingVertical = "HUG";
  }
};

const find = async (setName) => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    const s = p.findOne(
      (x) => x.type === "COMPONENT_SET" && x.name === setName,
    );
    if (s) {
      await figma.setCurrentPageAsync(p);
      return s;
    }
  }
  throw new Error(`${setName} set not found`);
};

// Hero — outer flips to VERTICAL
const hero = await find("Hero");
const heroMobile = hero.children.find((c) => c.name === "breakpoint=Mobile");
flip(heroMobile, "VERTICAL");

// Footer — outer flips to VERTICAL with reversed order; link wrapper flips too
const footer = await find("Footer");
const footerMobile = footer.children.find(
  (c) => c.name === "breakpoint=Mobile",
);
flip(footerMobile, "VERTICAL");
// `flex-col-reverse` on Footer.astro:25 — reverse the child order to match
const kids = [...footerMobile.children].reverse();
for (const k of kids) footerMobile.appendChild(k);
// inner link wrapper: `flex-col sm:flex-row` on Footer.astro:34
const wrapper = footerMobile.findOne(
  (x) =>
    x.type === "FRAME" &&
    x.layoutMode === "HORIZONTAL" &&
    x.children.length >= 2 &&
    x.children.every((c) => "layoutMode" in c),
);
if (!wrapper)
  throw new Error("Footer link wrapper not found in the Mobile variant");
flip(wrapper, "VERTICAL");

return {
  heroMobile: heroMobile.id,
  footerMobile: footerMobile.id,
  wrapper: wrapper.id,
};
```

If the `wrapper` heuristic throws, resolve the wrapper id by hand from the Task 5 Step 1 tree dump and substitute it — the heuristic is a convenience, not the contract.

- [ ] **Step 3: Read back the geometry (fresh call — same-tick reads are stale)**

```js
const dump = (n, d = 0) =>
  d > 2
    ? []
    : [
        {
          depth: d,
          name: n.name,
          id: n.id,
          layoutMode: "layoutMode" in n ? n.layoutMode : null,
          w: Math.round(n.width),
          h: Math.round(n.height),
          sizing:
            "layoutSizingHorizontal" in n
              ? [n.layoutSizingHorizontal, n.layoutSizingVertical]
              : null,
          itemSpacing: "itemSpacing" in n ? n.itemSpacing : null,
        },
      ].concat(
        "children" in n ? n.children.flatMap((c) => dump(c, d + 1)) : [],
      );
const out = {};
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const s of p.findAll(
    (x) => x.type === "COMPONENT_SET" && ["Hero", "Footer"].includes(x.name),
  ))
    out[s.name] = s.children.map((v) => dump(v));
}
return out;
```

Expected: `Hero`/`breakpoint=Mobile` is VERTICAL with two FILL-width children and **non-zero** height; `Footer`/`breakpoint=Mobile` is VERTICAL with the copyright line now first, and its link wrapper VERTICAL. A child of width 0 or height 0 means the sizing fix-up did not take — re-run Step 2's `flip` on that node before continuing.

- [ ] **Step 4: Confirm the spacing bindings survived the clone**

Same call is fine. Every `itemSpacing` on the Footer Mobile variant must still be bound (`footer/gap` 32, `footer/inner-gap` 32, `footer/link-gap` 24 at Desktop mode). Clones carry `boundVariables`; if any came through unbound, re-apply Task 5 Step 2 against the Mobile variant's node ids.

- [ ] **Step 5: Log and commit**

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — Hero and Footer variant sets"
```

---

### Task 7: `PostCardPreviewSmall` and the work small-card list variant sets

**Files:**

- Modify (Figma): `PostCardPreviewSmall`, plus the work list master whose real name Task 1 Gate C resolved
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 1 §Gate C (the work list master's real name), Task 6's `flip` helper pattern.
- Produces: two more COMPONENT_SETs on the same `breakpoint=Desktop|Mobile` axis.

`PostCardPreviewSmall` was built as a loose master on 2026-08-13 and is folded in here. If Gate C found no separate work list master — i.e. `WorkPreviewSection` holds the `WorkCardPreviewSmall` instances directly — put the axis on `WorkPreviewSection` instead and note in `progress.md` that Gate B's `WorkPreviewSection` verdict is superseded (Task 11 then leaves that pair alone).

- [ ] **Step 1: Create both variant sets**

Reuse Task 6 Step 1's script verbatim, with the name list replaced:

```js
for (const name of ["PostCardPreviewSmall", "<Gate C work list master name>"]) {
```

- [ ] **Step 2: Flip both Mobile variants to VERTICAL and re-set sizing**

```js
const flip = (frame, mode) => {
  frame.layoutMode = mode;
  for (const c of frame.children) {
    if ("layoutSizingHorizontal" in c) c.layoutSizingHorizontal = "FILL";
    if ("layoutSizingVertical" in c) c.layoutSizingVertical = "HUG";
  }
};
const out = [];
for (const setName of [
  "PostCardPreviewSmall",
  "<Gate C work list master name>",
]) {
  for (const p of figma.root.children) {
    await p.loadAsync();
    const s = p.findOne(
      (x) => x.type === "COMPONENT_SET" && x.name === setName,
    );
    if (!s) continue;
    await figma.setCurrentPageAsync(p);
    const mob = s.children.find((c) => c.name === "breakpoint=Mobile");
    flip(mob, "VERTICAL");
    out.push({ setName, mobileId: mob.id });
  }
}
return out;
```

- [ ] **Step 3: Read back the geometry**

Fresh call, Task 6 Step 3's `dump` script with the set-name filter changed to these two.

Expected: both Mobile variants are VERTICAL, every child FILL-width, no zero dimensions. `PostCardPreviewSmall`'s Mobile variant should show the thumbnail above the text block rather than beside it.

- [ ] **Step 4: Log and commit**

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — post/work small-card list variant sets"
```

---

### Task 8: `ArchiveTable` → `PostArchiveList` rebuild

Two corrections in one task. The `<table>` `ArchiveTable.astro` lives in `src/components/work/` and is consumed by `work.astro`, **not** the Blog page — its responsive strategy is progressive column hiding (`hidden sm:table-cell`, `hidden md:table-cell`), not stacking, and it is out of scope. The Figma master named `ArchiveTable` is actually standing in for `blog.astro:34-43`, which renders year-grouped `PostListItem` rows.

**Files:**

- Modify (Figma): master `ArchiveTable` → renamed `PostArchiveList`, rebuilt and given the `breakpoint` axis
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Produces: COMPONENT_SET `PostArchiveList` with `breakpoint=Desktop|Mobile`. Task 13's Blog frames instance it under this new name — the old name must not survive anywhere.

Target shape, from `blog.astro:34-43`:

```
flex flex-col gap-2 sm:grid sm:grid-cols-[3rem_1fr] sm:gap-x-3
```

- **Desktop / Tablet:** 48px (3rem) year gutter on the left, post rows filling the rest; the rows column carries a 1px left border and 12px left padding (`blog.astro:41` — `sm:border-l sm:pl-3`).
- **Mobile:** year label stacked above its rows; border and left padding dropped; 8px (`gap-2`) between label and rows.

`PostListItem` is `flex-row justify-between` at every width — it gets **no** variant.

- [ ] **Step 1: Inspect the current master before touching it**

```js
const tree = (n, d = 0) =>
  d > 4
    ? []
    : [
        {
          depth: d,
          type: n.type,
          name: n.name,
          id: n.id,
          layoutMode: "layoutMode" in n ? n.layoutMode : null,
          itemSpacing: "itemSpacing" in n ? n.itemSpacing : null,
          strokes: "strokes" in n ? n.strokes.length : null,
          padding: "paddingLeft" in n ? n.paddingLeft : null,
          chars: n.type === "TEXT" ? n.characters.slice(0, 30) : null,
        },
      ].concat(
        "children" in n ? n.children.flatMap((c) => tree(c, d + 1)) : [],
      );
for (const p of figma.root.children) {
  await p.loadAsync();
  const m = p.findOne(
    (x) =>
      (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
      x.name === "ArchiveTable",
  );
  if (m) return { page: p.name, tree: tree(m) };
}
return { notFound: true };
```

Record the tree in `progress.md` before rebuilding — this is the only copy of what was there.

- [ ] **Step 2: Rename and rebuild the Desktop shape**

```js
let master = null,
  page = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne(
    (x) => x.type === "COMPONENT" && x.name === "ArchiveTable",
  );
  if (hit) {
    master = hit;
    page = p;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
if (!master)
  throw new Error("ArchiveTable master not found — check Task 1 inventory");
master.name = "PostArchiveList";

// One year group = HORIZONTAL [ 48px year label | rows column with left border ]
master.layoutMode = "VERTICAL";
master.itemSpacing = 0;
for (const group of master.children) {
  if (!("layoutMode" in group)) continue;
  group.layoutMode = "HORIZONTAL";
  group.itemSpacing = 12; // sm:gap-x-3
  group.counterAxisAlignItems = "MIN";
  const [label, rows] = group.children;
  if (label && "resize" in label) {
    label.layoutSizingHorizontal = "FIXED";
    label.resize(48, label.height); // sm:grid-cols-[3rem_1fr]
  }
  if (rows) {
    rows.layoutSizingHorizontal = "FILL";
    rows.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    rows.strokeLeftWeight = 1; // sm:border-l
    rows.strokeTopWeight = 0;
    rows.strokeRightWeight = 0;
    rows.strokeBottomWeight = 0;
    rows.paddingLeft = 12; // sm:pl-3
  }
}
return { id: master.id, name: master.name };
```

- [ ] **Step 3: Bind the border colour**

The stroke set in Step 2 is a raw black — a Pass-2 finding if left. Bind it to `2 Theme`'s `color/border`.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
let border = null;
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name === "color/border") border = v;
}
if (!border) throw new Error("2 Theme/color/border missing");

const master = await figma.getNodeByIdAsync("<PostArchiveList id from Step 2>");
const touched = [];
for (const n of master.findAll(
  (x) => Array.isArray(x.strokes) && x.strokes.length,
)) {
  const s = [...n.strokes];
  s[0] = figma.variables.setBoundVariableForPaint(s[0], "color", border);
  n.strokes = s;
  touched.push(n.id);
}
return touched;
```

- [ ] **Step 4: Create the variant set and build the Mobile variant**

```js
let master = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne(
    (x) => x.type === "COMPONENT" && x.name === "PostArchiveList",
  );
  if (hit) {
    master = hit;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
const parent = master.parent;
const mobile = master.clone();
master.name = "breakpoint=Desktop";
mobile.name = "breakpoint=Mobile";
parent.appendChild(mobile);
const set = figma.combineAsVariants([master, mobile], parent);
set.name = "PostArchiveList";

// Mobile: year label above its rows, no border, no left padding, gap-2
for (const group of mobile.children) {
  if (!("layoutMode" in group)) continue;
  group.layoutMode = "VERTICAL";
  group.itemSpacing = 8; // gap-2
  for (const c of group.children) {
    if ("layoutSizingHorizontal" in c) c.layoutSizingHorizontal = "FILL";
    if ("layoutSizingVertical" in c) c.layoutSizingVertical = "HUG";
    if ("strokes" in c) c.strokes = [];
    if ("paddingLeft" in c) c.paddingLeft = 0;
  }
}
return {
  setId: set.id,
  variants: set.children.map((c) => ({ name: c.name, id: c.id })),
};
```

- [ ] **Step 5: Read back and verify both variants**

Fresh call, Step 1's `tree` script pointed at `PostArchiveList`.

Expected:

- No node anywhere in the file is still named `ArchiveTable`.
- `breakpoint=Desktop`: each year group HORIZONTAL, label 48px FIXED, rows FILL with `strokes.length === 1` and `paddingLeft === 12`.
- `breakpoint=Mobile`: each year group VERTICAL, `itemSpacing === 8`, no strokes, `paddingLeft === 0`, all children FILL-width.
- Both variants have non-zero height.

- [ ] **Step 6: Log and commit**

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — ArchiveTable rebuilt as PostArchiveList"
```

---

### Task 9: `SerieCardList` variant set

`blog.astro:55` is `grid gap-4 md:grid-cols-2 lg:gap-8` — a 2-up grid. **Decision (design §4): keep 3 columns** on Desktop and Tablet, 1 column on Mobile. Figma leads; the one-line code change is queued as debt in Task 15.

**Files:**

- Modify (Figma): `SerieCardList` → COMPONENT_SET with `breakpoint=Desktop|Mobile`
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 5's `serie-list/gap` binding on `SerieCardList.itemSpacing`.
- Produces: COMPONENT_SET `SerieCardList`. Closes the `SerieCardList` half of `.specs/00_backlog/figma-blog-mobile-sections.md`.

The Desktop variant is what the master already is — HORIZONTAL auto-layout with three FILL children, which narrow automatically at Tablet, so there is no wrap and no Tablet-specific handling. **Only the Mobile VERTICAL variant is new work.** Trade-off accepted: at Tablet 768 with a 16px gutter and 16px gaps each card is ~234px for a title plus a 3-line clamp — tight but viable.

- [ ] **Step 1: Create the set and flip the Mobile variant**

```js
let master = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne(
    (x) => x.type === "COMPONENT" && x.name === "SerieCardList",
  );
  if (hit) {
    master = hit;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
if (!master) throw new Error("SerieCardList master not found");
if (master.layoutMode !== "HORIZONTAL")
  throw new Error(
    `expected HORIZONTAL Desktop master, got ${master.layoutMode}`,
  );
if (master.children.length !== 3)
  throw new Error(
    `expected 3 SerieCard children, got ${master.children.length}`,
  );

const parent = master.parent;
const mobile = master.clone();
master.name = "breakpoint=Desktop";
mobile.name = "breakpoint=Mobile";
parent.appendChild(mobile);
const set = figma.combineAsVariants([master, mobile], parent);
set.name = "SerieCardList";

mobile.layoutMode = "VERTICAL";
for (const c of mobile.children) {
  c.layoutSizingHorizontal = "FILL";
  c.layoutSizingVertical = "HUG";
}
return {
  setId: set.id,
  variants: set.children.map((c) => ({ name: c.name, id: c.id })),
};
```

- [ ] **Step 2: Read back and verify**

Fresh call, Task 6 Step 3's `dump` script filtered to `SerieCardList`.

Expected: `breakpoint=Desktop` is HORIZONTAL with three FILL children and `itemSpacing` still bound (32 at Desktop mode); `breakpoint=Mobile` is VERTICAL with three full-width cards, each card's height non-zero — a card that collapsed to a sliver means the sizing fix-up did not take.

- [ ] **Step 3: Log and commit**

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — SerieCardList breakpoint axis"
```

---

### Task 10: `Header` variant set and the `HeaderDrawer` master

No code equivalent exists — `Header.astro` keeps the nav inline at every width and renders **no brand element**. Figma leads here by explicit decision, and Task 15 files the code debt.

**Files:**

- Modify (Figma): `Header` → COMPONENT_SET with `breakpoint=Desktop|Mobile`
- Create (Figma): master `HeaderDrawer` with `state=closed|open`
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 4's `text/nav-link` binding on `NavLink`/`NavLinkHome`; Task 5's `header/padding-y` and `header/nav-gap` bindings.
- Produces: COMPONENT_SET `Header`, master `HeaderDrawer`. Task 13's Mobile page masters instance both.

| Variant              | Content                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `breakpoint=Desktop` | unchanged inline nav — links at `text/nav-link` = 20, `header/nav-gap` = 40, `header/padding-y` = 24                                                                                                   |
| `breakpoint=Mobile`  | brand wordmark left (a **Figma-only** element — `Header.astro` renders no brand at any width) sized at `text/nav-link` = 16, hamburger icon right in a **44×44** touch target, `header/padding-y` = 16 |

`HeaderDrawer`, `state=closed|open`: full-width overlay below the bar, nav items stacked at `header/nav-gap` = 16, `ThemeToggle` and `MotionToggle` at the bottom. The 44px target is consistent with `.specs/00_backlog/figma-mobile-touch-targets.md`.

- [ ] **Step 1: Create the `Header` set**

Reuse Task 6 Step 1's script with `for (const name of ["Header"])`.

- [ ] **Step 2: Build the Mobile variant**

```js
let set = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const s = p.findOne((x) => x.type === "COMPONENT_SET" && x.name === "Header");
  if (s) {
    set = s;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
const mobile = set.children.find((c) => c.name === "breakpoint=Mobile");

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const theme = cols.find((c) => c.name === "2 Theme");
const V = new Map();
for (const c of [resp, theme])
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    V.set(`${c.name}/${v.name}`, v);
  }
const need = (n) => {
  const v = V.get(n);
  if (!v) throw new Error(`var ${n} missing`);
  return v;
};

// Drop the inline nav row, keep the bar itself (padding already bound in Task 5)
for (const c of [...mobile.children]) c.remove();
mobile.layoutMode = "HORIZONTAL";
mobile.primaryAxisAlignItems = "SPACE_BETWEEN";
mobile.counterAxisAlignItems = "CENTER";

// Brand wordmark — Figma-only, no code counterpart
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
const brand = figma.createText();
brand.name = "Brand";
brand.fontName = { family: "Inter", style: "Medium" };
brand.characters = "Jerome Abel";
brand.setRangeBoundVariable(
  0,
  brand.characters.length,
  "fontSize",
  need("3 Responsive/text/nav-link"),
);
const bf = [...brand.fills];
bf[0] = figma.variables.setBoundVariableForPaint(
  bf[0],
  "color",
  need("2 Theme/color/foreground"),
);
brand.fills = bf;
mobile.appendChild(brand);

// Hamburger in a 44x44 touch target
const target = figma.createFrame();
target.name = "MenuButton";
target.resize(44, 44);
target.fills = [];
target.layoutMode = "VERTICAL";
target.primaryAxisAlignItems = "CENTER";
target.counterAxisAlignItems = "CENTER";
target.itemSpacing = 4;
for (let i = 0; i < 3; i++) {
  const bar = figma.createRectangle();
  bar.name = `bar-${i + 1}`;
  bar.resize(20, 2);
  const f = [...bar.fills];
  f[0] = figma.variables.setBoundVariableForPaint(
    f[0],
    "color",
    need("2 Theme/color/foreground"),
  );
  bar.fills = f;
  target.appendChild(bar);
}
mobile.appendChild(target);
target.layoutSizingHorizontal = "FIXED";
target.layoutSizingVertical = "FIXED";

return { mobileId: mobile.id, brand: brand.id, target: target.id };
```

The font family/style above must byte-match a font already used in the file — a mismatch silently breaks binding. Read the family/style off an existing `NavLink` TEXT node (Task 4 Step 1 dumped them) and substitute if it is not Inter/Medium.

- [ ] **Step 3: Build the `HeaderDrawer` master**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const theme = cols.find((c) => c.name === "2 Theme");
const V = new Map();
for (const c of [resp, theme])
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    V.set(`${c.name}/${v.name}`, v);
  }
const need = (n) => {
  const v = V.get(n);
  if (!v) throw new Error(`var ${n} missing`);
  return v;
};

// Home the drawer next to the Header set, in the same SECTION
let headerSet = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const s = p.findOne((x) => x.type === "COMPONENT_SET" && x.name === "Header");
  if (s) {
    headerSet = s;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
const home = headerSet.parent;

const build = (stateName, open) => {
  const f = figma.createFrame();
  f.name = stateName;
  f.layoutMode = "VERTICAL";
  f.layoutSizingHorizontal = "FIXED";
  f.resize(390, open ? 320 : 1);
  f.itemSpacing = 16;
  f.paddingTop = 16;
  f.paddingBottom = 16;
  f.paddingLeft = 16;
  f.paddingRight = 16;
  f.setBoundVariable("itemSpacing", need("3 Responsive/header/nav-gap"));
  const fills = [...f.fills];
  fills[0] = figma.variables.setBoundVariableForPaint(
    fills[0],
    "color",
    need("2 Theme/color/background"),
  );
  f.fills = fills;
  f.visible = true;
  const c = figma.createComponentFromNode(f);
  c.name = stateName;
  home.appendChild(c);
  return c;
};

const closed = build("state=closed", false);
const open = build("state=open", true);
const set = figma.combineAsVariants([closed, open], home);
set.name = "HeaderDrawer";
return {
  setId: set.id,
  variants: set.children.map((c) => ({ name: c.name, id: c.id })),
};
```

- [ ] **Step 4: Populate `state=open` with nav items and the two toggles**

Instance the existing masters rather than drawing new ones — a hand-drawn stand-in is the same failure class as a detached instance.

```js
let set = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const s = p.findOne(
    (x) => x.type === "COMPONENT_SET" && x.name === "HeaderDrawer",
  );
  if (s) {
    set = s;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
const open = set.children.find((c) => c.name === "state=open");

const masters = {};
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const n of p.findAll(
    (x) =>
      x.type === "COMPONENT" &&
      ["NavLink", "ThemeToggle", "MotionToggle"].includes(x.name),
  ))
    masters[n.name] = n;
}
for (const k of ["NavLink", "ThemeToggle", "MotionToggle"])
  if (!masters[k]) throw new Error(`${k} master missing`);

for (let i = 0; i < 4; i++) {
  const inst = masters.NavLink.createInstance();
  open.appendChild(inst);
  inst.layoutSizingHorizontal = "FILL";
}
const row = figma.createFrame();
row.name = "Toggles";
row.layoutMode = "HORIZONTAL";
row.itemSpacing = 16;
row.fills = [];
open.appendChild(row);
row.layoutSizingHorizontal = "FILL";
row.layoutSizingVertical = "HUG";
row.appendChild(masters.ThemeToggle.createInstance());
row.appendChild(masters.MotionToggle.createInstance());
return { open: open.id, children: open.children.map((c) => c.name) };
```

- [ ] **Step 5: Read back and verify**

Fresh call. Expected:

- `Header` is a COMPONENT_SET with exactly `breakpoint=Desktop` and `breakpoint=Mobile`.
- Desktop variant unchanged: nav row `itemSpacing` bound to `header/nav-gap` (40 at Desktop mode), padding bound to `header/padding-y` (24).
- Mobile variant: two children (`Brand`, `MenuButton`), `MenuButton` exactly 44×44, `Brand.boundVariables` contains `fontSize`, both fills bound to `2 Theme/color/foreground`.
- `HeaderDrawer` is a COMPONENT_SET with `state=closed` and `state=open`; `state=open` holds 4 `NavLink` INSTANCEs plus a `Toggles` row with `ThemeToggle` and `MotionToggle` INSTANCEs; its `itemSpacing` is bound to `header/nav-gap`; its background fill is bound.
- **Zero raw fills** introduced anywhere in this task — a raw fill here becomes a Task 14 Pass-2 finding.

- [ ] **Step 6: Log and commit**

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — Header breakpoint axis and HeaderDrawer"
```

---

### Task 11: Delete the four `— Mobile` masters

The three `…Section — Mobile` masters exist only because their child list flips direction. Now that the lists carry the `breakpoint=` axis, the section wrapper is identical across breakpoints and one master suffices.

**This task is gated by Task 1 §Gate B.** Delete only pairs the gate marked MERGE-SAFE. A pair marked KEEPS-OWN-AXIS gets its own `breakpoint` axis instead (Task 7's recipe) and is _not_ deleted. Do not delete on assumption.

**Files:**

- Delete (Figma): `PostCardPreviewSmall — Mobile`, `BlogPreviewSection — Mobile`, `WorkPreviewSection — Mobile`, `ContactPreviewSection — Mobile` — subject to the gate
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 1 §Gate B verdicts; Task 7's `PostCardPreviewSmall` set.
- Produces: a file with no `— Mobile` masters. Task 13 depends on this: the Mobile page masters must instance the _base_ masters on their Mobile variant, not a separate master.

- [ ] **Step 1: Find every instance pointing at a doomed master**

```js
const DOOMED = [
  "PostCardPreviewSmall — Mobile",
  "BlogPreviewSection — Mobile",
  "WorkPreviewSection — Mobile",
  "ContactPreviewSection — Mobile",
];
const found = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const i of p.findAllWithCriteria({ types: ["INSTANCE"] })) {
    let mc = null;
    try {
      mc = await i.getMainComponentAsync();
    } catch (e) {}
    if (mc && DOOMED.includes(mc.name))
      found.push({
        page: p.name,
        instance: i.name,
        id: i.id,
        main: mc.name,
        mainId: mc.id,
        frame: i.parent?.name ?? null,
      });
  }
}
return found;
```

- [ ] **Step 2: Swap every instance onto the base master's Mobile variant**

```js
const DOOMED = {
  "PostCardPreviewSmall — Mobile": "PostCardPreviewSmall",
  "BlogPreviewSection — Mobile": "BlogPreviewSection",
  "WorkPreviewSection — Mobile": "WorkPreviewSection",
  "ContactPreviewSection — Mobile": "ContactPreviewSection",
};
// drop any entry Gate B marked KEEPS-OWN-AXIS before running

const targets = new Map();
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const n of p.findAll(
    (x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET",
  ))
    if (Object.values(DOOMED).includes(n.name)) targets.set(n.name, n);
}

const swapped = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const i of p.findAllWithCriteria({ types: ["INSTANCE"] })) {
    let mc = null;
    try {
      mc = await i.getMainComponentAsync();
    } catch (e) {}
    if (!mc || !DOOMED[mc.name]) continue;
    const t = targets.get(DOOMED[mc.name]);
    if (!t) throw new Error(`replacement master ${DOOMED[mc.name]} missing`);
    const comp =
      t.type === "COMPONENT_SET"
        ? (t.children.find((c) => c.name === "breakpoint=Mobile") ??
          t.defaultVariant)
        : t;
    i.swapComponent(comp);
    swapped.push({ id: i.id, from: mc.name, to: comp.name, page: p.name });
  }
}
return swapped;
```

If a swapped instance sits inside a section whose own master is being deleted, the outer swap handles it — re-run this script until it returns an empty array.

- [ ] **Step 3: Verify no instance points at a doomed master, then delete**

Fresh call. Step 1's script must return `[]` first; only then run:

```js
const DOOMED = [
  "PostCardPreviewSmall — Mobile",
  "BlogPreviewSection — Mobile",
  "WorkPreviewSection — Mobile",
  "ContactPreviewSection — Mobile",
];
// drop any entry Gate B marked KEEPS-OWN-AXIS
const removed = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const n of p.findAll(
    (x) =>
      (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
      DOOMED.includes(x.name),
  )) {
    removed.push({ name: n.name, id: n.id, page: p.name });
    n.remove();
  }
}
return removed;
```

- [ ] **Step 4: Read back the master roster**

Fresh call, Task 1 Step 2's Pass-0 walk. Expected: no name containing `— Mobile` survives, and no instance anywhere is detached (`mainComponent === null`). Master count: Task 1's baseline, minus the masters actually deleted, plus `HeaderDrawer`. Design §3's "33 → 29" predates `HeaderDrawer`; the real arithmetic is `baseline − deleted + 1`. Record the actual number rather than asserting 29.

- [ ] **Step 5: Log and commit**

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — mobile section masters merged away"
```

---

### Task 12: `HeroAnimation` — bind what can bind, document what cannot

Seven layers: three flat shapes, three shadow images, one blurred halo. Three treatments, one per layer kind.

**Files:**

- Modify (Figma): `HeroAnimation`, plus the Footer illustration **only if Task 1 §Gate A found one**
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: Task 1 §Gate A verdict.
- Produces: `HeroAnimation` with flat-shape fills bound to `2 Theme/color/foreground`. Task 13 hides the whole instance on the Mobile masters.

| Layer kind        | Treatment                                                            | Why                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flat shapes (3)   | fills rebound to `color/foreground` (gray-800 Light / gray-100 Dark) | replaces `dark:invert`; same visual result because the art is flat near-black. No duplicate art, no variant.                                              |
| Shadow images (3) | **stay unbound**                                                     | blurred gray blobs; under `dark:invert` they render as light glows, and a fill rebind cannot reproduce a blur. Dark instances accept the Light rendering. |
| `Triangle` halo   | **stays unbound**                                                    | `HeroAnimation.astro:61` — `text-white blur-lg dark:opacity-30`. Figma binds neither the blur nor the mode-conditional opacity.                           |

Visibility: Desktop only, hidden at Tablet and Mobile, matching `HeroAnimation.astro:47` — `hidden … lg:block dark:invert`. Figma has no mode-driven boolean visibility, so this is **one manual toggle on each of the two Mobile page masters** (Task 13), not a variant.

**These three items — the two unbound layer kinds and the manual visibility toggle — are the only accepted exceptions to the cascade/binding rules.** Task 15 documents them on the 📚 Design system page.

- [ ] **Step 1: Classify the seven layers**

```js
let m = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne(
    (x) => x.type === "COMPONENT" && x.name === "HeroAnimation",
  );
  if (hit) {
    m = hit;
    await figma.setCurrentPageAsync(p);
    break;
  }
}
if (!m) throw new Error("HeroAnimation master not found");
return m
  .findAll(() => true)
  .map((n) => ({
    name: n.name,
    id: n.id,
    type: n.type,
    fills: Array.isArray(n.fills)
      ? n.fills.map((f) => ({ type: f.type, bound: !!f.boundVariables?.color }))
      : null,
    effects: (n.effects ?? []).map((e) => e.type),
    opacity: n.opacity,
  }));
```

Classify: a layer with an `IMAGE` fill is a **shadow image**; a layer with a `BLUR` effect or named `Triangle` is the **halo**; the rest are **flat shapes**. If the counts do not come out 3 / 3 / 1, record the actual split in `progress.md` and apply the same rules to whatever is there — do not force the numbers.

- [ ] **Step 2: Bind the flat-shape fills**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
let fg = null;
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name === "color/foreground") fg = v;
}
if (!fg) throw new Error("2 Theme/color/foreground missing");

const FLAT_IDS = [
  "<flat shape id 1>",
  "<flat shape id 2>",
  "<flat shape id 3>",
]; // from Step 1
const done = [];
for (const id of FLAT_IDS) {
  const n = await figma.getNodeByIdAsync(id);
  const f = [...n.fills];
  f[0] = figma.variables.setBoundVariableForPaint(f[0], "color", fg);
  n.fills = f;
  done.push({ id, name: n.name });
}
return done;
```

- [ ] **Step 3: Handle the Footer illustration per Gate A**

If Task 1 §Gate A found **no** illustration in `Footer`, skip this step and write in `progress.md`: _"Gate A: Footer has no illustration; design §3 applies to HeroAnimation alone."_ If it found one, classify its layers with Step 1's script pointed at `Footer` and apply Step 2's binding to the flat shapes only.

- [ ] **Step 4: Read back and verify**

Fresh call, Step 1's script. Expected: exactly the flat shapes report `bound: true`; the shadow images and halo report `bound: false` and are **unchanged** — no fill, opacity or effect touched.

- [ ] **Step 5: Log and commit**

Record in `progress.md` the exact node ids of the two unbound kinds. Task 15 needs them for the exceptions doc, and Task 14's Pass-2 diff needs them as `named-debt.json` entries if they surface as new raw values.

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — HeroAnimation fills bound, exceptions recorded"
```

---

### Task 13: Frame collapse — 8 editable frames → 4 masters + 4 dark instances

The payoff. `Home — Mobile — Light` is 4158px tall and `Home — Mobile — Dark` is 3504px: 654px of divergence between two frames that should be identical. Making Dark an _instance_ of Light with one mode pinned eliminates that bug class structurally, not by discipline.

**Files:**

- Modify (Figma): 📄 Pages (`2558:18264`) — the eight Home/Blog frames
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: every variant set from Tasks 6–10; Task 11's deletions; Task 12's `HeroAnimation`.
- Produces: the target frame inventory below. Task 14 verifies against it.

| Node                    | Kind      | Theme mode    | Responsive mode    |
| ----------------------- | --------- | ------------- | ------------------ |
| `Home — Desktop`        | COMPONENT | Light (`3:0`) | Desktop (`2245:0`) |
| `Home — Mobile`         | COMPONENT | Light (`3:0`) | Mobile (`2245:2`)  |
| `Home — Desktop [Dark]` | instance  | Dark (`3:1`)  | Desktop            |
| `Home — Mobile [Dark]`  | instance  | Dark (`3:1`)  | Mobile             |
| `Blog — Desktop`        | COMPONENT | Light         | Desktop            |
| `Blog — Mobile`         | COMPONENT | Light         | Mobile             |
| `Blog — Desktop [Dark]` | instance  | Dark          | Desktop            |
| `Blog — Mobile [Dark]`  | instance  | Dark          | Mobile             |

Page-level composition gaps stay **frame-local literals**, deliberately: `index.astro:13` is `gap-16 lg:gap-24 xl:gap-36` (64/64/144 — `xl` fires at the Desktop mode width 1280) while `blog.astro:25` is `gap-16 md:gap-24` (64/96/96), and `blog.astro:27`'s header adds `gap-4 lg:gap-8`. One token cannot serve both pages. This is safe under the design's own rule: each number is set once per master, never per theme, so the drift class being killed here does not reopen.

- [ ] **Step 1: Inventory the eight current frames**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
return page.children.map((f) => ({
  name: f.name,
  id: f.id,
  type: f.type,
  w: Math.round(f.width),
  h: Math.round(f.height),
  itemSpacing: "itemSpacing" in f ? f.itemSpacing : null,
  modes: f.explicitVariableModes ?? null,
}));
```

Record all eight, with heights — the 654px Home Mobile divergence must be visible in this dump. If the 📄 Pages node id has drifted, resolve the page by name from Task 1's inventory.

- [ ] **Step 2: Bring the four Light frames onto the new masters**

Before converting anything, every instance inside the four Light frames must point at a current master and, on the Mobile frames, at its `breakpoint=Mobile` variant.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const LIGHT = [
  "Home — Desktop — Light",
  "Home — Mobile — Light",
  "Blog — Desktop — Light",
  "Blog — Mobile — Light",
];
const report = [];
for (const f of page.children) {
  if (!LIGHT.includes(f.name)) continue;
  const wantMobile = /Mobile/.test(f.name);
  for (const i of f.findAllWithCriteria({ types: ["INSTANCE"] })) {
    let mc = null;
    try {
      mc = await i.getMainComponentAsync();
    } catch (e) {}
    if (!mc) {
      report.push({ frame: f.name, id: i.id, issue: "detached" });
      continue;
    }
    const set =
      mc.parent && mc.parent.type === "COMPONENT_SET" ? mc.parent : null;
    if (!set) continue;
    const want = wantMobile ? "Mobile" : "Desktop";
    const props = i.componentProperties ?? {};
    if (props.breakpoint && props.breakpoint.value !== want) {
      i.setProperties({ breakpoint: want });
      report.push({ frame: f.name, id: i.id, set: set.name, switched: want });
    }
  }
}
return report;
```

Frame names in `LIGHT` are guesses from the design's prose — substitute the real ones from Step 1.

- [ ] **Step 3: Hide `HeroAnimation` on the two Mobile Light frames**

Per design §3: visible at Desktop only, matching `HeroAnimation.astro:47`. One manual toggle each — Figma has no mode-driven boolean visibility.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const done = [];
for (const f of page.children) {
  if (!/Mobile/.test(f.name)) continue;
  for (const i of f.findAllWithCriteria({ types: ["INSTANCE"] })) {
    let mc = null;
    try {
      mc = await i.getMainComponentAsync();
    } catch (e) {}
    if (mc && mc.name === "HeroAnimation") {
      i.visible = false;
      done.push({ frame: f.name, id: i.id });
    }
  }
}
return done;
```

- [ ] **Step 4: Convert the four Light frames to COMPONENTs and pin their modes**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
const resp = cols.find((c) => c.name === "3 Responsive");
const mode = (col, name) => {
  const m = col.modes.find((x) => x.name === name);
  if (!m) throw new Error(`${col.name} has no mode ${name}`);
  return m.modeId;
};

const RENAME = {
  // old name -> new master name
  "Home — Desktop — Light": "Home — Desktop",
  "Home — Mobile — Light": "Home — Mobile",
  "Blog — Desktop — Light": "Blog — Desktop",
  "Blog — Mobile — Light": "Blog — Mobile",
};
const out = [];
for (const f of [...page.children]) {
  const target = RENAME[f.name];
  if (!target) continue;
  const comp = f.type === "COMPONENT" ? f : figma.createComponentFromNode(f);
  comp.name = target;
  comp.setExplicitVariableModeForCollection(theme, mode(theme, "Light"));
  comp.setExplicitVariableModeForCollection(
    resp,
    mode(resp, /Mobile/.test(target) ? "Mobile" : "Desktop"),
  );
  out.push({ name: comp.name, id: comp.id, modes: comp.explicitVariableModes });
}
return out;
```

- [ ] **Step 5: Replace the four Dark frames with instances**

Destructive — the old Dark frames are deleted. That is the point: they are the drift. Their content is reproduced by the Light master under a pinned Dark mode, and Step 7 proves it before anything is deleted.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
const resp = cols.find((c) => c.name === "3 Responsive");
const mode = (col, name) => col.modes.find((x) => x.name === name).modeId;

const PAIRS = [
  // master name -> old dark frame name
  ["Home — Desktop", "Home — Desktop — Dark", "Desktop"],
  ["Home — Mobile", "Home — Mobile — Dark", "Mobile"],
  ["Blog — Desktop", "Blog — Desktop — Dark", "Desktop"],
  ["Blog — Mobile", "Blog — Mobile — Dark", "Mobile"],
];
const out = [];
for (const [masterName, oldName, bp] of PAIRS) {
  const master = page.children.find(
    (c) => c.type === "COMPONENT" && c.name === masterName,
  );
  if (!master)
    throw new Error(`${masterName} master missing — Step 4 incomplete`);
  const old = page.children.find((c) => c.name === oldName);
  const inst = master.createInstance();
  inst.name = `${masterName} [Dark]`;
  inst.setExplicitVariableModeForCollection(theme, mode(theme, "Dark"));
  inst.setExplicitVariableModeForCollection(resp, mode(resp, bp));
  if (old) {
    inst.x = old.x;
    inst.y = old.y;
  }
  page.appendChild(inst);
  out.push({
    instance: inst.name,
    id: inst.id,
    oldId: old ? old.id : null,
    oldHeight: old ? Math.round(old.height) : null,
    newHeight: Math.round(inst.height),
  });
}
return out;
```

- [ ] **Step 6: Verify each dark instance before deleting its old frame**

Fresh call. For each new instance: background fill resolves to the Dark `#1e1e1e`, height is within a few px of its **Light master** (not of the old Dark frame — the old frame is the thing that drifted), and `detachedCount` is 0.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const hex = (n) => {
  const f = Array.isArray(n.fills) && n.fills.find((p) => p.type === "SOLID");
  if (!f) return null;
  const h = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${h(f.color.r)}${h(f.color.g)}${h(f.color.b)}`;
};
const out = [];
for (const f of page.children) {
  const insts = f.findAllWithCriteria({ types: ["INSTANCE"] });
  let detached = 0;
  for (const i of insts) {
    try {
      if (!(await i.getMainComponentAsync())) detached++;
    } catch (e) {
      detached++;
    }
  }
  out.push({
    name: f.name,
    type: f.type,
    id: f.id,
    bg: hex(f),
    w: Math.round(f.width),
    h: Math.round(f.height),
    modes: f.explicitVariableModes ?? null,
    instances: insts.length,
    detached,
  });
}
return out;
```

Expected: `Home — Desktop [Dark]` height equals `Home — Desktop` height; likewise for the other three. **`Home — Mobile [Dark]` and `Home — Mobile` must now be identical heights — that is the 654px bug closing.** Any mismatch is a STOP: the master carries an override the instance does not, and deleting the old Dark frame would lose evidence.

- [ ] **Step 7: Delete the four old Dark frames**

Only after Step 6 passed for all four.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const OLD = [
  "Home — Desktop — Dark",
  "Home — Mobile — Dark",
  "Blog — Desktop — Dark",
  "Blog — Mobile — Dark",
];
const removed = [];
for (const f of [...page.children])
  if (OLD.includes(f.name) && f.type !== "INSTANCE") {
    removed.push({ name: f.name, id: f.id });
    f.remove();
  }
return removed;
```

- [ ] **Step 8: Read back the final frame inventory**

Fresh call, Step 6's script. Expected exactly the eight rows of the target table: four `COMPONENT`, four `INSTANCE`, correct `explicitVariableModes` on each, `detached: 0` everywhere.

- [ ] **Step 9: Log and commit**

Record before/after heights for all eight frames in `progress.md` — this is the evidence that the 654px divergence is gone.

```bash
git add .specs/01_active/figma-responsive-architecture/progress.md
git commit -m "docs(specs): figma-responsive-architecture — 8 frames collapsed to 4 masters + 4 dark instances"
```

---

### Task 14: Full verification sweep

**Files:**

- Create: `tokens.figma.json`, `raw-values.figma.json`, `tokens.code.json`, `geometry.web.json` (all gitignored dumps — do not commit)
- Modify: `scripts/figma/named-debt.json` (only if Pass 2 surfaces genuinely new, justified exceptions)
- Modify: `.specs/01_active/figma-responsive-architecture/progress.md`

**Interfaces:**

- Consumes: everything from Tasks 2–13, plus Task 3's `figma:verify-responsive`.
- Produces: a verdict per finding (`real-drift` / `expected-gap` / `map-update`) recorded in `progress.md`.

- [ ] **Step 1: Export the `.fig` and dump the tokens**

Figma has no dump API. A local **File > Export** carries the whole document; `fig-decode.mjs` parses that fig-kiwi binary.

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig > tokens.figma.json
```

Expected: exit 0, and `3 Responsive` in the output holds 18 variables × 3 modes = 54 entries.

- [ ] **Step 2: Run the responsive check**

Run: `pnpm figma:verify-responsive`
Expected: `## Missing` = `_none_`, `## Value mismatch` = `_none_`, `## Extra in Figma` = `_none_`. This is design §7's headline acceptance criterion — all 18 variables present and correct in all three modes, including the corrected `container/gutter` (16/16/16) and `section/rhythm-y` (32/32/96) ladders.

- [ ] **Step 3: Run the token diff**

Run: `pnpm figma:verify`
Expected: `Missing in Figma` and `Value mismatch` both `_none_`. In particular `container-padding-inline` (code 16, from `global.css:6`) now matches `3 Responsive/Desktop/container/gutter` — before Task 2 that was 32 and mismatched. `Orphaned in Figma` should be `_none_` thanks to Task 3's `orphanIgnore`; any surviving orphan is a real one and needs a verdict.

- [ ] **Step 4: Run the raw-value diff**

Dump per `scripts/figma/dump-raw-values.md` → `raw-values.figma.json`, then:

Run: `pnpm figma:verify-raw`
Expected: `named-debt.json`'s `accepted` array **shrinks net** — the six type ramps and eight spacing fields that were raw or style-only are now bound. Judge only the "New raw values" section. The known-acceptable additions are Task 12's three shadow images and the `Triangle` halo, if the dump flags them; add each with its design-§3 reason and mirror it into the 📚 Design system page's Named debt log. Prune every "Stale named-debt entry" whose node no longer carries a raw value — deleted masters from Task 11 will produce several.

- [ ] **Step 5: Run the geometry diff**

Both Home (`/`) and Blog (`/blog`) are real routes, so computed geometry is checkable against the Figma frames at 390 and 1280.

```bash
pnpm geometry:web
node scripts/figma/diff-geometry.mjs geometry.web.json geometry.figma.json
```

Expected: deltas **only** at the two design-§6 debt items — the header hamburger (Figma has one, `Header.astro` does not) and the serie grid column count (Figma 3, `blog.astro:55` 2). Any third delta is real drift and needs fixing before this task closes.

- [ ] **Step 6: The acceptance test — switch one master to Tablet**

This is the acceptance test for the whole architecture. In Figma, select `Home — Desktop` and switch its `3 Responsive` mode to **Tablet**. Confirm without editing anything:

- page title 60 → 48, section titles 30 → 24, hero title 48 → 36, hero body 24 → 20 (leading 30 → 28), nav links stay 20
- header padding 24 → 16, nav gap 40 → 24; footer padding stays 64, gaps stay 32/24
- section rhythm 96 → 32; gutter stays 16
- serie card gap 32 → 16, cards narrow to ~234px without wrapping
- `Hero` stays HORIZONTAL (its flip gates at `lg`, so Tablet sides with Desktop for the _variant_, while its numbers move)

Then switch it back to Desktop. **If any number required a frame edit, the architecture has a hole** — record which one in `progress.md` and stop.

- [ ] **Step 7: Overflow audit on both Mobile masters**

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const out = [];
for (const f of page.children) {
  if (!/Mobile/.test(f.name)) continue;
  const bad = f.findAll(
    (n) =>
      "absoluteBoundingBox" in n &&
      n.absoluteBoundingBox &&
      (n.absoluteBoundingBox.x < f.absoluteBoundingBox.x - 0.5 ||
        n.absoluteBoundingBox.x + n.absoluteBoundingBox.width >
          f.absoluteBoundingBox.x + f.absoluteBoundingBox.width + 0.5),
  );
  out.push({
    frame: f.name,
    width: Math.round(f.width),
    overflowing: bad.map((n) => ({
      name: n.name,
      id: n.id,
      w: Math.round(n.absoluteBoundingBox.width),
    })),
  });
}
return out;
```

Expected: `overflowing` empty for both, matching the audit method used on 2026-08-13.

- [ ] **Step 8: Pass-1 assembly audit**

Run the figma-verify Pass-1 script (`.claude/skills/figma-verify/SKILL.md` §Pass 1) over 📄 Pages. Expected: all eight frames have `hasHeader` and `hasFooter` true, `detached: 0`, and the Light/Dark background fills read `#f5ffe1` / `#1e1e1e`.

- [ ] **Step 9: Log and commit**

Record every finding with its verdict in `progress.md`. Commit only `progress.md` and any `named-debt.json` edit — the dumps stay untracked.

```bash
pnpm test
pnpm format:write
git add .specs/01_active/figma-responsive-architecture/progress.md scripts/figma/named-debt.json
git commit -m "docs(specs): figma-responsive-architecture — verification sweep"
```

---

### Task 15: Documentation, code-debt stubs, archive

**Files:**

- Modify (Figma): 📚 Design system page (`2545:671`)
- Modify: `.claude/skills/figma-verify/knowledge/figma-ds-file.md`
- Modify: `.claude/skills/design-expert/references/figma-variables-method.md:122-137`
- Create: `.specs/00_backlog/header-mobile-drawer.md`
- Create: `.specs/00_backlog/blog-serie-grid-3col.md`
- Delete: `.specs/00_backlog/figma-blog-mobile-sections.md`

**Interfaces:**

- Consumes: Task 4's style→variable mapping table, Task 12's unbound node ids, Task 14's verdicts.

- [ ] **Step 1: Document the accepted exceptions and the style mapping in Figma**

One `use_figma` write onto the 📚 Design system page. Two blocks:

1. **Responsive architecture** — the rule ("Numbers = tokens. Direction = variants."), the 18-variable table from Task 2, and the seven `breakpoint=`-axis masters.
2. **Accepted exceptions** — exactly three, no more: the three shadow images stay unbound (a fill rebind cannot reproduce a blur); the `Triangle` halo stays unbound (`HeroAnimation.astro:61` — Figma binds neither `blur-lg` nor `dark:opacity-30`); `HeroAnimation` visibility is a manual toggle on each Mobile master (Figma has no mode-driven boolean visibility).
3. **Style → variable mapping** — Task 4's table verbatim. This is the documented mitigation for the six ramps that lost their at-a-glance `Tailwind/text-*` traceability when their styles were detached so the font-size could bind.

- [ ] **Step 2: Update the figma-verify knowledge file**

In `.claude/skills/figma-verify/knowledge/figma-ds-file.md`:

- Replace the **Component masters** roster with Task 11 Step 4's actual count and list, marking the seven COMPONENT_SETs.
- Replace the **Responsive resolved values** table (currently 4 rows, with `container/gutter` 32/24/16 and `section/rhythm-y` 96/64/48 — both now wrong) with the 18-row table from Task 2, keeping the same Desktop/Tablet/Mobile column order.
- Add a **Change log** entry dated the execution date: 8 page frames → 4 masters + 4 dark instances; `3 Responsive` 4 → 18; seven masters given `breakpoint=Desktop|Mobile`; `ArchiveTable` → `PostArchiveList`; four `— Mobile` masters merged away; `HeaderDrawer` added.

- [ ] **Step 3: Correct the design-expert reference**

`.claude/skills/design-expert/references/figma-variables-method.md:122-137` opens "**Current project uses pattern 3.**" That is no longer true. Rewrite that paragraph:

```markdown
**Current project uses the Hybrid — pattern 1 for numbers, pattern 2 for
direction.** `3 Responsive` holds 18 variables: the four originals plus six
type ramps (`text/page-title`, `text/section-title`, `text/hero-title`,
`text/hero-body`, `text/nav-link`, `leading/hero-body`) and eight spacing
values (`header/*`, `footer/*`, `hero/text-gap`, `serie-list/gap`). Font-size
is bound directly on the text node via `setRangeBoundVariable` — the flat
`Tailwind/text-*` style is detached first, because a text style cannot bind to
a variable. Direction changes, which no variable type can express, ride a
`breakpoint=Desktop|Mobile` variant axis on the seven masters whose
`layoutMode` actually flips. Drift in the numbers is now structurally
prevented rather than merely detected by `figma:verify`; the axis switch stays
manual. Spec: `.specs/02_archives/figma-responsive-architecture/design.md`.
```

Note the spec path points at `02_archives/` — Step 6 archives the topic, so the link is correct once this lands.

- [ ] **Step 4: File the two code-debt stubs**

```bash
./.specs/specs.sh new header-mobile-drawer "Header: mobile hamburger and drawer"
./.specs/specs.sh new blog-serie-grid-3col "blog.astro: serie grid 2 -> 3 columns"
```

Then fill `.specs/00_backlog/header-mobile-drawer.md` under its frontmatter:

```markdown
`Header.astro` keeps the nav inline at every width and renders no brand element.
Figma leads here by explicit decision — `Header` has a `breakpoint=Mobile`
variant (brand wordmark left, hamburger right in a 44x44 target) plus a
`HeaderDrawer` master with `state=closed|open`.

Build the Astro side: toggle script, focus trap, `aria-expanded`, Escape to
close, `prefers-reduced-motion` respected on the drawer transition. The 44px
target is consistent with `.specs/00_backlog/figma-mobile-touch-targets.md`.

Source: `.specs/02_archives/figma-responsive-architecture/design.md` §6.1.
Size: M
```

And `.specs/00_backlog/blog-serie-grid-3col.md`:

```markdown
`blog.astro:55` is `grid gap-4 md:grid-cols-2 lg:gap-8`. Figma's `SerieCardList`
is 3 columns on Desktop and Tablet, 1 on Mobile (design §4 decision). Change
`md:grid-cols-2` to `md:grid-cols-3`.

At Tablet 768 with the 16px gutter and 16px gaps each card lands at ~234px for
a title plus a 3-line clamp — tight but viable, accepted in the design.

Source: `.specs/02_archives/figma-responsive-architecture/design.md` §6.2.
Size: XS
```

- [ ] **Step 5: Close the superseded backlog item**

Tasks 8 and 9 built exactly what `.specs/00_backlog/figma-blog-mobile-sections.md` asked for, by a better route: a `breakpoint` axis on `SerieCardList` and `PostArchiveList` instead of separate `— Mobile` masters.

```bash
git rm .specs/00_backlog/figma-blog-mobile-sections.md
./.specs/specs.sh index
```

- [ ] **Step 6: Archive the topic and commit**

```bash
./.specs/specs.sh archive figma-responsive-architecture
pnpm format:write
git add -A .specs .claude/skills/figma-verify/knowledge/figma-ds-file.md \
          .claude/skills/design-expert/references/figma-variables-method.md
git commit -m "docs(specs): archive figma-responsive-architecture — 18 responsive tokens, 4 page masters"
```

Note `.claude/skills/` may be gitignored in this repo — a prior commit needed `git add -f` to land skill files. If `git status` does not show the two skill edits after `git add`, re-add them with `-f`.

---

## Self-Review

Run against the design before executing.

**Spec coverage**

| Design section                                                                                                                   | Task                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| §1 frame inventory 8 → 4 + 4                                                                                                     | 13                                                                      |
| §1 no Tablet frames (prove by mode switch)                                                                                       | 14 Step 6                                                               |
| §1 documented reversal of the type-scale decision                                                                                | 4; documented in 15 Step 3                                              |
| §2 six type variables                                                                                                            | 2, 4                                                                    |
| §2 eight spacing variables                                                                                                       | 2, 5                                                                    |
| §2 corrected `container/gutter` and `section/rhythm-y`                                                                           | 2                                                                       |
| §2 page-level gaps stay frame-local                                                                                              | 13 (stated, deliberately not tokenised)                                 |
| §3 seven `breakpoint=` variant sets                                                                                              | 6 (2), 7 (2), 8 (1), 9 (1), 10 (1)                                      |
| §3 four masters deleted, behind the diff gate                                                                                    | 11, gated by 1 Gate B                                                   |
| §3 Header hamburger + `HeaderDrawer`                                                                                             | 10                                                                      |
| §3 illustrations — bind / unbind / hide                                                                                          | 12, 13 Step 3                                                           |
| §4 `ArchiveTable` → `PostArchiveList`                                                                                            | 8                                                                       |
| §4 `SerieCardList` stays 3 across                                                                                                | 9                                                                       |
| §5 per-page result                                                                                                               | 14 Steps 5–7                                                            |
| §6 two code-debt stubs                                                                                                           | 15 Step 4                                                               |
| §7 verification, all five items                                                                                                  | 14                                                                      |
| §8 risks — style/binding conflict, manual switching, section-merge gate, read-only instance `layoutMode`, axis-flip sizing remap | 4 Step 2; 13 Step 2; 1 Gate B → 11; Global Constraints; every flip step |

**Three corrections this plan makes to the design**

1. **§7's "`named-debt.json` must shrink net, with `leading/hero-body`'s three px values as the only addition"** — `named-debt.json`'s `accepted` array is keyed by node `id:kind` and diffed against a node walk, so a variable-level raw value can never match a hit and would show up forever as a "Stale named-debt entry". Task 3 Step 10 puts it in a sibling `variableDebt` array instead. The "shrink net" expectation stands.
2. **§7's "token diff must pass with the 18 Responsive variables present and correct"** — `figma:verify` structurally cannot check them: it only compares variables a `token-map.json` entry points at, and these have no CSS custom property behind them. Task 3 builds `figma:verify-responsive` to close that gap, plus an `orphanIgnore` list so the new variables don't bury the orphan section in ~50 lines of noise.
3. **§3's "33 masters → 29"** — that arithmetic omits the new `HeaderDrawer`, and the 33 comes from a 2026-08-06 roster. Task 11 Step 4 records the real number as `baseline − deleted + 1` rather than asserting 29.

**Placeholder scan** — the `<...>` markers in Tasks 5, 8, 10 and 12 are node ids that _must_ come from the preceding read step in the same task, never from this document; the Global Constraints forbid pasted ids. Every one is preceded by the read step that produces it. `Gate C work list master name` in Task 7 is resolved by Task 1. No step defers work to "later" or says "handle edge cases".

**Name consistency** — variant property is `breakpoint` (lowercase) with values `Desktop`/`Mobile` everywhere (Tasks 6, 7, 8, 9, 10, 11, 13). Drawer property is `state` with `closed`/`open` (Task 10). Variable names are identical across Task 2's write, Task 3's expectation JSON, Tasks 4/5/10's bindings, and Task 15's docs. `PostArchiveList` replaces `ArchiveTable` from Task 8 onward, including in Task 15's knowledge-file update.
