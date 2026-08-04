# Cover Studio Plan 2 — Studio App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Working `pnpm dev` studio in `~/code/projects/cover-studio`: Vue 3 three-pane UI over the Plan-1 pipeline, with the per-knob state model (tier chip / dirty dot / saved diff), schema-driven sliders, presets over the `type` tier, mesh editor, ported crop tab, and batch run drawer.

**Architecture:** Single Vite process. API routes are a Vite plugin's `configureServer` middleware (`src/server/api.ts`) calling the Plan-1 `.mjs` lib directly; browser code imports the same _pure_ modules (`resolve`, `mesh`, `geometry`, `util`, parts of `styles` that are arg-builders only — never `magick`, `store`, `render`, `content`, which touch fs/child_process). One Pinia store owns entries + per-leaf knob state; `schema.ts` is the single source of knob metadata and style→groups mapping.

**Tech Stack:** Vue 3 + TypeScript + Vite + Pinia; shadcn-vue (reka-ui) + Tailwind CSS v4; vitest (+ @vue/test-utils for store/component logic).

## Global Constraints

- Localhost-only tool: every API middleware request passes the loopback + Origin CSRF guard (Task 2) — port the exact checks from blog `images/scripts/studio.mjs` (lines ~140–156: remote-address loopback test, Origin header must be absent or same-origin) before any route logic.
- Ported Plan-1 lib files stay `.mjs`; all NEW app/server code is TypeScript. Browser must never import `magick.mjs`, `store.mjs`, `render.mjs`, `content.mjs`.
- Determinism contract untouched: UI never re-implements blob generation — it calls `generateBlobs(seed, cfg)` from `mesh.mjs` (RNG order `op, cx, cy, rx, ry, rot`).
- Knob semantics: `dirty = value !== savedValue`; tier comes from `resolveSettings().source`; save writes BOTH `data/illustration.json` and `data/crops.json` via the API (never partial files).
- Undo snapshots coalesce per gesture (slider pointer-up / input blur), not per reactive tick.
- shadcn-vue components are owned/committed (copied into `src/app/components/ui/`), not a runtime dependency.
- Blog repo remains read-only in this plan.

## File Structure

```
src/
├── server/
│   ├── api.ts                 # Task 2 — Vite plugin middleware (all routes)
│   ├── jobs.ts                # Task 9 — batch job runner (port of studio.mjs job logic)
│   └── lib/schema.mjs         # Task 3 — knob metadata + style→groups (browser-safe ⇒ .mjs pure module)
├── app/
│   ├── main.ts, App.vue       # Task 1
│   ├── style.css              # Task 1 — Tailwind v4 entry
│   ├── stores/studio.ts       # Task 4 — Pinia store (+ undo)
│   ├── api/client.ts          # Task 4 — typed fetch helpers
│   ├── components/ui/…        # Task 1 — shadcn-vue: Slider, Input, Select, RadioGroup,
│   │                          #   Collapsible, Tabs, Badge, Button, Dialog, Tooltip, Toast, Progress
│   ├── components/
│   │   ├── EntryRail.vue      # Task 5
│   │   ├── PreviewStage.vue   # Task 5
│   │   ├── ControlsPanel.vue  # Task 6
│   │   ├── KnobRow.vue        # Task 6
│   │   ├── TopBar.vue         # Task 6 (type/style/mix/seed row)
│   │   ├── SaveBar.vue        # Task 7
│   │   ├── PresetsMenu.vue    # Task 7
│   │   ├── MeshPanel.vue      # Task 8
│   │   ├── CropTab.vue        # Task 9
│   │   └── RunDrawer.vue      # Task 9
vite.config.ts                 # Task 1/2 — vue plugin + api plugin
index.html                     # Task 1 — Vite root
```

Blog reference sources (read-only, port targets): `images/scripts/studio.mjs` (server routes, guards, job runner), `images/scripts/studio/fx.mjs` (knob panel behavior), `studio/crop.mjs` (crop UI), `studio/run.mjs` (run panel), `studio/page.mjs` (layout/util).

---

### Task 1: App scaffold — Vite + Vue + Tailwind v4 + shadcn-vue

**Files:**

- Create: `index.html`, `vite.config.ts`, `src/app/main.ts`, `src/app/App.vue`, `src/app/style.css`, `src/app/components/ui/*` (shadcn-vue install)
- Modify: `package.json` (scripts + deps)

**Interfaces:**

