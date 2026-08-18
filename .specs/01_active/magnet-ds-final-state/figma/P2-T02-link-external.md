---
task: P2-T02
title: Build ui/Link/external
phase: 2
status: TODO
prerequisite: P2-T01
---

# P2-T02 — `ui/Link/external`

The sixth and last Link variant. It is the one used for off-site links: project websites, demos, repos, the CV download, the uhlive/GitHub links inside About prose.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-components.js -->

---

## Live anatomy — `src/components/ui/Link.astro`, variant `external`

```
text-foreground hover:bg-surface flex w-fit rounded-full border border-dashed
px-4 py-2 transition-all hover:border-solid flex items-center gap-1
```

Translated:

| Property      | Value                                                                          | Bind to                                                                                                      |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| layout        | HORIZONTAL, hug × hug, items centered                                          | —                                                                                                            |
| item spacing  | 4 (`gap-1`)                                                                    | `1 Primitives` spacing step 1 if one exists, else raw 4                                                      |
| padding       | 16 / 8 / 16 / 8 (`px-4 py-2`)                                                  | spacing 4 / spacing 2                                                                                        |
| corner radius | 9999 (`rounded-full`)                                                          | —                                                                                                            |
| stroke        | 1px, **dashed**, `dashPattern = [4, 4]`                                        | `2 Theme::color/foreground` (Tailwind's bare `border` is currentColor, and the element is `text-foreground`) |
| label         | IBM Plex Sans Regular 16                                                       | `2 Theme::color/foreground`                                                                                  |
| trailing icon | `ui/Icon` instance, glyph `lucide:arrow-up-right`, 24×24                       | `2 Theme::color/foreground`                                                                                  |
| hover state   | fill = `2 Theme::color/surface`, stroke becomes **solid** (`dashPattern = []`) | —                                                                                                            |

The icon is **not optional and not overridable per-instance** — `Link.astro` hardcodes `lucide:arrow-up-right` whenever `variant === "external"`. A caller-supplied `icon` prop replaces it (the CV link passes `lucide:download`), so the master gets a swappable icon instance, not a flattened vector.

Default label for the master: **`Website`**.

## Step 1 — Clone `ui/Link/secondary` and retune

Cloning keeps the existing `state` axis and whatever bindings `secondary` already has, which is cheaper and safer than building from zero.

```js
const V = await VARS();
const src = await findMaster("ui/Link/secondary");
if (!src) throw new Error("ui/Link/secondary not found");

const set = src.clone();
set.name = "ui/Link/external";

for (const variant of (set.type === "COMPONENT_SET" ? set.children : [set])) {
  variant.layoutMode = "HORIZONTAL";
  variant.primaryAxisSizingMode = "AUTO";
  variant.counterAxisSizingMode = "AUTO";
  variant.counterAxisAlignItems = "CENTER";
  variant.itemSpacing = 4;
  variant.paddingLeft = 16; variant.paddingRight = 16;
  variant.paddingTop = 8;   variant.paddingBottom = 8;
  variant.cornerRadius = 9999;
  variant.strokeWeight = 1;
  variant.strokeAlign = "INSIDE";
  const hover = /state=hover/i.test(variant.name);
  variant.dashPattern = hover ? [] : [4, 4];
  variant.setBoundVariable("strokes", V["2 Theme::color/foreground"]);
  if (hover) variant.setBoundVariable("fills", V["2 Theme::color/surface"]);
  else variant.fills = [];
}
return { id: set.id, name: set.name, variants: (set.type === "COMPONENT_SET" ? set.children : [set]).map((c) => c.name) };
```

## Step 2 — Set the label and swap in the arrow icon

```js
const V = await VARS();
const set = await findMaster("ui/Link/external");
const icon = await findMaster("ui/Icon");
const out = [];
for (const variant of (set.type === "COMPONENT_SET" ? set.children : [set])) {
  const label = variant.findOne((n) => n.type === "TEXT");
  if (label) {
    await figma.loadFontAsync(label.fontName);
    label.characters = "Website";
    label.setBoundVariable("fills", V["2 Theme::color/foreground"]);
  }
  // Remove any leading icon inherited from `secondary`, append the trailing one.
  for (const c of variant.children.slice())
    if (c.type === "INSTANCE" && c !== label) c.remove();
  const arrow = (icon.type === "COMPONENT_SET" ? icon.defaultVariant : icon).createInstance();
  arrow.name = "icon";
  variant.appendChild(arrow);
  out.push({ variant: variant.name, children: variant.children.map((c) => `${c.type}:${c.name}`) });
}
return out;
```

Then set the icon instance's glyph to **`lucide:arrow-up-right`** through whatever property `ui/Icon` exposes. If `ui/Icon` has no glyph property, report that — it is a real gap and P3-T10 documents `ui/Icon`; do **not** flatten a vector into the master as a workaround.

## Step 3 — Home it and read back cold

```js
const set = await findMaster("ui/Link/external");
await home(set, "ui");
```

Then re-run **P1-T06 Step 2** (grid) and **Step 3** (Gate D) so the new master sits on the `ui` grid without overlapping.

Fresh run, report:

```js
const set = await findMaster("ui/Link/external");
const v = set.type === "COMPONENT_SET" ? set.children[0] : set;
return {
  name: set.name, section: set.parent.name,
  pad: [v.paddingLeft, v.paddingTop, v.paddingRight, v.paddingBottom],
  radius: v.cornerRadius, dash: v.dashPattern, gap: v.itemSpacing,
  bound: Object.keys(v.boundVariables || {}),
  kids: v.children.map((c) => `${c.type}:${c.name}`),
};
```

## Acceptance

- `ui/Link/external` exists in the `ui` section with the `state` axis inherited from `secondary`.
- Default state: dashed `[4,4]`, no fill. Hover: solid, `color/surface` fill.
- Padding `16/8`, radius 9999, gap 4 — all read back from a cold call.
- Strokes and text bound to `2 Theme::color/foreground`; nothing raw except the 4/8/16 spacings if `1 Primitives` has no matching step (say so under `UNBOUND:`).
- Gate D clean.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T02
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
