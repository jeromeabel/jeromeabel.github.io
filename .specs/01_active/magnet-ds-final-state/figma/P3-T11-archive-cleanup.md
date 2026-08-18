---
task: P3-T11
title: Archive explorations, final roster and hygiene sweep
phase: 3
status: TODO
prerequisite: P3-T10
---

# P3-T11 — Figma-side cleanup and the final verification sweep

Last Figma task. Everything repo-side (dump, verify scripts, `named-debt.json`, the knowledge file, the spec archive) lives in `../repo/phase-3.md` and runs **after** this one passes.

**Archiving is renaming, never deleting.** The five keeper pages are 📖 Cover, 📐 Decisions, 📚 Docs, ❖ Components, 📄 Pages. Everything else that is not already an archive gets the `🗄️ Archive — ` prefix and moves to the end of the page list.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — classify every page

```js
const KEEP = ["Cover", "Decisions", "Docs", "Components", "Pages"];
const report = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  const isArchive = p.name.startsWith("🗄️");
  const isKeep = !isArchive && KEEP.some((k) => p.name.includes(k));
  report.push({ name: p.name, id: p.id, keep: isKeep, archive: isArchive, children: p.children.length });
}
return report;
```

`🗄️ Archive — Decisions` and `🗄️ Archive — Docs v1` are already-completed archiving tasks — leave them exactly as they are. `🗄️ Archive — Components` was created in P2-T04; it is also already correct.

Note that `KEEP` matching is by substring, so `🗄️ Archive — Decisions` would match `Decisions` — the `!isArchive` guard above is what stops an archive being reclassified as a keeper. Do not simplify it away.

## Step 2 — archive the leftovers

Fresh run. For every page with `keep: false, archive: false` — `XP - WorkCard` and any other exploration board:

```js
const KEEP = ["Cover", "Decisions", "Docs", "Components", "Pages"];
const moved = [];
for (const p of figma.root.children.slice()) {
  await p.loadAsync();
  if (p.name.startsWith("🗄️")) continue;
  if (KEEP.some((k) => p.name.includes(k))) continue;
  p.name = `🗄️ Archive — ${p.name}`;
  figma.root.insertChild(figma.root.children.length, p);
  moved.push(p.name);
}
return { moved, order: figma.root.children.map((p) => p.name) };
```

**Never delete a page.** Debris _inside_ a keeper page (unnamed stray nodes, empty frames with no children and no fills) may be deleted — but list each one in your report **before** deleting it, and delete nothing that has a meaningful name.

## Step 3 — final live roster

Fresh run. Re-run the P2-T11 inventory across the whole file and record the final counts:

- pages, in order
- masters per domain section on ❖ Components (`app` · `ui` · `blog` · `work` · `hero` · `contact` · `about`)
- `_Docs/*` master count
- page frames on 📄 Pages — must be **32**
- variable counts per collection

These numbers go into the report verbatim; the repo half writes them into `.claude/skills/figma-verify/knowledge/figma-ds-file.md`, so an approximate count is worse than none.

## Step 4 — canvas-hygiene sweep, whole file

Run the Gate D check (`absoluteBoundingBox` overlaps · cropped · strays) on ❖ Components, 📄 Pages, 📚 Docs and 📐 Decisions. All three arrays empty on all four pages.

Then screenshot: each of the 7 ❖ Components sections, each of the 8 📄 Pages rows, each doc frame, the Decisions page. Look at them — a COMPONENT_SET's visual label sits outside its bounds, so a geometry pass can be clean while the canvas reads as broken.

## Step 5 — binding sweep, whole file

Fresh run. Walk every node on the four keeper pages and collect any `fills`/`strokes` paint that is a raw color rather than a bound variable. Expected exceptions, and only these:

- cover/thumbnail placeholder rectangles in `work/WorkCard`, `work/WorkMiniCard`, and the page-level covers on Post / Serie post / Work detail
- decorative art layers in `contact/*` and `hero/*`

Report every other raw value with node name, page, and hex. The repo half records them in `scripts/figma/named-debt.json` with a reason, or rebinds them — that decision needs the list to exist first.

---

## Acceptance

- Only 5 keeper pages plus `🗄️ Archive — *` pages; nothing deleted.
- Final counts recorded exactly, 32 page frames.
- Gate D empty on all four keeper pages, screenshots reviewed.
- Raw-value list produced with only the documented exceptions.

**Hand-off:** report the counts and the raw-value list in full — `repo/phase-3.md` cannot run without them.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T11
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
