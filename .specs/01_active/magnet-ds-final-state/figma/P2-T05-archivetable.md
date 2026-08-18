---
task: P2-T05
title: Build work/ArchiveTable
phase: 2
status: TODO
prerequisite: P2-T01
---

# P2-T05 — `work/ArchiveTable`

The "More projects" table at the bottom of `/work`. Everything that is not one of the four Selected case blocks lands here — a dense, quiet, five-column list.

Two variants on a `breakpoint` axis, because the table **drops columns** rather than scrolling on small screens.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## Variant matrix

| axis         | values                          |
| ------------ | ------------------------------- |
| `breakpoint` | `Desktop` · `Tablet` · `Mobile` |

Column visibility by breakpoint — this is the whole point of the axis:

| column     | Desktop | Tablet | Mobile |
| ---------- | ------- | ------ | ------ |
| Year       | ✓       | ✓      | ✓      |
| Project    | ✓       | ✓      | ✓      |
| Type       | ✓       | ✓      | —      |
| Built with | ✓       | —      | —      |
| Link       | ✓       | ✓      | ✓      |

(`Type` is `hidden sm:table-cell`, `Built with` is `hidden md:table-cell` — so Mobile shows three columns, Tablet four, Desktop five.)

Widths: Desktop 1248, Tablet 704, Mobile 358 (390 − 2×16 gutter).

---

## Anatomy

Root: VERTICAL auto-layout, no fill, no border, `itemSpacing = 0`. The table's only rules are horizontal hairlines.

**Header row** — HORIZONTAL, FILL width, padding-bottom 8, with a 1px bottom hairline bound to `2 Theme::color/border`. Each cell:

- Fira Code Regular 12, **uppercase**, fill `2 Theme::color/foreground-muted`, `textAlignHorizontal = "LEFT"`, padding-right 16.
- Labels exactly: `YEAR` · `PROJECT` · `TYPE` · `BUILT WITH` · `LINK`.

**Body row** — HORIZONTAL, FILL width, `counterAxisAlignItems = "CENTER"`, padding-top 8, padding-bottom 8, 1px bottom hairline. Cells:

| cell       | width   | type                                                                                           |
| ---------- | ------- | ---------------------------------------------------------------------------------------------- |
| Year       | 64 fix  | Fira Code Regular 12, fill `foreground-muted`                                                  |
| Project    | FILL    | IBM Plex Sans **SemiBold** 16, fill `foreground-strong`, dashed underline (see below)          |
| Type       | 200 fix | IBM Plex Sans Regular 16, fill `2 Theme::color/foreground`                                     |
| Built with | 320 fix | Fira Code Regular 12, fill `foreground-muted`, values joined `", "`                            |
| Link       | 96 fix  | IBM Plex Sans Regular 16, fill `2 Theme::color/foreground`, label `Visit` — or `—` when absent |

The Project cell's dashed underline: `textDecoration = "UNDERLINE"` with `textDecorationStyle = "DASHED"` if the API accepts it; if it does not, put a 1px dashed rectangle (`dashPattern = [4,4]`, fill bound to `color/border`) under the text inside a VERTICAL frame gap 2, and say so in the report. The whole row is the click target in code (`after:absolute after:inset-0`) — nothing to model in Figma beyond the row hover.

**Row hover** is a `surface` fill at half strength in code (`hover:bg-surface/50`). Figma has no half-strength token, so bind the hover row fill to `2 Theme::color/surface` and record the divergence in the report. Do **not** invent a `surface-50` variable.

---

## Real rows

Use these eight, newest first — real entries, real stacks, real link availability:

```
2025  Portfolio            Web                Astro, Hugo, Lektor, Tailwind, Tachyons        Visit
2024  Kung Fu School       Web                Astro, TypeScript, Tailwind CSS                 Visit
2024  Medito Fundraising   Challenge, Web     Astro, TypeScript, React, Supabase, Stripe      Visit
2023  Neptune Beer Club    Challenge, Web     Vite, React, TypeScript, Tailwind CSS           Visit
2023  HRnet                Education, Web     TypeScript, React, Zod, Tailwind CSS            Visit
2023  ArgentBank           Web, Education     —                                               Visit
2022  Fisheye              Education, Web     —                                               Visit
2022  La Forme             Art, Software      —                                               —
```

Rows with `—` in **Built with** are there deliberately: the table must show what a sparse row looks like, and the last row must show a missing link. A table where every row is full is a lie about the archive.

---

## Steps

