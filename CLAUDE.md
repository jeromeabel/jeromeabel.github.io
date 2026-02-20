# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog site for Jerome Abel, built with Astro 5, Tailwind CSS v4, and deployed to Netlify. Live at https://dev.jeromeabel.net.

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server at localhost:4321 |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve production build locally |
| `pnpm format:check` | Check formatting with Prettier |
| `pnpm format:write` | Auto-format all files |

Package manager is **pnpm**. No test suite or linter configured.

## Architecture

### Content Collections (Astro 5 Content Layer API)

Four collections defined in `src/content.config.ts` using `glob()` loaders:

- **`post`** — Standalone blog posts (`src/content/post/**/index.md`)
- **`seriePost`** — Posts within a series (`src/content/serie/*/*.md`, depth-3)
- **`serie`** — Series entries (`src/content/serie/*.md`, depth-2) with `posts` field referencing `seriePost` entries
- **`work`** — Portfolio projects (`src/content/work/**/index.md`)

Content is colocated with assets (images live alongside `index.md` in each directory).

### Data Access Layer

All collection queries go through `src/utils/repository.ts`. This centralizes draft filtering (drafts hidden in production, shown in dev via `import.meta.env.PROD`), date sorting, and serie post resolution.

### Routing

File-based routing in `src/pages/`. Dynamic routes use `getStaticPaths()`:
- `/blog/[id]` — individual posts
- `/blog/[serie]` — serie landing pages
- `/blog/[serie]/[post]` — serie posts with prev/next navigation
- `/work/[id]` — project pages

### Styling

- **Tailwind CSS v4** with CSS-native config — no `tailwind.config.js`. Custom tokens in `src/styles/global.css` via `@theme {}`.
- Dark mode via `.dark` class on `<html>`, toggled in `src/scripts/theme.ts` with localStorage persistence. Re-applied on `astro:after-swap` for view transitions.
- `@tailwindcss/typography` for markdown prose styling.
- Custom `container` utility overrides Tailwind default (max-w-xl, auto margins, 1rem padding).

### Components

Organized by feature domain in `src/components/`:
- `app/` — Header, Footer, SEO, ThemeToggle
- `ui/` — Shared primitives (H1, H2, P, Link, Prose, CustomImage, etc.)
- `blog/`, `work/`, `hero/`, `about/`, `contact/`, `skills/` — Feature-specific

`Link.astro` uses `class-variance-authority` with named variants (`default`, `bold`, `cta`, `icon`, `secondary`, `external`, etc.).

### Image Handling

`CustomImage.astro` wraps Astro's `<Picture>` with LQIP (32×32 blurred placeholder), lazy fade-in animation, and AVIF/WebP format output. The netlify image service handles optimization.

### Other Patterns

- **Single layout**: `src/layouts/Layout.astro` wraps all pages (fonts, global CSS, SEO, header/footer, analytics).
- **View transitions**: `ClientRouter` enabled via `SEO.astro`.
- **Scroll animations**: IntersectionObserver in `src/scripts/reveal-anim.ts` with `.reveal` / `.reveal-bottom` classes. Respects `prefers-reduced-motion`.
- **Reading time**: Custom remark plugin at `src/utils/remark-reading-time.mjs` (120 WPM), injected into frontmatter.
- **Analytics**: Umami via `@astrojs/partytown` (offloaded to web worker).
- **Icons**: `astro-icon` with Iconify sets (lucide, fa6-brands) plus custom SVGs in `src/assets/icons/`.

## TypeScript

Strict mode (`astro/tsconfigs/strict`). Path aliases:
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@assets/*` → `src/assets/*`

`src/utils/` and `src/content/` are imported with direct relative paths (no alias).
