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
