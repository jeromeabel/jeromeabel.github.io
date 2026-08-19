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
  const archived = p.name.startsWith("🗄️");
  out.pages.push({ name: p.name, id: p.id, children: p.children.length, archived });
  for (const n of p.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")) {
    if (n.parent && n.parent.type === "COMPONENT_SET") continue;
    let sec = n.parent;
    while (sec && sec.type !== "SECTION" && sec.type !== "PAGE") sec = sec.parent;
    out.masters.push({
      name: n.name, id: n.id, type: n.type, page: p.name, archived,
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

**Walk the archive pages too.** An earlier revision of this brief skipped every `🗄️` page,
which silently dropped the **7 archived `_Docs/*` masters** on `🗄️ Archive — Docs v1` and made
assertion 2 read 4 and assertion 4 read 54 — a fabricated gate failure, not a real one. Assertions 2
and 4 count document-wide (that is how P1-T09 measured 11 / 47); assertions 1 and 5–8 filter on
`page` / `archived` instead. See `inventory.md` §`_Docs/*` — 11, unchanged.

## Step 2 — the roster assertions

| #   | assertion                                                                                                             | expected                                    |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | masters on ❖ Components                                                                                               | **46**                                      |
| 2   | `_Docs/*` masters, **document-wide**                                                                                  | **11** = 4 live on 📚 Docs + 7 on 🗄️ Archive — Docs v1 |
| 3   | page masters on 📄 Pages                                                                                              | **4** (unchanged — phase 3 builds the rest) |
| 4   | total masters, **document-wide** (archive included)                                                                    | **61** = 46 + 11 + 4                        |
| 5   | every ❖ Components master matches `^(app\|ui\|blog\|work\|hero\|contact\|about)/`                                     | 0 exceptions                                |
| 6   | every ❖ Components master has a non-null `section` equal to its domain prefix                                         | 0 exceptions                                |
| 7   | the `about` section is non-empty                                                                                      | 2 masters                                   |
| 8   | no master named `work/WorkCardPreviewSmall`, `NavLinkHome`, `PostCardPreviewBig`, `PostCardPreviewSmall` outside `🗄️` | 0 hits                                      |
| 9   | every non-archived COMPONENT_SET's `axes` are lowercase                                                               | 0 exceptions                                |

Assertions 1 and 5–8 read only masters with `archived === false`; the archived seven are counted by
2 and 4 and inspected by nothing else. Assertion 9 covers ❖ Components **and** the four live
`_Docs/*` sets: `_Docs/Date` is `variant` and `_Docs/Status` is `status` (renamed at this gate —
`P3-T10` step 3 was updated to match). The archived seven are plain `COMPONENT`s with no axes.

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

## Step 3b — carried repair from P2-T03

`ui/Link/iconOnly` `size=small` reads back **24×24** — that is the mobile number of live
`iconSmall` (`h-6 w-6 lg:h-8 lg:w-8`), and this DS is built at desktop. Resize the `small` variant
(both states) to **32×32**, keep radius `full`, 1px dashed stroke bound to `color/foreground-muted`,
hover fill `color/surface`. `ui/SocialShare` holds instances and inherits the new size — do not edit
it. Verify after: `ui/SocialShare` reads back with three 32×32 children.

## Step 3c — carried repair from P2-T10: `iconSide` on `ui/Link/external`

`About.astro` passes an explicit **leading** `lucide:download` to the CV link. `ui/Link/external`
slots its icon at index 1 and `insertChild` throws inside an instance, so P2-T10 left it trailing
and carried the fix here. Add an `iconSide` axis — `trailing` (the existing geometry, default) and
`leading` — then re-point the `about/AboutText` CV instance to `iconSide=leading`.

1. Clone the master, move the `icon` child to index 0, name the two cells
   `iconSide=trailing` / `iconSide=leading`, `figma.combineAsVariants(cells, page)`.
2. `set.name = "ui/Link/external"`. Bindings, hug sizing and the 120×40 read-back of the
   `trailing` cell must survive the clone — verify, do not assume.
3. Find the CV link instance inside `about/AboutText` and set `iconSide=leading`. Read back
   `componentProperties`, not the layer name — P2-T10 recorded that layer names inside instances
   stay stale.

`combineAsVariants` drops the new set at the page root, so it is a **stray**. Re-run **P1-T06
Step 1** (home into `ui`), then **Step 2** (re-grid) before Step 5's Gate D.

## Step 3d — carried repair from P2-T07: the fake `chevron-down`

P2-T07 renamed a `chevron-right` instance to `chevron-down` because `ui/Icon` had no such glyph.
The layer name now asserts a glyph the instance does not carry, which no downstream check can
detect — this gate resolves it rather than passing it to phase 3.

1. Read `ui/Icon`'s glyph property: the axis name and its current values
   (`componentPropertyDefinitions` on the set, plus each cell's variant values).
2. Add a `chevron-down` variant: duplicate an existing cell, delete its vector, and append

   ```js
   const svg = figma.createNodeFromSvg(
     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
   );
   ```

   Match the sibling cells exactly: same frame size, same stroke binding to the theme variable they
   use, same layer naming. A glyph that renders but is unbound is a Step-4 finding.
3. Re-point every instance currently **named** `chevron-down` — `blog/TableOfContents`
   `breakpoint=Mobile` and any in `blog/SerieContents` — through the glyph property, then confirm
   `componentProperties` reads back `chevron-down`. Report how many instances were re-pointed.

If `ui/Icon`'s glyph is **not** a variant axis but a swap property over per-glyph masters, build the
`chevron-down` master the same way its siblings are built and swap to it. Either way the end state
is: no instance named for a glyph it does not carry.

## Step 3e — carried repair from P2-T10b: 36 legacy hairlines out of layout

A CSS border grows an auto-height box, so a Figma stroke standing in for one must be in layout.
`HAIR()` enforces this now, but eight pre-P2-T09 masters were built before the rule existed and
still carry `strokesIncludedInLayout = false`: `app/Footer` 12 · `blog/PostList` 9 ·
`blog/PostRow` 4 · `ui/Link/inline` 3 · `app/NavLink` 2 · `blog/BlogPreview` 2 ·
`work/WorkPreview` 2 · `contact/ContactPreview` 2 = **36**. Each is 1–2px tight against its CSS
counterpart.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const before = {}, flipped = [];
for (const m of page.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET"))
  if (!(m.parent && m.parent.type === "COMPONENT_SET")) before[m.name] = Math.round(m.height);
for (const n of page.findAll((x) => "strokesIncludedInLayout" in x)) {
  const w = n.strokeTopWeight + n.strokeBottomWeight + n.strokeLeftWeight + n.strokeRightWeight;
  if (Array.isArray(n.strokes) && n.strokes.length && w > 0 && n.strokesIncludedInLayout === false) {
    n.strokesIncludedInLayout = true;
    flipped.push({ node: n.name, id: n.id });
  }
}
const after = {};
for (const m of page.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET"))
  if (!(m.parent && m.parent.type === "COMPONENT_SET")) after[m.name] = Math.round(m.height);
const grew = Object.keys(before).filter((k) => before[k] !== after[k]).map((k) => [k, before[k], after[k]]);
return { count: flipped.length, flipped, grew };
```

`count` should be **36**. A different number is a finding, not a licence to move on — say which
masters contributed and why the survey disagrees. Every master in `grew` grew by the weight of the
rules it carries; that growth is the correction, so re-run **P1-T06 Step 2** (re-grid) afterwards or
Step 5 will report overlaps that Step 3e caused.

One deliberate exception, already recorded: `blog/TableOfContents breakpoint=Mobile` carries a
pre-existing full-box `1,1,1,1` stroke that is already in layout. It is not part of the 36.

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

Additionally, **`about/AboutText` and `about/AboutFacts` in light and dark** — P2-T10 shipped them
without a dark render, and P2-T07 recorded that the export context rendered dark identically to
light. If dark comes back identical again, say so plainly and hand it to P3-T09 (the mode-pinned
dark grid); do not report it as verified.

## Step 7 — description coverage

Every master built in phase 2 carries a description (the `described` flag from step 1). Phase 2 took ❖ Components from 32 to 46, so **14** masters are new and must all be `true`; the masters phase 2 rebuilt rather than created (`work/WorkCard`, `work/ArchiveTable`, `contact/ContactPreview`, `blog/TableOfContents`, `ui/Prose`) must be `true` as well. Report the count you assert against and which masters it covers. A component whose behavioural rules (hover coupling, column drops, mobile reflow, the related-block decision) live only in this brief and not in the file is undocumented the moment these briefs are archived.

---

## Acceptance

- All 9 roster assertions pass, on the exact names listed, counted **document-wide** for 2 and 4.
- All 9 variant-axis rows match, plus the new `ui/Link/external` `iconSide` axis.
- The four carried repairs are done: `iconOnly/small` 32×32 (3b), `iconSide` (3c),
  a real `chevron-down` (3d), 36 hairlines in layout (3e).
- Gate D returns three empty arrays — **after** the re-grid that 3c and 3e make necessary.
- Every phase-2 master has a description.
- Raw fills/strokes limited to the four deliberate exceptions, everything else reported.

Report the four counts (46 / 11 / 4 / 61), the axis table verdicts, the four repair verdicts, the Gate D arrays and the raw-binding list. Phase 3 starts only after this report comes back clean.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T11
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
REPAIRS: 3b iconOnly 32×32 · 3c iconSide · 3d chevron-down · 3e 36 hairlines — verdict each
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
