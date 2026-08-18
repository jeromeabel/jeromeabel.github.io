---
title: Phase 2 · Tasks 1–3 — entry gate, ui/Link/external, ui/Prose + ui/SocialShare
created: 2026-08-17
phase: 2 of 3
part: a of d
---

# Phase 2 · Tasks 1–3 — entry gate, ui/Link/external, ui/Prose + ui/SocialShare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-2-components.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 1–3.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 1: Phase-2 entry gate — live inventory diff

Phase 1 renamed everything. Building against a stale name silently creates a duplicate master, which is the one failure mode this phase cannot recover from cheaply.

**Files:**

- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Phase-1-after.
- Produces: a confirmed name list every later task resolves against.

- [ ] **Step 1: Load the Figma Plugin API rules** — run `/figma-use`.

- [ ] **Step 2: Re-read the roster and assert the phase-1 end state**

```js
figma.skipInvisibleInstanceChildren = true;
const masters = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const n of p.findAll(
    (x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET",
  )) {
    if (n.parent && n.parent.type === "COMPONENT_SET") continue;
    masters.push({
      name: n.name,
      id: n.id,
      page: p.name,
      section: n.parent && n.parent.type === "SECTION" ? n.parent.name : "(top)",
      type: n.type,
    });
  }
}
const WANT = [
  "app/Header", "app/Footer", "app/NavLink", "app/HeaderDrawer",
  "app/ThemeToggle", "app/MotionToggle",
  "ui/Icon", "ui/H1", "ui/H2", "ui/PageDescription", "ui/SectionTitle",
  "ui/Link/primary", "ui/Link/secondary", "ui/Link/inline",
  "ui/Link/textLink", "ui/Link/iconOnly",
  "blog/PostCard", "blog/PostRow", "blog/SerieCard", "blog/BlogPreview",
  "blog/SerieList", "blog/PostList", "blog/PostMetadataTime",
  "blog/PostMetadataTopic", "blog/SerieMeta",
  "work/WorkPreview", "hero/Hero", "hero/HeroText", "hero/HeroAnimation",
  "contact/ContactPreview", "contact/ContactContent",
];
const TO_BUILD = [
  "ui/Link/external", "ui/Prose", "ui/SocialShare",
  "work/WorkCard", "work/ArchiveTable", "work/WorkHeader", "work/RelatedWriting",
  "blog/TableOfContents", "blog/SerieContents", "blog/PostNav", "blog/RelatedWork",
  "about/AboutText", "about/AboutFacts", "about/AboutFactsStrip",
];
const names = masters.map((m) => m.name);
return {
  count: masters.length,
  missing: WANT.filter((w) => !names.includes(w)),
  alreadyPresent: TO_BUILD.filter((t) => names.includes(t)),
  legacy: names.filter((n) => !/^(app|ui|blog|work|hero|contact|about|_Docs)\//.test(n)),
  masters,
};
```

- [ ] **Step 3: Judge the three lists**

- `missing` non-empty → STOP. Phase 1 is incomplete; finish it first.
- `alreadyPresent` non-empty → that master is **not** a fresh build. Re-read it, decide rename-vs-rebuild, and record the verdict in `progress.md` before its task runs. (`WorkCardPreviewSmall` is expected here only if phase 1 left it un-renamed — it is absorbed by Task 4, not renamed.)
- `legacy` should contain only `WorkCardPreviewSmall`. Anything else is an un-renamed master from phase 1.

