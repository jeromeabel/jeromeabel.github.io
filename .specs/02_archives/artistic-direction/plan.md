---
created: 2026-08-05
---

# Artistic Direction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean the Figma design system so it matches the visual-language spec, validate the Home and Blog page frames against the cleaned library, document every decision — including hover — and rebuild the specimen as a docs page assembled from **real design-system instances**. Code changes come later, in a separate plan.

**Architecture:** Four phases in strict order. Phase 1 fixes the Figma library at its **source components** — every drift found is an instance of a handful of main components, so 3 dashed fixes propagate to 30 nodes and 8 radius fixes propagate to 55. Phase 2 validates the two page frames that consume those components. Phase 3 writes the knowledge back (`design.md`, the `design-expert` skill reference, memory) and rebuilds the specimen from instances rather than hand-drawn frames. Phase 4 is the deferred code work, kept here as an appendix so nothing is lost.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file `ihWIWmvtQPTWgUxlrVjC2c`), Markdown specs in `.specs/01_active/artistic-direction/`, the `design-expert` skill at `.claude/skills/design-expert/`.

## Global Constraints

- **`use_figma` scripts are atomic.** A thrown error applies nothing. On error: stop, read it, fix the script, retry. Never retry unchanged.
- Always pass `skillNames: "figma-use"`. Always `return` every created/mutated node ID. Never call `figma.notify()`.
- **`figma.currentPage` resets to the first page every call.** Call `await figma.setCurrentPageAsync(page)` once at the top of each script, never in a loop.
- **Fix main components, never instances.** Every instance in the inventory inherits from a source component listed below. Overriding an instance creates drift, not a fix.
- **Do not touch Figma's own frame chrome.** COMPONENT_SET frames carry a dashed purple boundary and `cornerRadius: 5`; SECTION frames carry `cornerRadius: 2`. Those are Figma UI conventions, not design decisions. The earlier "45 dashed / radii 2,4,5,16" audit counted them — 27 of 54 hits were noise. Scripts here skip `COMPONENT_SET` and `SECTION` node types.
- Radius trio only: `9999` (pressable: buttons, chips, icon circles, pills), `8` (media surfaces: covers, card images), `0` (reading surfaces: rows, tables, prose). **Never two radii on one element** — no `[16,16,0,0]` corners.
- Dashed borders are removed from all chrome. The only permitted dash anywhere is the hero self-draw start state (not built yet, out of scope).
- Every removed `hover: border becomes solid` must be replaced by a documented hover verb — **one verb per surface**, ≤150ms. A hover state that is visually identical to its default state is a bug.
- No gradient in chrome. No drop shadows. Accent (teal) budget: serie chips, section CTAs, active nav, focus rings — nothing else.
- **Code is not touched in Phases 1–3.** If a Figma fix implies a code change, record it in the Phase 4 appendix; do not edit `src/`.

## Ground Truth — measured 2026-08-05

Page `Components (new)` (`461:759`) holds both the library and the two page frames:

| Frame                   | Node        |
| ----------------------- | ----------- |
| `v3/Home — 1920 — Dark` | `2001:1670` |
| `v3/Blog — 1920 — Dark` | `2116:869`  |

Both are **Dark, 1920 only** — there is no light-mode or narrow-width page frame on this page. That is a gap, noted in Task 6, not closed by this plan.

**Dashed — 30 nodes, 3 sources.** Every other dashed node is an instance of one of these:

| Source component                             | Node       | Instances downstream            |
| -------------------------------------------- | ---------- | ------------------------------- |
| `Link/Icon / size=normal, state=default`     | `2093:441` | 8 (Contact ×6, Home ×3 overlap) |
| `Link/Icon / size=small, state=default`      | `2095:452` | —                               |
| `Link/External / size=normal, state=default` | `2096:592` | 18 (Footer ×6 × 3 places)       |

Only the `state=default` variants are dashed; the `state=hover` variants are already solid. That means the current hover verb _is_ "dashed becomes solid" — killing dashed deletes the hover feedback, so Task 1 must supply a replacement in the same edit.

**Radius 4 → chips (should be `9999`).** Sources: `PostMetadataTopic / type=post` (`2371:10413`), `.PostTopic(backup)` ×5 (`2038:701`, `703`, `705`, `707`, `711`), `.PostMetadataTopic(back) / type=post / PostTopic` (`2371:10344`). The other 13 hits are instances.

**Radius 16 → covers (should be `8`).** Sources: `PostCardPreviewBig / State=default / CoverContainer` (`2034:188`), `PostCardPreviewBig / State=hover / CoverContainer` (`2385:7131`), `PostCardPreviewSmall / State=default / CoverContainer` (`2039:413`), `PostCardPreviewSmall / State=hover / CoverContainer` (`2385:7141`), `WorkCardPreviewSmall / CoverContainer` (`2045:358`), `SerieCard / State=default` (`2119:7516`), `SerieCard / State=hover` (`2367:7192`). The other 20 hits are instances.

**Mixed corners `[16,16,0,0]` → uniform `8`.** Sources: `SerieCard / State=default / CoverContainer` (`2119:7502`), `SerieCard / State=hover / CoverContainer` (`2367:7193`). 6 instances downstream.

**Hover states already modelled as variants** — `NavLink`, `NavLinkHome`, `LinkWithIcon` (default/hover/active); `Link/CTA`, `Link/Secondary`, `Link/Icon`, `Link/External`, `PostRow`, `SerieCard`, `PostCardPreviewBig`, `PostCardPreviewSmall` (default/hover). Task 7 audits all of them.

