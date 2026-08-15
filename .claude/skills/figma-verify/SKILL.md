---
name: figma-verify
description: >
  Verify the Blog Design System v1.0 Figma file (ihWIWmvtQPTWgUxlrVjC2c) against this
  repo's code tokens and page assembly. Enumerate the live file, diff tokens
  (code = truth), and audit Pages for instance-only / dark-mode / drift. Triggers
  on "verify figma", "figma drift check", "/figma-verify", and after any DS-file
  mutation. Read-only on code; read + narrow repairs on Figma. NOT for building
  masters or templates (use figma-replicate).
---

# figma-verify — code ↔ astrobook ↔ Figma drift check

File `ihWIWmvtQPTWgUxlrVjC2c`. Deterministic scripts measure, you judge the delta.
**Code is truth for token/geometry values; Figma is truth for nothing in this diff.**
Node IDs + page map live in [knowledge/figma-ds-file.md](knowledge/figma-ds-file.md) —
read it first, but re-inventory by name (Pass 0) before trusting any ID.

## Tokenization rule

Every color, radius, size, spacing, and font-weight value on a master **must**
bind to a Figma variable or text/effect style — no raw literals. Exceptions
only when named and justified in the ref doc's **Named debt** log (e.g.
overlay `#000` / cross `#fff` — dark in both themes, no token benefit). Any
raw value found without a matching Named-debt entry is a Pass 2 finding, not
an accepted gap.

## Before any `use_figma` call

Run `/figma-use` once per session (mandatory — Plugin API rules). It is loud
about the footguns: page context resets each call, `setCurrentPageAsync` once
per call, load fonts before text edits, 0–1 colors, `return` is the only output.

## ⚠️ Enumerate with Pass 0, NOT `get_metadata`

`get_metadata` with no `nodeId` (the page-list) returned **only `Cover`** on a
5-page file — it is stale/desktop-scoped. `get_metadata 0:0` errors;
`get_design_context` needs a live selection. **The only reliable enumeration is
the Pass-0 `use_figma` script below.** See the ref doc's MCP-gotcha section.

## Token flow

1. **Extract (code):** `pnpm figma:verify` runs
   `scripts/figma/extract-code-tokens.mjs` → `tokens.code.json`
   (parses `@theme` / `@variant dark` / `@utility container` in
   `src/styles/global.css`). Exit ≠ 0 → CSS shape changed, STOP and fix the
   extractor before diffing.
2. **Dump (Figma):** ONE batched `use_figma` call — script in
   `scripts/figma/dump-tokens.md` — save to `tokens.figma.json`.
3. **Diff:** `scripts/figma/diff-tokens.mjs tokens.code.json tokens.figma.json
   scripts/figma/token-map.json`. Map fixes naming moves; ignore-list holds
   font stacks + container metrics (no Figma var).
4. **Report:** diff output + your verdict per finding
   (`real-drift` / `expected-gap` / `map-update`). Repairs applied Figma-side in
   ONE batched `use_figma` write, masters only.

Geometry ("layout exact") flow is documented in `scripts/figma/dump-tokens.md`
§Geometry + `diff-geometry.mjs`. Same det→LLM→det shape.

## Audit passes (`use_figma`, read-only unless noted)

`get_metadata`-first to scope a page id where it works; otherwise Pass 0. Run the
passes relevant to the file under audit, not all blind.

### Pass 0 — Live inventory (run FIRST; the anti-stale + anti-"can't find pages" pass)

One call returns every page + master (name → id, page, section). This is what
finds pages `get_metadata` hides.

```js
figma.skipInvisibleInstanceChildren = true;
const pages = [], components = [];
function walk(node, page) {
  const isMaster = node.type === "COMPONENT" || node.type === "COMPONENT_SET";
  const insideSet = node.parent && node.parent.type === "COMPONENT_SET";
  if (isMaster && !insideSet)
    components.push({ page: page.name,
      section: node.parent && node.parent.type === "SECTION" ? node.parent.name : "(top)",
      name: node.name, id: node.id, type: node.type });
  if (node.type === "COMPONENT_SET") return;
  if ("children" in node) for (const c of node.children) walk(c, page);
}
for (const p of figma.root.children) {              // NOT loadAllPagesAsync
  await p.loadAsync();
  pages.push({ name: p.name, id: p.id, childCount: p.children.length });
  for (const c of p.children) walk(c, p);
}
return { pages, componentCount: components.length, components };
```

Resolve any build target by NAME off this return, never a pasted ID.

