# Studio Plan 1/3 — Behavior-Preserving Module Split

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `images/scripts/illustrate.mjs` (766 lines) into the §4 module layout of [studio-design.md](./studio-design.md) with pixel-identical output, so plans 2 and 3 can build on real module boundaries.

**Architecture:** Extract pure modules (`util`, `geometry`, `mesh`) with zero node imports so the studio can later serve them to the browser verbatim; extract node-only modules (`magick`, `content`, `store`, `styles`, `render`); leave `illustrate.mjs` a thin CLI + contact sheet. `crop-ui.mjs` is NOT touched — `illustrate.mjs` keeps compat re-exports so it works unchanged until plan 3 absorbs it.

**Tech Stack:** Node ≥ 20 ES modules, ImageMagick 6 (`convert`/`identify`), potrace, `node --test` for pure-module tests.

## Global Constraints

- Spec: `.specs/01_active/illustration-system/studio-design.md` §4 (module layout), §10.1 (behaviour-preservation check).
- **Nothing under `src/` changes** (design.md §0 step-1 gate).
- Output must be **pixel-identical** before/after the split, verified with ImageMagick pixel signatures (`identify -format '%#'`), not `md5sum` — ImageMagick writes `date:create`/`date:modify` text chunks into PNGs, so file hashes differ run-to-run even for identical pixels. The spec's §10.1 md5 intent is honored via signatures.
- `geometry.mjs`, `mesh.mjs`, `util.mjs` must have **no node imports and no `SETTINGS` import** (browser-served later). Palette is passed as a parameter.
- `settings.mjs` stays one flat exported `SETTINGS` object — the single tuning file.
- Every task ends with `pnpm illustrate --match nuxt --limit 1` green (fast smoke) and a commit; full signature diff is Task 6.
- `pnpm format:write` on touched files before each commit.

**Current line map of `images/scripts/illustrate.mjs`** (for the moves below): SETTINGS 36–135 · ROOT 140 · color 141–142 · hash 144–151 · rng 154–163 · lerp 165 · accentFor 166–169 · magick 171–173 · potrace 175–177 · rgb/hex 179–182 · lighten 184–186 · contrastRatio 192–202 · imageSize 204–210 · grainArgs 212–229 · cropBox 233–252 · resolveCrop 257–263 · loadCrops 265–268 · scanContent 273–304 · ditherArgs 313–337 · meshSvg 341–369 · meshBackdrop 372–380 · compositeOnMesh 383–409 · STYLES 411–621 · writeSheet 626–662 · main 667–759.

---

### Task 1: Deterministic grain + signature check script

The grain overlay uses `+noise Gaussian` with no `-seed`, so riso, mesh, and all `*-mesh` outputs differ on every run. No behaviour-preservation check is possible until this is fixed. This is a **one-time intentional pixel change**, done BEFORE the baseline so the split's check is valid. It also satisfies the design.md §6 determinism guardrail that the plan-2 manifest requires anyway.

**Files:**

- Modify: `images/scripts/illustrate.mjs` (grainArgs 212–229 + its 3 call sites: riso 454, mesh style 546, meshBackdrop 377)
- Create: `images/scripts/checks/signatures.sh`

**Interfaces:**

- Produces: `grainArgs(w, h, { attenuate, blend }, seedStr)` — 4th arg mandatory; deterministic per seed string. `checks/signatures.sh [dir]` → sorted `"<pixel-sig>  <file>"` lines on stdout.

- [ ] **Step 1: Add seed parameter to `grainArgs`**

In `illustrate.mjs`, change the signature and prepend the `-seed` setting (it must precede the `(` group so it applies to `+noise`):

```js
function grainArgs(w, h, { attenuate, blend }, seedStr) {
  return [
    "-seed",
    String(hash(seedStr)),
    "(",
    "-size",
    `${w}x${h}`,
    "xc:gray50",
    "-attenuate",
    String(attenuate),
    "+noise",
    "Gaussian",
    "-colorspace",
    "Gray",
    ")",
    "-compose",
    blend,
    "-composite",
  ];
}
```

- [ ] **Step 2: Thread seeds through the 3 call sites**

```js
// riso style (line ~454):
...grainArgs(w, h, s.grain, `${slug}:riso:${w}x${h}`),
// mesh style, inside the theme loop (line ~546):
...grainArgs(w, h, s.grain, `${slug}:mesh-${theme}:${w}x${h}`),
// meshBackdrop (line ~377):
magick([svg, ...grainArgs(w, h, s.grain, `${slug}:bg:${w}x${h}`), png]);
```

