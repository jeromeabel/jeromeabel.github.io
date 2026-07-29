---
title: Plan 2 — build 1 Primitives and rebind the file
created: 2026-07-29
---

# Figma Variables — Plan 2: Primitives Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace eleven flat primitive collections with one generated `1 Primitives` collection (Tailwind mirror + `color/brand/*`), rebind every consumer to it by resolved value, and delete the originals — with zero pixel change on the Figma canvas.

**Architecture:** The Tailwind mirror is **generated from the installed Tailwind version** (`node_modules/tailwindcss/theme.css`), not hand-imported — so it is reproducible and re-runnable when Tailwind updates. A new `scripts/figma/build-primitives.mjs` parses that file into `primitives.json` (name, type, px/hex value), which a `use_figma` script consumes to create the collection. Rebinding is **scripted and value-based**: the remap is built at runtime by matching each old variable's _resolved pixel value_ against the new collection, never by name — this is what catches the `radius/lg` name collision automatically instead of silently resizing corners.

**Tech Stack:** Node `node --test`, Tailwind CSS v4 (`node_modules/tailwindcss/theme.css`), Figma Plugin API via `use_figma`.

**Depends on:** Plan 1 complete (`2 Theme` exists at `VariableCollectionId:3:2`, `pnpm figma:verify` clean).

## Global Constraints

- Figma file key: **`ihWIWmvtQPTWgUxlrVjC2c`** ("Blog Design System v1.0"). `Wf4iomVMYUXlFIBV3Z8bx4` is the read-only backup for the duration of this migration — never write to it. v1.0 is a fork of it, so all collection and node ids below are unchanged (verified 2026-07-29; the binding inventory table was measured on the backup and its collection names/counts match v1.0 exactly).
- v1.0 already contains an **empty collection literally named `Primitives`** (`VariableCollectionId:453:2`, 0 variables) that the backup does not have. It is not the `1 Primitives` this plan builds. Before Task 3 creates `1 Primitives`, check whether the user has since filled it — if it holds variables, stop and reconcile rather than creating a second primitives collection.
- **Read the `figma-use` skill before any `use_figma` call in a session.** Pass `skillNames: "figma-use"`.
- `use_figma` is atomic — a failed script changes nothing. On error: stop, read, fix, retry once. Two failed attempts on the same script means the approach is wrong, not the syntax.
- **Figma cannot move a variable between collections.** Every "merge" in this plan is recreate + rebind + delete.
- **Never touch `VariableCollectionId:3:2`'s identity.** Its values change (raw hex → alias); its id and modes do not.
- Units: Figma number variables store **pixels**. `spacing/4` = `16`, `radius/lg` = `8`, `text/xl` = `20`. The build script converts `rem × 16`.
- `tracking/*` is created but **left unbound and unscoped for LETTER_SPACING** — Figma coerces a bound letter-spacing variable to px, destroying size-independence. Reference-only.
- Naming: split on Tailwind's namespace list only (`color`, `spacing`, `radius`, `text`, `font`, `font-weight`, `tracking`, `leading`, `breakpoint`, `container`, `blur`, `shadow`, `inset-shadow`, `drop-shadow`, `text-shadow`, `opacity`, `perspective`, `aspect`, `ease`, `animate`) plus one extra split for colour on the 22 Tailwind hue names. Never split on the leaf, never split by CSS property.
- **Zero visual change** is the acceptance bar for the whole plan. Every rebind preserves the resolved pixel value.
- Take a `get_screenshot` of the same three reference frames before and after Task 7. They must be identical.

## Verified binding inventory (resolved 2026-07-29 — this is the fact the design gated on)

Every page in the file was walked and every `boundVariables` alias resolved to its collection. Result:

