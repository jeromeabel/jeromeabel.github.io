---
created: 2026-07-21
title: Editorial v4 — research & critique materials (for review loops)
sources:
  - "~/Bureau/BLOG/v3-redesign/Design Review v3.dc.html (July 2026)"
  - "~/Bureau/BLOG/v3-redesign/Editorial Direction v4.dc.html (July 2026)"
  - "claude.ai artifact a4526353 — Work page, 3 structures compared"
  - "~/Bureau/JOB/job-strategy-2026.md"
  - "codebase scan on branch redesign/v3 (2026-07-21)"
---

# Editorial v4 — research file

Raw materials behind `design.md`: critiques, scorecards, research findings, the
critique→code status ledger, the full content scan, and job-strategy research.
Use this file for future critique loops; the design spec stays clean.

---

## 1 · Compiled critiques — verdict and scorecard

**Core problem (Design Review v3):** a reviewer answers _who is this / what do
they do / why care_ in ~5 seconds. v3 answered "interesting creative person",
not "Vue/TypeScript engineer who ships measured results". The single strongest
proof (**4s→2.5s load, −71.5% DOM**) appeared nowhere on the site.

**Good news:** the blog (21 EN articles ≫ the 4–5 that already changes hiring
perception) and the visual system are genuine assets. This is a
**content-ordering and copy problem**, not a redesign.

| Page  | Score  | One-liner                                |
| ----- | ------ | ---------------------------------------- |
| Home  | 6/10   | Charming, fails the 5-second test        |
| Blog  | 7.5/10 | Best asset, buried by chronology         |
| Work  | 5/10   | Wrong projects promoted for target roles |
| About | 7/10   | Strongest copy, weakest last paragraph   |

## 2 · Research findings the reviews lean on (repeat across sources)

1. **5–10 second test** — name + role + strongest work above the fold.
2. **Outcome-first titles** — impact in the title/one-liner, reasoning in the body.
3. **Curate to 3–5 featured projects** — dated stacks actively hurt.
4. **Case studies show thinking** — problem / role / decisions / measured impact / reflection.
5. **A blog is a hiring multiplier** — 21 articles is the unfair advantage; exploit harder.
6. **Generic self-description is invisible** — read-aloud test; every claim replaceable by a number, artifact, or link, else cut.
7. **Niching down wins** — artist-turned-engineer + performance measurement is a real niche.
8. **One primary CTA per page; contact everywhere** — sell before offering exits.

## 3 · Critique → status ledger (verified against code, 2026-07-21)

| #   | Critique                                                         | Page   | Status                                                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | No role/stack/availability above the fold                        | Home   | **TODO** — hero is "Hi, I'm Jérôme" + tagline; no availability, no proof line                                                                                                                                                                                                                                  |
| C2  | Proof-metrics line absent from the whole site                    | Home   | **TODO**                                                                                                                                                                                                                                                                                                       |
| C3  | Social icons offer exits above the fold                          | Home   | **TODO** — verified: `HeroSocials` imported in `HeroText.astro:16`; move to footer                                                                                                                                                                                                                             |
| C4  | Primary CTA sends to longest content path                        | Home   | **PARTIAL** — "Start reading" kept by writing-first strategy; see D3                                                                                                                                                                                                                                           |
| C5  | Work strip mispositions (art first)                              | Home   | **PARTIAL** — featured works exist; Home strip composition per D4                                                                                                                                                                                                                                              |
| C6  | Series buried below 20 rows of links                             | Blog   | **TODO** — verified: `blog.astro` renders year-grouped list first, Series section after (lines 14–55)                                                                                                                                                                                                          |
| C7  | No curation signal ("Start here")                                | Blog   | **TODO**                                                                                                                                                                                                                                                                                                       |
| C8  | No outcome sublines on posts with results                        | Blog   | **TODO** — mechanism identified: `description` frontmatter (see §5 scan)                                                                                                                                                                                                                                       |
| C9  | Low dark-mode row contrast; metadata competes with titles        | Blog   | **TODO** — contrast pass + 375px pass                                                                                                                                                                                                                                                                          |
| C10 | Work page: no tiers, 16-row table mixing 2012–2025               | Work   | **DONE (structure)** — `work.astro` ships Selected work + ArchiveTable. Selected = 3 cards (Le Concept 2 · Chimères 3 · Malinette 4); `portfolio` unflagged **deliberately** (Portfolio-demotion decision 2026-07-19). Editorial-v4 sources assumed 4 featured — conflict is a loop-1 open question, not a bug |
| C11 | No case studies / 5-line wrappers; every link exits site         | Work   | **TODO** — wrappers authored in design §Work; need pages/copy                                                                                                                                                                                                                                                  |
| C12 | Anonymized day-job perf case study missing                       | Work   | **TODO** — highest-value single item; perf serie is 80% of material                                                                                                                                                                                                                                            |
| C13 | About final paragraph is filler ("quality and maintainability…") | About  | **TODO** — still shipped; delete, replace with evidence paragraph                                                                                                                                                                                                                                              |
| C14 | Stats prove artist/teacher, not engineer                         | About  | **TODO** — swap one stat for −71.5% DOM or 185 PRs                                                                                                                                                                                                                                                             |
| C15 | No "What I'm looking for" block                                  | About  | **TODO**                                                                                                                                                                                                                                                                                                       |
| C16 | Footer lists 6 external destinations                             | Global | **TODO** — prune to nav(4) + GitHub · LinkedIn · Email · RSS; Bluesky + art portfolio → About only                                                                                                                                                                                                             |
| C17 | Articles dead-end (no exit layer)                                | Global | **PARTIAL** — serie prev/next exists; add one-line exit to /work                                                                                                                                                                                                                                               |

