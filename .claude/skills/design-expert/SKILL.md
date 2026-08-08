---
name: design-expert
description: Use when designing, changing, or reviewing UI for this site — cards, chips, badges, hover states, accent colors, borders, metadata display, topic/serie taxonomy, responsive layout — or when reviewing Figma frames (Blog Design System v1.0) for Home, Blog, Work, or About pages. Also use before adding any new component or visual variant, when unsure whether an element should be teal, boxed, bordered, or uppercase, and when working on Figma variable collections, token architecture, design-system documentation, or preparing the library for Figma AI.
---

# Design Expert

Captured product-design, UI/UX, and design-system knowledge for jeromeabel.net.
These are settled decisions — apply them; don't re-debate them per component.
(Exception: the taxonomy model is a recommendation pending user sign-off — see
references/taxonomy.md status line. The three knowledge files —
industry-canon, figma-variables-method, figma-ai-training — are industry
baseline to reason from, not settled decisions; project rules win on conflict.)
If a task genuinely needs to break a rule, say so explicitly and record the change here.

## Core Decision Rules

1. **One chip per card/row.** A serie post shows the serie chip (folder icon + serie name + `2/5`). A standalone post shows its topic chip. Never both — serie membership is the stronger signal and implies the topic. Consistency comes from the chip occupying the same slot with the same typography, not from identical semantics.
2. **Accent has a fixed budget.** Teal appears at rest only on: serie chips, section CTAs (`All posts →`), active nav, focus outlines. Titles never get accent (rest or hover repaint) — hover uses underline decoration instead. Topic labels, dates, read time, `6 parts` meta: neutral muted. Violet/pink is not part of the system. Benchmark basis: `references/benchmarks.md`.
3. **Border = aggregate entity.** SerieCard gets border + padding (it packages image, meta, title, description, date range — a container of parts). Post preview cards are borderless (the image is the frame). PostRow uses hairline `border-bottom` only (list idiom).
4. **One hover gesture per surface.** Row → bg tint. Borderless card → title underline (teal decoration, text color unchanged) + slow image scale(1.02), coupled. SerieCard → neutral border lighten + underline + faint bg lift. Never stack independent hover signals; never invent per-component behavior. Reduced motion: drop scale, keep color changes.
5. **Display font is page-level only.** The display/techy font is for the page H1 (`BLOG`). Card and row titles use the sans, bold. Display font at card size kills scanning.
6. **Metadata is the third reading layer.** Mono, uppercase, ~12px, muted — but ≥ 4.5:1 contrast (WCAG AA small text). Pattern: cards `May 12, 2026 · 18 min` — rows `May 12 · 18 min` (year lives in the group gutter). Uppercase only for short strings, never sentences.
7. **Folder icon = serie, and nothing else.** It carries the "belongs to a collection" meaning. Topics get no icon.

## Taxonomy (business rules)

See [references/taxonomy.md](references/taxonomy.md). Summary: one `topic` enum value per post (6 values), optional `stack` array for frameworks, series carry a topic, serie posts inherit it. Topic is metadata today, filter later (maybe).

## Reference Files

| File | Load when |
|---|---|
| [references/product-design.md](references/product-design.md) | Deciding page structure, featured logic, what content goes where, adding/cutting features |
| [references/ui-system.md](references/ui-system.md) | Styling any component: full rules for chips, cards, rows, hover, color, type, responsive |
| [references/copywriting.md](references/copywriting.md) | Writing UI copy: section labels, card descriptions, serie descriptions, empty states |
| [references/taxonomy.md](references/taxonomy.md) | Anything touching topic, serie, stack, featured fields or their display |
| [references/benchmarks.md](references/benchmarks.md) | Questioning accent/hover/chip/image rules — the 8-blog + 5-design-system survey behind them (2026-08-04) |
| [references/artistic-direction.md](references/artistic-direction.md) | Anything touching signature elements (hand-drawn SVGs, hero shapes, ambient motion, gradients) or the button/radius/hover system — 14-portfolio survey + motion-authority audit; SETTLED and executed in Figma 2026-08-05 (three-layer visual language — Chrome/Content/Hand; dashed removed everywhere, not just decided; radius trio `full`/`lg`/`0` enforced; button vocabulary = 4 Figma components / 3 styles; hover-verb table authoritative in `design.md ### Hover`) |
| [references/ds-documentation.md](references/ds-documentation.md) | Structuring, writing, or reviewing design-system documentation (Figma docs pages or web): IA/chapter order, page chunking, token tables, light/dark policy, decision records, cover/status — 5-cluster web survey (2026-08-06) |
| [references/industry-canon.md](references/industry-canon.md) | Needing the industry baseline: HIG foundations (a11y numbers, type/weight hierarchy, motion restraint), Uber Base token model (families/roles/types, naming grammar, component-doc anatomy, patterns boundary), what makes benchmark systems (Carbon/Polaris), doc-writing style, presentation techniques — distilled 2026-08-08. **Knowledge, not settled decisions** — project rules win on conflict |
| [references/figma-variables-method.md](references/figma-variables-method.md) | Touching Figma variable collections (architecture, naming, modes, ramps, jumper variables, dark-mode workflow) or considering Plugin API tooling for token sync/audit (`figma.variables` surface, what plugins can't do, drift-toolchain opportunities) |
| [references/figma-ai-training.md](references/figma-ai-training.md) | Preparing the Figma library for AI generation (Figma AI skills workflow, library-readiness checklist, prompting patterns and ROI) |

**Long-form post writing** → use the `blog-post` skill, not this one.
**Figma verification tooling** → `figma-verify` skill / `scripts/figma/`.

## Review Checklist (when reviewing designs)

- Hierarchy: can you name the 1st/2nd/3rd read of each card at arm's length?
- One chip per card/row? Accent only on interactive elements?
- Border usage matches aggregate rule? Hover follows the single primitive?
- Metadata contrast ≥ AA? Display font confined to H1?
- Mock data realistic (no repeated titles/descriptions — they hide layout bugs like unequal text lengths)?
- Responsive story stated for each grid (1920 → 1024 → 640)?
- Copy: concrete, no marketing abstractions, numbers have context?

## Common Mistakes

| Mistake | Fix |
|---|---|
| Serie chip + topic chip on same row | Serie chip only |
| Topic label styled like a button (border + hover + pointer, but does nothing) | Muted bg-only box or plain text — zero interactive affordances until filters exist |
| Title turns teal on hover | Underline decoration appears instead — teal title collides with adjacent teal serie chip |
| Two hover signals stacked on one surface | One coordinated gesture (0/8 benchmark sites stack them) |
| Image dimmed/tinted at rest, or brightness/tint on hover | Full brightness at rest; hover = slow slight scale or nothing |
| Accent on passive meta (`6 parts`, dates) | Muted — accent falsely promises a click target |
| Two accents (teal + violet) on same-role elements | Single teal accent |
| Border added to home post cards "for consistency" | Consistency is per-role, not global — preview cards stay borderless |
| Display font on card titles | Sans bold |
| Identical placeholder text across cards in mocks | Vary lengths to test wrapping |
