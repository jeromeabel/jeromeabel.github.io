---
task: P3-T03
title: Blog master — document-type PageContent, wrapper removed
phase: 3
status: TODO
prerequisite: P3-T01
---

# P3-T03 — `Blog — Desktop` / `Blog — Mobile`

Blog is the **reference document-type route**. The container moves onto `PageContent` and the `PageContentContainer` wrapper level disappears from the file. Tasks P3-T04 … P3-T08 copy this shape.

## Content stack

Live `src/pages/blog.astro`, in order:

1. **PageIntro** — `ui/H1` `Blog` + `ui/PageDescription` `Web performance, clean architecture, and the craft of web engineering.` The header is `lg:w-2/3`, so 832 wide on Desktop, FILL on Mobile.
2. **Archive** — posts grouped by year. Each year group is a two-column row: a **48-wide** year label (`grid-cols-[3rem_1fr]`, Fira Code **Bold** 14, fill `2 Theme::color/foreground`) and, at gap 12, a column of post rows with a 1px **left** rule bound `2 Theme::color/border` and 12 padding after it.
3. **Series** — `ui/H2` `Series` + a two-column grid of `blog/SerieCard`, gap 16, padding-top 32.

**Order note.** Spec §4 lists Series before Archive; the live route renders Archive first. Live wins on order, Figma wins on styling — so build **Intro → Archive → Series** and report it as a spec-amendment candidate rather than a defect. Do not silently build the spec order.

Real content — three year groups is enough to prove the shape:

```
2026   Optimizing Images with Astro (part 2)
       Optimizing Images with Astro (part 1)
       Benchmarking a 10,000-Row Table: v-for, PrimeVue, and TanStack
2025   Exploring a Data-Driven Approach to Web Performance
       Web Performance Tactics Cheatsheet
2024   Testing a Simple Nuxt Feature
```

