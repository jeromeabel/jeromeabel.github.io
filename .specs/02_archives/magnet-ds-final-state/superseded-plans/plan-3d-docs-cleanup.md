---
title: Phase 3 · Tasks 10–11 — Docs page, cleanup, final verification, archive
created: 2026-08-17
phase: 3 of 3
part: d of d
---

# Phase 3 · Tasks 10–11 — Docs page, cleanup, final verification, archive

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement these tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Read first — this file is a fragment.** `plan-3-pages.md` carries the goal, §Global Constraints, the shared helpers, and the §File Structure table. They apply to every task below and are not repeated here. Tasks in this file: 10–11.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md`

---

### Task 10: Docs page — 5 foundation docs, rationale moved to Decisions

Spec §2: `DOC / Getting Started` stays as the entry point; five foundation docs follow. Rationale prose moves out of Docs into Decisions records (spec §1, Docs/Decisions boundary).

**Files:**

- Modify: 📚 Docs page
- Modify: 📐 Decisions page
- Modify: `progress.md`

**Interfaces:**

- Consumes: `_Docs/*` masters, the 📐 Decisions page from phase 1 Task 2.
- Produces: the final documentation spine.

- [ ] **Step 1: Inventory the Docs page as built**

```js
const page = await PAGES("Docs");
return page.children.map((n) => ({
  name: n.name, id: n.id, type: n.type,
  w: Math.round(n.width), h: Math.round(n.height),
  kids: ("children" in n ? n.children : []).map((c) => `${c.type}:${c.name}`),
}));
```

Expect `DOC / Getting Started` plus existing `Responsive Architecture` and `Motion` docs. Record what exists, what is missing, and what holds rationale prose that belongs in Decisions.

- [ ] **Step 2: Build or complete the five docs**

Each doc is a vertical frame using `_Docs/*` masters — `_Docs/ChapterHeader` at the top, `_Docs/GroupHeader` per group, `_Docs/Paragraph` for copy, `_Docs/TokenRow` for token tables, `_Docs/SpecimenCell` for specimens, `_Docs/DoDont` for rules, `_Docs/Divider` between groups.

1. **Color** — `_Docs/TokenRow` per `2 Theme` variable, Light and Dark values side by side, above the `1 Primitives` ramp.
2. **Typography** — one `_Docs/SpecimenCell` per role (page title, section title, hero title, hero body, nav link, body, mono), each showing the bound variable name and its three resolved sizes.
3. **Spacing & Layout** — the container recipe (**16 / 1280 / centered — one recipe, zero exceptions**), the `section/rhythm-y` table, the breakpoint table, and the **Container Ownership** section: the two-tier rule (Home-type = sections own; document-type = `PageContent` owns) plus the three-tier ownership table (owns ✅ / must not ❌ / n/a ⬜) copied from spec §5, listing the six owners by name.
4. **Responsive Architecture** — keep the 18-variable table and the masters rule; **move** its exception rationale into a Decisions record.
5. **Motion** — audit against: one hover verb per component, the WorkCard hover (title underline + cover scale 1.02, 140ms ease-out), reveal animation, and reduced-motion behavior (drop scale, keep underline).

Build them one call each, reading back cold between docs. Doc order on the page follows the numbering above, after `DOC / Getting Started`.

- [ ] **Step 3: Move rationale prose to Decisions**

For every "why" paragraph found in Step 1 that explains a _choice_ rather than a _rule_, create a `_Docs/DecisionCard` instance on 📐 Decisions (same format as phase 1 Task 2 — Decision / Why / Consequences) and delete the paragraph from the doc. Docs state what is true; Decisions state why it was chosen. Record each moved record's name in `progress.md`.

- [ ] **Step 4: Add the `ui/Icon` annotation**

Spec §2: icons get no doc, just one annotation line on the master — `24×24 grid, 1.5px stroke, currentColor`. Verify the stroke width against the live `ui/Icon` master before writing the line; do not copy the number from here if the master disagrees.

- [ ] **Step 5: Screenshot every doc + commit**

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — 5 foundation docs finalized"
```

---

### Task 11: Cleanup, final verification, archive the spec

**Files:**

- Modify: 📄/❖ canvases (archiving), `scripts/pixel-manifest.mjs`, `scripts/figma/named-debt.json`
- Modify: `.claude/skills/figma-verify/knowledge/figma-ds-file.md`, `inventory.md`, `progress.md`
- Delete: `.specs/01_active/TODO_ContainerPatternAnalysis.md`, `.specs/01_active/TODO_MagnetDS_ComponentArchitecture.md`
- Move: `.specs/01_active/TODO - WorkCard — final spec (post-exploration round).md` → `.specs/01_active/work-card-redesign/spec.md`

**Interfaces:**

- Produces: the shipped design system and its verification record.

- [ ] **Step 1: Archive the explorations**

```js
const KEEP = ["Cover", "Decisions", "Docs", "Components", "Pages"];
const report = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  const isArchive = p.name.startsWith("🗄️");
  const isKeep = KEEP.some((k) => p.name.includes(k));
  report.push({ name: p.name, id: p.id, keep: isKeep, archive: isArchive, children: p.children.length });
}
return report;
```

Every page that is neither a keeper nor already an archive — `XP - WorkCard` and any other exploration board — gets renamed with the `🗄️ Archive — ` prefix and moved to the end of the page list (`figma.root.insertChild(figma.root.children.length, page)`). **Never delete a page.** Debris _inside_ a keeper page (empty frames, stray nodes with no name) is deleted; list each deletion in `progress.md` first.

- [ ] **Step 2: Refresh the pixel manifest**

`scripts/pixel-manifest.mjs` still points at components this migration retired (`WorkGalleryCard`, `WorkMiniCard`, `PostRowCalm`, `AboutStrip`, …) and at selectors that changed. For every entry: verify `storyPath` and `selector` still resolve on `pnpm dev`; mark retired components `skip: true` with a `reason` rather than deleting the entry (the id is a historical key).

```bash
pnpm dev &   # leave running for this step
pnpm geometry:web
```

Read `geometry.web.json`: every non-skipped id must have a non-null `root`. A null means the selector is stale — fix the selector, do not skip the component.

- [ ] **Step 3: Full Figma-side verification**

Fresh Figma **File > Export**, then:

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig
pnpm figma:verify
pnpm figma:verify-raw
pnpm figma:verify-responsive
pnpm test
```

All diffs are warn-only (exit 0) — **read the reports, do not trust the exit code**. Expected end state:

- `figma:verify`: no missing/extra tokens beyond documented exceptions.
- `figma:verify-raw`: every raw value present in `named-debt.json` with a reason; prune entries whose node ids no longer exist (the migration renamed and rebuilt heavily).
- `figma:verify-responsive`: the 18-variable table matches `responsive-expected.json` exactly.
- `pnpm test`: green.

- [ ] **Step 4: Final live roster and canvas-hygiene sweep**

Re-run the phase-2 Task 1 inventory. Record the final counts (pages, masters per domain section, page frames = 32). Screenshot every ❖ Components section and every 📄 Pages row: zero cropped, overlapping, or hidden masters; sections clean and ordered per spec §3 domain order.

- [ ] **Step 5: Rewrite the knowledge file**

`.claude/skills/figma-verify/knowledge/figma-ds-file.md` gets the final state: page table, master roster grouped by the 7 domain sections, the 8-route page grid, collection counts, and a change-log entry:

```markdown
- YYYY-MM-DD — Magnet-DS final state shipped
  (`.specs/02_archives/magnet-ds-final-state/`). Three phases: foundations
  (variables audit, renames, 7 domain sections, merges, container 16),
  components (14 new masters), pages (8 route masters × 4 frames = 32).
  `PageContentContainer` removed; container ownership normative (Home-type
  sections own, document-type `PageContent` owns). Docs finalized to
  Getting Started + 5 foundations; rationale lives in 📐 Decisions.
  Explorations archived. Master roster re-counted live: <n>.
```

- [ ] **Step 6: Retire the superseded TODO files**

```bash
git rm .specs/01_active/TODO_ContainerPatternAnalysis.md \
       .specs/01_active/TODO_MagnetDS_ComponentArchitecture.md
git mv ".specs/01_active/TODO - WorkCard — final spec (post-exploration round).md" \
       .specs/01_active/work-card-redesign/spec.md
```

Both deletions are safe only because their content is now normative elsewhere: container analysis → spec §5 + Docs "Spacing & Layout"; component architecture → spec §3. The WorkCard spec is **not** deleted — it still owns live component anatomy, so it moves into its topic folder.

- [ ] **Step 7: Archive the topic**

```bash
pnpm format:write
git add -A
git commit -m "docs(figma): magnet-ds final state shipped — pages, docs, cleanup verified"
./.specs/specs.sh archive magnet-ds-final-state
git add .specs
git commit -m "docs(specs): archive magnet-ds-final-state"
```

`specs.sh archive` stamps `shipped:` and regenerates `INDEX.md` — never hand-edit the index.

- [ ] **Step 8: Hand off the code-debt list**

Spec §7 (Astro renames, `PostRow` collapses, `Link` CVA vocabulary, retired-component archiving, `AboutStrip` removal from Home) is deliberately out of scope for all three plans. Open a backlog stub so it does not get lost:

```bash
./.specs/specs.sh new magnet-ds-code-convergence "Code follows Magnet-DS: renames, Link CVA, row collapses"
```

Seed it with a pointer to `.specs/02_archives/magnet-ds-final-state/design.md` §7 as the source list, plus the code-debt findings recorded in `progress.md` during phases 2 and 3 (the related-block children swap, any Figma/live layout disagreements).
