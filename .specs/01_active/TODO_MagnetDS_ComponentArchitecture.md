# Component Architecture Analysis — jeromeabel.net Design System

Here is the complete file structure, component library organization, page compositions, variant patterns, and current gaps for the design system documentation, formatted as a clean markdown artifact.

---

## File Structure

| Figma Page       | Purpose                                                                           |
| ---------------- | --------------------------------------------------------------------------------- |
| **📖 Cover**     | File cover                                                                        |
| **📐 Decisions** | Design decision records                                                           |
| **📚 Docs**      | Foundation documentation (color, typography, spacing, layout, responsive, motion) |
| **❖ Components** | Component library (source of truth)                                               |
| **📄 Pages**     | Page-level compositions (HOME, BLOG) + Work explorations                          |

---

## Component Library (`❖ Components` page)

Components are organized into 6 distinct sections:

### 1. Chrome — Navigation & Shell

| Component        | Type          | Variants            | Description |
| ---------------- | ------------- | ------------------- | ----------- |
| **Header**       | Component Set | `breakpoint=Desktop | Mobile`     | Site header with nav links. Desktop: inline nav. Mobile: hamburger menu  |
| **HeaderDrawer** | Component Set | `state=closed       | open`       | Mobile menu drawer with NavLinks + toggles                               |
| **NavLink**      | Component Set | `state=default      | hover       | active`                                                                  | Navigation link for page routes            |
| **NavLinkHome**  | Component Set | `state=default      | hover       | active`                                                                  | Home/brand navigation link ("Jérôme Abel") |
| **Footer**       | Component Set | `breakpoint=Desktop | Mobile`     | Site footer. Desktop: horizontal FooterLeft/FooterRight. Mobile: stacked |
| **ThemeToggle**  | Component Set | `mode=light         | dark`       | Light/dark theme switch using Icon                                       |
| **MotionToggle** | Component Set | `mode=on            | off`        | Animation toggle using Icon                                              |
| **Icon**         | Component Set | `icon=arrow-down    | arrow-left  | arrow-right                                                              | arrow-up-right                             | calendar | chevron-right | clock | dot | download | folder | handshake | layers | mail | moon | pause | play | sun | bluesky | facebook-f | github | linkedin-in | x-twitter | tag | creative-commons` | 24×24 icon library. Each variant wraps its vector in an IconShape frame |

**Internal structure:**

```text
Header (breakpoint=Desktop)
  └─ HeaderContent
     ├─ NavLinkHome
     └─ NavRight
         ├─ NavPages
         │   ├─ NavLink (Blog)
         │   ├─ NavLink (Work)
         │   └─ NavLink (Contact)
         └─ ThemeToggle

```

### 2. Actions — Interactive Links

| Component               | Type          | Variants       | Description           |
| ----------------------- | ------------- | -------------- | --------------------- |
| **Link/Primary**        | Component Set | `state=default | hover`                | Primary CTA with left icon (e.g., "Start reading ↓") |
| **Link/Secondary**      | Component Set | `state=default | hover`                | Secondary CTA with right icon (e.g., "All posts →")  |
| **Link/TextLink**       | Component Set | `state=default | hover                 | active`                                              | Inline text link with small right icon (e.g., "All posts →") |
| **Link/IconOnly**       | Component Set | `size=normal   | small`×`state=default | hover`                                               | Icon-only link button (social icons, etc.)                   |
| **Link/SecondarySmall** | Component Set | `size=normal   | big`×`state=default   | hover                                                | active`                                                      | Small inline text link with underline (footer links, email) |

### 3. Typography

| Component           | Type      | Description                                                                                                      |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| **H1**              | Component | Page title heading. Wraps a single text node                                                                     |
| **H2**              | Component | Section heading. Wraps a single text node                                                                        |
| **PageDescription** | Component | Page subtitle/description paragraph                                                                              |
| **PreviewTitle**    | Component | Section title bar: H2 on the left + Link/TextLink ("All posts →") on the right. Used in preview sections on Home |

### 4. Metadata

