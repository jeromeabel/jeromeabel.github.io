# Figma Variables — architecture method & Plugin API

Status: distilled 2026-08-08 from UI Collective's 2h variables tutorial
(50+ enterprise systems claimed) and developers.figma.com plugin docs
(`working-with-variables`, `figma.variables`, `Variable`).

Our library: `1 Primitives` / `2 Theme` / `3 Responsive`
(file `ihWIWmvtQPTWgUxlrVjC2c`). Verification toolchain: `scripts/figma/`.

## 1. Collection architecture

Two viable architectures; **2-tier (Primitive → Semantic) is explicitly fine
for single-brand** — the 3-tier enterprise version (Brand → Alias → Mapped)
earns its keep only for multi-brand. Our 3 collections ≈ Brand / Mapped /
Responsive with the Alias tier collapsed into Theme. Don't overhaul.

Shape check: inverted triangle — the semantic tier should hold roughly **half**
the primitive count, only what components actually consume.

### Primitives tier rules
- Purest form, **no roles**: raw hex ramps, one number scale, raw font strings.
- Color naming: **numeric 100-ramps** (`red/100…950`), never
  lightest/lighter/light — numeric ramps are insertable (need a step between
  100 and 200 → add 150; word names have no gap).
- Ramp math: derive lighter steps from the 500 via even opacity steps over
  **white**, flattened to hex; darker steps over **black**. Never mix bases.
- Ramps need not be symmetric across hues — add a 925/1000 when a contrast
  pairing fails AA.
- Similar hues serving different roles (brand red vs error rose) get distinct
  named scales; role assignment happens in the semantic tier.
- Park rare ramps (chart colors) in a `secondary scales` group.
- Fonts as string variables; weight strings must **byte-match the font's own
  style names** ("Semi Bold" vs "SemiBold" differs per font — mismatch silently
  breaks binding).

### The number scale
- `scale/100 = 4` style: **name ≠ value**, so a value change never breaks the
  token name (renaming variables breaks code sync — the whole argument).
  Naming tokens after their pixel value is the cited anti-pattern.
- 4px grid; multiples of 2 as fallback; only odd value allowed is 1 (hairline).
- Dense at bottom (every ×4 up to ~40), then skip legally: 48, 56, 64, 72, 96,
  128, 256, 512. Half-step names (1450) for inserted intermediates.
- **Order of operations: scale comes LAST.** Design components first, discover
  the spacings actually needed, then formalize — building the scale first
  forces the brand to fit the scale.

### Semantic (Theme) tier rules
- Colors applied to components; **modes = light/dark**.
- Structure by role: `text/`, `icon/`, `surface/`, `border/`.
- Per role: `default`, `hover`, `on-color`, `on-color-hover`; optional
  `subtle`/`subtle-hover`. `disabled` gets **no hover** (hover implies
  interactivity).
- **on-color is the key pattern** — text/icons on colored surfaces. Never fake
  it by flipping a component to dark mode (mixes modes in one design).
- **`icon/*` mirrors `text/*` exactly, same values** — icons paired with text
  must never diverge in color or hover strength.
