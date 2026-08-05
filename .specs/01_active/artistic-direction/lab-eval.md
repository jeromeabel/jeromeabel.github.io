---
created: 2026-08-05
---

# Artistic Direction — Lab Evaluation Pack

Judgment pack for the three-composition Figma lab described in
[design.md](design.md). Three full home-page compositions were built in
`ihWIWmvtQPTWgUxlrVjC2c` — C1 (dashed chrome, control), C2 (material), C3
(quiet + one moment) — and are evaluated here against the five criteria from
design.md's "Evaluation criteria" section, verbatim.

**Screenshots**: captured via Figma `get_screenshot` (not embedded pages) and
saved locally for review during this evaluation — full page (`maxDimension:
1024`), hero close-up (`2048`), arm's-length thumbnail (`400`) per
composition, 9 total. They were **not** committed to the repo (scratch
working files only); re-capture from the node IDs below if you need them
again. The images referenced during this evaluation:

- C1: full page, hero close-up (node `2449:357`), 400px thumbnail
- C2: full page, hero close-up (node `2434:676`), 400px thumbnail
- C3: full page, hero close-up (node `2460:357`), 400px thumbnail

## Figma links

- [LAB / C1 — Dashed chrome](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/?node-id=2448-2) — `C1 / Home`
- [LAB / C2 — Material](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/?node-id=2434-673) — `C2 / Home`
- [LAB / C3 — Quiet](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/?node-id=2457-342) — `C3 / Home`
- [LAB / Storyboards](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/?node-id=2431-5) — hero self-draw as stills (t=0 / 0.6 / 1.2) per composition
- [LAB / Compare](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/?node-id=2431-6) — all four side by side, incl. C2 compact-hero variant for fold-cost

## Hypothesis going in (for context — not a thumb on the scale below)

> C2 wins. Material texture + one hand gesture is ownable, historically the
> author's, and survey-aligned; dashed keeps its only honest job inside the
> hero draw. C1 exists as control to make the comparison honest, C3 as the
> restraint floor.

The matrix below was scored from what the screenshots actually show, not
from this hypothesis.

## Criteria matrix

### 1. Name the signature in one sentence. If it takes two, the composition failed.

Sentence attempted for each:

- **C1** — *"Every interactive or decorative edge gets a dashed 6/3
  outline — the hero rings, the Start-reading pill, the icon circles."*
  One sentence is achievable, but the device it names isn't ownable: dashed
  is an established UI-state convention (drop zone, `abbr`, marching ants),
  not a signature — the sentence describes a technique applied everywhere,
  not a device. **FAIL.**
- **C2** — *"Grainy, hand-drawn 3D charm/ribbon glyphs float with soft
  shadows over noise-gradient covers."* One sentence, and it names a
  concrete, author-specific device (crosshatch material, per the
  printmaking/robot-drummer history in design.md). **PASS.**
- **C3** — *"Nothing but content, type, and whitespace, plus three shapes
  that draw themselves once."* One sentence is achievable, but in the static
  render the "shapes that draw themselves" clause describes motion the
  medium can't show — what's actually on screen (three flat grey ellipses)
  doesn't read as a signature, it reads as absence. **FAIL in stills**
  (caveat: may pass once the self-draw is live in code — see Recommendation).

### 2. No element means something it isn't (drop zone, abbr, placeholder).

- **C1** — Two elements flagged: the dashed hero rings pre-read as an
  unfinished/wireframe sketch (dashed-outline icons conventionally signal
  "not final"), and the dashed "Start reading" pill pre-reads as a
  disabled/ghost button (dashed-border buttons are a common "add new" /
  disabled convention, e.g. Polaris upload tiles). **FAIL.**
- **C2** — One element flagged: at the delivered screenshot resolution the
  noise-gradient covers render as smooth two-tone (purple→teal / green→white)
  blocks with no visible grain — indistinguishable from a loading-skeleton
  shimmer placeholder, a very common "image still loading" convention. This
  is a rendering-fidelity risk more than a design flaw (design.md already
  scopes grain/noise generation to cover-studio, out of lab scope), but as
  judged from what's on screen: **soft FAIL**, contingent on grain actually
  surviving into the real asset pipeline.
- **C3** — One element flagged, and the worst offender of the three: the
  hero's three flat grey ellipses are the single most common placeholder
  convention in design tooling (Balsamiq wireframe blobs, Figma's own
  placeholder shapes, "image here" grey boxes). **FAIL.**

### 3. One hover verb per surface held; accent budget held.

Hover verb itself is fixed identically across all three per design.md's DS
rework standard (row → tint, card → underline + scale) and isn't visible in
a static render either way — not a differentiator here. Accent budget, read
from what's actually on screen:

