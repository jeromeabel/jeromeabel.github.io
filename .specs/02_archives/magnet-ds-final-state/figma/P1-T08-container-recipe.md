---
task: P1-T08
title: Container normalization — one recipe, zero exceptions
phase: 1
status: DONE (2026-08-18) — step 4 corrective applied; re-verified 2026-08-19 (12 variants, after P2-T06)
prerequisite: P1-T07
---

# P1-T08 — One container recipe, zero exceptions

**The recipe:** pad-x **16** bound to `3 Responsive/container/gutter` on the outer frame · max-w **1280** bound to `3 Responsive/container/max-width` on the inner band · band centered (`counterAxisAlignItems = "CENTER"`).

**Known live state (P1-T01 Gate C):** `app/Header` and `contact/ContactPreview` read 32/32 and are bound to **`spacing/8`** — the wrong variable. They are bound, so a naive "is it bound?" check passes. They still have to be rebound.

<!-- include: _run-rules.md -->

---

## Step 1 — Rebind the two suspects to `container/gutter`

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
const vars = {};
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  vars[v.name] = v;
}
const gutter = vars["container/gutter"];
const maxw = vars["container/max-width"];
if (!gutter || !maxw) throw new Error("container variables missing from 3 Responsive");

const TARGETS = ["app/Header", "contact/ContactPreview"];
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const name of TARGETS) {
    const node = p.findOne(
      (x) => (x.type === "COMPONENT" || x.type === "COMPONENT_SET") && x.name === name,
    );
    if (!node) continue;
    const frames = node.type === "COMPONENT_SET" ? node.children : [node];
    for (const f of frames) {
      const before = [f.paddingLeft, f.paddingRight,
                      Object.keys(f.boundVariables || {}).filter((k) => /padding/.test(k))];
      f.setBoundVariable("paddingLeft", gutter);
      f.setBoundVariable("paddingRight", gutter);
      out.push({ master: name, variant: f.name, before, after: [f.paddingLeft, f.paddingRight] });
    }
  }
}
return out;
```

`container/gutter` resolves to 16 in all three modes, so this fixes the value **and** replaces the wrong binding in one move.

---

## Step 2 — Audit all six container owners' inner bands

```js
const OWNERS = ["app/Header", "app/Footer", "hero/Hero", "blog/BlogPreview", "work/WorkPreview", "contact/ContactPreview"];
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const name of OWNERS) {
    const node = p.findOne((x) => (x.type === "COMPONENT" || x.type === "COMPONENT_SET") && x.name === name);
    if (!node) continue;
    const frames = node.type === "COMPONENT_SET" ? node.children : [node];
    for (const f of frames) {
      const inner = f.children[0];
      out.push({
        master: name, variant: f.name,
        outerPad: [f.paddingLeft, f.paddingRight],
        outerBound: Object.keys(f.boundVariables || {}),
        innerName: inner ? inner.name : null,
        innerMaxW: inner && "maxWidth" in inner ? inner.maxWidth : null,
        innerBound: inner ? Object.keys(inner.boundVariables || {}) : [],
        align: f.primaryAxisAlignItems + "/" + f.counterAxisAlignItems,
      });
    }
  }
}
return out;
```

For every row whose `innerMaxW` is `null`, fix it — in the **same** run, with `maxw` resolved as in Step 1:

```js
inner.maxWidth = 1280;
inner.setBoundVariable("maxWidth", maxw);
inner.layoutSizingHorizontal = "FILL";
f.counterAxisAlignItems = "CENTER";
```

A master with no inner band at all is a real finding, not a bug in this brief: report its name and leave it — do not invent a wrapper frame that changes the master's structure.

---

## Step 3 — Read back cold

Fresh run: re-run Step 2's reader only. Every row must read:

- `outerPad: [16, 16]`
- `outerBound` contains `paddingLeft` **and** `paddingRight`
- `innerMaxW: 1280`
- `innerBound` contains `maxWidth`
- `align` ends in `/CENTER`

Any row still reading **32** is a miss. The rule is zero exceptions.

## Acceptance

- Six owners × every variant, all matching the five conditions above.
- The full read-back table goes in the report — Claude Code pastes it into `progress.md` and uses it to prune `scripts/figma/named-debt.json` (`../repo/phase-1.md`).

---

## Step 4 — Corrective: cap the real band, not the first child (added after the first run)

The first run bound 1280 on `children[0]` exactly as Step 2 says. For `blog/BlogPreview` and
`work/WorkPreview` that child is an INSTANCE of `ui/SectionTitle` — a heading, not a container
band. Their content frames (`BlogPreviewContent`, `WorkPreviewSmallList`) are `children[1]` and
were left uncapped, so those four rows read as passing while nothing is actually constrained.

`children[0]` is the wrong selector for a master whose outer frame is a **vertical** stack: there
is no single band, every direct layout child is one. Cap them all.

```js
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const resp = cols.find((c) => c.name === "3 Responsive");
let maxw = null;
for (const id of resp.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v.name === "container/max-width") maxw = v;
}
if (!maxw) throw new Error("container/max-width missing from 3 Responsive");

const OWNERS = ["blog/BlogPreview", "work/WorkPreview"];
const out = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  for (const name of OWNERS) {
    const node = p.findOne((x) => (x.type === "COMPONENT" || x.type === "COMPONENT_SET") && x.name === name);
    if (!node) continue;
    const frames = node.type === "COMPONENT_SET" ? node.children : [node];
    for (const f of frames) {
      if (f.layoutMode !== "VERTICAL") { out.push({ master: name, variant: f.name, skipped: f.layoutMode }); continue; }
      for (const child of f.children) {
        if (!("maxWidth" in child)) continue;
        child.maxWidth = 1280;
        child.setBoundVariable("maxWidth", maxw);
        child.layoutSizingHorizontal = "FILL";
        out.push({ master: name, variant: f.name, child: child.name, type: child.type });
      }
      f.counterAxisAlignItems = "CENTER";
    }
  }
}
return out;
```

Then re-run Step 3's reader with `f.children[0]` replaced by **every** direct child that has
`maxWidth`. Every one must read `1280` and carry `maxWidth` in `boundVariables`. A child that has
no `maxWidth` property at all (a TEXT node — see `app/Header` Mobile) is reported, not forced.

**Accepted structural exception:** `app/Header` Mobile has no inner band; `children[0]` is the
TEXT node `Brand`. Outer pad-x and CENTER alignment apply, the band condition does not. Do not
invent a wrapper frame. P1-T09 must treat this row as a pass-with-note, not a miss.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T08
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
