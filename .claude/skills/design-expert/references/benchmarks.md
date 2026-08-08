# Benchmarks — accent, hover, chips, images (surveyed 2026-08-04)

Three studies backing the UI-system rules. Re-survey before overturning them.

## Study A — 8 developer blogs (CSS-verified)

GitHub blog, Vercel, Astro, Tailwind, Stripe, Josh Comeau, Overreacted,
leerob.com (web.dev unverifiable — client-rendered).

| Pattern | Count | Notes |
|---|---|---|
| Boxed category chips on cards | **0 / 8** | 6 show no category at all; Vercel muted plain text (static), Stripe accent plain-text link |
| Zero accent color inside cards at rest | 5 / 8 | Accent lives on CTAs ("Read more": Tailwind, Stripe), category links (Stripe), focus outlines (Astro, Josh) |
| Title hover → accent color | 2 / 8 | GitHub (color + underline — but its cards have no chips to clash with); Josh (accent *underline decoration only*, text color unchanged) |
| Container-level hover instead of title | 3 / 8 | Vercel bg tint · Astro scale 1.03 · Overreacted scale 1.005 |
| No title hover at all | 3 / 8 | Tailwind, Stripe (hover parked on accent "Read more" arrow), leerob |
| Two simultaneous hover signals (title + container) | 0 / 8 | One coordinated gesture max (GitHub couples image scale to title link via `:has` — one gesture) |
| Images dimmed/tinted at rest | **0 / 3** (sites with images) | Always full brightness; card shadow at most |
| Image hover = brightness/tint change | 0 / 3 | Only motion: GitHub image scale(1.02), 0.6s ease |
| Small muted (often mono) date metadata | 5 / 8 | Validates our metadata layer |

**Scope limit — cards only.** Every site above was surveyed at its *card grid*.
No row/list layout was checked, so nothing here backs a PostRow rule. In
particular the "Vercel bg tint" row is a **card-container** tint; it was later
cited in ui-system.md as the PostRow precedent, which overstates it.

## Study C — row/list hover, 12 sites (CSS-verified 2026-08-04)

Method identical to Study A: fetch page + its stylesheets, read the actual
`:hover` rule on the row element. Auth-gated apps originally named as precedent
(Linear issue list, Vercel deployments, Notion) could not be reached and were
replaced by public equivalents. `developer.chrome.com/blog` is client-rendered —
unverifiable, same as web.dev in Study A.

**Data lists (app idiom)** — every one tints the whole strip:

| Site | Rule | Tint |
|---|---|---|
| GitHub file list | `.react-directory-row:hover{background-color:var(--bgColor-muted)}` | `#fff→#f6f8fa` · dark `#0d1117→#151b23` |
| GitHub issue list | `.ListItem…:hover{background-color:var(--bgColor-muted)}` **+** title `:hover{color:var(--fgColor-accent)}`, decoration explicitly none | same tokens |
| jsr.io search results | `hover:bg-jsr-cyan-50 dark:hover:bg-jsr-cyan-950`, focus mirrors hover + ring | `#fff→#ebf6ff` (accent-hued) |
| Vercel changelog | `hover:bg-gray-100 transition-all 200ms` on the full-width `<a>` | `#fff→#f2f2f2` · dark `#000→#1a1a1a` |

**Blog index lists** — the strip tint is the *minority*:

| Site | Row hover |
|---|---|
| react.dev/blog | container `hover:bg-gray-40/5` **+** title `hover:underline` (stacked) |
| MDN blog index | title underline only (`.blog-post-preview__header h2 a:hover`) — no row tint |
| leerob.com | title underline is permanent; hover only lightens `decoration-color` |
| nextjs.org/blog | title color darkens to `--geist-foreground`; no container rule |
| overreacted.io | whole row `hover:scale-[1.005]` — no tint, no underline |
| Stripe blog index | nothing on the row; the "Read more" arrow extends (line opacity + tip translate) |
| deno.com/blog | nothing — full-row `<a>` carries no hover class |
| Hacker News | nothing on titles; `news.css` has 3 `:hover` rules total, all subtext links |

