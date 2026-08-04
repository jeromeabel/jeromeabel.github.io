# Studio Plan 3/3 — The Studio App

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `pnpm studio` — one local web app with a Crop tab (absorbing `crop-ui.mjs`), an Effects tab (layered live preview, three-tier markers, blob drag), and a Run panel (render-dirty / render-all / contact sheet as jobs), per studio-design.md §3, §7–§9.

**Architecture:** `studio.mjs` is a thin `node:http` server bound to `127.0.0.1` with Origin-checked POSTs; it serves `lib/{util,geometry,mesh,resolve}.mjs` to the browser **verbatim** (the preview runs the renderer's own code) and client modules from `studio/`. The browser composits a native-SVG mesh layer under a server-rendered subject layer (`POST /api/layer`, ~40 ms) with CSS `mix-blend-mode`; a **Render exact** button fetches the full ImageMagick composite (~300 ms). Batch steps run server-side through the same `renderEntry`/`writeSheet` lib calls the CLI uses.

**Tech Stack:** Node ≥ 20 (`node:http`, no deps), browser ES modules, ImageMagick. Depends on plans 1 and 2 being fully landed.

## Global Constraints

- Spec: studio-design.md §3 (preview split), §4 (client isolation rule), §7 (routes table), §8 (UI), §9 (error handling — all seven bullets are requirements), §12 (`pnpm crop` stays as alias).
- **Nothing under `src/` changes.**
- Server binds `127.0.0.1` only. Every POST rejects when `Origin` is present and ≠ the request `Host`, and rejects any `Host` that is not `127.0.0.1[:port]` / `localhost[:port]` (403). This closes the 2026-07-27 security findings against `crop-ui.mjs`.
- Client code under `studio/` imports ONLY `/lib/*.mjs` URLs and calls `/api/*` + `/img/*` routes — never `content.mjs`/`store.mjs`, never repo paths (§4 isolation rule).
- One recipe per image (no per-size effect overrides); crop keeps its per-size overrides.
- Malformed `illustration.json` ⇒ server refuses to boot, printing the parse error.
- Jobs run against **saved** state; the client prompts to save before starting a job when dirty.
- `pnpm format:write` on touched files before each commit; `node --test images/scripts/lib/` green at every commit.

---

### Task 1: Server core — static routes, data, save, security

**Files:**

- Create: `images/scripts/studio.mjs`
- Create: `images/scripts/studio/page.mjs` (minimal shell for this task; Task 2 fills it)

**Interfaces:**

- Consumes: `SETTINGS`, `scanContent`, `loadCrops`/`saveCrops`/`loadIllustration`/`saveIllustration` (plans 1–2).
- Produces (routes, §7): `GET /` (shell), `GET /lib/<name>.mjs` (whitelist: `util`, `geometry`, `mesh`, `resolve`), `GET /studio/<name>.mjs` (`crop`, `fx`, `run`), `GET /img/<slug>`, `GET /api/data` → `{ slugs: [{slug, hasImg}], crops, illustration, settings, sizes, styles }`, `POST /api/save` body `{ crops, illustration }`. Helper exports for Task 3/5: `readJson(req) → Promise<object>`, `requestOk(req) → boolean`, `sendErr(res, code, msg)`.

- [ ] **Step 1: Write `studio/page.mjs` placeholder**

```js
// Shell HTML — filled in by studio-plan-3 Task 2.
export function pageHtml() {
  return `<!doctype html><meta charset="utf-8"><title>Illustration Studio</title><p>studio shell placeholder</p>`;
}
```

- [ ] **Step 2: Write `studio.mjs`**

```js
#!/usr/bin/env node
// ============================================================================
// Illustration Studio — local tuning UI (studio-design.md). Serves the crop +
// effects app, renders previews via the same lib the CLI uses, and runs batch
// steps as jobs. Local-only: binds 127.0.0.1, Origin-checked POSTs (§9).
//
// Usage:
//   node images/scripts/studio.mjs            # http://127.0.0.1:4380, opens browser
//   node images/scripts/studio.mjs --port 5000 --no-open
// ============================================================================
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import { execFile } from "node:child_process";
import { SETTINGS } from "./settings.mjs";
import { ROOT, scanContent } from "./lib/content.mjs";
import {
  loadCrops,
  saveCrops,
  loadIllustration,
  saveIllustration,
} from "./lib/store.mjs";
import { pageHtml } from "./studio/page.mjs";

const portArg = process.argv.indexOf("--port");
const port = portArg > -1 ? Number(process.argv[portArg + 1]) : 4380;

// Malformed illustration.json must refuse to boot, not silently reset (§9).
loadIllustration();

const entries = scanContent();
const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
const scriptsDir = new URL(".", import.meta.url);

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const LIB_WHITELIST = ["util.mjs", "geometry.mjs", "mesh.mjs", "resolve.mjs"];
const STUDIO_WHITELIST = ["crop.mjs", "fx.mjs", "run.mjs"];

export function sendErr(res, code, msg) {
  res.writeHead(code, { "content-type": "text/plain; charset=utf-8" });
  res.end(msg);
}

// Local-only guard: Host must be loopback; POSTs with a foreign Origin are
// CSRF attempts — reject (§9, closes the crop-ui findings).
export function requestOk(req) {
  const host = req.headers.host ?? "";
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return false;
  if (req.method === "POST" && req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function serveModule(res, dir, name, whitelist) {
  if (!whitelist.includes(name))
    return sendErr(res, 404, `not served: ${name}`);
  res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
  res.end(readFileSync(new URL(`${dir}/${name}`, scriptsDir)));
}

const server = createServer(async (req, res) => {
  if (!requestOk(req)) return sendErr(res, 403, "forbidden origin/host");
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(pageHtml());
    } else if (url.pathname.startsWith("/lib/")) {
      serveModule(res, "lib", url.pathname.slice(5), LIB_WHITELIST);
    } else if (url.pathname.startsWith("/studio/")) {
      serveModule(res, "studio", url.pathname.slice(8), STUDIO_WHITELIST);
    } else if (url.pathname === "/api/data") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          slugs: entries.map((e) => ({ slug: e.slug, hasImg: !!e.img })),
          crops: loadCrops(),
          illustration: loadIllustration(),
          settings: SETTINGS,
          sizes: SETTINGS.sizes,
          styles: SETTINGS.styles,
        }),
      );
    } else if (url.pathname.startsWith("/img/")) {
      const entry = bySlug[decodeURIComponent(url.pathname.slice(5))];
      if (!entry?.img || !existsSync(entry.img))
        return sendErr(res, 404, "unknown slug or no cover");
      res.writeHead(200, {
        "content-type":
          MIME[extname(entry.img).toLowerCase()] ?? "application/octet-stream",
      });
      res.end(readFileSync(entry.img));
    } else if (url.pathname === "/api/save" && req.method === "POST") {
      const { crops, illustration } = await readJson(req);
      saveCrops(crops);
      saveIllustration(illustration);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          crops: Object.keys(crops).length,
          images: Object.keys(illustration.images ?? {}).length,
        }),
      );
    } else {
      sendErr(res, 404, `not found: ${url.pathname}`);
    }
  } catch (err) {
    sendErr(res, err instanceof SyntaxError ? 400 : 500, err.message);
  }
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`studio → ${url} (${entries.length} entries)`);
  if (!process.argv.includes("--no-open"))
    execFile("xdg-open", [url], () => {});
});
```

- [ ] **Step 3: Verify with curl (the executable test of this task)**

```bash
node images/scripts/studio.mjs --port 4382 --no-open &
sleep 1
curl -sf http://127.0.0.1:4382/api/data | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log('slugs',j.slugs.length,'styles',j.styles.length)})"
curl -sf http://127.0.0.1:4382/lib/geometry.mjs | head -1                # serves module
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4382/lib/store.mjs        # 404 (not whitelisted)
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'Origin: http://evil.example' \
  -d '{}' http://127.0.0.1:4382/api/save                                 # 403 CSRF rejected
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: evil.example' http://127.0.0.1:4382/  # 403
kill %1
```

Expected codes as commented. Also verify boot refusal: `echo '{bad' > images/illustration.json && node images/scripts/studio.mjs --port 4383 --no-open; git checkout -- images/illustration.json 2>/dev/null || rm images/illustration.json` → exits nonzero printing `illustration.json: ...`.

- [ ] **Step 4: Commit**

```bash
pnpm format:write images/scripts
git add images/scripts/studio.mjs images/scripts/studio/
git commit -m "feat(studio): local-only server core with data/save routes"
```

---

### Task 2: Page shell + shared state + Crop tab (absorbs crop-ui client)

**Files:**

- Modify: `images/scripts/studio/page.mjs` (real shell)
- Create: `images/scripts/studio/crop.mjs`

**Interfaces:**

- Consumes: routes from Task 1; `/lib/geometry.mjs` in the browser.
- Produces: a shared client context passed to every panel's `init`:

```js
ctx = {
  data,            // /api/data payload (incl. settings, sizes, styles)
  crops,           // live-edited crops object
  ill,             // live-edited illustration object { types, images }
  get current(),   // selected slug
  select(slug),    // switch image (notifies panels)
  markDirty(),     // flips shared dirty flag + save button
  onChange(fn),    // panels subscribe: fn({ slug }) on select/rail refresh
  refreshRail(),   // re-render rail markers
}
```

`crop.mjs` exports `initCrop(ctx, root)`; `fx.mjs` / `run.mjs` (Tasks 4–5) export `initFx(ctx, root)` / `initRun(ctx, root)`. Rail markers: crop dot (existing behaviour), `fx` dot when `ill.images[slug]` non-empty, `!` badge when the slug's `style` deviates from its type's recommendation (§8).

- [ ] **Step 1: Write the shell in `page.mjs`**

`pageHtml()` returns the full page. Layout per §8 (header with tabs + status + Run + Save; rail left; panel right). Key excerpts — the file must contain all of this:

```js
export function pageHtml() {
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Illustration Studio</title>
<style>
:root { --paper:#f5ffe1; --ink:#1e1e1e; --muted:#5b5b5b; --line:#d1ddbb; --accent:#ff5a3c; --set:#0d9488; }
@media (prefers-color-scheme: dark) {
  :root { --paper:#1e1e1e; --ink:#ececec; --muted:#9b9b9b; --line:#4c4c4c; }
}
* { box-sizing:border-box; }
body { margin:0; background:var(--paper); color:var(--ink); font:14px/1.5 ui-monospace,monospace; }
header { display:flex; align-items:center; gap:1rem; padding:.7rem 1rem; border-bottom:2px solid var(--ink); position:sticky; top:0; background:var(--paper); z-index:2; }
header h1 { font-size:1rem; margin:0; }
#tabs button { font:inherit; padding:.3rem 1rem; background:none; color:var(--muted); border:1px solid var(--line); cursor:pointer; }
#tabs button.active { background:var(--ink); color:var(--paper); border-color:var(--ink); }
#status { color:var(--muted); }
#run-toggle, #save { font:inherit; padding:.4rem 1rem; border:1px solid var(--line); background:none; color:var(--ink); cursor:pointer; }
#save { margin-left:auto; background:var(--ink); color:var(--paper); border:none; }
#save.dirty { background:var(--accent); color:#fff; }
main { display:grid; grid-template-columns:220px 1fr; min-height:calc(100vh - 53px); }
#rail { border-right:1px solid var(--line); overflow-y:auto; max-height:calc(100vh - 53px); position:sticky; top:53px; }
.thumb { display:block; width:100%; padding:.5rem; border:none; background:none; cursor:pointer; text-align:left; border-bottom:1px solid var(--line); color:var(--ink); font:inherit; }
.thumb img { width:100%; display:block; border:1px solid var(--line); }
.thumb .name { font-size:.7rem; word-break:break-all; display:flex; gap:.3rem; align-items:baseline; }
.thumb.active { background:color-mix(in srgb, var(--ink) 8%, transparent); }
.dot { width:.5rem; height:.5rem; border-radius:50%; background:var(--line); flex:none; }
.thumb.set .dot { background:var(--set); }
.thumb .fxdot { width:.5rem; height:.5rem; border-radius:50%; background:var(--line); flex:none; }
.thumb.fxset .fxdot { background:var(--accent); }
.thumb .dev { color:var(--accent); font-weight:bold; margin-left:auto; }
.panel { display:none; padding:1rem 1.5rem 3rem; }
.panel.active { display:block; }
#run-drawer { display:none; border-top:2px solid var(--ink); padding:1rem 1.5rem; }
#run-drawer.open { display:block; }
</style>
<header>
  <h1>Studio</h1>
  <nav id="tabs">
    <button data-tab="crop" class="active">Crop</button>
    <button data-tab="fx">Effects</button>
  </nav>
  <span id="status"></span>
  <button id="run-toggle">Run</button>
  <button id="save">Save</button>
</header>
<main>
  <nav id="rail"></nav>
  <section>
    <div id="crop-panel" class="panel active"></div>
    <div id="fx-panel" class="panel"></div>
    <div id="run-drawer"></div>
  </section>
</main>
<script type="module">
import { initCrop } from "/studio/crop.mjs";
import { initFx } from "/studio/fx.mjs";
import { initRun } from "/studio/run.mjs";

const $ = (s) => document.querySelector(s);
const data = await (await fetch("/api/data")).json();
const crops = data.crops;
const ill = data.illustration;
let current = null, dirty = false;
const listeners = [];

function markDirty() {
  dirty = true;
  $("#save").classList.add("dirty");
  updateStatus();
}
function updateStatus() {
  $("#status").textContent = (current ?? "") + (dirty ? " · unsaved" : "");
}

// Deviation flag: slug pins a style different from its type's verdict (§8).
function deviates(slug) {
  const img = ill.images?.[slug];
  const rec = img?.type && ill.types?.[img.type]?.style;
  return !!(rec && img.style && img.style !== rec);
}
const hasCrop = (slug) => !!crops[slug];
const hasFx = (slug) =>
  !!ill.images?.[slug] && Object.keys(ill.images[slug]).length > 0;

function refreshRail() {
  const rail = $("#rail");
  rail.innerHTML = "";
  for (const { slug, hasImg } of data.slugs) {
    const b = document.createElement("button");
    b.className =
      "thumb" +
      (hasCrop(slug) ? " set" : "") +
      (hasFx(slug) ? " fxset" : "") +
      (slug === current ? " active" : "");
    if (hasImg) {
      const im = document.createElement("img");
      im.loading = "lazy";
      im.src = "/img/" + encodeURIComponent(slug);
      b.appendChild(im);
    }
    const name = document.createElement("span");
    name.className = "name";
    for (const cls of ["dot", "fxdot"]) {
      const d = document.createElement("span");
      d.className = cls;
      name.appendChild(d);
    }
    name.appendChild(document.createTextNode(slug));
    if (deviates(slug)) {
      const dev = document.createElement("span");
      dev.className = "dev";
      dev.textContent = "!";
      dev.title = "deviates from type recommendation";
      name.appendChild(dev);
    }
    b.appendChild(name);
    b.onclick = () => select(slug);
    rail.appendChild(b);
  }
}

function select(slug) {
  current = slug;
  refreshRail();
  updateStatus();
  for (const fn of listeners) fn({ slug });
}

const ctx = {
  data, crops, ill,
  get current() { return current; },
  select, markDirty, refreshRail,
  onChange: (fn) => listeners.push(fn),
};

for (const b of document.querySelectorAll("#tabs button")) {
  b.onclick = () => {
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    $("#" + b.dataset.tab + "-panel").classList.add("active");
  };
}
$("#run-toggle").onclick = () => $("#run-drawer").classList.toggle("open");

$("#save").onclick = async () => {
  const res = await fetch("/api/save", {
    method: "POST",
    body: JSON.stringify({ crops, illustration: ill }),
  });
  if (res.ok) {
    dirty = false;
    $("#save").classList.remove("dirty");
    updateStatus();
    refreshRail();
  } else alert("save failed: " + (await res.text()));
};
window.isDirty = () => dirty;   // run.mjs checks before starting a job
window.doSave = () => $("#save").onclick();

addEventListener("beforeunload", (e) => {
  if (!dirty) return;
  e.preventDefault();
  e.returnValue = "";
});

initCrop(ctx, $("#crop-panel"));
initFx(ctx, $("#fx-panel"));
initRun(ctx, $("#run-drawer"));
refreshRail();
const first = data.slugs.find((s) => s.hasImg);
if (first) select(first.slug);
</script>`;
}
```

(Prune-on-save: crop.mjs exposes its prune via `ctx` — see Step 2; wire `$("#save").onclick` to call `ctx.beforeSave?.()` first, which crop.mjs sets to prune `crops` and fx.mjs extends to prune empty image entries. Add `const hooks = []; ctx.beforeSave = () => hooks.forEach(f => f()); ctx.onBeforeSave = (f) => hooks.push(f);` — panels register their pruners.)

- [ ] **Step 2: Write `studio/crop.mjs` by porting the crop-ui client**

Port the `<script>` body of `crop-ui.mjs` (lines 156–446 — the file still exists until Task 6) into `export function initCrop(ctx, root)` with these mechanical changes and NO behaviour change:

1. Wrap all panel DOM (`#tabs`→`#crop-tabs`, `#stage`, `#marker`, `#controls`, `#zoom`, `#reset`, `#hint`, `#previews`) inside `root.innerHTML = \`...\``using the same markup and CSS (move the crop-specific CSS rules from crop-ui PAGE into a`<style>`block inside`root`); rename ids that clash with the shell (`#tabs`→`#crop-tabs`).
2. Delete the local `cropBox` and `resolveCrop` functions. Import the single copy:
   ```js
   import { cropBox, resolveCrop } from "/lib/geometry.mjs";
   // "base" pseudo-tab resolves the slug-level crop; size tabs use the lib.
   const resolveTab = (entry, name) =>
     name === "base"
       ? { focus: entry?.focus ?? [0.5, 0.5], zoom: entry?.zoom ?? 1 }
       : resolveCrop(entry, name);
   ```
   Replace every former `resolveCrop(entry, name)` call with `resolveTab(entry, name)`. Note: the lib `cropBox` returns rounded ints (the renderer's contract) — preview offsets may shift ≤1px vs the old float version; accepted, it is the truer preview.
3. Replace globals: `crops` → `ctx.crops`; `DATA.sizes` → `ctx.data.sizes`; `current` → `ctx.current` (selection now comes from the shell: subscribe with `ctx.onChange(({slug}) => { loadImage(slug); })` where `loadImage` is the old `select()` minus rail work); `setDirty(true)` → `ctx.markDirty()`; delete `buildRail`, save handler, `beforeunload`, the bootstrap IIFE (shell owns them); keep `prune()` and register it: `ctx.onBeforeSave(() => { const p = prune(ctx.crops); for (const k of Object.keys(ctx.crops)) delete ctx.crops[k]; Object.assign(ctx.crops, p); });` (mutate in place — the shell holds the reference).
4. The slug-count status line (`N/M set`) moves into the panel as a small `<span id="crop-count">` updated in `render()`.

- [ ] **Step 3: Manual verification (feature parity checklist)**

`node images/scripts/studio.mjs --port 4382` and in the browser verify, on two different slugs: focal-point click + drag updates marker and all size previews live; zoom slider works; per-size tab override (`+n` badge equivalent: own-crop `·own` labels) works; Reset/Inherit base works; Save writes `images/crops.json` (diff it: only intended change); reload → `beforeunload` guard fires when dirty; saved state reloads identically (§10.3 for crops).

- [ ] **Step 4: Commit**

```bash
pnpm format:write images/scripts
git add images/scripts/studio/
git commit -m "feat(studio): page shell and crop tab absorbing crop-ui client"
```

---

### Task 3: Preview render routes — `/api/layer` and `/api/render`

**Files:**

- Modify: `images/scripts/lib/render.mjs`
- Modify: `images/scripts/studio.mjs`

**Interfaces:**

- Consumes: `subjectSpec`, `STYLES` (plan 2 Task 3), `cropBox` (plan 1).
- Produces:
  - `prepareInput(entry, eff, crop, sizeName, dir) → { input, w, h, cleanup() }` in `render.mjs` — extracted from `renderEntry`'s crop block; `renderEntry` now calls it (single copy of the crop flow).
  - `renderLayer(entry, eff, crop, sizeName, styleName, dir) → path` — subject-only PNG for `*-mesh` styles (via `subjectSpec`, **no** opacity baked in and no mesh: the browser layers those); full styled raster for all other styles (first declared output).
  - `renderExact(entry, eff, crop, sizeName, styleName, dir) → path` — full `STYLES[style].apply` into `dir`, returns first output.
  - Routes: `POST /api/layer` and `POST /api/render`, body `{ slug, style, size, effective, crop }` → `image/png`. Unknown slug → 404 naming it; unknown style/size → 400 naming it; ImageMagick failure → 500 carrying stderr (§9).

- [ ] **Step 1: Extract `prepareInput` and add the two render functions in `lib/render.mjs`**

```js
export function prepareInput(entry, eff, crop, sizeName, dir) {
  const dims = eff.settings.sizes[sizeName];
  if (dims === undefined) throw new Error(`unknown size: ${sizeName}`);
  if (entry.img && dims) {
    const src = imageSize(entry.img);
    const box = cropBox(src.w, src.h, dims.w, dims.h, crop);
    const tmp = join(dir, `.crop_${entry.slug}_${sizeName}.png`);
    magick([
      entry.img,
      "-crop",
      `${box.w}x${box.h}+${box.x}+${box.y}`,
      "+repage",
      "-resize",
      `${dims.w}x${dims.h}!`,
      tmp,
    ]);
    return {
      input: tmp,
      w: dims.w,
      h: dims.h,
      cleanup: () => rmSync(tmp, { force: true }),
    };
  }
  if (entry.img) {
    const { w, h } = imageSize(entry.img);
    return { input: entry.img, w, h, cleanup() {} };
  }
  const { w, h } = dims ?? eff.settings.mesh.fallback;
  return { input: null, w, h, cleanup() {} };
}

// Subject layer for the studio's live preview (studio-design.md §3): the
// pre-composite subject for *-mesh styles (mesh + opacity applied by the
// browser), or the finished raster for flat styles.
export function renderLayer(entry, eff, crop, sizeName, styleName, dir) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const prep = prepareInput(entry, eff, crop, sizeName, dir);
  try {
    const ctx = {
      slug: entry.slug,
      size: sizeName,
      w: prep.w,
      h: prep.h,
      eff,
      out: dir,
    };
    const spec = subjectSpec(styleName, prep.input, ctx);
    if (spec) {
      const outFile = join(dir, `.layer_${entry.slug}.png`);
      try {
        magick([...spec.args, outFile]);
      } finally {
        spec.cleanup();
      }
      return outFile;
    }
    st.apply(prep.input, dir, ctx);
    return join(dir, st.outputs(entry.slug, sizeName, eff)[0]);
  } finally {
    prep.cleanup();
  }
}

export function renderExact(entry, eff, crop, sizeName, styleName, dir) {
  const st = STYLES[styleName];
  if (!st) throw new Error(`unknown style: ${styleName}`);
  const prep = prepareInput(entry, eff, crop, sizeName, dir);
  try {
    st.apply(prep.input, dir, {
      slug: entry.slug,
      size: sizeName,
      w: prep.w,
      h: prep.h,
      eff,
      out: dir,
    });
    return join(dir, st.outputs(entry.slug, sizeName, eff)[0]);
  } finally {
    prep.cleanup();
  }
}
```

Refactor `renderEntry` to use `prepareInput` (delete its inline crop block). Run `node --test images/scripts/lib/` — still green — then `pnpm illustrate` + signature spot-check one slug against `$SCRATCH/baseline.txt`.

One wrinkle: `magick()` uses `stdio: "inherit"`, so stderr goes to the terminal, not the exception. For §9 ("500 carrying stderr"), change `magick()` in `lib/magick.mjs` to capture stderr:

```js
export function magick(args) {
  execFileSync("convert", args, { stdio: ["ignore", "inherit", "pipe"] });
}
```

`execFileSync` attaches captured stderr to the thrown error (`err.stderr`); on success nothing changes. Same change for `potrace`. Route handlers use `err.stderr?.toString() || err.message`.

- [ ] **Step 2: Add the routes to `studio.mjs`**

Preview scratch dir, cleaned on boot:

```js
const PREVIEW_DIR = join(ROOT, "images/out/.preview");
rmSync(PREVIEW_DIR, { recursive: true, force: true });
mkdirSync(PREVIEW_DIR, { recursive: true });
```

Handlers (inside the router; imports added for `renderLayer`, `renderExact`):

```js
} else if (
  (url.pathname === "/api/layer" || url.pathname === "/api/render") &&
  req.method === "POST"
) {
  const { slug, style, size, effective, crop } = await readJson(req);
  const entry = bySlug[slug];
  if (!entry) return sendErr(res, 404, `unknown slug: ${slug}`);
  const fn = url.pathname === "/api/layer" ? renderLayer : renderExact;
  let file;
  try {
    file = fn(entry, effective, crop ?? {}, size, style, PREVIEW_DIR);
  } catch (err) {
    const msg = err.stderr?.toString() || err.message;
    return sendErr(res, /^unknown /.test(err.message) ? 400 : 500, msg);
  }
  res.writeHead(200, { "content-type": "image/png", "cache-control": "no-store" });
  res.end(readFileSync(file));
}
```

- [ ] **Step 3: Verify with curl**

```bash
node images/scripts/studio.mjs --port 4382 --no-open &
sleep 1
SLUG=$(curl -sf http://127.0.0.1:4382/api/data | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).slugs.find(s=>s.hasImg).slug))")
EFF=$(node -e "import('./images/scripts/lib/resolve.mjs').then(async(r)=>{const {SETTINGS}=await import('./images/scripts/settings.mjs');console.log(JSON.stringify(r.resolveSettings('$SLUG',{types:{},images:{}},SETTINGS).effective))})")
curl -sf -X POST -d "{\"slug\":\"$SLUG\",\"style\":\"photo-mesh\",\"size\":\"thumb\",\"effective\":$EFF,\"crop\":{}}" \
  http://127.0.0.1:4382/api/layer -o "$SCRATCH/layer.png" && identify "$SCRATCH/layer.png"
curl -sf -X POST -d "{\"slug\":\"$SLUG\",\"style\":\"photo-mesh\",\"size\":\"thumb\",\"effective\":$EFF,\"crop\":{}}" \
  http://127.0.0.1:4382/api/render -o "$SCRATCH/exact.png" && identify "$SCRATCH/exact.png"
curl -s -o /dev/null -w '%{http_code}\n' -X POST -d "{\"slug\":\"nope\",\"style\":\"x\",\"size\":\"thumb\",\"effective\":$EFF}" http://127.0.0.1:4382/api/layer   # 404
kill %1
```

Expected: both PNGs identify as `575x300`; the layer PNG is the grayscale subject (no mesh colors), the exact PNG is the full composite; last call 404.

- [ ] **Step 4: Commit**

```bash
pnpm format:write images/scripts
git add images/scripts/lib/ images/scripts/studio.mjs
git commit -m "feat(studio): subject-layer and exact-render preview routes"
```

---

### Task 4: Effects tab — `studio/fx.mjs`

**Files:**

- Create: `images/scripts/studio/fx.mjs`

**Interfaces:**

- Consumes: `ctx` (Task 2), `/lib/resolve.mjs`, `/lib/mesh.mjs`, `/lib/util.mjs`, `/lib/geometry.mjs`, `POST /api/layer`, `POST /api/render`.
- Produces: `initFx(ctx, root)`. All edits mutate `ctx.ill.images[slug]` in place + `ctx.markDirty()`; registers a before-save pruner that drops empty image entries.

- [ ] **Step 1: Write `studio/fx.mjs`**

Full module. Structure and every behaviour below is required; wording of labels may vary:

```js
// Effects panel — layered preview (browser SVG mesh under server subject
// layer), three-tier markers, per-knob reset, blob drag/materialize (§3–§8).
import { resolveSettings } from "/lib/resolve.mjs";
import { generateBlobs, meshSvg } from "/lib/mesh.mjs";
import { color, accentFor } from "/lib/util.mjs";
import { resolveCrop } from "/lib/geometry.mjs";

const MESH_STYLES = ["mesh", "photo-mesh", "dither-mesh", "vector-mesh"];
const BLENDS = [
  "Multiply",
  "Screen",
  "Overlay",
  "SoftLight",
  "HardLight",
  "Darken",
  "Lighten",
];
// SETTINGS groups exposed as knob sections (everything overridable, §2).
const GROUPS = [
  "duotone",
  "riso",
  "dither",
  "vector",
  "onMesh",
  "framed",
  "mesh",
];

export function initFx(ctx, root) {
  let previewSize = "thumb";
  let abort = null; // in-flight /api/layer AbortController (§9)
  let layerUrl = null; // current blob URL
  let exactUrl = null; // non-null while showing a Render exact result

  root.innerHTML = `
  <style>
    #fx-preview { position:relative; display:inline-block; border:1px solid var(--line); overflow:hidden; }
    #fx-mesh svg, #fx-mesh { position:absolute; inset:0; }
    #fx-subject { position:relative; display:block; max-width:100%; }
    #fx-exact { position:absolute; inset:0; width:100%; }
    #fx-blobs { position:absolute; inset:0; cursor:grab; }
    #fx-blobs ellipse { fill:transparent; stroke:var(--accent); stroke-dasharray:4 4; stroke-width:2; pointer-events:all; }
    .knob { display:flex; gap:.6rem; align-items:center; margin:.2rem 0; }
    .knob .src { font-size:.65rem; color:var(--muted); min-width:5ch; }
    .knob .src.image { color:var(--accent); }
    .knob .src.type { color:var(--set); }
    .knob button.reset { font:inherit; border:none; background:none; cursor:pointer; color:var(--accent); }
    details { margin:.5rem 0; } details > summary { cursor:pointer; color:var(--muted); }
    #fx-error { color:var(--accent); white-space:pre-wrap; }
    fieldset { border:1px solid var(--line); margin:.6rem 0; }
  </style>
  <div id="fx-head">
    size <select id="fx-size"></select>
    <button id="fx-exact-btn">Render exact</button>
    <span id="fx-hint"></span>
  </div>
  <div id="fx-preview">
    <div id="fx-mesh"></div>
    <img id="fx-subject" alt="">
    <img id="fx-exact" alt="" hidden>
    <svg id="fx-blobs"></svg>
  </div>
  <pre id="fx-error" hidden></pre>
  <fieldset id="fx-main">
    <div class="knob">style <span id="fx-styles"></span></div>
    <div class="knob">mix <input id="fx-opacity" type="range" min="0" max="1" step="0.01">
      <span id="fx-opacity-val"></span> <select id="fx-blend"></select></div>
    <div class="knob">accent <span id="fx-accents"></span></div>
    <div class="knob">seed <input id="fx-seed" type="text" size="18"> <button id="fx-reroll">🎲</button></div>
  </fieldset>
  <div id="fx-groups"></div>`;

  const $ = (s) => root.querySelector(s);

  // ---------- data helpers ----------
  const entry = () => (ctx.ill.images[ctx.current] ??= {});
  const maybeDrop = () => {
    // registered pruner drops empties at save
    const e = ctx.ill.images[ctx.current];
    if (e && Object.keys(e).length === 0) delete ctx.ill.images[ctx.current];
  };
  const resolved = () =>
    resolveSettings(ctx.current, ctx.ill, ctx.data.settings);
  const hasImg = () =>
    ctx.data.slugs.find((s) => s.slug === ctx.current)?.hasImg;
  const changed = () => {
    ctx.markDirty();
    ctx.refreshRail();
    render();
  };

  ctx.onBeforeSave(() => {
    for (const [slug, e] of Object.entries(ctx.ill.images)) {
      if (Object.keys(e).length === 0) delete ctx.ill.images[slug];
    }
  });

  // set/delete a deep path in the image entry ("dither.pixelate")
  function setOverride(path, value) {
    const keys = path.split(".");
    let node = entry();
    for (const k of keys.slice(0, -1)) node = node[k] ??= {};
    node[keys.at(-1)] = value;
    changed();
  }
  function clearOverride(path) {
    const keys = path.split(".");
    const parents = [ctx.ill.images[ctx.current]];
    let node = parents[0];
    for (const k of keys.slice(0, -1)) {
      node = node?.[k];
      parents.push(node);
    }
    if (!node) return;
    delete node[keys.at(-1)];
    for (let i = parents.length - 1; i > 0; i--) {
      // collapse empty shells
      const key = keys[i - 1];
      if (parents[i] && Object.keys(parents[i]).length === 0)
        delete parents[i - 1][key];
    }
    maybeDrop();
    changed();
  }

  // ---------- preview ----------
  function activeStyle(eff) {
    return eff.style ?? (hasImg() ? "photo-mesh" : "mesh"); // unset: preview a representative style
  }

  function renderMeshLayer(eff, style, dims) {
    const box = $("#fx-mesh");
    if (!MESH_STYLES.includes(style)) return (box.innerHTML = "");
    const s = eff.settings.mesh;
    const theme = style === "mesh" ? "light" : eff.settings.onMesh.theme;
    const pal = eff.settings.palette;
    const accent = eff.accent ?? accentFor(pal, ctx.current);
    const colors = {
      bg: theme === "light" ? color(pal, "paper") : color(pal, "ink"),
      tint: theme === "light" ? color(pal, "ink") : color(pal, "paper"),
      accent: color(pal, accent),
    };
    const blobs = eff.mesh?.blobs ?? generateBlobs(`${eff.seed}:${theme}`, s);
    box.innerHTML = meshSvg(blobs, colors, s, dims.w, dims.h);
    renderBlobHandles(blobs, s, dims);
  }

  async function fetchSubject(eff, style) {
    if (!hasImg() || style === "mesh") {
      $("#fx-subject").removeAttribute("src");
      return;
    }
    abort?.abort(); // out-of-order guard (§9)
    abort = new AbortController();
    try {
      const res = await fetch("/api/layer", {
        method: "POST",
        signal: abort.signal,
        body: JSON.stringify({
          slug: ctx.current,
          style,
          size: previewSize,
          effective: eff,
          crop: resolveCrop(ctx.crops[ctx.current], previewSize),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      if (layerUrl) URL.revokeObjectURL(layerUrl);
      layerUrl = URL.createObjectURL(await res.blob());
      const img = $("#fx-subject");
      img.src = layerUrl;
      const opacity = eff.mix?.opacity ?? eff.settings.onMesh.subjectOpacity;
      const blend = (eff.mix?.blend ?? "Multiply")
        .toLowerCase()
        .replace("softlight", "soft-light")
        .replace("hardlight", "hard-light");
      img.style.opacity = MESH_STYLES.includes(style) ? opacity : 1;
      img.style.mixBlendMode = MESH_STYLES.includes(style) ? blend : "normal";
      showError(null);
    } catch (err) {
      if (err.name !== "AbortError") showError(err.message); // never a silent blank frame (§9)
    }
  }

  function showError(msg) {
    $("#fx-error").hidden = !msg;
    if (msg) $("#fx-error").textContent = msg;
  }

  function clearExact() {
    $("#fx-exact").hidden = true;
    if (exactUrl) {
      URL.revokeObjectURL(exactUrl);
      exactUrl = null;
    }
  }

  $("#fx-exact-btn").onclick = async () => {
    const { effective: eff } = resolved();
    const res = await fetch("/api/render", {
      method: "POST",
      body: JSON.stringify({
        slug: ctx.current,
        style: activeStyle(eff),
        size: previewSize,
        effective: eff,
        crop: resolveCrop(ctx.crops[ctx.current], previewSize),
      }),
    });
    if (!res.ok) return showError(await res.text());
    exactUrl = URL.createObjectURL(await res.blob());
    const img = $("#fx-exact");
    img.src = exactUrl;
    img.hidden = false; // any subsequent change clears it
  };

  // ---------- blob drag (materialize, §6) ----------
  let dragFrame = null;
  function renderBlobHandles(blobs, meshCfg, dims) {
    const svg = $("#fx-blobs");
    const vb = meshCfg.viewBox;
    svg.setAttribute("viewBox", `0 0 ${vb} ${vb}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.innerHTML = blobs
      .map(
        (b, i) =>
          `<ellipse data-i="${i}" cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" transform="rotate(${b.rot} ${b.cx} ${b.cy})"/>`,
      )
      .join("");
    for (const el of svg.querySelectorAll("ellipse")) {
      el.onpointerdown = (e) => {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const i = Number(el.dataset.i);
        el.onpointermove = (ev) => {
          if (!el.hasPointerCapture(ev.pointerId) || dragFrame) return;
          dragFrame = requestAnimationFrame(() => {
            dragFrame = null;
            // Materialize on first touch: the file becomes the truth (§6).
            const { effective: eff } = resolved();
            const theme =
              activeStyle(eff) === "mesh" ? "light" : eff.settings.onMesh.theme;
            const cur =
              entry().mesh?.blobs ??
              structuredClone(
                eff.mesh?.blobs ??
                  generateBlobs(`${eff.seed}:${theme}`, eff.settings.mesh),
              );
            const pt = svgPoint(svg, ev);
            cur[i] = { ...cur[i], cx: Math.round(pt.x), cy: Math.round(pt.y) };
            (entry().mesh ??= {}).blobs = cur;
            clearExact();
            ctx.markDirty();
            ctx.refreshRail();
            renderControlsAndMesh(); // mesh redraw only — no server call (§3)
          });
        };
        el.onpointerup = el.onpointercancel = () => {
          el.releasePointerCapture(e.pointerId);
          el.onpointermove = null;
        };
      };
    }
  }
  function svgPoint(svg, e) {
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  $("#fx-reroll").onclick = () => {
    // Destructive when manual blobs exist (§6) — confirm first.
    if (
      entry().mesh?.blobs &&
      !confirm("Discard hand-placed blobs and reroll from a new seed?")
    )
      return;
    delete entry().mesh;
    const n =
      (parseInt(($("#fx-seed").value.match(/-(\d+)$/) ?? [])[1] ?? "0", 10) ||
        0) + 1;
    entry().seed = `${ctx.current}-${n}`;
    maybeDrop();
    clearExact();
    changed();
  };
  $("#fx-seed").onchange = () => {
    const v = $("#fx-seed").value.trim();
    if (v && v !== ctx.current) entry().seed = v;
    else {
      delete entry().seed;
      maybeDrop();
    }
    clearExact();
    changed();
  };

  // ---------- controls ----------
  function tierMark(source, path) {
    const tier = source[path] ?? "global";
    const cls = tier === "image" ? "image" : tier === "type" ? "type" : "";
    const reset =
      tier === "image"
        ? `<button class="reset" data-path="${path}" title="reset to inherited">↺</button>`
        : "";
    return `<span class="src ${cls}">${tier === "global" ? "inherited" : tier}</span>${reset}`;
  }

  function buildStyleRadios(eff, source) {
    const opts = [
      '<label><input type="radio" name="fxstyle" value="">auto (all styles)</label>',
    ].concat(
      ctx.data.styles.map(
        (s) =>
          `<label><input type="radio" name="fxstyle" value="${s}" ${eff.style === s ? "checked" : ""}>${s}</label>`,
      ),
    );
    if (!eff.style) opts[0] = opts[0].replace(">auto", " checked>auto");
    $("#fx-styles").innerHTML = opts.join(" ") + tierMark(source, "style");
    for (const r of root.querySelectorAll('input[name="fxstyle"]')) {
      r.onchange = () => {
        if (r.value) entry().style = r.value;
        else {
          delete entry().style;
          maybeDrop();
        }
        clearExact();
        changed();
      };
    }
  }

  function buildAccentRadios(eff, source) {
    const accents = Object.keys(eff.settings.palette.accents);
    $("#fx-accents").innerHTML =
      [
        '<label><input type="radio" name="fxaccent" value="" ' +
          (!eff.accent ? "checked" : "") +
          ">auto</label>",
      ]
        .concat(
          accents.map(
            (a) =>
              `<label><input type="radio" name="fxaccent" value="${a}" ${eff.accent === a ? "checked" : ""}>${a}</label>`,
          ),
        )
        .join(" ") + tierMark(source, "accent");
    for (const r of root.querySelectorAll('input[name="fxaccent"]')) {
      r.onchange = () => {
        if (r.value) entry().accent = r.value;
        else {
          delete entry().accent;
          maybeDrop();
        }
        clearExact();
        changed();
      };
    }
  }

  // Dynamic knobs for every SETTINGS group leaf (§2 "UI exposes every knob").
  function buildGroups(eff, source) {
    const holder = $("#fx-groups");
    holder.innerHTML = "";
    for (const g of GROUPS) {
      const overridden = Object.keys(source).some(
        (p) => p.startsWith(g + ".") && source[p] !== "global",
      );
      const det = document.createElement("details");
      det.open = overridden;
      det.innerHTML = `<summary>▸ ${g}${overridden ? "" : " (inherited)"}</summary>`;
      addKnobs(det, eff.settings[g], g, source);
      holder.appendChild(det);
    }
    for (const b of holder.querySelectorAll("button.reset")) {
      b.onclick = () => {
        clearExact();
        clearOverride(b.dataset.path);
      };
    }
  }
  function addKnobs(parent, obj, prefix, source) {
    for (const [k, v] of Object.entries(obj)) {
      const path = `${prefix}.${k}`;
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        addKnobs(parent, v, path, source);
        continue;
      }
      const row = document.createElement("div");
      row.className = "knob";
      const input = document.createElement("input");
      if (typeof v === "number") {
        input.type = "number";
        input.step = "any";
        input.value = v;
      } else {
        input.type = "text";
        input.value = Array.isArray(v) ? JSON.stringify(v) : String(v);
      }
      input.onchange = () => {
        let val = input.value;
        if (typeof v === "number") val = Number(val);
        else if (Array.isArray(v)) {
          try {
            val = JSON.parse(input.value);
          } catch {
            return showError(`${path}: not valid JSON`);
          }
        }
        clearExact();
        setOverride(path, val);
      };
      row.append(
        Object.assign(document.createElement("span"), { textContent: path }),
        input,
      );
      row.insertAdjacentHTML("beforeend", tierMark(source, path));
      parent.appendChild(row);
    }
  }

  // ---------- render ----------
  let debounce = null;
  function renderControlsAndMesh() {
    const { effective: eff, source } = resolved();
    const style = activeStyle(eff);
    const dims = eff.settings.sizes[previewSize] ?? eff.settings.mesh.fallback;
    buildStyleRadios(eff, source);
    buildAccentRadios(eff, source);
    $("#fx-opacity").value =
      eff.mix?.opacity ?? eff.settings.onMesh.subjectOpacity;
    $("#fx-opacity-val").textContent = Number($("#fx-opacity").value).toFixed(
      2,
    );
    $("#fx-blend").innerHTML = BLENDS.map(
      (b) =>
        `<option ${(eff.mix?.blend ?? "Multiply") === b ? "selected" : ""}>${b}</option>`,
    ).join("");
    $("#fx-seed").value = eff.seed;
    $("#fx-hint").textContent = eff.type
      ? `type: ${eff.type}${ctx.ill.types[eff.type]?.style ? ` (recommended: ${ctx.ill.types[eff.type].style})` : ""}`
      : "no type set";
    buildGroups(eff, source);
    renderMeshLayer(eff, style, dims);
    return { eff, style };
  }
  function render() {
    const { eff, style } = renderControlsAndMesh();
    clearTimeout(debounce);
    debounce = setTimeout(() => fetchSubject(eff, style), 150);
  }

  $("#fx-size").innerHTML = Object.keys(ctx.data.sizes)
    .map((s) => `<option ${s === previewSize ? "selected" : ""}>${s}</option>`)
    .join("");
  $("#fx-size").onchange = () => {
    previewSize = $("#fx-size").value;
    clearExact();
    render();
  };
  $("#fx-opacity").oninput = () => {
    (entry().mix ??= {}).opacity = Number($("#fx-opacity").value);
    clearExact();
    changed();
  };
  $("#fx-blend").onchange = () => {
    (entry().mix ??= {}).blend = $("#fx-blend").value;
    clearExact();
    changed();
  };

  ctx.onChange(() => {
    clearExact();
    render();
  });
}
```

Notes for the implementer: `changed()` re-renders controls (rebuilding radios is fine at this scale); the mesh layer redraw during blob drag never touches the network (§3); `type` assignment UI: add one more control in `#fx-main` — a `<select id="fx-type">` listing `Object.keys(ctx.ill.types)` plus free-text entry via an `Other…` prompt, writing `entry().type` / deleting on empty — same pattern as the seed handler.