### Step 1 — build the three breakpoint cells

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const COLS = [
  { key: "year",  head: "YEAR",       w: 64,  size: 12, family: "Fira Code",     fill: "foreground-muted", from: "Desktop" },
  { key: "proj",  head: "PROJECT",    w: null, size: 16, family: "IBM Plex Sans", weight: "SemiBold", fill: "foreground-strong", from: "Desktop" },
  { key: "type",  head: "TYPE",       w: 200, size: 16, family: "IBM Plex Sans", fill: "foreground", from: "Tablet" },
  { key: "stack", head: "BUILT WITH", w: 320, size: 12, family: "Fira Code",     fill: "foreground-muted", from: "Desktop" },
  { key: "link",  head: "LINK",       w: 96,  size: 16, family: "IBM Plex Sans", fill: "foreground", from: "Desktop" },
];
const SHOW = { Desktop: ["year","proj","type","stack","link"], Tablet: ["year","proj","type","link"], Mobile: ["year","proj","link"] };
const WIDTH = { Desktop: 1248, Tablet: 704, Mobile: 358 };
const ROWS = [
  ["2025","Portfolio","Web","Astro, Hugo, Lektor, Tailwind, Tachyons","Visit"],
  ["2024","Kung Fu School","Web","Astro, TypeScript, Tailwind CSS","Visit"],
  ["2024","Medito Fundraising","Challenge, Web","Astro, TypeScript, React, Supabase, Stripe","Visit"],
  ["2023","Neptune Beer Club","Challenge, Web","Vite, React, TypeScript, Tailwind CSS","Visit"],
  ["2023","HRnet","Education, Web","TypeScript, React, Zod, Tailwind CSS","Visit"],
  ["2023","ArgentBank","Web, Education","—","Visit"],
  ["2022","Fisheye","Education, Web","—","Visit"],
  ["2022","La Forme","Art, Software","—","—"],
];

const hair = () => {
  const r = figma.createRectangle();
  r.name = "hairline"; r.resize(100, 1);
  r.setBoundVariable("fills", V["2 Theme::color/border"]);
  return r;
};

const build = async (bp) => {
  const keys = SHOW[bp];
  const c = figma.createComponent();
  c.name = `breakpoint=${bp}`;
  c.layoutMode = "VERTICAL"; c.itemSpacing = 0;
  c.resize(WIDTH[bp], 100);
  c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";

  const mkRow = async (cells, isHead) => {
    const wrap = F(isHead ? "head" : "row", "VERTICAL", { itemSpacing: 0 });
    c.appendChild(wrap); wrap.layoutSizingHorizontal = "FILL";
    const r = F("cells", "HORIZONTAL", { itemSpacing: 0 });
    wrap.appendChild(r); r.layoutSizingHorizontal = "FILL";
    r.counterAxisAlignItems = "CENTER";
    r.paddingTop = isHead ? 0 : 8; r.paddingBottom = 8;
    for (const key of keys) {
      const col = COLS.find((x) => x.key === key);
      const t = await T(isHead ? col.head : cells[COLS.indexOf(col)], {
        size: isHead ? 12 : col.size,
        family: isHead ? "Fira Code" : col.family,
        weight: isHead ? "Regular" : (col.weight || "Regular"),
        fill: V[`2 Theme::color/${isHead ? "foreground-muted" : col.fill}`],
      });
      t.name = key;
      const cell = F(key, "HORIZONTAL", { itemSpacing: 0 });
      cell.paddingRight = 16;
      r.appendChild(cell);
      cell.appendChild(t);
      if (col.w) { cell.resize(col.w, cell.height); cell.layoutSizingHorizontal = "FIXED"; }
      else cell.layoutSizingHorizontal = "FILL";
    }
    const h = hair(); wrap.appendChild(h); h.layoutSizingHorizontal = "FILL";
    return r;
  };

  await mkRow(null, true);
  for (const row of ROWS) await mkRow(row, false);
  page.appendChild(c);
  return { name: c.name, id: c.id, w: Math.round(c.width), h: Math.round(c.height), cols: keys };
};
return [await build("Desktop"), await build("Tablet"), await build("Mobile")];
```

### Step 2 — dashed underline on the Project cells

Fresh run. For every text layer named `proj` inside the three cells (skip the header), set `textDecoration = "UNDERLINE"` and `textDecorationStyle = "DASHED"`. Wrap it in `try/catch`: if `textDecorationStyle` throws on this API version, fall back to the 1px dashed rectangle described in §Anatomy and report which path you took.

### Step 3 — combine and home

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const cells = page.children.filter((c) => c.type === "COMPONENT" && /^breakpoint=(Desktop|Tablet|Mobile)$/.test(c.name));
if (cells.length !== 3) throw new Error(`expected 3 cells, found ${cells.length}`);
const set = figma.combineAsVariants(cells, page);
set.name = "work/ArchiveTable";
set.description = "More-projects table on /work. Columns drop by breakpoint: Type from Tablet down is kept, Built with is Desktop-only, Mobile is Year/Project/Link. Row hover = color/surface (code uses surface at 50% — no token for that).";
await home(set, "work");
return { name: set.name, id: set.id, axes: set.variantGroupProperties, children: set.children.map((c) => c.name) };
```

### Step 4 — cold read-back

Fresh run. Return per variant: width, height, header cell labels in order, row count, and the Year cell width. Assert 3 variants; column counts 5 / 4 / 3; 8 body rows each (9 rows counting the header); Year cell exactly 64 wide in all three.

### Step 5 — screenshot

Screenshot each variant. The Mobile one is the one to actually look at: three columns at 358 must still leave the Project title on one line for the short names and at most two lines for `Medito Fundraising`. If it wraps to three lines, drop the Link cell to 64 and report the change.

---

## Acceptance

- `work/ArchiveTable` is a COMPONENT_SET of 3 in the `work` section, axis `breakpoint`.
- Column drops match the table above exactly.
- Every text fill bound to a `2 Theme::color/*` variable; every hairline bound to `color/border`.
- The sparse rows (`—` in Built with, `—` in Link on the last row) are present.
- Gate D clean on the `work` section.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T05
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
