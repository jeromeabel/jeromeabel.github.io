# Design-system documentation — proven rules

Captured 2026-08-06 from a 5-cluster survey of DS docs (Polaris, Carbon, Material 3, Primer,
Spectrum, Atlassian) + NN/g, EightShapes, zeroheight. Raw: `.specs/02_archives/ds-docs-research/notes.md`.
Evidence bar: ≥2 sources unless `(weak)`.

## How to use this file
Load when structuring, writing, or reviewing DS docs (Figma or web). Each rule: statement,
why, evidence, where it bites in `📚 Design system`.

## 1. Information architecture

### Rule: Foundations/tokens first, then Components; Patterns can precede Components as a task-first alternative
- **Why:** Avoids forward references; patterns-first signals goal-oriented nav.
- **Evidence:** IBM Carbon (v10 docs) — https://v10.carbondesignsystem.com/designing/get-started/; Polaris — https://polaris-react.shopify.com/design; Primer — https://primer.style/product/getting-started
- **Applies here:** Cross-page redundancy — tokens defined once, upstream.

### Rule: No separate Elements/Primitives tier — one flat Components list; shared stylistic properties (color, type, icon, motion, spacing) live in Foundations
- **Why:** The elements/components boundary is subjective; shared properties belong once.
- **Evidence:** Curtis/EightShapes — https://medium.com/eightshapes-llc/on-classification-in-design-systems-6b33b97f4a8f; Atlassian Foundations — https://atlassian.design/foundations
- **Applies here:** Element-level info vs. Components overwhelming — the grouping model.

### Rule: Components and Patterns are separate content types (prescriptive/coded vs. principled guidance); some fragmentation across design/code tools is normal
- **Why:** A component ships as code, a pattern doesn't have to.
- **Evidence:** Curtis/EightShapes — https://medium.com/eightshapes-llc/on-classification-in-design-systems-6b33b97f4a8f; NN/g — https://www.nngroup.com/articles/design-systems-101/; fragmentation (weak): zeroheight — https://zeroheight.com/how-we-document/
- **Applies here:** Redundancy across pages.

### Rule: Chunk component pages with a fixed tab template (Usage/Style/Code/A11y); split one component-or-topic per page; cap disclosure at two levels
- **Why:** Different audiences read at different times; beyond two levels readers get lost.
- **Evidence:** GitHub Primer — https://primer.style/components/button; IBM Carbon — https://carbondesignsystem.com/contributing/documentation/; page-split (weak): Curtis — https://medium.com/eightshapes-llc/component-specifications-1492ca4c94c; 2-level cap (weak): NN/g — https://www.nngroup.com/articles/progressive-disclosure/
- **Applies here:** Doc too long — the primary chunking mechanism.

## 2. Readability & chunking

### Rule: Headings are the primary scan surface — good headings turn F-pattern skimming (a failure state, no cues) into effective "layer-cake" scanning
- **Why:** F-pattern appears "in the absence of subheadings and bullets"; layer-cake is "the most effective way to scan."
- **Evidence:** NN/g — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/, https://www.nngroup.com/articles/layer-cake-pattern-scanning/; Fluent 2 — https://fluent2.microsoft.design/content-design
- **Applies here:** Doc unreadable — front-load info-rich headings, cut empty prose.

### Rule (weak): Give headings a visible size jump (2–4 steps, ≤2x body); write short sentences targeting ~6th-grade reading level, 50–75 char lines
- **Why:** A subtle size difference doesn't register as hierarchy; sentence length matters more than vocab.
- **Evidence:** Atlassian Design — https://atlassian.design/foundations/typography-beta/applying-typography/; Adobe Spectrum — https://spectrum.adobe.com/page/writing-for-readability/
- **Applies here:** Doc unreadable, not enough space.

### Rule (weak): Component pages: Intro → Examples → Design guidance → Code, Examples load-bearing; Figma-canvas text stays to one sentence + link
- **Why:** Readers absorb a component from examples; canvas text is read only at point of use.
- **Evidence:** Curtis/EightShapes — https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015; designproject.io — https://designproject.io/blog/best-practices-design-system/
- **Applies here:** Doc chunking — in-page order and a Figma-vs-web split.

### Rule (weak): Launch usable-but-incomplete documentation and expand it over releases, rather than front-loading exhaustive documentation
- **Why:** Over-documenting up front delays shipping.
- **Evidence:** zeroheight — https://zeroheight.com/blog/how-to-document-your-design-system-components/
- **Applies here:** Doc too long — argues against covering everything at once.

