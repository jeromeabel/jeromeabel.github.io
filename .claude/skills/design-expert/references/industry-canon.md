# Industry Canon — external design-system knowledge

Status: distilled 2026-08-08 from Figma resource library (3 articles), Apple HIG
foundations (Color, Typography, Layout, Accessibility, Motion), Uber Base
(system principles, design language, components, patterns), and one Figma
community branding deck ("Sync").

Unlike the other reference files, this is **not project-settled decisions** —
it is the industry baseline to reason from and cite when reviewing or extending
the system. Where canon and a settled project rule conflict, the project rule
wins (it was benchmarked deliberately — see `benchmarks.md`).

## 1. What separates benchmark systems from component dumps

Recurring trio across every cited exemplar: **tokens (incl. dark mode) →
components → usage docs with content + a11y guidance**. Docs quality is the
differentiator.

| System | The practice worth copying |
|---|---|
| IBM Carbon | Every component documented on three layers: design intent, code, do/don't usage |
| Shopify Polaris | Content/microcopy guidelines live beside components — words are part of the system |
| Uber Base | Tiny core (type, color, icons, spacing); everything composes from it |
| Material 3 / TapTap | Dark mode modeled as tokens/modes, never per-component overrides |
| TapTap | Page-level composition examples shipped, not only isolated components |
| Apple HIG | Principles-and-patterns docs, not just component specs |
| Atlassian | Governance across products; deviation is a deliberate, justified act |

Accessibility in the best systems is never its own chapter — it's a property of
every component spec (contrast, keyboard, hit area, alt text, tab order).

## 2. Seven UI principles (Figma) — 1-second review checklist

1. **Hierarchy** — importance visible at a glance: size/weight/contrast/position.
2. **Progressive disclosure** — reveal per step; always show "where am I".
3. **Consistency** — same element, same look/behavior everywhere; the system is the enforcement mechanism.
4. **Contrast** — loudest color marks the most important action, nothing else.
5. **Accessibility** — WCAG contrast, keyboard-only path, generous hit areas, alt text.
6. **Proximity** — related things adjacent; dangerous things isolated.
7. **Alignment** — everything on the grid; off-grid needs a reason.

Checklist form: *Can the eye rank importance in 1 second? Anything shown before
it's needed? Any element behaving differently on another page? Passes WCAG +
keyboard-only? Related adjacent, dangerous isolated? Anything off-grid?*

## 3. Apple HIG foundations (transferable to web)

### Hierarchy
- **Three-tier everything**: backgrounds primary/secondary/tertiary; text label →
  secondary → tertiary → quaternary. An explicit token ladder, not ad-hoc grays.
- Place by reading order: important items top + leading side.
- Hierarchy must survive text scaling — enlarge the content people care about,
  keep chrome (labels, timestamps) put.

### Color semantics
- Name colors by **purpose, never appearance**; never repurpose (a background
  token is never a text color).
- **One color = one meaning** — if accent marks interactive, it can't also style
  static text. (= our accent-budget rule, independently confirmed.)
- Every custom color ships ≥3 variants: light, dark, increased-contrast.
- Never color alone — pair state color with label or glyph (fear red-green,
  blue-orange pairings).
- Emphasis color on a button's *background*, not its label; at most one
  emphasized control per group.

### Typography scale logic
- Text style = role-named bundle of size + weight + leading.
- Key trick: Headline and Body share the same size (17pt) — near-body hierarchy
  comes from **weight**, size jumps are reserved for title tiers. Each style has
  an "emphasized" weight: a second hierarchy axis without new sizes.
- Floors: body ≈17px, absolute minimum ≈11pt (≈14-15px web). Avoid
  Ultralight/Thin/Light weights.
- Leading: loose for wide columns/long passages; tight only for 1-2 line
  height-constrained rows, never 3+ lines.

### Spacing & layout
- Group with **negative space first**; background shapes/separators second.
- Breathing room: ~12pt padding around bezeled elements, ~24pt around
  borderless ones. Spacing between controls prevents mis-taps.
- Constrain text measure for readability; content bleeds full width, controls
  sit inset within margins (explicit warning against full-width buttons).
- Design full layout first, go compact as late as possible; hide tertiary
  panes first.

### Motion restraint (= our "quiet motion")
- Purposeful only; brief-and-precise beats prominent.
- **No animation on frequent interactions** (hover flourishes tax every use).
- Cancellable; never the only channel for information.
- Reduced-motion recipe: replace x/y/z translations with fades, tighten
  springs, avoid z-depth and blur animation.

### Accessibility numbers
- Contrast: text ≤17pt → **4.5:1**; ≥18pt or bold → **3:1**. Check both modes.
- Touch targets: **44×44** benchmark, 28×28 hard floor.
- Text scaling to **200%** without truncation; layouts stack, columns drop,
  hierarchy stays intact.
- No auto-dismiss timers; autoplay needs visible stop; full keyboard
  operability.