- Produces: `pnpm dev` serves the app shell; `App.vue` renders a three-pane CSS grid with named slots/regions later tasks fill: `<aside class="rail">`, `<main class="stage">`, `<section class="controls">`, plus top bar and bottom bar rows.

- [ ] **Step 1: Install**

```bash
pnpm add vue pinia
pnpm add -D vite @vitejs/plugin-vue vue-tsc tailwindcss @tailwindcss/vite reka-ui @vue/test-utils jsdom
```

`package.json` scripts: `"dev": "vite"`, `"typecheck": "vue-tsc --noEmit"`.

- [ ] **Step 2: Vite + Tailwind wiring**

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: { host: "127.0.0.1" },
});
```

`src/app/style.css`: `@import "tailwindcss";` plus a small `@theme {}` block (reuse the blog's coral/teal accent hexes from `settings.mjs` palette: `--color-accent-coral: #ff5a3c; --color-accent-teal: #0d9488;`).

`index.html`: standard Vite entry mounting `#app`, `<title>Cover Studio</title>`.

- [ ] **Step 3: App shell**

`App.vue` template — grid `grid-rows-[auto_1fr_auto] grid-cols-[240px_1fr_340px] h-screen`; top bar spans all columns, save bar spans all columns, three panes in the middle row. Placeholder text in each region.

- [ ] **Step 4: shadcn-vue components**

Follow shadcn-vue docs install for Vite (components.json, then `pnpm dlx shadcn-vue@latest add slider input select radio-group collapsible tabs badge button dialog tooltip sonner progress`). Components land in `src/app/components/ui/` and are committed.

- [ ] **Step 5: Verify + commit**

Run: `pnpm dev` → shell renders, no console errors. `pnpm typecheck` clean.

```bash
git add -A && git commit -m "feat: app shell — vite + vue + tailwind v4 + shadcn-vue"
```

---

### Task 2: API middleware plugin with security guards

**Files:**

- Create: `src/server/api.ts`, `src/server/api.test.mjs`
- Modify: `vite.config.ts` (register plugin)

**Interfaces:**

- Consumes: Plan-1 lib (`loadIllustration`, `saveIllustration`, `loadCrops`, `saveCrops`, `scanContent`, `resolveSettings`, `renderLayer`, `renderExact`, `resolveCrop`, `imageSize`, `SETTINGS`), `loadConfig()`.
- Produces routes (same contract as blog `studio.mjs`, later tasks consume via `src/app/api/client.ts`):
  - `GET /api/data` → `{ entries, illustration, crops, settings, sizes, styles, manifest }` (port the exact payload assembly from `studio.mjs` /api/data handler)
  - `GET /img/<slug>` → original image bytes (content-type by extension)
  - `POST /api/save` body `{ illustration, crops }` → zod-validate (Plan-1 `validate.mjs`), write both files atomically, `{ ok: true }`
  - `GET /api/layer?slug&style&size&…` and `GET /api/render?…` → PNG bytes (call `renderLayer` / `renderExact`; port query-param parsing from studio.mjs)
  - `POST /api/job`, `GET /api/job` → stub 501 in this task (Task 9 implements)

- [ ] **Step 1: Write failing guard tests**

`src/server/api.test.mjs` — test the exported pure guard, not a live server:

```js
import { test, expect } from "vitest";
import { rejectRequest } from "./api.ts";

const req = (over) => ({
  socket: { remoteAddress: "127.0.0.1" },
  headers: {},
  ...over,
});

test("loopback allowed, remote rejected", () => {
  expect(rejectRequest(req())).toBeNull();
  expect(
    rejectRequest(req({ socket: { remoteAddress: "192.168.1.20" } })),
  ).toBe(403);
});

test("cross-origin rejected, same-origin allowed", () => {
  expect(
    rejectRequest(req({ headers: { origin: "http://evil.example" } })),
  ).toBe(403);
  expect(
    rejectRequest(req({ headers: { origin: "http://127.0.0.1:5173" } })),
  ).toBeNull();
  expect(
    rejectRequest(req({ headers: { origin: "http://localhost:5173" } })),
  ).toBeNull();
});
```

- [ ] **Step 2: Run to verify FAIL.**

- [ ] **Step 3: Implement api.ts**

Shape:

