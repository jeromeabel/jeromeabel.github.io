### Task 6: Readability pass per §2

Headings carry the scan; captions ≤ 2 sentences; body text 50–75 chars per line (≈ 640px at 13–14px for these fonts — the widths already used above). Decision copy stays verbatim — this pass touches only connective prose and geometry, never validated captions.

**Files:**

- Modify: `DOCS / Design System — Light`

**Interfaces:**

- Consumes: the finished chapter structure from Tasks 3–5
- Produces: an audit-clean sheet; the audit script is reused in Task 8's final check

- [x] **Step 1: Audit — long lines, missing size jumps, over-long prose**

```js
const page = figma.root.children.find((p) => p.name === "📚 Docs");
await figma.setCurrentPageAsync(page);
const light = page.findOne((n) => n.name === "DOCS / Design System — Light");
const wide = [],
  longProse = [],
  flatHeadings = [];
for (const t of light.findAll((n) => n.type === "TEXT")) {
  const chars = t.characters;
  // ~75 chars/line: flag wrapping text wider than 720px at body sizes
  if (t.fontSize <= 14 && t.width > 720 && chars.length > 90)
    wide.push({ id: t.id, w: Math.round(t.width), text: chars.slice(0, 60) });
  // connective prose over 2 sentences (skip verbatim decision captions — they carry " · ")
  const sentences = (chars.match(/[.!?](\s|$)/g) || []).length;
  if (
    sentences > 2 &&
    !chars.includes(" · ") &&
    !/^The design system behind/.test(chars)
  )
    longProse.push({ id: t.id, sentences, text: chars.slice(0, 80) });
}
// Heading jump check: group headings must be ≥2 steps above body (30 vs 13/14 — pass by construction; verify none drifted)
for (const t of light.findAll((n) => n.type === "TEXT"))
  if (
    /^GROUP \//.test(t.parent.name) &&
    t === t.parent.children[0] &&
    t.fontSize < 22
  )
    flatHeadings.push({ id: t.id, size: t.fontSize });
return { wide, longProse, flatHeadings };
```

- [x] **Step 2: Fix what the audit flagged**

Per flagged node, one targeted call: `wide` → `layoutSizingHorizontal = "FIXED"; resize(640, h)`. `longProse` → rewrite to ≤2 sentences (copy tone: concrete, no marketing) — unless the text is a verbatim caption, in which case leave it and note it. `flatHeadings` → `fontSize = 30`, `IBM Plex Sans SemiBold`. Re-run Step 1 until all three lists are empty.

Verified result in Figma: `wide = []`, `longProse = []`, `flatHeadings = []`.

- [x] **Step 3: Commit**

```bash
git add .specs/01_active/design-system-docs-restructure/plan.md
git commit -m "docs(specs): ds-docs-restructure — task 6 readability pass (line length, prose, heading jumps)"
```

---
