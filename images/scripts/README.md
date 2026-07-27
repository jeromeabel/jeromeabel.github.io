# Illustration lab — images/scripts

Step-1 lab tooling for the [illustration system](../../docs/specs/00_backlog/illustration-system/design.md):
generate every cover/thumbnail style at every size, tune the numbers, set crops — before anything
is integrated into `src/` (step 2).

**Requirements:** ImageMagick (`convert`, `identify`) on PATH. No npm dependencies.

## Scripts

| Command                 | Does                                                    |
| ----------------------- | ------------------------------------------------------- |
| `pnpm illustrate`       | Generate all styles × all sizes for all content entries |
| `pnpm illustrate:sheet` | Same + write a contact sheet (`index.html`) for review  |
| `pnpm crop`             | Crop UI at http://localhost:4380                        |

### illustrate.mjs

Scans content frontmatter (`img:` in `src/content/{post,work,serie}/**/*.md`), crops each cover
per output size (focal point + zoom from `images/crops.json`), applies every style via
ImageMagick, and generates seeded mesh backgrounds (light + dark) for entries without a cover.

Output: `images/out/review/<slug>_<style>_<size>.png`.

```sh
pnpm illustrate                              # everything
pnpm illustrate --match nuxt                 # filter entries by slug substring
pnpm illustrate --styles duotone,riso        # subset of styles
pnpm illustrate --sizes thumb,square         # subset of sizes
pnpm illustrate --limit 3                    # first N entries
pnpm illustrate --out images/out/x           # custom output dir
pnpm illustrate:sheet                        # + contact sheet
```

Styles: `duotone` (+ per-slug accent variant), `riso`, `dither`, `framed`, `mesh`.
Sizes: `cover` (original, no crop), `thumb` 575×300, `small` 240×140, `square` 600×600.

**All tunable numbers live in the `SETTINGS` block at the top of `illustrate.mjs`** — palette
(ink/paper + teal/coral accents), per-effect knobs, sizes, output paths. Edit → regenerate →
judge. Accent per image is picked deterministically from the slug hash; mesh geometry is seeded
by slug (same slug = same image, forever).

### crop-ui.mjs

Local page to set a **focal point + zoom** per cover, overridable per output size.

1. `pnpm crop` — browser opens; left rail lists every cover (green dot = crop set, `+n` = n
   size overrides).
2. Click a thumbnail, then click **or drag** on the big image to place the focal point —
   previews follow the pointer live.
3. Zoom slider (1–3×) tightens the crop.
4. Tab bar picks what you edit: `base` (used by every size) or one size (`thumb` / `small` /
   `square`). Clicking a preview jumps to that size's tab. A dashed marker means the tab is
   inheriting base; a solid one means it has its own crop. `•` on a tab = own crop.
5. `Reset all` (base tab) clears the image; `Inherit base` (size tab) drops just that override.
   `Save` (coral = unsaved) writes `images/crops.json`; closing the tab with unsaved edits
   prompts first.
6. Regenerate: `pnpm illustrate:sheet`, open `images/out/review/index.html`.

Entry shape — the root is the base, `sizes.<name>` overrides it field by field, so a size can
pin only its zoom and keep tracking the base focus. Old single-crop entries still work.

```json
{
  "api-endpoints-with-astro": {
    "focus": [0.3, 0.55],
    "zoom": 1.5,
    "sizes": {
      "square": { "focus": [0.5, 0.2], "zoom": 2 },
      "small": { "zoom": 1 }
    }
  }
}
```

The crop math (largest box at target ratio, centered on focus, ÷ zoom) and the base/override
resolution are duplicated in `illustrate.mjs` (`cropBox()`, `resolveCrop()`) and the page script
in `crop-ui.mjs` — change both together.

### illustration.json

Hand-tuned per-image effect settings, sibling to `crops.json`. Three-tier merge (`SETTINGS` →
image-type recommendation → per-slug override) lets global changes propagate to every image that
hasn't explicitly overridden a knob.

Two top-level maps: `types` holds consistency decisions (one recommendation per image type), `images`
holds one entry per slug. Six reserved keys in an image entry; every other key is a `SETTINGS`
group override. Type entries take the same shape minus `type`.

```json
{
  "types": {
    "hand-drawing": { "style": "dither" },
    "ui-screenshot": { "style": "framed" },
    "digital-drawing": { "style": "duotone" }
  },
  "images": {
    "adding-likes": { "type": "hand-drawing" },
    "chimeres-orchestra": {
      "type": "photo",
      "style": "photo-mesh",
      "mix": { "opacity": 0.92, "blend": "Multiply" },
      "accent": "coral",
      "seed": "chimeres-2",
      "mesh": {
        "blobs": [
          {
            "cx": 300,
            "cy": 420,
            "rx": 350,
            "ry": 300,
            "rot": -12,
            "op": 0.1,
            "fill": "tint"
          }
        ]
      },
      "dither": { "level": "25%,75%" },
      "duotone": { "paperLift": 0.6 }
    }
  }
}
```

| Key      | Meaning                                                                 |
| -------- | ----------------------------------------------------------------------- |
| `type`   | image type; pulls in the matching `types` recommendation                |
| `style`  | pins the chosen style; absent = render every style in `SETTINGS.styles` |
| `mix`    | subject `opacity` + `blend` mode for the `*-mesh` composites            |
| `accent` | `teal` \| `coral`; absent = slug-hash default                           |
| `seed`   | mesh RNG seed; absent = slug                                            |
| `mesh`   | materialized blob array (see studio-design.md §6)                       |
| _other_  | deep-merged over the matching `SETTINGS` group                          |

**Merge order:** `SETTINGS` → `types[entry.type]` → image entry. `adding-likes` above renders
dither with zero per-slug tuning; re-deciding the hand-drawing verdict propagates to every hand
drawing that hasn't overridden `style`.

`style` doubles as the review verdict. Absent, the entry behaves exactly as today — all nine
styles rendered. Set, the lab emits only that one, which is what step-1 exit needs recorded per
image.

`resolveSettings(slug)` returns `{ effective, source }` — the merged config plus, per dotted
path, which tier set it (`global` | `type` | `image`). That drives the UI's inherited/recommended/overridden markers and per-knob reset.

**Absent entry = fully automatic.** All entries render with an empty file, exactly as now.

**Incremental rendering:** `pnpm illustrate --force` regenerates everything; the default skips
outputs whose settings-hash (source, effective settings, style, size) is unchanged. The manifest
tracking this lives at `images/out/review/.manifest.json`, regenerable and git-ignored as part
of `images/out/`.

### Contact sheet

`pnpm illustrate:sheet` writes `images/out/review/index.html`: one table per style, columns per
size, rows per slug. The tuning loop: edit `SETTINGS` → regenerate → open sheet → repeat.

## Legacy (superseded by illustrate.mjs)

- `transform_thumbnail.sh` — original ImageMagick presets (duotone/riso/dither/framed).
- `generate_abstract.sh`, `generate_abstract2.sh`, `generate_abstract_bg.sh` — mesh-gradient
  experiments (non-deterministic bash `$RANDOM`; the seeded port lives in `illustrate.mjs`).

Kept for reference during the lab phase; delete at step-1 exit.
