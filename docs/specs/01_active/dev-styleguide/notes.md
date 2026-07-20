# Dev-styleguide — legacy component review notes

## Task 2 (`work/` legacy stories) — findings

### Prop drift: none

All 3 restored `work/` components' `Props` interfaces are compatible with the
current `work` content-collection schema (`src/content.config.ts`) and with
`getFeaturedWorks()` (`src/utils/repository.ts`). No inline fixtures were
needed; every story uses real data with `satisfies ComponentProps<typeof X>`.

- `WorkCard.astro` — `{ work?: CollectionEntry<"work"> }`. Uses
  `work.data.{title,description,date,img_preview}` — all present in the v3
  schema.
- `WorkCardImage.astro` — `{ work?: CollectionEntry<"work">; variant?: "home" | "work" }`.
  Same fields as above. Note (informational, not a story blocker): the
  component destructures `variant` from `Astro.props` but never uses the
  destructured value — it hardcodes `const variant = "home";` right after,
  so the `variant` prop is currently dead code in the legacy component
  itself. Not fixed (out of scope — restored verbatim, not adopted).
- `WorksPreview.astro` — no `Props` interface; self-fetches via
  `getCollection("work")`. Story uses `args: {}`, matching the `WorksStrip`
  (live) convention.

### Bug found in Task 1 restore: broken frontmatter fence (fixed for the 3 `work/` files)

All 9 files restored in Task 1 got the legacy header comment prepended as
**line 1, before the opening `---` frontmatter fence**:

```astro
{/* LEGACY — main-only, not wired into any v3 page. Kept for styleguide delete-vs-adopt review. See docs/specs/01_active/dev-styleguide. */}
---
import ...
---
```

Astro requires the frontmatter fence to be the first content in the file
(only leading whitespace is allowed before it). A line before `---` means
Astro never recognizes a frontmatter block at all. Verified directly with
`@astrojs/compiler`'s `parse()`:

```
The closing frontmatter fence (---) is missing an opening fence
```

— this diagnostic fired for all 5 restored files spot-checked (`WorkCard`,
`WorkCardImage`, `WorksPreview`, and `blog/PostCard`, `blog/BlogPreview`),
confirming it's a systemic defect across the whole Task-1 restore, not
specific to the 3 `work/` components.

This went undetected in Task 1 because `pnpm build` never actually compiles
these files — they're orphaned (unreferenced by any page), and Astro's
static build only compiles files reachable from the route graph. The defect
only surfaces once something actually imports and renders the component —
which is exactly what a story does.

Effect when rendered (verified live via `pnpm dev` + `/styleguide`):

- `WorkCard.astro`, `WorkCardImage.astro` — hard `CompilerError` (500):
  their `interface Props { ... }` declarations aren't valid outside a
  recognized frontmatter block, so the compiler chokes on the `interface`/`:`
  tokens.
- `WorksPreview.astro` — no hard compile error (no TS-only syntax in its
  frontmatter to choke on), but a silent runtime `getCollection is not
  defined` — the `import` never actually gets bound because it isn't
  hoisted from a real frontmatter block.

**Fix applied (this task, 3 `work/` files only):** moved the exact same
header-comment line from before the opening `---` fence to immediately
after the closing `---` fence (first line of the template section), e.g.:

```astro
---
import { Icon } from "astro-icon/components";
...
---

{/* LEGACY — main-only, not wired into any v3 page. Kept for styleguide delete-vs-adopt review. See docs/specs/01_active/dev-styleguide. */}
<a href={...}>
```

Comment text is byte-identical, only its position changed. Re-verified with
`@astrojs/compiler` `parse()` (zero diagnostics for all 3 files after the
fix) and live in `pnpm dev`: all 3 story pages return 200 with real
rendered work content (image, title, link to `/work/<id>`), and `pnpm
build` still passes.

**Not fixed (out of scope for Task 2):** the same defect is present in the
6 restored `blog/` files (`BlogPreview`, `PostCard`, `PostList`,
`SerieList`, `SerieListItem`, `SeriePostCard`) — Task 3's scope. Whoever
picks up Task 3 will need to apply the identical fix (move the header
comment to right after the closing `---`) before any of those stories can
render successfully, independent of any prop-drift issues in those
components.

### `title: 'Legacy/<Name>'` does not group the sidebar (astrobook limitation)

Plan C / design.md assume astrobook groups stories in the sidebar by a
per-story `title` field in the default export (Storybook-style CSF), and
that prefixing it `Legacy/<Name>` will visually separate legacy stories
from the live catalog.

This does not hold for the installed `astrobook@0.13.2` (latest published
version as of this check — `npm view astrobook versions` confirms no newer
release exists). Confirmed by reading `@astrobook/types`' `IntegrationOptions`
and `StoryModule` type declarations (no per-story `title` field exists in
the CSF-subset — the only supported default-export keys are `component`
and, per named exports, `args`/`decorators`), by the README ("Astrobook...
is compatible with a limited subset of Storybook's CSF v3. In particular,
`args` and `decorators` properties are supported" — `title` is not
mentioned), and empirically: `StoryModule.directory` is derived from the
`.stories.ts` file's own directory on disk. Rendered `/styleguide` sidebar
HTML confirms `WorkCard`, `WorkCardImage`, `WorksPreview` are nested under
the plain `work` folder node, interleaved alphabetically with the live
siblings (`WorkGalleryCard`, `WorkHeader`, `WorkMiniCard`, `WorkOverlayCard`,
`WorksStrip`) — not under any separate `Legacy` node. The `title` key in
the default export is silently ignored (no build/dev warning).

