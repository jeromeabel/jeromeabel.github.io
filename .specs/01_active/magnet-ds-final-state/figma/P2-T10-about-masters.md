---
task: P2-T10
title: Build about/AboutFacts and about/AboutText
phase: 2
status: TODO
prerequisite: P2-T02, P2-T03
---

# P2-T10 — `about/AboutFacts` + `about/AboutText`

The `about` domain section is empty after phase 1. These two masters fill it, and `about/AboutText` is the only child of the About page master in phase 3.

Needs `ui/Link/external` (P2-T02) and `ui/Prose` (P2-T03).

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## A · `about/AboutFacts` — 832 wide, axis `facts` = `grid` · `strip`

Two genuinely different renderings of the same four numbers. The live site picks one via `VARIANTS.aboutFacts` in `src/config/variants.ts`; both ship, so both are documented.

The four facts, in order:

| value   | label                 |
| ------- | --------------------- |
| `2010`  | `coding since`        |
| `24`    | `articles published`  |
| `5000+` | `Malinette downloads` |
| `1000+` | `people trained`      |

(`24` is a live count — if the Figma agent has no way to know it, keep 24 and note it as a snapshot.)

### `facts=grid`

HORIZONTAL, gap 24, FILL width, four equal columns (each `layoutSizingHorizontal = "FILL"`). Each item is a VERTICAL frame, gap 4, with the **value above the label** (code uses `flex-col-reverse` on a `dt`/`dd` pair — the value wins the eye):

- value — **Bubbler One** Regular 30, letter-spacing `0.02em`, fill `2 Theme::color/foreground-strong`
- label — IBM Plex Sans Regular 14, fill `2 Theme::color/foreground-muted`

Live is `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` — build the 4-up desktop shape, record the reflow in the description.

### `facts=strip`

HORIZONTAL, gap-x 24, gap-y 8, `layoutWrap = "WRAP"`, FILL width, padding-top/bottom 12, with a 1px hairline **above and below** bound `2 Theme::color/border`, carried by the component root's own `strokeTopWeight` / `strokeBottomWeight` via `HAIR(c, …, ["top", "bottom"])` — no rectangle children.

Each item is a HORIZONTAL frame, gap 8, all text **Fira Code Regular 14** fill `foreground-muted`, value **Bold** and first:

```
2010 coding since   ·   24 articles   ·   5000+ downloads   ·   1000+ people trained
```

Note the shortened labels — the strip uses `articles` and `downloads`, not the grid's longer phrasings. That is deliberate; keep it.

---

## B · `about/AboutText` — 832 wide

VERTICAL, gap 32 (`gap-6 sm:gap-8`). It is a document, so most children are `ui/Prose` instances rather than hand-built text.

1. **H1** — `ui/H1` instance, text `About`.
2. **Lead** — **Bubbler One** Regular 30, letter-spacing `0.02em`, fill `2 Theme::color/foreground-strong`, FILL width:
   `Artist turned web developer — I build things meant to be used, not just seen.`
3. **Prose block 1** — a `ui/Prose` instance holding one paragraph:
   `I build web applications with Vue and TypeScript. After an intensive career change into web development, I deepened my Vue and Kotlin skills at Raccourci Agency, and now work at uhlive, on the front end of an AI-driven call-intelligence product.`
   `I build web applications` is bold (SemiBold run) and `uhlive` is an inline link (dashed underline, `2 Theme::color/foreground`).
