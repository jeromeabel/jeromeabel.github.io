---
task: P2-T11b
title: Phase-2 gate cleanup — axis case, hairline audit, 209 white frame fills
phase: 2
status: TODO
prerequisite: P2-T11
---

# P2-T11b — the three things P2-T11 left open

P2-T11 came back `done` on nine roster assertions, ten axis rows, an empty Gate D and full
phase-2 description coverage. Three items in that report are not closed, and one of them is a
dark-mode defect at scale. Nothing in phase 3 starts until this comes back clean.

<!-- include: _run-rules.md -->

---

## Step 1 — `iconside` → `iconSide`

P2-T11 named the new axis `iconside`, all lowercase, to satisfy assertion 9. That was the brief's
fault: assertion 9 is about the **initial** letter — it exists to catch Figma's `Variant` /
`Property 1` defaults, not to ban camelCase. It has been reworded. `iconside` is the only
all-lowercase compound axis in the file and it does not match the prop name in code.

Rename the axis on `ui/Link/external` to `iconSide`, values unchanged (`trailing` default,
`leading`). Then read back the `about/AboutText` CV instance: `componentProperties` must still
resolve `iconSide=leading`. Renaming a variant axis re-keys every instance's overrides — if the
instance falls back to `trailing`, set it again and say so in the report.

## Step 2 — the 3e hairline flip: show the numbers

Step 3e predicted 36 flips across 8 masters and you flipped **50 across 15**. That is very likely
correct — the P2-T10b survey that produced 36 counted per-side hairlines only, while 3e's script
matches any node with `strokesIncludedInLayout === false` and a non-zero weight, which also catches
full-box strokes on buttons and toggles. But the report did not include the `grew` table, and
without it the flip is unverified. Two specific risks:

1. **`ui/Link/iconOnly` was resized to 32×32 at Step 3b of P2-T11 and carries a 1px dashed
   full-box stroke.** If that stroke went into layout on a HUG frame, the master is now 34×34 and
   3b is silently undone. Read back all four `iconOnly` cells and `ui/SocialShare`'s three
   children. Required: **32×32**.
2. `blog/BlogPreview` and `work/WorkPreview` contributed **0** where P2-T10b's survey said 2 each.
   Either those four were already in layout, or the survey misattributed them. Resolve which —
   a survey that was wrong about 4 nodes may be wrong about others.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const out = [];
for (const m of page.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")) {
  if (m.parent && m.parent.type === "COMPONENT_SET") continue;
  const rules = m.findAll(
    (x) => Array.isArray(x.strokes) && x.strokes.length && "strokesIncludedInLayout" in x,
  );
  out.push({
    name: m.name, w: Math.round(m.width), h: Math.round(m.height),
    rules: rules.map((r) => ({
      node: r.name,
      sides: [r.strokeTopWeight, r.strokeRightWeight, r.strokeBottomWeight, r.strokeLeftWeight],
      inLayout: r.strokesIncludedInLayout,
      boxed: r.strokeTopWeight > 0 && r.strokeRightWeight > 0 && r.strokeBottomWeight > 0 && r.strokeLeftWeight > 0,
    })),
  });
}
return out.filter((m) => m.rules.length);
```

Report the 15 masters, their current `w × h`, and which rules are `boxed` versus per-side. Every
`inLayout` must be `true` — that part of 3e stands either way; this step is about proving nothing
was broken in the process, not about undoing it.

## Step 3 — the 209 white frame fills

This is the real finding. `_prelude-components.js`'s `F()` helper is
`figma.createAutoLayout(...)`, which hands back Figma's default **opaque white** fill, and the
helper never clears it. Every layout frame built by every phase-2 brief carries one. That is the
213 in P2-T11's sweep, minus the four cover placeholders.

**They are wrong, and the report's suggested fix — bind them to `color/surface` — is also wrong.**
None of these elements has a background in code:

| Master                 | fills | code                                                               |
| ---------------------- | ----: | ------------------------------------------------------------------ |
| `work/ArchiveTable`    |   160 | `ArchiveTable.astro` — only `hover:bg-surface/50` on `tr`, no base |
| `blog/TableOfContents` |    20 | `TableOfContents.astro` — no `bg-*`                                |
| `about/AboutFacts`     |     9 | `AboutFacts.astro` — a bare `<dl class="grid …">`, no `bg-*`       |
| `blog/PostNav`         |     8 | `PostNav.astro` — no `bg-*`                                        |
| `ui/Prose`             |     6 | no `bg-*` in `global.css`                                          |
| `about/AboutText`      |     5 | no `bg-*`                                                          |
| `blog/SerieContents`   |     1 | no `bg-*`                                                          |
| `blog/RelatedWork`     |     1 | no `bg-*`                                                          |

The correct value is **transparent**: `n.fills = []`. Binding them to `color/surface` would paint
209 raised slabs where the live site has none. In dark mode the current state is worse than either —
opaque white boxes over the dark ground, which is why nobody has caught it: Step 6's dark render
comes back identical to light, so no screenshot has ever shown it.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const KEEP = /^(cover|image)/;                       // photography placeholders
const cleared = [], kept = [];
const isBound = (n) => Boolean(n.boundVariables && n.boundVariables.fills);
for (const n of page.findAll((x) => ["FRAME", "COMPONENT", "INSTANCE", "RECTANGLE"].includes(x.type))) {
  const f = n.fills;
  if (!Array.isArray(f) || !f.length || isBound(n)) continue;
  const solid = f.find((x) => x.type === "SOLID");
  if (!solid) continue;
  const { r, g, b } = solid.color;
  if (KEEP.test(n.name)) { kept.push({ node: n.name, rgb: [r, g, b] }); continue; }
  if (r === 1 && g === 1 && b === 1) { n.fills = []; cleared.push(n.name); continue; }
  kept.push({ node: n.name, rgb: [r, g, b], visible: solid.visible !== false });
}
return { clearedCount: cleared.length, cleared: cleared.slice(0, 40), kept };
```

