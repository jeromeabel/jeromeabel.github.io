# Design System Thesis

> How to organise, document, and present a personal design system — not as a portfolio showcase, but as an opinionated engineering artifact.

---

## 1. The Core Tension: Portfolio vs. Design System

Your file currently lives between two identities:

- **Portfolio mode:** Pages that show off the work (Cover, Pages with full compositions, visual specimens).
- **System mode:** Pages that enforce decisions (token tables, hover-verb inventories, DO/DON'T pairs, cross-references).

> **Thesis:** Commit fully to system mode. A portfolio is a sales document — it says _"look how good this is."_ A design system is an engineering document — it says _"here's how to not break this."_ Your file already leans system; the thesis is to strip the remaining portfolio instincts (decorative layouts, specimen galleries optimised for visual impact) and replace them with pure utility.

### What "Very Minimal" Means Here

Minimal doesn't mean less content. It means:

- **No frame exists to look pretty.** Every frame either teaches a rule, demonstrates a specimen, or logs a decision.
- **No redundancy between pages.** A component appears once as a live instance. Its rationale appears once on the Decisions page. Its token bindings appear once in Foundations.
- **No visual hierarchy tricks for the reader.** The system is flat — a developer or future-you should find anything in under 10 seconds via `page name` → `section name` → `card name`.

---

## 2. Proposed File Structure

```text
📖 Cover         → Kill or reduce to a single text frame: system name + version + last-updated date.
📐 Decisions     → The WHY. Decision records for every non-obvious choice.
🎨 Foundations   → The WHAT. Token tables: color, type, spacing, radius, motion, icons.
❖ Components    → The HOW. Live specimens with usage rules, one section per component.
📄 Pages         → The PROOF. Assembled pages showing the system in use (optional, read-only reference).

```

### Why This Order Matters

A reader enters with a question. The order answers progressively:

1. **Decisions** — _"Why does this look like this?"_ (intent)
2. **Foundations** — _"What are the building blocks?"_ (tokens)
3. **Components** — _"How do I use them?"_ (assembly instructions)
4. **Pages** — _"What does it look like assembled?"_ (validation)

Most design systems put Foundations first. Putting Decisions first is the thesis: **intent before implementation**. When a new decision needs to be made (new component, new page type), the reader checks Decisions first to understand the existing logic, then Foundations for available tokens, then Components for patterns.

---

## 3. How to Present Decisions

### Format: Decision Cards

Each decision gets a card with three parts:

```text
┌─────────────────────────────────────────┐
│ WHAT   [element name + scope]           │
├─────────────────────────────────────────┤
│ WHY    The constraint, insight, or      │
│        benchmark that drove this.       │
├─────────────────────────────────────────┤
│ HOW    Usage rules. Budget. Pairing     │
│        restrictions. What breaks it.    │
└─────────────────────────────────────────┘

```

### Decision Categories

| Category          | Covers                                              |
| ----------------- | --------------------------------------------------- |
| **Identity**      | Three-layer model, brand personality                |
| **Color**         | Palette choice, accent budget, semantic mapping     |
| **Typography**    | Family selection, role assignment, scale logic      |
| **Interaction**   | Hover verbs, CTA budget, motion scale               |
| **Geometry**      | Radius vocabulary, spacing ladder, border semantics |
| **Accessibility** | Contrast floor, reduced motion, focus patterns      |

### What Makes a Good WHY

- ❌ **Bad:** _"We use teal for accents."_ (That's a WHAT.)
- ❌ **Bad:** _"Teal looks nice with lime."_ (That's taste, not a constraint.)
- ✅ **Good:** _"One accent color forces hierarchy. Teal on lime has natural contrast and reads technical without being cold. The budget (serie chips, CTAs, active nav, focus rings) prevents accent inflation."_

> The **WHY** should make the reader think _"I now understand the constraint well enough to make a new decision that's consistent with this one."_

### Cross-references

Every Decision card should link to:

- The **Foundation token** it affects (e.g., `→ color/accent in Foundations · Colors`)
- The **Component** that implements it (e.g., `→ SerieCard, Link/TextCTA in Components`)
- Any **sibling decisions** it depends on (e.g., `See also: One hover verb per surface`)

These cross-references are what make the system a system rather than a list.

---

## 4. How to Present Foundations

### Principle: Token Tables, Not Swatches

Your current Foundations page has two versions: old-style specimen frames (`Foundations · Colors`, `Foundations · Typography`) and newer structured frames (`Colors`, `Typography`).

**The thesis:** keep only the structured version and push it further toward pure data.

#### Format per Foundation

```text
┌─────────────────────────────────────────┐
│ TOKEN NAME         │ LIGHT    │ DARK    │
├────────────────────┼──────────┼─────────┤
│ color/background   │ lime-100 │ gray-800│
│ color/foreground   │ gray-800 │ gray-100│
│ ...                │          │         │
├─────────────────────────────────────────┤
│ JOB: one-line description of what this  │
│ token does, not what it looks like.     │
└─────────────────────────────────────────┘

```

### What Each Foundation Section Needs

- **Colors**
- Semantic token table (the `THEME TOKEN JOBS` section is excellent).
- Accent budget summary (which elements are allowed which accent tokens).
- Mode table showing Light/Dark mapping.

- **Typography**
- Family × role matrix (`Display/Reading/Machine = Bubbler/Plex/Fira`).
- Scale table with size, weight, line-height, and usage context.
- _The rule:_ _"Display never below H1"_

- **Spacing**
- The 3-step ladder: inside (8px) / between (24px) / section (responsive).
- Responsive token values per breakpoint.
- _The rule:_ _"If it's not on the ladder, it's a defect"_

- **Radius**
- The 3-value vocabulary: full (pressable) / 8px (media holder) / 0 (reading surface).
- Which components get which value.

- **Motion**
- Duration scale: fast / base / slow.
- Easing functions.
- _The rule:_ _"Zero infinite loops, MotionToggle gates everything"_

- **Icons**
- Size vocabulary: 16 / 20 / 24 and their jobs.
- The asset location pointer.

---

## 5. How to Present Components

### Principle: Specimen + Rules, Not a Gallery

Each component section needs exactly:

1. **Live instance:** One default-state instance, actual size. Not artfully arranged, just there.
2. **States:** If it has hover/active/disabled, show those as a row.
3. **Anatomy:** If the component has non-obvious internal structure (slots, chips, metadata layers), label it.
4. **Rules:** The 3–5 constraints that prevent misuse:

- _Budget:_ _"max 1 per viewport"_
- _Hover verb:_ _"fill inverts, 150ms"_
- _Pairing:_ _"serie chip wins over topic chip"_
- _Hierarchy:_ _"never accent on metadata"_

### Section Grouping

```text
❖ Components
  ├── Chrome        → Header, Footer, NavLink, ThemeToggle, MotionToggle
  ├── Buttons       → Link/CTA, Link/Secondary, Link/SecondarySm, Link/TextCTA, Link/Icon
  ├── Cards         → PostRow, SerieCard, PostCardPreviewBig, PostCardPreviewSmall, WorkCardPreviewSmall
  ├── Typography    → H1, H2, PreviewTitle, PageDescription, PostMetadataTime, PostMetadataTopic, SerieMeta
  ├── Hand          → hero.svg, quality.svg, 404.svg, arrow-curve.svg, footer.svg
  └── Hero & Contact → HeroText, HeroAnimation, ContactContent

```

### DO/DON'T Pairs

Add a **DO/DON'T** when the wrong choice looks plausible:

> _"Title hover keeps text colour unchanged; underline carries the affordance"_ needs a DON'T because teal-on-hover looks reasonable until you see it compete with the serie chip.

_Don't add a DO/DON'T when the wrong choice is obviously wrong (e.g., "DON'T: use Comic Sans for metadata")._

---

## 6. How to Present Sections (Composed Assemblies)

### Principle: Sections Are Components-in-Context

A section is not a new design — it's proof that the component rules compose correctly. Document them as:

- **Live instance** at actual viewport width.
- **Token audit:** Which semantic tokens are in play (background, spacing, rhythm).
- **Composition rules:** How components relate spatially:
- _"Header: flat color/background, no gradient"_
- _"Footer: flat color/surface, no gradient"_
- _"BlogPreview: featured card + 3 secondary cards, section rhythm spacing"_

> **Keep sections read-only:** Sections should be instances of the actual page components, not bespoke recreations. If the section specimen diverges from the real implementation, it's lying.

---

## 7. How to Present Pages (Full Compositions)

### Principle: Pages Are Test Cases, Not Deliverables

The Pages section exists to answer: _"Does the whole system hold up when assembled at full scale?"_

Each page composition should:

- Be a live assembly of section instances (not flattened frames).
- Show both **Light and Dark mode** side by side.
- Show **Desktop and Mobile** side by side (or stacked).
- Carry **zero documentation** — if something needs explaining here, the explanation belongs in Decisions, not on the page itself.

---

## 8. What to Remove

A minimal system means killing content that doesn't serve the three jobs (**decide, build, validate**):

| Remove                                         | Why                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Cover page (if decorative)**                 | It's portfolio instinct. A system doesn't need a splash screen.                                            |
| **Duplicate foundation frames**                | You have old + new versions. Keep one.                                                                     |
| **Russian-language color frame**               | Appears to be from a template/reference. Not your system.                                                  |
| **Component sections that are just galleries** | If a section only shows instances without rules, it's a gallery. Add rules or merge into a parent section. |
| **Image placeholders without purpose**         | `image 1` rectangle on Foundations — remove if it's not documenting something.                             |

---

## 9. The Meta-Decision: Why Organise It This Way

This structure is optimised for a single-maintainer system (you) that serves two readers:

1. **Future-you** returning after months away — needs to recover intent before making changes.
2. **An AI assistant or collaborator** reading the system to generate consistent work — needs rules, not vibes.

Both readers want the same thing: _"Tell me what I can't figure out by looking at the code."_

- The code already shows **WHAT** exists (inspect the Astro components).
- The tokens already show **HOW** things look (inspect the variables).
- Only the Decisions page shows **WHY** — and that's what makes it irreplaceable.

---

## 10. Maintenance Ritual

A system that's never updated is a museum. A minimal maintenance loop:

- **When you add a component:** Write the Decision card first, then build the component to match.
- **When you break a rule:** Update the Decision card to explain why the exception exists, or fix the component.
- **When you run a token audit:** Log the results in Foundations as a dated snapshot (like your 697-node coverage scan). Track the debt.

> The system is alive when **Decisions stay ahead of Components** — intent before implementation, always.

---

_Version 1.0 — August 2026_
