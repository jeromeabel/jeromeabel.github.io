---
created: 2026-08-06
---

# Raw research reports — ds-docs-research

Five parallel agents, dispatched 2026-08-06. Reports unedited (findings verbatim).
Gaps: none — Q2 required one re-dispatch (see note under Q2) which passed the evidence bar on retry.

## Q1 — IA / structure

### F1: Foundations/tokens is the near-universal first chapter, before Components
- Why: Foundations establish the shared visual language (color, type, spacing, icons) that both components and patterns are built from, so systems put it first to avoid forward references.
- Evidence: IBM Carbon — https://carbondesignsystem.com/all-about-carbon/the-carbon-ecosystem/ (nav: Getting started → Building blocks [Foundations, Components, Patterns, Data visualization] → Building experiences)
- Evidence: Adobe Spectrum — https://spectrum.adobe.com/ (site organized as foundation → components → patterns → content → voice and tone)
- Confidence: consensus
- Notes: Atlassian and Polaris also lead with Foundations; the variation is what comes *after* Foundations, not what comes first.

### F2: Patterns' nav position varies — most put it after Components, but some (Primer, Polaris) place it before, treating patterns as a task-first entry point
- Why: Placing Patterns before Components signals "start from the user's goal" navigation rather than a strict small-to-large granularity ladder.
- Evidence: GitHub Primer Product UI — https://primer.style/product/getting-started (nav order: Getting Started → Primitives → UI Patterns → Scenario Patterns → Components → ...)
- Evidence: Shopify Polaris (legacy) — https://polaris-react.shopify.com/design (nav order: Getting started → Foundations → Design → Content → Patterns → Components → Tokens → Icons)
- Confidence: consensus (two independent systems do this)
- Notes: Counter-example to the "foundations→components→patterns" default reading; worth calling out as a deliberate task-oriented alternative rather than an inconsistency.

### F3: No system runs a separate "Elements/Primitives" chapter as a third granularity tier between tokens and components
- Why: Nathan Curtis argues the elements-vs-components boundary is subjective and just adds a navigation decision users get wrong; better to keep one flat Components list.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/on-classification-in-design-systems-6b33b97f4a8f — "Don't distinguish Elements from Components. Just call them all Components... Components can contain Components."
- Evidence: structural pattern confirmed on Carbon, Primer, Atlassian, Spectrum — each keeps small interactive things (Button, Avatar, Badge) inside the flat Components list, not a separate tier
- Confidence: consensus
- Notes: GitHub Primer's "Primitives" nav item looks like a counter-example, but it holds design *tokens* (color/space/type), not small UI components — consistent with Curtis's rule once you separate "visual style" from "components."

### F4: Small stylistic things (color, type, icon assets, motion, spacing) are grouped into Foundations as their own short topic pages, not folded into component pages
- Why: These are properties shared across every component, so documenting them once in Foundations avoids repetition inside each component page.
- Evidence: IBM Carbon Foundations — https://preview.carbondesignsystem.com/getting-started/about-carbon (2x Grid, Accessibility, Color, Content, Icons, Pictograms, Motion, Spacing, Themes, Typography)
- Evidence: Atlassian Foundations — https://atlassian.design/foundations (Tokens, Accessibility, Content, Spacing, Grid, Color, Typography, Motion, Iconography, Illustrations, Logos, Elevation, Border, Radius)
- Confidence: consensus

