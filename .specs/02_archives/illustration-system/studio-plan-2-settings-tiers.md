# Studio Plan 2/3 — Three-Tier Settings + Incremental Render Manifest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `images/illustration.json` with `SETTINGS → types → images` merge (studio-design.md §5–§6), consumed by the renderer, plus a settings-hash manifest so unchanged outputs are skipped (§7 `render-dirty` semantics) — all CLI-usable before any studio UI exists.

**Architecture:** A pure `lib/resolve.mjs` (browser-servable later, like `geometry`/`mesh`) computes `{effective, source}` per slug; `lib/store.mjs` gains strict load/save of `illustration.json`; `lib/styles.mjs` styles become `{outputs, apply}` records reading settings from `ctx.eff` instead of the global `SETTINGS`; `lib/render.mjs` resolves per-slug settings, keys a manifest hash over (source mtime, effective settings, style, size, crop), and skips clean outputs unless `--force`.

**Tech Stack:** Node ≥ 20 ES modules, `node --test`, ImageMagick. Depends on plan 1 (`studio-plan-1-module-split.md`) being fully landed.

## Global Constraints

- Spec: studio-design.md §5 (data model), §6 (mesh lifecycle), §7 (manifest/`render-dirty`), §9 (malformed JSON refuses to run), §10.3–10.5 (checks).
- **Nothing under `src/` changes.**
- Reserved image-entry keys, exactly: `type`, `style`, `mix`, `accent`, `seed`, `mesh`. Every other key deep-merges over the matching `SETTINGS` group. Type entries: same shape minus `type`.
- Merge order: `SETTINGS` → `types[entry.type]` → image entry. Absent entry ⇒ behaviour identical to plan-1 output (**pixel-identical**, checked with `checks/signatures.sh`).
- `resolveSettings` returns `{ effective, source }` with `source` mapping dotted paths to `"global" | "type" | "image"` (drives plan-3 UI markers).
- Malformed `images/illustration.json` ⇒ throw with filename + parse error; never silently reset (§9).
- One recipe per image — no per-size effect overrides (§2).
- `pnpm format:write` on touched files before each commit; `node --test images/scripts/lib/` green at every commit.

---

### Task 1: `lib/resolve.mjs` — pure three-tier resolution

One deliberate addition to the studio-design.md §4 file list: §4 puts "merge" in `store.mjs`, but `store.mjs` uses `node:fs` and can never be served to the browser, while the studio UI needs the _same_ merge logic live (§5's inherited/recommended/overridden markers). So the pure part lives in its own dependency-free module, served like `geometry.mjs`/`mesh.mjs`; `store.mjs` keeps file I/O only.

**Files:**

- Create: `images/scripts/lib/resolve.mjs`
- Create: `images/scripts/lib/resolve.test.mjs`

**Interfaces:**

- Produces:
  - `RESERVED` — `["type", "style", "mix", "accent", "seed", "mesh"]`.
  - `resolveSettings(slug, illustration, settings) → { effective, source }` where `illustration = { types, images }`, `settings` = the `SETTINGS` object.
  - `effective = { type, style, mix, accent, seed, mesh, settings }`: `settings` is a deep-merged clone of the `SETTINGS` groups; `style|mix|accent|mesh` are `null` when unset at every tier; `seed` defaults to `slug` (§5 table); `type` is `null` or the image's type string.
  - `source` covers every dotted leaf path of `effective.settings` plus the five reserved effect keys (`style`, `mix`, `accent`, `seed`, `mesh`).
- Consumed by: Task 3 (`render.mjs`), plan 3 (`fx.mjs` imports it via `/lib/resolve.mjs`).

- [ ] **Step 1: Write the failing test**

`images/scripts/lib/resolve.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSettings, RESERVED } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

const ill = {
  types: {
    "hand-drawing": { style: "dither", dither: { pixelate: 60 } },
  },
  images: {
    "adding-likes": { type: "hand-drawing" },
    chimeres: {
      type: "hand-drawing",
      style: "photo-mesh",
      accent: "coral",
      seed: "chimeres-2",
      mix: { opacity: 0.92, blend: "Multiply" },
      dither: { pixelate: 70 },
    },
  },
};

test("absent entry: all-global, defaults intact", () => {
  const { effective, source } = resolveSettings("unknown-slug", ill, SETTINGS);
  assert.equal(effective.style, null);
  assert.equal(effective.accent, null);
  assert.equal(effective.mesh, null);
  assert.equal(effective.mix, null);
  assert.equal(effective.seed, "unknown-slug");
  assert.deepEqual(effective.settings, SETTINGS);
  assert.equal(source["dither.pixelate"], "global");
  assert.equal(source.style, "global");
});

test("type tier: style verdict and group override propagate", () => {
  const { effective, source } = resolveSettings("adding-likes", ill, SETTINGS);
  assert.equal(effective.style, "dither");
  assert.equal(effective.settings.dither.pixelate, 60);
  assert.equal(effective.settings.dither.preBlur, SETTINGS.dither.preBlur);
  assert.equal(source.style, "type");
  assert.equal(source["dither.pixelate"], "type");
  assert.equal(source["dither.preBlur"], "global");
});

test("image tier wins over type tier, field by field", () => {
  const { effective, source } = resolveSettings("chimeres", ill, SETTINGS);
  assert.equal(effective.style, "photo-mesh");
  assert.equal(effective.accent, "coral");
  assert.equal(effective.seed, "chimeres-2");
  assert.deepEqual(effective.mix, { opacity: 0.92, blend: "Multiply" });
  assert.equal(effective.settings.dither.pixelate, 70);
  assert.equal(source.style, "image");
  assert.equal(source["dither.pixelate"], "image");
});

test("input objects are never mutated", () => {
  const before = JSON.stringify(SETTINGS);
  resolveSettings("chimeres", ill, SETTINGS);
  assert.equal(JSON.stringify(SETTINGS), before);
});

test("reserved key list is the §5 contract", () => {
  assert.deepEqual(RESERVED, [
    "type",
    "style",
    "mix",
    "accent",
    "seed",
    "mesh",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `Cannot find module .../lib/resolve.mjs`

- [ ] **Step 3: Implement `lib/resolve.mjs`**

```js
// Three-tier settings resolution: SETTINGS → types[entry.type] → image entry
// (studio-design.md §5). Pure, zero imports — served to the browser verbatim
// by the studio so the UI's inherited/overridden markers use THIS logic.

export const RESERVED = ["type", "style", "mix", "accent", "seed", "mesh"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// Tag every leaf path of `obj` with `tier` in `source`.
function tagLeaves(obj, tier, source, prefix) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isObj(v)) tagLeaves(v, tier, source, path);
    else source[path] = tier;
  }
}

