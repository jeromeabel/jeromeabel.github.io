---
created: 2026-07-27
title: Illustration Studio — per-image effect tuning UI + lab module split
parent: ./design.md
---

# Illustration Studio

A local web app to tune the illustration treatment of every cover image — style,
mix, gradient, position, randomness — and save the result to a settings file, the
way `crop-ui.mjs` saves `crops.json` today.

This is **step-1 lab tooling** under the two-step gate in
[design.md §0](./design.md). Nothing in `src/` changes. The app replaces the
crop UI by absorbing it: one studio, two tabs.

---

## 1 · Why

Contact-sheet review round 1 (design.md §"Step 1 — review round 1") judged 8 of
27 entries and produced one verdict per image type. It also exposed the loop's
cost: every judgement means editing the `SETTINGS` block, regenerating all 27
entries × 9 styles × 4 sizes, and reloading an HTML grid. That is a fine loop for
tuning _global_ numbers and a terrible one for deciding what a _single_ image
should look like.

The studio inverts it: pick an image, see it change as you drag.

---

## 2 · Decisions

Settled during brainstorming (2026-07-27):

- **One studio, not two apps.** Crop and effect are judged together on the same
  image, so they live behind one rail and one save button. `crop-ui.mjs` becomes
  the Crop tab.
- **Real module boundaries.** The lab is split into focused modules (§4) rather
  than two files that each mix config, helpers, rendering, scanning, CLI and UI.
- **Everything is overridable per image.** Any `SETTINGS` key can be overridden
  per image; the UI exposes every knob. Chosen over a bounded set with the
  trade-off understood and accepted: family resemblance across the 27 covers
  becomes manual rather than structural. Mitigated in §5 (inherited/overridden
  markers, per-knob reset) so global tuning still propagates anywhere untouched.
- **One recipe per image, no per-size overrides.** Unlike `crops.json`, effect
  settings do not vary by output size. If a 240×140 `small` needs different
  handling than a 1200px `cover`, that is a global size problem to fix once, not
  a per-image one to fix 27 times.
- **Layered preview** (§3) — server renders pixels, browser renders vectors.

---

## 3 · Preview architecture

The measured constraint (2026-07-27, `chimeres-orchestra` 1200×630 → 400px
preview):

| Operation                         |   Time |
| --------------------------------- | -----: |
| duotone pipeline                  |  43 ms |
| dither pipeline                   |  31 ms |
| mesh SVG rasterize (blur 100)     | 295 ms |
| mesh + grain + multiply composite | 275 ms |

Raster effects round-trip comfortably. The mesh does not — and the mesh is
exactly what the position/randomness controls manipulate. So the preview splits
along the same seam the pipeline already has:

```
  browser                                    server
  ┌─────────────────────────────┐
  │  mesh layer                 │ ← meshSvg() rendered natively by the browser
  │  (SVG, from lib/mesh.mjs)   │   from the SAME module the renderer imports
  ├─────────────────────────────┤
  │  subject layer              │ ← GET /api/layer  (~40 ms, real ImageMagick)
  │  (transparent PNG)          │
  └─────────────────────────────┘
        composited with CSS mix-blend-mode
```

Dragging a blob or rerolling a seed is pure browser work — **no server call**.
Changing a raster knob costs one ~40 ms request.

**Why this is not the usual approximation trap.** The browser imports
`lib/mesh.mjs` as a static ES module served by the studio server: it runs the
renderer's own `meshSvg()`, not a reimplementation. The only divergence is the
final blend (CSS `Multiply` vs ImageMagick `Multiply`), bounded and covered by an
explicit truth pass — a **Render exact** button calling `/api/render` for the
full server composite (~300 ms).

Rejected alternatives:

- **Full server render per change** — zero drift, but ~300 ms per mesh drag makes
  the controls that most need continuity unusable.
- **Full client approximation** — instant, but creates a second implementation of
  the artistic direction that must agree with the first. That is precisely the
  drift risk design.md §1 exists to prevent.

---

## 4 · Module layout

