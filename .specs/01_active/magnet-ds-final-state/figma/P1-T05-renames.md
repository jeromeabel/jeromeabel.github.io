---
task: P1-T05
title: Rename all masters to domain/Component
phase: 1
status: TODO
prerequisite: P1-T04
---

# P1-T05 — Mechanical renames to `domain/Component`

**Goal:** every component master on ❖ Components is named `domain/Component`. This is the task that makes every later brief addressable by name.

Renaming a master does **not** touch its instances — instances follow by id. Safe, but it must be **complete**: a half-renamed roster is worse than none.

<!-- include: _run-rules.md -->

---

## Step 1 — Apply the map in one run

The `from` keys below are the **live** 2026-08-18 names verified by P1-T01 Gate B. Four of them differ from an earlier naming vintage (`Link/CTA`, `Link/SecondarySm`, `Link/TextCTA`, `Link/Icon`) — those old keys are dead, ignore them if you see them quoted elsewhere.

```js
const MAP = {
  // app/
  Header: "app/Header",
  Footer: "app/Footer",
  HeaderDrawer: "app/HeaderDrawer",
  ThemeToggle: "app/ThemeToggle",
  MotionToggle: "app/MotionToggle",
  // ui/
  Icon: "ui/Icon",
  H1: "ui/H1",
  H2: "ui/H2",
  PageDescription: "ui/PageDescription",
  PreviewTitle: "ui/SectionTitle",
  "Link/Primary": "ui/Link/primary",
  "Link/Secondary": "ui/Link/secondary",
  "Link/SecondarySmall": "ui/Link/inline",
  "Link/TextLink": "ui/Link/textLink",
  "Link/IconOnly": "ui/Link/iconOnly",
  // hero/
  Hero: "hero/Hero",
  HeroText: "hero/HeroText",
  HeroAnimation: "hero/HeroAnimation",
  // blog/
  BlogPreviewSection: "blog/BlogPreview",
  PostArchiveList: "blog/PostList",
  SerieCardList: "blog/SerieList",
  PostRow: "blog/PostRow",
  SerieCard: "blog/SerieCard",
  PostMetadataTime: "blog/PostMetadataTime",
  PostMetadataTopic: "blog/PostMetadataTopic",
  SerieMeta: "blog/SerieMeta",
  // work/
  WorkPreviewSection: "work/WorkPreview",
  // contact/
  ContactPreviewSection: "contact/ContactPreview",
  ContactContent: "contact/ContactContent",
};

const out = { renamed: [], missing: [] };
for (const p of figma.root.children) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue; // archives are immutable
  for (const node of p.findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")) {
    if (node.parent && node.parent.type === "COMPONENT_SET") continue;
    const target = MAP[node.name];
    if (!target) continue;
    out.renamed.push({ from: node.name, to: target, id: node.id, page: p.name });
    node.name = target;
  }
}
for (const k of Object.keys(MAP))
  if (!out.renamed.some((r) => r.from === k)) out.missing.push(k);
return out;
```

**Expected:** 30 renames, `missing: []`.

Names deliberately **not** in the map, and why:

| Live name                                    | Why it is skipped                                           |
| -------------------------------------------- | ----------------------------------------------------------- |
| `NavLink`, `NavLinkHome`                     | merged into `app/NavLink` by **P1-T07**                     |
| `PostCardPreviewBig`, `PostCardPreviewSmall` | merged into `blog/PostCard` by **P1-T07**                   |
| `WorkCardPreviewSmall`                       | absorbed into `work/WorkCard` by **P2-T04**, then archived  |
| `_Docs/*` (11 masters)                       | doc infrastructure, outside DS component scope — names stay |

---

## Step 2 — Read back cold and prove it landed

Fresh run:

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const DOMAINS = ["app", "ui", "blog", "work", "hero", "contact", "about"];
const KNOWN_STRAGGLERS = ["NavLink", "NavLinkHome", "PostCardPreviewBig", "PostCardPreviewSmall", "WorkCardPreviewSmall"];
const masters = page
  .findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")
  .filter((x) => !(x.parent && x.parent.type === "COMPONENT_SET"))
  .map((x) => x.name);
return {
  total: masters.length,
  canon: masters.filter((n) => DOMAINS.includes(n.split("/")[0])),
  stragglers: masters.filter((n) => KNOWN_STRAGGLERS.includes(n)),
  docs: masters.filter((n) => n.startsWith("_Docs/")),
  unexpected: masters.filter(
    (n) => !DOMAINS.includes(n.split("/")[0]) && !KNOWN_STRAGGLERS.includes(n) && !n.startsWith("_Docs/"),
  ),
};
```

## Acceptance

- `unexpected` is empty. Anything in it is an un-renamed master — fix it before moving on.
- `stragglers` has exactly the 5 names above.
- `canon` has 30 entries.

**Naming note for the report:** `Preview` in `blog/BlogPreview` / `work/WorkPreview` / `contact/ContactPreview` is the one documented semantic-role exception to the no-suffix rule. `Section` was dropped from all three.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P1-T05
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