```ts
import type { Plugin } from "vite";
// note: .mjs lib imports work from TS with allowJs
import {
  loadIllustration,
  saveIllustration,
  loadCrops,
  saveCrops,
} from "./lib/store.mjs";
// … other lib imports as listed above

export function rejectRequest(req: {
  socket: { remoteAddress?: string };
  headers: Record<string, string | undefined>;
}): number | null {
  const a = req.socket.remoteAddress ?? "";
  if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(a)) return 403;
  const origin = req.headers["origin"];
  if (origin && !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin))
    return 403;
  return null;
}

export function studioApi(): Plugin {
  return {
    name: "studio-api",
    configureServer(server) {
      server.middlewares.use("/api", (req, res, next) => {
        /* guard + route table */
      });
      server.middlewares.use("/img", (req, res, next) => {
        /* guard + byte serving */
      });
    },
  };
}
```

Port each route body from `studio.mjs` (open it side-by-side; the handlers are lines ~157–235). Keep JSON error responses `{ error: string }` with real messages — the frontend toasts them verbatim (design §5).

- [ ] **Step 4: Verify**

`pnpm test` green. `pnpm dev`, then:

```bash
curl -s http://127.0.0.1:5173/api/data | head -c 300        # JSON payload
curl -s -H "Origin: http://evil.example" -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/api/data   # 403
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: api middleware plugin with loopback+origin guards"
```

---

### Task 3: schema.mjs — knob metadata + style→groups map

**Files:**

- Create: `src/server/lib/schema.mjs`, `src/server/lib/schema.test.mjs`

**Interfaces:**

- Produces (browser-safe pure module):
  - `SCHEMA: Record<groupKey, Record<leafKey, Knob>>` where `Knob = { label, description, kind: "number"|"levelPair"|"sigmoidal"|"enum"|"text"|"colorPair"|"rangePair", min?, max?, step?, unit?, options?, default }` — `default` copied verbatim from `SETTINGS`.
  - `STYLE_GROUPS: Record<styleName, string[]>` — which settings groups each style reads.
  - `knobList(group)` helper → `[ [leafPath, Knob] ]` in declaration order.

- [ ] **Step 1: Write failing completeness tests**

`src/server/lib/schema.test.mjs`:

```js
import { test, expect } from "vitest";
import { SCHEMA, STYLE_GROUPS } from "./schema.mjs";
import { SETTINGS } from "./settings.mjs";

const TUNABLE_GROUPS = [
  "duotone",
  "riso",
  "dither",
  "vector",
  "onMesh",
  "framed",
  "mesh",
  "mix",
];

test("every SETTINGS leaf in tunable groups has a schema entry with default matching SETTINGS", () => {
  const leaves = (o, p = "") =>
    Object.entries(o).flatMap(([k, v]) =>
      v !== null && typeof v === "object" && !Array.isArray(v)
        ? leaves(v, p ? `${p}.${k}` : k)
        : [[p ? `${p}.${k}` : k, v]],
    );
  for (const g of TUNABLE_GROUPS.filter((g) => SETTINGS[g])) {
    for (const [path, val] of leaves(SETTINGS[g])) {
      const knob = SCHEMA[g]?.[path];
      expect(knob, `${g}.${path} missing`).toBeDefined();
      expect(knob.default, `${g}.${path} default drift`).toEqual(val);
      expect(knob.label).toBeTruthy();
      if (knob.kind === "number") {
        expect(knob.min).toBeLessThanOrEqual(knob.default);
        expect(knob.max).toBeGreaterThanOrEqual(knob.default);
      }
    }
  }
});

test("every style maps to existing groups", () => {
  expect(Object.keys(STYLE_GROUPS).sort()).toEqual([...SETTINGS.styles].sort());
  for (const groups of Object.values(STYLE_GROUPS))
    for (const g of groups)
      expect(SCHEMA[g], `unknown group ${g}`).toBeDefined();
});
```

Note: `mix` is a reserved key, not in `SETTINGS` — give it schema entries (`opacity`, `blend`) with defaults `{ opacity: 1, blend: "Multiply" }` and skip it in the SETTINGS-driven loop (the `filter((g) => SETTINGS[g])` above does that).

- [ ] **Step 2: Run to verify FAIL.**

- [ ] **Step 3: Implement schema.mjs**

Cover every leaf of the Plan-1 `SETTINGS` groups. The full leaf inventory to encode (bounds chosen to bracket current defaults with sane tuning room; units in labels):

