# Cover Studio Plan 1 — Pipeline Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new `~/code/projects/cover-studio` repo with the blog's illustration pipeline ported verbatim, its 28 tests green under vitest, a working `pnpm render` CLI, determinism verified against the old pipeline, and the mesh reserved-key fix landed as a tracked re-baseline.

**Architecture:** New standalone pnpm repo. Ported `.mjs` lib modules stay byte-identical where possible; only path/config plumbing changes (`blogRoot` from `studio.config.json`, data files under `data/`). New code (config loader, CLI entry, checks) is written fresh. Determinism gate uses ImageMagick pixel signatures (`magick identify -format "%#"`) — metadata-independent — comparing old-repo renders vs new-repo renders before anything changes semantically. Only after the gate passes does the mesh reserved-key fix land, re-baselining exactly one entry.

**Tech Stack:** Node ≥ 20, pnpm, vitest, zod. System deps: ImageMagick (`magick`), `mkbitmap`, `potrace`.

## Global Constraints

- New repo location: `~/code/projects/cover-studio` (blog-dedicated, private, never deployed).
- Ported lib files keep their `.mjs` extension and near-verbatim content — the spec tree's `.ts` names apply to NEW code only (config, CLI wrappers, later app code). Do not convert ported modules to TypeScript in this plan.
- Determinism contract: seed → RNG consumption order `op, cx, cy, rx, ry, rot` (in `mesh.mjs generateBlobs`). Never reorder.
- Determinism gate ordering (design §2): verify with mesh fix NOT applied → only then land the fix. `api-endpoints-with-astro` (`mesh.blur: 101`, previously ignored) is the ONE entry expected to change after the fix.
- Blog repo is read-only in this plan (source of copies). Nothing in the blog repo is modified or deleted.
- Data files (`illustration.json`, `crops.json`) are COPIED to `cover-studio/data/` — blog originals stay in place until Plan 3 retirement.
- Package manager: pnpm. Commits in the new repo use conventional commits.

## File Structure

```
~/code/projects/cover-studio/
├── package.json              # Task 1
├── tsconfig.json             # Task 1
├── vitest.config.ts          # Task 1
├── studio.config.json        # Task 1 (committed; absolute blogRoot documented)
├── .gitignore                # Task 1 (library/, out/, node_modules/)
├── README.md                 # Task 1 (system deps), extended Task 4
├── data/
│   ├── illustration.json     # Task 3 (copied from blog images/)
│   └── crops.json            # Task 3
├── src/server/
│   ├── config.mjs            # Task 1 — NEW: loads studio.config.json
│   └── lib/                  # Task 2 — ported from blog images/scripts/
│       ├── content.mjs       #   (blogRoot param instead of ROOT const)
│       ├── geometry.mjs      #   verbatim
│       ├── magick.mjs        #   verbatim
│       ├── mesh.mjs          #   verbatim
│       ├── render.mjs        #   verbatim
│       ├── resolve.mjs       #   verbatim (Task 6 modifies)
│       ├── settings.mjs      #   paths updated
│       ├── store.mjs         #   paths updated + zod (Task 3)
│       ├── styles.mjs        #   verbatim
│       ├── util.mjs          #   verbatim
│       └── *.test.mjs        #   7 test files, verbatim
├── src/cli/
│   └── render.mjs            # Task 4 — port of blog illustrate.mjs
└── checks/
    └── determinism.mjs       # Task 5 — old-vs-new signature compare
```

Blog source paths referenced throughout (read-only): `~/code/projects/jeromeabel.github.io/images/scripts/`.

---

### Task 1: Repo scaffold + config loader

**Files:**

- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `studio.config.json`, `.gitignore`, `README.md`, `src/server/config.mjs`, `src/server/config.test.mjs`

**Interfaces:**

- Produces: `loadConfig()` from `src/server/config.mjs` → `{ blogRoot: string, dataDir: string, libraryDir: string, outDir: string, exportName: string }` (all dirs absolute, resolved against repo root). Every later task reads paths through this.

- [ ] **Step 1: Init repo and package.json**

```bash
mkdir -p ~/code/projects/cover-studio && cd ~/code/projects/cover-studio
git init -b main
pnpm init
```

Then replace `package.json` with:

```json
{
  "name": "cover-studio",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "render": "node src/cli/render.mjs"
  },
  "devDependencies": {}
}
```

```bash
pnpm add -D vitest typescript
pnpm add zod
```

- [ ] **Step 2: Config + support files**

