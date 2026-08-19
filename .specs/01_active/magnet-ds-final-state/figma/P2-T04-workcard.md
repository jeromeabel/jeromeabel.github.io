---
task: P2-T04
title: Build work/WorkCard (catalogue + case, 8 variants)
phase: 2
status: TODO
prerequisite: P2-T01
---

# P2-T04 — `work/WorkCard`

Biggest build of phase 2. One master, two very different anatomies behind a `variant` axis:

- **catalogue** — the compact card used 3-up on Home (`/`). 395 wide.
- **case** — the wide zigzag block used 4× on `/work` Selected work. 1248 wide.

Source of truth for this anatomy is the WorkCard exploration spec (post-exploration round); everything you need is inlined below, so no repo access is required.

`work/WorkCardPreviewSmall` (the current legacy master) is **absorbed**, not deleted — step 6 archives it.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## Variant matrix

Three axes, 8 variants:

| axis      | values               |
| --------- | -------------------- |
| `variant` | `catalogue` · `case` |
| `state`   | `default` · `hover`  |
| `side`    | `left` · `right`     |

`side` is the zigzag control: it decides whether the cover sits left or right of the text column. It is **inert on `catalogue`** (the compact card is always cover-on-top) — build those two `side` values identically so the matrix stays rectangular and page-level code can set `side` without caring which variant it hit.

Default variant: `variant=catalogue, state=default, side=left`.

---

## Anatomy A — `variant=catalogue` (395 wide, VERTICAL, gap 12)

Everything is left-aligned, no card border, no background fill. The card _is_ the content.

1. **Top rule** — the card's own `strokeTopWeight = 1` bound `2 Theme::color/border` (`HAIR(c, …, ["top"])`), with `paddingTop = 12` under it. Not a rectangle child: code writes `border-t` on the card itself, so the rule sits on the outer edge and the 12 is padding *inside* it.
2. **Index row** — HORIZONTAL, FILL width, `primaryAxisAlignItems = "SPACE_BETWEEN"`, padding-top 8, padding-bottom 8.
   - left: text `01` — Fira Code Regular 12, tabular figures, fill `2 Theme::color/foreground-muted`.
   - right: text `↗` — Fira Code Regular 12, fill `2 Theme::color/foreground-muted`.
3. **Cover** — rectangle, FILL width, aspect 16:9 (395 → 222 high), corner radius 8, **no stroke**. Fill: a placeholder `1 Primitives::color/…/200`-ish neutral is fine; name the layer `cover`.
4. **Title** — text, IBM Plex Sans SemiBold 17, fill `2 Theme::color/foreground-strong`, FILL width.
5. **Kicker** — text, Fira Code Regular 12, **uppercase**, letter-spacing `0.08em`, fill `2 Theme::color/foreground-muted`. Format `TYPE · YEAR`.
6. **Meta rail** — VERTICAL, gap 8, with a 1px top hairline on the rail itself (`HAIR(rail, …, ["top"])`) and `padding-top 12` under it — same recipe as the card rule in step 1.
   - **stack line** — text, Fira Code Regular 12, fill `foreground-muted`, values joined with `·`.
   - **link line** — HORIZONTAL, gap 16. One text per artifact the project actually has: `↗ Live`, `↗ Repo`, `↗ Video`. Fira Code Regular 12, fill `2 Theme::color/foreground` (**not** muted — these are the only default-color text in the card).

Real content for the default variant (project ranked `featured: 2`, the Home lead card):

```
index    01
title    Le concept de la preuve
kicker   WEB · 2026
stack    Astro · Tailwind CSS · Astro DB · Turso · Netlify · Sharp
links    ↗ Live   ↗ Repo
```

That project has no `website` and no `video` in frontmatter — two links, not four. A card showing links the project does not have misrepresents the component's real density.

---

## Anatomy B — `variant=case` (1248 wide, HORIZONTAL, gap 64)

