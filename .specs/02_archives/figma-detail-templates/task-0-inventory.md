# Task 0 — Preflight, Live Inventory & Readiness Audit

Read-only. No Figma writes performed. All IDs resolved live via Pass-0 (never `get_metadata`).

## Step 3: Master → template map resolution (by name)

All hint IDs in plan.md matched the live IDs exactly — zero drift.

| Master | Hint ID | Live ID | Status |
| --- | --- | --- | --- |
| Header | `41:3` | `41:3` | ✓ match |
| Footer | `42:3` | `42:3` | ✓ match |
| TopicChip | `15:9` | `15:9` | ✓ match |
| TableOfContents | `36:3` | `36:3` | ✓ match |
| LinkNavPost (SET) | `34:17` | `34:17` | ✓ match |
| RelatedWork | `117:77` | `117:77` | ✓ match |
| WorkMiniCard | `32:9` | `32:9` | ✓ match |
| SeriePostListItem | `119:83` | `119:83` | ✓ match |
| SerieContents | `118:83` | `118:83` | ✓ match |
| WorkHeader | `127:95` | `127:95` | ✓ match |
| RelatedWriting | `125:83` | `125:83` | ✓ match |
| Link (SET) | `13:13` | `13:13` | ✓ match |
| **PostRowCalm** | (unresolved) | **absent** | ⚠️ confirmed missing — Task 2 must build it, sibling to `PostRow` (`31:13`) in the `POST-ROW` section |

**Orphan check:** cross-referenced every INSTANCE's `mainComponent` name on 📄 Pages against the Components walk — no orphans (`parent === null`). All resolved names (Header, Footer, AboutFacts, AboutText, ArchiveTable, ContactText, HeroText, PostRow, SerieCard, WorkGalleryCard, WorkOverlayCard, Icon/CrossBig + Link/ThemeToggle/Icon variant children) map cleanly to live masters.

**Out-of-scope masters confirmed unused on any detail route** (matches plan): PostListItem, ValueCard, and the 3 Legacy masters (BlogPreview, PostList, SerieList).

## Step 4: Home reference frames

Read via `use_figma` inspection + `get_screenshot` on `Home — 1280 — Light` (`52:649`) and `Home — 1280 — Dark` (`111:495`).

- **Background fill:** both frames bind `fills[0]` to `VariableID:3:3` (the `color/background` var) — not raw hex. Light mode resolves to `#f5ffe1`, Dark to `#1e1e1e` (confirmed via rendered hex, matches plan's stated values).
- **Dark-mode mechanism:** the Dark frame does **both** — inherits the same variable-bound fill AND sets an **explicit variable-mode override** on the frame: `explicitVariableModes = { "VariableCollectionId:3:2": "3:1" }` (forces the `Color` collection to its Dark mode for that frame's subtree). New Dark frames must replicate this explicit mode override, not just duplicate-and-recolor.
- **Header/Footer placement:** both are full-bleed instances, outside the padded container — `Header` at `(0,0)`, width 1280, height 84; `Footer` at `(0, 2454)`, width 1280, height 176. Between them, a `main` auto-layout frame at `y=84`.
- **Container inner width:** `main` frame — `paddingLeft/Right = 16`, `width = 1280` (padding is inset, not subtracted from frame width) → inner content width = 1280 − 32 = **1248px**, matching plan §Global Constraints.
- **Section X-extents on 📄 Pages** (for placing new sections without overlap): `PAGE/ABOUT` right edge 14232, `PAGE/HOME` right edge −6852, `PAGE/BLOG` right edge −2877, `PAGE/WORK` right edge 3140. Several stray top-level frames (About/Blog/Work at various widths, not inside a section) push the page's overall rightmost edge to **14232** (`PAGE/ABOUT`). New `PAGE/POST`, `PAGE/SERIE`, `PAGE/SERIE-POST`, `PAGE/WORK-DETAIL` sections should originate to the right of **x = 14232** (e.g. starting at `x = 15000`) to guarantee no overlap with any existing section or stray frame.

## Step 5: Content facts (verbatim from repo)

**blog-post — `api-endpoints-with-astro`**
- Title: "Adding API Endpoints to an Astro Project" · Date: 2026-05-11
- Abstract: "A walkthrough of building server-side routes in Astro: GET endpoints, dynamic [id] routes, two manual POST patterns (redirect and JSON), and Astro Actions — the modern default."
- Topic: `astro` · `related_work: [medito-fundraising, leconceptdelapreuve]` → RelatedWork renders 2 cards
- Heading count: **10** `##` headings → TOC renders (≥4 threshold)

**serie-landing — `web-performance`**
- Title: "Web Performance" · Date: 2026-07-08 · `featured: 1`
- Abstract: "A practical journey through web performance optimization, from core concepts and cheatsheets to real-world improvements in a production app."
- 5 parts (in order): 01-tactics-cheatsheet (2026-03-27), 02-data-driven (2026-04-16), 03-benchmark-tables (2026-06-17), 04-images-part-1 (2026-07-08), 05-images-part-2 (2026-07-14)

**serie-post — `web-performance/02-data-driven`**
- Title: "Exploring a Data-Driven Approach to Web Performance" · Date: 2026-04-16
- Abstract: "A practical account of using field data, lab measurements, and behavioral analytics to drive and evaluate performance improvements on a real B2B tool."
- Heading count: **19** (≥4, TOC renders) · Part 2 of 5 · prev = `01-tactics-cheatsheet` ("Web Performance Tactics Cheatsheet"), next = `03-benchmark-tables` ("Benchmarking a 10,000-Row Table: v-for, PrimeVue, and TanStack") — both confirmed present

**work-detail — `leconceptdelapreuve`**
- Title: "Le concept de la preuve" · Date: 2026-02-20 · `featured: 2`
- Abstract: "Building a minimal comic blog with Astro that stays almost entirely static — except for one serverless endpoint that handles votes"
- Stack: Astro, Tailwind CSS, Astro DB, Turso, Netlify, Sharp
- `related_posts: [api-endpoints-with-astro]` → RelatedWriting renders 1 PostRowCalm row (title: "Adding API Endpoints to an Astro Project")
- **Next work** (bottom link row, computed from `getFeaturedWorks()+getArchiveWorks()`, sorted by date desc within each group): featured works ordered by date = [leconceptdelapreuve (2026-02-20), Chimères Orchestra (2021-12-01), La Malinette (2020-01-01)] → leconceptdelapreuve is index 0 → **next = "Chimères Orchestra"** (`/work/chimeres-orchestra`)

## Reference links (existing PAGE sections)

- PAGE/HOME (`52:648`): https://www.figma.com/design/Wf4iomVMYUXlFIBV3Z8bx4/Blog-JeromeAbel?node-id=52-648&m=dev
- PAGE/BLOG (`52:891`): https://www.figma.com/design/Wf4iomVMYUXlFIBV3Z8bx4/Blog-JeromeAbel?node-id=52-891&m=dev
- PAGE/WORK (`52:1096`): https://www.figma.com/design/Wf4iomVMYUXlFIBV3Z8bx4/Blog-JeromeAbel?node-id=52-1096&m=dev
- PAGE/ABOUT (`52:438`): https://www.figma.com/design/Wf4iomVMYUXlFIBV3Z8bx4/Blog-JeromeAbel?node-id=52-438&m=dev

## Gate

All Task 0 objectives met. No Figma writes made. Ready for Task 1 (blog/shared master readiness) pending review sign-off.
