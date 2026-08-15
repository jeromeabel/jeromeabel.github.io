### Task 3: Dissolve the Elements chapter — new spine with five component groups and a Sections chapter

Rule §1 R2: no Elements/Primitives tier — one flat Components list, grouped meaningfully. Rule §1 R3: composite assemblies (Sections) are a legitimate separate chapter. Biggest task of the plan (~25 specimen cells + 7 decision cards move).

**Files:**

- Modify: `📚 Docs` (`2545:671`) — Light frame `DOCS / Design System — Light` only

**Interfaces:**

- Consumes: the re-home mapping table from the reference section (verbatim); `Docs/ChapterHeader` master
- Produces: chapters named `CHAPTER / 00 Read me`, `CHAPTER / 01 Foundations`, `CHAPTER / 02 Components`, `CHAPTER / 03 Sections`, `CHAPTER / 04 Pages`; inside 02, group frames `GROUP / Buttons`, `GROUP / Navigation`, `GROUP / Metadata & Text`, `GROUP / Cards`, `GROUP / Hero & Contact`. Tasks 4–7 operate on these names.

- [x] **Step 1: Inventory current chapters and index every movable block**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
if (!light) return { missing: ["DOCS / Design System — Light"] };
const chapters = light.children.filter((n) => n.name.startsWith("CHAPTER /"));
const index = [];
for (const ch of chapters) {
  const cells = ch.findAll(
    (n) => n.type === "INSTANCE" && n.name === "Docs/SpecimenCell",
  );
  const cards = ch.findAll(
    (n) => n.type === "INSTANCE" && n.name.startsWith("Docs/DecisionCard"),
  );
  const cellRows = [];
  for (const c of cells) {
    const label = c.findOne((n) => n.name === "label" && n.type === "TEXT");
    cellRows.push({ id: c.id, label: label ? label.characters : "?" });
  }
  index.push({
    chapter: ch.name,
    id: ch.id,
    cells: cellRows,
    cards: cards.map((c) => ({
      id: c.id,
      head: (c.findOne((n) => n.type === "TEXT") || {}).characters,
    })),
    otherChildren: ch.children.map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
    })),
  });
}
return index;
```

Diff the returned cell labels against the mapping table. Any label in the mapping with no live cell, or any cell with no mapping row, stops the task — resolve the discrepancy (renamed master, missed specimen) before moving anything. Note especially whether an `Icon` cell exists; if the icon _asset set_ was never given a cell, add one in Step 3.

- [x] **Step 2: Rename chapters and create the new containers**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Bubbler One", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const kit = page.findOne((n) => n.name === "SECTION / Docs kit");
const chHeadMaster = kit.findOne(
  (n) => n.type === "COMPONENT" && n.name === "Docs/ChapterHeader",
);
if (!chHeadMaster) return { missing: ["Docs/ChapterHeader"] };
const byName = (name) => light.children.find((n) => n.name === name);

const tokens = byName("CHAPTER / 01 Tokens");
if (tokens) tokens.name = "CHAPTER / 01 Foundations";

const comps = byName("CHAPTER / 03 Components");
if (!comps) return { missing: ["CHAPTER / 03 Components"] };
comps.name = "CHAPTER / 02 Components";

// New 03 Sections chapter, inserted after 02 Components.
const sections = figma.createAutoLayout("VERTICAL", {
  name: "CHAPTER / 03 Sections",
  itemSpacing: 48,
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
await setTxt(
  sHead,
  "summary",
  "Composite assemblies — a section is components arranged with the spacing and background rules applied.",
);
light.insertChild(light.children.indexOf(comps) + 1, sections);
sections.layoutSizingHorizontal = "FILL";

// Five group frames inside 02 Components, each with an H2-weight heading.
const V = {};
const theme = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:3:2",
);
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const created = [sections.id];
for (const g of [
  "Buttons",
  "Navigation",
  "Metadata & Text",
  "Cards",
  "Hero & Contact",
]) {
  const grp = figma.createAutoLayout("VERTICAL", {
    name: `GROUP / ${g}`,
    itemSpacing: 32,
  });
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
const head02 = comps.findOne(
  (n) => n.type === "INSTANCE" && n.name === "Docs/ChapterHeader",
);
if (head02) {
  await setTxt(head02, "number", "02");
  await setTxt(head02, "title", "Components");
  await setTxt(
    head02,
    "summary",
    "The flat component list, grouped by what a reader is looking for. Every specimen is a live instance.",
  );
}
const head01 =
  tokens &&
  tokens.findOne(
    (n) => n.type === "INSTANCE" && n.name === "Docs/ChapterHeader",
  );
if (head01) {
  await setTxt(head01, "number", "01");
  await setTxt(head01, "title", "Foundations");
}
return { createdNodeIds: created };
```

