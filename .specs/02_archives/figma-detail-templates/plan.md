# Figma Detail-Page Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **This is a Figma-replication plan, not a code plan.** There is no pytest/vitest cycle. Each task's "test" gate is a **`get_screenshot` visual diff** of the built Figma node against the live Astro component / Storybook story (figma-replicate Phase 4). "Commit" = the Figma write is atomic per `use_figma` call; there is no git commit for Figma nodes. Update the ref doc + INDEX only at the end (Task 7).

**Goal:** Assemble the four missing detail-page templates (blog-post, serie-landing, serie-post, work-detail) as instance-only frames in the Figma DS file's 📄 Pages, closing the ~13-master "unused in Pages" gap.

**Architecture:** Repair/verify the shared masters first (🧩 Components), then assemble instances into four new SECTIONs in 📄 Pages — one per template, each with the full 6-frame matrix (1280 / 768 / 390 × Light / Dark) matching the existing PAGE/HOME coverage. Responsive direction and column counts are derived from each route's Tailwind classes, not invented. Work incrementally: build the 1280-Light frame first, screenshot-verify, then replicate to the 5 siblings.

**Tech Stack:** Figma Plugin API via `use_figma` MCP tool; figma-verify Pass-0 live inventory; `get_screenshot` for verification. Source of truth = the four `.astro` route files + their child components + Storybook stories.

## Global Constraints

- **File:** `Wf4iomVMYUXlFIBV3Z8bx4` (`Blog-JeromeAbel`), build `ds-blog-v3-01`. 📄 Pages = `44:328`, 🧩 Components = `52:2`.
- **Preflight every session:** run `/figma-use` before any `use_figma` write. Plugin API rules: page resets per call, `setCurrentPageAsync` once/call, load fonts before setting `characters`, colors 0–1, `return` is the only output, atomic-on-error.
- **Enumerate by NAME via figma-verify Pass-0, never `get_metadata`** (its page-list is stale — showed only Cover on this 5-page file). Every node ID in this plan is a **hint**; resolve the live ID by name off the Pass-0 return before writing.
- **Root font-size = 16px** here → every `rem` × 16. (Not 13 — that is the other repo.)
- **Instances only in Pages.** Zero hand-drawn stand-ins. Repair the master; instances inherit. Never patch an assembled page.
- **Bind tokens, never raw hex.** Fills/strokes → `Color` collection vars (`color/foreground` `3:4`, `color/muted` `3:7`, `color/muted-border` `3:8`, `color/muted-background`, `color/background`). Unavoidable raw → **named debt** in the ref doc.
- **Real content = fidelity.** Use the exact strings/values below. Invented placeholders are an audit failure.
- **Container:** `max-width: var(--breakpoint-xl)` = **1280px**, `padding-inline: 1rem` (16px). On the 1280 frame the container spans the frame minus 16px each side; Prose is further centered (`md:mx-auto`, typography measure).
- **Frame backgrounds:** Light `#f5ffe1`, Dark `#1e1e1e` (match existing PAGE/HOME frames — read the exact fills off the live 1280 Home frames in Task 0, do not hardcode blind).
- **Spacing per breakpoint** (from `gap-8 py-8 lg:gap-12 lg:py-24`): 1280 → gap 48px / py 96px; 768 & 390 → gap 32px / py 32px. `lg` = ≥1024, so only the 1280 frame gets the `lg:` values.

---

## Real content (use verbatim)

| Template | Route | Content entry | Why this entry |
| --- | --- | --- | --- |
| blog-post | `/blog/[id]` | `api-endpoints-with-astro` | has `related_work` (→ RelatedWork renders) + 10 h2/h3 (→ TOC, threshold ≥4) |
| serie-landing | `/blog/[serie]` | `web-performance` (5 parts) | documented serie; 5 SeriePostListItem rows |
| serie-post | `/blog/[serie]/[post]` | `web-performance/02-data-driven` | mid-serie (has prev **and** next); confirm ≥4 headings for TOC in Task 0 |
| work-detail | `/work/[id]` | `leconceptdelapreuve` | has `related_posts` (→ RelatedWriting renders) |

Pull the actual title / abstract / date / heading strings from each `index.md` frontmatter and body at build time — do not paraphrase.

---

## Master → template map (what each template instances)

