---
title: WorkCard — final spec (post-exploration round)
status: recommended, pending editorial sign-off
sources: WorkCard Exploration board (1a–1h), survey.md, brief §5 Magnet-DS constraints
date: 2026-08-15
---

# WorkCard — decisions & final spec

## 1 · Core decision

Work and blog split by **grammar, not decoration**:

- **Blog = feed.** Time-ranked, one-big-plus-rows asymmetry, dates, serie chips, descriptions. Blog keeps all of these exclusively.
- **Work = catalogue.** Curated, rank-ordered, numbered, no dates, no descriptions, receipts (stack + external links) instead of teasers.

Winning card: **B+A merged** (board `1g`) — numbered catalogue plate carrying a work-only meta rail.
/work Selected: **D uniform zigzag case-block stack** (board `1d`) — the survey's modal pattern at exactly 4 described projects.
Rejected: C shape-flip (dies on bad covers, second ratio system), E spec-sheet (reads as an ArchiveTable fragment), F overlay (needs a permanent scrim → fights "the image is the frame"), 1+3 asymmetric /work (0/25 in the wild; 1+N is blog's signature).

## 2 · UI element decisions

**WorkCard `catalogue` (Home + any grid use)** — top to bottom:

1. **Hairline** — 1px `--color-border`, full card width. Structural top edge; replaces any box border.
2. **Index row** — mono numeral `01` (Fira Code 400, tabular, muted, ~12px) left; muted mono `↗` right. Never accent, never display-size.
3. **Cover** — 16:9, radius `lg` (8px), borderless, no scrim, no overlay text. The image is the frame.
4. **Title** — IBM Plex Sans 600, ~17px, default text color.
5. **Kicker** — `TYPE · YEAR`, Fira Code uppercase, muted, letterspaced. Free from `type` + `date`; ≤3 words.
6. **Meta rail** — hairline, then `stack[]` joined with `·` (mono, muted), then artifact links `↗ Live` / `↗ Repo` / `↗ Video` (mono, default text color — stronger than stack, never accent).

Omitted by design: description, date, read-time, serie chip, part counter, folder icon (all blog-only).

**WorkCard `case` (/work Selected only):**

- Grid row: 16:9 cover (~500px) one side, text column the other; **alternate sides per row (zigzag)**; hairline between rows.
- Text column: kicker → title (Plex 600 ~21px) → three labeled rows `PROBLEM / SOLUTION / LEARNING` (mono 10px muted labels, one sentence each, Plex 400 ~13.5px) → link row (`2 articles →`, `↗ Live`…).
- No number on case blocks — the stack is equal-weight; rank lives in order only.

**Hover (both variants):** one verb — title underline + cover scale ≤2%, coupled, ~140ms ease-out. Never dim/tint the cover, never accent the title. Reduced motion: keep underline, drop scale. **Everything visible at rest** — nothing hover-revealed (retires the shipped black-wipe overlay card).

## 3 · Copywriting decisions

- **Kicker format:** `TYPE · YEAR` or `TYPE · YYYY–YYYY` (`WEB APP · 2026`, `ART · 2013–2019`). Uppercase mono, no prose.
- **Titles are names, not headlines** — `Malinette`, `Chimères Orchestra`. No verbs, no selling.
- **No description on any preview work card.** It was the single biggest blog-tell; the field at N≤5 cuts to caption. The Problem/Solution framing lives on /work Selected case blocks and the detail page.
- **P/S/L lines:** exactly one sentence each, plain declarative French, no jargon stacking. Learning is a takeaway, not a moral (`La documentation est le produit.`).
- **Link labels:** fixed vocabulary `Live · Repo · Video`, always with `↗`; blog cross-links as `N article(s) →`. Section CTAs: `All work →` (the only accent on the section).

## 4 · Page & layout decisions

- **Home `WorkPreviewSection`:** exactly **3** `catalogue` cards, equal 3-col grid, gap 40. Sits under Blog without out-shouting it — blog keeps the one-big cell; work reads as a numbered row.
- **`/work` Selected:** exactly **4** entries as a **uniform zigzag case-block stack** (non-hierarchical). `ArchiveTable` (ledger) below — stack + ledger mirrors the two families found in the wild.
- **Mobile 390:** single column, full card order preserved; stack + links merge to one mono line. Nothing depends on hover.
- **Ranking:** `featured` 1→4 = `leconceptdelapreuve`, `chimeres-orchestra`, `malinette`, `portfolio` (slot 4 = portfolio, proposal — editorial loop owns it). Sort moves date → `featured`; Home takes limit 3, /work limit 4.
- **Frontmatter:** no new keys; backfill `kicker` on `portfolio` only.

## 5 · Do / Don't

**Do**

- Do keep work cards borderless — hairline top edge + image-as-frame only.
- Do set numerals in Fira Code, tabular, muted, small (≤12px).
- Do show stack + external links on every preview card — they are the two signals blog can never carry.
- Do keep the whole card one link target; ≥44px tap rows on mobile.
- Do keep /work Selected equal-weight; hierarchy is order, not size.
- Do check AA in both themes for every text token; covers carry no text, so heterogeneous images can't break contrast.

**Don't**

- Don't put a description, date, read-time, serie chip, part counter, or folder icon on a work card.
- Don't use display-size or accent numerals; don't use accent anywhere on the card except nothing — accent stays on the section CTA.
- Don't overlay text on covers, at rest or on hover; don't add scrims.
- Don't hover-reveal anything essential; don't dim/tint covers or move elements >2%.
- Don't give work a one-big-plus-rows layout — 1+N is blog's structural signature.
- Don't reuse `year | title | type | stack` ledger rows for Selected — that grammar belongs to ArchiveTable.
- Don't crop covers to a second ratio (4:5) — one ratio system, 16:9, no re-crops.
- Don't add frontmatter keys; unmet needs are findings, not schema changes.

## 6 · Component change list

- `WorkCard`: new variants `catalogue` + `case`; description prop dropped from previews; hover-wipe overlay retired.
- `WorkPreviewSection`: shell unchanged; passes rank index.
- `/work` Selected: plate grid → uniform zigzag `case` stack.
- `getFeaturedWorks(limit)`: sort by `featured` asc; callers pass 3 (Home) / 4 (/work).
