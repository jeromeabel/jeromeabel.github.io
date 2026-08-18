---
task: P2-T09
title: Build work/WorkHeader, blog/PostRowCalm and work/RelatedWriting
phase: 2
status: TODO
prerequisite: P2-T02, P2-T08
---

# P2-T09 — `work/WorkHeader` + `blog/PostRowCalm` + `work/RelatedWriting`

Everything the work-detail route needs above and below the prose. `RelatedWriting` is the mirror of `blog/RelatedWork` from P2-T08 and follows the same decision: it renders a **compact row**, never the full post card.

`work/WorkHeader` needs `ui/Link/external` from P2-T02 — build that first.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## A · `work/WorkHeader` — 832 wide

832 = 1248 × 2/3 (`lg:w-2/3`). VERTICAL, gap 32.

1. **Breadcrumb** — HORIZONTAL, gap 4, `counterAxisAlignItems = "CENTER"`. Text `WORK` (IBM Plex Sans Regular 14, uppercase, fill `2 Theme::color/foreground-muted`) then a `lucide:chevron-right` icon 14×14 same fill. Nothing after the chevron — the H1 below is the current page.
2. **H1** — an instance of `ui/H1`, text `Le concept de la preuve`.
3. **Abstract** — an instance of `ui/PageDescription`, text:
   `Building a minimal comic blog with Astro that stays almost entirely static — except for one serverless endpoint that handles votes`
4. **Facts table** — VERTICAL, gap 0, padding-top 24. Three rows, each HORIZONTAL with a 1px **bottom** hairline bound `2 Theme::color/border`, padding-top/bottom 16:

   | label cell (64 fixed, SemiBold 16, `foreground-strong`) | value cell (FILL, Regular 16, `foreground`)            |
   | ------------------------------------------------------- | ------------------------------------------------------ |
   | `TYPE`                                                  | `Web, Comics`                                          |
   | `DATE`                                                  | `February 2026`                                        |
   | `STACK`                                                 | `Astro, Tailwind CSS, Astro DB, Turso, Netlify, Sharp` |

5. **Artifact links** — HORIZONTAL, gap 16, wrap allowed (`layoutWrap = "WRAP"`), padding-top 16. One `ui/Link/external` instance per link the project has. Label mapping in code is fixed: `website` → `Website`, `live` → `Demo`, `git` → `Code`, `video` → `Video`.

   `leconceptdelapreuve` has `live` and `git` only, so this master shows exactly **two** links: `Demo` and `Code`. Do not pad it to four — the component's real density is part of its documentation.

---

## B · `blog/PostRowCalm` — 720 wide

The quiet post row. Axis `facts` = `plain` · `serie` (the serie chip is conditional in code).

VERTICAL, gap 4, FILL width, padding-left/right 4, padding-top/bottom 16, 1px **bottom** hairline bound `2 Theme::color/border`. No fill, no radius.

1. **Serie chip** _(only on `facts=serie`)_ — HORIZONTAL, gap 4, `counterAxisAlignItems = "CENTER"`: a `lucide:folder` icon 12×12 fill `foreground-muted`, then text Fira Code Regular 12 **uppercase** fill `foreground-muted`, format `WEB PERFORMANCE · 4/5`.
2. **Title row** — HORIZONTAL, FILL width, `SPACE_BETWEEN`, gap 32, `counterAxisAlignItems = "BASELINE"` if available (else `"MIN"`):
   - left: title, IBM Plex Sans **Bold** 16, fill `2 Theme::color/foreground-strong` — `Optimizing Images with Astro (part 1)`
   - right: meta, Fira Code Regular 12, fill `foreground-muted` — `8 min · July 2026`
3. **Description** — IBM Plex Sans Regular 14, fill `foreground-muted`, single line (code clamps at 1) — `How Astro's image pipeline turns a 2 MB hero into 80 KB without a build step of your own.`

Hover in code is `hover:bg-surface-hover`. Document it in the description; do not add a state axis.

---

## C · `work/RelatedWriting` — 720 wide

VERTICAL, gap 16.