- [ ] **Step 3: Write the signature script**

`images/scripts/checks/signatures.sh`:

```bash
#!/usr/bin/env bash
# Pixel-signature manifest of a render dir. `identify -format '%#'` hashes
# pixel data only — PNG date:create/date:modify chunks make md5 unstable.
set -euo pipefail
dir="${1:-images/out/review}"
cd "$dir"
for f in *.png; do
  printf '%s  %s\n' "$(identify -quiet -format '%#' "$f")" "$f"
done | sort -k2
```

`chmod +x images/scripts/checks/signatures.sh`

- [ ] **Step 4: Verify determinism (the failing→passing test of this task)**

```bash
pnpm illustrate
bash images/scripts/checks/signatures.sh > "$SCRATCH/run1.txt"
pnpm illustrate
bash images/scripts/checks/signatures.sh > "$SCRATCH/run2.txt"
diff "$SCRATCH/run1.txt" "$SCRATCH/run2.txt" && echo DETERMINISTIC
```

(`$SCRATCH` = the session scratchpad dir.) Expected: `DETERMINISTIC`. Before Step 1 this diff fails on every grain-bearing file — you can confirm once to see the test actually bites.

- [ ] **Step 5: Capture the baseline for the whole plan**

```bash
cp "$SCRATCH/run2.txt" "$SCRATCH/baseline.txt"
```

Every later task diffs against `baseline.txt`. Do not rerun `pnpm illustrate` with modified settings between tasks.

- [ ] **Step 6: Commit**

```bash
git add images/scripts/illustrate.mjs images/scripts/checks/signatures.sh
git commit -m "feat(illustration): seed grain noise for deterministic output"
```

---

### Task 2: `settings.mjs` + `lib/util.mjs`

**Files:**

- Create: `images/scripts/settings.mjs`
- Create: `images/scripts/lib/util.mjs`
- Create: `images/scripts/lib/util.test.mjs`
- Modify: `images/scripts/illustrate.mjs`

**Interfaces:**

- Produces: `settings.mjs` exports `SETTINGS` (moved verbatim from illustrate.mjs:36–135). `lib/util.mjs` exports `hash(str)`, `rng(seed)`, `lerp(r, [min,max])`, `color(palette, key)`, `accentFor(palette, slug)`, `lighten(palette, key, amount)`, `contrastRatio(palette, a, b)` — **palette is always an explicit first argument** (no `SETTINGS` import; browser-safe).

- [ ] **Step 1: Write the failing test**

`images/scripts/lib/util.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hash,
  rng,
  lerp,
  color,
  accentFor,
  lighten,
  contrastRatio,
} from "./util.mjs";

const palette = {
  ink: "#1e1e1e",
  paper: "#f5ffe1",
  accents: { teal: "#0d9488", coral: "#ff5a3c" },
};

test("hash is stable fnv-1a", () => {
  assert.equal(hash("nuxt"), hash("nuxt"));
  assert.notEqual(hash("nuxt"), hash("nuxt2"));
});

test("rng is deterministic per seed", () => {
  const a = rng("s"),
    b = rng("s");
  assert.equal(a(), b());
  assert.equal(a(), b());
});

test("lerp maps [0,1) into range", () => {
  assert.equal(
    lerp(() => 0, [10, 20]),
    10,
  );
  assert.equal(
    lerp(() => 0.5, [10, 20]),
    15,
  );
});

test("color resolves accents, palette keys, and passthrough hex", () => {
  assert.equal(color(palette, "teal"), "#0d9488");
  assert.equal(color(palette, "ink"), "#1e1e1e");
  assert.equal(color(palette, "#123456"), "#123456");
});

test("accentFor picks a palette accent deterministically", () => {
  const keys = Object.keys(palette.accents);
  assert.ok(keys.includes(accentFor(palette, "any-slug")));
  assert.equal(accentFor(palette, "x"), accentFor(palette, "x"));
});

test("lighten(_, _, 1) is white, (_, _, 0) is unchanged", () => {
  assert.equal(lighten(palette, "ink", 1), "#ffffff");
  assert.equal(lighten(palette, "ink", 0), "#1e1e1e");
});

test("contrastRatio black/white is 21", () => {
  assert.ok(Math.abs(contrastRatio(palette, "#000000", "#ffffff") - 21) < 0.01);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `Cannot find module .../lib/util.mjs`

- [ ] **Step 3: Create `settings.mjs`**

Move lines 32–135 of `illustrate.mjs` (the banner comment + `export const SETTINGS = {...}`) verbatim into `images/scripts/settings.mjs`. No other content.

- [ ] **Step 4: Create `lib/util.mjs`**

```js
// Pure helpers — no node imports, no SETTINGS import. The studio serves this
// file to the browser verbatim (studio-design.md §4), so palette is always an
// explicit argument.

