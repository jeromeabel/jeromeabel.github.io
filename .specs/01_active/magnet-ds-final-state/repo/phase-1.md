---
phase: 1
side: repo
title: Repo-side steps for phase 1 (foundations)
---

# Repo — phase 1

Everything in phase 1 that is **not** doable inside Figma. Run these in the repo, in this order, interleaved with the Figma briefs as noted. The Figma agent hands back a report per task; these steps consume those reports.

Companion Figma briefs: `../figma/P1-T01` … `P1-T09`.

## R1.1 — create the two log files (before P1-T01 runs)

- `.specs/01_active/magnet-ds-final-state/inventory.md` — the live Pass-0 inventory. Paste the P1-T01 report verbatim: page list, every master (name / id / page / section / type), both audited collections, and the four gate verdicts. Every later brief resolves targets by name off this file.
- `.specs/01_active/magnet-ds-final-state/progress.md` — append-only execution log, one entry per Figma task across all three phases. This is the git trail for work that git cannot see.

Entry format for `progress.md`:

```markdown
## P1-T05 — renames (2026-MM-DD)

- STATUS: DONE
- RESULT: 30 masters renamed, 5 deferred (see rename-map.md)
- DEVIATIONS: none
- UNBOUND: none
```

## R1.2 — after P1-T03 (`1 Primitives` audit)

```bash
pnpm figma:primitives      # regenerate primitives.json from the installed Tailwind
git add primitives.json scripts/figma/build-primitives.mjs \
        .specs/01_active/magnet-ds-final-state/inventory.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — 1 Primitives prune + brand documentation"
```

`primitives.json` is written to the **repo root**, not `scripts/figma/`. If it diffs beyond the pruned names, the Tailwind version moved — investigate before committing; a surprise diff here silently rewrites the drift baseline.

## R1.3 — after P1-T04 (`2 Theme` audit)

Update `scripts/figma/token-map.json` for every variable the audit renamed, then:

```bash
pnpm figma:verify
```

Warn-only, exits 0 — **read the report, do not trust the exit code**. Expected: no missing/extra tokens beyond documented exceptions.

```bash
git add scripts/figma/token-map.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): 2 Theme audit — orphans, duplicates, semantic renames"
```

## R1.4 — after P1-T05 (renames)

Write `.specs/01_active/magnet-ds-final-state/rename-map.md` from the P1-T05 report: three columns — live name (2026-08-15 roster) / canon name / verdict (`renamed` · `deferred to P1-T07` · `deferred to phase 2`). Header note: `Preview` in `BlogPreview` / `WorkPreview` / `ContactPreview` is the documented semantic-role exception to the no-suffix rule, and `Section` was dropped from all three.

```bash
git add .specs/01_active/magnet-ds-final-state/rename-map.md \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — domain/Component rename map applied"
```

## R1.5 — after P1-T08 (container recipe)

The Figma agent reports every node it rebound from 32 to 16. Remove the matching allowlist entries from `scripts/figma/named-debt.json` — an entry whose node is now bound is stale debt and hides the next real drift.

```bash
pnpm figma:verify-raw      # after a fresh raw-values dump per scripts/figma/dump-raw-values.md
git add scripts/figma/named-debt.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): container normalization — Header + ContactPreview 32→16 bound"
```

## R1.6 — phase-1 gate (after P1-T09)

Fresh Figma **File > Export** to `~/Downloads/Magnet-DS.fig`, then:

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig
pnpm figma:verify
pnpm figma:verify-raw
pnpm figma:verify-responsive
pnpm test
```

All four verify scripts are warn-only. Read every report. `figma:verify-responsive` must match `responsive-expected.json` **exactly** — `3 Responsive` is frozen this phase, so any diff there is a mistake, not a change.

Then update `.claude/skills/figma-verify/knowledge/figma-ds-file.md`: canon master roster, the 📐 Decisions page row, and a change-log entry.

```bash
pnpm format:write
git add .claude/skills/figma-verify/knowledge/figma-ds-file.md \
        .specs/01_active/magnet-ds-final-state/
git commit -m "docs(figma): magnet-ds phase 1 verified — canon roster, audited tokens"
```

**Do not start phase 2 until this gate passes.**
