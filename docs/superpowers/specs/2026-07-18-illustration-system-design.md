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
- **Per-item choice** between duotone and riso, tagged in frontmatter, with a smart default so most
  entries need no tag.
- Treatment is producible **runtime OR build-time, selectable per item** — both paths must exist.
- The **artistic direction lives in one file**; renderers are thin.
- Detail-cover treatment and list thumbnails are **toggles, default off** (opt-in), because they
  change appearance/layout.

---

## 1. Architecture — one core, two renderers

The risk with "runtime or build" is drift: two code paths that stop looking alike. The direction is
defined **once** and consumed twice, so parity is structural, not maintained by hand.

```
                 ┌──────────────────────────────┐
                 │  src/illustration/direction.mjs │  ← the ONLY file with art in it
                 │  palette · duotone · riso ·     │
                 │  grain · graphFromSlug() ·      │
                 │  resolvers · DISPLAY toggles    │
                 └──────────────┬──────────────────┘
             ┌──────────────────┴──────────────────┐
     runtime │                                     │ build
   Illustration.astro / NodeGraph.astro     scripts/bake-illustration.mjs (sharp)
   inline SVG filter or seeded graph         real .avif/.webp files → OG + baked opt-out
```

`direction.mjs` is plain `.mjs` (JSDoc types), so **both** the Astro components _and_ the Node build
script import it directly — no `tsx`/extra tooling. It performs no rendering; it only defines.

## 2. `direction.mjs` — the artistic direction (single source of truth)

Everything a future edit touches — palette, contrast, dot density, graph density — is here.

- **Palette** — `ink #1e1e1e`, `paper #f5ffe1`, riso spots `coral #ff5a3c` + `blue #2b6cff`, muted
  greens (`#e0eec4`, `#d1ddbb`). Named exports, with dark-mode variants so runtime re-tints. Values
  mirror `src/styles/global.css` `@theme` tokens (keep in sync; documented dependency).
- **Duotone** — luminance grayscale matrix → two-point `feComponentTransfer` tables mapping
  dark→ink, light→paper. Exact `tableValues` arrays live here:
  R `[0.118, 0.961]`, G `[0.118, 1.0]`, B `[0.118, 0.882]`.
- **Riso** — 4-step posterize (`discrete` tableValues `[0, 0.45, 0.8, 1]`) → duotone map, plus a
  coral/blue halftone-dot spec (dot size, angle, opacity). The same numbers feed the CSS overlay and
  the sharp bake.
- **Grain** — one small tiling grain texture (`src/illustration/grain.png` or a data-URI constant),
  reused across every tile. **Not** per-tile `feTurbulence` (fine for 3 mockups, too heavy for a
  grid).
- **Node-graph generator** — `graphFromSlug(seed) → { nodes, edges }`. Hash the seed → deterministic
  node count (4–7), positions, edges, spot-color assignment. Pure function; identical output at
  runtime and in the bake.
- **Resolvers**
  - `resolveStyle(entry)` → `"duotone" | "riso"`. Default: source image present → `duotone`; absent
    → `riso` (node-graph). `style: "riso"` on a photo entry forces riso **over the photo** (posterize
    + halftone), not a graph.
  - `resolveSeed(entry)` → `entry.data.illustration?.seed ?? entry.id`.
  - `resolveMode(entry, context)` → `"runtime" | "baked"`. Default: on-page `runtime`; OG always
    `baked`.
- **`DISPLAY` toggles** (site-wide, default off):
  ```js
  export const DISPLAY = {
    treatDetailCovers: false, // apply treatment on detail-page hero covers
    listThumbnails:    false, // show thumbnails in blog list items + serie cards (changes layout)
  };
  ```

## 3. Data model — frontmatter

One optional object added to `post`, `seriePost`, `serie`, `work` schemas in
`src/content.config.ts`. **Absent = fully automatic**, so no existing content needs editing.

```ts
illustration: z
  .object({
    style: z.enum(["duotone", "riso", "auto"]).default("auto"),
    mode: z.enum(["runtime", "baked"]).default("runtime"),
    seed: z.string().optional(), // override the slug used to seed the node-graph
  })
  .optional();
```

**Source-image resolution** (drives `auto`):
- `post` / `seriePost` → `data.img` (optional; ~3/5 standalone posts and ~15/19 serie posts have one).
- `work` → `data.img_preview` on cards, `data.img` on the detail hero.
- `serie` → **no image field exists** → always node-graph. This is what finally gives serie cards a
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
  renders `<NodeGraph>`.
- `src/components/ui/NodeGraph.astro` — inline SVG from `graphFromSlug(seed)`. `aria-hidden`,
  decorative, no runtime randomness.
- `scripts/bake-illustration.mjs` — Node + **sharp** (already installed). Renders the _same_ tokens
  and graph to real `.avif`/`.webp` files: SVG→raster for node-graphs; grayscale→tint→composite-grain
  pipeline for photo duotone/riso. Feeds OG images and any `mode: "baked"` entry. No new dependency.

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
- `src/components/app/SEO.astro` — OG image resolves to the baked illustration when present (Phase 4);
  falls back to the current static `public/jeromeabel-social.png` otherwise.

**Not modified:** `src/utils/repository.ts` — resolution lives in `direction.mjs`, not the data
layer. Components pass the entry to `Illustration`.

## 5. Phases

Each phase is independently shippable and leaves `pnpm build` green.

- **Phase 1 — Engine + Work (no layout change).** `direction.mjs`, `Illustration.astro`,
  `NodeGraph.astro`, grain texture. Wire Work cards (`img_preview` → duotone). Toggles off. The Work
  grid gains the skin; nothing else moves.
- **Phase 2 — Fill the empties.** Flip `listThumbnails`: node-graph thumbnails on blog list + serie
  cards; posts with covers show duotone. The "walls of text" fix.
- **Phase 3 — Detail covers.** Flip `treatDetailCovers`; treat detail-page heroes.
- **Phase 4 — OG bake (optional).** `scripts/bake-illustration.mjs` + `SEO.astro` wiring. sharp
  rasterizes the same graph/duotone to 1200×630. Wire a build step (e.g. a `prebuild`/`gen:og`
  script) that regenerates when source or palette changes.

## 6. Guardrails & constraints

- **Performance** — grain is one shared texture, not per-tile `feTurbulence`. Duotone/riso are cheap
  `feColorMatrix` + `feComponentTransfer`. Node-graphs are tiny static SVG. Photo bases keep flowing
  through the existing Astro `<Picture>` / Netlify image optimization; the filter is a display layer
  on top.
- **Accessibility** — node-graphs are `aria-hidden` decorative; the accessible name still comes from
  the entry title / existing `alt`. Duotone/riso must preserve enough contrast for any overlaid text
  or tags.
- **Theme** — runtime filters re-tint in dark mode (paper/ink swap via the palette's dark variants).
  Baked files commit to the light theme (documented limitation; OG cards are light).
- **Determinism** — `graphFromSlug` must yield byte-identical geometry at runtime and in the bake;
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
