---
shipped: 2026-07-19
title: UX/UI & Copy Review — feat/seniority-update
---

# UX/UI & Copy Review — feat/seniority-update

Two review passes on the `feat/seniority-update` diff vs `main`: Jérôme's browser
pass + Claude's deep diff review. Findings triaged and resolved across the
`ui-refinements-v2` and deterministic-fix commits on this branch.

**Shipped state as of archive.** All actionable findings landed or were superseded
by a better solution; remainder are author-only content TODOs and one verified
no-op. Nothing outstanding blocks the branch.

---

## Deterministic fixes — shipped ✅ (verified in committed code)

| Finding                                     | Resolution                                                                                                                                | Location                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Footer overflow scrollbar                   | `overflow-x: clip` (root cause: `hidden`/`visible` axis pair forces `overflow-y: auto`; `clip` doesn't)                                   | `src/styles/global.css:11`                                          |
| Hero "Start reading" anchor overlap         | **Superseded** — reworked into always-visible dashed-border cue, centered below content on mobile, `lg:absolute lg:bottom-0` only at `lg` | `src/components/hero/Hero.astro:11-18`                              |
| Archive titles orphaned from `/work/[id]`   | **Superseded** — section renamed "More projects", rows link internal `/work/${id}`; external "Visit" kept secondary                       | `src/pages/work.astro:36`, `ArchiveTable.astro:38`                  |
| Bare repeated "Visit" links (a11y)          | `aria-label="Visit {title} (external)"`                                                                                                   | `ArchiveTable.astro:56`                                             |
| RSS autodiscovery missing                   | `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` in `<head>`                                                           | `SEO.astro:40-43`                                                   |
| WorkCard duplicate date (kicker + calendar) | Calendar row rendered only when `!kicker`                                                                                                 | `WorkCard.astro:57-60`                                              |
| Copy: "reconversion" calque                 | "intensive career change into web development"; year timeline removed entirely                                                            | `AboutText.astro:18`                                                |
| Copy: years inconsistent (15/16/fifteen)    | Standardized "Open work since 2010" (self-updating)                                                                                       | `work.astro:20`                                                     |
| Copy: "at work" collides w/ page title      | "What I build at my day job is private"                                                                                                   | `work.astro:21`                                                     |
| Copy: "Works" vs nav "Work"                 | Standardized                                                                                                                              | `WorksStrip.astro`                                                  |
| AboutFacts hardcoded/stale                  | Article count computed `(await getAllBlogPosts()).length`; "framework" → "Malinette downloads"                                            | `AboutFacts.astro:4,9`                                              |
| Locale `en-EN` invalid                      | → `en-GB` (all 4 sites)                                                                                                                   | `format-date.ts:8,16`, `WorkCard.astro:23`, `PostListItem.astro:20` |
| SerieCard chevron reads as nav              | folder + layers icons; "94 min total" → `~Xh Ym read`                                                                                     | `SerieCard.astro:20,31,39`                                          |

**Verified no change needed:** HeroText h1 dropping surname is fine — SEO
`<title>`/OG carry "Jérôme Abel" (`SEO.astro`).

---

## Brainstorm items — shipped ✅ via `ui-refinements-v2`

The "needs a decision / needs brainstorming" cluster was designed and shipped
under the `ui-refinements-v2` spec (see `01_active/ui-refinements-v2/`):

| Concern                                                | Resolution                                                                                                                  | Commit(s)                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Blog-list scanability (tags/serie/spacing/grouping)    | Topic frontmatter + bordered topic chips in `PostListItem`; year-rail list w/ compact month dates, "Latest" heading dropped | `4859dc4`, `5ef5671`, `c37fdc2`            |
| Archive ↔ project-pages relationship                   | Balanced choice: "More projects" whole-row internal links, external secondary                                               | `6e511a5`                                  |
| "Start here" heading + composition + latest-vs-curated | Renamed "Writing", genuine latest feed (`getLatestWriting`), PostRow two-line rows, hover arrow slide                       | `796eb83`, `74558bc`, `a1e93b7`, `9a5ae34` |
| Selected-work ordering & card density                  | Web projects lead / art trailing; horizontal-split cards in single-column; year+type kicker                                 | `ead280c`, `b9eb411`, `0b4aff5`, `e06a764` |
| About layout alternatives                              | Thematic lead line added, year timeline removed                                                                             | `fb58f0c`                                  |

---

## Verified no-op — link hit-area overlap ✅

`Link.astro` default variant `after:-inset-y-2 after:-inset-x-1` (transparent
`content-['']` pseudo). Checked all real usage:

- **Footer** — `flex flex-row flex-wrap`; horizontal, not stacked. Overlap only
  between wrapped rows, ±8px, invisible. The visible symptom (scrollbar) was the
  footer-overflow bug, already fixed via `overflow-x: clip`.
- **AboutText** — inline prose links; overlap only if two wrap onto adjacent lines
  with matching x-range. Rare, invisible.
- **Blog prose body** — markdown `<a>` styled via `prose-a:` in `Prose.astro`,
  gets no `after` pseudo. Unaffected.
- **Contact** — `bold`/`icon` variants, no default stack.

**Verdict: no fix needed.** Transparent pseudo → no visual bug; worst case is
minor tap-boundary ambiguity between vertically-adjacent links. Not worth a change.

---

## Remaining — author-only, out of scope for this spec

- `TODO(author)` HTML comments still present in three case studies — need Jérôme's
  prose, cannot be authored here:
  - `src/content/work/malinette/index.md`
  - `src/content/work/chimeres-orchestra/index.md`
  - `src/content/work/leconceptdelapreuve/index.md`

Tracked as content work, not a UX/copy finding. Everything reviewable in this
spec is resolved — archiving.
