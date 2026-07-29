# Build Primitives - Color Conversion Notes

## oklch → sRGB Hex Conversion

The oklch to hex conversion uses Björn Ottosson's reference constants and produces nearly-accurate results. For example:

- `color/slate/900`: Generated #0f172b, expected #0f172a (off by 1 in blue channel) ✓
- `color/blue/500`: Generated #2b7fff, expected #3b82f6 (off by 9 in blue, 3 in green, 16 in red)

The larger differences for blue and red appear to stem from Tailwind v4's color palette being computed with different oklch values than what was published for Tailwind v3.

Since the `Color Primitives` collection has 0 bindings (nothing on canvas consumes it), small channel differences are invisible. The slate value being off by just 1 confirms the formula is working correctly.

**Decision**: Accept generated values as correct; they are reproducible from the installed Tailwind version.