export function hash(str) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — deterministic RNG from string hash
export function rng(seed) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (r, [min, max]) => min + r() * (max - min);

export const color = (palette, key) =>
  palette.accents[key] ?? palette[key] ?? key;

export const accentFor = (palette, slug) => {
  const keys = Object.keys(palette.accents);
  return keys[hash(slug) % keys.length];
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hexOf = ([r, g, b]) =>
  "#" +
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// Blend a color toward white. amount 0 = untouched, 1 = pure white.
export const lighten = (palette, c, amount) =>
  hexOf(rgb(color(palette, c)).map((v) => v + (255 - v) * amount));

// WCAG 2.x relative luminance + contrast ratio (see settings.mjs duotone notes).
export function contrastRatio(palette, a, b) {
  const lum = (c) => {
    const [r, g, bl] = rgb(color(palette, c)).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test images/scripts/lib/`
Expected: all PASS

- [ ] **Step 6: Rewire `illustrate.mjs`**

- Delete the moved blocks (SETTINGS 36–135; hash/rng/lerp/accentFor/color/rgb/hex/lighten/contrastRatio helpers).
- Add imports and **palette-bound local aliases** so every remaining call site stays textually unchanged:

```js
import { SETTINGS } from "./settings.mjs";
import {
  hash,
  rng,
  lerp,
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
  contrastRatio as paletteContrast,
} from "./lib/util.mjs";

// Bound to the global palette so existing call sites read exactly as before.
const color = (k) => paletteColor(SETTINGS.palette, k);
const accentFor = (slug) => paletteAccent(SETTINGS.palette, slug);
const lighten = (c, amount) => paletteLighten(SETTINGS.palette, c, amount);
const contrastRatio = (a, b) => paletteContrast(SETTINGS.palette, a, b);
```

- Re-export for crop-ui compat: `export { SETTINGS } from "./settings.mjs";` (crop-ui.mjs imports `SETTINGS` from illustrate.mjs and must keep working untouched until plan 3).

- [ ] **Step 7: Smoke + spot signature check**

```bash
pnpm illustrate --match nuxt --limit 1
bash images/scripts/checks/signatures.sh | grep '_nuxt' > "$SCRATCH/spot.txt"
grep '_nuxt' "$SCRATCH/baseline.txt" | diff - "$SCRATCH/spot.txt"
```

Expected: empty diff. (Slug filter: use a slug string actually present in `baseline.txt`.)

- [ ] **Step 8: Commit**

```bash
git add images/scripts/settings.mjs images/scripts/lib/ images/scripts/illustrate.mjs
git commit -m "refactor(illustration): extract settings.mjs and pure lib/util.mjs"
```

---

### Task 3: `lib/magick.mjs`, `lib/geometry.mjs`, `lib/content.mjs`, `lib/store.mjs`

**Files:**

- Create: `images/scripts/lib/magick.mjs`, `images/scripts/lib/geometry.mjs`, `images/scripts/lib/content.mjs`, `images/scripts/lib/store.mjs`
- Create: `images/scripts/lib/geometry.test.mjs`
- Modify: `images/scripts/illustrate.mjs`

**Interfaces:**

- Produces:
  - `magick.mjs`: `magick(args)`, `potrace(args)`, `imageSize(file) → {w,h}`, `grainArgs(w, h, {attenuate, blend}, seedStr)`.
  - `geometry.mjs`: `cropBox(srcW, srcH, w, h, {focus, zoom}) → {x,y,w,h}`, `resolveCrop(entry, sizeName) → {focus, zoom}` — pure, no imports at all.
  - `content.mjs`: `ROOT` (repo root), `scanContent() → [{slug, img}]`.
  - `store.mjs`: `loadCrops() → object`, `saveCrops(crops)`.

- [ ] **Step 1: Write the failing geometry test**

`images/scripts/lib/geometry.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { cropBox, resolveCrop } from "./geometry.mjs";

test("cropBox centers at default focus, full width when ratios match", () => {
  const b = cropBox(1200, 630, 575, 300, {});
  // target ratio 575/300 ≈ 1.9167 > src 1200/630 ≈ 1.9048 → width-bound
  assert.equal(b.w, 1200);
  assert.equal(b.h, Math.round(1200 / (575 / 300)));
  assert.equal(b.x, 0);
});

test("cropBox zoom shrinks the box and clamps at edges", () => {
  const b = cropBox(1000, 1000, 100, 100, { focus: [1, 1], zoom: 2 });
  assert.equal(b.w, 500);
  assert.equal(b.h, 500);
  assert.equal(b.x, 500); // clamped to srcW - boxW
  assert.equal(b.y, 500);
});

test("resolveCrop: size override wins field by field", () => {
  const entry = { focus: [0.2, 0.2], zoom: 1.5, sizes: { thumb: { zoom: 2 } } };
  assert.deepEqual(resolveCrop(entry, "thumb"), { focus: [0.2, 0.2], zoom: 2 });
  assert.deepEqual(resolveCrop(entry, "square"), {
    focus: [0.2, 0.2],
    zoom: 1.5,
  });
  assert.deepEqual(resolveCrop(undefined, "thumb"), {
    focus: [0.5, 0.5],
    zoom: 1,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `Cannot find module .../lib/geometry.mjs`

- [ ] **Step 3: Create the four modules**

`lib/geometry.mjs` — move `cropBox` (233–252) and `resolveCrop` (257–263) verbatim, with header:

```js
// Crop math — pure, zero imports. Served to the browser verbatim by the
// studio (studio-design.md §4); this is the single copy that replaces the
// hand-synced duplicate that lived in crop-ui.mjs.
```

`lib/magick.mjs`:

```js
import { execFileSync } from "node:child_process";
import { hash } from "./util.mjs";

export function magick(args) {
  execFileSync("convert", args, { stdio: "inherit" });
}

export function potrace(args) {
  execFileSync("potrace", args, { stdio: "inherit" });
}

export function imageSize(file) {
  const out = execFileSync("identify", ["-format", "%w %h", `${file}[0]`], {
    encoding: "utf8",
  });
  const [w, h] = out.trim().split(" ").map(Number);
  return { w, h };
}

// Seeded grain overlay — `-seed` precedes the paren group so `+noise` is
// deterministic (illustration determinism guardrail, design.md §6).
export function grainArgs(w, h, { attenuate, blend }, seedStr) {
  return [
    "-seed",
    String(hash(seedStr)),
    "(",
    "-size",
    `${w}x${h}`,
    "xc:gray50",
    "-attenuate",
    String(attenuate),
    "+noise",
    "Gaussian",
    "-colorspace",
    "Gray",
    ")",
    "-compose",
    blend,
    "-composite",
  ];
}
```

`lib/content.mjs` — move `scanContent` (273–304) verbatim plus:

```js
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// lib/ sits at images/scripts/lib → repo root is three levels up.
export const ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
```

`lib/store.mjs`:

```js
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./content.mjs";
import { SETTINGS } from "../settings.mjs";

export function loadCrops() {
  const file = join(ROOT, SETTINGS.cropsFile);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

export function saveCrops(crops) {
  writeFileSync(
    join(ROOT, SETTINGS.cropsFile),
    JSON.stringify(crops, null, 2) + "\n",
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test images/scripts/lib/`
Expected: all PASS

- [ ] **Step 5: Rewire `illustrate.mjs`**

Delete the moved blocks; import from the new modules; keep compat re-exports (crop-ui.mjs imports `SETTINGS, ROOT, scanContent, loadCrops` — see crop-ui.mjs:19):

```js
import { magick, potrace, imageSize, grainArgs } from "./lib/magick.mjs";
import { cropBox, resolveCrop } from "./lib/geometry.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import { loadCrops } from "./lib/store.mjs";

// Compat re-exports — crop-ui.mjs consumes these until the studio absorbs it
// (studio-plan-3). Remove them there.
export { SETTINGS } from "./settings.mjs";
export { ROOT, scanContent } from "./lib/content.mjs";
export { loadCrops } from "./lib/store.mjs";
export { cropBox, resolveCrop } from "./lib/geometry.mjs";
export { imageSize } from "./lib/magick.mjs";
```

Drop now-unused node imports from `illustrate.mjs` (`execFileSync`; keep `fs`/`path` bits still used by styles/sheet/main).

- [ ] **Step 6: Smoke crop-ui still boots**

```bash
node images/scripts/crop-ui.mjs --port 4381 &
sleep 1 && curl -sf http://localhost:4381/api/data | head -c 120 && kill %1
```

Expected: JSON starting `{"slugs":[...`.

- [ ] **Step 7: Smoke render + spot signature check** (same commands as Task 2 Step 7)

- [ ] **Step 8: Commit**

```bash
git add images/scripts/lib/ images/scripts/illustrate.mjs
git commit -m "refactor(illustration): extract magick, geometry, content, store modules"
```

---

### Task 4: `lib/mesh.mjs` + `lib/styles.mjs`

The one real signature change of the split: `meshSvg` becomes pure and blob generation is separated from SVG serialization (plan 3's drag-to-materialize needs the blob array as data — studio-design.md §6).

**Files:**

- Create: `images/scripts/lib/mesh.mjs`, `images/scripts/lib/styles.mjs`
- Create: `images/scripts/lib/mesh.test.mjs`
- Modify: `images/scripts/illustrate.mjs`

**Interfaces:**

- Produces:
  - `mesh.mjs`: `generateBlobs(seed, meshCfg) → [{cx,cy,rx,ry,rot,op,fill:"tint"|"accent"}]`; `meshSvg(blobs, {bg,tint,accent}, meshCfg, w, h) → string`. Pure; imports only `./util.mjs`.
  - `styles.mjs`: `STYLES` registry `{ [name]: (src, out, ctx) }` with `ctx = {slug, size, w, h}` — exact same per-style behaviour and output filenames as today. Also exports `ditherArgs(src, w, h)` (plan 3's layer route reuses it).

**RNG-order warning for the implementer:** today's `meshSvg` consumes the RNG in the order **op, cx, cy, rx, ry, rot** per blob (illustrate.mjs:350–358). `generateBlobs` must keep that exact order or every mesh output changes and Task 6 fails.

- [ ] **Step 1: Write the failing mesh test**

`images/scripts/lib/mesh.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateBlobs, meshSvg } from "./mesh.mjs";

const cfg = {
  viewBox: 1000,
  blur: 100,
  blobs: 4,
  radius: [200, 450],
  tintOpacity: [0.05, 0.14],
  accentOpacity: [0.35, 0.6],
};
const colors = { bg: "#f5ffe1", tint: "#1e1e1e", accent: "#0d9488" };

test("generateBlobs: deterministic, last blob is the accent", () => {
  const a = generateBlobs("slug:light", cfg);
  const b = generateBlobs("slug:light", cfg);
  assert.deepEqual(a, b);
  assert.equal(a.length, 4);
  assert.equal(a[3].fill, "accent");
  assert.ok(a.slice(0, 3).every((x) => x.fill === "tint"));
  assert.ok(a[3].op >= 0.35 && a[3].op <= 0.6);
});

test("meshSvg: serializes blobs with 2-decimal opacity and slice viewBox", () => {
  const blobs = [
    { cx: 300, cy: 420, rx: 350, ry: 300, rot: -12, op: 0.1, fill: "tint" },
  ];
  const svg = meshSvg(blobs, colors, cfg, 1200, 630);
  assert.ok(svg.includes('width="1200" height="630" viewBox="0 0 1000 1000"'));
  assert.ok(svg.includes('<rect width="1000" height="1000" fill="#f5ffe1"/>'));
  assert.ok(
    svg.includes(
      '<ellipse cx="300" cy="420" rx="350" ry="300" fill="#1e1e1e" opacity="0.10" transform="rotate(-12 300 420)"/>',
    ),
  );
  assert.ok(svg.includes('stdDeviation="100"'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test images/scripts/lib/`
Expected: FAIL — `Cannot find module .../lib/mesh.mjs`

- [ ] **Step 3: Create `lib/mesh.mjs`**

```js
// Seeded fluid-gradient mesh — pure, imports only util.mjs. Served to the
// browser verbatim by the studio (studio-design.md §3): the UI renders THIS
// geometry, not a reimplementation.
import { rng, lerp } from "./util.mjs";

// Blob array from a seed. RNG consumption order (op, cx, cy, rx, ry, rot)
// is a compatibility contract — changing it changes every mesh render.
export function generateBlobs(seed, cfg) {
  const r = rng(seed);
  const vb = cfg.viewBox;
  const blobs = [];
  for (let i = 0; i < cfg.blobs; i++) {
    const isAccent = i === cfg.blobs - 1;
    const op = Number(
      lerp(r, isAccent ? cfg.accentOpacity : cfg.tintOpacity).toFixed(2),
    );
    const cx = Math.round(lerp(r, [vb * 0.1, vb * 0.9]));
    const cy = Math.round(lerp(r, [vb * 0.1, vb * 0.9]));
    const rx = Math.round(lerp(r, cfg.radius));
    const ry = Math.round(lerp(r, cfg.radius));
    const rot = Math.round(lerp(r, [-45, 45]));
    blobs.push({ cx, cy, rx, ry, rot, op, fill: isAccent ? "accent" : "tint" });
  }
  return blobs;
}

export function meshSvg(blobs, { bg, tint, accent }, cfg, w, h) {
  const vb = cfg.viewBox;
  const shapes = blobs
    .map(
      (b) =>
        `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="${
          b.fill === "accent" ? accent : tint
        }" opacity="${b.op.toFixed(2)}" transform="rotate(${b.rot} ${b.cx} ${b.cy})"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vb} ${vb}" preserveAspectRatio="xMidYMid slice">
<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${cfg.blur}"/></filter>
<rect width="${vb}" height="${vb}" fill="${bg}"/>
<g filter="url(#b)">${shapes}</g>
</svg>`;
}
```

The output string must be byte-identical to today's `meshSvg` for the same inputs — `op.toFixed(2)` reproduces the old `"0.10"` formatting, and the three-line SVG layout (newlines included) is copied exactly from illustrate.mjs:364–368.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test images/scripts/lib/`
Expected: all PASS

- [ ] **Step 5: Create `lib/styles.mjs`**

Header + palette-bound aliases (same trick as Task 2 so moved bodies stay verbatim):

```js
// Style renderers — fn(src, out, ctx) with ctx = { slug, size, w, h }.
// src is already cropped+resized to w×h (except size "cover" = original).
import { writeFileSync, rmSync } from "node:fs";
import { SETTINGS } from "../settings.mjs";
import {
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
} from "./util.mjs";
import { magick, potrace, grainArgs } from "./magick.mjs";
import { generateBlobs, meshSvg } from "./mesh.mjs";

const color = (k) => paletteColor(SETTINGS.palette, k);
const accentFor = (slug) => paletteAccent(SETTINGS.palette, slug);
const lighten = (c, amount) => paletteLighten(SETTINGS.palette, c, amount);

function meshColors(slug, theme) {
  return {
    bg: theme === "light" ? color("paper") : color("ink"),
    tint: theme === "light" ? color("ink") : color("paper"),
    accent: color(accentFor(slug)),
  };
}
```

Then move **verbatim** from `illustrate.mjs`: `ditherArgs` (313–337, add `export`), `meshBackdrop` (372–380), `compositeOnMesh` (383–409), `STYLES` (411–621, add `export const`). Exactly two bodies change, both to use the new mesh API:

```js
// meshBackdrop — replaces the old inline meshSvg(slug, theme, w, h) call:
function meshBackdrop(out, slug, w, h) {
  const s = SETTINGS.mesh;
  const theme = SETTINGS.onMesh.theme;
  const svg = `${out}/.bg_${slug}.svg`;
  const png = `${out}/.bg_${slug}.png`;
  const blobs = generateBlobs(`${slug}:${theme}`, s);
  writeFileSync(svg, meshSvg(blobs, meshColors(slug, theme), s, w, h));
  magick([svg, ...grainArgs(w, h, s.grain, `${slug}:bg:${w}x${h}`), png]);
  rmSync(svg, { force: true });
  return png;
}

// STYLES.mesh — inside the theme loop, same replacement:
mesh(_src, out, { slug, size, w, h }) {
  const s = SETTINGS.mesh;
  for (const theme of s.themes) {
    const tmp = `${out}/.mesh_${slug}_${theme}.svg`;
    const blobs = generateBlobs(`${slug}:${theme}`, s);
    writeFileSync(tmp, meshSvg(blobs, meshColors(slug, theme), s, w, h));
    magick([
      tmp,
      ...grainArgs(w, h, s.grain, `${slug}:mesh-${theme}:${w}x${h}`),
      `${out}/${slug}_mesh-${theme}_${size}.png`,
    ]);
    rmSync(tmp);
  }
},
```

The old `meshSvg(slug, theme, w, h)` function in `illustrate.mjs` is deleted; grep for any remaining reference.

- [ ] **Step 6: Rewire `illustrate.mjs`**

Delete the moved blocks; add `import { STYLES } from "./lib/styles.mjs";`. `main()` and `writeSheet` are now the only bodies left besides re-exports.

- [ ] **Step 7: Smoke + spot signature check** (Task 2 Step 7 commands — pick a slug that has mesh outputs so the RNG-order contract is actually exercised)

- [ ] **Step 8: Commit**

```bash
git add images/scripts/lib/ images/scripts/illustrate.mjs
git commit -m "refactor(illustration): extract pure mesh module and styles registry"
```

---

### Task 5: `lib/render.mjs` + thin `illustrate.mjs`

**Files:**

- Create: `images/scripts/lib/render.mjs`
- Modify: `images/scripts/illustrate.mjs` (final thin form)

**Interfaces:**

- Consumes: `STYLES` (Task 4), `cropBox`/`resolveCrop` (Task 3), `magick`/`imageSize` (Task 3), `SETTINGS` (Task 2).
- Produces: `renderEntry(entry, styleName, sizeName, { out, crops }) → void` (throws on unknown style); `applicableStyles(entry, requested) → string[]`. Plan 2 extends this same file with the settings-hash manifest.

- [ ] **Step 1: Create `lib/render.mjs`**

```js
// One (entry, style, size) render — the isolated step both the CLI and the
// studio jobs call (studio-design.md §7). Plan 2 adds the settings-hash
// manifest here.
import { rmSync } from "node:fs";
import { SETTINGS } from "../settings.mjs";
import { magick, imageSize } from "./magick.mjs";
import { cropBox, resolveCrop } from "./geometry.mjs";
import { STYLES } from "./styles.mjs";

export function applicableStyles(entry, requested) {
  return entry.img
    ? requested.filter((s) => s !== "mesh")
    : requested.filter((s) => s === "mesh");
}

export function renderEntry(entry, styleName, sizeName, { out, crops }) {
  const fn = STYLES[styleName];
  if (!fn) throw new Error(`unknown style: ${styleName}`);
  const dims = SETTINGS.sizes[sizeName];
  if (dims === undefined) throw new Error(`unknown size: ${sizeName}`);

  let input = entry.img;
  let w, h;
  let tmp = null;
  if (entry.img && dims) {
    const src = imageSize(entry.img);
    const box = cropBox(
      src.w,
      src.h,
      dims.w,
      dims.h,
      resolveCrop(crops[entry.slug], sizeName),
    );
    tmp = `${out}/.crop_${entry.slug}_${sizeName}.png`;
    magick([
      entry.img,
      "-crop",
      `${box.w}x${box.h}+${box.x}+${box.y}`,
      "+repage",
      "-resize",
      `${dims.w}x${dims.h}!`,
      tmp,
    ]);
    input = tmp;
    ({ w, h } = dims);
  } else if (entry.img) {
    ({ w, h } = imageSize(entry.img));
  } else {
    ({ w, h } = dims ?? SETTINGS.mesh.fallback);
  }

  try {
    fn(input, out, { slug: entry.slug, size: sizeName, w, h });
  } finally {
    if (tmp) rmSync(tmp, { force: true });
  }
}
```

Known accepted cost vs. today: the source is cropped once per (style, size) instead of once per size — identical pixels, slightly slower full run. The plan-2 manifest erases this in normal use.

- [ ] **Step 2: Rewrite `illustrate.mjs` as the thin CLI**

Full final content (usage banner kept from today's lines 1–18):

```js
#!/usr/bin/env node
// ============================================================================
// Illustration lab CLI + contact sheet. All logic lives in ./lib (see
// .specs/01_active/illustration-system/studio-design.md §4).
//
// Usage:
//   node images/scripts/illustrate.mjs                     # everything
//   node images/scripts/illustrate.mjs --styles duotone,riso
//   node images/scripts/illustrate.mjs --sizes thumb,square
//   node images/scripts/illustrate.mjs --match nuxt        # filter by slug
//   node images/scripts/illustrate.mjs --limit 3
//   node images/scripts/illustrate.mjs --sheet             # + contact sheet
//   node images/scripts/illustrate.mjs --out images/out/review
// ============================================================================
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { SETTINGS } from "./settings.mjs";
import {
  color as paletteColor,
  accentFor as paletteAccent,
  lighten as paletteLighten,
  contrastRatio as paletteContrast,
} from "./lib/util.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import { loadCrops } from "./lib/store.mjs";
import { applicableStyles, renderEntry } from "./lib/render.mjs";

// Compat re-exports — crop-ui.mjs consumes these until the studio absorbs it
// (studio-plan-3). Remove them there.
export { SETTINGS } from "./settings.mjs";
export { ROOT, scanContent } from "./lib/content.mjs";
export { loadCrops } from "./lib/store.mjs";
export { cropBox, resolveCrop } from "./lib/geometry.mjs";
export { imageSize } from "./lib/magick.mjs";

const color = (k) => paletteColor(SETTINGS.palette, k);

// ============================================================================
// Contact sheet — one HTML grid, style × size × slug
// ============================================================================
export function writeSheet(out) {
  /* moved verbatim from today's lines 626–662, with `export` added */
}

// ============================================================================
// Main
// ============================================================================
function main() {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > -1 ? process.argv[i + 1] : fallback;
  };

  const styles = arg("styles", SETTINGS.styles.join(",")).split(",");
  const sizeNames = arg("sizes", Object.keys(SETTINGS.sizes).join(",")).split(
    ",",
  );
  const match = arg("match", "");
  const limit = Number(arg("limit", Infinity));
  const out = resolve(ROOT, arg("out", SETTINGS.out));
  mkdirSync(out, { recursive: true });

  const paper = paletteLighten(
    SETTINGS.palette,
    "paper",
    SETTINGS.duotone.paperLift,
  );
  console.log(
    `duotone ink→paper ${color("ink")}→${paper} ` +
      `(lift ${SETTINGS.duotone.paperLift}) — contrast ${paletteContrast(SETTINGS.palette, "ink", paper).toFixed(2)}:1\n`,
  );

  const crops = loadCrops();
  let entries = scanContent().filter((e) => e.slug.includes(match));
  entries = entries.slice(0, limit);

  for (const entry of entries) {
    const applicable = applicableStyles(entry, styles);
    for (const sizeName of sizeNames) {
      if (SETTINGS.sizes[sizeName] === undefined) {
        console.error(`unknown size: ${sizeName}`);
        continue;
      }
      for (const styleName of applicable) {
        try {
          renderEntry(entry, styleName, sizeName, { out, crops });
        } catch (err) {
          console.error(
            `${entry.slug} ${styleName} ${sizeName} FAILED: ${err.message}`,
          );
        }
      }
    }
    console.log(
      `${entry.slug} → ${applicable.join(",")} × ${sizeNames.join(",")}${entry.img ? "" : ` (accent: ${paletteAccent(SETTINGS.palette, entry.slug)})`}`,
    );
  }

  if (process.argv.includes("--sheet")) writeSheet(out);
  console.log(`\n${entries.length} entries → ${out}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
```

The `writeSheet` body is today's lines 626–662 unchanged (it reads `SETTINGS.sizes` and `readdirSync`/`writeFileSync`/`join`, all imported above). One behaviour delta to accept: `unknown style` is now reported per (style, size) via the thrown error instead of once per size — same information, slightly more lines on a bad `--styles` flag.

- [ ] **Step 3: Smoke**

```bash
pnpm illustrate --match nuxt --limit 1
node --test images/scripts/lib/
```

Expected: renders + logs as before; tests PASS.

- [ ] **Step 4: Commit**

```bash
git add images/scripts/lib/render.mjs images/scripts/illustrate.mjs
git commit -m "refactor(illustration): extract renderEntry, reduce illustrate.mjs to thin CLI"
```

---

### Task 6: Full behaviour-preservation verification

**Files:** none created — this is the §10.1 gate. The split ships only if this passes.

- [ ] **Step 1: Full re-render and signature diff**

```bash
pnpm illustrate
bash images/scripts/checks/signatures.sh > "$SCRATCH/after-split.txt"
diff "$SCRATCH/baseline.txt" "$SCRATCH/after-split.txt" && echo IDENTICAL
```

Expected: `IDENTICAL`. If any file differs, the most likely causes in order: RNG consumption order in `generateBlobs` (Task 4 warning), a grain seed string mismatch between Task 1 and Task 3/4, or a palette-alias call site missed in Task 2. Fix and re-run; do NOT re-baseline.

- [ ] **Step 2: crop-ui end-to-end check**

```bash
node images/scripts/crop-ui.mjs --port 4381 &
sleep 1
curl -sf http://localhost:4381/api/data | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log('slugs:',j.slugs.length,'sizes:',Object.keys(j.sizes).join(','))})"
kill %1
```

Expected: nonzero slug count, sizes `cover,thumb,small,square`.

- [ ] **Step 3: Repo checks**

```bash
node --test images/scripts/lib/
pnpm format:write images/scripts
pnpm format:check
pnpm build
```

Expected: tests pass, format clean, build green (nothing under `src/` touched — build must be unaffected).

- [ ] **Step 4: Commit any formatting fallout**

```bash
git add -A images/scripts && git commit -m "chore(illustration): format module split" || echo "nothing to commit"
```

---

## Execution notes

- `$SCRATCH` refers to the session scratchpad directory; baseline files must survive the whole plan run — do not put them in `images/out/review` (renders overwrite it).
- Content images are required: renders read real covers from `src/content/**`. No fixtures needed.
- Plan 2 (`studio-plan-2-settings-tiers.md`) starts from this plan's final commit.