- `duotone`: `level` (levelPair, default `"14%,86%"`), `sigmoidal` (sigmoidal, `"7x50%"`), `paperLift` (number 0–1 step 0.01, default 0.35)
- `riso`: `posterizeSteps` (number 2–8 step 1, default 4), `level` (levelPair, `"8%,92%"`), `grain.attenuate` (number 0–1 step 0.01, 0.25), `grain.blend` (enum `["Multiply","SoftLight","Overlay","Screen"]`, "Multiply")
- `dither`: `preBlur` (text, `"0x0.6"`), `level` (levelPair, `"22%,78%"`), `sigmoidal` (sigmoidal, `"6x50%"`), `pixelate` (number 10–100 step 5 unit %, 50), `method` (enum `["o8x8,4","o4x4,4","FloydSteinberg"]`, `"o8x8,4"`), `colors` (colorPair, `["ink","paper"]`)
- `vector`: `threshold` (number 0–1 step 0.05, 0.5), `turdSize` (number 0–20 step 1, 4), `alphaMax` (number 0–1.34 step 0.01, 1)
- `onMesh`: `theme` (enum `["light","dark"]`, "light"), `level` (levelPair, `"12%,88%"`), `sigmoidal` (sigmoidal, `"6x50%"`), `subjectOpacity` (number 0–1 step 0.01, 0.92)
- `framed`: `inset` (number 0.5–1 step 0.01, 0.8), `shadow` (text, `"60x10+0+10"`), `frameBg` (text, `"#18181b"`)
- `mesh`: `fallback.w` / `fallback.h` (number, 400–2400 / 200–1600 step 10), `viewBox` (number 500–2000 step 50, 1000), `blur` (number 0–200 step 1, 100), `blobs` (number 1–12 step 1, 4), `radius` (rangePair 50–800, `[200,450]`), `tintOpacity` (rangePair 0–0.5 step 0.01, `[0.05,0.14]`), `accentOpacity` (rangePair 0–1 step 0.01, `[0.35,0.6]`), `grain.attenuate` (number 0–1 step 0.01, 0.28), `grain.blend` (enum as riso, "SoftLight"), `themes` (kind "text", default `["light","dark"]` — render read-only)
- `mix`: `opacity` (number 0–1 step 0.01, 1), `blend` (enum `["Multiply","SoftLight","Overlay","Screen","Normal"]`, "Multiply")

`STYLE_GROUPS` (derived from which `eff.settings.*` each style reads in `styles.mjs` — verify by grep before committing, adjust if the code disagrees):

```js
export const STYLE_GROUPS = {
  duotone: ["duotone"],
  riso: ["riso"],
  dither: ["dither"],
  vector: ["vector"],
  framed: ["framed"],
  mesh: ["mesh"],
  "photo-mesh": ["onMesh", "mesh", "mix"],
  "dither-mesh": ["dither", "onMesh", "mesh", "mix"],
  "vector-mesh": ["vector", "onMesh", "mesh", "mix"],
};
```

Every knob gets a one-line human `description` (shown in the UI) — write them from the existing `settings.mjs` comments, which already explain each number.

- [ ] **Step 4: Run tests** — `pnpm test` green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: knob schema + style-groups map with completeness tests"
```

---

### Task 4: Pinia store — per-knob state, dirty tracking, undo

**Files:**

- Create: `src/app/stores/studio.ts`, `src/app/stores/studio.test.ts`, `src/app/api/client.ts`

**Interfaces:**

- Consumes: `/api/data`, `/api/save` (Task 2); `resolveSettings` + `SCHEMA`/`STYLE_GROUPS` (browser imports of pure `.mjs`).
- Produces (later tasks bind to these exact names):
  - State: `entries`, `illustration`, `crops`, `activeSlug`, `manifest`, `lastExactAt`, `lastEditAt`
  - Getters: `activeEntry`, `resolved` (memoized `resolveSettings(activeSlug, draftIllustration, SETTINGS)`), `knob(group, path)` → `{ value, defaultValue, tier, savedValue, dirty }`, `activeGroups` (from `STYLE_GROUPS[resolved.effective.style]`), `diff` → `Array<{ path, from, to }>` vs saved files, `isDirty`, `exactStale` (`lastEditAt > lastExactAt`)
  - Actions: `load()`, `setKnob(group, path, value)` (writes image-tier override into draft `illustration.images[slug]`), `revertKnob(group, path)` (deletes the image-tier override), `setStyle`, `setSeed`, `setAccent`, `setMix`, `save()` (POST both files, resets savedValue baseline), `snapshot()` (push undo — called on gesture end), `undo()` (Ctrl+Z binding)

- [ ] **Step 1: Write failing store tests**

`src/app/stores/studio.test.ts` (vitest + `createPinia`, mock `client.ts` fetches with fixture data — a minimal `illustration` with the two real entries copied from `data/illustration.json`):

```ts
import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useStudio } from "./studio";