1. **Label** — `RELATED WRITING`, IBM Plex Sans Medium 14, uppercase, fill `foreground-muted`.
2. **Rows** — VERTICAL, gap 0 (the rows' own hairlines do the separating), FILL width, holding **two** `blog/PostRowCalm` instances: one `facts=serie`, one `facts=plain`. Two, because the block must show both shapes.

---

## Steps

### Step 1 — build `work/WorkHeader`

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const hair = () => {
  const r = figma.createRectangle();
  r.name = "hairline"; r.resize(100, 1);
  r.setBoundVariable("fills", V["2 Theme::color/border"]);
  return r;
};

const c = figma.createComponent();
c.name = "work/WorkHeader";
c.layoutMode = "VERTICAL"; c.itemSpacing = 32;
c.resize(832, 100);
c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";

const crumb = F("breadcrumb", "HORIZONTAL", { itemSpacing: 4 });
crumb.counterAxisAlignItems = "CENTER";
c.appendChild(crumb);
crumb.appendChild(await T("WORK", { size: 14, fill: V["2 Theme::color/foreground-muted"] }));
const chev = await inst("ui/Icon"); chev.name = "chevron-right"; crumb.appendChild(chev);

const h1 = await inst("ui/H1"); c.appendChild(h1); h1.layoutSizingHorizontal = "FILL";
const desc = await inst("ui/PageDescription"); c.appendChild(desc); desc.layoutSizingHorizontal = "FILL";

const table = F("facts", "VERTICAL", { itemSpacing: 0 });
table.paddingTop = 24;
c.appendChild(table); table.layoutSizingHorizontal = "FILL";
const ROWS = [
  ["TYPE", "Web, Comics"],
  ["DATE", "February 2026"],
  ["STACK", "Astro, Tailwind CSS, Astro DB, Turso, Netlify, Sharp"],
];
for (const [label, value] of ROWS) {
  const wrap = F(label.toLowerCase(), "VERTICAL", { itemSpacing: 0 });
  table.appendChild(wrap); wrap.layoutSizingHorizontal = "FILL";
  const row = F("cells", "HORIZONTAL", { itemSpacing: 0 });
  row.paddingTop = 16; row.paddingBottom = 16;
  wrap.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const lc = F("label", "HORIZONTAL", { itemSpacing: 0 });
  row.appendChild(lc);
  lc.appendChild(await T(label, { size: 16, weight: "SemiBold", fill: V["2 Theme::color/foreground-strong"] }));
  lc.resize(64, lc.height); lc.layoutSizingHorizontal = "FIXED";
  const vc = F("value", "HORIZONTAL", { itemSpacing: 0 });
  row.appendChild(vc); vc.layoutSizingHorizontal = "FILL";
  vc.appendChild(await T(value, { size: 16, fill: V["2 Theme::color/foreground"] }));
  const h = hair(); wrap.appendChild(h); h.layoutSizingHorizontal = "FILL";
}

const links = F("links", "HORIZONTAL", { itemSpacing: 16 });
links.paddingTop = 16;
links.layoutWrap = "WRAP";
c.appendChild(links); links.layoutSizingHorizontal = "FILL";
for (const label of ["Demo", "Code"]) {
  const l = await inst("ui/Link/external");
  links.appendChild(l);
  const t = l.findOne((n) => n.type === "TEXT");
  await figma.loadFontAsync(t.fontName);
  t.characters = label;
}

c.description = "Work-detail header, lg:w-2/3 (832). Link labels are fixed by code: website→Website, live→Demo, git→Code, video→Video. This master shows the two links leconceptdelapreuve actually has.";
page.appendChild(c);
await home(c, "work");
return { name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height),
         stack: c.children.map((k) => `${k.type}:${k.name}`) };
