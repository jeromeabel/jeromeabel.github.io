---
title: Layout survey — selected-work sections on live portfolio sites
created: 2026-08-15
spec: ./design.md
method: 3 parallel research agents, WebFetch markup inspection + WebSearch literature, 2026-08-15
---

# Layout survey — how real portfolios lay out "selected work"

Question under test: is the **uniform case-block stack** (four equal-weight case blocks,
one per row) a proven pattern for `/work` Selected at 4 entries — or do real sites prefer
2×2 grids or 1+N asymmetry? Secondary: how common are the devices the design round leans on
(numbering, descriptions, hover)?

Taxonomy: (a) uniform case-block stack · (b) uniform card grid · (c) 1+N asymmetric ·
(d) thin gallery · (e) text rows / ledger · (f) other (WebGL/custom).

## Cohort 1 — developer portfolios (8 with a work section, 4 retired/pivoted)

| site                                        | category              | #               | description?              | notes                                                                                          |
| ------------------------------------------- | --------------------- | --------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| brittanychiang.com                          | (e)→(a) borderline    | 4               | 1–2 sentences + tech tags | uniform rows, small 16:9 thumb left, text right; sibling rows dim on hover; archive link below |
| brianlovin.com                              | (e) ledger            | 13              | one-liner                 | plain list, no images                                                                          |
| antfu.me/projects                           | (e) ledger            | 80+ grouped     | one-liner                 | thematic groups, pure list                                                                     |
| rauno.me/projects                           | (e) ledger            | 9               | none — title + year       | chronological, stripped                                                                        |
| paco.me                                     | (e) ledger            | 3               | one-liner                 | ~8 lines total                                                                                 |
| olaolu.dev/work                             | (e) rows w/ logos     | 7               | none                      | SPA, low confidence                                                                            |
| seanhalpin.xyz                              | (f) mosaic 2-across   | 4               | none — category + title   | colored-card mosaic, alternating widths                                                        |
| maximeheckel.com                            | (f) narrative + tiles | ~15 in 4 themes | per-theme paragraph       | editorial subsections + demo tiles                                                             |
| joshwcomeau, leerob, cassie.codes, jhey.dev | —                     | —               | —                         | **no work section anymore** — pivoted to content-only or retired                               |

## Cohort 2 — designer / creative-technologist portfolios (9 classifiable)

| site                                                      | category               | #    | description?                   | notes                                          |
| --------------------------------------------------------- | ---------------------- | ---- | ------------------------------ | ---------------------------------------------- |
| vanschneider.com                                          | (a) stack              | 5    | 2–4 sentence paragraph         | large gallery + title + discipline + CTA       |
| adhamdannaway.com                                         | (a) stack              | 3    | none — title + discipline      | whole block one link                           |
| lynnandtonic.com/work                                     | (a) stack (minimal)    | 15   | none — thumb + title + URL     | image does the talking                         |
| tobiasahlin.com                                           | (a) stack              | 3    | paragraph                      | generous vertical spacing                      |
| davidhellmann.com                                         | (a) stack              | 4    | metadata line (`Y. 2017 C. …`) | labeled Year/Client/Agency + CTA               |
| robbowen.digital                                          | (e) rows w/ paragraphs | 3    | paragraph + impact stat        | open-source, no images                         |
| thibaut.cool                                              | (e) ledger             | ~4–5 | mostly metadata                | rows link to Behance                           |
| tiger.exposed                                             | (e) ledger             | 25+  | none                           | **only numbered index found** (plain 1. 2. 3.) |
| lonalih.com                                               | (e) ledger             | 5    | none                           | year headers                                   |
| bruno-simon, activetheory, aristidebenoist, danielspatzek | (f) WebGL              | —    | —                              | award-tier, separate genre                     |

## Cohort 3 — showcase galleries + literature (8 sites via SiteInspire / Case Study Club)

