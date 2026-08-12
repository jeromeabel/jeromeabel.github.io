---
created: 2026-08-11
---

# Magnet-DS-v1.0 — Figma-only review (2026-08-11)

Reviewed with `design-expert` skill + its 3 new references (`industry-canon.md`,
`figma-variables-method.md`, `figma-ai-training.md`). Scope: the Figma file only —
no code changes proposed here.

- **File**: `Magnet-DS-v1.0`, key `ihWIWmvtQPTWgUxlrVjC2c`
- **Status**: findings pending execution; each finding has a checkbox
- **Verdict**: architecture is sound (token model matches code, components carry
  rich descriptions with code paths + hover verbs + decision history, Docs
  chapters follow rationale-beside-artifact). Problems are hygiene and
  consistency, not structure. One real defect.

## Inventory snapshot

| Thing | State |
|---|---|
| Pages | `📖 Cover`, `📚 Docs` (2736:4), `📐 Decisions` (2716:4244), `❖ Components` (461:759), `📄 Pages` (2558:18264) + 6 dead pages (see F2) |
| Collections | `1 Primitives` (451 vars, 1 mode), `2 Theme` (15 vars, Light/Dark), `3 Responsive` (4 vars, Desktop/Tablet/Mobile), `Design System` (2 metadata vars) |
| Components | 16 component sets + 20 solo, grouped in sections: Chrome, Actions, Sections, Typography, Metadata, Cards |
| Docs chapters | 00 About, 01 Foundations, 02 Components (6 GROUPs matching Components-page sections), 03 Sections, 04 Pages |
| Page templates | Home/Blog × Desktop/Mobile × Light/Dark (8 components on 📄 Pages) |

## 🔴 F1 — `Home — Mobile — Light` broken/stale

- [ ] Fix or delete

Node `2604:1742` (390×2533). Content bleeds outside the 390px frame (rendered
canvas is 1288px wide): hero image overlaps the headline, "LET'S TALK" + footer
text + hand-drawn SVGs sit entirely outside the frame. The 2026-08-11 mobile
rework fixed only `Home — Mobile — Dark` (`2604:1743`, 390×3465, verified
clean) by swapping in the three new Mobile section components:

- `BlogPreviewSection — Mobile` (2826:5489)
- `WorkPreviewSection — Mobile` (2829:5539)
- `ContactPreviewSection — Mobile` (2829:5576)

Fix = apply the same swaps to the Light variant (or delete it until rebuilt).
Height should land near the Dark variant's 3465px.

## 🟠 F2 — six dead pages

- [ ] Delete (or collapse into one archive page)

| Page | Id | Content |
|---|---|---|
| `Page 8` | 2678:23308 | Old typography-scale explorations, "Light tokens", "Foundation" |
| `Page 9` | 2678:32354 | DS-starter template TOC (🟡 TEMPLATES/SECTIONS/COMPONENTS/FOUNDATIONS, 🚀 Welcome) |
| `Page 11` | 2678:34657 | DS-starter template instructions (plugins, naming conventions, giant type scales) |
| `🗄 Backup — UI kit foundations & controls` | 2678:6692 | pre-restructure backup |
| `🗄 Backup — Getting started & theme overview` | 2678:10236 | pre-restructure backup |
| `🗄 Backup — Brand guidelines template` | 2678:34067 | pre-restructure backup |

magnet-ds-docs-v1 deleted only the Introduction backup. Dead pages pollute
Figma AI library sampling and contradict the one-Docs-page restructure.

## 🟠 F3 — zero variable descriptions on `2 Theme`

- [ ] Copy docs-table copy into `variable.description` for all 15 vars

All 15 Theme vars have empty `description`. The Docs token table
(`PANEL / 01 Tokens Intro`, 2670:6679) already contains the right copy, e.g.
`color/background` → "Page base canvas; never used for cards or hover states."
This is the #1 blocker on the figma-ai-training readiness checklist —
descriptions are what let AI pick between tokens whose resolved colors are
close/identical. (Primitives at 445/451 without descriptions: fine, leave.)

## 🟠 F4 — token table renders raw JSON

- [ ] Replace Light/Dark cells with swatch + primitive alias + hex
- [ ] Fix "Reserved semantic token" rows that are actually in use

In `PANEL / 01 Tokens Intro` the Light/Dark columns show
`{"r":0.9607843…}` dumps. Industry-canon §5: swatch-as-spec-card (name +
values set on the swatch color, self-demonstrating contrast). Also several
rows read "Reserved semantic token in the Theme layer" for tokens in active
use: `font/sans`, `font/title`, `font/mono`, `color/accent-hover`,
`color/foreground-strong` — misleading copy, rewrite with real usage.

## 🟠 F5 — state property casing split

- [ ] Normalize to lowercase `state` / `type` everywhere

| Convention | Sets |
|---|---|
| `state` (lowercase) | NavLink, NavLinkHome, ThemeToggle, MotionToggle, Link/CTA, Link/Secondary, Link/TextCTA, Link/Icon, Link/SecondarySm |
| `State` (capital) | PostCardPreviewBig, PostCardPreviewSmall, PostRow, SerieCard |
| `type` (lowercase) | PostMetadataTime, PostMetadataTopic |
| `Variant` (capital) | PostRow (`Post`/`Serie`) — rename to `type` |

