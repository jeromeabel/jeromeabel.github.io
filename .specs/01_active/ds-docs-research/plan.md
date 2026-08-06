# DS Docs Expert Research Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Research how real design systems document themselves (5 parallel web-research agents), then capture the proven rules into `.claude/skills/design-expert/references/ds-documentation.md`.

**Architecture:** Three tasks: (1) dispatch 5 parallel research agents — one per question cluster — and persist their raw reports; (2) synthesize the reports into a sourced reference file behind an evidence bar; (3) wire the reference into `design-expert/SKILL.md`, verify, and archive the spec topic.

**Tech Stack:** Claude Agent tool (`general-purpose` agents with WebSearch/WebFetch), markdown, `.specs/specs.sh`.

## Global Constraints

- **Evidence bar:** a rule enters the reference only with ≥2 independent systems/authorities behind it; single-source items must carry the literal marker `(weak)`; zero unsourced claims.
- **Candidate systems (agents pick ≥4):** Polaris, Carbon, Material 3, Primer, Spectrum, Atlassian, Base Web, Fluent.
- **Authorities (agents consult ≥1):** Nielsen Norman Group, Nathan Curtis / EightShapes, zeroheight.
- **Reference size:** ~8–15K characters, matching sibling files in `design-expert/references/`.
- **Rule format (verbatim from design.md):** Rule / Why / Evidence (system+URL) / Applies here.
- **No Figma edits of any kind.** No docs-page redesign. No component fixes.
- Raw agent reports are audit artifacts — save them unedited (trim only tool chatter, never findings).

---

### Task 1: Dispatch 5 parallel research agents and persist raw reports

**Files:**
- Create: `.specs/01_active/ds-docs-research/notes.md`

**Interfaces:**
- Produces: `notes.md` with five `## Q1` … `## Q5` sections, each holding one agent's raw structured findings. Task 2 reads only this file.

- [ ] **Step 1: Dispatch all 5 agents in one message (parallel), `subagent_type: general-purpose`**

Every prompt starts with this shared preamble, then its cluster block:

```text
You are a design-system documentation researcher. Use WebSearch and WebFetch to
survey REAL, current design-system documentation. Requirements:
- Survey at least 4 of: Shopify Polaris, IBM Carbon, Google Material 3,
  GitHub Primer, Adobe Spectrum, Atlassian Design System, Uber Base Web,
  Microsoft Fluent. Visit their actual docs pages, don't rely on memory.
- Consult at least 1 authority: Nielsen Norman Group (nngroup.com),
  Nathan Curtis / EightShapes (medium.com/eightshapes-llc), zeroheight
  (zeroheight.com blog / How We Document report).
- Your final message IS the deliverable: raw markdown, no preamble.
Output format — a list of findings, each exactly:
### F<n>: <one-line rule statement>
- Why: <reasoning the sources give>
- Evidence: <System/Authority name> — <URL> (one line per source; ≥1 required,
  ≥2 makes it consensus)
- Confidence: consensus | single-source
- Notes: <optional nuance, counter-examples>
Aim for 6-12 findings. Only claims you actually verified on a page you fetched.
```

Cluster blocks (append one per agent):

```text
[Q1 — IA / structure]
Question: How do real design systems order and granulate their documentation?
Specifically: (a) top-level chapter order — foundations/tokens vs components vs
patterns, what comes first and why; (b) where element-level info lives — do
systems have a separate "elements/primitives" chapter between tokens and
components, or do they group small things (typography usage, buttons, icons,
imagery) into meaningful sets? (c) how deep does one page go before splitting —
one long page per chapter vs many short pages; (d) how component docs relate to
usage guidance (same page? tabs? separate patterns section?).
```

```text
[Q2 — Readability]
Question: What makes long-form design/system documentation scannable and
readable? Specifically: (a) page length limits and chunking — how much content
per page/section before splitting; (b) scanning patterns (F-pattern, layer-cake)
and what they imply for headings/spacing — NN/g has primary research here;
(c) visual hierarchy in docs — heading scale, whitespace, cards vs prose,
tables vs lists; (d) progressive disclosure — what stays on the overview vs
behind a click; (e) how docs built IN a canvas tool (Figma-native docs pages)
handle these vs web docs — any published guidance on Figma-page documentation
readability.
```

