---
task: P2-T10b
title: Rebuild the four rect-hairline masters on HAIR()
phase: 2
status: TODO
prerequisite: P2-T09 (HAIR recipe), P2-T10
---

# P2-T10b — rebuild the rect-hairline masters on `HAIR()`

P2-T09 established the rule: **a rule an element draws on itself is a per-side stroke on that
element, not a 1px rectangle child.** The whole brief set was swept onto `HAIR()` right after. Four
masters were built _before_ the rule existed and still carry rectangle hairlines, so they now
disagree with their own corrected briefs:

| Master                 | Site                        | Rects | Target                                                    |
| ---------------------- | --------------------------- | ----- | --------------------------------------------------------- |
| `ui/Prose`             | `blockquote > rail`         | 1     | `HAIR(bq, border, ["left"], 2)` + `paddingLeft 24`        |
| `work/ArchiveTable`    | `head`/`row` bottom rules   | 27    | `HAIR(node, border, ["bottom"])` — 3 variants × (1 + 8)   |
| `blog/TableOfContents` | `item > rail`               | 14    | `HAIR(item, …, ["left"], 2)` + `paddingLeft 12` + wrapper |
| `work/WorkCard`        | card top rule + `meta` rail | 8     | `HAIR(node, …, ["top"])` + `paddingTop 12` — 4 catalogue  |

**50 rectangles in scope.** Every one is currently bound to `2 Theme::color/border`, so this is a
structural change, not a colour one.

**Explicitly out of scope — leave these rectangles alone:**

- `ui/Prose > ProseImage` and `work/WorkCard > cover` — placeholders for images, not rules.
- `work/ArchiveTable > row > cells > proj > underline-dash` (24 of them) — a _dashed_ rule under
  link text (`border-b border-dashed border-current`, `ArchiveTable.astro:39,57`). It is already
  a stroke-bearing rectangle with `dashPattern [4, 4]` and no fill, and Figma's TEXT underline
  cannot be dashed. Correct as built.
- The `case` WorkCard variants have no hairline; only the four `catalogue` ones do.

Removing a rectangle here is part of rebuilding a master this brief owns — the "nothing is ever
deleted" rule protects human-designed masters and pages, not script-built child nodes inside a
master being rebuilt in place. No master, page or variant is deleted by this task.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## The one thing to get right: side rules need `strokesIncludedInLayout`

A Figma stroke defaults to `strokeAlign = "INSIDE"` and is **not** part of auto-layout, so it paints
_over_ the frame's inner edge and the padding is measured from the outer edge. CSS does the
opposite: `border-s-2 ps-3` puts the text at `2 + 12 = 14` from the outer edge, because padding sits
inside the border.

For the two **left-rail** conversions (`ui/Prose` blockquote, `blog/TableOfContents` items) set

```js
node.strokesIncludedInLayout = true;
```

and keep the padding at the code's value (24 and 12). The stroke then takes layout space, the text
lands exactly where CSS puts it, and the frame grows by the 2px the border really occupies.

The same is true for the **bottom/top** conversions (`ArchiveTable`, `WorkCard`), and for the same
reason: a CSS border grows an auto-height box, so a row that draws `border-b` is 1px taller than its
content. Leaving the stroke out of layout makes every converted row 1px shorter than it was as a
rectangle — 9px per `ArchiveTable` variant. Set the flag everywhere. `HAIR()` now does it for you.

---

## Step 0 — audit before touching anything

Fresh run. Confirm the rectangles are where this brief says they are; a mismatch is a **STOP**.

```js
const names = ["ui/Prose", "work/ArchiveTable", "blog/TableOfContents", "work/WorkCard"];
const out = [];
for (const n of names) {
  const m = await findMaster(n);
  if (!m) throw new Error(`master ${n} not found`);
  const rects = m.findAllWithCriteria({ types: ["RECTANGLE"] });
  out.push({
    name: n, id: m.id,
    inScope: rects.filter((r) => /^(hairline|rail)$/.test(r.name)).length,
    other: rects.filter((r) => !/^(hairline|rail)$/.test(r.name)).map((r) => r.name),
  });
}
return out;
```

Expect `inScope` = 1 / 27 / 14 / 8 in that order. `other` should hold only `ProseImage`,
`underline-dash` (×24) and `cover` (×8).

---

## Step 1 — `ui/Prose` blockquote

