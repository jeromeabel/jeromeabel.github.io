---
created: 2026-08-04
status: research done — direction decided 2026-08-05, see design.md
---

# Artistic Direction — research capture

Question: main-branch artistic choices (dashed borders, floating hero shapes, LinkedIn
bounce, cross rotation, About gradient) — coherent direction or accumulated habits?
Goal: unique personal profile (artist-turned-engineer) + professional frontend craft
signal, pure HTML/CSS/JS/Tailwind (GSAP as extreme scoped bonus, no threejs).

Condensed verdicts also live in `.claude/skills/design-expert/references/artistic-direction.md`
(loaded by design-expert skill). This file holds the full research.

## Options considered (superseded by design.md)

The A/B/C framing below was the research-stage proposal. The actual decision was made against
the `EXP / Dashed` Figma board, which tested dashed *semantics* rather than whole-site
directions, and landed on chrome-only dashed + a hero self-draw moment. See `design.md`.

| Option | Summary | Pros | Cons |
|---|---|---|---|
| **A — "Sketch → Real" system (rec)** | Dashed = signature with honest semantic: dashed is the sketch, solid is the shipped thing; hover completes the line. Prose links go solid. Dashed lives on pills, icons, dividers, external markers, re-drawn dashed-outline hero shapes. Zero infinite motion. Motion tokens in `@theme`. | Builds on existing equity; cheap; narrative fits bio | Dashed pills brush drop-zone semantics — needs system-wide consistency |
| **B — One signature moment, silent chrome** | Rauno/Sara register: near-default everything + one authored hero moment (self-drawing SVG glyph, stroke-dasharray). | Safest hiring register; strongest restraint | Abandons dashed equity; personality only in one spot |
| **C — Chrome-as-demo** | Shadeed/Argyle register: scroll-driven animations, `:has()`, modern CSS as motif. | Strongest capability proof | Highest effort; Firefox gaps; show-off risk |

**Recommendation: A + B's peak-end moments** — sketch system everywhere, hero moment where
shapes draw themselves dashed then fill solid (bio in 2 seconds), 404 easter egg as the
"end" peak. Register: senior engineer with taste, escape valve for artist identity.

## Per-element verdicts (main branch inventory)

| Element (main-branch location) | Verdict |
|---|---|
| Dashed pills/icon circles/dividers (`Link.astro` icon/iconSmall/external, `ValueCard`) | Keep — the signature. Assign one honest semantic |
| Dashed underline on prose/default links (`Link.astro` default, `Prose.astro`) | Change to solid — dashed underline = abbr/tooltip convention (UA default, Carbon, Procore, Roselli, gwern) |
| Hand-drawn arrow + rotated caption (`ContactText.astro`) | Keep, static — hand-drawn annotation trend legitimated (Saaspo gallery) |
| LinkedIn bounce `animate-[bounce_2.5s_ease-in_infinite]` (`ContactText.astro:42`) | Refine: 2–3 bounces on reveal then rest; PRM-gate. Infinite fails web.dev/NN/g/HIG/Rauno/Kowalski |
| Cross −45°→0° card hover (`WorkCard.astro:52`, `WorkCardImage.astro:48`) | Keep — documented accordion/toggle micro-interaction vocabulary; transform-only. Minor: X at rest pre-reads "close" |
| Blog row arrow + translate-x (`PostListItem`, `SeriePostListItem`) | Already dropped v3 (Study C: 0/12 stack arrow+tint; survey confirms one hover verb) |
| About orange radial blob (`about.astro:11`) | Drop or convert (grain texture / dashed shape) — 2021-era cohort, 1/14 survey usage, off-identity |
| Hero floating shapes 7–8s infinite loops (`HeroAnimation.astro`) | Refine: shapes stay, loops die. Bauhaus-float = mass template genre (800+ stock templates, sellable AI prompts). Salvage: dashed outlines + structural placement + animate once on load or scroll-linked |
| `hover-fx` 0.4s CTA background wipe (`Link.astro`) | Minor: hover feedback ≤200ms |
| Illustrations | Keep (settled earlier) |

## Survey: 14 CSS-first creative-dev portfolios (fetched live CSS, 2026-08-04)

Sites: Lynn Fisher, Josh Comeau, Cassie Evans (archived), Jhey Tompkins, Sara Soueidan,
Adam Argyle, Amelia Wattenberger, Rauno Freiberg, Ahmad Shadeed, Max Böck, Temani Afif
(css-tip.com — afif.dev is NOT him), Julia Miocene, Brad Woods, Robb Owen.

Headlines:

1. **10/14 concentrate personality in ONE ownable device, then quiet.** Fisher: wavy
   underline (`text-decoration-style:wavy`) + annual rebuild archive. Jhey: self-drawing
   bear signature (stroke-dasharray stagger; only infinite = 6s eye blink). Owen: living
   SVG self-portrait (cursor-tracking eyes) + per-page duotone palette repaint on list
   hover ("themepeep"). Böck: 10-theme switcher + ink-fill link hover. Afif: pure-CSS
   pattern background, zero keyframes. Miocene: squircle "cquircle" card + single easing
   token. Shadeed: scroll-driven headers (`animation-timeline`), theatrical article set
   pieces. Playful-everywhere minority (Argyle, Woods, archived Cassie) gates everything
   (PRM, `@supports`, `hover:hover`).
2. **Ambient infinite animation nearly extinct.** 4 sites zero `@keyframes` (Fisher,
   Soueidan, Afif, Miocene). Comeau: 55+ keyframes, exactly one `infinite` (spinner,
   PRM-gated). Cassie shipped loops `paused`. Replacement idiom: scroll-progress-linked
   motion — moves only while you move.