Series grid: two `blog/SerieCard` instances — `Web Performance` and `My AI Journey`.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — hoist the wrapper and apply the container recipe

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const out = [];
for (const name of ["Blog — Desktop", "Blog — Mobile"]) {
  const frame = page.children.find((c) => c.name === name);
  if (!frame) throw new Error(`${name} missing`);
  const pc = frame.findOne((n) => n.name === "PageContent");
  const wrapper = pc.findOne((n) => n.name === "PageContentContainer");
  const hoisted = [];
  if (wrapper) {
    for (const child of wrapper.children.slice()) {
      pc.appendChild(child);
      if ("layoutSizingHorizontal" in child) child.layoutSizingHorizontal = "FILL";
      hoisted.push(child.name);
    }
    wrapper.remove();
  }
  container(pc, V);
  pc.setBoundVariable("itemSpacing", V["3 Responsive::section/rhythm-y"]);
  pc.setBoundVariable("paddingTop", V["3 Responsive::section/rhythm-y"]);
  pc.setBoundVariable("paddingBottom", V["3 Responsive::section/rhythm-y"]);
  out.push({
    name, hoisted, wrapperRemoved: Boolean(wrapper),
    children: pc.children.map((c) => `${c.type}:${c.name}`),
    bound: Object.keys(pc.boundVariables || {}),
  });
}
return out;
```

`PageContentContainer` is layout scaffolding, not human-designed content — removing it after hoisting its children is the one structural deletion this phase makes, and it is deliberate.

## Step 2 — strip container geometry from the sections inside

Fresh run. For every child of `PageContent`: clear `paddingLeft`/`paddingRight` and `maxWidth` if set, and report any child whose `boundVariables` still names `container/gutter` or `container/max-width`. A section that keeps its own container inside a document-type page doubles the gutter.

An instance of a Home-type section master must **not** appear here. Blog's Series block is `ui/H2` + `blog/SerieCard` instances — not `blog/BlogPreview`, which carries its own container and its own "All posts" link.

## Step 3 — build the three content blocks

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);

const YEARS = [
  ["2026", ["Optimizing Images with Astro (part 2)",
            "Optimizing Images with Astro (part 1)",
            "Benchmarking a 10,000-Row Table: v-for, PrimeVue, and TanStack"]],
  ["2025", ["Exploring a Data-Driven Approach to Web Performance",
            "Web Performance Tactics Cheatsheet"]],
  ["2024", ["Testing a Simple Nuxt Feature"]],
];

const build = async (name) => {
  const frame = page.children.find((c) => c.name === name);
  const pc = frame.findOne((n) => n.name === "PageContent");
  const mobile = name.includes("Mobile");
  for (const c of pc.children.slice()) c.remove();  // rebuilt below from instances

  const intro = F("PageIntro", "VERTICAL", { itemSpacing: 16 });
  pc.appendChild(intro);
  if (mobile) intro.layoutSizingHorizontal = "FILL";
  else { intro.layoutSizingHorizontal = "FIXED"; intro.resize(832, intro.height); }
  const h1 = await inst("ui/H1"); intro.appendChild(h1); h1.layoutSizingHorizontal = "FILL";
  const d = await inst("ui/PageDescription"); intro.appendChild(d); d.layoutSizingHorizontal = "FILL";

  const archive = F("Archive", "VERTICAL", { itemSpacing: 32 });
  pc.appendChild(archive); archive.layoutSizingHorizontal = "FILL";
  for (const [year, posts] of YEARS) {
    const group = F(year, mobile ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 12 });
    archive.appendChild(group); group.layoutSizingHorizontal = "FILL";
    await figma.loadFontAsync({ family: "Fira Code", style: "Bold" });
    const y = figma.createText();
    y.fontName = { family: "Fira Code", style: "Bold" };
    y.fontSize = 14;
    y.characters = year;
    y.fills = [P(V["2 Theme::color/foreground"])];
    group.appendChild(y);
    if (!mobile) { y.resize(48, y.height); y.layoutSizingHorizontal = "FIXED"; }

    const col = F("posts", "HORIZONTAL", { itemSpacing: 0 });
    group.appendChild(col); col.layoutSizingHorizontal = "FILL";
    if (!mobile) {
      // Column divider between two siblings — no element owns this edge, so it
      // stays a rectangle. Element-owned rules use HAIR() instead.
      const rule = figma.createRectangle();
      rule.name = "rule"; rule.resize(1, 20);
      rule.fills = [P(V["2 Theme::color/border"])];
      col.appendChild(rule); rule.layoutSizingVertical = "FILL";
    }
    const inner = F("rows", "VERTICAL", { itemSpacing: 0 });
    inner.paddingLeft = mobile ? 0 : 12;
    col.appendChild(inner); inner.layoutSizingHorizontal = "FILL";
    for (const title of posts) {
      const row = await inst("blog/PostList");
      inner.appendChild(row);
      row.layoutSizingHorizontal = "FILL";
      const t = row.findOne((n) => n.type === "TEXT");
      if (t) { await figma.loadFontAsync(t.fontName); t.characters = title; }
    }
  }

  const series = F("Series", "VERTICAL", { itemSpacing: 32 });
  pc.appendChild(series); series.layoutSizingHorizontal = "FILL";
  const h2 = await inst("ui/H2"); series.appendChild(h2); h2.layoutSizingHorizontal = "FILL";
  const grid = F("grid", mobile ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 16 });
  series.appendChild(grid); grid.layoutSizingHorizontal = "FILL";
  for (const s of ["Web Performance", "My AI Journey"]) {
    const card = await inst("blog/SerieCard");
    grid.appendChild(card);
    card.layoutSizingHorizontal = "FILL";
  }

  return { name, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Blog — Desktop"), await build("Blog — Mobile")];
```

`blog/PostList` is the row master renamed in P1-T05 (was `PostArchiveList`). If it turns out to be a _list_ rather than a _row_ — i.e. it already contains several rows — use it once per year group instead of once per post, and report the shape you found. Read it before you loop.

## Step 4 — fill the intro copy

Fresh run. `ui/H1` → `Blog`; `ui/PageDescription` → `Web performance, clean architecture, and the craft of web engineering.`; `ui/H2` → `Series`.

## Step 5 — cold read-back + screenshot

Assert:

- no node named `PageContentContainer` remains **anywhere in the file** (search all pages, not just 📄 Pages),
- `PageContent` has bound `paddingLeft`, `paddingRight`, `maxWidth`, `itemSpacing`, `paddingTop`, `paddingBottom`,
- content is centred at 1280 on Desktop and fills 390 − 2×16 on Mobile,
- stack order is `PageIntro` → `Archive` → `Series`.

Screenshot both against live `/blog`.

---

## Acceptance

- Wrapper gone, container recipe on `PageContent`, sections bare.
- Three year groups with the 48-wide label and the left rule on Desktop; Mobile stacks the year above its posts with no rule.
- Two SerieCards in the Series grid.
- The order divergence from spec §4 is in the report, not silently resolved.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T03
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
