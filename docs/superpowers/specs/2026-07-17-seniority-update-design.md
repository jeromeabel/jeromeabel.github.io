# Blog Seniority Update — Design

**Date**: 2026-07-17
**Context**: Career 2026 strategy — job search deadline 2026-10-31. Site must signal
senior/product-engineer level to recruiters (FDE / Product Engineer / Fullstack Vue-Nuxt
positioning). This spec covers structure/curation only; new post authoring (P1 AI-Workflow,
P2 RFCs) is a separate track.

## Goals

- Recruiter path lands on strongest assets first: recent writing (Web Performance serie,
  Nuxt Clean Architecture), curated works.
- Junior signals (bootcamp projects, art-first framing) out of the spotlight but history
  preserved — depth itself is a seniority signal.
- Teaching/Fablab (1000+ trained) and OSS-since-2010 stories framed in About, not raw links.

## Decisions

| Topic | Decision |
|---|---|
| Works curation | `featured: z.boolean().default(false)` on work schema. Featured (~6) in spotlight grid; all others in compact "Archive" section below. No deletion, no 404s. |
| Blog curation | `featured: z.boolean().default(false)` on post/serie schemas. Home shows "Selected Writing". Blog page: series before posts. |
| Teaching/Fablab | About-page section only. Fablab work entry un-featured (archive). No pedagogical content stream. |
| Thumbnails | Reuse existing cover images on blog cards. Fill gaps only for featured items. No generated/drawn set for now. |
| Footer links | GitHub · LinkedIn · Email · RSS · Bluesky · Art Portfolio. Framagit removed from footer. |
| Framagit story | One framed line in About: open-source since 2010, creative-coding tools on Framagit, now GitHub. |
| RSS + sitemap | Add `@astrojs/rss` and `@astrojs/sitemap`. RSS icon in footer. |
| Tags cleanup | Deferred. `type` string field stays as-is. Taxonomy (tags) kept separate from editorial state (featured). |

## Per-page changes

### Home (`src/pages/index.astro`)

- **HeroText**: reword. Drop "front-end engineer working at uhlive / interactive arts"
  lead. New line targets unifying position: product-minded engineer, ships measured
  outcomes (−71.5% DOM, 4s→2.5s). uhlive link may stay while employed.
- **BlogPreview**: "Latest Posts" → "Selected Writing", pulls `featured` posts/series via
  repository. Fallback to latest if fewer than 4 featured.
- **WorksPreview**: "Latest Works" → "Selected Works", pulls `featured` works via new
  repository function (currently calls `getCollection` directly — bypasses repository).
- **Contact**: unchanged.

### Blog (`src/pages/blog.astro`)

- Section order flip: **Series first**, Posts below (series = strongest asset).
- No featured block on blog page — home "Selected Writing" + series-first ordering
  cover the curation need (YAGNI).
- Cards show cover thumbnails where covers exist.

### Work (`src/pages/work.astro`)

- Use new `getWorks()` repository function (featured filter + date sort).
- Spotlight grid: featured works only (~6).
- **Archive section** at bottom: compact list (text links or small cards) of
  non-featured works. Label frames as history, defusing junior signal.
- Intro text reframed engineering-first ("Built, shipped, measured"); art keeps a
  clause, stops leading.
- `[id].astro` unchanged — all work pages still built, deep links live.

### About (`src/pages/about.astro`)

- **New Teaching section**: Fablab, 1000+ people trained, workshops, years. Absorbs the
  archived Fablab work entry's story.
- **OSS line**: open-source since 2010 — Framagit (linked here, framed), now GitHub.
  Candidate: npm profile link (framework 5000+ downloads) as proof.
- **Bio reframe**: paragraph 1 currently leads with art — flip to engineering-first.
  Cut/compress OpenClassrooms bootcamp mention (junior flag) to "intensive reconversion".
- **CV download**: re-enable the commented-out button once CV 2026 PDF is ready.
- Values section unchanged.

### Footer (`src/components/app/Footer.astro`)

- Links: GitHub, LinkedIn, Email, RSS, Bluesky, Art Portfolio. Framagit removed.

## Featured selections (initial)

- **Works featured (~6)**: Portfolio, Kung Fu School, Commitcraty, Le concept de la
  preuve, Chimères Orchestra + one more art piece reframed with product/impact language
  (default candidate: La Malinette — framework, workshops, downloads). This list is the
  default; user may swap entries by editing frontmatter at any time.
- **Blog featured**: Web Performance serie, Nuxt Clean Architecture, (later) AI-Workflow
  post.

## Technical notes

- Repository (`src/utils/repository.ts`) becomes the single query point for works too —
  fixes `work.astro` / `WorksPreview.astro` bypassing it (no draft/featured filtering today).
- Work schema change is additive (`featured` defaults false) — no migration needed;
  only ~6 keeper files get `featured: true`.
- Posts keep existing `draft` mechanism; `featured` is additive there too.
- RSS: `@astrojs/rss` endpoint over posts + serie posts. Sitemap: `@astrojs/sitemap`
  integration in `astro.config.mjs`.

## Out of scope

- New post authoring (P1/P2 strategy track).
- LIKE post feature, dark-mode flash fix, repo rename, home animation a11y.
- Tags/taxonomy normalization of `type` field.
- Generated or hand-drawn thumbnail set.
