---
phase: 3
side: repo
title: Repo-side steps for phase 3 (pages, docs, cleanup, ship)
---

# Repo — phase 3

Companion Figma briefs: `../figma/P3-T01` … `P3-T11`. This file ends the topic.

## R3.1 — log the page-side divergences

Phase 3 deliberately lets Figma lead the code in three places. All three go in `progress.md` under `CODE DEBT`, and all three feed the backlog stub in R3.6:

- **P3-T02 (Home)** — Figma drops `AboutStrip` from the Home composition (spec §7) and uses `work/WorkCard variant=catalogue` where live renders a `WorkMiniCard` / `WorkOverlayCard` grid.
- **P3-T04 (Work)** — Figma builds the case zigzag; live `/work` is still a gallery grid.
- **P3-T03 (Blog)** — live renders **Series after Archive**; spec §4 lists Series first. Live wins on order, so Figma was built live-order. This is a **spec amendment**, not code debt: update `design.md` §4 rather than the route.
- **P3-T06 (Post)** — live puts SocialShare inside the header meta row, RelatedWork before PostNav, and adds a trailing `All blog` link. Same call: amend spec §4 to match live.
- **P3-T07 (Serie)** — live's serie-landing list is boxless; Figma uses the boxed `blog/SerieContents`. Figma wins on styling — code debt.
- **P3-T08 (Work detail)** — live places `Prose` outside `.container`; Figma keeps one container. Visual result identical — record as an intentional simplification, no action.

Apply the two spec amendments to `design.md` §4 in one edit and commit them before the final archive, or the archived spec ships wrong.

## R3.2 — refresh the pixel manifest

`scripts/pixel-manifest.mjs` still points at components this migration retired (`WorkGalleryCard`, `AboutStrip`, …) and at selectors that changed.

```bash
pnpm dev &          # leave running for this step
pnpm geometry:web
```

For every entry: verify `storyPath` and `selector` still resolve. Mark retired components `skip: true` with a `reason` — **do not delete the entry**, the id is a historical key.

Read `geometry.web.json`: every non-skipped id must have a non-null `root`. A null means the selector is stale — fix the selector, do not skip the component.

## R3.3 — full verification

Fresh Figma **File > Export**, then:

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig
pnpm figma:verify
pnpm figma:verify-raw
pnpm figma:verify-responsive
pnpm test
```

Warn-only, exit 0 — **read the reports**. Expected end state:

- `figma:verify` — no missing/extra tokens beyond documented exceptions.
- `figma:verify-raw` — every raw value from the P3-T11 sweep present in `named-debt.json` with a reason; **prune entries whose node ids no longer exist** (this migration renamed and rebuilt heavily, so stale entries are expected).
- `figma:verify-responsive` — the 18-variable table matches `responsive-expected.json` exactly.
- `pnpm test` — green.

## R3.4 — rewrite the knowledge file

`.claude/skills/figma-verify/knowledge/figma-ds-file.md` gets the final state from the P3-T11 report: page table, master roster grouped by the 7 domain sections, the 8-route page grid, collection counts, and a change-log entry:

```markdown
- 2026-MM-DD — Magnet-DS final state shipped
  (`.specs/02_archives/magnet-ds-final-state/`). Three phases: foundations
  (variables audit, renames, 7 domain sections, merges, container 16),
  components (15 new masters), pages (8 route masters × 4 frames = 32).
  `PageContentContainer` removed; container ownership normative (Home-type
  sections own, document-type `PageContent` owns). Docs finalized to
  Getting Started + 5 foundations; rationale lives in 📐 Decisions.
  Explorations archived. Master roster re-counted live: <n>.
```

Use the counts P3-T11 reported. An approximate number here is worse than none — the next drift check reads this file as truth.

## R3.5 — retire the superseded TODO files

```bash
git rm .specs/01_active/TODO_ContainerPatternAnalysis.md \
       .specs/01_active/TODO_MagnetDS_ComponentArchitecture.md
git mv ".specs/01_active/TODO - WorkCard — final spec (post-exploration round).md" \
       .specs/01_active/work-card-redesign/spec.md
```

Both deletions are safe **only** because their content is now normative elsewhere: container analysis → `design.md` §5 + the Docs "Spacing & Layout" doc; component architecture → `design.md` §3. Confirm both landed before running `git rm`. The WorkCard spec is not deleted — it still owns live component anatomy, so it moves into its topic folder.

## R3.6 — ship

```bash
pnpm format:write
git add -A
git commit -m "docs(figma): magnet-ds final state shipped — pages, docs, cleanup verified"
./.specs/specs.sh archive magnet-ds-final-state
git add .specs
git commit -m "docs(specs): archive magnet-ds-final-state"
```

`specs.sh archive` stamps `shipped:` and regenerates `INDEX.md` — never hand-edit the index.

## R3.7 — hand off the code debt

`design.md` §7 (Astro renames, `PostRow` collapses, `Link` CVA vocabulary, retired-component archiving, `AboutStrip` removal from Home) is out of scope for all three phases. Open the stub so it does not get lost:

```bash
./.specs/specs.sh new magnet-ds-code-convergence "Code follows Magnet-DS: renames, Link CVA, row collapses"
```

Seed it with a pointer to `.specs/02_archives/magnet-ds-final-state/design.md` §7 plus every `CODE DEBT` entry logged in `progress.md` during phases 2 and 3 — notably the `surface/50` hover token (P2-T05), the Home composition (P3-T02), the Work zigzag (P3-T04), and the boxless serie list (P3-T07).
