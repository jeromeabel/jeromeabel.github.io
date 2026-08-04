#!/usr/bin/env node
// extract-fig-tokens.mjs — Figma-side token dump from a local `.fig` export.
//
// Produces the exact `{ collections, textStyles }` shape `diff-tokens.mjs`
// consumes, i.e. the same artifact the manual `dump-tokens.md` procedure yields
// through `use_figma` — but deterministically, offline, and without the ~20KB
// response cap that forces that procedure into batched calls. Export the file
// from Figma (File > Export), then point this at it.
//
// Usage: node extract-fig-tokens.mjs <file.fig> [out=tokens.figma.json]
// Exit:  0 ok · 2 export not readable · 3 undecodable .fig
import { writeFileSync } from "node:fs";
import { readFig, guidKey, hex, isLocalLive } from "./fig-decode.mjs";

const ALIAS_HOP_LIMIT = 5;

/** Concrete scalar out of a `VariableAnyValue`, or `undefined` if it's an alias. */
function scalar(value) {
  if (!value || value.alias) return undefined;
  if (value.colorValue !== undefined) return hex(value.colorValue);
  if (value.floatValue !== undefined) return value.floatValue;
  if (value.textValue !== undefined) return value.textValue;
  if (value.boolValue !== undefined) return value.boolValue;
  return undefined;
}

/**
 * Shape a decoded `.fig` node graph into the `tokens.figma.json` dump.
 *
 * Alias chains are followed to a concrete value: `diff-tokens.mjs` expects
 * `v.value` to already be a plain number/string, so leaving a hop unresolved
 * reports that token as a false Missing/Mismatch (see `dump-tokens.md`).
 */
export function buildTokenDump(nodes) {
  const byGuid = new Map(nodes.map((n) => [guidKey(n.guid), n]));
  const byPosition = (a, b) =>
    String(a.sortPosition ?? "").localeCompare(String(b.sortPosition ?? ""));

  // Every hop after the first reads the *target's* first mode, matching the
  // Plugin API dump (`v.valuesByMode[Object.keys(v.valuesByMode)[0]]`).
  const resolve = (variable, modeKey) => {
    let entries = variable.variableDataValues?.entries ?? [];
    let value = (
      entries.find((e) => guidKey(e.modeID) === modeKey) ?? entries[0]
    )?.variableData?.value;
    for (let hop = 0; value?.alias && hop < ALIAS_HOP_LIMIT; hop++) {
      const target = byGuid.get(guidKey(value.alias.guid));
      if (!target) return undefined;
      value = (target.variableDataValues?.entries ?? [])[0]?.variableData
        ?.value;
    }
    return scalar(value);
  };

  const variables = nodes
    .filter((n) => n.type === "VARIABLE" && isLocalLive(n))
    .sort(byPosition);

  const collections = nodes
    .filter((n) => n.type === "VARIABLE_SET" && isLocalLive(n))
    .sort(byPosition)
    .map((set) => {
      const setKey = guidKey(set.guid);
      const modes = (set.variableSetModes ?? []).sort(byPosition);
      // Single-mode collections keep bare variable names; multi-mode ones are
      // prefixed per mode, so light/dark pairs stay addressable as one path each.
      const multiMode = modes.length > 1;
      const rows = [];
      for (const v of variables) {
        if (guidKey(v.variableSetID?.guid) !== setKey) continue;
        for (const mode of modes) {
          rows.push({
            name: multiMode ? `${mode.name}/${v.name}` : v.name,
            type: v.variableResolvedType,
            value: resolve(v, guidKey(mode.id)),
            description: v.description ?? "",
          });
        }
      }
      return {
        name: set.name,
        modes: modes.map((m) => m.name),
        variables: rows,
      };
    });

  const textStyles = nodes
    .filter((n) => n.styleType === "TEXT" && isLocalLive(n))
    .sort(byPosition)
    // `fontName` is trimmed to the Plugin API's `{family, style}` — the graph
    // also carries a `postscript` name that a `use_figma` dump never has.
    .map((s) => ({
      name: s.name,
      fontSize: s.fontSize,
      fontName: { family: s.fontName?.family, style: s.fontName?.style },
    }));

  return { collections, textStyles };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [figPath, outPath = "tokens.figma.json"] = process.argv.slice(2);
  if (!figPath) {
    console.error(
      "usage: extract-fig-tokens.mjs <file.fig> [out=tokens.figma.json]",
    );
    process.exit(2);
  }

  let nodes;
  try {
    ({ nodes } = readFig(figPath));
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(err.code === "ENOENT" || /unzip/i.test(err.message) ? 2 : 3);
  }

  const dump = buildTokenDump(nodes);
  writeFileSync(outPath, JSON.stringify(dump, null, 2) + "\n");

  const total = dump.collections.reduce((n, c) => n + c.variables.length, 0);
  console.error(
    `${outPath}: ${dump.collections.length} collections, ${total} variable rows, ${dump.textStyles.length} text styles`,
  );
  for (const c of dump.collections)
    console.error(
      `  ${c.name} [${c.modes.join(", ")}] — ${c.variables.length}`,
    );
}
