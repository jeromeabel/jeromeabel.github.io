# Figma raw-value dump — Pass 2 (Tokenization rule)

Deterministic det→LLM→det shape, same as `dump-tokens.md`: dump (Figma) →
diff (script, warn-only) → judge only what the script flags as new.

1. Read the `/figma-use` skill (required before any `use_figma` call this session).
2. Pick scope: usually `❖ Components` (`461:759`) + `📄 Pages` (`2558:18264`) — pass
   both page IDs to `pageIds` below, or scope to one page for a narrow re-check.
3. Run the script below **once per page, as parallel `use_figma` calls emitted in a
   single message**. The `figma-use` skill allows at most one
   `setCurrentPageAsync` per invocation, so the `pageIds` loop below cannot run as
   written — drop the loop and hardcode one page id per call. A `use_figma` return
   is also capped near 20 kB, so a page over ~250 rows needs `rows.slice()`
   chunking; encoding rows as `id|nameIdx|kind` against a name dictionary roughly
   halves the payload.
4. Save the returned JSON to `raw-values.figma.json` at repo root (gitignored — a
   local scratch artifact, not a committed baseline).
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
    // SECTION and COMPONENT_SET carry Figma's own canvas furniture — the section
    // tint and the dashed set border. Neither is ever rendered, so their fill /
    // stroke / radius are not design debt. Added 2026-08-18: P1-T06 created seven
    // domain SECTIONs and P1-T07 promoted two masters to sets, which put 67 rows
    // of pure noise in the report.
    if (n.type === "SECTION" || n.type === "COMPONENT_SET") continue;
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

## Reading the report

`named-debt.json` is keyed by **node id**, and Figma ids are not stable across
restructuring — a merge, a reparent, or a rebuilt master mints new ids for the
same visual node. So a large "New raw values" block after structural work means
the allowlist keys drifted, not that new debt appeared. Check the shape of the
list (are these the same node _names_ as the stale entries?) before treating the
count as a regression.

The allowlist has never covered the whole dump: it is a hand-picked set of
accepted text-style exceptions, not a full baseline. A non-empty "New raw values"
section is the normal state of this report.
