### Task 5: Spacing and Motion specs tables (FINDINGs 2 and 3)

§4 R5: spacing = specs table (token, rem, px, swatch) + short mechanical rationale. §4 R6: motion = small specs table tied to a **named** philosophy, in-house name, not Carbon's.

**Files:**

- Modify: `CHAPTER / 01 Foundations` — `Spacing` and `Motion` sections

**Interfaces:**

- Consumes: FINDING text-node IDs from Task 4 Step 1; `1 Primitives` and `3 Responsive` collections
- Produces: a `SpacingLadder` table and a `MotionSpecs` table replacing the two FINDING sentences

- [x] **Step 1: Build the spacing ladder from resolved variable values**

Rows lead with **role** (§3 R1). Values are read live from the collections, never typed.

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
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
const prim = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:2013:2",
);
const PM = prim.modes[0].modeId;
const primByName = {};
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  primByName[v.name] = v.valuesByMode[PM];
}
const resp = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:2245:42",
);
const respRow = async (name) => {
  const v = await Promise.all(
    resp.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)),
  ).then((vs) => vs.find((x) => x.name === name));
  const out = {};
  for (const m of resp.modes) {
    let val = v.valuesByMode[m.modeId];
    if (val && val.type === "VARIABLE_ALIAS")
      val = (await figma.variables.getVariableByIdAsync(val.id)).valuesByMode[
        PM
      ];
    out[m.name] = val;
  }
  return out;
};
const rhythm = await respRow("section/rhythm-y");
const gutter = await respRow("container/gutter");
const px = (name) => primByName[name]; // e.g. spacing/2 → 8
const ROWS = [
  [
    "inside a component",
    "spacing/2",
    `${px("spacing/2") / 16}rem`,
    `${px("spacing/2")}px`,
    px("spacing/2"),
  ],
  [
    "between components",
    "spacing/6",
    `${px("spacing/6") / 16}rem`,
    `${px("spacing/6")}px`,
    px("spacing/6"),
  ],
  [
    "between sections",
    "section/rhythm-y",
    "responsive",
    `${rhythm.Desktop} / ${rhythm.Tablet} / ${rhythm.Mobile}px`,
    rhythm.Desktop,
  ],
  [
    "page gutter",
    "container/gutter",
    "responsive",
    `${gutter.Desktop} / ${gutter.Tablet} / ${gutter.Mobile}px`,
    gutter.Desktop,
  ],
];
const table = figma.createAutoLayout("VERTICAL", {
  name: "SpacingLadder",
  itemSpacing: 10,
});
const txt = (chars, family, size, colour, w) => {
  const t = figma.createText();
  t.fontName = { family, style: "Regular" };
  t.characters = String(chars);
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", V[colour]);
  if (w) {
    t.layoutSizingHorizontal = "FIXED";
    t.resize(w, t.height);
  }
  return t;
};
for (const [role, token, rem, pxs, barPx] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", {
    name: `sp-${token}`,
    itemSpacing: 20,
  });
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
table.appendChild(
  txt(
    "4px base, Tailwind multiples. Three roles, three steps — if a gap is not on the ladder, it is a defect.",
    "IBM Plex Sans",
    13,
    "color/foreground-muted",
    640,
  ),
);
const spacing = ch.children.find((n) => /spacing/i.test(n.name));
if (!spacing) return { missing: ["Spacing section in 01 Foundations"] };
spacing.appendChild(table);
table.layoutSizingHorizontal = "FILL";
// Remove the FINDING sentence, keep the validated ladder caption before it.
const finding = spacing.findAll(
  (n) => n.type === "TEXT" && /FINDING:/.test(n.characters),
)[0];
if (finding) {
  await figma.loadFontAsync(finding.fontName);
  finding.characters = finding.characters.replace(/\s*FINDING:.*$/s, "");
}
return { createdNodeIds: [table.id], rows: ROWS.map((r) => r.join(" | ")) };
```

Verify the returned `rows` against expectations: spacing/2=8px, spacing/6=24px, rhythm 96/64/48, gutter 32/24/16. A different number means the collections drifted — investigate before committing.

- [x] **Step 2: Build the motion specs table with a named in-house philosophy**

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
const theme = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:3:2",
);
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
  if (w) {
    t.layoutSizingHorizontal = "FIXED";
    t.resize(w, t.height);
  }
  return t;
};
const table = figma.createAutoLayout("VERTICAL", {
  name: "MotionSpecs",
  itemSpacing: 10,
});
table.appendChild(
  txt("Quiet motion", "IBM Plex Sans", "SemiBold", 16, "color/foreground"),
);
table.appendChild(
  txt(
    "Quick for feedback, eased for travel, still by default. Zero infinite loops; MotionToggle and prefers-reduced-motion gate everything.",
    "IBM Plex Sans",
    "Regular",
    13,
    "color/foreground-muted",
    640,
  ),
);
const ROWS = [
  ["--duration-fast", "150ms", "feedback — hover, focus, toggles"],
  ["--duration-base", "250ms", "movement — reveals, fades"],
  ["--duration-slow", "400ms", "large travel — cover scale"],
  ["--ease-out", "cubic-bezier out", "entering elements decelerate"],
  ["--ease-in-out", "cubic-bezier in-out", "elements that move and settle"],
];
for (const [token, value, use] of ROWS) {
  const row = figma.createAutoLayout("HORIZONTAL", {
    name: `mo-${token}`,
    itemSpacing: 20,
  });
  row.appendChild(
    txt(token, "Fira Code", "Regular", 13, "color/foreground-muted", 170),
  );
  row.appendChild(
    txt(value, "Fira Code", "Regular", 13, "color/foreground", 150),
  );
  row.appendChild(
    txt(use, "IBM Plex Sans", "Regular", 13, "color/foreground-muted", 320),
  );
  table.appendChild(row);
}
motion.appendChild(table);
table.layoutSizingHorizontal = "FILL";
const finding = motion.findAll(
  (n) => n.type === "TEXT" && /FINDING:/.test(n.characters),
)[0];
if (finding) {
  await figma.loadFontAsync(finding.fontName);
  finding.characters = finding.characters
    .replace(/\s*FINDING:.*$/s, "")
    .replace(/--duration-fast.*?\. /s, ""); // numbers now live in the table, not prose
}
return { createdNodeIds: [table.id] };
```

- [x] **Step 3: Verify no FINDING remains anywhere, screenshot, commit**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const left = light.findAll(
  (n) => n.type === "TEXT" && /FINDING:/.test(n.characters),
);
return {
  findingsLeft: left.map((t) => ({
    id: t.id,
    text: t.characters.slice(0, 100),
  })),
};
```

Expected: `findingsLeft` empty. Screenshot the Spacing and Motion sections.

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 5 spacing ladder + quiet-motion specs replace FINDINGs"
```

---