vi.mock("../api/client", () => ({
  fetchData: async () => ({
    entries: [{ slug: "s1", img: "/img/s1" }],
    illustration: { types: {}, images: { s1: { style: "dither-mesh" } } },
    crops: {},
    manifest: {},
  }),
  postSave: vi.fn(async () => ({ ok: true })),
}));

describe("knob state", () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
  });

  test("untouched knob: tier global, not dirty, value = default", async () => {
    const s = useStudio();
    await s.load();
    s.activeSlug = "s1";
    const k = s.knob("dither", "pixelate");
    expect(k).toMatchObject({
      value: 50,
      tier: "global",
      dirty: false,
      defaultValue: 50,
    });
  });

  test("setKnob marks dirty with image tier; revert restores", async () => {
    const s = useStudio();
    await s.load();
    s.activeSlug = "s1";
    s.setKnob("dither", "pixelate", 60);
    expect(s.knob("dither", "pixelate")).toMatchObject({
      value: 60,
      tier: "image",
      dirty: true,
    });
    expect(s.diff).toEqual([{ path: "dither.pixelate", from: 50, to: 60 }]);
    s.revertKnob("dither", "pixelate");
    expect(s.knob("dither", "pixelate").dirty).toBe(false);
  });

  test("save resets dirty baseline", async () => {
    const s = useStudio();
    await s.load();
    s.activeSlug = "s1";
    s.setKnob("dither", "pixelate", 60);
    await s.save();
    expect(s.knob("dither", "pixelate")).toMatchObject({
      value: 60,
      dirty: false,
      tier: "image",
    });
  });

  test("undo restores pre-gesture snapshot", async () => {
    const s = useStudio();
    await s.load();
    s.activeSlug = "s1";
    s.snapshot();
    s.setKnob("dither", "pixelate", 60);
    s.snapshot();
    s.setKnob("dither", "pixelate", 70);
    s.undo();
    expect(s.knob("dither", "pixelate").value).toBe(60);
  });

  test("activeGroups follows style", async () => {
    const s = useStudio();
    await s.load();
    s.activeSlug = "s1";
    expect(s.activeGroups).toEqual(["dither", "onMesh", "mesh", "mix"]);
  });
});
```

- [ ] **Step 2: Run to verify FAIL.**

- [ ] **Step 3: Implement client.ts + studio.ts**

`client.ts` — thin typed fetch: `fetchData()`, `postSave(body)`, `layerUrl(params)`, `renderUrl(params)`, `postJob(body)`, `getJob()`; non-2xx responses throw `new Error(json.error)` so callers toast real text.

`studio.ts` core mechanics:

- Draft state is `illustration` (deep-cloned on load = the working copy) plus `savedIllustration` (baseline). `knob()` resolves via `resolveSettings(activeSlug, illustration, SETTINGS)` and reads `savedValue` from a second resolve over `savedIllustration` — dirty is a value comparison between the two resolves, so type-tier edits and preset applications get correct dirty state for free.
- `setKnob(group, path, value)`: `setDeep(illustration.images[slug], `${group}.${path}`, value)` creating intermediate objects; bump `lastEditAt`.
- `revertKnob`: `deleteDeep` + prune empty parents.
- Undo stack: `snapshots: string[]` of `JSON.stringify(illustration)`, max 100; `snapshot()` pushes only if different from top; `undo()` pops into `illustration`.
- `save()`: `await postSave({ illustration, crops })`, then `savedIllustration = structuredClone(illustration)`.

- [ ] **Step 4: Run tests** — `pnpm vitest run src/app/stores/studio.test.ts`, then full `pnpm test`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: pinia store — per-knob tiers, dirty diff, undo stack"
```

---

### Task 5: EntryRail + PreviewStage

**Files:**

- Create: `src/app/components/EntryRail.vue`, `src/app/components/PreviewStage.vue`
- Modify: `src/app/App.vue` (mount them)

**Interfaces:**

- Consumes: store (Task 4); `generateBlobs`/`meshSvg` from `mesh.mjs`; `layerUrl`/`renderUrl` from client; manifest freshness from `/api/data`.
- Produces: `PreviewStage` emits nothing; exposes drag events consumed by Task 8 via store action `setBlobs(blobs)`. Blog references: preview composition logic in `studio/fx.mjs` (mesh SVG underlay + subject `<img>` at `mix.opacity`/blend + exact overlay toggle) and blob dragging in the same file — port behaviors, rewrite as Vue.

