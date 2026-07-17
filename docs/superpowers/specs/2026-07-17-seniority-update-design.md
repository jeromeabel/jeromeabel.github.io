# Blog Seniority Update — Design (v2)

**Date**: 2026-07-17 (v2 — supersedes v1 same day)
**Context**: Career 2026 strategy — job search deadline 2026-10-31. Site must signal
senior/product-engineer level (FDE / Product Engineer / Fullstack Vue positioning).
Structure/curation only; new post authoring (P1 AI-Workflow, P2 RFCs) is a separate track.

## Core reframe (v2)

Works cannot prove current skill: job work is private, side projects are old or small.
Stop asking them to. Each surface gets the job it can honestly do:

| Surface | Proves | Cannot prove |
|---|---|---|
| Blog (perf serie, clean-arch serie, upcoming P1/P2) | **Current skill**, senior thinking, measurement culture | — |
| `nuxt-clean-architecture` repo (26⭐) + serie | Architecture judgment in Nuxt ecosystem | Shipped Nuxt product |
| Works | **Trajectory**: 15 years, diversity of languages/domains, critical thinking in write-ups | Current stack competence |
| Jobs (private) | Everything | Showable |

Consequences:
- **Writing-first everywhere.** Home leads with Selected Writing. Works demoted to a
  compact trajectory layer — never presented as "this is my current level".
- **Works stay public.** Hiding them leaves "what have you built?" unanswered. They
  answer a different question: who is this person, how long, how wide.
- **No BS.** Every hero/About claim must be verifiable on the site itself. Facts
  (years, languages, artifacts, numbers) — no self-adjectives ("product-minded"),
  no naked job metrics out of context.

## Goals

- Recruiter path lands on strongest current assets first: Web Performance serie,
  Nuxt Clean Architecture serie, then curated story-rich works.
- Junior signals (bootcamp projects, wishlist-tone abstracts, art-first identity)
  out of the spotlight; history preserved and framed — depth is a seniority signal.
- Teaching/Fablab (1000+ trained) and OSS-since-2010 framed in About, not raw links.
- No dead-product promises: nothing featured that a recruiter can click into a
  4-year-stale, non-runnable project presented as current.

## Decisions

| Topic | Decision |
|---|---|
| Featured mechanism | `featured: z.number().optional()` on work + post/serie schemas. Set = featured, value = display rank (1 first). Absent = archive/normal. One field does selection AND ordering — boolean + date sort cannot manage priority. |
| Works featured | **4 entries**: Le concept de la preuve (1), Portfolio (2), Chimères Orchestra (3), Logariat (4). Story-rich, write-ups show critical thinking. Six was arbitrary; four honest ones beat six padded. |
| Commitcraty | Archive. Small art-niche tool, weakest signal. (v1 featured it — reversed.) |
| La Malinette | **Not featured** (v1 had it top-6 — reversed). 4y stale, likely non-executable; live link = anti-signal. Becomes one past-tense line in About: framework used in schools, 5000+ downloads. Reference URL: https://reso-nance.org/malinette/. |
| Kung Fu School | Archive. May be promoted later ONLY after abstract rewrite ("I would like to integrate…" wishlist tone = junior tell). |
| Bootcamp works | Archive (argentbank, fisheye, hrnet, la-forme…). Matches strategy "hide oc-p* junior signal". |
| Archive presentation | NOT compact text links (v1 — reversed). Thumbnail mini-cards (all entries have `img_preview`), grouped by era, labeled **"Earlier work"** — "Archive" smells like attic. Era grouping turns history into a 15-year timeline = depth signal. |
| Blog curation | Blog page: series before posts. Home "Selected Writing" = serie cards + featured posts (see Home). |
| Nuxt gap | No shipped Nuxt product exists. Position: Vue = 2.5y job experience (statable fact), Nuxt = architecture work (repo + serie). Do NOT claim "Nuxt product engineer" site-wide. Side project in Nuxt (strategy §3) decided after P1 post ships — competes with writing time. |
| Teaching/Fablab | About-page section only. Fablab work entry archived. No pedagogical content stream. |
| Thumbnails | Reuse existing cover images. Fill gaps only for featured items. No generated/drawn set. |
| Footer links | GitHub · LinkedIn · Email · RSS · Bluesky · Art Portfolio. Framagit removed. |
| Framagit story | One framed line in About: open-source since 2010, creative-coding tools on Framagit, now GitHub. |
| RSS + sitemap | Add `@astrojs/rss` and `@astrojs/sitemap`. RSS icon in footer. |
| Tags cleanup | Deferred. `type` string field stays. Taxonomy separate from editorial state. |

## Per-page changes

### Home (`src/pages/index.astro`)

Order: Hero → Selected Writing → Works strip → Contact.

