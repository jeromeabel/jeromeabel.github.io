# Site refinements — decided spec (2026-07-18)

Follow-up to the seniority update (PR #103). Research-backed critique of home/blog/work/about pages, brainstormed 2026-07-18; all decisions below are final unless marked *(later)*.

Research inputs: 13 senior-dev hero texts (Comeau, Fu, Soueidan, Appleton, Wathan…), portfolio IA patterns (Chiang archive model, DesLauriers, Rauno), art-portfolio conventions; visual comparison artifact for the work page (approach A chosen).

---

## 1. Home — Hero

**Decided text** (merge of the two preferred variants — arc first, craft second):

> **H1:** Hi, I'm Jérôme.
> **P:** I've been making things with code since 2010 — robotic drum orchestras, audio tools, open-source frameworks, and now web applications. Here I write about the craft of building them well.

- No framework names in the hero (stack stays in About, Work, CV).
- H1 drops the surname ("Jérôme Abel" remains in header, SEO title, footer).

## 2. Home — Hero CTA + link targets

- Mailto contact becomes an **envelope icon** inside `HeroSocials` (same icon variant as GitHub/LinkedIn).
- Single text CTA moves out of the text column: centered scroll cue at the bottom of the hero section (inside the `lg:h-[500px]` box so it never falls below the fold): `↓ Start reading` → `#writing`.
- Add `scroll-mt-*` (~16) to the `#writing` section so the anchor doesn't land glued to the viewport top.
- Hit-area fix in `Link.astro`: `min-h-11` + `inline-flex items-center` on text variants, or `relative after:absolute after:-inset-2 after:content-['']` for inline links. Applies to `default` and `secondary` variants.

## 3. Home — Writing section

- Heading: **"Start here"** (replaces "Selected Writing").
- Intro sentence: **deleted** on home (redundant with /blog; re-listed topics).
- Ordering: featured curation stays on home; /blog stays published-date desc; *updated* date never reorders — show a small "updated <month year>" badge on revised posts instead. RSS keeps pubDate.

## 4. Home — Series vs posts distinction

- **Series stay cards** (flagship products: title, description, N parts · M min).
- **Posts switch to `PostListItem`** (the arrow-animated line style from /blog) — different format = instant distinction, one component (`PostCard`) removable.
- **Label fix: "Serie" → "Series"** in all user-facing text (cards, blog page headings, serie pages). Code identifiers/collection names unchanged.

## 5. Footer

Link order (identity → social → contact → subscribe):
`GitHub · Art Portfolio · Bluesky · LinkedIn · Email · RSS`

## 6. Blog page

- **Flip + merge**: lead with **"Latest"** — one merged reverse-chron list via existing `getAllBlogPosts()` (posts + serie posts interleaved) in `PostListItem` style. **"Series"** section below with the two series cards.
- Line-list enhancements: year separators (mono, muted); optional right-aligned topic tag (`font-mono text-xs`); updated badge per §3.
- Covers: existing article covers kept; **no image generation now**. *(later)* Illustration system: unify all cover/thumbnail images under one artistic direction (palette, contrast, texture) — generative and/or hand-drawn; also usable as OG-image pipeline.

## 7. Work page — approach A (tiered), decided via mockup comparison

- **"Selected work"** section (replaces "Featured"): 3–4 real case studies with year + type kicker on each card, framed as spanning both practices:
  - Chimères Orchestra (Art · 2013–2019)
  - La Malinette (Open source · 2013–2021)
  - Le Concept de la Preuve (Web · 2023)
  - This site / portfolio (Web · 2024–now) — optional 4th
  - Case-study structure on detail pages: problem → constraints → process/decisions → outcome → learnings.
- **"Archive"** table replaces the era-grouped mini-card sections: Year | Project | Type (Art/Web/Training/Volunteer/Teaching) | Built with | Link. One line per project, external links, **no detail pages owed** to shallow entries. Honest one-liners for volunteer/training work.
- Era grouping (`getEarlierWorksByEra`) retired in favor of the table (year column already carries chronology).
- *(later, optional)* Compact 5-dot career strip on the About page — the timeline idea at the scale where it works.

## 8. About page

- **Drop the "185 merged PRs · current role" stat.** Remaining row: `2010 coding since · 21 articles published · 5000+ framework downloads · 1000+ people trained` (grid becomes 4 columns).
- **Spacing bug** ("onFramagit", "onGitHub"): Astro `compressHTML` eats the wrapped newline before inline `<Link>`. Fix with explicit `{" "}` before each inline Link in `AboutText.astro`; audit every `Prose` paragraph with inline links (uhlive, jeromeabel.net, La Malinette).

## 9. Home — Work section (quick fixes)

- `WorkMiniCard`: remove border/padding box — bare image tile + title (previous minimal style).
- **Retina blur fix**: `widths={[160, 240, 320, 480, 640]}` and `sizes` matched to real rendered widths per breakpoint (tiles render ~220–280px CSS → need 2× candidates). Verify source images ≥ 2× largest display size. Sanity-check `WorkCard` sizes too.

## 10. CV system — separate project *(own plan)*

New repo `~/code/projects/cv`, **Typst + YAML**:

- `data/cv.fr.yaml`, `data/cv.en.yaml` — experiences/formations/skills as arrays.
- `template.typ` — layout functions reading the YAML; `assets/` for photo/icons.
- Variants as inputs: `--input lang=fr --input phone=true` (replaces the two Inkscape contact layers).
- Migration: embed a PNG of the current CV as semi-transparent underlay in the template while rebuilding, then remove. One font family (fixes the current 6-spelling chaos). `typst watch` + tinymist for live preview.
- Rationale: current SVG has 24 Inkscape-only `flowRoot` elements and no text reflow — the alignment pain is the format, not the workflow.

---

## Implementation order (suggested)

1. Quick fixes batch: labels "Series", footer order, About stat + `{" "}` spacing, WorkMiniCard widths, Link hit areas, `scroll-mt`.
2. Home: hero text + CTA/socials rework, "Start here" section (posts→PostListItem, drop intro).
3. Blog page flip + merge (+ year separators, updated badge).
4. Work page: Selected work + Archive table (repository changes: retire era grouping, add archive query).
5. Case-study content writing (Chimères, Malinette, Le Concept de la Preuve) — content work, can trail the layout.
6. CV project — separate repo/plan.

Backlog *(later)*: illustration system for covers; About career strip.
