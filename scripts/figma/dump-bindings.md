# Figma binding dump — full inventory before the primitives-merge rewrite

Recovery baseline for Task 6 (rewrites ~5,000 variable bindings across the DS
file). Dumps every node field that points at a variable — `node`/`field`/`varId`
(+ `varName`/`col` where the payload allows it) — per page, so a bad rewrite
can be diagnosed against real before-state, not a screenshot.

1. Read the `/figma-use` skill (required before any `use_figma` call this
   session).
2. Run **one `use_figma` call per page**, file `ihWIWmvtQPTWgUxlrVjC2c` ("Blog
   Design System v1.0" — the live DS file since 2026-07-29;
   `Wf4iomVMYUXlFIBV3Z8bx4` is the read-only backup, never write to it). Never
   loop `setCurrentPageAsync` inside one script — one page per call, fan the
   calls out in parallel in a single message.
3. Merge the returned `{ page, byCol, rows }` objects into `bindings.figma.json`
   at repo root, keyed by page name.
4. Commit both this file and `bindings.figma.json`.

## Pages

Six pages are listed in the original plan brief; only **five exist** in the
current v1.0 fork (verified by Task 2, re-confirmed here via
`getNodeByIdAsync` returning `null`):

| Page | id | Status |
|---|---|---|
| 📖 Cover | `0:1` | real |
| 🎨 Foundations | `5:14` | real |
| 🧩 Components | `52:2` | real (named `🧩 Components (back)` in this fork) |
| 🗄️ Legacy | `78:2` | **does not exist — `getNodeByIdAsync` returns `null`. Skip.** |
| 📄 Pages | `44:328` | real |
| Pages Experiment | `442:5352` | real |

## Per-page script

Run once per real page id above, substituting `PAGE_ID`:

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const colById = {};
for (const c of cols) colById[c.id] = c.name;
const cache = {};
async function info(id) {
  if (!cache[id]) {
    const v = await figma.variables.getVariableByIdAsync(id);
    cache[id] = v
      ? { name: v.name, col: colById[v.variableCollectionId] || "?" }
      : { name: "?", col: "?" };
  }
  return cache[id];
}
function collect(obj, field, out) {
  if (!obj || typeof obj !== "object") return;
  if (obj.type === "VARIABLE_ALIAS" && obj.id) {
    out.push({ id: obj.id, field });
    return;
  }
  for (const k of Object.keys(obj))
    collect(obj[k], field === null ? k : field, out);
}
const rows = [],
  byCol = {};
for (const n of page.findAll(() => true)) {
  if (!n.boundVariables) continue;
  const o = [];
  collect(n.boundVariables, null, o);
  for (const a of o) {
    const i = await info(a.id);
    byCol[i.col] = (byCol[i.col] || 0) + 1;
    rows.push({
      node: n.id,
      name: n.name,
      field: a.field,
      varId: a.id,
      varName: i.name,
      col: i.col,
    });
  }
}
return { page: page.name, byCol, rows };
```

## Row-shrinking fallback

The `rows` payload can be unwieldy on pages with thousands of bindings
(`🧩 Components`, `📄 Pages`, `Pages Experiment`). If a page's response is too
large to return in full, drop `name` from each row object — keep only
`node`/`field`/`varId`/`varName`/`col`, which is what a recovery actually
needs (the node's display name is a convenience, not load-bearing: it can
always be re-looked-up from `node` via `getNodeByIdAsync`). Do this by
removing the `name: n.name,` line from the `rows.push(...)` call above before
running that page's script.

## Expected totals (baseline, from Task 2's 2026-07-29 audit)

Merged `byCol` across the 5 real pages (see
`docs/specs/01_active/figma-variables/notes.md`, "Plan 2 — before"):

| Collection | Expected total |
|---|---|
| `2 Theme` (Color) | 5066 |
| `Scale` | 4743 |
| `Radius` | 164 |
| `Typography` | 36 |
| `Container` | 9 |
| `Breakpoint` | 7 |
| `Color Tokens` | 29 |

This supersedes the plan brief's original table (`Color` ~5225, `Scale`
~4834, `Breakpoint` ~9), which predates the `🗄️ Legacy` page's removal from
this file and the `Color` → `2 Theme` collection rename.