- [x] **Step 3: Move every cell and card to its mapped home**

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
  "Link/CTA": grp("Buttons"),
  "Link/Secondary": grp("Buttons"),
  "Link/SecondarySm": grp("Buttons"),
  "Link/TextCTA": grp("Buttons"),
  "Link/Icon": grp("Buttons"),
  ThemeToggle: grp("Buttons"),
  MotionToggle: grp("Buttons"),
  Icon: grp("Buttons"),
  NavLink: grp("Navigation"),
  NavLinkHome: grp("Navigation"),
  H1: grp("Metadata & Text"),
  H2: grp("Metadata & Text"),
  PreviewTitle: grp("Metadata & Text"),
  PageDescription: grp("Metadata & Text"),
  PostMetadataTime: grp("Metadata & Text"),
  PostMetadataTopic: grp("Metadata & Text"),
  SerieMeta: grp("Metadata & Text"),
  PostRow: grp("Cards"),
  SerieCard: grp("Cards"),
  PostCardPreviewBig: grp("Cards"),
  PostCardPreviewSmall: grp("Cards"),
  WorkCardPreviewSmall: grp("Cards"),
  HeroText: grp("Hero & Contact"),
  HeroAnimation: grp("Hero & Contact"),
  ContactContent: grp("Hero & Contact"),
  Header: sections,
  Footer: sections,
  Hero: sections,
  BlogPreviewSection: sections,
  ArchiveTable: sections,
  SerieCardList: sections,
  WorkPreviewSection: sections,
  ContactPreviewSection: sections,
};
const moved = [],
  unmoved = [];
const cells = light.findAll(
  (n) => n.type === "INSTANCE" && n.name === "Docs/SpecimenCell",
);
for (const c of cells) {
  const label = c.findOne((n) => n.name === "label" && n.type === "TEXT");
  const key = label && label.characters.split(" ")[0].split(" ·")[0];
  // exact match first, then prefix (labels may read "Link/CTA · full (pressable)")
  const dest =
    DEST[label && label.characters] ||
    Object.entries(DEST).find(
      ([k]) => label && label.characters.startsWith(k),
    )?.[1];
  if (!dest) {
    unmoved.push(label ? label.characters : c.id);
    continue;
  }
  dest.appendChild(c);
  c.layoutSizingHorizontal = "FILL";
  moved.push(c.id);
}
// Decision cards move by their heading text.
const CARD_DEST = {
  Hover: comps,
  Buttons: grp("Buttons"),
  Numbers: grp("Metadata & Text"),
  Border: grp("Cards"),
  Illustration: grp("Hero & Contact"),
  Backgrounds: sections,
};
const cards = light.findAll(
  (n) => n.type === "INSTANCE" && n.name.startsWith("Docs/DecisionCard"),
);
for (const card of cards) {
  const head = card.findOne((n) => n.type === "TEXT");
  const key = Object.keys(CARD_DEST).find(
    (k) => head && head.characters.startsWith(k),
  );
  if (!key) continue; // Radius/Type/Spacing/Colour/Motion stay in 01 Foundations
  const dest = CARD_DEST[key];
  if (key === "Hover")
    dest.insertChild(1, card); // directly under the chapter header
  else dest.insertChild(1, card); // directly under the group heading
  card.layoutSizingHorizontal = "FILL";
  moved.push(card.id);
}
return { mutatedNodeIds: moved, movedCount: moved.length, unmoved };
```

Expected: `unmoved` empty. If the `Icon` asset-set cell did not exist (Step 1 finding), create one now: `Docs/SpecimenCell` instance in `GROUP / Buttons`, label `Icon`, a live `Icon` instance (variant `icon=arrow-right`) in its `slot`, caption verbatim-new: `The flat asset set. Sizing rules live in 01 Foundations — 16 inline, 20 buttons and nav, 24 standalone.`

- [x] **Step 4: Delete the emptied Elements chapter**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const el = light.children.find((n) => n.name === "CHAPTER / 02 Elements");
if (!el) return { missing: ["CHAPTER / 02 Elements (already gone?)"] };
const leftover = el.findAll((n) => n.type === "INSTANCE");
if (leftover.length)
  return { blocked: leftover.map((n) => ({ id: n.id, name: n.name })) };
el.remove();
return {
  removed: "CHAPTER / 02 Elements",
  spine: light.children
    .filter((n) => n.name.startsWith("CHAPTER /"))
    .map((n) => n.name),
};
```

Guard: refuses to delete while any instance is still inside. Expected spine, in order: `00 Read me`, `01 Foundations`, `02 Components`, `03 Sections`, `04 Pages`.

- [x] **Step 5: Update the Read-me intro's spine sentence**

The `00 Read me` intro ends "…tokens, then elements, then components, then whole pages." That sentence is connective prose (not validated decision copy), so it may be rewritten:

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const readme = light.children.find((n) => n.name === "CHAPTER / 00 Read me");
const intro = readme
  .findAll((n) => n.type === "TEXT")
  .find((t) => /then elements/.test(t.characters));
if (!intro) return { missing: ["intro sentence mentioning elements"] };
await figma.loadFontAsync(intro.fontName);
intro.characters = intro.characters.replace(
  /Read top to bottom.*$/,
  "Read top to bottom: foundations, then components, then sections, then whole pages.",
);
return { mutatedNodeIds: [intro.id] };
```

- [x] **Step 6: Screenshot the whole Light frame and commit**

`get_screenshot` on `DOCS / Design System — Light`, scale 0.25. Check: five chapters in order, five visible group headings inside 02, no orphaned cells floating outside a chapter, no collapsed (zero-height) frames.

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 3 elements tier dissolved into grouped components + sections"
```

---