Current state: `illustrate.mjs` (~19 KB) holds settings, helpers, shell wrappers,
crop math, content scanning, style renderers, contact sheet and CLI;
`crop-ui.mjs` (~16 KB) holds an HTTP server plus a ~600-line embedded page — and
a hand-maintained copy of `cropBox` carrying a "keep the math in sync" comment.

Target:

```
images/scripts/
  settings.mjs        # SETTINGS only — the one file you edit to tune globally
  lib/
    util.mjs          # hash, rng, lerp, color, lighten, contrastRatio, accentFor
    magick.mjs        # magick(), potrace(), imageSize(), grainArgs()
    geometry.mjs      # cropBox, resolveCrop        ← served to the browser verbatim
    mesh.mjs          # meshSvg()                   ← served to the browser verbatim
    content.mjs       # scanContent()
    store.mjs         # load/save/merge crops.json + illustration.json
    styles.mjs        # STYLES registry
    render.mjs        # renderEntry(entry, style, size, opts) → path
  illustrate.mjs      # CLI + contact sheet (thin)
  studio.mjs          # HTTP server + routes (thin)
  studio/
    page.mjs          # shell HTML/CSS
    crop.mjs          # crop panel client JS
    fx.mjs            # effects panel client JS
```

The organizing constraint is not file size. `geometry.mjs` and `mesh.mjs` are
pure, dependency-free ES modules, which lets the server hand them to the browser
unchanged — so the UI's crop math and mesh geometry **are** the renderer's. This
deletes the duplicated `cropBox` and satisfies the determinism guardrail
(design.md §6) that step 2 needs regardless.

`settings.mjs` staying a single flat file is deliberate: design.md's "every effect
number lives in one centralized `SETTINGS` block" decision survives the split.

---

## 5 · Data model

`images/illustration.json`, sibling to `crops.json`. One entry per slug. Five
reserved keys; every other key is a `SETTINGS` group override.

```json
{
  "chimeres-orchestra": {
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
```

| Key      | Meaning                                                                 |
| -------- | ----------------------------------------------------------------------- |
| `style`  | pins the chosen style; absent = render every style in `SETTINGS.styles` |
| `mix`    | subject `opacity` + `blend` mode for the `*-mesh` composites            |
| `accent` | `teal` \| `coral`; absent = slug-hash default                           |
| `seed`   | mesh RNG seed; absent = slug                                            |
| `mesh`   | materialized blob array (see §6)                                        |
| _other_  | deep-merged over the matching `SETTINGS` group                          |

`style` doubles as the review verdict. Absent, the entry behaves exactly as today
— all nine styles rendered for the contact sheet. Set, the lab emits only that
one, which is what step-1 exit needs recorded per image.

`accent` overrides the hash for the `duotone-<accent>` / `dither-<accent>`
variants; the entry then emits that accent only, not both.

`resolveSettings(slug)` returns `{ effective, overridden }` — the merged config
plus the set of overridden dotted paths. `overridden` drives the UI's
inherited/overridden markers and per-knob reset, so an untouched knob keeps
tracking the global value.

**Absent entry = fully automatic.** All 27 entries render today with an empty
file, exactly as now.

---

## 6 · Mesh lifecycle (gradient · position · randomness)

Three controls with one rule so they cannot contradict each other:

1. **randomness** — `seed` generates the blob array through the existing `rng()`.
   No `mesh.blobs` key → blobs derive from the seed, byte-identical to today.
2. **position / gradient** — dragging a blob, or changing its radius, opacity or
   fill, **materializes** the generated array into `mesh.blobs`. From that point
   the file is the truth and the seed is inert.
3. **reroll** — assigns a new seed and discards `mesh.blobs`. Destructive when
   manual blobs exist, so it confirms first.

This preserves the zero-config default while allowing any single image to be
hand-placed.

---

## 7 · Server routes

| Route              | Purpose                                              |    Cost |
| ------------------ | ---------------------------------------------------- | ------: |
| `GET /`            | page shell                                           |       — |
| `GET /lib/*.mjs`   | `geometry.mjs`, `mesh.mjs`, `util.mjs` as ES modules |       — |
| `GET /api/data`    | slugs, crops, illustration, `SETTINGS`, sizes        |       — |
| `GET /img/<slug>`  | original image                                       |       — |
| `POST /api/layer`  | subject layer only, transparent PNG                  |  ~40 ms |
| `POST /api/render` | full exact composite (**Render exact** button)       | ~300 ms |
| `POST /api/save`   | writes `crops.json` + `illustration.json`            |       — |

