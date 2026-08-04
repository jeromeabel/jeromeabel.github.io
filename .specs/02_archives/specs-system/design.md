---
shipped: 2026-07-19
---

# Specs System — Design

**Date:** 2026-07-18
**Status:** Approved
**Inspiration:** `allo-media/frontend-ai/.specs` (lifecycle folders), reduced to a minimal committed system: one conventions file, one helper script.

## Goal

A single, git-tracked home for project ideas and their design/plan artifacts, answering "what's done, what's active, what's next" at a glance. Replaces the ad-hoc `docs/superpowers/{specs,plans}` flat files and the backlog-in-chat-messages habit.

## Structure

```
.specs/
├── INDEX.md        # generated dashboard: active / backlog / done
├── CLAUDE.md       # conventions (condensed from this design)
├── specs.sh        # helper: new | activate | archive | index
├── 00_backlog/     # one .md per idea (slug.md, no dates)
├── 01_active/      # <slug>/design.md + plan.md (+ notes.md if needed)
└── 02_archives/    # shipped topics, same folder shape
```

Status = location. Numbered prefixes sort folders in lifecycle order: backlog → active → archives.

## Naming & metadata

- **Slugs, no date prefixes:** `flashless-dark-mode`, not `2026-07-18-flashless-dark-mode`.
- **Dates in frontmatter:**

```yaml
---
title: Flashless dark mode
created: 2026-07-18
shipped: 2026-08-02 # added by `specs.sh archive`
---
```

- Status is implied by location — no `status:` field to drift.

## Backlog entry format

3–5 lines: what, why, rough size. Cheap to write, enough to pick from.

```markdown
---
title: Flashless dark mode
created: 2026-07-18
---

Eliminate dark-mode flash on load. Inline script before paint.
Ref: https://www.vbesse.com/en/blog/flashless-dark-mode
Size: S
```

## `specs.sh`

Pure bash + `git mv`, no dependencies. Fails loud on missing slug; refuses to overwrite an existing slug.

| Command                | Effect                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `new <slug> ["title"]` | Create `00_backlog/<slug>.md` from template                         |
| `activate <slug>`      | `git mv` backlog file → `01_active/<slug>/spec.md`                  |
| `archive <slug>`       | `git mv 01_active/<slug>` → `02_archives/<slug>/`, stamp `shipped:` |
| `index`                | Regenerate `INDEX.md` from folder scan                              |

`new`, `activate`, and `archive` call `index` automatically, so `INDEX.md` never drifts.

## INDEX.md

Generated only — never hand-edited. Three sections:

```markdown
# Specs Index

## Active

- [ui-refinements-v2](01_active/ui-refinements-v2/) — design, plan

## Backlog

- [flashless-dark-mode](00_backlog/flashless-dark-mode.md)
- ...

## Done

- [seniority-update](02_archives/seniority-update/) — shipped 2026-07-17
- ...
```

Titles read from frontmatter; artifact list (`design`, `plan`, `notes`) from files present in each folder.

## Migration

1. Pair existing `docs/superpowers/specs/*-design.md` with `docs/superpowers/plans/*.md` by slug → `02_archives/<slug>/design.md` + `plan.md`.
2. `ui-refinements-v2` (in flight) → `01_active/ui-refinements-v2/`.
3. Unpaired one-offs (`site-critique-recommendations`, `ux-copy-review-findings`) → `02_archives/<slug>/notes.md`.
4. Orphan `docs/plans/2026-05-08-api-endpoints-blog-and-playground.md` → `02_archives/api-endpoints-blog-and-playground/plan.md`.
5. Seed `00_backlog/` with the six open ideas: flashless-dark-mode, home-animation-toggle, blog-toc, contact-images-animation, work-about-blog, blog-v2-1.
6. Delete `docs/superpowers/` and `docs/plans/` after migration.
7. Strip date prefixes from migrated filenames; keep the date as `created:` frontmatter.

## Integration with skills

Project `CLAUDE.md` gets a short section: brainstorming writes designs to `.specs/01_active/<slug>/design.md`, writing-plans writes to `.specs/01_active/<slug>/plan.md` (both skills honor user-preference location override). Shipped work is archived via `./.specs/specs.sh archive <slug>`.

## Out of scope (YAGNI)

- No sprint-planning map, sizing columns, or dependency glyphs from the inspiration system.
- No per-story `story.md`/`research.md` split — `spec.md`/`design.md`/`plan.md`/`notes.md` suffice.
- No CI validation of INDEX.md.
