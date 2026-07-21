---
shipped: 2026-07-19
title: Blog table of contents
created: 2026-07-18
---

# Blog table of contents — design (2026-07-18)

Original stub: _"Add a table of contents to long blog posts and series pages. Auto-generated from headings, sticky on desktop, with scroll-spy highlighting the active section. Size: M"_

---

## Problem / context

The long posts and series parts are the site's real reading material — several run 18–23 headings (`web-testing-quotes-and-tips`, both `web-performance` parts, `my-ai-journey/02`). Right now a reader lands at the top with no map: no sense of length, no way to jump to "the part about X", no orientation while scrolling. On desktop the article column leaves wide empty gutters (the `container` is 1280px but `Prose` is ~65ch centred), so the screen real estate for a sidebar is already there and unused.

Goal: an auto-generated "On this page" TOC — sticky in the gutter on desktop, collapsible on mobile, with the current section highlighted as you scroll. Only on posts long enough to need it.

## Current blog rendering

Both post templates already have everything the TOC needs; they just don't read it.

- `src/pages/blog/[id].astro:23` — `const { Content, remarkPluginFrontmatter } = await render(entry);`
- `src/pages/blog/[serie]/[post].astro:51` — same call for series parts.
- `src/components/ui/Prose.astro` — the `.prose` wrapper that renders `<Content />` (`[id].astro:75`, `[post].astro:119`). Article headings live inside here.
- `src/utils/remark-reading-time.mjs` — the only custom remark plugin; example of the plugin idiom already in the build.
- `astro.config.mjs` `markdown.processor: unified({ remarkPlugins, rehypePlugins })` — a **custom** processor, which raised the question of whether Astro's default heading handling still runs.

**Verified (this is the load-bearing fact):** the `unified()` helper imported here is Astro's own wrapper from `@astrojs/markdown-remark`, not raw `unified`. Its `createRenderer` funnels through `createMarkdownProcessor`, which unconditionally injects `rehypeHeadingIds` (`node_modules/@astrojs/markdown-remark/dist/index.js:81`) and returns `metadata.headings` (`index.js:103`). So even with the custom processor:

- rendered `<h2>`/`<h3>` already get `id` attributes (github-slugger slugs), and
- `render(entry)` already returns a `headings` array — we're just not destructuring it.

`headings` is `MarkdownHeading[]` = `{ depth: number; slug: string; text: string }[]`, in document order. Anchors work today; nothing in the markdown pipeline needs to change.

Layout facts that constrain the design:

- `container` = `max-width: var(--breakpoint-xl)` (1280px), `src/styles/global.css:4`. Not the narrow `max-w-xl` the CLAUDE.md prose implies — there's real gutter room on `lg`+.
- No sticky site header exists, so anchor jumps don't hide under a bar (only a small `scroll-margin-top` nicety needed).
- Client scripts load in `Layout.astro` (`reveal-anim.ts:48`, `image-zoom.ts`, `theme.ts`) and run on `astro:page-load` for view-transition compatibility. `reveal-anim.ts` already uses `IntersectionObserver` — the scroll-spy reuses that exact pattern.
- Theme tokens: `--color-muted`, `--color-muted-border`, `--color-foreground-accent` (light + dark) in `global.css:27-47`. No dedicated accent/brand colour — active-item styling reuses `foreground-accent` + `muted-border`.

## Approaches

### (a) Astro's built-in `headings` from `render()` — server-built list + tiny scroll-spy script

Destructure `headings` in each template, filter to `depth` 2–3, pass to a `<TableOfContents>` component that renders the `<nav>` at build time. A small client script handles only scroll-spy (active highlight) and reduced-motion smooth scroll.

- Pros: zero markdown/config changes (headings + IDs already exist, verified above). TOC is in the SSR HTML → no layout shift, works without JS (JS only adds the highlight), good for SEO/no-JS. Data is the single source Astro already computed. Smallest surface.
- Cons: `headings` is a flat list; nesting h3s under their h2 is a few lines of grouping in the component. Filtering/threshold logic lives in each page (or a shared helper).

