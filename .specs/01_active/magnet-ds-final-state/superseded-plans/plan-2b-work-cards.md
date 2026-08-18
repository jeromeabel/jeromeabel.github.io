---
title: Phase 2 · Tasks 4–5 — work/WorkCard and work/ArchiveTable
created: 2026-08-17
phase: 2 of 3
part: b of d
---

# Phase 2 · Tasks 4–5 — work/WorkCard and work/ArchiveTable

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-2-components.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 4–5.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 4: `work/WorkCard` — catalogue and case

The single most specified component in the system. Anatomy is **owned** by `.specs/01_active/TODO - WorkCard — final spec (post-exploration round).md` §2 — read it before writing anything; this task does not restate the rationale, only the build.

**Files:**

- Create: master `work/WorkCard` (COMPONENT_SET) in section `work`
- Modify: `progress.md`, `scripts/figma/named-debt.json` (if any raw value survives)

**Interfaces:**

- Consumes: `ui/Link/external`, `ui/Icon`.
- Produces: `work/WorkCard` with `variant=catalogue|case` × `state=default|hover` × `side=left|right`. Task 8 and phase 3 (Home `work/WorkPreview`, `/work` Selected zigzag) instance it.

- [ ] **Step 1: Read the absorbed source**

`WorkCardPreviewSmall` is the live master that becomes the `catalogue` base. Read its geometry and bound variables first — the absorb must keep its tokens, not re-guess them.

```js
for (const p of figma.root.children) {
  await p.loadAsync();
  const n = p.findOne((x) => x.name === "WorkCardPreviewSmall");
  if (!n) continue;
  return {
    id: n.id, page: p.name,
    w: Math.round(n.width), h: Math.round(n.height),
    bound: Object.keys(n.boundVariables || {}),
    tree: n.findAll(() => true).slice(0, 40).map((c) =>
      `${c.type}:${c.name}` + ("characters" in c ? ` "${c.characters}"` : "")),
  };
}
return { missing: true };
```

- [ ] **Step 2: Build the `catalogue` variant**

Top to bottom per the WorkCard spec §2: hairline → index row (`01` mono muted left, `↗` muted right) → 16:9 cover, radius 8, borderless → title (Plex SemiBold ~17) → kicker (`WEB APP · 2026`, Fira Code uppercase muted, letterspaced) → meta rail (hairline, `Vue · TypeScript · Kotlin` mono muted, then `↗ Live` / `↗ Repo`). No description, no date, no read-time, no chip.

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];
const surface = V["2 Theme::color/surface"];

const card = F("catalogue", "VERTICAL", { itemSpacing: 12 });
card.resize(395, 100);
card.layoutSizingHorizontal = "FIXED";
card.primaryAxisSizingMode = "AUTO";

const hairline = (name) => {
  const l = figma.createRectangle();
  l.name = name; l.resize(395, 1);
  l.setBoundVariable("fills", border);
  return l;
};
const topRule = hairline("hairline-top");
card.appendChild(topRule); topRule.layoutSizingHorizontal = "FILL";

const indexRow = F("index", "HORIZONTAL", { itemSpacing: 8 });
indexRow.primaryAxisAlignItems = "SPACE_BETWEEN";
card.appendChild(indexRow); indexRow.layoutSizingHorizontal = "FILL";
const num = await T("01", { size: 12, family: "Fira Code", fill: muted });
const ext = await T("↗", { size: 12, family: "Fira Code", fill: muted });
indexRow.appendChild(num); indexRow.appendChild(ext);

const cover = figma.createRectangle();
cover.name = "WorkCardImage";
cover.resize(395, 222); // 16:9
cover.cornerRadius = 8;
cover.setBoundVariable("fills", surface);
card.appendChild(cover); cover.layoutSizingHorizontal = "FILL";

const title = await T("Malinette", { size: 17, weight: "SemiBold", fill: fg });
card.appendChild(title); title.layoutSizingHorizontal = "FILL";

