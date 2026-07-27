#!/usr/bin/env node
// ============================================================================
// Crop UI — local page to set a focal point + zoom per cover image, with an
// optional override per output size (thumb / small / square).
// Writes images/crops.json, consumed by illustrate.mjs.
//
// Entry shape: { focus, zoom, sizes?: { <size>: { focus?, zoom? } } }
// The root focus/zoom is the base; a size override wins field by field.
//
// Usage:
//   node images/scripts/crop-ui.mjs           # http://localhost:4380, opens browser
//   node images/scripts/crop-ui.mjs --port 5000
// ============================================================================

import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { execFile } from "node:child_process";
import { SETTINGS, ROOT, scanContent, loadCrops } from "./illustrate.mjs";

const portArg = process.argv.indexOf("--port");
const port = portArg > -1 ? Number(process.argv[portArg + 1]) : 4380;
const entries = scanContent().filter((e) => e.img);
const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);

  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(PAGE);
  } else if (url.pathname === "/api/data") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        slugs: entries.map((e) => e.slug),
        crops: loadCrops(),
        sizes: SETTINGS.sizes,
      }),
    );
  } else if (url.pathname.startsWith("/img/")) {
    const entry = bySlug[decodeURIComponent(url.pathname.slice(5))];
    if (!entry || !existsSync(entry.img)) {
      res.writeHead(404);
      return res.end("not found");
    }
    res.writeHead(200, {
      "content-type":
        MIME[extname(entry.img).toLowerCase()] ?? "application/octet-stream",
    });
    res.end(readFileSync(entry.img));
  } else if (url.pathname === "/api/save" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const crops = JSON.parse(body);
        writeFileSync(
          join(ROOT, SETTINGS.cropsFile),
          JSON.stringify(crops, null, 2) + "\n",
        );
        res.writeHead(200, { "content-type": "application/json" });
        res.end(`{"saved":${Object.keys(crops).length}}`);
      } catch (err) {
        res.writeHead(400);
        res.end(err.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end("not found");
  }
});