**Dead backups** (`.`-prefixed, hidden from the library): `.PostTopic(backup)` (`2038:702`), `.PostMetadataTopic(back)` (`2038:692`), `.IconBackup` (`24:17`).

---

## Phase 1 — Clean the Figma library

### Task 1: Kill dashed at the three source components, and give them a real hover verb

**Files:**

- Modify: Figma components `2093:441`, `2095:452`, `2096:592` (the `state=default` variants)
- Modify: their `state=hover` siblings, so default and hover are visually distinct once both are solid

**Interfaces:**

- Produces: a dashed-free `Components (new)` page. Task 5 and Task 6 validate the pages that instance these. Task 7 documents the hover verb chosen here.

- [ ] **Step 1: Read the three sources and their hover siblings before changing anything**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const IDS = ["2093:441", "2095:452", "2096:592"];
const out = [];
for (const id of IDS) {
  const n = await figma.getNodeByIdAsync(id);
  const set = n.parent;
  out.push({
    id,
    name: n.name,
    set: set.name,
    dashPattern: n.dashPattern,
    strokes: n.strokes.map((s) => ({
      type: s.type,
      color: s.color,
      opacity: s.opacity,
      boundVars: s.boundVariables,
    })),
    strokeWeight: n.strokeWeight,
    fills: n.fills.map((f) => ({
      type: f.type,
      color: f.color,
      opacity: f.opacity,
      boundVars: f.boundVariables,
    })),
    siblings: set.children.map((c) => ({
      id: c.id,
      name: c.name,
      dash: c.dashPattern,
      fills: c.fills.map((f) => ({
        type: f.type,
        color: f.color,
        boundVars: f.boundVariables,
      })),
      strokes: c.strokes.map((s) => ({
        type: s.type,
        color: s.color,
        boundVars: s.boundVariables,
      })),
    })),
  });
}
return out;
```

Record which variable each stroke and fill is bound to. The replacement must stay token-bound — a raw hex here is new debt.

- [ ] **Step 2: Clear the dash patterns**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const mutated = [];
for (const id of ["2093:441", "2095:452", "2096:592"]) {
  const n = await figma.getNodeByIdAsync(id);
  n.dashPattern = [];
  mutated.push({ id, name: n.name });
}
return { mutatedNodeIds: mutated.map((m) => m.id), mutated };
```

- [ ] **Step 3: Give the hover variants a surface fill so hover still reads**

The hover verb for a bordered pill is **background fills with `--color-surface-hover`**, border unchanged. This matches the code (`hover:bg-surface-hover`) and obeys one-verb-per-surface. Bind the fill to the variable — do not paste a hex. Note `setBoundVariableForPaint` returns a **new** paint that must be captured and reassigned.

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const all = await figma.variables.getLocalVariablesAsync();
const surfaceHover = all.find((v) => v.name.indexOf("surface-hover") !== -1);
if (!surfaceHover)
  return {
    error: "no surface-hover variable",
    names: all.map((v) => v.name).slice(0, 80),
  };

// Hover variants of the three sets, resolved by walking each parent set.
const targets = [];
for (const id of ["2093:441", "2095:452", "2096:592"]) {
  const n = await figma.getNodeByIdAsync(id);
  for (const sib of n.parent.children)
    if (sib.name.indexOf("state=hover") !== -1) targets.push(sib);
}

const mutated = [];
for (const t of targets) {
  let paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 };
  paint = figma.variables.setBoundVariableForPaint(
    paint,
    "color",
    surfaceHover,
  );
  t.fills = [paint];
  t.dashPattern = [];
  mutated.push({ id: t.id, name: t.name, set: t.parent.name });
}
return {
  mutatedNodeIds: mutated.map((m) => m.id),
  mutated,
  variable: surfaceHover.name,
};
```

If the variable name lookup returns nothing, the script returns the full variable list — read it and use the exact name rather than guessing.

- [ ] **Step 4: Verify zero design-level dashed remains**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const SKIP = { COMPONENT_SET: 1, SECTION: 1 };
const dashed = [];
const path = (n) => {
  const a = [];
  let c = n;
  while (c && c.type !== "PAGE") {
    a.unshift(c.name);
    c = c.parent;
  }
  return a.join(" / ");
};
const walk = (n) => {
  if (
    !SKIP[n.type] &&
    "dashPattern" in n &&
    n.dashPattern &&
    n.dashPattern.length
  )
    dashed.push({ id: n.id, path: path(n) });
  if ("children" in n) for (const c of n.children) walk(c);
};
for (const c of page.children) walk(c);
return { dashedCount: dashed.length, dashed };
```

Expected: `dashedCount: 0`. If instances still report dashed, they carry a local override — reset them with `instance.resetOverrides()` rather than clearing the dash on each one.

