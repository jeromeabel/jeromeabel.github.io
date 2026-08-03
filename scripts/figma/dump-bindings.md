# Figma binding dump — full inventory before the primitives-merge rewrite

Recovery baseline for Task 6 (rewrites ~5,000 variable bindings across the DS
file). Dumps every node field that points at a variable — `node`/`field`/`varId`
(+ `varName`/`col` where the payload allows it) — per page, so a bad rewrite
can be diagnosed against real before-state, not a screenshot.

**`use_figma` silently truncates its output at roughly 20KB** — not an error,
just a cut string, discovered the hard way across three failed rounds trying
one call per page. A page with thousands of bindings (`🧩 Components`,
`📄 Pages`, `Pages Experiment`) never fits in one call's response. The fix
is smaller calls, not a smaller payload shape as a "fallback" — chunking is
mandatory, not an escape hatch for exceptionally large pages.

1. Read the `/figma-use` skill (required before any `use_figma` call this
   session).
2. Per page, fan out **one `use_figma` call per frame/section (or small
   group of frames/sections)**, capped at roughly **≤200 rows per call** —
   never a whole page in one shot once it has more than a couple hundred
   bindings. Use compact row format (`[nodeId, field, varId]` triples, not
   verbose `{node, field, varId}` objects) — this alone cuts payload size
   significantly for the same row count and buys headroom before the 20KB
   wall. All calls for a given fan-out round go in **a single message, in
   parallel** (per the `figma-use` skill's page-fanout rule) — never issued
   sequentially, and never looped inside one script/agent turn. Many
   sequential `use_figma` calls accumulating in one context carry the same
   truncation/thrashing risk as one large call, even when each individual
   call is small.
3. The orchestrating agent — not another `use_figma` call or sub-agent —
   merges the per-chunk results deterministically (plain code/concatenation)
   into `{ page, byCol, rows }` objects, then verifies
   `rows.length === sum(byCol)` (or the per-page total) before treating the
   merged dump as trustworthy. A mismatch means a chunk silently truncated or
   was dropped — re-run that chunk, don't average over the gap.
4. Merge the per-page objects into `bindings.figma.json` at repo root, keyed
   by page name.
5. Commit both this file and `bindings.figma.json`.

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

## Per-chunk script

Run once per frame/section (or small group), substituting `PAGE_ID` and
`ROOT_ID` (the frame/section node to scope the traversal to — swap
`page.findAll` for `root.findAll` once scoped):

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);
const root = await figma.getNodeByIdAsync("ROOT_ID"); // frame/section, not the page
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
// Compact row shape — [nodeId, field, varId] triples, not {node, field, varId}
// objects. Same information, smaller payload, more headroom under the ~20KB
// use_figma response ceiling.
const rows = [],
  byCol = {};
for (const n of root.findAll(() => true)) {
  if (!n.boundVariables) continue;
  const o = [];
  collect(n.boundVariables, null, o);
  for (const a of o) {
    const i = await info(a.id);
    byCol[i.col] = (byCol[i.col] || 0) + 1;
    rows.push([n.id, a.field, a.id]);
  }
}
return { page: page.name, root: root.name, byCol, rows };
```

If a chunk's `rows` still exceeds ~200, split the root further (a section
into its child frames, a large frame into its top-level children) and re-run
— don't fall back to dropping fields from the row shape. The compact triple
is already minimal; the lever that actually works is fewer nodes per call.

## Merging chunks

Plain code in the orchestrating agent, not another tool call:

```js
const merged = {}; // page name -> { byCol, rows }
for (const chunk of allChunkResults) {
  const m = (merged[chunk.page] ??= { byCol: {}, rows: [] });
  m.rows.push(...chunk.rows);
  for (const [col, n] of Object.entries(chunk.byCol))
    m.byCol[col] = (m.byCol[col] || 0) + n;
}
for (const [page, m] of Object.entries(merged)) {
  const sum = Object.values(m.byCol).reduce((a, b) => a + b, 0);
  if (sum !== m.rows.length)
    throw new Error(`${page}: byCol sum ${sum} !== rows.length ${m.rows.length}`);
}
```

Only trust `bindings.figma.json` once every page passes this check.

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
