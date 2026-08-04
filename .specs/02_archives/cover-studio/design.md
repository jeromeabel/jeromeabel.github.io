---
created: 2026-07-28
---

# Cover Studio — standalone Vue app (design)

**Status:** designed — approved in brainstorm, pending plan
**Decision:** Approach A — new blog-dedicated repo `~/code/projects/cover-studio`, Vue 3 + Vite + shadcn-vue frontend, current Node/ImageMagick pipeline ported as backend. Layout 1 (three-pane classic). Supersedes further UI work on `images/scripts/studio/` in this repo.

## 1. Why

Feedback on `pnpm studio` (vanilla-JS studio, `images/scripts/studio/`, ~1350 browser LOC):

1. **Which effect is active?** All 7 settings groups render regardless of style; tuning a group the style doesn't read is a silent no-op.
2. **Is it applied?** Live preview covers only mesh + subject layer; no staleness indicator for exact renders; manifest freshness invisible.
3. **What is saved?** One global dirty flag, all-or-nothing save of 2 JSON files, no per-knob diff, no undo.
4. **Hard to tune.** Bare `<input type=number step=any>`: no sliders, min/max, units, defaults; labels are raw dotted paths.
5. **No presets.** `illustration.json → types` tier exists but is empty and has no UI.
6. **Mesh under-controlled.** Blob count / gradient / grain params buried as raw numbers; `mesh` reserved-key inconsistency (per-image mesh-group overrides documented unsupported, UI offers them, one exists in data).

The pipeline itself (deterministic seeds, 3-tier resolve with per-leaf source tracking, incremental batch render, 28 tests) is solid. The pain is the hand-rolled view layer. A reactive framework fixes 1–4 at the root; 5–6 are feature work on top.

Usage profile: per-post quick tuning long-term; right now a batch of new images for redesign v3.

## 2. Repo & backend

```
~/code/projects/cover-studio/
├── package.json            # pnpm, private
├── studio.config.json      # blogRoot, library dir, export naming
├── src/
│   ├── app/                # Vue 3 + TS frontend (Vite root)
│   ├── server/
│   │   ├── api.ts          # API routes as Vite configureServer middleware
│   │   └── lib/            # ported: resolve, mesh, geometry, util, styles,
│   │                       #   render, magick, store, content + NEW schema.ts
│   └── cli/
│       ├── render.ts       # batch render (replaces illustrate.mjs)
│       └── migrate.ts      # collect / export commands
├── data/
│   ├── illustration.json   # moved from blog repo — tool owns settings
│   └── crops.json
├── library/                # originals + backup (gitignored, private)
└── out/                    # renders, contact sheet, manifest (gitignored)
```

- **Single process.** API is a Vite plugin middleware; `pnpm dev` serves UI + API on one origin with hot reload. Localhost tool, never deployed. Loopback host check + Origin CSRF guard ported from `studio.mjs`.
- **Pipeline ported, not rewritten.** `lib/` modules move near-verbatim; 28 tests come along (vitest). Determinism contract (seed → RNG consumption order `op, cx, cy, rx, ry, rot`) preserved; existing tuned entries render identically (verified before/after). **Ordering rule:** the determinism check runs against the _ported-verbatim_ resolve first (mesh reserved-key fix NOT applied); only after hashes match is the mesh fix landed as a separate, tracked change — `api-endpoints-with-astro` (carries `mesh.blur: 101`, previously ignored) is the one entry expected to change render at that point, re-baselined deliberately.
- **Byte-serving machinery deleted.** Browser and server import the same pure modules through Vite; `LIB_WHITELIST`, raw-serving routes and `checks/served-lib.mjs` all die.
- **Data moves.** `illustration.json` + `crops.json` live in `cover-studio/data/`, versioned there. Blog's future step-2 (runtime `Illustration.astro`, OG endpoints) stays a blog-side project — but if it renders meshes at runtime it will need per-entry settings the blog no longer holds. Contract: `pnpm export` also emits each exported entry's _resolved_ settings (frontmatter `illustration:` block alongside the `img:` rewrite), so the blog owns everything its build needs; step-2's design decides whether to consume it. Cover-studio's `data/` is tool state, never a blog build input.
- **System deps stay:** ImageMagick, mkbitmap, potrace (README documents them). No sharp rewrite.

## 3. Frontend

Stack: Vue 3 + TypeScript + Pinia; shadcn-vue (reka-ui + Tailwind v4 — same Tailwind as the blog, owned components): Slider, Input, Select, RadioGroup, Collapsible, Tabs, Badge, Button, Dialog, Tooltip, Toast, Progress.