**Orphan catch:** a master with `parent === null` is skipped by the walk above
but still instantiates. To find orphans, collect `mainComponent` names from
Pages instances (`await i.getMainComponentAsync()`) and diff against the walk's
`components` — a name that appears as an instance's main component but not in the
walk is an orphaned master. Re-home it into its SECTION (figma-replicate F-fix).

### Pass 1 — Pages assembly audit (instance-only + dark-mode + detached)

The check behind "components must be instances in Pages, light & dark". Per
top-level frame on 📄 Pages (`2558:18264`): count instances, resolve each
`mainComponent`, flag `detachedCount`, record bg fill (Light `#f5ffe1` /
Dark `#1e1e1e`), and whether Header/Footer instances are present.

```js
const page = await figma.getNodeByIdAsync("2558:18264");
await figma.setCurrentPageAsync(page);
const hex = n => { const f = Array.isArray(n.fills) && n.fills.find(p=>p.type==="SOLID");
  if(!f) return null; const h=x=>Math.round(x*255).toString(16).padStart(2,"0");
  return `#${h(f.color.r)}${h(f.color.g)}${h(f.color.b)}`; };
const out = [];
for (const fr of page.children) {
  const insts = fr.findAllWithCriteria({types:["INSTANCE"]});
  const byComp = {}; let detached = 0;
  for (const i of insts) { let mc=null; try{ mc=await i.getMainComponentAsync(); }catch(e){}
    // A variant's own name is "breakpoint=Desktop" — key off the owning SET instead,
    // or Header/Footer (both variant sets since the responsive refactor) never surface.
    const nm = mc ? (mc.parent?.type === "COMPONENT_SET" ? mc.parent.name : mc.name)
                  : "(detached)";
    byComp[nm]=(byComp[nm]||0)+1; if(!mc) detached++; }
  out.push({ name:fr.name, id:fr.id, bg:hex(fr), instances:insts.length,
    hasHeader:!!byComp.Header, hasFooter:!!byComp.Footer, detached, byComp });
}
return out;
```

A hand-drawn FRAME/RECT standing in for a component (not an INSTANCE) is the
same failure class as a detached instance — flag both.

### Pass 2 — Unbound raw values (colors, radius, size, spacing, weight)

Enforces the Tokenization rule above. Same det → LLM → det shape as the Token
flow — a deterministic dump, a deterministic diff against a committed
allowlist, and you only judge what the diff calls new:

1. **Dump (Figma):** ONE batched `use_figma` call — script in
   [`scripts/figma/dump-raw-values.md`](../../../scripts/figma/dump-raw-values.md)
   — walks every node in scope and flags unbound fills/strokes, unbound
   `cornerRadius`, unbound `itemSpacing`, and TEXT with no `textStyleId`. Save
   to `raw-values.figma.json`.
2. **Diff:** `pnpm figma:verify-raw` (or
   `node scripts/figma/diff-raw-values.mjs raw-values.figma.json scripts/figma/named-debt.json`)
   — warn-only, exit 0. Splits hits into **New raw values**, **Accepted
   (named debt)**, and **Stale named-debt entries** (allowlisted id/kind with
   no matching hit — bind removed or id drifted, prune the entry).
3. **Judge only the "New raw values" section.** Each finding: bind it in
   Figma, or add an entry to
   [`scripts/figma/named-debt.json`](../../../scripts/figma/named-debt.json)
   with a `reason` (rare exceptions only, per the Tokenization rule) and
   mirror it into the ref doc's **Named debt** log so both stay in sync.

`named-debt.json` node IDs are volatile like everything else in this file —
re-verify by name against a fresh Pass 0 if a "Stale" hit looks suspicious
rather than assuming the debt was fixed.

### Pass 3 — Detached instances

`figma.currentPage.query("INSTANCE").toArray().filter(n => !n.mainComponent)` →
broken main-component links.

## Live-route spot-check screenshots

For side-by-side comparison of a live route against its Figma frame, reuse
[`scripts/figma/spot-check-shots.mjs`](../../../scripts/figma/spot-check-shots.mjs)
— edit its `TARGETS` array (url/width/theme/name) and run
`node scripts/figma/spot-check-shots.mjs <outDir>`. Don't hand-roll a new
one-off Playwright script per session; extend this one.

## Common mistakes

- Trusting the `get_metadata` page-list — it hid 4 of 5 pages this file has.
- Trusting stored node IDs — re-inventory by name (Pass 0) every time.
- Editing Figma to silence a token mismatch without checking WHICH side is truth
  (code wins for values).
- Multiple `use_figma` calls for one dump — always ONE batched call (token cost).
- Assuming 13px root (that's the allo-media file) — this repo is **16px**.