```js
const V = await VARS();
const prose = await findMaster("ui/Prose");
const bq = prose.findOne((n) => n.name === "blockquote");
const rail = bq.children.find((n) => n.type === "RECTANGLE" && n.name === "rail");
if (!rail) throw new Error("blockquote rail already gone — re-read step 0");

HAIR(bq, V["2 Theme::color/border"], ["left"], 2);
bq.strokesIncludedInLayout = true;
bq.itemSpacing = 0;      // the 24 was the rail-to-text gap; it becomes padding
bq.paddingLeft = 24;
rail.remove();

return { id: bq.id, kids: bq.children.map((k) => `${k.type}:${k.name}`),
         w: Math.round(bq.width), strokeLeft: bq.strokeLeftWeight, pad: bq.paddingLeft };
```

Expect one child left (`TEXT:quote-text`) and the quote text sitting exactly where it was.

---

## Step 2 — `work/ArchiveTable` — 27 bottom rules

`head` and each `row` are VERTICAL frames holding `[FRAME:cells, RECTANGLE:hairline]` with gap 0 and
no padding, so this conversion is **pixel-identical** apart from losing 27 nodes.

```js
const V = await VARS();
const at = await findMaster("work/ArchiveTable");
let converted = 0;
for (const variant of at.children) {
  for (const node of variant.children) {
    if (node.name !== "head" && node.name !== "row") continue;
    const rect = node.children.find((k) => k.type === "RECTANGLE" && k.name === "hairline");
    if (!rect) continue;
    HAIR(node, V["2 Theme::color/border"], ["bottom"]);
    rect.remove();
    converted++;
  }
}
return { id: at.id, converted, expect: 27,
         variants: at.children.map((v) => ({ name: v.name, h: Math.round(v.height) })) };
```

---

## Step 3 — `blog/TableOfContents` — rails, depth wrapper, and the active-state fix

Code (`TableOfContents.astro:47-64`) is:

```html
<a class="border-border block border-s-2 ps-3">…</a>
<ol class="mt-2 flex flex-col gap-2 ps-3">…nested items…</ol>
```

So the 2px rule and the 12px inset both belong to **the item**, and the depth indent belongs to a
**nested list**, not to the item. Today's master carries the indent as `paddingLeft 12` on items 3
and 4 (`AVIF and WebP`, `When JPEG still wins`) and a `pad` wrapper frame inside every item. Both go.

There is a second divergence to fix while you are in here: `a[data-toc-link][aria-current]` sets
`border-color: var(--color-foreground-strong)` and `color: var(--color-foreground-strong)`, but the
`item / active` rail is bound to `color/border` like every other one. Bind the active item's stroke —
and its text fill, if it is not already — to `2 Theme::color/foreground-strong`.

Run once per variant (`breakpoint=Desktop`, `breakpoint=Mobile`) or loop both in one run; there are
only 7 items each.

```js
const V = await VARS();
const toc = await findMaster("blog/TableOfContents");
const BORDER = V["2 Theme::color/border"];
const STRONG = V["2 Theme::color/foreground-strong"];
const report = [];

for (const variant of toc.children) {
  const list = variant.findOne((n) => n.name === "list");
  const depth2 = [];                       // items that were indented by 12
  for (const item of [...list.children]) {
    const rail = item.children.find((k) => k.type === "RECTANGLE" && k.name === "rail");
    const pad = item.children.find((k) => k.name === "pad");
    if (!rail || !pad) throw new Error(`${variant.name}: unexpected item shape`);
    const isDepth2 = item.paddingLeft === 12;
    const isActive = item.name.includes("active");

    HAIR(item, isActive ? STRONG : BORDER, ["left"], 2);
    item.strokesIncludedInLayout = true;
    item.paddingLeft = 12;                 // the ps-3 that lived on the `pad` frame
    item.itemSpacing = 0;
    for (const kid of [...pad.children]) item.appendChild(kid);
    pad.remove();
    rail.remove();
    if (isActive) {
      const t = item.findOne((n) => n.type === "TEXT");
      t.fills = [P(STRONG)];
    }
    if (isDepth2) depth2.push(item);
  }

  // Nested <ol ps-3>: one wrapper holding the consecutive depth-2 items.
  if (depth2.length) {
    const idx = list.children.indexOf(depth2[0]);
    const sub = F("sublist", "VERTICAL", { itemSpacing: 8 });
    list.insertChild(idx, sub);
    sub.layoutSizingHorizontal = "FILL";
    sub.paddingLeft = 12;
    for (const item of depth2) { sub.appendChild(item); item.layoutSizingHorizontal = "FILL"; }
  }
  report.push({ variant: variant.name, items: list.children.map((k) => k.name),
                h: Math.round(variant.height) });
}
return report;
```