// Deep-merge `over` into `target`, recording each written leaf as `tier`.
function mergeInto(target, over, tier, source, prefix) {
  for (const [k, v] of Object.entries(over)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isObj(v) && isObj(target[k])) {
      mergeInto(target[k], v, tier, source, path);
    } else {
      target[k] = isObj(v) || Array.isArray(v) ? structuredClone(v) : v;
      if (isObj(v)) tagLeaves(v, tier, source, path);
      else source[path] = tier;
    }
  }
}

export function resolveSettings(slug, illustration, settings) {
  const img = illustration.images?.[slug] ?? {};
  const type = img.type ?? null;
  const typeRec = (type && illustration.types?.[type]) || {};

  const source = {};
  const groups = structuredClone(settings);
  tagLeaves(groups, "global", source, "");

  const overlayGroups = (entry, tier) => {
    for (const [k, v] of Object.entries(entry)) {
      if (RESERVED.includes(k)) continue;
      if (isObj(v) && isObj(groups[k])) {
        mergeInto(groups[k], v, tier, source, k);
      } else {
        groups[k] = structuredClone(v);
        source[k] = tier;
      }
    }
  };
  overlayGroups(typeRec, "type");
  overlayGroups(img, "image");

  const effective = { type, settings: groups };
  for (const k of ["style", "mix", "accent", "seed", "mesh"]) {
    const fromImage = img[k] !== undefined;
    const fromType = typeRec[k] !== undefined;
    effective[k] = structuredClone(
      fromImage ? img[k] : fromType ? typeRec[k] : null,
    );
    source[k] = fromImage ? "image" : fromType ? "type" : "global";
  }
  effective.seed = effective.seed ?? slug;
  return { effective, source };
}
```

Note: `structuredClone` exists in Node ≥ 17 and all evergreen browsers — safe for a browser-served module.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test images/scripts/lib/`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
pnpm format:write images/scripts/lib
git add images/scripts/lib/resolve.mjs images/scripts/lib/resolve.test.mjs
git commit -m "feat(illustration): pure three-tier settings resolver"
```

---

### Task 2: `lib/store.mjs` — strict `illustration.json` load/save

**Files:**

- Modify: `images/scripts/lib/store.mjs`
- Create: `images/scripts/lib/store.test.mjs`

**Interfaces:**

- Produces: `ILLUSTRATION_FILE = "images/illustration.json"`; `loadIllustration() → { types, images }` (missing file ⇒ `{ types: {}, images: {} }`; malformed ⇒ throws `Error` naming the file — §9); `saveIllustration(data)` writes 2-space JSON + trailing newline (same convention as `crops.json`).

- [ ] **Step 1: Write the failing test**

`images/scripts/lib/store.test.mjs` (uses a temp ROOT via env is overkill — test the pure parts through a read of the real function with a fixture file in a temp dir is not possible since ROOT is fixed; instead test behaviour through the real repo file path with save/restore):

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./content.mjs";
import {
  loadIllustration,
  saveIllustration,
  ILLUSTRATION_FILE,
} from "./store.mjs";

const file = join(ROOT, ILLUSTRATION_FILE);
const backup = existsSync(file) ? readFileSync(file, "utf8") : null;
const restore = () => {
  if (backup === null) rmSync(file, { force: true });
  else writeFileSync(file, backup);
};

test("missing file → empty maps", () => {
  rmSync(file, { force: true });
  assert.deepEqual(loadIllustration(), { types: {}, images: {} });
  restore();
});

test("round trip is byte-identical (§10.3)", () => {
  const data = {
    types: { "hand-drawing": { style: "dither" } },
    images: { "adding-likes": { type: "hand-drawing" } },
  };
  saveIllustration(data);
  const bytes1 = readFileSync(file, "utf8");
  saveIllustration(loadIllustration());
  assert.equal(readFileSync(file, "utf8"), bytes1);
  assert.ok(bytes1.endsWith("\n"));
  restore();
});

test("malformed file → throws naming the file, never resets (§9)", () => {
  writeFileSync(file, "{ not json");
  assert.throws(() => loadIllustration(), /illustration\.json/);
  assert.equal(readFileSync(file, "utf8"), "{ not json"); // untouched
  restore();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `loadIllustration` not exported.

- [ ] **Step 3: Extend `lib/store.mjs`**

Append:

```js
export const ILLUSTRATION_FILE = "images/illustration.json";

