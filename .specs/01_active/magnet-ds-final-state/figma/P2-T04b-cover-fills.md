---
task: P2-T04b
title: WorkCard cover fills — read back, bind or declare
phase: 2
status: TODO
prerequisite: P2-T04
---

# P2-T04b — `work/WorkCard` cover fills

P2-T04 OPEN ITEM 2. The brief's pseudocode never assigned `cover.fills`, so the 8 `cover`
rectangles are probably carrying Figma's default raw `#D9D9D9`. R2.2 cannot be called either a
no-op or a debt entry until they are read back. **Prefer binding over declaring** — placeholder
art is an allowed exception at P2-T11's binding sweep, but only a last resort.

<!-- include: _run-rules.md -->

---

## Step 1 — Read the 8 cover fills and list the candidate primitives

Read-only. Do not write anything in this step.

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();

const set = page.findOne((x) => x.name === "work/WorkCard" && x.type === "COMPONENT_SET");
if (!set) return { error: "work/WorkCard COMPONENT_SET not found on the Components page" };

const covers = set.findAll((n) => n.name === "cover");
const readFill = async (n) => {
  const f = n.fills;
  if (f === figma.mixed) return { kind: "MIXED" };
  if (!f || !f.length) return { kind: "NONE" };
  const p = f[0];
  const hex =
    p.type === "SOLID"
      ? "#" + [p.color.r, p.color.g, p.color.b]
          .map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase()
      : null;
  const bound = n.boundVariables && n.boundVariables.fills && n.boundVariables.fills[0];
  return {
    kind: p.type, hex, opacity: p.opacity,
    boundVariableId: bound ? bound.id : null,
    boundVariableName: bound
      ? (await figma.variables.getVariableByIdAsync(bound.id))?.name ?? "<unresolved>"
      : null,
  };
};

const fills = [];
for (const c of covers) {
  fills.push({
    variant: c.parent && c.parent.type === "COMPONENT" ? c.parent.name : c.parent?.name ?? null,
    nodeId: c.id,
    width: Math.round(c.width), height: Math.round(c.height),
    fill: await readFill(c),
  });
}

const localVars = await figma.variables.getLocalVariablesAsync("COLOR");
const candidates = localVars
  .filter((v) => /^color\/.+\/(100|200|300)$/.test(v.name))
  .map((v) => ({ name: v.name, id: v.id }));

return { coverCount: covers.length, fills, candidates };
```

## Acceptance — Step 1

- `coverCount` is **8**. Fewer means a variant lost its cover rectangle in the P2-T04 build —
  stop and report, do not patch it here.
- Every entry's `fill.boundVariableName` is either a real primitive (nothing to do — R2.2 is a
  no-op, skip Step 2) or `null` (proceed).
- Report `candidates` in full. If it is **empty**, stop after Step 1: there is no `…/200` neutral
  to bind to and this becomes a `named-debt.json` declaration instead — Claude Code decides.

## Step 2 — Bind, only if Step 1 found an unambiguous target

Skip entirely if Step 1 showed the covers already bound, or if `candidates` was empty.

Pick the target by the first `PREFER` name that exists in `candidates`. Do **not** invent a name
and do **not** fall through to an arbitrary candidate — an unmatched list is a report, not a guess.

```js
const PREFER = [
  "color/brand/gray-200", "color/gray/200", "color/neutral/200",
  "color/brand/gray-100", "color/gray/100", "color/neutral/100",
];
const localVars = await figma.variables.getLocalVariablesAsync("COLOR");
const byName = new Map(localVars.map((v) => [v.name, v]));
const targetName = PREFER.find((n) => byName.has(n));
if (!targetName) return { bound: 0, reason: "no PREFER name present", have: [...byName.keys()].filter((n) => /^color\//.test(n)) };
const target = byName.get(targetName);

const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const set = page.findOne((x) => x.name === "work/WorkCard" && x.type === "COMPONENT_SET");
const covers = set.findAll((n) => n.name === "cover");

for (const c of covers) {
  const paint = figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", target,
  );
  c.fills = [paint];
}
return { bound: covers.length, targetName, targetId: target.id };
```

**Paint bindings go through `figma.variables.setBoundVariableForPaint()`**, never
`setBoundVariable("fills", …)` — `fills` is not a `VariableBindableNodeField`. This is the same
wall P2-T04 Deviation 1 hit; `_prelude-components.js` is already patched.

## Step 3 — Cold read-back

Re-run **Step 1 only**. Every one of the 8 entries must now report a non-null
`fill.boundVariableName` equal to the `targetName` from Step 2. Anything still `null` is a failed
write, not a reporting artefact — say which variant.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T04b
STATUS: done | partial | blocked
RESULT: <Step 1 fills + candidates, Step 2 targetName/bound, Step 3 read-back>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <any cover still raw, with its variant name — or "none">
```