- **C1** — Near-monochrome: dark neutral + one warm off-white CTA fill. No
  competing accent hue. **PASS** (arguably under-spent — nothing to spend).
- **C2** — Two accent families visible in the same viewport: a
  purple/indigo hero glyph and a teal-green cover gradient. Reads as two
  separate accents rather than one material system unless explicitly unified
  as one documented palette. **FAIL / marginal** — fixable before
  implementation.
- **C3** — Zero accent color beyond neutral grayscale + white CTA. Cleanest
  budget of the three. **PASS.**

### 4. At arm's length: 1st/2nd/3rd read of the page still content, not decoration.

Judged from the 400px-wide thumbnail render of each full page:

- **C1** — 1st read: dark page, hero shapes nearly vanish (thin light
  strokes on dark background lose contrast at this size). 2nd read: the CTA
  pill. 3rd read: content grid. The "signature" is close to invisible at
  arm's length — it doesn't compete with content, but it also doesn't
  register as a signature. **Marginal — content wins by default, not by
  design.**
- **C2** — 1st read: a saturated purple/teal color patch top-right — a
  strong, immediate graphic anchor even at 400px. 2nd read: the grid of
  green-gradient cards, which at small size risk reading as colorful UI
  chrome before resolving into "these are post covers." 3rd read: text
  content. **PASS** on signature presence; minor risk on cover legibility
  noted above (ties to criterion 2).
- **C3** — 1st read: almost nothing — the pale grey blobs barely register
  against the dark background; the page reads as "mostly empty /
  unstyled" rather than "quiet." **Borderline FAIL** — restraint requires
  enough presence to read as intentional; this undershoots into looking
  incomplete.

### 5. Would rauno/emil ship it — or does it read agency creative-dev?

- **C1** — Dashed-everywhere reads like a designer leaving the
  annotation/spec layer visible as decoration — a recognizable agency /
  portfolio-dev tic, not rauno/emil restraint. **FAIL.**
- **C2** — Closest match to the working reference points: one crafted
  material motif plus grain, otherwise plain layout, matching the flat+grain
  idiom design.md cites for 2025–26 and the author's own history. **PASS**,
  contingent on the cover-gradient legibility risk from criterion 2 being
  resolved.
- **C3** — Undershoots restraint into placeholder territory rather than
  landing it — real rauno/emil-register sites (cited in design.md) still
  commit to visible texture/motion; bare, ungrained grey ellipses read as
  "unfinished Figma file," a different failure mode from C1's overshoot but
  still not a shipped, confident portfolio look in this static form.
  **FAIL in stills** (same motion caveat as criterion 1).

## Summary table

| Criterion | C1 — Dashed chrome | C2 — Material | C3 — Quiet |
|---|---|---|---|
| 1. Signature in one sentence | FAIL — names a technique, not a device | PASS | FAIL in stills (motion-only signature) |
| 2. No false semantics | FAIL — 2 elements (rings, pill) | soft FAIL — 1 element (gradient-as-skeleton risk) | FAIL — 1 element (grey-blob-as-placeholder) |
| 3. Hover verb / accent budget | PASS (under-spent) | FAIL/marginal — 2 accent hues | PASS |
| 4. Arm's-length 1st/2nd/3rd read | Marginal — signature invisible | PASS — minor cover-legibility risk | Borderline FAIL — reads incomplete |
| 5. rauno/emil register | FAIL — agency creative-dev tic | PASS — contingent on #2 | FAIL in stills — undershoots into placeholder |

## Recommendation

**C2.** It is the only composition that clears criterion 1 outright, and its
two soft failures (criterion 2's gradient-legibility risk, criterion 3's
two-hue accent spread) are both fixable before implementation rather than
structural — they concern asset fidelity and palette discipline, not the
underlying device. C1 fails on the same grounds design.md already recorded
before the lab started (dashed borrows established UI-state semantics; it
cannot be an identity token), and the lab confirms it: as a whole-page
signature C1 reads as unfinished-annotation chrome, not brand. C3 is
genuinely the restraint floor, but in this static medium it undershoots past
restraint into looking incomplete — flat, ungrained grey ellipses are
themselves a placeholder convention, so C3's *sentence* ("quiet, one
self-draw moment") can't actually be judged fairly from stills: its whole
signature is a motion event Figma cannot render. That caveat should not
promote C3 by default, but it does mean C3 deserves a second look once the
self-draw animation exists in code, in case the moving version reads
differently than the frozen one.

Before implementation, if C2 is confirmed: (a) verify the noise-gradient
covers render with visible grain at real screen density so they don't read
as loading skeletons, and (b) fold the hero glyph's purple/indigo into the
same documented material palette as the cover gradients — one accent family,
not two — before `pnpm figma:verify` gets run against it.

## Winner (user decision)