- [ ] **Step 5: Screenshot the three sets side by side**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);
const btns = page.children.find((c) => c.name === "App/Buttons");
await btns.screenshot({ scale: 0.8, contentsOnly: false });
return {
  id: btns.id,
  sets: btns.children.map((c) => ({ id: c.id, name: c.name })),
};
```

Confirm by eye: default and hover are now **distinguishable** — solid ring both, hover carries a filled surface. If they look identical, Step 3 did not apply and the hover state is dead.

---

### Task 2: Collapse the radii to the trio

**Files:**

- Modify: chip sources `2371:10413`, `2371:10344` → `9999`
- Modify: cover sources `2034:188`, `2385:7131`, `2039:413`, `2385:7141`, `2045:358` → `8`
- Modify: card sources `2119:7516`, `2367:7192` → `8`
- Modify: mixed-corner sources `2119:7502`, `2367:7193` → uniform `8`

`.PostTopic(backup)` radius-4 nodes are deliberately skipped — Task 4 deletes that set outright.

**Interfaces:**

- Consumes: nothing. Independent of Task 1; may run in either order.
- Produces: a radius histogram of exactly `{8, 9999}` on design nodes.

- [ ] **Step 1: Chips go pill**

`design.md §Radius`: `full` applies to "buttons, chips, icon circles, pills". A 4px chip is drift.

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const mutated = [];
for (const id of ["2371:10413", "2371:10344"]) {
  const n = await figma.getNodeByIdAsync(id);
  n.cornerRadius = 9999;
  mutated.push({ id, name: n.name, radius: n.cornerRadius });
}
return { mutatedNodeIds: mutated.map((m) => m.id), mutated };
```

- [ ] **Step 2: Covers and media cards go 8**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const mutated = [];
for (const id of [
  "2034:188",
  "2385:7131",
  "2039:413",
  "2385:7141",
  "2045:358",
  "2119:7516",
  "2367:7192",
]) {
  const n = await figma.getNodeByIdAsync(id);
  n.cornerRadius = 8;
  mutated.push({ id, name: n.name, path: n.parent.name + " / " + n.name });
}
return { mutatedNodeIds: mutated.map((m) => m.id), mutated };
```

- [ ] **Step 3: Kill the mixed corners**

`[16,16,0,0]` is two radii on one element, which `design.md §Radius` forbids. The SerieCard cover is inset inside the card's padding, so it takes a uniform 8.

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const mutated = [];
for (const id of ["2119:7502", "2367:7193"]) {
  const n = await figma.getNodeByIdAsync(id);
  n.topLeftRadius = 8;
  n.topRightRadius = 8;
  n.bottomRightRadius = 8;
  n.bottomLeftRadius = 8;
  mutated.push({
    id,
    name: n.name,
    corners: [
      n.topLeftRadius,
      n.topRightRadius,
      n.bottomRightRadius,
      n.bottomLeftRadius,
    ],
  });
}
return { mutatedNodeIds: mutated.map((m) => m.id), mutated };
```

- [ ] **Step 4: Verify the histogram**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const SKIP = { COMPONENT_SET: 1, SECTION: 1 };
const hist = {},
  offenders = [];
const path = (n) => {
  const a = [];
  let c = n;
  while (c && c.type !== "PAGE") {
    a.unshift(c.name);
    c = c.parent;
  }
  return a.join(" / ");
};
const walk = (n) => {
  if (!SKIP[n.type] && "cornerRadius" in n) {
    const r = n.cornerRadius;
    const key = typeof r === "number" ? r : "mixed";
    if (key !== 0) {
      hist[key] = (hist[key] || 0) + 1;
      if (key !== 8 && key !== 9999)
        offenders.push({ id: n.id, r: key, path: path(n) });
    }
  }
  if ("children" in n) for (const c of n.children) walk(c);
};
for (const c of page.children) walk(c);
return { hist, offenders };
```

Expected: `hist` keys are only `8` and `9999`; `offenders` contains only nodes inside `.PostTopic(backup)` / `.PostMetadataTopic(back)` / `.IconBackup`, which Task 4 removes.

- [ ] **Step 5: Screenshot the Blog section and eyeball it**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);
const blog = page.children.find((c) => c.name === "Blog");
await blog.screenshot({ scale: 0.35, contentsOnly: false });
return { id: blog.id };
```

Confirm: chips are pills, covers are softly rounded (8, noticeably tighter than the old 16), no card has a rounded top and a square bottom.

---

### Task 3: Close the button/link vocabulary and add the missing Text CTA

`design.md §Buttons` allows exactly three button styles. Figma currently has `Link/CTA`, `Link/Secondary`, `Link/External`, `LinkWithIcon`, `Link/Icon`, plus `NavLink` / `NavLinkHome`. There is **no** Text CTA component at all — the section-end "All posts →" links are drawn as Secondary pills.

Target naming, which is also the naming the future code plan uses:

| Figma component                          | Role                             | Action                                                                         |
| ---------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| `NavLink`, `NavLinkHome`                 | nav                              | keep as-is                                                                     |
| `Link/CTA`                               | Primary button                   | keep                                                                           |
| `Link/Secondary`                         | Secondary button                 | keep                                                                           |
| `Link/External` → **`Link/SecondarySm`** | small Secondary                  | rename; it stopped being about externality when Task 1 removed the dashed ring |
| `Link/Icon`                              | icon circles (size normal/small) | keep                                                                           |
| `LinkWithIcon`                           | to be decided in Step 1          | inline link **or** the Text CTA                                                |
| —                                        | **Text CTA**                     | create if `LinkWithIcon` is not it                                             |

- [ ] **Step 1: Decide what `LinkWithIcon` is**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync("2041:313");
await set.screenshot({ scale: 1.5, contentsOnly: false });
return {
  name: set.name,
  variants: set.children.map((v) => ({
    id: v.id,
    name: v.name,
    strokes: v.strokes.length,
    fills: v.fills.length,
    radius: v.cornerRadius,
    w: Math.round(v.width),
    h: Math.round(v.height),
    children: v.children.map((c) => ({ name: c.name, type: c.type })),
  })),
};
```

Decision rule — no border and an arrow icon means it is already the Text CTA: rename it `Link/TextCTA` and skip Step 3. A bordered pill means it is a duplicate of Secondary: keep the name, and build Text CTA fresh in Step 3.

- [ ] **Step 2: Rename `Link/External` → `Link/SecondarySm`**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const set = await figma.getNodeByIdAsync("2350:737");
const before = set.name;
set.name = "Link/SecondarySm";
set.description =
  "Small Secondary button. Was Link/External — the name described where it pointed, not how it looks. External-ness is a property of the href, not of the style. design.md §Buttons.";
return { mutatedNodeIds: [set.id], before, after: set.name };
```

