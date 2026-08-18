---
title: Phase 2 · Tasks 6–8 — contact/ContactPreview and the blog masters
created: 2026-08-17
phase: 2 of 3
part: c of d
---

# Phase 2 · Tasks 6–8 — contact/ContactPreview and the blog masters

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-2-components.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 6–8.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 6: `contact/ContactPreview` — mobile variant

Closes the gap the responsive-architecture work left open (`.specs/00_backlog/figma-mobile-section-variants.md`): `ContactPreview` renders Desktop-width internals inside 390 frames.

**Files:**

- Modify: master `contact/ContactPreview` → COMPONENT_SET with `breakpoint=Desktop|Mobile`
- Modify: `progress.md`, `.specs/00_backlog/figma-mobile-section-variants.md`

**Interfaces:**

- Produces: `contact/ContactPreview` with a `breakpoint` axis. Phase 3's Home — Mobile master switches the instance onto `breakpoint=Mobile`.

- [ ] **Step 1: Read the current master's structure**

```js
for (const p of figma.root.children) {
  await p.loadAsync();
  const n = p.findOne((x) => x.name === "contact/ContactPreview");
  if (!n) continue;
  const f = n.type === "COMPONENT_SET" ? n.children[0] : n;
  return {
    id: n.id, isSet: n.type === "COMPONENT_SET",
    layoutMode: f.layoutMode,
    pad: [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft],
    bound: Object.keys(f.boundVariables || {}),
    children: f.children.map((c) => ({
      name: c.name, type: c.type,
      layoutMode: "layoutMode" in c ? c.layoutMode : null,
      w: Math.round(c.width),
    })),
  };
}
```

- [ ] **Step 2: Add the axis and flip the mobile layout**

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const master = page.findOne((n) => n.name === "contact/ContactPreview");
if (master.type === "COMPONENT_SET") return { skipped: "already a set" };

const parent = master.parent;
const mobile = master.clone();
master.name = "breakpoint=Desktop";
mobile.name = "breakpoint=Mobile";
parent.appendChild(mobile);

mobile.resize(390, mobile.height);
const flip = (frame) => {
  frame.layoutMode = "VERTICAL";
  for (const c of frame.children) {
    if ("layoutSizingHorizontal" in c) c.layoutSizingHorizontal = "FILL";
    if ("layoutSizingVertical" in c) c.layoutSizingVertical = "HUG";
  }
};
flip(mobile);
const set = figma.combineAsVariants([master, mobile], parent);
set.name = "contact/ContactPreview";
return { setId: set.id, properties: set.variantGroupProperties };
```

- [ ] **Step 3: Re-set sizing and re-read in a separate call**

Flipping `layoutMode` re-maps children from FILL/HUG and collapses dimensions. In a **fresh** call, read every child's `layoutSizingHorizontal`, `layoutSizingVertical`, and width in the Mobile variant; fix any child that came back FIXED at a desktop width. Confirm padding is still bound to `container/gutter` (phase 1 Task 8) — a clone keeps bindings, but the flip can drop them.

- [ ] **Step 4: Screenshot at Mobile mode**

Pin `3 Responsive` to Mobile on a scratch frame containing the Mobile variant, screenshot, then delete the scratch frame. Content must fit 390 with 16px gutters and no overlap of `ContactImage`/`ContactNoise` layers.

- [ ] **Step 5: Close the backlog note and commit**

Update `.specs/00_backlog/figma-mobile-section-variants.md`: strike the ContactPreview line, note the remaining gap (`blog/BlogPreview` mobile, if still open after phase 3).

```bash
git add .specs/00_backlog/figma-mobile-section-variants.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — ContactPreview mobile variant"
```

---

### Task 7: `blog/TableOfContents` and `blog/SerieContents`

Rebuilds, not promotions — both masters were pruned with the 2026-07 detail templates. Mirror `src/components/blog/TableOfContents.astro` and `SerieContents.astro`.

**Files:**

- Create: masters `blog/TableOfContents`, `blog/SerieContents` in section `blog`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `2 Theme` (`color/foreground`, `foreground-muted`, `foreground-strong`, `border`).
- Produces: `blog/TableOfContents` (`state=default|active-item`), `blog/SerieContents` (no variants). Phase 3's Post-detail, Serie-landing and Serie-post masters instance them.

- [ ] **Step 1: Build `blog/TableOfContents`**

Per `TableOfContents.astro`: label "On this page" (uppercase, muted, 14) then an ordered list; every item is a left-border rail (`border-s-2` on `color/border`, 12px inset), muted text; nested children get one more 12px inset. The active item switches text and border to `color/foreground-strong` at weight 500.

```js
const V = await VARS();
const muted = V["2 Theme::color/foreground-muted"];
const strong = V["2 Theme::color/foreground-strong"];
const border = V["2 Theme::color/border"];

const toc = F("blog/TableOfContents", "VERTICAL", { itemSpacing: 12 });
toc.resize(280, 100);
toc.layoutSizingHorizontal = "FIXED";
toc.primaryAxisSizingMode = "AUTO";

