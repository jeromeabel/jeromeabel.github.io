---
task: P2-T07
title: Build blog/TableOfContents and blog/SerieContents
phase: 2
status: TODO
prerequisite: P2-T01
---

# P2-T07 — `blog/TableOfContents` + `blog/SerieContents`

Two sibling navigation blocks for the post routes. Both are quiet lists; neither is a card with a shadow.

- **`blog/TableOfContents`** — the sticky in-page heading list. Desktop: an aside beside the prose. Mobile: a collapsed `<details>` box above the prose.
- **`blog/SerieContents`** — "In this series", the numbered sibling list on a serie post, sitting **after the prose body and before PostNav**.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## A · `blog/TableOfContents`

Axis `breakpoint` = `Desktop` · `Mobile`. Two genuinely different shapes, not a resize.

### Desktop — 224 wide, no box

Live is `aside sticky top-24 hidden max-h-[calc(100vh-8rem)] w-56 shrink-0 md:block` — **224 px** (`w-56`), no border, no fill, no padding. It is a bare column of text.

VERTICAL, gap 0, width 224 fixed:

1. **Label** — `On this page`, IBM Plex Sans Medium 14, **uppercase**, fill `2 Theme::color/foreground-muted`, margin-bottom 12 (use `paddingBottom` on the label or `itemSpacing` on the list wrapper — do not add a spacer rectangle).
2. **List** — VERTICAL, gap 8. Each item is a HORIZONTAL frame with:
   - a **2px left rail**: rectangle 2 wide, FILL height, fill bound `2 Theme::color/border`,
   - padding-left 12 after the rail,
   - text IBM Plex Sans Regular 14, fill `foreground-muted`.
3. **Nested children** — a child heading is the same item shape indented a further 12, inside a VERTICAL frame with padding-top 8.
4. **Active item** — one item per master shows the active state: fill `2 Theme::color/foreground-strong` and font weight **Medium** (500). The rail stays `color/border` — only the text changes. Name that layer `item / active` so it is findable.

Real content (from the live serie post `Optimizing Images with Astro (part 1)`):

```
ON THIS PAGE
  Why images dominate the payload      ← active
  Formats
    AVIF and WebP
    When JPEG still wins
  Responsive sizes
  Lazy loading and LQIP
  Results
```

### Mobile — 358 wide, collapsed box

Live is `<details class="border-border rounded-lg border p-4 md:hidden">`. So:

VERTICAL, gap 12, width 358, padding 16, corner radius 8, 1px stroke bound `2 Theme::color/border`, no fill.

- **Summary row** — HORIZONTAL, FILL width, `SPACE_BETWEEN`: the same `ON THIS PAGE` label on the left, a `lucide:chevron-down` icon instance (16×16, fill `foreground-muted`) on the right.
- The list below, identical to Desktop's list but FILL width.

Build it **expanded** — a Figma master that shows nothing is useless documentation. Note in the description that the live default state is closed.

---

## B · `blog/SerieContents` — one variant, 720 wide

Live is `border-border rounded-lg border p-4 md:p-6`, so: VERTICAL, gap 12, corner radius 8, 1px stroke bound `2 Theme::color/border`, no fill, padding 24 (the `md:p-6` desktop value).

1. **Label** — `IN THIS SERIES — WEB PERFORMANCE`, IBM Plex Sans Medium 14, uppercase, fill `foreground-muted`.
2. **List** — VERTICAL, gap 8. Each item: text IBM Plex Sans Regular 16, fill `2 Theme::color/foreground`, prefixed `{n}. `.
3. **Current item** — fill `2 Theme::color/foreground-strong`, weight **Medium**. Exactly one, named `item / current`.

Real content — the actual five-part serie:

```
IN THIS SERIES — WEB PERFORMANCE
1. Web Performance Tactics Cheatsheet
2. Exploring a Data-Driven Approach to Web Performance
3. Benchmarking a 10,000-Row Table: v-for, PrimeVue, and TanStack
4. Optimizing Images with Astro (part 1)     ← current
5. Optimizing Images with Astro (part 2)
```

Item 3 is long on purpose: it wraps at 720 and proves the list is not built on fixed-height rows.

---

## Steps

### Step 1 — build both `blog/TableOfContents` variants

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const ITEMS = [
  ["Why images dominate the payload", 0, true],
  ["Formats", 0, false],
  ["AVIF and WebP", 1, false],
  ["When JPEG still wins", 1, false],
  ["Responsive sizes", 0, false],
  ["Lazy loading and LQIP", 0, false],
  ["Results", 0, false],
];

const mkItem = async (label, depth, active) => {
  const row = F(active ? "item / active" : "item", "HORIZONTAL", { itemSpacing: 0 });
  row.paddingLeft = depth * 12;
  const rail = figma.createRectangle();
  rail.name = "rail"; rail.resize(2, 20);
  rail.fills = [P(V["2 Theme::color/border"])];
  row.appendChild(rail);
  const t = await T(label, {
    size: 14,
    weight: active ? "Medium" : "Regular",
    fill: V[`2 Theme::color/${active ? "foreground-strong" : "foreground-muted"}`],
  });
  const pad = F("pad", "HORIZONTAL", { itemSpacing: 0 });
  pad.paddingLeft = 12;
  row.appendChild(pad);
  pad.appendChild(t);
  pad.layoutSizingHorizontal = "FILL";
  rail.layoutSizingVertical = "FILL";
  return row;
};

