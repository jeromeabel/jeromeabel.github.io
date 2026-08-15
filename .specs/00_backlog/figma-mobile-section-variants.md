---
title: "Figma: Blog/Contact preview sections need Mobile variants"
created: 2026-08-15
---

`BlogPreviewSection` (`2041:560`) and `ContactPreviewSection` (`2114:7281`) are
the only two section masters left without a `breakpoint=Desktop|Mobile` axis —
every other section got one in the responsive-architecture pass. Inside
`Home — Mobile` (390px) they render their Desktop-fixed internals unchanged:

| Node                                       | Overflow at 390                 |
| ------------------------------------------ | ------------------------------- |
| `BlogPreviewSection > Content`             | 187px right                     |
| `ContactPreviewSection > ContactContainer` | 445px each side (1280 centered) |

Root cause is on record from Task 1's Gate B — neither ever had a `— Mobile`
counterpart to merge, so Task 11's merge pass had nothing to collapse and the
gap survived. Fix shape is Tasks 6–9's: add the axis to the existing master,
flip `layoutMode` on the Mobile variant, let the already-bound `3 Responsive`
spacing cascade.

Related judgment call, same area, not overflow-driven: `Home — Desktop` has one
decorative offender — `layer1` (`I2586:1143;2114:7231`), a GROUP inside
`ContactPreviewSection > ContactImage (relative flex-1)`, bleeding 40px past the
right edge. Pre-existing, never audited before; decide intentional-bleed vs.
drift while the master is open.

Source: `.specs/02_archives/figma-responsive-architecture/progress.md`
(Task 14 Steps 7, and the Desktop overflow audit under "real-drift fixes").
Size: M
