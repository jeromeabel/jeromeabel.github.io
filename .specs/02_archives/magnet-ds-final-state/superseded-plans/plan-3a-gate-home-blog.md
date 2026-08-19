---
title: Phase 3 · Tasks 1–3 — entry gate, Home master, Blog master
created: 2026-08-17
phase: 3 of 3
part: a of d
---

# Phase 3 · Tasks 1–3 — entry gate, Home master, Blog master

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-3-pages.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 1–3.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 1: Phase-3 entry gate — page inventory and container audit

📄 Pages currently holds 4 masters and their Dark instances, built before the container decision. Before adding four routes, establish exactly what is there and which frames violate spec §5.

**Files:**

- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Produces: the page-frame baseline every later task edits against.

- [ ] **Step 1: Load the Figma Plugin API rules** — run `/figma-use`.

- [ ] **Step 2: Walk 📄 Pages and record the shell of every frame**

```js
const page = figma.root.children.find((p) => p.name.includes("Pages"));
await page.loadAsync();
const desc = (n) => ({
  name: n.name, id: n.id, type: n.type,
  w: Math.round(n.width), h: Math.round(n.height),
  x: Math.round(n.x), y: Math.round(n.y),
  modes: n.explicitVariableModes || {},
  children: ("children" in n ? n.children : []).map((c) => ({
    name: c.name, type: c.type,
    pad: "paddingLeft" in c ? [c.paddingLeft, c.paddingRight] : null,
    maxW: "maxWidth" in c ? c.maxWidth : null,
    bound: Object.keys(c.boundVariables || {}),
    kids: ("children" in c ? c.children : []).map((k) => `${k.type}:${k.name}`),
  })),
});
return {
  count: page.children.length,
  frames: page.children.map(desc),
  hasWrapper: page.findAll((n) => n.name === "PageContentContainer").map((n) => ({
    id: n.id, parent: n.parent.name,
  })),
};
```

- [ ] **Step 3: Write the baseline into `progress.md`**

Record, per frame: is it a COMPONENT or an INSTANCE; what its `PageContent` padding/maxWidth bindings are; whether a `PageContentContainer` wrapper exists; which explicit modes are pinned. Then list the deltas this phase must close:

- `PageContentContainer` present anywhere → removed in Task 3.
- A Home frame containing an `AboutStrip` instance → dropped in Task 2 (spec §7 removes it from the Home composition).
- Any Dark frame that is not an INSTANCE → rebuilt in Task 9.

- [ ] **Step 4: Confirm the phase-2 component roster is intact**

Re-run `plan-2-components.md` Task 1 Step 2 and assert `missing` and `legacy` are both empty. Building pages against a half-finished library produces broken instances that are expensive to unpick.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — phase 3 entry gate (page baseline)"
```

---

### Task 2: Home master — Home-type PageContent

`/` is the only Home-type route: `PageContent` is full-bleed (pad-x 0) and each of the four section instances owns its own container. Mirrors `src/pages/index.astro`.

**Files:**

- Modify: page masters `Home — Desktop`, `Home — Mobile` on 📄 Pages
- Modify: `progress.md`

**Interfaces:**

- Consumes: `app/Header`, `hero/Hero`, `blog/BlogPreview`, `work/WorkPreview`, `contact/ContactPreview`, `app/Footer`.
- Produces: the Home-type `PageContent` recipe every later task contrasts against.

- [ ] **Step 1: Normalize the Home shell**

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

  // Home type: full bleed, no container on PageContent.
  pc.paddingLeft = 0;
  pc.paddingRight = 0;
  if (pc.boundVariables && pc.boundVariables.maxWidth)
    pc.setBoundVariable("maxWidth", null);
  pc.maxWidth = null;
  pc.setBoundVariable("itemSpacing", V["3 Responsive::section/rhythm-y"]);

  // Drop AboutStrip from the composition (spec §7).
  const strip = pc.children.find((c) => /AboutStrip/i.test(c.name));
  if (strip) strip.remove();

  out.push({
    name,
    sections: pc.children.map((c) => ({ name: c.name, type: c.type })),
    removedAboutStrip: Boolean(strip),
    pad: [pc.paddingLeft, pc.paddingRight],
    itemSpacingBound: Object.keys(pc.boundVariables || {}),
  });
}
return out;
```