### F5: Components and Patterns are different content types with different intents — components are prescriptive/coded, patterns are principled guidance for combining components — and are documented as separate artifacts
- Why: A component ships as reusable code; a pattern is a recommended solution assembled from components and doesn't have to ship as its own code unit, so mixing the two would confuse "what do I install" with "how do I solve this problem."
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/on-classification-in-design-systems-6b33b97f4a8f — "patterns are principled guidance to interpret (not necessarily transformed into reusable code) whereas components are prescriptive objects coded for use"
- Evidence: Adobe Spectrum — patterns described as "sets of components that work together to solve common design problems" (via spectrum.adobe.com site structure, confirmed https://spectrum.adobe.com/page/principles)
- Confidence: consensus

### F6: Within one component's docs, usage guidance is split from technical specs and accessibility via tabs/sub-pages, not folded into one long page
- Why: Usage guidance (when/why, do's/don'ts) serves designers making a decision; specs/code serve engineers implementing it — different audiences read at different times, so systems give each its own tab.
- Evidence: GitHub Primer Button — https://primer.style/components/button (tab bar: Overview | Guidelines | Accessibility)
- Evidence: IBM Carbon Button — https://carbondesignsystem.com/components/button/usage/ and https://carbondesignsystem.com/components/button/style/ (separate URL/tab per concern: usage, style, accessibility)
- Confidence: consensus

### F7: The default splitting unit is "one component or one foundation topic per page," not arbitrary length-based chunking
- Why: Keeping the page boundary aligned to a single reusable unit makes each page linkable and ownable (one team, one changelog) instead of splitting mid-topic for readability alone.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/component-specifications-1492ca4c94c — "One foundation (e.g., color) or component (e.g., text input) per page"
- Confidence: single-source
- Notes: Curtis explicitly recommends comprehensive single-page specs (anatomy, properties, spacing, behavior, tokens) for the *build* audience, while separating out *guideline* content — consistent with F6's tab split by audience rather than by length.

### F8: Documentation is commonly fragmented across multiple tools/tracks (design vs code) rather than unified into a single source
- Why: Designers and engineers each need their own artifact (Figma library vs code/prop reference), so most teams maintain parallel documentation rather than one canonical page per component.
- Evidence: zeroheight, Design Systems Report 2025 — https://zeroheight.com/how-we-document/ — "68% document their design system in multiple places"; 93% of designers maintain design libraries vs 96% of developers maintaining code libraries
- Confidence: single-source
- Notes: This is an organizational/tooling fragmentation finding, not a content-IA finding — but it explains why "usage" and "spec" content so often end up physically separated (F6/F7) rather than merged.

### F9: Component libraries and pattern libraries are recognized as the two standard reusable-content tiers beneath a design system, with foundations/style guides governing both
- Why: NN/g frames the design system as the umbrella, with a style guide setting visual/principle rules and component + pattern libraries as the two "children" repositories of reusable material at different scales (single UI piece vs. UI-element groupings/layouts).
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/design-systems-101/ — "Component libraries specify individual UI elements, while pattern libraries feature collections of UI-element groupings or layouts."
- Confidence: single-source
- Notes: NN/g doesn't prescribe a nav order, only the granularity hierarchy (component &lt; pattern in scope) — this backs F5's component/pattern distinction from an authority independent of any one system's own docs.

## Q2 — Readability

> Note: first attempt on this cluster returned findings drawn from only 3 named systems (GitHub Primer, Shopify Polaris, Atlassian Design System) because Carbon, Material 3, Spectrum, and Fluent 2 returned client-rendered shells to a plain fetch. Re-dispatched with the brief's literal addendum plus a suggestion to use a text-extraction proxy; the retry below fetched real content from Carbon, Material 3, Fluent 2, and Spectrum in addition to Atlassian, clearing the ≥4-systems bar. The report below is the retry (final, kept).

### F1: A page's default scan pattern is the F-pattern — and it's a failure state, not neutral

- Why: The F-shape emerges specifically "in the absence of subheadings and bullets" — it's what happens when content gives the eye no cues, forcing users into a cost-optimizing skim that skips the right side and lower portion of the page.
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
- Confidence: consensus
- Notes: NN/g's fix is structural, not stylistic: front-load headings with information-rich words, bold key phrases, use bullets/numbers/borders to group related content, and cut prose that doesn't carry information.

### F2: Well-structured headings/subheadings convert F-pattern scanning into the far more effective "layer-cake" pattern

- Why: When headings are visually distinct and content is chunked beneath them with whitespace, users fixate on headings first, then drop into the body text under the one that matches their need — "by far the most effective way to scan pages," nearly as good as reading every word.
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
- Confidence: consensus
- Notes: NN/g ties this explicitly to Gestalt proximity — spacing between sections must be large enough that "which text belongs to which heading" is unambiguous at a glance, or the layer-cake effect breaks down.

### F3: Heading levels need a visible size jump (not a subtle one) to register as a hierarchy

- Why: Atlassian's typography guidance quantifies this: use a 2–4 step size difference between heading levels, but keep headings at or under 2x body text size so they stay proportional and don't read as decoration.
- Evidence: Atlassian Design System — https://atlassian.design/foundations/typography-beta/applying-typography/
- Confidence: single-source
- Notes: Atlassian also warns against overly long heading text — headings must survive being wrapped on small screens, so they should summarize, not narrate.

### F4: Documentation prose should target roughly a 6th-grade reading level via short sentences, not vocabulary simplification alone

- Why: Spectrum's own before/after example shows two short sentences (4 and 7 words) scoring a 4.8 grade level versus one 18-word sentence scoring 13.1 on Flesch-Kincaid — sentence length, not word choice, is what moves the needle. They also constrain line length to 50–75 characters and specify one column per page, both classic print-readability constraints applied to docs.
- Evidence: Adobe Spectrum — https://spectrum.adobe.com/page/writing-for-readability/
- Confidence: single-source
- Notes: Spectrum frames the lower reading level as an accessibility floor ("includes more people, not just those with disabilities"), not just a style preference — and recommends left-aligned (not justified) text to help readers with dyslexia track lines.

### F5: Component doc pages converge on a fixed 4-part template so scanning transfers across the whole library

- Why: Carbon requires every component page to carry the same four tabs — Usage, Style, Code, Accessibility — so once a reader learns the template on one component, they know exactly where to look on every other component page without re-reading structure each time.
- Evidence: IBM Carbon Design System — https://carbondesignsystem.com/contributing/documentation/
- Confidence: single-source
- Notes: Carbon explicitly allows the template to flex for complex components (their Tile component is cited as needing adapted structure), and separately mandates prose discipline: "keep sentences and paragraphs short and focused," friendly/direct tone, sentence-case naming.

### F6: The stable content hierarchy for a component page is Introduction → Examples → Design guidance → Code reference, and Examples is the load-bearing section

- Why: Nathan Curtis's documentation series argues examples do most of the teaching work — a reader can absorb a component from its example gallery alone, provided deeper design rationale and code reference stay "a click away." He also flags the design/code split as a long-term documentation-debt risk despite being the easiest thing to author early.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015
- Confidence: single-source
- Notes: For pages long enough to need in-page navigation, Curtis recommends a persistent right-rail nav that tracks scroll position and mirrors the heading hierarchy — chunking without forcing a page split.

### F7: Progressive disclosure in docs should cap at two levels — primary page vs. one click deeper, not a click-chain

- Why: NN/g's progressive-disclosure guidance (originally interaction-design, but the constraint generalizes) holds that beyond two disclosure levels, users "get lost moving between levels" — usability degrades because navigating the hierarchy itself becomes the task. The fix for more complexity isn't a third tier, it's stronger chunking/grouping within the two levels you have.
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/progressive-disclosure/
- Confidence: single-source
- Notes: Applied to docs overview vs. detail pages: put everything a reader needs for the common case on the overview (Curtis's "Examples"), and defer only the genuinely rare/advanced material — don't defer things people need often just to keep the overview short.

### F8: Multiple design systems independently converge on "headings are the outline; if they don't get read, nothing does"

- Why: Fluent 2's content-design guidance treats headings as the primary scan surface, not a formatting nicety — content should flow from broad orientation (who/what) down to implementation specifics, using headings, tables, and lists together to "reinforce relationships between concepts."
- Evidence: Microsoft Fluent 2 — https://fluent2.microsoft.design/content-design
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- Confidence: consensus
- Notes: Fluent 2 also explicitly varies tone by context (conversational on dashboards, factual in nav) — scannability guidance isn't purely visual, it extends to register.

### F9: Material 3 ties scannable structure directly to error prevention, not just efficiency

- Why: M3's content-design style guide frames headings/subheadings as a way to help users "skim quickly and avoid mistakes" — i.e., poor scannability isn't framed as merely slower, but as a source of user error, alongside its sentence-case and plain-language (avoid Latin abbreviations, spell out words) rules.
- Evidence: Google Material 3 — https://m3.material.io/foundations/content-design/style-guide
- Confidence: single-source
- Notes: M3's guide is comparatively thin on quantitative rules (no explicit sentence/paragraph length targets) — it leans on tone and clarity principles more than the numeric constraints Spectrum or Atlassian specify.

### F10: Figma-native documentation optimizes for a different moment than web docs — in-context micro-copy over long-form pages

- Why: Guidance on documenting components inside Figma converges on keeping the canvas-level content minimal and moment-specific — one sentence of purpose, one sentence of when-not-to-use, plus a link out — because that description surfaces in the Inspect panel "at the exact moment a designer is deciding how to use a component," which is treated as the only moment guidance reliably lands. Longer material (anatomy diagrams, do/don't frames, rationale) is pushed to a dedicated Docs page inside the library file, not layered onto the component itself.
- Evidence: designproject.io (Figma design-system best-practices guide) — https://designproject.io/blog/best-practices-design-system/
- Confidence: single-source
- Notes: The same source is explicit that comprehensive, principle-level material belongs in an external guide outside Figma, entirely separate from canvas docs — implying Figma-native docs cannot substitute for a chunked, headed, web-style documentation site once content exceeds a short reference. This is thin evidence for a Figma-specific readability model (no NN/g or EightShapes source addresses canvas docs directly) — treat as a weak/exploratory finding, not consensus.

### F11: "Launch usable, then expand" beats front-loading exhaustive documentation

- Why: zeroheight's practitioner guidance on documenting components explicitly counsels against over-documenting up front — "resist the urge to over-document initially... the goal is to launch something usable quickly" — and states visual clarity beats lengthy explanation, favoring do/don't example frames over prose blocks (their "Rules" pattern).
- Evidence: zeroheight — https://zeroheight.com/blog/how-to-document-your-design-system-components/
- Confidence: single-source
- Notes: This is a process/maturity claim (what to write first) more than a pure readability claim, but it directly bears on chunking: it argues for deliberately incomplete pages over comprehensive ones, trusting progressive disclosure to happen release-over-release rather than within a single page.

## Q3 — Token documentation

### F1: Token tables lead with the token's semantic name/role in the primary column, not the raw value — but keep the resolved value visible alongside it
- Why: Readers pick tokens by intent ("what is this used for"), and the raw value is theme-dependent so it can't be the primary key of a stable table.
- Evidence: IBM Carbon — https://carbondesignsystem.com/elements/color/tokens/ (table columns: **Token → Role → Value**, e.g. `$background-hover` | "Hover color for $background" | "Gray 50, 12% — #8d8d8d @ 12%")
- Evidence: GitHub Primer — https://primer.style/primitives/colors (columns: Sample → **CSS variable** → Output value, e.g. `--fgColor-accent` → `#0969da`)
- Evidence: Adobe Spectrum — https://opensource.adobe.com/spectrum-design-data/tokens/color-aliases/ (columns: **Token** → Type → Value → Resolved → Deprecated)
- Confidence: consensus
- Notes: All three put the name/role column first and a computed/output value column last — usage-first, value-last is the dominant table shape.

### F2: Base/primitive tokens are documented as reference-only and explicitly marked "never use directly in code or design"
- Why: Primitive values (raw hex, raw px) aren't theme-aware; using them directly breaks theming and defeats the point of the abstraction layer.
- Evidence: GitHub Primer — https://primer.style/product/getting-started/foundations/color-usage/ ("Base color tokens are the lowest level tokens and map directly to a raw value. They are **only** to be used as a reference for functional and component/pattern tokens... should never be used directly in code or design.")
- Evidence: Adobe Spectrum — https://opensource.adobe.com/spectrum-design-data/tokens/ (separates "Color palette" raw-value tier from "Color aliases"/"Semantic color palette" tier, with alias tokens like `background-base-color` pointing at `{gray-25}`)
- Confidence: consensus

### F3: A strict three-tier chain — primitive/reference → semantic/system(alias) → component — is standard, and each tier is documented as literally pointing to the tier below
- Why: This lets teams retheme (swap what a semantic token resolves to) without touching component code, and lets contributors trace any value back to its source.
- Evidence: Material 3 — https://m3.material.io/foundations/design-tokens/overview ("Reference tokens... usually point to a static value"; "System tokens... define the purpose a reference token serves"; example chain `md.sys.color.secondary-container` → `md.ref.palette.secondary90` → `#E8DEF8`)
- Evidence: GitHub Primer — https://primer.style/product/getting-started/foundations/color-usage/ (three groups: **Base → Functional → Component/pattern**, functional tokens are "the most commonly used"; component tokens "are limited and functional tokens are preferred")
- Evidence: Material Web docs — https://github.com/material-components/material-web/blob/main/docs/theming/README.md ("Each component token maps to a system token, which has a concrete reference value")
- Confidence: consensus

### F4: Light/dark values are documented as one source of truth per token, with mode-specific values shown inline in the same row — not duplicated tables per theme
- Why: Duplicating a full token table per theme doubles maintenance and invites drift; a token's identity/role is mode-independent, only its resolved value differs.
- Evidence: Adobe Spectrum — https://opensource.adobe.com/spectrum-design-data/tokens/color-aliases/ (single "Resolved" column holding `light: rgb(...)  dark: rgb(...)` for the same token row, e.g. `disabled-content-color`)
- Evidence: Atlassian Design — https://atlassian.design/foundations/color ("Each color design token maps to a different value for each theme so their appearance differs depending on which theme is being used" — described once, not as separate light/dark pages)
- Evidence: GitHub Primer — https://primer.style/primitives/colors ("This page only shows colors in the site's active theme" and points to a separate Primitives Storybook only when a side-by-side comparison is specifically needed)
- Confidence: consensus
- Notes: Primer is a partial counter-example at the rendering layer — its live docs page shows only the currently active theme's resolved values rather than both inline, deferring simultaneous comparison to a separate Storybook tool. The token *data* itself (Primer's CSS variables) still resolves per-theme from one definition, so the single-source-of-truth policy holds even where the UI shows one theme at a time.

### F5: Token names encode usage through structured segments (namespace/foundation → property → role/modifier → state), not free-text labels
- Why: A predictable segment order makes tokens filterable/searchable and lets readers infer purpose from the name alone, before opening the table.
- Evidence: Atlassian Design — https://atlassian.design/foundations/tokens/design-tokens ("Foundation: the type of visual attribute... Property: the UI element the token is applied to... Modifier: additional details about the token's purpose, such as color role, emphasis, or interaction state")
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676 (taxonomy built from category/property/concept "base" segments plus variant/state/scale/mode "modifiers" and component/namespace segments)
- Confidence: consensus

### F6: New tokens are scoped locally to a component first, and only promoted to a global/semantic token once reused by multiple components
- Why: Premature globalization creates unused or overly generic tokens; local scoping keeps the global token set lean and each global token's necessity provable by actual reuse.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676 ("A global token isn't the place to start. Instead, record it in a place specific to that component," promoting to global scope once shared by "3 or more" components)
- Evidence: GitHub Primer — https://primer.style/product/getting-started/foundations/color-usage/ (component/pattern tokens are explicitly "limited," functional/global tokens "preferred" first)
- Confidence: single-source (Curtis gives the specific "3+" threshold; Primer corroborates the general preference for global-over-component but doesn't state a number)

### F7: Component documentation pages link out to a general tokens/primitives reference rather than embedding full per-component token tables inline
- Why: Keeps component docs focused on usage/props while avoiding duplicating token specs (which would go stale) across every component page.
- Evidence: GitHub Primer — https://primer.style/product/components/button/react/ (links out to "Primitives — Primer's design tokens for color, spacing, and typography" rather than listing button-specific token rows)
- Evidence: Atlassian Design — https://atlassian.design/components/button/examples (sidebar links to a general "Design tokens" page; the component page itself carries no inline token table)
- Confidence: consensus
- Notes: This means genuinely component-scoped tokens (e.g., a button's own hover-background alias) are often *not* individually documented in the rendered component docs — traceability relies on the token's own name being self-describing (F5) plus source/Figma inspection, not a docs-page cross-reference table.

### F8: Design-system maturity frameworks treat token/foundation structure as a distinct, separately evaluated dimension of system health
- Why: Token architecture (scalability, whether foundations are systematized vs. ad hoc) is treated as infrastructure, evaluated apart from component coverage or adoption metrics.
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/design-system-maturity/ (lists "the structure and scalability of foundations and design tokens" as a criterion under the framework's Infrastructure Robustness dimension)
- Confidence: single-source

---

**Note on research constraints**: Several docs sites (m3.material.io, spectrum.adobe.com, zeroheight.com) are JS-rendered SPAs that a plain fetch returns empty for — those were recovered via a text-extraction proxy (r.jina.ai) or via their GitHub-hosted markdown/data sources instead, which is called out here since it means the *rendered UI* wasn't directly observed for every claim, only the underlying content.

## Q4 — Decision records

### F1: Do/Don't pairs are formatted as side-by-side, color-coded image blocks with a one-line imperative caption
- Why: The paired layout lets readers "ping pong visually left and right to reinforce a memorable teaching point"; color (green/red) and an imperative caption ("Hide...", "Include...", "Prevent...") make the guidance scannable rather than prose-heavy. Curtis caps caption length at "two sentences or less" and recommends limiting to two pairs per row, with a full-width variant for larger images.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/component-design-guidelines-eca706100e7c
- Evidence: Nielsen Norman Group — https://www.nngroup.com/articles/design-systems-101/
- Confidence: consensus
- Notes: NN/g cites Material Design specifically as putting do/don't guidance in "a separate tab" from the main component description — i.e. do/don'ts are often segregated from the primary spec, not interleaved.

### F2: Do/Don'ts are reserved for guidance that is "vital or wordy" — not a default for every rule
- Why: Curtis frames Do/Don't blocks as a "welcome break from tomes of text" used when a guideline needs to be definitive, concise, and scannable; plain-text guidelines remain the default, with a target ratio of roughly "1 picture for every 5 to 10 copy-only guidelines."
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/component-design-guidelines-eca706100e7c
- Confidence: single-source
- Notes: Curtis notes Do/Don'ts also work well for words and code snippets, e.g. showing a bad vs. good error message, not just visual layout mistakes.

### F3: Component-level pages carry Do's/Don'ts, but system-wide rationale ("why we chose X") mostly lives outside the component page, in separate principles/foundations pages
- Why: Curtis's own content taxonomy — "Design Reference including Use Whens, Do's and Don'ts, and guidelines for visual, interaction, and editorial concerns" — describes *what* to do at the component level, while broader reasoning is pushed up to foundations/principles pages (e.g. Atlassian's separate "Foundations" and values/principles pages) rather than repeated per component.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/documenting-components-9fe59b80c015
- Evidence: Atlassian Design System — https://atlassian.design/get-started/about-atlassian-design-system
- Confidence: consensus
- Notes: Atlassian's principles are deliberately terse — "a short principle, a quick rationale, and then a real implementation example" is treated as sufficient; systems don't generally maintain deep ADR-style logs in public docs.

### F4: Atlassian's DESIGN.md packages rationale and tokens together in one portable, machine-and-human-readable file, explicitly separating "intent" from full implementation detail
- Why: The format pairs YAML frontmatter (color/typography/spacing/shape tokens) with Markdown prose explaining principles and component guidance, so a consumer (human or AI agent) gets both the "what" (token values) and the "why"/"how to apply" in the same artifact — e.g. "Default buttons use {colors.border} and {colors.text-subtle}; primary buttons are solid blue for maximum contrast" ties a token directly to a component decision.
- Evidence: Atlassian (Inside Atlassian blog) — https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice
- Confidence: single-source
- Notes: This is a 2026-era format aimed at AI-agent consumption specifically because prior docs sites don't expose rationale + tokens in one queryable place — an implicit admission that decision rationale is normally scattered.

### F5: A token scale cross-references the components it governs via a "use case" grouping column, not a full component inventory
- Why: Atlassian's radius and spacing scale tables map each token to a category of UI role (e.g. `radius.medium` → "buttons, inputs, text areas, selects, navigation items, smart links") rather than an exhaustive list of every component instance — this scales better as new components are added without requiring the token doc to be updated per-component.
- Evidence: Atlassian Design System — https://atlassian.design/foundations/radius
- Evidence: Atlassian Design System — https://atlassian.design/foundations/spacing
- Confidence: single-source
- Notes: GitHub Primer's primitives page (size/spacing) takes the opposite approach — it's a pure reference table with no use-case grouping and no component cross-reference, deferring to Storybook links instead. This suggests two real patterns exist: "role-grouped lookup" (Atlassian) vs. "raw reference + external links" (Primer).

### F6: A derived-token formula is the mechanism for linking one decision to a dependent, non-instantiable style (focus rings from border-radius)
- Why: Rather than documenting focus-ring corner radius as an independent value, Atlassian defines it as a computed offset of the base radius scale — "The corner radius of the focus ring is always +2px greater than the component's base corner radius value," with paired tokens like `radius.focus.medium` (8px) next to `radius.medium` (6px). This makes the cross-reference structural (a formula) rather than just a documentation link.
- Evidence: Atlassian Design System — https://atlassian.design/foundations/radius
- Confidence: single-source
- Notes: This is the clearest concrete example found of "documenting a decision that governs another non-instantiable concept" — focus rings have no component page of their own, so the system encodes the relationship as a token derivation instead of prose.

### F7: Spacing scales are documented as a specs table (token, base-unit multiplier, rem, px, visual swatch) plus a short numeric-system rationale, not a deep "why" essay
- Why: Both IBM Carbon and Atlassian explain the *method* (multiples of a base unit — Carbon uses 2/4/8, Atlassian uses percentages of an 8px base so "space.100 is 8px, space.200 is 16px") but neither explains why that specific base unit was chosen over another. The rationale given is mechanical/self-documenting-naming, not a deeper design argument.
- Evidence: IBM Carbon Design System — https://carbondesignsystem.com/elements/spacing/overview/
- Evidence: Atlassian Design System — https://atlassian.design/foundations/spacing
- Confidence: consensus
- Notes: Atlassian's naming convention (`space.100` = 100% of base = 8px) is itself a rationale-substitute — the name encodes the scale logic so a separate explanation is less necessary.

### F8: Motion tokens (duration + easing) are documented as small labeled specs tables tied to a named motion philosophy, with the "why" expressed as a physics or behavior metaphor rather than raw numbers alone
- Why: IBM Carbon frames its duration/easing choice around a physical metaphor — the system distinguishes "productive" motion (efficiency, subtlety, task-focused) from "expressive" motion ("enthusiastic, vibrant, and highly visible movement" for significant moments), and states that "elements on the screen should speed up quickly and slow down smoothly, obeying the physics of a light-weight material," backed by a concrete 6-value non-linear duration scale (`duration--fast-01` 70ms through `duration--slow-02` 700ms) and six easing curves (standard/entrance/exit × productive/expressive). Material Design 3 mirrors the same "named moods + specs table" structure with four labeled duration bands (short 50–200ms, medium 250–400ms, long 450–600ms, extra-long 700–1000ms) and two named easing families — Emphasized ("the most common," expressive motion) and Standard (simple/utility transitions) — each with sub-variants (decelerate/accelerate).
- Evidence: IBM Carbon Design System (v10 docs) — https://v10.carbondesignsystem.com/guidelines/motion/overview/
- Evidence: Google Material Design 3 — https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- Confidence: consensus
- Notes: Current Carbon docs (carbondesignsystem.com/elements/motion/overview/) render as a client-side SPA that WebFetch cannot extract past the title; the v10 legacy docs (same duration/easing model, still live) were fetched directly instead and match the same productive/expressive framing referenced on the current site. The Material 3 page required a text-extraction proxy (r.jina.ai) since a direct fetch returned only the page title — both citations now rest on genuinely retrieved page content rather than search snippets.

### F9: Interaction-state-only styles like focus indicators are documented as accessibility rules with a hard "never" prohibition, not visual do/don't galleries
- Why: Primer's focus-management guidance states plainly to "never remove the focus indicator unless you are replacing it with a border or some other visual indicator," grounding the rule in WCAG 2.1 keyboard-accessibility requirements rather than aesthetic preference, and pointing implementers to `:focus` vs `:focus-visible` as the code-level lever rather than a component-by-component visual spec.
- Evidence: GitHub Primer — https://primer.style/guides/accessibility/focus-management/
- Confidence: single-source
- Notes: Primer's page has no do/don't image pairs at all for this topic and no per-component matrix of which components need focus styling — it treats focus behavior as a cross-cutting platform rule, closer to F6's "derived rule" pattern than to F1's image-pair pattern.

### F10: Do/Don't pairs are a named, reusable documentation *component* in the system's own toolkit, not a one-off content trick
- Why: Curtis explicitly lists Do/Don't as one of the "Top 8 Reusable [documentation] Components" a system should build, on par with component-status badges and code-example blocks — meaning mature systems template the do/don't pattern (as a Markdown shortcode or CMS component) so every contributor produces consistent output.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/design-system-doc-components-8c0b027322f8
- Confidence: single-source
- Notes: Corroborated structurally by Curtis's other article noting the docs are "Markdown integrated into Nunjucks templating mixed with calls to other components like the Do/Don't" — i.e. it's implemented as an actual templated component in the docs codebase.

---

**Method notes / gaps**: I was able to fully fetch and quote from Atlassian Design System, IBM Carbon (spacing page, partial), GitHub Primer, NN/g, and the Nathan Curtis/EightShapes Medium series. Shopify Polaris's content-guidelines URLs redirected/changed (polaris.shopify.com → shopify.dev restructuring) and I did not get a direct fetch through; Adobe Spectrum and Material Design 3's motion pages are client-rendered SPAs that WebFetch could only retrieve titles for, so F8's numeric claims lean on indexed search snippets rather than a directly-read page — flag for follow-up if precise duration/easing values are needed. zeroheight's "How We Document" report pages are also gated behind interactive/marketing shells that didn't yield extractable statistics.

## Q5 — Cover / status

### F1: A design-system landing page functions as a navigation hub to entry points (by discipline or platform), not a portfolio showcase
- Why: NN/g frames a design system as "a functional toolkit or resource ... not a portfolio of work" — the cover's job is routing, not impressing.
- Evidence: NN/g — https://www.nngroup.com/articles/design-systems-101/
- Evidence: GitHub Primer — https://primer.style/
- Evidence: Microsoft Fluent 2 — https://fluent2.microsoft.design/
- Confidence: consensus
- Notes: Primer routes to Product UI / Brand UI / Brand toolkit; Fluent 2 routes to Design / Development / per-platform (Web, iOS, Android, Windows).

### F2: Component status (alpha/beta/experimental/stable/deprecated) is shown per-component via badges or a status table, never on the system's cover page
- Why: status is lifecycle information relevant only once someone has picked a specific component; surfacing it on the cover would clutter the top-level orientation view.
- Evidence: Atlassian Design System — https://atlassian.design/components
- Evidence: U.S. Web Design System — https://designsystem.digital.gov/components/lifecycle/
- Evidence: Nathan Curtis / EightShapes (quoting IBM Carbon) — https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1
- Confidence: consensus
- Notes: None of the five covers directly fetched (Polaris, Carbon, Primer, Spectrum, Fluent 2) showed status badges on the landing page itself — confirmed by direct observation, see F10.

### F3: A major version becomes part of the system's name/URL rather than a number printed on the cover — e.g. "Material 3", "Fluent 2", "Spectrum 2"
- Why: version-as-brand communicates a generational redesign at a glance to a broad, mixed audience (design, dev, marketing) more legibly than a semver string would.
- Evidence: Google Material 3 — https://m3.material.io/
- Evidence: Microsoft Fluent 2 — https://fluent2.microsoft.design/
- Evidence: Adobe (LogRocket coverage of Spectrum 2 launch) — https://blog.logrocket.com/ux-design/spectrum-2-adobes-revamped-design-system/
- Confidence: consensus
- Notes: distinct from package-level semver, which is tracked separately on a releases page (see F4).

### F4: Fine-grained release/version history lives on a dedicated changelog / "what's new" / releases page, kept separate from the cover
- Why: separates the stable "front door" from the churn of frequent releases, so contributors can track change without cluttering the landing experience for newcomers.
- Evidence: Adobe Spectrum — https://spectrum.adobe.com/page/whats-new/ and https://react-spectrum.adobe.com/releases/
- Confidence: single-source
- Notes: React Spectrum's releases page shows ordinary semver (0.12.0, 0.11.0…) alongside the "Spectrum 2" brand version — the two versioning systems coexist at different depths of the site.

### F5: Deprecation does not mean removal — a deprecated component stays in the library frozen (bug fixes only, no new features) until a separate "retired" stage removes it
- Why: protects existing consumers from breaking changes while still steering new work away from the outdated pattern.
- Evidence: Nathan Curtis / EightShapes (quoting IBM Carbon's deprecation policy) — https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1
- Evidence: U.S. Web Design System lifecycle — https://designsystem.digital.gov/components/lifecycle/
- Confidence: consensus
- Notes: USWDS makes this a formal two-stage split (Deprecated → Retired); Carbon's public messaging uses "deprecated" more loosely for the same idea.

### F6: Docs sites split into parallel tracks by audience/discipline (design vs. code vs. brand vs. platform) instead of one linear document
- Why: designers, engineers, and brand/marketing teams need different entry points and depth; forcing them through one page overwhelms all three.
- Evidence: GitHub Primer — https://primer.style/ (Product UI / Brand UI / Brand toolkit)
- Evidence: Microsoft Fluent 2 — https://fluent2.microsoft.design/ (Design / Development / per-platform)
- Evidence: Shopify Polaris — https://polaris-react.shopify.com/foundations (Foundations / Content / Design / Components / Experience)
- Confidence: consensus

### F7: For a lean/small team, the right move is to write less documentation but make what exists essential and precise — a deliberate scope cut, not an accident
- Why: comprehensive support (deep docs, 1:1 consulting, multiplatform parity) is the hardest thing to sustain without headcount; naming the trade-off openly makes the cuts defensible instead of just missing.
- Evidence: NN/g, Kelley Gordon — https://www.nngroup.com/articles/lean-design-system-teams/
- Confidence: single-source
- Notes: NN/g distinguishes "small by design" (deliberate, right-sized, sustainable) from "small by default" (under-resourced → burnout, maintenance debt, uneven support). The same low doc-volume reads as healthy or as a symptom depending on which one it is — directly relevant to sizing a solo/personal design system's docs.

### F8: Systems should support multiple maturity tiers rather than one uniform quality bar, with docs surfacing which tier a given piece is in
- Why: not everything needs (or can afford) the same rigor; tiering lets teams publish experimental work for feedback while reserving "production-ready" guarantees for a vetted core.
- Evidence: Nathan Curtis / EightShapes — https://medium.com/eightshapes-llc/design-system-tiers-2c827b67eae1
- Confidence: single-source
- Notes: Curtis's tiers (within-group → across-groups → core) map roughly onto the alpha/beta/stable badges independently observed at Atlassian, USWDS, and Carbon — convergent practice even where the vocabulary differs.

### F9: Cover visual density tracks audience mix, not system maturity — text-heavy reference hubs for engineering-facing systems, highly visual/animated covers for consumer/brand-facing ones
- Why: (direct observation across 5 covers) the audience a cover is written for — internal engineers picking a component vs. a broad public/marketing audience — drives visual investment far more than the system's age or scale.
- Evidence: Shopify Polaris — https://polaris-react.shopify.com/
- Evidence: GitHub Primer — https://primer.style/
- Evidence: Microsoft Fluent 2 — https://fluent2.microsoft.design/
- Evidence: Google Material 3 — https://m3.material.io/
- Confidence: single-source
- Notes: Primer sits in between — some illustration (screenshots, a mascot character) but still organized as a text-driven navigation hub, so this is a spectrum, not a binary.

### F10: None of the five system covers surveyed shows a version number, changelog, or component-status indicator on the landing page itself — all of that is at least one click deeper
- Why: the cover's job is orientation/wayfinding; version and status are sought only once a visitor has already picked a component or platform track.
- Evidence: Shopify Polaris — https://polaris-react.shopify.com/
- Evidence: IBM Carbon — https://carbondesignsystem.com/
- Evidence: GitHub Primer — https://primer.style/
- Evidence: Adobe Spectrum — https://spectrum.adobe.com/
- Evidence: Microsoft Fluent 2 — https://fluent2.microsoft.design/
- Confidence: consensus

### F11: Industry-wide, design-system programs are getting more resourced and more token-driven year over year, but survey data stops short of prescribing a "right" documentation depth for small/solo systems
- Why: zeroheight's own framing — "documentation alone is only going to get you so far" — treats docs as one lever among several (training, communication), regardless of team size, rather than issuing a size-based prescription.
- Evidence: zeroheight, Design Systems Report — https://zeroheight.com/how-we-document/
- Confidence: single-source
- Notes: Report shows 79% of teams now have dedicated design-system resources (up from 72%) and 84% have adopted design tokens (up from 56%), but gives no explicit cover-page or status/version-display guidance for solo/small teams — that gap is instead addressed by NN/g's lean-teams piece (F7).
