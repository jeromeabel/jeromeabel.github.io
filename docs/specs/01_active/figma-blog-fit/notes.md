# figma-blog-fit — token dump & drift verdicts (Task 3)

## Pass-0 live inventory (real Figma names, file `Wf4iomVMYUXlFIBV3Z8bx4`)

- Collection `Color` (not `Color/Light`/`Color/Dark` as guessed) — modes `Light`, `Dark`. Variable
  names are `color/background`, `color/foreground`, `color/background-accent`,
  `color/foreground-accent`, `color/muted`, `color/muted-border`, `color/muted-background`,
  `color/muted-background-accent` — i.e. every variable is namespaced under a `color/` prefix
  inside the collection. The provisional token-map.json assumed bare names (`background`,
  `foreground`, ...) with no `color/` prefix. Per-mode dump expansion yields
  `<Mode>/color/<name>` (e.g. `Light/color/background`), so the full diff-index key is
  `Color/Light/color/background`, not `Color/Light/background`.
- Collection `Scale` — single mode `Value`. Contains `spacing/1`..`spacing/24` (px values
  4,8,12,16,20,24,32,40,48,56,64,96) and `radius/none|sm|md|lg|full` (0,4,8,16,9999). No variable
  named or scoped for container max-width or container padding exists.
- Text styles: `Title/Hero` (60/Bubbler One), `Title/H1` (44/Bubbler One), `Heading/H2`
  (30/IBM Plex Sans SemiBold), `Heading/H3` (22/IBM Plex Sans SemiBold), `Body/Large`
  (24/IBM Plex Sans Regular), `Body/Base` (18/IBM Plex Sans Regular), `Body/Small`
  (16/IBM Plex Sans Regular), `Label/Meta` (14/IBM Plex Sans Medium), `Chip/Mono`
  (12/Fira Code Regular), `Code/Base` (14/Fira Code Regular). Not currently consumed by
  token-map.json (no code-side font-size tokens extracted by extract-code-tokens.mjs to
  diff against) — noted for a future task, not actioned here.

## token-map.json correction

Every `map` entry's Figma path was missing the `color/` variable-name segment (e.g.
`Color/Light/background` → corrected to `Color/Light/color/background`). This was a pure
path-naming error in the Task-2 provisional map, not a content/value problem — confirmed by
running the diff with the old provisional map against the same `tokens.figma.json`: it produced
16 "Missing in Figma" + 16 "Orphaned in Figma" findings that all resolved once the path was
corrected (see verdicts below, all `map-update`). No color value differed between code and Figma
at any point.

`container-max-width` / `container-padding-inline`: left in `ignore`. No Figma variable is named
or scoped for either. `Scale/spacing/4 = 16` coincidentally equals the code's
`container-padding-inline` (1rem = 16px), but it's a generic 4px-grid spacing unit, not a
variable dedicated to container padding — mapping it would create a false-positive tie between
an incidental value match and an unrelated design concept. `container-max-width` (1280px) has no
candidate at all — the Scale collection tops out at `spacing/24 = 96`.

## Verdicts

Diff run 1 — provisional (pre-correction) map vs `tokens.figma.json`:

- 16× `Missing in Figma` (all `light/color-*` and `dark/color-*` map entries) → **map-update**:
  provisional path omitted the `color/` variable-name segment. Fixed in token-map.json.
- 16× `Orphaned in Figma` (all `Color/<Mode>/color/*` variables) → **map-update**: same root
  cause, the map simply pointed at the wrong (non-existent) path so nothing consumed the real
  variables. Resolved by the same fix.
- `Value mismatch`: none.
- `Unmapped`: none.

Diff run 2 — corrected map vs `tokens.figma.json` (final, see `pnpm figma:verify` output below):

- `Missing in Figma`: none.
- `Value mismatch`: none — every one of the 16 light/dark color tokens matches exactly between
  `src/styles/global.css` and the Figma `Color` collection.
- `Orphaned in Figma`: none.
- `Unmapped`: none.
- `container-max-width`, `container-padding-inline` (from `ignore`) → **expected-gap**: no
  matching Figma metric variable exists in the `Scale` collection; nothing to map without
  Figma-side authoring work out of scope for this task.
- `font-sans`, `font-title`, `font-mono` (from `ignore`, carried over from Task 2) → **expected-gap**:
  Figma has no `FONT_FAMILY`-typed variables; font stacks aren't modeled as Figma variables in
  this DS (they're implicit via text style `fontName.family`). No change needed.

## Result

No `real-drift` findings — no Figma-side write/repair was necessary this pass. All 16 code
light/dark color tokens already match the Figma `Color` collection's Light/Dark values exactly.
The only "drift" surfaced was in the Task-2 provisional token-map.json's guessed paths, corrected
here (`map-update`), not in the design tokens themselves.
