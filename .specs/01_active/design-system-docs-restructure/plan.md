---
created: 2026-08-06
status: plan — ready to execute
---

# Design System Docs Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the 27 proven rules in `.claude/skills/design-expert/references/ds-documentation.md` to the Figma file `Blog Design System v1.0` — cover stripped to a nav hub, `Foundations · Colors` collapsed to one light+dark-inline table, the `📚 Docs` Elements tier dissolved into five component groups plus a Sections chapter, the three FINDING apologies replaced with real specs, and the sheet passed for readability and visual bugs — then regenerate the Dark sheet and archive the spec.

**Architecture:** All changes are Figma-side via `use_figma`. The Light DOCS frame (`DOCS / Design System — Light`) is the single working surface; the Dark frame is deleted and re-cloned at the end (Task 8), never edited in parallel. The chapter spine changes from `00 Read me → 01 Tokens → 02 Elements → 03 Components → 04 Pages` to `00 Read me → 01 Foundations → 02 Components (5 groups) → 03 Sections → 04 Pages`. Existing `Docs/*` kit components (`ChapterHeader`, `SpecimenCell`, `DecisionCard`, `TokenRow`, `DoDont`) are reused — no new kit masters unless a step says so.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file key `ihWIWmvtQPTWgUxlrVjC2c`). No repo code changes. Verification is `use_figma` read-back assertions plus `get_screenshot`; there is no test runner for Figma work. Commits are plan-side checkbox/notes updates only.

