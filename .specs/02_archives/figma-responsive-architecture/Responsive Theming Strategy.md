# Responsive & Theming Strategy Analysis

**File:** `ihWIWmvtQPTWgUxlrVjC2c`
**Date:** 2026-08-13
**Scope:** Home page — Desktop & Mobile, Light & Dark modes

## 1. Executive Summary

The current file maintains 4 separate page-level components per page (Desktop Light, Desktop Dark, Mobile Light, Mobile Dark). This creates a maintenance multiplier — every design change must be applied 4 times, and drift between variants is inevitable.

**Key finding:** The "2 Theme" variable collection already handles Light/Dark switching automatically. The Dark variants are redundant copies that duplicate work the variable system already does.

**Recommendation:** Reduce from 4 to 2 master components per page (Desktop + Mobile). Use instances with explicit variable modes for presenting all 4 states.

## 2. Current File Audit

### 2.1 Page Structure

The Pages page contains 8 top-level components:

| Component Name         | Node ID     | Dimensions  | Theme Mode  | Responsive Mode  |
| ---------------------- | ----------- | ----------- | ----------- | ---------------- |
| Home — Desktop — Light | `2604:1741` | 1280 × 2725 | Light (3:0) | Desktop (2245:0) |
| Home — Desktop — Dark  | `2604:1739` | 1280 × 2725 | Dark (3:1)  | Desktop (2245:0) |
| Home — Mobile — Light  | `2604:1742` | 390 × 4158  | Light (3:0) | Mobile (2245:2)  |
| Home — Mobile — Dark   | `2604:1743` | 390 × 3504  | Dark (3:1)  | Mobile (2245:2)  |
| Blog — Desktop — Light | `2604:1744` | 1280 × 1805 | Light (3:0) | Desktop (2245:0) |
| Blog — Desktop — Dark  | `2604:1740` | 1280 × 1805 | Dark (3:1)  | Desktop (2245:0) |
| Blog — Mobile — Light  | `2604:1745` | 390 × 1681  | Light (3:0) | Mobile (2245:2)  |
| Blog — Mobile — Dark   | `2604:1746` | 390 × 1681  | Dark (3:1)  | Mobile (2245:2)  |

**Evidence:**

Each page component sets explicit variable modes via `explicitVariableModes`:

- Theme collection VariableCollectionId: `3:2` — Light = `3:0`, Dark = `3:1`
- Responsive collection VariableCollectionId: `2245:42` — Desktop = `2245:0`, Mobile = `2245:2`

### 2.2 Home Desktop Light — Layer Tree

```text
COMPONENT "Home — Desktop — Light" (2604:1741) 1280×2725
  AL: VERTICAL | gap: 0 | pad: 0/0/0/0 | hSize: FIXED | vSize: HUG
  Bound vars: [width, fills]
  Explicit modes: Theme=Light, Responsive=Desktop

  INSTANCE "Header" (2586:1138) 1280×84
    AL: HORIZONTAL | gap: 8 | pad: 0/32/0/32
    hSize: FILL | vSize: HUG
    Bound vars: itemSpacing→spacing/2, paddingL/R→spacing/8
```

### 2.3 Home Mobile Light — Layer Tree

```text
COMPONENT "Home — Mobile — Light" (2604:1742) 390×4158
  Explicit modes: Theme=Light, Responsive=Mobile

  INSTANCE "Header" 390×84
    ← SAME component as Desktop

  FRAME "PageContent (slot)" 390×3887
    AL: VERTICAL | gap: 48 | pad: 40/0/0/0
    ← gap 48 vs Desktop's 96

    INSTANCE "Hero" 390×336
      ← SAME component

    INSTANCE "BlogPreviewSection — Mobile"
      ← DIFFERENT component

    INSTANCE "WorkPreviewSection — Mobile"
      ← DIFFERENT component
```

## 3. Variable Collections Inventory

### 3.1 "2 Theme" Collection (Light / Dark)

This is why Light/Dark copies are redundant — all colors swap automatically.

| Variable                  | Light Value   | Dark Value    |
| ------------------------- | ------------- | ------------- |
| `color/background`        | → lime-100    | → gray-800    |
| `color/foreground`        | → gray-800    | → gray-100    |
| `color/foreground-strong` | → gray-900    | → gray-50     |
| `color/foreground-muted`  | → gray-500    | → gray-300    |
| `color/border`            | → lime-300    | → gray-600    |
| `color/surface`           | → lime-200    | → gray-700    |
| `color/surface-hover`     | → lime-150    | → gray-750    |
| `color/surface-raised`    | → lime-250    | → gray-650    |
| `color/accent`            | → teal/700    | → teal/500    |
| `color/accent-hover`      | → teal/800    | → teal/400    |
| `color/accent-strong`     | → teal/900    | → teal/300    |
| `color/accent-subtle`     | → teal/50     | → teal/950    |
| `font/sans`               | IBM Plex Sans | IBM Plex Sans |
| `font/title`              | Bubbler One   | Bubbler One   |
| `font/mono`               | Fira Code     | Fira Code     |

