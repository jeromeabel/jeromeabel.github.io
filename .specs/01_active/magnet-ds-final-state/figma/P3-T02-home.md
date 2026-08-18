---
task: P3-T02
title: Home master — Home-type PageContent
phase: 3
status: TODO
prerequisite: P3-T01
---

# P3-T02 — `Home — Desktop` / `Home — Mobile`

`/` is the only Home-type route: `PageContent` is full-bleed and each section instance owns its own container. The two frames already exist — this normalizes them rather than rebuilding.

## Composition — and the one place Figma leads the code

Target composition (four sections, in order):

```
hero/Hero  →  blog/BlogPreview  →  work/WorkPreview  →  contact/ContactPreview
```

Live `src/pages/index.astro` renders `Hero`, then a `<main>` with `SelectedWriting` / `WorksStrip` / `AboutStrip`, then `Contact`. Two known divergences, both deliberate, both **Figma-leads**:

1. **`AboutStrip` is dropped.** It is one sentence and a link, duplicated verbatim from the top of `/about`. Home does not need it.
2. **`work/WorkPreview` shows three `work/WorkCard variant=catalogue`.** Live `WorksStrip` renders a `WorkMiniCard` / `WorkOverlayCard` grid. The catalogue card is the settled design.

Do not "fix" Figma toward the live code on either point. Both are recorded as code debt in the repo-side notes.

Vertical rhythm between sections is bound to `3 Responsive::section/rhythm-y` (live is `gap-16 lg:gap-24 xl:gap-36`).

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — normalize the Home shell

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const out = [];
for (const name of ["Home — Desktop", "Home — Mobile"]) {
  const frame = page.children.find((c) => c.name === name);
  if (!frame) throw new Error(`${name} missing`);
  const pc = frame.findOne((n) => n.name === "PageContent");
  if (!pc) throw new Error(`${name}: PageContent missing`);

  // Home type: full bleed. No container on PageContent.
  pc.paddingLeft = 0;
  pc.paddingRight = 0;
  if (pc.boundVariables && pc.boundVariables.maxWidth) pc.setBoundVariable("maxWidth", null);
  pc.maxWidth = null;
  pc.setBoundVariable("itemSpacing", V["3 Responsive::section/rhythm-y"]);

  const strip = pc.children.find((c) => /AboutStrip/i.test(c.name));
  if (strip) strip.remove();

  out.push({
    name,
    sections: pc.children.map((c) => ({ name: c.name, type: c.type })),
    removedAboutStrip: Boolean(strip),
    pad: [pc.paddingLeft, pc.paddingRight],
    bound: Object.keys(pc.boundVariables || {}),
  });
}
return out;
```

Removing an **instance** is not deleting human-designed work — the `AboutStrip` master, if one exists, stays where it is. Only the Home composition changes.

## Step 2 — assert the four sections, in order

`sections` must be exactly `hero/Hero`, `blog/BlogPreview`, `work/WorkPreview`, `contact/ContactPreview`, all `INSTANCE`.

- A missing section: `inst(name)` it and append in that order.
- A section that is a `FRAME` rather than an `INSTANCE`: it was detached. Remove it and re-instance — a detached section will not follow its master through the rest of this phase.
- On `Home — Mobile`, set `contact/ContactPreview` to `breakpoint=Mobile` (P2-T06 built that variant):

```js
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const frame = page.children.find((c) => c.name === "Home — Mobile");
const pc = frame.findOne((n) => n.name === "PageContent");
const contact = pc.children.find((c) => /ContactPreview/.test(c.name));
contact.setProperties({ breakpoint: "Mobile" });
return { props: contact.componentProperties };
```

Do the same for any other section that has a `breakpoint` axis — check each one's `componentProperties` and pin it to the frame's breakpoint.

## Step 3 — check each section owns its container

Fresh run. For each of the four section instances, read the inner band's `paddingLeft`/`paddingRight`/`maxWidth` and their `boundVariables` (P1-T08 established which node inside each master carries the recipe — it is the child named `container` or the first FRAME child).

Expected per section: padding bound to `container/gutter`, `maxWidth` bound to `container/max-width`, `counterAxisAlignItems = "CENTER"`.

`PageContent` itself must show `pad: [0, 0]` and a null `maxWidth`. Both conditions true at once is the Home-type recipe; either one alone is a bug.

## Step 4 — fill `work/WorkPreview` with three catalogue cards

If `work/WorkPreview` still holds the old card shape, swap its children for three `work/WorkCard` instances at `variant=catalogue, state=default, side=left`, in an equal three-column HORIZONTAL layout, gap 40 — that is the settled Home grid from the WorkCard spec.

The three, in `featured` order:

```
01  Le concept de la preuve   WEB · 2026
02  Chimères Orchestra        ART · 2013–2019
03  La Malinette              OPEN SOURCE · 2013–2021
```

Note that this edits the **`work/WorkPreview` master**, not the Home frame — the section is a component and its content belongs to it. If the master already carries three catalogue cards from phase 2, skip this step and say so.

## Step 5 — cold read-back + screenshot

Fresh run. Assert per frame: children are `app/Header` (INSTANCE) → `PageContent` (FRAME) → `app/Footer` (INSTANCE); `PageContent` padding `[0,0]`, null maxWidth, bound `itemSpacing`; four section INSTANCEs in the fixed order; no `AboutStrip` anywhere.

Screenshot both frames. Compare with live `/` at 1280 and 390 — expect exactly the two divergences named at the top, and nothing else. A third difference is a real finding: report it.

---

## Acceptance

- `PageContent` is full-bleed on both Home frames, rhythm bound.
- Four sections, right order, all instances, breakpoint props pinned on Mobile.
- Each section carries its own bound container; Home adds none.
- `AboutStrip` gone from the composition.
- `work/WorkPreview` shows three catalogue cards with the real content above.
- The report names the two Figma-leads-code divergences so the repo side can log them as code debt.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T02
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