### (b) Custom remark/rehype plugin for slug + extraction

Add a plugin (à la `remark-reading-time`) to build the heading tree / stash it in frontmatter.

- Pros: could produce a pre-nested tree and custom slugs; keeps page frontmatter thin.
- Cons: reinvents what `rehypeHeadingIds` + `headings` already give us for free. Touches the custom `processor` block in `astro.config.mjs` (the one fragile spot). No benefit over (a) — pure redundancy.

### (c) Pure client-side DOM scan

Ship an empty `<nav>`; a script queries `.prose :is(h2,h3)` on load and builds the list in JS.

- Pros: no template/frontmatter changes at all; trivially portable to any page with a `.prose`.
- Cons: TOC absent from SSR HTML → empty for no-JS/SEO, and a visible pop-in / layout shift on load. Duplicates data Astro already has, in the browser. Ordering against view transitions is fiddlier. Strictly worse than (a) for a content site.

## Recommendation

**Approach (a).** The headings and anchor IDs already exist server-side (verified), so build the `<nav>` at build time from `render()`'s `headings` and keep JavaScript to the one thing that genuinely needs the client: scroll-spy. No plugin, no `astro.config` edit, no layout shift, degrades gracefully without JS.

## Implementation sketch

### New component — `src/components/blog/TableOfContents.astro`

```ts
interface Props {
  headings: MarkdownHeading[]; // from render()
  minDepth?: number; // default 2
  maxDepth?: number; // default 3
}
```

- Filter `headings` to `depth >= minDepth && depth <= maxDepth`.
- Group into a shallow tree: each h2 owns the h3s that follow it until the next h2. Render `<ol>` (h2) with nested `<ol>` (h3). Keep it two levels — deeper nesting isn't worth it for these posts.
- Each item: `<a href={"#" + slug} data-toc-link={slug}>{text}</a>`.
- Wrap in `<nav aria-label="Table of contents">` with a heading "On this page".
- Renders nothing (component returns null / guard in the page) when the filtered list is below threshold — see below.

### Heading extraction (in each page)

`[id].astro` and `[serie]/[post].astro`:

```ts
const { Content, headings, remarkPluginFrontmatter } = await render(entry); // add `headings`
const tocHeadings = headings.filter((h) => h.depth >= 2 && h.depth <= 3);
const showToc = tocHeadings.length >= 4;
```

Place `<TableOfContents>` alongside the `<Prose>`. Suggested layout: wrap the existing `<Prose>` and the TOC in a `lg:flex lg:gap-12` row; TOC is a `lg:w-56 shrink-0` column, `<Prose>` keeps its centred column. On mobile the TOC renders first, collapsed (below). This is additive to the two templates — the header block above is untouched.

### Sticky CSS (desktop)

- TOC column: `hidden lg:block` for the sidebar presentation.
- Inner `<nav>`: `sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto`.
- Headings get `scroll-mt-24` (via a `prose-headings:scroll-mt-24` utility on `Prose`, or targeted) so smooth-scroll lands with breathing room.
- Active link: `text-foreground-accent font-medium border-s-2 border-muted-border ps-3`; inactive `text-muted`. Both theme sets already defined — no new tokens.

### Scroll-spy — `src/scripts/toc-spy.ts` (loaded in `Layout.astro`, mirrors `reveal-anim.ts`)

```
document.addEventListener("astro:page-load", () => {
  const links = document.querySelectorAll("[data-toc-link]");
  if (!links.length) return;
  const bySlug = new Map(...);           // slug -> link el
  const headings = [...document.querySelectorAll(".prose :is(h2,h3)[id]")];
  const io = new IntersectionObserver(onIntersect, {
    rootMargin: "0px 0px -70% 0px",      // "active" = near top of viewport
    threshold: 0,
  });
  headings.forEach((h) => io.observe(h));
  // track visible set; highlight the topmost visible heading's link
  // (clear all `aria-current`/active class, set on the winner)
});
```