- [ ] **Step 2: Manual verification (§3 + §8 checklist)**

With `pnpm illustrate --force` outputs available and the studio running: select a cover slug → Effects tab; check: (1) style radio pins/unpins, rail deviation `!` appears when pinning against a type verdict (create one via `ill.types` in `images/illustration.json` first); (2) dragging opacity updates the preview without a full re-fetch of the mesh (subject request only, watch devtools network); (3) dragging a blob is 60 fps-ish with zero network requests and materializes `mesh.blobs` (save, inspect `illustration.json`); (4) reroll on materialized blobs asks confirmation, then discards blobs and changes seed; (5) an inherited knob shows `inherited`, a type-tier knob shows `type`, editing shows `image` + `↺`, and `↺` restores inheritance; (6) Render exact overlays the true composite and any knob change clears it; (7) killing ImageMagick availability (temporarily `PATH=/nonexistent`) surfaces stderr in the panel, not a blank frame.

- [ ] **Step 3: Round-trip check (§10.3)**

Save in the UI, then:

```bash
node -e "import('./images/scripts/lib/store.mjs').then(s => s.saveIllustration(s.loadIllustration()))"
git diff --exit-code images/illustration.json && echo ROUNDTRIP-OK
```

- [ ] **Step 4: Commit**

```bash
pnpm format:write images/scripts
git add images/scripts/studio/fx.mjs
git commit -m "feat(studio): effects tab with layered preview and tier markers"
```

