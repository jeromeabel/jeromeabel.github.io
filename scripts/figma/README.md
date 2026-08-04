# Figma design-token pipeline — scripts/figma

Keeps the code's design tokens (Tailwind `@theme` in `src/styles/global.css`) and geometry
(computed styles of live components) in sync with the `v3` Figma design system. Spec:
`.specs/02_archives/figma-variables/design.md`.

Figma has no CLI/API for pulling variables or bindings — but a **local `.fig` export** carries the
whole document, and `fig-decode.mjs` reads it. Token dumps (Pass 1) are therefore scripted:
`pnpm figma:dump <file.fig>`. Bindings and raw values still pair a manual `use_figma` procedure
with a deterministic diff script.

**Shape (det → LLM → det sandwich):** a deterministic extractor reads code truth, a manual
procedure dumps Figma truth, a deterministic diff script compares them and prints a markdown
report. Every diff script is **WARN-ONLY** (always exits 0) — the human/LLM judges the delta, the
script never fails CI on its own.

## Commands

| Command                 | Does                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `pnpm figma:primitives` | Regenerate `primitives.json` (`1 Primitives`) from the installed Tailwind           |
| `pnpm figma:dump <f>`   | Extract `tokens.figma.json` from a local `.fig` export (Pass 1 input)               |
| `pnpm figma:verify`     | Extract code tokens + diff against a Figma token dump (Pass 1)                      |
| `pnpm figma:verify-raw` | Diff a Figma raw-values dump against the `named-debt.json` allowlist (Pass 2)       |
| `pnpm geometry:web`     | Extract live-route computed geometry via Playwright (layout-exact prover, web side) |
| `pnpm test`             | Run all `scripts/figma/**/*.test.mjs` unit tests                                    |

### pnpm figma:primitives — build-primitives.mjs

Generates the Figma `1 Primitives` variable set from the **installed** Tailwind version —
reproducible: re-run after a Tailwind upgrade and diff the output. Reads `theme.css`, converts
rem → px (×16) and oklch → hex, merges in `brand-primitives.json` (hand-authored brand colors not
derivable from Tailwind's default palette). A CSS value matching none of the parsed shapes
(oklch/hex/rem/px/number/percent/em) doesn't fail the build — it falls back to a raw-string type.

```sh
node scripts/figma/build-primitives.mjs [outPath]   # default ./primitives.json
```

Exit: `0` ok · `2` `theme.css` not found. Output `primitives.json` is committed (it's the
source fed into Figma via `use_figma`, not a generated-and-gitignored artifact).

### pnpm figma:dump — fig-decode.mjs + extract-fig-tokens.mjs

Reads Figma's side of Pass 1 from a local export instead of a live session. In Figma: **File >
Export** (or _Save local copy_) → a `.fig`; then:

```sh
pnpm figma:dump ~/Downloads/Blog\ Design\ System.fig    # → tokens.figma.json
pnpm figma:verify
```

`fig-decode.mjs` does the format work: a `.fig` is a zip whose `canvas.fig` member is Figma's
"fig-kiwi" binary — magic + version, then a deflate-compressed kiwi _schema_ chunk and a
zstd-compressed _data_ chunk (older exports use deflate for both; zstd needs **Node >= 22.15**).
The schema is self-describing, so the decoder hardcodes no Figma field name and survives Figma
adding fields. It exports `readFig()` → the flat node graph (variables, styles, components,
frames), so the other Figma-side dumps can be scripted on top of it later.

`extract-fig-tokens.mjs` shapes that graph into the same `{ collections, textStyles }` artifact
`dump-tokens.md` produces by hand, with the same rules: multi-mode collections prefix each
variable per mode (`Light/color/background`), alias chains resolve to a concrete value (up to 5
hops), colors format as `#rrggbb` with alpha dropped. Two things the graph has and a live
`getLocal*` call doesn't — **soft-deleted nodes** and **variables subscribed from other
libraries** — are filtered out; without that, deleted and third-party tokens show up as the
file's own.

```sh
node scripts/figma/extract-fig-tokens.mjs <file.fig> [out=tokens.figma.json]
```

Exit: `0` ok · `2` export not readable · `3` undecodable `.fig`. A partial decode is an error, not
a shorter dump — a truncated graph is indistinguishable from "those nodes don't exist".

**The export is a snapshot.** It reflects the file at export time, not live Figma — re-export
before each verify run, and check the printed collection list matches what you expect before
trusting a diff.

### pnpm figma:verify — extract-code-tokens.mjs + diff-tokens.mjs

Two-step token check, Pass 1 (semantic tokens: `2 Theme` + `3 Responsive`):

1. `extract-code-tokens.mjs` parses `src/styles/global.css` (`@theme`, `@variant dark`,
   `@utility container`) into `tokens.code.json`. Code is truth. Exit `0` ok · `1` root
   font-size guard failed (16px assumption broken — every rem→px conversion would be wrong,
   do not bypass) · `2` source block missing · `3` unparseable value.
2. `diff-tokens.mjs` compares `tokens.code.json` against a Figma dump (`tokens.figma.json`,
   from `pnpm figma:dump`) through `token-map.json`'s path mapping, tolerance FLOAT ±0.5 (rem×16
   rounding), COLOR exact hex. Prints a markdown report to stdout; always exits 0.