The two render routes are POST, not GET: their body is the full effective
settings object, which is too large and too nested for a query string, and the
client fetches them with `AbortController` into a blob URL rather than through an
`<img src>` anyway. Sending settings in the body — rather than reading them from
disk — is what lets the preview reflect unsaved edits.

---

## 8 · UI

Two tabs over a shared thumb rail and one save button.

```
┌──────────────────────────────────────────────────┐
│ [ Crop ]  [ Effects ]              ● unsaved  💾 │
├────────┬─────────────────────────────────────────┤
│ ▪ rail │                                         │
│ ▪      │        preview (drag blobs here)        │
│ ▪      │                                         │
│ ▪      ├─────────────────────────────────────────┤
│ ▪      │ style   ◉dither ○duotone ○photo-mesh …  │
│ ▪      │ mix     ▓▓▓▓▓▓░░░░ 0.92   [Multiply ▾]  │
│ ▪      │ accent  ○teal ◉coral                    │
│ ▪      │ seed    [chimeres-2]  🎲                │
│ ▪      ├─────────────────────────────────────────┤
│ ▪      │ ▸ dither    level ▓▓▓▓▓░░ 25%,75%  ↺   │
│ ▪      │ ▸ duotone   (inherited)                 │
│ ▪      │ ▸ mesh      (inherited)                 │
│ ▪      ├─────────────────────────────────────────┤
│ ▪      │ [ Render exact ]                        │
└────────┴─────────────────────────────────────────┘
```

- The **Crop tab is today's crop UI**, unchanged in behaviour — including the
  per-size tab bar and drag-to-place focal point.
- Overridden knobs show a reset arrow (`↺`); inherited groups collapse and are
  labelled, so the difference between "set to 0.5" and "happens to be 0.5" stays
  visible.
- Mesh blobs are dragged directly on the preview, same pointer-capture and
  rAF-throttling pattern as the crop focal point.
- The rail marks which slugs have effect settings, mirroring the existing crop
  markers.

---

## 9 · Error handling

- **ImageMagick non-zero exit** → 500 carrying stderr; the UI prints it in the
  panel rather than leaving a blank frame. Silent failure is the worst outcome
  for a tuning tool — you would tune against a stale preview.
- **In-flight `/api/layer` requests** are aborted via `AbortController` on the
  next change, so out-of-order responses cannot flicker the preview backwards.
- **Malformed `illustration.json`** → the server refuses to boot and prints the
  parse error. It never silently resets a file of hand-tuned work.
- **Unsaved edits** → `beforeunload` guard, closing the known gap where a reload
  discards everything in the current crop UI.
- **Unknown slug or style** → 404 / 400 with the offending value named.

---

## 10 · Verification

No test suite in this repo, so the checks are executable rather than
aspirational:

1. **The refactor is provably behaviour-preserving.** `md5sum` every file in
   `images/out/review`, perform the module split, re-run `pnpm illustrate`, diff
   the sums. They must be identical. The split ships only if this passes.
2. **Determinism.** A scratch script asserting the browser-side `meshSvg()`
   output string equals the server-side output for a sample slug — the design.md
   §6 guardrail, which step 2 needs anyway.
3. **Round trip.** Save → reload → byte-identical `illustration.json`.
4. `pnpm build` green; `pnpm format:check` clean on touched files.

---

## 11 · Scope boundary

In scope: the studio app, the module split, `illustration.json`, and
`illustrate.mjs` consuming per-image settings when rendering.

Out of scope: anything under `src/`. Per design.md §0, step 2 begins only at
step-1 exit. When it does, `illustration.json` migrates to frontmatter
`illustration.*` alongside the `crops.json` migration already planned there —
one handoff, not two.

---

## 12 · Open item

One, for writing-plans: `pnpm crop` once the app absorbs both tabs — keep it as
an alias of `pnpm studio`, or drop it. Muscle memory says alias; it costs one
line.
