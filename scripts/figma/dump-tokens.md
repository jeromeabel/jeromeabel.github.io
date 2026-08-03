# Figma token dump — figma-blog-fit

1. Read the `/figma-use` skill (required before any `use_figma` call this session).
2. Run `use_figma` on file `ihWIWmvtQPTWgUxlrVjC2c` ("Blog Design System v1.0" — the live DS file since 2026-07-29; `Wf4iomVMYUXlFIBV3Z8bx4` is the read-only backup) with the script below.
   - **`use_figma` responses are capped around ~20KB.** A single unfiltered
     dump across every collection (`1 Primitives` alone is ~446 variables)
     will truncate mid-response — silently, with no error, just a cut-off
     JSON string. Confirmed 2026-08-03 (Plan 3 Task 3 re-dump, both as
     pretty JSON and as `JSON.stringify` output).
   - **If the dump truncates, split it into multiple `use_figma` calls and
     merge locally**, rather than trying to shrink the script further:
     1. One call per small collection (e.g. `2 Theme`, 20 entries) plus
        text styles — these fit in one response.
     2. For large collections, batch `collection.variableIds.slice(offset,
        offset + N)` across several sequential calls (N ≈ 100–120 worked in
        practice) instead of looping the whole `variableIds` array in one
        script.
     3. Merge the batches locally (a small Node script, not another
        `use_figma` call) into the same `{ collections: [...], textStyles:
        [...] }` shape the script below produces.
     4. Before writing `tokens.figma.json`, verify the merge: total
        variable count matches the collection's live `variableIds.length`,
        and no duplicate variable names across batches. Both checks are
        cheap and catch a mis-sliced batch boundary immediately, rather
        than surfacing later as a spurious `figma:verify` diff.
   - This does not change what gets written — a correctly merged
     multi-call dump is byte-for-byte the same shape as an unrestricted
     one-shot dump would have produced. It's a token-budget workaround, not
     a scope change to the dump itself.
   - **The script below resolves `VARIABLE_ALIAS` chains of any depth,
     regardless of the aliased variable's type.** An earlier version only
     resolved the hop when the *referenced* variable was `COLOR` (formatting
     it as hex); any other type — e.g. a `FLOAT` alias, such as `3
     Responsive`'s variables pointing into `1 Primitives` — was left as an
     unresolved `{ alias: "<name>" }` object. `diff-tokens.mjs` expects
     `v.value` to already be a plain number/string, so that shape reported as
     a false Missing/Mismatch. Confirmed and fixed 2026-08-03 (Plan 3 Task 6).
3. Save the returned (or merged) JSON to `tokens.figma.json` at repo root.
4. Run `pnpm figma:verify` and record verdicts in
   `docs/specs/02_archives/figma-variables/notes.md` (not
   `scripts/figma/notes.md` — that file is generator-conversion notes, not
   the migration execution log).

```js
const hex = (c) =>
  "#" +
  ["r", "g", "b"]
    .map((k) => Math.round(c[k] * 255).toString(16).padStart(2, "0"))
    .join("");

// Resolves through a VARIABLE_ALIAS chain of any depth (capped at 5 hops as
// a runaway guard) until it lands on a concrete value, regardless of the
// resolvedType at each hop. Only the *final* variable's resolvedType decides
// COLOR formatting — intermediate hops (e.g. a FLOAT alias into a primitive)
// must not be short-circuited to `{ alias: name }`, or diff-tokens.mjs (which
// expects `v.value` to already be a plain number/string) reports every such
// token as a false mismatch/missing. Confirmed live 2026-08-03 (Plan 3 Task 6):
// `3 Responsive`'s 4 variables are FLOAT aliases one hop into `1 Primitives`
// (e.g. `container/max-width` → `breakpoint/xl`) — the prior COLOR-only hop
// left them as unresolved `{ alias: "breakpoint/xl" }` objects.
async function resolveValue(startVar, modeId) {
  let v = startVar;
  let value = v.valuesByMode[modeId];
  let hops = 0;
  while (value && value.type === "VARIABLE_ALIAS" && hops < 5) {
    v = await figma.variables.getVariableByIdAsync(value.id);
    value = v.valuesByMode[Object.keys(v.valuesByMode)[0]];
    hops++;
  }
  if (v.resolvedType === "COLOR" && value) return hex(value);
  return value;
}

const out = { collections: [], textStyles: [] };
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const multiMode = c.modes.length > 1;
  const vars = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const m of c.modes) {
      vars.push({
        name: multiMode ? `${m.name}/${v.name}` : v.name,
        type: v.resolvedType,
        value: await resolveValue(v, m.modeId),
        description: v.description,
      });
    }
  }
  out.collections.push({
    name: c.name,
    modes: c.modes.map((m) => m.name),
    variables: vars,
  });
}
for (const s of await figma.getLocalTextStylesAsync())
  out.textStyles.push({
    name: s.name,
    fontSize: s.fontSize,
    fontName: s.fontName,
  });
return out;
```