Instances keep working — Figma tracks components by ID, not by name. Instance layer names may still read `Link/External`; that is cosmetic and Task 5/6 sweeps them.

- [ ] **Step 3: Build the Text CTA component (skip if Step 1 said `LinkWithIcon` already is one)**

Accent text plus a `lucide:arrow-right` icon, no border, no fill, `rounded-full` is irrelevant with no border but set to 0 since it is a text run, not a pressable box.

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

await figma.loadFontAsync({ family: "IBM Plex Sans", style: "SemiBold" });
const all = await figma.variables.getLocalVariablesAsync();
const accent = all.find(
  (v) =>
    v.name.indexOf("accent") !== -1 &&
    v.name.indexOf("hover") === -1 &&
    v.name.indexOf("strong") === -1 &&
    v.name.indexOf("subtle") === -1,
);
if (!accent)
  return { error: "no accent variable", names: all.map((v) => v.name) };

const btns = page.children.find((c) => c.name === "App/Buttons");

const make = (label) => {
  const f = figma.createAutoLayout("HORIZONTAL", {
    name: label,
    itemSpacing: 8,
    counterAxisAlignItems: "CENTER",
  });
  const t = figma.createText();
  t.fontName = { family: "IBM Plex Sans", style: "SemiBold" };
  t.characters = "All posts";
  t.fontSize = 18;
  let p = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 };
  p = figma.variables.setBoundVariableForPaint(p, "color", accent);
  t.fills = [p];
  f.appendChild(t);
  t.layoutSizingHorizontal = "HUG";
  return { frame: f, text: t, paint: p };
};

const a = make("state=default");
const b = make("state=hover");
b.text.textDecoration = "UNDERLINE";

btns.appendChild(a.frame);
btns.appendChild(b.frame);
const c1 = figma.createComponentFromNode(a.frame);
const c2 = figma.createComponentFromNode(b.frame);
const set = figma.combineAsVariants([c1, c2], btns);
set.name = "Link/TextCTA";
set.description =
  "Text CTA — the third and only borderless button style. Accent text + arrow, one per section header. Hover verb: underline appears. design.md §Buttons.";

return { createdNodeIds: [c1.id, c2.id, set.id], setId: set.id };
```

The arrow icon is added by hand afterwards: drag an instance of `Icon / icon=arrow-right` into both variants, or use `Icon` set `461:6204`. Do not draw a new arrow — the icon component already exists.

- [ ] **Step 4: Verify the vocabulary**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);
const btns = page.children.find((c) => c.name === "App/Buttons");
return btns.children.map((c) => ({
  id: c.id,
  name: c.name,
  type: c.type,
  variants: "children" in c ? c.children.map((v) => v.name) : [],
}));
```

Expected names present: `Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/TextCTA`, `Link/Icon`, `ThemeToggle`, `MotionToggle`. No component named `Link/External`. Exactly three of them are button styles (`CTA`, `Secondary`+`SecondarySm`, `TextCTA`); `Link/Icon` and the toggles are chrome controls, not button styles.

- [ ] **Step 5: Give every button component a description**

An undocumented component is where the next drift starts. Set `description` on `Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/Icon` stating: the role, the budget (`≤1 Primary per viewport`, `Secondary unlimited`, `TextCTA one per section header`), and the hover verb chosen in Task 1.

---

### Task 4: Delete the dead backup component sets

Three `.`-prefixed sets are frozen copies from before the v3 rebuild. They hold their own radius-4 drift and their own dashed frames, and they show up in every audit as false positives.

**Files:**

- Delete: `.PostTopic(backup)` (`2038:702`), `.PostMetadataTopic(back)` (`2038:692`), `.IconBackup` (`24:17`)

- [ ] **Step 1: Check nothing instances them — across the whole file, not just this page**

Multi-page reads must fan out. Emit **one `use_figma` call per page in a single message**, each switching page once, each running this body with its own page name:

```js
const PAGE_NAME =
  "<one of: 📖 Cover | 🎨 Foundations | Components (new) | 🧩 Components (back) | 📄 Pages | Pages Experiment | 🗄️ Archive (XP) | SPEC / Specimen>";
const page = figma.root.children.find((p) => p.name === PAGE_NAME);
await figma.setCurrentPageAsync(page);

const DEAD = ["2038:702", "2038:692", "24:17"];
const hits = [];
const walk = async (n) => {
  if (n.type === "INSTANCE") {
    const mc = await n.getMainComponentAsync();
    if (mc && mc.parent && DEAD.indexOf(mc.parent.id) !== -1)
      hits.push({ id: n.id, name: n.name, set: mc.parent.name });
  }
  if ("children" in n) for (const c of n.children) await walk(c);
};
for (const c of page.children) await walk(c);
return { page: PAGE_NAME, hitCount: hits.length, hits };
```

- [ ] **Step 2: Delete only if every page returned `hitCount: 0`**