A wide editorial row. Two children, order flipped by `side`.

- **Cover column** — 500 wide fixed, 16:9 (500 → 281 high), radius 8, no stroke, layer named `cover`.
- **Text column** — FILL width, VERTICAL, gap 20, `counterAxisAlignItems = "MIN"`, vertically centered against the cover (`primaryAxisAlignItems = "CENTER"` on the row).

Text column stack:

1. **Kicker** — Fira Code Regular 12, uppercase, letter-spacing `0.08em`, fill `foreground-muted`. `TYPE · YEAR`.
2. **Title** — IBM Plex Sans SemiBold 21, fill `foreground-strong`.
3. **Facts block** — VERTICAL, gap 12. Three label/sentence pairs, each a VERTICAL frame gap 4:
   - label — Fira Code Regular 10, uppercase, letter-spacing `0.1em`, fill `foreground-muted`. Labels are exactly `PROBLEM`, `SOLUTION`, `LEARNING`.
   - sentence — IBM Plex Sans Regular 13.5, fill `2 Theme::color/foreground`. **One sentence each**, never a paragraph.
4. **Link row** — HORIZONTAL, gap 24, padding-top 4. Fira Code Regular 12, fill `2 Theme::color/foreground`: `2 articles →` and `↗ Live`.

**No index number on case blocks.** The zigzag carries the ordering; a number would be redundant chrome.

Real content for the default `case` variant:

```
kicker    WEB · 2026
title     Le concept de la preuve
PROBLEM   A comic blog needs a vote button, and a vote button usually drags in a whole backend.
SOLUTION  Everything ships static except one serverless endpoint that writes votes to Turso.
LEARNING  The cheapest architecture is the one where exactly one thing is dynamic.
links     2 articles →   ↗ Live
```

---

## Hover — one coupled rule, both variants

`state=hover` differs from `default` in exactly two ways:

- **title** gains an underline (`textDecoration = "UNDERLINE"`).
- **cover** scales to **1.02** — express it as geometry: catalogue cover 395×222 → 403×226; case cover 500×281 → 510×287.

Both move together, ~140ms ease-out, as one gesture. Explicitly **not** part of hover: dimming, tinting, overlays, revealing anything that was hidden. Everything the card will ever show is visible at rest.

Record the timing as a **description** on the master (Figma cannot express transition duration):

> Hover: title underline + cover scale 1.02, coupled, 140ms ease-out. Never dim or tint. Reduced motion keeps the underline and drops the scale. Nothing is hidden at rest.

---

## Steps

### Step 1 — build the four `catalogue` cells

