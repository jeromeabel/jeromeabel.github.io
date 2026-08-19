---
task: P2-T03
title: Build ui/Prose and ui/SocialShare
phase: 2
status: TODO
prerequisite: P2-T02
---

# P2-T03 — `ui/Prose` + `ui/SocialShare`

Two `ui` masters. `ui/Prose` is a **specimen**, not a layout: it shows every markdown element the site actually renders, so a page master can drop one instance where an article body goes.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

# Part A — `ui/Prose`

## Live anatomy — `src/components/ui/Prose.astro`

```
prose sm:prose-lg lg:prose-xl prose-stone dark:prose-invert
prose-img:shadow-xl prose-a:border-b prose-a:border-dashed prose-a:no-underline
prose-a:hover:border-solid prose-pre:leading-snug prose-headings:scroll-mt-24
```

So the desktop rendering is **`prose-xl`** and mobile is `prose` / `prose-lg`. Build the Desktop specimen at `prose-xl` values:

| Element          | Size                       | Weight            | Line height            | Notes                                                                    |
| ---------------- | -------------------------- | ----------------- | ---------------------- | ------------------------------------------------------------------------ |
| `p` (body)       | **20**                     | Regular           | 1.8 (36)               | paragraph spacing 24                                                     |
| `h2`             | **32**                     | SemiBold          | 1.111 (35.5)           | top margin 48, bottom 24                                                 |
| `h3`             | **26.7** → round to **27** | SemiBold          | 1.2 (32)               | top margin 32, bottom 12                                                 |
| `a` inline       | inherits 20                | Regular           | —                      | **1px dashed bottom border, no underline**; hover → solid                |
| `ul` / `ol` item | 20                         | Regular           | 1.8                    | marker + 24 indent, 12 between items                                     |
| `blockquote`     | 20                         | Regular italic    | 1.8                    | **left stroke 2px** bound to `color/border`, 24 inset                    |
| `pre` code block | **18**                     | Fira Code Regular | 1.375 (`leading-snug`) | fill `color/surface`, radius 8, padding 20                               |
| inline `code`    | 18                         | Fira Code         | —                      | fill `color/surface`, radius 4, padding 2/6                              |
| `img`            | —                          | —                 | —                      | 16:9 placeholder rect, **drop shadow** (`prose-img:shadow-xl`), radius 8 |

> **Divergence to record:** `design.md` specifies h2 30 / p 18 / h3 24 — that is the `prose-lg` scale. Live desktop is `prose-xl`. Build the **live** numbers above and put the delta in the report; Claude Code decides whether the spec or the code moves.

Column width: **720**. Text fill `2 Theme::color/foreground`; muted elements `color/foreground-muted`.

## Step A1 — Build the specimen

```js
const V = await VARS();
const root = F("ui/Prose", "VERTICAL", { itemSpacing: 24 });
root.resize(720, 100);
root.layoutSizingHorizontal = "FIXED";
root.primaryAxisSizingMode = "AUTO";
root.fills = [];

const FG = V["2 Theme::color/foreground"];
const MUTED = V["2 Theme::color/foreground-muted"];
const BORDER = V["2 Theme::color/border"];
const SURFACE = V["2 Theme::color/surface"];

const add = async (node) => { root.appendChild(node); if ("layoutSizingHorizontal" in node) node.layoutSizingHorizontal = "FILL"; return node; };

await add(await T("A heading for the section", { size: 32, weight: "SemiBold", fill: FG }));
await add(await T(
  "Paragraphs carry the body of an article. This specimen exists so a page master can drop one instance where the markdown body goes, instead of re-typing a fake article on every route.",
  { size: 20, fill: FG },
));
await add(await T("A smaller sub-heading", { size: 27, weight: "SemiBold", fill: FG }));

// Bulleted list
const list = F("list", "VERTICAL", { itemSpacing: 12 });
await add(list);
for (const line of ["First item in a list", "Second item, a little longer", "Third item"]) {
  const li = F("item", "HORIZONTAL", { itemSpacing: 12 });
  list.appendChild(li);
  li.layoutSizingHorizontal = "FILL";
  li.appendChild(await T("•", { size: 20, fill: MUTED }));
  const txt = await T(line, { size: 20, fill: FG });
  li.appendChild(txt);
  txt.layoutSizingHorizontal = "FILL";
}

// Blockquote — 2px left rail, the element's own border (code: border-l + pl)
const quote = F("blockquote", "HORIZONTAL", { itemSpacing: 0 });
await add(quote);
HAIR(quote, BORDER, ["left"], 2);
quote.paddingLeft = 24;
const qt = await T("A pulled quote sits behind a two-pixel rail, not a box.", { size: 20, weight: "Italic", fill: MUTED });
quote.appendChild(qt);
qt.layoutSizingHorizontal = "FILL";

// Code block
const pre = F("pre", "VERTICAL", { itemSpacing: 0, paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 20 });
await add(pre);
pre.cornerRadius = 8;
pre.fills = [P(SURFACE)];
const code = await T("const posts = await getAllBlogPosts();\nconst recent = posts.slice(0, 3);", { size: 18, family: "Fira Code", fill: FG });
pre.appendChild(code);
code.layoutSizingHorizontal = "FILL";
code.lineHeight = { unit: "PERCENT", value: 137.5 };

// Image placeholder, 16:9
const img = figma.createRectangle();
img.name = "ProseImage";
img.resize(720, 405);
img.cornerRadius = 8;
img.fills = [P(SURFACE)];
img.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.25 }, offset: { x: 0, y: 20 }, radius: 25, spread: -5, visible: true, blendMode: "NORMAL" }];
await add(img);

const c = figma.createComponentFromNode(root);
c.name = "ui/Prose";
await home(c, "ui");
return { id: c.id, name: c.name, w: c.width, h: Math.round(c.height), kids: c.children.map((k) => `${k.type}:${k.name}`) };
```

