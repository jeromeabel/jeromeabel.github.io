---
task: P3-T01
title: Phase-3 entry gate — page baseline
phase: 3
status: TODO
prerequisite: P2-T11
---

# P3-T01 — Phase-3 entry gate

📄 Pages holds 4 masters and their Dark instances, all built before the container decision. Before adding four more routes, record exactly what is there and which frames violate the container recipe.

Read-only task except for one thing: nothing is written here. It produces the baseline every later phase-3 task edits against.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — walk 📄 Pages

```js
const page = await PAGES("Pages");
const desc = (n) => ({
  name: n.name, id: n.id, type: n.type,
  w: Math.round(n.width), h: Math.round(n.height),
  x: Math.round(n.x), y: Math.round(n.y),
  modes: n.explicitVariableModes || {},
  children: ("children" in n ? n.children : []).map((c) => ({
    name: c.name, type: c.type,
    pad: "paddingLeft" in c ? [c.paddingLeft, c.paddingRight] : null,
    maxW: "maxWidth" in c ? c.maxWidth : null,
    bound: Object.keys(c.boundVariables || {}),
    kids: ("children" in c ? c.children : []).map((k) => `${k.type}:${k.name}`),
  })),
});
return {
  count: page.children.length,
  frames: page.children.map(desc),
  wrappers: page.findAll((n) => n.name === "PageContentContainer").map((n) => ({ id: n.id, parent: n.parent.name })),
};
```

## Step 2 — the deltas this phase must close

Read the result against this list and report which apply:

| finding                                                               | closed by                             |
| --------------------------------------------------------------------- | ------------------------------------- |
| a `PageContentContainer` wrapper exists anywhere                      | P3-T03 (hoisted and removed)          |
| a Home frame contains an `AboutStrip` instance                        | P3-T02 (dropped from the composition) |
| a Dark frame that is a FRAME rather than an INSTANCE                  | P3-T09 (rebuilt as an instance)       |
| a `PageContent` with padding 32, or unbound padding, or no `maxWidth` | P3-T02 / P3-T03, per page type        |
| a frame missing an explicit `3 Responsive` mode pin                   | P3-T09                                |

## Step 3 — the two page types

Every route master built in this phase is one of exactly two shapes. Get this straight before building anything:

**Home type** — only `/`. `PageContent` is full-bleed: padding-x **0**, no `maxWidth`, no centering. Each section instance carries its own container. Adding a container to Home's `PageContent` doubles the gutter.

**Document type** — every other route. `PageContent` carries the container: `paddingLeft`/`paddingRight` bound to `3 Responsive::container/gutter`, `maxWidth` bound to `container/max-width`, `counterAxisAlignItems = "CENTER"`. Sections inside are bare — no padding, no maxWidth of their own.

Both types: vertical rhythm bound to `3 Responsive::section/rhythm-y` on `itemSpacing`, `paddingTop`, `paddingBottom`.

## Step 4 — confirm the component library is intact

Re-run `P2-T11` step 1 and check the 46/11 counts still hold. Building page frames against a half-finished library produces broken instances that are expensive to unpick later. If a master went missing between the phase-2 gate and now, stop and report — someone edited the file in between.

## Step 5 — name the eight routes

Phase 3 produces these sixteen light frames (eight routes × two breakpoints), and P3-T09 mirrors them into sixteen Dark instances:

```
Home    Blog    Work    About    Post    Serie    Serie post    Work detail
```

Names are exactly `{Route} — {Breakpoint}` and `{Route} — {Breakpoint} [Dark]`, em dash, spaces around it. The grid script in P3-T09 matches on these strings; a hyphen instead of an em dash breaks the whole row.

---

## Acceptance

Nothing is written. The report must carry:

- the four existing frames' names, types, sizes, mode pins and `PageContent` bindings,
- the `wrappers` list,
- which of the five deltas apply,
- confirmation that the 46-master roster still holds.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T01
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
