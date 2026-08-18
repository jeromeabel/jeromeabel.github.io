---
title: Phase 3 · Tasks 4–6 — Work, About and Post-detail masters
created: 2026-08-17
phase: 3 of 3
part: b of d
---

# Phase 3 · Tasks 4–6 — Work, About and Post-detail masters

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-3-pages.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 4–6.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 4: Work page master

New route master. Mirrors `src/pages/work.astro`: intro, then 4 `work/WorkCard variant=case` blocks in a uniform zigzag, then `work/ArchiveTable`.

**Files:**

- Create: page masters `Work — Desktop`, `Work — Mobile`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `app/Header`, `app/Footer`, `ui/H1`, `ui/PageDescription`, `ui/H2`, `work/WorkCard` (`variant=case`), `work/ArchiveTable`.
- Produces: `Work — Desktop` / `Work — Mobile`, the shell pattern Tasks 5–8 clone.

- [ ] **Step 1: Build the Desktop master**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);

const build = async (breakpoint) => {
  const { root, pc } = await shell(`Work — ${breakpoint}`, breakpoint, V);

  const intro = F("PageIntro", "VERTICAL", { itemSpacing: 16 });
  pc.appendChild(intro); intro.layoutSizingHorizontal = "FILL";
  const h1 = await inst("ui/H1");
  const desc = await inst("ui/PageDescription");
  intro.appendChild(h1); intro.appendChild(desc);
  h1.layoutSizingHorizontal = "FILL"; desc.layoutSizingHorizontal = "FILL";

  const selected = F("Selected", "VERTICAL", { itemSpacing: 64 });
  pc.appendChild(selected); selected.layoutSizingHorizontal = "FILL";
  const h2 = await inst("ui/H2");
  selected.appendChild(h2); h2.layoutSizingHorizontal = "FILL";
  const cards = [];
  for (let i = 0; i < 4; i++) {
    // Zigzag: odd rows put the cover on the right (the `side` axis built in
    // plan-2 Task 4 — an instance cannot reorder its master's children).
    // Mobile is a single column — side is inert there, so keep it left.
    const side = breakpoint === "Mobile" || i % 2 === 0 ? "left" : "right";
    const card = await inst(
      "work/WorkCard",
      new RegExp(`variant=case, state=default, side=${side}`),
    );
    selected.appendChild(card);
    card.layoutSizingHorizontal = "FILL";
    cards.push({ id: card.id, side });
  }

  const more = F("More projects", "VERTICAL", { itemSpacing: 24 });
  pc.appendChild(more); more.layoutSizingHorizontal = "FILL";
  const h2b = await inst("ui/H2");
  more.appendChild(h2b); h2b.layoutSizingHorizontal = "FILL";
  const table = await inst("work/ArchiveTable", new RegExp(`breakpoint=${breakpoint}`));
  more.appendChild(table); table.layoutSizingHorizontal = "FILL";

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";

  page.appendChild(root);
  return { name: root.name, id: root.id, cards, h: Math.round(root.height) };
};
return [await build("Desktop"), await build("Mobile")];
```

- [ ] **Step 2: Verify the zigzag resolved to real variants**

In a fresh call, read each of the four card instances' `componentProperties` and its main component name via `getMainComponentAsync()`. Expected: `side` alternating `left, right, left, right`, all four on `variant=case, state=default`.

If `inst()` fell through to `defaultVariant` (the regex missed), the cards are all `side=left` — the zigzag silently didn't happen. Fix by setting the property directly rather than re-instancing:

```js
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const fixed = [];
for (const name of ["Work — Desktop", "Work — Mobile"]) {
  const selected = page.findOne((n) => n.name === "Selected" && n.parent.parent.name === name);
  const cards = selected.children.filter((c) => c.type === "INSTANCE");
  cards.forEach((c, i) => {
    c.setProperties({ side: i % 2 === 0 ? "left" : "right" });
    fixed.push({ frame: name, i, props: c.componentProperties });
  });
}
return fixed;
```

On Mobile the zigzag is inert — spec and the WorkCard spec §4 both say 390 is a single column with card order preserved. Set every Mobile card to `side=left` so the master's own stacking decides the layout.

- [ ] **Step 3: Add hairlines between case rows**

Per the WorkCard spec §2, case blocks are separated by a hairline. Insert a 1px rectangle bound to `2 Theme/color/border` between consecutive cards inside `Selected` (3 hairlines for 4 cards), each `layoutSizingHorizontal = "FILL"`.

- [ ] **Step 4: Read back cold + screenshot**

Assert: `Work — Desktop` children are `app/Header` (INSTANCE) → `PageContent` (FRAME) → `app/Footer` (INSTANCE); `PageContent` has the bound container recipe; `Selected` holds 4 INSTANCEs of `work/WorkCard` alternating `side=left/right` plus 3 hairlines. Screenshot both frames against live `/work`.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Work page master built (Figma)"
```