## Geometry read (Task 9)

Produces `geometry.figma.json`, addressable by the same manifest `id` used in
`geometry.web.json` (Task 8) so `diff-geometry.mjs` (Task 10) can compare them directly.

1. `get_metadata`/`use_figma` inventory pass — list pages, then the target page's
   top-level sections, to scope node IDs (token economy; don't traverse the whole file
   blind). File id `ihWIWmvtQPTWgUxlrVjC2c`, `🧩 Components (back)` page `52:2` (v1.0 also has a
   newer `Components (new)` page at `461:759` — confirm which one the run targets).
2. One batched `use_figma` traversal reads a fixed prop subset per master/instance root
   node — mirrors `extract-web-geometry.mjs`'s `PROPS` list, sourced from Plugin API
   properties instead of `getComputedStyle`:
   - `width` ← `node.width`, formatted `"${n}px"`
   - `borderRadius` ← `node.cornerRadius` (only if numeric — mixed corner radii are skipped)
   - `backgroundColor` ← first visible `SOLID` fill, `rgb(r*255, g*255, b*255)`
   - `borderTopColor` ← first visible `SOLID` stroke, same rgb formatting
   - `paddingTop/Right/Bottom/Left`, `gap` ← only when `node.layoutMode !== "NONE"`
     (non-auto-layout nodes have no meaningful padding/gap, same as web's `getComputedStyle`
     returning `"normal"`/`"0px"` defaults on non-flex elements — omitted rather than guessed)
   - `fontSize`, `fontFamily` (`fontName.family`), `fontWeight`, `color` ← only when the
     node itself is `TEXT` (matches the web extractor reading the root element's own
     computed font, not a descendant's)
3. Save the returned `{ "<manifest-id>": { root: {...} } }` map to `geometry.figma.json`
   at repo root.
4. Run `node scripts/figma/diff-geometry.mjs geometry.web.json geometry.figma.json` (Task 10)
   and record the worklist in `notes.md`.

**Script (adapt node-id list per run — re-derive from a fresh inventory pass, IDs are
volatile):**

```js
const targets = [
  { manifestId: "app-header--default", nodeId: "41:3" },
  // ...one entry per manifest id with a matching Figma master, from the inventory pass
];

const rgb = (c) => `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;
const px = (n) => `${n}px`;

async function readRoot(node) {
  const props = { width: px(node.width) };
  if (typeof node.cornerRadius === "number") props.borderRadius = px(node.cornerRadius);
  if (Array.isArray(node.fills) && node.fills.length) {
    const solid = node.fills.find((f) => f.type === "SOLID" && f.visible !== false);
    if (solid) props.backgroundColor = rgb(solid.color);
  }
  if (Array.isArray(node.strokes) && node.strokes.length) {
    const solid = node.strokes.find((s) => s.type === "SOLID" && s.visible !== false);
    if (solid) props.borderTopColor = rgb(solid.color);
  }
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    props.paddingTop = px(node.paddingTop);
    props.paddingRight = px(node.paddingRight);
    props.paddingBottom = px(node.paddingBottom);
    props.paddingLeft = px(node.paddingLeft);
    props.gap = px(node.itemSpacing);
  }
  if (node.type === "TEXT") {
    if (typeof node.fontSize === "number") props.fontSize = px(node.fontSize);
    if (node.fontName && node.fontName !== figma.mixed) props.fontFamily = node.fontName.family;
    if (typeof node.fontWeight === "number") props.fontWeight = String(node.fontWeight);
    if (Array.isArray(node.fills) && node.fills.length) {
      const solid = node.fills.find((f) => f.type === "SOLID" && f.visible !== false);
      if (solid) props.color = rgb(solid.color);
    }
  }
  return props;
}

const result = {};
for (const t of targets) {
  const node = await figma.getNodeByIdAsync(t.nodeId);
  if (!node) continue;
  result[t.manifestId] = { root: await readRoot(node) };
}
return result;
```
