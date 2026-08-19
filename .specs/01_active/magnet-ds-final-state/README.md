---
title: Magnet-DS final state — execution index
created: 2026-08-18
---

# Magnet-DS final state — execution index

**Spec:** `design.md` (the single source of truth for the target state).
**Order of work:** `RUNBOOK.md` (every Figma brief and repo step in one list, with the cursor).
**Log:** `progress.md` (what each executed task wrote and read back).

This topic is executed as **32 Figma briefs** plus **3 repo-side files**. Every brief an agent receives is self-contained: run rules, helper JS, full layout anatomy with real copy, pasteable Plugin API code. A Figma agent working inside `Magnet-DS` (`ihWIWmvtQPTWgUxlrVjC2c`) needs **no repo access** to execute one.

The parts every brief shares live in one place and are pulled in at assembly time:

| Shared file              | Used by                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| `_run-rules.md`          | 29 briefs — the standing rules block                                         |
| `_prelude-components.js` | 9 briefs (P2-T02…T10) — `F` `T` `VARS` `findMaster` `inst` `home`            |
| `_prelude-pages.js`      | 11 briefs (P3-T01…T11) — `PAGES` `F` `VARS` `inst` `container` `shell` `pin` |

A brief references them with `<!-- include: _prelude-pages.js -->`. Fix a helper once, every brief that uses it is fixed. `use_figma` has no `import` and its sandbox scope resets between calls, so the prelude is still pasted with every brief — it just is not stored 20 times.

## How to run a brief

1. Assemble it: `pnpm figma:brief P2-T04` (`--list` for the ids). Includes are resolved; a missing one is a hard error, never a silent hole.
2. Open `Magnet-DS` in Figma with an agent attached.
3. Paste the assembled output into the agent — never the raw file, which still holds unresolved markers.
4. The agent runs the steps in order — one batched call per step, cold read-back between writes.
5. It returns the `Report back` block. Paste that back into the repo session; the matching `repo/phase-N.md` step logs it into `progress.md`.

Everything not doable in Figma — verify scripts, `named-debt.json`, `token-map.json`, the knowledge file, commits, the spec archive — lives in `repo/`. Run the repo steps at the points those files name, not all at the end.

## Phase 1 — foundations

Bring the live file to the spec's foundation state: audited collections, canon names, 7 domain sections, merges collapsed, one container recipe.

| Brief                              | Deliverable                                     |
| ---------------------------------- | ----------------------------------------------- |
| `figma/P1-T01-inventory-gates.md`  | Live Pass-0 inventory + 4 gate verdicts         |
| `figma/P1-T02-decisions-page.md`   | 📐 Decisions page, 4 records                    |
| `figma/P1-T03-primitives-audit.md` | `1 Primitives` pruned and documented            |
| `figma/P1-T04-theme-audit.md`      | `2 Theme` orphans, dupes, renames closed        |
| `figma/P1-T05-renames.md`          | 30 masters on `domain/Component`                |
| `figma/P1-T06-domain-sections.md`  | ❖ Components re-sectioned into 7 domains        |
| `figma/P1-T07-merges.md`           | NavLink / PostCard / Link merges                |
| `figma/P1-T08-container-recipe.md` | 16 / 1280 / centred everywhere, zero exceptions |
| `figma/P1-T09-phase1-gate.md`      | **GATE** — phase 1 exit                         |

