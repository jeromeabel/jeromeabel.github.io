---
task: P2-T08
title: Build blog/PostNav and blog/RelatedWork (+ decision record 5)
phase: 2
status: TODO
prerequisite: P2-T01
---

# P2-T08 — `blog/PostNav` + `blog/RelatedWork`

The two blocks that close a post page. They are built together because they share one design decision, which this task also records on 📐 Decisions.

## The decision this task settles

The related blocks do **not** reuse the full cards.

- `blog/RelatedWork` shows work through `work/WorkMiniCard` — a square cover plus a title, nothing else.
- `work/RelatedWriting` (built in P2-T09) shows posts through `blog/PostRowCalm` — a single quiet row.

Neither uses `work/WorkCard` or the full `blog/PostCard`. A related block is a **footnote**, not a second feed: giving it the same visual weight as the page's own content makes the reader lose the thread. Step 5 writes this as decision record `related-block-children`.

That means this task also builds `work/WorkMiniCard`, since `RelatedWork` cannot exist without it.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## A · `work/WorkMiniCard` — 224 wide

VERTICAL, gap 8, no border, no fill.

1. **Cover** — rectangle, FILL width, **aspect 1:1** (224×224), corner radius 8, no stroke, layer named `cover`.
2. **Title** — IBM Plex Sans **SemiBold** 16, letter-spacing `0.01em`, fill `2 Theme::color/foreground-strong`, FILL width.

That is the entire component. Resist adding a kicker, a date, or a link — the whole point of the decision above is that this stays thinner than `work/WorkCard`.

---

## B · `blog/RelatedWork` — 720 wide

VERTICAL, gap 16.

1. **Label** — `RELATED WORK`, IBM Plex Sans Medium 14, uppercase, fill `2 Theme::color/foreground-muted`.
2. **Grid** — HORIZONTAL, gap 16, FILL width, holding **three** `work/WorkMiniCard` instances, each `layoutSizingHorizontal = "FILL"`.

Live is `grid grid-cols-2 gap-4 sm:grid-cols-3` — two columns on mobile, three from `sm` up. Figma auto-layout cannot express a reflow, so build the three-up desktop shape and record the mobile 2-up in the description.

Real content — three works that plausibly relate to a web-performance post:

```
RELATED WORK
Le concept de la preuve    Portfolio    Medito Fundraising
```

---

## C · `blog/PostNav` — 720 wide

Axis `type` = `both` · `prev-only` · `next-only`. Live `[id].astro` renders whichever neighbours exist; `[serie]/[post].astro` always renders both, falling back to the serie itself with a `Back to {serie}` label.

Root: HORIZONTAL, gap 32, FILL width, `primaryAxisAlignItems = "SPACE_BETWEEN"`, padding-top 64 (`mt-16`).

Each cell is **half width** (`w-1/2`), HORIZONTAL, gap 12, `counterAxisAlignItems = "CENTER"`, padding 16/24 (`p-3 lg:px-4 lg:py-6`), 1px stroke bound `2 Theme::color/border`, no radius, no fill.

- **prev cell** — a `lucide:arrow-left` icon **leading**, then a VERTICAL gap-4 text column.
- **next cell** — text column first, then a `lucide:arrow-right` icon **trailing**; the whole cell is `counterAxisAlignItems = "MAX"`-aligned so the text sits right.

Text column, both cells:

- label — IBM Plex Sans Regular 16, fill `foreground-muted`. Exactly `Previous` / `Next`.
- title — IBM Plex Sans Regular 24, fill `2 Theme::color/foreground`.

Hover (document only, no variant): `hover:bg-surface`. Put it in the description, do not build a fourth axis for it.

Real content:

```
←  Previous                        Next                        →
   Benchmarking a 10,000-Row Table  Optimizing Images (part 2)
```

For `prev-only` / `next-only`, keep the present cell at half width and leave the other half **empty** — the surviving cell must not stretch. That is what `justify-between` does in code, and it is what makes the arrow direction readable.

---

## Steps

### Step 1 — build `work/WorkMiniCard` and home it

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const c = figma.createComponent();
c.name = "work/WorkMiniCard";
c.layoutMode = "VERTICAL"; c.itemSpacing = 8;
c.resize(224, 100);
c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";

const cover = figma.createRectangle();
cover.name = "cover";
cover.resize(224, 224);
cover.cornerRadius = 8;
c.appendChild(cover);
cover.layoutSizingHorizontal = "FILL";

const t = await T("Le concept de la preuve", {
  size: 16, weight: "SemiBold", fill: V["2 Theme::color/foreground-strong"] });
t.letterSpacing = { unit: "PERCENT", value: 1 };
c.appendChild(t);
t.layoutSizingHorizontal = "FILL";

c.description = "Compact work reference used only inside related blocks. Square cover + title, nothing else — see decision record related-block-children.";
page.appendChild(c);
await home(c, "work");
return { name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height) };
```

### Step 2 — build `blog/RelatedWork`

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const c = figma.createComponent();
c.name = "blog/RelatedWork";
c.layoutMode = "VERTICAL"; c.itemSpacing = 16;
c.resize(720, 100);
c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";

c.appendChild(await T("RELATED WORK", {
  size: 14, weight: "Medium", fill: V["2 Theme::color/foreground-muted"] }));

const grid = F("grid", "HORIZONTAL", { itemSpacing: 16 });
c.appendChild(grid); grid.layoutSizingHorizontal = "FILL";
const TITLES = ["Le concept de la preuve", "Portfolio", "Medito Fundraising"];
for (const title of TITLES) {
  const mini = await inst("work/WorkMiniCard");
  grid.appendChild(mini);
  mini.layoutSizingHorizontal = "FILL";
  const t = mini.findOne((n) => n.type === "TEXT");
  await figma.loadFontAsync(t.fontName);
  t.characters = title;
}
c.description = "Footnote block at the end of a post. Three work/WorkMiniCard instances; 3-up from sm, 2-up below. Never uses work/WorkCard — see decision record related-block-children.";
page.appendChild(c);
await home(c, "blog");
return { name: c.name, id: c.id, h: Math.round(c.height),
         kids: grid.children.map((k) => `${k.type}:${k.name}`) };
```

