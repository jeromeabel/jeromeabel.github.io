---
title: Figma responsive architecture — collapse the 2×2 frame grid, cascade the numbers
created: 2026-08-13
---

# Figma responsive architecture

Magnet-DS (`ihWIWmvtQPTWgUxlrVjC2c`) currently ships **8 editable page components** — Home and
Blog × Desktop/Mobile × Light/Dark. Every design change lands four times per page, and it
already drifted: `Home — Mobile — Light` is 4158px tall, `Home — Mobile — Dark` is 3504px.
654px of divergence between two frames that should be identical.

This design collapses that to **4 editable masters**, makes theme drift structurally
impossible, and moves every responsive *number* onto a cascading token so "smaller type and
tighter spacing on mobile" happens by switching a mode rather than by editing a frame.

Source analysis: `~/Bureau/Responsive Theming Strategy.md` (2026-08-13).

## Scope

**In:** Home and Blog page templates, and the component masters they compose.

**Out:** detail templates (`PAGE/POST`, `PAGE/SERIE`, `PAGE/WORK-DETAIL` — deleted from the
file between 2026-07-22 and 2026-08-11), the Work index page, About, 404. The `<table>`
`ArchiveTable` belongs to `work.astro` and is out of scope — see §4.

## The rule

**Numbers = tokens. Direction = variants.**

```
1 Primitives  (451 vars, single mode)   ← raw ladder, unchanged
2 Theme       (15 vars, Light/Dark)     ← unchanged, already 100% bound
3 Responsive  (4 → 16 vars, D/T/M)      ← GROWS: every numeric responsive value
breakpoint=   variant axis               ← ONLY where layoutMode flips
```

Figma variables hold `COLOR`, `FLOAT`, `STRING`, `BOOLEAN` only — `layoutMode` cannot be
bound. That limit, not preference, is what splits the two mechanisms. Everything numeric
cascades from the page frame's pinned mode pair; only a direction flip needs a manual variant
switch.

## §1 Architecture

### Frame inventory: 8 masters → 4 masters + 4 dark instances

| Node | Kind | Theme mode | Responsive mode |
| --- | --- | --- | --- |
| `Home — Desktop` | COMPONENT | Light (`3:0`) | Desktop (`2245:0`) |
| `Home — Mobile` | COMPONENT | Light (`3:0`) | Mobile (`2245:2`) |
| `Home — Desktop [Dark]` | instance | Dark (`3:1`) | Desktop |
| `Home — Mobile [Dark]` | instance | Dark (`3:1`) | Mobile |
| `Blog — Desktop` | COMPONENT | Light | Desktop |
| `Blog — Mobile` | COMPONENT | Light | Mobile |
| `Blog — Desktop [Dark]` | instance | Dark | Desktop |
| `Blog — Mobile [Dark]` | instance | Dark | Mobile |

Editable sources: 8 → 4. Dark is an instance of Light with one mode pinned, so it **cannot**
drift — the 654px bug class is eliminated structurally, not by discipline. Instances stay on
the page so dark views remain screenshot-able for sharing and for `spot-check-shots.mjs`.

Collection IDs: Theme `VariableCollectionId:3:2`, Responsive `VariableCollectionId:2245:42`.

### No Tablet frames

Tablet values live in the tokens. Prove Tablet by switching one master's Responsive mode.
Adding a Tablet *frame* later costs zero new masters — that is the point of the architecture.
Two components would need a third variant value if Tablet frames are ever built; see §3.

### Documented reversal

`.specs/02_archives/figma-variables/design.md:219-238` ruled the type scale a
component-encapsulated concern rather than a token, on the reasoning that H1/H2/P/Prose
components *are* the semantic layer. That call assumed a single viewport. It is why type
drift is currently *detected* by `figma:verify` instead of *prevented*.

This design reverses it for the six type ramps that genuinely differ per breakpoint (§2).
Components remain the semantic layer; they now read their size from a responsive token
instead of carrying a flat one. Ramps that do not vary keep their flat `Tailwind/text-*`
style.

## §2 Responsive tokens: 4 → 16