**Layout 1 — three-pane classic** (chosen over inspector-tabs and bottom-drawer): left entry rail, center layered preview, right controls column (accordion groups), top bar (type / style / mix / seed), bottom save bar. Closest to current studio, everything visible at once.

Components: `EntryRail`, `PreviewStage` (browser SVG mesh + `/api/layer` subject + exact-render overlay + draggable blobs), `ControlsPanel`, `KnobRow`, `MeshPanel`, `CropTab` (behavior ported as-is), `RunDrawer`, `SaveBar`.

### State model (Pinia)

Per-leaf knob state: `{ value, defaultValue, tier: global|type|image, savedValue }`, `dirty = value !== savedValue`.

- **Active:** `schema.ts` maps each style → groups it reads (e.g. `dither-mesh → dither, onMesh, mesh`). Groups the active style doesn't read collapse + grey with "not used by <style>". Style radios keep filtering by entry applicability.
- **Applied:** live preview auto-updates (debounced, abortable, as today). "Render exact" gets a staleness dot when any knob changed since the last exact render. Rail surfaces manifest freshness per entry ("disk render stale").
- **Saved:** tier chip (`inherited` / `type` / `image`) + coral dirty dot per knob; save bar shows expandable diff (`dither.pixelate: 4 → 6`) before writing both JSONs; per-knob revert (↺) and a simple undo stack (snapshot per change, Ctrl+Z).
- **Tuning:** every numeric leaf renders as slider + synced number input with min/max/step/unit, readable label, one-line description, default shown as track tick + ghost text. All from `schema.ts` — the one genuinely new pipeline module (every leaf: label, description, min, max, step, unit, default; plus style→groups map).

### Presets

The existing `type` tier _is_ the preset system; it gets UI: "save current groups as preset for type <x>", apply preset, list/compare presets. Storage unchanged — writes `illustration.json → types`, which `resolve` already merges. No new format.

### Mesh editor

Blob count slider; per-blob rows (drag on preview, radius slider, accent toggle, add/delete); tint/accent opacity sliders; grain (attenuate slider + blend select); blur slider; theme toggle (light/dark); seed input + reroll. Materialization made explicit: badge "manual blobs — seed inactive" once blobs are materialized, plus "back to seed" (discards blobs, confirm). Fix in `resolve`: per-image `mesh` group overrides become officially supported (resolves the reserved-key inconsistency; existing `api-endpoints-with-astro` override becomes legal).

## 4. Migration & write-back

1. **`pnpm migrate collect`** — scan blog frontmatter (`img:` / `img_preview:` via ported `content` scanner), copy every referenced original into `library/<slug>/`, write `library/manifest.json` (slug → source path, collection, date). Serves both roles: originals library (tool inputs) and backup of current hand-made covers.
2. **Batch render** — Run panel or `pnpm render`; covers the redesign-v3 batch need.
3. **`pnpm export`** — per entry with a chosen style: copy rendered cover to `src/content/<coll>/<slug>/cover.gen.png`, rewrite frontmatter to `img: ./cover.gen.png`. Naming strategy: fixed `cover.gen.png` — marks generated origin, never clobbers hand-made files, frontmatter stable across re-exports (re-render → overwrite file, no frontmatter churn). Old cover files left in place for now (backed up in library; cleanup is a later manual decision). `--dry-run` prints the plan. Export writes/overwrites `cover.gen.png` and the `img:` line only — never deletes.

## 5. Error handling & testing

- 28 pipeline tests ported to vitest; new tests: `schema.ts` completeness (every leaf has bounds + default), export naming + frontmatter rewrite (the only code touching the blog — best-tested part), preset save/apply round-trip.
- `illustration.json` / `crops.json` zod-validated on boot; malformed file refuses to start (as today).
- API failures → toast with actual error text; job-runner crash guards ported.
- Determinism check: render fixture entries in old and new tree with identical inputs, compare hashes, before deleting anything from the blog repo.

## 6. Out of scope

- Blog step-2 runtime rendering (`Illustration.astro`, `MeshBg.astro`, OG endpoints, frontmatter `illustration` schema) — separate future project in the blog repo.
- New visual styles or effects — port the existing nine.
- Generic multi-project tool / npm publishing — blog-dedicated by decision.
- Deleting old hand-made covers from the blog — manual, after v3 ships.

## 7. Exit criteria

- `pnpm dev` in cover-studio: full studio (fx, mesh, crop, run) with the state model above.
- `pnpm migrate collect` populated `library/` from the blog.
- Determinism verified against old pipeline; tests green.
- `pnpm export --dry-run` produces a correct plan for at least the 2 currently tuned entries.
- Blog repo: `images/scripts/` studio retired (kept until exit, then removed in a blog-side commit).