`studio.config.json` (committed; single-machine personal tool, absolute path is deliberate):

```json
{
  "blogRoot": "/home/jabel/code/projects/jeromeabel.github.io",
  "dataDir": "data",
  "libraryDir": "library",
  "outDir": "out",
  "exportName": "cover.gen.png"
}
```

`.gitignore`:

```
node_modules/
library/
out/
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "allowJs": true,
    "noEmit": true
  },
  "include": ["src", "checks"]
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["src/**/*.test.mjs"], passWithNoTests: true },
});
```

`README.md`: title, one-line purpose, and a **System deps** section: `ImageMagick 7 (magick), mkbitmap, potrace` with `sudo apt install imagemagick potrace` note (mkbitmap ships with potrace).

- [ ] **Step 3: Write the failing config test**

`src/server/config.test.mjs`:

```js
import { test, expect } from "vitest";
import { loadConfig } from "./config.mjs";
import { isAbsolute } from "node:path";

test("loadConfig resolves all paths absolute", () => {
  const c = loadConfig();
  expect(isAbsolute(c.blogRoot)).toBe(true);
  expect(isAbsolute(c.dataDir)).toBe(true);
  expect(c.dataDir.endsWith("/data")).toBe(true);
  expect(c.exportName).toBe("cover.gen.png");
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm vitest run src/server/config.test.mjs`
Expected: FAIL — cannot find module `./config.mjs`.

- [ ] **Step 5: Implement config.mjs**

```js
import { readFileSync } from "node:fs";
import { resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// config.mjs sits at src/server → repo root is two levels up.
export const TOOL_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export function loadConfig() {
  const raw = JSON.parse(
    readFileSync(resolve(TOOL_ROOT, "studio.config.json"), "utf8"),
  );
  const abs = (p) => (isAbsolute(p) ? p : resolve(TOOL_ROOT, p));
  return {
    blogRoot: abs(raw.blogRoot),
    dataDir: abs(raw.dataDir),
    libraryDir: abs(raw.libraryDir),
    outDir: abs(raw.outDir),
    exportName: raw.exportName,
  };
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `pnpm test` — Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold cover-studio repo with config loader"
```

---

### Task 2: Port lib modules + 28 tests verbatim

**Files:**

- Create: `src/server/lib/{content,geometry,magick,mesh,render,resolve,settings,store,styles,util}.mjs` and the 7 `*.test.mjs` files — copied from blog `images/scripts/lib/` and `images/scripts/settings.mjs`
- Modify after copy: `content.mjs` (ROOT → param), `settings.mjs` (paths), `store.mjs` (paths)

**Interfaces:**

- Consumes: `loadConfig()` from Task 1.
- Produces (unchanged public API, later tasks rely on these exact names): `resolveSettings(slug, illustration, settings)` → `{ effective, source }`; `scanContent(blogRoot)` → `[{ slug, img }]` (**signature change**: takes `blogRoot` explicitly); `generateBlobs(seed, cfg)`, `meshSvg(blobs, colors, cfg, w, h)`; `renderEntry(...)`, `renderLayer(entry, eff, crop, sizeName, styleName, dir)`, `renderExact(...)`, `applicableStyles(entry, requested, eff)`, `openManifest(out)`, `flushManifest()`, `renderKey(...)`, `prepareInput(...)`; `loadCrops()`, `saveCrops(crops)`, `loadIllustration()`, `saveIllustration(data)`, `ILLUSTRATION_FILE`; `SETTINGS`; `STYLES`, `subjectSpec`, `ditherArgs`, `accentOf`; `cropBox`, `resolveCrop`; `hash`, `rng`, `lerp`, `color`, `accentFor`, `lighten`, `contrastRatio`; `magick`, `potrace`, `imageSize`, `grainArgs`.

- [ ] **Step 1: Copy files verbatim**

```bash
BLOG=~/code/projects/jeromeabel.github.io
mkdir -p src/server/lib
cp $BLOG/images/scripts/lib/*.mjs src/server/lib/
cp $BLOG/images/scripts/settings.mjs src/server/lib/settings.mjs
```

- [ ] **Step 2: Adapt content.mjs — blogRoot as parameter**

In `src/server/lib/content.mjs`, delete the `export const ROOT = resolve(...)` block (and its now-unused `dirname`/`fileURLToPath` imports if nothing else uses them) and change the signature so the blog location is injected:

```js
// before: export function scanContent() { ... uses ROOT ... }
export function scanContent(blogRoot) {
  // body unchanged except: every `join(ROOT, ...)` becomes `join(blogRoot, ...)`
}
```

