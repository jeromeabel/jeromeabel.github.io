---
title: Phase 1 · Tasks 7–9 — merges, container normalization, verification gate
created: 2026-08-17
phase: 1 of 3
part: d of d
---

# Phase 1 · Tasks 7–9 — merges, container normalization, verification gate

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-1-foundations.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 7–9.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 7: Three merges — NavLink, PostCard, Link vocabulary

**Files:**

- Modify: `NavLink` + `NavLinkHome`, `PostCardPreviewBig` + `PostCardPreviewSmall`, the five `ui/Link/*` sets
- Modify: `.specs/01_active/magnet-ds-final-state/rename-map.md` (verdicts for the deferred rows)
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Gate B (which merge sources actually exist).
- Produces: `app/NavLink` with `type=page|brand` × `state`; `blog/PostCard` with `size=big|small` × `state` × `breakpoint`; five `ui/Link/*` sets under the final vocabulary. Phase 2 builds `ui/Link/external` as the sixth and swaps instances onto these axes.

- [ ] **Step 1: Merge NavLinkHome into NavLink as `type=brand`**

`NavLink` and `NavLinkHome` are both COMPONENT_SETs (each already carrying a `state` axis). Merging two _sets_ means adding a `type` property to each variant, then combining all variants into one set.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const nav = page.findOne((x) => x.name === "NavLink");
const home = page.findOne((x) => x.name === "NavLinkHome");
if (!nav || !home) throw new Error("NavLink/NavLinkHome not found — check Gate B");

const variants = [];
for (const v of nav.children.slice()) {
  v.name = `type=page, ${v.name}`;
  variants.push(v);
}
for (const v of home.children.slice()) {
  v.name = `type=brand, ${v.name}`;
  page.appendChild(v); // lift out of the old set before combining
  variants.push(v);
}
const set = figma.combineAsVariants(variants, page);
set.name = "app/NavLink";
return {
  setId: set.id,
  properties: set.variantGroupProperties,
  variants: set.children.map((c) => c.name),
};
```

If `home` has states `NavLink` does not (or vice versa), Figma reports an incomplete variant matrix. Fill the gap by cloning the nearest variant and renaming it — never by deleting the odd state.

- [ ] **Step 2: Delete the emptied `NavLinkHome` shell and verify instance survival**

Lifting every child out of a COMPONENT_SET leaves an empty set node. Remove it, then confirm no instance broke:

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const shell = page.findOne(
  (x) => x.type === "COMPONENT_SET" && x.name === "NavLinkHome",
);
const removedShell = !!shell;
if (shell && shell.children.length === 0) shell.remove();

// any instance that lost its master shows up as detached / missing
const broken = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const i of p.findAll((x) => x.type === "INSTANCE")) {
    const m = await i.getMainComponentAsync();
    if (!m) broken.push({ page: p.name, name: i.name, id: i.id });
  }
}
return { removedShell, broken };
```

`broken` must be empty. If it is not, the merge orphaned instances — restore from version history and redo with the variants lifted one at a time.

- [ ] **Step 3: Merge PostCardPreviewBig + PostCardPreviewSmall into `blog/PostCard`**

Same shape, plus one wrinkle: `PostCardPreviewSmall` carries `breakpoint=Desktop|Mobile` and `PostCardPreviewBig` does not (the spec says `big` is identical across breakpoints). A combined set needs a complete matrix, so `big` gets both breakpoint values pointing at the same layout.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);

const big = page.findOne((x) => x.name === "PostCardPreviewBig");
const small = page.findOne((x) => x.name === "PostCardPreviewSmall");
if (!big || !small) throw new Error("PostCard sources not found — check Gate B");

