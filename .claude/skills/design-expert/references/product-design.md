# Product Design — jeromeabel.net

## Audience & job

Developer blog + portfolio for Jérôme Abel, front-end engineer (Astro, Vue/Nuxt,
testing, performance). Readers: developers scanning for one useful article;
recruiters/clients scanning for credibility in under a minute. Every page serves
one of those two scans.

## Page purposes

| Page | Job | Structure |
|---|---|---|
| Home | Orientation + best-of. "Who is this, is the writing good, is the work real?" | Hero → Blog preview (1 featured big + 3 recent small) → Work (3 cards) → Contact |
| Blog | Findability. "Show me what's here, let me pick." | H1 + one-line positioning → Series (cards, the flagship format) → Posts (rows, chronological, grouped by year) |
| Work | Proof. Selected projects with real outcomes | Cards grid → detail pages |
| About | Trust. Person behind the work | Narrative |

## Editorial hierarchy

- **Featured system**: `featured: <positive int>` = explicit rank, lower = more
  prominent. Used on series and works. Home featured blog slot = editorial pick,
  not just latest. Don't auto-derive "featured" from recency.
- **Series are the flagship content format** — multi-part, ordered, dated ranges
  (`Mar–Jul 2026 · 6 parts`). They get the richest card treatment and lead the
  Blog page.
- **Home blog preview 1+3**: one big featured card (image, chip, title,
  description, date) + three compact cards. The 3 compact cards are recent
  posts; the big one is the editorial pick. Layout validated — don't redesign.
- **Blog rows are the archive**, optimized for vertical scanning: year gutter,
  one line per post, title first.

## Business rules (content model)

- A blog post is standalone (`post` collection) OR belongs to exactly one serie
  in an ordered index (`seriePost` referenced from `serie.posts`).
- Series have their own landing page, description, date range, part count.
- Drafts default to `draft: true` (hidden in prod, visible in dev).
- `related_work` / `related_posts` cross-link posts and portfolio pieces.

## Feature discipline (YAGNI log)

Decisions to NOT build, revisit only with evidence:

- **Topic filter UI on Blog page**: ~21 posts — a full scroll is faster than a
  filter. Revisit at ~40+ posts. Topic chips remain passive labels until then.
- **Search**: same threshold.
- **Multi-topic per post**: forces chip stacks, dilutes meaning. One topic each.
- **Pagination**: year-grouped rows scale to dozens of posts fine.
