---
task: P2-T11
title: Phase-2 gate — 61-master roster + hygiene
phase: 2
status: TODO
prerequisite: P2-T02 … P2-T10
---

# P2-T11 — Phase-2 gate

Figma-side gate only. Nothing in phase 3 starts until every assertion below passes. The repo half of this gate (token dump, verify scripts, knowledge file, commits) lives in `../repo/phase-2.md` and is run by Claude Code, not by you.

A gate that "mostly passes" is a gate that failed. Report the failing rows and stop — do not fix them by inventing a component.

<!-- include: _run-rules.md -->

---

## Step 1 — full re-inventory

```js
const out = { pages: [], masters: [] };
for (const p of figma.root.children) {
  await p.loadAsync();
  out.pages.push({ name: p.name, id: p.id, children: p.children.length });
  if (p.name.startsWith("🗄️")) continue;
  for (const n of p.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")) {
    if (n.parent && n.parent.type === "COMPONENT_SET") continue;
    let sec = n.parent;
    while (sec && sec.type !== "SECTION" && sec.type !== "PAGE") sec = sec.parent;
    out.masters.push({
      name: n.name, id: n.id, type: n.type, page: p.name,
      section: sec && sec.type === "SECTION" ? sec.name : null,
      variants: n.type === "COMPONENT_SET" ? n.children.length : null,
      axes: n.type === "COMPONENT_SET" ? Object.keys(n.variantGroupProperties || {}) : null,
      w: Math.round(n.width), h: Math.round(n.height),
      described: Boolean(n.description && n.description.length > 20),
    });
  }
}
return out;
```

## Step 2 — the roster assertions

| #   | assertion                                                                                                             | expected                                    |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | masters on ❖ Components                                                                                               | **46**                                      |
| 2   | `_Docs/*` masters                                                                                                     | **11**                                      |
| 3   | page masters on 📄 Pages                                                                                              | **4** (unchanged — phase 3 builds the rest) |
| 4   | total masters                                                                                                         | **61**                                      |
| 5   | every ❖ Components master matches `^(app\|ui\|blog\|work\|hero\|contact\|about)/`                                     | 0 exceptions                                |
| 6   | every ❖ Components master has a non-null `section` equal to its domain prefix                                         | 0 exceptions                                |
| 7   | the `about` section is non-empty                                                                                      | 2 masters                                   |
| 8   | no master named `work/WorkCardPreviewSmall`, `NavLinkHome`, `PostCardPreviewBig`, `PostCardPreviewSmall` outside `🗄️` | 0 hits                                      |
| 9   | every COMPONENT_SET's `axes` are lowercase                                                                            | 0 exceptions                                |

The 46 by domain: `app` 6 · `ui` 13 · `blog` 14 · `work` 6 · `hero` 3 · `contact` 2 · `about` 2.

Full expected roster — anything present that is not on this list, or absent that is, is a gate failure:

```
app/Header  app/Footer  app/NavLink  app/HeaderDrawer  app/ThemeToggle  app/MotionToggle

ui/Icon  ui/H1  ui/H2  ui/PageDescription  ui/SectionTitle  ui/Prose  ui/SocialShare
ui/Link/primary  ui/Link/secondary  ui/Link/inline  ui/Link/textLink  ui/Link/iconOnly
ui/Link/external

blog/PostCard  blog/PostRow  blog/PostRowCalm  blog/SerieCard  blog/BlogPreview
blog/SerieList  blog/PostList  blog/PostMetadataTime  blog/PostMetadataTopic
blog/SerieMeta  blog/TableOfContents  blog/SerieContents  blog/PostNav  blog/RelatedWork

work/WorkPreview  work/WorkCard  work/WorkMiniCard  work/ArchiveTable
work/WorkHeader  work/RelatedWriting

hero/Hero  hero/HeroText  hero/HeroAnimation

contact/ContactPreview  contact/ContactContent

about/AboutText  about/AboutFacts
```

## Step 3 — variant-axis assertions