If any page has hits, stop and report which — swapping those instances onto the live components is a decision, not a mechanical step.

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const removed = [];
for (const id of ["2038:702", "2038:692", "24:17"]) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) continue;
  removed.push({ id, name: n.name });
  n.remove();
}
return { removedNodeIds: removed.map((r) => r.id), removed };
```

- [ ] **Step 3: Re-run the Task 2 Step 4 histogram**

Expected now: `offenders` is empty. This is the closing assertion for Phase 1.

---

## Phase 2 — Validate the two page frames

### Task 5: Validate `v3/Home — 1920 — Dark`

The page frame instances the components Phase 1 just changed, so this is where the cleanup either reads as a design or exposes itself.

**Files:**

- Inspect (and fix only where drift is found): `2001:1670`

- [ ] **Step 1: Full-frame screenshot**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);
const home = await figma.getNodeByIdAsync("2001:1670");
await home.screenshot({ scale: 0.28, contentsOnly: false });
return { id: home.id, w: home.width, h: home.height };
```

- [ ] **Step 2: Section-by-section screenshots**

The frame is 2827px tall — one shot at 0.28 will not show line weights. Shoot each child of `PageContent (slot)` (`2109:362`) individually at `scale: 0.6`, plus `Header` (`2001:1923`) and `Footer` (`2099:2573`).

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);
const slot = await figma.getNodeByIdAsync("2109:362");
return slot.children.map((c) => ({
  id: c.id,
  name: c.name,
  h: Math.round(c.height),
}));
```

Then one screenshot call per returned id.

- [ ] **Step 3: Run the checklist against every shot**

Fail any item and fix the **source component**, then re-shoot:

- No dashed border anywhere.
- Every radius is a pill, an 8, or square. No 16, no mixed corners.
- Icon circles read as solid 1px rings and are distinguishable from their hover state.
- Accent appears only on: serie chips, section CTAs, active nav, focus rings. No accent title, no accent date, no accent counter.
- One chip per card or row — never a serie chip and a topic chip together.
- Display font (Bubbler One) appears only on the page H1. Card and row titles are sans.
- Metadata is mono, muted, and legible at 100%.
- No gradient in chrome. No drop shadow.
- At most 3 drawn-illustration moments; none inside a card, row, or chip.

- [ ] **Step 4: Record the findings**

Write the pass/fail list into `.specs/01_active/artistic-direction/validation-home.md` with one line per checklist item and the node ID of anything fixed. This file is the evidence that validation happened; Task 8 folds its conclusions into `design.md`.

---

### Task 6: Validate `v3/Blog — 1920 — Dark`

**Files:**

- Inspect (and fix only where drift is found): `2116:869`, `PageContent (slot)` `2119:7421`

- [ ] **Step 1: Full-frame and per-section screenshots**

Same shape as Task 5, with `2116:869` and slot `2119:7421`.

- [ ] **Step 2: Run the Task 5 checklist, plus the Blog-specific items**

- `SerieCard` keeps a full 1px border — it is an aggregate entity — and its cover is now uniformly rounded at 8, inset in the card's padding.
- `PostRow` uses a `border-b` hairline only. No box, no radius.
- `PostRow / State=hover` differs from `State=default` by exactly **one** verb (background tint) — not tint plus underline plus border change.
- `ArchiveTable` link underlines are solid.
- Topic chips are pills, mono, muted, with zero interactive affordance.

- [ ] **Step 3: Record the findings**

`.specs/01_active/artistic-direction/validation-blog.md`, same format as Task 5.

- [ ] **Step 4: Note the coverage gap explicitly**

Both page frames are Dark at 1920 only. Add to the validation file: _"No light-mode frame and no narrow-width frame exists for Home or Blog. The visual language is therefore validated in one mode at one width. Building the light twin and a 640 frame is the obvious next Figma task and is not in this plan."_ Do not build them here — that is scope the user has not asked for.

---

## Phase 3 — Document

### Task 7: Document hover — the missing chapter

`design.md §Motion` says "one verb per surface, ≤150ms" and lists three examples, but no document states the verb per component, and the removal of `hover:border-solid` in Task 1 changed the answer for three of them. Figma already models hover as variants, so the data exists — it has never been written down.

**Files:**

- Inspect: every component set with a `state=hover` / `State=hover` variant
- Modify: `.specs/01_active/artistic-direction/design.md` — new `### Hover` subsection under `## Property rules`

- [ ] **Step 1: Diff every hover variant against its default**

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

const summarize = (n) => ({
  fills: n.fills.map((f) => ({
    t: f.type,
    c: f.color,
    o: f.opacity,
    v: f.boundVariables,
  })),
  strokes: n.strokes.map((s) => ({
    t: s.type,
    c: s.color,
    v: s.boundVariables,
  })),
  strokeWeight: n.strokeWeight,
  dash: n.dashPattern,
  radius: n.cornerRadius,
  opacity: n.opacity,
  effects: n.effects.map((e) => e.type),
});

const out = [];
const walk = (n) => {
  if (n.type === "COMPONENT_SET") {
    const def = n.children.find(
      (c) => c.name.toLowerCase().indexOf("state=default") !== -1,
    );
    const hov = n.children.find(
      (c) => c.name.toLowerCase().indexOf("state=hover") !== -1,
    );
    if (def && hov)
      out.push({
        set: n.name,
        id: n.id,
        default: summarize(def),
        hover: summarize(hov),
      });
  }
  if ("children" in n) for (const c of n.children) walk(c);
};
for (const c of page.children) walk(c);
return out;
```

- [ ] **Step 2: Name the single verb per surface**

For each set in the output, write down the one property that changes. Flag two failure modes:

- **Dead hover** — default and hover are byte-identical. Task 1 Step 3 should have prevented this for the three pill components; anything else that shows it is a bug to fix now, at the source component.
- **Stacked hover** — more than one property changes (e.g. border colour _and_ background _and_ underline). `design-expert` rule 4 forbids it; pick the strongest single verb and revert the others.

- [ ] **Step 3: Write `### Hover` into `design.md`**