- [ ] **Step 1: EntryRail.vue**

List from `store.entries`: thumbnail (`/img/<slug>` at 48px), slug label, badges — `tuned` when `illustration.images[slug]` exists, amber `disk render stale` when `store.manifest` lacks a fresh render for the entry's current renderKey inputs (port the freshness comparison from `studio/run.mjs`). Click → `store.activeSlug = slug`. Filter input at top (substring match on slug).

- [ ] **Step 2: PreviewStage.vue**

Layered stack (CSS grid, all layers same cell, checkerboard backdrop):

1. Mesh layer: inline SVG via `meshSvg(blobsFor(...), colors, cfg, w, h)` — computed from `store.resolved`, re-renders reactively on any mesh knob change. Only for `*-mesh`/`mesh` styles (`activeGroups.includes("mesh")`).
2. Subject layer: `<img :src="layerUrl({ slug, style, size: 'thumb', ...cacheKey })">` with CSS `opacity` + `mix-blend-mode` from `mix` knobs. Debounce URL updates 300ms; abort stale loads by swapping only on `@load`.
3. Exact overlay: `<img :src="renderUrl(...)">` shown when user hits "Render exact" (button in stage corner); "stale" coral dot on the button when `store.exactStale`.

Non-mesh styles: subject layer only (server render IS the full image).

- [ ] **Step 3: Verify manually**

`pnpm dev`: select the two tuned entries; mesh preview reacts instantly to a mesh knob change in Vue devtools (store patch); exact render appears and staleness dot toggles after edits. Console clean.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: entry rail + layered preview stage"
```

---

### Task 6: ControlsPanel + KnobRow + TopBar

**Files:**

- Create: `src/app/components/ControlsPanel.vue`, `src/app/components/KnobRow.vue`, `src/app/components/TopBar.vue`
- Modify: `src/app/App.vue`

**Interfaces:**

- Consumes: `SCHEMA`, `STYLE_GROUPS`, `knobList`; store `knob/setKnob/revertKnob/snapshot`, `activeGroups`.
- Produces: fully bound controls column. `KnobRow` props: `{ group: string, path: string }` — it reads everything else from store + schema.

- [ ] **Step 1: KnobRow.vue**

One row per leaf, from schema `kind`:

- `number` → shadcn Slider (min/max/step) + synced number Input; default shown as a tick on the track (absolute-positioned marker at `(default-min)/(max-min)*100%`) and ghost text placeholder.
- `levelPair` (`"14%,86%"`) → two number inputs 0–100 (%), serialize `` `${lo}%,${hi}%` ``; `sigmoidal` (`"7x50%"`) → strength 1–20 + midpoint 0–100%, serialize `` `${s}x${m}%` ``; `rangePair` → dual-thumb Slider; `enum` → Select; `text`/`colorPair` → Input.
- Label + info Tooltip (schema `description`); tier Badge (`inherited` grey / `type` blue / `image` solid) from `knob().tier` — show `inherited` for global; coral dirty dot when `knob().dirty`; ↺ revert Button calling `revertKnob` (visible when tier === "image").
- Gesture coalescing: `@pointerdown`/focus on any input → `store.snapshot()`; value changes during drag call `setKnob` directly (live preview) without snapshots.

- [ ] **Step 2: ControlsPanel.vue**

One Collapsible per schema group in fixed order. Groups in `store.activeGroups`: expanded, normal. Others: collapsed, 50% opacity, header suffix `not used by <style>` — still openable (deliberate: you can pre-tune). Renders `KnobRow` per `knobList(group)` entry.

- [ ] **Step 3: TopBar.vue**

Entry slug heading; style RadioGroup filtered by `applicableStyles(entry, null, resolved.effective)` (browser-safe import from `render.mjs`? **No** — `render.mjs` imports magick. Copy `applicableStyles` into `schema.mjs` in this step and re-export from `render.mjs` to keep one implementation); seed Input + 🎲 reroll (random word via `Math.random().toString(36).slice(2, 8)`); accent Select (`teal`/`coral`); global Ctrl+Z listener → `store.undo()`.

- [ ] **Step 4: Verify + typecheck**

`pnpm dev`: tune `dither.pixelate` on a tuned entry — slider moves, dirty dot appears, tier flips to `image`, preview updates, revert restores, Ctrl+Z steps back per gesture. `pnpm typecheck && pnpm test` green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: schema-driven controls with tier chips, dirty dots, undo"
```

