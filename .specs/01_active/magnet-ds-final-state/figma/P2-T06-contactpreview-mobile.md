---
task: P2-T06
title: contact/ContactPreview — add the Mobile variant
phase: 2
status: TODO
prerequisite: P1-T08
---

# P2-T06 — `contact/ContactPreview` mobile variant

The master today renders Desktop-width internals inside 390 frames. This adds a `breakpoint` axis and flips the mobile layout to a single column.

Modify-in-place task, not a rebuild: the Desktop variant is human-designed art (the curved arrow, the noise field, the footer illustration) and must survive untouched.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## What the section actually is

Live `Contact.astro` renders one `<section>` with a top and bottom border, `py-8 sm:py-20`, holding a `container` with **two** children side by side:

- `ContactText` — VERTICAL, gap 32:
  - `H2` → `LET'S TALK`
  - block: muted `Email me at` + bold link `dev@jeromeabel.net`
  - block (gap 8): muted `Follow` + a HORIZONTAL gap-12 row of three `ui/Link/iconOnly` — GitHub (`fa6-brands:github`), Bluesky (`fa6-brands:bluesky`), LinkedIn (`fa6-brands:linkedin-in`) — plus the hand-drawn curved arrow pointing at LinkedIn.
- `ContactImage` — the footer SVG illustration, `hidden sm:block`, absolutely positioned and overflowing the section box on purpose.

**The illustration is `hidden` below the `sm` breakpoint.** That is the single most important fact for this task: Mobile is not a squeezed two-column layout, it is `ContactText` alone at full width. Keep the `ContactImage` / noise layers in the Mobile variant but set them `visible = false` — deleting them would lose the artwork from that variant permanently.

Mobile padding: `py-8` (32) instead of `sm:py-20` (80). Horizontal padding stays the container gutter (16, bound) — do not change it, P1-T08 bound it.

---

## Steps

### Step 1 — read the current master's structure

```js
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  const n = p.findOne((x) => x.name === "contact/ContactPreview");
  if (!n) continue;
  const f = n.type === "COMPONENT_SET" ? n.children[0] : n;
  return {
    id: n.id, page: p.name, isSet: n.type === "COMPONENT_SET",
    layoutMode: f.layoutMode,
    pad: [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft],
    bound: Object.keys(f.boundVariables || {}),
    children: f.children.map((c) => ({
      name: c.name, type: c.type,
      layoutMode: "layoutMode" in c ? c.layoutMode : null,
      w: Math.round(c.width),
      kids: ("children" in c ? c.children : []).map((k) => `${k.type}:${k.name}`),
    })),
  };
}
```

`isSet: true` means this task already ran — stop and report it. Otherwise note which child holds the two columns; that inner band is the frame step 2 flips.

### Step 2 — clone, flip, combine

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
await figma.setCurrentPageAsync(page);
const master = page.findOne((n) => n.name === "contact/ContactPreview");
if (!master) throw new Error("contact/ContactPreview not found");
if (master.type === "COMPONENT_SET") return { skipped: "already a set" };

const parent = master.parent;
const mobile = master.clone();
master.name = "breakpoint=Desktop";
mobile.name = "breakpoint=Mobile";
parent.appendChild(mobile);

mobile.resize(390, mobile.height);
mobile.paddingTop = 32;
mobile.paddingBottom = 32;

// The two-column band becomes a single column; the illustration hides.
const band = mobile.findOne((n) => n.layoutMode === "HORIZONTAL" && n.children.length >= 2)
          || mobile.children.find((c) => "layoutMode" in c);
band.layoutMode = "VERTICAL";
band.itemSpacing = 32;
for (const c of band.children) {
  if ("layoutSizingHorizontal" in c) c.layoutSizingHorizontal = "FILL";
  if ("layoutSizingVertical" in c) c.layoutSizingVertical = "HUG";
  if (/image|noise|footer|illustration|curve/i.test(c.name)) c.visible = false;
}

const set = figma.combineAsVariants([master, mobile], parent);
set.name = "contact/ContactPreview";
set.description = "Home contact band. Mobile drops the footer illustration (hidden sm:block in code) and pads 32 instead of 80. Gutter stays bound to container/gutter.";
return { setId: set.id, axes: set.variantGroupProperties, bandName: band.name,
         hidden: band.children.filter((c) => !c.visible).map((c) => c.name) };
```

`hidden` should list the illustration and noise layers only. If it hid the text column, the regex matched the wrong layer — undo by setting `visible = true` and hide by index instead, and report it.

### Step 3 — re-set sizing in a fresh call

Flipping `layoutMode` re-maps children from FILL/HUG and collapses dimensions. In a **separate** run, read every child of the Mobile variant and its descendants one level down: `layoutSizingHorizontal`, `layoutSizingVertical`, width. Fix anything that came back `FIXED` at a Desktop width — set it `FILL`.

Then confirm the Mobile variant's `boundVariables` still names `container/gutter` on `paddingLeft`/`paddingRight` (P1-T08 bound it; a clone keeps bindings, but the flip can drop them). Rebind if missing:

```js
const V = await VARS();
const set = await findMaster("contact/ContactPreview");
const m = set.children.find((c) => c.name.includes("Mobile"));
m.setBoundVariable("paddingLeft", V["3 Responsive::container/gutter"]);
m.setBoundVariable("paddingRight", V["3 Responsive::container/gutter"]);
return { bound: Object.keys(m.boundVariables || {}), pad: [m.paddingLeft, m.paddingRight] };
```

### Step 4 — screenshot at Mobile mode

Put the Mobile variant's instance on a scratch FRAME, pin `3 Responsive` to `Mobile` on that frame, `get_screenshot`, then **delete the scratch frame** (it is your own debris, so deleting it is allowed).

Content must fit 390 with 16px gutters, no horizontal overflow, no visible illustration, and the three social icons on one row.

### Step 5 — cold read-back

Fresh run. Assert: `contact/ContactPreview` is a COMPONENT_SET with axis `breakpoint` = `Desktop | Mobile`; Desktop width unchanged from step 1's reading; Mobile width 390; Mobile `paddingTop/Bottom` 32; both variants' `paddingLeft/Right` bound to `container/gutter`.

---

## Acceptance

- Axis `breakpoint` with exactly two values; Desktop variant byte-identical to what step 1 recorded except its name.
- Mobile is single-column, illustration hidden (**not deleted**), 32 vertical padding, bound gutter.
- Gate D clean on the `contact` section.
- Report includes the `hidden` layer list so the repo-side note can strike the ContactPreview line in `.specs/00_backlog/figma-mobile-section-variants.md`.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T06
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
