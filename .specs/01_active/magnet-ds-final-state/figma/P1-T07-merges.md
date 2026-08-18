---
task: P1-T07
title: Three merges — NavLink, PostCard, Link vocabulary
phase: 1
status: TODO
prerequisite: P1-T06
---

# P1-T07 — NavLink + PostCard merges, Link vocabulary final

Two component-set merges and one verification. After this, the five P1-T05 "stragglers" are down to one (`WorkCardPreviewSmall`, absorbed in P2-T04).

<!-- include: _run-rules.md -->

---

## Step 1 — Merge `NavLinkHome` into `NavLink` as `type=brand`

Both are COMPONENT_SETs already carrying a `state` axis. Merging two _sets_ = add a `type` property to every variant name, then combine.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const nav = page.findOne((x) => x.name === "NavLink");
const home = page.findOne((x) => x.name === "NavLinkHome");
if (!nav || !home) throw new Error("NavLink/NavLinkHome not found");

const variants = [];
for (const v of nav.children.slice()) { v.name = `type=page, ${v.name}`; variants.push(v); }
for (const v of home.children.slice()) {
  v.name = `type=brand, ${v.name}`;
  page.appendChild(v);            // lift out of the old set before combining
  variants.push(v);
}
const set = figma.combineAsVariants(variants, page);
set.name = "app/NavLink";
return { setId: set.id, properties: set.variantGroupProperties, variants: set.children.map((c) => c.name) };
```

If one source has a `state` the other lacks, Figma reports an incomplete matrix. Fill the gap by **cloning** the nearest variant and renaming it. Never by deleting the odd state.

---

## Step 2 — Remove the emptied shell, prove no instance broke

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const SHELLS = ["NavLinkHome"];
const removed = [];
for (const name of SHELLS) {
  const shell = page.findOne((x) => x.type === "COMPONENT_SET" && x.name === name);
  if (shell && shell.children.length === 0) { shell.remove(); removed.push(name); }
}
const broken = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const i of p.findAll((x) => x.type === "INSTANCE")) {
    const m = await i.getMainComponentAsync();
    if (!m) broken.push({ page: p.name, name: i.name, id: i.id });
  }
}
return { removed, broken };
```

`broken` **must** be empty. If it is not, the merge orphaned instances — restore from Figma version history and redo, lifting variants one at a time.

---

## Step 3 — Merge `PostCardPreviewBig` + `PostCardPreviewSmall` into `blog/PostCard`

Wrinkle: `Small` carries `breakpoint=Desktop|Mobile`, `Big` does not (big is identical across breakpoints). A combined set needs a complete matrix, so `big` gets both breakpoint values pointing at the same layout.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const big = page.findOne((x) => x.name === "PostCardPreviewBig");
const small = page.findOne((x) => x.name === "PostCardPreviewSmall");
if (!big || !small) throw new Error("PostCard sources not found");

const variants = [];
for (const v of big.children.slice()) {
  const desktop = v;
  const mobile = v.clone();
  const base = v.name;
  desktop.name = `size=big, breakpoint=Desktop, ${base}`;
  mobile.name = `size=big, breakpoint=Mobile, ${base}`;
  page.appendChild(desktop);
  page.appendChild(mobile);
  variants.push(desktop, mobile);
}
for (const v of small.children.slice()) {
  v.name = `size=small, ${v.name}`;
  page.appendChild(v);
  variants.push(v);
}
const set = figma.combineAsVariants(variants, page);
set.name = "blog/PostCard";
return { setId: set.id, properties: set.variantGroupProperties, variantNames: set.children.map((c) => c.name) };
```

Read `properties` in the return: **exactly three axes** — `size` (big|small), `breakpoint` (Desktop|Mobile), `state`. A fourth axis means a variant name carried a stray `property=value` pair; fix the name and re-combine.

---

## Step 4 — Remove both emptied shells

Re-run Step 2 with `const SHELLS = ["PostCardPreviewBig", "PostCardPreviewSmall"];`. `broken` must be empty.

---

## Step 5 — Confirm the Link vocabulary is final

P1-T05 already renamed the five sets. This only verifies:

```js
const want = ["ui/Link/primary", "ui/Link/secondary", "ui/Link/inline", "ui/Link/textLink", "ui/Link/iconOnly"];
const found = [], legacy = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const n of p.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")) {
    if (n.parent && n.parent.type === "COMPONENT_SET") continue;
    if (want.includes(n.name)) found.push({ name: n.name, id: n.id });
    if (/^Link\//.test(n.name)) legacy.push(n.name);
  }
}
return { found, legacy, missing: want.filter((w) => !found.some((f) => f.name === w)) };
```

`missing` and `legacy` must both be empty. `ui/Link/external` is **intentionally absent** — it is a P2-T02 build, not a merge.

---

## Step 6 — Re-home the merged sets, re-run hygiene

`figma.combineAsVariants(..., page)` puts the new sets on the page root, so they are now strays. Re-run, in order, **P1-T06 Step 1** (move into domain sections), **Step 2** (grid), **Step 3** (Gate D with absolute coordinates). All three must come back clean, with `strays` = `_Docs/*` only.

## Acceptance

- `app/NavLink` exists with axes `type` × `state`; `NavLinkHome` gone.
- `blog/PostCard` exists with axes `size` × `breakpoint` × `state`; both `PostCardPreview*` gone.
- `broken` empty after both merges.
- Link vocabulary: 5 found, 0 missing, 0 legacy.
- Gate D clean after re-homing.

**Put the exact variant matrix of both merged sets in the report** — Claude Code writes it into `progress.md` and `rename-map.md`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T07
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