## Global Constraints

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c` (`Blog Design System v1.0`). Never write to `Wf4iomVMYUXlFIBV3Z8bx4` — read-only backup.
- **Skill contract:** every `use_figma` call passes `skillNames: "figma-use"`, uses `return` (never `figma.notify`/`closePlugin`), switches page at most once per call via `await figma.setCurrentPageAsync(page)`, and returns all created/mutated node IDs.
- **Node IDs are volatile.** Every ID below is a hint captured 2026-08-06. Before mutating, re-resolve by **name** and fail loudly (return a `missing` list and stop) if a name is absent. Never blind-write to a hardcoded ID.
- **Specimens must be live instances.** Anything demonstrating a component is `component.createInstance()`. Hand-drawn frames imitating a component are a defect.
- **Decision copy is verbatim.** `.specs/02_archives/design-system-docs/decisions.md` holds every validated caption. Moving a caption is fine; rewording one is a defect. The only captions this plan *replaces* are the three `FINDING:` sentences (Tasks 4–5), per the design.
- **Settled design rules are inputs.** Radius vocabulary is exactly `full` / `lg` 8px / `0`. Hover is one verb per surface, ≤150ms. Accent budget as captioned. Do not re-litigate.
- **Figma chrome is excluded from audits.** Skip node types `COMPONENT_SET` and `SECTION` in every fill/overflow sweep, or false positives return.
- **Copy tone:** conversational, concrete, no marketing abstractions (see `design-expert/references/copywriting.md`). New connective prose ≤ 2 sentences per caption, per §2.
- **Both themes ship together, Dark is generated.** No hand edits on the Dark frame; Task 8 regenerates it from Light with the `2 Theme` mode reapplied.
- **Single-sheet decision stands** (design.md "Single-sheet decision"): chapters stay on one DOCS sheet; §1 R4's intent is met by a fixed chapter/specimen skeleton, not tabs.
- **Fonts:** load before any text mutation — `Bubbler One Regular`, `IBM Plex Sans Regular/SemiBold/Medium`, `Fira Code Regular`. Skipping throws `Cannot write to node with unloaded font`.

## Reference data (hints, captured 2026-08-06 — re-resolve by name)

| Thing | Name | ID hint |
| --- | --- | --- |
| Cover page | `📖 Cover` | `0:1` |
| Docs page | `📚 Docs` | `2545:671` |
| Docs Light frame | `DOCS / Design System — Light` | `2545:672` |
| Docs Dark frame | `DOCS / Design System — Dark` | `2547:7597` |
| Foundations page | `🎨 Foundations` | `5:14` |
| Colors frame | `Foundations · Colors` | `6:2` (Light grid `6:4`, Dark grid `6:39`) |
| Components page | `🧩 Components` | `461:759` |
| Pages page | `📄 Pages` | `2558:18264` |
| Theme collection | `2 Theme` (Light/Dark modes) | `VariableCollectionId:3:2` |
| Primitives collection | `1 Primitives` (mode `2013:0`) | `VariableCollectionId:2013:2` |
| Responsive collection | `3 Responsive` (Desktop/Tablet/Mobile) | `VariableCollectionId:2245:42` |

**Docs kit masters (on `📚 Docs`, inside `SECTION / Docs kit`):** `Docs/ChapterHeader`, `Docs/SpecimenCell` (children: `label`, `slot`, `caption`), `Docs/DecisionCard` (variant `layer` = Chrome | Content | Hand | All), `Docs/TokenRow`, `Docs/DoDont`.

**Current chapters on the Light frame (by name):** `CHAPTER / 00 Read me`, `CHAPTER / 01 Tokens`, `CHAPTER / 02 Elements`, `CHAPTER / 03 Components`, `CHAPTER / 04 Pages`.

**Re-home mapping (Task 3 uses this verbatim).** Specimen cells are `Docs/SpecimenCell` instances found by their `label` child's characters:

| New home | Specimen labels moved there | Decision cards moved there |
| --- | --- | --- |
| `02 Components` chapter level (above groups) | — | Hover (9-row rest/hover table) |
| Group `Buttons` | `Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/TextCTA`, `Link/Icon`, `ThemeToggle`, `MotionToggle`, `Icon` (asset set) | Buttons |
| Group `Navigation` | `NavLink`, `NavLinkHome` | — |
| Group `Metadata & Text` | `H1`, `H2`, `PreviewTitle`, `PageDescription`, `PostMetadataTime`, `PostMetadataTopic`, `SerieMeta` | Numbers |
| Group `Cards` | `PostRow`, `SerieCard`, `PostCardPreviewBig`, `PostCardPreviewSmall`, `WorkCardPreviewSmall` | Border |
| Group `Hero & Contact` | `HeroText`, `HeroAnimation`, `ContactContent` | Illustration (with its 5 SVG specimens) |
| `CHAPTER / 03 Sections` | `Header`, `Footer`, `Hero`, `BlogPreviewSection`, `ArchiveTable`, `SerieCardList`, `WorkPreviewSection`, `ContactPreviewSection` | Backgrounds |
| `CHAPTER / 01 Foundations` (Task 4) | Icons sizing row (16/20/24) | Radius, Type, Spacing, Colour, Motion (stay/land here) |

The `Icon` asset set lands in `Buttons` because `Link/Icon` and the toggles instantiate it there — it is chrome. Foundations keeps only the *sizing rule* (16/20/24), per the design's dual-home requirement.

---

### Task 1: Strip the Cover to a nav hub

Rule §5: cover is a navigation hub, not a portfolio; status/version/changelog never on the cover; version folds into the system name.

**Files:**

- Modify: Figma page `📖 Cover` (`0:1`)

**Interfaces:**

- Consumes: nothing
- Produces: a Cover whose only content is the system name (with version in the name string) and navigation entries routing to `🎨 Foundations`, `🧩 Components`, `📄 Pages`, `📚 Docs`. Task 8 screenshots it for the final check.

- [x] **Step 1: Inventory the Cover — find status/version/changelog chrome**

```js
const page = figma.root.children.find((p) => p.name === "📖 Cover");
if (!page) return { missing: ["📖 Cover"] };
await figma.setCurrentPageAsync(page);
const rows = [];
const walk = (n, d) => {
  if (d > 3) return;
  rows.push({
    d, id: n.id, name: n.name, type: n.type,
    text: n.type === "TEXT" ? n.characters.slice(0, 80) : undefined,
  });
  (n.children || []).forEach((c) => walk(c, d + 1));
};
page.children.forEach((c) => walk(c, 0));
return rows;
```

Classify every TEXT node: **keep** = system name, nav labels; **kill** = anything matching `/status|in progress|stable|changelog|last updated|v?\d+\.\d+/i` that is *not* part of the system name itself. Record the kill-list IDs for Step 2. If the cover already has none, mark Steps 2–3 done and go to Step 4.

- [x] **Step 2: Remove status chrome, fold version into the name**

```js
const page = figma.root.children.find((p) => p.name === "📖 Cover");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Bubbler One", style: "Regular" });
const KILL = ["<id-from-step-1>", "<id-from-step-1>"]; // REPLACE with Step 1's kill list
const removed = [];
for (const id of KILL) {
  const n = await figma.getNodeByIdAsync(id);
  if (n) { removed.push({ id, name: n.name }); n.remove(); }
}
// Ensure the title carries the version (idempotent).
const title = page.findOne(
  (n) => n.type === "TEXT" && /blog design system/i.test(n.characters),
);
if (title && !/v1\.0/i.test(title.characters)) {
  await figma.loadFontAsync(title.fontName);
  title.characters = "Blog Design System v1.0";
}
return { mutatedNodeIds: removed.map((r) => r.id).concat(title ? [title.id] : []), removed };
```

- [x] **Step 3: Add or fix the nav entries**

Four rows, one per destination, each a text link with a node hyperlink to the target page's first frame. If nav entries already exist, only add hyperlinks where missing.

```js
const page = figma.root.children.find((p) => p.name === "📖 Cover");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const DEST = {
  "Foundations — tokens, type, colour": "🎨 Foundations",
  "Components — the library": "🧩 Components",
  "Pages — assembled templates": "📄 Pages",
  "Docs — the whole system, one sheet": "📚 Docs",
};
let nav = page.findOne((n) => n.name === "CoverNav");
const created = [];
if (!nav) {
  nav = figma.createAutoLayout("VERTICAL", { name: "CoverNav", itemSpacing: 16 });
  page.appendChild(nav);
  created.push(nav.id);
}
for (const [label, target] of Object.entries(DEST)) {
  const dest = figma.root.children.find((p) => p.name === target);
  if (!dest || !dest.children.length) return { missing: [target] };
  let t = nav.findOne((n) => n.type === "TEXT" && n.characters === label);
  if (!t) {
    t = figma.createText();
    t.fontName = { family: "IBM Plex Sans", style: "Regular" };
    t.characters = label;
    t.fontSize = 20;
    t.setBoundVariable("fills", V["color/foreground"]);
    nav.appendChild(t);
    created.push(t.id);
  }
  t.setRangeHyperlink(0, t.characters.length, { type: "NODE", value: dest.children[0].id });
}
return { createdNodeIds: created };
```

If a `color/foreground` variable name is missing, stop and list the theme collection's actual names — do not hardcode a hex.

- [x] **Step 4: Screenshot and verify**

`get_screenshot` on the Cover page's root frame. Expected: name + four nav rows, no status/version chrome outside the name, no stray white-filled frames. Then:

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 1 cover stripped to nav hub"
```

---

### Task 2: Collapse `Foundations · Colors` to one light+dark-inline table

Rule §3 R3: one row per token, Light and Dark inline — never a table per theme. Rule §3 R1: rows lead with semantic name/role, value alongside. Confirmed violation: frame `6:2` holds two full 12-swatch grids (`Light` `6:4`, `Dark` `6:39`).

**Files:**

- Modify: `🎨 Foundations` page (`5:14`), frame `Foundations · Colors` (`6:2`)

**Interfaces:**

- Consumes: `2 Theme` color variables
- Produces: a `ColorTokenTable` frame — one row per color token: name (mono) · role sentence · Light swatch+hex · Dark swatch+hex. Swatches stay **variable-bound** inside per-mode wrappers, so a token edit updates the docs. Task 4 links to this frame.

- [ ] **Step 1: Read the theme's color tokens and resolve both mode values to hex**

```js
const page = figma.root.children.find((p) => p.name === "🎨 Foundations");
await figma.setCurrentPageAsync(page);
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const modes = Object.fromEntries(theme.modes.map((m) => [m.name, m.modeId]));
const hex = (c) =>
  "#" + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
const resolve = async (val) => {
  while (val && val.type === "VARIABLE_ALIAS") {
    const t = await figma.variables.getVariableByIdAsync(val.id);
    const col = await figma.variables.getVariableCollectionByIdAsync(t.variableCollectionId);
    val = t.valuesByMode[col.defaultModeId] ?? Object.values(t.valuesByMode)[0];
  }
  return val;
};
const out = [];
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.resolvedType !== "COLOR") continue;
  out.push({
    id: v.id, name: v.name, description: v.description || "",
    light: hex(await resolve(v.valuesByMode[modes.Light])),
    dark: hex(await resolve(v.valuesByMode[modes.Dark])),
  });
}
return { count: out.length, tokens: out };
```