| Component             | Type          | Variants      | Description                                         |
| --------------------- | ------------- | ------------- | --------------------------------------------------- |
| **PostMetadataTime**  | Component Set | `type=default | no-date                                             | day`                                                                                         | Post timestamp display. `default` = date + reading time, `no-date` = date only, `day` = short date + reading time |
| **PostMetadataTopic** | Component Set | `type=post    | serie`                                              | Post category tag. `post` = plain text badge, `serie` = folder icon + series name + position |
| **SerieMeta**         | Component     | _None_        | Series part count display (folder icon + "6 PARTS") |

### 5. Cards

| Component                | Type          | Variants       | Description                                                                                             |
| ------------------------ | ------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| **PostCardPreviewBig**   | Component Set | `state=default | hover`                                                                                                  | Large blog post card (vertical: CoverContainer → Content → CardInfo + PostMetadataTime) |
| **PostCardPreviewSmall** | Component Set | `state=default | hover`×`breakpoint=Desktop                                                                              | Mobile`                                                                                 | Small blog post card. Desktop: horizontal (cover left, content right). Mobile: vertical (cover top 200px, content below) |
| **WorkCardPreviewSmall** | Component     | _None_         | Work project card (vertical: CoverContainer → Content → CardInfo). Contains title, tags row, tech stack |
| **SerieCard**            | Component Set | `state=default | hover`                                                                                                  | Blog series card (vertical: CoverContainer → Content → CardInfo + SerieMetaRow)         |
| **PostRow**              | Component Set | `type=post     | serie`×`state=default                                                                                   | hover`                                                                                  | Compact archive row. PostRowContent holds title + PostMetaRow (metadata + topic)                                         |

**Shared card internal structure:**

```text
Card
  ├─ CoverContainer          — clip:true, holds cover image rectangle
  └─ Content
      ├─ CardInfo             — title, description, metadata
      └─ PostMetadataTime     — date display

```

### 6. Sections — Page-Level Blocks

| Component                 | Type          | Variants            | Description                                                               |
| ------------------------- | ------------- | ------------------- | ------------------------------------------------------------------------- |
| **Hero**                  | Component Set | `breakpoint=Desktop | Mobile`                                                                   | Home hero section. Desktop: horizontal (HeroTextContainer + HeroAnimation). Mobile: vertical text only                 |
| **BlogPreviewSection**    | Component Set | `breakpoint=Desktop | Mobile`                                                                   | Blog preview for Home. Desktop: horizontal grid (PostCardPreviewBig + 3× PostCardPreviewSmall). Mobile: vertical stack |
| **WorkPreviewSection**    | Component Set | `breakpoint=Desktop | Mobile`                                                                   | Work preview for Home. Desktop: horizontal 3× WorkCardPreviewSmall. Mobile: vertical stack                             |
| **ContactPreviewSection** | Component     | _None_              | Contact section with ContactContent + ContactImage                        |
| **ContactContent**        | Component     | _None_              | Contact info block: H2 heading + EmailBlock + FollowBlock (ShareIconsRow) |
| **HeroText**              | Component     | _None_              | Hero text block: H1 + description paragraph                               |
| **HeroAnimation**         | Component     | _None_              | Hero animation/image placeholder                                          |
| **SerieCardList**         | Component Set | `breakpoint=Desktop | Mobile`                                                                   | Grid of 3 SerieCards. Desktop: horizontal. Mobile: vertical                                                            |
| **PostArchiveList**       | Component Set | `breakpoint=Desktop | Mobile`                                                                   | Year-grouped post archive. Year label + BlogPostRows (4× PostRow)                                                      |

**Hero internal structure:**

```text
Hero (breakpoint=Desktop)
  ├─ HeroContent
  │   ├─ HeroTextContainer
  │   │   └─ HeroText
  │   │       ├─ H1
  │   │       └─ Description text
  │   └─ HeroAnimation
  │       └─ image rectangle
  └─ StartReading
      └─ Link/Primary ("Start reading ↓")

```

---

## Page Compositions (`📄 Pages` page)

### Common Page Shell