```text
[Q3 — Token documentation]
Question: How do real systems document design tokens? Specifically: (a)
usage-first vs value-first — do token tables lead with WHERE/WHEN to use the
token (semantic role) or with its raw value; find concrete table layouts;
(b) light/dark documentation policy — do systems duplicate every spec for both
modes, or document a single source of truth and show modes only where values
differ; how do Carbon/Material/Primer present themed values; (c) how token
aliases/semantic layers are explained to readers (primitive → semantic →
component); (d) how tokens are cross-linked from component docs.
```

```text
[Q4 — Decision records]
Question: How do design systems document DECISIONS so they are actionable?
Specifically: (a) do/don't pairs — format, captioning, when used; (b) rationale
capture — where does "why we chose X" live (principles pages, ADR-style
records, inline notes); (c) cross-referencing — how a decision (e.g. border
radius scale) links to the components it governs; (d) documenting
non-instantiable concepts with no component to show: spacing scales/ladders,
motion duration+easing tokens, focus rings and other interaction-state-only
styles — what visual artifacts do real systems use (diagrams, animated demos,
code snippets, specs tables)?
```

```text
[Q5 — Cover / status]
Question: What does the landing/cover page of design-system documentation show?
Specifically: (a) what a first-screen cover communicates — name, version,
status, entry points; (b) status communication — component status badges
(alpha/beta/stable/deprecated), status tables, changelogs, "what's new";
(c) visual treatment — how visual vs text-heavy are covers of Polaris, Carbon,
Material, Primer, Spectrum; (d) versioning display — where the version number
lives and how updates are announced; (e) for a small personal/portfolio design
system specifically: any published guidance on right-sizing docs (zeroheight or
EightShapes on small-team systems).
```

- [ ] **Step 2: Collect the five reports; verify each has ≥4 systems + ≥1 authority cited and every finding carries ≥1 URL**

If an agent returns findings without URLs or under 4 systems surveyed, re-dispatch that one agent with its same prompt plus: `Previous attempt failed the evidence bar: every finding needs at least one URL you actually fetched, and at least 4 named systems must appear across your findings. Fix that.` Maximum 1 re-dispatch per cluster; if it still fails, keep the report and flag the gap in notes.md front section.

- [ ] **Step 3: Write `.specs/01_active/ds-docs-research/notes.md`**

Structure:

```markdown
---
created: 2026-08-06
---

# Raw research reports — ds-docs-research

Five parallel agents, dispatched <date>. Reports unedited (findings verbatim).
Gaps: <none | list of clusters that failed the evidence bar after 1 retry>

## Q1 — IA / structure
<agent 1 report verbatim>

## Q2 — Readability
<agent 2 report verbatim>

## Q3 — Token documentation
<agent 3 report verbatim>

## Q4 — Decision records
<agent 4 report verbatim>

## Q5 — Cover / status
<agent 5 report verbatim>
```

- [ ] **Step 4: Commit**

```bash
git add .specs/01_active/ds-docs-research/notes.md
git commit -m "docs(specs): ds-docs-research — raw reports from 5 research agents"
```

---

### Task 2: Synthesize the reference file

**Files:**
- Create: `.claude/skills/design-expert/references/ds-documentation.md`

**Interfaces:**
- Consumes: `notes.md` sections `## Q1`–`## Q5` (finding format `### F<n>` with Why/Evidence/Confidence lines).
- Produces: `references/ds-documentation.md` — the durable deliverable Task 3 wires up; sub-project 2 (ds-docs-v2) will consume it.

- [ ] **Step 1: Apply the evidence bar to every finding**

For each finding across the five reports: keep as **rule** if Confidence is consensus (≥2 independent sources); keep with literal `(weak)` marker if single-source but still useful; drop if unsourced or contradicted by a consensus finding. Merge duplicate findings across clusters (e.g. Q1 and Q2 both hitting page-splitting) into one rule citing both evidence sets.

- [ ] **Step 2: Write `.claude/skills/design-expert/references/ds-documentation.md`**

Skeleton (fill rules from Step 1; sections mirror the five clusters):

