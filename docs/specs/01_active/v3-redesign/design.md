# v3 Redesign — design

Version: **3.0.0** (tags exist for v1.0, v2.0). Branch: `redesign/v3`.
Decisions made 2026-07-19 via option artifact + research
(https://claude.ai/code/artifact/0592ae69-987b-4ac8-863f-9033d29f31b9).
Positioning: **art problems → product problems arc**; at most one dated
anchor ("2010") on the whole site.

## Guiding requirement: testable variants

Jérôme wants to compare layouts on the real site, not in mockups. So v3
keeps rejected-but-plausible alternatives as living components behind one
switch file:

```ts
// src/config/variants.ts
export const VARIANTS = {
  workFeatured: "gallery-2x2-16x9", // | "gallery-2x2-1x1" | "gallery-3col-1x1"
  homePosts: "calm-rows", // | "arrow-rows" (current PostRow)
  worksStrip: "mini-card", // | "overlay-card" (main-branch WorkCard hover)
  aboutFacts: "strip", // | "grid" (current 4-col AboutFacts)
} as const;
```

Pages/components read `VARIANTS` and render the chosen variant. Testing =
edit one line, `pnpm dev`. Ship = leave winner, but variants stay in the
tree (they're small). No runtime switching, no query params — build-time
constant only.

## 1. Hero copy — iterative, separate track

Rejected two rounds; now looping (4–5 rounds budgeted) via:

- `hero-copy-context.md` — self-contained context pack (facts, voice,
  constraints, rejected drafts). Any LLM/human session starts here.
- `hero-copy-approaches.md` — analysis + draft rounds, latest on top.

Copy freeze is NOT a blocker for layout work; implementation may start
while copy loops continue. Cascade at freeze: HeroText tagline, work.astro
intro, About lead (current About lead likely survives as-is).

## 2. Work page — Featured: compact gallery (pick C)

- Grid of compact image cards: image + kicker eyebrow + title + 1–2 line
  description. **Order: latest first** (by work `date` desc, among
  `featured` entries) — replaces the hand-set web-first order.
- Ratio variants (the `workFeatured` switch):
  - `gallery-2x2-16x9` — 2-col, 16:9 crops (needs focal-point check on the
    square art shots)
  - `gallery-2x2-1x1` — 2-col, square (matches existing square preview
    assets, zero recrop)
  - `gallery-3col-1x1` — 3-col squares (3×1 with 3 featured, 3×2 with up
    to 6)
- **Mobile:** all variants collapse to 1-col (16:9) or 2-col (1:1) at
  `sm`; card text always below image; no hover-dependent info.
- Current horizontal-split WorkCard: delete from work page (superseded).
- **Portfolio demoted (decided 2026-07-19).** Meta-project, CV-speak
  description; moves to the More-projects table. Featured set = 3:
  Le concept de la preuve (2026), Chimères Orchestra, La Malinette —
  paco.me precedent; `gallery-3col-1x1` renders a clean 3×1.
  Remove `featured:` from `src/content/work/portfolio/index.md`.
- More projects: ArchiveTable stays as-is (already matches researched
  table pattern).

## 3. Home — Latest posts: calm rows + description (pick B)

- 4 posts (was 5). New `PostRowCalm` (or prop-variant of PostRow):
  serie kicker (when serie), title + meta line, **plus 1-line description**
  from post frontmatter `description` (verify field exists on all posts;
  fallback: hide line).
- Hover: background tint only. **No arrow slide, no title shift.**
- `homePosts` switch keeps current arrow PostRow renderable for comparison.
- Blog page keeps PostListItem (arrow) for now — revisit after home verdict.

## 4. Home — Works strip: WorkMiniCard, quieter hover (pick A)

- Keep WorkMiniCard grid (2/4 cols). Replace image `scale-105` hover with
  border/opacity shift (calm-hover language).
- `worksStrip` switch keeps the **main-branch overlay card** as variant B:
  black overlay fade + big `cross-big` icon rotating −45°→0° + title reveal
  (component: main-branch `WorkCardImage`/`WorkCard` overlay, resurrected as
  `WorkOverlayCard.astro`). NOT dashed-border — earlier mock was wrong.

## 5. Blog lists — tags: no chips in rows (pick A)

- Remove topic chips from PostRow + PostListItem (all list contexts).
- `topic` frontmatter stays; renders only on the post page header.
- No /tags pages, no filters (post count can't feed them; YAGNI).
- Optional row UIs (chips version, arrow version) remain as variants for
  the `homePosts` switch comparison; not shipped active.

## 6. About — lead + one-line facts strip (pick B)

- Keep narrative structure + lead line (current lead survives copy rules).
- Replace 4-col AboutFacts grid with **one quiet mono line**:
  `2010 coding since · N articles · 5000+ downloads · 1000+ trained`
  (borders top/bottom, small text). This keeps the site's single "2010".
- `aboutFacts` switch keeps the 4-col grid variant.
- Numbers also stay inline in prose where they already appear (Malinette
  downloads, people trained) — strip + inline duplication is acceptable;
  revisit at review.

## Out of scope (this spec)

- Blog page year-rail changes (shipped in v2), serie pages, post pages,
  images for blog post indexes (parked — no decision), CV system, contact.

## Open questions for review

1. ~~Portfolio featured demotion~~ — accepted 2026-07-19 (see §2).
2. Post `description` frontmatter coverage — audit result may adjust §3.
3. Blog page PostListItem: also de-arrow for consistency, or keep?

Design approved by Jérôme 2026-07-19 → proceed to plan.md (writing-plans).
Hero copy loops continue in parallel; loop-2 constraint: web-now leads,
background = quick funny aside (see hero-copy-context.md).

## Research receipts (partial)

13 claims verified 3-0 (paco.me text-first 3-project list; brittanychiang
4-row featured + table archive + inline numbers, no stats row; thecrit
taxonomy 3–6 → gallery/magazine; skills-laundry-list anti-pattern; exemplar
pool incl. szymonkaliski.com). Synthesis + hiring-manager claims lost to
session limit — resumable: workflow run `wf_c846c753-01d`, resume after
limit reset replays cached agents and re-runs only the dead ones.