## 4 · Work-structure artifact verdict (implemented)

**A · Selected work + Archive table** wins over B (timeline — "emphasizes when
over how good") and C (kind-split — "web section stands alone and thin").
C survives as Type tags/column; B survives as year-sorted archive + optional
5-dot career strip on About.

## 5 · Content scan (full inventory, 2026-07-21)

### Blog — 21 entries, zero drafts ✓

**Standalone posts (5):**

| File (`src/content/post/`)            | Measured result?                                                |
| ------------------------------------- | --------------------------------------------------------------- |
| `adding-likes-to-a-static-astro-site` | yes — 667 ms vs 118 ms (already in `description`)               |
| `api-endpoints-with-astro`            | no — cross-links to medito + leconceptdelapreuve (done)         |
| `clickable-images-astro-markdown`     | no — links to portfolio work entry                              |
| `nuxt-clean-architecture`             | no number; named artifact (newsletter feature, repo)            |
| `web-testing-quotes-and-tips`         | no — **unaddressed by any review**; disposition in design §Blog |

**Series (3):**

| Serie                           | Parts                                                                                                                                    | `featured:` |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `web-performance`               | 5 (cheatsheet · data-driven · benchmark-tables · images 1 · images 2)                                                                    | 1           |
| `testing-a-simple-nuxt-feature` | 9 (process-sharing → all-in-one → composable → mocking → wrapper pattern → test composable → unit test → repository → integration bonus) | —           |
| `my-ai-journey`                 | 2 (civilization concern · balanced shift)                                                                                                | 2           |

### Work — 19 entries

Featured (numeric order via `repository.ts getFeaturedWorks`):
`leconceptdelapreuve: 2` · `chimeres-orchestra: 3` · `malinette: 4`.
`portfolio` unflagged — **deliberate** (Portfolio-demotion decision
2026-07-19); see C10 + loop 1. Archive currently 16 rows.

Archive pool: argentbank, commitcraty, craslab, dirpictures, fablab, fisheye,
from-x-to-x, hrnet, kungfu-school, la-forme, lithica, logariat,
medito-fundraising, neptune-beer-club, portfolio, qsox.

### Schema & render surfaces (subline mechanism)

- Post schema: `description` (required), `abstract`, `draft` (default true), `related_work` (refs work). Work schema: `related_posts` (refs post).
- `description` renders in: `PostRowCalm.astro:39` (line-clamp-1, text-sm — the blog list), `PostCard.astro:28` (line-clamp-2). Serie `description` renders in `SerieCard.astro:37` (line-clamp-3).
- → **Outcome sublines are `description` rewrites — no schema or component change.** Line-clamp-1 on rows: front-load the number.
- Featured = numeric `featured:` frontmatter, sorted ascending. D5 serie swap = move `featured: 2` from `my-ai-journey/index.md` to `testing-a-simple-nuxt-feature/index.md`.

## 6 · Job strategy research (job-strategy-2026, 2026-07-17)

Deadline: **2026-10-31** (from seniority-update). Ship P1 before any application.

### Positioning

"Frontend-only" is shrinking (Pragmatic Engineer 2026), so all copy reads
product-engineer-shaped: shipping end-to-end, measuring, Figma & design
reviews, tests, AI-assisted workflow. The Past is the niche, not the lead: it
explains _why_ the Now is unusual (bridge sentence). Never claim backend depth
not yet held; the gap-project path upgrades Full-Stack fit 65 % → 85 %.

### Target titles (ranked)

| Rank | Title                              | Fit     | Site surface that sells it                                   |
| ---- | ---------------------------------- | ------- | ------------------------------------------------------------ |
| 1    | Front-End Engineer (Vue/React/TS)  | 95 %    | Hero + proof line + perf serie                               |
| 2    | Product Engineer                   | 80 %    | "shipped/measured/end-to-end" vocabulary, day-job case study |
| 3    | Full-Stack JS/TS (« confirmé »)    | 65→85 % | Needs the gap project (Node/TS backend) — future work        |
| 4    | UI / Design-System / Frontend-Perf | 90 %    | −71.5 % DOM, PrimeVue+Tailwind migration, Figma DS sync      |
| 5    | Creative Developer                 | 85 %    | Past flagships translated to engineering language            |
| 6    | DevRel / Developer Advocate        | 80 %    | 21 EN articles + 1000+ trained (About stat)                  |
| 7    | AI Engineer (product)              | 50→70 % | My AI Journey serie; needs an LLM-feature proof              |

**Avoid:** Senior/Staff/Lead titles · FDE (68 % require travel, US-hub) · ESN
everything-stack · pure backend/infra · ML research.

### Search constraints (encode on the site)

- Contract **CDI** (or permanent remote-EU, EOR OK) → availability badge + What-I'm-looking-for block.
- Remote France/EU, else hybrid ≤ Charente-Maritime (La Rochelle, Niort, Rochefort) → stated in both.
- Level mid/« confirmé » 2–5 yrs → no senior claims anywhere.
- Stack +TS +Vue +React +Node · −Java −Spring −C#/.NET −Angular-primary −PHP-primary.
- Channels: WTTJ (remote+CDI filter) · HelloWork (`c=CDI&t=Complet`) · Jobgether (Permanent+Mid+France) · ATS-direct · LinkedIn only with `f_WT=2`. JD intersection ≥ 60 % is enough to apply.

### Evidence bank (the only numbers the site uses)

4s→2.5s load · −71.5 % DOM · 185 merged PRs (About/Work only) · 21 EN articles ·
3 series (5+9+2 posts) · 5000+ Malinette downloads · 1000+ trained · 15 Chimères
shows · email deliverability 86→95 % (CV only) · PDF-export complexity −50 % (CV only).

### Per-audience site mapping

- Recruiter → hero, badge, proof line, Work five-liners, Contact.
- Hiring manager → bridge sentence, About evidence paragraph, What-I'm-looking-for.
- Interviewer → Start-here row, series depth, companion repos.
- DevRel option → 1000+ trained stat on About; do not surface in hero.

---

## 7 · Critique loops

### Loop 1 — Jérôme, 2026-07-21 (on the first compiled design.md)

Verdict: the compiled spec inherited the reviews' **marketing bias** — copy read
like a sales page, not his voice. Four objections, all upheld:

1. **"I make web apps measurably faster" = overclaim.** Real improvement was on
   two pages of one production app, not a habit. → Hero rewritten: role +
   "I write about what I build and measure"; day-job numbers scoped to "two
   heaviest pages" everywhere (five-liner, About evidence paragraph, sublines).
2. **"See what I've shipped" = inauthentic.** No big shipped web projects; big
   work is Art + day job (private). v3's whole premise is testing whether
   articles are the site's first resource. → D3 flipped: primary CTA
   "Start reading →"; exit lines reworded to "here's what I've been building";
   Work reframed from "proof of shipping" to "the receipts page".
3. **Project list + entry content = part of this redesign.** Selected-work list
   and five-liners demoted from settled decisions to working drafts inside the
   loop (Malinette-featured stays the fixed point). Portfolio's unflagged
   `featured:` turned out to be the deliberate 2026-07-19 demotion decision,
   not a bug — 3-card vs 4-card Selected set is now an explicit open question.
4. **Bare metric strip unreadable.** `4s→2.5s · −71.5% DOM · 21 articles ·
5000+` without context means nothing. → Replaced by a receipts block:
   3 max, each number with its noun and one line of context.

Standing instruction distilled into design.md §0 (voice & claims guardrails):
tone natural/conversational/pro/cool; no overclaiming; every number carries
context; shipping honesty; everything is hypothesis inside the v3 loop.

Review advice in §§1–3 above that conflicts with these guardrails is
**overridden** — keep it here as source material only (e.g. finding 1's
"strongest work above the fold", the recruiter-CTA push, "sell before
offering exits" framing).