`kids` must be three INSTANCEs. A FRAME in that list means `inst()` returned a detached copy — stop and report.

### Step 3 — build the three `blog/PostNav` variants

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const cell = async (kind, title) => {
  const c = F(kind, "HORIZONTAL", { itemSpacing: 12 });
  c.counterAxisAlignItems = "CENTER";
  c.paddingLeft = c.paddingRight = 24;
  c.paddingTop = c.paddingBottom = 24;
  c.strokeWeight = 1;
  c.setBoundVariable("strokes", V["2 Theme::color/border"]);
  const col = F("text", "VERTICAL", { itemSpacing: 4 });
  col.appendChild(await T(kind === "prev" ? "Previous" : "Next", {
    size: 16, fill: V["2 Theme::color/foreground-muted"] }));
  col.appendChild(await T(title, { size: 24, fill: V["2 Theme::color/foreground"] }));
  const arrow = await inst("ui/Icon");
  arrow.name = kind === "prev" ? "arrow-left" : "arrow-right";
  if (kind === "prev") { c.appendChild(arrow); c.appendChild(col); }
  else { c.appendChild(col); c.appendChild(arrow); c.counterAxisAlignItems = "CENTER"; c.primaryAxisAlignItems = "MAX"; }
  return c;
};

const build = async (type) => {
  const c = figma.createComponent();
  c.name = `type=${type}`;
  c.layoutMode = "HORIZONTAL"; c.itemSpacing = 32;
  c.resize(720, 100);
  c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "AUTO";
  c.primaryAxisAlignItems = "SPACE_BETWEEN";
  c.paddingTop = 64;

  const half = (n) => { n.layoutSizingHorizontal = "FIXED"; n.resize(344, n.height); };
  if (type !== "next-only") { const p = await cell("prev", "Benchmarking a 10,000-Row Table"); c.appendChild(p); half(p); }
  if (type !== "prev-only") { const n = await cell("next", "Optimizing Images with Astro (part 2)"); c.appendChild(n); half(n); }
  page.appendChild(c);
  return { name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height),
           kids: c.children.map((k) => k.name) };
};
return [await build("both"), await build("prev-only"), await build("next-only")];
```

344 = (720 − 32) / 2, i.e. `w-1/2` minus half the gap.

### Step 4 — combine, home, cold read-back

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const cells = page.children.filter((c) => c.type === "COMPONENT" && /^type=(both|prev-only|next-only)$/.test(c.name));
if (cells.length !== 3) throw new Error(`expected 3 cells, found ${cells.length}`);
const set = figma.combineAsVariants(cells, page);
set.name = "blog/PostNav";
set.description = "End-of-post neighbour links. Hover = color/surface fill (documented, not a variant). Single-neighbour variants keep the surviving cell at half width — it never stretches. On a serie post both cells always render, falling back to 'Back to {serie}'.";
await home(set, "blog");
return { name: set.name, id: set.id, axes: set.variantGroupProperties };
```

Then, in a **fresh** run, read back all three masters. Assert: `blog/PostNav` 3 variants at 720 wide, each cell 344 wide with a bound `color/border` stroke; `blog/RelatedWork` holds exactly 3 INSTANCEs of `work/WorkMiniCard`; `work/WorkMiniCard` cover is square (width === height).

### Step 5 — write decision record 5 on 📐 Decisions

Follow the live `_Docs/DecisionCard` shape recorded in P1-T02, not the original plan text: no text component properties — instance the card, set `layer=All`, then edit the TEXT layers `layer` / `rule` / `body` / `finding` directly. Status is `_Docs/Status` at `Status=Completed` with the visible label overridden to `ACCEPTED`. Wrap it in a frame named `DECISION / related-block-children`, positioned after the four existing records with the same stride they use.

Content:

- **layer** — `Content`
- **rule** — `Related blocks use compact children, never the page's own card.`
- **body** — `blog/RelatedWork renders work/WorkMiniCard (square cover + title). work/RelatedWriting renders blog/PostRowCalm (one quiet row). Neither uses work/WorkCard or blog/PostCard.`
- **finding** — `A related block is a footnote, not a second feed. Matching the page's own card weight makes the reader lose the thread they were following.`

### Step 6 — screenshot

Screenshot the three PostNav variants, RelatedWork, and the new decision record. On `prev-only`, confirm the empty half stayed empty.

---

## Acceptance

- `work/WorkMiniCard` (COMPONENT) in `work`; `blog/RelatedWork` (COMPONENT) and `blog/PostNav` (COMPONENT_SET, axis `type`, 3 variants) in `blog`.
- RelatedWork's three children are instances, not copies.
- PostNav single-neighbour variants keep 344-wide cells.
- Decision record `related-block-children` live on 📐 Decisions as the fifth record.
- All fills/strokes bound; Gate D clean on `blog` and `work`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T08
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
