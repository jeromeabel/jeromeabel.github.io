---
shipped: 2026-08-04
---

# Illustration system — design spec (2026-07-18)

Unifies every cover/thumbnail on the site under **one artistic direction** and doubles as the
OG-image pipeline. Backlog item from the site-refinements spec
(`2026-07-18-site-critique-recommendations.md` §6/§7 _later_); this is its own spec → plan →
implementation cycle. Brainstormed 2026-07-18 with a live visual companion (duotone + riso chosen
over hand-drawn motif on real Work photos).

## Goals (decided)

1. **Unify existing covers** — real Work photos and article covers currently look mismatched; run
   them through one treatment so blog and work read as one system.
2. **Fill the empty thumbnails** — blog list items and `serie` cards render **no image today**
   (text only); `serie` has no image field at all. Give image-less content a generated thumbnail.
3. **Art-object in itself** — the illustration layer is creative work in its own right, not just a
   mechanical filter, reflecting the author's software-arts background.

OG/social-image generation rides along (Phase 4), it is not the primary driver.

## Decisions locked in brainstorm

- Direction = **duotone** (A) and **riso/systems** (B). Hand-drawn motif (C) rejected.
- **Update 2026-07-27 (lab review):** palette = **4 colors** — ink + paper + BOTH accents (teal
  `#0d9488` + coral `#ff5a3c`), but **one accent per image**, picked deterministically from the
  slug hash (built-in diversity, zero config). Two-spot riso (coral+blue in one image) stays
  dropped. **Node-graph fallback rejected** ("horrible") — image-less entries get a **seeded
  fluid-mesh background** instead. `framed` added as a style for UI screenshots/data tables.
- **Update 2026-07-27 bis (contrast + tooling):** dither stipple was too harsh on drawings →
  softened (pre-blur + level clip + ordered dither instead of monochrome Floyd-Steinberg);
  duotone lacked contrast → level clip + sigmoidal boost added. **Every effect number lives in
  one centralized `SETTINGS` block** — reference implementation is
  `images/scripts/illustrate.mjs`: single Node script that scans content frontmatter (`img:` in
  `index.md`), exports all styles per cover, and generates seeded meshes for image-less entries.
  `direction.mjs` (§2) inherits its numbers when the system moves into `src/`.
- **Per-item choice** between duotone and riso, tagged in frontmatter, with a smart default so most
  entries need no tag.
- Treatment is producible **runtime OR build-time, selectable per item** — both paths must exist.
- The **artistic direction lives in one file**; renderers are thin.
- Detail-cover treatment and list thumbnails are **toggles, default off** (opt-in), because they
  change appearance/layout.

---

## 0. Two-step process (decided 2026-07-27)

The system ships in two explicit steps. **Step 1 is a lab** in `images/`; **step 2 is the final
version** in `src/` (§1–§8 below). Nothing in `src/` changes until step 1 exits.

### Step 1 — Lab: plug all, tune all

Goal: every style validated on every image type (photo, drawing, screenshot, diagram, no-image)
with real crops, before integration.

- **Tool** — `images/scripts/illustrate.mjs`: scans content frontmatter (`img:`), applies all
  styles per cover via ImageMagick, seeded mesh for image-less entries. **All numbers in one
  `SETTINGS` block** (palette, per-effect knobs, sizes).
- **Sizes** — `SETTINGS.sizes`: named output formats (`cover` = original untouched; `thumb`
  575×300, `small` 240×140, `square` 600×600 — placeholders, final numbers depend on the layout,
  not decided yet). Every style renders once per size; output `<slug>_<style>_<size>.png`.
- **Crop model** — a base **focal point + zoom** per image in `images/crops.json`
  (`{ "<slug>": { "focus": [x, y], "zoom": 1.2 } }`, coords 0–1), plus an optional per-size
  override (`"sizes": { "square": { "focus": [x, y], "zoom": 2 } }`) resolved field by field by
  `resolveCrop()`. The script derives the largest box at each target ratio centered on the
  resolved focus. One decision per image covers all ratios; override only where a ratio needs a
  different subject (a wide `thumb` and a `square` rarely want the same center). Missing entry =
  center, zoom 1.
