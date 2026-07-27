// Crop panel — focal point + zoom per cover image, with an optional override
// per output size. Ported from crop-ui.mjs's client <script> (studio-plan-3
// Task 2); crop math now lives in /lib/geometry.mjs, the single copy shared
// with the CLI renderer (illustrate.mjs) — no more hand-synced duplicate.

import { cropBox, resolveCrop } from "/lib/geometry.mjs";

// "base" pseudo-tab resolves the slug-level crop; size tabs use the lib.
const resolveTab = (entry, name) =>
  name === "base"
    ? { focus: entry?.focus ?? [0.5, 0.5], zoom: entry?.zoom ?? 1 }
    : resolveCrop(entry, name);

const PREVIEW_W = 280;

export function initCrop(ctx, root) {
  root.innerHTML = `
<style>
  .crop-tabrow { display:flex; align-items:center; gap:.6rem; margin-bottom:.8rem; flex-wrap:wrap; }
  #crop-tabs { display:flex; gap:.3rem; flex-wrap:wrap; }
  #crop-tabs button { font:inherit; font-size:.8rem; padding:.25rem .9rem; background:none; color:var(--muted); border:1px solid var(--line); cursor:pointer; }
  #crop-tabs button.active { background:var(--ink); color:var(--paper); border-color:var(--ink); }
  #crop-tabs button .own { color:var(--set); }
  #crop-tabs button.active .own { color:inherit; }
  #crop-count { color:var(--muted); font-size:.75rem; }
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
<div class="crop-tabrow">
  <div id="crop-tabs"></div>
  <span id="crop-count"></span>
</div>
<div id="stage">
  <img id="big" alt="">
  <div id="marker"></div>
</div>
<div id="controls">
  <label>zoom <input type="range" id="zoom" min="1" max="3" step="0.05" value="1"> <span id="zoomval">1.00</span></label>
  <button id="reset">Reset</button>
  <span id="hint"></span>
</div>
<div id="previews"></div>`;

  const $ = (s) => root.querySelector(s);
  let tab = "base";
  let previewEls = {};
  const cropSizes = Object.keys(ctx.data.sizes).filter(
    (n) => ctx.data.sizes[n],
  );

  // The crop actually stored for this tab (null = inheriting / unset).
  function ownCrop(entry, name) {
    if (!entry) return null;
    if (name === "base")
      return entry.focus || entry.zoom !== undefined ? entry : null;
    return entry.sizes?.[name] ?? null;
  }

  // Merge a patch into whatever the active tab writes to, creating it on demand.
  function writeTarget(patch) {
    const e = (ctx.crops[ctx.current] ??= {});
    if (tab === "base") Object.assign(e, patch);
    else Object.assign(((e.sizes ??= {})[tab] ??= {}), patch);
    ctx.markDirty();
  }

  const overrideCount = (slug) =>
    Object.keys(ctx.crops[slug]?.sizes ?? {}).length;
  const hasAny = (slug) =>
    !!ownCrop(ctx.crops[slug], "base") || overrideCount(slug) > 0;

  function updateCount() {
    const total = ctx.data.slugs.length;
    const set = ctx.data.slugs.filter(({ slug }) => hasAny(slug)).length;
    $("#crop-count").textContent = `${set}/${total} set`;
  }

  function buildTabs() {
    const bar = $("#crop-tabs");
    bar.innerHTML = "";
    for (const name of ["base", ...cropSizes]) {
      const b = document.createElement("button");
      b.className = name === tab ? "active" : "";
      b.textContent = name;
      if (ownCrop(ctx.crops[ctx.current], name)) {
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

  // Called on select (ctx.onChange) — the old select() minus rail work, which
  // the shell now owns.
  function loadImage(slug) {
    const img = $("#big");
    img.onload = render;
    img.src = "/img/" + encodeURIComponent(slug);
    for (const name of cropSizes) previewEls[name].img.src = img.src;
    if (img.complete) render();
  }

  function render() {
    if (!ctx.current) return;
    buildTabs();
    const img = $("#big");
    const entry = ctx.crops[ctx.current];
    const active = resolveTab(entry, tab);
    const own = ownCrop(entry, tab);

    const marker = $("#marker");
    marker.style.display = "block";
    marker.classList.toggle("inherited", !own?.focus);
    marker.style.left = active.focus[0] * 100 + "%";
    marker.style.top = active.focus[1] * 100 + "%";

    $("#zoom").value = active.zoom;
    $("#zoomval").textContent = active.zoom.toFixed(2);
    $("#reset").textContent = tab === "base" ? "Reset all" : "Inherit base";
    $("#reset").disabled = tab === "base" ? !entry : !own;
    $("#hint").textContent =
      tab === "base"
        ? "base — used by every size without its own crop"
        : own
          ? `${tab} — own crop`
          : `${tab} — inheriting base; drag on the image or move zoom to override`;

    const natW = img.naturalWidth,
      natH = img.naturalHeight;
    for (const name of cropSizes) {
      const dims = ctx.data.sizes[name];
      const el = previewEls[name];
      const box = cropBox(natW, natH, dims.w, dims.h, resolveTab(entry, name));
      const scale = PREVIEW_W / box.w;
      el.root.classList.toggle("active", name === tab);
      el.label.textContent = `${name} ${dims.w}×${dims.h}${ownCrop(entry, name) ? " ·own" : ""}`;
      el.img.style.width = natW * scale + "px";
      el.img.style.left = -box.x * scale + "px";
      el.img.style.top = -box.y * scale + "px";
    }
    updateCount();
  }

  // Built once — render() only moves the inner images, so dragging stays smooth.
  function buildPreviews() {
    const holder = $("#previews");
    holder.innerHTML = "";
    previewEls = {};
    for (const name of cropSizes) {
      const dims = ctx.data.sizes[name];
      const previewRoot = document.createElement("div");
      previewRoot.className = "prev";
      previewRoot.title = "edit " + name;
      const label = document.createElement("div");
      label.className = "label";
      const box = document.createElement("div");
      box.className = "box";
      box.style.width = PREVIEW_W + "px";
      box.style.height = Math.round((PREVIEW_W * dims.h) / dims.w) + "px";
      const im = document.createElement("img");
      box.appendChild(im);
      previewRoot.append(label, box);
      previewRoot.onclick = () => {
        tab = name;
        render();
      };
      holder.appendChild(previewRoot);
      previewEls[name] = { root: previewRoot, label, img: im };
    }
  }

  // Click or drag anywhere on the big image to place the focal point of the
  // active tab. Pointer capture keeps the drag alive outside the image bounds.
  function placeFocus(e) {
    const r = $("#big").getBoundingClientRect();
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    const round = (v) => Math.round(clamp01(v) * 1000) / 1000;
    const z = Number($("#zoom").value);
    const patch = {
      focus: [
        round((e.clientX - r.left) / r.width),
        round((e.clientY - r.top) / r.height),
      ],
    };
    // On a size tab, only pin zoom when it actually differs from base — otherwise
    // the override keeps tracking base zoom.
    if (tab === "base" || z !== resolveTab(ctx.crops[ctx.current], "base").zoom)
      patch.zoom = z;
    writeTarget(patch);
  }

  let dragFrame = null;
  const stage = $("#stage");

  stage.onpointerdown = (e) => {
    if (!ctx.current) return;
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("dragging");
    placeFocus(e);
    ctx.refreshRail();
    render();
  };

  stage.onpointermove = (e) => {
    if (!ctx.current || !stage.hasPointerCapture(e.pointerId)) return;
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
    ctx.refreshRail();
    render();
  };

  $("#zoom").oninput = () => {
    $("#zoomval").textContent = Number($("#zoom").value).toFixed(2);
    if (!ctx.current) return;
    writeTarget({ zoom: Number($("#zoom").value) });
    ctx.refreshRail();
    render();
  };

  $("#reset").onclick = () => {
    if (!ctx.current) return;
    if (tab === "base") delete ctx.crops[ctx.current];
    else delete ctx.crops[ctx.current]?.sizes?.[tab];
    ctx.markDirty();
    ctx.refreshRail();
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
      if (
        kept.focus ||
        Object.keys(sizes).length ||
        (kept.zoom !== undefined && kept.zoom !== 1)
      ) {
        out[slug] = kept;
      }
    }
    return out;
  }

  ctx.onBeforeSave(() => {
    const p = prune(ctx.crops);
    for (const k of Object.keys(ctx.crops)) delete ctx.crops[k];
    Object.assign(ctx.crops, p);
  });

  buildPreviews();
  ctx.onChange(({ slug }) => loadImage(slug));
}