| site                | category           | #   | notes                                      |
| ------------------- | ------------------ | --- | ------------------------------------------ |
| brittanychiang.com  | (a)/(e)            | 4   | (also in cohort 1)                         |
| kysondana.com       | (a) stack, zigzag  | 4   | exactly 4, one-liner each, per-project CTA |
| tparkes.com         | (a) stack          | ~6  | outcome-framed blurbs                      |
| rfeasley.io         | (e) ledger         | 4   | exactly 4, no images, paragraph each       |
| thatedchao.com      | (e)/(a) borderline | 5   | title + org + year rows                    |
| antonsten.com       | (d) thin gallery   | ~7  | image-only strip                           |
| karinasirqueira.com | (d) gallery        | 7   | thumbnails only                            |
| pratibhajoshi.com   | (b) grid 2–3 col   | 6   | title + category cards                     |

Literature (thecrit.co, casestudy.club, Figma resource library, slategit, fantasticportfolios):
grids are the most common pattern _overall_ but recommended for **4–8 thumbnail-friendly**
entries and warned against at low counts; vertical "story scroll" is explicitly recommended
for **few, writing-heavy case studies**; consensus range is **3–5 projects with real
descriptions**, equal reading weight, "not a wall of thumbnails"; hiring managers prefer 4
substantive projects over 12 brief ones.

## Tally (~25 classifiable sites)

| category                     | count |
| ---------------------------- | ----- |
| (e) text rows / ledger       | ~11   |
| (a) uniform case-block stack | ~9    |
| (d) thin gallery             | 2     |
| (f) custom / WebGL           | 6     |
| (b) uniform card grid        | 1     |
| **(c) 1+N asymmetric**       | **0** |

## Findings

1. **1+N asymmetric: zero occurrences.** Recommended "in theory" by one layout article
   ("Magazine"), observed on no real site. The spec's suspicion — one-big hierarchy is blog
   grammar, not work grammar — is confirmed by the field.
2. **Uniform case-block stack is the modal pattern at exactly 4 described projects**
   (brittanychiang, kysondana, davidhellmann, rfeasley-as-ledger). Zigzag alternation is
   common. Literature's "story scroll" maps onto it directly.
3. **The field splits into exactly two families: stack and ledger.** This portfolio's
   `/work` page already mirrors that — Selected (stack candidate) + `ArchiveTable` (ledger).
   The page structure is validated; only the Selected form was in question.
4. **2×2 / card grids are weak at N=4.** One grid found, at 6 entries; literature warns
   against grids at low counts and for non-thumbnail-friendly work.
5. **Numbering (`01 / 02`) is essentially absent in the wild** — one site, as a plain index.
   The inspiration set's 6 numbered refs over-represent it. Caution for direction B: the DS
   argument (mono numerals = generated facts) still stands, but "common device" does not.
6. **Descriptions at N≤5: one line to two sentences, or none.** Sites with real paragraphs
   keep counts at 3–5. Nobody writes two-line blog-style teasers. Input for open question
   "keep or cut": the field keeps _short_ (≤2 sentences) or cuts to caption; nothing longer.
7. **Nothing essential is hover-revealed anywhere** (only decorative treatments; one
   sibling-dim). Validates the DS touch rule; the shipped `WorkOverlayCard` is an outlier.
8. Context: a third of the famous dev-portfolio canon (joshwcomeau, leerob, cassie.codes,
   jhey.dev) no longer has a work section at all.

## Caveats

Sample skews to fetchable static/SSR sites; award-tier JS/WebGL portfolios (godly.website
tier) resisted scraping and would over-represent (f). Two of three galleries (godly,
land-book) blocked fetching; SiteInspire + Case Study Club used instead.

## Implications for the design round

- **`/work` Selected at 4 → uniform case-block stack is the evidence-backed default** (D in
  uniform form). 1+3 asymmetric loses its main defense; a variant proposing it must beat the
  stack with a specific argument, not taste.
- 2×2 grid demoted from "equally live" to long-shot at N=4.
- Direction B's numbering: keep as exploration, drop the "reads as a familiar catalogue
  device" assumption.
- Home strip (3 plates) unaffected — this survey is about the `/work` composition.
