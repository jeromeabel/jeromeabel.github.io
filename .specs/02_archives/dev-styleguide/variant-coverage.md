# Variant Coverage Mapping

> Audit record from Task 5: All 9 `VARIANTS` values from `src/config/variants.ts` map to named exports across Plan B stories (Tasks 1–4).

## Global Constraints Table → Story Exports

| `VARIANTS` key | value              | leaf component    | story file                                        | export name   |
| -------------- | ------------------ | ----------------- | ------------------------------------------------- | ------------- |
| `workFeatured` | `gallery-2x2-16x9` | `WorkGalleryCard` | `src/components/work/WorkGalleryCard.stories.ts`  | `Video`       |
| `workFeatured` | `gallery-2x2-1x1`  | `WorkGalleryCard` | `src/components/work/WorkGalleryCard.stories.ts`  | `Square`      |
| `workFeatured` | `gallery-3col-1x1` | `WorkGalleryCard` | `src/components/work/WorkGalleryCard.stories.ts`  | `Square`      |
| `homePosts`    | `calm-rows`        | `PostRowCalm`     | `src/components/blog/PostRowCalm.stories.ts`      | `CalmRow`     |
| `homePosts`    | `arrow-rows`       | `PostRow`         | `src/components/blog/PostRow.stories.ts`          | `ArrowRow`    |
| `worksStrip`   | `mini-card`        | `WorkMiniCard`    | `src/components/work/WorkMiniCard.stories.ts`     | `MiniCard`    |
| `worksStrip`   | `overlay-card`     | `WorkOverlayCard` | `src/components/work/WorkOverlayCard.stories.ts`  | `OverlayCard` |
| `aboutFacts`   | `strip`            | `AboutFactsStrip` | `src/components/about/AboutFactsStrip.stories.ts` | `Strip`       |
| `aboutFacts`   | `grid`             | `AboutFacts`      | `src/components/about/AboutFacts.stories.ts`      | `Grid`        |

**Status:** ✓ All 9 variant values have named exports.

## Coverage Audit Results

### Step 2: Full Live Coverage Confirmation

Command: `comm -23 <(find src/components -name '*.astro' ! -name 'SEO.astro' | sed 's#.astro$##' | sort) <(find src/components -name '*.stories.ts' | sed 's#.stories.ts$##' | sort)`

**Output:** (empty)

**Interpretation:** No .astro components lack corresponding .stories.ts files. Plan A (base component coverage) + Plan B (5 variant cards) = full live coverage.

## Notes

- The `gallery-2x2-1x1` and `gallery-3col-1x1` variants both render via the `Square` export of `WorkGalleryCard` because the 2-col vs 3-col dimension is a **page-grid** layout decision (not a card prop). See `WorkGalleryCard.stories.ts` lines 9–11.
- `PostRow.stories.ts` also exports `WithSerie` (a prose-level context variant, not a `VARIANTS` key), demonstrating component flexibility beyond the build-time switch.
- `AboutFactsStrip` is the live `'strip'` variant (used via `VARIANTS.aboutFacts` in `src/components/about/AboutText.astro`). `AboutStrip` (storied in Plan A Task 6) is an unrelated homepage-only component and was correctly left untouched.