Clear only pure white. Everything the script `kept` needs a verdict from you in the report:

- **The three remaining `cover` placeholders** (`work/WorkMiniCard` 1, `blog/RelatedWork` 3) read
  raw `rgb(217,217,217)`. P2-T04b already bound `work/WorkCard`'s eight to `color/gray/200`; bind
  these three the same way so the exception list is one rule, not two.
- **`prose-link-annotation`** at `rgb(153,153,153)` is a doc annotation, not part of any component.
  Say where it lives. If it is inside `ui/Prose`, it does not belong there.
- Anything else: name it and say whether code justifies it.

An **invisible** white fill still gets cleared — `visible: false` is the `createComponent()` default
that P2-T10 recorded on 13 master roots, and a hidden paint that `pnpm figma:verify-raw` still reads
is debt whether or not it renders.

## Step 4 — fix `F()` so this cannot recur

Phase 3 builds page masters out of the same helper. Patch `_prelude-components.js` at source:

```js
const F = (name, dir, opts = {}) => {
  const n = figma.createAutoLayout(dir, Object.assign({ name }, opts));
  // createAutoLayout hands back Figma's default opaque white fill. The live site
  // paints backgrounds on almost nothing — a layout frame is transparent unless a
  // `bg-*` class says otherwise, and an unasked-for white slab only shows itself in
  // dark mode. Opt in to a surface, never inherit one.
  if (!opts.fills) n.fills = [];
  return n;
};
```

**Already applied** in `_prelude-components.js` — this step is here so you know why frames built by
this brief's own scripts come out transparent, and so the fix is on the record with the defect it
prevents. Do not hand-edit the prelude from inside the Figma session.

## Step 5 — re-verify

Step 1 and Step 3 both move geometry (an axis rename re-keys the set; clearing fills does not, but
Step 2 may turn up a size to correct). Re-run **P1-T06 Step 2** (re-grid), then **P2-T11 Step 5**
(Gate D) — `overlaps`, `cropped`, `strays` all empty — then **P2-T11 Step 4** (binding sweep). The
sweep must now come back with the four cover placeholders bound and a raw list you can name in full.

Re-screenshot the seven sections. `work/ArchiveTable` is the one to look at hardest: 160 of the 209
were its cells, and it is the master most likely to look different afterwards.

---

## Acceptance

- `ui/Link/external`'s axis is `iconSide`; `about/AboutText`'s CV instance resolves `iconSide=leading`.
- The 15-master hairline table is reported; every rule is `inLayout: true`; `ui/Link/iconOnly` and
  `ui/SocialShare`'s children read **32×32**; the `BlogPreview` / `WorkPreview` discrepancy is resolved.
- Zero unbound white fills on ❖ Components. The three `cover` placeholders are bound to
  `color/gray/200`. Every other `kept` entry has a named verdict.
- Gate D returns three empty arrays and the binding sweep's raw list is fully accounted for.

---

## Report back

```
TASK: P2-T11b
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
HAIRLINES: <the 15-master table — name, w×h, per-side vs boxed, inLayout>
CLEARED: <count> · KEPT: <every entry with a verdict>
DEVIATIONS: <anything you did differently from this brief, and why>
```
