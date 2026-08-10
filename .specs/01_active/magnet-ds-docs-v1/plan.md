---
title: Magnet DS docs restructure — implementation plan
created: 2026-08-10
---

# Magnet DS Docs Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Magnet DS Figma file into one `📚 Docs` page (chapters 00–04), non-destructively, per decisions D1–D8 in [design.md](design.md).

**Architecture:** All Figma edits go through the `use_figma` MCP tool (file key `ihWIWmvtQPTWgUxlrVjC2c`). Build the new page first, demote old pages to backups, validate against the D8 readability checklist, and only then delete backups. Repo-side artifacts (this plan's checkboxes, `notes.md` findings, `CLAUDE.md` reference) are committed per task.

**Tech Stack:** Figma MCP (`use_figma`, `get_screenshot`, `get_design_context`, `get_metadata`), git for repo-side docs.

## Global Constraints

- Figma file key: `ihWIWmvtQPTWgUxlrVjC2c` ("Magnet-DS-v1.0").
- **MANDATORY:** invoke the `figma:figma-use` skill before the first `use_figma` call in any session (plugin requirement).
- ⚠️ MCP `get_metadata` page-list is known to go stale on this file — always take a fresh `use_figma` Pass-0 inventory before trusting node IDs (including the ones in this plan).
- Version stays **v0.91** — no version bump anywhere (D2). v1.0 is reserved for the "all components and pages designed" milestone.
- Non-destructive migration (D3): nothing is deleted until its replacement exists; the old Introduction page is deleted only after the Task 9 validation gate passes.
- New `📚 Docs` page layout (D8): one vertical column, chapters 00→04 top-to-bottom, constant frame width **1408**, constant chapter gap (pick one value ≤ 200 px and reuse it everywhere).
- `_Docs/*` additions capped at two: `_Docs/GroupHeader` and `_Docs/PageTOC` (D7). Anything else requires a design.md note first.
- Prose budget (D8): paragraph measure 50–75 chars; canvas text near a specimen ≤ 1 sentence.
- Figma changes can't be committed to git — each task's verification is a screenshot/metadata check, and the git commit covers repo-side files only (plan checkboxes, `notes.md`).
- Node IDs below come from the 2026-08-10 audit: Cover page `0:1` (frame `9:2`), Introduction page `2545:671`, Decisions page `2716:4244`, Foundations page `5:14` (frames `6:2` colors, `8:2` typography), Components page `461:759`, Pages page `2558:18264`, stray nodes `2708:21292` (Frame 1), `2709:21629` (Section), `2670:6656` (stale label). **Verify each against the Task 1 inventory before use.**

---

### Task 1: Fresh inventory and node-ID map (Pass 0)

**Files:**
- Create: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `notes.md` with a `## Node-ID map (Pass 0, <date>)` section — a table `| Item | Node ID | Page |` covering every item listed in Step 2. All later tasks read IDs from this map, not from the plan header.

- [ ] **Step 1: Invoke the figma-use skill, then open the file**

Invoke `figma:figma-use`. Then run a `use_figma` inventory of file `ihWIWmvtQPTWgUxlrVjC2c`: list all pages with IDs and child counts.

- [ ] **Step 2: Capture node IDs for every object the plan touches**

Drill into pages as needed and record IDs for:

1. All 12 pages (6 active, 6 backup).
2. On 📚 Introduction: the 10 `_Docs/*` component masters (ChapterHeader, SpecimenCell, DecisionCard set, TokenRow, DoDont, Date set, Status set, Headline, Paragraph, Divider), the 5 chapter frames (`CHAPTER / 00 Read me`, `01 Foundations`, `02 Components`, `03 Sections`, `04 Pages`), `Intro/01`, `Intro/02`, and the 3 stray nodes (`Frame 1`, `Section`, `BLOG DESIGN SYSTEM v1.0` label).
3. On 🎨 Foundations: `Foundations · Colors` and `Foundations · Typography` frames.
4. On ❖ Components: the 8 section nodes and their names.
5. On 📖 Cover: the cover frame and its date chip text node.

- [ ] **Step 3: Write the map to notes.md**

Create `notes.md` with frontmatter (`title`, `created: 2026-08-10`) and the `## Node-ID map (Pass 0, <date>)` table. Flag any mismatch with the design.md audit (missing node, renamed frame) in a `### Deviations` subsection.

- [ ] **Step 4: Verify completeness**

Check the map has: 12 pages, 10 `_Docs` masters, 5 chapter frames, `Intro/01` + `Intro/02`, 3 strays, 2 Foundations frames, 8 Components sections, cover frame + date chip. Expected: every row filled; no "not found" without a Deviations note.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — Pass-0 node-ID inventory"
```

---

### Task 2: D4 salvage check — old Typography specimen vs SECTION / Type

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 1 node-ID map (`Foundations · Typography` frame, `CHAPTER / 01 Foundations` frame).
- Produces: `notes.md` section `## D4 salvage verdict` — either "nothing unique, safe to delete" or a list of specimens moved. Task 8 (deletions) depends on this verdict existing.

- [ ] **Step 1: Extract both specimen lists**

Use `get_design_context` (or `use_figma` text extraction) on the old `Foundations · Typography` frame (audit ID `8:2`) and on the `SECTION / Type` area inside `CHAPTER / 01 Foundations`. List every type specimen present in each (the old frame had 18: Hero/Title, H1–H3, Body/xs–4xl, Label/Meta, Chip/Mono, Code/Base).

- [ ] **Step 2: Diff the lists**

Any specimen present in the old frame but absent from `SECTION / Type` is "unique". Also check the old `Foundations · Colors` frame (`6:2`) the same way against the colour section of `CHAPTER / 01 Foundations`.

- [ ] **Step 3: Move unique content (if any)**

If unique specimens exist, copy them into the matching section of `CHAPTER / 01 Foundations` via `use_figma`, restyling to match the chapter's existing specimen cells (`_Docs/SpecimenCell` instances). If nothing unique: no Figma edit.

- [ ] **Step 4: Record the verdict**

Append `## D4 salvage verdict` to `notes.md`: the diff result and what (if anything) moved, with node IDs.

- [ ] **Step 5: Commit**

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — D4 salvage verdict recorded"
```

---

### Task 3: Create `📚 Docs` page; move `_Docs` masters and compliant chapter frames

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 1 node-ID map.
- Produces: a `📚 Docs` page containing (top-to-bottom): the four chapter frames `01 Foundations` → `04 Pages` at width 1408 with the constant gap, and below them a clearly separated `_Docs components` area holding the 10 component masters. Records the new page ID and chosen chapter-gap value in `notes.md` under `## Docs page build log`. Tasks 4–6 build inside this page.

⚠️ **Why masters move first:** the 10 `_Docs/*` masters currently live on 📚 Introduction. That page gets demoted (Task 8) and deleted (Task 10). Moving a master between pages preserves all instance links; deleting its page does not. Masters must be off the Introduction page before any demotion.

- [ ] **Step 1: Create the page**

`use_figma`: create a new page named `📚 Docs`. Position it in the page list directly after 📖 Cover. Record its ID.

- [ ] **Step 2: Move the 10 `_Docs/*` masters**

Move all 10 masters (and full variant sets for DecisionCard, Date, Status) from 📚 Introduction to `📚 Docs`. Place them below where chapter 04 will sit — y-offset well clear of the reading column (e.g. column bottom + 2000 px), grouped under a plain text label `— _Docs components (private) —`.

- [ ] **Step 3: Verify instance links survived**

Take `get_screenshot` of one chapter frame still on Introduction (e.g. `CHAPTER / 01 Foundations`). Expected: instances render identically (no detached/red components).

- [ ] **Step 4: Move the four compliant chapter frames**

Move `CHAPTER / 01 Foundations`, `02 Components`, `03 Sections`, `04 Pages` from Introduction to `📚 Docs`. Stack them in order in one vertical column, x aligned, width 1408, constant gap. Leave vertical space above `01 Foundations` for Chapter 00 (Task 4) — reserve ~2 frame-heights.

- [ ] **Step 5: Verify column layout**

`get_screenshot` of the `📚 Docs` page zoomed out. Expected: one column, chapters in reading order 01→04, equal gaps, `_Docs` masters visibly separated below.

- [ ] **Step 6: Log and commit**

Append `## Docs page build log` to `notes.md`: new page ID, chapter-gap value chosen, master-move confirmation.

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — Docs page created, masters and chapters moved"
```

---

### Task 4: Build Chapter `00 About` (fold Intro/01 + Intro/02, D8 size cap)

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 3 `📚 Docs` page; Task 1 IDs for `CHAPTER / 00 Read me`, `Intro/01`, `Intro/02`.
- Produces: frame `CHAPTER / 00 About` at the top of the Docs column. Content contract (D3/D8): mission ≤ 3 lines, audience table, three-layer identity, 7 core rules, page-intent list — nothing else. Task 9 validates it against the ~2-frame-heights cap.

- [x] **Step 1: Extract source text**

`get_design_context` on `CHAPTER / 00 Read me`, `Intro/01`, `Intro/02` (still on Introduction page). Capture verbatim: the 7 core rules, the three-layer identity text (Chrome / Content / Hand definitions + "only one layer can be expressive at a time"), audience statements (developers scanning for useful content; recruiters/clients scanning for credibility in under 1 minute), and page intents (Home = credibility, Blog = findability, Work = proof, About = trust).

- [x] **Step 2: Rename and move the chapter frame**

Rename `CHAPTER / 00 Read me` → `CHAPTER / 00 About`, move it to `📚 Docs` at the top of the column (same width 1408, same gap above `01 Foundations`).

- [x] **Step 3: Compose the About content**

Inside `00 About`, using `_Docs/*` instances only, in order:

1. `_Docs/ChapterHeader` — number `00`, name `About`, one-line purpose: `What this system is, who it serves, and the rules that govern it.`
2. Mission — one `_Docs/Paragraph`, ≤ 3 lines at 50–75 char measure. Source: compress Intro/01's problem statement verbatim-first (cut, don't rewrite).
3. Three-layer identity — keep the existing Read-me layer content (Chrome / Content / Hand + the one-expressive-layer rule).
4. The 7 core rules — keep verbatim from Read me.
5. Audience — a two-row table (Headline + Paragraph instances or TokenRow-style rows): `Developers — scanning for useful content` / `Recruiters & clients — scanning for credibility in under 1 minute`.
6. Page intents — four one-liners: `Home — best-of + links, establishes credibility` / `Blog — findability, reading` / `Work — proof, case studies` / `About — trust, the person`.

Deep product strategy from Intro/01–02 (user flows, branding rationale) is **not** carried over — it lives in `.specs/` (D3).

- [x] **Step 4: Verify the size cap**

`get_screenshot` of `00 About`. Expected: reads top-to-bottom in one pass; height ≤ ~2× the height of a typical chapter frame's first viewport (~2 frame-heights per D8). If over: cut prose, not structure.

- [x] **Step 5: Log and commit**

Append to `## Docs page build log`: `00 About` composed, height, what was cut from Intro/01–02.

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — Chapter 00 About composed"
```

---

### Task 5: Chapter 02 groups per D5 taxonomy (+ GroupHeader if triggered)

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 3 Docs page; `CHAPTER / 02 Components` frame.
- Produces: chapter 02 internally grouped under exactly six headings — `Chrome`, `Actions`, `Typography`, `Metadata`, `Cards`, `Sections` — matching D5. If `_Docs/GroupHeader` is created, it is documented in `notes.md` (D7 requires the trigger recorded). Task 6 uses the same six names on the Components page.

- [ ] **Step 1: Audit current chapter 02 structure**

`get_design_context` on `CHAPTER / 02 Components`. List its current groups/cards and map each existing DecisionCard/DoDont/rule to one of the six D5 groups.

- [ ] **Step 2: Decide the GroupHeader trigger**

Try expressing the six group headings with existing `_Docs/Headline` instances first. D8 requires a visible size step between ChapterHeader and group level (2–4 steps, top ≤ 2× body). If Headline cannot express a second level distinct from both ChapterHeader and card titles → create `_Docs/GroupHeader`: number-less, smaller than ChapterHeader (e.g. ChapterHeader's type size × 0.6, same family/weight logic), no other new components.

- [ ] **Step 3: Regroup chapter 02 content**

Reorder cards under the six headings in D5 order (Chrome, Actions, Typography, Metadata, Cards, Sections). Two-level cap: chapter → group → cards, no third heading level. Group frames named exactly like the D5 sections.

- [ ] **Step 4: Verify scanning path**

`get_screenshot` of chapter 02. Expected: layer-cake — ChapterHeader, then six visually distinct group headings, cards under each; any fact reachable page → chapter → group → card.

- [ ] **Step 5: Log and commit**

Append to `notes.md`: GroupHeader created yes/no (+ trigger evidence), regrouping summary.

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — chapter 02 grouped per D5 taxonomy"
```

---

### Task 6: Retitle ❖ Components page sections per D5; move `Link/*` into Actions

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 1 IDs for the 8 Components-page sections; D5 table below.
- Produces: ❖ Components page reorganized into exactly six sections named `Chrome`, `Actions`, `Typography`, `Metadata`, `Cards`, `Sections`, contents per the D5 matrix. Task 7 iterates these components for descriptions.

D5 target (copy of design.md — the executor needs no other source):

| Section | Components |
| --- | --- |
| Chrome | Header, Footer, NavLink, NavLinkHome, ThemeToggle, MotionToggle, Icon |
| Actions | Link/CTA, Link/Secondary, Link/SecondarySm, Link/TextCTA, Link/Icon |
| Typography | H1, H2, PreviewTitle, PageDescription |
| Metadata | PostMetadataTime, PostMetadataTopic, SerieMeta |
| Cards | PostRow, SerieCard, PostCardPreviewBig, PostCardPreviewSmall, WorkCardPreviewSmall |
| Sections | Hero, HeroText, HeroAnimation, BlogPreviewSection, ArchiveTable, SerieCardList, WorkPreviewSection, ContactContent, ContactPreviewSection |

- [ ] **Step 1: Map current 8 sections to target 6**

From the Task 1 inventory, list which existing section each component sits in and its target D5 section. Components in the file but absent from the D5 table: leave in place, add to `notes.md` `### Deviations` for a design.md follow-up. D5 names missing from the file: same — note, don't invent.

- [ ] **Step 2: Rename / create / dissolve sections**

`use_figma`: rename matching sections to the six D5 names; create missing ones; move components per the map; delete now-empty old sections (a section container emptied by moves is not "content" — safe to delete without backup).

- [ ] **Step 3: Verify no doc text on canvas**

D5: no doc text on the Components page canvas. Any usage prose found next to components: delete it (its content belongs in chapter 02 cards — cross-check it's covered there first; if not, add to the matching chapter-02 group as a card, then delete from canvas).

- [ ] **Step 4: Verify structure**

`use_figma` listing of the Components page. Expected: exactly six sections, names matching D5 verbatim, every D5-listed component present in its assigned section.

- [ ] **Step 5: Log and commit**

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — Components page sections retitled per D5"
```

---

### Task 7: One-sentence description field per published component

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 6 section structure.
- Produces: every published (non-underscore) component/component-set has a filled description field (Dev Mode + AI surface, per D5). `notes.md` records any component whose actual purpose diverged from the draft sentence.

- [ ] **Step 1: Set descriptions**

`use_figma`: set each component's description to the sentence below (adjust wording only if the component's actual structure contradicts it — record adjustments in `notes.md`):

| Component | Description |
| --- | --- |
| Header | Top site chrome: logo, nav links, theme and motion toggles. |
| Footer | Bottom chrome: contact links, social icons, copyright. |
| NavLink | Header navigation link with active-page state. |
| NavLinkHome | Home/logo variant of the header nav link. |
| ThemeToggle | Light/dark mode switch; choice persists. |
| MotionToggle | Enables or disables scroll animations. |
| Icon | Base icon wrapper sized by token. |
| Link/CTA | Primary call-to-action link, accent-filled. |
| Link/Secondary | Secondary bordered action link. |
| Link/SecondarySm | Small secondary link for dense contexts. |
| Link/TextCTA | Inline text link with arrow affordance. |
| Link/Icon | Icon-only link for social and external targets. |
| H1 | Page title; one per page. |
| H2 | Section title within a page. |
| PreviewTitle | Title style for cards and previews. |
| PageDescription | Lead paragraph under the page title. |
| PostMetadataTime | Publication date and reading time, mono 12px. |
| PostMetadataTopic | Topic tag chip for posts. |
| SerieMeta | Part count and progress for a serie. |
| PostRow | Compact list row for the archive table. |
| SerieCard | Serie summary card with metadata. |
| PostCardPreviewBig | Large featured-post preview card. |
| PostCardPreviewSmall | Small post preview card. |
| WorkCardPreviewSmall | Small work/project preview card. |
| Hero | Home hero assembly: text plus animation. |
| HeroText | Hero copy block. |
| HeroAnimation | Hand-drawn animated hero visual. |
| BlogPreviewSection | Home section previewing latest posts. |
| ArchiveTable | Full post list grouped by year. |
| SerieCardList | Grid of serie cards. |
| WorkPreviewSection | Home section previewing selected work. |
| ContactContent | Contact block: links and invitation text. |
| ContactPreviewSection | Home section wrapping the contact block. |

Components found in Task 6 that aren't in this table: write one sentence in the same register (what it is + where it's used), log it.

- [ ] **Step 2: Verify coverage**

`use_figma`: list all published components with empty descriptions. Expected: zero (underscore `_Docs/*`, `_states` etc. excluded — private, no description required).

- [ ] **Step 3: Log and commit**

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — component descriptions filled"
```

---

### Task 8: Demote/rename pages, refresh cover date, delete empty + superseded pages

**Files:**
- Modify: `CLAUDE.md` (repo root, "Figma Design Tokens" section)
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: Task 2 D4 verdict (must exist before Foundations deletion); Tasks 3–7 complete (Introduction content fully superseded).
- Produces: page list = `📖 Cover`, `📚 Docs`, `❖ Components`, `📄 Pages`, `🗄 Backup — Introduction (pre-Docs)`, `🗄 Backup — <source>` ×3. Task 9 validates; Task 10 deletes the Introduction backup.

- [ ] **Step 1: Pre-flight — confirm Introduction is fully superseded**

Checklist against Tasks 3–7 output: chapters 00–04 on Docs page ✓, `_Docs` masters moved ✓ (Task 3 Step 3 verified). The only content remaining on Introduction should be: `Intro/01`, `Intro/02`, the 3 stray nodes, and the emptied shells. If anything else remains, move it before demoting.

- [ ] **Step 2: Demote Introduction**

Rename page `📚 Introduction` → `🗄 Backup — Introduction (pre-Docs)`. Move it to the bottom of the page list. Strays (`Frame 1`, `Section`, `BLOG DESIGN SYSTEM v1.0` label — D1) stay inside it; they die with the page in Task 10.

- [ ] **Step 3: Rename kept backup pages**

Rename Pages 6, 7, 10 → `🗄 Backup — <source>`, where `<source>` names what they hold (inspect each via the Task 1 inventory; e.g. `🗄 Backup — Home templates`). Move to the bottom of the page list.

- [ ] **Step 4: Delete pages with nothing to back up**

Delete: 📐 Decisions (empty since creation), 🎨 Foundations (superseded — requires Task 2 verdict recorded), backup Pages 8, 9, 11 (0 children each). Verify child count is 0 (or salvage done) via `use_figma` immediately before each deletion.

- [ ] **Step 5: Refresh cover date chip**

On cover frame (audit `9:2`): set the date chip text to today's date in its existing format. **Do not touch the v0.91 chip** (D2).

- [ ] **Step 6: Update CLAUDE.md**

In root `CLAUDE.md`, "Figma Design Tokens" section, replace the docs-page reference:

- old: `` the `📚 Design system` page in `Blog Design System v1.0` ``
- new: `` the `📚 Docs` page in `Magnet-DS-v1.0` ``

(Keep the file key `ihWIWmvtQPTWgUxlrVjC2c`, which is unchanged.)

- [ ] **Step 7: Verify page list**

`use_figma` page inventory. Expected order: Cover, Docs, Components, Pages, then 4 `🗄 Backup — *` pages. No Decisions, no Foundations, no bare `Page N`.

- [ ] **Step 8: Commit**

```bash
git add CLAUDE.md .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs: magnet-ds-docs-v1 — pages demoted/deleted, cover date refreshed, CLAUDE.md docs ref updated"
```

---

### Task 9: D8 validation gate

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: finished `📚 Docs` page (Tasks 3–8).
- Produces: `notes.md` section `## D8 validation (gate)` — one row per check, PASS/FAIL + evidence (screenshot taken, measurement). **Task 10 is blocked until every row is PASS.**

- [ ] **Step 1: Run the D8 checklist**

For each check, gather evidence via `get_screenshot` / `use_figma` measurements and record PASS/FAIL:

1. **Linear spatial IA** — one vertical column, 00→04 order, width 1408 constant, constant gap. (Zoomed-out screenshot + frame x/width/y readout.)
2. **Layer-cake scanning** — every chapter: ChapterHeader → group headings → cards; pick 3 arbitrary facts (e.g. a colour token value, a Link/CTA rule, a page intent) and confirm each findable in ≤ 10 s via page → chapter → group → card.
3. **Two-level cap** — no third nesting/heading level anywhere.
4. **One idea per frame** — no frame mixing two topics; density lives inside cards.
5. **Visible heading hierarchy** — measure type sizes: 2–4 size steps between levels, top ≤ 2× body.
6. **Prose budget** — sample 5 paragraphs: measure 50–75 chars; specimen captions ≤ 1 sentence.
7. **Token tables** — semantic name first, resolved value same row, light/dark inline, no per-theme duplicate tables.
8. **Do/Don't discipline** — pairs only where the wrong choice is plausible; ≤ 2 pairs/row; one-line captions.
9. **Chapter 00 cap** — height ≤ ~2 frame-heights; contains exactly: mission ≤ 3 lines, audience table, identity layers, 7 rules, page intents.

- [ ] **Step 2: Fix failures**

Any FAIL: fix on the Docs page (cut prose, adjust sizes, regroup), then re-run that check. Iterate until all 9 PASS. If a fix would need a new `_Docs` component beyond GroupHeader/PageTOC — stop, add a note to design.md first (D7).

- [ ] **Step 3: Optional PageTOC (D7)**

Only if check 2 failed on first pass because chapter orientation was the bottleneck: add `_Docs/PageTOC` — one page-top card listing the five chapters with one-line purposes (spatial map, no links). Re-run checks 1–2 after.

- [ ] **Step 4: Record the gate result and commit**

Write `## D8 validation (gate)` in `notes.md`: the 9-row table, fixes applied, final verdict `GATE PASSED` (literal string — Task 10 greps for it).

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — D8 validation gate passed"
```

---

### Task 10: Delete the Introduction backup; archive the spec

**Files:**
- Modify: `.specs/01_active/magnet-ds-docs-v1/notes.md`

**Interfaces:**
- Consumes: `notes.md` containing `GATE PASSED` (Task 9). **Hard precondition — do not proceed without it.**
- Produces: final file state; spec archived to `.specs/02_archives/`.

- [ ] **Step 1: Verify the gate**

Run: `grep "GATE PASSED" .specs/01_active/magnet-ds-docs-v1/notes.md`
Expected: match found. No match → stop, return to Task 9.

- [ ] **Step 2: Final safety sweep of the backup page**

Before deleting `🗄 Backup — Introduction (pre-Docs)`: `use_figma` — confirm it contains **no component masters** (only frames, instances, strays). A master found here means Task 3 Step 2 missed it — move it to `📚 Docs` first.

- [ ] **Step 3: Delete the backup page**

Delete `🗄 Backup — Introduction (pre-Docs)` (takes the 3 stray nodes with it, completing D1's stale-label kill). Then `get_screenshot` of `📚 Docs` and of ❖ Components: expected no detached instances, no visual regressions.

- [ ] **Step 4: Record completion and commit**

Append `## Final state` to `notes.md`: final page list, deletion confirmed, screenshot verdicts.

```bash
git add .specs/01_active/magnet-ds-docs-v1/notes.md .specs/01_active/magnet-ds-docs-v1/plan.md
git commit -m "docs(specs): magnet-ds-docs-v1 — backup deleted after gate, restructure complete"
```

- [ ] **Step 5: Archive the spec**

```bash
./.specs/specs.sh archive magnet-ds-docs-v1
git add .specs
git commit -m "docs(specs): archive magnet-ds-docs-v1 — one-Docs-page restructure shipped"
```
