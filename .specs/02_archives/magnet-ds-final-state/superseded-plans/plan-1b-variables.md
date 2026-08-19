---
title: Phase 1 · Tasks 3–4 — 1 Primitives and 2 Theme audits
created: 2026-08-17
phase: 1 of 3
part: b of d
---

# Phase 1 · Tasks 3–4 — 1 Primitives and 2 Theme audits

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-1-foundations.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 3–4.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 3: `1 Primitives` — prune exploration ramps, keep and document brand

**Files:**

- Modify: Figma collection `1 Primitives`
- Modify: `.specs/01_active/magnet-ds-final-state/inventory.md` (§Primitives-audit gets an "after" column)
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Gate A (PRUNE-SAFE / BLOCKED verdicts per variable).
- Produces: a `1 Primitives` collection whose non-Tailwind content is exactly `color/brand/*`. Task 4's `2 Theme` audit assumes no alias points at a deleted primitive.

- [ ] **Step 1: Rebind anything Gate A marked BLOCKED**

For each BLOCKED row, the referencing `2 Theme` / `3 Responsive` variable must first alias a kept primitive. Pick the closest kept value from `color/brand/*` or the Tailwind ramp and record the substitution in `progress.md` with both hex values. If a BLOCKED row has no defensible substitute, **keep the primitive** and record it in `progress.md` as a deliberate exception — deleting a referenced variable turns bound instances into raw values, which is exactly the debt this audit exists to remove.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const byName = {};
for (const c of cols)
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    byName[`${c.name}::${v.name}`] = v;
  }

// One entry per BLOCKED row from Gate A, filled in from inventory.md.
const REBIND = [
  // { consumer: "2 Theme::color/accent", newTarget: "1 Primitives::color/brand/lime-500" },
];
const out = [];
for (const r of REBIND) {
  const consumer = byName[r.consumer];
  const target = byName[r.newTarget];
  if (!consumer || !target) throw new Error(`missing: ${r.consumer} / ${r.newTarget}`);
  const col = cols.find((c) => c.id === consumer.variableCollectionId);
  for (const m of col.modes)
    consumer.setValueForMode(
      m.modeId,
      figma.variables.createVariableAlias(target),
    );
  out.push({ consumer: consumer.name, now: target.name });
}
return out;
```

- [ ] **Step 2: Prune the four exploration ramps**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === "1 Primitives");
const PRUNE = ["mauve", "mist", "olive", "taupe"];
const removed = [],
  kept = [];
for (const id of prim.variableIds.slice()) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!PRUNE.some((p) => v.name.toLowerCase().includes(p))) continue;
  try {
    v.remove();
    removed.push(v.name);
  } catch (e) {
    kept.push({ name: v.name, error: String(e) });
  }
}
return { removed, kept };
```

Any name landing in `kept` is still referenced — stop, resolve the reference, re-run. Do not force.

- [ ] **Step 3: Normalize dash → slash naming on the survivors**