Everything else in the file stays byte-identical.

- [ ] **Step 3: Adapt settings.mjs paths**

In `src/server/lib/settings.mjs`, only the two path values change:

```js
  out: "out/review",           // was "images/out/review"
  cropsFile: "data/crops.json", // was "images/crops.json"
```

- [ ] **Step 4: Adapt store.mjs paths**

In `src/server/lib/store.mjs`, paths become tool-root-relative via config:

```js
import { TOOL_ROOT } from "../config.mjs";
import { resolve } from "node:path";

export const ILLUSTRATION_FILE = resolve(TOOL_ROOT, "data/illustration.json");
```

and any crops path derivation resolves `SETTINGS.cropsFile` against `TOOL_ROOT`. Read the copied file first; keep every function body otherwise identical (same JSON formatting on save — 2-space indent + trailing newline — so diffs vs blog data stay clean).

- [ ] **Step 5: Fix test imports if needed, run the suite**

Some tests may import `../settings.mjs` (old relative layout). Update import paths only — no assertion changes.

Run: `pnpm test`
Expected: **28 passed** (same count as blog: `geometry 3, magick —, mesh, render, resolve, store, styles, util` totalling 28). If store tests touch `data/`, they must use temp dirs exactly as they did in the blog — do not weaken them.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: port pipeline lib + 28 tests from blog repo (verbatim, paths adapted)"
```

---

### Task 3: Data move + zod boot validation

**Files:**

- Create: `data/illustration.json`, `data/crops.json` (copies), `src/server/lib/validate.mjs`, `src/server/lib/validate.test.mjs`
- Modify: `src/server/lib/store.mjs` (`loadIllustration`/`loadCrops` validate on read)

**Interfaces:**

- Produces: `illustrationSchema`, `cropsSchema` (zod) and `validateIllustration(data)`, `validateCrops(data)` from `validate.mjs` — each returns the parsed data or **throws** with zod's message. `loadIllustration()`/`loadCrops()` now throw on malformed files (boot refuses to start, as today with JSON.parse — this extends it to shape errors).

- [ ] **Step 1: Copy data**

```bash
cp $BLOG/images/illustration.json data/illustration.json
cp $BLOG/images/crops.json data/crops.json
```

- [ ] **Step 2: Write failing validation tests**

`src/server/lib/validate.test.mjs`:

```js
import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { validateIllustration, validateCrops } from "./validate.mjs";
import { TOOL_ROOT } from "../config.mjs";

test("real data files pass validation", () => {
  const ill = JSON.parse(
    readFileSync(`${TOOL_ROOT}/data/illustration.json`, "utf8"),
  );
  const crops = JSON.parse(
    readFileSync(`${TOOL_ROOT}/data/crops.json`, "utf8"),
  );
  expect(() => validateIllustration(ill)).not.toThrow();
  expect(() => validateCrops(crops)).not.toThrow();
});

test("malformed illustration refuses", () => {
  expect(() => validateIllustration({ images: "nope" })).toThrow();
  expect(() =>
    validateIllustration({ types: {}, images: { x: { style: 42 } } }),
  ).toThrow();
});
```

- [ ] **Step 3: Run to verify FAIL** (`validate.mjs` missing).

- [ ] **Step 4: Implement validate.mjs**

```js
import { z } from "zod";

const blob = z.object({
  cx: z.number(),
  cy: z.number(),
  rx: z.number(),
  ry: z.number(),
  rot: z.number(),
  op: z.number(),
  fill: z.enum(["tint", "accent"]),
});

const entryRecord = z
  .object({
    type: z.string().optional(),
    style: z.string().optional(),
    accent: z.string().optional(),
    seed: z.string().optional(),
    mix: z
      .object({ opacity: z.number().optional(), blend: z.string().optional() })
      .optional(),
    mesh: z
      .object({ blobs: z.array(blob).optional() })
      .passthrough()
      .optional(),
  })
  .passthrough(); // settings-group overrides (dither, onMesh, …) pass through

export const illustrationSchema = z.object({
  types: z.record(z.string(), entryRecord),
  images: z.record(z.string(), entryRecord),
});

export const cropsSchema = z.record(
  z.string(),
  z.record(
    z.string(),
    z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .passthrough(),
  ),
);

