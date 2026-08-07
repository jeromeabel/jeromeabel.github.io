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