Expected: 12 color tokens. Record the list — Step 2 bakes the hex strings into text labels. If a token's `description` is empty, Step 2's ROLE map must cover it; anything uncovered goes in the returned `noRole` list for a manual caption before Step 3.

- [ ] **Step 2: Build the single table**

```js
const page = figma.root.children.find((p) => p.name === "🎨 Foundations");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
const frame = page.findOne((n) => n.name === "Foundations · Colors");
if (!frame) return { missing: ["Foundations · Colors"] };
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const modes = Object.fromEntries(theme.modes.map((m) => [m.name, m.modeId]));
const vars = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  vars[v.name] = v;
}
// Role sentences — name-keyed; variable.description wins when present.
const ROLE = {
  "color/background": "Page background. The reading surface.",
  "color/foreground": "Primary text and icons.",
  "color/foreground-muted": "Secondary text — metadata, captions, rest-state nav.",
  "color/surface": "Raised panels: footer, code blocks.",
  "color/surface-hover": "Hover fill for rows, secondary buttons, icon buttons.",
  "color/border": "Hairlines and card borders.",
  "color/accent": "Single teal accent. Budget: serie chips, section CTAs, active nav, focus rings, hover underline decoration.",
};
const TOKENS = []; // REPLACE with Step 1's token list [{name, light, dark, description}, ...]
const txt = (chars, family, style, size, w) => {
  const t = figma.createText();
  t.fontName = { family, style };
  t.characters = chars;
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", vars["color/foreground"]);
  if (w) { t.layoutSizingHorizontal = "FIXED"; t.resize(w, t.height); }
  return t;
};
const swatch = (tokenName, modeName, hexLabel) => {
  // Wrapper pins the mode so Light and Dark render side by side; the fill stays bound.
  const wrap = figma.createAutoLayout("HORIZONTAL", { name: `swatch-${modeName}`, itemSpacing: 8 });
  wrap.setExplicitVariableModeForCollection(theme, modes[modeName]);
  const r = figma.createRectangle();
  r.resize(40, 24);
  r.cornerRadius = 0;
  r.setBoundVariable("fills", vars[tokenName]);
  r.strokes = [];
  wrap.appendChild(r);
  wrap.appendChild(txt(hexLabel, "Fira Code", "Regular", 12, 72));
  return wrap;
};
const table = figma.createAutoLayout("VERTICAL", { name: "ColorTokenTable", itemSpacing: 12 });
const noRole = [];
for (const tk of TOKENS) {
  const role = tk.description || ROLE[tk.name];
  if (!role) noRole.push(tk.name);
  const row = figma.createAutoLayout("HORIZONTAL", { name: `row-${tk.name}`, itemSpacing: 24 });
  row.counterAxisAlignItems = "CENTER";
  row.appendChild(txt(tk.name, "Fira Code", "Regular", 13, 220));
  row.appendChild(txt(role || "TODO role", "IBM Plex Sans", "Regular", 13, 380));
  row.appendChild(swatch(tk.name, "Light", tk.light));
  row.appendChild(swatch(tk.name, "Dark", tk.dark));
  table.appendChild(row);
}
// Chain note per §3 R2.
const note = txt(
  "Primitives are reference-only — never use them directly. Chain: primitive → semantic (this table) → component.",
  "IBM Plex Sans", "Regular", 13, 700,
);
table.appendChild(note);
frame.appendChild(table);
return { createdNodeIds: [table.id], rows: TOKENS.length, noRole };
```

Expected: `rows: 12`, `noRole` empty (fill any listed role by hand in a follow-up call before continuing).

- [ ] **Step 3: Delete the two old grids, verify, screenshot**

```js
const page = figma.root.children.find((p) => p.name === "🎨 Foundations");
await figma.setCurrentPageAsync(page);
const frame = page.findOne((n) => n.name === "Foundations · Colors");
const table = frame.findOne((n) => n.name === "ColorTokenTable");
if (!table || table.children.length < 12) return { missing: ["ColorTokenTable with 12 rows"] };
const removed = [];
for (const name of ["Light", "Dark"]) {
  const grid = frame.children.find((n) => n.name === name && n.id !== table.id);
  if (grid) { removed.push({ id: grid.id, name }); grid.remove(); }
}
await frame.screenshot({ scale: 1 });
return { removed, remaining: frame.children.map((n) => n.name) };
```

Guard: the delete only runs after the table exists with 12 rows. Check the screenshot: one table, both hex columns legible, no leftover grid, no white unbound background (frame fill must be bound or empty).

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 2 colors page single-source table"
```

---

### Task 3: Dissolve the Elements chapter — new spine with five component groups and a Sections chapter

Rule §1 R2: no Elements/Primitives tier — one flat Components list, grouped meaningfully. Rule §1 R3: composite assemblies (Sections) are a legitimate separate chapter. Biggest task of the plan (~25 specimen cells + 7 decision cards move).

**Files:**

- Modify: `📚 Docs` (`2545:671`) — Light frame `DOCS / Design System — Light` only

**Interfaces:**

- Consumes: the re-home mapping table from the reference section (verbatim); `Docs/ChapterHeader` master
- Produces: chapters named `CHAPTER / 00 Read me`, `CHAPTER / 01 Foundations`, `CHAPTER / 02 Components`, `CHAPTER / 03 Sections`, `CHAPTER / 04 Pages`; inside 02, group frames `GROUP / Buttons`, `GROUP / Navigation`, `GROUP / Metadata & Text`, `GROUP / Cards`, `GROUP / Hero & Contact`. Tasks 4–7 operate on these names.

- [ ] **Step 1: Inventory current chapters and index every movable block**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
if (!light) return { missing: ["DOCS / Design System — Light"] };
const chapters = light.children.filter((n) => n.name.startsWith("CHAPTER /"));
const index = [];
for (const ch of chapters) {
  const cells = ch.findAll((n) => n.type === "INSTANCE" && n.name === "Docs/SpecimenCell");
  const cards = ch.findAll((n) => n.type === "INSTANCE" && n.name.startsWith("Docs/DecisionCard"));
  const cellRows = [];
  for (const c of cells) {
    const label = c.findOne((n) => n.name === "label" && n.type === "TEXT");
    cellRows.push({ id: c.id, label: label ? label.characters : "?" });
  }
  index.push({
    chapter: ch.name, id: ch.id,
    cells: cellRows,
    cards: cards.map((c) => ({
      id: c.id,
      head: (c.findOne((n) => n.type === "TEXT") || {}).characters,
    })),
    otherChildren: ch.children.map((n) => ({ id: n.id, name: n.name, type: n.type })),
  });
}
return index;
```

