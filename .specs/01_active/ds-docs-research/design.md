---
created: 2026-08-06
title: DS docs expert research — prove documentation structure, capture into design-expert
---

# Design — ds-docs-research

Sub-project 1 of 3 in the design-system-docs v2 round. Decomposition decided 2026-08-06:

1. **ds-docs-research** (this spec) — expert research + knowledge capture
2. ds-docs-v2 — rebuild `📚 Design system` doc applying the captured rules
3. ds-pages-responsive — component-internal responsive fixes + HeroAnimation/Contact SVG questions

## Goal

Prove or refute the structure and content conventions of the current
`📚 Design system` Figma doc (`Blog Design System v1.0`, node `2545-671`) against
real-world design-system documentation practice. Capture the durable knowledge into
the `design-expert` skill so the v2 rebuild — and any future documentation work —
cites rules with evidence instead of taste.

Issues the research must address (from the 2026-08-06 issue list):

- Doc is unreadable: too long, not enough space, needs chunking
- Token **usage** matters more than token values
- Light + dark shown everywhere feels redundant — need a proven single-source-of-truth policy
- Element-level info inside the doc vs inside Components is overwhelming — need a proven grouping model (text usages, buttons, cards, images, icons, …)
- Design decisions must be carried in the doc and be actionable (e.g. radius → component role mapping)
- Three open FINDINGs need documented approaches for non-instantiable concepts: focus-ring/CTA-accent states, spacing ladder, duration/easing tokens
- Cover page: simplify, more visual, communicate status
- Redundancy across doc pages

## Research protocol

Five parallel `general-purpose` agents (WebSearch + WebFetch), one per question cluster:

| # | Cluster | Core question |
|---|---------|---------------|
| Q1 | IA / structure | How do real systems order and granulate docs (foundations → components → patterns)? Where does element-level info live — dedicated chapter or grouped sets? |
| Q2 | Readability | Page length limits, chunking, scanning patterns, hierarchy, whitespace. What makes a docs page scannable (NN/g research)? |
| Q3 | Token documentation | Usage-first vs value-first token presentation. How do systems document light/dark — duplicate everything, or single source with mode shown only where it differs? |
| Q4 | Decision records | How do systems carry actionable design decisions (do/don't, rationale, cross-references)? How do they document non-instantiable concepts: spacing ladders, motion/duration tokens, focus rings? |
| Q5 | Cover / status | Cover-page patterns: status badges, versioning, what a landing page of a DS doc shows. |

Each agent must:

- Survey **≥4 named systems** from: Polaris, Carbon, Material 3, Primer, Spectrum, Atlassian, Base Web, Fluent
- Consult **≥1 authority**: Nielsen Norman Group, Nathan Curtis / EightShapes, zeroheight (design-system reports)
- Return rules as structured findings **with source URLs**
- Mark each finding's confidence: consensus (≥2 sources) vs single-source

## Evidence bar

- A rule enters the reference only with **≥2 independent systems/authorities** behind it.
- Single-source items may appear, marked `(weak)`.
- No unsourced claims. No "best practice" without a named source.

## Output contract

- **`.claude/skills/design-expert/references/ds-documentation.md`** — the deliverable.
  ~8–15K, matching sibling references. Rule format:
  - **Rule** — the actionable statement
  - **Why** — the reasoning the sources give
  - **Evidence** — system/authority + URL
  - **Applies here** — mapping to a concrete issue from the list above
- **`design-expert/SKILL.md`** — one pointer line added for the new reference.
- **`.specs/01_active/ds-docs-research/notes.md`** — raw agent reports, kept for audit.

## Verification

Self-check before done:

1. Every rule has ≥1 source; consensus rules have ≥2.
2. Every issue in the Goal list is touched by ≥1 rule.
3. Spot-check 3 cited URLs — they actually say what is claimed.

## Out of scope

- No Figma edits of any kind.
- No docs-page redesign (sub-project 2 consumes this reference).
- No component or responsive fixes (sub-project 3).
- HeroAnimation/Contact SVG handling questions — deferred to sub-project 3.
