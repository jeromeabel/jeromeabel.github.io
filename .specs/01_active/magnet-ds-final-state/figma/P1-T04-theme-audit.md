---
task: P1-T04
title: 2 Theme — orphans, duplicates, renames
phase: 1
status: DONE (2026-08-18)
prerequisite: P1-T03
---

# P1-T04 — `2 Theme`: orphans, duplicates, renames

**Goal:** every variable in `2 Theme` is either referenced by something, or has an explicit verdict. No silent dead weight, no two names for one value.

<!-- include: _run-rules.md -->

---

## Step 1 — Scan for orphans, duplicates and alias chains

One run. This reads every node in the file (archives included, read-only) so an "orphan" verdict is trustworthy.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
const vars = [];
for (const id of theme.variableIds) vars.push(await figma.variables.getVariableByIdAsync(id));

// 1. Direct node references.
const refs = new Map(vars.map((v) => [v.id, 0]));
const where = new Map(vars.map((v) => [v.id, []]));
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const n of p.findAll(() => true)) {
    for (const [prop, val] of Object.entries(n.boundVariables || {})) {
      for (const a of (Array.isArray(val) ? val : [val])) {
        if (a && a.id && refs.has(a.id)) {
          refs.set(a.id, refs.get(a.id) + 1);
          if (where.get(a.id).length < 4) where.get(a.id).push(`${p.name}/${n.name}.${prop}`);
        }
      }
    }
  }
}
// 2. Cross-collection aliases (a 3 Responsive var pointing at a theme var).
for (const c of cols) {
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const val of Object.values(v.valuesByMode || {}))
      if (val && val.type === "VARIABLE_ALIAS" && refs.has(val.id)) {
        refs.set(val.id, refs.get(val.id) + 1);
        where.get(val.id).push(`alias:${c.name}/${v.name}`);
      }
  }
}
// 3. Duplicate resolved values across modes.
const sig = new Map();
const dupes = [];
for (const v of vars) {
  const key = JSON.stringify(
    theme.modes.map((m) => v.valuesByMode[m.modeId]),
  );
  if (sig.has(key)) dupes.push({ a: sig.get(key), b: v.name });
  else sig.set(key, v.name);
}
return {
  total: vars.length,
  orphans: vars.filter((v) => refs.get(v.id) === 0).map((v) => v.name),
  dupes,
  used: vars.map((v) => ({ name: v.name, refs: refs.get(v.id), at: where.get(v.id) })),
};
```

---

## Step 2 — Produce the verdict table

For every row, one of three verdicts. **Write the table into the report** — Claude Code needs it verbatim.

| verdict      | when                                                                                                                                                                                                                | action                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `keep`       | referenced anywhere, or it is a semantic slot code depends on (`color/background`, `color/foreground`, `color/foreground-muted`, `color/foreground-strong`, `color/border`, `color/surface`, `color/surface-hover`) | none                                                      |
| `rename → x` | it duplicates another variable's value and the other name is the canonical one                                                                                                                                      | rename the **non-canonical** one out of the way in Step 3 |
| `archive`    | zero references **and** not a semantic slot                                                                                                                                                                         | Step 3 — see the rule below                               |

**The archive rule for variables:** Figma has no variable archive page. Do **not** delete. Prefix the name with `zz/` (e.g. `zz/color/legacy-accent`) so it sorts to the bottom and reads as retired, and put its old name in the report. Deleting is only allowed once Claude Code confirms nothing in the repo references it.

A semantic slot with zero references is a `keep`, not an `archive` — it means no component has adopted it yet, which is a phase-2 job, not a prune.

---

## Step 3 — Apply

Fill both arrays from your Step 2 table, then run once:

```js
const RENAME = [
  // { from: "color/accent-2", to: "zz/color/accent-2" },
];
const ARCHIVE = [
  // "color/legacy-thing",
];
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
const byName = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  byName[v.name] = v;
}
const out = { renamed: [], archived: [], missing: [] };
for (const r of RENAME) {
  const v = byName[r.from];
  if (!v) { out.missing.push(r.from); continue; }
  v.name = r.to;
  out.renamed.push(r);
}
for (const name of ARCHIVE) {
  const v = byName[name];
  if (!v) { out.missing.push(name); continue; }
  v.name = `zz/${name}`;
  v.description = `Retired ${new Date().toISOString().slice(0, 10)} — zero references at the phase-1 audit. Do not bind.`;
  out.archived.push({ from: name, to: v.name });
}
return out;
```

`missing` must be empty.

---

## Step 4 — Read back cold

Fresh run: re-run Step 1 and confirm the `orphans` list now contains only `zz/`-prefixed names, and `dupes` is empty (or every remaining pair is a deliberate alias you name in the report).

## Acceptance

- Verdict table covers **every** row from Step 1 — no unclassified variables.
- The seven semantic slots above are present and `keep`.
- Nothing was deleted.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T04
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
