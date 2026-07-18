# CV System — Design

> **Status:** Design (ratifies spec §10). Separate project; its own implementation plan follows.
> **Target repo:** `~/code/projects/cv` (new, not yet initialized).
> **Supersedes:** hand-aligned Inkscape SVG → `public/CV_JeromeAbel_en.pdf` (Jan 2024).
> **Source of reference:** latest Inkscape SVG at
> `~/Documents/personal/cv/CV_JeromeAbel_20260611.svg` (June 2026, 24 `flowRoot`s, matching PDF
> `CV_JeromeAbel-20260611.pdf` alongside) — newer than the site's public PDF.

## 1. Goal

One data-driven source that renders a print-ready CV PDF in French and English, in variants
(with/without phone, one page vs. extended), from structured YAML through a Typst template — no
manual box-dragging, no per-language duplicate file.

**Deliverable:** `typst compile` (or a thin `make`/`justfile`) produces
`CV_JeromeAbel_{en,fr}.pdf`, which is copied into the portfolio's `public/` and linked from the
About page's _Download CV_ button.

### Non-goals

- Not an HTML/web CV. The site already **is** the web presence; this is the downloadable/print PDF.
- No design system shared with the Astro site (different medium, different typographic scale).
- No CI/hosted build in v1 — local `typst` is enough. (Revisit only if the PDF should auto-rebuild.)

## 2. Why leave Inkscape SVG

The current CV is an Inkscape SVG with **24 `flowRoot` elements** (Inkscape-only, not standard SVG)
and **no text reflow**: every line is absolutely positioned, so editing one bullet forces manual
re-alignment of everything below it. Two contact "layers" (with/without phone) are toggled by hand.
Font naming drifted across ~6 spellings. **The alignment pain is the format, not the workflow** —
so the fix is a format with real layout: Typst.

Why Typst over the alternatives:

| Option           | Verdict                                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Typst** ✅     | Real layout engine, fast incremental compile, live preview (tinymist), scripting for data-driven templates, single binary. Chosen. |
| LaTeX (moderncv) | Same data-driven win, but heavy toolchain, slow feedback loop, brittle package soup.                                               |
| HTML → print CSS | Print pagination is fragile; duplicates the site's medium; harder to pin exact A4 output.                                          |
| Stay in Inkscape | Rejected — the problem being solved.                                                                                               |

## 3. Architecture

### 3.1 Repo layout

```
~/code/projects/cv/
├── data/
│   ├── cv.en.yaml          # content, English
│   ├── cv.fr.yaml          # content, French
│   └── private.yaml        # git-ignored: phone number (never committed)
├── template.typ            # layout functions; the "renderer"
├── main.typ                # entry: reads lang input, loads YAML, calls template
├── assets/
│   ├── photo.jpg
│   └── icons/              # mail, phone, github, linkedin, globe (SVG)
├── build/                  # git-ignored PDF output
├── justfile               # (or Makefile) build shortcuts
└── README.md
```

**Separation of concerns:** `data/*.yaml` = _what_ (content, translatable). `template.typ` = _how_
(layout, styling — language-agnostic). `main.typ` = wiring (pick language + variant, load, render).
Content edits never touch layout code; layout edits never touch content.

### 3.2 Data model (YAML)

One file per language, same shape. Arrays for the repeating sections so the template loops instead
of hand-placing. Draft schema:

```yaml
# data/cv.en.yaml
meta:
  lang: en
  title: "Frontend Engineer" # role headline under the name
  updated: 2026-07-18

profile:
  name: "Jérôme Abel"
  tagline: "Building things with code since 2010 — art systems, tools, web apps."
  photo: assets/photo.jpg

contact:
  email: dev@jeromeabel.net
  # phone lives in data/private.yaml (git-ignored) — see notes below
  location: "France"
  website: jeromeabel.net
  github: jeromeabel
  linkedin: jerome-abel

experiences:
  - role: "Frontend Engineer"
    org: "uhlive"
    start: 2024
    end: null # null → "present" / "aujourd'hui"
    location: "Remote"
    bullets:
      - "…"
      - "…"
    stack: [Vue, TypeScript, …] # optional

formations: # education
  - title: "Web Developer (reconversion)"
    org: "OpenClassrooms / Raccourci"
    year: 2022
    note: "Intensive reconversion"

skills:
  - group: "Frontend"
    items: [Vue, TypeScript, HTML/CSS, Astro]
  - group: "Tooling"
    items: [Git, Vite, …]
  - group: "Creative / systems"
    items: [Pure Data, …]

languages:
  - { name: "French", level: "Native" }
  - { name: "English", level: "Professional" }
```

Notes:

- `end: null` is the sentinel for "present" — the template localizes it (`present` / `aujourd'hui`).
- `phone` never enters git: it lives in `data/private.yaml` (git-ignored, shape `{ phone: "+33 6 …" }`),
  loaded at render time; **the variant decides whether it renders**. Set up `.gitignore` before the
  first commit — git history remembers. Ship `data/private.example.yaml` as the committed template.
- Keep both language files **structurally identical** (same keys, same array lengths where they
  mirror). A tiny check script can diff key-sets to catch drift.

### 3.3 Template (`template.typ`)

Decompose into small layout functions, each taking a slice of the data:

```typ
#let header(profile, contact, phone) = { … }        // photo, name, title, contact row; phone: none | str
#let experience-entry(e, lang) = { … }              // one job block
#let section(title, body) = { … }                   // heading + rule + content
#let skills-grid(skills) = { … }
#let cv(data, phone: none) = {                      // top-level composition; phone rendered iff not none
  set document(title: "CV — " + data.profile.name)
  set page(paper: "a4", margin: …)
  set text(font: "<one family>", size: 10pt, lang: data.meta.lang)  // lang → hyphenation, smart quotes
  header(data.profile, data.contact, phone)
  section("Experience", data.experiences.map(e => experience-entry(e, data.meta.lang)).join())
  section("Education", …)
  section("Skills", skills-grid(data.skills))
}
```

