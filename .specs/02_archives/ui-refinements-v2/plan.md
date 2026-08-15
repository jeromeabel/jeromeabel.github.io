# UI Refinements v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A second UI/UX refinement pass on `feat/seniority-update` — restructure the home writing row, blog list, work cards + past-projects table, About page, and hero, plus a batch of deterministic copy/icon fixes.

**Architecture:** Pure Astro-component + page-markup edits. No new dependencies, no schema changes, no JS runtime behavior added. Each task edits 1–3 `.astro` files (or markdown frontmatter) and is verified by a green production build, clean Prettier check, and a dev-server visual check.

**Tech Stack:** Astro 5, Tailwind CSS v4 (CSS-native tokens in `src/styles/global.css`), `astro-icon` (lucide + fa6-brands), CVA `Link` variants, pnpm.

## Global Constraints

- **No test suite / no linter** exists. Per-task verification is: `pnpm build` green **and** `pnpm format:check` clean **and** a dev-server visual check at the stated route(s).
- **No accent color token.** `src/styles/global.css` `@theme` exposes only `foreground` / `muted` families. Where the design wants a "strong" mark, use `text-foreground`; "weak" is `text-muted`. **Never introduce a new color token.**
- **Icon language (fixed):** `lucide:folder` = series identity, `lucide:layers` = parts, `lucide:clock` = read time, `lucide:arrow-right` = row/link affordance, `lucide:arrow-down` = scroll cue.
- **Date formatting is `en-GB` everywhere** (already standardized; use existing helpers `getFormattedDate` / `getMonthYear` in `src/utils/format-date.ts`).
- **`topic` frontmatter** is `z.string().optional()` (comma-separated); tag UIs already guard on its presence.
- **Commit style:** conventional commits (`feat:` / `fix:` / `refactor:` / `docs:` / `chore:`), one commit per task. Sign-off line as usual.
- **"since 2010" placement rule:** the phrase appears as a _sentence_ once per page (Hero, Work). On About it lives only as the `AboutFacts` stat + the one "Open source since 2010" prose claim — never as a lead/headline.

---

## File Structure

Files touched, by task:

- **Task 1** — `src/components/blog/PostRow.astro` (home feed row: drop description, add arrow slide).
- **Task 2** — `src/components/blog/PostListItem.astro` (add `compact` prop), `src/pages/blog.astro` (year-rail layout, drop "Latest" H2).
- **Task 3** — `src/components/work/WorkCard.astro` (horizontal split), `src/pages/work.astro` (Selected-work grid → single column).
- **Task 4** — `src/components/work/ArchiveTable.astro` (stretched-link rows, `align-middle`), `src/pages/work.astro` (H2 `Archive` → `More projects`).
- **Task 5** — `src/components/about/AboutText.astro` (add lead, remove timeline), delete `src/components/about/AboutTimeline.astro`.
- **Task 6** — `src/components/hero/HeroSocials.astro` (gap), `src/components/hero/Hero.astro` (scroll-cue prominence + responsive positioning).
- **Task 7** — `src/components/work/WorksStrip.astro` (remove line), `src/pages/blog/[serie]/index.astro` (folder icon), verify `WorkHeader.astro` metadata order.
- **Task 8** — post + seriePost markdown frontmatter (`topic` values). Content task, author-confirmed values.

---

## Task 1: Home PostRow — drop description, add arrow slide

**Files:**

- Modify: `src/components/blog/PostRow.astro`

**Interfaces:**

- Consumes: `getMonthYear` (`src/utils/format-date`), `getMinutesFromBody` (`src/utils/get-minutes-read`), `post.data.topic`. All already imported/used — no signature change.
- Produces: nothing new; markup-only change.

Target row anatomy (top→bottom): serie kicker (if serie) / title + right-aligned `min · MonthYear` meta / topic tags (if any). No description. Hovering slides a `lucide:arrow-right` in from the left and shifts the left content column right by `translate-x-8`; the meta does **not** shift (matches `PostListItem`).

- [ ] **Step 1: Replace the `<a>` markup block**

