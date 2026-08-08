# Artistic Direction — condensed reference

**Status: SETTLED, executed.** Signature = the hand-drawn SVGs already shipping in the repo
(`hero.svg`, `footer.svg`, `values/*.svg`, `404.svg`, `arrow-curve.svg`) — author-drawn,
black-on-transparent, `dark:invert`. A three-composition Figma lab was tried to find the
signature and abandoned as a failed method (diffed variants, not composed ones; mechanical
PASS/FAIL scoring). Full spec, including the three-layer model (Chrome / Content / Hand) and
every property rule: `.specs/01_active/artistic-direction/design.md`. This file is a
condensed pointer, not a second copy — load `design.md` for the actual rule text.

**Dashed is removed from the library, not just decided.** Cleared at 3 Figma source
components (`Link/Icon` normal/small, `Link/External`) → 30 instance nodes across the
library and both page frames. Survives in exactly one place: the hero self-draw start state
(`stroke-dasharray` animating to solid — not a CSS border). The 6/3 dash utility is dead;
do not build it.

**Radius trio is enforced in Figma**, not just written down: `full` (pressable — buttons,
chips, icon circles, pills), `lg`/8px (media surfaces — covers, cards), `0` (reading
surfaces — rows, tables, prose). Collapsed at 11 source components → 55 instance nodes.
Never two radii on one element.

**Button vocabulary = 4 Figma components implementing 3 button styles** (`design.md
§Buttons`): `Link/CTA` (Primary), `Link/Secondary` + `Link/SecondarySm` (Secondary — the
small variant was `Link/External` until dashed removal made "external" the wrong name for
a style), `Link/TextCTA` (built fresh — no equivalent existed before). `Link/Icon` and the
theme/motion toggles are chrome controls, not button styles, and sit outside this count.

**Hover verbs — `design.md ### Hover` is the authority.** One verb per surface, ≤150ms.
Don't duplicate the table here; look it up there. The one gotcha worth restating: Figma's
`Link/TextCTA` component does *not* underline on hover (`textDecoration: NONE` both states)
— its verb is a colour change, muted → foreground, same as `NavLink`. `design.md §Buttons`
still describes underline as the original codebase intent and cross-references this as an
open gap between intent and the built component.

**Auditing Figma for drift: exclude `COMPONENT_SET` and `SECTION` nodes.** Component sets
render with a dashed purple boundary and `cornerRadius: 5`; sections carry `cornerRadius: 2`.
That is Figma's own frame chrome, not design. A naive sweep of `Components (new)` reports
false positives on both counts if you don't skip these node types — this is the single most
reusable gotcha from this whole cleanup.

**Home and Blog validated** against the cleaned library in both themes and both published
viewport widths (Desktop 1280 and Mobile 390). Each page now ships four frames pinned by
explicit `(Theme, Responsive)` mode pairs instead of hand-resized duplicates.

**Documentation entry page:** `📚 Design system` is now the shareable top-to-bottom narrative
(00 Read me → 01 Tokens → 02 Elements → 03 Components → 04 Pages), and the old property
decision blocks were re-homed inline next to the governed specimen.

**Code is deferred to Phase 4** of `plan.md` — nothing in `src/` has changed yet. Full
change list there (`C1`–`C9`): motion tokens, `Link.astro` rewrite, `border-2` removal, two
SVG debts (`hero.svg` hardcoded fill, `cross-big.svg` hardcoded stroke).

## Survey headlines (evidence, not opinion) — still useful background

Basis: 14 CSS-first creative-dev portfolios (fetched live CSS/HTML), motion-authority
literature (Emil Kowalski, Rauno Freiberg, NN/g, web.dev, Apple HIG), hiring-signal
writeups (Comeau, HN hiring threads, Soueidan), idiom-specific convention research (gwern,
Roselli, Carbon, Polaris).

1. **10/14 sites concentrate personality in ONE ownable device, then go quiet.** Fisher:
   wavy underline. Jhey: self-drawing bear signature. Owen: living SVG self-portrait. Böck:
   theme switcher. Afif: pure-CSS pattern background. Only 3/14 are playful-everywhere, and
   those gate every effect (PRM, `@supports`, `hover:hover`).
2. **Ambient infinite animation is nearly extinct.** ~400KB fetched CSS: 4 sites have ZERO
   `@keyframes`; the rest use one-shots or scroll-progress-linked motion
   (`animation-timeline: view()/scroll()`).
3. **Exactly one ownable hover verb per site**, applied with total consistency.
4. **Gradient blobs are dead** in this cohort (1/14). 2025–26 "warmth" idiom = flat +
   grain/paper texture, not pastel radial blur.
5. **Nobody fakes sketchiness wholesale.** Hand-drawn identity = ONE analog gesture on top
   of an otherwise precise system. Dashed-as-token: only Brad Woods (digital-garden
   identity) — the counter-example that helped kill dashed-as-identity here.
6. **Craft signal lives in the CSS itself**: `:has()`, `color-mix`, `@property`, view
   transitions, hand-baked `linear()` springs.
7. **Hiring signal**: substance (case studies, writing, voice) carries; visual craft
   corroborates, doesn't replace it.

## Motion-authority rules (adopted as system, in `design.md ### Motion`)

- UI motion < 300ms; hover/press 100–160ms; entrances ease-out; never ease-in on UI.
- Animate `transform`/`opacity` only. Enter from scale(0.9–0.97)+opacity, never scale(0).
- Frequency heuristic (Rauno): high-frequency chrome (nav, rows, toggles) gets ≤150ms
  color/opacity or nothing; novel first-visit surfaces (hero) get the motion budget.
- Infinite loops justified ONLY for ongoing-state indicators (loading/live). WCAG 2.2.2
  applies to anything moving >5s.
- Reduced motion = designed variant (keep fades, drop transforms), not a kill switch.
- Tokenized in `@theme`: `--duration-fast/base/slow`, `--ease-out`, `--ease-in-out`. No
  ad-hoc values.

## Superseded / historical (kept for context only — do not treat as current)

- The three-composition Figma lab (`LAB / C1–C3`) and its screenshot-scoring `lab-eval.md`
  — abandoned, deleted, left parked as negative reference.
- The old `EXP / Dashed` board (`Wf4iomVMYUXlFIBV3Z8bx4`, node `483:2`) — superseded, dashed
  is fully removed now, not a live proposal.
- Dashed-as-signature was the round-1 lab hypothesis; it lost to "the signature already
  ships as hand-drawn SVGs" before the lab even finished running.

Register target: senior engineer with taste (rauno/emil), not agency creative dev — one
controlled escape valve (the Hand layer) for the artist identity.