Build `catalogue/default/left`, then clone-and-edit for the other three. Each cell is a COMPONENT named with its variant string; step 5 combines them.

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const buildCatalogue = async (state) => {
  const c = figma.createComponent();
  c.name = `variant=catalogue, state=${state}, side=left`;
  c.layoutMode = "VERTICAL";
  c.itemSpacing = 12;
  c.resize(395, 100);
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "FIXED";

  // Top rule is the card's own border-t; the 12 that followed the old rectangle
  // child becomes the card's own padding-top.
  HAIR(c, V["2 Theme::color/border"], ["top"]);
  c.paddingTop = 12;

  const idx = F("index", "HORIZONTAL", { itemSpacing: 8 });
  c.appendChild(idx);
  idx.layoutSizingHorizontal = "FILL";
  idx.primaryAxisAlignItems = "SPACE_BETWEEN";
  idx.paddingTop = 8; idx.paddingBottom = 8;
  idx.appendChild(await T("01", { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] }));
  idx.appendChild(await T("↗", { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] }));

  const cover = figma.createRectangle();
  cover.name = "cover";
  cover.resize(395, state === "hover" ? 226 : 222);
  cover.cornerRadius = 8;
  c.appendChild(cover);
  cover.layoutSizingHorizontal = "FILL";

  const title = await T("Le concept de la preuve", { size: 17, weight: "SemiBold", fill: V["2 Theme::color/foreground-strong"] });
  if (state === "hover") title.textDecoration = "UNDERLINE";
  c.appendChild(title); title.layoutSizingHorizontal = "FILL";

  const kicker = await T("WEB · 2026", { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] });
  kicker.letterSpacing = { unit: "PERCENT", value: 8 };
  c.appendChild(kicker);

  const rail = F("meta", "VERTICAL", { itemSpacing: 8 });
  c.appendChild(rail);
  rail.layoutSizingHorizontal = "FILL";
  rail.paddingTop = 12;
  HAIR(rail, V["2 Theme::color/border"], ["top"]);
  rail.appendChild(await T("Astro · Tailwind CSS · Astro DB · Turso · Netlify · Sharp",
    { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] }));
  const links = F("links", "HORIZONTAL", { itemSpacing: 16 });
  rail.appendChild(links);
  for (const l of ["↗ Live", "↗ Repo"])
    links.appendChild(await T(l, { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground"] }));

  return c;
};

const made = [];
for (const state of ["default", "hover"]) {
  const c = await buildCatalogue(state);
  page.appendChild(c);
  made.push({ name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height) });
  const r = c.clone();
  r.name = `variant=catalogue, state=${state}, side=right`;
  page.appendChild(r);
  made.push({ name: r.name, id: r.id });
}
return made;
```

`side=right` on catalogue is a byte-identical clone — that is intentional, see §Variant matrix.

### Step 2 — build the four `case` cells

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const FACTS = [
  ["PROBLEM", "A comic blog needs a vote button, and a vote button usually drags in a whole backend."],
  ["SOLUTION", "Everything ships static except one serverless endpoint that writes votes to Turso."],
  ["LEARNING", "The cheapest architecture is the one where exactly one thing is dynamic."],
];

const buildCase = async (state, side) => {
  const c = figma.createComponent();
  c.name = `variant=case, state=${state}, side=${side}`;
  c.layoutMode = "HORIZONTAL";
  c.itemSpacing = 64;
  c.counterAxisAlignItems = "CENTER";
  c.resize(1248, 100);
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";

  const cover = figma.createRectangle();
  cover.name = "cover";
  cover.resize(state === "hover" ? 510 : 500, state === "hover" ? 287 : 281);
  cover.cornerRadius = 8;

  const col = F("text", "VERTICAL", { itemSpacing: 20 });
  const kicker = await T("WEB · 2026", { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] });
  kicker.letterSpacing = { unit: "PERCENT", value: 8 };
  col.appendChild(kicker);
  const title = await T("Le concept de la preuve", { size: 21, weight: "SemiBold", fill: V["2 Theme::color/foreground-strong"] });
  if (state === "hover") title.textDecoration = "UNDERLINE";
  col.appendChild(title);

  const facts = F("facts", "VERTICAL", { itemSpacing: 12 });
  col.appendChild(facts);
  for (const [label, sentence] of FACTS) {
    const pair = F(label.toLowerCase(), "VERTICAL", { itemSpacing: 4 });
    const l = await T(label, { size: 10, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] });
    l.letterSpacing = { unit: "PERCENT", value: 10 };
    pair.appendChild(l);
    pair.appendChild(await T(sentence, { size: 13.5, fill: V["2 Theme::color/foreground"] }));
    facts.appendChild(pair);
  }

  const links = F("links", "HORIZONTAL", { itemSpacing: 24 });
  links.paddingTop = 4;
  col.appendChild(links);
  for (const l of ["2 articles →", "↗ Live"])
    links.appendChild(await T(l, { size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground"] }));

  if (side === "left") { c.appendChild(cover); c.appendChild(col); }
  else { c.appendChild(col); c.appendChild(cover); }
  col.layoutSizingHorizontal = "FILL";
  return c;
};

const made = [];
for (const state of ["default", "hover"])
  for (const side of ["left", "right"]) {
    const c = await buildCase(state, side);
    page.appendChild(c);
    made.push({ name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height),
      order: c.children.map((k) => k.name) });
  }
return made;
```

Check the returned `order`: `side=left` must be `["cover","text"]`, `side=right` must be `["text","cover"]`. An instance cannot reorder its master's children, which is exactly why `side` is an axis and not an override.

### Step 3 — combine into one set and name it

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const cells = page.children.filter(
  (c) => c.type === "COMPONENT" && /^variant=(catalogue|case), state=/.test(c.name),
);
if (cells.length !== 8) throw new Error(`expected 8 cells, found ${cells.length}`);
const set = figma.combineAsVariants(cells, page);
set.name = "work/WorkCard";
set.description = [
  "Hover: title underline + cover scale 1.02, coupled, 140ms ease-out.",
  "Never dim or tint. Reduced motion keeps the underline and drops the scale.",
  "Nothing is hidden at rest. `side` is inert on variant=catalogue.",
].join(" ");
return {
  name: set.name, id: set.id,
  axes: set.variantGroupProperties,
  children: set.children.map((c) => c.name),
};
```

`axes` must report exactly three keys — `variant`, `state`, `side` — with the value lists from §Variant matrix. A fourth key means one cell was misnamed.

### Step 4 — home it and re-grid

```js
const set = await findMaster("work/WorkCard");
if (!set) throw new Error("work/WorkCard not found — step 3 first");
return await home(set, "work");
```

Then re-run the P1-T06 grid script so the `work` section relayouts around the new 1248-wide master.

### Step 5 — archive `work/WorkCardPreviewSmall`

It is human-designed, so it is retired, not deleted.

```js
const legacy = await findMaster("work/WorkCardPreviewSmall");
if (!legacy) return { note: "already absorbed — nothing to archive" };
let arch = figma.root.children.find((p) => p.name === "🗄️ Archive — Components");
if (!arch) { arch = figma.createPage(); arch.name = "🗄️ Archive — Components"; }
await arch.loadAsync();
const instances = await legacy.getInstancesAsync();
arch.appendChild(legacy);
legacy.name = `zz/WorkCardPreviewSmall (superseded by work/WorkCard, ${"2026-08-18"})`;
return { archived: legacy.name, id: legacy.id, liveInstances: instances.map((i) => i.name) };
```

If `liveInstances` is non-empty, those instances still point at the archived master — that is fine for now, phase 3 replaces them when it rebuilds the page frames. Note the list in your report so phase 3 knows where to look.

Creating `🗄️ Archive — Components` is the one page creation this whole plan allows. Do not touch the two existing archive pages.

### Step 6 — cold read-back

Fresh run. Resolve `work/WorkCard` by name and return, per child variant: name, width, height, the `cover` layer's width/height, and whether the title's `textDecoration` is `UNDERLINE`.

Assert:

- 8 children.
- catalogue widths 395; case widths 1248.
- catalogue covers 395×222 (default) / 403×226 (hover); case covers 500×281 (default) / 510×287 (hover).
- `textDecoration === "UNDERLINE"` on all four `state=hover` children, `"NONE"` on the four `state=default`.

### Step 7 — screenshot

`get_screenshot` the whole set, then the `work` section. Look at it: catalogue cards must read as a stack of four aligned text blocks under a cover, not as a bordered box; case rows must alternate visually left/right and the text column must be vertically centred against the cover.

---

## Acceptance

- `work/WorkCard` is a COMPONENT_SET of 8 in the `work` section with axes `variant` / `state` / `side`.
- Both anatomies match the inlined specs, including the real Le concept de la preuve content and its **two** artifact links.
- Hover is underline + 1.02 cover only; the coupling and timing live in the master description.
- `work/WorkCardPreviewSmall` sits on `🗄️ Archive — Components` renamed `zz/…`, not deleted.
- Gate D clean on the `work` section after the re-grid.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T04
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