const PAGE = /* html */ `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crop UI — focal points</title>
<style>
:root { --paper:#f5ffe1; --ink:#1e1e1e; --muted:#5b5b5b; --line:#d1ddbb; --accent:#ff5a3c; --set:#0d9488; }
@media (prefers-color-scheme: dark) {
  :root { --paper:#1e1e1e; --ink:#ececec; --muted:#9b9b9b; --line:#4c4c4c; }
}
* { box-sizing: border-box; }
body { margin:0; background:var(--paper); color:var(--ink); font:14px/1.5 ui-monospace,monospace; }
header { display:flex; align-items:center; gap:1rem; padding:.7rem 1rem; border-bottom:2px solid var(--ink); position:sticky; top:0; background:var(--paper); z-index:2; }
header h1 { font-size:1rem; margin:0; }
#status { color:var(--muted); }
#save { margin-left:auto; font:inherit; padding:.4rem 1.2rem; background:var(--ink); color:var(--paper); border:none; cursor:pointer; }
#save.dirty { background:var(--accent); color:#fff; }
main { display:grid; grid-template-columns: 220px 1fr; min-height: calc(100vh - 53px); }
#rail { border-right:1px solid var(--line); overflow-y:auto; max-height:calc(100vh - 53px); position:sticky; top:53px; }
.thumb { display:block; width:100%; padding:.5rem; border:none; background:none; cursor:pointer; text-align:left; border-bottom:1px solid var(--line); color:var(--ink); font:inherit; }
.thumb img { width:100%; display:block; border:1px solid var(--line); }
.thumb .name { font-size:.7rem; word-break:break-all; display:flex; gap:.3rem; align-items:baseline; }
.thumb.active { background:color-mix(in srgb, var(--ink) 8%, transparent); }
.dot { width:.5rem; height:.5rem; border-radius:50%; background:var(--line); flex:none; }
.thumb.set .dot { background:var(--set); }
.thumb .over { color:var(--set); font-size:.65rem; margin-left:auto; }
#work { padding:1rem 1.5rem 3rem; }
#tabs { display:flex; gap:.3rem; margin-bottom:.8rem; flex-wrap:wrap; }
#tabs button { font:inherit; font-size:.8rem; padding:.25rem .9rem; background:none; color:var(--muted); border:1px solid var(--line); cursor:pointer; }
#tabs button.active { background:var(--ink); color:var(--paper); border-color:var(--ink); }
#tabs button .own { color:var(--set); }
#tabs button.active .own { color:inherit; }
#stage { position:relative; display:inline-block; max-width:100%; cursor:crosshair; touch-action:none; user-select:none; }
#stage.dragging { cursor:grabbing; }
#stage img { max-width:100%; max-height:60vh; display:block; border:1px solid var(--line); -webkit-user-drag:none; }
#marker { position:absolute; width:22px; height:22px; margin:-11px 0 0 -11px; border:2px solid var(--accent); border-radius:50%; pointer-events:none; box-shadow:0 0 0 1px #fff8; display:none; }
#marker::after { content:""; position:absolute; inset:8px; background:var(--accent); border-radius:50%; }
#marker.inherited { border-style:dashed; opacity:.55; }
#marker.inherited::after { display:none; }
#controls { display:flex; align-items:center; gap:1rem; margin:.8rem 0 1.2rem; flex-wrap:wrap; }
#controls label { color:var(--muted); }
#zoom { width:200px; accent-color: var(--accent); }
#reset { font:inherit; background:none; border:1px solid var(--line); color:var(--ink); padding:.2rem .8rem; cursor:pointer; }
#reset:disabled { opacity:.4; cursor:default; }
#hint { color:var(--muted); font-size:.75rem; }
#previews { display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-start; }
.prev { cursor:pointer; }
.prev .label { font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:.3rem; }
.prev.active .label { color:var(--accent); }
.prev .box { position:relative; overflow:hidden; border:1px solid var(--line); }
.prev.active .box { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent); }
.prev .box img { position:absolute; display:block; max-width:none; }
</style>
<header>
  <h1>Crop UI</h1>
  <span id="status"></span>
  <button id="save">Save</button>
</header>
<main>
  <nav id="rail"></nav>
  <section id="work">
    <div id="tabs"></div>
    <div id="stage">
      <img id="big" alt="">
      <div id="marker"></div>
    </div>
    <div id="controls">
      <label>zoom <input type="range" id="zoom" min="1" max="3" step="0.05" value="1"> <span id="zoomval">1.00</span></label>
      <button id="reset">Reset</button>
      <span id="hint"></span>
    </div>
    <div id="previews"></div>
  </section>
</main>
<script>
let DATA, crops, current = null, tab = "base", dirty = false, cropSizes = [], previewEls = {};
const PREVIEW_W = 280;

// same contract as resolveCrop() in illustrate.mjs — keep in sync.
// "base" = the slug-level focus/zoom; a size tab falls back to it field by field.
function resolveCrop(entry, name) {
  const base = { focus: entry?.focus ?? [0.5, 0.5], zoom: entry?.zoom ?? 1 };
  if (name === "base") return base;
  const over = entry?.sizes?.[name];
  return over ? { focus: over.focus ?? base.focus, zoom: over.zoom ?? base.zoom } : base;
}

// The crop actually stored for this tab (null = inheriting / unset).
function ownCrop(entry, name) {
  if (!entry) return null;
  if (name === "base") return entry.focus || entry.zoom !== undefined ? entry : null;
  return entry.sizes?.[name] ?? null;
}

// Merge a patch into whatever the active tab writes to, creating it on demand.
function writeTarget(patch) {
  const e = (crops[current] ??= {});
  if (tab === "base") Object.assign(e, patch);
  else Object.assign(((e.sizes ??= {})[tab] ??= {}), patch);
  setDirty(true);
}

const overrideCount = (slug) => Object.keys(crops[slug]?.sizes ?? {}).length;
const hasAny = (slug) => !!ownCrop(crops[slug], "base") || overrideCount(slug) > 0;

// same contract as cropBox() in illustrate.mjs — keep the math in sync
function cropBox(srcW, srcH, w, h, crop) {
  const focus = crop?.focus ?? [0.5, 0.5];
  const zoom = crop?.zoom ?? 1;
  const ratio = w / h;
  const boxW = Math.min(srcW, srcH * ratio) / zoom;
  const boxH = boxW / ratio;
  const clamp = (v, max) => Math.min(Math.max(v, 0), max);
  return {
    x: clamp(focus[0] * srcW - boxW / 2, srcW - boxW),
    y: clamp(focus[1] * srcH - boxH / 2, srcH - boxH),
    w: boxW, h: boxH,
  };
}

const $ = (s) => document.querySelector(s);

function setDirty(v) {
  dirty = v;
  $("#save").classList.toggle("dirty", v);
  updateStatus();
}

function updateStatus() {
  const set = DATA.slugs.filter(hasAny).length;
  $("#status").textContent = \`\${set}/\${DATA.slugs.length} set\${dirty ? " · unsaved" : ""}\`;
}

function buildRail() {
  const rail = $("#rail");
  rail.innerHTML = "";
  for (const slug of DATA.slugs) {
    const b = document.createElement("button");
    b.className = "thumb" + (hasAny(slug) ? " set" : "") + (slug === current ? " active" : "");
    const im = document.createElement("img");
    im.loading = "lazy";
    im.src = "/img/" + encodeURIComponent(slug);
    const name = document.createElement("span");
    name.className = "name";
    const dot = document.createElement("span");
    dot.className = "dot";
    name.appendChild(dot);
    name.appendChild(document.createTextNode(slug));
    const n = overrideCount(slug);
    if (n) {
      const over = document.createElement("span");
      over.className = "over";
      over.textContent = "+" + n;
      name.appendChild(over);
    }
    b.append(im, name);
    b.onclick = () => select(slug);
    rail.appendChild(b);
  }
}

function buildTabs() {
  const bar = $("#tabs");
  bar.innerHTML = "";
  for (const name of ["base", ...cropSizes]) {
    const b = document.createElement("button");
    b.className = name === tab ? "active" : "";
    b.textContent = name;
    if (ownCrop(crops[current], name)) {
      const mark = document.createElement("span");
      mark.className = "own";
      mark.textContent = " •";
      b.appendChild(mark);
    }
    b.onclick = () => {
      tab = name;
      render();
    };
    bar.appendChild(b);
  }
}

function select(slug) {
  current = slug;
  const img = $("#big");
  img.onload = render;
  img.src = "/img/" + encodeURIComponent(slug);
  for (const name of cropSizes) previewEls[name].img.src = img.src;
  buildRail();
  if (img.complete) render();
}

function render() {
  if (!current) return;
  buildTabs();
  const img = $("#big");
  const entry = crops[current];
  const active = resolveCrop(entry, tab);
  const own = ownCrop(entry, tab);

  const marker = $("#marker");
  marker.style.display = "block";
  marker.classList.toggle("inherited", !own?.focus);
  marker.style.left = (active.focus[0] * 100) + "%";
  marker.style.top = (active.focus[1] * 100) + "%";

  $("#zoom").value = active.zoom;
  $("#zoomval").textContent = active.zoom.toFixed(2);
  $("#reset").textContent = tab === "base" ? "Reset all" : "Inherit base";
  $("#reset").disabled = tab === "base" ? !entry : !own;
  $("#hint").textContent = tab === "base"
    ? "base — used by every size without its own crop"
    : own ? \`\${tab} — own crop\` : \`\${tab} — inheriting base; drag on the image or move zoom to override\`;

  const natW = img.naturalWidth, natH = img.naturalHeight;
  for (const name of cropSizes) {
    const dims = DATA.sizes[name];
    const el = previewEls[name];
    const box = cropBox(natW, natH, dims.w, dims.h, resolveCrop(entry, name));
    const scale = PREVIEW_W / box.w;
    el.root.classList.toggle("active", name === tab);
    el.label.textContent = \`\${name} \${dims.w}×\${dims.h}\${ownCrop(entry, name) ? " ·own" : ""}\`;
    el.img.style.width = (natW * scale) + "px";
    el.img.style.left = (-box.x * scale) + "px";
    el.img.style.top = (-box.y * scale) + "px";
  }
}

// Built once — render() only moves the inner images, so dragging stays smooth.
function buildPreviews() {
  const holder = $("#previews");
  holder.innerHTML = "";
  previewEls = {};
  for (const name of cropSizes) {
    const dims = DATA.sizes[name];
    const root = document.createElement("div");
    root.className = "prev";
    root.title = "edit " + name;
    const label = document.createElement("div");
    label.className = "label";
    const box = document.createElement("div");
    box.className = "box";
    box.style.width = PREVIEW_W + "px";
    box.style.height = Math.round(PREVIEW_W * dims.h / dims.w) + "px";
    const im = document.createElement("img");
    box.appendChild(im);
    root.append(label, box);
    root.onclick = () => {
      tab = name;
      render();
    };
    holder.appendChild(root);
    previewEls[name] = { root, label, img: im };
  }
}

// Click or drag anywhere on the big image to place the focal point of the
// active tab. Pointer capture keeps the drag alive outside the image bounds.
function placeFocus(e) {
  const r = $("#big").getBoundingClientRect();
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const round = (v) => Math.round(clamp01(v) * 1000) / 1000;
  const z = Number($("#zoom").value);
  const patch = { focus: [round((e.clientX - r.left) / r.width), round((e.clientY - r.top) / r.height)] };
  // On a size tab, only pin zoom when it actually differs from base — otherwise
  // the override keeps tracking base zoom.
  if (tab === "base" || z !== resolveCrop(crops[current], "base").zoom) patch.zoom = z;
  writeTarget(patch);
}

let dragFrame = null;
const stage = $("#stage");

stage.onpointerdown = (e) => {
  if (!current) return;
  e.preventDefault();
  stage.setPointerCapture(e.pointerId);
  stage.classList.add("dragging");
  placeFocus(e);
  buildRail();
  render();
};

stage.onpointermove = (e) => {
  if (!current || !stage.hasPointerCapture(e.pointerId)) return;
  if (dragFrame) return; // one update per frame
  dragFrame = requestAnimationFrame(() => {
    dragFrame = null;
    placeFocus(e);
    render();
  });
};

stage.onpointerup = stage.onpointercancel = (e) => {
  stage.releasePointerCapture(e.pointerId);
  stage.classList.remove("dragging");
  if (dragFrame) {
    cancelAnimationFrame(dragFrame);
    dragFrame = null;
  }
  buildRail();
  render();
};

$("#zoom").oninput = () => {
  $("#zoomval").textContent = Number($("#zoom").value).toFixed(2);
  if (!current) return;
  writeTarget({ zoom: Number($("#zoom").value) });
  buildRail();
  render();
};

$("#reset").onclick = () => {
  if (!current) return;
  if (tab === "base") delete crops[current];
  else delete crops[current]?.sizes?.[tab];
  setDirty(true);
  buildRail();
  render();
};

// Drop empty shells so crops.json only carries real decisions.
function prune(all) {
  const out = {};
  for (const [slug, e] of Object.entries(all)) {
    const sizes = {};
    for (const [name, o] of Object.entries(e.sizes ?? {})) {
      if (o?.focus || o?.zoom !== undefined) sizes[name] = o;
    }
    const kept = {};
    if (e.focus) kept.focus = e.focus;
    if (e.zoom !== undefined) kept.zoom = e.zoom;
    if (Object.keys(sizes).length) kept.sizes = sizes;
    if (kept.focus || Object.keys(sizes).length || (kept.zoom !== undefined && kept.zoom !== 1)) {
      out[slug] = kept;
    }
  }
  return out;
}

addEventListener("beforeunload", (e) => {
  if (!dirty) return;
  e.preventDefault();
  e.returnValue = "";
});

$("#save").onclick = async () => {
  crops = prune(crops);
  const res = await fetch("/api/save", { method: "POST", body: JSON.stringify(crops) });
  if (res.ok) {
    setDirty(false);
    buildRail();
    render();
  } else alert("save failed: " + (await res.text()));
};

(async () => {
  DATA = await (await fetch("/api/data")).json();
  crops = DATA.crops;
  cropSizes = Object.keys(DATA.sizes).filter((n) => DATA.sizes[n]);
  buildPreviews();
  updateStatus();
  buildRail();
  if (DATA.slugs.length) select(DATA.slugs[0]);
})();
</script>`;

server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(
    `crop-ui → ${url} (${entries.length} covers, writes ${SETTINGS.cropsFile})`,
  );
  execFile("xdg-open", [url], () => {});
});