- **HeroText**: rewrite, facts only. Requirements:
  - Says: builds web apps (Vue/TypeScript ecosystem); coding since 2010 across many
    languages/domains; fully committed since reconversion (~2022).
  - One art clause as diversity/duration proof, not identity.
  - **No metrics** (−71.5% DOM etc. — private-job numbers belong in perf-serie posts
    and About where context exists, not a hero tagline).
  - No "product-minded" or any self-adjective. No uhlive link (label to kill per
    strategy; funding ends Oct 31 — hero sells next role). uhlive stays in About only.
  - Draft direction: *"I build web applications with Vue & TypeScript. Coding since
    2010 — robotic art installations, audio tools, open-source frameworks — full-time
    web engineer since my reconversion in 2022."*
- **BlogPreview → "Selected Writing"**: needs a **serie-level card** (component gap —
  `BlogPreview.astro` currently maps only post/seriePost). Layout: 2 serie cards
  (Web Performance, Nuxt Clean Architecture) + 2 featured standalone posts, via
  repository `featured` rank. Fallback: latest posts if fewer featured.
- **WorksPreview → compact works strip** (v1 "Selected Works" 3-card grid — reversed).
  Small band: one line — "15 years of building — from robotic drummers to web apps" —
  plus the 4 featured entries as mini-cards or titles, link to /work. Pulls from new
  repository function (currently bypasses repository via raw `getCollection`).
- **Contact**: unchanged.

### Blog (`src/pages/blog.astro`)

- Section order flip: **Series first**, Posts below.
- No featured block on blog page (YAGNI — home + series-first cover curation).
- Cards show cover thumbnails where covers exist.
- **Bug fix**: `<Layout page="Work">` → `page="Blog"` (wrong title on blog page,
  recruiter-visible, SEO).

### Work (`src/pages/work.astro`)

- Use new `getWorks()` repository function (featured rank + date sort).
- **Featured section**: the 4 story-rich entries, ordered by rank.
- **"Earlier work" sections**: remaining entries as thumbnail mini-cards grouped by
  era — e.g. "Interactive art & research (2012–2021)", "Training projects (2022–2023)".
- **Intro text** carries the honest framing that defuses "why is everything old?":
  *"My day-to-day engineering work is private. What's here is the open history — art
  systems, tools, experiments — where you can see how I think."* Engineering-first,
  art keeps a clause.
- `[id].astro` unchanged — all work pages built, deep links live. Project write-ups
  are the value (critical thinking), grid is just the index.

### About (`src/pages/about.astro`)

- **Bio reframe**: flip paragraph 1 engineering-first; compress OpenClassrooms
  bootcamp mention to "intensive reconversion".
- **Aggregate facts line** (receipts that leak nothing private): coding since 2010 ·
  185 merged PRs at current role · 21 articles · framework 5000+ downloads ·
  1000+ people trained.
- **New Teaching section**: Fablab, 1000+ trained, workshops, years. Absorbs archived
  Fablab entry's story.
- **OSS line**: open-source since 2010 — Framagit (linked here, framed), now GitHub.
- **Malinette line**: past tense — built and maintained an open-source creative-coding
  framework used in schools (5000+ downloads). Link https://reso-nance.org/malinette/.
  No "live product" framing.
- **Employer names**: keep Raccourci/uhlive names in About as factual timeline
  (already public on LinkedIn/CV); work *detail* stays private. Only hero drops uhlive.
- **CV download**: re-enable commented-out button once CV 2026 PDF ready.
- Values section (`AboutValues.astro` + `ValueCard.astro` + `src/assets/images/values/*.svg`):
  dead code — imported nowhere, `about.astro` renders only `<AboutText />`. Left in place,
  untouched, out of scope. Note if revived: its copy ("Creativity fuels innovation…") is
  claim-without-evidence and its Quality card duplicates the AboutText closing paragraph —
  both conflict with the facts-only copy rule, so a revival needs a copy rewrite first.

### Footer (`src/components/app/Footer.astro`)

- Links: GitHub, LinkedIn, Email, RSS, Bluesky, Art Portfolio. Framagit removed.

## Featured selections (initial frontmatter)

- **Works**: leconceptdelapreuve `featured: 1`, portfolio `featured: 2`,
  chimeres-orchestra `featured: 3`, logariat `featured: 4`. Swappable anytime by
  editing frontmatter.
- **Blog**: Web Performance serie, Nuxt Clean Architecture serie, (later) AI-Workflow
  post.

## Technical notes

- Repository (`src/utils/repository.ts`) becomes single query point for works too —
  `work.astro` / `WorksPreview.astro` currently bypass it.
- Schema change additive: `featured` optional number, no default needed; absent =
  not featured. Only 4 work files + 2 serie files get the field. No migration.
- Posts keep existing `draft` mechanism; `featured` additive.
- Era grouping for "Earlier work": derive from `date` (buckets in code), no new
  frontmatter field.
- RSS: `@astrojs/rss` over posts + serie posts. Sitemap: `@astrojs/sitemap` in
  `astro.config.mjs`.

## Out of scope

- New post authoring (P1/P2 strategy track).
- Nuxt side project (decide after P1 ships).
- KFS abstract rewrite (precondition for any future promotion, separate edit).
- LIKE post feature, dark-mode flash fix, repo rename, home animation a11y.
- Tags/taxonomy normalization of `type` field.
- Generated or hand-drawn thumbnail set.
