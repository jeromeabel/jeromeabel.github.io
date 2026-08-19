---
task: P1-T03
title: 1 Primitives — rebind, prune, normalize names
phase: 1
status: PARTIAL — steps 2 and 4 already executed in Figma
---

# P1-T03 — `1 Primitives`: rebind, prune, normalize names

> **Already done, do not repeat:** the 44 exploration ramps (`mauve` / `mist` / `olive` / `taupe`) were pruned, and the 16 `color/brand/*` primitives were given their description. Steps 2 and 4 below are recorded for the trail only. **Run steps 1, 3 and 5.**

**Goal:** `1 Primitives` holds only what Tailwind ships plus the documented brand extension, every name uses `/` separators, and nothing is bound to a variable that is about to disappear.

<!-- include: _run-rules.md -->

---

## Step 1 — Rebind the BLOCKED rows _(run this)_

Gate A reported 0 blocked rows, so this step is expected to be a no-op confirmation. Run it anyway: if a component bound to a to-be-pruned ramp appeared since the gate, pruning would silently break it.

```js
const RAMPS = /^(mauve|mist|olive|taupe)/i;
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === "1 Primitives");
const doomed = new Set();
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (RAMPS.test(v.name.replace(/^color[\/-]/, ""))) doomed.add(v.id);
}
// Any node still pointing at a doomed primitive, directly or via an alias.
const hits = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const n of p.findAll(() => true)) {
    const bv = n.boundVariables || {};
    for (const [prop, val] of Object.entries(bv)) {
      const list = Array.isArray(val) ? val : [val];
      for (const a of list) {
        if (a && a.id && doomed.has(a.id))
          hits.push({ page: p.name, node: n.name, type: n.type, prop });
      }
    }
  }
}
// Cross-collection aliases: a 2 Theme variable pointing at a doomed primitive.
const aliases = [];
for (const c of cols) {
  if (c.name === "1 Primitives") continue;
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const val of Object.values(v.valuesByMode || {}))
      if (val && val.type === "VARIABLE_ALIAS" && doomed.has(val.id))
        aliases.push({ collection: c.name, variable: v.name });
  }
}
return { doomedCount: doomed.size, nodeHits: hits, aliasHits: aliases };
```

**Expected:** `doomedCount: 0` (the prune already happened), `nodeHits: []`, `aliasHits: []`.
If `doomedCount > 0`, the prune did not fully land — report the names and **stop**; do not prune again from this brief.

---

## Step 2 — Prune the exploration ramps · ✅ already done

44 variables matching `mauve|mist|olive|taupe` were removed from `1 Primitives`. Nothing to run.

---

## Step 3 — Normalize dash separators to slash _(run this)_

Renaming a variable does **not** break bindings — bindings resolve by id, not by name. This is safe.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === "1 Primitives");
const out = { renamed: [], untouched: 0, collisions: [] };
const seen = new Set();
const vars = [];
for (const id of prim.variableIds) vars.push(await figma.variables.getVariableByIdAsync(id));
for (const v of vars) seen.add(v.name);
for (const v of vars) {
  if (!v.name.includes("-") ) { out.untouched++; continue; }
  // Only separator dashes become slashes. Dashes *inside* a token step
  // (e.g. `gray-500`) are part of the leaf and stay.
  const next = v.name.replace(/-(?=[a-z]+(?:[\/-]|$))/g, "/");
  if (next === v.name) { out.untouched++; continue; }
  if (seen.has(next)) { out.collisions.push({ from: v.name, to: next }); continue; }
  const from = v.name;
  v.name = next;
  seen.delete(from); seen.add(next);
  out.renamed.push({ from, to: next });
}
return out;
```

`collisions` must be empty. A collision means two variables would end up with the same name — report both, rename neither.

---

## Step 4 — Describe the brand primitives · ✅ already done

The 16 `color/brand/*` variables carry:

> `Brand extension — not derivable from Tailwind. Source: scripts/figma/brand-primitives.json`

Nothing to run.

---

## Step 5 — Read back cold _(run this)_

Fresh run, after everything above:

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === "1 Primitives");
const rows = [];
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  rows.push({ name: v.name, type: v.resolvedType, desc: v.description || "" });
}
rows.sort((a, b) => a.name.localeCompare(b.name));
return {
  total: rows.length,
  withDash: rows.filter((r) => /-(?=[a-z]+(?:[\/-]|$))/.test(r.name)).map((r) => r.name),
  ramps: rows.filter((r) => /^(color\/)?(mauve|mist|olive|taupe)/i.test(r.name)).map((r) => r.name),
  brandDescribed: rows.filter((r) => r.name.startsWith("color/brand/")).map((r) => ({ n: r.name, d: Boolean(r.desc) })),
  rows,
};
```

## Acceptance

- `withDash` is empty.
- `ramps` is empty.
- Every `color/brand/*` row has `d: true`.
- `total` and the full `rows` list go in the report — Claude Code diffs it against `pnpm figma:primitives` on the repo side (`../repo/phase-1.md`).

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T03
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