```text
Page Component (VERTICAL auto-layout)
  ├─ Header         — breakpoint=Desktop|Mobile
  ├─ PageContent (slot)  — VERTICAL, holds all sections
  └─ Footer         — breakpoint=Desktop|Mobile

```

### HOME — Desktop (`Home — Desktop`)

```text
PageContent (slot)
  ├─ Hero (breakpoint=Desktop)             — full-width hero with text + animation
  ├─ BlogPreviewSection (breakpoint=Desktop) — 1 big + 3 small post cards
  ├─ WorkPreviewSection (breakpoint=Desktop) — 3 work project cards
  └─ ContactPreviewSection                 — contact info + illustration

```

> _Note:_ All sections are direct children of `PageContent (slot)` — each section handles its own horizontal padding (`16px` each side via `pad:0/16/0/16`).

### HOME — Mobile (`Home — Mobile`)

Same structure as Desktop, but each responsive component switches to its `breakpoint=Mobile` variant:

- **Hero** → vertical text-only layout
- **BlogPreviewSection** → vertically stacked cards
- **WorkPreviewSection** → vertically stacked cards
- **ContactPreviewSection** → unchanged (single component, no breakpoint variants)

### BLOG — Desktop (`Blog — Desktop`)

```text
PageContent (slot)
  └─ PageContentContainer    — 1248px wide, applies uniform inset padding
      ├─ PageIntroContainer
      │   └─ PageIntro
      │       ├─ H1
      │       └─ PageDescription
      ├─ SeriesSection
      │   ├─ H2 ("Series")
      │   └─ SerieCardList (breakpoint=Desktop)
      └─ ArchiveSection

```

> **Structural note:** Blog pages use a `PageContentContainer` wrapper that applies uniform horizontal padding (`16px`). Home pages do **not** use this wrapper — each Home section handles its own padding because the Hero requires full-width bleed. This is an intentional architectural difference.

### BLOG — Mobile (`Blog — Mobile`)

Same section structure as Desktop, with responsive components switching to `breakpoint=Mobile`:

- **SerieCardList** → vertical stack
- **PostArchiveList** → vertical layout

### WORK — Not Yet Built

No WORK page component exists. Work content is currently represented only by:

- `WorkPreviewSection` on the Home pages (3 preview cards)
- `WorkCard Layouts — Polished Variations` exploration section (4 layout explorations: bento grid, editorial list, hero grid, index cards)

---

## Dark Mode Variants

Dark mode compositions exist as **instances** of the main page components with overridden color variables:

- Home — Desktop [Dark]
- Home — Mobile [Dark]
- Blog — Desktop [Dark]
- Blog — Mobile [Dark]

---

## Component Variant Pattern Reference

The system uses two axes for variants:

| Property       | Values        | Used In         |
| -------------- | ------------- | --------------- |
| **breakpoint** | `Desktop      | Mobile`         | Header, Footer, Hero, BlogPreviewSection, WorkPreviewSection, PostCardPreviewSmall, SerieCardList, PostArchiveList |
| **state**      | `default      | hover           | active`                                                                                                            | NavLink, NavLinkHome, Link/*, PostCardPreviewBig, PostCardPreviewSmall, SerieCard, PostRow |
| **mode**       | `light        | dark`or`on      | off`                                                                                                               | ThemeToggle, MotionToggle                                                                  |
| **size**       | `normal       | small`or`normal | big`                                                                                                               | Link/IconOnly, Link/SecondarySmall                                                         |
| **type**       | `default      | no-date         | day`or`post                                                                                                        | serie`                                                                                     | PostMetadataTime, PostMetadataTopic, PostRow |
| **icon**       | 24 icon names | Icon            |

---

## Remaining Gaps

- **WORK page:** No page-level component exists; the WorkCard exploration section has 4 layout variations (bento, list, hero, index) but none are promoted to production components.
- **ContactPreviewSection:** Standalone component, no breakpoint variants (mobile currently inherits desktop layout and squishes).
- **WorkCardPreviewSmall:** Standalone component, no `state=hover` variant (all other cards have hover states).
