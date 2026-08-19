---
title: Phase 1 · Tasks 1–2 — inventory, gates, Decisions page
created: 2026-08-17
phase: 1 of 3
part: a of d
---

# Phase 1 · Tasks 1–2 — inventory, gates, Decisions page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-1-foundations.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 1–2.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 1: Live inventory and the four gates

Nothing else in this plan may start first. The spec was written against a 2026-08-15 roster; four of its instructions depend on facts that must be re-read live, because each one can change the task list.

**Files:**

- Create: `.specs/01_active/magnet-ds-final-state/inventory.md`
- Create: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Produces: `inventory.md` §Pages, §Masters (name → id → page → section → type), §Primitives-audit, §Theme-audit, §Gate A–D verdicts. Tasks 2–9 and both later phases resolve every target by name from §Masters.

- [ ] **Step 1: Load the Figma Plugin API rules**

Run the `/figma-use` skill. Mandatory once per session — the batching and read-back rules in it are what keep the write tasks from corrupting masters.

- [ ] **Step 2: Run the Pass-0 inventory + all four gates as ONE batched `use_figma` call**

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
      x: Math.round(node.x),
      y: Math.round(node.y),
      w: Math.round(node.width),
      h: Math.round(node.height),
    });
  if (node.type === "COMPONENT_SET") return;
  if ("children" in node) for (const c of node.children) walk(c, page);
}
for (const p of figma.root.children) {
  await p.loadAsync(); // NOT loadAllPagesAsync
  pages.push({
    name: p.name,
    id: p.id,
    childCount: p.children.length,
    topLevel: p.children.map((c) => `${c.type}:${c.name}`),
  });
  for (const c of p.children) walk(c, p);
}

// --- Variables: both collections under audit ---------------------------
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const dumpCollection = async (colName) => {
  const col = cols.find((c) => c.name === colName);
  if (!col) return null;
  const out = [];
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const byMode = {};
    for (const m of col.modes) {
      let val = v.valuesByMode[m.modeId];
      byMode[m.name] =
        val && val.type === "VARIABLE_ALIAS"
          ? {
              alias: (await figma.variables.getVariableByIdAsync(val.id)).name,
            }
          : { value: val };
    }
    out.push({
      name: v.name,
      id: v.id,
      type: v.resolvedType,
      byMode,
      // consumers: which other variables alias this one
      scopes: v.scopes,
    });
  }
  return { id: col.id, modes: col.modes.map((m) => m.name), vars: out };
};
const primitives = await dumpCollection("1 Primitives");
const theme = await dumpCollection("2 Theme");

// --- Gate A: alias graph — which primitives are referenced at all -------
const referenced = new Set();
for (const colName of ["2 Theme", "3 Responsive"]) {
  const col = cols.find((c) => c.name === colName);
  if (!col) continue;
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const m of col.modes) {
      const val = v.valuesByMode[m.modeId];
      if (val && val.type === "VARIABLE_ALIAS") referenced.add(val.id);
    }
  }
}
const PRUNE = ["mauve", "mist", "olive", "taupe"];
const gateA = (primitives ? primitives.vars : [])
  .filter((v) => PRUNE.some((p) => v.name.toLowerCase().includes(p)))
  .map((v) => ({ name: v.name, id: v.id, referenced: referenced.has(v.id) }));

// --- Gate B: are the three merge sources still separate masters? -------
const gateB = [
  "NavLink",
  "NavLinkHome",
  "PostCardPreviewBig",
  "PostCardPreviewSmall",
  "Link/CTA",
  "Link/Secondary",
  "Link/SecondarySm",
  "Link/TextCTA",
  "Link/Icon",
].map((n) => {
  const hit = components.find((c) => c.name === n);
  return hit
    ? { name: n, id: hit.id, type: hit.type, page: hit.page }
    : { name: n, missing: true };
});