- [ ] **Step 4: Log and commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — phase 2 entry gate verified"
```

---

### Task 2: `ui/Link/external` — the sixth Link set

Mirrors code `Link.astro` `variant="external"` (dashed pill with an external icon), used on `WorkHeader.astro:43-48` and `AboutText.astro:30-35`.

**Files:**

- Create: master `ui/Link/external` in section `ui`
- Modify: `progress.md`

**Interfaces:**

- Produces: `ui/Link/external` with `state=default|hover|focus`. Tasks 6 and 9 instance it; phase 3's Work/About page masters instance it.

- [ ] **Step 1: Read the sibling that defines the pill geometry**

```js
let src = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne((x) => x.name === "ui/Link/secondary");
  if (hit) { src = hit; await figma.setCurrentPageAsync(p); break; }
}
if (!src) throw new Error("ui/Link/secondary not found");
const frames = src.type === "COMPONENT_SET" ? src.children : [src];
return frames.map((f) => ({
  variant: f.name,
  w: Math.round(f.width), h: Math.round(f.height),
  pad: [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft],
  itemSpacing: f.itemSpacing,
  radius: f.cornerRadius,
  strokes: f.strokes.map((s) => s.type),
  dash: f.dashPattern,
  bound: Object.keys(f.boundVariables || {}),
  children: f.children.map((c) => `${c.type}:${c.name}`),
}));
```

- [ ] **Step 2: Clone secondary into external and make the stroke dashed**

`external` differs from `secondary` in exactly two ways: a dashed stroke and a trailing `↗` external icon. Cloning keeps every bound token, which is why this is a clone and not a fresh build.

```js
const src = (await (async () => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    const hit = p.findOne((x) => x.name === "ui/Link/secondary");
    if (hit) { await figma.setCurrentPageAsync(p); return hit; }
  }
})());
const set = src.clone();
set.name = "ui/Link/external";
for (const f of set.type === "COMPONENT_SET" ? set.children : [set]) {
  f.dashPattern = [4, 4];
  const icon = f.findOne((n) => n.type === "INSTANCE" && /Icon/.test(n.name));
  if (icon) {
    try { icon.setProperties({ icon: "arrow-up-right" }); } catch (e) { /* report below */ }
  }
}
const sectionId = await (async () => {
  const page = figma.root.children.find((p) => p.name.includes("Components"));
  await page.loadAsync();
  const s = page.children.find((c) => c.type === "SECTION" && c.name === "ui");
  s.appendChild(set);
  return s.id;
})();
return {
  id: set.id,
  sectionId,
  variants: (set.type === "COMPONENT_SET" ? set.children : [set]).map((f) => ({
    name: f.name, dash: f.dashPattern,
    icon: (f.findOne((n) => n.type === "INSTANCE" && /Icon/.test(n.name)) || {}).name || null,
  })),
};
```

If `setProperties({ icon: … })` throws, the `ui/Icon` set spells its property differently — read `componentPropertyDefinitions` on `ui/Icon` and use the exact key. Do not hand-draw an arrow; the icon must stay an instance.

- [ ] **Step 3: Read back cold + screenshot**

Fresh call: assert `dashPattern` is `[4,4]` on every variant, the icon instance exists, and every fill is bound (`boundVariables` non-empty on the stroke and the text). Then `get_screenshot` the set: dashed pill, `↗` trailing, states visibly distinct.

- [ ] **Step 4: Re-grid the `ui` section and commit**

Re-run phase-1 Task 6 Step 2 (grid layout) then Step 3 (Gate D). Both clean.

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — ui/Link/external built (Figma)"
```

---

### Task 3: `ui/Prose` and `ui/SocialShare`

`ui/Prose` mirrors `src/components/ui/Prose.astro` — the markdown body specimen every detail page uses. `ui/SocialShare` mirrors `src/components/ui/SocialShare.astro`.

**Files:**

- Create: masters `ui/Prose`, `ui/SocialShare` in section `ui`
- Modify: `progress.md`

**Interfaces:**

- Produces: `ui/Prose` (no variants) and `ui/SocialShare` (no variants). Phase 3's four detail masters instance both.

- [ ] **Step 1: Build `ui/Prose` as a real specimen**

The specimen shows every element a post body can contain, in this order, with real strings — a prose master with three lorem paragraphs proves nothing about heading rhythm or code blocks.