In `src/components/blog/PostRow.astro`, replace the entire markup section (current lines 26–56, the `<a href=...>…</a>` block) with:

```astro
<a
  href={`/blog/${post.id}`}
  class="border-muted-border hover:bg-muted-background group relative flex flex-col gap-1 overflow-hidden border-b py-4"
>
  <Icon
    name="lucide:arrow-right"
    class="text-muted absolute top-1/2 -translate-x-8 -translate-y-1/2 transition-transform group-hover:translate-x-2"
  />
  <div class="flex flex-col gap-1 transition-transform group-hover:translate-x-8">
    {
      serie && (
        <span class="text-muted flex items-center gap-2 font-mono text-xs uppercase">
          <Icon name="lucide:folder" />
          {serie.title} · part {serie.part}
        </span>
      )
    }
    <div class="flex items-baseline justify-between gap-8">
      <h3 class="flex-1 font-bold">{post.data.title}</h3>
      <span class="text-muted shrink-0 font-mono text-xs">
        {minutes} min · {getMonthYear(post.data.date)}
      </span>
    </div>
    {
      topics.length > 0 && (
        <div class="mt-1 flex gap-2">
          {topics.map((topic) => (
            <span class="border-muted-border text-muted border px-2 py-0.5 font-mono text-xs">
              {topic}
            </span>
          ))}
        </div>
      )
    }
  </div>
</a>
```

