const F = (name, dir, opts = {}) =>
  figma.createAutoLayout(dir, Object.assign({ name }, opts));

const T = async (
  chars,
  { size = 16, weight = "Regular", family = "IBM Plex Sans", fill = null } = {},
) => {
  await figma.loadFontAsync({ family, style: weight });
  const t = figma.createText();
  t.fontName = { family, style: weight };
  t.fontSize = size;
  t.characters = chars;
  if (fill) t.setBoundVariable("fills", fill);
  return t;
};

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

// Find a master by exact name across all non-archive pages.
const findMaster = async (name) => {
  for (const p of figma.root.children) {
    await p.loadAsync();
    if (p.name.startsWith("🗄️")) continue;
    const hit = p.findOne(
      (x) =>
        (x.type === "COMPONENT" || x.type === "COMPONENT_SET") &&
        x.name === name &&
        !(x.parent && x.parent.type === "COMPONENT_SET"),
    );
    if (hit) return hit;
  }
  return null;
};

// Instance a master by name, optionally picking a variant by regex.
const inst = async (name, variantMatch) => {
  const hit = await findMaster(name);
  if (!hit) throw new Error(`master ${name} not found`);
  const base =
    hit.type === "COMPONENT_SET"
      ? (variantMatch
          ? hit.children.find((c) => variantMatch.test(c.name))
          : null) || hit.defaultVariant
      : hit;
  return base.createInstance();
};

// Append a finished master into its domain SECTION on ❖ Components.
const home = async (node, domain) => {
  const page = figma.root.children.find((p) => p.name.includes("Components"));
  await page.loadAsync();
  const sec = page.children.find(
    (c) => c.type === "SECTION" && c.name === domain,
  );
  if (!sec) throw new Error(`section ${domain} missing — phase 1 Task 6 first`);
  sec.appendChild(node);
  return { section: domain, id: node.id, name: node.name };
};
