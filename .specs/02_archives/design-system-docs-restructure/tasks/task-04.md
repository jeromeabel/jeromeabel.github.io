### Task 4: Foundations chapter — Icons section, Colour cross-reference, focus-ring formula

Closes FINDING 1 (focus-ring/CTA-accent) per §4 R5 and gives icon sizing its Foundations home. Also re-verifies the design's claim that the Colour section already leads with role.

**Files:**

- Modify: `CHAPTER / 01 Foundations` on the Light DOCS frame

**Interfaces:**

- Consumes: chapter/group names from Task 3; `Docs/SpecimenCell` master; live `Icon` set on `🧩 Components`
- Produces: sections inside 01 Foundations ordered `Colour`, `Type`, `Spacing`, `Radius`, `Motion`, `Icons`. Task 5 fills Spacing and Motion.

- [x] **Step 1: Verify the Colour section leads with role, and find the FINDING text**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const ch = light.children.find((n) => n.name === "CHAPTER / 01 Foundations");
if (!ch) return { missing: ["CHAPTER / 01 Foundations"] };
const findings = ch.findAll(
  (n) => n.type === "TEXT" && /FINDING:/.test(n.characters),
);
const colour = ch
  .findAll((n) => n.type === "TEXT")
  .filter((t) => /accent|colour|color\//i.test(t.characters));
return {
  sections: ch.children.map((n) => n.name),
  findingTexts: findings.map((t) => ({
    id: t.id,
    text: t.characters.slice(0, 120),
  })),
  colourTexts: colour.map((t) => ({
    id: t.id,
    text: t.characters.slice(0, 120),
  })),
};
```

Expected: one FINDING about focus-ring/CTA-accent in Colour, one each for Spacing and Motion (Task 5 takes those IDs). If Colour's token mentions lead with raw hex instead of `color/…` role names, that contradicts the design's no-change-needed claim — fix it here by reordering name-first, and note it in the task notes.

- [x] **Step 2: Replace the focus-ring FINDING with formula + hard rule**

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

- [x] **Step 3: Add the Icons section (sizing rules only) with a cross-page link in Colour**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const ch = light.children.find((n) => n.name === "CHAPTER / 01 Foundations");
const theme = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:3:2",
);
const V = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  V[v.name] = v;
}
const compsPage = figma.root.children.find((p) => p.name === "🧩 Components");
const iconSet = compsPage.findOne(
  (n) => n.type === "COMPONENT_SET" && n.name === "Icon",
);
if (!iconSet) return { missing: ["Icon set"] };
const arrow = iconSet.children.find((c) => c.name === "icon=arrow-right");

const sec = figma.createAutoLayout("VERTICAL", {
  name: "SECTION / Icons",
  itemSpacing: 16,
});
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
  const row = figma.createAutoLayout("HORIZONTAL", {
    name: `icon-${size}`,
    itemSpacing: 16,
  });
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
const foundations = figma.root.children.find(
  (p) => p.name === "🎨 Foundations",
);
const colorsFrame = foundations.findOne(
  (n) => n.name === "Foundations · Colors",
);
const link = figma.createText();
link.fontName = { family: "IBM Plex Sans", style: "Regular" };
link.characters =
  "Full token table with Light and Dark values → Foundations · Colors";
link.fontSize = 13;
link.setBoundVariable("fills", V["color/foreground-muted"]);
link.setRangeHyperlink(0, link.characters.length, {
  type: "NODE",
  value: colorsFrame.id,
});
const colourSec = ch.children.find((n) => /colour|color/i.test(n.name));
(colourSec || ch).appendChild(link);
return { createdNodeIds: [sec.id, link.id] };
```

The three icon captions are verbatim decision copy from `decisions.md` — do not reword. If the old Icons cell moved into `Buttons` in Task 3 duplicates these three sizing rows, strip the sizing rows from the Buttons-side cell (keep only the asset-set specimen) so the rule lives once, here.

- [x] **Step 4: Screenshot the chapter, commit**

`get_screenshot` on `CHAPTER / 01 Foundations`. Check: section order `Colour, Type, Spacing, Radius, Motion, Icons` (reorder children by `insertChild` if not), focus-ring text present, no FINDING left in Colour.

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 4 foundations icons + focus-ring formula + colour cross-ref"
```

---
