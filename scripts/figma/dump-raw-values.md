# Figma raw-value dump — Pass 2 (Tokenization rule)

Deterministic det→LLM→det shape, same as `dump-tokens.md`: dump (Figma) →
diff (script, warn-only) → judge only what the script flags as new.

1. Read the `/figma-use` skill (required before any `use_figma` call this session).
2. Pick scope: usually `🧩 Components` (`461:759`) + `📄 Pages` (`2558:18264`) — pass
   both page IDs to `pageIds` below, or scope to one page for a narrow re-check.
3. Run ONE `use_figma` call with the script below (per page in `pageIds` — still
   one call, the script loops pages internally, never call `setCurrentPageAsync`
   more than once per page inside it).
4. Save the returned JSON to `raw-values.figma.json` at repo root.
5. Run `node scripts/figma/diff-raw-values.mjs raw-values.figma.json scripts/figma/named-debt.json`.
6. Everything under "New raw values" needs a decision: bind it, or add an entry
   to `named-debt.json` with a reason (rare exceptions only — Tokenization rule).

```js
figma.skipInvisibleInstanceChildren = true;
const pageIds = ["461:759", "2558:18264"]; // adjust per scope — re-derive from Pass 0, IDs are volatile
const out = [];
for (const pid of pageIds) {
  const page = await figma.getNodeByIdAsync(pid);
  if (!page) continue;
  await figma.setCurrentPageAsync(page);
  for (const n of page.query("*")) {
    const bv = n.boundVariables || {};
    if (Array.isArray(n.fills))
      n.fills.forEach((f, i) => {
        if (
          f.type === "SOLID" &&
          f.visible !== false &&
          !(bv.fills && bv.fills[i])
        )
          out.push({ id: n.id, name: n.name, page: page.name, kind: "fill" });
      });
    if (Array.isArray(n.strokes))
      n.strokes.forEach((s, i) => {
        if (
          s.type === "SOLID" &&
          s.visible !== false &&
          !(bv.strokes && bv.strokes[i])
        )
          out.push({ id: n.id, name: n.name, page: page.name, kind: "stroke" });
      });
    if (
      "cornerRadius" in n &&
      typeof n.cornerRadius === "number" &&
      n.cornerRadius > 0 &&
      !bv.cornerRadius
    )
      out.push({ id: n.id, name: n.name, page: page.name, kind: "radius" });
    if ("itemSpacing" in n && n.itemSpacing > 0 && !bv.itemSpacing)
      out.push({ id: n.id, name: n.name, page: page.name, kind: "spacing" });
    if (n.type === "TEXT" && !n.textStyleId)
      out.push({ id: n.id, name: n.name, page: page.name, kind: "text-style" });
  }
}
return out;
```