### 3.2 "1 Primitives" Collection (Single mode)

451 raw tokens — the foundation layer:

| Category     | Examples                                       | Count |
| ------------ | ---------------------------------------------- | ----: |
| Colors       | `color/teal/500`, `color/brand/gray-800`       |  ~280 |
| Spacing      | `spacing/0` (0px) → `spacing/96` (384px)       |   ~30 |
| Text sizes   | `text/xs` (12) → `text/9xl` (128)              |   ~13 |
| Radius       | `radius/xs` (2) → `radius/full` (9999)         |   ~11 |
| Font weights | thin (100) → black (900)                       |     9 |
| Line heights | `leading/tight` (1.25) → `leading/loose` (2.0) |    ~6 |
| Containers   | `container/3xs` (256) → `container/7xl` (1280) |   ~13 |

### 3.3 "3 Responsive" Collection (Desktop / Tablet / Mobile)

Only 4 variables — the area with most room for growth.

| Variable              | Desktop | Tablet | Mobile |
| --------------------- | ------: | -----: | -----: |
| `container/max-width` |  → 1280 | → 1280 | → 1280 |
| `container/gutter`    |  → 32px | → 24px | → 16px |
| `section/rhythm-y`    |  → 96px | → 64px | → 48px |
| `viewport/width`      |    1280 |    768 |    390 |

## 4. Component Sharing Analysis

### 4.1 Shared vs. Separate Components

| Component             | Same across breakpoints? | Main ID                                    |
| --------------------- | ------------------------ | ------------------------------------------ |
| Header                | YES                      | `2001:1669`                                |
| Footer                | YES                      | `2099:2560`                                |
| Hero                  | YES                      | `2012:6305`                                |
| BlogPreviewSection    | NO                       | Desktop: `2041:560` / Mobile: `2826:5489`  |
| WorkPreviewSection    | NO                       | Desktop: `2045:428` / Mobile: `2829:5539`  |
| ContactPreviewSection | NO                       | Desktop: `2114:7281` / Mobile: `2829:5576` |

### 4.2 Why Some Sections Need Separate Components

The critical difference — `WorkPreviewSection` changes `layoutMode`:

```text
Desktop: WorkPreviewSmallList → AL: HORIZONTAL | gap: 40
Mobile:  WorkPreviewSmallList → AL: VERTICAL   | gap: 40
```

**Figma limitation:** `layoutMode` (HORIZONTAL vs VERTICAL) cannot be bound to a variable. Variables only support COLOR, FLOAT, STRING, and BOOLEAN types.

**Reference:** [https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)

## 5. The Combinatorial Explosion Problem

### 5.1 The Math

```text
Current:  2 pages × 2 breakpoints × 2 themes = 8 components
Add tablet: 2 pages × 3 breakpoints × 2 themes = 12 components
Add 5 pages: 7 pages × 3 breakpoints × 2 themes = 42 components
```

### 5.2 Drift Evidence

| Component      | Light Height | Dark Height | Match?                |
| -------------- | -----------: | ----------: | --------------------- |
| Home — Desktop |         2725 |        2725 | Yes                   |
| Home — Mobile  |         4158 |        3504 | **NO — 654px drift!** |

The Mobile Dark variant is 654px shorter than Mobile Light. This is exactly the drift that happens with parallel copies.

## 6. Recommended Strategy

### 6.1 Theme: Variable Modes, Not Component Copies

**BEFORE (current):**

```text
Home — Desktop — Light  ← Component (source #1)
Home — Desktop — Dark   ← Component (source #2, drifts!)
```

**AFTER (recommended):**

```text
Home — Desktop           ← Component (SINGLE source of truth)
Home — Desktop [Light]   ← Instance, Theme mode = Light
Home — Desktop [Dark]    ← Instance, Theme mode = Dark
```

**Why:** All fills, text colors, borders are already bound to theme variables. Setting mode at the parent cascades to all children. Zero overrides needed.

**Reference:** [https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)

> When you set a mode on a frame, all children inherit the mode.

### 6.2 Responsive: Component Variants for Layout Changes

```text
BlogPreviewSection
  ├─ Breakpoint = Desktop  (cards HORIZONTAL)
  └─ Breakpoint = Mobile   (cards stack)

WorkPreviewSection
  ├─ Breakpoint = Desktop  (HORIZONTAL)
  └─ Breakpoint = Mobile   (VERTICAL)
```

**Reference:** [https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants)

### 6.3 Extend Responsive Variables

| Variable (proposed)      | Desktop | Tablet | Mobile |
| ------------------------ | ------: | -----: | -----: |
| `section/gap` (new)      |      48 |     40 |     32 |
| `header/padding-y` (new) |      24 |     20 |     16 |
| `text/display` (new)     |      48 |     40 |     32 |
| `text/heading` (new)     |      30 |     26 |     22 |
| `text/body-lg` (new)     |      18 |     18 |     16 |
| `leading/display` (new)  |      56 |     48 |     40 |

