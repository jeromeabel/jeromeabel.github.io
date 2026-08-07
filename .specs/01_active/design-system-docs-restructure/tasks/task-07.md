### Task 7: Visual-bug sweep — white backgrounds and frame overflow

Execution defects from the user review: content outside frames, default-white fills. Sweep Cover, DOCS Light, and `Foundations · Colors`.

**Files:**

- Modify: `📖 Cover`, `📚 Docs` Light frame, `Foundations · Colors`

**Interfaces:**

- Consumes: finished content from Tasks 1–6
- Produces: zero unbound white fills, zero children escaping their parent's bounds; the sweep script is reused in Task 8

- [x] **Step 1: Sweep one page (run three times, once per page — never loop pages in one call)**

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

- [x] **Step 2: Fix per finding**

`whiteFills`: if the node is a container that should show the page colour → `setBoundVariable("fills", color/background)`; if it needs no fill at all → `fills = []`. Decide per node from the screenshot, never blanket-apply. `overflow`: give the parent auto-layout (or `FILL` sizing to the child) so content is contained — resize at the *master* if the offender is inside a component instance. Re-run Step 1 per page until both lists are empty.

- [x] **Step 3: Commit**

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 7 white-fill and overflow sweep clean"
```

---

