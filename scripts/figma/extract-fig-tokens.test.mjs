import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTokenDump } from "./extract-fig-tokens.mjs";

// Minimal `.fig` node-graph fixtures. Only the fields buildTokenDump reads are
// present — the real graph carries ~30 more per node.
const guid = (n) => ({ sessionID: 1, localID: n });
const ref = (n) => ({ guid: guid(n) });

const set = (id, name, modes, extra = {}) => ({
  type: "VARIABLE_SET",
  guid: guid(id),
  name,
  sortPosition: String.fromCharCode(33 + id),
  variableSetModes: modes.map((m, i) => ({
    id: guid(900 + id * 10 + i),
    name: m,
    sortPosition: `!${i}`,
  })),
  ...extra,
});

const variable = (id, setId, name, type, valuesByMode, extra = {}) => ({
  type: "VARIABLE",
  guid: guid(id),
  name,
  sortPosition: String.fromCharCode(33 + id),
  variableSetID: ref(setId),
  variableResolvedType: type,
  variableDataValues: {
    entries: valuesByMode.map(([modeId, value]) => ({
      modeID: guid(modeId),
      variableData: { value },
    })),
  },
  ...extra,
});

test("single-mode collection keeps bare variable names", () => {
  const dump = buildTokenDump([
    set(1, "1 Primitives", ["Mode 1"]),
    variable(10, 1, "spacing/4", "FLOAT", [[910, { floatValue: 16 }]]),
  ]);
  assert.deepEqual(dump.collections[0].variables, [
    { name: "spacing/4", type: "FLOAT", value: 16, description: "" },
  ]);
});

test("multi-mode collection prefixes each mode, one row per mode", () => {
  const dump = buildTokenDump([
    set(2, "2 Theme", ["Light", "Dark"]),
    variable(20, 2, "color/background", "COLOR", [
      [920, { colorValue: { r: 1, g: 1, b: 1, a: 1 } }],
      [921, { colorValue: { r: 0, g: 0, b: 0, a: 1 } }],
    ]),
  ]);
  assert.deepEqual(
    dump.collections[0].variables.map((v) => [v.name, v.value]),
    [
      ["Light/color/background", "#ffffff"],
      ["Dark/color/background", "#000000"],
    ],
  );
});

test("alias chains resolve to a concrete value, not an alias object", () => {
  // 3 Responsive/container/max-width → 1 Primitives/breakpoint/xl → 1280
  const dump = buildTokenDump([
    set(1, "1 Primitives", ["Mode 1"]),
    set(3, "3 Responsive", ["Desktop"]),
    variable(10, 1, "breakpoint/xl", "FLOAT", [[910, { floatValue: 1280 }]]),
    variable(30, 3, "container/max-width", "FLOAT", [
      [930, { alias: ref(10) }],
    ]),
  ]);
  const responsive = dump.collections.find((c) => c.name === "3 Responsive");
  assert.equal(responsive.variables[0].value, 1280);
});

test("alias chain deeper than the hop limit yields undefined, never an object", () => {
  const nodes = [set(1, "1 Primitives", ["Mode 1"])];
  // 7 hops of alias, longer than ALIAS_HOP_LIMIT (5)
  for (let i = 0; i < 7; i++)
    nodes.push(
      variable(10 + i, 1, `hop/${i}`, "FLOAT", [[910, { alias: ref(11 + i) }]]),
    );
  const values = buildTokenDump(nodes).collections[0].variables.map(
    (v) => v.value,
  );
  assert.ok(values.every((v) => v === undefined || typeof v !== "object"));
});

test("soft-deleted and library-sourced nodes are excluded", () => {
  const dump = buildTokenDump([
    set(1, "Live", ["Mode 1"]),
    set(2, "Deleted", ["Mode 1"], { isSoftDeleted: true }),
    set(3, "From library", ["Mode 1"], { sourceLibraryKey: "abc123" }),
    variable(10, 1, "kept", "FLOAT", [[910, { floatValue: 1 }]]),
    variable(11, 1, "dropped", "FLOAT", [[910, { floatValue: 2 }]], {
      isSoftDeleted: true,
    }),
  ]);
  assert.deepEqual(
    dump.collections.map((c) => c.name),
    ["Live"],
  );
  assert.deepEqual(
    dump.collections[0].variables.map((v) => v.name),
    ["kept"],
  );
});

test("text styles are trimmed to the Plugin API shape", () => {
  const dump = buildTokenDump([
    {
      styleType: "TEXT",
      name: "Heading/H1",
      fontSize: 60,
      fontName: {
        family: "Bubbler One",
        style: "Regular",
        postscript: "BubblerOne-Regular",
      },
    },
    {
      styleType: "TEXT",
      name: "Gone",
      fontSize: 12,
      fontName: {},
      isSoftDeleted: true,
    },
    { styleType: "FILL", name: "not a text style" },
  ]);
  assert.deepEqual(dump.textStyles, [
    {
      name: "Heading/H1",
      fontSize: 60,
      fontName: { family: "Bubbler One", style: "Regular" },
    },
  ]);
});

test("empty graph produces an empty dump rather than throwing", () => {
  assert.deepEqual(buildTokenDump([]), { collections: [], textStyles: [] });
});
