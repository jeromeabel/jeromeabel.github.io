const PAGES = async (match) => {
  const p = figma.root.children.find((x) => x.name.includes(match));
  if (!p) throw new Error(`page ${match} not found`);
  await p.loadAsync();
  return p;
};

const F = (name, dir, opts = {}) =>
  figma.createAutoLayout(dir, Object.assign({ name }, opts));

const VARS = async () => {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const map = { _cols: {} };
  for (const c of cols) {
    map._cols[c.name] = c;
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      map[`${c.name}::${v.name}`] = v;
    }
  }
  return map;
};

const inst = async (name, variantMatch) => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    if (p.name.startsWith("🗄️")) continue;
    const hit = p.findOne((x) => x.name === name);
    if (!hit) continue;
    const base =
      hit.type === "COMPONENT_SET"
        ? (variantMatch
            ? hit.children.find((c) => variantMatch.test(c.name))
            : null) || hit.defaultVariant
        : hit;
    return base.createInstance();
  }
  throw new Error(`master ${name} not found`);
};

// Document-type container recipe: 16 gutter / 1280 max / centered.
const container = (frame, V) => {
  frame.setBoundVariable("paddingLeft", V["3 Responsive::container/gutter"]);
  frame.setBoundVariable("paddingRight", V["3 Responsive::container/gutter"]);
  frame.setBoundVariable("maxWidth", V["3 Responsive::container/max-width"]);
  frame.primaryAxisAlignItems = "MIN";
  frame.counterAxisAlignItems = "CENTER";
};

// Document-type page shell: Header + container'd PageContent.
// Caller fills pc, then appends the Footer to root last.
const shell = async (name, breakpoint, V) => {
  const root = F(name, "VERTICAL", { itemSpacing: 0 });
  root.resize(breakpoint === "Mobile" ? 390 : 1280, 100);
  root.layoutSizingHorizontal = "FIXED";
  root.primaryAxisSizingMode = "AUTO";
  root.setBoundVariable("fills", V["2 Theme::color/background"]);
  const header = await inst(
    "app/Header",
    new RegExp(`breakpoint=${breakpoint}`),
  );
  root.appendChild(header);
  header.layoutSizingHorizontal = "FILL";
  const pc = F("PageContent", "VERTICAL", {});
  root.appendChild(pc);
  pc.layoutSizingHorizontal = "FILL";
  container(pc, V);
  pc.setBoundVariable("itemSpacing", V["3 Responsive::section/rhythm-y"]);
  pc.setBoundVariable("paddingTop", V["3 Responsive::section/rhythm-y"]);
  pc.setBoundVariable("paddingBottom", V["3 Responsive::section/rhythm-y"]);
  return { root, pc };
};

// Pin explicit modes. modes = {"2 Theme": "Dark", "3 Responsive": "Mobile"}
const pin = (node, V, modes) => {
  const out = {};
  for (const [colName, modeName] of Object.entries(modes)) {
    const col = V._cols[colName];
    const mode = col.modes.find((m) => m.name === modeName);
    try {
      node.setExplicitVariableModeForCollection(col, mode.modeId);
    } catch (e) {
      node.setExplicitVariableModeForCollection(col.id, mode.modeId);
    }
    out[colName] = mode.name;
  }
  return out;
};
