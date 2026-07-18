---
title: CV System — access & update (as-built)
created: 2026-07-18
---

Built and shipped. The CV lives in its **own repository**, not this one.

## Where

- Repo: `~/code/projects/cv` — remote `github.com/jeromeabel/cv`
- Stack: YAML data → Typst template → print-ready A4 PDF (fr/en). See its `README.md`.

## Update the CV content

- Edit **both** `data/cv.en.yaml` and `data/cv.fr.yaml` (same structure, translated
  values). `make check` fails if they drift (entry/bullet counts or keys).
- Layout & style live in `template.typ`.

## Build & publish to this site

- `make sync` — checks parity, builds en+fr, and copies
  `CV_JeromeAbel_{en,fr}.pdf` into **this repo's** `public/`.
  (The CV Makefile hardcodes `SITE_PUBLIC = ~/code/projects/jeromeabel.github.io/public`.)
- `make` builds to `build/` without copying; `make en` / `make fr` for one language;
  `make en-phone` / `make fr-phone` add a phone row (never synced to the site).
- After `make sync`, commit the updated PDFs **here** (in the portfolio repo).

## Current state

- `public/CV_JeromeAbel_en.pdf` and `public/CV_JeromeAbel_fr.pdf` are present and
  in sync with the CV repo's latest build — **no copy needed right now.**
- Linked from the About page (`src/components/about/AboutText.astro`).

## Setup deps (one-time, on a new machine)

- `typst` (e.g. `sudo snap install typst`).
- Fonts **Lato** and **Zen Kaku Gothic New** installed system-wide.
- `cp data/private.example.yaml data/private.yaml` and fill the phone number
  (`private.yaml` is git-ignored — the phone never enters git).