3. **One ownable hover verb per site**: wavy underline / thick-underline-appears /
   highlighter sweep / red block-inversion / ink-fill / dim-underline-saturates /
   letter-spacing + palette repaint / neon glow. Minimalists use near-default hovers.
4. **Gradient blobs dead** (1/14 — Argyle low-alpha article mesh). Gradients survive as
   scrims, masks, scenic skies, engineered patterns.
5. **Nobody fakes sketchiness wholesale** — one analog gesture atop a precise system
   (wavy line, marker sweep, paper tilt ±1.5deg, drawn signature). Dashed as design token:
   only Brad Woods (`--border-dashed`, digital-garden identity).
6. **Craft signal in the CSS itself**: `:has()` group-hovers, `color-mix`, `@property`,
   view transitions, hand-baked `linear()` springs, `@starting-style`.
7. **Skill-proof placement bimodal**: chrome-as-demo (Fisher, Owen, Böck, Argyle, Rauno)
   vs plain-chrome + rich embedded work (Soueidan, Comeau, Shadeed, Miocene). Whichever
   side, the other goes quiet.

## Motion system rules (adopt regardless of direction)

- UI motion < 300ms. Hover/press 100–160ms; tooltips 125–200ms; modals 200–500ms;
  stagger 30–80ms/item. "180ms feels more responsive than 400ms."
- Easing: enter/exit → ease-out; on-screen morph → ease-in-out; color → plain ease;
  never ease-in on UI. Tokens: `--ease-out: cubic-bezier(0.23,1,0.32,1)`,
  `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`.
- `transform`/`opacity` only. Enter from scale(0.9–0.97)+opacity. Press scale(0.97).
- Frequency heuristic (Rauno): high-frequency chrome ≤150ms color/opacity or nothing;
  never animate keyboard-initiated actions; motion budget goes to novel first-visit
  surfaces.
- Infinite loops only for ongoing state (loading/live). WCAG 2.2.2 for >5s motion.
- Reduced motion = designed variant: keep opacity/color fades, drop transforms, stop
  scroll-linked/parallax. MotionToggle should drive same tokens.
- Tokenize durations+easings in Tailwind `@theme`; forbid ad-hoc values — coherence in
  devtools is itself the senior signal.
- CSS covers scroll-driven (`animation-timeline: view()` behind `@supports`, ~83%),
  `@starting-style`, view transitions (already via ClientRouter). GSAP earns 25KB only
  for SVG draw/morph timelines — scope to one component max ("whole site is CSS except
  3KB for the signature" is the flex).

## Hiring-signal findings

- Comeau ("Building an Effective Dev Portfolio"): most portfolios polished yet miss —
  signal is strategy + narrative, 2–5 curated case studies, memorable personal copy.
- HN hiring threads: writing + working demos carry; abandoned/half-done site worse than
  none; "clean fast readable beats flashy slow every time."
- Soueidan: never applied for a job — specialization clarity + deep articles, restrained
  chrome.
- Frontend/design roles are the exception where visual craft IS the résumé — but craft =
  fast, accessible, coherent, not spectacle.
- Peak-end rule (Kahneman/LawsOfUX): one great peak + strong ending beats ten mild
  flourishes. Canonical ending spots: 404, footer easter egg (zero critical-path cost,
  "cares in the least-required place" signal).
- Register risk for this profile: reading as "agency creative dev" (stabondar) when the
  target is "senior engineer with taste" (rauno/emil).

## Convention research (dashed specifics)

- Dotted/dashed underline documented meaning: abbr/tooltip/definition — UA default for
  `abbr[title]`, Carbon + Procore tooltip specs, Roselli "On Link Underlines" warning,
  gwern.net (dotted = popup annotation, links stay solid; "visual differences should be
  semantic differences").
- Dashed box: drop-zone/placeholder/empty-state (Polaris DropZone, react-dropzone,
  shadcn blocks).
- Dashed→solid on hover: zero external precedent as link pattern; internally coherent
  ("sketch → real") — reads as craft only if system-wide.
- Plus→X 45° rotation: documented accordion/disclosure vocabulary (LogRocket, theme
  frameworks, FA rotation utilities).

## Key sources

Motion: rauno.me/craft/interaction-design · emilkowal.ski/ui/great-animations ·
emilkowal.ski/ui/you-dont-need-animations · web.dev/learn/accessibility/motion ·
nngroup.com/articles/animation-usability · Apple HIG Motion.
Links/dashed: gwern.net/design · adrianroselli.com/2016/06/on-link-underlines.html ·
carbondesignsystem.com/components/tooltip/usage · polaris-react.shopify.com DropZone ·
css-tricks.com/styling-links-with-real-underlines.
Hiring: joshwcomeau.com/effective-portfolio · news.ycombinator.com/item?id=41656015 ·
sarasoueidan.com · lawsofux.com/peak-end-rule.
Trends: saaspo.com/assets/hand-drawn · muz.li Top 100 portfolios 2025/26 ·
colorshunter.com/blog/gradient-design-trends · css-zone.com/blog/css-gradient-trends-2026.
Portfolios surveyed: lynnandtonic.com · joshwcomeau.com · cassie.codes ·
jhey.dev · sarasoueidan.com · nerdy.dev · wattenberger.com · rauno.me · ishadeed.com ·
mxb.dev · css-tip.com · miocene.io · garden.bradwoods.io · robbowen.digital.
