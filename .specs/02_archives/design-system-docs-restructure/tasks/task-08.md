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

