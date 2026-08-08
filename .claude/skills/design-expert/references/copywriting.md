# UI Copywriting — jeromeabel.net

Long-form posts → `blog-post` skill (`references/blog-style.md`).
This file covers **UI surfaces**: labels, card copy, descriptions, microcopy.

## Voice

Conversational, concrete, engineer-to-engineer. No marketing abstractions
("cutting-edge", "seamless", "passionate"). Numbers always carry context
(`667ms → 118ms on shared hosting`, not "blazing fast"). Honest about scope:
say what a thing is, not what it aspires to be.

## Patterns by surface

| Surface | Pattern | Example |
|---|---|---|
| Section label | One word, uppercase | `BLOG`, `WORK`, `LET'S TALK` |
| Section CTA | Verbless destination + arrow | `All posts →` |
| Page positioning line | What the blog is about, one sentence, no verbs of aspiration | "Web performance, clean architecture, and the craft of web engineering." |
| Post title | Honest deliverable/lesson; may name the stack | "Adding API Endpoints to an Astro Project" |
| Post card description | 1–2 sentences: what you get + concrete detail | "Astro DB + Turso — a single PHP file on shared hosting replaced the entire serverless stack." |
| Serie title | Subject, not journey-speak | "Web Performance" |
| Serie description | Scope + arc in one sentence, unique per serie | "From core concepts and cheatsheets to real-world improvements in a production app." |
| Work card kicker | `TYPE · YEAR` mono | `WEB APP · 2026` |
| Work card description | What it is + notable stack/outcome | "Donation flow with Stripe & Supabase — Astro, React, TypeScript." |
| Hero | Greeting + role + one human detail | "I'm a front-end engineer, shipping web apps and writing about it. I used to build robot drummers." |

## Rules

- Every serie/card description is **unique** — duplicated descriptions are a
  content bug, and in mocks they hide wrapping/clamping issues.
- Titles in title case; chips uppercase; nothing else uppercase.
- Dates: `May 12, 2026` (cards), `May 12` (rows, year in gutter),
  `Mar–Jul 2026` (serie range). Read time: `18 min`.
- Descriptions end without a period only if fragment-style is used
  consistently within the section — don't mix.
- French content (some work pages) keeps the same rules; don't translate
  proper names.

## Anti-patterns seen in drafts

| Bad | Why | Better |
|---|---|---|
| "A practical journey through…" on 3 different series | Template smell, duplicated | One unique sentence per serie |
| "14 min read" on every mock row | Hides variable-width layout bugs | Vary mock values |
| Overclaiming ("complete guide") | Tone break | Name the actual scope |