---

### Task 5: About page master

Thinnest master in the system: one `about/AboutText` instance inside the document-type `PageContent`. Mirrors `src/pages/about.astro`.

**Files:**

- Create: page masters `About — Desktop`, `About — Mobile`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `app/Header`, `app/Footer`, `about/AboutText`.
- Produces: `About — Desktop` / `About — Mobile`.

- [ ] **Step 1: Build both breakpoints**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const build = async (breakpoint) => {
  const { root, pc } = await shell(`About — ${breakpoint}`, breakpoint, V);

  const about = await inst("about/AboutText", /facts=grid/);
  pc.appendChild(about); about.layoutSizingHorizontal = "FILL";

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";

  page.appendChild(root);
  return { name: root.name, id: root.id, children: root.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

`facts=grid` matches the live `VARIANTS.aboutFacts` value recorded in `scripts/pixel-manifest.mjs:23`. If that config value has changed, use the current one and note the switch in `progress.md`.

- [ ] **Step 2: Constrain the text column**

Live About is `lg:w-2/3` (`AboutText.astro`). On Desktop, set the `about/AboutText` instance to a fixed 832 width with `primaryAxisAlignItems = "MIN"` on `PageContent` so it sits left, not centered. On Mobile it fills.

- [ ] **Step 3: Read back cold + screenshot both against live `/about`.**

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — About page master built (Figma)"
```

---

### Task 6: Post-detail master

First of the four detail rebuilds. Stack per spec §4: `PostHeader` (H1 + metadata) → `ui/Prose` → `ui/SocialShare` → `blog/PostNav` → `blog/RelatedWork`. Mirrors `src/pages/blog/[id].astro`.

**Files:**

- Create: page masters `Post — Desktop`, `Post — Mobile`
- Modify: `progress.md`

**Interfaces:**

- Consumes: `app/Header`, `app/Footer`, `ui/H1`, `blog/PostMetadataTime`, `blog/PostMetadataTopic`, `blog/TableOfContents`, `ui/Prose`, `ui/SocialShare`, `blog/PostNav`, `blog/RelatedWork`.
- Produces: `Post — Desktop` / `Post — Mobile` and the detail shell Tasks 7–8 reuse.

- [ ] **Step 1: Build both breakpoints**

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);

const build = async (breakpoint) => {
  const { root, pc } = await shell(`Post — ${breakpoint}`, breakpoint, V);

  const head = F("PostHeader", "VERTICAL", { itemSpacing: 16 });
  pc.appendChild(head); head.layoutSizingHorizontal = "FILL";
  const h1 = await inst("ui/H1");
  head.appendChild(h1); h1.layoutSizingHorizontal = "FILL";
  const meta = F("metadata", "HORIZONTAL", { itemSpacing: 16 });
  head.appendChild(meta);
  meta.appendChild(await inst("blog/PostMetadataTime"));
  meta.appendChild(await inst("blog/PostMetadataTopic"));

  // Desktop: TOC beside the body; Mobile: TOC above it.
  const body = F("Body", breakpoint === "Mobile" ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 48 });
  pc.appendChild(body); body.layoutSizingHorizontal = "FILL";
  const toc = await inst("blog/TableOfContents");
  const prose = await inst("ui/Prose");
  if (breakpoint === "Mobile") { body.appendChild(toc); body.appendChild(prose); }
  else { body.appendChild(prose); body.appendChild(toc); }
  prose.layoutSizingHorizontal = "FILL";

  for (const n of ["ui/SocialShare", "blog/PostNav", "blog/RelatedWork"]) {
    const i = await inst(n);
    pc.appendChild(i);
    i.layoutSizingHorizontal = "FILL";
  }

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";
  page.appendChild(root);
  return { name: root.name, id: root.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

- [ ] **Step 2: Verify against the live route**

`pnpm dev`, open a real post (`/blog/…`). Check the TOC side, the metadata row order, and whether Share sits above or below PostNav. Live wins on **order**; Figma wins on styling. Record any disagreement in `progress.md` as a code-debt candidate.

- [ ] **Step 3: Read back cold + screenshot**

Assert `PageContent` children are all INSTANCE except the two named layout frames (`PostHeader`, `Body`).

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — Post detail master rebuilt (Figma)"
```