const label = await T("On this page", { size: 14, weight: "Medium", fill: muted });
label.textCase = "UPPER";
toc.appendChild(label);

const list = F("items", "VERTICAL", { itemSpacing: 8 });
toc.appendChild(list); list.layoutSizingHorizontal = "FILL";

const item = async (text, depth, active) => {
  const row = F(active ? "item-active" : "item", "HORIZONTAL", {
    paddingLeft: 12 + depth * 12,
  });
  row.strokeLeftWeight = 2;
  row.setBoundVariable("strokes", active ? strong : border);
  list.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const t = await T(text, {
    size: 14, weight: active ? "Medium" : "Regular",
    fill: active ? strong : muted,
  });
  row.appendChild(t); t.layoutSizingHorizontal = "FILL";
  return row;
};
await item("Pourquoi mesurer", 0, false);
await item("Le protocole", 0, true);
await item("Throttling et cache", 1, false);
await item("Ce que montrent les chiffres", 0, false);

const master = figma.createComponentFromNode(toc);
master.name = "blog/TableOfContents";
const sectionId = await home(master, "blog");
return { id: master.id, sectionId, items: master.children.length };
```

The active row is shown _inside_ the master (one item active), not as a variant — the live component always has exactly one active item, driven by scroll position.

- [ ] **Step 2: Build `blog/SerieContents`**

Per `SerieContents.astro`: bordered box, radius 8, padding 16 (24 at `md`), label `In this series — <title>` (uppercase muted 14), then a numbered list where the current post is `foreground-strong` weight 500 and the others are muted links.

```js
const V = await VARS();
const muted = V["2 Theme::color/foreground-muted"];
const strong = V["2 Theme::color/foreground-strong"];
const border = V["2 Theme::color/border"];

const box = F("blog/SerieContents", "VERTICAL", {
  itemSpacing: 12, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24,
});
box.resize(720, 100);
box.layoutSizingHorizontal = "FIXED";
box.primaryAxisSizingMode = "AUTO";
box.cornerRadius = 8;
box.strokeWeight = 1;
box.setBoundVariable("strokes", border);

const label = await T("In this series — Web performance", { size: 14, weight: "Medium", fill: muted });
label.textCase = "UPPER";
box.appendChild(label);

const list = F("posts", "VERTICAL", { itemSpacing: 8 });
box.appendChild(list); list.layoutSizingHorizontal = "FILL";
const POSTS = [
  ["1. Mesurer avant d'optimiser", false],
  ["2. Le protocole de mesure", true],
  ["3. Ce que Lighthouse ne dit pas", false],
];
for (const [text, current] of POSTS) {
  const t = await T(text, {
    size: 16, weight: current ? "Medium" : "Regular",
    fill: current ? strong : muted,
  });
  t.name = current ? "post-current" : "post";
  list.appendChild(t); t.layoutSizingHorizontal = "FILL";
}
const master = figma.createComponentFromNode(box);
master.name = "blog/SerieContents";
const sectionId = await home(master, "blog");
return { id: master.id, sectionId };
```

- [ ] **Step 3: Read back cold + screenshot both, light and dark**

Assert every fill and stroke is bound (`boundVariables` non-empty). A muted/strong pair that only reads correctly in Light means a raw fill slipped in.

- [ ] **Step 4: Re-grid and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — blog TOC + SerieContents rebuilt (Figma)"
```

---

### Task 8: `blog/PostNav` and `blog/RelatedWork`

`blog/PostNav` mirrors `src/components/ui/LinkNavPost.astro` (code moves `ui → blog` later, on the code-debt list). `blog/RelatedWork` mirrors `src/components/blog/RelatedWork.astro` — **but** its live child `WorkMiniCard` is on the retirement list, so the rebuild needs a replacement child. That decision is made here and recorded.

**Files:**

- Create: masters `blog/PostNav`, `blog/RelatedWork` in section `blog`
- Modify: 📐 Decisions (one new record), `progress.md`

**Interfaces:**

- Consumes: `work/WorkCard` (Task 4).
- Produces: `blog/PostNav` (no variants — it holds both prev and next cells), `blog/RelatedWork` (no variants). Phase 3's Post-detail and Serie-post masters instance both.

- [ ] **Step 1: Record the related-block child decision**

`RelatedWork.astro` renders `WorkMiniCard`; `RelatedWriting.astro` (Task 9) renders `PostRowCalm`. Both children are retired explorations per spec §3, so the rebuilt masters cannot instance them.

Decision to record on 📐 Decisions, as a fifth record named `related-block-children`, same card format as phase 1 Task 2:

> **Decision:** `blog/RelatedWork` shows `work/WorkCard variant=catalogue` instances in a 3-column grid; `work/RelatedWriting` shows `blog/PostRow type=post` instances in a vertical stack.
> **Why:** The live children (`WorkMiniCard`, `PostRowCalm`) are retired explorations. Reusing the canon card and row keeps one grammar per domain — work is a catalogue card, writing is a feed row — instead of a third card family that exists only inside related blocks.
> **Consequences:** Code debt: `RelatedWork.astro` and `RelatedWriting.astro` swap children; `WorkMiniCard` and `PostRowCalm` are archived, not deleted. The related grid is a size use of `catalogue`, not a new variant.