```js
const V = await VARS();
const fg = V["2 Theme::color/foreground"];
const muted = V["2 Theme::color/foreground-muted"];
const border = V["2 Theme::color/border"];
const surface = V["2 Theme::color/surface"];

const body = F("ui/Prose", "VERTICAL", {
  itemSpacing: 24, paddingTop: 0, paddingBottom: 0,
});
body.resize(720, 100);
body.layoutSizingHorizontal = "FIXED";
body.primaryAxisSizingMode = "AUTO";

const add = async (node) => { body.appendChild(node); node.layoutSizingHorizontal = "FILL"; };

await add(await T("Un titre de section", { size: 30, weight: "SemiBold", fill: fg }));
await add(await T(
  "Le corps de texte utilise IBM Plex Sans en 18px sur desktop. Les liens sont soulignés en pointillé et deviennent pleins au survol.",
  { size: 18, fill: fg }));
await add(await T("Un sous-titre", { size: 24, weight: "SemiBold", fill: fg }));

const ul = F("list", "VERTICAL", { itemSpacing: 8 });
body.appendChild(ul); ul.layoutSizingHorizontal = "FILL";
for (const s of ["Premier élément de liste", "Deuxième élément", "Troisième élément"]) {
  const li = await T("— " + s, { size: 18, fill: fg });
  ul.appendChild(li); li.layoutSizingHorizontal = "FILL";
}

const quote = F("blockquote", "VERTICAL", { paddingLeft: 24, itemSpacing: 0 });
quote.strokeLeftWeight = 2;
quote.setBoundVariable("strokes", border);
body.appendChild(quote); quote.layoutSizingHorizontal = "FILL";
const qt = await T("Une citation tient sur deux lignes au maximum.", { size: 18, fill: muted });
quote.appendChild(qt); qt.layoutSizingHorizontal = "FILL";

const pre = F("pre", "VERTICAL", { paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 });
pre.setBoundVariable("fills", surface);
pre.cornerRadius = 8;
body.appendChild(pre); pre.layoutSizingHorizontal = "FILL";
const code = await T('const total = items.reduce((a, b) => a + b, 0);', {
  size: 14, family: "Fira Code", weight: "Regular", fill: fg });
pre.appendChild(code); code.layoutSizingHorizontal = "FILL";

const img = figma.createRectangle();
img.name = "image (16:9)";
img.resize(720, 405);
img.cornerRadius = 8;
img.setBoundVariable("fills", surface);
body.appendChild(img); img.layoutSizingHorizontal = "FILL";

const master = figma.createComponentFromNode(body);
master.name = "ui/Prose";
const sectionId = await home(master, "ui");
return { id: master.id, sectionId, children: master.children.map((c) => c.name) };
```

Bind `fontSize` on the three text roles to `3 Responsive` if a matching variable exists (`text/page-title` is a page title, not body — do **not** reuse it). If none matches body copy, leave the size raw and add one `named-debt.json` entry per raw size with `reason: "prose body ramp has no responsive variable; code uses Tailwind prose sizes"`.

- [ ] **Step 2: Build `ui/SocialShare`**

Mirrors `SocialShare.astro:49-56`: muted "Share" label + three small icon-only links (Bluesky, LinkedIn, Email).

```js
const V = await VARS();
const muted = V["2 Theme::color/foreground-muted"];
const row = F("ui/SocialShare", "HORIZONTAL", { itemSpacing: 8 });
row.counterAxisAlignItems = "CENTER";
row.primaryAxisSizingMode = "AUTO";
row.counterAxisSizingMode = "AUTO";

const label = await T("Share", { size: 16, fill: muted });
row.appendChild(label);

let icon = null;
for (const p of figma.root.children) {
  await p.loadAsync();
  const hit = p.findOne((x) => x.name === "ui/Link/iconOnly");
  if (hit) { icon = hit; break; }
}
if (!icon) throw new Error("ui/Link/iconOnly not found");
const base = icon.type === "COMPONENT_SET" ? icon.defaultVariant : icon;
const ICONS = ["bluesky", "linkedin", "mail"];
const placed = [];
for (const name of ICONS) {
  const inst = base.createInstance();
  inst.name = `share/${name}`;
  row.appendChild(inst);
  try { inst.setProperties({ size: "small" }); } catch (e) {}
  placed.push({ name, id: inst.id, props: inst.componentProperties });
}
const master = figma.createComponentFromNode(row);
master.name = "ui/SocialShare";
const sectionId = await home(master, "ui");
return { id: master.id, sectionId, placed };
```

Read `placed[].props` in the return to learn the icon-set property spelling, then set each instance's icon in a follow-up call. Three instances, not three drawn glyphs — a drawn icon cannot follow an icon-set fix.

- [ ] **Step 3: Read back cold + screenshot both**

Assert: `ui/Prose` has 7 children in order (h2, p, h3, list, blockquote, pre, image), `ui/SocialShare` has 4 children (label + 3 instances, all INSTANCE type). Screenshot both, in light and in a Dark-pinned frame — a specimen that only works in Light is a phase-3 bug waiting to happen.

- [ ] **Step 4: Record any raw values, re-grid, commit**

```bash
pnpm figma:verify-raw   # after a fresh raw-values dump per scripts/figma/dump-raw-values.md
git add scripts/figma/named-debt.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): ui/Prose + ui/SocialShare masters"
```