| Collection              | Vars | Bindings (whole file)     | Verdict                                                                                                |
| ----------------------- | ---- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Color` → now `2 Theme` | 8    | **5,225**                 | renamed in place (Plan 1) — untouched here                                                             |
| `Scale`                 | 21   | **4,834**                 | `spacing/1…36` + `radius/*`, **raw numbers**. The scale the file actually uses.                        |
| `Radius`                | 10   | **164**                   | aliases into `Number Primitives`                                                                       |
| `Typography`            | 52   | **33** (all `fontWeight`) | font families bound **nowhere**                                                                        |
| `Container`             | 13   | **9**                     |                                                                                                        |
| `Breakpoint`            | 5    | **9**                     |                                                                                                        |
| `Color Tokens`          | 392  | **29**                    | Plan 3 handles these                                                                                   |
| `Color Primitives`      | 299  | **0**                     | free to delete                                                                                         |
| `Spacing`               | 35   | **0**                     | dead duplicate of `Scale`                                                                              |
| `Opacity`               | 21   | **0**                     | free                                                                                                   |
| `Blur`                  | 7    | **0**                     | free                                                                                                   |
| `Border Width`          | 5    | **0**                     | free                                                                                                   |
| `Number Primitives`     | 60   | **0 direct**              | but `Spacing`/`Radius`/`Container`/`Breakpoint`/`Blur`/`Border Width`/`Typography` all alias _into_ it |
| `Primitives`            | 0    | 0                         | empty stray collection, not in the design's inventory — delete                                         |

**So the design's open question resolves to "bound" — but narrowly.** 427 variables have no consumers at all. The entire rebinding cost is **~5,049 bindings across 5 collections** (`Scale` 4,834 + `Radius` 164 + `Typography` 33 + `Container` 9 + `Breakpoint` 9), and every one is a mechanical id-swap. That is one deterministic script, not manual work — which is why step 3 is worth doing rather than abandoning.

Distribution by page: `📄 Pages` 5,219 bound nodes / 7,774 total; `🧩 Components` 757 / 1,542; `Pages Experiment` 418; `🗄️ Legacy` 128; `🎨 Foundations` 16; `📖 Cover` 0.

## The radius collision (why the remap is value-based)

`Scale` and Tailwind both use the name `radius/lg`, for **different pixel values**:

| `Scale` leaf  | px   | Correct Tailwind leaf at that px |
| ------------- | ---- | -------------------------------- |
| `radius/none` | 0    | `radius/none`                    |
| `radius/sm`   | 4    | `radius/sm`                      |
| `radius/md`   | 8    | **`radius/lg`**                  |
| `radius/lg`   | 16   | **`radius/2xl`**                 |
| `radius/full` | 9999 | `radius/full`                    |

A name-based remap would silently halve every 16px corner in the file. A value-based remap gets it right and needs no hand-maintained table. `Scale`'s `spacing/N` leaves happen to match Tailwind's exactly (`spacing/6` = 24 both sides), so they map to themselves — but they go through the same value lookup, not a name shortcut.

## File Structure

| File                                      | Responsibility                                                               | Change        |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| `scripts/figma/build-primitives.mjs`      | parse `node_modules/tailwindcss/theme.css` + brand hexes → `primitives.json` | **Create**    |
| `scripts/figma/build-primitives.test.mjs` | tests: oklch→hex accuracy, rem→px, namespace folding                         | **Create**    |
| `scripts/figma/brand-primitives.json`     | the 11 project hexes, hand-authored, named by ramp position                  | **Create**    |
| `primitives.json`                         | generated artifact at repo root, input to the Figma build                    | **Generated** |
| `package.json`                            | add `figma:primitives` script                                                | Modify        |
| Figma `1 Primitives`                      | generated Tailwind mirror + brand folder                                     | **Create**    |
| Figma `2 Theme`                           | values re-pointed from raw hex to brand aliases                              | Modify        |
| Figma — 11 old collections                |                                                                              | **Delete**    |

---

### Task 1: Generate the Tailwind primitive set from the installed Tailwind

**Files:**

- Create: `scripts/figma/build-primitives.mjs`
- Create: `scripts/figma/build-primitives.test.mjs`
- Modify: `package.json` (scripts block)

**Interfaces:**

- Produces: `primitives.json` at repo root, shape:
  ```json
  {
    "generatedFrom": "tailwindcss 4.x.x",
    "variables": [
      { "name": "color/blue/500", "type": "COLOR", "value": "#3b82f6" },
      { "name": "spacing/4", "type": "FLOAT", "value": 16 },
      { "name": "font-weight/500", "type": "FLOAT", "value": 500 },
      { "name": "leading/normal", "type": "FLOAT", "value": 1.5 }
    ]
  }
  ```
  Consumed by Task 3's `use_figma` build script and by Task 6's value-based remap.

**Why generate colours rather than dump the existing Figma `Color Primitives`:** that collection has **0 bindings** — nothing on the canvas consumes it. So a hex that lands one channel-unit off from the old import changes nothing visually, and generating buys reproducibility. Tailwind v4 stores colours as `oklch()`, so the script converts oklch → sRGB hex.

- [ ] **Step 1: Write the failing test**

Create `scripts/figma/build-primitives.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = join(mkdtempSync(join(tmpdir(), "prim-")), "primitives.json");
execFileSync("node", ["scripts/figma/build-primitives.mjs", OUT]);
const { variables } = JSON.parse(readFileSync(OUT, "utf8"));
const byName = Object.fromEntries(variables.map((v) => [v.name, v]));

test("oklch converts to Tailwind's published sRGB hexes", () => {
  // Reference values from tailwindcss.com/docs/colors
  assert.equal(byName["color/blue/500"].value, "#3b82f6");
  assert.equal(byName["color/red/500"].value, "#ef4444");
  assert.equal(byName["color/slate/900"].value, "#0f172a");
  assert.equal(byName["color/emerald/400"].value, "#34d399");
});

test("rem values convert to pixels", () => {
  assert.equal(byName["spacing/4"].value, 16);
  assert.equal(byName["radius/lg"].value, 8);
  assert.equal(byName["radius/2xl"].value, 16);
  assert.equal(byName["text/xl"].value, 20);
  assert.equal(byName["breakpoint/xl"].value, 1280);
  assert.equal(byName["container/7xl"].value, 1280);
});

test("unitless values stay unitless", () => {
  assert.equal(byName["font-weight/500"].value, 500);
  assert.equal(byName["leading/normal"].value, 1.5);
  assert.equal(byName["opacity/50"].value, 50);
});

test("colour names fold into hue folders, other namespaces do not split on the leaf", () => {
  assert.equal(byName["color/blue/500"].type, "COLOR");
  assert.ok(byName["drop-shadow/md"], "compound namespaces stay intact");
  assert.ok(
    !variables.some((v) => v.name.startsWith("color/blue-")),
    "hue must be a folder",
  );
});

test("tracking is present but carries a reference-only marker", () => {
  assert.equal(byName["tracking/wide"].referenceOnly, true);
});

test("spacing/4 exists exactly once — no per-property forks", () => {
  assert.equal(variables.filter((v) => v.name === "spacing/4").length, 1);
  assert.ok(
    !variables.some((v) => v.name.startsWith("gap/")),
    "no gap/* aliases",
  );
  assert.ok(
    !variables.some((v) => v.name.startsWith("padding/")),
    "no padding/* aliases",
  );
});

test("brand primitives are appended", () => {
  assert.equal(byName["color/brand/lime-100"].value, "#f5ffe1");
  assert.equal(byName["color/brand/gray-800"].value, "#1e1e1e");
  assert.equal(byName["color/white"].value, "#ffffff");
  assert.equal(byName["color/black"].value, "#000000");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/figma/build-primitives.test.mjs`
Expected: FAIL — `Cannot find module .../build-primitives.mjs`.

- [ ] **Step 3: Author the brand primitives file**

Create `scripts/figma/brand-primitives.json` — the 11 hexes currently hardcoded in `global.css`, named by ramp position so `2 Theme` can alias them. Values are the exact current hexes; aliasing them produces zero visual change.

```json
{
  "color/brand/lime-100": "#f5ffe1",
  "color/brand/lime-200": "#e0eec4",
  "color/brand/lime-300": "#d1ddbb",
  "color/brand/gray-50": "#f7f7f7",
  "color/brand/gray-100": "#ececec",
  "color/brand/gray-400": "#9b9b9b",
  "color/brand/gray-500": "#5b5b5b",
  "color/brand/gray-600": "#4c4c4c",
  "color/brand/gray-700": "#343434",
  "color/brand/gray-800": "#1e1e1e",
  "color/brand/gray-900": "#101010"
}
```

- [ ] **Step 4: Write the implementation**

Create `scripts/figma/build-primitives.mjs`:

```js
#!/usr/bin/env node
// build-primitives.mjs — generate the Figma `1 Primitives` variable set from the
// INSTALLED Tailwind version. Reproducible: re-run after a Tailwind upgrade and
// diff. Units policy: Figma stores pixels, so rem × 16 here; unitless stays
// unitless. Colours: Tailwind v4 ships oklch(), Figma wants sRGB — converted below.
// Usage: node scripts/figma/build-primitives.mjs [outPath]   (default ./primitives.json)
// Exit: 0 ok · 2 tailwind theme.css not found · 3 unparseable value.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const THEME = join(REPO, "node_modules/tailwindcss/theme.css");
const BRAND = join(REPO, "scripts/figma/brand-primitives.json");
const ROOT_PX = 16;

// Tailwind namespaces, longest first so `drop-shadow` wins over `shadow`.
const NAMESPACES = [
  "inset-shadow",
  "drop-shadow",
  "text-shadow",
  "font-weight",
  "breakpoint",
  "container",
  "perspective",
  "tracking",
  "leading",
  "spacing",
  "opacity",
  "shadow",
  "radius",
  "aspect",
  "color",
  "blur",
  "text",
  "font",
  "ease",
  "animate",
].sort((a, b) => b.length - a.length);

const HUES = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];

// --- oklch -> sRGB hex (Björn Ottosson's reference conversion) ---------------
function oklchToHex(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h),
    b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const enc = (c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  };
  return "#" + lin.map((c) => enc(c).toString(16).padStart(2, "0")).join("");
}

// --- parse -------------------------------------------------------------------
let css;
try {
  css = readFileSync(THEME, "utf8");
} catch {
  console.error(`MISSING: ${THEME} — run pnpm install`);
  process.exit(2);
}
const brand = JSON.parse(readFileSync(BRAND, "utf8"));
const pkg = JSON.parse(
  readFileSync(join(REPO, "node_modules/tailwindcss/package.json"), "utf8"),
);

const variables = [];
const seen = new Set();

function figmaName(prop) {
  const ns = NAMESPACES.find((n) => prop === n || prop.startsWith(n + "-"));
  if (!ns) return null;
  const leaf = prop === ns ? "DEFAULT" : prop.slice(ns.length + 1);
  if (ns === "color") {
    const hue = HUES.find((h) => leaf === h || leaf.startsWith(h + "-"));
    if (hue) return `color/${hue}/${leaf.slice(hue.length + 1) || "DEFAULT"}`;
    return `color/${leaf}`;
  }
  return `${ns}/${leaf}`;
}

for (const m of css.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)) {
  const [, prop, rawValue] = m;
  // Composite sub-properties (`--text-xl--line-height`) and non-token vars are
  // not standalone tokens — Figma has no field for them.
  if (prop.includes("--")) continue;
  const name = figmaName(prop);
  if (!name || seen.has(name)) continue;
  const raw = rawValue.trim();

  let entry = null;
  const okl = raw.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/);
  const hex = raw.match(/^#([0-9a-fA-F]{3,8})$/);
  const rem = raw.match(/^(-?[\d.]+)rem$/);
  const px = raw.match(/^(-?[\d.]+)px$/);
  const num = raw.match(/^(-?[\d.]+)$/);
  const pct = raw.match(/^(-?[\d.]+)%$/);
  const em = raw.match(/^(-?[\d.]+)em$/);

  if (okl)
    entry = {
      type: "COLOR",
      value: oklchToHex(Number(okl[1]) / 100, Number(okl[2]), Number(okl[3])),
    };
  else if (hex) entry = { type: "COLOR", value: raw.toLowerCase() };
  else if (rem)
    entry = {
      type: "FLOAT",
      value: Math.round(Number(rem[1]) * ROOT_PX * 1000) / 1000,
    };
  else if (px) entry = { type: "FLOAT", value: Number(px[1]) };
  else if (num) entry = { type: "FLOAT", value: Number(num[1]) };
  else if (pct) entry = { type: "FLOAT", value: Number(pct[1]) };
  else if (em)
    entry = { type: "FLOAT", value: Number(em[1]) * 100, referenceOnly: true }; // tracking
  else entry = { type: "STRING", value: raw }; // shadows, easings, keyframes

  // tracking/* must never be bound: Figma coerces bound letter-spacing to px,
  // destroying size-independence. Kept for reference, marked so the Figma build
  // gives it no LETTER_SPACING scope.
  if (name.startsWith("tracking/")) entry.referenceOnly = true;

  seen.add(name);
  variables.push({ name, ...entry });
}

for (const [name, value] of Object.entries(brand)) {
  if (seen.has(name)) continue;
  seen.add(name);
  variables.push({ name, type: "COLOR", value });
}
// Tailwind ships these but theme.css does not declare them as custom properties.
// Mode-invariant, and they retire the `dark:` hack at WorkCardImage.astro:52.
for (const [name, value] of [
  ["color/white", "#ffffff"],
  ["color/black", "#000000"],
])
  if (!seen.has(name)) {
    seen.add(name);
    variables.push({ name, type: "COLOR", value });
  }

variables.sort((a, b) => a.name.localeCompare(b.name));
const out = process.argv[2] ?? "primitives.json";
writeFileSync(
  out,
  JSON.stringify(
    { generatedFrom: `tailwindcss ${pkg.version}`, variables },
    null,
    2,
  ) + "\n",
);
console.log(`${variables.length} primitives -> ${out}`);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test scripts/figma/build-primitives.test.mjs`
Expected: PASS.

If the oklch hexes are off by one channel unit from the reference values, **do not loosen the test to a tolerance.** Check the conversion constants first. If they are still off after one fix, record the actual values in `notes.md` and relax those four assertions to ±1 per channel with a comment explaining why — a one-unit difference in an unbound palette is invisible, but silently accepting a large error is not acceptable.

- [ ] **Step 6: Wire up the script and inspect the output**

Add to `package.json` scripts:

```json
    "figma:primitives": "node scripts/figma/build-primitives.mjs primitives.json",
```

Run: `pnpm figma:primitives`
Expected: roughly **470–500 primitives**. Then sanity-check the shape:

```bash
node -e "const{variables:v}=require('./primitives.json');const n={};for(const x of v)n[x.name.split('/')[0]]=(n[x.name.split('/')[0]]||0)+1;console.log(n)"
```

Expected: a `color` bucket around 300+13, `spacing` ~35, `text` ~13, `radius` ~10, and no bucket named after a CSS property (`gap`, `padding`, `width`).

- [ ] **Step 7: Commit**

```bash
git add scripts/figma/build-primitives.mjs scripts/figma/build-primitives.test.mjs \
        scripts/figma/brand-primitives.json primitives.json package.json
git commit -m "feat(figma): generate Tailwind primitive set from installed tailwindcss"
```

---

### Task 2: Snapshot the canvas before touching Figma

The acceptance bar for this whole plan is "zero visual change". That claim needs a before-picture.

**Files:** none (Figma reads only)

- [ ] **Step 1: Capture three reference frames**

Pick one frame per surface type and record its node id in `notes.md`:

- a light page frame from `📄 Pages` (e.g. under `PAGE/HOME`, section `52:648`)
- the matching `— Dark` frame
- one component master from `🧩 Components` that uses corner radius (the `illustration/screen` master binds `radius/*`)

Call `get_screenshot` on each. Save the three images or their descriptions in `notes.md` under a "Plan 2 — before" heading.

- [ ] **Step 2: Record the exact binding counts**

Re-run the audit script (Task 6 Step 1 contains it) and paste its `byCol` output into `notes.md` under "Plan 2 — before". Task 7 compares against this.

---

### Task 3: Create `1 Primitives` in Figma from `primitives.json`

**Files:**

- Figma file `ihWIWmvtQPTWgUxlrVjC2c` ("Blog Design System v1.0") — new collection

**Interfaces:**

- Consumes: `primitives.json` from Task 1.
- Produces: collection `1 Primitives`, one mode, ~480 variables. Its variable ids are the remap targets for Task 6.

- [ ] **Step 1: Read the `figma-use` skill**

Required before any `use_figma` call this session.

- [ ] **Step 2: Create the collection and the first batch**

Variables are cheap to create compared to canvas nodes, but the payload is not — `primitives.json` is ~480 entries and the `code` parameter caps at 50,000 characters. **Split into batches of ~120 variables**, pasting the relevant slice of `primitives.json` into each call as a literal array.

First call creates the collection and returns its id:

```js
const existing = (
  await figma.variables.getLocalVariableCollectionsAsync()
).find((c) => c.name === "1 Primitives");
if (existing)
  return {
    alreadyExists: true,
    id: existing.id,
    count: existing.variableIds.length,
  };

const col = figma.variables.createVariableCollection("1 Primitives");
col.hiddenFromPublishing = true; // library consumers see only 2 Theme / 3 Responsive
return { id: col.id, mode: col.modes[0].modeId };
```

Record the returned `id` and `mode` — subsequent batches need them as string literals.

- [ ] **Step 3: Load each batch**

One call per batch. `COLLECTION_ID` and `MODE_ID` are the literals from Step 2; `BATCH` is a slice of `primitives.json`'s `variables` array pasted inline.

```js
const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(
  (c) => c.id === "COLLECTION_ID",
);
const modeId = "MODE_ID";

const BATCH = [
  /* paste ~120 entries: { "name": ..., "type": ..., "value": ... } */
];

