---
title: Phase 1 · Tasks 5–6 — mechanical renames and domain sections
created: 2026-08-17
phase: 1 of 3
part: c of d
---

# Phase 1 · Tasks 5–6 — mechanical renames and domain sections

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-1-foundations.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 5–6.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 5: Mechanical renames to `domain/Component`

The single highest-risk-of-boredom task and the one that makes everything after it legible. Renaming a master does not touch instances' links — instances follow by id — so this is safe, but it must be complete: a half-renamed roster is worse than none.

**Files:**

- Modify: 30 masters on ❖ Components (the 4 merge sources are renamed by Task 7)
- Create: `.specs/01_active/magnet-ds-final-state/rename-map.md`
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Masters.
- Produces: `rename-map.md` — the live→canon table with per-row verdict. Phases 2 and 3 address every master by its canon name and read this file when a name looks unfamiliar.

- [ ] **Step 1: Apply the rename map in ONE batched call**

```js
const MAP = {
  // app/
  Header: "app/Header",
  Footer: "app/Footer",
  HeaderDrawer: "app/HeaderDrawer",
  ThemeToggle: "app/ThemeToggle",
  MotionToggle: "app/MotionToggle",
  // ui/
  Icon: "ui/Icon",
  H1: "ui/H1",
  H2: "ui/H2",
  PageDescription: "ui/PageDescription",
  PreviewTitle: "ui/SectionTitle",
  // live names per inventory.md §Gate B — the plan's earlier
  // CTA/SecondarySm/TextCTA/Icon keys were a stale naming vintage
  "Link/Primary": "ui/Link/primary",
  "Link/Secondary": "ui/Link/secondary",
  "Link/SecondarySmall": "ui/Link/inline",
  "Link/TextLink": "ui/Link/textLink",
  "Link/IconOnly": "ui/Link/iconOnly",
  // hero/
  Hero: "hero/Hero",
  HeroText: "hero/HeroText",
  HeroAnimation: "hero/HeroAnimation",
  // blog/
  BlogPreviewSection: "blog/BlogPreview",
  PostArchiveList: "blog/PostList",
  SerieCardList: "blog/SerieList",
  PostRow: "blog/PostRow",
  SerieCard: "blog/SerieCard",
  PostMetadataTime: "blog/PostMetadataTime",
  PostMetadataTopic: "blog/PostMetadataTopic",
  SerieMeta: "blog/SerieMeta",
  // work/
  WorkPreviewSection: "work/WorkPreview",
  // contact/
  ContactPreviewSection: "contact/ContactPreview",
  ContactContent: "contact/ContactContent",
};

const out = { renamed: [], skipped: [], missing: [] };
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue; // archives are immutable
  for (const node of p.findAll(
    (x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET",
  )) {
    if (node.parent && node.parent.type === "COMPONENT_SET") continue;
    const target = MAP[node.name];
    if (!target) continue;
    node.name = target;
    out.renamed.push({ from: Object.keys(MAP).find((k) => MAP[k] === target), to: target, id: node.id });
  }
}
for (const k of Object.keys(MAP)) {
  const found = out.renamed.some((r) => r.to === MAP[k]);
  if (!found) out.missing.push(k);
}
return out;
```

Names **not** in the map and why: `NavLink` + `NavLinkHome`, `PostCardPreviewBig` + `PostCardPreviewSmall` are merged (and renamed) in Task 7; `WorkCardPreviewSmall` is absorbed into `work/WorkCard` in phase 2; `_Docs/*` masters keep their names (doc infrastructure, out of DS component scope).

- [ ] **Step 2: Read back and prove 30 renames landed**

Fresh call: re-run the Task 1 Pass-0 walk and return only masters on ❖ Components. Assert every returned name either contains a `/` domain prefix from the seven domains, or is one of the five known stragglers (`NavLink`, `NavLinkHome`, `PostCardPreviewBig`, `PostCardPreviewSmall`, `WorkCardPreviewSmall`). Anything else is an un-renamed master — fix it before moving on.

- [ ] **Step 3: Write `rename-map.md`**

