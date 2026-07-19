# Backlog implementation order

_Ordering across designed backlog items. Derived from cross-dependency analysis of each `design.md` (2026-07-19). INDEX.md is status-only; sequence lives here._

**Tier 1 shipped 2026-07-19**: blog-v3a, flashless-dark-mode, home-animation-toggle, contact-images-animation. Tier 2 up next.

Legend: size after split, → = "must precede".

## Sequence

### Tier 1 — quick wins, low risk (all S, mostly independent)

1. **blog-v3a** — Metadata & correctness (S)
   Fixes two _live_ OG bugs: `article:published_time` wrapped in curly quotes (invalid tag) and `og:type` hardcoded `"website"` for posts (`SEO.astro:69,72`). Plus per-post article meta + show `updated`. Correctness → ship first.

2. **flashless-dark-mode** (S) — independent.
   Inline pre-paint `<head>` script, delete `theme.ts`. Establishes the pre-paint pattern the toggle reuses. → `home-animation-toggle`.

3. **home-animation-toggle** (S) — after `flashless-dark-mode`.
   Adds `data-motion` into the same pre-paint bootstrap. Doing flashless first avoids refactoring the head script twice.

4. **contact-images-animation** (S) — rides shared `.reveal` + `motion-safe:`.
   Order-independent, but ship after the toggle so it's built against the finished motion gate. Cheap.

### Tier 2 — blog reading experience (batch post/serie page edits once)

5. **work-about-blog S1** — connective tissue (S/M).
   Footer sitemap, back/next CTAs on dead-ending project & post pages, outbound About links. No schema/content, no v3 risk. Defines the link vocabulary blog-v3 reuses → do before blog-v3b.

6. **blog-toc** (M-small) — within-article nav.
   Built on Astro's free `headings` from `render()`. Batch with the blog-v3b post-page work to touch the article layout once.

7. **blog-v3b** — series navigation (M).
   Part N of M, last-post prev/next fallback, inline series-contents block (inline, NOT sticky — leaves the rail to blog-toc). Fold in blog-side "related work" module here.

### Tier 3 — deeper IA

8. **work-about-blog S2** — Work↔Blog "related" modules (M). Schema `reference` + reuse v3 cards.

9. **work-about-blog S3** — homepage bio strip / About-as-hub (M).
   Touches just-shipped v3 homepage composition and is **copy-blocked** on the still-looping hero-copy track → last.

## Key dependency notes

- **Pre-paint infra**: `flashless-dark-mode` → `home-animation-toggle` share one inline `<head>` bootstrap + `astro:after-swap` re-apply. Flashless owns the refactor.
- **Motion gate**: `home-animation-toggle`'s `data-motion` is the seam `contact-images-animation` (and later reveal-animated bits) must honor. Keep contact on the shared `.reveal` system, not bespoke keyframes.
- **Blog boundary**: `work-about-blog` = _cross-section_ IA (footer, About↔Work↔Blog, detail back-links). `blog-v3` = _intra-blog_ reading UX. `blog-toc` = _within-article_ nav. S1 first defines vocab; blog-toc + blog-v3b batched after.
- **TOC vs series rail**: both eye the desktop side-rail. blog-v3b's series list stays inline; if a sticky rail is ever wanted, blog-toc establishes the shell first.
- **Fully independent**: `flashless-dark-mode` blocks nothing; the three S animation/theme items can float earlier if desired.

## Excluded

- **illustration-system** — pre-existing design, not part of this pass. Slot per its own design.
