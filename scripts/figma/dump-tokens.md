# Figma token dump — figma-blog-fit

1. Read the `/figma-use` skill (required before any `use_figma` call this session).
2. Run ONE `use_figma` call on file `Wf4iomVMYUXlFIBV3Z8bx4` with the script below.
3. Save the returned JSON to `tokens.figma.json` at repo root.
4. Run `pnpm figma:verify` and record verdicts in `notes.md`.

```js
const out = { collections: [], textStyles: [] };
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const multiMode = c.modes.length > 1;
  const vars = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    for (const m of c.modes) {
      let value = v.valuesByMode[m.modeId];
      if (value && value.type === "VARIABLE_ALIAS") {
        const ref = await figma.variables.getVariableByIdAsync(value.id);
        value = { alias: ref.name };
      } else if (v.resolvedType === "COLOR" && value) {
        const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
        value = `#${h(value.r)}${h(value.g)}${h(value.b)}`;
      }
      vars.push({ name: multiMode ? `${m.name}/${v.name}` : v.name, type: v.resolvedType, value, description: v.description });
    }
  }
  out.collections.push({ name: c.name, modes: c.modes.map((m) => m.name), variables: vars });
}
for (const s of await figma.getLocalTextStylesAsync())
  out.textStyles.push({ name: s.name, fontSize: s.fontSize, fontName: s.fontName });
return out;
```