Diff the returned cell labels against the mapping table. Any label in the mapping with no live cell, or any cell with no mapping row, stops the task — resolve the discrepancy (renamed master, missed specimen) before moving anything. Note especially whether an `Icon` cell exists; if the icon *asset set* was never given a cell, add one in Step 3.

- [ ] **Step 2: Rename chapters and create the new containers**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Bubbler One", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const kit = page.findOne((n) => n.name === "SECTION / Docs kit");
const chHeadMaster = kit.findOne((n) => n.type === "COMPONENT" && n.name === "Docs/ChapterHeader");
if (!chHeadMaster) return { missing: ["Docs/ChapterHeader"] };
const byName = (name) => light.children.find((n) => n.name === name);

const tokens = byName("CHAPTER / 01 Tokens");
if (tokens) tokens.name = "CHAPTER / 01 Foundations";

const comps = byName("CHAPTER / 03 Components");
if (!comps) return { missing: ["CHAPTER / 03 Components"] };
comps.name = "CHAPTER / 02 Components";

// New 03 Sections chapter, inserted after 02 Components.
const sections = figma.createAutoLayout("VERTICAL", {
  name: "CHAPTER / 03 Sections", itemSpacing: 48,
});
const sHead = chHeadMaster.createInstance();
const setTxt = async (inst, child, chars) => {
  const t = inst.findOne((n) => n.name === child && n.type === "TEXT");
  await figma.loadFontAsync(t.fontName);
  t.characters = chars;
};
sections.appendChild(sHead);
await setTxt(sHead, "number", "03");
await setTxt(sHead, "title", "Sections");
await setTxt(sHead, "summary", "Composite assemblies — a section is components arranged with the spacing and background rules applied.");
light.insertChild(light.children.indexOf(comps) + 1, sections);
sections.layoutSizingHorizontal = "FILL";

// Five group frames inside 02 Components, each with an H2-weight heading.
const V = {};
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const created = [sections.id];
for (const g of ["Buttons", "Navigation", "Metadata & Text", "Cards", "Hero & Contact"]) {
  const grp = figma.createAutoLayout("VERTICAL", { name: `GROUP / ${g}`, itemSpacing: 32 });
  const h = figma.createText();
  h.fontName = { family: "IBM Plex Sans", style: "SemiBold" };
  h.characters = g;
  h.fontSize = 30;
  h.setBoundVariable("fills", V["color/foreground"]);
  grp.appendChild(h);
  comps.appendChild(grp);
  grp.layoutSizingHorizontal = "FILL";
  created.push(grp.id);
}
// Fix the 02 chapter header text (number stays "02", title becomes "Components").
const head02 = comps.findOne((n) => n.type === "INSTANCE" && n.name === "Docs/ChapterHeader");
if (head02) {
  await setTxt(head02, "number", "02");
  await setTxt(head02, "title", "Components");
  await setTxt(head02, "summary", "The flat component list, grouped by what a reader is looking for. Every specimen is a live instance.");
}
const head01 = tokens && tokens.findOne((n) => n.type === "INSTANCE" && n.name === "Docs/ChapterHeader");
if (head01) { await setTxt(head01, "number", "01"); await setTxt(head01, "title", "Foundations"); }
return { createdNodeIds: created };
```

- [ ] **Step 3: Move every cell and card to its mapped home**

One call. The `MOVES` constant is the mapping table flattened; IDs come from Step 1's index.

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const comps = light.children.find((n) => n.name === "CHAPTER / 02 Components");
const sections = light.children.find((n) => n.name === "CHAPTER / 03 Sections");
const grp = (g) => comps.findOne((n) => n.name === `GROUP / ${g}`);
// label → destination frame. Hover card goes chapter-level in 02, above the groups.
const DEST = {
  "Link/CTA": grp("Buttons"), "Link/Secondary": grp("Buttons"), "Link/SecondarySm": grp("Buttons"),
  "Link/TextCTA": grp("Buttons"), "Link/Icon": grp("Buttons"), "ThemeToggle": grp("Buttons"),
  "MotionToggle": grp("Buttons"), "Icon": grp("Buttons"),
  "NavLink": grp("Navigation"), "NavLinkHome": grp("Navigation"),
  "H1": grp("Metadata & Text"), "H2": grp("Metadata & Text"), "PreviewTitle": grp("Metadata & Text"),
  "PageDescription": grp("Metadata & Text"), "PostMetadataTime": grp("Metadata & Text"),
  "PostMetadataTopic": grp("Metadata & Text"), "SerieMeta": grp("Metadata & Text"),
  "PostRow": grp("Cards"), "SerieCard": grp("Cards"), "PostCardPreviewBig": grp("Cards"),
  "PostCardPreviewSmall": grp("Cards"), "WorkCardPreviewSmall": grp("Cards"),
  "HeroText": grp("Hero & Contact"), "HeroAnimation": grp("Hero & Contact"),
  "ContactContent": grp("Hero & Contact"),
  "Header": sections, "Footer": sections, "Hero": sections, "BlogPreviewSection": sections,
  "ArchiveTable": sections, "SerieCardList": sections, "WorkPreviewSection": sections,
  "ContactPreviewSection": sections,
};
const moved = [], unmoved = [];
const cells = light.findAll((n) => n.type === "INSTANCE" && n.name === "Docs/SpecimenCell");
for (const c of cells) {
  const label = c.findOne((n) => n.name === "label" && n.type === "TEXT");
  const key = label && label.characters.split(" ")[0].split(" ·")[0];
  // exact match first, then prefix (labels may read "Link/CTA · full (pressable)")
  const dest = DEST[label && label.characters] ||
    Object.entries(DEST).find(([k]) => label && label.characters.startsWith(k))?.[1];
  if (!dest) { unmoved.push(label ? label.characters : c.id); continue; }
  dest.appendChild(c);
  c.layoutSizingHorizontal = "FILL";
  moved.push(c.id);
}
// Decision cards move by their heading text.
const CARD_DEST = {
  "Hover": comps, "Buttons": grp("Buttons"), "Numbers": grp("Metadata & Text"),
  "Border": grp("Cards"), "Illustration": grp("Hero & Contact"), "Backgrounds": sections,
};
const cards = light.findAll((n) => n.type === "INSTANCE" && n.name.startsWith("Docs/DecisionCard"));
for (const card of cards) {
  const head = card.findOne((n) => n.type === "TEXT");
  const key = Object.keys(CARD_DEST).find((k) => head && head.characters.startsWith(k));
  if (!key) continue; // Radius/Type/Spacing/Colour/Motion stay in 01 Foundations
  const dest = CARD_DEST[key];
  if (key === "Hover") dest.insertChild(1, card); // directly under the chapter header
  else dest.insertChild(1, card); // directly under the group heading
  card.layoutSizingHorizontal = "FILL";
  moved.push(card.id);
}
return { mutatedNodeIds: moved, movedCount: moved.length, unmoved };
```

