## Run rules — read before you touch anything

- File: **Magnet-DS** (`ihWIWmvtQPTWgUxlrVjC2c`). Work in this file only.
- Resolve every target **by name**. IDs in this brief are hints, never truth. A name you cannot find is a **STOP** — report it, do not improvise a substitute.
- Enumerate pages with `figma.root.children` + `await p.loadAsync()`. Do not trust a cached or metadata page list — it is stale on this file.
- Skip any page whose name starts with `🗄️`. Archives are immutable: never rename, move, reopen or delete anything inside them.
- Write to **masters** (`COMPONENT` / `COMPONENT_SET`), never to instances. Local overrides of container geometry are a defect, not a fix.
- One batched run per step. After a write, **read back in a separate run** — geometry read in the same tick is stale.
- **Nothing human-designed is ever deleted.** Retirement = move to an archive page.
- **No raw values.** Colors, font sizes, spacing and radii bind to variables. Anything you genuinely cannot bind goes into the report under `UNBOUND:` with its node name.
- `3 Responsive` (18 vars) is settled. Do not add, rename or re-value anything in it.
- The `Design System` meta collection (`ds/version`, `ds/last-updated`) is exempt from every audit and every prune.

**Collections** (ids are hints): `1 Primitives` single mode · `2 Theme` modes `Light` / `Dark` · `3 Responsive` modes `Desktop` / `Tablet` / `Mobile`.

**Seven domains:** `app` · `ui` · `blog` · `work` · `hero` · `contact` · `about`. Master names are `domain/Component`, PascalCase leaf, no role suffix. Variant axis names are lowercase: `variant`, `size`, `type`, `state`, `breakpoint`, `side`, `facts`.