```markdown
# Design-system documentation — proven rules

Captured 2026-08-06 from a 5-cluster survey of real DS docs (Polaris, Carbon,
Material 3, Primer, Spectrum, Atlassian, …) + authorities (NN/g, EightShapes,
zeroheight). Raw reports: `.specs/02_archives/ds-docs-research/notes.md`.
Evidence bar: every rule cites ≥2 sources unless marked `(weak)`.

## How to use this file
Load when structuring, writing, or reviewing design-system documentation
(Figma docs pages or web). Each rule: statement, why, evidence, and where it
bites in our `📚 Design system` page.

## 1. Information architecture
### Rule: <statement>
- **Why:** <reasoning>
- **Evidence:** <System — URL>; <System — URL>
- **Applies here:** <mapping to a concrete issue from design.md Goal list>
<repeat per rule>

## 2. Readability & chunking
<same rule format>

## 3. Token documentation
<same rule format>

## 4. Decision records & non-instantiable concepts
<same rule format>

## 5. Cover & status
<same rule format>

## Quick audit checklist
<one line per rule, phrased as a yes/no check — derived, not new content>
```

Every rule's **Applies here** line must name one of the design.md Goal issues: doc too long/chunking; token usage over values; light/dark redundancy; elements-vs-components grouping; actionable decisions; the three FINDINGs (focus-ring/CTA-accent, spacing ladder, duration/easing); cover simplify/status; cross-page redundancy. Size target 8–15K characters — check with `wc -c`.

- [ ] **Step 3: Coverage check against design.md**

Open `.specs/01_active/ds-docs-research/design.md` Goal list. Every listed issue must be touched by ≥1 rule's "Applies here" line. If an issue has no rule, go back to notes.md for a supporting finding; if none exists, add an explicit `## Gaps` section naming the issue and stating research found no guidance — never silently drop it.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/design-expert/references/ds-documentation.md
git commit -m "feat(design-expert): add ds-documentation reference — sourced DS docs rules"
```

---

### Task 3: Wire into SKILL.md, verify, archive

**Files:**
- Modify: `.claude/skills/design-expert/SKILL.md:30-37` (Reference Files table)
- Modify: `.specs/01_active/ds-docs-research/` → archived via `specs.sh`

**Interfaces:**
- Consumes: `references/ds-documentation.md` from Task 2.
- Produces: discoverable reference (SKILL.md table row); archived spec topic.

- [ ] **Step 1: Add table row to SKILL.md Reference Files table**

Append after the `artistic-direction.md` row:

```markdown
| [references/ds-documentation.md](references/ds-documentation.md) | Structuring, writing, or reviewing design-system documentation (Figma docs pages or web): IA/chapter order, page chunking, token tables, light/dark policy, decision records, cover/status — 5-cluster web survey (2026-08-06) |
```

- [ ] **Step 2: Spot-check 3 cited URLs**

Pick 3 rules from different sections of `ds-documentation.md`; WebFetch each cited URL; confirm the page actually supports the claim. If a URL 404s or doesn't support the claim, fix or demote the rule (consensus → `(weak)`, or drop) and re-check the coverage of Step 3 Task 2.

- [ ] **Step 3: Run the design.md verification checklist**

1. Every rule has ≥1 source; consensus rules have ≥2 — grep for `Evidence:` lines missing URLs: `grep -n "Evidence:" .claude/skills/design-expert/references/ds-documentation.md | grep -v http` → expect no output.
2. Every Goal issue covered (done in Task 2 Step 3 — re-confirm).
3. URL spot-check done (Step 2).

- [ ] **Step 4: Commit, archive topic, final commit**

```bash
git add .claude/skills/design-expert/SKILL.md
git commit -m "feat(design-expert): register ds-documentation reference in SKILL.md"
./.specs/specs.sh archive ds-docs-research
git add .specs
git commit -m "docs(specs): archive ds-docs-research"
```

---

## Self-review notes

- Spec coverage: design.md protocol (5 agents, systems/authority floors, output format) → Task 1; evidence bar + output contract (reference skeleton, rule format, size) → Task 2; SKILL.md pointer + 3-point verification → Task 3. Notes.md audit artifact → Task 1 Step 3. Archive step added (implied by project convention "status is the folder").
- Placeholder scan: agent prompts written verbatim; skeleton `<...>` slots are synthesis instructions (content comes from research at run time), not plan gaps.
- Consistency: `notes.md` section names `## Q1`–`## Q5` match between Task 1 Step 3 and Task 2 Consumes; reference path identical across Tasks 2 and 3; notes.md path referenced in the reference header uses the post-archive location (`02_archives`), matching the Task 3 archive step.