Note: the `min · MonthYear` meta sits inside the shifting column here (it is on the title's flex row), unlike `PostListItem` where meta is a separate right-hand child. That is intentional — the title row shifts as a unit; the arrow slides under it. The frontmatter (imports, `minutes`, `topics`) is unchanged.

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: build completes, no errors.

- [ ] **Step 3: Format check**

Run: `pnpm format:check`
Expected: clean. If it reports `PostRow.astro`, run `pnpm format:write` then re-run `pnpm format:check`.

- [ ] **Step 4: Visual check**

Run `pnpm dev`, open `http://localhost:4321/` (home). Confirm on the Writing feed: rows show **no description text**; hovering a row slides an arrow in from the left and shifts the kicker/title/tags right; the `min · MonthYear` moves with the title row; hover tint still applies.

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/PostRow.astro
git commit -m "feat(home): drop PostRow description, add hover arrow slide"
```

---

## Task 2: Blog year-rail list

**Files:**

- Modify: `src/components/blog/PostListItem.astro` (add optional `compact` prop)
- Modify: `src/pages/blog.astro` (year-rail markup, drop "Latest" H2)

**Interfaces:**

- Consumes: `getFormattedDate`, and newly `getMonthYear` (both from `src/utils/format-date`).
- Produces: `PostListItem` gains an optional `compact?: boolean` prop. When `compact` is true the date renders via `getMonthYear` (→ "Jul 2026") instead of `getFormattedDate` (→ "18 Jul 2026"). Default (unset) preserves current full-date behavior for all other callers.

- [ ] **Step 1: Add `compact` prop to `PostListItem`**

In `src/components/blog/PostListItem.astro`, update the imports and Props, and the `<time>` output.

Change the import line (currently line 4):

```astro
import { getFormattedDate, getMonthYear } from "src/utils/format-date";
```

Change the `Props` interface (currently lines 7–9) to:

```astro
interface Props {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  compact?: boolean;
}
```

Change the destructure (currently line 11) to:

```astro
const { post, compact } = Astro.props;
```

Change the `<time>` element (currently line 47) to:

```astro
    <time>{compact ? getMonthYear(post.data.date) : getFormattedDate(post.data.date)}</time>
```

- [ ] **Step 2: Rewrite the "Latest" section in `blog.astro` as a year rail**

In `src/pages/blog.astro`, replace the whole `<section>` that contains `<H2>Latest</H2>` (current lines 32–48) with:

```astro
    <section class="flex flex-col gap-8">
      {
        byYear.map((group) => (
          <div class="flex flex-col gap-2 sm:grid sm:grid-cols-[3rem_1fr] sm:gap-x-3">
            <p class="text-foreground font-mono text-sm font-bold">{group.year}</p>
            <div class="border-muted-border sm:border-l sm:pl-3">
              {group.posts.map((post) => (
                <PostListItem {post} compact />
              ))}
            </div>
          </div>
        ))
      }
    </section>
```

This removes the `<H2>Latest</H2>` heading (the year label is now the structural spine). At `sm`+ each year group is a 2-column rail (year cell + bordered rows). At base it collapses to a stacked single column: year as a full-width mono label above its rows, no left rail. `PostListItem` is passed `compact`, so dates read as "Jul 2026".

Remove the now-unused `H2` import **only if** the Series section below no longer needs it — it does (`<H2>Series</H2>` at line 53 stays). So **keep the `H2` import.**

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build completes, no errors.

- [ ] **Step 4: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 5: Visual check**

`pnpm dev`, open `http://localhost:4321/blog`. Confirm: no "Latest" heading; each year renders as a labelled group (year in bold `text-foreground` mono); at desktop width the year sits left of a bordered rail of rows, dates read as month+year ("Jul 2026"); on a narrow viewport the year stacks full-width above its rows with no left border. Confirm the **Series** section still renders below with its `SerieCard` grid.

- [ ] **Step 6: Commit**

```bash
git add src/components/blog/PostListItem.astro src/pages/blog.astro
git commit -m "feat(blog): year-rail list with compact month dates, drop Latest heading"
```

---

## Task 3: Work Selected — horizontal-split card, single column

**Files:**

- Modify: `src/components/work/WorkCard.astro` (layout rewrite, drop cross overlay)
- Modify: `src/pages/work.astro` (Selected-work grid → single column)

**Interfaces:**

- Consumes: `work.data.img_preview`, `work.data.kicker`, `work.data.title`, `work.data.description`, `work.data.date`. No signature change.
- Produces: markup-only; `WorkCard` still takes `work?: CollectionEntry<"work">`.

Card becomes a horizontal row: image left (~38% fixed), text right, stacking vertically on mobile. The oversized rotating `cross-big` overlay is removed. Hover affordance = `hover:bg-muted-background` tint only (whole card is obviously a link).

- [ ] **Step 1: Rewrite the `WorkCard` markup**

In `src/components/work/WorkCard.astro`, replace the `<a>…</a>` markup block (current lines 28–79) with:

```astro
<a
  href={"/work/" + work.id}
  title={`Open the "${work.data.title}" project`}
  class="border-muted-border hover:bg-muted-background group flex flex-col border outline-offset-4 outline-black focus:outline-2 sm:flex-row"
>
  <div class="relative aspect-video overflow-hidden sm:w-[38%] sm:flex-none">
    <Image
      src={work.data.img_preview}
      alt={`${work.data.title} preview`}
      class="block h-full w-full object-cover transition-transform duration-1000 motion-safe:group-hover:scale-105"
      loading="lazy"
      widths={[240, 360, 540, 768, 960]}
      sizes={`(max-width: 639px) calc(100vw - 2rem), (min-width: 640px) 38vw`}
    />
  </div>

  <div class="flex flex-col p-6 sm:flex-1 lg:p-8">
    {
      work.data.kicker && (
        <p class="text-muted font-mono text-xs tracking-wide uppercase">
          {work.data.kicker}
        </p>
      )
    }
    <p class="font-title text-3xl tracking-wide">
      {work.data.title}
    </p>
    <p class="line-clamp-3 pt-2">{work.data.description}</p>
    {
      !work.data.kicker && (
        <p class="text-muted mt-auto flex items-center gap-2 pt-6">
          <Icon name="lucide:calendar" />
          <time>{dateISOString}</time>
        </p>
      )
    }
  </div>
</a>
```

The `Icon` import (line 2) is still used by the no-kicker date fallback — **keep it**. The `Image` and date-formatting frontmatter are unchanged. Note the `sizes` attribute is updated to reflect the new ~38% width so Astro picks a sensibly small candidate; the `cross-big` overlay `<div>` block is deleted entirely.

- [ ] **Step 2: Switch the Selected-work grid to single column**

In `src/pages/work.astro`, change the Selected-work grid wrapper (current line 30):

```astro
      <div class="mt-8 grid grid-cols-1 gap-8">
```

(Removes `sm:grid-cols-2` — the 4 horizontal cards now stack full-width.)

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build completes, no errors.

- [ ] **Step 4: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 5: Visual check**

`pnpm dev`, open `http://localhost:4321/work`. Confirm Selected work shows 4 **horizontal** cards (image ~38% on the left, text right), each visibly shorter than the old square-image cards, stacked in a single full-width column. On a narrow viewport the image sits on top and text below. Hovering tints the card (no rotating cross overlay). All 4 kickers show `"{Type} · {years}"`.

- [ ] **Step 6: Commit**

```bash
git add src/components/work/WorkCard.astro src/pages/work.astro
git commit -m "feat(work): horizontal-split cards in single-column Selected work"
```

---

## Task 4: Work — "More projects" table, whole-row link

**Files:**

- Modify: `src/pages/work.astro` (H2 `Archive` → `More projects`)
- Modify: `src/components/work/ArchiveTable.astro` (`align-middle`, stretched-link row, keep external Visit above the stretch)

**Interfaces:**

- Consumes: `works: CollectionEntry<"work">[]`, `externalUrl(...)`. Unchanged.
- Produces: markup-only. Component filename stays `ArchiveTable.astro` (internal name — no import churn).

Whole row navigates to `/work/{id}`. Implemented with a stretched link: the Project-cell anchor gets `after:absolute after:inset-0` and the `<tr>` gets `relative`, so a click anywhere on the row follows it — while the external "Visit" anchor sits at `relative z-10` to stay independently clickable above the stretch.

- [ ] **Step 1: Rename the heading**

In `src/pages/work.astro`, change the Archive section H2 (current line 36):

```astro
      <H2>More projects</H2>
```

- [ ] **Step 2: Make rows vertically centered and whole-row links**

In `src/components/work/ArchiveTable.astro`, replace the `<tr>…</tr>` body (current lines 32–65, the row returned inside `works.map`) with:

```astro
            <tr class="border-muted-border hover:bg-muted-background/50 relative border-b align-middle">
              <td class="text-muted py-3 pr-4 font-mono text-xs whitespace-nowrap">
                {work.data.date.getFullYear()}
              </td>
              <td class="py-3 pr-4 font-semibold">
                <a
                  href={`/work/${work.id}`}
                  class="hover:text-foreground border-b border-dashed border-current after:absolute after:inset-0 hover:border-solid"
                >
                  {work.data.title}
                </a>
              </td>
              <td class="text-muted hidden py-3 pr-4 sm:table-cell">
                {work.data.type}
              </td>
              <td class="text-muted hidden py-3 pr-4 font-mono text-xs md:table-cell">
                {work.data.stack?.join(", ") ?? "—"}
              </td>
              <td class="relative z-10 py-3">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`Visit ${work.data.title} (external)`}
                    class="border-b border-dashed border-current hover:border-solid"
                  >
                    Visit
                  </a>
                ) : (
                  <span class="text-muted">—</span>
                )}
              </td>
            </tr>
```

Changes vs current: `align-top` → `align-middle`, `<tr>` gains `relative`; the Project anchor gains `after:absolute after:inset-0` (stretched link); the Link cell `<td>` gains `relative z-10` so the Visit anchor stays clickable above the stretch.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build completes, no errors.

- [ ] **Step 4: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 5: Visual check**

`pnpm dev`, open `http://localhost:4321/work`. Confirm the past-projects heading reads **More projects**; clicking anywhere on a row (an empty Type/Built-with cell, whitespace) navigates to that project's `/work/[id]` page; the **Visit** external link, when present, still opens the external URL in a new tab (i.e. it wins over the row link); rows are vertically centered; mobile column hiding (`Type` at `sm`, `Built with` at `md`) and horizontal scroll still work.

- [ ] **Step 6: Commit**

```bash
git add src/pages/work.astro src/components/work/ArchiveTable.astro
git commit -m "feat(work): rename Archive to More projects, whole-row links"
```

---

## Task 5: About — lead sentence, drop timeline

**Files:**

- Modify: `src/components/about/AboutText.astro` (add lead `<p>`, remove `AboutTimeline` import + usage)
- Delete: `src/components/about/AboutTimeline.astro` (orphaned after this — verified sole consumer is `AboutText`)

**Interfaces:**

- Consumes: `AboutFacts`, `Link`, `Prose`, `H1`, `Icon`. `AboutTimeline` import removed.
- Produces: markup-only.

Add an emphasized lead directly under `<H1>About</H1>`. It carries **no "since 2010"** (the About page already states the year via the `AboutFacts` stat and the "Open source since 2010" prose claim). Approved lead copy: _"Artist turned web developer — I build things meant to be used, not just seen."_ (thematic, year-free, distinct from the hero paragraph).

- [ ] **Step 1: Remove the `AboutTimeline` import**

In `src/components/about/AboutText.astro`, delete line 3:

```astro
import AboutTimeline from "@components/about/AboutTimeline.astro";
```

- [ ] **Step 2: Add the lead, remove the timeline usage**

In the same file, change the block from `<H1>About</H1>` through `<AboutTimeline />` (current lines 11–25) to:

```astro
  <H1>About</H1>
  <p class="font-title text-2xl tracking-wide text-balance sm:text-3xl">
    Artist turned web developer — I build things meant to be used, not just seen.
  </p>
  <Prose>
    <p>
      <strong>I build web applications</strong> with Vue and TypeScript. After an
      intensive career change into web development, I deepened my Vue and Kotlin skills
      at Raccourci Agency, and now work at{" "}<Link
        label="uhlive"
        href="https://uh.live/"
      />, on the front end of an AI-driven call-intelligence product.
    </p>
  </Prose>

  <AboutFacts />
```

(The `<AboutTimeline />` usage is gone; `<AboutFacts />` stays; the Download CV link and trailing Prose blocks below are unchanged.)

- [ ] **Step 3: Delete the orphaned component**

Run: `git rm src/components/about/AboutTimeline.astro`
(Sole consumer was `AboutText`, confirmed by grep — no other import remains.)

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build completes, no errors, no "cannot resolve AboutTimeline" error.

- [ ] **Step 5: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 6: Visual check**

`pnpm dev`, open `http://localhost:4321/about`. Confirm: an emphasized lead line sits under the "About" H1 ("Artist turned web developer …"); the 4-stat facts row is present; the 5-dot year **timeline is gone**; Download CV link and the narrative Prose blocks remain.

- [ ] **Step 7: Commit**

```bash
git add src/components/about/AboutText.astro src/components/about/AboutTimeline.astro
git commit -m "feat(about): add thematic lead line, remove year timeline"
```

---

## Task 6: Hero — tighter socials, prominent always-visible scroll cue

**Files:**

- Modify: `src/components/hero/HeroSocials.astro` (gap)
- Modify: `src/components/hero/Hero.astro` (scroll-cue prominence + responsive positioning)

**Interfaces:**

- Consumes: `Icon` (astro-icon), `Link`. Unchanged.
- Produces: markup-only.

Icon buttons move closer. "Start reading" becomes a bordered pill (dashed border matching the site's `Link` icon idiom, `lucide:arrow-down`, `hover:text-foreground`) that is visible on **all** breakpoints: in normal flow (centered, `mt-8`) below `lg`, and pinned `absolute bottom-0` at `lg`+ — with no overlap against `HeroSocials`.

- [ ] **Step 1: Tighten social icon spacing**

In `src/components/hero/HeroSocials.astro`, change the wrapper (current line 5):

```astro
<div class="mt-6 flex items-center gap-3 lg:mt-10 lg:gap-4">
```

(`gap-4 lg:gap-6` → `gap-3 lg:gap-4`.)

- [ ] **Step 2: Promote the scroll cue and make it always visible**

In `src/components/hero/Hero.astro`, replace the `<a href="#writing">…</a>` block (current lines 12–18) with:

```astro
  <a
    href="#writing"
    class="text-muted hover:text-foreground border-muted-border mt-8 flex items-center justify-center gap-2 self-center border border-dashed px-4 py-2 transition-colors lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:self-auto"
  >
    <Icon name="lucide:arrow-down" />
    Start reading
  </a>
```

Behavior: base/`md` — a centered dashed pill in normal flow below the hero content (`mt-8`, `self-center`), so it never overlaps the socials on non-fixed-height layouts. At `lg`+ — the hero is a fixed 500px box, so the cue pins `absolute bottom-0 left-1/2 -translate-x-1/2` with margins reset. Dashed border + `hover:text-foreground` give it presence without a new color token.

Note: the parent `<section>` (line 8) already has `relative`, so `lg:absolute` anchors to it correctly. No change needed there.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build completes, no errors.

- [ ] **Step 4: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 5: Visual check**

`pnpm dev`, open `http://localhost:4321/`. Confirm: social icons are visibly tighter; "Start reading" is a bordered dashed pill with a down-arrow, visible at **every** width; at desktop it sits centered at the hero's bottom edge, on mobile it sits centered in flow below the hero text with **no overlap** against the social icons at any viewport width; clicking it scrolls to the Writing section (`#writing`).

- [ ] **Step 6: Commit**

```bash
git add src/components/hero/HeroSocials.astro src/components/hero/Hero.astro
git commit -m "feat(hero): tighten socials, make Start reading a prominent always-visible cue"
```

---

## Task 7: Deterministic batch — WorksStrip line, serie folder icon, metadata-order verify

**Files:**

- Modify: `src/components/work/WorksStrip.astro` (remove the "Building since 2010" line)
- Modify: `src/pages/blog/[serie]/index.astro` (folder icon before the serie H1)
- Verify only (no edit expected): `src/components/work/WorkHeader.astro` metadata order; featured-work kicker format

**Interfaces:**

- Consumes: `Icon` (astro-icon) — already imported in the serie index page. `H2`, `Link`, `P`, `WorkMiniCard` in WorksStrip.
- Produces: markup-only.

- [ ] **Step 1: Remove the redundant WorksStrip line**

In `src/components/work/WorksStrip.astro`, delete line 13 (duplicates the hero paragraph, per the "since 2010" placement rule):

```astro
  <P>Building since 2010 — from robotic drummers to web apps.</P>
```

Also remove the now-unused `P` import (line 3) — after deleting the only `<P>` usage, `import P from "@components/ui/P.astro";` is dead. Verify no other `<P>` remains in the file before removing the import.

- [ ] **Step 2: Add a folder icon to the Series landing H1**

`H1.astro` does **not** forward a `class` prop (it renders a fixed `<h1>` with a `<slot />`), so wrap the H1 in a flex row rather than styling the H1. In `src/pages/blog/[serie]/index.astro`, replace the H1 line (current line 41):

```astro
        <div class="flex items-center gap-3">
          <Icon name="lucide:folder" class="text-muted text-2xl" />
          <H1>{entry.data.title}</H1>
        </div>
```

`Icon` is already imported (line 7).

- [ ] **Step 3: Verify work metadata order (no edit expected)**

Confirm `src/components/work/WorkHeader.astro` renders metadata rows in order **TYPE · DATE · STACK** (currently lines 28–36 — it already does). Confirm all featured-work kickers follow `"{Type} · {years}"` (already true: `Open source · 2013–2021`, `Art · 2013–2019`, `Web · 2023`, `Web · 2024–now`). No change needed — this step is a verification gate. If either is out of order, reorder to match; otherwise proceed.

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build completes, no errors, no "P is defined but never used" style failure (Astro won't error on unused imports, but the removed import keeps it clean).

- [ ] **Step 5: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 6: Visual check**

`pnpm dev`. On `http://localhost:4321/` confirm the Work mini-strip no longer shows the "Building since 2010 …" line (heading + mini-cards remain). On a series landing page (e.g. `http://localhost:4321/blog/web-performance`) confirm a folder icon sits inline before the series title, vertically centered and muted.

- [ ] **Step 7: Commit**

```bash
git add src/components/work/WorksStrip.astro src/pages/blog/[serie]/index.astro
git commit -m "fix(ui): drop duplicate WorksStrip line, add folder icon to series landing"
```

---

## Task 8: Populate `topic` frontmatter (content)

**Files:**

- Modify: standalone post frontmatter — `src/content/post/*/index.md`
- Modify: seriePost frontmatter — `src/content/serie/*/*/index.md`

**Interfaces:**

- Consumes: `topic: z.string().optional()` (already in schema; no schema change). PostRow/PostListItem already render tags when `topic` is present.
- Produces: `topic` values enable the tag UIs shipped in Tasks 1–2.

**Author-owned content.** These are proposed values derived from titles; the author (Jérôme) confirms/edits before commit. The UI is already built — this task only adds data.

- [ ] **Step 1: Add `topic` to standalone posts**

Add a `topic:` line to each post's frontmatter (comma-separated, max 2 shown by the UI). Proposed values:

| File                                                            | Proposed `topic`     |
| --------------------------------------------------------------- | -------------------- |
| `src/content/post/adding-likes-to-a-static-astro-site/index.md` | `astro, performance` |
| `src/content/post/api-endpoints-with-astro/index.md`            | `astro, backend`     |
| `src/content/post/clickable-images-astro-markdown/index.md`     | `astro, ui`          |
| `src/content/post/nuxt-clean-architecture/index.md`             | `nuxt, architecture` |
| `src/content/post/web-testing-quotes-and-tips/index.md`         | `testing`            |

Example — in `src/content/post/adding-likes-to-a-static-astro-site/index.md`, add under `date:`:

```yaml
topic: "astro, performance"
```

- [ ] **Step 2: Add `topic` to seriePosts**

Add `topic:` to each serie post. Proposed by series:

- `src/content/serie/web-performance/*/index.md` → `"astro, performance"`
- `src/content/serie/testing-a-simple-nuxt-feature/*/index.md` → `"nuxt, testing"`
- `src/content/serie/my-ai-journey/*/index.md` → `"ai"`

Apply the matching value to every `NN-*/index.md` under each series directory.

- [ ] **Step 3: Confirm values with the author**

Pause and confirm the proposed topics with Jérôme (content authority). Adjust any before proceeding.

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build completes, no errors (invalid frontmatter would fail Zod parsing here).

- [ ] **Step 5: Format check**

Run: `pnpm format:check`
Expected: clean. Run `pnpm format:write` + re-check if needed.

- [ ] **Step 6: Visual check**

`pnpm dev`. On `http://localhost:4321/` (home feed) and `http://localhost:4321/blog`, confirm tag pills now render on posts that have a `topic` (bordered mono chips, max 2).

- [ ] **Step 7: Commit**

```bash
git add src/content/post src/content/serie
git commit -m "content: populate topic frontmatter for post and serie tags"
```

---

## Acceptance criteria (from spec)

1. ✅ Task 1 — Home feed rows show no description; hover slides an arrow in from the left and shifts title/kicker/tags right.
2. ✅ Task 2 — `/blog` shows year-labelled groups, no "Latest" heading; dates read month+year; Series section persists below.
3. ✅ Task 3 — `/work` Selected work: 4 horizontal-split cards, image ~38% left, shorter than before; single-column stack.
4. ✅ Task 4 — `/work` past section titled **More projects**; whole row navigates to `/work/[id]`; rows vertically centered; external Visit still works.
5. ✅ Task 5 — `/about`: emphasized lead line under H1; 4-stat facts row; no timeline.
6. ✅ Task 6 — Hero: tighter social icons; "Start reading" prominent + always visible, no overlap.
7. ✅ Task 7 — WorksStrip "Building since 2010…" gone; Series landing H1 carries a folder icon; work metadata order verified consistent. ✅ Task 8 — posts with `topic` render tag pills.
8. ✅ Every task ends with `pnpm build` green + `pnpm format:check` clean.

## Out of scope (from spec)

CV system (separate repo), illustration/OG-image system, case-study prose bodies, any `serie`/`seriePost` route or schema change beyond reading existing optional `topic`.