- [ ] **Step 2: Assert the four sections, in order**

The returned `sections` must be exactly `hero/Hero`, `blog/BlogPreview`, `work/WorkPreview`, `contact/ContactPreview`, all `INSTANCE`. If a section is missing, instance it with `inst(name)` and append in that order. If a section is a FRAME rather than an INSTANCE, it was detached — delete it and re-instance.

- [ ] **Step 3: Check each section owns its container**

Fresh call: for each of the four section instances, read `paddingLeft/Right` and `maxWidth` **on its inner band** (phase 1 Task 8 established which node in each master carries the recipe) and confirm both are variable-bound. Home frames must not add container padding of their own — that would double the gutter.

- [ ] **Step 4: Screenshot both Home frames and compare with the live route**

`pnpm dev`, open `/` at 1280 and 390, screenshot the Figma frames, compare section order and rhythm. Differences are recorded in `progress.md` — Figma is ahead of code, so a difference is only a defect when Figma is the one that's wrong.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Home master normalized (Home-type PageContent)"
```

---

### Task 3: Blog master — document-type PageContent, wrapper removed

Blog is the reference document-type route. The container moves onto `PageContent` and the `PageContentContainer` wrapper level disappears.

**Files:**

- Modify: page masters `Blog — Desktop`, `Blog — Mobile`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `ui/H1`, `ui/PageDescription`, `ui/H2`, `blog/SerieList`, `blog/PostList`.
- Produces: the document-type `PageContent` recipe reused by Tasks 4–8.

- [ ] **Step 1: Hoist the wrapper's children and apply the container recipe**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const out = [];
for (const name of ["Blog — Desktop", "Blog — Mobile"]) {
  const frame = page.children.find((c) => c.name === name);
  const pc = frame.findOne((n) => n.name === "PageContent");
  const wrapper = pc.findOne((n) => n.name === "PageContentContainer");
  const hoisted = [];
  if (wrapper) {
    for (const child of wrapper.children.slice()) {
      pc.appendChild(child);
      if ("layoutSizingHorizontal" in child) child.layoutSizingHorizontal = "FILL";
      hoisted.push(child.name);
    }
    wrapper.remove();
  }
  container(pc, V);
  pc.setBoundVariable("itemSpacing", V["3 Responsive::section/rhythm-y"]);
  out.push({
    name,
    hoisted,
    wrapperRemoved: Boolean(wrapper),
    children: pc.children.map((c) => `${c.type}:${c.name}`),
    bound: Object.keys(pc.boundVariables || {}),
  });
}
return out;
```

- [ ] **Step 2: Strip container geometry from the sections inside**

Sections inside a document-type `PageContent` must be bare — no padding, no maxWidth. In a fresh call, for every child of `PageContent`, clear `paddingLeft/Right` and `maxWidth` if set, and report any child whose `boundVariables` still names `container/gutter` or `container/max-width`.

An instance of a Home-type section master (e.g. `blog/BlogPreview`) must **not** appear on Blog — it carries its own container. Blog's Series block is `ui/H2` + `blog/SerieList`, not the Home teaser.

- [ ] **Step 3: Confirm the content stack**

Per spec §4, `PageContent` children are exactly: `PageIntro` (FRAME holding `ui/H1` + `ui/PageDescription`), `Series` (FRAME holding `ui/H2` + `blog/SerieList`), `Archive` (FRAME holding one `blog/PostList` per year). Create any missing layout frame with `F(name, "VERTICAL", { itemSpacing: 24 })` and instance the missing children.

- [ ] **Step 4: Read back cold + screenshot**

Assert: no node named `PageContentContainer` remains anywhere in the file; `PageContent` has bound `paddingLeft`, `paddingRight`, `maxWidth`; content is horizontally centered at 1280 and fills 390 minus 2×16 on Mobile.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Blog master on document-type PageContent"
```