// Malformed file throws — the CLI exits and the studio refuses to boot
// rather than silently resetting hand-tuned work (studio-design.md §9).
export function loadIllustration() {
  const file = join(ROOT, ILLUSTRATION_FILE);
  if (!existsSync(file)) return { types: {}, images: {} };
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`${ILLUSTRATION_FILE}: ${err.message}`);
  }
  return { types: data.types ?? {}, images: data.images ?? {} };
}

export function saveIllustration(data) {
  writeFileSync(
    join(ROOT, ILLUSTRATION_FILE),
    JSON.stringify(data, null, 2) + "\n",
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test images/scripts/lib/`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
pnpm format:write images/scripts/lib
git add images/scripts/lib/store.mjs images/scripts/lib/store.test.mjs
git commit -m "feat(illustration): strict illustration.json load/save"
```

---

### Task 3: Styles consume effective settings; `outputs()` declarations

`ctx` gains `eff` (the `effective` object from `resolveSettings`). Each style reads its numbers from `ctx.eff.settings.<group>` instead of the global `SETTINGS`, honours `accent` / `seed` / `mix` / `mesh` overrides, and declares its output filenames so the manifest (Task 4) can check existence without rendering.

**Files:**

- Modify: `images/scripts/lib/styles.mjs`
- Create: `images/scripts/lib/styles.test.mjs`
- Modify: `images/scripts/lib/render.mjs` (pass `eff` through — small)

**Interfaces:**

- Consumes: `resolveSettings` effective shape (Task 1).
- Produces: `STYLES` registry becomes `{ [name]: { outputs(slug, size, eff) → string[], apply(src, out, ctx) } }` with `ctx = { slug, size, w, h, eff }`. `ditherArgs(src, w, h, ditherCfg)` gains the cfg parameter. Exports `subjectSpec(styleName, src, ctx) → { args, cleanup() } | null` — the pre-composite subject pipeline for `photo-mesh` / `dither-mesh` / `vector-mesh` (plan 3's `/api/layer` uses it; `apply` for those styles is refactored on top of it so there is exactly one copy).

- [ ] **Step 1: Write the failing test**

`images/scripts/lib/styles.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "./styles.mjs";
import { resolveSettings } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

const eff = (ill = { types: {}, images: {} }, slug = "s") =>
  resolveSettings(slug, ill, SETTINGS).effective;

test("every style is an {outputs, apply} record", () => {
  for (const [name, st] of Object.entries(STYLES)) {
    assert.equal(typeof st.outputs, "function", name);
    assert.equal(typeof st.apply, "function", name);
  }
});

test("duotone outputs: paper + hash accent by default, pinned accent when set", () => {
  const d = STYLES.duotone;
  const base = d.outputs("s", "thumb", eff());
  assert.equal(base.length, 2);
  assert.equal(base[0], "s_duotone_thumb.png");
  assert.match(base[1], /^s_duotone-(teal|coral)_thumb\.png$/);
  const pinned = d.outputs(
    "s",
    "thumb",
    eff({ types: {}, images: { s: { accent: "coral" } } }),
  );
  assert.equal(pinned[1], "s_duotone-coral_thumb.png");
});

test("mesh outputs follow effective themes", () => {
  const m = STYLES.mesh.outputs("s", "cover", eff());
  assert.deepEqual(m, ["s_mesh-light_cover.png", "s_mesh-dark_cover.png"]);
});

test("single-file styles declare their one output", () => {
  assert.deepEqual(STYLES.riso.outputs("s", "small", eff()), [
    "s_riso_small.png",
  ]);
  assert.deepEqual(STYLES.framed.outputs("s", "square", eff()), [
    "s_framed_square.png",
  ]);
  assert.deepEqual(STYLES.vector.outputs("s", "thumb", eff()), [
    "s_vector_thumb.png",
  ]);
  assert.deepEqual(STYLES["photo-mesh"].outputs("s", "thumb", eff()), [
    "s_photo-mesh_thumb.png",
  ]);
  assert.deepEqual(STYLES["dither-mesh"].outputs("s", "thumb", eff()), [
    "s_dither-mesh_thumb.png",
  ]);
  assert.deepEqual(STYLES["vector-mesh"].outputs("s", "thumb", eff()), [
    "s_vector-mesh_thumb.png",
  ]);
  const di = STYLES.dither.outputs("s", "thumb", eff());
  assert.equal(di[0], "s_dither_thumb.png");
  assert.match(di[1], /^s_dither-(teal|coral)_thumb\.png$/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `STYLES.duotone.outputs` undefined (styles are still bare functions).

- [ ] **Step 3: Restructure `lib/styles.mjs`**

Top of file — replace the module-level palette aliases with per-call helpers reading the **effective** palette (palette itself is overridable, §2 "everything is overridable"):

```js
import { writeFileSync, rmSync } from "node:fs";
import {
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
} from "./util.mjs";
import { magick, potrace, grainArgs } from "./magick.mjs";
import { generateBlobs, meshSvg } from "./mesh.mjs";

// Per-render helpers over the EFFECTIVE settings (three-tier merged).
const pal = (eff) => eff.settings.palette;
const C = (eff, k) => paletteColor(pal(eff), k);
const accentOf = (eff, slug) => eff.accent ?? paletteAccent(pal(eff), slug);

function meshColors(eff, slug, theme) {
  return {
    bg: theme === "light" ? C(eff, "paper") : C(eff, "ink"),
    tint: theme === "light" ? C(eff, "ink") : C(eff, "paper"),
    accent: C(eff, accentOf(eff, slug)),
  };
}

export function ditherArgs(src, w, h, s) {
  const op =
    s.method === "FloydSteinberg"
      ? ["-dither", "FloydSteinberg", "-monochrome"]
      : ["-ordered-dither", s.method];
  return [
    src,
    "-colorspace",
    "Gray",
    "-blur",
    s.preBlur,
    "-level",
    s.level,
    "-sigmoidal-contrast",
    s.sigmoidal,
    "-resize",
    `${s.pixelate}%`,
    ...op,
    "-filter",
    "Point",
    "-resize",
    `${w}x${h}!`,
  ];
}
```

Mesh helpers honour `seed` and `mesh.blobs` materialization (§6) and `mix` (§5):

```js
function blobsFor(eff, slug, theme) {
  // Materialized blobs are the truth; otherwise derive from seed (§6).
  return (
    eff.mesh?.blobs ?? generateBlobs(`${eff.seed}:${theme}`, eff.settings.mesh)
  );
}

function meshBackdrop(out, { slug, w, h, eff }) {
  const s = eff.settings.mesh;
  const theme = eff.settings.onMesh.theme;
  const svg = `${out}/.bg_${slug}.svg`;
  const png = `${out}/.bg_${slug}.png`;
  writeFileSync(
    svg,
    meshSvg(blobsFor(eff, slug, theme), meshColors(eff, slug, theme), s, w, h),
  );
  magick([svg, ...grainArgs(w, h, s.grain, `${slug}:bg:${w}x${h}`), png]);
  rmSync(svg, { force: true });
  return png;
}

function compositeOnMesh(subjectArgs, out, ctx, name) {
  const { slug, size, w, h, eff } = ctx;
  const opacity = eff.mix?.opacity ?? eff.settings.onMesh.subjectOpacity;
  const blend = eff.mix?.blend ?? "Multiply";
  const bg = meshBackdrop(out, ctx);
  const subject = `${out}/.subj_${slug}.png`;
  magick([
    ...subjectArgs,
    "-alpha",
    "set",
    "-channel",
    "A",
    "-evaluate",
    "set",
    `${opacity * 100}%`,
    "+channel",
    subject,
  ]);
  magick([
    bg,
    subject,
    "-compose",
    blend,
    "-composite",
    `${out}/${slug}_${name}_${size}.png`,
  ]);
  rmSync(bg, { force: true });
  rmSync(subject, { force: true });
}
```

Subject pipelines, single copy (plan 3's `/api/layer` contract):

```js
// The pre-composite subject pipeline of a *-mesh style: magick args producing
// the subject ALONE (no mesh, no opacity — the studio layers those live).
// Returns null for styles that have no subject/backdrop split.
export function subjectSpec(styleName, src, ctx) {
  const { slug, size, w, h, eff } = ctx;
  if (styleName === "photo-mesh") {
    const o = eff.settings.onMesh;
    return {
      args: [
        src,
        "-colorspace",
        "Gray",
        "-level",
        o.level,
        "-sigmoidal-contrast",
        o.sigmoidal,
      ],
      cleanup() {},
    };
  }
  if (styleName === "dither-mesh") {
    const [dark, light] = eff.settings.dither.colors.map((c) => C(eff, c));
    return {
      args: [
        ...ditherArgs(src, w, h, eff.settings.dither),
        "+level-colors",
        `${dark},${light}`,
      ],
      cleanup() {},
    };
  }
  if (styleName === "vector-mesh") {
    const s = eff.settings.vector;
    const svg = `${ctx.out}/.vm_${slug}_${size}.svg`;
    const pgm = `${ctx.out}/.vm_${slug}_${size}.pgm`;
    magick([src, "-colorspace", "Gray", "-normalize", pgm]);
    potrace([
      pgm,
      "--svg",
      "-k",
      String(s.threshold),
      "-t",
      String(s.turdSize),
      "-a",
      String(s.alphaMax),
      "-o",
      svg,
    ]);
    return {
      args: [
        "-background",
        "white",
        svg,
        "-fill",
        C(eff, "ink"),
        "-opaque",
        "black",
        "-resize",
        `${w}x${h}!`,
      ],
      cleanup() {
        rmSync(pgm, { force: true });
        rmSync(svg, { force: true });
      },
    };
  }
  return null;
}
```

(`ctx.out` is added to ctx by `render.mjs` in Step 5 — `subjectSpec` needs a scratch dir for potrace intermediates.)

Registry — every style becomes `{ outputs, apply }`. Full listing of the converted registry:

```js
export const STYLES = {
  duotone: {
    outputs: (slug, size, eff) => [
      `${slug}_duotone_${size}.png`,
      `${slug}_duotone-${accentOf(eff, slug)}_${size}.png`,
    ],
    apply(src, out, { slug, size, eff }) {
      const s = eff.settings.duotone;
      const paper = paletteLighten(pal(eff), "paper", s.paperLift);
      magick([
        src,
        "-colorspace",
        "Gray",
        "-level",
        s.level,
        "-sigmoidal-contrast",
        s.sigmoidal,
        "+level-colors",
        `${C(eff, "ink")},${paper}`,
        `${out}/${slug}_duotone_${size}.png`,
      ]);
      const accent = accentOf(eff, slug);
      magick([
        src,
        "-colorspace",
        "Gray",
        "-level",
        s.level,
        "-sigmoidal-contrast",
        s.sigmoidal,
        "+level-colors",
        `${C(eff, "ink")},${C(eff, accent)}`,
        `${out}/${slug}_duotone-${accent}_${size}.png`,
      ]);
    },
  },

  riso: {
    outputs: (slug, size) => [`${slug}_riso_${size}.png`],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.riso;
      magick([
        src,
        "-colorspace",
        "Gray",
        "-level",
        s.level,
        "-posterize",
        String(s.posterizeSteps),
        "+level-colors",
        `${C(eff, "ink")},${C(eff, "paper")}`,
        ...grainArgs(w, h, s.grain, `${slug}:riso:${w}x${h}`),
        `${out}/${slug}_riso_${size}.png`,
      ]);
    },
  },

  dither: {
    outputs: (slug, size, eff) => [
      `${slug}_dither_${size}.png`,
      `${slug}_dither-${accentOf(eff, slug)}_${size}.png`,
    ],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.dither;
      const [dark, light] = s.colors.map((c) => C(eff, c));
      magick([
        ...ditherArgs(src, w, h, s),
        "+level-colors",
        `${dark},${light}`,
        `${out}/${slug}_dither_${size}.png`,
      ]);
      const accent = accentOf(eff, slug);
      magick([
        ...ditherArgs(src, w, h, s),
        "+level-colors",
        `${dark},${C(eff, accent)}`,
        `${out}/${slug}_dither-${accent}_${size}.png`,
      ]);
    },
  },

  vector: {
    outputs: (slug, size) => [`${slug}_vector_${size}.png`],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.vector;
      const svg = `${out}/.vec_${slug}_${size}.svg`;
      const pgm = `${out}/.vec_${slug}_${size}.pgm`;
      magick([src, "-colorspace", "Gray", "-normalize", pgm]);
      potrace([
        pgm,
        "--svg",
        "-k",
        String(s.threshold),
        "-t",
        String(s.turdSize),
        "-a",
        String(s.alphaMax),
        "-o",
        svg,
      ]);
      magick([
        "-background",
        C(eff, "paper"),
        svg,
        "-fill",
        C(eff, "ink"),
        "-opaque",
        "black",
        "-resize",
        `${w}x${h}!`,
        `${out}/${slug}_vector_${size}.png`,
      ]);
      rmSync(pgm, { force: true });
      rmSync(svg, { force: true });
    },
  },

  framed: {
    outputs: (slug, size) => [`${slug}_framed_${size}.png`],
    apply(src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.framed;
      const inner = `${Math.round(w * s.inset)}x${Math.round(h * s.inset)}`;
      magick([
        src,
        "-resize",
        `${inner}>`,
        "-background",
        "none",
        "(",
        "+clone",
        "-background",
        "black",
        "-shadow",
        s.shadow,
        ")",
        "+swap",
        "-background",
        s.frameBg,
        "-layers",
        "merge",
        "-gravity",
        "center",
        "-extent",
        `${w}x${h}`,
        `${out}/${slug}_framed_${size}.png`,
      ]);
    },
  },

  mesh: {
    outputs: (slug, size, eff) =>
      eff.settings.mesh.themes.map((t) => `${slug}_mesh-${t}_${size}.png`),
    apply(_src, out, { slug, size, w, h, eff }) {
      const s = eff.settings.mesh;
      for (const theme of s.themes) {
        const tmp = `${out}/.mesh_${slug}_${theme}.svg`;
        writeFileSync(
          tmp,
          meshSvg(
            blobsFor(eff, slug, theme),
            meshColors(eff, slug, theme),
            s,
            w,
            h,
          ),
        );
        magick([
          tmp,
          ...grainArgs(w, h, s.grain, `${slug}:mesh-${theme}:${w}x${h}`),
          `${out}/${slug}_mesh-${theme}_${size}.png`,
        ]);
        rmSync(tmp);
      }
    },
  },

  "photo-mesh": {
    outputs: (slug, size) => [`${slug}_photo-mesh_${size}.png`],
    apply(src, out, ctx) {
      const spec = subjectSpec("photo-mesh", src, ctx);
      compositeOnMesh(spec.args, out, ctx, "photo-mesh");
      spec.cleanup();
    },
  },

  "dither-mesh": {
    outputs: (slug, size) => [`${slug}_dither-mesh_${size}.png`],
    apply(src, out, ctx) {
      const spec = subjectSpec("dither-mesh", src, ctx);
      compositeOnMesh(spec.args, out, ctx, "dither-mesh");
      spec.cleanup();
    },
  },

  "vector-mesh": {
    outputs: (slug, size) => [`${slug}_vector-mesh_${size}.png`],
    apply(src, out, ctx) {
      const spec = subjectSpec("vector-mesh", src, ctx);
      compositeOnMesh(spec.args, out, ctx, "vector-mesh");
      spec.cleanup();
    },
  },
};
```

Delete the now-unused module-level `SETTINGS` import and old aliases from `styles.mjs`.

- [ ] **Step 4: Pass `eff` through `render.mjs`**

In `lib/render.mjs`, `renderEntry` gains `illustration` in opts, resolves once, and calls the new record shape:

```js
import { resolveSettings } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