const kicker = await T("FRAMEWORK · 2013–2019", { size: 12, family: "Fira Code", fill: muted });
kicker.letterSpacing = { unit: "PERCENT", value: 4 };
card.appendChild(kicker); kicker.layoutSizingHorizontal = "FILL";

const railRule = hairline("hairline-meta");
card.appendChild(railRule); railRule.layoutSizingHorizontal = "FILL";

const rail = F("meta-rail", "HORIZONTAL", { itemSpacing: 16 });
card.appendChild(rail); rail.layoutSizingHorizontal = "FILL";
const stack = await T("Pure Data · Arduino · Python", { size: 12, family: "Fira Code", fill: muted });
rail.appendChild(stack);
const links = F("artifacts", "HORIZONTAL", { itemSpacing: 12 });
rail.appendChild(links);
for (const l of ["↗ Live", "↗ Repo"]) {
  const t = await T(l, { size: 12, family: "Fira Code", fill: fg });
  links.appendChild(t);
}

return { catalogueId: card.id, height: Math.round(card.height) };
```

The cover is a rectangle bound to `surface`, named `WorkCardImage` — code's `WorkCardImage.astro` is a behavior wrapper (LQIP, fade-in) with no visual of its own, the same treatment as `ui/CustomImage`. Do not build a separate master for it unless Step 1 showed the live source already had one.

- [ ] **Step 3: Build the `case` variant**

Per WorkCard spec §2: 16:9 cover ~500px one side, text column the other, hairline between rows, no number. Text column: kicker → title (Plex SemiBold ~21) → three labeled rows `PROBLEM` / `SOLUTION` / `LEARNING` (mono 10 muted label, one sentence Plex 400 ~13.5) → link row.

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];
const surface = V["2 Theme::color/surface"];

const row = F("case", "HORIZONTAL", { itemSpacing: 48 });
row.resize(1248, 100);
row.layoutSizingHorizontal = "FIXED";
row.counterAxisSizingMode = "AUTO";

const cover = figma.createRectangle();
cover.name = "WorkCardImage";
cover.resize(500, 281);
cover.cornerRadius = 8;
cover.setBoundVariable("fills", surface);
row.appendChild(cover);

const col = F("text", "VERTICAL", { itemSpacing: 16 });
row.appendChild(col); col.layoutSizingHorizontal = "FILL";

const kicker = await T("WEB APP · 2026", { size: 12, family: "Fira Code", fill: muted });
kicker.letterSpacing = { unit: "PERCENT", value: 4 };
col.appendChild(kicker);
const title = await T("Le concept de la preuve", { size: 21, weight: "SemiBold", fill: fg });
col.appendChild(title); title.layoutSizingHorizontal = "FILL";

const PSL = [
  ["PROBLEM", "Les archives du projet vivaient dans des fichiers dispersés, illisibles pour un visiteur."],
  ["SOLUTION", "Un site statique qui rejoue la chronologie du projet à partir du contenu source."],
  ["LEARNING", "La documentation est le produit."],
];
for (const [label, sentence] of PSL) {
  const block = F(label.toLowerCase(), "VERTICAL", { itemSpacing: 4 });
  col.appendChild(block); block.layoutSizingHorizontal = "FILL";
  const l = await T(label, { size: 10, family: "Fira Code", fill: muted });
  l.letterSpacing = { unit: "PERCENT", value: 6 };
  block.appendChild(l);
  const s = await T(sentence, { size: 13.5, fill: fg });
  block.appendChild(s); s.layoutSizingHorizontal = "FILL";
}

const linkRow = F("links", "HORIZONTAL", { itemSpacing: 16 });
col.appendChild(linkRow);
for (const l of ["2 articles →", "↗ Live"]) {
  const t = await T(l, { size: 12, family: "Fira Code", fill: fg });
  linkRow.appendChild(t);
}
return { caseId: row.id, height: Math.round(row.height) };
```

- [ ] **Step 4: Combine into one set with `state` and `side` axes**