Expected: `unmoved` empty. If the `Icon` asset-set cell did not exist (Step 1 finding), create one now: `Docs/SpecimenCell` instance in `GROUP / Buttons`, label `Icon`, a live `Icon` instance (variant `icon=arrow-right`) in its `slot`, caption verbatim-new: `The flat asset set. Sizing rules live in 01 Foundations — 16 inline, 20 buttons and nav, 24 standalone.`

- [ ] **Step 4: Delete the emptied Elements chapter**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const el = light.children.find((n) => n.name === "CHAPTER / 02 Elements");
if (!el) return { missing: ["CHAPTER / 02 Elements (already gone?)"] };
const leftover = el.findAll((n) => n.type === "INSTANCE");
if (leftover.length) return { blocked: leftover.map((n) => ({ id: n.id, name: n.name })) };
el.remove();
return {
  removed: "CHAPTER / 02 Elements",
  spine: light.children.filter((n) => n.name.startsWith("CHAPTER /")).map((n) => n.name),
};
```

Guard: refuses to delete while any instance is still inside. Expected spine, in order: `00 Read me`, `01 Foundations`, `02 Components`, `03 Sections`, `04 Pages`.

- [ ] **Step 5: Update the Read-me intro's spine sentence**

The `00 Read me` intro ends "…tokens, then elements, then components, then whole pages." That sentence is connective prose (not validated decision copy), so it may be rewritten:

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const readme = light.children.find((n) => n.name === "CHAPTER / 00 Read me");
const intro = readme.findAll((n) => n.type === "TEXT").find((t) => /then elements/.test(t.characters));
if (!intro) return { missing: ["intro sentence mentioning elements"] };
await figma.loadFontAsync(intro.fontName);
intro.characters = intro.characters.replace(
  /Read top to bottom.*$/,
  "Read top to bottom: foundations, then components, then sections, then whole pages.",
);
return { mutatedNodeIds: [intro.id] };
```

- [ ] **Step 6: Screenshot the whole Light frame and commit**

`get_screenshot` on `DOCS / Design System — Light`, scale 0.25. Check: five chapters in order, five visible group headings inside 02, no orphaned cells floating outside a chapter, no collapsed (zero-height) frames.

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 3 elements tier dissolved into grouped components + sections"
```

---

### Task 4: Foundations chapter — Icons section, Colour cross-reference, focus-ring formula

Closes FINDING 1 (focus-ring/CTA-accent) per §4 R5 and gives icon sizing its Foundations home. Also re-verifies the design's claim that the Colour section already leads with role.

**Files:**

- Modify: `CHAPTER / 01 Foundations` on the Light DOCS frame

**Interfaces:**

- Consumes: chapter/group names from Task 3; `Docs/SpecimenCell` master; live `Icon` set on `🧩 Components`
- Produces: sections inside 01 Foundations ordered `Colour`, `Type`, `Spacing`, `Radius`, `Motion`, `Icons`. Task 5 fills Spacing and Motion.

- [ ] **Step 1: Verify the Colour section leads with role, and find the FINDING text**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const ch = light.children.find((n) => n.name === "CHAPTER / 01 Foundations");
if (!ch) return { missing: ["CHAPTER / 01 Foundations"] };
const findings = ch.findAll((n) => n.type === "TEXT" && /FINDING:/.test(n.characters));
const colour = ch.findAll((n) => n.type === "TEXT").filter((t) => /accent|colour|color\//i.test(t.characters));
return {
  sections: ch.children.map((n) => n.name),
  findingTexts: findings.map((t) => ({ id: t.id, text: t.characters.slice(0, 120) })),
  colourTexts: colour.map((t) => ({ id: t.id, text: t.characters.slice(0, 120) })),
};
```

Expected: one FINDING about focus-ring/CTA-accent in Colour, one each for Spacing and Motion (Task 5 takes those IDs). If Colour's token mentions lead with raw hex instead of `color/…` role names, that contradicts the design's no-change-needed claim — fix it here by reordering name-first, and note it in the task notes.

- [ ] **Step 2: Replace the focus-ring FINDING with formula + hard rule**