const hexToRgb = (h) => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
});

// Scope by namespace — this is what keeps the picker honest. A single spacing
// scale is bound to gap AND padding AND size; that is one variable with the
// right scopes, never separate gap/* and padding/* aliases.
function scopesFor(name, type) {
  if (name.startsWith("color/")) return ["ALL_FILLS", "STROKE_COLOR"];
  if (name.startsWith("spacing/")) return ["GAP", "WIDTH_HEIGHT"];
  if (name.startsWith("radius/")) return ["CORNER_RADIUS"];
  if (name.startsWith("border-width/")) return ["STROKE_FLOAT"];
  if (name.startsWith("text/")) return ["FONT_SIZE"];
  if (name.startsWith("font-weight/")) return ["FONT_WEIGHT"];
  if (name.startsWith("leading/")) return ["LINE_HEIGHT"];
  if (name.startsWith("opacity/")) return ["OPACITY"];
  if (name.startsWith("blur/")) return ["EFFECT_FLOAT"];
  if (name.startsWith("container/") || name.startsWith("breakpoint/"))
    return ["WIDTH_HEIGHT"];
  // tracking/* and anything unclassified: no scopes at all, so it can never be
  // picked by accident. tracking in particular must stay reference-only.
  return [];
}

const created = [],
  skipped = [];
