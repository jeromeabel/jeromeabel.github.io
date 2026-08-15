---
title: "Figma DS: writing-preview master, SerieCard structure, coverage boundary"
created: 2026-08-15
---

Three gaps the geometry prover (Task 14 Step 5) surfaced after the seven real
drift items were fixed. All are decisions, not drift — none of them is something
`diff-geometry.mjs` can settle.

**1. Home's writing-preview row has no master.** Figma's `BlogPreviewContent` is
HORIZONTAL and holds no `PostRow` instances; code's `SelectedWriting` renders a
2-column grid of `PostRow.astro` / `PostRowCalm.astro` rows
(`flex-col gap-1 px-1 py-4`). The `PostRow` master models a different component —
all 32 of its instances live under `Blog — * > PostArchiveList > BlogPostRows`,
i.e. `PostListItem.astro` (`flex-row gap-8 py-4`). `blog-postrowcalm--calmrow`
now reports honestly as "missing in Figma". Either build the master or record the
omission as deliberate.

**2. `SerieCard` splits padding differently from code.** Figma = root pad 0 /
`Content` pad 24, so the cover bleeds to the card edge; code = `p-4 lg:p-6` on
the whole card with `gap-2` between cover and text. The _numbers_ now match; the
_structure_ does not. Pick one deliberately rather than letting the prover drive
it.

**3. Coverage boundary, for the record.** 19 of `pixel-manifest.mjs`'s 40
component ids map onto a live master. Of the 21 that don't, 5 exist as page
frames or Docs specimen cells (`HeroText`, `PostMetadataTopic`, `ShareIconsRow`,
`ContactImage`, `PostArchiveList`) and ~16 are genuinely absent (`about-*`,
`Prose`, `CustomImage`, `LinkNavPost`, `WorkGalleryCard`, `WorkOverlayCard`,
`WorkHeader`, `RelatedWork`, `RelatedWriting`, `SerieContents`, `ui-link`
default/external). Reason is scope: DS v3 covers Home + Blog index, and Task 11
deleted the detail templates that carried prose/TOC/nav-post. Expanding DS
coverage to the detail pages is its own topic.

Two harness limits worth knowing before anyone re-runs the prover: the
❖ Components page is pinned to `2 Theme = Dark` while `diff-geometry.mjs`
compares against web desktop/light (every color row is a mode mismatch), and
masters put the gutter on the root with the rhythm one level down, while the web
root carries the rhythm itself (every padding row needs the nesting accounted
for). Also: a stale selector in `pixel-manifest.mjs` yields `root: null`, which
the diff silently skips — drift in the component you just renamed classes on is
exactly the drift you stop seeing.

Source: `.specs/02_archives/figma-responsive-architecture/progress.md`
(Task 14 Step 5 and its follow-up).
Size: M
