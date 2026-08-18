---
task: P1-T09
title: Phase-1 verification gate (Figma side)
phase: 1
status: TODO
prerequisite: P1-T08
---

# P1-T09 — Phase-1 gate, Figma side

Phase 2 builds new masters on top of these names and tokens. If anything here is wrong, every phase-2 build inherits the error. Nothing is optional.

The repo half of this gate — `pnpm figma:dump` / `verify` / `verify-raw` / `verify-responsive`, the knowledge file, the commit — lives in `../repo/phase-1.md` and is run by Claude Code **after** you report back.

<!-- include: _run-rules.md -->

---

## Step 0 — Corrective run (added after the first gate attempt)

The first run came back **blocked** on two things. Both are fixed here, before re-inventorying.

1. **`WorkCardPreviewSmall` (`2045:378`) had no domain prefix** and still sat in the legacy
   section `Cards`. P1-T05 deferred its rename to phase 2, but `rename-map.md` arithmetic already
   counted it as `work/WorkCardPreviewSmall`. Decision: give it the prefix now, keep the absorb
   deferred. Assertion 1 stays absolute — no straggler exception.
2. **Gate D reported 3 overlaps** (`app/Footer`↔`app/NavLink`,
   `blog/BlogPreview`↔`blog/PostCard`, `blog/PostRow`↔`blog/PostCard`). Cause: P1-T07 turned
   `app/NavLink` and `blog/PostCard` into COMPONENT_SETs, taller than the sources they replaced,
   and **P1-T06 Step 2 was never re-run**, so the old grid coordinates stayed. Not a naming bug —
   a stale layout.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

// 1 — prefix the last straggler
const legacy = page.findOne((x) => x.id === "2045:378");
if (!legacy) throw new Error("2045:378 not found — re-inventory before continuing");
const before = legacy.name;
if (before === "WorkCardPreviewSmall") legacy.name = "work/WorkCardPreviewSmall";

// 2 — drop every legacy section left empty by P1-T06 (Chrome / Actions / Cards / …)
const ORDER = ["app", "ui", "blog", "work", "hero", "contact", "about"];
const removed = [];
for (const c of page.children.slice()) {
  if (c.type !== "SECTION" || ORDER.includes(c.name)) continue;
  if (c.children.length) { removed.push({ section: c.name, kept: c.children.map((k) => k.name) }); continue; }
  removed.push({ section: c.name, kept: [] });
  c.remove();
}
return { renamed: { from: before, to: legacy.name, id: legacy.id }, sections: removed };
```

A non-empty `kept` means a master is still homed outside the seven domains — report it and stop;
do not delete a section that holds anything.

Then **re-run P1-T06 Step 1 and Step 2 verbatim**, in that order: Step 1 sweeps
`work/WorkCardPreviewSmall` (and the two merged sets) into their sections, Step 2 re-lays every
section on the grid, which is what clears the three overlaps. Step 1's `unhomed` must now be
`_Docs/*` only — the five stragglers are gone.

---

## Step 1 — Full Pass-0 re-inventory

```js
const skip = { skipInvisibleInstanceChildren: true };
const pages = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  const masters = p
    .findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")
    .filter((x) => !(x.parent && x.parent.type === "COMPONENT_SET"))
    .map((x) => ({
      name: x.name, id: x.id, type: x.type,
      section: x.parent && x.parent.type === "SECTION" ? x.parent.name : null,
      variants: x.type === "COMPONENT_SET" ? x.children.map((c) => c.name) : null,
    }));
  pages.push({ page: p.name, id: p.id, masters });
}
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const collections = [];
for (const c of cols) {
  const names = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    names.push(v.name);
  }
  collections.push({ name: c.name, modes: c.modes.map((m) => m.name), count: names.length, names: names.sort() });
}
return { pages, collections };
```

---

## Step 2 — Assert the phase-1-after state

Check these against the Step 1 return and put each verdict in the report:

| #   | Assertion                                                                              | Expected                                                   |
| --- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Every ❖ Components master name matches `^(app\|ui\|blog\|work\|hero\|contact\|about)/` | true                                                       |
| 2   | ❖ Components master count                                                              | **32** (34 − 2, the two merges collapsed 4 sources into 2) |
| 3   | `_Docs/*` masters                                                                      | 11                                                         |
| 4   | Page masters on 📄 Pages                                                               | 4                                                          |
| 5   | Total masters                                                                          | **47**                                                     |
| 6   | No variable named `mauve*` / `mist*` / `olive*` / `taupe*` anywhere                    | true                                                       |
| 7   | `3 Responsive` count                                                                   | **18**, unchanged                                          |
| 8   | `2 Theme` count                                                                        | matches the post-P1-T04 number                             |
| 9   | `1 Primitives` has no `-` separators                                                   | true                                                       |

Any failed assertion is a **STOP**. Report which one and what you saw.

---

## Step 3 — Gate D, absolute coordinates

Re-run **P1-T06 Step 3** verbatim. Required: `overlaps: []`, `cropped: []`, `strays` = `_Docs/*` only.

---

## Step 4 — Screenshot sweep

`get_screenshot` on all 7 domain sections **and** on 📐 Decisions. Verdict per section: PASS, or what to fix. Every master fully visible, none clipped, none overlapping, consistent gaps, section order `app · ui · blog · work · hero · contact · about`.

`about` is empty and that is a PASS — P1-T06 creates it, P2-T10 fills it. No other section may be empty.

## Acceptance

Phase 1 is done when all of this is true:

- 4 decision records exist on 📐 Decisions.
- Both audited collections are clean; `3 Responsive` untouched.
- Every DS master carries a domain prefix — including `work/WorkCardPreviewSmall`, the 32nd
  master, prefixed by Step 0 and absorbed later by P2-T04.
- The three merges landed with the right variant matrices.
- `app/Header` and `contact/ContactPreview` read 16, bound to `container/gutter`.
- Container bands: check **every** direct child carrying `maxWidth`, not `children[0]` — a
  vertical owner has no single band (see P1-T08 step 4). Two accepted notes: `app/Header`
  Mobile has no band at all (TEXT first child), and `ui/SectionTitle` instances are headings,
  not bands.
- Gate D empty; 8 screenshots reviewed.

Report the **full Step 1 JSON** — Claude Code needs it verbatim to write `inventory.md §Phase-1-after` and the knowledge-file roster.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T09
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
