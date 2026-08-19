---
task: P3-T05
title: About page master
phase: 3
status: DONE
prerequisite: P3-T03
---

# P3-T05 — `About — Desktop` / `About — Mobile`

Thinnest master in the system: one `about/AboutText` instance inside a document-type `PageContent`. Mirrors `src/pages/about.astro`, which is a single `<AboutText />` inside the page container.

The whole page's content — lead sentence, two prose blocks, the facts grid, the CV link, the two closing links — lives inside the `about/AboutText` master built in P2-T10. Nothing is composed at page level. If you find yourself adding blocks here, the master is wrong, not the page.

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
  const { root, pc } = await shell(`About — ${breakpoint}`, breakpoint, V);

  const about = await inst("about/AboutText", /facts=grid/);
  pc.appendChild(about);

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";

  page.appendChild(root);
  return { name: root.name, id: root.id, children: root.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

`facts=grid` matches the live `VARIANTS.aboutFacts` value recorded in `scripts/pixel-manifest.mjs`. That file is repo-side — if the Figma agent cannot read it, build `grid` and let the repo half of phase 3 confirm. A `strip` build would need a note, not a silent switch.

## Step 2 — constrain the text column

Live About is `lg:w-2/3`. Fresh run:

- Desktop: `about/AboutText` instance → `layoutSizingHorizontal = "FIXED"`, `resize(832, h)`; set `pc.counterAxisAlignItems = "MIN"` so the column sits **left**, not centred, inside the 1280 container.
- Mobile: `layoutSizingHorizontal = "FILL"`, `pc.counterAxisAlignItems` stays as the container recipe set it.

The container recipe's `counterAxisAlignItems = "CENTER"` centres `PageContent` itself in the viewport. Overriding the alignment of `PageContent`'s _children_ to MIN on Desktop is a different axis of the same frame — set it after `container(pc, V)` runs, or it gets overwritten.

## Step 3 — cold read-back + screenshot

Assert both frames are `app/Header` → `PageContent` → `app/Footer`; the About instance is 832 on Desktop and full-width-minus-gutters on Mobile; `PageContent` carries the bound container.

Screenshot both against live `/about`.

---

## Acceptance

- Two masters, one AboutText instance each, no page-level composition.
- 832 left-aligned on Desktop, FILL on Mobile.
- Bound container on `PageContent`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T05
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
