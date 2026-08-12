---
title: Figma mobile touch targets below 44px
created: 2026-08-12
---

Increase tap-target padding on shared Chrome/Actions master components (`NavLink`, `NavLinkHome`,
`ThemeToggle`, `Link/Icon`) so mobile instances clear the 44×44px touch-target minimum. Found
during the magnet-ds-review Task 11 validation gate's bonus touch-target audit on
`Home — Mobile — Light`/`Home — Mobile — Dark`.

Measured (both frames, identical since they share the same master components):

| Target | Size (w×h) | Meets 44×44? |
|---|---|---|
| NavLinkHome | 128×36 | No — height |
| NavLink ×3 (Blog/Work/About) | 37×36, 44×36, 50×36 | No — height (and one width) |
| ThemeToggle | 36×36 | No |
| MotionToggle | not present on mobile nav | N/A |
| Footer Link/Icon ×3 (social) | 40×40 | No — close, 4px short each axis |

Not fixed directly in Task 11 because these are shared master components also instanced on the
Desktop templates (Home/Blog Desktop Light/Dark) — padding increases here would grow the desktop
nav bar height and footer icon size site-wide, which is out of scope for a mobile-only fix and
risks unintended desktop layout drift. Needs a deliberate design pass: either bump the shared
master padding (accepting the desktop side-effect) or add mobile-specific size overrides.

Ref: `.specs/02_archives/magnet-ds-review/notes.md` (Validation gate section, bonus touch-target
audit)
Size: S