### Rule (weak): Scannable structure (headings/lists/plain language) is also an error-prevention measure, not just a scanning-speed one
- **Why:** Poor scannability causes user mistakes, not just slower reading.
- **Evidence:** Google Material 3 — https://m3.material.io/foundations/content-design/style-guide
- **Applies here:** Doc unreadable — an extra reason to prioritize structure.

## 3. Token documentation

### Rule: Lead token tables with the token's semantic name/role, not the raw value — keep the resolved value visible alongside it in the same row
- **Why:** Readers pick tokens by intent; value is theme-dependent, so it can't be the key.
- **Evidence:** IBM Carbon — https://carbondesignsystem.com/elements/color/tokens/; GitHub Primer — https://primer.style/primitives/colors
- **Applies here:** Token usage over values — the exact table-shape fix.

### Rule: Mark primitives reference-only ("never use directly"); document a strict chain — primitive → semantic/alias → component
- **Why:** Direct primitive use breaks theming; the chain lets a theme re-point without touching code.
- **Evidence:** GitHub Primer — https://primer.style/product/getting-started/foundations/color-usage/; Material 3 — https://m3.material.io/foundations/design-tokens/overview
- **Applies here:** Token usage over values — the chain is the usage model.

### Rule: One row/one source of truth per token — light/dark values shown inline in that row, not duplicated tables per theme
- **Why:** A table per theme doubles maintenance, invites drift; role is mode-independent.
- **Evidence:** Adobe Spectrum — https://opensource.adobe.com/spectrum-design-data/tokens/color-aliases/; Atlassian Design — https://atlassian.design/foundations/color
- **Applies here:** Light+dark shown everywhere feels redundant — the single-source-of-truth fix.

### Rule: Name tokens with structured segments (namespace/property/role/state); scope new tokens locally first, promote once reused
- **Why:** A predictable name signals purpose; local-first scoping keeps globals small.
- **Evidence:** Atlassian — https://atlassian.design/foundations/tokens/design-tokens; Curtis/EightShapes — https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676
- **Applies here:** Token usage over values; actionable for growing the token set.

### Rule: Component pages link to a general token reference rather than embedding full tables; token architecture is its own evaluated maturity dimension
- **Why:** Avoids duplicating specs that go stale; token architecture is worth assessing alone.
- **Evidence:** GitHub Primer — https://primer.style/product/components/button/react/; NN/g — https://www.nngroup.com/articles/design-system-maturity/
- **Applies here:** Redundancy — tokens live once, referenced not repeated.

## 4. Decision records & non-instantiable concepts

### Rule: Do/Don't pairs: side-by-side color-coded images, one-line caption, max 2 pairs/row; reserved for vital/wordy guidance, built as a reusable template
- **Why:** The paired layout reinforces a point; templating keeps contributor output consistent.
- **Evidence:** Curtis/EightShapes — https://medium.com/eightshapes-llc/component-design-guidelines-eca706100e7c; NN/g — https://www.nngroup.com/articles/design-systems-101/
- **Applies here:** Design decisions must be actionable — do/don't is the format.

### Rule: Component-level Do's/Don'ts stay on the component page; system-wide rationale lives on separate foundations/principles pages, stated tersely
- **Why:** "Design reference" is component-level; broader reasoning belongs at foundations, not repeated.
- **Evidence:** Curtis/EightShapes — https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015; Atlassian Design — https://atlassian.design/get-started/about-atlassian-design-system
- **Applies here:** Redundancy — one home for rationale.

### Rule (weak): Consider a portable rationale+tokens file (Atlassian DESIGN.md model: YAML tokens + Markdown prose) pairing "what" with "why/how to apply"
- **Why:** Closes the gap where docs sites don't expose rationale and tokens in one place.
- **Evidence:** Atlassian — https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice
- **Applies here:** Actionable decisions — a candidate format for this file itself.

### Rule (weak): Cross-reference a token scale to components via a "use case" column (e.g. `radius.medium` → buttons, inputs, selects), not an exhaustive inventory
- **Why:** A role-grouped lookup scales as components are added.
- **Evidence:** Atlassian — https://atlassian.design/foundations/radius and https://atlassian.design/foundations/spacing
- **Applies here:** Radius→role mapping; closest analogy for CTA-accent (see Gaps).

### Rule (weak): Derive a dependent style via a token formula (focus-ring radius = base radius + 2px); state focus-indicator removal as a hard WCAG "never" rule, not a gallery
- **Why:** A formula is structural, not driftable; focus behavior is cross-cutting.
- **Evidence:** Atlassian — https://atlassian.design/foundations/radius; GitHub Primer — https://primer.style/guides/accessibility/focus-management/
- **Applies here:** Focus-ring/CTA-accent FINDING.