4. **Facts** — an `about/AboutFacts` instance at `facts=grid`.
5. **CV link** — a `ui/Link/external` instance, label `Download CV`, with a `lucide:download` **leading** icon (the external variant's default trailing arrow is replaced here — code passes an explicit `icon`).
6. **Prose block 2** — a `ui/Prose` instance holding four paragraphs, each opening with a bold run:
   - `Before the web`, I spent over a decade in software arts — embedded systems, creative frameworks, many programming languages. My projects have been exhibited in Brussels, Dakar, Montreal, Dubrovnik, Neuss, Tunis, Dublin, Paris, and beyond; my artistic work lives at jeromeabel.net. I built and maintained La Malinette, an open-source creative-coding framework used in schools — 5000+ downloads.
   - `Teaching` has run through all of it: fablab workshops, schools, and artist residencies, where I trained more than 1000 people in electronics, programming, and open-source tools.
   - `Open source since 2010` — creative-coding tools first on Framagit, now on GitHub.
   - Beyond technical expertise, I focus on engineering best practices that promote quality and maintainability. I value clean architecture, testing, and performance to ensure that everything I build is solid and scalable. I look forward to working with talented engineers, learning from them, and building great things together. 🤝
7. **Outbound links** — HORIZONTAL, gap 16: two `ui/Link/secondary` instances, `See the work` and `Read the writing`.

The 🤝 in the last paragraph is a `lucide:handshake` icon 24×24 in code — use a `ui/Icon` instance inline if the prose master allows a child, otherwise leave the emoji and say so in the report.

---

## Steps

### Step 1 — build both `about/AboutFacts` variants

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const FACTS = [
  ["2010", "coding since", "coding since"],
  ["24", "articles published", "articles"],
  ["5000+", "Malinette downloads", "downloads"],
  ["1000+", "people trained", "people trained"],
];

const buildGrid = async () => {
  const c = figma.createComponent();
  c.name = "facts=grid";
  c.layoutMode = "HORIZONTAL"; c.itemSpacing = 24;
  c.resize(832, 100);
  c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "AUTO";
  for (const [value, label] of FACTS) {
    const item = F(label, "VERTICAL", { itemSpacing: 4 });
    c.appendChild(item); item.layoutSizingHorizontal = "FILL";
    const v = await T(value, { size: 30, family: "Bubbler One", fill: V["2 Theme::color/foreground-strong"] });
    v.letterSpacing = { unit: "PERCENT", value: 2 };
    item.appendChild(v);
    item.appendChild(await T(label, { size: 14, fill: V["2 Theme::color/foreground-muted"] }));
  }
  page.appendChild(c);
  return { name: c.name, id: c.id, h: Math.round(c.height) };
};

const buildStrip = async () => {
  const c = figma.createComponent();
  c.name = "facts=strip";
  c.layoutMode = "VERTICAL"; c.itemSpacing = 0;
  c.resize(832, 100);
  c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";
  // Both rules sit at the component's own edges — HAIR, not rectangle children.
  HAIR(c, V["2 Theme::color/border"], ["top", "bottom"]);
  const row = F("items", "HORIZONTAL", { itemSpacing: 24 });
  row.layoutWrap = "WRAP";
  row.counterAxisSpacing = 8;
  row.paddingTop = 12; row.paddingBottom = 12;
  c.appendChild(row); row.layoutSizingHorizontal = "FILL";
  for (const [value, , shortLabel] of FACTS) {
    const item = F(shortLabel, "HORIZONTAL", { itemSpacing: 8 });
    row.appendChild(item);
    item.appendChild(await T(value, { size: 14, family: "Fira Code", weight: "Bold", fill: V["2 Theme::color/foreground-muted"] }));
    item.appendChild(await T(shortLabel, { size: 14, family: "Fira Code", fill: V["2 Theme::color/foreground-muted"] }));
  }
  page.appendChild(c);
  return { name: c.name, id: c.id, h: Math.round(c.height) };
};
return [await buildGrid(), await buildStrip()];
```

Fira Code may not ship a `Bold` style in this file — if `loadFontAsync` throws, fall back to `Medium`, then `Regular`, and report which one you used.

### Step 2 — combine and home AboutFacts

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const cells = page.children.filter((c) => c.type === "COMPONENT" && /^facts=(grid|strip)$/.test(c.name));
if (cells.length !== 2) throw new Error(`expected 2 cells, found ${cells.length}`);
const set = figma.combineAsVariants(cells, page);
set.name = "about/AboutFacts";
set.description = "Four numbers about the work. grid = 4-up desktop (2-up mobile, 3-up sm), value above label, Bubbler One. strip = one wrapping mono line between two hairlines, with shortened labels. Live picks one via VARIANTS.aboutFacts.";
await home(set, "about");
return { name: set.name, id: set.id, axes: set.variantGroupProperties };
```

### Step 3 — build `about/AboutText`

```js
const V = await VARS();
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const c = figma.createComponent();
c.name = "about/AboutText";
c.layoutMode = "VERTICAL"; c.itemSpacing = 32;
c.resize(832, 100);
c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";

const h1 = await inst("ui/H1"); c.appendChild(h1); h1.layoutSizingHorizontal = "FILL";

const lead = await T(
  "Artist turned web developer — I build things meant to be used, not just seen.",
  { size: 30, family: "Bubbler One", fill: V["2 Theme::color/foreground-strong"] });
lead.letterSpacing = { unit: "PERCENT", value: 2 };
c.appendChild(lead); lead.layoutSizingHorizontal = "FILL";

const p1 = await inst("ui/Prose"); c.appendChild(p1); p1.layoutSizingHorizontal = "FILL";
const facts = await inst("about/AboutFacts", /facts=grid/); c.appendChild(facts); facts.layoutSizingHorizontal = "FILL";
const cv = await inst("ui/Link/external"); c.appendChild(cv);
const p2 = await inst("ui/Prose"); c.appendChild(p2); p2.layoutSizingHorizontal = "FILL";

const links = F("links", "HORIZONTAL", { itemSpacing: 16 });
c.appendChild(links);
for (const label of ["See the work", "Read the writing"]) {
  const l = await inst("ui/Link/secondary");
  links.appendChild(l);
  const t = l.findOne((n) => n.type === "TEXT");
  await figma.loadFontAsync(t.fontName);
  t.characters = label;
}

c.description = "The whole /about page body, lg:w-2/3 (832). Prose blocks carry the copy; the facts instance switches with VARIANTS.aboutFacts.";
page.appendChild(c);
await home(c, "about");
return { name: c.name, id: c.id, h: Math.round(c.height),
         stack: c.children.map((k) => `${k.type}:${k.name}`) };
```

### Step 4 — fill the copy

Fresh run. Set:

- the `ui/H1` instance to `About`,
- the CV link's label to `Download CV` and its icon layer to `lucide:download`, **leading** (move it to index 0 inside the link instance if the master allows it — if the master's icon slot is trailing-only, leave it trailing and report the divergence),
- Prose block 1 and Prose block 2 to the paragraphs in §B.3 and §B.6.

