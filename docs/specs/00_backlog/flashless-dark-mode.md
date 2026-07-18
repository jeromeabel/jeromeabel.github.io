---
title: Flashless dark mode
created: 2026-07-18
---

Eliminate the dark-mode flash on first paint. Inline a tiny theme script in `<head>` before CSS, reading `localStorage` + `prefers-color-scheme`, so the correct theme is applied before render.
Ref: https://www.vbesse.com/en/blog/flashless-dark-mode
Size: S