### Rule: Spacing scales: specs table (token, multiplier, rem, px, swatch) plus a short mechanical rationale for the multiplier system, not a design essay
- **Why:** Systems explain the method, not the base unit — naming substitutes for longer rationale.
- **Evidence:** IBM Carbon — https://carbondesignsystem.com/elements/spacing/overview/; Atlassian Design — https://atlassian.design/foundations/spacing
- **Applies here:** Spacing-ladder FINDING.

### Rule: Motion tokens: small specs tables tied to a named philosophy (Carbon's productive/expressive; Material's named duration bands), "why" as metaphor not bare numbers
- **Why:** A named philosophy gives values a reason to exist, so they apply consistently.
- **Evidence:** IBM Carbon (v10 docs) — https://v10.carbondesignsystem.com/guidelines/motion/overview/; Google Material 3 — https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- **Applies here:** Duration/easing FINDING.

## 5. Cover & status

### Rule: The cover is a navigation hub routing into parallel tracks by audience (design/code/brand/platform) — not a portfolio
- **Why:** A design system is a functional toolkit, not a portfolio; audiences need different entries.
- **Evidence:** NN/g — https://www.nngroup.com/articles/design-systems-101/; GitHub Primer — https://primer.style/
- **Applies here:** Cover simplify.

### Rule: Component status shown per-component via badge/table — never on the cover; no surveyed cover shows version, changelog, or status
- **Why:** Status matters only once a component's picked.
- **Evidence:** Atlassian — https://atlassian.design/components; USWDS — https://designsystem.digital.gov/components/lifecycle/; 5-cover check: Polaris — https://polaris-react.shopify.com/, Carbon — https://carbondesignsystem.com/, Primer — https://primer.style/, Spectrum — https://spectrum.adobe.com/, Fluent 2 — https://fluent2.microsoft.design/
- **Applies here:** Cover status.

### Rule: Fold the version into the system's name/URL (e.g. "Material 3"); changelog on a separate page; deprecation is two-stage (frozen, then retired)
- **Why:** Version-as-brand reads at a glance; separating churn keeps the front door calm.
- **Evidence:** Material 3 — https://m3.material.io/; USWDS — https://designsystem.digital.gov/components/lifecycle/; changelog (weak): Spectrum — https://spectrum.adobe.com/page/whats-new/
- **Applies here:** Cover status.

### Rule (weak): Lean/small teams should write less but essential/precise docs — "small by design," not under-resourcing; no source prescribes an exact size
- **Why:** Comprehensive support is hard without headcount; naming the trade-off makes cuts defensible, not a failure.
- **Evidence:** NN/g, Kelley Gordon — https://www.nngroup.com/articles/lean-design-system-teams/
- **Applies here:** Cover simplify — a solo project can run leaner.

### Rule (weak): Cover visual density should match audience mix, not maturity — text-heavy for engineering-facing systems, visual/animated for consumer-facing ones
- **Why:** Direct observation across five covers: audience drives visual investment more than age.
- **Evidence:** Shopify Polaris — https://polaris-react.shopify.com/; Google Material 3 — https://m3.material.io/
- **Applies here:** Cover more visual — match investment to audience.

### Rule (weak): Support multiple maturity tiers (within-group → across-groups → core) instead of one uniform quality bar, with docs surfacing which tier a piece is in
- **Why:** Not everything needs the same rigor; tiering lets experimental work ship while a vetted core keeps guarantees.
- **Evidence:** Curtis/EightShapes — https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1
- **Applies here:** Cover status — tiering pairs with the badge rule above.

## Gaps

- **CTA-accent state documentation.** Focus-ring is covered (§4: formula, hard WCAG rule); no source addresses CTA-accent directly. Treat §4's use-case-grouping rule as an analogy, not evidence.

## Quick audit checklist

- Foundations/tokens before Components; no Elements tier; Patterns kept separate?
- Pages tab-split, one-topic-per-page, 2-level disclosure cap?
- Headings carry the scan; size jump 2–4 steps; ~6th-grade, 50–75 char lines?
- Intro → Examples → Guidance → Code; Figma text one sentence + link; doc allowed to launch incomplete?
- Token tables lead name/role, value last; primitives "never use directly"; chain shown; components link out?
- Light/dark inline per row; names structured; scoped locally before promotion?
- Do/Don't for vital/wordy guidance only, templated; rationale off page when system-wide?
- Radius/spacing scales use-case-grouped; focus-ring = formula; focus removal hard WCAG "never"?
- Spacing/motion are specs tables with mechanical/named-philosophy rationale, not essays?
- Cover is a nav hub by audience, not a showcase; status per-component, tiered, off cover?
- Version folded into name; changelog separate; deprecated→retired two-stage; size deliberate?