- Reuses the `IntersectionObserver` idiom from `reveal-anim.ts`; runs on `astro:page-load` so it re-binds after view transitions.
- Guard `if (!links.length) return;` means it no-ops on pages without a TOC (home, list, work).
- Smooth scroll on click gated by `prefers-reduced-motion` (respect it the way the reveal system does) — see Accessibility.

### Mobile

Single component, responsive presentation. On `< lg`, render the same `<nav>` inside a `<details>` (`lg:open lg:pointer-events-auto` isn't needed since the sidebar version is a separate branch) — i.e. a collapsed **"On this page"** disclosure at the top of the article, above `<Prose>`. Native `<details>` = zero JS for open/close, keyboard-accessible for free. Scroll-spy still highlights inside it if open; closing it is fine. Desktop shows the sticky sidebar (`hidden lg:block`), mobile shows the `<details>` (`lg:hidden`).

## Which pages get it + long-post threshold

- **In scope:** standalone posts (`/blog/[id]`) and series parts (`/blog/[serie]/[post]`) — the two templates that render `<Prose>` from `render()`.
- **Threshold:** render the TOC only when `tocHeadings.length >= 4` (depth 2–3). Short posts (e.g. `from-x-to-x`-style, 3 headings) get nothing — a 2-item TOC is noise. Heading count is a better "is it long?" signal than reading time here, and it's already in hand. (Threshold is one constant; easy to tune to 3 or 5 after seeing it live.)
- **Out of scope (note as easy follow-ups):**
  - Serie **landing** pages (`/blog/[serie]`) — these are curated part lists, not long prose; the existing part navigation already serves as their "contents". Skip.
  - `/blog` index — N/A.
  - **Work pages** (`/work/[id]`) also render `<Prose>` and several have 8–9 headings; the same component drops in later if wanted. Kept out to scope this to "blog".

## Accessibility

- `<nav aria-label="Table of contents">`; list marked up as `<ol>` (reading order is meaningful).
- Active link carries `aria-current="location"` (not just a colour) so it's conveyed non-visually; colour alone isn't the only signal.
- Anchor links are real `<a href="#slug">` → keyboard/AT navigable, work with JS off.
- Mobile uses native `<details>`/`<summary>` — built-in keyboard + expanded-state semantics.
- Honour `prefers-reduced-motion`: only apply smooth-scroll (JS `scrollIntoView({ behavior: "smooth" })` or CSS `scroll-behavior`) when motion is allowed; default to instant jump otherwise, consistent with `reveal-anim.ts` respecting reduced motion. This also composes with **home-animation-toggle** if a global motion flag lands later.
- Focus is not trapped; TOC is supplementary to the in-page headings.

## Effort estimate

**M (comfortable / small-M).** One new `.astro` component (list + tree grouping + two responsive branches), one small `toc-spy.ts` (~40 lines, IO pattern already in the repo), a two-line change in each of the two templates, plus sticky/`scroll-mt` CSS. No markdown-pipeline or config work — the headings and IDs are free. Bulk of the effort is the scroll-spy edge cases (topmost-visible selection, fast scroll, bottom-of-page) and verifying sticky layout + light/dark legibility across both templates. `pnpm build` and `pnpm format:check` must pass.

## Acceptance

- Long posts (≥ 4 h2/h3) and long series parts show an "On this page" TOC; short ones show none.
- Desktop: TOC sticky in the gutter; current section highlighted while scrolling; click jumps with correct offset.
- Mobile: collapsed "On this page" disclosure above the article.
- Works with JS disabled (links jump; highlight is the only thing lost).
- `aria-current` set on the active item; `prefers-reduced-motion` honoured.
- Legible in light and dark; `pnpm build` + `pnpm format:check` pass.
