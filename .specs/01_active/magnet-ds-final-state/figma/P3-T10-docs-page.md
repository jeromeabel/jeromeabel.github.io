---
task: P3-T10
title: Docs page — Getting Started + 5 foundation docs
phase: 3
status: TODO
prerequisite: P3-T09
---

# P3-T10 — 📚 Docs finalized, rationale moved to 📐 Decisions

Docs state **what is true**. Decisions state **why it was chosen**. Every "why" paragraph currently living in a doc moves to a decision record.

Final Docs spine: `DOC / Getting Started` (entry point, keep) followed by five foundation docs in this order:

1. **Color**
2. **Typography**
3. **Spacing & Layout**
4. **Responsive Architecture**
5. **Motion**

`ui/Icon` deliberately gets no doc — just one annotation line on the master.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — inventory the Docs page as built

```js
const page = await PAGES("Docs");
await figma.setCurrentPageAsync(page);
return page.children.map((n) => ({
  name: n.name, id: n.id, type: n.type,
  w: Math.round(n.width), h: Math.round(n.height),
  kids: ("children" in n ? n.children : []).map((c) => `${c.type}:${c.name}`),
}));
```

Expect `DOC / Getting Started` plus existing `Responsive Architecture` and `Motion` docs. Record: what exists, what is missing, and which frames hold rationale prose that belongs in Decisions. Nothing is deleted in this step.

## Step 2 — build or complete the five docs

Each doc is a vertical frame assembled from `_Docs/*` masters: `_Docs/ChapterHeader` at the top, `_Docs/GroupHeader` per group, `_Docs/Paragraph` for copy, `_Docs/TokenRow` for token tables, `_Docs/SpecimenCell` for specimens, `_Docs/DoDont` for rules, `_Docs/Divider` between groups. **One doc per run**, cold read-back between docs.

1. **Color** — one `_Docs/TokenRow` per `2 Theme` variable showing Light and Dark values side by side, above the `1 Primitives` ramp.
2. **Typography** — one `_Docs/SpecimenCell` per role: page title, section title, hero title, hero body, nav link, body, mono. Each cell shows the bound variable name and its three resolved sizes (Desktop / Tablet / Mobile).
3. **Spacing & Layout** — the container recipe (**16 / 1280 / centred — one recipe, zero exceptions**); the `section/rhythm-y` table; the breakpoint table; and a **Container Ownership** group carrying the two-tier rule (Home-type = sections own; document-type = `PageContent` owns) plus the three-tier ownership table (owns ✅ / must not ❌ / n/a ⬜) naming the six owners.
4. **Responsive Architecture** — keep the 18-variable table and the masters rule. **Move** its exception rationale into a Decisions record (Step 3).
5. **Motion** — one hover verb per component; the WorkCard hover (title underline + cover scale 1.02, 140ms ease-out); the reveal animation; reduced-motion behavior (drop the scale, keep the underline).

Doc frames go on the page in that order, after `DOC / Getting Started`, laid out on one grid with no overlaps.

## Step 3 — move rationale prose into Decisions

For every "why" paragraph found in Step 1 that explains a **choice** rather than a **rule**: create a `_Docs/DecisionCard` instance on 📐 Decisions using the shape established in P1-T02 and P2-T08 — no text component-properties; select with `layer=All`; edit the TEXT layers `layer` / `rule` / `body` / `finding`; `_Docs/Status` at `Status=Completed` with the label overridden to `ACCEPTED`; wrap in a frame named `DECISION / <slug>`.

Then remove that paragraph from the doc. Removing a paragraph whose content now lives in a decision record is a **move**, not a deletion — but only after the record exists and reads back. List every moved record's slug in your report.

## Step 4 — annotate `ui/Icon`

Set the master's description to the icon grid rule — `24×24 grid, 1.5px stroke, currentColor`. **Verify the stroke width on the live master first**; if it disagrees with 1.5, write what the master actually does and report the discrepancy. Do not copy the number from this brief.

## Step 5 — screenshot every doc

One screenshot per doc frame plus one of the whole page. Check: no doc is cropped, no two docs overlap, `DOC / Getting Started` is first, the five foundations follow in order.

---

## Acceptance

- 6 doc frames on 📚 Docs in the fixed order.
- Every rationale paragraph either still a rule, or moved to a decision record that reads back.
- `ui/Icon` annotated with its real values.
- Page laid out clean, screenshots reviewed.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T10
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