const variants = [];
// big: clone each variant once per breakpoint value
for (const v of big.children.slice()) {
  const desktop = v;
  const mobile = v.clone();
  desktop.name = `size=big, breakpoint=Desktop, ${v.name}`;
  mobile.name = `size=big, breakpoint=Mobile, ${v.name.replace(/^size=big, breakpoint=Desktop, /, "")}`;
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
return {
  setId: set.id,
  properties: set.variantGroupProperties,
  variantNames: set.children.map((c) => c.name),
};
```

Read `properties` in the return: it must show exactly three axes — `size` (big|small), `breakpoint` (Desktop|Mobile), `state`. A fourth axis means a variant name carried a stray `property=value` pair; fix the name, re-combine.

- [ ] **Step 4: Remove the two emptied shells, re-check for broken instances**

Re-run Step 2's snippet with `["PostCardPreviewBig", "PostCardPreviewSmall"]` as the shell names. `broken` must be empty.

- [ ] **Step 5: Confirm the Link vocabulary is final**

Task 5 already renamed the five Link sets. This step only verifies the vocabulary reads as the spec's final list and that nothing still uses an old name:

```js
const want = [
  "ui/Link/primary",
  "ui/Link/secondary",
  "ui/Link/inline",
  "ui/Link/textLink",
  "ui/Link/iconOnly",
];
const found = [],
  legacy = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const n of p.findAll(
    (x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET",
  )) {
    if (n.parent && n.parent.type === "COMPONENT_SET") continue;
    if (want.includes(n.name)) found.push({ name: n.name, id: n.id });
    if (/^Link\//.test(n.name)) legacy.push(n.name);
  }
}
return { found, legacy, missing: want.filter((w) => !found.some((f) => f.name === w)) };
```

`missing` and `legacy` must both be empty. `ui/Link/external` is intentionally absent — it is a phase-2 build, not a merge.

- [ ] **Step 6: Re-home the merged sets and re-run hygiene**

The new sets were combined onto the page root, so they are strays. Re-run Task 6 Step 1 (moves masters into domain sections by name prefix) and Step 2 (grid layout), then Task 6 Step 3 (Gate D). All three must come back clean.

- [ ] **Step 7: Update `rename-map.md` and commit**

Fill the deferred rows: `NavLink`/`NavLinkHome` → `app/NavLink` (`type` axis), `PostCardPreviewBig`/`PostCardPreviewSmall` → `blog/PostCard` (`size` axis). Note in `progress.md` the exact variant matrix each merged set ended with.

```bash
git add .specs/01_active/magnet-ds-final-state/rename-map.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — NavLink + PostCard merges, Link vocabulary final"
```

---

### Task 8: Container normalization — one recipe, zero exceptions

**Files:**

- Modify: `app/Header`, `contact/ContactPreview` (all variants)
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Consumes: `inventory.md` §Gate C (current padding per variant).
- Produces: every container-owning master bound to `3 Responsive/container/gutter` and `container/max-width`. Phase 3's page masters assume no master overrides container geometry locally.

- [ ] **Step 1: Bind the two suspects to the container variables**

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const vars = {};
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  vars[v.name] = v;
}
const gutter = vars["container/gutter"];
const maxw = vars["container/max-width"];
if (!gutter || !maxw) throw new Error("container variables missing from 3 Responsive");

const TARGETS = ["app/Header", "contact/ContactPreview"];
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const name of TARGETS) {
    const node = p.findOne(
      (x) =>
        (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
        x.name === name,
    );
    if (!node) continue;
    const frames = node.type === "COMPONENT_SET" ? node.children : [node];
    for (const f of frames) {
      f.setBoundVariable("paddingLeft", gutter);
      f.setBoundVariable("paddingRight", gutter);
      out.push({
        master: name,
        variant: f.name,
        paddingLeft: f.paddingLeft,
        paddingRight: f.paddingRight,
      });
    }
  }
}
return out;
```

`container/gutter` resolves to 16 in all three modes, so this both fixes the value and removes the raw number in one move. Padding is bound on the master frame; the inner max-width band is handled next.

- [ ] **Step 2: Check each owner has a max-width band, not a fixed width**

The recipe is pad-x 16 **outside**, max-w 1280 **inside**, centered. Read all six container owners and report their inner structure:

```js
const OWNERS = [
  "app/Header",
  "app/Footer",
  "hero/Hero",
  "blog/BlogPreview",
  "work/WorkPreview",
  "contact/ContactPreview",
];
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const name of OWNERS) {
    const node = p.findOne(
      (x) =>
        (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
        x.name === name,
    );
    if (!node) continue;
    const frames = node.type === "COMPONENT_SET" ? node.children : [node];
    for (const f of frames) {
      const inner = f.children[0];
      out.push({
        master: name,
        variant: f.name,
        outerPad: [f.paddingLeft, f.paddingRight],
        outerBound: Object.keys(f.boundVariables || {}),
        innerName: inner ? inner.name : null,
        innerMaxW: inner && "maxWidth" in inner ? inner.maxWidth : null,
        innerBound: inner ? Object.keys(inner.boundVariables || {}) : [],
        innerAlign: f.primaryAxisAlignItems + "/" + f.counterAxisAlignItems,
      });
    }
  }
}
return out;
```

For any owner whose inner band has `maxWidth: null`, set it and bind it:

```js
inner.maxWidth = 1280;
inner.setBoundVariable("maxWidth", maxw);
inner.layoutSizingHorizontal = "FILL";
```

and set the outer frame's counter-axis alignment to `CENTER` so the band centers.

- [ ] **Step 3: Read back cold and prove one recipe**

Fresh call, re-run Step 2's reader. Every row must show `outerPad: [16, 16]`, `outerBound` containing `paddingLeft` and `paddingRight`, `innerMaxW: 1280`, `innerBound` containing `maxWidth`. Paste the table into `progress.md`. Any row that still reads 32 is a miss — the spec's rule is zero exceptions.

- [ ] **Step 4: Prune stale named-debt entries**

`scripts/figma/named-debt.json` allowlists raw (unbound) values by node id. Entries covering the padding you just bound are now stale.

```bash
pnpm figma:verify-raw
```

(needs a fresh `raw-values.figma.json` per `scripts/figma/dump-raw-values.md`). Delete every entry the report lists under "Stale named-debt entries" whose `reason` mentions container/header/contact padding. Leave the rest.

- [ ] **Step 5: Commit**

```bash
git add scripts/figma/named-debt.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): container normalization — Header + ContactPreview 32→16 bound"
```

---

### Task 9: Phase-1 verification gate

Phase 2 builds new masters on top of these names and tokens. If any of this is wrong, every phase-2 build inherits the error. Nothing here is optional.

**Files:**

- Modify: `.claude/skills/figma-verify/knowledge/figma-ds-file.md`
- Modify: `.specs/01_active/magnet-ds-final-state/inventory.md` (append §Phase-1-after)
- Modify: `.specs/01_active/magnet-ds-final-state/progress.md`

**Interfaces:**

- Produces: a verified canon-named roster in the knowledge file. Phase 2 Task 1 diffs its own live inventory against this roster.

- [ ] **Step 1: Fresh export + full pipeline**

In Figma: **File > Export** → save the `.fig`. Then:

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig
pnpm figma:verify
pnpm figma:verify-raw
pnpm figma:verify-responsive
```

Expected: `figma:verify` shows no new missing/mismatched tokens versus the pre-migration run; `figma:verify-responsive` is unchanged (this phase must not touch `3 Responsive` values); `figma:verify-raw` shows no _new_ raw values. All four are warn-only and exit 0 — read the reports, do not trust exit codes.

Record each report's headline counts in `progress.md`. A new mismatch is a phase-1 defect: fix it here, not in phase 2.

- [ ] **Step 2: Re-run the full Pass-0 inventory and write §Phase-1-after**

Same call as Task 1 Step 2. Append to `inventory.md` a §Phase-1-after section with the new master table. Assert:

- every ❖ Components master name matches `^(app|ui|blog|work|hero|contact|about)/`
- master count = 34 minus 2 (the two merges collapsed 4 sources into 2) = **32** on ❖ Components, plus 11 `_Docs/*`, plus 4 page masters = 47 total
- Gate D returns `overlaps: []`, `strays: []`
- `2 Theme` variable count matches the post-audit number in `progress.md`
- no `mauve/mist/olive/taupe` variable remains

Any assertion that fails is a STOP.

- [ ] **Step 3: Canvas-hygiene screenshot sweep**

`get_screenshot` on all 7 domain sections. Every master fully visible, none clipped, none overlapping, consistent gaps, sections in `app · ui · blog · work · hero · contact · about` order. Attach the verdict (per section: PASS / what to fix) to `progress.md`.

- [ ] **Step 4: Rewrite the knowledge file roster**

In `.claude/skills/figma-verify/knowledge/figma-ds-file.md`:

1. **Pages table** — add the fresh `📐 Decisions` page id; add rows for `🗄️ Archive — Decisions` and `🗄️ Archive — Docs v1` marked _immutable, never edit_.
2. **Component masters** — replace the 6 functional groups with the 7 domain sections, canon names, live ids, new total.
3. **Tokens** — new `1 Primitives` and `2 Theme` counts.
4. **Change log** — add an entry dated with the execution date:

```markdown
- YYYY-MM-DD — Magnet-DS final state, phase 1 (foundations)
  (`.specs/01_active/magnet-ds-final-state/plan-1-foundations.md`). Fresh
  📐 Decisions page with 4 records. `1 Primitives` pruned of the
  mauve/mist/olive/taupe exploration ramps, `color/brand/*` kept and
  documented, dash→slash naming normalized. `2 Theme` audited (orphans,
  duplicates, semantic renames). All masters renamed to `domain/Component`
  and re-sectioned into 7 domain sections. NavLink+NavLinkHome merged on a
  `type` axis; PostCardPreviewBig+Small merged on a `size` axis; Link family
  renamed to the final `primary/secondary/inline/textLink/iconOnly`
  vocabulary. Header and ContactPreview padding bound to
  `3 Responsive/container/gutter` — one container recipe, zero exceptions.
  Master roster re-counted live: <n>.
```

- [ ] **Step 5: Format and commit**

```bash
pnpm format:write
git add .claude/skills/figma-verify/knowledge/figma-ds-file.md \
        .specs/01_active/magnet-ds-final-state/inventory.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(figma): magnet-ds phase 1 verified — canon roster, audited tokens"
```

- [ ] **Step 6: Hand off to phase 2**

Phase 1 is done when: 4 decision records exist, both audited collections are clean, every master carries a domain prefix, the three merges landed, both container suspects read 16 bound, Gate D is empty, and the four verify scripts report no new drift. Start `plan-2-components.md` at its Task 1.