## 7. Variable Binding Proof

Every theme-dependent property is already variable-bound:

| Node           | Property | Variable                 | Light    | Dark     |
| -------------- | -------- | ------------------------ | -------- | -------- |
| Page fills     | fills    | `color/background`       | lime-100 | gray-800 |
| "Jerome Abel"  | fills    | `color/foreground`       | gray-800 | gray-100 |
| Nav links      | fills    | `color/foreground-muted` | gray-500 | gray-300 |
| ThemeToggle bg | fills    | `color/surface`          | lime-200 | gray-700 |
| Icon strokes   | strokes  | `color/foreground-muted` | gray-500 | gray-300 |

**Conclusion:** 100% of theme-dependent properties are variable-bound. Dark copies are fully redundant.

## 8. What to Present in the Design System

You don't need every permutation. Show the system, not every output.

| Show              | How                            | Why                     |
| ----------------- | ------------------------------ | ----------------------- |
| Token foundations | Primitive ramps, spacing scale | Documents raw values    |
| Semantic tokens   | Theme variable table           | Shows the mapping       |
| Responsive tokens | Responsive variable table      | Shows breakpoint logic  |
| Components        | Each once, at default state    | Shows anatomy           |
| Page compositions | 2 per page (Desktop + Mobile)  | Source of truth         |
| Theme preview     | Instances with mode toggled    | Proves the system works |

### Recommended Layout

```text
┌─────────────────────────────────────────────────┐
│  Source Components (editable):                  │
│  [Home — Desktop]        [Home — Mobile]        │
│                                                 │
│  Presentation Instances (auto-update):          │
│  [Desktop Light]  [Desktop Dark]                │
│  [Mobile Light]   [Mobile Dark]                 │
└─────────────────────────────────────────────────┘
```

## 9. Implementation Roadmap

**Phase 1:** Eliminate Light/Dark duplicates → 8 components → 4

**Phase 2:** Consolidate section variants (Desktop/Mobile → variant sets)

**Phase 3:** Extend responsive variables (spacing, font sizes, line heights)

**Phase 4:** Add Tablet breakpoint (3 sources per page, no theme multiplication)

## 10. References

### Figma Documentation

| Topic                         | URL                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Guide to variables            | [https://help.figma.com/hc/en-us/articles/15339657135383](https://help.figma.com/hc/en-us/articles/15339657135383) |
| Apply variables to designs    | [https://help.figma.com/hc/en-us/articles/15343107263511](https://help.figma.com/hc/en-us/articles/15343107263511) |
| Modes for variables           | [https://help.figma.com/hc/en-us/articles/15343816063383](https://help.figma.com/hc/en-us/articles/15343816063383) |
| Create and use variants       | [https://help.figma.com/hc/en-us/articles/360056440594](https://help.figma.com/hc/en-us/articles/360056440594)     |
| Auto layout                   | [https://help.figma.com/hc/en-us/articles/5731482952599](https://help.figma.com/hc/en-us/articles/5731482952599)   |
| Auto layout wrap              | [https://help.figma.com/hc/en-us/articles/14141956824471](https://help.figma.com/hc/en-us/articles/14141956824471) |
| Publish styles and components | [https://help.figma.com/hc/en-us/articles/360025508373](https://help.figma.com/hc/en-us/articles/360025508373)     |

### Industry Design Systems

| System            | URL                                                                                                                    | Key Takeaway                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Uber Base         | [https://base.uber.com/6d2425e9f/p/294ab4](https://base.uber.com/6d2425e9f/p/294ab4)                                   | Layered tokens: primitives → semantic → component     |
| Material Design 3 | [https://m3.material.io/foundations/design-tokens/overview](https://m3.material.io/foundations/design-tokens/overview) | Three-tier tokens; modes change system values         |
| Atlassian         | [https://atlassian.design/foundations/design-tokens](https://atlassian.design/foundations/design-tokens)               | Semantic tokens decouple visual values from context   |
| Carbon (IBM)      | [https://carbondesignsystem.com/guidelines/themes/overview](https://carbondesignsystem.com/guidelines/themes/overview) | Components inherit theme from context, never carry it |
| Shopify Polaris   | [https://polaris.shopify.com/tokens](https://polaris.shopify.com/tokens)                                               | Global → alias → component token layers               |
| Adobe Spectrum    | [https://spectrum.adobe.com/page/color-system/](https://spectrum.adobe.com/page/color-system/)                         | Token aliases enable automatic theme switching        |
| Tailwind CSS v4   | [https://tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)                                               | Dark mode via single toggle, components inherit       |

## Key Principles

1. **Single Source of Truth** — Never maintain parallel copies for themes
2. **Layered Tokens** — Primitives → Semantic → Component
3. **Mode Inheritance** — Set mode at highest level, children cascade
4. **Responsive = Tokens + Variants** — Spacing via tokens, layout direction via variants

---

_Generated from file analysis on 2026-08-13 — Design System v0.91_
