# Taxonomy — topic, serie, stack, featured

Status: **decided 2026-08-04** — one topic per post, 5-value enum (no `ui`),
optional `stack` array, serie inheritance. Display treatment of chips (box vs
text, accent budget) tracked separately in
`.specs/01_active/blog-design-review/review.md`. Facts audited 2026-08-04.

## Current state (audited)

- `topic` is `z.string().optional()` on `post`/`seriePost` — a de-facto CSV
  parsed by `TopicChips.astro` and `SEO.astro`. No enum, no route, no filter.
- Values in use: `astro`(8), `nuxt`(10), `testing`(10), `performance`(5), `ai`(2).
  Mixes **subject** (performance, testing) with **stack** (astro, nuxt).
- Known mislabels: `web-performance/01–03` tagged `astro` but contain no Astro
  content (they are Vue/PrimeVue/TanStack + framework-agnostic).
- `serie` schema has **no topic field**; `work` has separate `type` + `stack`.
- Figma `PostTopic` component ships 6 variants: `fullstack, performance,
  architecture, testing, ui, ai`.

## Recommended model

Two orthogonal dimensions — don't mix them in one field:

1. **`topic`** — the *subject*, single value, union type of 5:
   `performance | testing | architecture | full-stack | ai`
   - Exactly **one per post**. Forces editorial clarity; keeps chips clean.
   - Enforce with `z.enum([...])` in `content.config.ts`.
   - Sanity check against real content: testing ≈ 11, performance ≈ 6,
     architecture ≈ 4, full-stack ≈ 5, ai ≈ 2.
   - `ui` was considered and dropped (no content; add a 6th value only when
     several posts exist for it).
2. **`stack`** — the *framework/tools*, optional `string[]`:
   `astro, vue, nuxt, react, node, …` — same convention as `work.stack`.
   - Not shown on cards/rows. Shown on the post page near metadata.
   - Exists because knowledge is not framework-agnostic (user's point): a
     reader may want "Astro things" — that's a stack query, not a topic.

### How `stack` is actually used

1. **Post page metadata** — small mono list near date/read-time.
2. **SEO** — feeds `article:tag` meta (replaces today's CSV split in
   `SEO.astro`) → better discovery for "astro images" style queries.
3. **Related content** — shared-stack is a signal for related-post suggestions
   (alongside `related_work`/`related_posts` explicit links).
4. **Future filter/landing** — `/blog?stack=astro` or a per-stack landing page
   becomes possible without schema change. Not built now (YAGNI threshold).
If none of 1–3 ships either, `stack` is dead frontmatter — implement at least
the post-page display + SEO when migrating.

## Series and inheritance

- **Serie gets a `topic`** (add field to serie schema). One topic per serie.
- **Serie posts inherit the serie's topic** — drop per-post topic inside a
  serie (or treat it as override, discouraged). Fixes the `astro` mislabels
  structurally: web-performance serie → `topic: performance`, and
  `stack` varies per part.
- Serie is **not** a topic and topic is **not** derived from children — series
  are containers/format, topics are subjects. Deriving from children breaks
  the moment parts diverge.

## Display rules (ties to ui-system.md)

- One chip per card/row: serie chip **replaces** the topic chip on serie posts
  — no redundancy, and no dual-chip inconsistency.
- Topic chips are passive muted labels. They become interactive (filter on the
  Blog rows section only) if/when post count justifies it (~40+, see YAGNI log).
- Serie chip: folder icon + name + `2/5`. Topic chip: plain text.

## Migration notes (when implemented)

- `topic: "nuxt, testing"` → `topic: testing`, `stack: [nuxt, vue]`.
- `topic: "astro, performance"` (web-performance parts) → serie
  `topic: performance`; parts 04–05 `stack: [astro]`, parts 01–03 `stack: [vue]`.
- Standalone astro posts (`api-endpoints`, `likes`, `clickable-images`) →
  `topic: full-stack`, `stack: [astro]`.
- `nuxt-clean-architecture` → `topic: architecture`, `stack: [nuxt, vue, supabase]`.
- Figma naming mismatch: component says `fullstack`, code will say
  `full-stack` — align Figma variant name when touched next.
