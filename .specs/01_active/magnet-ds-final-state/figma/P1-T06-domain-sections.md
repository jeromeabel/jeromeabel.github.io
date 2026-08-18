---
task: P1-T06
title: Re-section ❖ Components into 7 domain sections
phase: 1
status: DONE (2026-08-18)
prerequisite: P1-T05
---

# P1-T06 — Seven domain sections + canvas hygiene

Today's sections group by what a component _is_ (Chrome / Actions / Sections / Typography / Metadata / Cards). The target groups by **which code folder owns it**, so a Figma name maps to a path. This brief also clears the Gate D hygiene baseline from P1-T01.

<!-- include: _run-rules.md -->

---

## Step 1 — Create the seven sections, move masters in

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const ORDER = ["app", "ui", "blog", "work", "hero", "contact", "about"];
const sections = {};
for (const name of ORDER) {
  let s = page.children.find((c) => c.type === "SECTION" && c.name === name);
  if (!s) { s = figma.createSection(); s.name = name; page.appendChild(s); }
  sections[name] = s;
}

const masters = page
  .findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")
  .filter((x) => !(x.parent && x.parent.type === "COMPONENT_SET"));

const moved = [], unhomed = [];
for (const m of masters) {
  const domain = m.name.split("/")[0];
  if (!sections[domain]) { unhomed.push(m.name); continue; }
  sections[domain].appendChild(m);
  moved.push({ name: m.name, section: domain });
}
return { moved, unhomed, sectionIds: Object.fromEntries(ORDER.map((n) => [n, sections[n].id])) };
```

`unhomed` must contain **only** the five P1-T07 stragglers plus the 11 `_Docs/*` masters. `_Docs/*` stays where it is — it is doc infrastructure, not a DS domain. The `about` section is created empty; P2-T10 fills it.

**Re-run this exact step after P1-T07** to sweep the merged masters into their sections.

---

## Step 2 — Lay out each section on one grid

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const ORDER = ["app", "ui", "blog", "work", "hero", "contact", "about"];
const GAP = 80, PAD = 80, COLS = 4, CELL = 520;
let sectionY = 0;
const laid = [];
for (const name of ORDER) {
  const s = page.children.find((c) => c.type === "SECTION" && c.name === name);
  if (!s) continue;
  const kids = s.children.slice().sort((a, b) => a.name.localeCompare(b.name));
  let rowH = 0, x = PAD, y = PAD, col = 0;
  for (const k of kids) {
    k.x = x; k.y = y;
    rowH = Math.max(rowH, k.height);
    col++;
    if (col === COLS) { col = 0; x = PAD; y += rowH + GAP; rowH = 0; }
    else { x += Math.max(CELL, k.width) + GAP; }
  }
  const w = PAD * 2 + COLS * CELL + (COLS - 1) * GAP;
  const h = y + rowH + PAD;
  s.resizeWithoutConstraints(w, Math.max(h, 400));
  s.x = 0; s.y = sectionY;
  sectionY += s.height + 160;
  laid.push({ section: name, count: kids.length, w: Math.round(s.width), h: Math.round(s.height) });
}
return laid;
```

A master wider than `CELL` keeps its own width (the `Math.max`), so a 1280-wide section master like `hero/Hero` takes a wider column slot instead of being cropped.

---

## Step 3 — Re-run Gate D hygiene, using absolute coordinates

⚠️ The original Gate D script compared **section-relative** `x`/`y` and produced ~79 false overlap pairs. Use `absoluteBoundingBox`:

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const masters = page
  .findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")
  .filter((x) => !(x.parent && x.parent.type === "COMPONENT_SET"));
const box = (n) => n.absoluteBoundingBox;
const overlaps = [];
for (let i = 0; i < masters.length; i++)
  for (let j = i + 1; j < masters.length; j++) {
    const a = box(masters[i]), b = box(masters[j]);
    if (!a || !b) continue;
    if (a.x < b.x + b.width && b.x < a.x + a.width &&
        a.y < b.y + b.height && b.y < a.y + a.height)
      overlaps.push([masters[i].name, masters[j].name]);
  }
// A master whose absolute box escapes its own section's absolute box.
const cropped = [];
for (const m of masters) {
  const s = m.parent;
  if (!s || s.type !== "SECTION") continue;
  const a = box(m), sb = box(s);
  if (!a || !sb) continue;
  if (a.x < sb.x || a.y < sb.y || a.x + a.width > sb.x + sb.width || a.y + a.height > sb.y + sb.height)
    cropped.push({ master: m.name, section: s.name });
}
const strays = masters.filter((m) => !m.parent || m.parent.type !== "SECTION").map((m) => m.name);
return { overlaps, cropped, strays, count: masters.length };
```

**Expected:** `overlaps: []`, `cropped: []`, `strays` containing only `_Docs/*`.

The P1-T01 baseline recorded `WorkPreviewSection` overflowing its section by 90px — Step 2's `resizeWithoutConstraints` is what fixes it. If `cropped` still names `work/WorkPreview`, re-run Step 2 before doing anything else.

Do **not** proceed with a non-empty `overlaps`. Hygiene violations rank equal to naming drift.

---

## Step 4 — Look at it

Screenshot each of the 7 sections. A section where a master is clipped by the section bounds, or where two masters visually touch, **fails** — even when the geometry check passed. A `COMPONENT_SET`'s purple label sits outside its reported bounds, so the numbers can lie and your eyes cannot.

## Acceptance

- 7 sections exist, in the order `app · ui · blog · work · hero · contact · about`.
- Every `domain/*` master sits inside its own section.
- `overlaps`, `cropped` empty; `strays` = `_Docs/*` only.
- 7 screenshots reviewed.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T06
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
