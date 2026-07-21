---
created: 2026-07-21
title: Editorial v4 — blog redesign direction, per-section analysis & strategy
research: ./research.md
---

# Editorial v4 — the compiled direction

One-sentence organizing idea (everything below follows from it):

> **The site sells the Now, the Past differentiates it, the Future frames the copy.**

The bridge sentence (use verbatim on hero teaser, About, LinkedIn):

> 12 years of software in artistic contexts taught me real-time constraints, interaction design, and shipping under pressure; 2.5 years as a frontend engineer turned that into measured product work.

All critique material, scorecards, the C1–C17 status ledger, the full content
scan, and job-strategy research live in **[research.md](./research.md)** —
this file is the actionable spec only. Content inventory is scan-verified
(2026-07-21): 21 blog entries (5 standalone + series of 5/9/2), 19 work
entries, zero drafts.

---

## 0 · Voice & claims guardrails (Jérôme's, non-negotiable)

**Tone:** natural, conversational, pro, cool. The current tagline's spirit ("… robot drummers. Ask me sometime.") is the voice reference — the _content_ changes, the tone doesn't. No marketing language, no abstractions.

**Claims rules (loop-1 feedback, 2026-07-21 — override any review advice below that conflicts):**

1. **No overclaiming.** "I make web apps measurably faster" is false as a habit — the real improvement was on two pages of one production app. Claims describe what happened, never a superpower.
2. **Every number carries its context.** A bare metric strip (`4s→2.5s · −71.5% DOM · …`) is unreadable. Number + noun + one line of what/where, always.
3. **Shipping honesty.** The big shipped projects are Art and the day job (private). No "look what I've shipped" framing for web work. The articles are the public work — leading with them is the point of v3.
4. **Hypothesis, not verdict.** Redesign v3 is a brainstorming step testing whether the articles work as the site's first resource. Copy and structure below are drafts inside that loop, not final decisions.

---

## 1 · Editorial model (the strategy every section derives from)

Three eras, three jobs:

- **Now (2023–2026) — the product being sold.** Jobs are private (CV); the public Now is the _outputs_: 21 articles & series, companion repos, the blog builds (Vue, Astro, Nuxt). Rule: articles carry the proof; side projects exist only as evidence for articles.
- **Past (2010–2023) — the differentiator, curated hard.** Translate to engineering language: real-time constraints (C++/OpenCV tracking), open source (La Malinette, 5000+ downloads), teaching 1000+ people, full-stack range (Node, PHP, Python, C++, hardware). Rule: 3 flagships visible with a 5-sentence case wrapper; everything else one archive line.
- **Future (the next role) — the framing, never a section.** Product-engineer vocabulary everywhere: shipped, measured, end-to-end, Figma & design reviews, tests, AI-assisted workflow — without claiming a backend not yet held.

**One job per page:**

| Page  | Job                                                                                                     | Judged by                           |
| ----- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Home  | The trailer — who/what/why-care in 5 s, then route. Curated, not recent.                                | everyone (often the only page seen) |
| Blog  | Proof of thinking — process, decisions, journey.                                                        | peers, technical interviewers       |
| Work  | The receipts — artifacts with context, honest about scale; thin 2c wrappers linking down into articles. | recruiters                          |
| About | The trust page — full arc, values, availability, contact. Only page where chronology belongs.           | hiring managers                     |

**Work vs Blog definition:** Work = nouns with outcomes; Blog = verbs with reasoning. Work entries are covers, articles are chapters. No artifact or outcome → it's a post, not a work.

**Reading flows:**

- Recruiter (~2 min): Home hero → proof line → Work → one case wrapper → Contact. Needs role, stack, numbers, availability before screen 2.
- Engineer/interviewer (~15 min): Home → Blog → series → 1–2 posts → companion repo → GitHub. Needs series nav, repo links in every post, no dead ends.
- Hiring manager (~8 min): Home → About → Work → maybe one article → Contact. Needs the bridge sentence, values without fluff, visible availability.

**Every page = three layers:** scan layer (outcome-first titles, metadata, numbers) → depth layer (content) → exit layer (exactly one next step). Cross-linking rules: every Work entry links to its article(s); every serie links back to its Work entry or repo; every article ends with prev/next + "I'm open to frontend/product roles — _here's what I've been building_" → /work; contact in the footer of every page.