---

### Task 5: Jobs — server runner + Run panel

**Files:**

- Modify: `images/scripts/studio.mjs`
- Create: `images/scripts/studio/run.mjs`

**Interfaces:**

- Consumes: `renderEntry` (boolean + manifest), `applicableStyles`, `resolveSettings`, `openManifest`/`flushManifest`, `writeSheet` (exported from `illustrate.mjs` in plan 1).
- Produces: `POST /api/job` body `{ step: "render-dirty" | "render-all" | "sheet" }` → `202 {started:true}` or `409` when one is running or `400` unknown step; `GET /api/job` → `{ step, running, done, total, errors: [] }` (§7). Jobs read **saved** state from disk. Per-entry errors are collected; one failure never aborts the batch (§9).

- [ ] **Step 1: Add the job runner to `studio.mjs`**

```js
import {
  openManifest,
  flushManifest,
  renderEntry,
  applicableStyles,
} from "./lib/render.mjs";
import { resolveSettings } from "./lib/resolve.mjs";
import { writeSheet } from "./illustrate.mjs";

let job = { step: null, running: false, done: 0, total: 0, errors: [] };
const yieldLoop = () => new Promise((r) => setImmediate(r)); // keep GET /api/job responsive

async function runJob(step) {
  job = { step, running: true, done: 0, total: 0, errors: [] };
  const out = join(ROOT, SETTINGS.out);
  mkdirSync(out, { recursive: true });
  try {
    if (step === "sheet") {
      job.total = 1;
      writeSheet(out);
      job.done = 1;
      return;
    }
    // Jobs run against SAVED state (§7) — reload both files from disk.
    const crops = loadCrops();
    const illustration = loadIllustration();
    openManifest(out);
    const force = step === "render-all";
    const work = [];
    for (const e of entries) {
      const { effective } = resolveSettings(e.slug, illustration, SETTINGS);
      for (const st of applicableStyles(e, SETTINGS.styles, effective))
        for (const sz of Object.keys(SETTINGS.sizes)) work.push([e, st, sz]);
    }
    job.total = work.length;
    for (const [e, st, sz] of work) {
      try {
        renderEntry(e, st, sz, { out, crops, illustration, force });
      } catch (err) {
        job.errors.push(
          `${e.slug} ${st} ${sz}: ${err.stderr?.toString() || err.message}`,
        );
      }
      job.done++;
      await yieldLoop();
    }
    flushManifest();
  } finally {
    job.running = false;
  }
}
```

