---
shipped: 2026-07-19
title: Work / About / Blog relationship
created: 2026-07-18
---

# Work / About / Blog relationship — design

> Original stub (2026-07-18): Revisit how the Work, About, and Blog sections
> connect: navigation, cross-linking, and narrative flow between portfolio, bio,
> and writing. Size: M.

Design pass 2026-07-19. Written against the just-shipped v3 redesign
(`redesign/v3`, PR #104). This is an information-architecture item, not a single
feature — the deliverable is concrete nav + cross-linking proposals, and a
split into shippable sub-items.

**Status:** S1 (connective tissue), S2 (related modules), and S3 (homepage bio strip) all shipped 2026-07-19. S3 unblocked by Jérôme supplying the strip copy directly ("Front-end engineer, writing about performance, testing, and AI workflows. I used to build robot drummers. Ask me sometime."); `AboutStrip.astro` sits between WorksStrip and Contact in `index.astro`, additive, reuses `Link variant="secondary"` + `.reveal reveal-bottom` motion gate.

## Problem / context

Every top page is reachable from the header, but once you're _on_ a page the
site stops helping you move sideways. Three symptoms:

1. **About is an internal dead-end.** It's the bio and the narrative spine
   (the "art → product" arc v3 is positioned around), yet it links only
   _outward_ (uhlive, jeromeabel.net, Malinette, GitHub, CV). A recruiter who
   reads About has no in-page route to the Work that proves it or the Blog that
   shows the craft — only the header.
2. **Detail pages dead-end at the bottom.** A `/work/[id]` project page ends
   after its markdown: no "related writing", no next project, no back-to-work
   CTA beyond the small breadcrumb. A standalone `/blog/[id]` post ends with
   nothing at all — no pagination (only _serie_ posts get prev/next), no
   related posts, no back-to-blog. The reader hits a wall.
3. **Work and Blog never cross-link at the content level**, despite obvious
   overlap (the web-performance serie ↔ the benchmark/table work; the
   API-endpoints post ↔ its own project). work.astro says in prose "the writing
   covers how I build now" and links to `/blog` — but no specific post ever
   points at a specific project or vice-versa. There's also no shared taxonomy
   to join them: works carry `type`/`stack`, posts carry `topic`.

Plus the **footer is not a sitemap** — it's external identity links + RSS only,
so the one surface present on every page that _could_ offer Blog/Work/About
routes offers none.

None of this is broken; it's under-connected. The nav works, breadcrumbs exist,
v3 made each section individually good. What's missing is the connective tissue
between them.

## Current IA map

### Pages & internal link graph

| Page            | File                                                         | Internal out-links                                                              | Bottom-of-page                         |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------- |
| Home            | `src/pages/index.astro:11-16`                                | `/blog` (All posts), `/work` (All work), post/serie/work cards; **no `/about`** | Contact (mailto + socials)             |
| About           | `src/pages/about.astro:14` → `AboutText.astro`               | **none internal** — all external (`AboutText.astro:21,42,45,62,65`)             | nothing                                |
| Blog            | `src/pages/blog.astro`                                       | `/blog/[id]`, `/blog/[serie]`                                                   | Series grid                            |
| Post            | `src/pages/blog/[id].astro:42-45`                            | breadcrumb `/blog` only                                                         | **nothing** (no prev/next, no related) |
| Serie           | `src/pages/blog/[serie]/index.astro:37-44`                   | breadcrumb `/blog`, its posts                                                   | post list                              |
| Serie post      | `src/pages/blog/[serie]/[post].astro:75-89,123-151`          | breadcrumb `/blog` + serie; prev/next **within serie only**                     | serie pagination                       |
| Work            | `src/pages/work.astro:29-34`                                 | `/blog` ("the writing"), `/work/[id]` cards, archive rows                       | More-projects table                    |
| Project         | `src/pages/work/[id].astro:27-35` → `WorkHeader.astro:14-19` | breadcrumb `/work`, external project links                                      | **nothing** (no related, no next)      |
| Header (global) | `src/components/app/Header.astro:5-10`                       | `/`, `/blog`, `/work`, `/about`                                                 | —                                      |
| Footer (global) | `src/components/app/Footer.astro:6-13`                       | **none internal** — GitHub, art portfolio, Bluesky, LinkedIn, Email, RSS        | —                                      |

### Dead-ends, concretely

- **About → {Work, Blog}**: missing. About is terminal internally.
- **Home → About**: missing. The homepage body has Hero → Writing → Work →
  Contact; there is no bio block and no `/about` link outside the header, so the
  "art → product" arc lives only on a page nothing on the homepage points to.
- **Project page bottom**: no related writing, no next/prev project, no
  back-to-work CTA (`work/[id].astro:27-35`).
- **Post page bottom**: standalone posts have zero pagination and no related
  posts (`blog/[id].astro` ends at `</Prose>`, line 77).
- **Footer**: no Blog/Work/About routes anywhere (`Footer.astro:6-13`).
- **Work ↔ Blog content links**: none; no join key between `type`/`stack` and
  `topic`.

What already works (don't rebuild): header reaches all four sections and marks
active state; breadcrumbs exist on post/serie/project headers; serie posts have
in-serie prev/next; home already links out to `/blog` and `/work` via the
section CTAs.

## Approaches

### A — Connective tissue (footer sitemap + end-of-page CTAs + About outbound)

Pure markup, no data model. Three moves:

- **Footer becomes a real sitemap**: add an "Explore" group (Home / Blog / Work
  / About) alongside the existing external group; keep RSS. Now every page has
  section routes at the bottom.
- **End-of-page CTAs on detail pages**: project pages get a "← All work" +
  (optional) next-project link; standalone post pages get "← All blog" (and
  reuse the existing `LinkNavPost` for prev/next by date). Cheap, kills the
  bottom-of-page walls.
- **About gets outbound internal links**: a closing strip — "See the work →
  `/work` · Read the writing → `/blog`" (+ the existing contact route). Turns
  the terminal bio into a fork.

**Pros:** cheapest; zero schema/content churn; fixes the literal dead-ends;
no v3 risk (adds to Footer + page bottoms, touches none of the shipped v3
sections); ships in one small PR. Establishes the cross-link vocabulary the
blog items can then reuse.
**Cons:** links are _section-level_, not content-level — no "this post relates
to this project." Connective, not editorial. A sitemap footer is generic.

### B — Content-level "related" modules (editorial Work ↔ Blog links)

Introduce a curated relation and render "Related" blocks.

- Add optional frontmatter references, e.g. `related_posts: reference('post')[]`
  on `work`, and/or `related_work: reference('work')[]` on `post`
  (`content.config.ts`). Manual curation — the content set is small (~3 featured
  works, handful of posts/series), so author-picked references are precise and
  honest; auto-by-tag is fragile because works and posts share no vocabulary
  today.
- Render a "Related writing" module at the bottom of `work/[id]` (reusing
  `PostRowCalm`) and a "Related work" module on `blog/[id]` (reusing a work
  mini-card). Only render when a relation exists.

**Pros:** the real IA win — genuinely weaves Work and Blog, delivering on
work.astro's "the writing covers how I build now" promise. The web-performance
serie ↔ benchmark work link is exactly what a technical reader wants.
**Cons:** needs a schema change + a content-authoring pass on each entry; only
pays off where relations actually exist (small N, some pages show nothing);
manual upkeep. Overlaps blog-v2-1 (see dependencies) — must not be built twice.

### C — Narrative homepage flow + About-as-hub

Give the site a story spine instead of four isolated statements.

- Add a **condensed bio strip to the homepage** (Hero already says "Hi, I'm
  Jérôme" but there's no bio and no `/about` link in the body): a short "art →
  product" line + "More about me → `/about`", placed after Work or before
  Contact.
- Make **About a hub**, not a leaf (this is A's About move, taken further with a
  proper section rather than a link strip).
- Optionally **sequence the homepage** to tell the arc: Hero (person) → Work
  (proof) → Writing (craft) → bio strip → Contact.

**Pros:** activates the v3 "art → product arc" positioning across the homepage,
not just on a page nobody links to; strongest for a portfolio's story; converts
About from leaf to hub.
**Cons:** touches _just-shipped_ v3 homepage composition — must stay strictly
additive (add a bio strip; do **not** rework the Writing/Work sections locked in
v3 §3/§4). Reordering a fresh layout is a visible change. Needs Jérôme's voice
for the bio strip, and that copy overlaps the still-looping hero-copy track — so
it's copy-blocked, not just code.

## Recommendation

**Layered, in this order: A now, B where relations are real, C deferred.**

- **A first.** It's the safe baseline: fixes the worst dead-ends (About,
  detail-page bottoms, footer), needs no schema or content, and carries zero v3
  regression risk because it only adds to the footer and page bottoms. It also
  defines the link pattern the blog items reuse.
- **B second, curated small.** Wire up only the handful of Work↔Blog relations
  that genuinely exist (start with the web-performance serie ↔ the table/
  benchmark work, and the API-endpoints post ↔ its project). Skip auto-tagging.
- **C deferred / optional.** The homepage bio strip is worthwhile but is a
  copy + layout decision that overlaps the open hero-copy loop and touches
  shipped v3 composition. Do it after hero copy freezes, as its own item — don't
  let it block A/B.

## Implementation sketch

**A (sub-item S1):**

- `Footer.astro:6-16` — add an internal-links group (Home/Blog/Work/About);
  keep the external group + RSS. Two `<ul>`s in the existing flex row.
- `work/[id].astro` (after line 33) — "← All work" link + optional
  next-project (`getFeaturedWorks`/archive order from `repository.ts`).
- `blog/[id].astro` (after line 77) — "← All blog" + reuse `LinkNavPost` for
  by-date prev/next across standalone posts (new tiny helper in
  `repository.ts`, or compute from `getAllBlogPosts()`).
- `AboutText.astro` (after line 78) — closing internal link strip to
  `/work` + `/blog`, matching the `variant="secondary"` arrow-link style used
  by SelectedWriting/WorksStrip CTAs.

**B (sub-item S2):**

- `content.config.ts` — add optional `related_posts` / `related_work`
  references to `work` and/or `post` schemas.
- New `RelatedWriting.astro` (wraps `PostRowCalm`) on `work/[id]`; new
  `RelatedWork.astro` (wraps a work mini-card) on `blog/[id]`. Render only when
  present.
- Content pass: add `related_*` frontmatter to the few entries that connect.

**C (sub-item S3):**

- New `AboutStrip.astro` (or `HomeAbout`) inserted in `index.astro:12-16`,
  additive — v3 Writing/Work sections untouched.
- Extend About's closing strip (from S1) into a fuller hub section if desired.
- Copy from Jérôme, after hero-copy freeze.

## How it builds on v3

- **Reuses v3 components as-is**: `PostRowCalm` (v3 §3) for related-writing,
  work mini/overlay cards (v3 §4) for related-work, `Link variant="secondary"`
  arrow CTAs already used by the v3 home sections. The related modules are new
  compositions of existing v3 primitives, not new visual language.
- **Doesn't contradict v3 decisions**: A and B add to the footer and to
  detail-page bottoms — surfaces v3 explicitly parked ("serie pages, post pages,
  contact" are out-of-scope in v3 design §"Out of scope"). C is constrained to
  be additive so the v3 homepage composition (§3 calm rows, §4 works strip)
  stays exactly as shipped.
- **Delivers a v3 promise**: work.astro's "the writing covers how I build now"
  copy currently has no content-level backing; B makes it literal.
- **Extends the v3 variants ethos** only if useful — the related modules are
  small enough to skip the `VARIANTS` switch; not every addition needs a variant.

## Effort estimate

Umbrella is **L**, and should be **split** — the stub's "M" undersells it as one
piece but each layer is independently shippable:

- **S1 — connective tissue (A)**: footer sitemap + detail-page end CTAs + About
  outbound links. **S/M.** No schema, no content, no v3 risk. Do first.
- **S2 — related modules (B)**: schema references + two related components +
  curated content pass. **M.** Coordinate scope with blog-v2-1 (below).
- **S3 — homepage bio strip / About-as-hub (C)**: **M**, copy-blocked on
  hero-copy freeze. Deferred, own item.

### Dependencies & ordering vs other backlog items

- **blog-v2-1 (overlap — resolve the boundary).** Both touch blog navigation.
  Draw the line: **work-about-blog owns cross-section IA** (footer, About↔Work↔
  Blog, work↔blog related, detail-page back-links); **blog-v2-1 owns intra-blog
  reading UX** (series navigation polish, metadata, and specifically the
  blog-side related-posts + standalone prev/next reading experience). Do
  **work-about-blog S1 before blog-v2-1** — S1 is cheap, site-wide, and defines
  the link vocabulary blog-v2-1 then reuses; and S1 claiming the cross-section
  links lets blog-v2-1's currently-fuzzy scope be sharpened without double-work.
  **S2's blog-side "related work" module should be built with (or folded into)
  blog-v2-1** so the post-page bottom is only restructured once.
- **blog-toc (do with blog-v2-1, after S1).** No hard IA dependency — it's an
  in-page reading aid. But it edits the same post/serie page chrome S2/blog-v2-1
  touch, so batch it with blog-v2-1 to avoid re-touching the post header/aside
  layout twice. Ordering: after S1, alongside blog-v2-1.
- **flashless-dark-mode (independent).** Theme script in `<head>`. No
  dependency, no ordering — quick S win, ship anytime.
- **home-animation-toggle (independent, light coordination).** If S3 adds a
  reveal-animated bio strip, ensure it honors the motion toggle — do them near
  each other, but no hard dependency.
- **contact-images-animation (independent).** Contact visuals only; no IA
  dependency. If S1/S3 add a contact route, that's separate from animating the
  images.

**Suggested sequence:** S1 → (blog-toc + blog-v2-1, folding in S2 blog-side) →
S2 work-side → S3 (post hero-copy freeze). flashless-dark-mode and
contact-images-animation slot in anywhere as independent quick wins.