Figma groups variables by `/`. Dash-named leftovers (e.g. `color-brand-lime-500`) sit outside their group and are invisible in the picker.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === "1 Primitives");
const renamed = [];
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name.includes("/")) continue; // already grouped
  const next = v.name.replace(/-/g, "/");
  if (next === v.name) continue;
  const before = v.name;
  v.name = next;
  renamed.push({ before, after: next });
}
return renamed;
```

A rename that throws means the target name is taken — that is a real duplicate. Record both variables in `progress.md`, keep the bound one, delete the orphan only if Gate A shows zero references.

- [ ] **Step 4: Document the brand extension**

`color/brand/*` (gray incl. 300/650/750, lime incl. 150/250) is deliberately non-Tailwind — it is the brand extension, and `scripts/figma/brand-primitives.json` is its code-side source. Add one description line to each brand variable so the picker explains itself:

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find((c) => c.name === "1 Primitives");
const touched = [];
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v.name.startsWith("color/brand/")) continue;
  v.description =
    "Brand extension — not derivable from Tailwind. Source: scripts/figma/brand-primitives.json";
  touched.push(v.name);
}
return touched;
```

- [ ] **Step 5: Prove the ramp count against code**

```bash
pnpm figma:primitives
```

Then compare the generated `primitives.json` key list against §Primitives-audit "after". Every Tailwind-derived name in Figma must appear in `primitives.json`; every extra must be `color/brand/*`. Write the two lists' diff into `progress.md`. A non-empty "extra, not brand" list is a finding to fix now, not later — that is precisely the drift this audit removes.

- [ ] **Step 6: Log and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/inventory.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — 1 Primitives prune + brand documentation"
```

---

### Task 4: `2 Theme` — orphans, duplicates, semantic renames

**Files:**

- Modify: Figma collection `2 Theme`
- Modify: `scripts/figma/token-map.json` (only if a rename breaks a mapped path)
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Theme-audit.
- Produces: a `2 Theme` collection where every variable is (a) referenced by at least one node or another variable, and (b) named for its semantic role. Phase 2's new masters bind to these names.

- [ ] **Step 1: Find orphans and unbound duplicates**

```js
figma.skipInvisibleInstanceChildren = true;
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");

// usage: every boundVariables entry on every node of every page
const used = new Set();
for (const p of figma.root.children) {
  await p.loadAsync();
  const all = p.findAll(() => true);
  for (const n of all) {
    const bv = n.boundVariables || {};
    for (const k of Object.keys(bv)) {
      const entry = bv[k];
      const list = Array.isArray(entry) ? entry : [entry];
      for (const e of list) if (e && e.id) used.add(e.id);
    }
    if ("fills" in n && Array.isArray(n.fills))
      for (const f of n.fills)
        if (f.boundVariables && f.boundVariables.color)
          used.add(f.boundVariables.color.id);
  }
}
// plus aliases from other collections
for (const c of cols)
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const m of c.modes) {
      const val = v.valuesByMode[m.modeId];
      if (val && val.type === "VARIABLE_ALIAS") used.add(val.id);
    }
  }

const report = [];
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const vals = {};
  for (const m of theme.modes) {
    const raw = v.valuesByMode[m.modeId];
    vals[m.name] =
      raw && raw.type === "VARIABLE_ALIAS"
        ? (await figma.variables.getVariableByIdAsync(raw.id)).name
        : JSON.stringify(raw);
  }
  report.push({ name: v.name, id: v.id, used: used.has(v.id), vals });
}
// duplicates = same resolved value pair in both modes
const seen = {};
for (const r of report) {
  const key = JSON.stringify(r.vals);
  (seen[key] = seen[key] || []).push(r.name);
}
return {
  report,
  duplicates: Object.values(seen).filter((g) => g.length > 1),
};
```

- [ ] **Step 2: Decide each finding, and write the decision down before writing to Figma**

Add a §Theme-audit-verdicts table to `progress.md`, one row per variable: `keep` / `rename → <new>` / `archive`. Rules:

- `used: false` **and** semantically covered by another variable → archive (delete; a variable has no visual footprint to preserve, and Task 1's inventory is its record).
- `used: false` but named for a role the system will need in phase 2 (e.g. a prose or share-button color) → keep, and note which phase-2 master will bind it.
- duplicate group → keep the one whose name states the _role_ (`color/foreground-muted`), archive the one naming the _value_ (`color/gray-500`), after rebinding.
- rename only where the new name is more semantic. Never rename to a shorter alias of the same word.

- [ ] **Step 3: Apply renames and deletions**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const theme = cols.find((c) => c.name === "2 Theme");
const byName = {};
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  byName[v.name] = v;
}

// Filled in from the §Theme-audit-verdicts table.
const RENAME = [
  // { from: "color/gray-fg", to: "color/foreground-muted" },
];
const ARCHIVE = [
  // "color/unused-thing",
];

const done = { renamed: [], removed: [], failed: [] };
for (const r of RENAME) {
  const v = byName[r.from];
  if (!v) {
    done.failed.push(`missing ${r.from}`);
    continue;
  }
  v.name = r.to;
  done.renamed.push(r);
}
for (const n of ARCHIVE) {
  const v = byName[n];
  if (!v) {
    done.failed.push(`missing ${n}`);
    continue;
  }
  try {
    v.remove();
    done.removed.push(n);
  } catch (e) {
    done.failed.push(`${n}: ${String(e)}`);
  }
}
return done;
```

Renaming a variable **keeps** every binding (bindings are by id), so instances need no rebind. That is why renames are safe here and node renames in Task 5 are, too.

- [ ] **Step 4: Re-prove the token pipeline**

```bash
pnpm figma:verify
```

`figma:verify` diffs code tokens against `tokens.figma.json` through `scripts/figma/token-map.json`. It needs a fresh dump, so first: Figma **File > Export** → `pnpm figma:dump <file.fig>`.

Expected: no new "Missing in Figma" rows. If a rename broke a mapped path, fix `token-map.json` (the map's job is to express the code↔Figma path difference) and re-run. The script is warn-only and always exits 0 — read the report, do not trust the exit code.

- [ ] **Step 5: Log and commit**

```bash
git add scripts/figma/token-map.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): 2 Theme audit — orphans, duplicates, semantic renames"
```