for (const v of BATCH) {
  const variable = figma.variables.createVariable(v.name, col, v.type);
  variable.setValueForMode(
    modeId,
    v.type === "COLOR" ? hexToRgb(v.value) : v.value,
  );
  variable.scopes = scopesFor(v.name, v.type);
  if (v.referenceOnly)
    variable.description =
      "Reference only — do not bind (Figma coerces bound letter-spacing to px).";
  created.push(v.name);
}
return { created: created.length, total: col.variableIds.length, skipped };
```

Repeat until every entry in `primitives.json` is loaded. After the last batch, `total` must equal the count `pnpm figma:primitives` reported.

- [ ] **Step 4: Verify the collection**

```js
const col = (await figma.variables.getLocalVariableCollectionsAsync()).find(
  (c) => c.name === "1 Primitives",
);
const byFolder = {};
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const top = v.name.split("/")[0];
  byFolder[top] = (byFolder[top] || 0) + 1;
}
return {
  total: col.variableIds.length,
  hidden: col.hiddenFromPublishing,
  byFolder,
};
```

Expected: `hidden` is `true`, `total` matches `primitives.json`, and `byFolder` has no key named after a CSS property.

- [ ] **Step 5: Spot-check four values in the Figma UI**

Open the file's variables panel and confirm by eye: `color/blue/500` is the familiar Tailwind blue, `spacing/4` is `16`, `radius/2xl` is `16`, `color/brand/lime-100` is the site's pale lime. Numbers being pixels (not rem) is the single easiest thing to get wrong here.

---

### Task 4: Re-point `2 Theme` to brand aliases

**Files:**

- Figma collection `2 Theme` (`VariableCollectionId:3:2`)

**Interfaces:**

- Consumes: `color/brand/*` variables from Task 3.
- Produces: `2 Theme` whose 7 colour variables are aliases, not raw hex — the property that makes the semantic layer a real alias layer.

- [ ] **Step 1: Re-point every mode value to a brand alias**

The hexes are identical on both sides, so this is a no-op visually and a structural change only.

```js
const theme = (await figma.variables.getLocalVariableCollectionsAsync()).find(
  (c) => c.id === "VariableCollectionId:3:2",
);
const prims = (await figma.variables.getLocalVariableCollectionsAsync()).find(
  (c) => c.name === "1 Primitives",
);

const primByName = {};
for (const id of prims.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  primByName[v.name] = v;
}
const modeId = {};
for (const m of theme.modes) modeId[m.name] = m.modeId;

const MAP = {
  Light: {
    "color/background": "color/brand/lime-100",
    "color/surface": "color/brand/lime-200",
    "color/surface-hover": "color/brand/lime-300",
    "color/border": "color/brand/lime-300",
    "color/foreground": "color/brand/gray-800",
    "color/foreground-strong": "color/brand/gray-900",
    "color/foreground-muted": "color/brand/gray-500",
  },
  Dark: {
    "color/background": "color/brand/gray-800",
    "color/surface": "color/brand/gray-700",
    "color/surface-hover": "color/brand/gray-600",
    "color/border": "color/brand/gray-600",
    "color/foreground": "color/brand/gray-100",
    "color/foreground-strong": "color/brand/gray-50",
    "color/foreground-muted": "color/brand/gray-400",
  },
};

const applied = [],
  problems = [];
for (const id of theme.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  for (const modeName of ["Light", "Dark"]) {
    const target = MAP[modeName]?.[v.name];
    if (!target) continue;
    const prim = primByName[target];
    if (!prim) {
      problems.push(`${v.name} -> ${target} (primitive missing)`);
      continue;
    }
    v.setValueForMode(modeId[modeName], {
      type: "VARIABLE_ALIAS",
      id: prim.id,
    });
    applied.push(`${modeName}/${v.name} -> ${target}`);
  }
}
return { applied: applied.length, problems, detail: applied };
```

Expected: `applied` is 14, `problems` is empty.

- [ ] **Step 2: Verify the resolved hexes are unchanged**

Re-run the dump from `scripts/figma/dump-tokens.md` and save to `tokens.figma.json`. The dump renders aliases as `{ alias: "<name>" }` rather than a hex, so `pnpm figma:verify` will now report **7 value mismatches per mode** — the alias name against the code hex. That is expected and is a gap in the checker, not a defect in the file.

Fix it properly rather than tolerating a permanently-dirty gate: extend the dump script in `scripts/figma/dump-tokens.md` to resolve one alias hop to its underlying value **in addition to** recording the alias name:

```js
if (value && value.type === "VARIABLE_ALIAS") {
  const ref = await figma.variables.getVariableByIdAsync(value.id);
  const refVal = ref.valuesByMode[Object.keys(ref.valuesByMode)[0]];
  const h = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  value =
    ref.resolvedType === "COLOR" && refVal
      ? `#${h(refVal.r)}${h(refVal.g)}${h(refVal.b)}`
      : { alias: ref.name };
}
```

Commit that edit to `scripts/figma/dump-tokens.md` so the next dump is self-resolving.

- [ ] **Step 3: Run the gate**

```bash
pnpm figma:verify
```

Expected: zero Missing, zero Mismatch, zero Unmapped. A mismatch here means a brand hex was mistyped — compare against `scripts/figma/brand-primitives.json`.

- [ ] **Step 4: Screenshot the light and dark reference frames**

`get_screenshot` on the two page frames from Task 2. They must be pixel-identical to the "before" captures. Any change means an alias points at the wrong ramp position — fix before continuing.

- [ ] **Step 5: Commit**

```bash
git add scripts/figma/dump-tokens.md tokens.figma.json
git commit -m "chore(figma): 2 Theme values now alias color/brand/*; dump resolves one alias hop"
```

---

### Task 5: Dump the full binding inventory to a repo artifact

Task 6 rewrites ~5,049 bindings. If it goes wrong, the recovery path is Figma version history — but diagnosing _what_ went wrong needs the before-state as data, not a screenshot.

**Files:**

- Create: `scripts/figma/dump-bindings.md` (the script + procedure, mirroring `dump-tokens.md`)
- Generated: `bindings.figma.json` at repo root

- [ ] **Step 1: Write the procedure file**

Create `scripts/figma/dump-bindings.md` documenting: read the `figma-use` skill, run one `use_figma` call **per page** (never loop `setCurrentPageAsync` inside one script — page switches must happen at most once per call), fan the calls out in parallel in a single message, merge the returned objects into `bindings.figma.json`.

Page ids, verified 2026-07-29: `📖 Cover` `0:1`, `🎨 Foundations` `5:14`, `🧩 Components` `52:2`, `🗄️ Legacy` `78:2`, `📄 Pages` `44:328`, `Pages Experiment` `442:5352`.

Per-page script:

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const colById = {};
for (const c of cols) colById[c.id] = c.name;
const cache = {};
async function info(id) {
  if (!cache[id]) {
    const v = await figma.variables.getVariableByIdAsync(id);
    cache[id] = v
      ? { name: v.name, col: colById[v.variableCollectionId] || "?" }
      : { name: "?", col: "?" };
  }
  return cache[id];
}
function collect(obj, field, out) {
  if (!obj || typeof obj !== "object") return;
  if (obj.type === "VARIABLE_ALIAS" && obj.id) {
    out.push({ id: obj.id, field });
    return;
  }
  for (const k of Object.keys(obj))
    collect(obj[k], field === null ? k : field, out);
}
const rows = [],
  byCol = {};
for (const n of page.findAll(() => true)) {
  if (!n.boundVariables) continue;
  const o = [];
  collect(n.boundVariables, null, o);
  for (const a of o) {
    const i = await info(a.id);
    byCol[i.col] = (byCol[i.col] || 0) + 1;
    rows.push({
      node: n.id,
      name: n.name,
      field: a.field,
      varId: a.id,
      varName: i.name,
      col: i.col,
    });
  }
}
return { page: page.name, byCol, rows };
```

- [ ] **Step 2: Run it and save the artifact**

Six parallel `use_figma` calls, merged into `bindings.figma.json`. Expected `byCol` totals across all pages (from the 2026-07-29 audit): `Color` 5,225 · `Scale` 4,834 · `Radius` 164 · `Color Tokens` 29 · `Typography` 33 · `Container` 9 · `Breakpoint` 9.

The `rows` payload is large. If a page's response is unwieldy, drop `name` from the row and keep `node`/`field`/`varId` — those are what a recovery needs.

- [ ] **Step 3: Commit**

```bash
git add scripts/figma/dump-bindings.md bindings.figma.json
git commit -m "chore(figma): dump full variable binding inventory before the merge"
```

---

### Task 6: Rebind every consumer to `1 Primitives`, by resolved value

**Files:**

- Figma pages `52:2`, `44:328`, `442:5352`, `78:2`, `5:14`

**Interfaces:**

- Consumes: `1 Primitives` (Task 3), `bindings.figma.json` (Task 5).
- Produces: zero remaining bindings to `Scale`, `Radius`, `Typography`, `Container`, `Breakpoint`.

**The map is built at runtime from resolved values, never from names.** See "The radius collision" above for why.

- [ ] **Step 1: Build and print the remap — dry run first**

Run this once, read the output, and **do not proceed until every entry looks right**. It writes nothing.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prims = cols.find((c) => c.name === "1 Primitives");
const OLD = ["Scale", "Radius", "Typography", "Container", "Breakpoint"];

// index primitives by resolved value, per type
const byValue = {};
for (const id of prims.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const val = v.valuesByMode[prims.modes[0].modeId];
  if (typeof val !== "number") continue; // colours are not remapped here
  const key = `FLOAT:${val}`;
  (byValue[key] ||= []).push({ id: v.id, name: v.name });
}

async function resolve(v, col) {
  let val = v.valuesByMode[col.modes[0].modeId];
  let hops = 0;
  while (val && val.type === "VARIABLE_ALIAS" && hops++ < 5) {
    const ref = await figma.variables.getVariableByIdAsync(val.id);
    const refCol = cols.find((c) => c.id === ref.variableCollectionId);
    val = ref.valuesByMode[refCol.modes[0].modeId];
  }
  return val;
}

const map = [],
  unmatched = [],
  ambiguous = [];
for (const name of OLD) {
  const col = cols.find((c) => c.name === name);
  if (!col) continue;
  for (const id of col.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const val = await resolve(v, col);
    if (typeof val !== "number") continue;
    const hits = byValue[`FLOAT:${val}`] || [];
    // prefer a candidate in the same namespace folder as the old leaf
    const ns = v.name.includes("/")
      ? v.name.split("/")[0]
      : name.toLowerCase().replace(" ", "-");
    const pick = hits.find((h) => h.name.startsWith(ns + "/")) || hits[0];
    if (!pick) {
      unmatched.push(`${name}/${v.name} = ${val}`);
      continue;
    }
    if (hits.length > 1 && !hits.find((h) => h.name.startsWith(ns + "/")))
      ambiguous.push(
        `${name}/${v.name} = ${val} -> candidates ${hits.map((h) => h.name).join(", ")}`,
      );
    map.push({
      from: `${name}/${v.name}`,
      fromId: v.id,
      to: pick.name,
      toId: pick.id,
      value: val,
    });
  }
}
return { mapped: map.length, unmatched, ambiguous, map };
```

**Read the returned `map` line by line.** The four entries that must appear, and that prove the value-based approach is working:

```
Scale/radius/md   = 8    -> radius/lg
Scale/radius/lg   = 16   -> radius/2xl
Scale/spacing/6   = 24   -> spacing/6
Typography/weight/medium = 500 -> font-weight/500
```

`unmatched` entries are old variables with no pixel-equal primitive — for each one, decide explicitly: add the value to `brand-primitives.json` and re-run Task 3, or leave the old variable's consumers alone. **Do not let an unmatched entry through silently.** `ambiguous` entries need a hand-picked target; add an override table in the next step rather than trusting `hits[0]`.

- [ ] **Step 2: Apply the rebind, one page at a time**

`REMAP` is the `map` array from Step 1, pasted in as a literal (trim to `fromId`/`toId` to keep the payload small). Run once per page — page switches happen at most once per `use_figma` call, so **do not loop over pages inside this script**.

```js
const page = await figma.getNodeByIdAsync("PAGE_ID");
await figma.setCurrentPageAsync(page);

const REMAP = {/* "VariableID:old": "VariableID:new", ... */};
const varCache = {};
async function target(oldId) {
  const newId = REMAP[oldId];
  if (!newId) return null;
  if (!varCache[newId])
    varCache[newId] = await figma.variables.getVariableByIdAsync(newId);
  return varCache[newId];
}