export function renderEntry(
  entry,
  styleName,
  sizeName,
  { out, crops, illustration },
) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const { effective: eff } = resolveSettings(
    entry.slug,
    illustration ?? { types: {}, images: {} },
    SETTINGS,
  );
  const dims = eff.settings.sizes[sizeName];
  // ...crop block unchanged (uses eff.settings.mesh.fallback for the no-cover case)...
  st.apply(input, out, { slug: entry.slug, size: sizeName, w, h, eff, out });
}
```

(The crop block's `SETTINGS.sizes` / `SETTINGS.mesh.fallback` references switch to `eff.settings.*`; `ctx.out` added for `subjectSpec` intermediates.)

`applicableStyles` gains the §5 pinning rule:

```js
export function applicableStyles(entry, requested, eff) {
  const base = entry.img
    ? requested.filter((s) => s !== "mesh")
    : requested.filter((s) => s === "mesh");
  if (eff?.style) return base.includes(eff.style) ? [eff.style] : [];
  return base;
}
```

In `illustrate.mjs` `main()`: load once — `const illustration = loadIllustration();` (import from `./lib/store.mjs`; a parse error now aborts the CLI with the §9 message) — resolve per entry, and pass through:

```js
const { effective: eff } = resolveSettings(entry.slug, illustration, SETTINGS);
const applicable = applicableStyles(entry, styles, eff);
// ...
renderEntry(entry, styleName, sizeName, { out, crops, illustration });
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test images/scripts/lib/`
Expected: all PASS

- [ ] **Step 6: Pixel-identity check with empty illustration.json (§5 "absent entry = fully automatic")**

```bash
rm -f images/illustration.json
pnpm illustrate
bash images/scripts/checks/signatures.sh > "$SCRATCH/after-tiers.txt"
diff "$SCRATCH/baseline.txt" "$SCRATCH/after-tiers.txt" && echo IDENTICAL
```

Expected: `IDENTICAL` (baseline from plan 1). Divergence here means a default leaked (`seed` default must be `slug`, `mix` default must reproduce `onMesh.subjectOpacity` + `Multiply`).

- [ ] **Step 7: Commit**

```bash
pnpm format:write images/scripts
git add images/scripts/lib/ images/scripts/illustrate.mjs
git commit -m "feat(illustration): styles consume three-tier effective settings"
```

---

### Task 4: Settings-hash manifest — `render-dirty` semantics + `--force`

**Files:**

- Modify: `images/scripts/lib/render.mjs`
- Modify: `images/scripts/illustrate.mjs` (`--force` flag, skip/render counters)
- Create: `images/scripts/lib/render.test.mjs`

**Interfaces:**

- Produces:
  - `renderEntry(entry, styleName, sizeName, { out, crops, illustration, force = false }) → boolean` — `true` if rendered, `false` if skipped clean.
  - `openManifest(out)` / `flushManifest()` — manifest at `<out>/.manifest.json`, shape `{ "<slug>|<style>|<size>": "<hex hash>" }`.
  - Hash input: `[imgPath, imgMtimeMs, styleName, sizeName, effective, crop]` JSON — any settings/source/crop change dirties exactly the affected outputs (§7).

- [ ] **Step 1: Write the failing test**

`images/scripts/lib/render.test.mjs` — manifest key logic only (full skip behaviour is checked end-to-end in Step 4; ImageMagick in unit tests is slow):

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderKey } from "./render.mjs";
import { resolveSettings } from "./resolve.mjs";
import { SETTINGS } from "../settings.mjs";

const entry = { slug: "s", img: null }; // no file → mtime "none", no fs access
const eff = (ill) =>
  resolveSettings("s", ill ?? { types: {}, images: {} }, SETTINGS).effective;

test("renderKey is stable for identical inputs", () => {
  assert.equal(
    renderKey(entry, "mesh", "thumb", eff(), { focus: [0.5, 0.5], zoom: 1 }),
    renderKey(entry, "mesh", "thumb", eff(), { focus: [0.5, 0.5], zoom: 1 }),
  );
});

test("renderKey changes when settings, crop, style or size change", () => {
  const base = renderKey(entry, "mesh", "thumb", eff(), { zoom: 1 });
  const tweaked = eff({ types: {}, images: { s: { mesh: { blur: 50 } } } });
  assert.notEqual(
    renderKey(entry, "mesh", "thumb", tweaked, { zoom: 1 }),
    base,
  );
  assert.notEqual(renderKey(entry, "mesh", "thumb", eff(), { zoom: 2 }), base);
  assert.notEqual(renderKey(entry, "mesh", "small", eff(), { zoom: 1 }), base);
  assert.notEqual(
    renderKey(entry, "duotone", "thumb", eff(), { zoom: 1 }),
    base,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `renderKey` not exported.

- [ ] **Step 3: Implement the manifest in `lib/render.mjs`**

```js
import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { hash } from "./util.mjs";