| Master (🧩 Components) | Hint ID | blog-post | serie-landing | serie-post | work-detail |
| --- | --- | :-: | :-: | :-: | :-: |
| Header (`HEADER`) | `41:3` | ✓ | ✓ | ✓ | ✓ |
| Footer (`FOOTER`) | `42:3` | ✓ | ✓ | ✓ | ✓ |
| TopicChip (`TOPIC-CHIP`) | `15:9` | ✓ | | ✓ | |
| TableOfContents (`TOC`) | `36:3` | ✓ | | ✓ | |
| LinkNavPost (`LINK-NAV-POST` SET) | `34:17` | ✓ | | ✓ | |
| RelatedWork (`BLOG`) | `117:77` | ✓ | | | |
| WorkMiniCard (`WORK-CARDS`) | `32:9` | ✓ (in RelatedWork) | | | |
| SeriePostListItem (`BLOG`) | `119:83` | | ✓ | | |
| SerieContents (`BLOG`) | `118:83` | | | ✓ | |
| WorkHeader (`WORK`) | `127:95` | | | | ✓ |
| RelatedWriting (`WORK`) | `125:83` | | | | ✓ |
| PostRowCalm | **verify in Task 0** | | | | ✓ (in RelatedWriting) |
| Link (`LINK` SET) | `13:13` | ✓ | ✓ | ✓ | ✓ |

**Out of scope** (not on any detail route): PostListItem (blog index), ValueCard (about), 3 Legacy masters.

---

## Frame Build Procedure (referenced by Tasks 3–6)

Every template task follows this exact loop. "The layout tree" is given per-template in that task.

