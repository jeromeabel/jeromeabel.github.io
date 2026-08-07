---
shipped: 2026-08-07
created: 2026-08-06
---

# Design system docs restructure — design

## What

Apply the 27 evidence-based rules in `.claude/skills/design-expert/references/ds-documentation.md`
(source: `.specs/02_archives/ds-docs-research/`) to the Figma file `Blog Design System v1.0`
(`ihWIWmvtQPTWgUxlrVjC2c`), closing the gaps identified in the user's review of the previously
shipped `.specs/02_archives/design-system-docs/` output (`.specs/02_archives/design-system-docs/decisions.md`,
`spec.md`, `plan.md`).

## Why

The prior restructure (archived, shipped 2026-08-06) built the current `📚 Docs` page
(`00 Read me` → `01 Tokens` → `02 Elements` → `03 Components` → `04 Pages`) without a proven
methodology behind its information architecture or readability treatment. A follow-up review
against the doc surfaced concrete structural problems (see mapping below). `ds-docs-research`
was run specifically to give this pass a sourced answer instead of another unproven opinion.

## Scope

In scope: Cover page (`0:1`), `📚 Docs` page (`2545:671`, Light `2545:672` + Dark `2547:7597`),
and `🎨 Foundations · Colors` (`6:2`) — the last one folded in because it's the literal source of
the light/dark-table redundancy complaint, confirmed live (see below).

Out of scope (separate follow-up, tracked in `artistic-direction` memory as open items):
Pages responsive/visual bugs (mobile overflow inside component internals), HeroAnimation/Contact
SVG usage questions, hero-visibility-on-mobile decision.

## Issue → rule mapping

| Review issue | Rule(s) in `ds-documentation.md` | Fix |
| --- | --- | --- |
| Cover: simplify / more visual | §5 — cover is a nav hub not a portfolio; status shown per-component, never on cover; version folded into name/URL | Strip any status/changelog chrome off Cover; keep it routing into Foundations/Components/Pages |
| "structure needs proving by experts" | This is what `ds-docs-research` produced | N/A — input to every other row |
| "unreadable, too long, not enough space" | §2 — headings are the scan surface, size jump 2–4 steps, ~6th-grade/50–75 char lines; §1 R4 — tab template, one topic/page, 2-level disclosure cap | Rewrite headings/prose per §2; apply chapter/section chunking per §1 R4 where the format allows (single-sheet format is kept — see "Single-sheet decision" below) |
| "token usage more important than values" | §3 R1 — lead token rows with semantic name/role, value alongside not primary | Applies where raw token tables exist — confirmed live only on Foundations · Colors (see redundancy row); DOCS page `Colour` section already leads with role, no change needed there |
| "redundant light/dark, overwhelming" | §3 R3 — one row/one source of truth per token, light+dark shown inline, not duplicated tables per theme | **Confirmed live**: `Foundations · Colors` (`6:2`) renders two full separate 12-swatch grids (`Light` frame `6:4`, `Dark` frame `6:39`) for the same 12 tokens. Rebuild as one 12-row table, each row = token name/role + Light swatch+hex + Dark swatch+hex inline. Whole-page Light/Dark frame duplication on the DOCS sheet itself is **not** this violation — that's full-assembly cross-theme proofing, same pattern already used by the Pages chapter; keep it |
| "check redundancies with other pages" | §1 R1, R5 — tokens defined once upstream, component pages link to a general token reference rather than re-embedding | DOCS `01 Foundations` chapter cross-references the `Foundations · Colors`/`Typography` pages instead of re-specifying values |
| Elements vs Components, "over-whelming", "group into meaningful sets" | §1 R2 — no separate Elements/Primitives tier; one flat Components list; shared stylistic properties (color, type, icon, motion, spacing) live in Foundations | Dissolve `02 Elements` chapter. New spine: `00 Read me` → `01 Foundations` (Colour, Type, Spacing, Radius, Motion, **+ Icons** — icon sizing is a shared stylistic property) → `02 Components` (flat, grouped into **Buttons**, **Navigation**, **Metadata & Text**, **Cards**, **Hero & Contact**) → `03 Sections` (Header/Footer/Hero/BlogPreviewSection/ArchiveTable/SerieCardList/WorkPreviewSection/ContactPreviewSection — kept as its own chapter; §1 R3 says Components and Patterns are legitimately separate content types, and these are composite assemblies, not atomic components) → `04 Pages` (unchanged) |
| "design decisions must be carried in this doc" (radius example) | §4 R2, R4 — component-level do/dont stays on the component; system-wide rationale on foundations pages, stated tersely; cross-reference a token scale to components via a use-case column (weak) | Keep the existing verbatim decision captions (`decisions.md`) re-homed to the new chapter locations; radius/spacing cross-references framed as `token → role` (already the pattern in the archived decisions, keep it) |
| FINDING: no instantiable focus-ring/CTA-accent variant | §4 R5 (weak) — derive a dependent style via a token formula; state focus-indicator removal as a hard WCAG "never" rule, not a gallery | Replace the apology with: formula (`focus-ring radius = base radius + 2px`) + hard rule text ("never remove a focus indicator") |
| FINDING: no instantiable spacing-ladder component | §4 R5 — spacing scales: specs table (token, multiplier, rem, px, swatch) + short mechanical rationale, not an essay | Replace the text-only row with a real table rendered from the `3 Responsive`/primitive resolved values |
| FINDING: no instantiable duration/easing component | §4 R6 — motion tokens: small specs table tied to a named philosophy, "why" as metaphor not bare numbers | Replace the apology with a specs table (duration/easing values) + a named philosophy line (e.g. "quick for feedback, eased for movement" — invent a short in-house name, don't borrow Carbon's terms verbatim) |
| Visual bugs (content outside frame, white background) | — (execution, not a rule) | Fixed directly during rebuild: any auto-layout frame left at default white fill gets `fills=[]` or the correct token binding; any content overflowing its frame gets resized/re-laid-out |

