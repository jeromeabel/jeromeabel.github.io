---
title: Magnet-DS review remediation — implementation plan
created: 2026-08-11
---

# Magnet-DS Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the ten findings (F1–F10) and three gap decisions (G1–G3) from [review.md](review.md) inside the Magnet-DS Figma file, leaving the file AI-library-ready and free of the one real defect.

**Architecture:** Every change goes through the `use_figma` MCP tool against file key `ihWIWmvtQPTWgUxlrVjC2c`. Nothing in Figma is version-controlled, so each task's *verification* is a screenshot or metadata read, and each task's *commit* covers repo-side artifacts only (this plan's checkboxes, `notes.md`, and — in Tasks 10 and 11 — `CLAUDE.md` and the `.specs/` tree). Tasks follow review.md's suggested execution order: defect → hygiene → token copy → component vocabulary → docs additions → cleanup → gate.

**Tech Stack:** Figma MCP (`use_figma`, `get_screenshot`, `get_metadata`, `get_design_context`, `get_variable_defs`), Node (one throwaway contrast script in the scratchpad), git for repo-side files.

## Global Constraints

- Figma file key: `ihWIWmvtQPTWgUxlrVjC2c`. Current file name `Magnet-DS-v1.0` (renamed in Task 10).
- **MANDATORY:** invoke the `figma:figma-use` skill before the first `use_figma` call in any session. This is a plugin requirement, not a preference.
- ⚠️ MCP `get_metadata` page-list is known to go stale on this file. **Never trust a node ID from review.md or from this plan without re-confirming it in the Task 1 inventory.**
- Version truth: `ds/version` stays **v0.91** (per `magnet-ds-docs-v1` decision D2 — v1.0 is reserved for the "all components and pages designed" milestone). The *file name* is the thing that is wrong; Task 10 renames it to `Magnet-DS`.
- Non-destructive: no page, style, or component is deleted before a screenshot has confirmed what it contains. This is the rule that `figma-undecided-pages` was opened to enforce.
- Interaction-state vocabulary (G2 decision, binding on Tasks 6 and 9): `default | hover | active | focus`. Not adopted: preloading, enabled, disabled, pressed, warning, error, loading.
- Accent budget rule 2 reserves the accent colour for focus outlines — do not spend accent on new decorative elements added by this plan.
- Prose budget carried over from D8: paragraph measure 50–75 chars; canvas text next to a specimen ≤ 1 sentence.
- Docs additions use existing `_Docs/*` masters only (`ChapterHeader`, `GroupHeader`, `Headline`, `Paragraph`, `TokenRow`, `DecisionCard`, `SpecimenCell`, `DoDont`, `Divider`, `Date`, `Status`). Creating an eleventh `_Docs` master requires a note in review.md first.

---

### Task 1: Pass-0 inventory and node-ID map

**Files:**
- Create: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `notes.md` with a `## Node-ID map (Pass 0, 2026-08-11)` table — columns `| Item | Node ID | Page | Confirmed? |`. Every later task reads IDs from this map, never from review.md.

- [x] **Step 1: Invoke the figma-use skill, then inventory the pages**

Invoke `figma:figma-use`. Then `use_figma` on file `ihWIWmvtQPTWgUxlrVjC2c`: list every page with its ID and child count.

Expected from review.md (confirm or correct each): `📖 Cover`, `📚 Docs` (2736:4), `📐 Decisions` (2716:4244), `❖ Components` (461:759), `📄 Pages` (2558:18264), `Page 8` (2678:23308), `Page 9` (2678:32354), `Page 11` (2678:34657), `🗄 Backup — UI kit foundations & controls` (2678:6692), `🗄 Backup — Getting started & theme overview` (2678:10236), `🗄 Backup — Brand guidelines template` (2678:34067).

- [x] **Step 2: Capture the node IDs each task touches**

Drill in and record:

1. On `📄 Pages`: `Home — Mobile — Light` (2604:1742), `Home — Mobile — Dark` (2604:1743), and the other 6 page templates.
2. On `❖ Components`: the `Sections` section (2041:484), `BlogPreviewSection — Mobile` (2826:5489), `WorkPreviewSection — Mobile` (2829:5539), `ContactPreviewSection — Mobile` (2829:5576), and every component set named in F5 (NavLink, NavLinkHome, ThemeToggle, MotionToggle, Link/CTA, Link/Secondary, Link/TextCTA, Link/Icon, Link/SecondarySm, PostCardPreviewBig, PostCardPreviewSmall, PostRow, SerieCard, PostMetadataTime, PostMetadataTopic).
3. On `📚 Docs`: `PANEL / 01 Tokens Intro` (2670:6679), `CHAPTER / 01 Foundations`, `CHAPTER / 02 Components`, and the `_Docs/*` masters (especially `TokenRow`, `DecisionCard`, `SpecimenCell`, `GroupHeader`).
4. Variable collections: `1 Primitives`, `2 Theme`, `3 Responsive`, `Design System` — with collection IDs and, for `2 Theme` and `Design System`, every variable ID and name.
5. Text styles: all 13 `Tailwind/text-*` plus the four F8 outliers (`Body/xs/medium`, `Body/xl/medium`, `Body/4xl/semibold`, `Body/base/medium`).

- [x] **Step 3: Write the map to notes.md**

Create `notes.md` with frontmatter (`title: Magnet-DS review — execution notes`, `created: 2026-08-11`) and the `## Node-ID map (Pass 0, 2026-08-11)` table. Mark `Confirmed?` as `✅` when the live ID matches review.md, `⚠️ was <old-id>` when it differs, `❌ not found` when absent.

- [x] **Step 4: Verify completeness**

Check the map has: 11 pages, 8 page templates, 3 Mobile section components, 15 component sets, 4 Docs nodes, 21 variables (15 Theme + 4 Responsive + 2 metadata), 17 text styles. Expected: no `❌` row left without a follow-up line explaining what replaced it.

- [x] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — Pass-0 node-ID map"
```

---

### Task 2: F1 — rebuild `Home — Mobile — Light`

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 1 IDs for `Home — Mobile — Light`, `Home — Mobile — Dark`, and the three Mobile section components.
- Produces: `Home — Mobile — Light` rendering clean at 390 px wide, height within ±10% of the Dark variant's 3465 px. Task 11's touch-target audit reads this frame.

**Decision taken:** rebuild, not delete — Light/Dark parity on the Pages page is worth one task, and deleting only defers the gap.

- [x] **Step 1: Capture the before state**

`get_screenshot` of `Home — Mobile — Light` (2604:1742). Expected (the defect): rendered canvas ~1288 px wide against a 390 px frame; hero image overlapping the headline; "LET'S TALK", footer text and the hand-drawn SVGs sitting outside the frame bounds. Save the observation to notes.md.

- [x] **Step 2: Diff against the working Dark variant**

`get_design_context` on both `Home — Mobile — Dark` (2604:1743) and `Home — Mobile — Light` (2604:1742). List, per child, which section instance each uses. The Dark variant is known-good and uses:

- `BlogPreviewSection — Mobile` (2826:5489)
- `WorkPreviewSection — Mobile` (2829:5539)
- `ContactPreviewSection — Mobile` (2829:5576)

Record in notes.md which sections the Light variant is still pointing at (expected: the Desktop masters).

- [x] **Step 3: Swap the three section instances**

In `Home — Mobile — Light`, swap each stale section instance to its Mobile counterpart from Step 2, keeping the frame's own auto-layout order. Do not detach; use instance swap so future master edits propagate.

- [x] **Step 4: Fix the sizing cascade**

Apply the two rules learned during the 2026-08-11 Dark rework:

1. A child set to FILL inside an auto-layout parent that is itself sized by its children deadlocks — set such children to HUG.
2. Containers that must span the frame (e.g. `ContactContainer`) take **FILL** horizontal sizing, not FIXED.

Walk the frame top-down and confirm every direct child is either FILL (spans 390) or HUG (content-sized) — never a FIXED width inherited from the 1288 px desktop layout.

- [x] **Step 5: Verify the frame**

`get_screenshot` of `Home — Mobile — Light`. Expected: rendered width 390 px; nothing outside the frame bounds; hero image below (not overlapping) the headline; "LET'S TALK" and the footer inside the frame. Read the frame height via `use_figma` — expected within 3120–3810 (±10% of the Dark variant's 3465). A height far outside that range means a section is still desktop-sized — return to Step 4.

- [x] **Step 6: Log and commit**

Append `## F1 — Home Mobile Light rebuild` to notes.md: instances swapped, sizing fixes applied, final height, before/after description.

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — F1 Home Mobile Light rebuilt"
```

---

### Task 3: F2 — dispose of the six dead pages (closes `figma-undecided-pages`)

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`
- Delete: `.specs/00_backlog/figma-undecided-pages.md`

**Interfaces:**
- Consumes: Task 1 page inventory.
- Produces: a page list containing only `📖 Cover`, `📚 Docs`, `📐 Decisions`, `❖ Components`, `📄 Pages`. Records a per-page verdict in notes.md. Task 11's final sweep asserts this list.

**Overlap note:** `.specs/00_backlog/figma-undecided-pages.md` covers `Page 8`, `Page 9`, `Page 11` **and** `📐 Decisions`. This task resolves all four — the three bare pages by the verdicts below, and `📐 Decisions` by the review's own inventory, which lists it as an active page (verdict: **keep**). The backlog stub is deleted at the end of this task so the two specs cannot drift.

- [ ] **Step 1: Screenshot every page before touching it**

`get_screenshot` of each of the six, one at a time. The backlog stub records real child counts — expect content, not empty pages:

| Page | Id | Expected content |
|---|---|---|
| `Page 8` | 2678:23308 | 12 top-level frames — old typography-scale explorations, "Light tokens", "Foundation" |
| `Page 9` | 2678:32354 | 5 frames — DS-starter template TOC (🟡 TEMPLATES/SECTIONS/COMPONENTS/FOUNDATIONS, 🚀 Welcome) |
| `Page 11` | 2678:34657 | 33 frames — DS-starter instructions (plugins, naming conventions, giant type scales) |
| `🗄 Backup — UI kit foundations & controls` | 2678:6692 | pre-restructure backup |
| `🗄 Backup — Getting started & theme overview` | 2678:10236 | pre-restructure backup |
| `🗄 Backup — Brand guidelines template` | 2678:34067 | pre-restructure backup |

- [ ] **Step 2: Check for component masters and live instances**

For each page, `use_figma`: does it hold any **component master** (not instance), and is any node on it referenced by a live page? A master found here means it was missed by the `magnet-ds-docs-v1` migration — move it to `📚 Docs` (into the `— _Docs components (private) —` group) **before** deleting the page.

- [ ] **Step 3: Record a verdict per page**

Write a `## F2 — page disposition` table in notes.md: `| Page | Verdict | Evidence |`. Default verdicts, to be overridden only by what Step 1's screenshots actually show:

- `Page 9`, `Page 11` — **delete**. Commercial DS-starter template residue, never authored here.
- `Page 8` — **delete** if its typography/token specimens are superseded by `CHAPTER / 01 Foundations`; if it holds a specimen with no equivalent in Docs, **rename** to `🗄 Backup — typography explorations` and keep it out of this task's deletions.
- The three `🗄 Backup — *` pages — **delete**. Their replacement (`📚 Docs`) shipped and passed the D8 gate.
- `📐 Decisions` — **keep**. Active page, not in F2's scope.

- [ ] **Step 4: Delete**

Delete every page with a **delete** verdict. Do not batch blind — delete, then re-inventory pages after each one.

- [ ] **Step 5: Verify the page list**

`use_figma` page inventory. Expected exactly: `📖 Cover`, `📚 Docs`, `📐 Decisions`, `❖ Components`, `📄 Pages` (plus at most one `🗄 Backup — typography explorations` if Step 3 spared `Page 8`). Then `get_screenshot` of `📚 Docs` and `❖ Components`: expected no detached or missing instances.

- [ ] **Step 6: Close the backlog item and commit**

```bash
rm .specs/00_backlog/figma-undecided-pages.md
./.specs/specs.sh index
git add -A .specs/
git commit -m "docs(specs): magnet-ds-review — F2 dead pages disposed, figma-undecided-pages closed"
```

---

### Task 4: F3 — descriptions on all 15 `2 Theme` variables

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 1 variable IDs for `2 Theme`; the docs token table `PANEL / 01 Tokens Intro` (2670:6679).
- Produces: 15/15 Theme variables with a non-empty `description`, and a `## Theme token copy` table in notes.md holding the final one-liner per token. **Task 5 rewrites the docs table from that same notes.md table** — one source, two consumers.

This is the #1 blocker on the figma-ai-training readiness checklist: descriptions are what let an AI choose between tokens whose resolved colours are close or identical. Primitives at 445/451 without descriptions are fine — leave them.

- [ ] **Step 1: Extract the existing copy verbatim**

`get_design_context` on `PANEL / 01 Tokens Intro` (2670:6679). Capture, per row, the token name and its usage sentence exactly as written. Known-good example:

- `color/background` → `Page base canvas; never used for cards or hover states.`

- [ ] **Step 2: Write the copy table in notes.md**

Create `## Theme token copy` — `| Token | Description | Source |`, one row per Theme variable, `Source` = `docs table` or `new`. Rules for each description:

- One sentence, ≤ 90 chars, imperative-free — states *where it is used*, and where it is **not** when a neighbouring token is confusable.
- Every token that F4 flags as falsely "Reserved semantic token" gets real usage copy: `font/sans`, `font/title`, `font/mono`, `color/accent-hover`, `color/foreground-strong`. To find real usage, `use_figma`-search the file for consumers of each, and cross-check `src/styles/global.css` in this repo for the code-side counterpart.
- No description may be the string "Reserved semantic token in the Theme layer" unless a live search proves the token has zero consumers in both Figma and code.

- [ ] **Step 3: Apply the descriptions in Figma**

Set `description` on all 15 variables in `2 Theme` from the notes.md table.

- [ ] **Step 4: Verify**

`get_variable_defs` (or a `use_figma` read) on collection `2 Theme`. Expected: 15 variables, zero empty `description` fields, each string matching notes.md.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — F3 Theme variable descriptions"
```

---

### Task 5: F4 — token table swatches replace the raw JSON

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 4's `## Theme token copy` table; `PANEL / 01 Tokens Intro` (2670:6679); the `_Docs/TokenRow` master.
- Produces: a token table whose Light/Dark cells are swatch-as-spec-cards. Task 7's pairings block reuses the same `_Docs/TokenRow` layout.

- [ ] **Step 1: Capture the before state**

`get_screenshot` of `PANEL / 01 Tokens Intro`. Expected (the defect): Light/Dark columns showing `{"r":0.9607843…}` JSON dumps instead of colour.

- [ ] **Step 2: Rebuild each Light/Dark cell as a swatch-as-spec-card**

Industry-canon §5: the swatch carries its own spec, and its text sits *on* the swatch colour so the card demonstrates its own contrast. Per cell:

1. A rectangle/frame filled by the Theme variable itself (bound, not a pasted hex) — so it re-renders correctly when the page mode flips.
2. On the swatch: the primitive alias it resolves to (e.g. `slate-50`) and the hex, in `color/foreground` or `color/background` — whichever is legible on that swatch.
3. No raw `{"r":…}` anywhere.

Where the swatch is too small for legible text, put alias + hex in an adjacent cell and keep the swatch as pure colour — but never leave a JSON dump.

- [ ] **Step 3: Replace the false "Reserved semantic token" rows**

Paste the descriptions Task 4 wrote for `font/sans`, `font/title`, `font/mono`, `color/accent-hover`, `color/foreground-strong` into their usage cells. The docs table and `variable.description` must now say the same thing.

- [ ] **Step 4: Verify in both modes**

`get_screenshot` of the panel in Light mode, then Dark mode. Expected: every cell shows colour; alias + hex legible on every swatch in both modes; no JSON; the five ex-"Reserved" rows read as real usage. Any swatch where the label is unreadable in one mode is a fail — fix the label token, not the swatch.

- [ ] **Step 5: Log and commit**

Append `## F4 — token table rebuild` to notes.md: cells rebuilt, rows re-copied, any legibility fix.

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — F4 token table swatches"
```

---

### Task 6: F5 + F9 — one property vocabulary across all component sets

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 1 IDs for the 15 component sets.
- Produces: every interaction property named lowercase `state` with values drawn from `default | hover | active | focus`; every kind-discriminator named lowercase `type`; both toggles using `mode`. Task 9's G2 DecisionCard documents this vocabulary and must match it exactly.

Property **renames** are non-destructive in Figma — instances keep their bindings. Renaming a *value* is riskier; check instances after any value rename.

- [ ] **Step 1: Audit current property names**

`get_design_context` on all 15 sets. Record actual property names and values in a `## F5 — property audit` table in notes.md. Expected from review.md:

| Convention | Sets |
|---|---|
| `state` (lowercase) — already correct | NavLink, NavLinkHome, ThemeToggle, MotionToggle, Link/CTA, Link/Secondary, Link/TextCTA, Link/Icon, Link/SecondarySm |
| `State` (capital) — rename | PostCardPreviewBig, PostCardPreviewSmall, PostRow, SerieCard |
| `type` (lowercase) — already correct | PostMetadataTime, PostMetadataTopic |
| `Variant` (capital, values `Post`/`Serie`) — rename to `type` | PostRow |

- [ ] **Step 2: Rename `State` → `state` on the four card sets**

PostCardPreviewBig, PostCardPreviewSmall, PostRow, SerieCard.

- [ ] **Step 3: Rename PostRow's `Variant` → `type`**

Values `Post` / `Serie` become lowercase `post` / `serie` to match the lowercase convention. This is a *value* rename — after it, screenshot one page template that uses PostRow and confirm the instances still resolve.

- [ ] **Step 4: F9 — rename the toggles' property to `mode`**

`ThemeToggle`: `state` → `mode`, values `dark` / `light`. `MotionToggle`: `state` → `mode`, values `on` / `off`. These are value modes, not interaction states — the rename is what keeps `state` reserved for the G2 vocabulary.

- [ ] **Step 5: Check every `state` value against the vocabulary**

For each set that keeps a `state` property, confirm its values are a subset of `default | hover | active | focus`. Any value outside it (e.g. `disabled`, `pressed`) is either renamed into the vocabulary or recorded in notes.md as a deviation with a reason — G2 explicitly rejects the wider Base set.

- [ ] **Step 6: Verify no instance broke**

`get_screenshot` of `❖ Components` and of one page template per changed set (Home, Blog). Expected: no purple/detached instance badges, no component rendering as a fallback, toggles still showing both modes.

- [ ] **Step 7: Log and commit**

Append the final property table (set → property → values) to notes.md — Task 9 copies it into the DecisionCard.

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — F5/F9 property vocabulary normalized"
```

---

### Task 7: F6 — move the two stray Mobile components into `Sections`

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 1 IDs for `Sections` (2041:484), `WorkPreviewSection — Mobile` (2829:5539), `ContactPreviewSection — Mobile` (2829:5576).
- Produces: all three Mobile section components inside the `Sections` section. Task 11's sweep asserts zero top-level orphans on `❖ Components`.

Section membership is what Figma AI training reads for grouping — a component at page top level carries no group signal at all. `BlogPreviewSection — Mobile` is already correctly placed; use it as the position reference.

- [ ] **Step 1: Confirm current placement**

`use_figma` on `❖ Components`: list top-level children. Expected: the two Mobile components sitting outside any section, alongside the six sections (Chrome, Actions, Sections, Typography, Metadata, Cards).

- [ ] **Step 2: Move both into `Sections`**

Move `WorkPreviewSection — Mobile` and `ContactPreviewSection — Mobile` into section `2041:484`, placed next to `BlogPreviewSection — Mobile` and ordered Blog → Work → Contact to match the page reading order.

- [ ] **Step 3: Verify placement and instances**

`use_figma` on `❖ Components`: expected exactly six sections and **zero** top-level component orphans. Then `get_screenshot` of `Home — Mobile — Dark` and `Home — Mobile — Light`: expected unchanged (a move must not alter instance rendering).

- [ ] **Step 4: Log and commit**

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — F6 mobile sections regrouped"
```

---

### Task 8: G1 — token pairing table in `CHAPTER / 01 Foundations`

**Files:**
- Create: `/tmp/claude-*/scratchpad/contrast.mjs` (throwaway, not committed)
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 4's Theme descriptions; the `_Docs/TokenRow` and `_Docs/GroupHeader` masters; resolved Light/Dark values from `get_variable_defs`.
- Produces: one pairings block in `CHAPTER / 01 Foundations`, 8 rows, each with a computed AA verdict per mode. No new tokens — this is docs-only.

**Decision:** ADOPT, docs-only. Cheap (one block), gates future token additions, and two modes double the contrast-regression surface. Later machine-checkable by the `figma:verify` tooling.

- [ ] **Step 1: Pull resolved values for both modes**

`get_variable_defs` on `2 Theme`: capture each variable's resolved RGB in Light **and** Dark. Figma returns channels in 0–1 — keep them that way, no /255.

- [ ] **Step 2: Write the contrast script**

Create `contrast.mjs` in the scratchpad:

```js
// WCAG 2.x relative luminance + contrast ratio. Channels are sRGB 0–1.
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [hi, lo] = [L(a), L(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// PAIRS: fill from Step 1 — { name, bg: {r,g,b}, fg: {r,g,b} } per mode.
const PAIRS = [];
for (const p of PAIRS) {
  const v = ratio(p.bg, p.fg);
  console.log(`${p.name}\t${v.toFixed(2)}\t${v >= 4.5 ? "AA" : v >= 3 ? "AA-large" : "FAIL"}`);
}
```

- [ ] **Step 3: Run it over the eight candidate pairs**

Run: `node contrast.mjs`

Pairs (both modes each — 16 measurements):

| Background | Content |
|---|---|
| `color/background` | `color/foreground` |
| `color/background` | `color/foreground-strong` |
| `color/background` | `color/foreground-muted` |
| `color/background` | `color/accent` |
| `color/surface` | `color/foreground` |
| `color/surface` | `color/foreground-muted` |
| `color/accent-subtle` | `color/accent-strong` |
| `color/foreground` (CTA fill) | `color/background` (CTA text) |

Record every ratio in a `## G1 — contrast measurements` table in notes.md.

- [ ] **Step 4: Handle failures before publishing**

Any pair below 4.5 (or below 3.0 where it is large text only) is **not** published as "AA". Either mark the row with its real verdict and a one-line caveat ("large text only", "decorative — not for body copy"), or — if the pair is claimed as a body-text pairing anywhere in the file — record it in notes.md as a follow-up defect. Do not silently round up. `color/foreground-muted` is documented as sitting at the AA floor; expect it to be the tightest row.

- [ ] **Step 5: Build the block in Figma**

In `CHAPTER / 01 Foundations`, below the existing token content: a `_Docs/GroupHeader` reading `Always-valid pairings`, one `_Docs/Paragraph` (≤ 2 lines) saying these eight pairs are safe without further checking and that new pairings must be measured before use, then 8 `_Docs/TokenRow` instances — background swatch, content swatch, pair name, Light verdict, Dark verdict — using the Task 5 swatch treatment so each row demonstrates its own contrast.

- [ ] **Step 6: Verify**

`get_screenshot` of the block in both modes. Expected: 8 rows; every verdict matches the notes.md measurements; each row visually demonstrates the pairing it describes.

- [ ] **Step 7: Commit**

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — G1 pairings block with measured contrast"
```

---

### Task 9: G2 + G3 — two DecisionCards and the focus specimen

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`

**Interfaces:**
- Consumes: Task 6's final property table; the `_Docs/DecisionCard` and `_Docs/SpecimenCell` masters; `📐 Decisions` page.
- Produces: two DecisionCards in `📚 Docs` and one focus-ring specimen frame. Nothing here adds a `focus` variant to any component set.

- [ ] **Step 1: G2 DecisionCard — state vocabulary**

In `CHAPTER / 02 Components` (Chrome/Actions group area), one `_Docs/DecisionCard`:

- **Decision:** interaction states are `default | hover | active | focus`, lowercase, on a property named `state`.
- **Excluded and why:** preloading, enabled, disabled, pressed, warning, error, loading — a static portfolio has no async states, no form submission, and no disabled affordances. Adopting the full 9-state Base vocabulary would mean 5 variants nobody can reach.
- **Also:** `ThemeToggle` and `MotionToggle` use `mode` (`dark`/`light`, `on`/`off`), not `state` — those are value modes, not interaction states.

- [ ] **Step 2: G2 focus specimen — spec, not variants**

One `_Docs/SpecimenCell` next to the card showing the accent focus ring on a single representative control (Link/CTA is the best carrier): ring colour bound to `color/accent`, plus the offset and width values as text. Add a one-sentence caption: focus is specified once here and inherited by every interactive component — it is **not** a variant on each set.

Focus currently appears nowhere in the file, and accent budget rule 2 already reserves accent for exactly this. If the ring's offset/width has no existing value anywhere in the file or in `src/styles/global.css`, pick `2px` ring / `2px` offset and record it in notes.md as newly specified by this task.

- [ ] **Step 3: G3 DecisionCard — increased-contrast rejected**

One `_Docs/DecisionCard`, adjacent to the G1 pairings block in `CHAPTER / 01 Foundations`:

- **Considered:** an increased-contrast variant (light-hc / dark-hc Theme modes).
- **Rejected because:** it doubles Theme-token maintenance from 2 modes to 4, with zero consumers — the code has no `prefers-contrast: more` support. The existing AA floor (`color/foreground-muted` documented at the AA contrast floor, now measured in the G1 table) covers the real accessibility obligation.
- **Revisit when:** the code implements `prefers-contrast`.

- [ ] **Step 4: Verify**

`get_screenshot` of both cards and the specimen. Expected: each card states decision + rationale + what was excluded; the specimen's ring is visible in both modes; the G2 card's vocabulary matches Task 6's property table exactly (compare the two, token by token — a mismatch here is a documentation bug that ages badly).

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — G2/G3 decision cards and focus specimen"
```

---

### Task 10: F7 + F8 + F10 — metadata scopes, file rename, style cleanup, debt record

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`
- Modify: `CLAUDE.md:103`

**Interfaces:**
- Consumes: Task 1 variable IDs for `Design System`; the text-style inventory.
- Produces: a clean property picker, a file name that matches `ds/version`, one type vocabulary, and a written accepted-debt list. Task 11 asserts all of it.

- [ ] **Step 1: F7 — narrow the metadata collection's scopes**

On `ds/version` and `ds/last-updated` in the `Design System` collection: set `scopes: []` (or the narrowest available scope if the API rejects empty), and `hiddenFromPublishing: true`. Both currently carry `ALL_SCOPES`, which puts them in every property picker in the file.

- [ ] **Step 2: F7 — resolve the version contradiction**

**Decision:** `ds/version` stays `v0.91`; the file name loses its version. Rename the Figma file `Magnet-DS-v1.0` → `Magnet-DS`. The file key `ihWIWmvtQPTWgUxlrVjC2c` is unchanged. Set `ds/last-updated` to `2026-08-11`.

Rationale, for the record: D2 reserved v1.0 for the "all components and pages designed" milestone, which is not met — this keeps one source of truth (the variable) and stops the name needing an edit on every bump.

- [ ] **Step 3: F7 — update the repo reference**

In `CLAUDE.md` line 103, replace `` in `Magnet-DS-v1.0` (file key `ihWIWmvtQPTWgUxlrVjC2c`) `` with `` in `Magnet-DS` (file key `ihWIWmvtQPTWgUxlrVjC2c`) ``. Then `grep -rn "Magnet-DS-v1.0" --include="*.md" . | grep -v node_modules | grep -v 02_archives` — expected: only `.specs/01_active/magnet-ds-review/review.md` (a dated review, left as written).

- [ ] **Step 4: F8 — delete the unbound `Tailwind/text-*` styles**

**Decision:** delete if unbound. For each of the 13 `Tailwind/text-*` styles, check consumers first (`use_figma`: any text node using this style?).

- Zero consumers → delete.
- Any consumer → **do not delete**. Rebind that node to its `Heading/*` or `Body/*` equivalent, re-check, then delete.

Record the count deleted vs rebound in notes.md. These duplicate the role ramp — two ways to say the same thing is sampling noise for AI.

- [ ] **Step 5: F8 — normalize the four naming outliers**

`Body/xs/medium`, `Body/xl/medium`, `Body/4xl/semibold`, `Body/base/medium` carry a third name level the rest of the ramp does not. Bring them onto the dominant pattern in Task 1's text-style inventory (if the ramp is `Body/<size>`, the weight moves out of the name; if a distinct weight is genuinely needed, keep it but apply the same 3-level shape to *every* `Body/*` style). One pattern, applied uniformly — record which direction was chosen and why.

- [ ] **Step 6: F10 — record the accepted debt**

Append `## Accepted debt` to notes.md (this feeds the future "Rules & Debt" Figma-AI skill):

- **No `icon/*` mirror of `text/*`.** Correct at 15-token scale — icons take the same foreground tokens as text. Revisit only when an icon needs a colour no text token provides.
- **No on-color tokens.** With one accent and one surface, `color/background` on a CTA fill is unambiguous. Revisit when a second accent or a coloured surface lands.

Both are deliberate, per figma-variables-method: don't plumb tokens nobody consumes. Recorded so they stop resurfacing as "gaps".

- [ ] **Step 7: Verify**

Open any component's property picker in Figma: expected no `ds/*` variables offered. `use_figma` text-style list: expected zero `Tailwind/text-*` (or a documented exception per Step 4), and one uniform `Body/*` naming shape. Read the file name: expected `Magnet-DS`. Read `ds/version`: expected `v0.91`.

- [ ] **Step 8: Commit**

```bash
git add CLAUDE.md .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs: magnet-ds-review — F7/F8/F10 metadata scoped, file renamed, styles cleaned, debt recorded"
```

---

### Task 11: Validation gate, touch-target audit, archive

**Files:**
- Modify: `.specs/01_active/magnet-ds-review/notes.md`
- Move: `.specs/01_active/magnet-ds-review/` → `.specs/02_archives/magnet-ds-review/`

**Interfaces:**
- Consumes: everything from Tasks 2–10.
- Produces: `## Validation gate` in notes.md — one row per finding, PASS/FAIL + evidence — ending with the literal string `GATE PASSED`. Archive is blocked until every row passes.

- [ ] **Step 1: Run the gate checklist**

One row per item, each with screenshot or metadata evidence:

| # | Check | Expected |
|---|---|---|
| F1 | `Home — Mobile — Light` | renders at 390 px, nothing outside the frame, height 3120–3810 |
| F2 | Page list | only Cover, Docs, Decisions, Components, Pages (+ at most one spared backup) |
| F3 | `2 Theme` descriptions | 15/15 non-empty, matching notes.md |
| F4 | Token table | no `{"r":…}` anywhere; alias + hex legible on every swatch, both modes |
| F5 | Property names | every set: lowercase `state` / `type`; no `State`, no `Variant` |
| F6 | Components page | zero top-level component orphans; 3 Mobile sections inside `Sections` |
| F7 | Metadata | `ds/*` absent from property pickers; file named `Magnet-DS`; `ds/version` = v0.91 |
| F8 | Text styles | no `Tailwind/text-*` (or documented exception); uniform `Body/*` shape |
| F9 | Toggles | ThemeToggle + MotionToggle expose `mode`, not `state` |
| F10 | Debt | `## Accepted debt` present in notes.md with both entries |
| G1 | Pairings block | 8 rows in Foundations, verdicts match the measured table |
| G2 | Vocabulary | DecisionCard + focus specimen present; card matches Task 6's property table |
| G3 | Rejection | DecisionCard present with the revisit condition |

- [ ] **Step 2: Bonus — 44 px touch-target audit**

Now that F1 is fixed, measure the tap targets on both `Home — Mobile — *` frames: nav links, `ThemeToggle`, `MotionToggle`, and any icon link in the footer. Expected ≥ 44×44 px each (padding counts; the visible glyph need not be 44 px).

Record every measurement in notes.md. Anything under 44 px: increase its padding in the **master** component, then re-screenshot both mobile frames to confirm nothing reflowed. If a fix would change the desktop layout, do not force it — log it as a follow-up backlog item instead (`./.specs/specs.sh new figma-mobile-touch-targets`), which is a legitimate outcome for a bonus item.

- [ ] **Step 3: Fix failures**

Any FAIL: fix it, then re-run that row only. Iterate until every row is PASS. A fix needing a new `_Docs` master → stop and add a note to review.md first.

- [ ] **Step 4: Refresh the cover**

Set the cover frame's date chip to `2026-08-11` in its existing format. **Do not touch the version chip** — it reads v0.91 and that is now the single truth (Task 10).

- [ ] **Step 5: Record the gate and commit**

Write `## Validation gate` in notes.md: the 13-row table, the touch-target measurements, fixes applied, and the final verdict `GATE PASSED` (literal string — Step 6 greps for it).

```bash
git add .specs/01_active/magnet-ds-review/notes.md .specs/01_active/magnet-ds-review/plan.md
git commit -m "docs(specs): magnet-ds-review — validation gate passed"
```

- [ ] **Step 6: Verify the gate, then archive**

Run: `grep "GATE PASSED" .specs/01_active/magnet-ds-review/notes.md`
Expected: match found. No match → stop, return to Step 3.

```bash
./.specs/specs.sh archive magnet-ds-review
git add -A .specs/
git commit -m "docs(specs): archive magnet-ds-review — F1–F10 and G1–G3 executed"
```
