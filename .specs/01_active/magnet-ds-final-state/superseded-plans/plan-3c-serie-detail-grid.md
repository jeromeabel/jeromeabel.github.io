---
title: Phase 3 · Tasks 7–9 — Serie masters, Work-detail, dark rows and the 32-frame grid
created: 2026-08-17
phase: 3 of 3
part: c of d
---

# Phase 3 · Tasks 7–9 — Serie masters, Work-detail, dark rows and the 32-frame grid

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-3-pages.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 7–9.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 7: Serie-landing and Serie-post masters

Mirrors `src/pages/blog/[serie].astro` and `src/pages/blog/[serie]/[post].astro`.

**Files:**

- Create: page masters `Serie — Desktop`, `Serie — Mobile`, `Serie post — Desktop`, `Serie post — Mobile`
- Modify: `progress.md`

**Interfaces:**

- Consumes: the shared `shell()` helper plus `blog/SerieMeta`, `blog/SerieContents`, `blog/PostRow` (`type=serie`).
- Produces: four page masters.

- [ ] **Step 1: Build the Serie-landing master**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);

const build = async (breakpoint) => {
  const { root, pc } = await shell(`Serie — ${breakpoint}`, breakpoint, V);
  const head = F("SerieHeader", "VERTICAL", { itemSpacing: 16 });
  pc.appendChild(head); head.layoutSizingHorizontal = "FILL";
  const h1 = await inst("ui/H1");
  const desc = await inst("ui/PageDescription");
  const meta = await inst("blog/SerieMeta");
  head.appendChild(h1); head.appendChild(desc); head.appendChild(meta);
  h1.layoutSizingHorizontal = "FILL"; desc.layoutSizingHorizontal = "FILL";

  const contents = await inst("blog/SerieContents");
  pc.appendChild(contents); contents.layoutSizingHorizontal = "FILL";

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";
  page.appendChild(root);
  return { name: root.name, id: root.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

Spec §4 says the serie landing's post rows are `blog/PostRow type=serie`. `blog/SerieContents` (phase 2 Task 7) renders its own numbered list, which is the live `SerieContents.astro` behavior. Keep the master as built and record the reading in `progress.md`: the landing page lists posts through `SerieContents`; `PostRow type=serie` is the row used by `blog/PostList`, not by the contents box. If a reviewer disagrees, that is a spec amendment, not a silent rebuild.

- [ ] **Step 2: Build the Serie-post master**

Same stack as Post detail (Task 6) plus a `blog/SerieContents` instance. Live `[serie]/[post].astro` places it after the prose body and before the nav — verify on the route and match that position.

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const build = async (breakpoint) => {
  const src = page.children.find((c) => c.name === `Post — ${breakpoint}`);
  if (!src) throw new Error(`Post — ${breakpoint} missing — Task 6 first`);
  const clone = src.clone();
  clone.name = `Serie post — ${breakpoint}`;
  const pc = clone.findOne((n) => n.name === "PageContent");
  const contents = await inst("blog/SerieContents");
  const nav = pc.children.find((c) => /PostNav/.test(c.name));
  pc.insertChild(pc.children.indexOf(nav), contents);
  contents.layoutSizingHorizontal = "FILL";
  page.appendChild(clone);
  return { name: clone.name, id: clone.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

Cloning a page master is safe — its children are instances, so the clone shares the same masters and nothing detaches. Cloning a _component_ is not the same thing and is still forbidden.

- [ ] **Step 3: Read back cold + screenshot all four against the live routes.**

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Serie landing + Serie post masters rebuilt"
```

---

### Task 8: Work-detail master

Mirrors `src/pages/work/[id].astro`. Stack per spec §4: `work/WorkHeader` → `ui/Prose` → `work/RelatedWriting`.

**Files:**

- Create: page masters `Work detail — Desktop`, `Work detail — Mobile`
- Modify: `progress.md`

**Interfaces:**

- Consumes: the shared `shell()` helper plus `work/WorkHeader`, `ui/Prose`, `work/RelatedWriting`.
- Produces: the eighth and final route master.

- [ ] **Step 1: Build both breakpoints**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const build = async (breakpoint) => {
  const { root, pc } = await shell(`Work detail — ${breakpoint}`, breakpoint, V);
  for (const n of ["work/WorkHeader", "ui/Prose", "work/RelatedWriting"]) {
    const i = await inst(n);
    pc.appendChild(i);
    i.layoutSizingHorizontal = breakpoint === "Mobile" ? "FILL" : "FIXED";
    if (breakpoint !== "Mobile") i.resize(832, i.height); // lg:w-2/3
  }
  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";
  page.appendChild(root);
  return { name: root.name, id: root.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

- [ ] **Step 2: Fill real content into the WorkHeader instance**

Title `Le concept de la preuve`, the abstract from `src/content/work/leconceptdelapreuve/index.md`, the TYPE/DATE/STACK values from its frontmatter, and only the artifact links that entry actually has. A header showing four links when the project has two misrepresents the component's real density.

- [ ] **Step 3: Read back cold + screenshot against live `/work/leconceptdelapreuve`.**

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Work detail master rebuilt (Figma)"
```

---

### Task 9: Dark rows and the 32-frame grid

8 routes × `Desktop · Mobile · Desktop [Dark] · Mobile [Dark]` = 32 frames on one grid.

**Files:**

- Modify: 📄 Pages layout, all 32 frames
- Modify: `progress.md`

**Interfaces:**

- Consumes: the 16 light masters from Tasks 2–8.
- Produces: the final 📄 Pages canvas.

- [ ] **Step 1: Make every light master a COMPONENT and pin its responsive mode**

A Dark frame can only be an instance if its light counterpart is a component.

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const out = [];
for (const route of ROUTES)
  for (const bp of ["Desktop", "Mobile"]) {
    const name = `${route} — ${bp}`;
    let node = page.children.find((c) => c.name === name);
    if (!node) { out.push({ name, missing: true }); continue; }
    if (node.type === "FRAME") node = figma.createComponentFromNode(node);
    node.name = name;
    const modes = pin(node, V, { "2 Theme": "Light", "3 Responsive": bp === "Mobile" ? "Mobile" : "Desktop" });
    out.push({ name, id: node.id, type: node.type, modes });
  }
return out;
```

Any `missing: true` stops the task — that route master was never built.

- [ ] **Step 2: Create the 16 Dark instances**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const made = [];
for (const route of ROUTES)
  for (const bp of ["Desktop", "Mobile"]) {
    const master = page.children.find(
      (c) => c.type === "COMPONENT" && c.name === `${route} — ${bp}`,
    );
    const darkName = `${route} — ${bp} [Dark]`;
    const existing = page.children.find((c) => c.name === darkName);
    if (existing) existing.remove(); // rebuild: old dark frames may be detached copies
    const dark = master.createInstance();
    dark.name = darkName;
    page.appendChild(dark);
    const modes = pin(dark, V, { "2 Theme": "Dark", "3 Responsive": bp === "Mobile" ? "Mobile" : "Desktop" });
    made.push({ name: darkName, id: dark.id, type: dark.type, modes, h: Math.round(dark.height) });
  }
return made;
```

- [ ] **Step 3: Lay out the 8×4 grid**

```js
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const COL_GAP = 160, ROW_GAP = 240, X0 = 0, Y0 = 0;
let y = Y0;
const placed = [];
for (const route of ROUTES) {
  const row = [
    `${route} — Desktop`, `${route} — Mobile`,
    `${route} — Desktop [Dark]`, `${route} — Mobile [Dark]`,
  ].map((n) => page.children.find((c) => c.name === n));
  if (row.some((n) => !n)) throw new Error(`row ${route} incomplete`);
  let x = X0;
  for (const n of row) { n.x = x; n.y = y; x += n.width + COL_GAP; placed.push(n.name); }
  y += Math.max(...row.map((n) => n.height)) + ROW_GAP;
}
return { placed, rows: ROUTES.length, total: placed.length };
```

`total` must be 32.

- [ ] **Step 4: Prove the Dark rows did not drift**

Fresh call: for each route/breakpoint, compare the light master's height with its Dark instance's height. Any difference means the Dark frame carries an override it should not — the mode pin is supposed to change colors only. Report and fix by resetting the instance (`instance.resetOverrides()`) and re-pinning.

- [ ] **Step 5: Hygiene sweep**

`get_screenshot` the whole 📄 Pages canvas plus each row. Zero overlaps, zero cropping, four frames per row in the fixed order.

- [ ] **Step 6: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — 32-frame page grid with dark instances"
```