Insert as a new subsection under `## Property rules`, after `### Buttons`. It must contain a table with one row per surface, and the rules that generalise it:

```markdown
### Hover

One verb per surface, ≤150ms (`--duration-fast`), `--ease-out`. A hover state that
looks identical to its default state is a bug; so is a hover that changes two things.

| Surface                   | Verb                                                | Token                          |
| ------------------------- | --------------------------------------------------- | ------------------------------ |
| Row (`PostRow`)           | background tint                                     | `--color-surface-hover`        |
| Borderless preview card   | title underline + slow cover scale, coupled         | `--duration-slow` on the scale |
| `SerieCard`               | border lightens + faint background lift             | `--color-surface-hover`        |
| Primary (`Link/CTA`)      | fill wipes in                                       | `--duration-fast`              |
| Secondary / SecondarySm   | background fills                                    | `--color-surface-hover`        |
| Text CTA                  | underline appears                                   | —                              |
| Icon circle (`Link/Icon`) | background fills                                    | `--color-surface-hover`        |
| Nav link                  | colour goes from muted to foreground                | `--color-foreground`           |
| Prose link                | underline already present at rest; colour unchanged | —                              |

**What hover must never do:** change the border from dashed to solid (dashed no longer
exists), turn a title accent (it collides with the serie chip — `design-expert` rule 4),
dim or tint a cover image, or move an element more than 2%.

**Reduced motion:** keep every colour and opacity change, drop every transform, land on
the final state immediately.
```

Correct any row that Step 1's data contradicts — the table must describe what the file actually does, not what would be nice.

- [ ] **Step 4: Mirror the hover verbs into the Figma component descriptions**

Each component set gets its verb in its `description`, so a designer reading the library sees the rule without opening the spec.

```js
const page = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
await figma.setCurrentPageAsync(page);

// Fill from Step 2's conclusions: set id -> description text.
const DESCRIPTIONS = {
  // "2012:6179": "Primary button. Budget: <=1 per viewport. Hover verb: fill wipes in, 150ms.",
};

const mutated = [];
for (const [id, text] of Object.entries(DESCRIPTIONS)) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) continue;
  n.description = text;
  mutated.push(id);
}
return { mutatedNodeIds: mutated, count: mutated.length };
```

---

### Task 8: Bring the design-system knowledge up to date

Three artefacts describe this system and all three are now behind: the spec, the skill reference the design work actually loads, and memory.

**Files:**

- Modify: `.specs/01_active/artistic-direction/design.md`
- Modify: `.claude/skills/design-expert/references/artistic-direction.md`
- Modify: `.claude/skills/design-expert/SKILL.md` (the reference-table row for artistic direction)
- Modify: `/home/jabel/.claude/projects/-home-jabel-code-projects-jeromeabel-github-io/memory/project_artistic-direction.md`

- [ ] **Step 1: Update `design.md`**

- Replace the "Specimen sheet — built" section with the docs-page location Task 9 produces.
- Add the Phase 1 outcome to `§Border` and `§Radius`: dashed removed at 3 source components (30 nodes), radii collapsed at 11 sources (55 nodes), and the note that Figma's own component-set chrome (dashed boundary, radius 5) and section frames (radius 2) are **not** design and must be excluded from future audits. That single fact invalidates the old "45 dashed / radii 2,4,5,16" figure, and without it the next audit re-raises the same false positives.
- Add `Link/External → Link/SecondarySm` and the new `Link/TextCTA` to `§Buttons`.
- Tick the exit criteria that Phases 1–3 satisfy. Leave the three open questions open — none are resolved here.
- Add a "Code — deferred" line pointing at the Phase 4 appendix.

- [ ] **Step 2: Update the `design-expert` skill reference**

`.claude/skills/design-expert/references/artistic-direction.md` currently carries the round-1 verdicts. Bring it in line: dashed is gone from the library (not just decided), the hover table from Task 7 is the authority, the radius trio is enforced in Figma, and the button vocabulary is four components implementing three styles. Keep it condensed — it is a reference loaded into working context, not a second copy of the spec.

- [ ] **Step 3: Update the SKILL.md pointer row**

The reference table row for `artistic-direction.md` still reads "direction DECIDED 2026-08-05 (dashed = chrome only, 6/3 rhythm, …)". `6/3 rhythm` is dead — `design.md` says the dash utility must not be built. Rewrite the row to describe the current state: three-layer visual language, dashed removed everywhere, radius trio, three button styles, hover table.

- [ ] **Step 4: Update memory**

Rewrite `project_artistic-direction.md` so it records: Figma library cleaned at source components (with the "Figma's own chrome is not design" gotcha, which is the single most reusable fact here), Home and Blog validated dark-only at 1920 with the light/narrow gap open, hover documented, specimen rebuilt from instances, code deferred to Phase 4. Keep it one fact per file — if hover deserves its own memory, write a second file and link it with `[[…]]`.

- [ ] **Step 5: Read it all back cold**

Open the three docs as if you had never seen this work. If a reader cannot answer "what is the hover verb for a Secondary button?" and "what radius does a cover get?" from them alone, the documentation is not done.