const build = async (bp) => {
  const c = figma.createComponent();
  c.name = `breakpoint=${bp}`;
  c.layoutMode = "VERTICAL";
  c.itemSpacing = 12;
  c.resize(bp === "Mobile" ? 358 : 224, 100);
  c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";

  if (bp === "Mobile") {
    c.paddingTop = c.paddingBottom = c.paddingLeft = c.paddingRight = 16;
    c.cornerRadius = 8;
    c.strokeWeight = 1;
    c.strokes = [P(V["2 Theme::color/border"])];
    const sum = F("summary", "HORIZONTAL", { itemSpacing: 8 });
    c.appendChild(sum); sum.layoutSizingHorizontal = "FILL";
    sum.primaryAxisAlignItems = "SPACE_BETWEEN";
    sum.counterAxisAlignItems = "CENTER";
    sum.appendChild(await T("ON THIS PAGE", { size: 14, weight: "Medium", fill: V["2 Theme::color/foreground-muted"] }));
    const chev = await inst("ui/Icon");
    chev.name = "chevron-down";
    sum.appendChild(chev);
  } else {
    c.appendChild(await T("ON THIS PAGE", { size: 14, weight: "Medium", fill: V["2 Theme::color/foreground-muted"] }));
  }

  const list = F("list", "VERTICAL", { itemSpacing: 8 });
  c.appendChild(list); list.layoutSizingHorizontal = "FILL";
  for (const [label, depth, active] of ITEMS) {
    const row = await mkItem(label, depth, active);
    list.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
  }
  page.appendChild(c);
  return { name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height) };
};
return [await build("Desktop"), await build("Mobile")];
```

If `ui/Icon` has a variant axis for the glyph, pick chevron-down through the `variantMatch` argument; if it does not, leave the instance named `chevron-down` and note it in the report — the icon set is P3's problem, not this task's.

### Step 2 — combine and home the TOC

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const cells = page.children.filter((c) => c.type === "COMPONENT" && /^breakpoint=(Desktop|Mobile)$/.test(c.name));
if (cells.length !== 2) throw new Error(`expected 2 cells, found ${cells.length}`);
const set = figma.combineAsVariants(cells, page);
set.name = "blog/TableOfContents";
set.description = "In-page heading list. Desktop = bare 224 aside, sticky top-24, no box. Mobile = bordered <details>, closed by default in code, shown expanded here. Active item: foreground-strong + Medium; the rail never changes color.";
await home(set, "blog");
return { name: set.name, id: set.id, axes: set.variantGroupProperties };
```

### Step 3 — build `blog/SerieContents`

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const POSTS = [
  "Web Performance Tactics Cheatsheet",
  "Exploring a Data-Driven Approach to Web Performance",
  "Benchmarking a 10,000-Row Table: v-for, PrimeVue, and TanStack",
  "Optimizing Images with Astro (part 1)",
  "Optimizing Images with Astro (part 2)",
];
const CURRENT = 3; // zero-based

const c = figma.createComponent();
c.name = "blog/SerieContents";
c.layoutMode = "VERTICAL"; c.itemSpacing = 12;
c.resize(720, 100);
c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";
c.paddingTop = c.paddingBottom = c.paddingLeft = c.paddingRight = 24;
c.cornerRadius = 8;
c.strokeWeight = 1;
c.strokes = [P(V["2 Theme::color/border"])];

c.appendChild(await T("IN THIS SERIES — WEB PERFORMANCE", {
  size: 14, weight: "Medium", fill: V["2 Theme::color/foreground-muted"] }));

const list = F("list", "VERTICAL", { itemSpacing: 8 });
c.appendChild(list); list.layoutSizingHorizontal = "FILL";
for (let i = 0; i < POSTS.length; i++) {
  const cur = i === CURRENT;
  const t = await T(`${i + 1}. ${POSTS[i]}`, {
    size: 16,
    weight: cur ? "Medium" : "Regular",
    fill: V[`2 Theme::color/${cur ? "foreground-strong" : "foreground"}`],
  });
  t.name = cur ? "item / current" : "item";
  list.appendChild(t);
  t.layoutSizingHorizontal = "FILL";
}
c.description = "Sibling list on a serie post. Sits after the prose body, before PostNav. Current item: foreground-strong + Medium. Numbering is 1-based and comes from the serie's posts order.";
page.appendChild(c);
await home(c, "blog");
return { name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height),
         items: list.children.map((k) => k.name) };
```

### Step 4 — cold read-back

Fresh run. For both masters return width, height, the label text, item count, and which layer carries the active/current name.

Assert: TOC Desktop 224 wide with **no** stroke and **no** padding; TOC Mobile 358 wide with a bound `color/border` stroke and 16 padding; both have 7 items with exactly one `item / active`. SerieContents 720 wide, 5 items, exactly one `item / current`, and its height proves item 3 wrapped to two lines (a 5-item box at 720 that is under ~180 tall did not wrap — check the text width).

### Step 5 — screenshot both, in Light and Dark.

The muted/strong contrast is the whole design of these two components; if the active item does not read as clearly ahead of its siblings in Dark, report it rather than adjusting a token.

---

## Acceptance

- `blog/TableOfContents` (COMPONENT_SET, axis `breakpoint`) and `blog/SerieContents` (COMPONENT) both in the `blog` section.
- Desktop TOC is boxless; Mobile TOC is the bordered details box; SerieContents is bordered at radius 8.
- Every fill and stroke bound to `2 Theme::color/*`; no raw hex.
- Real serie content, with the long item 3 wrapping.
- Gate D clean on the `blog` section.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T07
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