- `border/*` mirrors `surface/*` **even when values are identical today**
  (they diverge later; the variable is the insurance). Plus
  `border/{role}/focus` (= the role's 500, 2px ring).
- Surfaces don't need on-color — contrast rules bind text/icons, not fills.
- t-shirt names (xs/s/m/l) OK for radius/border-width where steps are few.
- Don't promote every ramp — one-off colors may bind semantic→primitive
  directly; full plumbing for a once-a-year color is over-engineering.

## 2. Mode strategy

One concern per collection: **brands → alias modes; light/dark → semantic
modes; breakpoints → responsive modes.**

Dark-mode workflow: finish and contrast-verify light first, then bulk-invert
every value fast (950↔100, black↔white, 500↔~600), *then* refine. Tweaking
per-component with both modes open causes cascading contrast regressions.
Don't assume lightest-on-darkest passes AA — check, extend the ramp if not.

## 3. Responsive collection

- Modes = desktop/tablet/mobile. `frame-width` per mode (raw numbers,
  deliberately not aliased — 1440 has no reuse).
- Type as number variables: `font/heading/h1…h6/{text-size,
  paragraph-spacing, line-height}`, `font/copy/{body-lg, body, body-sm,
  caption}/…`.
- Sizes from a modular-scale tool, then **round every size to nearest ×4** —
  never keep the tool's decimals. Line-height = size × ratio, rounded to ×4.
  Body ≥16px and identical across breakpoints; only headings shrink (smaller
  ratio on mobile).
- **Jumper variables**: `spacing/xl-to-md` — one variable, desktop mode 96 /
  mobile 64, encoding how a specific gap collapses. Build only jumps that
  audited real designs need, never the combinatorial matrix.
- Backfill derived values into the primitive scale (source-of-truth loop).

## 4. Gotchas
- Font-weight strings must match font style names exactly.
- Renaming variables breaks code sync.
- Alias-mode multi-branding caps out when brands diverge structurally.
- Mode counts are plan-gated (Free = 1 mode/collection; `addMode` throws past
  the limit).

## 5. Plugin API surface (`figma.variables`)

### Create / write
```js
const col = figma.variables.createVariableCollection("name");
const v = figma.variables.createVariable("name", col, "COLOR"); // COLOR|FLOAT|STRING|BOOLEAN
const darkId = col.addMode("dark");            // col.modes, col.defaultModeId
v.setValueForMode(darkId, { r: 1, g: 1, b: 1 });
```

### Read (async only; sync variants deprecated)
`getLocalVariableCollectionsAsync()`, `getLocalVariablesAsync(type?)`,
`getVariableByIdAsync(id)`, `importVariableByKeyAsync(key)` (published
library variables only).

### Aliases (Theme → Primitives)
An alias is just a value:
`themeVar.setValueForMode(modeId, figma.variables.createVariableAlias(primitiveVar))`.

### Binding to nodes
- Simple fields: `node.setBoundVariable('width'|'opacity'|radius|padding…, v)`;
  unbind with `null`; inspect via `node.boundVariables`.
- Fills/strokes: copy-mutate-reassign —
  `fills[0] = figma.variables.setBoundVariableForPaint(fills[0], 'color', v)`.
- Also `setBoundVariableForEffect`, `setBoundVariableForLayoutGrid`,
  `textNode.setRangeBoundVariable`, `textStyle.setBoundVariable`.
- Variant props: `instance.setProperties({ prop: createVariableAlias(stringVar) })`.

### Per-variable metadata
`scopes` (controls UI pickers: `CORNER_RADIUS`, `GAP`, `ALL_FILLS`,
`TEXT_FILL`, `STROKE_COLOR`, `FONT_SIZE`…), `codeSyntax` +
`setVariableCodeSyntax('WEB', '--color-accent')` (Dev Mode shows real CSS
names), `hiddenFromPublishing`, `resolveForConsumer(node)` (resolves aliases
in the consumer's mode context), `setPluginData` (sync bookkeeping, e.g.
source-token hash).

### What a plugin CANNOT do
- Publish a library (manual UI action; can only read `getPublishStatusAsync`).
- Edit remote/library variables — local only.
- Exceed plan mode limits. Extended collections (`collection.extend`,
  `variableOverrides`) are Enterprise-only.
- Run headless across files — plugins need an open file (REST Variables API
  writes are Enterprise-gated).

## 6. Plugin opportunities for our drift toolchain
- **JSON → Figma upsert**: official sample
  `figma/plugin-samples/variables-import-export` does JSON⇄variables
  (create-or-update by name, aliases included). Could replace the manual
  `use_figma` binding procedure with an idempotent sync from
  `global.css`-derived JSON.
- **Unbound-raw-value auditor**: walk document, diff paints/numbers against
  `node.boundVariables` — plugin-side Pass-2 (`figma:verify-raw`), with
  `resolveForConsumer` verifying resolved values match code tokens.
- **codeSyntax stamping**: one-shot pass writing Tailwind token names into
  every variable's WEB codeSyntax.
- `.fig`-export parsing stays the *diff without opening Figma* side; a plugin
  is the *write/repair* side.