- **Crop UI** — `images/scripts/crop-ui.mjs`: zero-dep Node HTTP server + single local page.
  Thumb rail of all covers, click **or drag** on the big image to place the focal point (pointer
  events + capture, rAF-throttled, previews built once and only repositioned so the drag stays
  smooth), zoom slider, live per-ratio previews (client-side math, no round-trip). A tab bar
  (`base` + one per size) picks the edit target; inheriting sizes show a dashed marker, clicking
  a preview jumps to its tab. Save prunes empty entries and writes `crops.json`.
- **Contact sheet** — `illustrate.mjs --sheet` emits one HTML grid (style × size × slug). Tuning
  loop: edit `SETTINGS` → regenerate → judge sheet → repeat.
- **Exit criteria** — crops set for all covers; each style approved per image type; sizes fixed
  by the final layout decision; final style set chosen (notably whether `dither` — lab-only for
  now, absent from §2 resolvers — earns a place in step 2).
- **pnpm scripts** — `pnpm illustrate` (generate), `pnpm illustrate:sheet` (generate + contact
  sheet), `pnpm crop` (crop UI).

### Step 1 — review round 1 (2026-07-27)

First full contact-sheet judgement. **Incomplete** — covered slugs 1–8 alphabetically
(`adding-likes` → `fable`); the rest of the ~45 entries are unjudged.