let manifest = null;
let manifestPath = null;

export function openManifest(out) {
  manifestPath = join(out, ".manifest.json");
  manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : {};
}

export function flushManifest() {
  if (manifestPath)
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

export function renderKey(entry, styleName, sizeName, eff, crop) {
  const mtime = entry.img ? String(statSync(entry.img).mtimeMs) : "none";
  return hash(
    JSON.stringify([entry.img, mtime, styleName, sizeName, eff, crop]),
  ).toString(16);
}
```

`renderEntry` wraps the render with the skip check:

```js
export function renderEntry(
  entry,
  styleName,
  sizeName,
  { out, crops, illustration, force = false },
) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const { effective: eff } = resolveSettings(
    entry.slug,
    illustration ?? { types: {}, images: {} },
    SETTINGS,
  );
  const crop = resolveCrop(crops?.[entry.slug], sizeName);
  const key = `${entry.slug}|${styleName}|${sizeName}`;
  const val = renderKey(entry, styleName, sizeName, eff, crop);
  const outputs = st.outputs(entry.slug, sizeName, eff);
  if (
    !force &&
    manifest &&
    manifest[key] === val &&
    outputs.every((f) => existsSync(join(out, f)))
  ) {
    return false;
  }
  // ...existing crop + apply flow (crop uses the `crop` const above)...
  if (manifest) manifest[key] = val;
  return true;
}
```

(When `openManifest` was never called — e.g. unit tests — `manifest` is null and every call renders; keeps the function usable standalone.)

- [ ] **Step 4: Wire the CLI and verify §10.5 end-to-end**

In `illustrate.mjs` `main()`: `openManifest(out)` after `mkdirSync`; `const force = process.argv.includes("--force");` passed to every `renderEntry`; count rendered vs skipped from the boolean; `flushManifest()` before the final log; final line becomes:

```js
console.log(
  `\n${entries.length} entries → ${out} (${rendered} rendered, ${skipped} skipped)`,
);
```

Add `--force` to the usage banner. Then:

```bash
pnpm illustrate --force        # full render, writes manifest
pnpm illustrate                # → "... (0 rendered, N skipped)"
pnpm illustrate --force        # → all rendered again
bash images/scripts/checks/signatures.sh > "$SCRATCH/after-manifest.txt"
diff "$SCRATCH/baseline.txt" "$SCRATCH/after-manifest.txt" && echo IDENTICAL
```

Expected: second run renders 0; signatures still `IDENTICAL`.

- [ ] **Step 5: Type-tier propagation check (§10.4)**

```bash
cat > images/illustration.json <<'EOF'
{
  "types": { "hand-drawing": { "style": "dither" } },
  "images": { "<SLUG>": { "type": "hand-drawing" } }
}
EOF
pnpm illustrate --match <SLUG>
```

Replace `<SLUG>` with a real cover slug from `pnpm illustrate` output. Expected: log line shows `→ dither ×` only (style pinned by the type tier); out dir gains only `_dither_` / `_dither-<accent>_` files for that slug on a fresh `--out` dir. Then `rm images/illustration.json` (or keep it — from here on the file is live).

- [ ] **Step 6: Run tests, format, commit**

```bash
node --test images/scripts/lib/
pnpm format:write images/scripts
git add images/scripts/
git commit -m "feat(illustration): settings-hash manifest with render-dirty skipping"
```

---

### Task 5: Docs

**Files:**

- Modify: `images/scripts/README.md`

- [ ] **Step 1: Document the new pieces**

Add to `images/scripts/README.md`: the `images/illustration.json` schema (copy the §5 example + reserved-key table from studio-design.md), the three-tier merge order, `--force`, and the manifest file (`images/out/review/.manifest.json`, regenerable, git-ignored with the rest of `images/out`). Note that `illustration.json` IS committed (it is hand-tuned work, like `crops.json`).

- [ ] **Step 2: Verify `images/illustration.json` will be committed, not ignored**

```bash
git check-ignore images/illustration.json && echo "FIX .gitignore" || echo OK
```

Expected: `OK`. If ignored, add a negation rule next to the existing `crops.json` handling.

- [ ] **Step 3: Commit**

```bash
pnpm format:write images/scripts/README.md
git add images/scripts/README.md .gitignore
git commit -m "docs(illustration): document illustration.json tiers and manifest"
```

---

## Execution notes

- Depends on plan 1 finished (baseline signature file still in `$SCRATCH`; if the session changed, regenerate it from the plan-1 final commit before starting: `git stash && pnpm illustrate && bash images/scripts/checks/signatures.sh > "$SCRATCH/baseline.txt" && git stash pop` — with a clean tree, just run it).
- Plan 3 (`studio-plan-3-studio-app.md`) consumes: `resolveSettings` (browser-served), `loadIllustration`/`saveIllustration`, `subjectSpec`, `renderEntry` boolean + manifest, `STYLES[*].outputs`.
