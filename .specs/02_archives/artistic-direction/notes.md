---
created: 2026-08-04
status: research done — first decision 2026-08-05 AM reopened same day; lab framing in design.md
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
the `EXP / Dashed` Figma board, which tested dashed _semantics_ rather than whole-site
directions, and landed on chrome-only dashed + a hero self-draw moment. See `design.md`.

| Option                                      | Summary                                                                                                                                                                                                                                                                                    | Pros                                                 | Cons                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **A — "Sketch → Real" system (rec)**        | Dashed = signature with honest semantic: dashed is the sketch, solid is the shipped thing; hover completes the line. Prose links go solid. Dashed lives on pills, icons, dividers, external markers, re-drawn dashed-outline hero shapes. Zero infinite motion. Motion tokens in `@theme`. | Builds on existing equity; cheap; narrative fits bio | Dashed pills brush drop-zone semantics — needs system-wide consistency |
| **B — One signature moment, silent chrome** | Rauno/Sara register: near-default everything + one authored hero moment (self-drawing SVG glyph, stroke-dasharray).                                                                                                                                                                        | Safest hiring register; strongest restraint          | Abandons dashed equity; personality only in one spot                   |
| **C — Chrome-as-demo**                      | Shadeed/Argyle register: scroll-driven animations, `:has()`, modern CSS as motif.                                                                                                                                                                                                          | Strongest capability proof                           | Highest effort; Firefox gaps; show-off risk                            |

**Recommendation: A + B's peak-end moments** — sketch system everywhere, hero moment where
shapes draw themselves dashed then fill solid (bio in 2 seconds), 404 easter egg as the
"end" peak. Register: senior engineer with taste, escape valve for artist identity.

## Per-element verdicts (main branch inventory)

| Element (main-branch location)                                                         | Verdict                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashed pills/icon circles/dividers (`Link.astro` icon/iconSmall/external, `ValueCard`) | Keep — the signature. Assign one honest semantic                                                                                                                                                         |
| Dashed underline on prose/default links (`Link.astro` default, `Prose.astro`)          | Change to solid — dashed underline = abbr/tooltip convention (UA default, Carbon, Procore, Roselli, gwern)                                                                                               |
| Hand-drawn arrow + rotated caption (`ContactText.astro`)                               | Keep, static — hand-drawn annotation trend legitimated (Saaspo gallery)                                                                                                                                  |
| LinkedIn bounce `animate-[bounce_2.5s_ease-in_infinite]` (`ContactText.astro:42`)      | Refine: 2–3 bounces on reveal then rest; PRM-gate. Infinite fails web.dev/NN/g/HIG/Rauno/Kowalski                                                                                                        |
| Cross −45°→0° card hover (`WorkCard.astro:52`, `WorkCardImage.astro:48`)               | Keep — documented accordion/toggle micro-interaction vocabulary; transform-only. Minor: X at rest pre-reads "close"                                                                                      |
| Blog row arrow + translate-x (`PostListItem`, `SeriePostListItem`)                     | Already dropped v3 (Study C: 0/12 stack arrow+tint; survey confirms one hover verb)                                                                                                                      |
| About orange radial blob (`about.astro:11`)                                            | Drop or convert (grain texture / dashed shape) — 2021-era cohort, 1/14 survey usage, off-identity                                                                                                        |
| Hero floating shapes 7–8s infinite loops (`HeroAnimation.astro`)                       | Refine: shapes stay, loops die. Bauhaus-float = mass template genre (800+ stock templates, sellable AI prompts). Salvage: dashed outlines + structural placement + animate once on load or scroll-linked |
| `hover-fx` 0.4s CTA background wipe (`Link.astro`)                                     | Minor: hover feedback ≤200ms                                                                                                                                                                             |
| Illustrations                                                                          | Keep (settled earlier)                                                                                                                                                                                   |

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

## Dashed-as-identity analysis (2026-08-05 PM — why round 1 was reopened)

Round 1 ("dashed = chrome only", AM) fixed dashed's _semantic collisions_ but never asked
whether dashed can carry _identity_. On review it can't. Analysis:

**1. Dashed is a state vocabulary, not a brand vocabulary.** Every documented use of a
dashed stroke encodes _temporary / pending / annotation_: drop zone (Polaris, shadcn,
react-dropzone), placeholder/empty state, marching-ants selection, cut-here line,
`abbr[title]` underline, draft/pending states in diagramming tools. Users read dashed as
"not finished" or "meta". A signature must be nameable as a positive quality; "the site
where borders are dashed" names a stroke setting, not a sensibility.

**2. Chrome-only placement drained the one narrative that justified it.** The A-option
story ("dashed is the sketch, solid is the shipped thing") is honest _only where a sketch
state exists_. An external-link pill, an icon circle, a scroll cue are finished chrome —
they are never "sketches", so dashed on them is decoration wearing a semantic costume.
User articulated this directly: "external links are not a sketch concept". The AM decision
kept the stroke and lost the story.

**3. Empirical disproof from own experiments.** The XP1 boards
(`ihWIWmvtQPTWgUxlrVjC2c`, home 2001:1670 / blog 2116:869) were built free-form, not to
test dashed — and dashed almost vanished. Personality arrived through **material** instead:
crosshatched hand-drawn 3D glyphs (hero), outline hand-drawn shapes (footer),
noise-gradient covers with grain relief. When the author designs unconstrained, the
signature that emerges is texture/matière, not stroke style.

**4. Material fits the identity better than line style.** Survey finding #4: 2025–26 warmth
idiom = flat + grain/paper texture (blobs dead). Crosshatch = ink texture — hand-made AND
material, scales to hero size where a 1.5px dashed line disappears. Site already ships
feTurbulence (`ContactNoise.astro`). Printmaking / robot-drummer background is physical and
material. Dashed-as-token belongs to Brad Woods (digital-garden identity, survey 5);
grain/hatch is unclaimed in the cohort.

**5. What dashed keeps: its only honest job.** As the _sketch state_ inside the hero
self-draw (dashed outline resolving to solid/hatched fill, once, on load), dashed performs
"sketch becomes real" literally — state vocabulary used _as_ a state. That survives every
convention check and needs no other call site to be legible.

**Decisions from this analysis** (recorded in design.md):

- Dashed rejected as identity token / chrome system. 6/3 SVG utility on hold — only
  justified if the lab's C1 control somehow wins.
- Working hypothesis: signature = material (grain + crosshatch) + one hand gesture;
  standard layout + DS-rework hover everywhere else.
- Decided by a Figma-only variation lab: three full home compositions (C1 dashed chrome
  control / C2 material / C3 quiet + one moment), layout/links/hover held constant,
  judged on: signature nameable in one sentence, no false semantics, one hover verb,
  content-first reads, rauno/emil register.
- Hero stage: ~85vh + "Start reading" scroll cue (compact-height variant of the winner for
  fold-cost comparison). Motion: hero self-draw on load + at most one scroll-linked effect
  (`animation-timeline: view()`); storyboarded in Figma, validated in code post-lab.
- Round-1 survivors unaffected: solid link underlines (4px offset), one hover verb, motion
  tokens, zero infinite loops, blob dropped.

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
