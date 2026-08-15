---
created: 2026-08-06
status: plan — ready to execute
---

# Design System Docs Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the 27 proven rules in `.claude/skills/design-expert/references/ds-documentation.md` to the Figma file `Blog Design System v1.0` — cover stripped to a nav hub, `Foundations · Colors` collapsed to one light+dark-inline table, the `📚 Docs` Elements tier dissolved into five component groups plus a Sections chapter, the three FINDING apologies replaced with real specs, and the sheet passed for readability and visual bugs — then regenerate the Dark sheet and archive the spec.

**Architecture:** All changes are Figma-side via `use_figma`. The Light DOCS frame (`DOCS / Design System — Light`) is the single working surface; the Dark frame is deleted and re-cloned at the end (Task 8), never edited in parallel. The chapter spine changes from `00 Read me → 01 Tokens → 02 Elements → 03 Components → 04 Pages` to `00 Read me → 01 Foundations → 02 Components (5 groups) → 03 Sections → 04 Pages`. Existing `Docs/*` kit components (`ChapterHeader`, `SpecimenCell`, `DecisionCard`, `TokenRow`, `DoDont`) are reused — no new kit masters unless a step says so.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file key `ihWIWmvtQPTWgUxlrVjC2c`). No repo code changes. Verification is `use_figma` read-back assertions plus `get_screenshot`; there is no test runner for Figma work. Commits are plan-side checkbox/notes updates only.

## Global Constraints

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c` (`Blog Design System v1.0`). Never write to `Wf4iomVMYUXlFIBV3Z8bx4` — read-only backup.
- **Skill contract:** every `use_figma` call passes `skillNames: "figma-use"`, uses `return` (never `figma.notify`/`closePlugin`), switches page at most once per call via `await figma.setCurrentPageAsync(page)`, and returns all created/mutated node IDs.
- **Node IDs are volatile.** Every ID below is a hint captured 2026-08-06. Before mutating, re-resolve by **name** and fail loudly (return a `missing` list and stop) if a name is absent. Never blind-write to a hardcoded ID.
- **Specimens must be live instances.** Anything demonstrating a component is `component.createInstance()`. Hand-drawn frames imitating a component are a defect.
- **Decision copy is verbatim.** `.specs/02_archives/design-system-docs/decisions.md` holds every validated caption. Moving a caption is fine; rewording one is a defect. The only captions this plan _replaces_ are the three `FINDING:` sentences (Tasks 4–5), per the design.
- **Settled design rules are inputs.** Radius vocabulary is exactly `full` / `lg` 8px / `0`. Hover is one verb per surface, ≤150ms. Accent budget as captioned. Do not re-litigate.
- **Figma chrome is excluded from audits.** Skip node types `COMPONENT_SET` and `SECTION` in every fill/overflow sweep, or false positives return.
- **Copy tone:** conversational, concrete, no marketing abstractions (see `design-expert/references/copywriting.md`). New connective prose ≤ 2 sentences per caption, per §2.
- **Both themes ship together, Dark is generated.** No hand edits on the Dark frame; Task 8 regenerates it from Light with the `2 Theme` mode reapplied.
- **Single-sheet decision stands** (design.md "Single-sheet decision"): chapters stay on one DOCS sheet; §1 R4's intent is met by a fixed chapter/specimen skeleton, not tabs.
- **Fonts:** load before any text mutation — `Bubbler One Regular`, `IBM Plex Sans Regular/SemiBold/Medium`, `Fira Code Regular`. Skipping throws `Cannot write to node with unloaded font`.

## Reference data (hints, captured 2026-08-06 — re-resolve by name)

| Thing                 | Name                                   | ID hint                                    |
| --------------------- | -------------------------------------- | ------------------------------------------ |
| Cover page            | `📖 Cover`                             | `0:1`                                      |
| Docs page             | `📚 Docs`                              | `2545:671`                                 |
| Docs Light frame      | `DOCS / Design System — Light`         | `2545:672`                                 |
| Docs Dark frame       | `DOCS / Design System — Dark`          | `2547:7597`                                |
| Foundations page      | `🎨 Foundations`                       | `5:14`                                     |
| Colors frame          | `Foundations · Colors`                 | `6:2` (Light grid `6:4`, Dark grid `6:39`) |
| Components page       | `🧩 Components`                        | `461:759`                                  |
| Pages page            | `📄 Pages`                             | `2558:18264`                               |
| Theme collection      | `2 Theme` (Light/Dark modes)           | `VariableCollectionId:3:2`                 |
| Primitives collection | `1 Primitives` (mode `2013:0`)         | `VariableCollectionId:2013:2`              |
| Responsive collection | `3 Responsive` (Desktop/Tablet/Mobile) | `VariableCollectionId:2245:42`             |

**Docs kit masters (on `📚 Docs`, inside `SECTION / Docs kit`):** `Docs/ChapterHeader`, `Docs/SpecimenCell` (children: `label`, `slot`, `caption`), `Docs/DecisionCard` (variant `layer` = Chrome | Content | Hand | All), `Docs/TokenRow`, `Docs/DoDont`.

**Current chapters on the Light frame (by name):** `CHAPTER / 00 Read me`, `CHAPTER / 01 Tokens`, `CHAPTER / 02 Elements`, `CHAPTER / 03 Components`, `CHAPTER / 04 Pages`.

**Re-home mapping (Task 3 uses this verbatim).** Specimen cells are `Docs/SpecimenCell` instances found by their `label` child's characters:

| New home                                     | Specimen labels moved there                                                                                                      | Decision cards moved there                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `02 Components` chapter level (above groups) | —                                                                                                                                | Hover (9-row rest/hover table)                         |
| Group `Buttons`                              | `Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/TextCTA`, `Link/Icon`, `ThemeToggle`, `MotionToggle`, `Icon` (asset set) | Buttons                                                |
| Group `Navigation`                           | `NavLink`, `NavLinkHome`                                                                                                         | —                                                      |
| Group `Metadata & Text`                      | `H1`, `H2`, `PreviewTitle`, `PageDescription`, `PostMetadataTime`, `PostMetadataTopic`, `SerieMeta`                              | Numbers                                                |
| Group `Cards`                                | `PostRow`, `SerieCard`, `PostCardPreviewBig`, `PostCardPreviewSmall`, `WorkCardPreviewSmall`                                     | Border                                                 |
| Group `Hero & Contact`                       | `HeroText`, `HeroAnimation`, `ContactContent`                                                                                    | Illustration (with its 5 SVG specimens)                |
| `CHAPTER / 03 Sections`                      | `Header`, `Footer`, `Hero`, `BlogPreviewSection`, `ArchiveTable`, `SerieCardList`, `WorkPreviewSection`, `ContactPreviewSection` | Backgrounds                                            |
| `CHAPTER / 01 Foundations` (Task 4)          | Icons sizing row (16/20/24)                                                                                                      | Radius, Type, Spacing, Colour, Motion (stay/land here) |

The `Icon` asset set lands in `Buttons` because `Link/Icon` and the toggles instantiate it there — it is chrome. Foundations keeps only the _sizing rule_ (16/20/24), per the design's dual-home requirement.

---
