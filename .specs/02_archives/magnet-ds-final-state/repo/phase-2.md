---
phase: 2
side: repo
title: Repo-side steps for phase 2 (components)
---

# Repo — phase 2

Companion Figma briefs: `../figma/P2-T01` … `P2-T11`. Phase 2 is almost entirely Figma work — the repo's job is logging, raw-value bookkeeping, and the exit gate.

## R2.1 — log every Figma task

Append one `progress.md` entry per brief as its report comes back, in the P1 format. Commit in batches, not per task:

```bash
git add .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "docs(specs): magnet-ds-final-state — phase 2 progress (P2-T0x … P2-T0y)"
```

## R2.2 — after each brief that reports raw values

P2-T03 (`ui/Prose`, `ui/SocialShare`) and P2-T04 (`work/WorkCard`) both introduce placeholder art. Placeholders are allowed to stay unbound, but they must be **declared**:

```bash
pnpm figma:verify-raw     # after a fresh raw-values dump per scripts/figma/dump-raw-values.md
```

Add an entry to `scripts/figma/named-debt.json` for each intentional raw value with a `reason`. Anything raw and _not_ in the allowlist is a defect — send it back to the Figma brief rather than allowlisting it.

```bash
git add scripts/figma/named-debt.json \
        .specs/01_active/magnet-ds-final-state/progress.md
git commit -m "chore(figma): phase 2 masters — declared raw-value debt"
```

## R2.3 — record the code-debt findings phase 2 surfaces

These are **not** fixed here; they are collected for the `magnet-ds-code-convergence` backlog stub opened in `phase-3.md` R3.6. Log each in `progress.md` under a `CODE DEBT` heading:

- **P2-T05** — `work/ArchiveTable` row hover binds to `2 Theme::color/surface`; live code uses `surface/50`. Figma did not invent a token; code should converge or the token should gain a half-step. Decide in the convergence topic.
- **P2-T08** — related blocks use compact children (`work/WorkMiniCard`, `blog/PostRowCalm`), not the page's own cards. Decision record 5 `related-block-children` is the durable artifact; code already matches, so this is a _documentation_ item, not a change.
- **P2-T09** — `work/WorkHeader` link labels map `website→Website`, `live→Demo`, `git→Code`, `video→Video`. Confirm `WorkHeader.astro` still uses exactly that mapping before phase 3 builds the Work-detail master on it.
- **P2-T06** — `contact/ContactPreview breakpoint=Mobile` hides the illustration and noise layers rather than deleting them; live `ContactImage.astro` is `hidden … sm:block`. Matches — record as verified, no debt.

## R2.4 — phase-2 exit gate (repo half of P2-T11)

P2-T11 does the Figma half (roster assertions, variant axes, Gate D, screenshots). Then, from a fresh **File > Export**:

```bash
pnpm figma:dump ~/Downloads/Magnet-DS.fig   # locale note: ~/Téléchargements/ here
pnpm figma:verify
pnpm figma:verify-raw   # needs a FRESH walk first — see below
pnpm test
```

Read the reports. Expected end state: token diff clean, every raw value declared, tests green.

P2-T11b changed what `verify-raw` has to account for. The raw list is now **19 entries, none white**:
`prose-link-annotation` (1 TEXT node, `rgb(153,153,153)`, a doc annotation in the `ui` section) and
**18 VECTOR paths** inside `contact/ContactPreview` (bluesky / linkedin / mail SVG internals, ×2
breakpoints — path fills do not bind to variables). The 12-entry list P2-T11 carried forward is
obsolete: 224 default-white frame fills were cleared and the 4 `cover` placeholders are bound to
`color/gray/200`. If `verify-raw` reports anything white, the `F()` fix (`ad95a17`) regressed.

**`figma:dump` does not refresh `raw-values.figma.json`.** That file comes from a live `use_figma`
walk (`scripts/figma/dump-raw-values.md`), so a fresh `.fig` export leaves it exactly as it was —
and `diff-raw-values.mjs` is warn-only, so it will report on a week-old snapshot without complaint.
Run the walk before `verify-raw`, and read the `_raw dump … · token dump …_` header the script now
prints: if the raw dump is older, it says so in a ⚠️ block.

Update `.claude/skills/figma-verify/knowledge/figma-ds-file.md` with the 14 new masters and the final phase-2 counts (**46** on ❖ Components, **11** `_Docs/*`, **4** page masters, **1** `zz/` retired master on `🗄️ Archive — Components`, **62** total).

```bash
pnpm format:write
git add .claude/skills/figma-verify/knowledge/figma-ds-file.md \
        scripts/figma/named-debt.json \
        .specs/01_active/magnet-ds-final-state/
git commit -m "docs(figma): magnet-ds phase 2 verified — 15 new component masters"
```

**Do not start phase 3 until this gate passes** — building pages against a half-finished library produces broken instances that are expensive to unpick.