export const validateIllustration = (d) => illustrationSchema.parse(d);
export const validateCrops = (d) => cropsSchema.parse(d);
```

Check `cropsSchema` against the real `data/crops.json` shape first (Read it) — if crop records store more/other keys (zoom, size-keyed boxes), match the actual shape with `.passthrough()` at the right level rather than inventing one.

- [ ] **Step 5: Wire into store.mjs**

In `loadIllustration()` and `loadCrops()`, wrap the parsed JSON: `return validateIllustration(data);` / `return validateCrops(data);`.

- [ ] **Step 6: Run full suite** — `pnpm test`, Expected: 30 passed (28 + 2 new).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: move data files in, zod-validate on load"
```

---

### Task 4: CLI batch render (port illustrate.mjs)

**Files:**

- Create: `src/cli/render.mjs` (port of blog `images/scripts/illustrate.mjs`)
- Modify: `README.md` (usage section)

**Interfaces:**

- Consumes: `loadConfig()`, `scanContent(blogRoot)`, `loadIllustration()`, `loadCrops()`, `resolveSettings`, `renderEntry`, `openManifest`, `flushManifest`, `writeSheet` (port `writeSheet` from illustrate.mjs into this file).
- Produces: `pnpm render [--styles a,b] [--sizes x,y] [--sheet]` — same flags as blog `pnpm illustrate` / `illustrate:sheet`. Incremental behavior preserved (manifest-based skip). Plan 2's job runner shells the same module.

- [ ] **Step 1: Port the file**

```bash
cp $BLOG/images/scripts/illustrate.mjs src/cli/render.mjs
```

Then adapt only:

- imports: `./lib/…` → `../server/lib/…`
- `scanContent()` → `scanContent(loadConfig().blogRoot)`
- output dir uses `SETTINGS.out` (already `out/review` after Task 2) resolved against `TOOL_ROOT`.

Keep the render loop, style/size filtering, manifest handling, and `writeSheet` logic byte-identical.

- [ ] **Step 2: Run and verify incremental parity**

Run: `pnpm render`
Expected: full batch renders into `out/review/` (long first run — system deps required). Then run `pnpm render` again — Expected: `0 rendered, N skipped` (incremental skip works, N ≈ 724 as in the blog).

- [ ] **Step 3: Document + commit**

Add README usage lines for `pnpm render` / `--sheet`.

```bash
git add -A && git commit -m "feat: port batch render CLI"
```

---

### Task 5: Determinism gate (old vs new)

**Files:**

- Create: `checks/determinism.mjs`
- Modify: `package.json` (script `check:determinism`), `README.md`

**Interfaces:**

- Consumes: blog repo's existing rendered outputs in `$BLOG/images/out/review/` (or renders them there via blog `pnpm illustrate`), new outputs in `out/review/`.
- Produces: exit 0 + per-file `OK` lines when every compared render has an identical ImageMagick **pixel signature** (`magick identify -format "%#"` — ignores PNG metadata/timestamps); exit 1 with a diff list otherwise. This is the gate before Task 6 and before any Plan 3 blog-side deletion.

- [ ] **Step 1: Ensure both sides are freshly rendered**

```bash
(cd $BLOG && pnpm illustrate)   # old pipeline, blog repo — read-only usage
pnpm render                      # new pipeline
```

- [ ] **Step 2: Write the check script**

`checks/determinism.mjs`:

```js
// Compare pixel signatures of every render present in BOTH trees.
// Metadata-independent: `magick identify -format "%#"` hashes pixel data only.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig, TOOL_ROOT } from "../src/server/config.mjs";

const cfg = loadConfig();
const oldDir = resolve(cfg.blogRoot, "images/out/review");
const newDir = resolve(TOOL_ROOT, "out/review");
const sig = (f) =>
  execFileSync("magick", ["identify", "-format", "%#", f]).toString();

const oldFiles = new Set(readdirSync(oldDir).filter((f) => f.endsWith(".png")));
const newFiles = readdirSync(newDir).filter((f) => f.endsWith(".png"));
const common = newFiles.filter((f) => oldFiles.has(f));
if (common.length === 0) {
  console.error("no common files — render both sides first");
  process.exit(1);
}

let bad = 0;
for (const f of common) {
  const ok = sig(`${oldDir}/${f}`) === sig(`${newDir}/${f}`);
  if (!ok) {
    bad++;
    console.error(`DIFF ${f}`);
  }
}
console.log(`${common.length - bad}/${common.length} identical`);
process.exit(bad ? 1 : 0);
```

Add script: `"check:determinism": "node checks/determinism.mjs"`.

- [ ] **Step 3: Run the gate**