The inline-link style (dashed bottom border, solid on hover) cannot be expressed on a text run in Figma. Add a **text annotation** beside the master saying so:

> `prose a` — 1px dashed bottom border, `no-underline`, solid on hover. Not representable on a text run; see `Link.astro` variant `default`.

---

# Part B — `ui/SocialShare`

## Live anatomy — `src/components/ui/SocialShare.astro`

```
<div class="text-foreground-muted flex items-center gap-2">
  <span>Share</span>
  … 3 × <Link variant="iconSmall" />
```

Three targets, in this order: **Bluesky** (`fa6-brands:bluesky`), **LinkedIn** (`fa6-brands:linkedin-in`), **Email** (`lucide:mail`).

`iconSmall` = `h-6 w-6 lg:h-8 lg:w-8 grid place-items-center text-sm rounded-full border border-dashed border-foreground-muted hover:border-solid hover:bg-surface` → **32×32 at desktop**, radius 9999, 1px dashed stroke bound to `color/foreground-muted`.

| Property | Value                                                            |
| -------- | ---------------------------------------------------------------- |
| layout   | HORIZONTAL, hug, items centered, gap **8** (`gap-2`)             |
| label    | `Share`, IBM Plex Sans Regular 16, fill `color/foreground-muted` |
| buttons  | 3 × `ui/Link/iconOnly` instances, 32×32                          |

## Step B1 — Build it

```js
const V = await VARS();
const MUTED = V["2 Theme::color/foreground-muted"];
const root = F("ui/SocialShare", "HORIZONTAL", { itemSpacing: 8 });
root.counterAxisAlignItems = "CENTER";
root.primaryAxisSizingMode = "AUTO";
root.counterAxisSizingMode = "AUTO";
root.fills = [];
root.appendChild(await T("Share", { size: 16, fill: MUTED }));

const btn = await findMaster("ui/Link/iconOnly");
for (const glyph of ["bluesky", "linkedin", "mail"]) {
  const i = (btn.type === "COMPONENT_SET" ? btn.defaultVariant : btn).createInstance();
  i.name = glyph;
  root.appendChild(i);
}
const c = figma.createComponentFromNode(root);
c.name = "ui/SocialShare";
await home(c, "ui");
return { id: c.id, name: c.name, kids: c.children.map((k) => `${k.type}:${k.name}`) };
```

Then set each instance's icon glyph to `fa6-brands:bluesky`, `fa6-brands:linkedin-in`, `lucide:mail` respectively.

---

## Step 4 — Re-grid and read back cold

Re-run **P1-T06 Step 2** and **Step 3**. Then, in a fresh run, read both new masters back and screenshot them.

## Acceptance

- `ui/Prose` in the `ui` section, 720 wide, containing h2 / p / h3 / list / blockquote / pre / image, all text and fills bound.
- The prose-scale divergence (live `prose-xl` vs `design.md` `prose-lg` numbers) is in the report.
- The inline-link annotation exists beside the master.
- `ui/SocialShare` in the `ui` section: `Share` label + 3 icon instances, correct order and glyphs.
- Gate D clean. Any raw value you could not bind is listed under `UNBOUND:`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T03
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