---

### Task 9: Rebuild the specimen as a docs page made of real design-system instances

The existing `SPEC / Specimen` page (`2485:2`, frames `2487:2` Light and `2494:2` Dark) was hand-built: ad-hoc frames, hand-drawn exhibits, imported SVGs. It documents the rules but it is not the system — it cannot go stale in a useful way, because nothing it shows is connected to a component. Rebuild it from instances so that fixing a component fixes the docs.

**Files:**

- Create: Figma page `📐 Docs / Design System`
- Delete (after the rebuild is verified): page `SPEC / Specimen` (`2485:2`)

- [x] **Step 1: Create the docs page and its two mode frames**

```js
const existing = figma.root.children.find(
  (p) => p.name === "📐 Docs / Design System",
);
const page = existing || figma.createPage();
page.name = "📐 Docs / Design System";
await figma.setCurrentPageAsync(page);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const theme = collections.find((c) => c.name.indexOf("Theme") !== -1);

const make = (name, modeId, x) => {
  const f = figma.createAutoLayout("VERTICAL", {
    name,
    itemSpacing: 64,
    paddingLeft: 80,
    paddingRight: 80,
    paddingTop: 80,
    paddingBottom: 80,
  });
  f.x = x;
  f.y = 0;
  f.layoutSizingHorizontal = "FIXED";
  f.resize(1600, 100);
  f.primaryAxisSizingMode = "AUTO";
  if (theme && modeId) f.setExplicitVariableModeForCollection(theme, modeId);
  page.appendChild(f);
  return f;
};

const modes = theme
  ? theme.modes.map((m) => ({ id: m.modeId, name: m.name }))
  : [];
const light = make("DOCS / Design System — Light", modes[0] && modes[0].id, 0);
const dark = make("DOCS / Design System — Dark", modes[1] && modes[1].id, 1800);

return {
  pageId: page.id,
  createdNodeIds: [light.id, dark.id],
  lightId: light.id,
  darkId: dark.id,
  modes,
};
```

- [x] **Step 2: Fill each section with instances, never with drawings**

One section per rule, in this order: Border, Radius, Icons, Buttons, Hover, Type, Numbers, Spacing, Colour, Backgrounds, Illustration, Motion. Each section is an auto-layout frame with a mono uppercase caption and a row of **instances** created with `component.createInstance()` — for example the Buttons section holds instances of `Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/TextCTA`, `Link/Icon`.

```js
const page = figma.root.children.find(
  (p) => p.name === "📐 Docs / Design System",
);
await figma.setCurrentPageAsync(page);
const sheet = await figma.getNodeByIdAsync("<lightId from Step 1>");

await figma.loadFontAsync({ family: "Fira Code", style: "Regular" });

const section = (title) => {
  const s = figma.createAutoLayout("VERTICAL", {
    name: "SECTION / " + title,
    itemSpacing: 24,
  });
  sheet.appendChild(s);
  s.layoutSizingHorizontal = "FILL";
  const cap = figma.createText();
  cap.fontName = { family: "Fira Code", style: "Regular" };
  cap.characters = title.toUpperCase();
  cap.fontSize = 12;
  cap.letterSpacing = { unit: "PERCENT", value: 8 };
  s.appendChild(cap);
  return s;
};

const row = (parent, name) => {
  const r = figma.createAutoLayout("HORIZONTAL", {
    name,
    itemSpacing: 24,
    counterAxisAlignItems: "CENTER",
  });
  parent.appendChild(r);
  return r;
};

// Buttons — instances of the real components, resolved by name.
const comps = {};
const lib = figma.root.children.find(
  (p) => p.name.indexOf("Components (new)") !== -1,
);
// NOTE: components live on another page; resolve them by id captured in Task 3 Step 4
// rather than walking a page that is not current.
const BUTTON_IDS = {
  "Link/CTA": "2012:6179",
  "Link/Secondary": "2041:275",
  "Link/SecondarySm": "2350:737",
  "Link/Icon": "2093:6332",
  // "Link/TextCTA": "<id from Task 3 Step 3>",
};

const s = section("Buttons");
const r = row(s, "button specimens");
const made = [];
for (const [name, id] of Object.entries(BUTTON_IDS)) {
  const node = await figma.getNodeByIdAsync(id);
  const comp = node.type === "COMPONENT_SET" ? node.defaultVariant : node;
  const inst = comp.createInstance();
  r.appendChild(inst);
  made.push({ name, instanceId: inst.id });
}
return { createdNodeIds: made.map((m) => m.instanceId), made, sectionId: s.id };
```

Repeat the pattern per section. Two rules for this task:

- **If a specimen cannot be made from an instance, that is a finding, not a licence to draw it.** It means the system has no component for that thing. Note it and move on.
- The Illustration section is the one exception: the drawn SVGs are assets, not components. Reuse the five already imported on `SPEC / Specimen` by moving them onto the new page rather than re-uploading. **Do not bind their paints to a colour token** — those files carry white backdrop shapes and a blanket rebind turns the art into solid blocks. For the dark sheet, clone and invert channel-wise (`r,g,b → 1-r,1-g,1-b`, gradient stops included), which is what `dark:invert` does.

- [x] **Step 3: Add the Hover section — the one Task 7 wrote**

Place default and hover variants of each surface side by side, labelled with the verb. Use `instance.setProperties({ state: "hover" })` (or `State`, matching the property name from the inventory) rather than duplicating and hand-editing.