**Emerging style ↔ image-type map** (the round's main output; feeds `resolveStyle()` in §2):

| Image type            | Verdict                                   | Entries judged                     |
| --------------------- | ----------------------------------------- | ---------------------------------- |
| Hand drawing          | **dither** (winner)                       | adding-likes, api-endpoints        |
| Hand drawing (accent) | dither + accent — combo added as `dither-<accent>` | api-endpoints             |
| UI screenshot         | **framed**                                | argentbank; dirpictures unjudged   |
| Photo                 | undecided — dither / framed / duotone / duotone-accent all plausible; needs more contrast to separate | chimeres, commitcraty, craslab |
| Digital drawing       | duotone or duotone-accent                 | fable                              |

**Tuning applied to `SETTINGS`** (round-1 feedback → `illustrate.mjs`):

- `dither` — more pixellized + more contrast: new `pixelate: 50` (dither at 50 % then
  Point-upscale, so dots stay chunky), `level` 15/85 → **22/78**, new `sigmoidal: "6x50%"`.
- `duotone` — more contrast: `level` 10/90 → **14/86**, `sigmoidal` 5x50 → **7x50**.
- `duotone` — lighter background: new **`paperLift`** (0–1) blends the paper end toward white.
  **Answer to "how to find the best contrast ratio?"** — `illustrate.mjs` now prints the WCAG
  contrast ratio of the resulting ink→paper pair on every run. Tune `paperLift` against a
  target: **3.0** = AA for graphics/large text over the image, **4.5** = AA for body text,
  **7.0** = AAA; below ~3 the duotone reads flat. At `paperLift: 0.35` the pair is
  `#1e1e1e → #f9ffec` = **16.31:1** — plenty of headroom, so lift can go much higher before
  contrast becomes the limit; the ceiling here is taste, not accessibility.

**Styles added in round 1** (all requested from the round-1 notes):

- `vector` — mkbitmap/potrace trace of hand drawings → ink-on-paper curves, no pixel noise.
  potrace is already installed; no new npm dependency. Round-1 caveat: at `threshold: 0.5`
  thin pencil strokes drop out (verified on `adding-likes` — the "12" annotation vanished);
  lower the threshold if the traced version is kept.
- `photo-mesh` — contrasty grayscale photo **multiplied over the seeded fluid-gradient mesh**.
- `dither-mesh` — dithered subject over the same mesh background.
- `vector-mesh` — traced drawing over the same mesh background.
- `dither-<accent>` — dither dots with the slug's accent as the light end (the "dither +
  duotone coral" combination asked for on `api-endpoints`).

Composites share one `meshSvg()` builder with the `mesh` style, so the background stays the
same seeded geometry — this is what keeps the §6 determinism guardrail true for step 2.

**Still open after round 1:** judge slugs 9→end; settle the photo type (four candidates);
`dirpictures` verdict; whether `vector` / the three `*-mesh` composites survive into §2/§3
alongside the `dither` decision.

### Step 2 — Final version

§1–§8 unchanged, plus two handoffs from the lab:

- `SETTINGS` numbers copy into `direction.mjs` (same named-group shape → copy-paste port).
- `crops.json` values migrate to frontmatter `illustration.focus` / `illustration.zoom` +
  optional `illustration.sizes.<name>` overrides (§3 schema gains the fields) — or
  `direction.mjs` imports the json directly; decide at step 2 start.

## 1. Architecture — one core, two renderers

The risk with "runtime or build" is drift: two code paths that stop looking alike. The direction is
defined **once** and consumed twice, so parity is structural, not maintained by hand.

```
                 ┌──────────────────────────────┐
                 │  src/illustration/direction.mjs │  ← the ONLY file with art in it
                 │  palette · duotone · riso ·     │
                 │  grain · meshFromSlug() ·       │
                 │  resolvers · DISPLAY toggles    │
                 └──────────────┬──────────────────┘
             ┌──────────────────┴──────────────────┐
     runtime │                                     │ build
   Illustration.astro / MeshBg.astro        static image endpoints (sharp)
   inline SVG filter or seeded mesh          src/pages/og/…png.ts + /illustration/…webp.ts
                                             → OG images + baked opt-out (§8)
```

`direction.mjs` is plain `.mjs` (JSDoc types), so **both** the Astro components _and_ the Node build
script import it directly — no `tsx`/extra tooling. It performs no rendering; it only defines.

## 2. `direction.mjs` — the artistic direction (single source of truth)

Everything a future edit touches — palette, contrast, dot density, mesh density — is here.

- **Palette** — **4 colors**: `ink #1e1e1e`, `paper #f5ffe1`, two accents `teal #0d9488` +
  `coral #ff5a3c` — but **one accent per image**, resolved from the slug hash (see resolvers).
  Intermediate tints derive from these via opacity/blend, never new hues. Named exports, with
  dark-mode variants so runtime re-tints. Values mirror `src/styles/global.css` `@theme` tokens
  (keep in sync; documented dependency).
- **Duotone** — luminance grayscale matrix → two-point `feComponentTransfer` tables mapping
  dark→ink, light→paper. Exact `tableValues` arrays live here:
  R `[0.118, 0.961]`, G `[0.118, 1.0]`, B `[0.118, 0.882]`.
- **Riso** — 4-step posterize (`discrete` tableValues `[0, 0.45, 0.8, 1]`) → duotone map, plus a
  single-accent halftone-dot spec (dot size, angle, opacity). The same numbers feed the CSS overlay
  and the sharp bake.
- **Grain** — one small tiling grain texture (`src/illustration/grain.png` or a data-URI constant),
  reused across every tile. **Not** per-tile `feTurbulence` (fine for 3 mockups, too heavy for a
  grid).
- **Mesh generator** (replaces rejected node-graph) — `meshFromSlug(seed) → { shapes }`. Hash the
  seed → deterministic blob coordinates, radii, rotations, opacities, blur radius (port of
  `images/scripts/generate_abstract2.sh` geometry, minus bash `$RANDOM`). Pure function; identical
  output at runtime and in the bake. Plus `renderMeshSvg(mesh, { width, height, theme }) → string`:
  the ONE SVG serializer (blurred ellipses/paths over paper or ink bg + one accent blob, shared
  grain on top). `MeshBg.astro` injects it via `set:html`; the bake endpoints rasterize the same
  string with sharp — byte-identical markup by construction, not by convention.
- **Resolvers**
  - `resolveStyle(entry)` → `"duotone" | "riso" | "framed" | "mesh"`. Default: source image
    present → `duotone`; absent → `mesh`. `style: "riso"` on a photo entry forces riso **over the
    photo** (posterize + halftone). `framed` = dark-framed screenshot treatment for UI captures /
    data tables (from `images/scripts/transform_thumbnail.sh`); never auto-selected — content type
    is not detectable — set per entry in frontmatter.
  - `resolveSeed(entry)` → `entry.data.illustration?.seed ?? entry.id`.
  - `resolveAccent(entry)` → `entry.data.illustration?.accent ?? hash(seed) % accents` — teal or
    coral, deterministic per slug, overridable per entry.
  - `resolveMode(entry, context)` → `"runtime" | "baked"`. Default: on-page `runtime`; OG always
    `baked`.
- **`DISPLAY` toggles** (site-wide, default off):
  ```js
  export const DISPLAY = {
    treatDetailCovers: false, // apply treatment on detail-page hero covers
    listThumbnails: false, // show thumbnails in blog list items + serie cards (changes layout)
  };
  ```

## 3. Data model — frontmatter

One optional object added to `post`, `seriePost`, `serie`, `work` schemas in
`src/content.config.ts`. **Absent = fully automatic**, so no existing content needs editing.

```ts
illustration: z.object({
  style: z.enum(["duotone", "riso", "framed", "mesh", "auto"]).default("auto"),
  mode: z.enum(["runtime", "baked"]).default("runtime"),
  seed: z.string().optional(), // override the slug used to seed the mesh
  accent: z.enum(["teal", "coral"]).optional(), // override the slug-hash accent
  // step-2 handoff (§0): focus: [x, y] + zoom (+ per-size overrides) migrate here
  // from images/crops.json
}).optional();
```

**Source-image resolution** (drives `auto`):

- `post` / `seriePost` → `data.img` (optional; ~3/5 standalone posts and ~15/19 serie posts have one).
- `work` → `data.img_preview` on cards, `data.img` on the detail hero.
- `serie` → **no image field exists** → always mesh. This is what finally gives serie cards a
  thumbnail.

`illustration.seed`, `illustration.style`, `illustration.mode` override the resolver defaults per
entry. This satisfies the "per-item choice" decision while `auto` keeps the grid coherent by default.

## 4. Components & files

**Created**

- `src/illustration/direction.mjs` — the one art file (§2).
- `src/illustration/grain.png` — single tiling grain texture (or a data-URI constant inside
  `direction.mjs`; decide during implementation by file size).
- `src/components/ui/Illustration.astro` — runtime renderer. Given an entry (+ optional `type`
  `square`/`cover`), resolves style/mode via `direction.mjs`; if a source image exists, wraps the
  existing `<Picture>` / `CustomImage` output with the duotone/riso SVG filter + grain overlay; else
  renders `<MeshBg>`.
- `src/components/ui/MeshBg.astro` — inline SVG from `meshFromSlug(seed)`. `aria-hidden`,
  decorative, no runtime randomness.
- `src/pages/og/[...slug].png.ts` and `src/pages/illustration/[...slug].webp.ts` — static image
  endpoints (Phase 4, §8). Prerendered at `astro build` via `getStaticPaths` + `getCollection`;
  import `direction.mjs` + **sharp** (already installed) and emit real files into `dist/`. Feeds OG
  images and any `mode: "baked"` entry. No new dependency, no standalone script (§8 rationale).
- `src/illustration/og.ts` — `ogImageFor(entry)` helper returning
  `{ src: "/og/<collection>/<id>.png", width: 1200, height: 630 }` for detail pages to pass to
  `Layout`/`SEO` (matches the existing `defaultImage` literal pattern in `SEO.astro`).

**Modified**

- `src/content.config.ts` — optional `illustration` object on the four schemas (§3).
- `src/components/work/WorkCard.astro`, `src/components/work/WorkMiniCard.astro` — route
  `img_preview` through `Illustration` (duotone default), preserving the bare-tile layout from the
  recent WorkMiniCard refactor.
- `src/components/ui/CustomImage.astro` — when `DISPLAY.treatDetailCovers`, wrap its `<Picture>` with
  the treatment; otherwise unchanged (current behavior). Must keep the existing LQIP + `.reveal-img`
  fade working.
- `src/components/blog/PostListItem.astro`, `src/components/blog/SerieCard.astro` — when
  `DISPLAY.listThumbnails`, add a small square thumbnail slot rendered by `Illustration`; otherwise
  today's text-only row. (Layout change — gated behind the toggle.)
- `src/pages/work/[id].astro`, `src/pages/blog/[id].astro`, `src/pages/blog/[serie]/[post].astro`,
  `src/pages/blog/[serie]/index route` — pass `image={ogImageFor(entry)}` to `Layout` (Phase 4).
  **`SEO.astro` itself is unchanged** — it already accepts a plain `{src,width,height}` literal
  (its own `defaultImage` is one); pages without an entry keep the static
  `public/jeromeabel-social.png` fallback.

**Not modified:** `src/utils/repository.ts` — resolution lives in `direction.mjs`, not the data
layer. Components pass the entry to `Illustration`.

## 5. Phases

Each phase is independently shippable and leaves `pnpm build` green.

- **Phase 1 — Engine + Work (no layout change).** `direction.mjs`, `Illustration.astro`,
  `MeshBg.astro`, grain texture. Wire Work cards (`img_preview` → duotone). Toggles off. The Work
  grid gains the skin; nothing else moves.
- **Phase 2 — Fill the empties.** Flip `listThumbnails`: mesh thumbnails on blog list + serie
  cards; posts with covers show duotone. The "walls of text" fix.
- **Phase 3 — Detail covers.** Flip `treatDetailCovers`; treat detail-page heroes.
- **Phase 4 — OG bake (optional).** Static image endpoints + `ogImageFor()` wiring on the four
  detail routes. sharp rasterizes the same mesh/duotone to 1200×630 PNG at every `astro build` —
  no separate build step, no cache invalidation. Full detail in §8.

## 6. Guardrails & constraints

- **Performance** — grain is one shared texture, not per-tile `feTurbulence`. Duotone/riso are cheap
  `feColorMatrix` + `feComponentTransfer`. Mesh backgrounds are small static SVG (few blurred
  shapes). Photo bases keep flowing
  through the existing Astro `<Picture>` / Netlify image optimization; the filter is a display layer
  on top.
- **Accessibility** — mesh backgrounds are `aria-hidden` decorative; the accessible name still comes from
  the entry title / existing `alt`. Duotone/riso must preserve enough contrast for any overlaid text
  or tags.
- **Theme** — runtime filters re-tint in dark mode (paper/ink swap via the palette's dark variants).
  Baked files commit to the light theme (documented limitation; OG cards are light).
- **Determinism** — `meshFromSlug` must yield byte-identical geometry at runtime and in the bake;
  verify a sample slug matches across both paths.
- **No new dependencies.** sharp is already installed. **No test suite / linter** in this repo →
  per-phase verification = `pnpm build` succeeds + `pnpm format:check` clean + a described dev-server
  visual check.
- **Package manager is pnpm.** Commit per phase with Conventional-Commits messages.

## 7. Open items (resolve during writing-plans)

- Grain as external `grain.png` vs. inline data-URI — pick by resulting bundle/asset size.
- Riso-over-photo halftone in sharp — confirm the sharp compositing recipe matches the CSS overlay
  closely enough (Phase 4 only; may accept minor divergence).
- Whether `Illustration.astro` takes a whole `entry` or explicit props (`img?`, `seed`, `style?`,
  `type`) — lean explicit props for testability; decide when wiring the first consumer.
- `dither` style: promote to §2/§3 or keep lab-only — decided at step-1 exit (§0). Same question
  now applies to the round-1 additions: `vector`, `dither-<accent>`, and the `photo-mesh` /
  `dither-mesh` / `vector-mesh` composites. Note `vector` is the only one needing a non-npm
  binary (potrace) at build time — if it survives, either bake its output in the lab and commit
  the SVGs, or drop it.
- Crop data at step 2: frontmatter `illustration.focus`/`zoom` vs importing `images/crops.json`
  directly (§0 handoff).

## 8. Phase 4 — bake pipeline (spec pass 2026-07-18)

### Mechanism: static image endpoints, not a standalone script

The original `scripts/bake-illustration.mjs` idea is **rejected**. A standalone Node script would
have to (a) re-glob content dirs and re-parse frontmatter (the schemas use Astro's `image()`, so
`data.img` only exists inside Astro), (b) write into `public/` and maintain a manifest so
`SEO.astro` knows what exists, and (c) hook into the build — and pnpm does **not** run `prebuild`
lifecycle scripts by default, and this repo has no `netlify.toml` to add a build wrapper.

Astro static endpoints kill all three problems at once:

- `src/pages/og/[...slug].png.ts` — OG images, 1200×630 PNG, one per detail-page entry across all
  four collections (`work`, `post`, `seriePost`, `serie`). `getStaticPaths` enumerates via
  `getCollection` (same repository filters), the body imports `direction.mjs` + sharp and returns
  the encoded buffer.
- `src/pages/illustration/[...slug].webp.ts` — on-page baked tiles for `mode: "baked"` entries
  only. Single format (`webp` is universally supported now); square 600px and cover 1248px match
  `CustomImage`'s size ceilings.
- Source resolution happens **inside Astro**: `entry.data.img` is real `ImageMetadata`; sharp
  reads the original file via its `fsPath` property. (`fsPath` is what the satori/og-canvas
  ecosystem relies on, but it is loosely documented — **verify on Astro 5 first**; fallback is
  resolving the frontmatter path against `entry.filePath`.)
- URLs are pure convention — `/og/<collection>/<id>.png`, `/illustration/<collection>/<id>.webp` —
  computed identically by `ogImageFor()` / `Illustration.astro`. No manifest, no fs checks.
- Regeneration is a non-problem: endpoints re-run on every `astro build` (~45 entries × sharp ≈
  seconds). No hashing, no cache invalidation, no "regenerate when palette changes" machinery.

### sharp recipes (must mirror §2 numbers)

- **Duotone** — `greyscale()` → per-channel `linear(slope, offset)` where
  `out = ink + luminance × (paper − ink)`; slopes/offsets derived from the same `tableValues`
  endpoints in `direction.mjs` (export them as numbers, derive both the SVG table and the sharp
  coefficients from one constant).
- **Riso posterize** — sharp has no posterize op: extract raw pixels, quantize luminance to the 4
  `discrete` steps from `direction.mjs`, re-encode, then apply the duotone map + composite the
  halftone-dot SVG (generated from the same dot spec) and the shared grain texture.
- **Mesh** — rasterize `renderMeshSvg()` output directly (sharp/libvips handles SVG).

### Constraints & decisions

- **No text in baked images.** sharp rasterizes SVG with system fonts; Netlify build images don't
  have IBM Plex, and font-embedding in librsvg is unreliable. OG cards are pure graphic — the
  title already travels in `og:title`. (Text-on-OG would need satori = new dependency = out.)
- **Light theme only**, as already decided in §6. For on-page use this means a `mode: "baked"`
  tile sits light-locked inside a dark-mode grid — acceptable because `baked` on-page is a
  per-item perf escape hatch, not the default; the limitation moves to the frontmatter docs.
- **`mode: "baked"` before Phase 4** — the schema field ships in Phase 1 (§3) but nothing serves
  the files until Phase 4. Until then `resolveMode` clamps to `"runtime"` and logs a build
  warning if an entry requests `baked`.
- **OG dimensions** — endpoints emit 1200×630; `SEO.astro`'s `defaultImage` stays 1200×628 (it
  describes the existing static PNG). Pages with an entry never see the default, so no conflict.
- **Verification** — `pnpm build` green; spot-check `dist/og/work/<id>.png` opens and matches the
  runtime rendering of the same slug (determinism guardrail from §6); paste a deployed URL into a
  social-card debugger once live.