Hover per WorkCard spec §2: **one verb** — title underline + cover scale ≤2%, coupled, ~140ms ease-out. Never dim the cover, never accent the title, nothing hover-revealed.

The `side` axis exists because `/work` Selected alternates the cover left/right per row (WorkCard spec §2) and an _instance_ cannot reorder its master's children — no auto-layout reversal exists in the API. Figma requires every variant in a set to declare every axis, so the catalogue variants carry `side=left` and ignore it; that is documented in Step 5's annotation.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const cat = page.findOne((n) => n.name === "catalogue");
const cas = page.findOne((n) => n.name === "case");
const mk = (node, variant, state, side) => {
  const c = node.type === "COMPONENT" ? node : figma.createComponentFromNode(node);
  c.name = `variant=${variant}, state=${state}, side=${side}`;
  return c;
};
const applyHover = (c) => {
  const t = c.findOne((n) => n.type === "TEXT" && n.fontSize >= 17);
  if (t) t.textDecoration = "UNDERLINE";
  const img = c.findOne((n) => n.name === "WorkCardImage");
  if (img) img.rescale(1.02);
};
const flipSide = (c) => {
  const img = c.findOne((n) => n.name === "WorkCardImage");
  c.insertChild(c.children.length, img); // cover moves to the end → right side
};

const variants = [];
const catBase = mk(cat, "catalogue", "default", "left");
variants.push(catBase);
const catHover = mk(catBase.clone(), "catalogue", "hover", "left");
applyHover(catHover);
variants.push(catHover);
// catalogue is a single-column stack — side is inert, but the axis must be complete.
for (const state of ["default", "hover"]) {
  const src = variants.find((v) => v.name === `variant=catalogue, state=${state}, side=left`);
  variants.push(mk(src.clone(), "catalogue", state, "right"));
}

const casBase = mk(cas, "case", "default", "left");
variants.push(casBase);
const casHover = mk(casBase.clone(), "case", "hover", "left");
applyHover(casHover);
variants.push(casHover);
for (const state of ["default", "hover"]) {
  const src = variants.find((v) => v.name === `variant=case, state=${state}, side=left`);
  const right = mk(src.clone(), "case", state, "right");
  flipSide(right);
  variants.push(right);
}