Stories still added `title: 'Legacy/<Name>'` per the brief (harmless,
future-proof if astrobook ever adds title support, and it's what Plan C
explicitly asks for), but readers should not expect it to produce visual
separation today. Actual separation, if wanted, would require relocating
`.stories.ts` files to a distinct directory tree (e.g.
`src/components/legacy/work/WorkCard.stories.ts` importing
`../../work/WorkCard.astro`), which conflicts with the brief's explicit
colocated file paths — flagging for **Task 4** (which does the "confirm a
`Legacy/` group holds the 9, visually separate" check) to resolve or
re-scope.

## Task 3 (`blog/` legacy stories) — findings

### Frontmatter-fence fix applied to all 6 restored `blog/` files

Same defect and same fix as Task 2 (see above): the Task-1 restore
prepended the LEGACY header comment as line 1, before the opening `---`
fence, in all 6 `blog/` files too. Moved the identical comment text to
immediately after the closing `---` fence (first line of the template
section) in `BlogPreview.astro`, `PostCard.astro`, `PostList.astro`,
`SerieList.astro`, `SerieListItem.astro`, and `SeriePostCard.astro` —
position only, byte-identical text, no reformatting (Prettier's `--write`
would have reflowed the single-line `{/* ... */}` comment into a 3-line
`{\n  /* ... */\n}` block; that was reverted to preserve the "position
change only" constraint, matching Task 2's precedent — Task 2's 3
`work/` files also still fail `prettier --check` for the same reason and
were left as-is).

Verified with `@astrojs/compiler`'s `parse()`: zero diagnostics for all 6
files after the fix (previously: "The closing frontmatter fence (---) is
missing an opening fence" on all 6, confirmed in Task 2's spot-check of
`PostCard` and `BlogPreview`).

Applied to `PostList.astro` as well even though it isn't storied (see
below) — the file stays restored + tagged + fence-fixed, per the task
brief, in case a future incompatibility fix un-skips it.

### Prop drift: none

All 5 storied components' `Props` (or self-fetch signature) are compatible
with the current content-collection schema (`src/content.config.ts`) and
current `src/utils/repository.ts` exports. No inline fixtures were needed;
every story uses real data with `satisfies ComponentProps<typeof X>` (or
`args: {}` for the two self-fetching components, matching the
`WorksPreview` convention).

- `BlogPreview.astro` — no `Props`; self-fetches via `getAllBlogPosts()`.
  Story uses `args: {}`. Note: its own import line reads
  `@components/blog//SeriePostCard.astro` (double slash) — a pre-existing
  typo carried over from `main`, not introduced by any restore/fix step.
  It resolves fine (verified: story renders 200 with real post content) so
  left untouched, out of scope for this task.
- `PostCard.astro` — `{ post: CollectionEntry<"post"> }`. Uses
  `post.data.{title,description,date}` and `post.body` — all present in
  the current `post` schema. Fed with `getAllStandalonePosts()[0]`.
- `PostList.astro` — **skipped, no story.** Imports the removed
  `getAllPosts` export from `src/utils/repository` (current repository.ts
  has no such export — closest analogues are `getAllStandalonePosts`,
  `getAllBlogPosts`, `getAllSeriePosts`). This is a genuine missing-export
  incompatibility, not prop drift, and not something a story-level fixture
  can paper over without editing the component itself (out of scope — the
  brief and Task 1 Step 3b both call this a pre-known skip). Fence fix was
  still applied (see above) for restore consistency.
- `SerieList.astro` — no `Props`; self-fetches via `getAllSeries()`. Story
  uses `args: {}`.
- `SerieListItem.astro` — `{ serie: CollectionEntry<"serie"> }`. Uses
  `serie.data.{title,abstract}` and `getPostsFromSerie(serie)` — both
  compatible with the current `serie` schema and repository export. Fed
  with `getAllSeries()[0]`.
- `SeriePostCard.astro` — `{ post: CollectionEntry<"seriePost"> }`. Uses
  `post.data.{title,description,date}`, `post.body`, and self-fetches
  `getCollection("serie")` to locate the parent serie/index — all
  compatible with the current schema. Fed with `getAllSeriePosts()[0]`.

Verified live via `pnpm dev` + `/styleguide`: all 5 story pages
(`blog/BlogPreview`, `blog/PostCard`, `blog/SerieList`,
`blog/SerieListItem`, `blog/SeriePostCard`) return 200 with real rendered
content (checked for component-specific markup: "Latest Posts" heading,
card `href` links, list container classes). `pnpm build` still passes.
`PostList` does not appear in the astrobook sidebar (no `.stories.ts`
file), confirming the skip took effect cleanly.

## Legacy component delete-vs-adopt verdicts

Placeholder — decide after eyeballing all 9 in `/styleguide` now that
Tasks 2 and 3 are both complete.

- `work/WorkCard` — keep / delete / adopt — decide after eyeballing.
- `work/WorkCardImage` — keep / delete / adopt — decide after eyeballing.
- `work/WorksPreview` — keep / delete / adopt — decide after eyeballing.
- `blog/BlogPreview` — keep / delete / adopt — decide after eyeballing.
- `blog/PostCard` — keep / delete / adopt — decide after eyeballing.
- `blog/PostList` — pre-known incompatible (imports removed `getAllPosts`
  export) — skipped story, per Task 1 Step 3b / plan-c.md. Fence-fixed but
  unstoried; stays restored for now.
- `blog/SerieList` — keep / delete / adopt — decide after eyeballing.
- `blog/SerieListItem` — keep / delete / adopt — decide after eyeballing.
- `blog/SeriePostCard` — keep / delete / adopt — decide after eyeballing.