The accent-budget caption is validated copy — keep everything before `FINDING:` verbatim, replace only the FINDING sentence.

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const t = await figma.getNodeByIdAsync("<finding-id-from-step-1>"); // REPLACE
await figma.loadFontAsync(t.fontName);
t.characters = t.characters.replace(
  /FINDING:.*$/s,
  "Focus ring: outline in color/accent, radius = element radius + 2px, 2px offset. Never remove a focus indicator — WCAG 2.4.7, no exceptions.",
);
return { mutatedNodeIds: [t.id], now: t.characters };
```

- [ ] **Step 3: Add the Icons section (sizing rules only) with a cross-page link in Colour**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const ch = light.children.find((n) => n.name === "CHAPTER / 01 Foundations");
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const compsPage = figma.root.children.find((p) => p.name === "🧩 Components");
const iconSet = compsPage.findOne((n) => n.type === "COMPONENT_SET" && n.name === "Icon");
if (!iconSet) return { missing: ["Icon set"] };
const arrow = iconSet.children.find((c) => c.name === "icon=arrow-right");

const sec = figma.createAutoLayout("VERTICAL", { name: "SECTION / Icons", itemSpacing: 16 });
const h = figma.createText();
h.fontName = { family: "IBM Plex Sans", style: "SemiBold" };
h.characters = "Icons";
h.fontSize = 30;
h.setBoundVariable("fills", V["color/foreground"]);
sec.appendChild(h);
const ROWS = [
  [16, "16 · inline with metadata"],
  [20, "20 · buttons and nav"],
  [24, "24 · standalone"],
];
for (const [size, caption] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", { name: `icon-${size}`, itemSpacing: 16 });
  row.counterAxisAlignItems = "CENTER";
  const inst = arrow.createInstance();
  inst.resize(size, size);
  row.appendChild(inst);
  const t = figma.createText();
  t.fontName = { family: "Fira Code", style: "Regular" };
  t.characters = caption;
  t.fontSize = 13;
  t.setBoundVariable("fills", V["color/foreground-muted"]);
  row.appendChild(t);
  sec.appendChild(row);
}
const note = figma.createText();
note.fontName = { family: "IBM Plex Sans", style: "Regular" };
note.characters = "The asset set itself lives in 02 Components · Buttons.";
note.fontSize = 13;
note.setBoundVariable("fills", V["color/foreground-muted"]);
sec.appendChild(note);
ch.appendChild(sec);
sec.layoutSizingHorizontal = "FILL";

// Cross-page link: Colour section → Foundations · Colors table (§1 R5).
const foundations = figma.root.children.find((p) => p.name === "🎨 Foundations");
const colorsFrame = foundations.findOne((n) => n.name === "Foundations · Colors");
const link = figma.createText();
link.fontName = { family: "IBM Plex Sans", style: "Regular" };
link.characters = "Full token table with Light and Dark values → Foundations · Colors";
link.fontSize = 13;
link.setBoundVariable("fills", V["color/foreground-muted"]);
link.setRangeHyperlink(0, link.characters.length, { type: "NODE", value: colorsFrame.id });
const colourSec = ch.children.find((n) => /colour|color/i.test(n.name));
(colourSec || ch).appendChild(link);
return { createdNodeIds: [sec.id, link.id] };
```

The three icon captions are verbatim decision copy from `decisions.md` — do not reword. If the old Icons cell moved into `Buttons` in Task 3 duplicates these three sizing rows, strip the sizing rows from the Buttons-side cell (keep only the asset-set specimen) so the rule lives once, here.

- [ ] **Step 4: Screenshot the chapter, commit**

`get_screenshot` on `CHAPTER / 01 Foundations`. Check: section order `Colour, Type, Spacing, Radius, Motion, Icons` (reorder children by `insertChild` if not), focus-ring text present, no FINDING left in Colour.

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 4 foundations icons + focus-ring formula + colour cross-ref"
```

---

### Task 5: Spacing and Motion specs tables (FINDINGs 2 and 3)

§4 R5: spacing = specs table (token, rem, px, swatch) + short mechanical rationale. §4 R6: motion = small specs table tied to a **named** philosophy, in-house name, not Carbon's.

**Files:**

- Modify: `CHAPTER / 01 Foundations` — `Spacing` and `Motion` sections

**Interfaces:**

- Consumes: FINDING text-node IDs from Task 4 Step 1; `1 Primitives` and `3 Responsive` collections
- Produces: a `SpacingLadder` table and a `MotionSpecs` table replacing the two FINDING sentences

- [ ] **Step 1: Build the spacing ladder from resolved variable values**

Rows lead with **role** (§3 R1). Values are read live from the collections, never typed.

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const ch = light.children.find((n) => n.name === "CHAPTER / 01 Foundations");
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const prim = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2013:2");
const PM = prim.modes[0].modeId;
const primByName = {};
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  primByName[v.name] = v.valuesByMode[PM];
}
const resp = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:2245:42");
const respRow = async (name) => {
  const v = await Promise.all(resp.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)))
    .then((vs) => vs.find((x) => x.name === name));
  const out = {};
  for (const m of resp.modes) {
    let val = v.valuesByMode[m.modeId];
    if (val && val.type === "VARIABLE_ALIAS")
      val = (await figma.variables.getVariableByIdAsync(val.id)).valuesByMode[PM];
    out[m.name] = val;
  }
  return out;
};
const rhythm = await respRow("section/rhythm-y");
const gutter = await respRow("container/gutter");
const px = (name) => primByName[name]; // e.g. spacing/2 → 8
const ROWS = [
  ["inside a component", "spacing/2", `${px("spacing/2") / 16}rem`, `${px("spacing/2")}px`, px("spacing/2")],
  ["between components", "spacing/6", `${px("spacing/6") / 16}rem`, `${px("spacing/6")}px`, px("spacing/6")],
  ["between sections", "section/rhythm-y", "responsive", `${rhythm.Desktop} / ${rhythm.Tablet} / ${rhythm.Mobile}px`, rhythm.Desktop],
  ["page gutter", "container/gutter", "responsive", `${gutter.Desktop} / ${gutter.Tablet} / ${gutter.Mobile}px`, gutter.Desktop],
];
const table = figma.createAutoLayout("VERTICAL", { name: "SpacingLadder", itemSpacing: 10 });
const txt = (chars, family, size, colour, w) => {
  const t = figma.createText();
  t.fontName = { family, style: "Regular" };
  t.characters = String(chars);
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", V[colour]);
  if (w) { t.layoutSizingHorizontal = "FIXED"; t.resize(w, t.height); }
  return t;
};
for (const [role, token, rem, pxs, barPx] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", { name: `sp-${token}`, itemSpacing: 20 });
  row.counterAxisAlignItems = "CENTER";
  row.appendChild(txt(role, "IBM Plex Sans", 13, "color/foreground", 180));
  row.appendChild(txt(token, "Fira Code", 13, "color/foreground-muted", 170));
  row.appendChild(txt(rem, "Fira Code", 13, "color/foreground-muted", 90));
  row.appendChild(txt(pxs, "Fira Code", 13, "color/foreground-muted", 130));
  const bar = figma.createRectangle();
  bar.resize(Math.max(4, Number(barPx)), 12);
  bar.setBoundVariable("fills", V["color/accent"]);
  row.appendChild(bar);
  table.appendChild(row);
}
table.appendChild(txt(
  "4px base, Tailwind multiples. Three roles, three steps — if a gap is not on the ladder, it is a defect.",
  "IBM Plex Sans", 13, "color/foreground-muted", 640,
));
const spacing = ch.children.find((n) => /spacing/i.test(n.name));
if (!spacing) return { missing: ["Spacing section in 01 Foundations"] };
spacing.appendChild(table);
table.layoutSizingHorizontal = "FILL";
// Remove the FINDING sentence, keep the validated ladder caption before it.
const finding = spacing.findAll((n) => n.type === "TEXT" && /FINDING:/.test(n.characters))[0];
if (finding) {
  await figma.loadFontAsync(finding.fontName);
  finding.characters = finding.characters.replace(/\s*FINDING:.*$/s, "");
}
return { createdNodeIds: [table.id], rows: ROWS.map((r) => r.join(" | ")) };
```

