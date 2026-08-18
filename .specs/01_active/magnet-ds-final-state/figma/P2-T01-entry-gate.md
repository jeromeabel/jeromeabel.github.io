---
task: P2-T01
title: Phase-2 entry gate — component roster
phase: 2
status: TODO
prerequisite: P1-T09
---

# P2-T01 — Phase-2 entry gate

Before building 15 new masters, prove the 31 existing ones are all there under their canon names. Building against a half-renamed library produces instances that are expensive to unpick.

<!-- include: _run-rules.md -->

---

## Step 1 — Diff the live roster against the target

```js
const page = figma.root.children.find((p) => p.name.includes("Components"));
await page.loadAsync();
const masters = page
  .findAll((x) => x.type === "COMPONENT" || x.type === "COMPONENT_SET")
  .filter((x) => !(x.parent && x.parent.type === "COMPONENT_SET"))
  .map((x) => ({
    name: x.name, id: x.id, type: x.type,
    section: x.parent && x.parent.type === "SECTION" ? x.parent.name : null,
    variants: x.type === "COMPONENT_SET" ? x.children.map((c) => c.name) : null,
  }));

const WANT = [
  "app/Header", "app/Footer", "app/NavLink", "app/HeaderDrawer",
  "app/ThemeToggle", "app/MotionToggle",
  "ui/Icon", "ui/H1", "ui/H2", "ui/PageDescription", "ui/SectionTitle",
  "ui/Link/primary", "ui/Link/secondary", "ui/Link/inline",
  "ui/Link/textLink", "ui/Link/iconOnly",
  "blog/PostCard", "blog/PostRow", "blog/SerieCard", "blog/BlogPreview",
  "blog/SerieList", "blog/PostList", "blog/PostMetadataTime",
  "blog/PostMetadataTopic", "blog/SerieMeta",
  "work/WorkPreview", "hero/Hero", "hero/HeroText", "hero/HeroAnimation",
  "contact/ContactPreview", "contact/ContactContent",
];
const TO_BUILD = [
  "ui/Link/external", "ui/Prose", "ui/SocialShare",
  "work/WorkCard", "work/ArchiveTable", "work/WorkHeader", "work/RelatedWriting",
  "work/WorkMiniCard",
  "blog/TableOfContents", "blog/SerieContents", "blog/PostNav", "blog/RelatedWork",
  "blog/PostRowCalm",
  "about/AboutText", "about/AboutFacts",
];
const names = masters.map((m) => m.name);
return {
  count: masters.length,
  missing: WANT.filter((w) => !names.includes(w)),
  alreadyPresent: TO_BUILD.filter((t) => names.includes(t)),
  legacy: names.filter((n) => !/^(app|ui|blog|work|hero|contact|about|_Docs)\//.test(n)),
  masters,
};
```

## Acceptance

- `missing` is empty. Anything in it means phase 1 did not finish — **stop**, do not build on top of it.
- `legacy` contains at most `WorkCardPreviewSmall` (absorbed and archived by P2-T04). Anything else is un-renamed.
- `alreadyPresent` is normally empty. If a `TO_BUILD` name is already there, report it — the corresponding brief will extend rather than create.
- `count` = 32.

The seven domain SECTIONs must exist, `about` included (empty is fine — P2-T10 fills it). If `about` is missing, re-run **P1-T06 Step 1**.

**Every later phase-2 brief assumes this gate passed.** Report the full `masters` array; Claude Code keeps it as the phase-2 baseline.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P2-T01
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