// --- Gate C: current container geometry on the two 32px suspects -------
const gateC = [];
for (const name of ["Header", "ContactPreviewSection"]) {
  const hit = components.find((c) => c.name === name);
  if (!hit) {
    gateC.push({ name, missing: true });
    continue;
  }
  const n = await figma.getNodeByIdAsync(hit.id);
  const frames = n.type === "COMPONENT_SET" ? n.children : [n];
  gateC.push({
    name,
    id: hit.id,
    variants: frames.map((f) => ({
      variant: f.name,
      paddingLeft: f.paddingLeft,
      paddingRight: f.paddingRight,
      boundVariables: Object.keys(f.boundVariables || {}),
      width: Math.round(f.width),
      children: f.children.map((c) => `${c.type}:${c.name}`),
    })),
  });
}

// --- Gate D: canvas hygiene — overlapping or section-less masters ------
const overlaps = [];
for (let i = 0; i < components.length; i++)
  for (let j = i + 1; j < components.length; j++) {
    const a = components[i],
      b = components[j];
    if (a.page !== b.page) continue;
    if (
      a.x < b.x + b.w &&
      b.x < a.x + a.w &&
      a.y < b.y + b.h &&
      b.y < a.y + a.h
    )
      overlaps.push([a.name, b.name]);
  }
const gateD = {
  overlaps,
  strays: components
    .filter((c) => c.section === "(top)" && c.page === "❖ Components")
    .map((c) => c.name),
};