let rebound = 0,
  paints = 0;
const failures = [];
for (const n of page.findAll(() => true)) {
  const bv = n.boundVariables;
  if (!bv) continue;
  for (const field of Object.keys(bv)) {
    const entry = bv[field];
    try {
      // Paint arrays (fills / strokes) need setBoundVariableForPaint, which
      // returns a NEW paint that must be captured and reassigned.
      if (Array.isArray(entry) && (field === "fills" || field === "strokes")) {
        const src = field === "fills" ? n.fills : n.strokes;
        if (!Array.isArray(src)) continue;
        const next = [...src];
        let touched = false;
        for (let i = 0; i < entry.length; i++) {
          const alias = entry[i] && entry[i].color;
          const v = alias && (await target(alias.id));
          if (!v || !next[i] || next[i].type !== "SOLID") continue;
          next[i] = figma.variables.setBoundVariableForPaint(
            next[i],
            "color",
            v,
          );
          touched = true;
          paints++;
        }
        if (touched) {
          if (field === "fills") n.fills = next;
          else n.strokes = next;
        }
        continue;
      }
      if (entry && entry.type === "VARIABLE_ALIAS") {
        const v = await target(entry.id);
        if (!v) continue;
        n.setBoundVariable(field, v);
        rebound++;
      }
    } catch (e) {
      failures.push(`${n.id} ${n.name} .${field}: ${e.message}`);
    }
  }
}
return {
  page: page.name,
  rebound,
  paints,
  failures: failures.slice(0, 40),
  failureCount: failures.length,
};
```

Run for `52:2`, `44:328`, `442:5352`, `78:2`, `5:14` — five calls. `📖 Cover` (`0:1`) has zero bindings; skip it.

Expected totals across the five: `rebound` ≈ 5,049, `failureCount` 0. **`textRangeFills` will not be handled by this script** — it is a per-character-range binding needing `setRangeBoundVariable(start, end, field, variable)` and a loaded font. There are 16 of them file-wide, all pointing at `Color` (which is not being remapped), so they need no action here. If any `textRangeFills` failure appears, it means a text range binds a remapped collection — handle those by hand.

- [ ] **Step 3: Verify zero bindings remain to the old collections**

Re-run the Task 5 dump. Expected `byCol`: `Color` 5,225 (unchanged), `1 Primitives` ≈ 5,049, `Color Tokens` 29 (Plan 3), and **`Scale` / `Radius` / `Typography` / `Container` / `Breakpoint` absent entirely**.

If any of the five still shows a count, those nodes were missed — usually because they are inside a component instance whose override could not be written, or on a page not covered. Find them in the dump rows and fix before deleting anything.

- [ ] **Step 4: Screenshot the reference frames**

`get_screenshot` on all three frames from Task 2. Compare against the "before" captures. **Corner radii are the thing to look at** — they are what a name-based remap would have broken. Any difference means the value map picked the wrong target; revert via Figma version history and fix Step 1's map.

---

### Task 7: Delete the superseded collections

Only after Task 6 Step 3 shows zero remaining bindings.

**Files:**

- Figma — 12 collections removed

- [ ] **Step 1: Delete**

```js
const DELETE = [
  "Scale",
  "Radius",
  "Typography",
  "Container",
  "Breakpoint",
  "Color Primitives",
  "Spacing",
  "Opacity",
  "Blur",
  "Border Width",
  "Number Primitives",
  "Primitives",
];
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const removed = [],
  missing = [];