A three-column table: live name (2026-08-15 roster) / canon name / verdict (`renamed` · `deferred to Task 7` · `deferred to phase 2`). Add a short header noting that `Preview` in `BlogPreview` / `WorkPreview` / `ContactPreview` is the documented semantic-role exception to the no-suffix rule, and that `Section` was dropped from all three.

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/magnet-ds-final-state/rename-map.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — domain/Component rename map applied"
```

---

### Task 6: Re-section ❖ Components into 7 domain sections

Today's 6 functional sections (Chrome / Actions / Sections / Typography / Metadata / Cards) group by what a component _is_. The spec groups by which code folder owns it, so a Figma name maps to a path. This task also clears the Gate D hygiene baseline.

**Files:**

- Modify: page ❖ Components (sections + master positions)
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `rename-map.md`, `inventory.md` §Gate D.
- Produces: 7 SECTION nodes named `app`, `ui`, `blog`, `work`, `hero`, `contact`, `about` (the last is empty until phase 2), each holding its domain's masters in inventory order. Phase 2 appends new masters into these sections by name.

- [ ] **Step 1: Create the seven sections and move masters into them**

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const ORDER = ["app", "ui", "blog", "work", "hero", "contact", "about"];
const sections = {};
for (const name of ORDER) {
  let s = page.children.find((c) => c.type === "SECTION" && c.name === name);
  if (!s) {
    s = figma.createSection();
    s.name = name;
    page.appendChild(s);
  }
  sections[name] = s;
}

const masters = page
  .findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")
  .filter((x) => !(x.parent && x.parent.type === "COMPONENT_SET"));

const moved = [],
  unhomed = [];
for (const m of masters) {
  const domain = m.name.split("/")[0];
  if (!sections[domain]) {
    unhomed.push(m.name);
    continue;
  }
  sections[domain].appendChild(m);
  moved.push({ name: m.name, section: domain });
}
return { moved, unhomed, sectionIds: Object.fromEntries(ORDER.map((n) => [n, sections[n].id])) };
```

`unhomed` should contain only the Task 7 stragglers. Re-run this same call after Task 7 to sweep them in.

- [ ] **Step 2: Lay out each section on one grid — no overlaps, no cropping**

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const ORDER = ["app", "ui", "blog", "work", "hero", "contact", "about"];
const GAP = 80,
  PAD = 80,
  COLS = 4,
  CELL = 520;
let sectionY = 0;
const laid = [];
for (const name of ORDER) {
  const s = page.children.find((c) => c.type === "SECTION" && c.name === name);
  if (!s) continue;
  const kids = s.children
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
  let rowH = 0,
    x = PAD,
    y = PAD,
    col = 0;
  for (const k of kids) {
    k.x = x;
    k.y = y;
    rowH = Math.max(rowH, k.height);
    col++;
    if (col === COLS) {
      col = 0;
      x = PAD;
      y += rowH + GAP;
      rowH = 0;
    } else {
      x += Math.max(CELL, k.width) + GAP;
    }
  }
  const w = PAD * 2 + COLS * CELL + (COLS - 1) * GAP;
  const h = y + rowH + PAD;
  s.resizeWithoutConstraints(w, Math.max(h, 400));
  s.x = 0;
  s.y = sectionY;
  sectionY += s.height + 160;
  laid.push({ section: name, count: kids.length, w: Math.round(s.width), h: Math.round(s.height) });
}
return laid;
```

A master wider than `CELL` keeps its own width (the `Math.max`), so section masters like `hero/Hero` at 1280 do not get cropped — they simply take a wider column slot.

- [ ] **Step 3: Re-run the Gate D hygiene check**

Fresh call: re-run Task 1's Gate D block (overlap pairs + strays) scoped to ❖ Components. Expected: `overlaps: []` and `strays: []`. Any remaining pair is a real bug — fix positions and re-check. Do not proceed with a non-empty Gate D; hygiene violations rank equal to naming drift per spec §3.

- [ ] **Step 4: Screenshot each section**

Use `get_screenshot` on each of the 7 section node ids. Look at them. A section where a master is clipped by the section bounds, or where two masters visually touch, fails — even if the geometry check passed (a COMPONENT_SET's visual label sits outside its bounds).

- [ ] **Step 5: Log and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — 7 domain sections + canvas hygiene pass"
```