Routes (inside the router):

```js
} else if (url.pathname === "/api/job" && req.method === "POST") {
  const { step } = await readJson(req);
  if (!["render-dirty", "render-all", "sheet"].includes(step))
    return sendErr(res, 400, `unknown step: ${step}`);
  if (job.running) return sendErr(res, 409, `job already running: ${job.step}`);
  runJob(step); // intentionally not awaited — bg job (§7)
  res.writeHead(202, { "content-type": "application/json" });
  res.end('{"started":true}');
} else if (url.pathname === "/api/job" && req.method === "GET") {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(job));
}
```

- [ ] **Step 2: Write `studio/run.mjs`**

```js
// Run panel — batch steps as jobs with polled progress (§7, §8).
export function initRun(ctx, root) {
  root.innerHTML = `
  <style>
    #run-buttons button { font:inherit; padding:.3rem 1rem; margin-right:.5rem; border:1px solid var(--line); background:none; color:var(--ink); cursor:pointer; }
    #run-buttons button:disabled { opacity:.4; cursor:default; }
    #run-bar { height:.6rem; background:var(--line); margin:.6rem 0; }
    #run-bar div { height:100%; width:0; background:var(--set); }
    #run-errors { color:var(--accent); white-space:pre-wrap; font-size:.8rem; }
  </style>
  <div id="run-buttons">
    <button data-step="render-dirty">Render dirty</button>
    <button data-step="render-all">Render all</button>
    <button data-step="sheet">Contact sheet</button>
    <span id="run-label"></span>
  </div>
  <div id="run-bar"><div></div></div>
  <pre id="run-errors"></pre>`;

  const $ = (s) => root.querySelector(s);
  const buttons = [...root.querySelectorAll("#run-buttons button")];
  let timer = null;

  function setBusy(b) {
    buttons.forEach((x) => (x.disabled = b));
  }

  async function poll() {
    const j = await (await fetch("/api/job")).json();
    $("#run-label").textContent = j.step
      ? `${j.step}: ${j.done}/${j.total}${j.running ? "" : " — done"}`
      : "";
    $("#run-bar div").style.width = j.total
      ? `${(100 * j.done) / j.total}%`
      : "0";
    $("#run-errors").textContent = j.errors.join("\n");
    if (j.running) timer = setTimeout(poll, 500);
    else setBusy(false);
  }

  for (const b of buttons) {
    b.onclick = async () => {
      // Jobs run against saved state — prompt to save first (§7).
      if (window.isDirty() && confirm("Unsaved edits. Save before running?"))
        await window.doSave();
      if (window.isDirty()) return; // user cancelled the save — don't run stale
      const res = await fetch("/api/job", {
        method: "POST",
        body: JSON.stringify({ step: b.dataset.step }),
      });
      if (!res.ok) return alert(await res.text());
      setBusy(true);
      clearTimeout(timer);
      poll();
    };
  }
}
```