return {
  pages,
  componentCount: components.length,
  components,
  primitiveCount: primitives ? primitives.vars.length : 0,
  themeVars: theme,
  gateA,
  gateB,
  gateC,
  gateD,
};
```

- [ ] **Step 3: Write `inventory.md` from the return value**

Record verbatim — do not summarise away IDs:

1. **§Pages** — name, id, childCount, top-level child list.
2. **§Masters** — the full `components` array as a markdown table (name / id / page / section / type), sorted by page then section then name, with the total count. The knowledge file says 49 total (11 `_Docs/*` + 34 components + 4 page masters); any other number is a finding, written down, not silently accepted.
3. **§Primitives-audit** — `primitiveCount`, plus the Gate A table.
4. **§Theme-audit** — all `2 Theme` variables with their per-mode value/alias (the knowledge file says 15).
5. **§Gate A — prune safety.** Any `mauve/mist/olive/taupe` variable with `referenced: true` is **not** a free delete: it is aliased by `2 Theme` or `3 Responsive`. Record it as BLOCKED and name the referencing variable; Task 3 rebinds before pruning. `referenced: false` rows are PRUNE-SAFE.
6. **§Gate B — merge sources.** Any `missing: true` row means the spec's merge list is stale for that pair; record it and drop the corresponding merge from Task 7 rather than inventing a target.
7. **§Gate C — container debt.** Record the actual `paddingLeft`/`paddingRight` per variant of `Header` and `ContactPreviewSection` and whether they are bound. If both already read 16 and are bound to `container/gutter`, Task 8 becomes a no-op verification — record that verdict explicitly.
8. **§Gate D — hygiene baseline.** The overlap pairs and the stray (section-less) masters. This is the "before" list; Task 6 must empty it.

- [ ] **Step 4: Create the progress log**

```markdown
# Magnet-DS final state — execution log

Figma edits are not versioned. One entry per task across all three phases:
what was written, what was read back to prove it, and any deviation from the
plan.

## Phase 1 · Task 1 — inventory and gates (YYYY-MM-DD)

- Pages found: <n> (expected 5 + archives)
- Masters found: <n> (knowledge-file roster said 49 on 2026-08-15)
- Gate A: <prune-safe / blocked counts>
- Gate B: <present / missing per merge source>
- Gate C: Header <px, bound?> · ContactPreviewSection <px, bound?>
- Gate D: <overlap pairs>, <stray masters>
```

- [ ] **Step 5: Sanity-check the inventory against the spec's assumptions**

Confirm every one of these names exists in §Masters: `Header`, `Footer`, `NavLink`, `NavLinkHome`, `HeaderDrawer`, `ThemeToggle`, `MotionToggle`, `Icon`, `Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/TextCTA`, `Link/Icon`, `H1`, `H2`, `PreviewTitle`, `PageDescription`, `Hero`, `HeroText`, `HeroAnimation`, `BlogPreviewSection`, `WorkPreviewSection`, `ContactPreviewSection`, `ContactContent`, `PostArchiveList`, `SerieCardList`, `PostCardPreviewBig`, `PostCardPreviewSmall`, `PostRow`, `SerieCard`, `PostMetadataTime`, `PostMetadataTopic`, `SerieMeta`, `WorkCardPreviewSmall`.

Also confirm these are **absent** (the spec says they were pruned and are 🆕 rebuilds in phase 2): `TableOfContents`, `SerieContents`, `LinkNavPost`, `RelatedWork`, `WorkHeader`, `RelatedWriting`.

Any miss on either list is a STOP: report it and do not proceed to Task 2. A missing name means the spec was written against a stale roster; a _present_ name in the second list means phase 2 has a rename, not a rebuild, and the spec needs correcting first.

- [ ] **Step 6: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/inventory.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — live inventory and gate verdicts"
```

---

### Task 2: 📐 Decisions page with four records

The live `📐 Decisions` page id (`2716:4244`) is a hint; the spec calls for a **fresh** page. The prior round lives in `🗄️ Archive — Decisions` and is untouchable. This task creates (or reuses, if a fresh empty one already exists) the working Decisions page and fills it with the four records the spec names.

**Files:**

- Create: Figma page `📐 Decisions` with 4 `_Docs/DecisionCard` instances
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Masters (`_Docs/DecisionCard`, `_Docs/Date`, `_Docs/Status`, `_Docs/ChapterHeader` ids), §Pages.
- Produces: four decision records addressable by title — `container-16`, `naming-domain-component`, `dark-instances`, `docs-decisions-boundary`. Task 8 and phase 3's Docs task link to these by title, never restate their rationale.

- [ ] **Step 1: Confirm the archive page is not the target**

Re-read §Pages from `inventory.md`. If a page named `📐 Decisions` exists and contains the prior round's cards, do **not** edit it — the spec's step 1 says the prior round is archived. In that case rename nothing; instead check whether `🗄️ Archive — Decisions` already holds those cards. If the prior round is _only_ on `📐 Decisions` and not in the archive, STOP and report: the archive move is a precondition this plan assumes is done, and moving someone's decision history is not a call to make silently.

- [ ] **Step 2: Create the page and its column frame**

```js
const existing = figma.root.children.find((p) => p.name === "📐 Decisions");
const page = existing || figma.createPage();
page.name = "📐 Decisions";
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const col = figma.createAutoLayout("VERTICAL", {
  name: "Records",
  itemSpacing: 48,
  paddingLeft: 80,
  paddingRight: 80,
  paddingTop: 80,
  paddingBottom: 80,
});
col.x = 0;
col.y = 0;
col.layoutSizingHorizontal = "FIXED";
col.resize(1200, 100);
col.primaryAxisSizingMode = "AUTO";
page.appendChild(col);

return { pageId: page.id, colId: col.id, existed: !!existing };
```

- [ ] **Step 3: Place four `_Docs/DecisionCard` instances**

```js
const page = figma.root.children.find((p) => p.name === "📐 Decisions");
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const col = page.findOne((n) => n.name === "Records");

let card = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne(
    (x) =>
      (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
      x.name === "_Docs/DecisionCard",
  );
  if (hit) {
    card = hit;
    break;
  }
}
if (!card) throw new Error("_Docs/DecisionCard master not found");

const master = card.type === "COMPONENT_SET" ? card.defaultVariant : card;
const TITLES = [
  "container-16",
  "naming-domain-component",
  "dark-instances",
  "docs-decisions-boundary",
];
const made = [];
for (const t of TITLES) {
  const inst = master.createInstance();
  inst.name = `DECISION / ${t}`;
  col.appendChild(inst);
  inst.layoutSizingHorizontal = "FILL";
  made.push({ title: t, id: inst.id });
}
return {
  made,
  cardProps: master.componentPropertyDefinitions
    ? Object.keys(master.componentPropertyDefinitions)
    : [],
  textLayers: made.length
    ? (await figma.getNodeByIdAsync(made[0].id))
        .findAll((n) => n.type === "TEXT")
        .map((n) => ({ name: n.name, chars: n.characters }))
    : [],
};
```

The return tells you how the card is filled: if `cardProps` lists text properties, fill via `inst.setProperties({...})`; if it is empty, the card's TEXT layers are edited directly (`node.characters = "…"` after `await figma.loadFontAsync(node.fontName)`).

- [ ] **Step 4: Write the four records' copy**

Each record is dated `2026-08-17` (the design's decision date), status `Accepted`. Use exactly this content — these are the four decisions the spec locked, and Docs will link to them rather than restate them:

**`container-16` — One container recipe**

> **Decision:** Every container in the system is pad-x 16 / max-w 1280 / centered. No 32px exception anywhere.
> **Why:** Two recipes existed only because Header and ContactPreviewSection were built before `3 Responsive/container/gutter` existed. Code already ships one recipe (`@utility container` in `src/styles/global.css`), so the second recipe was pure drift — it made every page-level pixel diff ambiguous.
> **Consequences:** Header and ContactPreviewSection re-bind padding to `container/gutter`. Nested components never own a container. Document-type pages own the container once, on `PageContent`.

**`naming-domain-component` — Canonical names are `domain/Component`**

> **Decision:** Every master is named `domain/Component`, where domain is the lowercase code folder (`app`, `ui`, `blog`, `work`, `hero`, `contact`, `about`). Leaf names are PascalCase, globally unique, and carry no role suffix — `Big`, `Small`, `Section` become variant axes.
> **Why:** A Figma name that maps 1:1 to a code path makes drift visible without a mapping table. Suffixes encoded variants in the name, so a merge could not be expressed without a rename.
> **Consequences:** Domains are feature areas, never pages — Home is a composition, so there is no `home/` domain. Exception: `Preview` in `BlogPreview` / `WorkPreview` / `ContactPreview` is a semantic role (the Home teaser of its domain), not a size axis, and stays in the name. Code converges later via the code-debt list.

**`dark-instances` — Dark views stay instance frames**

> **Decision:** Each page master keeps a `[Dark]` instance frame beside it, with `2 Theme` pinned to Dark. No mode-only strategy, no duplicated dark masters.
> **Why:** A Dark instance inherits its Light master's structure and height exactly, which makes theme drift structurally impossible; the earlier duplicate-frame approach drifted on every edit.
> **Consequences:** 📄 Pages holds 4 frames per route (Desktop · Mobile · Desktop [Dark] · Mobile [Dark]). Dark frames are never edited directly — fixes go to the Light master.

**`docs-decisions-boundary` — Docs = what, Decisions = why**

> **Decision:** 📚 Docs holds current-state reference only (token tables, breakpoint table, container recipe, usage rules), edited in place. 📐 Decisions holds dated, append-only rationale. Any normative table lives in exactly one page; links point Docs → Decisions only.
> **Why:** Rationale duplicated into Docs went stale silently, because Docs is edited in place and has no history. Superseded decisions must remain readable, which only append-only storage gives.
> **Consequences:** Superseded records get a `superseded by →` stamp, never an edit. The "accepted exceptions" rationale moves out of the Responsive Architecture doc into a record; the exception _list_ stays in Docs.

- [ ] **Step 5: Read back cold**

Fresh `use_figma` call: load the page, list every instance name and the first text line of each card. Confirm 4 records, correct titles, no empty card. Confirm `🗄️ Archive — Decisions` still has the same child count as in `inventory.md` §Pages — the archive must be byte-identical before and after.

- [ ] **Step 6: Log and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Decisions page with 4 records (Figma)"
```
