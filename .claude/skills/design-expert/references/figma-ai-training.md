# Training Figma AI on a design system

Status: distilled 2026-08-08 from UI Collective "Train Figma AI on Your Design
System" (senior-designer workflow).

## What "training" means

Connecting a library to Figma AI is **not enough** — the agent samples only a
fraction (~25 variables, ~5 styles, ~33 components in the demo) and produces
off-system output: overridden fills, misidentified components, no surface
variables. Training = writing a small set of **Figma AI skills** (markdown
files uploaded via "+" near prompt box → Skills, invoked as `/skill-name`)
telling the agent which components/variables/styles exist and **when to use
each**. Skills are agent-generated: point it at a grouping or reference frame,
have it study, then "build a skill", then review/refine/upload.

## Library prerequisites

- Components under **named groupings** (Form Elements, Navigation, Data
  Display + product-specific) — not one flat list. Exact bucket doesn't
  matter; label + membership does.
- Semantic variable collection organized by role (surface/text/icon/border)
  with **plain-English descriptions** — descriptions are what let AI pick
  `surface-default` vs `surface-page` when resolved colors are identical.
- **Token reference frame on canvas**: table of name | light | dark |
  description. This frame — not the variables panel — is what you select and
  feed the agent.
- Type-scale frame; responsive spacing variables (desktop↔mobile pairs).

## Workflow (in order)

1. **Baseline test** — connect library, run realistic prompt with no skills,
   note exactly what breaks. This is the before-state.
2. **Component skills, one per grouping** (never "study all my components",
   never one skill per component). Prompt shape: *"Study the [Form Elements]
   grouping — components, variants, documentation. Then build a skill so AI
   knows what's available and when to use each."* Review, refine in dialogue,
   upload. **QA before moving on**: narrow prompt ("build me a form") then a
   flow ("build an onboarding flow") — passing narrow but failing flow =
   still broken.
3. **Color-variable skill** (one, not per-group) — select token reference
   frame; good output includes a decision tree (coloring what? on which
   surface? what semantic meaning?).
4. **Type-styles skill** — select type-scale frame.
5. **Spacing & shape skill** — catch-all: layout/responsive variables, radius,
   border widths, shadows.
6. **Rules & Debt skill — human-authored, cannot be generated.** Two
   questions: *"What is wrong with our system that we can't fix?"* → accepted
   debt (stops the agent re-flagging conscious tradeoffs). *"What would we
   correct if a junior used our system?"* → the rules (which card/modal for
   which context…). For this project: SKILL.md's Core Decision Rules +
   Common Mistakes table is exactly this content.
7. **Re-run baseline** — verify variables + text styles now bind.

## Anti-patterns / ROI

- Assuming connected library = context. It truncates.
- One skill per component (80 skills) — unmanageable, no quality gain.
- "Look at all the variables" — lists them, still doesn't know when to apply;
  needs the description-bearing frame.
- Uploading generated skill verbatim without reading/QA.
- Expecting determinism: "way better, never 100%". Variables have right/wrong
  answers; **text styles are inherently fuzzy** — low ROI on heavy type-style
  guidelines; same low ROI for border-width and shadow skills.

## Readiness checklist

- [ ] Components grouped under named groupings
- [ ] Semantic collection by role: surface / text / icon / border
- [ ] Every semantic token has a usage description
- [ ] Token reference frame on canvas (name | light | dark | description)
- [ ] Type-scale frame
- [ ] Responsive spacing variables (desktop↔mobile pairs)
- [ ] Radius + border-width enumerated somewhere studyable
- [ ] Written rules list + accepted-debt list
- [ ] Baseline prompt + QA prompts to test each skill