Property renames are central; instances survive.

## 🟠 F6 — misplaced mobile components

- [ ] Move `WorkPreviewSection — Mobile` (2829:5539) + `ContactPreviewSection — Mobile` (2829:5576) into the `Sections` section (2041:484)

Both sit at Components-page top level; `BlogPreviewSection — Mobile` is
correctly inside `Sections`. Grouping membership is what Figma AI training
reads (figma-ai-training: "label + membership does" matter).

## 🟡 F7 — `Design System` metadata collection

- [ ] Set `scopes: []` (or narrowest) on `ds/version` + `ds/last-updated`; set `hiddenFromPublishing: true`
- [ ] Sync `ds/version` (`v0.91`) with the file's v1.0 name — pick one truth

`ALL_SCOPES` currently pollutes every property picker.

## 🟡 F8 — text-style noise

- [ ] Decide: hide-from-publishing or delete the 13 `Tailwind/text-*` styles (if unbound)
- [ ] Normalize 3-level outliers: `Body/xs/medium`, `Body/xl/medium`, `Body/4xl/semibold`, `Body/base/medium`

The `Tailwind/*` styles duplicate the role ramp (`Heading/*`, `Body/*`) —
sampling noise for AI, two ways to say the same thing.

## 🟡 F9 — toggles misuse `state`

- [ ] Rename prop to `mode` on ThemeToggle (`dark`/`light`) and MotionToggle (`on`/`off`)

Those are value modes, not interaction states; keeps `state` reserved for the
canonical interaction vocabulary (see G2).

## 🟡 F10 — accepted debt to record (no Figma change)

- [ ] Add to accepted-debt list (feeds the future "Rules & Debt" Figma-AI skill)

No `icon/*` mirror of `text/*`, no on-color tokens. Correct at 15-token scale
(figma-variables-method: don't plumb tokens nobody consumes) — but record it
so it stops resurfacing as a "gap".

---

# Gap decisions (the three "à trancher")

## G1 — token pairing table → **ADOPT, docs-only**

Base-style always-valid pairings, scaled down: 15 Theme tokens → ~8 pairs with
AA verdict per mode. One block in Foundations chapter (reuse `_Docs/TokenRow`
layout). Candidate pairs:

| Background | Content | Check |
|---|---|---|
| `color/background` | `color/foreground` | AA both modes |
| `color/background` | `color/foreground-strong` | AA both modes |
| `color/background` | `color/foreground-muted` | AA floor — verify |
| `color/background` | `color/accent` | AA both modes (links/CTAs) |
| `color/surface` | `color/foreground` | AA both modes |
| `color/surface` | `color/foreground-muted` | verify |
| `color/accent-subtle` | `color/accent-strong` | verify (chip pattern) |
| `color/foreground` (CTA fill) | `color/background` (CTA text) | AA both modes |

Rationale: cheap (one docs block), gates future token additions, two modes
double the contrast-regression surface. Later machine-checkable via
`figma:verify` tooling. No new tokens.

- [ ] Build pairings block in `CHAPTER / 01 Foundations`
- [ ] Compute actual contrast ratios for the "verify" rows before publishing

## G2 — state vocabulary → **ADOPT minimal (not Base's 9)**

Canonical interaction vocabulary: `default | hover | active | focus`.
Not adopted: preloading, enabled, disabled, pressed, warning, error, loading —
a static portfolio has none of these.

- [ ] Execute F5 + F9 (casing + `mode` rename) — that *is* the vocabulary enforcement
- [ ] One `_Docs/DecisionCard` in Docs defining the vocabulary + what was excluded and why
- [ ] Focus documented as **spec, not variants**: one specimen frame showing the
      accent focus ring (accent budget rule 2 reserves focus outlines — currently
      focus appears nowhere in the Figma file). Don't add a focus variant to
      every set.

## G3 — increased-contrast variant → **REJECT for now**

Would require 2 extra Theme modes (light-hc / dark-hc): doubled token
maintenance, zero consumers — code has no `prefers-contrast: more` support.
Existing AA floor (`foreground-muted` documented at AA contrast floor) covers
the real obligation.

- [ ] One `_Docs/DecisionCard`: "Considered, rejected until code implements
      `prefers-contrast`" — recorded so it stops resurfacing

## Bonus (canon's 4th flagged gap, not requested)

44px touch-target audit on mobile nav/toggles once F1 is fixed — header
controls looked tight in the mobile screenshots. Optional follow-up.

---

# Suggested execution order

1. F1 (defect) → F2 (hygiene) — independent, biggest wins
2. F3 + F4 together (same token-table copy is the source for both)
3. F5 + F9 + F6 (component-set pass, one `use_figma` session)
4. G1 pairings block, G2/G3 DecisionCards (docs pass)
5. F7, F8, F10 (cleanup + records)

All executable via `use_figma`; no code-side changes required.