for (const v of variants) page.appendChild(v);
const set = figma.combineAsVariants(variants, page);
set.name = "work/WorkCard";
const sectionId = await home(set, "work");
return {
  setId: set.id, sectionId,
  properties: set.variantGroupProperties,
  variants: set.children.map((c) => c.name),
};
```

`variants` must come back with 8 names and `properties` with three keys (`variant`, `state`, `side`).

`rescale` changes the child's size inside a HUG parent — check the read-back for a card that grew. If it did, wrap the cover in a fixed-size `clip content` frame and scale inside it instead; the card's outer bounds must be identical between `default` and `hover`, or the /work zigzag will jitter on hover.

- [ ] **Step 5: Add the motion annotation**

Hover timing is not expressible as a variant. Add a text annotation node beside the set (not inside it), two lines:

```
hover: title underline + cover scale 1.02, coupled, 140ms ease-out. Reduced motion: underline only.
side=left|right places the cover; it applies to variant=case only (the /work zigzag) and is inert on catalogue.
```

Phase 3's Motion doc links to the first line.

- [ ] **Step 6: Read back cold, screenshot all four variants, archive the source**

`get_screenshot` the set. Check against the WorkCard spec §5 Do/Don't: borderless, hairline top edge, mono tabular numeral ≤12px muted, no description/date/chip, no scrim, no overlay text, one ratio (16:9).

Then archive `WorkCardPreviewSmall`: move it to the `🗄️ Archives` page (create a section `Archive — absorbed masters` if none exists), never delete. Record its id in `progress.md`.

- [ ] **Step 7: Re-grid, verify raw values, commit**

```bash
pnpm figma:verify-raw
git add scripts/figma/named-debt.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): work/WorkCard catalogue + case variants"
```

---

### Task 5: `work/ArchiveTable`

Mirrors `src/components/work/ArchiveTable.astro`. Five columns on desktop — `Year | Project | Type | Built with | Link` — with `Type` hidden below `sm` and `Built with` hidden below `md`, so the Mobile variant is three columns.

**Files:**

- Create: master `work/ArchiveTable` (COMPONENT_SET, `breakpoint=Desktop|Mobile`) in section `work`
- Modify: `progress.md`

**Interfaces:**

- Produces: `work/ArchiveTable` with `breakpoint` axis. Phase 3's Work page master instances it.

- [ ] **Step 1: Build the Desktop variant with real rows**

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];

const table = F("breakpoint=Desktop", "VERTICAL", { itemSpacing: 0 });
table.resize(1248, 100);
table.layoutSizingHorizontal = "FIXED";
table.primaryAxisSizingMode = "AUTO";

const COLS = [
  { key: "Year", w: 96, mono: true },
  { key: "Project", w: 360, mono: false },
  { key: "Type", w: 200, mono: false },
  { key: "Built with", w: 400, mono: true },
  { key: "Link", w: 120, mono: false },
];
const ROWS = [
  ["2019", "Chimères Orchestra", "Art", "Pure Data, Arduino", "Visit"],
  ["2016", "Malinette", "Framework", "Pure Data, Python", "Visit"],
  ["2013", "Sonar", "Installation", "Processing", "—"],
];

const mkRow = async (cells, isHead) => {
  const r = F(isHead ? "head" : "row", "HORIZONTAL", {
    itemSpacing: 16, paddingTop: isHead ? 8 : 12, paddingBottom: isHead ? 8 : 12,
  });
  r.strokeBottomWeight = 1;
  r.setBoundVariable("strokes", border);
  table.appendChild(r); r.layoutSizingHorizontal = "FILL";
  for (let i = 0; i < COLS.length; i++) {
    const c = COLS[i];
    const t = await T(cells[i], {
      size: isHead ? 12 : c.mono ? 12 : 16,
      family: isHead || c.mono ? "Fira Code" : "IBM Plex Sans",
      weight: !isHead && c.key === "Project" ? "SemiBold" : "Regular",
      fill: isHead || c.mono || c.key === "Type" ? muted : fg,
    });
    t.name = c.key;
    if (isHead) t.textCase = "UPPER";
    r.appendChild(t);
    t.resize(c.w, t.height);
  }
  return r;
};
await mkRow(COLS.map((c) => c.key), true);
for (const row of ROWS) await mkRow(row, false);

const master = figma.createComponentFromNode(table);
master.name = "breakpoint=Desktop";
return { id: master.id, rows: master.children.length };
```

- [ ] **Step 2: Clone into the Mobile variant and drop two columns**

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const desktop = page.findOne((n) => n.type === "COMPONENT" && n.name === "breakpoint=Desktop");
const mobile = desktop.clone();
mobile.name = "breakpoint=Mobile";
mobile.resize(358, mobile.height); // 390 viewport − 2×16 gutter
for (const row of mobile.children)
  for (const cell of row.children.slice())
    if (cell.name === "Type" || cell.name === "Built with") cell.remove();
page.appendChild(mobile);
const set = figma.combineAsVariants([desktop, mobile], page);
set.name = "work/ArchiveTable";
const sectionId = await home(set, "work");
return { setId: set.id, sectionId, properties: set.variantGroupProperties };
```

- [ ] **Step 3: Read back cold + screenshot**

Assert: Desktop has 4 rows × 5 cells, Mobile has 4 rows × 3 cells, every stroke bound to `color/border`, header text uppercase mono muted. Screenshot both; the Mobile variant must fit 358 without a horizontal scroll — code wraps the table in `overflow-x-auto`, but a master that overflows is a design bug, not a scroll feature.

- [ ] **Step 4: Re-grid and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — work/ArchiveTable built (Figma)"
```
