---
title: Phase 2 · Tasks 9–11 — work detail masters, about/*, verification gate
created: 2026-08-17
phase: 2 of 3
part: d of d
---

# Phase 2 · Tasks 9–11 — work detail masters, about/*, verification gate

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-2-components.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 9–11.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 9: `work/WorkHeader` and `work/RelatedWriting`

Mirrors `src/components/work/WorkHeader.astro` and `RelatedWriting.astro`.

**Files:**

- Create: masters `work/WorkHeader`, `work/RelatedWriting` in section `work`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `ui/H1`, `ui/PageDescription`, `ui/Link/external`, `ui/Icon`, `blog/PostRow`.
- Produces: `work/WorkHeader` (no variants), `work/RelatedWriting` (no variants). Phase 3's Work-detail master instances both.

- [ ] **Step 1: Build `work/WorkHeader`**

Per `WorkHeader.astro:12-49`: breadcrumb (`WORK` in the muted nav style + chevron) → H1 → abstract paragraph → a 3-row spec table (`TYPE` / `DATE` / `STACK`, label column ~64px semibold, bottom-bordered rows) → a wrapped row of external links (`Website`, `Demo`, `Code`, `Video`). Width is 2/3 of the container on `lg`.

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];

const inst = async (name) => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    const hit = p.findOne((x) => x.name === name);
    if (hit) return (hit.type === "COMPONENT_SET" ? hit.defaultVariant : hit).createInstance();
  }
  throw new Error(`${name} not found`);
};

const head = F("work/WorkHeader", "VERTICAL", { itemSpacing: 32 });
head.resize(832, 100); // 2/3 of the 1248 content band
head.layoutSizingHorizontal = "FIXED";
head.primaryAxisSizingMode = "AUTO";

const crumb = F("breadcrumb", "HORIZONTAL", { itemSpacing: 4 });
crumb.counterAxisAlignItems = "CENTER";
head.appendChild(crumb);
const crumbText = await T("WORK", { size: 16, fill: muted });
crumb.appendChild(crumbText);
crumb.appendChild(await inst("ui/Icon")); // chevron-right; set the icon prop in the follow-up call

const h1 = await inst("ui/H1");
head.appendChild(h1); h1.layoutSizingHorizontal = "FILL";

const abstract = await inst("ui/PageDescription");
head.appendChild(abstract); abstract.layoutSizingHorizontal = "FILL";

const table = F("spec-table", "VERTICAL", { itemSpacing: 0 });
head.appendChild(table); table.layoutSizingHorizontal = "FILL";
const ROWS = [["TYPE", "Web app"], ["DATE", "2026"], ["STACK", "Astro, TypeScript, Tailwind"]];
for (const [k, v] of ROWS) {
  const r = F(k.toLowerCase(), "HORIZONTAL", { itemSpacing: 16, paddingTop: 16, paddingBottom: 16 });
  r.strokeBottomWeight = 1;
  r.setBoundVariable("strokes", border);
  table.appendChild(r); r.layoutSizingHorizontal = "FILL";
  const kt = await T(k, { size: 16, weight: "SemiBold", fill: fg });
  kt.resize(64, kt.height);
  const vt = await T(v, { size: 16, fill: fg });
  r.appendChild(kt); r.appendChild(vt); vt.layoutSizingHorizontal = "FILL";
}

const links = F("links", "HORIZONTAL", { itemSpacing: 16 });
links.layoutWrap = "WRAP";
head.appendChild(links); links.layoutSizingHorizontal = "FILL";
for (const label of ["Website", "Demo", "Code", "Video"]) {
  const l = await inst("ui/Link/external");
  l.name = `link/${label}`;
  links.appendChild(l);
}
const master = figma.createComponentFromNode(head);
master.name = "work/WorkHeader";
const sectionId = await home(master, "work");
return {
  id: master.id, sectionId,
  instanceProps: master.findAll((n) => n.type === "INSTANCE").map((n) => ({
    name: n.name, props: Object.keys(n.componentProperties || {}),
  })),
};
```

Use the returned `instanceProps` to set each instance's text in a follow-up call (`inst.setProperties({...})` where the master exposes a text property, otherwise edit the nested TEXT node's `characters` after `loadFontAsync`). Real content: title `Le concept de la preuve`, abstract from `src/content/work/leconceptdelapreuve/index.md`.

- [ ] **Step 2: Build `work/RelatedWriting`**

Per `RelatedWriting.astro:14-23` with the Task-8 decision: uppercase muted label "Related writing" + a vertical stack of `blog/PostRow type=post` instances.

```js
const V = await VARS();
const muted = V["2 Theme::color/foreground-muted"];
const block = F("work/RelatedWriting", "VERTICAL", { itemSpacing: 16 });
block.resize(832, 100);
block.layoutSizingHorizontal = "FIXED";
block.primaryAxisSizingMode = "AUTO";

const label = await T("Related writing", { size: 14, weight: "Medium", fill: muted });
label.textCase = "UPPER";
block.appendChild(label);

const stack = F("rows", "VERTICAL", { itemSpacing: 0 });
block.appendChild(stack); stack.layoutSizingHorizontal = "FILL";

let row = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne((x) => x.name === "blog/PostRow");
  if (hit) { row = hit; break; }
}
if (!row) throw new Error("blog/PostRow not found");
const base =
  row.type === "COMPONENT_SET"
    ? row.children.find((c) => /type=post/.test(c.name)) || row.defaultVariant
    : row;
const made = [];
for (let i = 0; i < 2; i++) {
  const inst = base.createInstance();
  stack.appendChild(inst);
  inst.layoutSizingHorizontal = "FILL";
  made.push({ id: inst.id, props: Object.keys(inst.componentProperties || {}) });
}
const master = figma.createComponentFromNode(block);
master.name = "work/RelatedWriting";
const sectionId = await home(master, "work");
return { id: master.id, sectionId, made };
```

- [ ] **Step 3: Read back cold + screenshot**

Assert both masters contain only instances and layout frames — zero detached copies (`findAll(n => n.type === "COMPONENT")` inside a master must be empty). Screenshot both.

- [ ] **Step 4: Re-grid and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — work/WorkHeader + work/RelatedWriting rebuilt"
```

---

### Task 10: `about/*` — AboutText, AboutFacts, AboutFactsStrip

Mirrors the live import graph `about.astro → AboutText → AboutFacts | AboutFactsStrip` (`AboutText.astro:28` picks by `VARIANTS.aboutFacts`). The Figma equivalent of that runtime switch is a variant axis on `AboutText`.

**Files:**

- Create: masters `about/AboutFacts`, `about/AboutFactsStrip`, `about/AboutText` in section `about`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `ui/H1`, `ui/Prose`, `ui/Link/external`, `ui/Link/secondary`.
- Produces: `about/AboutText` with `facts=strip|grid`. Phase 3's About page master instances it, and nothing else.

- [ ] **Step 1: Build the two facts masters**

Per `AboutFactsStrip.astro` — one bordered strip (`border-y`, py 12), mono 14, muted, 4 facts as `value` (bold) + `label`, wrapping row. Per `AboutFacts.astro` — a 2/3/4-column grid, each cell `label` (muted 14) _below_ `value` (Bubbler One 30) via column-reverse.

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];
const FACTS = [
  ["2010", "coding since"],
  ["24", "articles published"],
  ["5000+", "Malinette downloads"],
  ["1000+", "people trained"],
];

// --- strip -------------------------------------------------------------
const strip = F("about/AboutFactsStrip", "HORIZONTAL", {
  itemSpacing: 24, paddingTop: 12, paddingBottom: 12,
});
strip.layoutWrap = "WRAP";
strip.counterAxisSpacing = 8;
strip.resize(832, 100);
strip.layoutSizingHorizontal = "FIXED";
strip.primaryAxisSizingMode = "AUTO";
strip.strokeTopWeight = 1;
strip.strokeBottomWeight = 1;
strip.setBoundVariable("strokes", border);
for (const [value, label] of FACTS) {
  const pair = F(`fact/${label}`, "HORIZONTAL", { itemSpacing: 8 });
  strip.appendChild(pair);
  pair.appendChild(await T(value, { size: 14, family: "Fira Code", weight: "Bold", fill: muted }));
  pair.appendChild(await T(label, { size: 14, family: "Fira Code", fill: muted }));
}
const stripMaster = figma.createComponentFromNode(strip);
stripMaster.name = "about/AboutFactsStrip";

// --- grid --------------------------------------------------------------
const grid = F("about/AboutFacts", "HORIZONTAL", { itemSpacing: 24 });
grid.layoutWrap = "WRAP";
grid.counterAxisSpacing = 24;
grid.resize(832, 100);
grid.layoutSizingHorizontal = "FIXED";
grid.primaryAxisSizingMode = "AUTO";
for (const [value, label] of FACTS) {
  const cell = F(`fact/${label}`, "VERTICAL", { itemSpacing: 4 });
  grid.appendChild(cell);
  cell.appendChild(await T(value, { size: 30, family: "Bubbler One", fill: fg }));
  cell.appendChild(await T(label, { size: 14, fill: muted }));
  cell.resize(184, cell.height); // 4 columns inside 832 with 24 gaps
}
const gridMaster = figma.createComponentFromNode(grid);
gridMaster.name = "about/AboutFacts";

const s1 = await home(stripMaster, "about");
await home(gridMaster, "about");
return { stripId: stripMaster.id, gridId: gridMaster.id, sectionId: s1 };
```

Note the reversed visual order in the grid (value above label) — code writes `dt` then `dd` with `flex-col-reverse`. Figma has no reverse, so the nodes are authored in visual order. Record that in `progress.md` as an intentional structural difference, not drift.

- [ ] **Step 2: Build `about/AboutText` with a `facts` axis**

Per `AboutText.astro:11-93`, in order: H1 "About" → lead paragraph (Bubbler One 30, balanced) → Prose block 1 → facts (strip **or** grid) → `Download CV` external link → Prose block 2 → two secondary links (`See the work`, `Read the writing`). Column is 2/3 width on `lg`, gap 24 (32 at `sm`).

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const inst = async (name, variantMatch) => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    const hit = p.findOne((x) => x.name === name);
    if (!hit) continue;
    const base =
      hit.type === "COMPONENT_SET"
        ? (variantMatch ? hit.children.find((c) => variantMatch.test(c.name)) : null) || hit.defaultVariant
        : hit;
    return base.createInstance();
  }
  throw new Error(`${name} not found`);
};

const build = async (factsVariant) => {
  const col = F(`facts=${factsVariant}`, "VERTICAL", { itemSpacing: 32 });
  col.resize(832, 100);
  col.layoutSizingHorizontal = "FIXED";
  col.primaryAxisSizingMode = "AUTO";

  const h1 = await inst("ui/H1");
  col.appendChild(h1); h1.layoutSizingHorizontal = "FILL";

  const lead = await T(
    "Artist turned web developer — I build things meant to be used, not just seen.",
    { size: 30, family: "Bubbler One", fill: fg });
  col.appendChild(lead); lead.layoutSizingHorizontal = "FILL";

  const prose1 = await inst("ui/Prose");
  col.appendChild(prose1); prose1.layoutSizingHorizontal = "FILL";

  const facts = await inst(factsVariant === "strip" ? "about/AboutFactsStrip" : "about/AboutFacts");
  col.appendChild(facts); facts.layoutSizingHorizontal = "FILL";

  const cv = await inst("ui/Link/external");
  cv.name = "link/Download CV";
  col.appendChild(cv);

  const prose2 = await inst("ui/Prose");
  col.appendChild(prose2); prose2.layoutSizingHorizontal = "FILL";

  const ctas = F("ctas", "HORIZONTAL", { itemSpacing: 16 });
  col.appendChild(ctas); ctas.layoutSizingHorizontal = "FILL";
  for (const label of ["See the work", "Read the writing"]) {
    const l = await inst("ui/Link/secondary");
    l.name = `link/${label}`;
    ctas.appendChild(l);
  }
  return figma.createComponentFromNode(col);
};

const stripV = await build("strip");
const gridV = await build("grid");
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
page.appendChild(stripV); page.appendChild(gridV);
const set = figma.combineAsVariants([stripV, gridV], page);
set.name = "about/AboutText";
const sectionId = await home(set, "about");
return { setId: set.id, sectionId, properties: set.variantGroupProperties };
```

- [ ] **Step 3: Fill the real copy into the two Prose instances**

Prose block 1 and block 2 carry the live About copy (`AboutText.astro:18-25` and `:38-77`). Override the instances' text nodes with the real French/English strings from those lines — the paragraph lengths are what make the column width honest. Do not paraphrase and do not shorten; if a string must be trimmed to fit, that is a finding for the copy owner, recorded in `progress.md`.

- [ ] **Step 4: Read back cold + screenshot both variants**

Assert `facts=strip` contains an instance of `about/AboutFactsStrip` and `facts=grid` an instance of `about/AboutFacts` (via `getMainComponentAsync()`), and that both variants have identical child counts otherwise.

- [ ] **Step 5: Re-grid and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — about/* masters built (Figma)"
```

---

### Task 11: Phase-2 verification gate

**Files:**

- Modify: `.specs/01_active/magnet-ds-final-state/inventory.md` (append §Phase-2-after)
- Modify: `.claude/skills/figma-verify/knowledge/figma-ds-file.md`
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Produces: the verified component roster phase 3 assembles pages from.

- [ ] **Step 1: Full roster re-read and assertions**

Re-run Task 1 Step 2. Assert:

- every name in `TO_BUILD` is now present, in the right section
- `legacy` is empty (`WorkCardPreviewSmall` now lives on 🗄️ Archives, which the walk skips)
- ❖ Components master count = 32 (phase-1 end) + 14 built here − 0 = **46**; plus 11 `_Docs/*` and 4 page masters = 61 total. A different number is a finding: name it in `progress.md` before proceeding.
- Gate D (overlaps, strays) empty

- [ ] **Step 2: Prove no master contains a detached copy**

```js
figma.skipInvisibleInstanceChildren = true;
const bad = [];
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
for (const m of page.findAll(
  (x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET",
)) {
  if (m.parent && m.parent.type === "COMPONENT_SET") continue;
  for (const n of m.findAll(() => true)) {
    if (n.type === "COMPONENT" && n !== m && n.parent !== m.parent)
      bad.push({ master: m.name, nested: n.name });
  }
}
return bad;
```

Empty. A COMPONENT nested inside another master means a build used `createComponentFromNode` on a subtree that should have stayed a frame.

- [ ] **Step 3: Tokenization gate**

Fresh Figma **File > Export**, then:

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig
pnpm figma:verify
pnpm figma:verify-raw
```

Every raw value the 14 new masters introduced must already be in `named-debt.json` with a reason (each build task was supposed to add its own). Anything in "New raw values" that is _not_ deliberate is a defect — bind it now.

- [ ] **Step 4: Canvas-hygiene screenshot sweep**

`get_screenshot` all 7 sections. Every new master visible, unclipped, on the grid, in its domain. The `about` section is no longer empty.

- [ ] **Step 5: Update the knowledge file**

Add the 14 masters to the roster with live ids and a change-log entry:

```markdown
- YYYY-MM-DD — Magnet-DS final state, phase 2 (component masters)
  (`.specs/01_active/magnet-ds-final-state/plan-2-components.md`). Built
  `ui/Link/external`, `ui/Prose`, `ui/SocialShare`, `work/WorkCard`
  (catalogue + case, absorbing `WorkCardPreviewSmall` → archived),
  `work/ArchiveTable`, `contact/ContactPreview` mobile variant, the six
  detail rebuilds (`blog/TableOfContents`, `blog/SerieContents`,
  `blog/PostNav`, `blog/RelatedWork`, `work/WorkHeader`,
  `work/RelatedWriting`) and `about/AboutText` (+ `AboutFacts`,
  `AboutFactsStrip`). Fifth decision record `related-block-children` added.
  Master roster re-counted live: <n>.
```

- [ ] **Step 6: Format and commit**

```bash
pnpm format:write
git add .claude/skills/figma-verify/knowledge/figma-ds-file.md \
        .specs/01_active/magnet-ds-final-state/inventory.md \
        .specs/01_active/magnet-ds-final-state/progress.md \
        scripts/figma/named-debt.json
git commit -m "docs(figma): magnet-ds phase 2 verified — 14 new component masters"
```

- [ ] **Step 7: Hand off to phase 3**

Phase 2 is done when all 14 masters exist in their domain sections, no master nests a detached component, `figma:verify-raw` shows no undocumented raw values, and the hygiene sweep is clean. Start `plan-3-pages.md`.