| Pattern | Count | Notes |
|---|---|---|
| Full-strip tint, data lists | **4 / 4** | Unanimous — the app-list idiom is real and CSS-confirmed |
| Full-strip tint, blog lists | **1 / 8** | Only react.dev, whose "rows" are bordered panels (card-ish) |
| Title-level gesture, blog lists | 4 / 8 | Underline (MDN, react.dev, leerob-as-decoration) or color (Next.js) |
| No hover feedback at all | 3 / 8 | Stripe (arrow only), deno, HN |
| Two stacked signals | 2 / 12 | GitHub issues (tint + title accent), react.dev (tint + underline) |
| Arrow/chevron appears on hover | 1 / 12 | Stripe — and it *replaces* row feedback; no site stacks arrow with tint |
| Underline inside a list row | 3 / 12 | Rare in data lists (0/4), normal in blog lists — the earlier "believed rare" was wrong for blog lists |

**Tint magnitude — the useful number.** Measured ΔL\* (CIE lightness) and
bg-vs-tint contrast ratio:

| | light ΔL\* | dark ΔL\* | ratio |
|---|---|---|---|
| GitHub | −2.52 | +4.57 | 1.07 / 1.09 |
| jsr | −3.67 | — | 1.10 |
| Vercel | −4.51 | +9.26 | 1.12 / 1.21 |
| **ours (current)** | **−3.63** | **+6.27** | **1.10 / 1.18** |
| ours (pre-retune) | −12.15 | +21.05 | 1.37 / 1.94 |

Our retuned tint sits inside the measured band; the pre-retune tint was 3–5×
outside it. That is independent confirmation the AA failure was tint *magnitude*,
not the gesture.

**What this changes.** The row-tint rule survives but its evidence shifts: it is
the unanimous **data-list** idiom, not the majority **blog-list** idiom. PostRow
is a blog list rendered at data-list density (10–20 dense rows, chip + meta,
full-width hit area), so the tint is defensible — but say so as a density
argument, not "everyone does it for post lists". Also: stacking a second signal
is not the taboo Study A's cards suggested (2/12 lists stack), so the one-gesture
rule for rows is our choice, not a benchmark verdict.

## Study B — 5 design systems on boxed vs plain labels

Primer (Label/Token), Material 3 (Chips), Atlassian (Tag/Lozenge),
shadcn (Badge), Carbon (Tag).

- **Static muted boxes are first-class**: Carbon read-only Tag, Primer Label
  ("styled visual wrapper", presentational), Atlassian static Tag ("subtle") and
  even the prominent-but-static Lozenge.
- **"Boxed = clickable" is false as stated.** The box signals "metadata
  category, not body text". Interactivity is signaled by *layered affordances*:
  hover/focus state, remove ×, chevron, pointer cursor (M3 chips and Primer
  Token are interactive-by-definition and carry those affordances).
- **What's off-spec everywhere**: a bordered, hover-styled, button-like pill
  that does nothing. And Carbon explicitly: don't use tags as links to another
  page.
- **Upgrade path is documented**: Carbon read-only → selectable, Primer
  Label → Token. A muted box can become a filter later without redesign.

## Consequences (encoded in ui-system.md)

0. Row hover = full-strip tint, held on Study C (4/4 data lists) + the density
   argument, *not* on blog-list precedent (1/8 there). Keep the tint delta inside
   the measured ΔL\* 2.5–4.5 (light) / 4.6–9.3 (dark) band. Card hover = title
   underline, held on Study A. Different roles, not an inconsistency — rationale
   in ui-system.md "Why rows tint and cards underline".
1. Accent budget at rest: serie chip (Stripe accent-category precedent),
   section CTAs, active nav, focus outlines. Nothing else — titles never.
2. Hover: one gesture per surface; underline decoration beats repainting the
   title (Josh pattern) when accent chips sit nearby.
3. Topic label: muted **background-only** box (no border, no hover, no pointer)
   or plain muted text — never a button-like pill. Omitting topics from cards
   entirely is the majority blog pattern (6/8) and stays a live option.
4. Images: full brightness at rest, always. Hover: slow slight scale or
   nothing — never brightness/tint (0/8 precedent; our light-mint covers would
   wash out).