- [ ] **Step 3: Verify end-to-end**

```bash
node images/scripts/studio.mjs --port 4382 --no-open &
sleep 1
curl -s -X POST -d '{"step":"render-dirty"}' http://127.0.0.1:4382/api/job   # {"started":true}
curl -s -X POST -d '{"step":"render-all"}' http://127.0.0.1:4382/api/job     # 409 while first runs
for i in 1 2 3; do sleep 2; curl -s http://127.0.0.1:4382/api/job; echo; done
kill %1
```

Expected: progress `done` advances; after a prior full CLI render, `render-dirty` finishes with `done == total` fast (all skips). In the browser: buttons disable during a run, progress bar fills, dirty-state prompts to save first. Sheet step: `images/out/review/index.html` regenerated.

- [ ] **Step 4: Commit**

```bash
pnpm format:write images/scripts
git add images/scripts/studio.mjs images/scripts/studio/run.mjs
git commit -m "feat(studio): batch jobs with polled progress"
```

---

### Task 6: Cutover — scripts, delete crop-ui, served-bytes check, final verification

**Files:**

- Modify: `package.json`
- Delete: `images/scripts/crop-ui.mjs`
- Modify: `images/scripts/illustrate.mjs` (drop compat re-exports)
- Create: `images/scripts/checks/served-lib.mjs`
- Modify: `images/scripts/README.md`