Create it the same way as phase 1 Task 2 Step 3 (instance `_Docs/DecisionCard` into the `Records` frame).

- [ ] **Step 2: Build `blog/PostNav`**

Per `LinkNavPost.astro:21-40`: two half-width cells, 1px border, padding 16 (24 at `lg`), gap 12; prev = left arrow then left-aligned text, next = right-aligned text then right arrow; each cell has a muted "Previous"/"Next" label above a title at 20/24.

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];

const nav = F("blog/PostNav", "HORIZONTAL", { itemSpacing: 16 });
nav.resize(720, 100);
nav.layoutSizingHorizontal = "FIXED";
nav.counterAxisSizingMode = "AUTO";

let iconSet = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne((x) => x.name === "ui/Icon");
  if (hit) { iconSet = hit; break; }
}
const iconBase = iconSet && (iconSet.type === "COMPONENT_SET" ? iconSet.defaultVariant : iconSet);

const cell = async (kind, title) => {
  const c = F(kind, "HORIZONTAL", {
    itemSpacing: 12, paddingTop: 24, paddingBottom: 24, paddingLeft: 16, paddingRight: 16,
  });
  c.counterAxisAlignItems = "CENTER";
  c.strokeWeight = 1;
  c.setBoundVariable("strokes", border);
  nav.appendChild(c); c.layoutSizingHorizontal = "FILL";

  const text = F("text", "VERTICAL", { itemSpacing: 4 });
  const label = await T(kind === "prev" ? "Previous" : "Next", { size: 16, fill: muted });
  const t = await T(title, { size: 24, fill: fg });
  text.appendChild(label); text.appendChild(t);

  const arrow = iconBase ? iconBase.createInstance() : await T(kind === "prev" ? "←" : "→", { size: 24, fill: muted });
  arrow.name = kind === "prev" ? "arrow-left" : "arrow-right";

  if (kind === "prev") { c.appendChild(arrow); c.appendChild(text); }
  else {
    c.appendChild(text); c.appendChild(arrow);
    c.primaryAxisAlignItems = "MAX";
    label.textAlignHorizontal = "RIGHT";
    t.textAlignHorizontal = "RIGHT";
  }
  text.layoutSizingHorizontal = "FILL";
  return { kind, id: c.id, arrowType: arrow.type };
};
const cells = [await cell("prev", "Mesurer avant d'optimiser"), await cell("next", "Ce que Lighthouse ne dit pas")];
const master = figma.createComponentFromNode(nav);
master.name = "blog/PostNav";
const sectionId = await home(master, "blog");
return { id: master.id, sectionId, cells };
```

If `arrowType` comes back `TEXT`, the `ui/Icon` set was not found — stop and resolve the name; a typed arrow glyph is exactly the drift this system exists to prevent.

- [ ] **Step 3: Build `blog/RelatedWork`**

Per `RelatedWork.astro:14-23`, with the Step-1 decision applied: uppercase muted label "Related work", then a 3-column grid of `work/WorkCard variant=catalogue` instances.

```js
const V = await VARS();
const muted = V["2 Theme::color/foreground-muted"];

const block = F("blog/RelatedWork", "VERTICAL", { itemSpacing: 16 });
block.resize(720, 100);
block.layoutSizingHorizontal = "FIXED";
block.primaryAxisSizingMode = "AUTO";

const label = await T("Related work", { size: 14, weight: "Medium", fill: muted });
label.textCase = "UPPER";
block.appendChild(label);

const grid = F("grid", "HORIZONTAL", { itemSpacing: 16 });
block.appendChild(grid); grid.layoutSizingHorizontal = "FILL";

let card = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne((x) => x.name === "work/WorkCard");
  if (hit) { card = hit; break; }
}
if (!card) throw new Error("work/WorkCard not found — Task 4 must run first");
const base =
  card.type === "COMPONENT_SET"
    ? card.children.find((c) => /variant=catalogue, state=default/.test(c.name))
    : card;
const made = [];
for (let i = 0; i < 3; i++) {
  const inst = base.createInstance();
  grid.appendChild(inst);
  inst.layoutSizingHorizontal = "FILL";
  made.push(inst.id);
}
const master = figma.createComponentFromNode(block);
master.name = "blog/RelatedWork";
const sectionId = await home(master, "blog");
return { id: master.id, sectionId, instances: made };
```

- [ ] **Step 4: Read back cold + screenshot**

Assert `blog/RelatedWork` children are INSTANCE nodes whose main component is `work/WorkCard` (`await node.getMainComponentAsync()`), not detached copies. Screenshot both masters.

- [ ] **Step 5: Re-grid and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — blog/PostNav + blog/RelatedWork rebuilt"
```
