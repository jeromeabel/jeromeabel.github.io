// Shell HTML — header (tabs + status + Run + Save), rail, panel host. Loads
// /api/data once, builds the shared ctx, and boots each panel's init(ctx, root)
// (studio-plan-3 Task 2, §8).
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
const hooks = [];
ctx.beforeSave = () => hooks.forEach((f) => f());
ctx.onBeforeSave = (f) => hooks.push(f);

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
  ctx.beforeSave?.();
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