- [x] **Step 4: Flip the dark sheet by mode, not by hand**

The dark frame already carries an explicit `2 Theme` mode from Step 1. Build it by cloning the finished light sheet and reapplying the mode — every token-bound instance repaints itself. Anything that does **not** repaint is a node with a raw value, which is a finding worth recording.

- [x] **Step 5: Screenshot both sheets**

```js
const page = figma.root.children.find(
  (p) => p.name === "📐 Docs / Design System",
);
await figma.setCurrentPageAsync(page);
for (const f of page.children)
  await f.screenshot({ scale: 0.3, contentsOnly: false });
return page.children.map((c) => ({
  id: c.id,
  name: c.name,
  h: Math.round(c.height),
}));
```

`contentsOnly: false` is required — these frames are transparent, and without the backdrop the dark sheet renders white and hides inverted line art.

- [x] **Step 6: Delete the old specimen page**

Only after both new sheets screenshot correctly and the five illustrations have been moved (not copied) across:

```js
const old = figma.root.children.find((p) => p.name === "SPEC / Specimen");
const id = old ? old.id : null;
if (old) old.remove();
return { removedPageId: id };
```

- [x] **Step 7: Point `design.md` at the new page**

Replace the "Specimen sheet — built" section with the new page name, the two frame node IDs, and one sentence stating that every specimen except the illustrations is a live instance, so the docs cannot drift from the library.

---

## Phase 4 — Code (deferred)

Not started until Phases 1–3 are accepted. Kept here so the analysis is not lost; each line has been verified against the current `src/`.

| #   | Change                                                                                                                                                                                                                           | Sites                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C1  | Add `--duration-fast: 150ms`, `--duration-base: 250ms`, `--duration-slow: 400ms`, `--ease-out: cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out: cubic-bezier(0.77,0,0.175,1)` to `@theme` in `src/styles/global.css`                | none exist today                                                                            |
| C2  | Rewrite `src/components/ui/Link.astro`: drop `border-dashed` ×4, delete `bold` (hardcodes `hover:text-white`), rename `external` → `secondarySm`, add `textCta`, retune `.hover-fx` from `transition: 0.4s` to `--duration-fast` | 1 file + 6 call sites                                                                       |
| C3  | Apply `textCta` to the five section-end index links                                                                                                                                                                              | `SelectedWriting:43`, `BlogPreview:34`, `WorksPreview:25`, `WorksStrip:30`, `AboutStrip:16` |
| C4  | Remove `border-dashed` / `hover:border-solid` from the other five sites                                                                                                                                                          | `Prose.astro:8`, `ValueCard.astro:25`, `ArchiveTable.astro:39,57`, `Hero.astro:14`          |
| C5  | `border-2` → `border`                                                                                                                                                                                                            | `SerieCard.astro:26`, `WorkCardImage.astro:7`                                               |
| C6  | Drop the chrome gradient (`bg-gradient-to-r from-white from-30%` / `lg:bg-gradient-to-b` / `dark:bg-none`)                                                                                                                       | `ValueCard.astro:12`                                                                        |
| C7  | `hero.svg`: `fill:#f5ffe1` ×2 → `#fff`. It inverts to `#0a001e` against a `#1e1e1e` page today; the file's other 24 occluders already use `#fff`                                                                                 | `src/assets/images/hero.svg:876,881`                                                        |
| C8  | `cross-big.svg`: `stroke:#fff` → `currentColor`, drop `stroke-dasharray`. Then `WorkCard.astro:55` **must** gain `text-white` or the cross vanishes on its `bg-black/85` overlay                                                 | 2 assets + 2 components                                                                     |
| C9  | Radius sync: code is already `rounded-lg` (8px), so Phase 1's 16 → 8 decision means **zero** code churn here                                                                                                                     | —                                                                                           |

**Tailwind v4 fact, probe-verified against the installed 4.3.3:** `--ease-*` is a theme namespace, so declaring `--ease-out` regenerates the built-in `.ease-out` utility with our curve. `--duration-*` is **not** a namespace — declaring `--duration-fast` emits the variable but generates no class. Three `@utility` rules close the gap and were confirmed to emit `.duration-fast`, `.hover:duration-base`, `.motion-safe:duration-slow`:

```css
@utility duration-fast {
  transition-duration: var(--duration-fast);
}
```

**Verification approach for Phase 4:** there is no component test framework (`pnpm test` runs `node --test scripts/figma/**/*.test.mjs` only). Verify with exact grep assertions (`grep -rn "border-dashed" src` → empty), `pnpm build`, `pnpm format:check`, and named visual checks in `pnpm dev`.

**Also unaudited, deliberately:** icon sizes (spec says 16/20/24 only), type weights (400/600 only), the spacing ladder, and the bare `duration-500` / `duration-1000` hovers on the work cards — all well past the ≤150ms chrome cap. Each is one grep away; none had measured drift when this plan was written.

---

## Still Open After This Plan

1. **Cover treatment** — photos vs noise-gradient. Owned by cover-studio.
2. **Hero stage height** — ~85vh vs compact. Decide against the real page, not a Figma frame.
3. **`dark:invert` vs `invert-80`** — `HeroImage.astro:8` uses 80%, everything else 100%.
4. **Light-mode and narrow-width page frames** — Home and Blog exist in Dark at 1920 only.
5. **The hero self-draw moment** — the one authored load animation, and the only legitimate surviving use of `stroke-dasharray`.
6. **Infinite loops** — `anim-width` and the LinkedIn bounce in `ContactText.astro` both violate "zero infinite loops".