for (const name of DELETE) {
  const c = cols.find((x) => x.name === name);
  if (!c) {
    missing.push(name);
    continue;
  }
  removed.push({ name, id: c.id, vars: c.variableIds.length });
  c.remove();
}
const after = (await figma.variables.getLocalVariableCollectionsAsync()).map(
  (c) => ({ name: c.name, vars: c.variableIds.length }),
);
return { removed, missing, after };
```

Expected `after`: exactly `1 Primitives` (~480), `2 Theme` (10), `Color Tokens` (392). Three collections, down from fourteen.

`Color Tokens` stays until Plan 3 — its 29 consumers must be rebound first.

- [ ] **Step 2: Screenshot the reference frames one final time**

All three must still be identical to the "before" captures.

- [ ] **Step 3: Re-dump and run the gate**

Re-run `scripts/figma/dump-tokens.md`, save to `tokens.figma.json`, then:

```bash
pnpm figma:verify
```

Expected: zero Missing, zero Mismatch, zero Unmapped.

- [ ] **Step 4: Commit**

```bash
git add tokens.figma.json bindings.figma.json
git commit -m "chore(figma): merge 12 primitive collections into 1 Primitives, rebind by value"
```

---

### Task 8: Record the outcome

**Files:**

- Modify: `docs/specs/01_active/figma-variables/design.md`
- Modify: `docs/specs/01_active/figma-variables/notes.md`

- [ ] **Step 1: Replace the "Open question" section in `design.md`**

It is resolved. Replace it with the verified binding inventory table from the top of this plan, and mark migration step 3 shipped.

- [ ] **Step 2: Add the transferable lessons to `notes.md`**

At minimum:

- _Price a migration by walking real bindings, not by counting variables._ 928 variables, but 427 of them had zero consumers and the whole cost sat in 5 collections.
- _Remap by resolved value, not by name._ Two collections can use the same leaf name for different pixel values (`radius/lg` = 16 vs 8); a name-based remap is silent corruption.
- _A collection with zero bindings is free to regenerate._ That is what made generating colours from `theme.css` safe rather than risky.

- [ ] **Step 3: Commit**

```bash
git add docs/specs/01_active/figma-variables/
git commit -m "docs(specs): figma-variables — step 3 shipped, open question resolved"
```

---

## Exit criteria

- Figma holds exactly three collections: `1 Primitives` (hidden from publishing), `2 Theme`, `Color Tokens` (pending Plan 3).
- Zero bindings to `Scale`, `Radius`, `Typography`, `Container`, `Breakpoint`, or any deleted collection.
- All three reference frames screenshot-identical to the Task 2 captures.
- `pnpm figma:verify` clean; `pnpm test` passes; `pnpm figma:primitives` reproducible.
- `2 Theme`'s 7 colours are aliases into `color/brand/*`, not raw hex.

Plan 3 (`plan-3-cleanup-responsive.md`) picks up from here.