Run: `pnpm check:determinism`
Expected: `N/N identical`, exit 0. **If any file diffs, STOP — do not proceed to Task 6.** Debug the port (path adaptation is the usual suspect) until the gate passes. This validates: the mesh reserved-key fix is NOT yet applied, so even `api-endpoints-with-astro` must match here.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: determinism gate vs old pipeline (pixel signatures)"
```

---

### Task 6: Mesh reserved-key fix + re-baseline

**Files:**

- Modify: `src/server/lib/resolve.mjs`, `src/server/lib/resolve.test.mjs`

**Interfaces:**

- Produces: per-image/type `mesh` group overrides (all keys EXCEPT `blobs`) now merge into `settings.mesh` with correct tier tagging. `effective.mesh` keeps ONLY materialized `blobs` (or null). Plan 2's mesh editor and tier chips rely on this exact split: cfg knobs read/write `settings.mesh.*` (source-tagged `mesh.blur` etc.), materialized blobs read/write `effective.mesh.blobs`.

- [ ] **Step 1: Write failing tests**

Append to `src/server/lib/resolve.test.mjs`:

```js
test("per-image mesh cfg keys merge into settings.mesh", () => {
  const ill = {
    types: {},
    images: { s: { style: "photo-mesh", mesh: { blur: 101 } } },
  };
  const { effective, source } = resolveSettings("s", ill, SETTINGS);
  expect(effective.settings.mesh.blur).toBe(101);
  expect(source["mesh.blur"]).toBe("image");
  expect(effective.mesh).toBeNull(); // no blobs → no materialization
});

test("mesh blobs stay materialization, not cfg", () => {
  const blobs = [{ cx: 1, cy: 2, rx: 3, ry: 4, rot: 5, op: 0.1, fill: "tint" }];
  const ill = { types: {}, images: { s: { mesh: { blobs, blur: 90 } } } };
  const { effective } = resolveSettings("s", ill, SETTINGS);
  expect(effective.mesh).toEqual({ blobs });
  expect(effective.settings.mesh.blur).toBe(90);
  expect(effective.settings.mesh.blobs).toBeUndefined();
});
```

(`SETTINGS` import as the existing tests do.)

- [ ] **Step 2: Run to verify FAIL** — `pnpm vitest run src/server/lib/resolve.test.mjs`. Expected: `settings.mesh.blur` is 100 (global), `source["mesh.blur"]` is `"global"`.

- [ ] **Step 3: Implement in resolve.mjs**

In `resolveSettings`, inside the final reserved-keys loop, special-case `mesh` per tier — split cfg keys from `blobs`:

```js
const splitMesh = (rec) => {
  if (!rec || typeof rec !== "object")
    return { blobs: undefined, cfg: undefined };
  const { blobs, ...cfg } = rec;
  return { blobs, cfg: Object.keys(cfg).length ? cfg : undefined };
};
```

For each tier in order (`type`, then `image`): if that tier's record has `mesh`, merge its `cfg` part via `mergeInto(groups.mesh, cfg, tier, source, "mesh")` BEFORE building `effective`; `effective.mesh` becomes `{ blobs }` when blobs exist from image or type tier (image wins), else `null`, and `source.mesh` tags where the blobs came from. Keep the other reserved keys (`style`, `mix`, `accent`, `seed`) exactly as they were.

- [ ] **Step 4: Run full suite** — `pnpm test`. Expected: all pass (30 + 2 new = 32). If an existing resolve test asserted the OLD ignore-behavior for mesh cfg keys, update that assertion — this is the one deliberate semantic change, note it in the commit body.

- [ ] **Step 5: Re-run determinism gate — expect exactly one entry to change**

```bash
pnpm render && pnpm check:determinism
```

Expected: every `api-endpoints-with-astro_*` file line reads `DIFF` (its `blur: 101` now applies), **all other files identical**. Any other diff = bug, stop and fix. Then re-baseline: this is accepted, documented output change.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: support per-image mesh cfg overrides in resolve

Legalizes the previously-ignored mesh group override (design §2 ordering
rule). api-endpoints-with-astro (mesh.blur: 101) re-baselined — the one
expected render change; all other entries verified identical."
```

---

## Exit criteria (plan 1)

- `pnpm test` green (32 tests) in cover-studio.
- `pnpm render` twice: full render, then `0 rendered` incremental skip.
- `pnpm check:determinism` passed pre-fix on all files; post-fix diffs confined to `api-endpoints-with-astro`.
- Blog repo untouched (verify: `cd $BLOG && git status` clean apart from pre-existing state).
