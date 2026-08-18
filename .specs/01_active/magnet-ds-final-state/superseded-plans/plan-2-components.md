---
title: Magnet-DS final state — phase 2, component masters (implementation plan)
created: 2026-08-17
phase: 2 of 3
---

# Magnet-DS Component Masters Implementation Plan (phase 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 14 masters the final inventory is missing — `ui/Link/external`, `ui/Prose`, `ui/SocialShare`, `work/WorkCard` (catalogue + case, absorbing `WorkCardPreviewSmall`), `work/ArchiveTable`, `contact/ContactPreview` mobile variant, the six pruned detail components (`blog/TableOfContents`, `blog/SerieContents`, `blog/PostNav`, `blog/RelatedWork`, `work/WorkHeader`, `work/RelatedWriting`) and the three `about/*` masters — so phase 3 can assemble page masters out of instances only.

**Architecture:** Every master is built from tokens, not numbers: fills bind to `2 Theme`, responsive sizes bind to `3 Responsive`, everything else uses the ladder already in `1 Primitives`. Layouts are **not redesigned** — each one mirrors its live Astro component, cited by file path in its task. Masters land directly in their domain section from phase 1, laid out on the same grid, so canvas hygiene never regresses.

**Tech Stack:** Figma Plugin API via the `use_figma` MCP tool (file `ihWIWmvtQPTWgUxlrVjC2c`); live routes at `pnpm dev` (localhost:4321) as the visual reference; `pnpm figma:verify-raw` as the tokenization gate.

**Spec:** `.specs/01_active/magnet-ds-final-state/design.md` (component inventory §3, migration step 6). WorkCard anatomy is owned by `.specs/01_active/TODO - WorkCard — final spec (post-exploration round).md`.

**Prerequisite:** `plan-1-foundations.md` complete through its Task 9 gate. **Next:** `plan-3-pages.md`.

## Global Constraints

Every task's requirements implicitly include this section.

- **File key:** `ihWIWmvtQPTWgUxlrVjC2c`. Resolve every target **by name** off `.specs/01_active/magnet-ds-final-state/inventory.md` §Phase-1-after. IDs anywhere are hints.
- **Run `/figma-use` once per session before any `use_figma` call.**
- **One batched `use_figma` call per master.** Build, then read back in a _separate_ call — geometry read in the same tick is stale.
- **Tokenization rule:** no raw hex, no raw font size, no raw radius. Fills bind to `2 Theme`; responsive type/spacing binds to `3 Responsive`; anything else uses a `1 Primitives` value. A raw value that cannot be avoided goes into `scripts/figma/named-debt.json` with a `reason` **in the same task that creates it** — never later.
- **Every new master lands in its phase-1 domain section** (`app`, `ui`, `blog`, `work`, `hero`, `contact`, `about`) and is re-laid-out on the section grid before the task's commit. Canvas hygiene (no crop, no overlap, no stray) is a task-level gate, not a phase-end cleanup.
- **Naming:** `domain/Component`, PascalCase leaf, no role suffix. Variant axes lowercase (`variant`, `size`, `type`, `state`, `breakpoint`); values as written in each task.
- **Mirror the route, don't redesign it.** Each build task names the Astro file it mirrors. A layout disagreement is a finding for the code-debt list, not a silent Figma improvement.
- **Text content is real content**, taken from the live routes — never lorem. Real strings are what make a master's width honest.
- **Desktop first at 1280.** Mobile behavior rides `3 Responsive` modes; a `breakpoint` axis is added only where `layoutMode` actually flips (a variable cannot express direction).
- `🗄️ Archive — *` pages are immutable. Retired explorations are archived, never deleted.
- Conventional commits: `docs(specs):` for spec/progress files, `chore(figma):` for `scripts/figma/`.

### Shared build helpers (paste into any build call)

```js
// Frame with auto-layout.
const F = (name, dir, opts = {}) => {
  const f = figma.createAutoLayout(dir, Object.assign({ name }, opts));
  return f;
};
// Text node with a bound fill. `role` is a 2 Theme variable name.
const T = async (chars, { size = 16, weight = "Regular", family = "IBM Plex Sans", fill = null } = {}) => {
  const t = figma.createText();
  await figma.loadFontAsync({ family, style: weight });
  t.fontName = { family, style: weight };
  t.characters = chars;
  t.fontSize = size;
  if (fill) t.setBoundVariable("fills", fill);
  return t;
};
// Resolve variables once per call.
const VARS = async () => {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const map = {};
  for (const c of cols)
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      map[`${c.name}::${v.name}`] = v;
    }
  return map;
};
// Drop a finished master into its domain section.
const home = async (node, domain) => {
  const page = figma.root.children.find((p) => p.name.includes("Components"));
  await page.loadAsync();
  const s = page.children.find((c) => c.type === "SECTION" && c.name === domain);
  if (!s) throw new Error(`section ${domain} missing — phase 1 Task 6 not done`);
  s.appendChild(node);
  return s.id;
};
```

## File Structure

| File                                                     | Responsibility                                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `.specs/01_active/magnet-ds-final-state/progress.md`     | **Modify.** One append per task: what was built, the read-back proof, deviations.                              |
| `.specs/01_active/magnet-ds-final-state/inventory.md`    | **Modify.** Task 11 appends §Phase-2-after with the new master roster.                                         |
| `scripts/figma/named-debt.json`                          | **Modify.** Any raw value a new master deliberately keeps, with its reason, added by the task that creates it. |
| `.claude/skills/figma-verify/knowledge/figma-ds-file.md` | **Modify.** Task 11 adds the 13 new masters and a change-log entry.                                            |

## Task Files

This plan is split into fragments so each is readable in one bite. Execute them in order; every fragment assumes the §Global Constraints and §Shared build helpers above.

| File                         | Tasks | Deliverable                                                                                         |
| ---------------------------- | ----- | --------------------------------------------------------------------------------------------------- |
| `plan-2a-gate-ui.md`         | 1–3   | Phase-2 entry gate (inventory diff); `ui/Link/external`, `ui/Prose`, `ui/SocialShare`.              |
| `plan-2b-work-cards.md`      | 4–5   | `work/WorkCard` (catalogue + case, side axis) and `work/ArchiveTable`.                              |
| `plan-2c-contact-blog.md`    | 6–8   | `contact/ContactPreview` mobile; `blog/TableOfContents`, `SerieContents`, `PostNav`, `RelatedWork`. |
| `plan-2d-work-about-gate.md` | 9–11  | `work/WorkHeader`, `work/RelatedWriting`, the three `about/*` masters, phase-2 gate.                |

Task 1 is a gate: do not build a master before the phase-1 output diff is clean.