Prose masters usually expose a single body TEXT node. Write the paragraphs into it separated by blank lines, then set the bold runs with `setRangeFontName` on the opening phrases (`I build web applications`, `Before the web`, `Teaching`, `Open source since 2010`) using the SemiBold style. If range styling fails, leave the text plain and list the four phrases under `UNBOUND:` so the styling can be redone by hand.

### Step 5 — cold read-back

Fresh run. Assert:

- `about/AboutFacts` is a COMPONENT_SET with 2 variants at 832 wide; `facts=grid` has 4 equal children; `facts=strip` has top and bottom strokes on the root and a wrapping row.
- `about/AboutText` children are, in order: INSTANCE `ui/H1`, TEXT lead, INSTANCE `ui/Prose`, INSTANCE `about/AboutFacts`, INSTANCE `ui/Link/external`, INSTANCE `ui/Prose`, FRAME `links` with 2 INSTANCEs.
- Every fill bound; the two Bubbler One texts really are Bubbler One (read `fontName.family` back — a missing font silently falls back).

### Step 6 — screenshot both against live `/about`, Light and Dark.

---

## Acceptance

- The `about` section is no longer empty: `about/AboutFacts` (set, 2) and `about/AboutText` (component).
- Facts numbers and labels exactly as tabled, with the strip's shortened labels.
- Lead and fact values in Bubbler One, verified by read-back.
- Bold runs applied, or listed for manual follow-up.
- Gate D clean on `about`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T10
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
