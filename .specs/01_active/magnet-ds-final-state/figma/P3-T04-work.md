---
task: P3-T04
title: Work page master — case zigzag + archive table
phase: 3
status: TODO
prerequisite: P3-T03
---

# P3-T04 — `Work — Desktop` / `Work — Mobile`

New route master, document type. Mirrors `src/pages/work.astro`.

**Live-vs-Figma divergence, deliberate.** The live `/work` route today renders a gallery grid of `WorkOverlayCard`. The spec replaces that with the case zigzag built in P2-T04. Figma leads here — build the zigzag, and report the gap as a code-debt candidate. Do **not** copy the live grid.

## Content stack

```
PageIntro    ui/H1 "Work" + ui/PageDescription
Selected     ui/H2 "Selected projects"
             4 × work/WorkCard variant=case, side alternating left/right
             3 × hairline between them
More         ui/H2 "More projects" + work/ArchiveTable
```

Real content for the 4 case cards, in order:

| #   | side  | Project                 | Kicker                    |
| --- | ----- | ----------------------- | ------------------------- |
| 1   | left  | Le concept de la preuve | `WEB · 2026`              |
| 2   | right | Chimères Orchestra      | `ART · 2013–2019`         |
| 3   | left  | La Malinette            | `OPEN SOURCE · 2013–2021` |
| 4   | right | Portfolio               | `WEB · 2024–NOW`          |

Intro copy: H1 `Work`, description `Projects I built, shipped, and learned from — web engineering, interactive art, and open-source tools.`

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
    // Mobile is a single column — `side` is inert there, so keep it left.
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

## Step 2 — prove the zigzag resolved to real variants

Fresh run. Read each card instance's `componentProperties` plus its master name via `getMainComponentAsync()`. Expected on Desktop: `side` = `left, right, left, right`, all four `variant=case, state=default`.

If `inst()` fell through to `defaultVariant` — the regex missed — every card is `side=left` and the zigzag silently did not happen. Fix by setting the property, not by re-instancing:

```js
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const fixed = [];
for (const name of ["Work — Desktop", "Work — Mobile"]) {
  const frame = page.children.find((c) => c.name === name);
  const selected = frame.findOne((n) => n.name === "Selected");
  const cards = selected.children.filter((c) => c.type === "INSTANCE");
  cards.forEach((c, i) => {
    const side = name.includes("Mobile") ? "left" : (i % 2 === 0 ? "left" : "right");
    c.setProperties({ side });
    fixed.push({ frame: name, i, props: c.componentProperties });
  });
}
return fixed;
```

## Step 3 — hairlines between case rows

Insert a 1px rectangle bound to `2 Theme::color/border` between consecutive cards inside `Selected` — 3 hairlines for 4 cards — each `layoutSizingHorizontal = "FILL"`. Rectangle **on purpose**: these rules sit between two sibling instances and no element owns the edge, so the `HAIR()` rule in `_run-rules.md` does not apply (and a stroke on a WorkCard instance would be a local override). Do it in the same run as the zigzag fix if that run was needed; otherwise its own run.

## Step 4 — fill real copy

Fresh run. Set:

- `ui/H1` → `Work`
- `ui/PageDescription` → `Projects I built, shipped, and learned from — web engineering, interactive art, and open-source tools.`
- first `ui/H2` → `Selected projects`, second `ui/H2` → `More projects`
- each card's kicker + title per the table above. The case master's PROBLEM/SOLUTION/LEARNING sentences may stay as built in P2-T04 for cards 2–4; card 1 gets the real Le concept de la preuve text already in the master.

Instance text overrides are fine here — this is a page master showing real content, not a component definition.

## Step 5 — cold read-back + screenshot

Assert `Work — Desktop` children are `app/Header` (INSTANCE) → `PageContent` (FRAME) → `app/Footer` (INSTANCE); `PageContent` carries the bound container recipe; `Selected` holds 4 WorkCard INSTANCEs alternating side plus 3 hairlines; `More projects` holds one `work/ArchiveTable` at the matching `breakpoint`.

Screenshot both. Compare with live `/work` and state plainly in the report that the zigzag is a **Figma-leads-code** divergence, not a mismatch to fix in Figma.

---

## Acceptance

- Both masters built with the full stack.
- Zigzag verified by `componentProperties`, not assumed.
- 3 hairlines present.
- ArchiveTable variant matches the frame's breakpoint.
- Divergence from live `/work` reported as code debt.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T04
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
