---
task: P3-T09
title: Dark rows and the 32-frame grid
phase: 3
status: TODO
prerequisite: P3-T02 … P3-T08 (all 8 routes built)
---

# P3-T09 — 32 frames on one grid

8 routes × `Desktop · Mobile · Desktop [Dark] · Mobile [Dark]`. Each light master becomes a COMPONENT with its modes pinned; each Dark frame is an **instance** of it with `2 Theme = Dark`. That is the whole point: dark is not a redraw, it is a mode.

Routes, in grid order:

`Home` · `Blog` · `Work` · `About` · `Post` · `Serie` · `Serie post` · `Work detail`

Naming is exact — `{Route} — {Breakpoint}` and `{Route} — {Breakpoint} [Dark]`, with an em dash and single spaces.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — convert light masters to COMPONENT and pin their modes

A Dark frame can only be an instance if its light counterpart is a component.

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const out = [];
for (const route of ROUTES)
  for (const bp of ["Desktop", "Mobile"]) {
    const name = `${route} — ${bp}`;
    let node = page.children.find((c) => c.name === name);
    if (!node) { out.push({ name, missing: true }); continue; }
    if (node.type === "FRAME") node = figma.createComponentFromNode(node);
    node.name = name;
    const modes = pin(node, V, {
      "2 Theme": "Light",
      "3 Responsive": bp === "Mobile" ? "Mobile" : "Desktop",
    });
    out.push({ name, id: node.id, type: node.type, modes });
  }
return out;
```

Any `missing: true` **stops the task** — that route master was never built. Go back to its brief; do not build a placeholder.

## Step 2 — create the 16 Dark instances

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const made = [];
for (const route of ROUTES)
  for (const bp of ["Desktop", "Mobile"]) {
    const master = page.children.find(
      (c) => c.type === "COMPONENT" && c.name === `${route} — ${bp}`,
    );
    const darkName = `${route} — ${bp} [Dark]`;
    const existing = page.children.find((c) => c.name === darkName);
    if (existing) existing.remove();  // old dark frames are detached copies of this task's own output
    const dark = master.createInstance();
    dark.name = darkName;
    page.appendChild(dark);
    const modes = pin(dark, V, {
      "2 Theme": "Dark",
      "3 Responsive": bp === "Mobile" ? "Mobile" : "Desktop",
    });
    made.push({ name: darkName, id: dark.id, type: dark.type, modes, h: Math.round(dark.height) });
  }
return made;
```

Removing an existing `[Dark]` frame is the one deletion allowed here, and only because those frames are this task's own prior output — machine-generated, never hand-designed. If a `[Dark]` frame contains anything a person clearly drew, stop and report instead of removing it.

## Step 3 — lay out the 8×4 grid

```js
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const COL_GAP = 160, ROW_GAP = 240, X0 = 0, Y0 = 0;
let y = Y0;
const placed = [];
for (const route of ROUTES) {
  const row = [
    `${route} — Desktop`, `${route} — Mobile`,
    `${route} — Desktop [Dark]`, `${route} — Mobile [Dark]`,
  ].map((n) => page.children.find((c) => c.name === n));
  if (row.some((n) => !n)) throw new Error(`row ${route} incomplete`);
  let x = X0;
  for (const n of row) { n.x = x; n.y = y; x += n.width + COL_GAP; placed.push(n.name); }
  y += Math.max(...row.map((n) => n.height)) + ROW_GAP;
}
return { placed, rows: ROUTES.length, total: placed.length };
```

`total` must be **32**.

## Step 4 — prove the Dark rows did not drift

Fresh run. For each route/breakpoint compare the light master's height with its Dark instance's height:

```js
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const ROUTES = ["Home", "Blog", "Work", "About", "Post", "Serie", "Serie post", "Work detail"];
const drift = [];
for (const route of ROUTES)
  for (const bp of ["Desktop", "Mobile"]) {
    const light = page.children.find((c) => c.name === `${route} — ${bp}`);
    const dark = page.children.find((c) => c.name === `${route} — ${bp} [Dark]`);
    const d = Math.round(dark.height) - Math.round(light.height);
    if (d !== 0) drift.push({ route, bp, light: Math.round(light.height), dark: Math.round(dark.height), delta: d });
  }
return drift;
```

Any non-zero delta means the Dark instance carries an override it should not — a mode pin changes colors only. Fix with `instance.resetOverrides()` then re-pin, and re-check cold.

## Step 5 — hygiene sweep

Screenshot the whole 📄 Pages canvas plus each of the 8 rows. Zero overlaps, zero cropping, four frames per row in the fixed order Desktop / Mobile / Desktop [Dark] / Mobile [Dark].

Run the Gate D check scoped to 📄 Pages (`absoluteBoundingBox` overlaps, cropped, strays) and report all three as empty.

---

## Acceptance

- 16 COMPONENT light masters, mode-pinned Light + breakpoint.
- 16 INSTANCE dark frames, mode-pinned Dark + breakpoint.
- 32 frames placed, `drift` empty, Gate D empty.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T09
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
