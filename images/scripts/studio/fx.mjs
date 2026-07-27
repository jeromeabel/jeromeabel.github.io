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
    <div class="knob">type <select id="fx-type"></select></div>
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
  // Pointer capture lives on the STABLE #fx-blobs svg (never destroyed mid-drag),
  // not on the <ellipse> being dragged — renderControlsAndMesh() replaces the
  // svg's innerHTML on every settled frame, which would otherwise blow away the
  // captured element (and its handlers) after one frame. During the drag we
  // only mutate the dragged ellipse's cx/cy attributes directly (cheap); the
  // full materialize-into-ctx.ill write + mesh redraw happens once, on
  // pointerup, same as the reference pattern in crop.mjs's #stage drag.
  let dragFrame = null;
  let dragIndex = null; // index of the ellipse being dragged, set at pointerdown
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
    svg.onpointerdown = (e) => {
      const el = e.target.closest("ellipse");
      if (!el) return;
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      dragIndex = Number(el.dataset.i);
    };
    svg.onpointermove = (ev) => {
      if (
        dragIndex === null ||
        !svg.hasPointerCapture(ev.pointerId) ||
        dragFrame
      )
        return;
      dragFrame = requestAnimationFrame(() => {
        dragFrame = null;
        const el = svg.querySelector(`ellipse[data-i="${dragIndex}"]`);
        if (!el) return;
        const pt = svgPoint(svg, ev);
        const cx = Math.round(pt.x);
        const cy = Math.round(pt.y);
        el.setAttribute("cx", cx);
        el.setAttribute("cy", cy);
        el.setAttribute(
          "transform",
          `rotate(${blobs[dragIndex].rot} ${cx} ${cy})`,
        );
      });
    };
    svg.onpointerup = svg.onpointercancel = (e) => {
      if (dragIndex === null) return;
      svg.releasePointerCapture(e.pointerId);
      const i = dragIndex;
      dragIndex = null;
      const el = svg.querySelector(`ellipse[data-i="${i}"]`);
      const cx = Number(el?.getAttribute("cx"));
      const cy = Number(el?.getAttribute("cy"));
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
      // Materialize on drag end: the file becomes the truth (§6).
      const { effective: eff } = resolved();
      const theme =
        activeStyle(eff) === "mesh" ? "light" : eff.settings.onMesh.theme;
      const cur =
        entry().mesh?.blobs ??
        structuredClone(
          eff.mesh?.blobs ??
            generateBlobs(`${eff.seed}:${theme}`, eff.settings.mesh),
        );
      cur[i] = { ...cur[i], cx, cy };
      (entry().mesh ??= {}).blobs = cur;
      clearExact();
      ctx.markDirty();
      ctx.refreshRail();
      renderControlsAndMesh(); // mesh redraw only — no server call (§3)
    };
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

  // Type assignment — same interaction pattern as the seed handler above:
  // pick a known type, or "Other…" to free-type a new one via prompt().
  $("#fx-type").onchange = () => {
    const v = $("#fx-type").value;
    if (v === "__other__") {
      const typed = (prompt("New type name:", "") ?? "").trim();
      if (!typed) {
        renderControlsAndMesh(); // cancelled — restore select to actual value
        return;
      }
      entry().type = typed;
    } else if (v) {
      entry().type = v;
    } else {
      delete entry().type;
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

  function buildTypeSelect(eff) {
    const sel = $("#fx-type");
    const types = Object.keys(ctx.ill.types);
    const opts = ['<option value="">(no type)</option>'].concat(
      types.map(
        (t) =>
          `<option value="${t}" ${eff.type === t ? "selected" : ""}>${t}</option>`,
      ),
    );
    opts.push('<option value="__other__">Other…</option>');
    sel.innerHTML = opts.join("");
    // eff.type may be a free-typed value not (yet) in ctx.ill.types — keep it
    // selectable/visible rather than silently falling back to "(no type)".
    if (eff.type && !types.includes(eff.type)) {
      sel.insertAdjacentHTML(
        "beforeend",
        `<option value="${eff.type}" selected>${eff.type}</option>`,
      );
    } else {
      sel.value = eff.type ?? "";
    }
  }

  // Mirrors applicableStyles' base partition in lib/render.mjs (image-less
  // entries: mesh only; image-bearing entries: everything but pure mesh) —
  // that file isn't served to the client (it touches node:fs), so the
  // predicate is duplicated here rather than imported. Keep in sync with
  // lib/render.mjs's applicableStyles if that partition ever changes.
  const applicableStyle = (s) => (hasImg() ? s !== "mesh" : s === "mesh");

  function buildStyleRadios(eff, source) {
    const opts = [
      '<label><input type="radio" name="fxstyle" value="">auto (all styles)</label>',
    ].concat(
      ctx.data.styles
        .filter(applicableStyle)
        .map(
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
    // #fx-preview has no CSS size of its own — it's normally sized by the
    // in-flow #fx-subject img, but fetchSubject clears that img's src for
    // image-less entries and the pure "mesh" style, which would otherwise
    // collapse the container (and the absolutely-positioned mesh/blob SVGs
    // with it) to 0×0. Pin the container to the resolved render dims
    // unconditionally so it holds its size regardless of style/hasImg state.
    $("#fx-preview").style.width = dims.w + "px";
    $("#fx-preview").style.height = dims.h + "px";
    buildTypeSelect(eff);
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
