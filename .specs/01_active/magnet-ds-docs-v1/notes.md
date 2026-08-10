---
title: Magnet DS docs restructure — notes
created: 2026-08-10
---

# Notes

## Node-ID map (Pass 0, 2026-08-10)

Fresh `use_figma` inventory of file `ihWIWmvtQPTWgUxlrVjC2c` ("Magnet-DS-v1.0"),
taken directly (not from `get_metadata`, which is known to go stale on this file).
All later tasks should read IDs from this table, not from the plan header.

| Item | Node ID | Page |
| --- | --- | --- |
| **Pages (12)** | | |
| 📖 Cover | `0:1` | — |
| 📚 Introduction | `2545:671` | — |
| 📐 Decisions | `2716:4244` | — |
| 🎨 Foundations | `5:14` | — |
| ❖ Components | `461:759` | — |
| 📄 Pages | `2558:18264` | — |
| Page 6 (backup) | `2678:6692` | — |
| Page 7 (backup) | `2678:10236` | — |
| Page 8 (backup, empty) | `2678:23308` | — |
| Page 9 (backup, empty) | `2678:32354` | — |
| Page 10 (backup) | `2678:34067` | — |
| Page 11 (backup, empty) | `2678:34657` | — |
| **`_Docs/*` component masters (10)** | | |
| `_Docs/ChapterHeader` | `2590:537` | 📚 Introduction |
| `_Docs/SpecimenCell` | `2590:542` | 📚 Introduction |
| `_Docs/DecisionCard` (component set) | `2590:571` | 📚 Introduction |
| `_Docs/TokenRow` | `2590:578` | 📚 Introduction |
| `_Docs/DoDont` | `2590:588` | 📚 Introduction |
| `_Docs/Date` (component set) | `2693:9890` | 📚 Introduction |
| `_Docs/Status` (component set) | `2693:9897` | 📚 Introduction |
| `_Docs/Headline` | `2708:21413` | 📚 Introduction |
| `_Docs/Paragraph` | `2709:21540` | 📚 Introduction |
| `_Docs/Divider` | `2709:21527` | 📚 Introduction |
| **Chapter frames (5)** | | |
| `CHAPTER / 00 Read me` | `2705:21254` | 📚 Introduction |
| `CHAPTER / 01 Foundations` | `2670:6678` | 📚 Introduction |
| `CHAPTER / 02 Components` | `2670:6860` | 📚 Introduction |
| `CHAPTER / 03 Sections` | `2670:7567` | 📚 Introduction |
| `CHAPTER / 04 Pages` | `2670:7608` | 📚 Introduction |
| **Intro frames** | | |
| `Intro/01` | `2708:21320` | 📚 Introduction |
| `Intro/02` | `2709:21578` | 📚 Introduction |
| **Stray nodes (3)** | | |
| `Frame 1` (levels diagram) | `2708:21292` | 📚 Introduction |
| `Section` (copied-template residue) | `2709:21629` | 📚 Introduction |
| `BLOG DESIGN SYSTEM v1.0` (stale label, text) | `2670:6656` | 📚 Introduction |
| **🎨 Foundations frames (2)** | | |
| `Foundations · Colors` | `6:2` | 🎨 Foundations |
| `Foundations · Typography` | `8:2` | 🎨 Foundations |
| **❖ Components page sections (8)** | | |
| `App/Header & Footer` | `2041:481` | ❖ Components |
| `App/Icons` | `2041:482` | ❖ Components |
| `App/Buttons` | `2041:483` | ❖ Components |
| `Hero` | `2041:484` | ❖ Components |
| `App/Typography` | `2041:485` | ❖ Components |
| `Blog` | `2041:486` | ❖ Components |
| `Work` | `2045:429` | ❖ Components |
| `Contact` | `2047:428` | ❖ Components |
| **📖 Cover** | | |
| Cover frame | `9:2` | 📖 Cover |
| Date chip text node (characters: "Aug 8, 2026") | `I2694:6660;2693:9892` | 📖 Cover |
| Version chip text node — reference only, **do not touch** (D2), characters: "v0.91" | `I2694:6673;2693:9909` | 📖 Cover |

### Deviations

- **Introduction page child count is stale before load.** The un-loaded
  `figma.root.children` pass (before `setCurrentPageAsync`) reported
  `📚 Introduction` as having 9 children; after loading the page via
  `setCurrentPageAsync`, the actual top-level child count is 11 (the 5 chapter
  frames, `_Docs/Components` section, `Intro/01`, `Intro/02`, and the 3 stray
  nodes). This is exactly the staleness the plan warns about — later tasks
  should always drill in with `setCurrentPageAsync` rather than trust an
  unloaded page's `children.length`. All 11 items were captured above; no item
  is actually missing.
- **A second, unrelated node is also named `Frame 1`.** Besides the top-level
  stray `Frame 1` (`2708:21292`), a `findAllWithCriteria` sweep of the whole
  Introduction subtree turned up a nested node also named `Frame 1`
  (`2709:21630`), sitting inside/near the `Section` stray
  (`2709:21629`) — consistent with it being more copied-template residue
  rather than a second copy of the top-level stray. It is **not** one of the
  3 stray nodes the plan tracks (those are the 3 top-level items listed
  above); flagging it so later tasks scoping "delete `Frame 1`" by name alone
  don't accidentally match this nested node instead of, or in addition to,
  the intended top-level one.
- No other mismatches found. All page IDs, the `9:2` cover frame, the
  `6:2`/`8:2` Foundations frames, and the 3 stray-node IDs (`2708:21292`,
  `2709:21629`, `2670:6656`) match the design.md audit exactly. No frame was
  renamed and no listed node was missing.
