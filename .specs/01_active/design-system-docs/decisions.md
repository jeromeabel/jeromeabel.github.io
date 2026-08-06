---
created: 2026-08-06
---

# Validated decision copy — harvested from the Docs sheet 2026-08-06

Every caption below is **verbatim** from the live `DOCS / Design System — Light` frame
(`2545:672`), which itself carried these over from the old `SPEC / Specimen` page. This file
exists so the restructure in `plan.md` re-homes validated wording instead of rewriting it.
Do not paraphrase these strings when rebuilding — copy them.

## Three-layer identity

The identity thesis from `.specs/02_archives/artistic-direction/design.md` and
`.claude/skills/design-expert/references/artistic-direction.md`:

| Layer       | What it is                                                              | Register it serves                             |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| **Chrome**  | Nav, header, footer, buttons, toggles, icons — the operating surface    | frontend/engineer: precise, quiet, predictable |
| **Content** | Cards, rows, prose, metadata — the reading surface                      | editorial: hierarchy and scanability           |
| **Hand**    | The five author-drawn SVGs — black stroke on transparent, `dark:invert` | artistic: one controlled escape valve          |

The rule that makes it cohesive rather than three styles bolted together: **only one layer is
allowed to be expressive at a time.** Chrome and Content are precise so the Hand layer reads as
deliberate. Every decision below is tagged with the layer it governs; a reader who scans only
the tags should come away with the thesis.

Register target: senior engineer with taste, not agency creative dev.

## The twelve property decisions

Each entry: the layer tag, the verbatim caption(s), and the live specimens that demonstrate it.
`→ chapter` is where `plan.md` re-homes it.

### Border — layer: Content → chapter 03

- `PostRow · border-b hairline (list row)`
- `SerieCard · full border (aggregate entity)`
- `PostCardPreviewSmall · borderless (image is the frame)`

Rule behind it: border marks an **aggregate entity** — a container of parts. Source section
`2545:674`, h428, 3 live specimen cells.

### Radius — layer: Chrome + Content → chapter 01 (vocabulary) referenced from 02/03

- `Link/CTA · full (pressable)`
- `SerieCard · lg 8px (holds media)`
- `PostRow · 0 (reading surface)`

Exactly three values, never two on one element. Source `2545:7178`, h428.

### Icons — layer: Chrome → chapter 02

- `16 · inline with metadata`
- `20 · buttons and nav`
- `24 · standalone`

Source `2545:7216`, h85, arrow-right at all three sizes.

### Buttons — layer: Chrome → chapter 02

- `Link/CTA · Primary, ≤1 per viewport`
- `Link/Secondary · unlimited`
- `Link/SecondarySm · small secondary`
- `Link/TextCTA · Text CTA, one per section header`
- `Link/Icon · chrome control`

Four Figma components implementing three button styles; `Link/Icon` and the toggles are chrome
controls, outside the button count. Source `2545:7234`, h117.

### Hover — layer: Chrome + Content → chapter 03

One verb per surface, ≤150ms. Authoritative table, verbatim:

- `NavLink · colour muted → foreground`
- `Link/CTA · fill inverts (foreground → background)`
- `Link/Secondary · background fills (surface-hover)`
- `Link/SecondarySm · background fills (surface-hover)`
- `Link/TextCTA · colour muted → foreground (text+icon)`
- `Link/Icon · background fills (surface-hover)`
- `PostRow · background tint (surface-hover)`
- `SerieCard · border lightens (border → foreground-muted)`
- `Preview card · title underline + slow cover scale (coupled)`

Each row is a rest/hover pair of live instances. Source `2545:7268`, h529 — the tallest
non-illustration section and the one carrying the most decision weight.

### Type — layer: Content → chapter 01

- `Display · Bubbler One · page H1 only`
- `Reading · IBM Plex Sans · prose and titles`
- `Machine · Fira Code · dates, read time, counters`

Three families, three jobs. Display never appears at card size. Source `2545:7464`, h131.

### Numbers — layer: Content → chapter 02

- `SerieMeta · '6 PARTS' counter, muted`
- `PostMetadataTime (day) · mono tabular`
- `PostMetadataTime (no-date) · mono tabular`

Source `2545:7479`, h77.

### Spacing — layer: all three → chapter 01

- `4px base. Ladder: 0.5rem inside a component, 1.5rem between components, --spacing-section between sections.`
- `FINDING: no instantiable spacing-ladder component exists in the library — a spacing ladder is a set of numbers, not a component. Not hand-drawn here per Task 9 rule.`

The FINDING is honest and should survive, but it currently leaves the section as a text-only
row. `plan.md` closes it by rendering the ladder from the `3 Responsive` resolved values
instead of hand-drawing bars.

### Colour — layer: Chrome + Content → chapter 01

- `Serie chip · accent (folder icon + n/N)`
- `Active nav link · accent`
- `Single teal accent. Budget: serie chips, section CTAs, active nav, focus rings, hover underline decoration. FINDING: no instantiable focus-ring or section-CTA-accent state exists as a separate variant to demonstrate here.`

Source `2545:7501`, h134.

### Backgrounds — layer: Chrome → chapter 03

- `Header · flat --color-background, no gradient`
- `Footer · flat --color-surface, no gradient`

Demonstrated with live `Header` and `Footer` instances. Source `2545:7516`, h348.

### Illustration — layer: Hand → chapter 03

- `The signature layer. Black stroke on transparent, dark:invert. Moved (not copied) from the old SPEC / Specimen page — these are the actual asset files, not re-uploads.`
- `hero.svg · 42 KB · self-draws once on load`
- `values/quality.svg · 35 KB · section glyph`
- `404.svg · crosshatch shading`
- `arrow-curve.svg · pointing, not decorating`
- `footer.svg · 66 KB · feConvolveMatrix roughen, page-wide`

Source `2546:282`, h1336 — oversized, capped in `plan.md` Task 9 Step 2.

### Motion — layer: Chrome + Hand → chapter 01

- `MotionToggle · state=on`
- `MotionToggle · state=off (reduced motion)`
- `--duration-fast 150ms, --duration-base 250ms, --duration-slow 400ms, --ease-out, --ease-in-out. Zero infinite loops. FINDING: duration/easing tokens are CSS values with no visual Figma component of their own — only the MotionToggle control (chrome) that gates them is instantiable here; the hero self-draw load moment is explicitly out of scope for this docs page.`

Source `2546:297`, h134.

## Decisions with no Figma section yet

These are settled in `design-expert/SKILL.md` and `artistic-direction/design.md` but have no
specimen on the Docs sheet. They belong in the rebuilt doc as decision cards without specimens:

- **One chip per card/row.** Serie chip wins over topic chip — serie membership implies topic.
- **Display font is page-level only.** Already stated under Type; the _consequence_ (card
  titles use sans bold) has no specimen pairing it against a display-font counter-example.
- **Metadata is the third reading layer** — mono, uppercase, ~12px, muted, but ≥4.5:1.
- **Folder icon = serie and nothing else.** Topics get no icon.
- **Dashed is removed from the library**, surviving only in the hero self-draw start state
  (`stroke-dasharray` animating to solid, not a CSS border). Worth stating explicitly: a
  recruiter reading the sheet cannot see an absence.