---

## 2 · Nav (all pages)

**Analysis.** Current header works; the open question was monogram vs name. Optimizing for name recall, not brand recognition.

**Strategy.** Full name as wordmark, no monogram.

**Spec.** `Jérôme Abel · Work · Blog · About` — left-aligned, name links home.

---

## 3 · Home

**Analysis** (C1–C5, research §3): hero is "Hi, I'm Jérôme" + tagline — no role, no stack, no availability, no proof number anywhere on the site. `HeroSocials` still sits in `HeroText.astro` (exits above the fold). Fails the 5-second test; scored 6/10 ("charming").

**Strategy.** Home is the trailer: who/what/why-care in 5 s, then route each of the three flows. Curated, not recent. Writing-first is the whole v3 hypothesis (guardrail 4): the articles are the first resource, so the hero says who I am and what I _write about_, and the primary path goes to the writing. Role/stack/availability still land above the fold for the recruiter — honestly, without a shipped-products claim. Rule: if a Home section needs more than a paragraph to explain, it belongs on another page.

**Spec — top to bottom** (copy = drafts in Jérôme's voice, to validate — guardrail 4):

1. **Hero, line 1 (headline):** _"Hi, I'm Jérôme — frontend engineer (Vue & TypeScript)."_ Greeting stays; role attached, no superpower claim.
2. **Hero, line 2 (what I actually do):** _"I write about what I build and measure: web performance, testing, clean architecture."_ Writing is the product; "measure" is a real habit (production perf work, likes benchmark, 10k-row table benchmark) — "I make apps faster" is not.
3. **Hero, line 3 (the twist):** _"Before that: 12 years building robotic drum orchestras and real-time art installations."_ Now first, Past as the hook — never the reverse.
4. **Availability badge (above the fold):** `● Open to CDI — remote France/EU`.
5. **Receipts block (replaces the bare proof line — guardrail 2, each number keeps its noun and context, 3 max):**
   - _"Helped cut load from 4 s to 2.5 s on the two heaviest pages of a production Vue app — then wrote a 5-part series on how."_
   - _"21 articles in English on performance, testing, and architecture."_
   - _"La Malinette, an open-source creative-coding kit: 5000+ downloads."_
     Criteria unchanged: measured by me, verifiable, role-relevant. Excludes followers/stars (vanity), PR count (Work page), 1000+ trained (About + DevRel apps).
6. **One primary CTA** (D3). Social icons leave the hero → footer.
7. **Writing block:** 2 flagship serie cards with latest-post date for freshness ("recent" lives only here).
8. **Work strip:** 3 cards — 2 web + 1 past-life flagship as the personality slot (D4; composition open, see §5).
9. **About teaser:** one paragraph = the bridge sentence → link to /about.
10. **Contact footer.**

**Decisions (sources conflicted):**

- **D1 — Hero copy vs writing-first strategy (revised, loop 1).** seniority-update (shipped 2026-07-19) made writing lead the Home page; the Design Review wanted a role-first shipped-products hero. Resolution: writing-first wins both order _and_ framing; the hero adds role/stack/availability without the sales pitch. The current tagline ("Front-end engineer, writing about performance… robot drummers. Ask me sometime.") is the tone reference — the three-line hero above must read like it.
- **D3 — Primary CTA (revised, loop 1).** Design Review wanted "See what I've shipped →"; rejected — inauthentic (guardrail 3: no big shipped web projects to point at). Resolution: **one primary CTA "Start reading →"** (writing-first, consistent with the v3 hypothesis). The 2-minute recruiter is served above the button by hero lines 1–2 + badge + receipts; the work strip lower on the page is their route, no second button.
- **D4 — Home work strip.** Editorial says 2 web + 1 past-life. Web slots: **Le Concept de la Preuve + Medito Fundraising** (real deploy, Stripe/Supabase breadth — a "Portfolio" card on its own homepage is circular); past-life slot: **Chimères Orchestra**. /work Selected keeps all 4 per prior decision.
- **D5 — Home serie cards.** Currently featured: web-performance (1) + my-ai-journey (2). For the hiring window swap slot 2 → **testing-a-simple-nuxt-feature** (9 parts = strongest depth proof for interviewers); My AI Journey stays on /blog series row. Mechanism: move `featured: 2` from `my-ai-journey/index.md` to `testing-a-simple-nuxt-feature/index.md`.

---

## 4 · Blog

**Analysis** (C6–C9, research §3): best asset on the site (7.5/10), buried by chronology — verified: `blog.astro` renders the year-grouped list first, Series after. No curation signal, no outcome sublines, dark-mode row contrast low. Scan: 21 entries, all accounted for below; sublines need only `description` frontmatter rewrites — `PostRowCalm` (line-clamp-1), `PostCard` (line-clamp-2), and `SerieCard` (line-clamp-3) already render it. No schema or component change.

**Strategy.** Blog is proof of thinking, judged by interviewers. Lead with the curated depth (series), then a hand-picked on-ramp, then the full archive. Outcome-first copy on first-contact surfaces; how-to titles stay fine _inside_ a serie. No filters, no tags UI — 21 posts don't need it; revisit at 50+.

**Spec — top to bottom:**

1. Intro line (keep — "Web performance, clean architecture, and the craft of web engineering" is the most focused positioning line on the site).
2. **Series first** (all 3 serie cards; order: Web Performance → Testing a Simple Nuxt Feature → My AI Journey).
3. **"Start here" row** — 3 hand-picked posts (below).
4. Full chronological year-grouped list (unchanged pattern, contrast raised, mono metadata demoted a step).
5. Exit layer on every post: serie prev/next + "I'm open to frontend/product roles — here's what I've been building" → /work (component-level, not per-post authoring).

**Start-here picks (3, in order):**

1. **Exploring a Data-Driven Approach to Web Performance** (web-performance 02) — the production result post; carries the 4s→2.5s story.
2. **Nuxt Clean Architecture: A Practical Guide** — architecture depth, standalone, evergreen.
3. **Adding Likes to a Static Astro Site** — measured comparison (667 ms vs 118 ms), shows the benchmark habit.

Rationale: one perf + one architecture + one measured-experiment ≈ the three target-role signals (perf engineer, product engineer, data-driven).

**Outcome sublines** (= `description` rewrites; front-load the number — rows clamp to one line):

| Post / serie                               | Subline                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Web Performance (serie card)               | "5 parts — from tactics cheatsheet to a measured win on a production app: 4s→2.5s"                 |
| 02 · Data-driven approach                  | "How we cut load from 4 s to 2.5 s on the heaviest pages of a production Vue app"                  |
| 03 · Benchmark tables                      | "The numbers behind the decisions — reproducible benchmark method"                                 |
| 04–05 · Images parts 1–2                   | Author a measured number (AVIF/WebP savings %) — **authoring task, measure first**                 |
| Testing a Simple Nuxt Feature (serie card) | "9 parts, one feature — from all-in-one component to repository pattern, every step tested"        |
| Adding Likes to a Static Astro Site        | "Astro DB/Turso vs PHP/MySQL, measured: 667 ms vs 118 ms" (already close in current `description`) |
| Nuxt Clean Architecture                    | "Ports, adapters, and a newsletter feature you can actually follow"                                |
| My AI Journey (serie card)                 | "A grounded take on AI-assisted engineering — critique first, workflow second"                     |

Posts with no measured result keep their current descriptions:
**api-endpoints-with-astro**, **clickable-images-astro-markdown**, and
**web-testing-quotes-and-tips** (unaddressed by any review — disposition:
chronological list only, no Start-here slot, no subline; its value is
cross-linking into the testing serie).

Rule (review §A): every claim replaceable by a number, a named artifact, or a link — otherwise cut.

**Cross-linking authoring tasks:**

- `related_work` / `related_posts` frontmatter exists (work-about-blog S1–S3) — fill it: web-performance serie ↔ day-job case study; api-endpoints post ↔ medito-fundraising + leconceptdelapreuve (already done); testing serie ↔ XPCatalyst repo; clickable-images + likes posts ↔ portfolio work entry.

---

## 5 · Work

**Analysis** (C10–C12, research §3): scored 5/10 — wrong projects promoted for target roles. Structure fix is shipped (`work.astro`: Selected work + ArchiveTable, per artifact verdict A). Selected currently renders 3 cards — `portfolio` has no `featured:` field, which is the **deliberate 2026-07-19 Portfolio-demotion decision**, while the editorial-v4 sources assumed 4 featured; that conflict is one of the open loop questions below. No case wrappers yet; every card link exits the site; the highest-value item (anonymized day-job perf case study) doesn't exist.

**Strategy (revised, loop 1).** Honest framing (guardrail 3): the big shipped work is Art (Chimères, Malinette) and the day job (private) — the web entries are small, recent, and exist mostly as companions to articles. Work is therefore _the receipts page_, not a shipping trophy case: each entry an artifact with context, ordered by target-role relevance, each thin cover linking down into the articles that carry the real proof. Tiers are the topics; no filtering. Adding a project = one archive table row.

**Open (loop 1):** the project list _and_ the content of each entry are part of this redesign — the Selected list below and the five-liners are working drafts for the loop, not settled decisions. The one fixed point stays: Malinette is featured.

**Spec — top to bottom:**

1. Intro (keep the private-day-job disclaimer — it preempts the obvious question).
2. **Selected work** — case-wrapped cards. Two candidate sets in play (open, see above): current shipped state **Le Concept → Chimères → Malinette** (3, Portfolio deliberately demoted 2026-07-19) vs editorial-v4 sources' **Portfolio → Le Concept → Chimères → Malinette** (4). Loop decides; only then touch `featured:` frontmatter.
3. Each Selected entry = **2c five-liner** (below): Context → Constraint → Decision → Outcome (number if available) → Links. "Lessons" live in the articles. Featured entries land on an internal page first; live/GitHub links inside it.
4. **Anonymized day-job case study** — "Making a production Vue app measurably faster" (4s→2.5s, −71.5% DOM); the web-performance serie is 80% of the material. Standard practice, expected.
5. **Archive table** — one line each, year-sorted, Type tags (Web/Art/Training/Volunteer); pre-2018 rows collapsible. 15 rows once portfolio is flagged (scan: research §5).

**Decisions:**

- **D2 — Employer naming.** Reviews say "Allo-media"; the product work (4s→2.5s, −71.5% DOM) is **Uhlive** (About already names uh.live publicly). Use Uhlive or "a production call-intelligence app"; never Allo-media.
- **D6 — Third past flagship.** Editorial names "Logariat/La Forme" as the third flagship; Selected work is already fixed at 4 (D4/W-order). Logariat and La Forme get the strongest archive lines, not flagship slots.

**Authored 2c five-liners** (Context → Constraint → Decision → Outcome → Links):

**Portfolio / this site** (Web · 2024–now)
Personal site and blog, rebuilt three times as the public test bench for how I work now. It has to prove the claims the articles make — performance budgets, testing, design-system discipline — on a real deploy. Astro 5 + Tailwind v4, content collections, a Figma design system kept in sync with code by deterministic scripts. Lighthouse-clean, 21 articles served fast, and the repo is the receipt. → GitHub · live · web-performance serie.

**Le Concept de la Preuve** (Web · 2026)
Client comics-blog shipped end-to-end: brief, design system, build, deploy. Solo delivery on a real deadline for a real client, images-heavy content on a static budget. Astro + Astro DB/Turso for dynamic likes on a static site — measured two backends before choosing (667 ms vs 118 ms). Shipped and live; the likes experiment became an article. → live · GitHub · "Adding Likes to a Static Astro Site".

**Anonymized day-job case study — "Making a production Vue app measurably faster"** (Product · 2024–2026)
Call-intelligence web app (Vue + TypeScript), performance had drifted as features accumulated. Production constraints: no rewrite, no regression, measurable wins only. Profiled first, then attacked DOM size, rendering, and payloads on the two heaviest pages; modernized the design system (PrimeVue + Tailwind) along the way. On those pages, load 4 s → 2.5 s and −71.5 % DOM nodes; the method became a 5-part series. → web-performance serie.

**Chimères Orchestra** (Art · 2013–2019)
Robotic drum orchestra playing on city walls — 15 shows in France and abroad. Real-time constraints, outdoor conditions, zero-crash tolerance during performances. Pure Data + Arduino, custom mechanics and electronics — engineering in service of a concert. Toured 15 times; the flagship of 12 years of art-context software. → video · website.

**La Malinette** (Open source · 2013–2021)
Creative-coding kit (framework + docs + hardware) used in schools and art centers. Had to be teachable to non-programmers and maintainable by a tiny collective. Pure Data + Arduino distribution with curated examples and workshops. **5000+ downloads**, 1000+ people trained with it. → malinette.info · repo.

Archive lines (everything else): one sentence + year + Type tag + link. Logariat and La Forme get the strongest lines (D6).

---

## 6 · About

**Analysis** (C13–C15, research §3): strongest copy on the site (7/10), weakest last paragraph — the filler paragraph still ships; stats prove artist/teacher, not engineer; no "What I'm looking for" block.

**Strategy.** About is the trust page, judged by hiring managers: full arc, values without fluff, visible availability. Only page where chronology/biography belong; only page carrying Bluesky + art-portfolio links.

**Spec — top to bottom:**

1. Lead (keep): _"Artist turned web developer — I build things meant to be used, not just seen."_ — best line on the site.
2. Bio arc: Now → before-the-web → teaching → open source.
3. **Evidence paragraph replaces the deleted filler paragraph** (below).
4. **"What I'm looking for" block** (below) — filters recruiters _for_ you.
5. Stats strip: swap one artist stat for a job-relevant number (−71.5% DOM or 185 PRs).
6. Download CV (early, keep), optional photo (research: measurably builds trust), Bluesky + art portfolio links live here.
7. Optional: compact 5-dot career strip (the only surviving timeline).

**Authored copy:**

**Delete** (fails read-aloud test): _"I focus on engineering best practices that promote quality and maintainability. I value clean architecture, testing, and performance to ensure that everything I build is solid and scalable."_

**Replace with evidence paragraph:**

> On my last product I cut load time from 4 s to 2.5 s on our two heaviest pages — and removed 71.5 % of their DOM nodes — then wrote a 5-part series on how. I test what I build: there's a 9-part series on that too. In 18 months that added up to 185 merged PRs, a design-system migration to PrimeVue + Tailwind, and an AI-assisted workflow I actually measure.

**"What I'm looking for" block:**

> CDI · frontend / product engineer · Vue / React / TypeScript · remote France–EU, or hybrid near La Rochelle. If that's your team, email me: dev@jeromeabel.net.

Also delete interview-speak ("I look forward to working with talented engineers, learning from them…") anywhere it survives.

---

## 7 · Footer (all pages)

**Analysis** (C16, research §3): currently 6 external destinations — offers exits and dilutes the conversion.

**Strategy.** Email is the conversion; GitHub/LinkedIn are verification; everything else moves to About.

**Spec.** Nav (4) + GitHub · LinkedIn · Email · RSS. Bluesky + art portfolio → About only.

---

## 8 · Priorities (merged P-plan, 3-month clock to 2026-10-31)

**P1 · days — before any application ships:**
Hero rewrite (3 honest lines + badge, D1/D3 revised) · receipts block on Home · delete About filler → evidence paragraph · What-I'm-looking-for block · social icons out of hero → footer.

**P2 · 1–2 weeks:**
Blog reorder (Series top + Start-here row) · outcome sublines (§4 table — `description` rewrites) · Work five-liners as internal pages (§5) · anonymized day-job case study · Home strip swap (D4) + serie-card swap (D5) · footer prune (C16) · contrast + 375 px pass.

**P3 · ongoing:**
Second/third case study depth (Medito or HRnet; La Malinette as the OSS story) · images-serie measured numbers · optional About photo · 5-dot career strip on About · article exit line component · watch what reviewers open (Umami already live).

**Open items (need Jérôme):**

1. Validate hero + receipts copy against the voice reference (guardrail 0) — drafts in §3 are proposals.
2. Settle the Selected-work list and each entry's content (§5 Open — part of this redesign loop); then flag `featured: 1` on portfolio if it stays.
3. Confirm availability badge wording/visibility (public commitment).
4. Measure the AVIF/WebP numbers for the images-serie sublines.
5. Decide day-job case-study naming: "Uhlive" vs anonymized (About already says uh.live — leaning named).
6. Confirm 185 PRs is a number you're comfortable publishing (currently CV-only).