Verify the returned `rows` against expectations: spacing/2=8px, spacing/6=24px, rhythm 96/64/48, gutter 32/24/16. A different number means the collections drifted — investigate before committing.

- [ ] **Step 2: Build the motion specs table with a named in-house philosophy**

Values are the validated caption's (`decisions.md` Motion): fast 150ms, base 250ms, slow 400ms, `--ease-out`, `--ease-in-out`. Philosophy name is new copy (allowed — it replaces the FINDING): **"Quiet motion"**.

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const ch = light.children.find((n) => n.name === "CHAPTER / 01 Foundations");
const motion = ch.children.find((n) => /motion/i.test(n.name));
if (!motion) return { missing: ["Motion section in 01 Foundations"] };
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const V = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const txt = (chars, family, style, size, colour, w) => {
  const t = figma.createText();
  t.fontName = { family, style };
  t.characters = chars;
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", V[colour]);
  if (w) { t.layoutSizingHorizontal = "FIXED"; t.resize(w, t.height); }
  return t;
};
const table = figma.createAutoLayout("VERTICAL", { name: "MotionSpecs", itemSpacing: 10 });
table.appendChild(txt("Quiet motion", "IBM Plex Sans", "SemiBold", 16, "color/foreground"));
table.appendChild(txt(
  "Quick for feedback, eased for travel, still by default. Zero infinite loops; MotionToggle and prefers-reduced-motion gate everything.",
  "IBM Plex Sans", "Regular", 13, "color/foreground-muted", 640,
));
const ROWS = [
  ["--duration-fast", "150ms", "feedback — hover, focus, toggles"],
  ["--duration-base", "250ms", "movement — reveals, fades"],
  ["--duration-slow", "400ms", "large travel — cover scale"],
  ["--ease-out", "cubic-bezier out", "entering elements decelerate"],
  ["--ease-in-out", "cubic-bezier in-out", "elements that move and settle"],
];
for (const [token, value, use] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", { name: `mo-${token}`, itemSpacing: 20 });
  row.appendChild(txt(token, "Fira Code", "Regular", 13, "color/foreground-muted", 170));
  row.appendChild(txt(value, "Fira Code", "Regular", 13, "color/foreground", 150));
  row.appendChild(txt(use, "IBM Plex Sans", "Regular", 13, "color/foreground-muted", 320));
  table.appendChild(row);
}
motion.appendChild(table);
table.layoutSizingHorizontal = "FILL";
const finding = motion.findAll((n) => n.type === "TEXT" && /FINDING:/.test(n.characters))[0];
if (finding) {
  await figma.loadFontAsync(finding.fontName);
  finding.characters = finding.characters
    .replace(/\s*FINDING:.*$/s, "")
    .replace(/--duration-fast.*?\. /s, ""); // numbers now live in the table, not prose
}
return { createdNodeIds: [table.id] };
```

- [ ] **Step 3: Verify no FINDING remains anywhere, screenshot, commit**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const left = light.findAll((n) => n.type === "TEXT" && /FINDING:/.test(n.characters));
return { findingsLeft: left.map((t) => ({ id: t.id, text: t.characters.slice(0, 100) })) };
```

Expected: `findingsLeft` empty. Screenshot the Spacing and Motion sections.

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 5 spacing ladder + quiet-motion specs replace FINDINGs"
```

---

### Task 6: Readability pass per §2

Headings carry the scan; captions ≤ 2 sentences; body text 50–75 chars per line (≈ 640px at 13–14px for these fonts — the widths already used above). Decision copy stays verbatim — this pass touches only connective prose and geometry, never validated captions.

**Files:**

- Modify: `DOCS / Design System — Light`

**Interfaces:**

- Consumes: the finished chapter structure from Tasks 3–5
- Produces: an audit-clean sheet; the audit script is reused in Task 8's final check

- [ ] **Step 1: Audit — long lines, missing size jumps, over-long prose**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const wide = [], longProse = [], flatHeadings = [];
for (const t of light.findAll((n) => n.type === "TEXT")) {
  const chars = t.characters;
  // ~75 chars/line: flag wrapping text wider than 720px at body sizes
  if (t.fontSize <= 14 && t.width > 720 && chars.length > 90)
    wide.push({ id: t.id, w: Math.round(t.width), text: chars.slice(0, 60) });
  // connective prose over 2 sentences (skip verbatim decision captions — they carry " · ")
  const sentences = (chars.match(/[.!?](\s|$)/g) || []).length;
  if (sentences > 2 && !chars.includes(" · ") && !/^The design system behind/.test(chars))
    longProse.push({ id: t.id, sentences, text: chars.slice(0, 80) });
}
// Heading jump check: group headings must be ≥2 steps above body (30 vs 13/14 — pass by construction; verify none drifted)
for (const t of light.findAll((n) => n.type === "TEXT"))
  if (/^GROUP \//.test(t.parent.name) && t === t.parent.children[0] && t.fontSize < 22)
    flatHeadings.push({ id: t.id, size: t.fontSize });
return { wide, longProse, flatHeadings };
```