Localized section labels ("Experience"/"Expérience") come from a small dictionary keyed by
`meta.lang`, so the template stays language-agnostic.

### 3.4 Variants as inputs

Replaces the two Inkscape contact layers and any "long/short" hand-toggling. Selected at compile
time via `--input`:

```bash
typst compile main.typ build/CV_JeromeAbel_en_phone.pdf --input lang=en --input phone=true
typst compile main.typ build/CV_JeromeAbel_fr.pdf --input lang=fr --input phone=false
```

`main.typ` reads them from `sys.inputs`:

```typ
#let lang  = sys.inputs.at("lang", default: "en")
#assert(lang == "en" or lang == "fr", message: "lang must be en or fr")
#let with-phone = sys.inputs.at("phone", default: "false") == "true"
#let data  = yaml("data/cv." + lang + ".yaml")
#let private = yaml("data/private.yaml")            // git-ignored; { phone: "+33 6 …" }
#cv(data, phone: if with-phone { private.phone } else { none })
```

Supported inputs (v1): `lang ∈ {en, fr}`, `phone ∈ {true, false}`. Room to add `variant=onepage|full`
later without changing the interface.

### 3.5 Build

A `justfile` (or Makefile) wraps the canonical builds and the site sync (`just` syntax — commands on
indented lines under each recipe):

```
default: en fr

en:
    typst compile main.typ build/CV_JeromeAbel_en.pdf --input lang=en --input phone=false

fr:
    typst compile main.typ build/CV_JeromeAbel_fr.pdf --input lang=fr --input phone=false

# with-phone variants: built on demand, kept out of sync/public
en-phone:
    typst compile main.typ build/CV_JeromeAbel_en_phone.pdf --input lang=en --input phone=true

watch:
    typst watch main.typ build/preview.pdf --input lang=en --input phone=true

sync:
    # copy build/CV_JeromeAbel_{en,fr}.pdf → portfolio public/ (see §6); never the *_phone builds
```

## 4. Fonts

**One font family**, installed system-wide (or vendored in `assets/fonts/` and passed via
`--font-path`). Fixes the ~6-spelling chaos: the template names it in exactly one place
(`set text(font: …)`). Pick a family with real weights (regular/medium/bold) and good Latin +
French diacritic coverage. Decision deferred to implementation (candidates: Inter, Source Sans 3,
Libertinus) — but the constraint is **one family, one spelling**.

## 5. Migration (SVG → Typst)

Rebuild against the current CV as a visual reference, not a pixel copy:

1. Export the current SVG (`~/Documents/personal/cv/CV_JeromeAbel_20260611.svg`) to a PNG at A4 size.
2. In the Typst template, place it as a **semi-transparent, full-page underlay** (`place` + `image`
   at low opacity behind the content) so the new layout can be aligned against the old one by eye.
3. Rebuild section by section (header → experience → education → skills) until the new content sits
   right.
4. **Remove the underlay** and delete the PNG. The final template has no trace of it.

This keeps the familiar look while the source-of-truth flips from hand-placed boxes to reflowing data.

## 6. Integration back to the portfolio

The site's About page links `href="/CV_JeromeAbel_en.pdf"` (`AboutText.astro`, _Download CV_ button).
`public/CV_JeromeAbel_en.pdf` currently predates the 2026 content. After the new CV builds:

- Copy `build/CV_JeromeAbel_en.pdf` → `jeromeabel.github.io/public/CV_JeromeAbel_en.pdf` (overwrite).
- (Optional) add `CV_JeromeAbel_fr.pdf` + a language toggle on the button — **out of scope for v1**;
  the current button stays single-file.

The two repos stay decoupled: the CV repo produces a PDF artifact; the site consumes it as a static
asset. No build-time coupling.

## 7. Toolchain

- **`typst`** — single binary; not currently on PATH (`which typst` → not found). Install first
  (`cargo install typst-cli` or distro package).
- **tinymist** — Typst LSP for the editor (live preview, diagnostics, formatting).
- **`typst watch`** — recompiles on save for a tight feedback loop during layout work.

## 8. Open questions (resolve in the implementation brainstorm)

1. **Font family** — final pick (Latin + French diacritics, ≥3 weights).
2. **`justfile` vs. `Makefile`** — pick one; both fine, `just` is lighter.
3. **Photo on the CV?** — the current one has it; confirm keep vs. drop for the engineering CV.
4. **French/English button on the site** — v1 keeps `en` only; decide if/when `fr` surfaces.
5. **Content freshness** — the 2026 experience/skills copy is the _content_ task; this design covers
   the _system_. Draft `cv.en.yaml` from the June 2026 SVG content (freshest source) + About page
   bio + Work archive as the seed.

## 9. Suggested build order

1. `git init ~/code/projects/cv`; install `typst` + tinymist; scaffold repo layout (§3.1) with
   `.gitignore` covering `build/` and `data/private.yaml` **before the first commit**.
2. Seed `data/cv.en.yaml` from real content (June 2026 SVG + About bio + Work archive).
3. Minimal `main.typ` + `template.typ`: render header + one experience section, A4, one font.
4. Add PNG underlay (§5); align full layout section by section; remove underlay.
5. Add the variant inputs (`lang`, `phone`) and translate `data/cv.fr.yaml`.
6. `justfile` with `en`/`fr`/`watch`/`sync`; wire `sync` to the portfolio `public/`.
7. Build `en`, copy into the site, verify the About _Download CV_ link serves the new PDF.