1. **Create the SECTION** in 📄 Pages named per the task (e.g. `PAGE/POST`), placed to the right of the last existing PAGE section so nothing overlaps. Read existing section X-extents in Task 0 to pick a non-overlapping origin.
2. **Build the 1280-Light frame** inside the section: frame width 1280, background = Light fill read in Task 0. Add a vertical auto-layout `main` (the container: `paddingLeft/Right = 16`, `itemSpacing = 48`, `paddingTop/Bottom = 96`, `layoutSizingHorizontal` sized so inner content max-width = 1280−32). Header instance at top of frame (outside container, full-bleed, matching Home), Footer instance at bottom — copy the header/footer placement from the live 1280 Home frame.
3. Populate `main` with the template's layout tree using **instances** of the mapped masters + text nodes bound to the Text Styles (Title/H1 44 Bubbler One, Body/Base 18, Label/Meta 14, etc.) and fills bound to `Color` vars.
4. **Gate — screenshot the 1280-Light frame**, diff against `pnpm dev` render of the route at 1280px (or the Storybook stories of the child components). Must match or the deviation is logged as named debt. **Stop here for review** (expensive-session gate) before replicating siblings.
5. **Replicate to 1280-Dark**: duplicate the frame, set background = Dark fill; instances + token-bound fills auto-flip via the `Dark` color mode (set the frame's explicit mode if the file uses per-frame mode override — check how Home Dark frames do it in Task 0). Screenshot-verify Dark.
6. **Replicate to 768 (Light+Dark)**: duplicate, resize width 768, apply the **768 responsive deltas** listed in the task (spacing → 32/32; header width → full; TOC sidebar behavior; grid columns). Screenshot both.
7. **Replicate to 390 (Light+Dark)**: duplicate, resize width 390, apply the **390 responsive deltas** (stacked meta row, mobile `<details>` TOC replacing sidebar, 2-col grids). Screenshot both.
8. Return every created/mutated node ID from each `use_figma` call.

Shared responsive rules (apply wherever the element appears):

- **Detail header** (`lg:w-2/3`): 1280 → header block width = 2/3 of container; 768 & 390 → full width.
- **Content + TOC row** (`aside … hidden md:block`, mobile `<details> … md:hidden`): 1280 & 768 → Prose column + sticky right TOC sidebar (`w-56` = 224px); 390 → no sidebar, a collapsed "On this page" `<details>` block above the Prose instead.
- **Meta row** (`sm:flex-row`): 1280 & 768 → horizontal (date/read-time · TopicChips · SocialShare); 390 → vertical stack.
- **RelatedWork grid** (`grid-cols-2 sm:grid-cols-3`): 1280 & 768 → 3 columns; 390 → 2 columns.
- **Bottom link row** (work-detail `sm:flex-row`): 1280 & 768 → horizontal; 390 → vertical.

---

### Task 0: Preflight, live inventory & readiness audit

**Files:** (Figma, read-only) — no `.astro` edits.

**Interfaces:**
- Produces: a resolved-by-name ID table for every master + page in the Master→template map; confirmed frame-background fills; confirmed PostRowCalm master status; confirmed content entry facts.

- [ ] **Step 1: Preflight** — run `/figma-use`. Confirm the plugin API rules loaded.

- [ ] **Step 2: Pass-0 live inventory** — via `use_figma`, walk `figma.root.children` with `await p.loadAsync()` per page; return, for each: page name+id, and for 🧩 Components every SECTION + master name+id+type. Cross-check master names against `mainComponent` names referenced by instances to catch any orphan (`parent === null`).

- [ ] **Step 3: Resolve the map** — match every master in the Master→template map to a live id **by name**. Flag any whose hint ID drifted. Explicitly record: does a **PostRowCalm** master exist? (Ref doc lists only PostRow `31:13`.) If absent, note it — Task 2 must build it.

- [ ] **Step 4: Read Home reference frames** — screenshot the live `Home — 1280 — Light` and `Home — 1280 — Dark` frames. Record: exact background fills (Light/Dark), Header/Footer instance placement + how Dark mode is applied per frame (explicit color-mode override vs. bound vars), container inner width, and the X-extent of the rightmost PAGE section (so new sections don't overlap).

- [ ] **Step 5: Confirm content facts** — from the repo: title/abstract/date/heading-count for `api-endpoints-with-astro`; the 5 part titles + dates of `web-performance`; that `web-performance/02-data-driven` has ≥4 h2/h3 (else pick the sibling part that does and note it) and has both prev+next; title/abstract/date of `leconceptdelapreuve` + its `related_posts` titles.

- [ ] **Step 6: Gate** — produce the resolved inventory table + readiness notes as the task output. No Figma writes in this task. Reviewer confirms the map before any master is touched.

---

### Task 1: Blog/shared master readiness

**Goal:** Verify (repair only if the screenshot diff fails) the masters the blog templates instance: TopicChip, TableOfContents, LinkNavPost, SeriePostListItem, SerieContents, RelatedWork (+ WorkMiniCard child).

**Files:** 🧩 Components masters (resolved in Task 0). Sources to diff against:
- `src/components/blog/TopicChips.astro`, `TableOfContents.astro`, `SeriePostListItem.astro`, `SerieContents.astro`, `RelatedWork.astro`, `src/components/ui/LinkNavPost.astro`, `src/components/work/WorkMiniCard.astro` + their `.stories.ts`.

**Interfaces:**
- Consumes: resolved master IDs from Task 0.
- Produces: each master confirmed instance-ready (auto-layout, tokens bound, real content), or repaired to be so.

- [x] **Step 1: Screenshot each master vs its story** — for TopicChip, TableOfContents, LinkNavPost (both prev/next variants of the SET), SeriePostListItem, SerieContents, RelatedWork, WorkMiniCard: `get_screenshot` the master; render the Storybook story; diff.

- [x] **Step 2: Repair only what diffs** — for any master that fails: fix in 🧩 Components (auto-layout direction, `Color`-bound fills/strokes, Text Styles, **real content** — e.g. SeriePostListItem shows `order · title · read-time · date`; SerieContents lists the serie's real part titles with the current one marked). Repair the master, never an instance. Log any unavoidable raw fill as named debt.

- [x] **Step 3: Confirm RelatedWork composition** — RelatedWork must contain a real 3-col grid of **WorkMiniCard instances** (not flat rects) under a "Related work" label (`text-muted text-sm uppercase`). If it holds stand-ins, rebuild it from WorkMiniCard instances.

- [x] **Step 4: Gate** — re-screenshot every repaired master; all match their story. Output the list of masters touched (or "all already clean").

---

### Task 2: Work master readiness

**Goal:** Verify/repair the work-detail masters: WorkHeader, RelatedWriting, and its PostRowCalm child (build PostRowCalm if Task 0 found it missing).

**Files:** 🧩 Components. Sources: `src/components/work/WorkHeader.astro`, `RelatedWriting.astro`, `src/components/blog/PostRowCalm.astro` + stories.

**Interfaces:**
- Consumes: resolved IDs + PostRowCalm status from Task 0.
- Produces: WorkHeader, RelatedWriting, PostRowCalm all instance-ready.

- [x] **Step 1: PostRowCalm master** — if Task 0 found no PostRowCalm master: build it in the `POST-ROW` section as a variant-toggled sibling of PostRow (`VARIANTS.homePosts` pattern), matching `PostRowCalm.astro` (calm row: title + meta, no hover-heavy affordance). Auto-layout, tokens bound, real post title/date. If it exists, screenshot-vs-story and repair only on diff.

- [x] **Step 2: WorkHeader** — screenshot vs `WorkHeader.stories.ts`. WorkHeader renders the work title, meta (date, role/tech), and its layout. Repair on diff; real content = `leconceptdelapreuve` header fields.

- [x] **Step 3: RelatedWriting composition** — RelatedWriting = "Related writing" label + a vertical stack of **PostRowCalm instances**. Confirm it composes from PostRowCalm instances; rebuild from instances if it holds stand-ins.

- [x] **Step 4: Gate** — re-screenshot WorkHeader, RelatedWriting, PostRowCalm; all match. Output masters touched + whether PostRowCalm was newly built (→ Task 7 ref-doc entry).

---

### Task 3: blog-post template (`PAGE/POST`)

**Goal:** Assemble the `/blog/[id]` template (content: `api-endpoints-with-astro`) as 6 frames in a new `PAGE/POST` section.

**Files:** 📄 Pages → new `PAGE/POST` section. Source of truth: `src/pages/blog/[id].astro`.

**Interfaces:**
- Consumes: masters from Tasks 1–2; Home reference from Task 0.
- Produces: 6 verified frames `POST — {1280,768,390} — {Light,Dark}`.

**Layout tree (inside `main` container, top→bottom):**
1. `header` block (`border-b`, `pb-6/lg:pb-12`, width 2/3 at 1280): breadcrumb nav (`Link "BLOG" menuInactive` + chevron-right icon) → H1 (real title) → P (real abstract) → meta row: [calendar icon + date + clock icon + read-time] · **TopicChip** instance(s) for the post's topic · SocialShare (share icons).
2. Hero **CustomImage** (the post's `img`) — placeholder image node bound to the real asset name.
3. Content + TOC row: **Prose** block (real rendered markdown — use representative heading/paragraph text from the post) on the left; **TableOfContents** instance in a `w-56` sticky sidebar on the right (1280/768 only).
4. **RelatedWork** instance (post has `related_work`).
5. **LinkNavPost** pair (prev/next) — real prev/next standalone-post titles.
6. `Link "All blog" secondary` with arrow-right icon.

- [x] **Step 1: Build `POST — 1280 — Light`** per the Frame Build Procedure steps 1–3 with the layout tree above.
- [x] **Step 2: Gate** — screenshot vs `pnpm dev` `/blog/api-endpoints-with-astro` at 1280px. Match or log named debt. **Stop for review.**
- [x] **Step 3: `POST — 1280 — Dark`** (Procedure step 5). Screenshot-verify.
- [x] **Step 4: `POST — 768 — Light/Dark`** (Procedure step 6): spacing 32/32, header full-width, TOC sidebar kept, RelatedWork 3-col, meta row horizontal. Screenshot both.
- [x] **Step 5: `POST — 390 — Light/Dark`** (Procedure step 7): TOC → collapsed `<details>` "On this page" above Prose (no sidebar), meta row stacked, RelatedWork 2-col, LinkNavPost pair stays row (`gap-2`). Screenshot both.
- [x] **Step 6: Gate** — all 6 frames match their live render. Output the 6 frame IDs.

---

### Task 4: serie-landing template (`PAGE/SERIE`)

**Goal:** Assemble the `/blog/[serie]` template (content: `web-performance`) as 6 frames in a new `PAGE/SERIE` section.

**Files:** 📄 Pages → new `PAGE/SERIE` section. Source: `src/pages/blog/[serie]/index.astro`.

**Interfaces:**
- Consumes: SeriePostListItem master (Task 1).
- Produces: 6 verified frames `SERIE — {1280,768,390} — {Light,Dark}`.

**Layout tree:**
1. `header` block (width 2/3 at 1280, **no** bottom border here): breadcrumb nav (`Link "BLOG"` + chevron) → row [folder icon (`lucide:folder`, `text-2xl`, muted) + H1 real serie title] → P (real serie abstract) → stats row: [layers icon + "N parts"] + [clock icon + read label, e.g. "~1h 20m read" — compute from real serie].
2. A `border-t` divider, then the list: **5 SeriePostListItem** instances (the real `web-performance` part titles/dates/read-times, numbered 1–5).

- [x] **Step 1: Build `SERIE — 1280 — Light`** per Procedure with the tree above.
- [x] **Step 2: Gate** — screenshot vs `/blog/web-performance` at 1280px. **Stop for review.**
- [x] **Step 3: `SERIE — 1280 — Dark`**. Verify.
- [x] **Step 4: `SERIE — 768 — Light/Dark`**: spacing 32/32, header full-width. SeriePostListItem rows unchanged (already full-width rows). Verify both.
- [x] **Step 5: `SERIE — 390 — Light/Dark`**: header full-width; SeriePostListItem read-time `<p class="hidden sm:block">` hidden at 390 (only date shows). Verify both.
- [x] **Step 6: Gate** — 6 frames match. Output frame IDs.

---

### Task 5: serie-post template (`PAGE/SERIE-POST`)

**Goal:** Assemble the `/blog/[serie]/[post]` template (content: `web-performance/02-data-driven`) as 6 frames in a new `PAGE/SERIE-POST` section. Structurally ≈ blog-post, plus a two-segment breadcrumb and a SerieContents block; no RelatedWork.

**Files:** 📄 Pages → new `PAGE/SERIE-POST` section. Source: `src/pages/blog/[serie]/[post].astro`.

**Interfaces:**
- Consumes: TopicChip, TableOfContents, LinkNavPost, SerieContents masters.
- Produces: 6 verified frames `SERIE-POST — {1280,768,390} — {Light,Dark}`.

**Layout tree (deltas vs blog-post called out):**
1. `header` (`border-b`, width 2/3 at 1280): **two-segment breadcrumb** — segment A [`Link "Blog"` + chevron], segment B [`Link` real serie title + chevron + "Part 2 of 5" text]; the nav is `flex-col md:flex-row` (stacked at 390, row at ≥768) → H1 (real post title) → P (abstract) → meta row (date/read-time · TopicChip · SocialShare) — identical to blog-post.
2. Hero CustomImage (post `img`).
3. Content + TOC row — same as blog-post (Prose + sticky TableOfContents sidebar 1280/768; mobile `<details>` at 390).
4. **SerieContents** instance (real serie part list, current part marked) — **replaces** blog-post's RelatedWork.
5. **LinkNavPost** pair — prev = real previous part; next = real next part.

- [x] **Step 1: Build `SERIE-POST — 1280 — Light`** per Procedure with the tree above.
- [x] **Step 2: Gate** — screenshot vs `/blog/web-performance/02-data-driven` at 1280px. **Stop for review.**
- [x] **Step 3: `SERIE-POST — 1280 — Dark`**. Verify.
- [x] **Step 4: `SERIE-POST — 768 — Light/Dark`**: spacing 32/32, header full-width, breadcrumb row, TOC sidebar kept, meta row horizontal. Verify.
- [x] **Step 5: `SERIE-POST — 390 — Light/Dark`**: breadcrumb stacked (`flex-col`), meta stacked, TOC → mobile `<details>`, LinkNavPost pair row. Verify.
- [x] **Step 6: Gate** — 6 frames match. Output frame IDs.

---

### Task 6: work-detail template (`PAGE/WORK-DETAIL`)

**Goal:** Assemble the `/work/[id]` template (content: `leconceptdelapreuve`) as 6 frames in a new `PAGE/WORK-DETAIL` section.

**Files:** 📄 Pages → new `PAGE/WORK-DETAIL` section. Source: `src/pages/work/[id].astro`.

**Interfaces:**
- Consumes: WorkHeader, RelatedWriting (+ PostRowCalm) masters (Task 2).
- Produces: 6 verified frames `WORK-DETAIL — {1280,768,390} — {Light,Dark}`.

**Layout tree** (note: no container on the outer `main`; inner blocks each use `container`):
1. `container` block: **WorkHeader** instance (real `leconceptdelapreuve` title/meta) → hero **CustomImage** (work `img`).
2. **Prose** block (`md:mx-auto`) — representative rendered markdown of the work.
3. `container` block (`mt-12/lg:mt-16`): **RelatedWriting** instance (real `related_posts` titles as PostRowCalm rows).
4. `container` bottom link row (`flex-col sm:flex-row`): `Link "All work" secondary` + `Link "Next: <real next work title>" secondary`, both with arrow-right icon.

- [x] **Step 1: Build `WORK-DETAIL — 1280 — Light`** per Procedure with the tree above.
- [x] **Step 2: Gate** — screenshot vs `/work/leconceptdelapreuve` at 1280px. **Stop for review.**
- [x] **Step 3: `WORK-DETAIL — 1280 — Dark`**. Verify.
- [x] **Step 4: `WORK-DETAIL — 768 — Light/Dark`**: spacing 32/32; bottom link row horizontal; RelatedWriting rows unchanged. Verify.
- [x] **Step 5: `WORK-DETAIL — 390 — Light/Dark`**: bottom link row stacked (`flex-col`). Verify.
- [x] **Step 6: Gate** — 6 frames match. Output frame IDs.

---

### Task 7: Verification sweep, ref-doc & INDEX update

**Goal:** Final cross-template audit and documentation.

**Files:**
- `.claude/skills/figma-verify/knowledge/figma-ds-file.md` (update Page-templates table, gap note, change log)
- `.specs/INDEX.md` (via `./.specs/specs.sh archive figma-detail-templates` when shipped)

- [x] **Step 1: figma-verify sweep** — run the figma-verify Pass 0–3 audit over the four new sections. Confirm: instances only (zero hand-drawn), all fills/strokes token-bound (or listed as named debt), real content everywhere, no orphaned masters, no `[SUPERSEDED]` duplicates stacked. Done: 18 hand-built Link frames swapped to `secondaryIcon` instances; 204 raw values bound (itemSpacing/radius/text-style); 24 genuine gaps logged as named debt (28 total in `named-debt.json`); WORK-DETAIL confirmed already 0-gap; remaining 240 findings are inside shared-component instances, deferred to a master-level fix.
- [x] **Step 2: Spot-check one Dark + one 390 frame per template** with `get_screenshot` against the live route to catch mode/responsive regressions. Done: 8 live-route screenshots (1280-Dark + 390-Light × 4 templates) confirmed structural match. Found (out of scope, flagged separately): POST + SERIE-POST overflow horizontally at 390px in the live code — a CSS bug, not a Figma drift.
- [x] **Step 3: Update the ref doc** — rewrite the "Page templates" table (add PAGE/POST, PAGE/SERIE, PAGE/SERIE-POST, PAGE/WORK-DETAIL with their frame lists + resolved section IDs); delete the "no blog-post / serie / work-detail templates yet" gap paragraph; add a Change-log entry dated at ship time; record any PostRowCalm build + any named debt. Done in `figma-ds-file.md`.
- [x] **Step 4: Update project memory** — note the detail-templates gap is closed and PostRowCalm status, updating `project_figma-design-system` memory. Done.
- [ ] **Step 5: Archive** — when the user confirms shipped: `./.specs/specs.sh archive figma-detail-templates`.

---

## Self-Review

**Spec coverage:** All four routes → Tasks 3–6. Every "unused in Pages" master maps to a template task or is explicitly out-of-scope (PostListItem/ValueCard/Legacy). Master readiness (repair-before-instance, per skill rule) → Tasks 1–2. PostRowCalm gap (RelatedWriting's child, not in the ref-doc master list) surfaced in Task 0 and built in Task 2. Full 6-frame matrix per template (user decision) → each template task's steps 1–5. Ref-doc + INDEX (project convention) → Task 7.

**Placeholder scan:** Content is concrete (named entries + verbatim-frontmatter instruction). "Repair only on diff" is conditional-but-specified, not a TODO. Responsive deltas are exact breakpoints + column counts, not "handle responsiveness."

**Consistency:** Frame naming `<TEMPLATE> — <width> — <theme>` matches existing `Home — 1280 — Light` convention throughout. Section naming `PAGE/<NAME>` matches existing `PAGE/HOME`. Gate = `get_screenshot` diff in every task (adapted from the skill's pytest gate, stated up front).

**Known adaptation:** This plan replaces the writing-plans TDD code-cycle with figma-replicate's screenshot-diff cycle — declared in the header. No git commits for Figma nodes; the `use_figma` atomic-per-call write is the commit boundary.
