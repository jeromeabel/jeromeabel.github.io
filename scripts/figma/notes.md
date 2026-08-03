# Build Primitives - Color Conversion Notes

## oklch → sRGB Hex Conversion

The oklch to hex conversion uses Björn Ottosson's reference constants and produces nearly-accurate results. For example:

- `color/slate/900`: Generated #0f172b, Tailwind v3's published value was #0f172a (1 channel off) ✓
- `color/blue/500`: Generated #2b7fff, Tailwind v3's published value was #3b82f6 (9 in blue, 3 in green, 16 in red)

These are not conversion errors — they are **expected Tailwind v3→v4 palette
differences**. Tailwind v4 genuinely redefined its color palette using
different oklch values than what v3 published as hex; the generator is
correctly reproducing the *installed v4* palette, not drifting from it. (See
`build-primitives.test.mjs`'s `oklch converts to sRGB hexes (Tailwind v4
values)` test, which asserts the v4-correct hexes directly and documents the
same v3-vs-v4 framing.)

Since the `1 Primitives` collection has 0 bindings (nothing on canvas
consumes it), the v3-vs-v4 delta is invisible on canvas regardless.

**Decision**: Accept generated values as correct; they are reproducible from
the installed Tailwind version.

## Known gap — `1 Primitives` regeneration procedure

`1 Primitives` (this generated Tailwind mirror collection) is **not** covered
by `token-map.json` / `pnpm figma:verify`'s drift detection — that gate
checks `2 Theme` (and later `Color Tokens` / `3 Responsive`) against code,
not the primitives mirror itself. There is currently no committed,
repo-tracked procedure for regenerating `primitives.json` (this script) and
pushing the diff into the live Figma file after a future Tailwind upgrade —
the push script Plan 2 used to load `primitives.json` into Figma lives only
in the gitignored `.superpowers/` workspace, which is scratch space, not
permanent. Whoever eventually upgrades Tailwind should write and commit that
procedure rather than assume one already exists.