- [ ] **Step 1: Swap package.json scripts (§12: `pnpm crop` stays as alias)**

```json
"illustrate": "node images/scripts/illustrate.mjs",
"illustrate:sheet": "node images/scripts/illustrate.mjs --sheet",
"studio": "node images/scripts/studio.mjs",
"crop": "node images/scripts/studio.mjs",
```

- [ ] **Step 2: Delete crop-ui and the compat re-exports**

```bash
git rm images/scripts/crop-ui.mjs
```

In `illustrate.mjs`, delete the "Compat re-exports" block **except** `export { SETTINGS }`-style exports that other files still import — verify with:

```bash
rtk grep -rn "from \"./illustrate.mjs\"" images/scripts | grep -v illustrate.mjs
```

Expected remaining importer: `studio.mjs` (`writeSheet` only). Keep `export function writeSheet`; drop the rest.

- [ ] **Step 3: Served-bytes determinism check (§10.2)**

`images/scripts/checks/served-lib.mjs`:

```js
#!/usr/bin/env node
// §10.2 guardrail: the browser runs the renderer's own modules — assert the
// studio serves lib files byte-identical to disk, and mesh generation is
// deterministic. Usage: node served-lib.mjs [port]   (studio must be running)
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { generateBlobs, meshSvg } from "../lib/mesh.mjs";
import { SETTINGS } from "../../settings.mjs";

const port = process.argv[2] ?? "4380";
for (const name of ["util.mjs", "geometry.mjs", "mesh.mjs", "resolve.mjs"]) {
  const res = await fetch(`http://127.0.0.1:${port}/lib/${name}`);
  assert.ok(res.ok, `${name}: ${res.status}`);
  assert.equal(
    await res.text(),
    readFileSync(new URL(`../lib/${name}`, import.meta.url), "utf8"),
    `${name} served bytes differ from disk`,
  );
}
const colors = { bg: "#f5ffe1", tint: "#1e1e1e", accent: "#0d9488" };
const a = meshSvg(
  generateBlobs("sample:light", SETTINGS.mesh),
  colors,
  SETTINGS.mesh,
  1200,
  630,
);
const b = meshSvg(
  generateBlobs("sample:light", SETTINGS.mesh),
  colors,
  SETTINGS.mesh,
  1200,
  630,
);
assert.equal(a, b, "meshSvg not deterministic");
console.log("served-lib OK: modules byte-identical, mesh deterministic");
```

Run: `node images/scripts/studio.mjs --port 4382 --no-open & sleep 1 && node images/scripts/checks/served-lib.mjs 4382; kill %1`
Expected: `served-lib OK ...`

- [ ] **Step 4: README**

Rewrite the crop-ui section of `images/scripts/README.md`: `pnpm studio` (Crop + Effects tabs, Run panel), `pnpm crop` alias note, routes summary, the module layout tree from studio-design.md §4, security posture (127.0.0.1 + Origin checks), and the checks/ scripts (`signatures.sh`, `served-lib.mjs`).

- [ ] **Step 5: Full verification sweep (§10)**

```bash
node --test images/scripts/lib/                                   # unit tests
pnpm illustrate --force && bash images/scripts/checks/signatures.sh > "$SCRATCH/final.txt"
diff "$SCRATCH/baseline.txt" "$SCRATCH/final.txt" && echo IDENTICAL   # §10.1 (with empty/absent illustration.json)
pnpm illustrate                                                    # §10.5 → 0 rendered
pnpm studio --port 4382 --no-open & sleep 1
node images/scripts/checks/served-lib.mjs 4382                     # §10.2
kill %1
pnpm build                                                         # §10.6
pnpm format:write images/scripts && pnpm format:check
```

All green. (§10.3 round-trip and §10.4 type-tier were verified in Task 4 Step 3 and plan 2 Task 4 Step 5; re-run them here if `illustration.json` changed since.)

- [ ] **Step 6: Commit**

```bash
git add -A images/scripts package.json
git commit -m "feat(studio): cutover — pnpm studio, crop alias, remove crop-ui"
```

---

## Execution notes

- Depends on plans 1 and 2 landed. Baseline signature file from plan 1 required for the final §10.1 check (regenerate from a clean tree if the session changed).
- Browser-manual steps (Task 2 Step 3, Task 4 Step 2) need a human or a browser-driving tool; everything else is CLI-verifiable.
- Out of scope (spec §11): anything under `src/`; frontmatter migration happens at step-2 entry, not here.