```sh
node scripts/figma/extract-code-tokens.mjs tokens.code.json
node scripts/figma/diff-tokens.mjs tokens.code.json tokens.figma.json scripts/figma/token-map.json
```

### pnpm figma:verify-raw — diff-raw-values.mjs

Pass 2 (the "Tokenization rule" check): compares a raw-geometry dump from Figma
(`raw-values.figma.json`, see `dump-raw-values.md`) against `named-debt.json`, an allowlist of
accepted exceptions keyed by node id + kind (`fill`/`stroke`/`text-style`) — each entry has a
`reason` explaining why that specific hardcoded value is intentionally left unbound. Anything new
that isn't in the allowlist prints under "New raw values"; allowlist entries with no matching
node print under "Stale named-debt entries" (binding was removed or the node id drifted).

```sh
node scripts/figma/diff-raw-values.mjs raw-values.figma.json scripts/figma/named-debt.json
```

### pnpm geometry:web + diff-geometry.mjs — the "layout exact" prover

`extract-web-geometry.mjs` drives Playwright over astrobook preview routes (component list in
`../pixel-manifest.mjs`) at `desktop`/other viewports, reading a fixed `getComputedStyle` subset
per component root into `geometry.web.json`. `diff-geometry.mjs` then compares that against a
Figma-side geometry dump (`geometry.figma.json`) — px tolerance ±0.5, colors normalized before
compare — keyed `component/viewport/theme`, using each component's desktop/light root as the
comparison basis against its Figma master (templates are authored at desktop-1280). WARN-ONLY;
output is a per-master repair worklist, not a pass/fail gate.

```sh
node scripts/figma/extract-web-geometry.mjs
node scripts/figma/diff-geometry.mjs geometry.web.json geometry.figma.json
```

`spot-check-shots.mjs` is a manual companion, not part of the gate: captures live-route
screenshots at hand-picked viewports/themes (edit the `TARGETS` array) for eyeballing
side-by-side against Figma frames.

```sh
node scripts/figma/spot-check-shots.mjs [outDir]
```

## Data files

| File                    | Committed? | Purpose                                                                                             |
| ----------------------- | :--------: | --------------------------------------------------------------------------------------------------- |
| `primitives.json`       |    yes     | `1 Primitives` source, regenerated by `figma:primitives`, pushed to Figma via `use_figma`           |
| `brand-primitives.json` |    yes     | Hand-authored brand colors merged into `primitives.json` (not derivable from Tailwind)              |
| `token-map.json`        |    yes     | Path mapping: code token path → Figma variable path, used by `diff-tokens.mjs`                      |
| `named-debt.json`       |    yes     | Allowlist of accepted raw-value exceptions (node id + kind + reason), used by `diff-raw-values.mjs` |
| `tokens.code.json`      |     no     | Generated by `extract-code-tokens.mjs`; code-side token dump                                        |
| `tokens.figma.json`     |     no     | Generated by `figma:dump` from a `.fig` export; Figma-side token dump                               |
| `geometry.web.json`     |     no     | Generated by `extract-web-geometry.mjs`; web-side computed geometry                                 |
| `geometry.figma.json`   |     no     | Manual dump of Figma-side geometry, see `dump-bindings.md`                                          |
| `raw-values.figma.json` |     no     | Manual dump of Figma-side raw (unbound) values, see `dump-raw-values.md`                            |

The four `no` rows are gitignored — regenerate/re-dump before running a verify command locally;
CI does not run these (no Figma credentials there).

## Manual dump procedures

Bindings and raw values are read through the Plugin API — reachable only via the `use_figma` MCP
tool, whose responses cap around ~20KB — so pulling them is a documented procedure, not a script:

- `dump-tokens.md` — **superseded by `pnpm figma:dump`** for `tokens.figma.json`. Kept as the
  fallback for when a `.fig` export isn't available (and as the definition of the dump's shape,
  which `extract-fig-tokens.mjs` reproduces). Its second half, the Task 9 geometry read, has no
  scripted equivalent and is still current.
- `dump-bindings.md` — pulls the full variable-binding inventory (`geometry.figma.json` source
  data + drift baseline); includes an "Expected totals" table that is a **pre-migration
  historical snapshot**, not current state — read the note above that table before trusting the
  numbers.
- `dump-raw-values.md` — pulls `raw-values.figma.json` (Pass 2 input).

`notes.md` records transferable lessons from the migration (e.g. the current expected Orphaned
baseline for `pnpm figma:verify` is 11: 3 pre-existing font rows + 8 from `3 Responsive`).

## Tests

`pnpm test` runs every `*.test.mjs` next to its script (`build-primitives`, `extract-code-tokens`,
`extract-fig-tokens`, `diff-tokens`, `diff-geometry`, `diff-raw-values`) via Node's built-in test
runner — no separate test framework. `extract-fig-tokens.test.mjs` exercises the shaping function
against synthetic node graphs, so it needs no committed `.fig` fixture.
