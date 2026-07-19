---
shipped: 2026-07-19
title: Blog v3
created: 2026-07-18
---

# Blog v3 — reading, series nav & metadata polish (design)

Original stub: _"Follow-up refinements after the blog v2 rebuild: polish reading experience, series navigation, and metadata. Scope to be detailed when picked up. Size: M."_

This doc gives that stub concrete scope. It audits the shipped blog, proposes a prioritized punch-list, and marks what's in for v3 vs deferred.

**Status:** v3a (metadata & correctness, #1/#2/#3/#7/#8) shipped 2026-07-19. v3b (series navigation, #4/#5/#6) shipped 2026-07-19.

---

## Problem / context

Blog v2 shipped the structure (year-rail list, series grid, split post/serie templates, RSS, home "Writing" feed). What's left is the polish that makes a post feel finished: honest metadata, a clear sense of "where am I in this series", and a couple of reading-experience gaps. There are also two small **correctness bugs** in the metadata that are shipping today (broken OG tags), which alone justify picking this up.

Two adjacent backlog items overlap and are **explicitly de-scoped** here (see Overlap notes): `blog-toc` (heading-level table of contents) and `work-about-blog` (cross-section navigation between Work/About/Blog).

---

## Current-state audit

What v2 already shipped (don't re-propose):

- Split templates: `src/pages/blog/[id].astro` (standalone), `src/pages/blog/[serie]/[post].astro` (serie post), `src/pages/blog/[serie]/index.astro` (serie landing), `src/pages/blog.astro` (index).
- Post header meta row: date + read-time + `TopicChips` + `SocialShare` (`[id].astro:50-66`).
- Read-time via remark plugin / `get-minutes-read.ts`; `getSerieStats` sums serie read time (`repository.ts:43`).
- Year-bucketed index list + series grid (`blog.astro:14-60`).
- Prev/next within a serie (`[serie]/[post].astro:123-151`, `LinkNavPost.astro`).
- Topic chips (`TopicChips.astro`, comma-split string), `updated` field in schema (`content.config.ts:13`).
- RSS feed + autodiscovery (`src/pages/rss.xml.ts`, `SEO.astro:39-44`).

Gaps and bugs found:

**Metadata (SEO.astro)**

- `SEO.astro:69` — `<meta property="”article:published_time”" ...>`: the property name is wrapped in **typographic curly quotes** (`”…”`), so the tag is invalid and crawlers ignore it. Broken today.
- `SEO.astro:72` — `og:type` is **hardcoded `"website"`** for every page, including posts. Blog posts should be `article`.
- No `article:modified_time`, `article:author`, `article:tag`, or `article:section` — even though `updated` and `topic` exist in frontmatter.
- No JSON-LD (`BlogPosting`/`Article`) structured data anywhere.
- `keywords` meta is one **static global list** (`SEO.astro:65-68`), never per-post.
- `[serie]/index.astro:20` — serie landing passes `publishedDate = new Date()` (today) to `Layout`, so its published-time signal is always wrong.

**Series navigation**

- Serie post breadcrumb shows only the bare index number — `{index + 1}` (`[serie]/[post].astro:87`), no "Part N of M". No progress sense.
- On the **last** post of a serie, `nextPost` is null so only the prev block renders — left-aligned at `w-1/2`, right half empty, no "you finished / back to series" affordance (`[serie]/[post].astro:142-148`).
- `LinkNavPost` hides the title on mobile (`hidden … sm:block`, `LinkNavPost.astro:28`) — on phones prev/next read only "Previous"/"Next" with no title.
- No inline "series contents" (list of all parts with the current one marked) on a serie post — a reader mid-series can't see the whole arc without going back to the landing page.
- Serie landing (`[serie]/index.astro`) shows no parts-count / total-read-time header, even though `SerieCard` already computes both via `getSerieStats`.

**Reading experience**

- Standalone posts have **no "read next"** — the article just ends. Serie posts at least have prev/next.
- `updated` date is shown in the **list** (`PostListItem.astro:19-24`) but **never on the post page itself** — a reader on the article can't tell it was revised.
- `Prose.astro` is solid; no changes needed for v3 beyond an optional `scroll-mt` on headings (which really belongs with `blog-toc`).

---

## Proposed punch-list (prioritized)

| #   | Item                                                                                                                    | Size | Notes                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| 1   | **Fix broken OG/article metadata**: curly-quote `article:published_time`, `og:type=article` for posts                   | XS   | Pure bug fix, ship first                                        |
| 2   | **Per-post article metadata**: `article:modified_time` (from `updated`), `article:tag` (from `topic`), `article:author` | S    | Needs optional props threaded from post pages → Layout → SEO    |
| 3   | **Show `updated` on the post page** ("Updated {date}" in the meta row)                                                  | XS   | Field already exists; both templates                            |
| 4   | **Series "Part N of M" + progress** in breadcrumb/header of serie posts                                                 | S    | Replaces bare `{index+1}`; `numberOfPosts` already computed     |
| 5   | **Fix last-post prev/next**: add "Back to {serie}" / "Series complete" next-slot fallback so the row stays balanced     | S    | Mirror the existing prev-fallback logic                         |
| 6   | **Inline "series contents" list** on serie posts (all parts, current marked)                                            | M    | The biggest UX win; approach below. Watch `blog-toc` overlap    |
| 7   | **Serie landing header stats** (parts · total read time · date range)                                                   | XS   | Reuse `getSerieStats`                                           |
| 8   | **Show prev/next titles on mobile**                                                                                     | XS   | Drop the `hidden sm:block` on the title                         |
| 9   | **JSON-LD `BlogPosting`** structured data                                                                               | S    | Approach below; nice-to-have, not a bug                         |
| 10  | **"Read next" for standalone posts** (2-3 rows)                                                                         | M    | Approach below; borders `work-about-blog` — keep blog→blog only |

---

## Approaches for the big items

### A. Series contents on serie posts (#6)

A reader deep in a 9-part series (Testing a Simple Nuxt Feature) has no in-page view of the whole arc.

- **A1 — Inline "In this series" block** (collapsible list of all parts, current one marked, above or below the article).
  - Pros: dead simple; no layout/sticky concerns; works on mobile; zero collision with `blog-toc`'s sticky sidebar.
  - Cons: static, not always in view while scrolling a long post.
- **A2 — Sticky sidebar series outline** (desktop rail listing parts).
  - Pros: always visible; feels like docs.
  - Cons: **directly competes with `blog-toc`** for the same rail; building it before `blog-toc` risks throwaway work; heavier responsive/a11y cost.
- **A3 — Compact "Part N of M ‹ prev · all · next ›" strip** pinned under the header only.
  - Pros: tiny; pairs naturally with #4/#5; no sidebar.
  - Cons: doesn't show the full list of parts.

**Recommendation:** **A1 for v3** (inline block), and defer any sticky-rail version until `blog-toc` lands and owns the rail — then the series list can slot into the _same_ shell as a second panel. A1 + #4 + #5 together fully cover "where am I in this series" without touching sidebar real estate.

### B. Article structured metadata (#1, #2, #9)

- **B1 — Fix + extend the existing `<meta>` tags** (og:type, published/modified/tag, threaded via optional Layout/SEO props).
  - Pros: small, fixes the live bugs, covers OG/Twitter which is what actually renders link previews.
  - Cons: no rich-result eligibility (no JSON-LD).
- **B2 — Add a JSON-LD `BlogPosting` block** (separate component, per-post).
  - Pros: Google rich results, cleanest machine-readable signal.
  - Cons: duplicates data already in meta tags; more surface to keep in sync; no visible user benefit.
- **B3 — Both.**

**Recommendation:** **B1 in v3** (items #1–#3 — the bug fixes are non-negotiable), **B2 (#9) as a stretch/optional** in the same PR if cheap, else defer to a v3.1. Link previews (B1) beat rich results (B2) for a personal blog.

### C. "Read next" for standalone posts (#10)

Standalone posts dead-end. What should follow?

- **C1 — Topic-match related** (same `topic`, most recent 2-3).
  - Pros: genuinely relevant.
  - Cons: `topic` is a loose comma-string, not a taxonomy; thin matches (many posts are `astro`) → often just "most recent astro post". Fuzzy quality.
- **C2 — Manual `related:` frontmatter** (curated ids).
  - Pros: best quality, full control.
  - Cons: content maintenance per post; new schema field.
- **C3 — Generic "More writing" (latest 3, excluding current)**.
  - Pros: trivial; reuses `getLatestWriting`; always populated.
  - Cons: not "related", just recent.

**Recommendation:** **C3 for v3** if included at all — but see scope call below; this item flirts with `work-about-blog` and is the first thing to cut.

---

## Recommendation: in-scope for v3 vs deferred

v3 is bigger than one "M". Split it:

**v3a — Metadata & correctness (Size S)** — do first, mostly bug fixes:

- #1 fix broken OG tags, #2 per-post article meta, #3 show `updated` on page, #7 serie landing stats, #8 mobile prev/next titles.

**v3b — Series navigation (Size M)** — the reading-experience core:

- #4 Part N of M, #5 last-post fallback, #6 inline series-contents (approach A1).

**Deferred out of v3:**

- #9 JSON-LD — stretch goal, else v3.1.
- #10 "Read next" — defer; overlaps `work-about-blog`, and C3 is low-value. Revisit when that item is scoped.
- Any sticky series rail — wait for `blog-toc`.

---

## Overlap notes

- **`blog-toc`** — heading-level table of contents (auto-generated from `##`/`###`, sticky, scroll-spy). **Different thing** from v3 #6 (a list of _series parts_, not in-page headings). But both want the desktop side-rail. **Do not build a sticky series rail in v3** — ship #6 as an inline block (A1). If `blog-toc` lands first, its rail becomes the natural home for a future series panel. Sequence: `blog-toc` **before** any sidebar version of series nav.
- **`work-about-blog`** — cross-section navigation/cross-linking between Work, About, Blog. v3 stays **inside the blog**: series ↔ post, post ↔ post-in-same-blog. Cross-section "from this post, see related Work" belongs to `work-about-blog`, **not here**. The #10 "read next" component, if ever built, is the shared seam — build it in `work-about-blog`, not v3.

---

## Effort estimate

- **v3a (metadata):** ~half a day. Mostly `SEO.astro` + threading two optional props through `Layout`; #7/#8 are one-liners.
- **v3b (series nav):** ~1 day. New `SerieContents.astro`, breadcrumb/#4 change, prev/next fallback + component tweak.
- Optional #9 JSON-LD: +2-3h. #10 read-next: deferred.

Total if both a+b: ~1.5 days. Ships as two PRs (a then b).

---

## Acceptance (for whichever slice is built)

- OG/article meta validates (no curly-quote tag; `og:type=article` on posts; published/modified/tag present where data exists).
- A revised post shows "Updated {date}" on the page.
- A serie post shows "Part N of M" and, on the last part, a balanced next-slot ("Back to {serie}").
- Inline series-contents lists all parts with the current one marked; works on mobile.
- Serie landing header shows parts · total read time.
- `pnpm build` and `pnpm format:check` pass; light + dark legible.
