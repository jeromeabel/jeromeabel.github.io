---
title: Figma mobile touch targets below 44px
created: 2026-08-12
---

Increase tap-target padding on shared Chrome/Actions master components (`NavLink`, `NavLinkHome`,
`ThemeToggle`, `Link/Icon`) so mobile instances clear the 44×44px touch-target minimum. Found
during the magnet-ds-review Task 11 validation gate's bonus touch-target audit on
`Home — Mobile — Light`/`Home — Mobile — Dark`.

Measured (both frames, identical since they share the same master components):

| Target                       | Size (w×h)                | Meets 44×44?                    |
| ---------------------------- | ------------------------- | ------------------------------- |
| NavLinkHome                  | 128×36                    | No — height                     |
| NavLink ×3 (Blog/Work/About) | 37×36, 44×36, 50×36       | No — height (and one width)     |
| ThemeToggle                  | 36×36                     | No                              |
| MotionToggle                 | not present on mobile nav | N/A                             |
| Footer Link/Icon ×3 (social) | 40×40                     | No — close, 4px short each axis |

Not fixed directly in Task 11 because these are shared master components also instanced on the
Desktop templates (Home/Blog Desktop Light/Dark) — padding increases here would grow the desktop
nav bar height and footer icon size site-wide, which is out of scope for a mobile-only fix and
risks unintended desktop layout drift. Needs a deliberate design pass: either bump the shared
master padding (accepting the desktop side-effect) or add mobile-specific size overrides.

**Update 2026-08-15** — the `Link/Icon` row is now half-resolved. The geometry prover
(figma-responsive-architecture Task 14 Step 5, item 7) found the master at 40×40 against the
56×56 the code renders, and the master was corrected to 56×56 bound to `spacing/14`. That clears
44×44 for the footer social icons on both sides. `NavLink`, `NavLinkHome` and `ThemeToggle` are
untouched and still short on height — the shared-master/desktop-side-effect tradeoff below still
stands for those three.

Ref: `.specs/02_archives/magnet-ds-review/notes.md` (Validation gate section, bonus touch-target
audit); `.specs/02_archives/figma-responsive-architecture/progress.md` (Task 14 Step 5 follow-up,
item 7b)
Size: S
