# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog site for Jerome Abel, built with Astro 5, Tailwind CSS v4, and deployed to Netlify. Live at https://dev.jeromeabel.net.

## Commands

| Command                 | Description                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm dev`              | Dev server at localhost:4321                                                                   |
| `pnpm build`            | Production build to `dist/`                                                                    |
| `pnpm preview`          | Serve production build locally                                                                 |
| `pnpm format:check`     | Check formatting with Prettier                                                                 |
| `pnpm format:write`     | Auto-format all files                                                                          |
| `pnpm figma:dump <f>`   | Extract `tokens.figma.json` from a local `.fig` export                                         |
| `pnpm figma:verify`     | Diff code design tokens against the Figma variable dump (drift check)                          |
| `pnpm figma:verify-raw` | Diff Figma raw (unbound) values against the `named-debt.json` allowlist                        |
| `pnpm figma:primitives` | Regenerate `primitives.json` (Figma `1 Primitives` source) from the installed Tailwind version |
| `pnpm figma:brief <id>` | Assemble a Magnet-DS Figma brief (resolves shared run-rules / prelude includes)                |
| `pnpm geometry:web`     | Extract live-route computed geometry via Playwright (layout-exact prover, web side)            |
| `pnpm test`             | Node test runner over `scripts/figma/*.test.mjs`                                               |

Package manager is **pnpm**. No linter configured.

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

## Illustration Lab

Cover/thumbnail generation moved to the standalone studio at
`~/code/projects/cover-studio` (Vue app; `pnpm dev` there). It reads this
repo's content frontmatter and writes back `cover.gen.png` + `illustration:`
frontmatter via `pnpm export`. Spec: `.specs/02_archives/cover-studio/design.md`.

## Figma Design Tokens

Code↔Figma drift-check tooling lives in `scripts/figma/` (see its
[README](scripts/figma/README.md)): `pnpm figma:dump <file.fig>` (Figma-side token dump),
`pnpm figma:verify` (token diff, Pass 1), `pnpm figma:verify-raw` (raw-value allowlist diff,
Pass 2), `pnpm figma:primitives` (regenerate `1 Primitives` from installed Tailwind),
`pnpm geometry:web` (extract live computed geometry for the layout-exact prover). Figma has no
dump API, but a local **File > Export** `.fig` carries the whole document: `fig-decode.mjs`
parses that fig-kiwi binary into a node graph, which is how `figma:dump` works. Bindings and raw
values still pair a deterministic diff with a manual `use_figma` MCP procedure doc
(`dump-bindings.md`, `dump-raw-values.md`). Spec:
`.specs/02_archives/figma-variables/design.md`.
The shareable documentation entry point in Figma is the `📚 Docs` page
in `Magnet-DS` (file key `ihWIWmvtQPTWgUxlrVjC2c`). The token model is
organized into three variable collections: `1 Primitives`, `2 Theme`, and `3 Responsive`.

## Specs & Planning

Project ideas and their design/plan artifacts live in `.specs/`, organized by lifecycle:
`00_backlog/` (ideas) → `01_active/` (in-flight) → `02_archives/` (shipped). **Status is the folder.**
See `.specs/CLAUDE.md` for conventions and `.specs/INDEX.md` for the current dashboard.

- The **brainstorming** skill writes designs to `.specs/01_active/<slug>/design.md`.
- The **writing-plans** skill writes plans to `.specs/01_active/<slug>/plan.md`.
- Ship a topic with `./.specs/specs.sh archive <slug>` (stamps `shipped:` and updates INDEX).

Both skills honor an explicit user location override.

## TypeScript

Strict mode (`astro/tsconfigs/strict`). Path aliases:

- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@assets/*` → `src/assets/*`

`src/utils/` and `src/content/` are imported with direct relative paths (no alias).