```

If `ui/H1` or `ui/PageDescription` came back as anything but INSTANCE, stop — the phase-1 rename did not land and every later page master will inherit the problem.

### Step 2 — fill the H1 and abstract instances

Fresh run. Set the `ui/H1` instance's text to `Le concept de la preuve` and the `ui/PageDescription` instance's text to the abstract in §A.3. If those masters expose text component properties, set them through `setProperties` rather than editing the TEXT node — report which route you took.

### Step 3 — build `blog/PostRowCalm` (2 variants)

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const hair = () => {
  const r = figma.createRectangle();
  r.name = "hairline"; r.resize(100, 1);
  r.setBoundVariable("fills", V["2 Theme::color/border"]);
  return r;
};

const build = async (facts) => {
  const c = figma.createComponent();
  c.name = `facts=${facts}`;
  c.layoutMode = "VERTICAL"; c.itemSpacing = 4;
  c.resize(720, 100);
  c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";
  c.paddingLeft = c.paddingRight = 4;
  c.paddingTop = c.paddingBottom = 16;

  if (facts === "serie") {
    const chip = F("serie", "HORIZONTAL", { itemSpacing: 4 });
    chip.counterAxisAlignItems = "CENTER";
    c.appendChild(chip);
    const ic = await inst("ui/Icon"); ic.name = "folder"; chip.appendChild(ic);
    chip.appendChild(await T("WEB PERFORMANCE · 4/5", {
      size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] }));
  }

  const row = F("title-row", "HORIZONTAL", { itemSpacing: 32 });
  row.primaryAxisAlignItems = "SPACE_BETWEEN";
  try { row.counterAxisAlignItems = "BASELINE"; } catch (e) { row.counterAxisAlignItems = "MIN"; }
  c.appendChild(row); row.layoutSizingHorizontal = "FILL";
  const title = await T("Optimizing Images with Astro (part 1)", {
    size: 16, weight: "Bold", fill: V["2 Theme::color/foreground-strong"] });
  row.appendChild(title);
  row.appendChild(await T("8 min · July 2026", {
    size: 12, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] }));

  const d = await T("How Astro's image pipeline turns a 2 MB hero into 80 KB without a build step of your own.",
    { size: 14, fill: V["2 Theme::color/foreground-muted"] });
  c.appendChild(d); d.layoutSizingHorizontal = "FILL";
  d.textTruncation = "ENDING";
  d.maxLines = 1;

  const h = hair(); c.appendChild(h); h.layoutSizingHorizontal = "FILL";
  page.appendChild(c);
  return { name: c.name, id: c.id, h: Math.round(c.height) };
};
return [await build("plain"), await build("serie")];
```

`textTruncation` / `maxLines` may not exist on this API version — wrap in try/catch and report if the single-line clamp had to be faked by shortening the copy.

### Step 4 — combine PostRowCalm, then build `work/RelatedWriting`

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const cells = page.children.filter((c) => c.type === "COMPONENT" && /^facts=(plain|serie)$/.test(c.name));
if (cells.length !== 2) throw new Error(`expected 2 cells, found ${cells.length}`);
const set = figma.combineAsVariants(cells, page);
set.name = "blog/PostRowCalm";
set.description = "Quiet post row. Used by work/RelatedWriting and anywhere a list must stay under the page's own content in weight. Hover = color/surface-hover (documented, not a variant). facts=serie adds the folder chip.";
await home(set, "blog");

const rw = figma.createComponent();
rw.name = "work/RelatedWriting";
rw.layoutMode = "VERTICAL"; rw.itemSpacing = 16;
rw.resize(720, 100);
rw.primaryAxisSizingMode = "AUTO"; rw.counterAxisSizingMode = "FIXED";
rw.appendChild(await T("RELATED WRITING", {
  size: 14, weight: "Medium", fill: V["2 Theme::color/foreground-muted"] }));
const rows = F("rows", "VERTICAL", { itemSpacing: 0 });
rw.appendChild(rows); rows.layoutSizingHorizontal = "FILL";
for (const m of [/facts=serie/, /facts=plain/]) {
  const i = await inst("blog/PostRowCalm", m);
  rows.appendChild(i);
  i.layoutSizingHorizontal = "FILL";
}
rw.description = "Footnote block on a work-detail page. Renders blog/PostRowCalm, never blog/PostCard — see decision record related-block-children.";
page.appendChild(rw);
await home(rw, "work");
return { set: set.name, axes: set.variantGroupProperties,
         rw: rw.name, kids: rows.children.map((k) => `${k.type}:${k.name}`) };
```

### Step 5 — cold read-back

Fresh run. Assert:

- `work/WorkHeader` 832 wide; facts table has 3 rows each with a bound hairline; the links row holds exactly **2** INSTANCEs of `ui/Link/external` labelled `Demo` and `Code`; H1 and abstract are INSTANCEs carrying the real copy.
- `blog/PostRowCalm` is a COMPONENT_SET, axis `facts`, 2 variants at 720 wide; only `facts=serie` has a `serie` child.
- `work/RelatedWriting` holds exactly 2 INSTANCEs, in the order serie-then-plain.

### Step 6 — screenshot

Screenshot `work/WorkHeader` against the live route `/work/leconceptdelapreuve`, and `work/RelatedWriting` on its own. The header's facts table is the thing to check: 64 is a tight label column, and `STACK` must not wrap onto the value.

---

## Acceptance

- Three masters homed: `work/WorkHeader`, `work/RelatedWriting` in `work`; `blog/PostRowCalm` in `blog`.
- WorkHeader shows two artifact links, not four.
- RelatedWriting uses PostRowCalm — the decision record from P2-T08 holds.
- All fills, strokes and hairlines bound to `2 Theme::color/*`.
- Gate D clean on `work` and `blog`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T09
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