---

### Task 7: SaveBar + Presets

**Files:**

- Create: `src/app/components/SaveBar.vue`, `src/app/components/PresetsMenu.vue`
- Modify: `src/app/App.vue`; `src/app/stores/studio.ts` (preset actions + tests)

**Interfaces:**

- Consumes: `store.diff`, `store.save()`, `/api/save`.
- Produces: store actions `savePreset(typeName)` (copies active entry's image-tier setting groups into `illustration.types[typeName]`), `applyPreset(typeName)` (sets `images[slug].type = typeName`), `presetNames` getter. Storage stays `illustration.json → types` — no new format.

- [ ] **Step 1: Write failing preset tests** (append to `studio.test.ts`)

```ts
test("savePreset copies image-tier groups to types; applyPreset links entry", async () => {
  const s = useStudio();
  await s.load();
  s.activeSlug = "s1";
  s.setKnob("dither", "pixelate", 60);
  s.savePreset("chunky");
  expect(s.illustration.types.chunky).toEqual({ dither: { pixelate: 60 } });
  s.applyPreset("chunky");
  expect(s.illustration.images.s1.type).toBe("chunky");
});
```

Run — FAIL. Implement `savePreset` (copy all NON-reserved keys of `images[slug]` into `types[name]`, deep-cloned), `applyPreset`, `presetNames`. Run — PASS.

- [ ] **Step 2: SaveBar.vue**

Sticky bottom bar. Left: dirty count (`store.diff.length` + crops dirty). Middle: Collapsible diff list — one monospace line per entry, exactly `dither.pixelate: 4 → 6` format from `store.diff`. Right: "Save" Button (disabled when clean) → `store.save()`; success toast, error toast with server message. Unsaved-changes `beforeunload` guard.

- [ ] **Step 3: PresetsMenu.vue**

In TopBar: type Select (from `presetNames`, applies on change) + "save as preset…" Dialog (name input → `savePreset`). Compare view: Dialog listing the preset's leaves vs current values (reuse diff-line format).

- [ ] **Step 4: Verify end-to-end save**

`pnpm dev`: edit two knobs → diff shows both lines → Save → `git -C . diff data/illustration.json` shows exactly those leaves changed; reload page → values persist, clean state.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: save bar with diff preview + presets over type tier"
```

---

### Task 8: MeshPanel — blob editor + materialization

**Files:**

- Create: `src/app/components/MeshPanel.vue`
- Modify: `src/app/components/PreviewStage.vue` (drag handles), `src/app/stores/studio.ts` (blob actions + tests)

**Interfaces:**

- Consumes: `generateBlobs(seed, cfg)` (mesh.mjs), Plan-1 Task-6 resolve semantics (`effective.mesh.blobs` = materialized, `settings.mesh.*` = cfg).
- Produces: store actions `materializeBlobs()` (writes current `generateBlobs` output to `images[slug].mesh.blobs`), `updateBlob(i, patch)`, `addBlob()`, `removeBlob(i)`, `clearBlobs()` (back-to-seed: deletes `mesh.blobs` key only, keeps mesh cfg overrides); getter `blobsMaterialized: boolean`.

- [ ] **Step 1: Failing store tests** (append)

```ts
test("materialize / edit / back-to-seed", async () => {
  const s = useStudio();
  await s.load();
  s.activeSlug = "s1";
  expect(s.blobsMaterialized).toBe(false);
  s.materializeBlobs();
  expect(s.blobsMaterialized).toBe(true);
  const n = s.illustration.images.s1.mesh.blobs.length;
  s.updateBlob(0, { cx: 500 });
  expect(s.illustration.images.s1.mesh.blobs[0].cx).toBe(500);
  s.addBlob();
  s.removeBlob(0);
  expect(s.illustration.images.s1.mesh.blobs.length).toBe(n);
  s.clearBlobs();
  expect(s.blobsMaterialized).toBe(false);
});
```

Implement: `materializeBlobs` calls `generateBlobs(`${resolved.effective.seed}:${resolved.effective.settings.onMesh.theme}`, resolved.effective.settings.mesh)` — the EXACT seed-string format from `styles.mjs` line 58 (`` `${eff.seed}:${theme}` ``), so materialized blobs equal what the seed was already producing. `addBlob` pushes `{ cx: 500, cy: 315, rx: 200, ry: 200, rot: 0, op: 0.1, fill: "tint" }`. Run — PASS.

- [ ] **Step 2: MeshPanel.vue**

Inside ControlsPanel's mesh group (replaces bare KnobRows for `blobs` count when materialized): cfg knobs (blur, radius, opacities, grain, viewBox) stay KnobRows; below them — seed row (input + reroll, disabled when materialized), theme toggle, Badge `manual blobs — seed inactive` when `blobsMaterialized`, per-blob rows (index swatch, rx/ry sliders, rot slider −90…90, opacity slider, fill toggle tint/accent, delete), "add blob", "back to seed" Button with confirm Dialog ("Discards N manual blobs. The seed takes over again.").

- [ ] **Step 3: Drag on preview**

In PreviewStage mesh SVG: when materialized, render each blob with a center handle; pointer drag updates `cx/cy` via `updateBlob` (scale pointer coords by `viewBox/rendered-px`); `snapshot()` on pointerdown, live update during drag (port capture behavior from blog `studio/fx.mjs` blob-drag code, including pointer capture so fast drags don't drop).

- [ ] **Step 4: Verify**

`pnpm dev` on `adding-likes-to-a-static-astro-site` (has 4 materialized blobs): rows appear, badge shown, drag works, back-to-seed confirms then regenerates from seed. `pnpm test` green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: mesh editor — blob rows, preview drag, explicit materialization"
```

---

### Task 9: CropTab + RunDrawer (job runner)

**Files:**

- Create: `src/app/components/CropTab.vue`, `src/app/components/RunDrawer.vue`, `src/server/jobs.ts`
- Modify: `src/server/api.ts` (implement `/api/job`), `src/app/App.vue` (Tabs: Effects / Crop in controls column; Run drawer trigger in top bar)

**Interfaces:**

- Consumes: blog `studio/crop.mjs` (focal-point UI — full behavior port), blog `studio.mjs` job runner + `studio/run.mjs` (progress panel), Plan-1 `src/cli/render.mjs`.
- Produces: `POST /api/job { styles?, sizes?, slugs? }` → spawns ONE batch render child process (reject 409 if running); `GET /api/job` → `{ running, done, total, current, log: string[], error? }`. Port the crash guards from blog `studio.mjs` (child-error listener, unhandled-rejection guard around job setup — the fixes from commits 0c874cb/488d131).

- [ ] **Step 1: jobs.ts + /api/job**

Port the job-runner section of `studio.mjs`: single-job lock, `child_process.spawn("node", ["src/cli/render.mjs", ...flags])`, line-parse stdout for progress (`done/total/current`), ring-buffer last 200 log lines, `error` on non-zero exit. Wire into `api.ts` replacing the 501 stubs.

Test (append to `api.test.mjs`): job lock returns 409 shape — call the exported `startJob()` twice with a stub spawner, expect second → `{ error: "job already running" }`.

- [ ] **Step 2: CropTab.vue**

Port `studio/crop.mjs` behavior as-is (design: "behavior ported as-is"): per-size focal point picker — image with draggable focal marker, size selector, crop-box overlay from `resolveCrop`/`cropBox` (geometry.mjs, browser-safe), writes into `store.crops[slug]`, dirty flows through the same SaveBar. Read the blog file top-to-bottom first and reproduce each interaction (click-to-set focal, drag, per-size override list, reset) — do not redesign.

- [ ] **Step 3: RunDrawer.vue**

Port `studio/run.mjs` behavior: style/size checkboxes, "changed entries only" toggle (slugs filter), Run button → `postJob`, Progress bar + live log (poll `getJob` every 1s while running), error state shows stderr tail. Manifest freshness in EntryRail refreshes after a job completes (re-fetch `/api/data`).

- [ ] **Step 4: Verify full studio**

`pnpm dev`:

- Crop: move focal point on a tuned entry, save, `data/crops.json` diff shows it.
- Run: launch thumb-size render of one slug; progress advances; second launch during run is rejected with toast; rail badge clears after completion.
- `pnpm test && pnpm typecheck` green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: crop tab + batch run drawer with job runner"
```

---

## Exit criteria (plan 2)

- `pnpm dev` = full studio: fx knobs, mesh editor, crop, run — the design §3 state model demonstrably working (tier chips, dirty dots, diff save bar, undo, staleness indicators, preset save/apply).
- `pnpm test` green (pipeline 32 + validate + schema completeness + store/preset/mesh + api guards).
- `pnpm typecheck` clean.
- Design §7 exit criterion 1 satisfied.