If `insertChild` throws on the component (it does inside _instances_, not inside masters — you are
writing to the master here), stop and report rather than appending the wrapper at the end: order is
the whole point.

---

## Step 4 — `work/WorkCard` — **cleared 2026-08-19, run it**

This step was gated on `work-card-redesign`. It is now cleared: the final spec is written
(`.specs/01_active/TODO - WorkCard — final spec (post-exploration round).md`, direction B+A merged)
and the master already matches it. A hairline conversion survives copy and spacing changes, so
nothing here has to be redone if editorial sign-off moves text around.

The four `catalogue` variants each hold two rules:

- root (VERTICAL, gap 12, no padding): `RECTANGLE:hairline` at index 0 → `HAIR(root, …, ["top"])`
  and `paddingTop = 12`. **Pixel-identical** — the rule was already at the top edge.
- `FRAME:meta` (VERTICAL, gap 8, `paddingTop 12`): `RECTANGLE:hairline` at index 0 →
  `HAIR(meta, …, ["top"])`, keep `paddingTop 12`. **This one moves the line 12px up**, on purpose:
  the rule belongs on `meta`'s outer edge with the padding underneath, which is what `border-t`
  does in code.

```js
const V = await VARS();
const wc = await findMaster("work/WorkCard");
let converted = 0;
for (const variant of wc.children) {
  if (!variant.name.includes("variant=catalogue")) continue;
  const top = variant.children.find((k) => k.type === "RECTANGLE" && k.name === "hairline");
  if (top) {
    HAIR(variant, V["2 Theme::color/border"], ["top"]);
    variant.paddingTop = 12;
    top.remove();
    converted++;
  }
  const meta = variant.findOne((n) => n.name === "meta");
  const rail = meta && meta.children.find((k) => k.type === "RECTANGLE" && k.name === "hairline");
  if (rail) {
    HAIR(meta, V["2 Theme::color/border"], ["top"]);
    meta.paddingTop = 12;
    rail.remove();
    converted++;
  }
}
return { id: wc.id, converted, expect: 8,
         variants: wc.children.map((v) => ({ name: v.name, h: Math.round(v.height) })) };
```

---

## Step 5 — cold read-back

Fresh run. Assert, for each of the four masters:

- zero `RECTANGLE` children named `hairline` or `rail` remain;
- every converted node has the expected per-side stroke weight and a **bound** stroke paint
  (`strokes[0].boundVariables.color`), not a raw one;
- **every** converted node has `strokesIncludedInLayout === true` — side rails and top/bottom rules alike;
- the TOC's `item / active` stroke resolves to `color/foreground-strong`, every other rail to
  `color/border`;
- `ProseImage`, `cover` (×8) and `underline-dash` (×24) are untouched.

```js
const names = ["ui/Prose", "work/ArchiveTable", "blog/TableOfContents", "work/WorkCard"];
const varName = async (id) => (await figma.variables.getVariableByIdAsync(id)).name;
const out = [];
for (const n of names) {
  const m = await findMaster(n);
  const leftovers = m.findAllWithCriteria({ types: ["RECTANGLE"] }).map((r) => r.name);
  const stroked = [];
  for (const node of m.findAll((x) => x.strokes && x.strokes.length && x.type !== "RECTANGLE")) {
    const bv = node.strokes[0].boundVariables && node.strokes[0].boundVariables.color;
    stroked.push({
      name: node.name,
      w: [node.strokeTopWeight, node.strokeRightWeight, node.strokeBottomWeight, node.strokeLeftWeight],
      inLayout: node.strokesIncludedInLayout,
      paint: bv ? await varName(bv.id) : "RAW",
    });
  }
  out.push({ name: n, leftovers, stroked });
}
return out;
```

## Step 6 — screenshot each rebuilt master, Light and Dark, and compare against the live route

`/blog/<any post>` for the TOC and prose blockquote, `/work` for the archive table and — if step 4
ran — the work cards.

---

## Acceptance

- 50 rectangles gone, replaced by per-side strokes on the owning element.
- Every stroke paint bound to `2 Theme::color/border`, except the TOC active rail on
  `color/foreground-strong`.
- `ui/Prose` and `blog/TableOfContents` text sits where it sat before (2px tolerance is _not_
  acceptable — that is what `strokesIncludedInLayout` is for).
- `work/ArchiveTable` variant heights unchanged.
- The `pad` wrapper frames are gone from the TOC and the depth-2 items live in one `sublist`.
- No instance overrides created anywhere: every write landed on a master.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T10b
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
STEP 4: converted <n> of 8
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