## 4. Uber Base — structural model

### Color token model (clearest in the industry)
- **Ramps** (24-step tonal per hue) = primitives; never applied directly.
- **Four families** with hard scope: Neutral (structure), System communication
  (success/warning/error/info only), Accent (brand moments), Full spectrum
  (illustrations only — never UI).
- **Three roles** where color applies: Background, Content (text/icons),
  Border/Dividers.
- **Three token types**: Primitive (raw, doesn't adapt to dark mode, assets
  only) → Semantic (intent-named, auto light/dark, all UI) → Control
  (component-specific when semantic is too general, e.g. `tag-background`).
- **Naming grammar**, slots left-to-right, omitted slot = default:
  `category-family-role-context-hierarchy-variant-state`.
- Documented **always-valid pairings** (`background-base`+`content-primary`,
  `[status]-background-subtle`+`[status]-content-onsubtle`…) — pairing tables
  gate token release along with WCAG contrast.

### Typography
- Four roles: Display, Heading, Label, Paragraph; sizes XSmall-Large.
- Modular scale: base 14 × 1.125; line-height = size × 1.45 **rounded to 4px
  baseline**; Mono ramp for money/numbers (equal-width digits align).
- Principles: *Go big, Less is more, Simple semantics*.

### Motion & icons
- Motion principles: Accessible, Purposeful, Consistent, Contextual; "transition
  every change"; atomic pattern vocabulary (enter/exit via
  opacity/scale/position/mask).
- Icons: functional (pair with text labels; icon-only buttons only for widely
  recognized or reversible actions) vs decorative. Outlined default, Filled
  exceptional.

### Component doc anatomy (tabbed, per component)
1. **Usage** — per-component principles, anatomy, variants/hierarchy, behavior
   (touch targets, states, truncation), breakpoints, examples, related.
2. **Content** — label style, per-variant copy rules.
3. **Specs** — metrics, token mapping, screen-reader expectations.
4. **Status** — lifecycle + platform availability.

### Components vs patterns boundary
- Component = concrete UI object with anatomy and specs.
- Pattern = cross-component behavioral convention (only four: Modality,
  Feedback, States, Inputting data). "States" is a shared vocabulary across all
  actionable components: preloading, enabled, disabled, hover, focused,
  pressed, active, warning, error, loading.
- Pattern docs are lighter: definition → usage → behavior → external references
  (NN/g, HIG) → related components. No anatomy/specs tabs.

### Governance
- Page-status tags: Current / Transitional / Beta / Future / Deprecated.
- Versioned styleguide, per-page changelogs, "What's new" page.
- Principles are **distributed** — each foundation page carries its own local
  principles block, no grand centralized manifesto.

## 5. Presentation techniques (Sync branding deck)

The community file is a branding-deck template, not a DS reference — borrow its
presentation moves for docs/specimen pages, not its structure:

- One idea per slide/frame; density lives in cards, not frame count.
- Canvas-as-matrix: rows = chapters, slides left-to-right; divider frames reuse
  cover style for wayfinding; numbered TOC is itself a designed frame.
- **Rationale beside artifact** — every visual pairs with a short *why*
  paragraph. Tokens without rationale is the anti-pattern.
- **Swatch-as-spec-card**: name + values set *on* the swatch color —
  self-demonstrating contrast.
- Giant "Aa" specimen before any weight/size table.
- Consistent chrome (title rail, footer rule + frame number) makes any
  screenshot attributable.
- End with in-context mockups — close the loop from rationale to proof.

## 6. HIG documentation style as a writing model

- **Bold imperative lead + rationale paragraph** — skimmable as a checklist,
  self-justifying when read fully.
- **Prefer / Avoid / Consider / Make sure** verb taxonomy encodes rule strength
  without a severity legend.
- Numbers live in tables; prose stays principle-level.
- Fixed page anatomy (overview → best practices → sections → resources →
  changelog) so a fact always has a predictable home.
- Ground rules in a concrete negative example, not abstract exhortation.

## 7. Canon ↔ this project (reconciliation)

- Accent budget (rule 2) = HIG "one color one meaning" + Figma contrast
  principle + Base Accent-family scoping. Canon-confirmed.
- Quiet motion = HIG "no animation on frequent interactions" + Base
  Accessible/Purposeful. Canon-confirmed.
- One hover gesture (rule 4) = HIG brief-and-precise. Canon-confirmed.
- Metadata layer (rule 6) = HIG weight-not-size hierarchy near body size.
- Our 3 collections ≈ Base Primitive/Semantic split; we have no Control tier —
  add component-scoped tokens only when a semantic token proves too general,
  never preemptively.
- Gaps worth considering (not settled, raise before adopting): documented
  token **pairings** table (Base), per-component **states vocabulary**
  (Base patterns), increased-contrast variant (HIG), 44px touch-target audit
  on mobile nav/chips.
