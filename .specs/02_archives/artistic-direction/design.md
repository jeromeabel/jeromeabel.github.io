---
shipped: 2026-08-06
created: 2026-08-05
status: design — visual language spec (lab closed 2026-08-05 PM, signature settled)
---

# Artistic Direction — visual language

Defines the site's visual language: the signature layer, and what every visual property
_means_ so a call-site decision is a lookup, not a debate. Research lives in
[notes.md](notes.md). Component-level rules (chips, hover verbs, accent budget) live in the
`design-expert` skill and are referenced, not repeated.

Target branch: `redesign/v3`.

## Lab closed — why

The three-composition Figma lab (C1 dashed / C2 material / C3 quiet) is **abandoned**. Two
failures:

1. **Wrong axis.** The plan duplicated one frame and mutated four small deltas (hero shape
   treatment, cover fill, dash presence, footer). Three pages 95% identical cannot show a
   direction. The free-form XP1 board
   ([2001:1670](https://www.figma.com/design/ihWIWmvtQPTWgUxlrVjC2c/?node-id=2001-1670))
   is better than all three lab pages because it was composed, not diffed.
2. **Scoring stills is not judgment.** `lab-eval.md` graded screenshots PASS/FAIL against
   five criteria. Mechanical work with no design value — deleted.

**And the question was already answered by the repo.** C2's "crosshatched hand-drawn 3D
glyphs" were a Figma imitation of assets that already ship:

| Asset                                                                | Nature                                            |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| `src/assets/images/hero.svg` (42 KB)                                 | hand-drawn Inkscape, crosshatch shading           |
| `src/assets/images/footer.svg` (66 KB)                               | drawn outline + `feConvolveMatrix` roughen filter |
| `src/assets/images/values/{quality,creativity,user}.svg` (35 KB ea.) | drawn, clipPath-shaded                            |
| `404.svg`, `arrow-curve.svg`, `skills*.svg`                          | same hand                                         |

All black-on-transparent, all rendered through `dark:invert` (`HeroAnimation.astro:47`,
`ValueCard.astro:17`, `404.astro:11`, `ContactImage.astro:7`). Author-drawn, shipped,
consistent with the printmaking history, and unclaimed in the 14-portfolio cohort
(notes.md survey #5: nobody else owns hand-drawn line art as a system). No lab was needed
to discover it.

**Signature = the drawn layer.** Everything else exists to stay out of its way.

## The three layers

Each layer has a closed vocabulary. An element belongs to exactly one.

| Layer                  | Reads as                      | Vocabulary                                                                   | Never                                              |
| ---------------------- | ----------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| **Chrome** — engineer  | precise, quiet infrastructure | 1px hairlines, pill radius, mono metadata, lucide 1.5px icons, flat surfaces | textured, drawn, gradient, animated beyond 150ms   |
| **Content** — frontend | readable, scannable           | cards, rows, prose, type scale, one hover verb per surface                   | decorated, accent-titled                           |
| **Hand** — artist      | authored, physical            | drawn SVG line art, crosshatch, `dark:invert`, the hero self-draw            | inside a card, below ~200px, more than 3× per page |

### Affordance grammar

Four rules generate the rest:

- **Radius = pressability.** Pill → you can press it. Soft (8px) → it holds media. Square →
  it holds text.
- **Line weight = interactivity.** Everything structural is 1px. There is no 2px, no
  emphasis-by-thickness.
- **Texture = authorship.** Only the Hand layer and covers carry texture. Texture anywhere
  in chrome is a lie about who made it.
- **Only content moves.** Chrome transitions colour ≤150ms. The Hand layer animates exactly
  once, on load. Nothing loops.

## Property rules

### Border

| Rule                                                                                                    | Meaning                             |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1px only, colour `--color-border`                                                                       | structure, never emphasis           |
| Full border = **aggregate entity** — a container of parts (SerieCard, work meta table, footer top rule) | "these things belong together"      |
| `border-b` hairline = list-row separator; rows only                                                     | list idiom, not a box               |
| Preview cards borderless — the image is the frame                                                       | consistency is per-role, not global |
| `border-2` **dies** (2 call sites)                                                                      | no emphasis-by-thickness            |
| `border-current` / foreground-coloured borders die, except the CTA where border matches its own fill    | borders are structure, not text     |

**Dashed is removed from all chrome** — 9 call sites: `Link.astro` `default` / `icon` /
`iconSmall` / `external`, `Prose.astro` `prose-a`, `ValueCard`, dividers. Rationale in
notes.md §"Dashed-as-identity analysis": dashed is a _state_ vocabulary (drop zone,
`abbr`, marching ants, pending) and cannot carry identity. Every `hover:border-solid`
dies with it.

**One survivor:** the hero self-draw start state — an SVG `stroke-dasharray` animating to
solid, not a CSS border. There dashed performs "sketch becomes real" literally, which is
the only honest use.

**Consequence:** the 6/3 dash utility is dead weight. Do not build it.

**Phase 1 outcome (Figma, 2026-08-05):** dashed cleared at 3 source components —
`Link/Icon / size=normal, state=default` (`2093:441`), `Link/Icon / size=small,
state=default` (`2095:452`), `Link/External / size=normal, state=default` (`2096:592`) —
which propagates to 30 instance nodes across the library and both page frames. The
`state=hover` siblings gained a `--color-surface-hover` fill so hover still reads once
both states are solid.

**Figma's own frame chrome is not design and is excluded from every audit.**
`COMPONENT_SET` frames render with a dashed purple boundary and `cornerRadius: 5`;
`SECTION` frames carry `cornerRadius: 2`. A naive sweep counts those as drift — the
plan's original "45 dashed" figure included them. Skip `COMPONENT_SET` and `SECTION`
node types in any future dashed or radius audit, or the same false positives return.

### Radius

Three values, meaning-bound. Matches what the codebase already does (`rounded-full` ×7,
`rounded-lg` ×4) — this formalises it and forbids the rest.

| Value      | Applies to                                          | Meaning                          |
| ---------- | --------------------------------------------------- | -------------------------------- |
| `full`     | buttons, chips, icon circles, pills, focus rings    | pressable                        |
| `lg` (8px) | images, covers, media-holding cards                 | an object with a surface         |
| `0`        | rows, tables, prose blocks, illustrations, dividers | a reading surface, not an object |

No `sm` / `md` / `xl`. Never two radii on one element.

**Phase 1 outcome (Figma, 2026-08-05):** collapsed at 11 source components, propagating to
55 instance nodes: chips `2371:10413` + `2371:10344` (4 → `full`), covers/media cards
`2034:188`, `2385:7131`, `2039:413`, `2385:7141`, `2045:358`, `2119:7516`, `2367:7192`
(16 → `lg`), and the two `SerieCard` cover containers `2119:7502` + `2367:7193` (mixed
`[16,16,0,0]` corners → uniform `lg`). Post-fix histogram on design nodes is exactly
`{lg, full}` — no stray radius remains outside the dead `.PostTopic(backup)` /
`.PostMetadataTopic(back)` / `.IconBackup` sets, which Phase 1 deleted outright.

**Same exclusion as §Border applies here:** `COMPONENT_SET` chrome (`cornerRadius: 5`) and
`SECTION` frames (`cornerRadius: 2`) are Figma UI, not a fourth radius value — never counted
in the histogram above, never a target to "fix."

### Icons

- **lucide**, 1.5px stroke, `currentColor`. Sizes: **16** inline with metadata, **20** in
  buttons and nav, **24** standalone.
- **fa6-brands** only for social, 20px, inside icon circles.
- Icon colour follows its text. Accent only in an active state.
- An icon never stands alone as a control without an accessible label.
- **Folder icon is reserved for serie membership** and nothing else (design-expert rule 7).
  Topics get no icon.
- Below ~200px an illustration becomes illegible — use an icon there instead. That is the
  boundary between the Hand layer and the Chrome layer.

### Buttons

Exactly three. Anything else is a link.

| Variant                      | Style                                                     | Budget                 |
| ---------------------------- | --------------------------------------------------------- | ---------------------- |
| **Primary** (`cta`)          | filled `--color-foreground`, pill, 20px icon              | ≤1 per viewport        |
| **Secondary**                | 1px `--color-border`, pill, hover `--color-surface-hover` | unlimited              |
| **Text CTA** (`All posts →`) | accent text + arrow, no border, hover underline ⚠️        | one per section header |

Changes required: the `external` variant loses its dashed border and becomes a small
Secondary. The `cta` hover wipe (`hover-fx`, currently 0.4s) retunes to a ≤150ms colour
change — 400ms violates the chrome frequency rule.

**Figma component names (source of truth for future code):** `Link/CTA` (Primary),
`Link/Secondary` (Secondary), `Link/External` renamed `Link/SecondarySm` (small
Secondary — externality is a property of the `href`, not of the style), and the new
`Link/TextCTA` (Text CTA, built fresh in Phase 1 — no equivalent existed before).
`Link/Icon` and the theme/motion toggles are chrome controls, not button styles, and stay
outside this vocabulary of three.

**⚠️ Text CTA hover verb — known gap, do not silently trust the "underline" above:** the
`### Hover` section below verifies this against the real Figma `Link/TextCTA` component
(`textDecoration: NONE` in both `state=default` and `state=hover`) and finds the actual
verb is a colour change, muted → foreground, text + icon together — the same verb as
`NavLink`, not an underline. The row above states the original codebase intent, which was
never built into the Figma component; §Hover is the verified authority for what the
component actually does. Until Figma is changed to match this row (or this row is changed
to match Figma), treat §Hover as correct.

### Hover

One verb per surface, ≤150ms (`--duration-fast`), `--ease-out`. A hover state that looks
identical to its default state is a bug; so is a hover that changes two things. Verified by
diffing every `state=default` / `state=hover` variant pair in the Figma `Components (new)`
page (fills, strokes, radius, effects) against its default.

| Surface                   | Verb                                                            | Token                          |
| ------------------------- | --------------------------------------------------------------- | ------------------------------ |
| Row (`PostRow`)           | background tint                                                 | `--color-surface-hover`        |
| Borderless preview card   | title underline + slow cover scale, coupled                     | `--duration-slow` on the scale |
| `SerieCard`               | border lightens (`--color-border` → `--color-foreground-muted`) | `--color-foreground-muted`     |
| Primary (`Link/CTA`)      | fill inverts (`--color-foreground` → `--color-background`)      | `--color-background`           |
| Secondary / SecondarySm   | background fills                                                | `--color-surface-hover`        |
| Text CTA                  | colour goes muted → foreground, text + icon together            | `--color-foreground`           |
| Icon circle (`Link/Icon`) | background fills                                                | `--color-surface-hover`        |
| Nav link                  | colour goes from muted to foreground                            | `--color-foreground`           |
| Prose link                | underline already present at rest; colour unchanged             | —                              |

**Rows corrected against what the Figma file actually does**, not the first draft of this
table:

- `SerieCard` was a **triple-stacked hover** in Figma — border colour, a background fill,
  _and_ the title text gaining `textDecoration: UNDERLINE` all changed on `state=hover`.
  Fixed at the source component (fill reverted to none, title underline reverted to
  `NONE`); this table lists the single surviving verb, which also matches what
  §Data-inventory already said (`hover border lighten`).
- `Link/TextCTA` does **not** underline on hover in Figma — `textDecoration` is `NONE` in
  both states. Its text and icon change colour from muted to foreground instead, the same
  verb as `NavLink`. The Buttons table above still says "hover underline" for this variant;
  that line describes a codebase intent that hasn't been built into the Figma component, and
  is flagged here rather than silently overridden.
- `Link/Secondary` and `Link/SecondarySm` were also stacked (fill _and_ border colour both
  changed) and got the same fix — border colour reverted to its default binding, leaving
  background-fill as the one verb.

**Observed but not a verb:** inside `PostRow`'s hover state, the nested topic-chip fill
steps from `--color-surface` to `--color-surface-raised` — a legitimate, separately-bound
token pairing that keeps the static chip legible against the row's new background. It
doesn't compete with the row's own single verb (background tint), so it isn't listed as a
second row.

**What hover must never do:** change the border from dashed to solid (dashed no longer
exists), turn a title accent (it collides with the serie chip — `design-expert` rule 4),
dim or tint a cover image, or move an element more than 2%.

**Reduced motion:** keep every colour and opacity change, drop every transform, land on
the final state immediately.

### Type

Three registers, each with a job. Mixing them is what makes a page look designed or not.

| Register | Font                         | Job                                            | Meaning          |
| -------- | ---------------------------- | ---------------------------------------------- | ---------------- |
| Display  | Bubbler One (`--font-title`) | page H1 only (`BLOG`, `WORK`)                  | the page's name  |
| Reading  | IBM Plex Sans                | everything prose and title                     | human writing    |
| Machine  | Fira Code (`--font-mono`)    | dates, read time, counters, topic labels, code | a generated fact |

- Weights: **400** body, **600** titles and emphasis. No 500, no 700.
- Display font never appears at card or row size — it kills scanning (design-expert rule 5).
- Mono is uppercase only for strings ≤3 words, never sentences, and must clear 4.5:1.

### Numbers

Always mono, tabular figures. Counters (`2/5`, `6 parts`, `18 min`) are muted — never
accent, because accent promises a click target that isn't there.

### Spacing

- 4px base (Tailwind default). Section rhythm already tokenised: `--spacing-section` 2rem,
  `--spacing-section-lg` 6rem.
- Three-step ladder, no arbitrary values: **0.5rem** inside a component, **1.5rem** between
  components, **section token** between sections.
- Arbitrary bracket values (`p-[13px]`) are a bug.

### Colour

Settled — see `global.css`, which already carries per-mode contrast rationale. Unchanged:
single teal accent, budget = serie chips, section CTAs, active nav, focus rings, hover
underline decoration. Nothing else.

Addition: **the Hand layer is never coloured.** It is foreground-black, inverted in dark
mode. Colour in an illustration would put it in competition with the accent.

### Backgrounds

- Flat only. `--color-background` for the page, `--color-surface` for lifted chrome,
  `--color-surface-hover` / `--color-surface-raised` for state.
- **No gradient in chrome, ever.** The About radial blob is dropped and nothing replaces it
  (1/14 in survey; 2021-era idiom).
- Texture appears in exactly two places: the drawn SVGs and post/work covers. Nowhere else.

### Illustration — the signature layer

The rules that keep it a system rather than decoration:

| Rule                                                                                                                     | Why                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Black stroke on transparent; `dark:invert` (or `invert-80` where pure white glares, as `HeroImage.astro:8` already does) | one asset, both modes, no duplicate exports         |
| Crosshatch / roughen fills allowed (`footer.svg` `feConvolveMatrix`)                                                     | the material _is_ the identity                      |
| Minimum render ~200px                                                                                                    | below that the line weight disappears — use an icon |
| Maximum 3 illustration moments per page                                                                                  | scarcity is what makes it read as authored          |
| Never inside a card, row, or chip                                                                                        | it is a page-level gesture, not a component part    |
| Never in the same viewport as a photo                                                                                    | two competing materials cancel out                  |
| Allowed slots: hero, section end / footer, 404, About values                                                             | matches current call sites                          |

### Motion

Unchanged from round 1 — these survived the reopen:

- Tokens in `@theme`: `--duration-fast: 150ms`, `--duration-base: 250ms`,
  `--duration-slow: 400ms`, `--ease-out: cubic-bezier(0.23,1,0.32,1)`,
  `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`. Ad-hoc values forbidden.
- **Zero infinite loops.** LinkedIn bounce → 3 bounces on reveal then rest; `anim-width` →
  one pass; hero float loops die.
- **Load:** hero drawn shapes self-draw once, dashed outline → solid/hatched, ~1.2s, pure
  CSS `stroke-dasharray`. The one authored moment.
- **Scroll:** at most one scroll-_linked_ effect (`animation-timeline: view()`). Existing
  `.reveal` one-shots retimed onto tokens; no new ones.
- **Hover:** one verb per surface, ≤150ms. Row → bg tint. Borderless card → title underline
  - slow image scale, coupled. SerieCard → border lighten, alone (the Figma component
    carried an extra background lift and a title underline until Task 7 — both reverted at
    the source; see §Hover for the full table).
- **Reduced motion:** designed variant — keep opacity/colour fades, drop transforms, final
  state immediately. Driven by the same tokens via `MotionToggle`.

## Data inventory

Every content object, its layer, and where its rules live.

| Object                           | Layer          | Rules                                                            |
| -------------------------------- | -------------- | ---------------------------------------------------------------- |
| Page heading (H1)                | Content        | display font, page-level only                                    |
| Section heading (`BLOG`, `WORK`) | Content        | mono uppercase + text CTA on the right                           |
| Card / row title                 | Content        | sans 600, hover = underline, never accent                        |
| Description                      | Content        | sans 400 muted, 2 lines max in cards                             |
| Prose link                       | Content        | **solid** underline, `text-underline-offset: 4px`                |
| Button                           | Chrome         | 3 variants above                                                 |
| Preview card                     | Content        | borderless, image is the frame, `rounded-lg` cover               |
| Row                              | Content        | `border-b` hairline, hover bg tint, no arrow                     |
| SerieCard                        | Content        | full 1px border (aggregate), padding, hover border lighten       |
| Featured post                    | Content        | larger cover + full description; no badge, size is the signal    |
| Work / case study                | Content        | same card grammar as blog; meta table gets a border              |
| Topic label                      | Chrome         | mono muted box, zero interactive affordance until filters exist  |
| Serie chip                       | Chrome         | folder icon + name + `n/N`, accent, one chip per card/row        |
| About / values                   | Hand + Content | drawn value SVGs, ≥200px, no card border                         |
| CV                               | Chrome         | Secondary button → PDF (source: Typst repo `~/code/projects/cv`) |
| Profile text                     | Content        | sans, conversational, no marketing abstractions                  |
| Numbers / counters               | Chrome         | mono tabular, muted                                              |
| Covers                           | open           | see below                                                        |

## Open questions

1. **Cover treatment** — current photos vs XP1's noise-gradient system. XP1's gradients look
   good in isolation but carry two risks worth checking at real density: smooth two-tone
   fills pre-read as loading skeletons, and the green-teal family collides with the teal
   accent. Owned by cover-studio; decide before that pipeline runs.
2. **Hero stage height** — ~85vh with "Start reading" cue (XP1) vs compact. Decide against
   the real page, not a Figma frame.
3. **`dark:invert` vs `invert-80`** — `HeroImage` uses 80%, everything else uses 100%. Pick
   one and apply it to all Hand-layer assets.

## Out of scope

- **Cover generation** — cover-studio owns it.
- **404 easter egg** — revisit after the hero moment ships.
- **6/3 dash utility** — dead, per §Border.

## Specimen sheet — built

**Rebuilt from live instances, independently verified.** Task 9 replaced the hand-built
`SPEC / Specimen` page with a docs page assembled from real `createInstance()` calls against
the actual library components — so fixing a component fixes the docs. The old page (`2485:2`)
is deleted; there is no drawn exhibit left anywhere in the file. Re-verified 2026-08-06:
0 broken instance bindings across all 12 sections in both frames, exactly 5 illustration
assets present (4 in the `hero/quality/404/arrow-curve` group + 1 `footer`), and a whole-file
sweep found no orphaned duplicate illustration set left behind by the mid-task cleanup.

Figma DS file `ihWIWmvtQPTWgUxlrVjC2c`, page **`📐 Docs / Design System`** (`2545:671`), two frames:

| Sheet                          | Node        | Mode            |
| ------------------------------ | ----------- | --------------- |
| `DOCS / Design System — Light` | `2545:672`  | `Theme` → Light |
| `DOCS / Design System — Dark`  | `2547:7597` | `Theme` → Dark  |

Twelve sections, one per property rule above: Border, Radius, Icons, Buttons, Hover, Type,
Numbers, Spacing, Colour, Backgrounds, Illustration, Motion. Every specimen except the
illustrations is a live component instance (`Link/CTA`, `Link/Secondary`, `Link/SecondarySm`,
`Link/TextCTA`, `Link/Icon`, `PostRow`, `SerieCard`, `PostCardPreviewSmall`, `NavLink`, `H1`,
`H2`, `PostMetadataTime`, `SerieMeta`, `Header`, `Footer`, `MotionToggle`, etc.), so the sheet
cannot drift from the library it documents. The dark sheet is a clone of the light sheet with
the `Theme` variable mode reapplied, not hand-recoloured — every bound instance repainted
itself. Three sections have no instantiable component and are documented findings rather than
drawn substitutes: **Spacing** (the ladder is a set of numbers, not a component), **Colour**
(no separate focus-ring or section-CTA-accent variant exists to demonstrate), and **Motion**
(duration/easing are CSS values with no Figma component of their own — only `MotionToggle`
is real). The five illustrations are the **actual** files (`hero.svg`, `footer.svg`, `404.svg`,
`values/quality.svg`, `arrow-curve.svg`) moved (not re-imported) from the old page as vector
trees; their paints are intentionally left unbound to colour tokens. The dark copies are clones
with every channel flipped (`r,g,b → 1-r,1-g,1-b`, including gradient stops), which is what
`dark:invert` does — confirmed against the old page's hand-authored dark set before deletion
(matching descendant counts, no unique content lost).

**Two debts the invert test surfaced** — both real, both worth fixing before the redesign lands:

- `hero.svg` hardcodes `#f5ffe1` inside the file. Under `invert` that becomes a blue-black
  (`#0a001e`), not `--color-background`. Those shapes should be transparent.
- `src/assets/icons/cross-big.svg` hardcodes `stroke:#fff` instead of `currentColor`, so it
  renders in dark and is invisible in light.

The old `EXP / Dashed` board (`Wf4iomVMYUXlFIBV3Z8bx4`, node 483:2) and the `LAB / C1–C3`
pages are superseded; leave them parked as negative reference.

## Exit criteria

Tracked against `plan.md`'s four phases:

- **Phase 1 — Figma library clean.** ✅ Done. Dashed removed at 3 source components / 30
  nodes; radii collapsed at 11 sources / 55 nodes; button vocabulary closed to 4 Figma
  components (`Link/CTA`, `Link/Secondary`, `Link/SecondarySm`, `Link/TextCTA`) implementing
  3 styles; three dead backup component sets deleted. Figma's own `COMPONENT_SET` /
  `SECTION` chrome is excluded from all of the above (see §Border, §Radius).
- **Phase 2 — Home + Blog validated.** ✅ Done. `v3/Home — 1920 — Dark` (`2001:1670`) and
  `v3/Blog — 1920 — Dark` (`2116:869`) both pass the full checklist (see
  `validation-home.md`, `validation-blog.md`). Gap, left open on purpose: both frames are
  Dark at 1920 only — no light-mode or narrow-width twin exists yet.
- **Phase 3 — Document.** ✅ Done. Hover documented (`### Hover`, Task 7) and this file, the
  `design-expert` skill reference, and memory brought current. Specimen rebuilt from live
  instances (Task 9) and independently re-verified — see "Specimen sheet — built" above.
- **Phase 4 — Code.** Deferred, not started. Full change list in `plan.md`'s Phase 4
  appendix (`C1`–`C9`): motion tokens, `Link.astro` rewrite, `border-2` removal, the two
  SVG debts (`hero.svg` background fill, `cross-big.svg` `currentColor`), and more. No
  `src/` file has been touched by this spec's work so far.

The three open questions above remain open — none are resolved by Phases 1–3 and none are
ticked here.
