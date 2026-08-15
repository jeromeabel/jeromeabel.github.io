### Task 2: Collapse `Foundations · Colors` to one light+dark-inline table

Rule §3 R3: one row per token, Light and Dark inline — never a table per theme. Rule §3 R1: rows lead with semantic name/role, value alongside. Confirmed violation: frame `6:2` holds two full 12-swatch grids (`Light` `6:4`, `Dark` `6:39`).

**Files:**

- Modify: `🎨 Foundations` page (`5:14`), frame `Foundations · Colors` (`6:2`)

**Interfaces:**

- Consumes: `2 Theme` color variables
- Produces: a `ColorTokenTable` frame — one row per color token: name (mono) · role sentence · Light swatch+hex · Dark swatch+hex. Swatches stay **variable-bound** inside per-mode wrappers, so a token edit updates the docs. Task 4 links to this frame.

- [x] **Step 1: Read the theme's color tokens and resolve both mode values to hex**

```js
const page = figma.root.children.find((p) => p.name === "🎨 Foundations");
await figma.setCurrentPageAsync(page);
const theme = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:3:2",
);
const modes = Object.fromEntries(theme.modes.map((m) => [m.name, m.modeId]));
const hex = (c) =>
  "#" +
  [c.r, c.g, c.b]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
const resolve = async (val) => {
  while (val && val.type === "VARIABLE_ALIAS") {
    const t = await figma.variables.getVariableByIdAsync(val.id);
    const col = await figma.variables.getVariableCollectionByIdAsync(
      t.variableCollectionId,
    );
    val = t.valuesByMode[col.defaultModeId] ?? Object.values(t.valuesByMode)[0];
  }
  return val;
};
const out = [];
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.resolvedType !== "COLOR") continue;
  out.push({
    id: v.id,
    name: v.name,
    description: v.description || "",
    light: hex(await resolve(v.valuesByMode[modes.Light])),
    dark: hex(await resolve(v.valuesByMode[modes.Dark])),
  });
}
return { count: out.length, tokens: out };
```

Expected: 12 color tokens. Record the list — Step 2 bakes the hex strings into text labels. If a token's `description` is empty, Step 2's ROLE map must cover it; anything uncovered goes in the returned `noRole` list for a manual caption before Step 3.

- [x] **Step 2: Build the single table**

```js
const page = figma.root.children.find((p) => p.name === "🎨 Foundations");
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
const frame = page.findOne((n) => n.name === "Foundations · Colors");
if (!frame) return { missing: ["Foundations · Colors"] };
const theme = await figma.variables.getVariableCollectionByIdAsync(
  "VariableCollectionId:3:2",
);
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
  "color/foreground-muted":
    "Secondary text — metadata, captions, rest-state nav.",
  "color/surface": "Raised panels: footer, code blocks.",
  "color/surface-hover":
    "Hover fill for rows, secondary buttons, icon buttons.",
  "color/border": "Hairlines and card borders.",
  "color/accent":
    "Single teal accent. Budget: serie chips, section CTAs, active nav, focus rings, hover underline decoration.",
};
const TOKENS = []; // REPLACE with Step 1's token list [{name, light, dark, description}, ...]
const txt = (chars, family, style, size, w) => {
  const t = figma.createText();
  t.fontName = { family, style };
  t.characters = chars;
  t.fontSize = size;
  t.textAutoResize = "HEIGHT";
  t.setBoundVariable("fills", vars["color/foreground"]);
  if (w) {
    t.layoutSizingHorizontal = "FIXED";
    t.resize(w, t.height);
  }
  return t;
};
const swatch = (tokenName, modeName, hexLabel) => {
  // Wrapper pins the mode so Light and Dark render side by side; the fill stays bound.
  const wrap = figma.createAutoLayout("HORIZONTAL", {
    name: `swatch-${modeName}`,
    itemSpacing: 8,
  });
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
const table = figma.createAutoLayout("VERTICAL", {
  name: "ColorTokenTable",
  itemSpacing: 12,
});
const noRole = [];
for (const tk of TOKENS) {
  const role = tk.description || ROLE[tk.name];
  if (!role) noRole.push(tk.name);
  const row = figma.createAutoLayout("HORIZONTAL", {
    name: `row-${tk.name}`,
    itemSpacing: 24,
  });
  row.counterAxisAlignItems = "CENTER";
  row.appendChild(txt(tk.name, "Fira Code", "Regular", 13, 220));
  row.appendChild(
    txt(role || "TODO role", "IBM Plex Sans", "Regular", 13, 380),
  );
  row.appendChild(swatch(tk.name, "Light", tk.light));
  row.appendChild(swatch(tk.name, "Dark", tk.dark));
  table.appendChild(row);
}
// Chain note per §3 R2.
const note = txt(
  "Primitives are reference-only — never use them directly. Chain: primitive → semantic (this table) → component.",
  "IBM Plex Sans",
  "Regular",
  13,
  700,
);
table.appendChild(note);
frame.appendChild(table);
return { createdNodeIds: [table.id], rows: TOKENS.length, noRole };
```

Expected: `rows: 12`, `noRole` empty (fill any listed role by hand in a follow-up call before continuing).

- [x] **Step 3: Delete the two old grids, verify, screenshot**

```js
const page = figma.root.children.find((p) => p.name === "🎨 Foundations");
await figma.setCurrentPageAsync(page);
const frame = page.findOne((n) => n.name === "Foundations · Colors");
const table = frame.findOne((n) => n.name === "ColorTokenTable");
if (!table || table.children.length < 12)
  return { missing: ["ColorTokenTable with 12 rows"] };
const removed = [];
for (const name of ["Light", "Dark"]) {
  const grid = frame.children.find((n) => n.name === name && n.id !== table.id);
  if (grid) {
    removed.push({ id: grid.id, name });
    grid.remove();
  }
}
await frame.screenshot({ scale: 1 });
return { removed, remaining: frame.children.map((n) => n.name) };
```

Guard: the delete only runs after the table exists with 12 rows. Check the screenshot: one table, both hex columns legible, no leftover grid, no white unbound background (frame fill must be bound or empty).

- [x] **Step 4: Commit**

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 2 colors page single-source table"
```

---