- [ ] **Step 2: Fix what the audit flagged**

Per flagged node, one targeted call: `wide` → `layoutSizingHorizontal = "FIXED"; resize(640, h)`. `longProse` → rewrite to ≤2 sentences (copy tone: concrete, no marketing) — unless the text is a verbatim caption, in which case leave it and note it. `flatHeadings` → `fontSize = 30`, `IBM Plex Sans SemiBold`. Re-run Step 1 until all three lists are empty.

- [ ] **Step 3: Commit**

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 6 readability pass (line length, prose, heading jumps)"
```

---

### Task 7: Visual-bug sweep — white backgrounds and frame overflow

Execution defects from the user review: content outside frames, default-white fills. Sweep Cover, DOCS Light, and `Foundations · Colors`.

**Files:**

- Modify: `📖 Cover`, `📚 Docs` Light frame, `Foundations · Colors`

**Interfaces:**

- Consumes: finished content from Tasks 1–6
- Produces: zero unbound white fills, zero children escaping their parent's bounds; the sweep script is reused in Task 8

- [ ] **Step 1: Sweep one page (run three times, once per page — never loop pages in one call)**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs"); // then 📖 Cover, then 🎨 Foundations
await figma.setCurrentPageAsync(page);
const whiteFills = [], overflow = [];
const isWhite = (f) =>
  f.type === "SOLID" && f.visible !== false &&
  f.color.r > 0.98 && f.color.g > 0.98 && f.color.b > 0.98;
const walk = (n) => {
  if (n.type === "COMPONENT_SET" || n.type === "SECTION") return;
  const bv = n.boundVariables || {};
  if (["FRAME", "RECTANGLE"].includes(n.type) && Array.isArray(n.fills) &&
      n.fills.some(isWhite) && !(bv.fills && bv.fills.length))
    whiteFills.push({ id: n.id, name: n.name });
  if (n.parent && "clipsContent" in n.parent === false && n.parent.type === "FRAME") {
    const p = n.parent;
    if (n.x < -1 || n.y < -1 || n.x + n.width > p.width + 1 || n.y + n.height > p.height + 1)
      overflow.push({ id: n.id, name: n.name, parent: p.name });
  }
  (n.children || []).forEach(walk);
};
page.children.forEach(walk);
return { whiteFills, overflow };
```

- [ ] **Step 2: Fix per finding**

`whiteFills`: if the node is a container that should show the page colour → `setBoundVariable("fills", color/background)`; if it needs no fill at all → `fills = []`. Decide per node from the screenshot, never blanket-apply. `overflow`: give the parent auto-layout (or `FILL` sizing to the child) so content is contained — resize at the *master* if the offender is inside a component instance. Re-run Step 1 per page until both lists are empty.

- [ ] **Step 3: Commit**

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 7 white-fill and overflow sweep clean"
```

---

### Task 8: Regenerate the Dark sheet, final verification, archive

**Files:**

- Modify: `📚 Docs` — delete old Dark frame, clone Light
- Modify: `.specs/` — archive the spec

**Interfaces:**

- Consumes: everything above
- Produces: `DOCS / Design System — Dark` regenerated; spec archived

- [ ] **Step 1: Delete the stale Dark frame and re-clone from Light**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const oldDark = page.findOne((n) => n.name === "DOCS / Design System — Dark");
const theme = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:3:2");
const darkMode = theme.modes.find((m) => m.name === "Dark");
if (!light || !darkMode) return { missing: ["light frame or Dark mode"] };
const x = oldDark ? oldDark.x : light.x + light.width + 200;
const y = oldDark ? oldDark.y : light.y;
if (oldDark) oldDark.remove();
const dark = light.clone();
dark.name = "DOCS / Design System — Dark";
dark.x = x; dark.y = y;
dark.setExplicitVariableModeForCollection(theme, darkMode.modeId);
page.appendChild(dark);
return { createdNodeIds: [dark.id] };
```

- [ ] **Step 2: Final checks — rules audit against the checklist**

Run, in order: the Task 5 Step 3 FINDING check (expect empty), the Task 7 Step 1 sweep on the Dark frame (expect empty — a clone can't add bugs, this proves it), and `get_screenshot` at scale 0.25 on: Cover, Light frame, Dark frame, `Foundations · Colors`. Walk `ds-documentation.md`'s "Quick audit checklist" against the screenshots; note any deliberate deviations (single-sheet — justified in design.md) in the task notes.

- [ ] **Step 3: Archive the spec**

```bash
./.specs/specs.sh archive design-system-docs-restructure
git add .specs
git commit -m "docs(specs): archive design-system-docs-restructure — docs restructured per 27-rule methodology"
```

---

## Self-review notes

- **Spec coverage:** every design.md mapping row has a task — Cover (T1), colors redundancy (T2), Elements dissolution + grouping + Sections (T3), token-usage/cross-ref/focus-ring (T4), spacing + motion FINDINGs (T5), readability §2 (T6), visual bugs (T7), dual-theme + closure (T8). Out-of-scope items (Pages responsive, SVG usage, hero visibility) deliberately absent.
- **Row-4 re-verify:** the design's "Colour already leads with role" claim is checked live in Task 4 Step 1, per the analysis note.
- **Icon dual-home:** sizing rules in Foundations (T4 S3), asset set in Components · Buttons (T3 S3 + dedupe rule in T4 S3) — neither dropped.
- **Names used consistently:** `DOCS / Design System — Light`, `CHAPTER / NN <Title>`, `GROUP / <Name>`, `ColorTokenTable`, `SpacingLadder`, `MotionSpecs`, `SECTION / Icons`, `CoverNav` — each defined where created and referenced by the same string later.
- **Known softness:** hex text labels in Task 2 are baked at build time — if a theme token changes later, re-run Task 2 Step 1+2 label update; the swatches themselves stay live-bound.