## Single-sheet decision

§1 R4's tab template (Usage/Style/Code/Accessibility, one topic per page) assumes a web docs
site with real navigation. Figma has no tabs and no per-section URLs — the only chunking units
are pages and frames, and the file already chunks by page (Cover / `📚 Docs` / Foundations /
Components / Pages). Splitting the DOCS sheet into one Figma page per chapter would trade one
long scroll for five page-switches with no search or breadcrumb between them, which §2's
scanning evidence weighs against. So the deviation is deliberate: keep the single DOCS sheet,
and satisfy R4's *intent* (predictable per-topic structure, ≤2 disclosure levels) with a fixed
chapter template inside the sheet — every chapter gets the same `numbered title → intro line →
sections` skeleton, and every component specimen the same `specimen → spec table → do/don't`
skeleton. R4's literal tab mechanism applies only if this doc ever moves to a web format.

## Non-goals

- No repo/code changes. Figma only.
- No change to settled design rules (radius vocabulary, hover verbs, accent budget, button
  vocabulary) — those are inputs from `artistic-direction`, not up for revision here.
- No work on Pages responsive bugs, HeroAnimation/Contact SVG, or mobile hero-visibility —
  explicitly deferred per user decision.

## Risks / open items carried into the plan

- Foundations · Colors rebuild touches a page not originally scoped — contained (12 tokens, one
  table), but the implementing plan should re-resolve node IDs by name before writing, per the
  same discipline the archived plan used (node IDs are volatile).
- Dissolving the Elements chapter means re-homing ~17 masters' specimens into the new Components
  groups — mechanical but touches most of the sheet; plan should size this as the largest single
  task.
- "Icons" moving from Elements into Foundations: the Icon *component itself* (the flat asset
  library, e.g. `arrow-right`) still needs a home in the flat Components list too, since it's
  instantiable — Foundations documents icon *sizing/usage rules* (16/20/24), Components documents
  the icon set as an asset. The implementing plan must not drop one or the other.