Every value below is derived from shipped code, not invented. Mode widths are Mobile 390 /
Tablet 768 / Desktop 1280; Tailwind breakpoints are `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
At 768 both `sm` and `md` are active, which is why Tablet often equals Desktop.

Each new variable aliases a `1 Primitives` token unless noted, so `figma:verify-raw` stays
clean and `named-debt.json` shrinks rather than grows.

### Type

| Variable | Mobile | Tablet | Desktop | Source |
| --- | --- | --- | --- | --- |
| `text/page-title` | 36 (`text/4xl`) | 48 (`5xl`) | 60 (`6xl`) | `ui/H1.astro` — `text-4xl sm:text-5xl lg:text-6xl` |
| `text/section-title` | 20 (`xl`) | 24 (`2xl`) | 30 (`3xl`) | `ui/H2.astro` — `text-xl md:text-2xl lg:text-3xl` |
| `text/hero-title` | 24 (`2xl`) | 36 (`4xl`) | 48 (`5xl`) | `hero/HeroText.astro:7` |
| `text/hero-body` | 18 (`lg`) | 20 (`xl`) | 24 (`2xl`) | `hero/HeroText.astro:11` |
| `text/brand` | 16 (`base`) | 20 (`xl`) | 20 (`xl`) | `app/Header.astro:35` |
| `leading/hero-body` | 28px | 28px | 30px | `HeroText.astro:11` — `xl:leading-tight` |

`leading/hero-body` is the one **raw** value: Tailwind's size-paired default leadings (28px on
`text-lg` and `text-xl`) are not on the `leading/*` ratio ladder, and Desktop's
`leading-tight` resolves to 24 × 1.25 = 30px. Three px values, added to `named-debt.json` as
accepted debt rather than forced onto a ratio that would change the rendering.

### Spacing

| Variable | Mobile | Tablet | Desktop | Source |
| --- | --- | --- | --- | --- |
| `header/padding-y` | 16 (`spacing/4`) | 16 | 24 (`spacing/6`) | `Header.astro:25` — `py-4 lg:py-6` |
| `header/nav-gap` | 16 (`spacing/4`) | 24 (`spacing/6`) | 40 (`spacing/10`) | `Header.astro:27` — `gap-4 md:gap-6 lg:gap-10` |
| `footer/padding-y` | 32 (`spacing/8`) | 64 (`spacing/16`) | 64 | `Footer.astro:23` — `py-8 md:py-16` |
| `footer/gap` | 24 (`spacing/6`) | 32 (`spacing/8`) | 32 | `Footer.astro:25` — `gap-6 md:gap-8` |
| `footer/link-gap` | 8 (`spacing/2`) | 24 (`spacing/6`) | 24 | `Footer.astro:35,44` — `gap-2 md:gap-6` |
| `hero/text-gap` | 8 (`spacing/2`) | 16 (`spacing/4`) | 16 | `HeroText.astro:6` — `gap-2 md:gap-4` |

### Unchanged

`container/max-width` (1280/1280/1280), `container/gutter` (16/24/32),
`section/rhythm-y` (48/64/96), `viewport/width` (390/768/1280).

**Total: 4 → 16 variables.** The global rule "font smaller on mobile, same for spacings" is
satisfied by every row above — and satisfied *by cascade*, never by editing a mobile frame.

## §3 Variant sets, deletions, Header, illustrations

### Variant sets — `breakpoint=Desktop|Mobile`

Seven masters, and only these seven. Everything else is numeric and cascades.

| Master | Desktop | Mobile | Source |
| --- | --- | --- | --- |
| `Hero` | HORIZONTAL | VERTICAL | `hero/Hero.astro:8` — `flex-col … lg:flex-row` |
| `Footer` | HORIZONTAL | VERTICAL (reverse) | `Footer.astro:25` — `flex-col-reverse md:flex-row` |
| `Header` | inline nav | hamburger | NEW — Figma leads, see below |
| `WorkPreviewSmallList` | HORIZONTAL | VERTICAL | analysis §4.2 |
| `PostCardPreviewSmall` | HORIZONTAL | VERTICAL | loose master built 2026-08-13, folded in here |
| `SerieCardList` | HORIZONTAL, 3 FILL children | VERTICAL | `blog.astro:55`, see §4 |
| `PostArchiveList` | year gutter + rows | stacked | `blog.astro:37`, see §4 |

**`Hero` is a bug fix, not a feature.** The source analysis records Hero as the *same*
component across breakpoints, but `Hero.astro:8` stacks it below `lg`. Figma's Hero has never
stacked. This is live drift being corrected.

**Why a 2-value axis, not 3.** Every in-scope flip is gated at `sm`, `md`, or `lg`, so at 768
Tablet always resolves onto one of the two existing sides. Recorded debt: `Hero` flips at
`lg` (Tablet sides with Mobile) while `Footer` flips at `md` (Tablet sides with Desktop). If
Tablet frames are ever built, those two masters — and no others — need a third variant value.

### Masters deleted

`PostCardPreviewSmall — Mobile`, `BlogPreviewSection — Mobile`, `WorkPreviewSection — Mobile`,
`ContactPreviewSection — Mobile`.

The three `…Section — Mobile` masters exist only because their child list flips direction.
Once the list carries the `breakpoint=` axis, the section wrapper is identical across
breakpoints and one master suffices.

**Gate before deleting:** diff each Desktop/Mobile section pair. If a pair differs beyond its
child's `layoutMode`, that section keeps its own axis instead of being merged. Do not delete
on assumption.

Net: 33 masters → 29, seven of which gain a variant axis. Closes
`.specs/00_backlog/figma-blog-mobile-sections.md`.

### Header hamburger

No code equivalent exists — `Header.astro` keeps the nav inline at every width. Figma leads
here by explicit decision.

- **Desktop variant:** unchanged inline nav, `header/nav-gap` = 40, `header/padding-y` = 24.
- **Mobile variant:** brand left at `text/brand` = 16, hamburger icon right in a 44×44 touch
  target, `header/padding-y` = 16.
- **`HeaderDrawer`** as a separate master, `state=closed|open`: full-width overlay below the
  bar, nav items stacked at `header/nav-gap` = 16, ThemeToggle and MotionToggle at the bottom.

The 44px target is consistent with `.specs/00_backlog/figma-mobile-touch-targets.md`.

### Illustrations

`HeroAnimation` (six flat SVG shapes plus shadows) and the Footer illustration.

**Unverified:** `Footer.astro` contains no illustration — only link lists and a copyright
line. The Footer illustration is a Figma-only element that was not confirmed against the live
file while writing this design. First plan step: inspect `Footer` (`2099:2560`) and confirm it
exists. If it does not, this section applies to `HeroAnimation` alone.

- **Fills rebound to `color/foreground`** (gray-800 Light / gray-100 Dark). This replaces
  `dark:invert`, a CSS filter Figma cannot bind to a mode. Same visual result, no duplicate
  art, no variant.
- **Visible at Desktop only.** Hidden at Tablet and Mobile, matching
  `HeroAnimation.astro:47` — `hidden … lg:block dark:invert`.

Visibility is not a variant and Figma has no mode-driven boolean visibility, so this is one
manual toggle on each of the two Mobile masters. **This is the single accepted exception to
the cascade rule** and must be documented as such on the 📚 Design system page.

## §4 Blog list shapes

Two corrections found while deriving values from code.

### `ArchiveTable` is misnamed and mis-scoped

The `<table>` `ArchiveTable.astro` lives in `src/components/work/` and is consumed by
`work.astro` — not the Blog page. Its responsive strategy is progressive column hiding
(`hidden sm:table-cell`, `hidden md:table-cell`), not stacking. Out of scope.

`blog.astro:34-43` renders **year-grouped `PostListItem` rows**:

```
flex flex-col gap-2 sm:grid sm:grid-cols-[3rem_1fr] sm:gap-x-3
```

- **Desktop / Tablet:** 3rem year gutter on the left, post rows filling the rest.
- **Mobile:** year label stacked above its rows.

The Figma master is therefore renamed `ArchiveTable` → **`PostArchiveList`** and rebuilt to
this shape. `PostListItem` itself is `flex-row justify-between` at every width — no variant.

### `SerieCardList` stays 3 across

`blog.astro:55` is `grid gap-4 md:grid-cols-2 lg:gap-8` — a 2-up grid. **Decision: keep 3
columns** on Desktop and Tablet, 1 column on Mobile.

In Figma this is `HORIZONTAL` auto-layout with three FILL children, which is what the master
already has — the children narrow automatically at Tablet, so no wrap and no Tablet-specific
handling. Only the Mobile `VERTICAL` variant is new work.

Trade-off accepted: at Tablet 768 with a 24px gutter and 16px gaps, each card is ~229px for a
title plus a 3-line clamp. Tight but viable.

## §5 Per-page result

**Home — Mobile:** Hero stacks; illustration hidden; hero title 48 → 24; hero body 24 → 18;
hero text gap 16 → 8; section rhythm 96 → 48; gutter 32 → 16; Blog, Work and Contact preview
lists stack; header becomes hamburger; footer stacks reversed with padding 64 → 32.

**Blog — Mobile:** page title 60 → 36; section titles 30 → 20; `SerieCardList` single column;
`PostArchiveList` year label stacked above rows; same header, footer, gutter and rhythm
changes as Home.

## §6 Code debt created

Two items where Figma deliberately leads. Both get backlog stubs.

1. **`header-mobile-drawer`** — Astro component for the hamburger and drawer: toggle script,
   focus trap, `aria-expanded`, Escape to close, `prefers-reduced-motion` respected on the
   drawer transition. Size: M.
2. **`blog.astro:55`** — `md:grid-cols-2` → `md:grid-cols-3` to match the 3-column decision.
   One line. Size: XS.

Everything else in this design moves Figma toward code, not away from it.

## §7 Verification

- `pnpm figma:dump <file.fig>` then `pnpm figma:verify` — token diff must pass with the 16
  Responsive variables present and correct in all three modes.
- `pnpm figma:verify-raw` — `named-debt.json` must shrink net, with `leading/hero-body`'s
  three px values as the only addition.
- `pnpm geometry:web` then `diff-geometry.mjs` — both Home (`/`) and Blog (`/blog`) exist as
  real routes, so computed geometry is checkable against the Figma frames at 390 and 1280.
  Expect known deltas only at the two §6 debt items.
- Manual: switch `Home — Desktop`'s Responsive mode to Tablet and confirm every number moves
  without touching a frame. This is the acceptance test for the whole architecture.
- Manual: confirm zero overflowing nodes on both Mobile masters, matching the audit method
  used on 2026-08-13.

## §8 Risks

- **Style vs. binding conflict.** A Figma text *style* cannot bind to a variable. Nodes on the
  six responsive ramps must have their flat `Tailwind/text-*` style detached before the
  font-size binding, or they will read as "modified style". Cost: those six lose
  at-a-glance Tailwind-class traceability. Mitigation: record the mapping on the 📚 Design
  system page.
- **Variant switching stays manual.** Figma has no "variant follows mode" primitive. Seven
  sets × two Mobile masters is up to 14 manual switches — one-time, but they are also 14
  places a future page could forget. Mitigation: a Pass-0 audit step in `figma-verify` that
  asserts every instance on a Mobile frame is on its Mobile variant.
- **Mode cap.** Figma Professional allows 4 modes per collection; `3 Responsive` holds 3. A
  fourth breakpoint would exhaust it.
- **Section merge is unproven.** §3's deletion of three `…Section — Mobile` masters rests on
  the claim that they differ only by child direction. The diff gate must run first.
- **Instance `layoutMode` is read-only via the Plugin API** (verified 2026-08-13): setting it
  silently no-ops. All direction work happens on masters, never on instances.
- **Axis-flip remaps child sizing.** Flipping a frame's `layoutMode` auto-remaps children's
  `layoutSizingHorizontal`/`Vertical` from FILL/HUG to FIXED/FILL, collapsing dimensions.
  Every axis flip needs an explicit follow-up call re-setting sizing modes, then a fresh
  `getNodeByIdAsync` read to verify — geometry read in the same tick returns stale values.

## References

- `.claude/skills/design-expert/references/figma-variables-method.md` — the three propagation
  patterns; this design is the Hybrid (pattern 1 for numbers, pattern 2 for direction).
- `.claude/skills/figma-verify/knowledge/figma-ds-file.md` — node ID map. IDs are hints;
  re-inventory by name before any write.
- `.specs/02_archives/figma-variables/design.md` — the token model this extends, and the
  decision §1 reverses.
- `.specs/00_backlog/figma-blog-mobile-sections.md` — closed by §3.
- `.specs/00_backlog/figma-mobile-touch-targets.md` — related, 44px target.