| master                   | axes                          | variants              |
| ------------------------ | ----------------------------- | --------------------- |
| `work/WorkCard`          | `variant`, `state`, `side`    | 8                     |
| `work/ArchiveTable`      | `breakpoint`                  | 3                     |
| `blog/TableOfContents`   | `breakpoint`                  | 2                     |
| `blog/PostNav`           | `type`                        | 3                     |
| `blog/PostRowCalm`       | `facts`                       | 2                     |
| `about/AboutFacts`       | `facts`                       | 2                     |
| `contact/ContactPreview` | `breakpoint`                  | 2                     |
| `app/NavLink`            | `type`                        | (as merged in P1-T07) |
| `blog/PostCard`          | `size`, `breakpoint`, `state` | (as merged in P1-T07) |

## Step 4 — binding sweep

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const raw = [];
const isBound = (n, key) => Boolean(n.boundVariables && n.boundVariables[key]);
for (const n of page.findAll((x) => ["TEXT", "RECTANGLE", "FRAME", "COMPONENT", "INSTANCE"].includes(x.type))) {
  const fills = n.fills;
  if (Array.isArray(fills) && fills.some((f) => f.type === "SOLID") && !isBound(n, "fills"))
    raw.push({ node: n.name, type: n.type, what: "fill" });
  const strokes = n.strokes;
  if (Array.isArray(strokes) && strokes.length && !isBound(n, "strokes"))
    raw.push({ node: n.name, type: n.type, what: "stroke" });
}
return { rawCount: raw.length, raw: raw.slice(0, 60) };
```

Every entry is either a real defect or a deliberate exception. Deliberate exceptions so far: the placeholder `cover` rectangles in `work/WorkCard` and `work/WorkMiniCard` (they stand in for photography), and any decorative artwork inside `contact/ContactPreview` and `hero/*`. Anything else goes in the report under `UNBOUND:`.

## Step 5 — Gate D hygiene, all seven sections

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const secs = page.children.filter((c) => c.type === "SECTION");
const box = (n) => n.absoluteBoundingBox;
const hit = (a, b) => a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const overlaps = [], cropped = [], strays = [];
for (const s of secs) {
  const sb = box(s);
  const kids = s.children;
  for (let i = 0; i < kids.length; i++) {
    const kb = box(kids[i]);
    if (kb && sb && (kb.x < sb.x || kb.y < sb.y || kb.x + kb.width > sb.x + sb.width || kb.y + kb.height > sb.y + sb.height))
      cropped.push({ section: s.name, node: kids[i].name });
    for (let j = i + 1; j < kids.length; j++)
      if (hit(kb, box(kids[j]))) overlaps.push([s.name, kids[i].name, kids[j].name]);
  }
}
for (const c of page.children)
  if (c.type === "COMPONENT" || c.type === "COMPONENT_SET") strays.push(c.name);
return { sections: secs.map((s) => ({ name: s.name, count: s.children.length })), overlaps, cropped, strays };
```

All three arrays must be empty. `strays` non-empty means a master is sitting loose on the page instead of inside its domain section — re-run the P1-T06 homing and grid scripts.

## Step 6 — screenshot sweep

`get_screenshot` each of the seven sections plus the whole ❖ Components page. Look at them. Geometry passing and the canvas looking right are two different claims; both are required.

## Step 7 — description coverage

Every master built in phase 2 carries a description (the `described` flag from step 1). The 15 new masters must all be `true`. A component whose behavioural rules (hover coupling, column drops, mobile reflow, the related-block decision) live only in this brief and not in the file is undocumented the moment these briefs are archived.

---

## Acceptance

- All 9 roster assertions pass, on the exact names listed.
- All 7 variant-axis rows match.
- Gate D returns three empty arrays.
- Every phase-2 master has a description.
- Raw fills/strokes limited to the four deliberate exceptions, everything else reported.

Report the four counts (46 / 11 / 4 / 61), the axis table verdicts, the Gate D arrays and the raw-binding list. Phase 3 starts only after this report comes back clean.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T11
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