Repo: `repo/phase-1.md` (R1.1 before P1-T01; R1.2–R1.5 interleaved; R1.6 is the gate's repo half).

## Phase 2 — components

15 new masters. Do not start before P1-T09 passes.

| Brief                                       | Deliverable                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `figma/P2-T01-entry-gate.md`                | **GATE** — 31 existing masters present under canon names                    |
| `figma/P2-T02-link-external.md`             | `ui/Link/external`                                                          |
| `figma/P2-T03-prose-socialshare.md`         | `ui/Prose`, `ui/SocialShare`                                                |
| `figma/P2-T04-workcard.md`                  | `work/WorkCard` — 8 variants (catalogue / case × hover × side)              |
| `figma/P2-T05-archivetable.md`              | `work/ArchiveTable` — 3 breakpoints, column drops                           |
| `figma/P2-T06-contactpreview-mobile.md`     | `contact/ContactPreview` gains a `breakpoint` axis                          |
| `figma/P2-T07-toc-seriecontents.md`         | `blog/TableOfContents`, `blog/SerieContents`                                |
| `figma/P2-T08-postnav-relatedwork.md`       | `work/WorkMiniCard`, `blog/RelatedWork`, `blog/PostNav` + decision record 5 |
| `figma/P2-T09-workheader-relatedwriting.md` | `work/WorkHeader`, `blog/PostRowCalm`, `work/RelatedWriting`                |
| `figma/P2-T10-about-masters.md`             | `about/AboutFacts`, `about/AboutText`                                       |
| `figma/P2-T10b-hairline-rebuild.md`         | rebuild 4 rect-hairline masters on `HAIR()` — 50 rectangles                 |
| `figma/P2-T11-phase2-gate.md`               | **GATE** — 46 / 11 / 4 roster, variant axes, Gate D                         |

Repo: `repo/phase-2.md`.

## Phase 3 — pages, docs, ship

8 route masters × 4 frames = 32, then documentation and cleanup. Do not start before P2-T11 passes.

| Brief                             | Deliverable                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `figma/P3-T01-page-baseline.md`   | **GATE** — read-only page baseline + delta list                                       |
| `figma/P3-T02-home.md`            | `Home — *` — the **Home-type** `PageContent` (full bleed, sections own the container) |
| `figma/P3-T03-blog.md`            | `Blog — *` — the **document-type** `PageContent`, wrapper removed                     |
| `figma/P3-T04-work.md`            | `Work — *` — case zigzag + archive table                                              |
| `figma/P3-T05-about.md`           | `About — *`                                                                           |
| `figma/P3-T06-post-detail.md`     | `Post — *` — the detail shell T07/T08 reuse                                           |
| `figma/P3-T07-serie-masters.md`   | `Serie — *`, `Serie post — *`                                                         |
| `figma/P3-T08-work-detail.md`     | `Work detail — *`                                                                     |
| `figma/P3-T09-dark-grid.md`       | 32 frames, dark rows as mode-pinned instances                                         |
| `figma/P3-T10-docs-page.md`       | 📚 Docs — Getting Started + 5 foundation docs                                         |
| `figma/P3-T11-archive-cleanup.md` | Explorations archived, final roster, hygiene + binding sweep                          |

Repo: `repo/phase-3.md` — including the two `design.md` §4 amendments (R3.1), the verification run (R3.3), the knowledge file (R3.4), and the archive (R3.6).

## Standing rules (canonical copy: `figma/_run-rules.md`)

- Resolve every target **by name**; node and variable ids anywhere in these files are hints.
- Do not use `get_metadata` for the page list — it is stale on this file.
- One batched call per operation; read back **cold** in a separate call.
- Write to masters, never instances.
- **Nothing a human designed is deleted.** Retirement means archiving. `🗄️ Archive — *` pages are completed tasks — never reopened, renamed, or edited.
- `3 Responsive` is frozen. The `Design System` meta collection is exempt from every audit.
- Container recipe: pad-x 16 bound to `container/gutter`, max-w 1280 bound to `container/max-width`, centred. Zero 32px exceptions.
- Canvas hygiene is normative: Gate D (`overlaps` / `cropped` / `strays`) must return all-empty.
- `INDEX.md` is generated — never hand-edit it.

## Superseded

The original `plan-1*.md` / `plan-2*.md` / `plan-3*.md` fragments are kept under `superseded-plans/` for provenance. They are **not** the execution path — the briefs above are. Where the two disagree, the briefs win; they carry the live-route anatomy and the divergences discovered while writing them.
