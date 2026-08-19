---
task: P3-T08
title: Work-detail master
phase: 3
status: TODO
prerequisite: P3-T03
---

# P3-T08 — `Work detail — Desktop` / `Work detail — Mobile`

Eighth and final route master. Mirrors `src/pages/work/[id].astro`.

## Live anatomy

```
container py-section gap-8 lg:gap-12
  work/WorkHeader
  cover image (16:9, radius 8)
ui/Prose                       ← live places this OUTSIDE the container
container mt-12 lg:mt-16
  work/RelatedWriting
container mt-8 lg:mt-12  (flex-col sm:flex-row gap-4)
  ui/Link/secondary  "All work"
  ui/Link/secondary  "Next: Chimères Orchestra"
```

Live puts `Prose` outside `.container` and lets Prose's own max-width do the work; the rendered column width is the same either way. In Figma keep everything inside the document-type `PageContent` — same visual result, one container recipe instead of two. Record it as an intentional simplification.

Content is `Le concept de la preuve` throughout: the abstract from its frontmatter, TYPE `Web, Comics`, DATE `February 2026`, STACK `Astro, Tailwind CSS, Astro DB, Turso, Netlify, Sharp`, and exactly **two** artifact links — `Demo` and `Code`. A header showing four links when the entry has two misrepresents the component's real density.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — build both breakpoints

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const build = async (breakpoint) => {
  const mobile = breakpoint === "Mobile";
  const { root, pc } = await shell(`Work detail — ${breakpoint}`, breakpoint, V);
  pc.itemSpacing = mobile ? 32 : 48;

  const header = await inst("work/WorkHeader");
  pc.appendChild(header);
  if (mobile) header.layoutSizingHorizontal = "FILL";
  else { header.layoutSizingHorizontal = "FIXED"; header.resize(832, header.height); }

  const cover = figma.createRectangle();
  cover.name = "cover"; cover.cornerRadius = 8;
  cover.resize(mobile ? 358 : 1280, mobile ? 201 : 720);
  cover.fills = [P(V["2 Theme::color/surface"])];
  pc.appendChild(cover); cover.layoutSizingHorizontal = "FILL";

  const prose = await inst("ui/Prose");
  pc.appendChild(prose);
  if (mobile) prose.layoutSizingHorizontal = "FILL";
  else { prose.layoutSizingHorizontal = "FIXED"; prose.resize(832, prose.height); }

  const related = await inst("work/RelatedWriting");
  pc.appendChild(related);
  if (mobile) related.layoutSizingHorizontal = "FILL";
  else { related.layoutSizingHorizontal = "FIXED"; related.resize(832, related.height); }

  const links = F("PageLinks", mobile ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 16 });
  pc.appendChild(links);
  links.appendChild(await inst("ui/Link/secondary"));
  links.appendChild(await inst("ui/Link/secondary"));

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";
  page.appendChild(root);
  return { name: root.name, id: root.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

`counterAxisAlignItems = "MIN"` on `PageContent` after `container()` so the 832 column sits left, matching About and the detail routes.

## Step 2 — fill real content

Fresh run:

- WorkHeader: breadcrumb `WORK`, H1 `Le concept de la preuve`, description = the entry abstract, facts TYPE `Web, Comics` / DATE `February 2026` / STACK `Astro, Tailwind CSS, Astro DB, Turso, Netlify, Sharp`, links `Demo` + `Code` only.
- `work/RelatedWriting` keeps the two `blog/PostRowCalm` instances built into the master.
- link labels → `All work` and `Next: Chimères Orchestra`.

## Step 3 — cold read-back + screenshot

Assert `PageContent` children are `work/WorkHeader` → cover → `ui/Prose` → `work/RelatedWriting` → `PageLinks`, all INSTANCE except cover and `PageLinks`. Screenshot both against live `/work/leconceptdelapreuve`.

---

## Acceptance

- Both masters built, left-aligned 832 column on Desktop.
- Exactly two artifact links in the header.
- The Prose-outside-container simplification recorded.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T08
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
