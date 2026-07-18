# CV System (Typst) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A data-driven Typst CV system in a new repo `~/code/projects/cv` that compiles `CV_JeromeAbel_{en,fr}.pdf` from YAML content, replacing the hand-aligned Inkscape SVG, and syncs the PDFs into the portfolio's `public/`.

**Architecture:** `data/*.yaml` holds content (one file per language, structurally identical); `template.typ` holds layout functions (language-agnostic, localized labels via a small dictionary); `main.typ` wires `sys.inputs` (lang, phone) to data + template. A Makefile wraps the canonical builds and the site sync. Design doc: `docs/superpowers/specs/2026-07-18-cv-system-design.md` (in the portfolio repo).

**Amendment 2026-07-18 (post Task-1 review, before Task 2):** cross-checking the plan against the actual reference PDF (`~/Documents/personal/cv/CV_JeromeAbel-20260611.pdf`) surfaced gaps. Human decisions:

- **No photo.** The reference CV has no photo at all (design doc's open question #3, never resolved). `header()` has no image; `profile.photo` is not a schema key; Task 1's `assets/photo.jpg` copy is removed.
- **Formations (education) section restored**, matching the reference exactly — 3 entries, own section, not folded into experiences. Overrides the earlier "no formations key" constraint below (struck through).
- **Centres d'intérêt (interests) section added** — flat string list, matching the reference.

**Tech Stack:** Typst (snap), YAML, GNU Make, Python 3 (parity check), Inkscape + ImageMagick (migration underlay only).

## Global Constraints

- **Working directory for all tasks: `~/code/projects/cv`** (created in Task 1). The portfolio repo `~/code/projects/jeromeabel.github.io` is touched only in Task 7 (copy PDFs into `public/`).
- **Phone number NEVER enters git.** It lives only in `data/private.yaml` (git-ignored). This plan is committed to a public repo and deliberately does not contain the number — copy it from the reference SVG (bottom-left CONTACT block). `.gitignore` must cover it **before the first commit** — git history remembers.
- **Reference source (visual + content truth):** `~/Documents/personal/cv/CV_JeromeAbel_20260611.svg` and its rendered `~/Documents/personal/cv/CV_JeromeAbel-20260611.pdf`. When plan content and the reference PDF disagree (dates especially), **the PDF wins** — fix the YAML.
- **One font family: Inter**, one spelling, set in exactly one place (`template.typ`). Installed at `~/.local/share/fonts/` as a variable font; Task 3 verifies weights render and has a static-font fallback.
- **A4, print-ready, one page** per language.
- **Language files structurally identical** (same keys, same array lengths) — enforced by `tools/check-parity.py`.
- ~~No `formations` key in v1~~ — superseded, see Amendment above: `formations` is a top-level key, own section, 3 entries from the reference.
- Output naming: `build/CV_JeromeAbel_{en,fr}.pdf`. `*_phone` variants are built on demand and **never synced** to the site.
- `just` is not installed on this machine; use **Makefile** (recipe lines need real TABs, not spaces).
- Typst has no test framework: the test cycle per task is `typst compile` exit 0 + a stated visual check + (where applicable) the parity script. Commit only after the verify step passes.

---

### Task 1: Toolchain + repo scaffold

**Files:**

- Create: `~/code/projects/cv/.gitignore`
- Create: `~/code/projects/cv/README.md`
- Create: directories `data/`, `assets/icons/`, `build/`, `ref/`, `tools/`

**Interfaces:**

- Produces: an initialized git repo with `typst` on PATH; `.gitignore` guarantees `data/private.yaml`, `build/`, `ref/` never get committed. All later tasks assume this layout.

- [ ] **Step 1: Install typst (snap, official Typst GmbH publisher)**

```bash
sudo snap install typst
typst --version
```

Expected: `typst 0.x.x` (any recent version; 0.12+ fine).

- [ ] **Step 2: Create repo layout**

```bash
mkdir -p ~/code/projects/cv/{data,assets/icons,build,ref,tools}
cd ~/code/projects/cv
git init -b main
```

- [ ] **Step 3: Write `.gitignore`** (before anything else is committed)

```gitignore
build/
ref/
data/private.yaml
```

- [ ] **Step 4: Write `README.md`**

```markdown
# CV — Jérôme Abel

Data-driven CV: YAML content → Typst template → print-ready A4 PDF (fr/en).

## Setup

1. `sudo snap install typst`
2. `cp data/private.example.yaml data/private.yaml` and fill in the phone number
   (private.yaml is git-ignored — the phone number never enters git).

## Build

- `make` — build `build/CV_JeromeAbel_{en,fr}.pdf` (no phone)
- `make en-phone` / `make fr-phone` — with-phone variants (never synced to the site)
- `make watch` — live rebuild `build/preview.pdf` while editing
- `make check` — verify en/fr YAML structural parity
- `make sync` — copy en+fr PDFs into the portfolio `public/`

Design doc: `jeromeabel.github.io/docs/superpowers/specs/2026-07-18-cv-system-design.md`
```

- [ ] **Step 5: Verify ignore rules, then commit**

```bash
touch data/private.yaml build/x ref/x
git status --short
```

Expected: `data/private.yaml`, `build/`, `ref/` absent from the listing; only `.gitignore`, `README.md` untracked.

```bash
rm data/private.yaml build/x ref/x
git add .gitignore README.md
git commit -m "chore: scaffold repo (gitignore, readme)"
```

---

### Task 2: Seed French content + private phone

**Files:**

- Create: `data/cv.fr.yaml`
- Create: `data/private.example.yaml`
- Create: `data/private.yaml` (git-ignored, by hand)

**Interfaces:**

- Produces: the YAML schema every later task consumes. Top-level keys: `meta {lang, title, updated}`, `profile {name, tagline}` (**no photo key** — reference has no photo), `contact {email, location, website, github, linkedin}` (**no phone key**), `experiences[] {role, org, start, end, summary, bullets[]}` (`end: null` = current), `formations[] {title, note, org, start, end}` (`note` optional, e.g. `"(niveau 6)"`/`"(RNCP II)"` — own section, matching the reference's FORMATIONS column, not folded into experiences), `skills[] {group, items[]}`, `languages[] {name, level}`, `interests[]` (flat string list). `private.yaml` shape: `{phone: "<string>"}`.

- [ ] **Step 1: Write `data/cv.fr.yaml`** — content transcribed verbatim from the June 2026 SVG:

```yaml
meta:
  lang: fr
  title: "Ingénieur Front-End"
  updated: 2026-07-18

profile:
  name: "Jérôme Abel"
  tagline: >-
    Ingénieur Front-End avec plus de dix ans d'expérience en créations
    multimédias interactives, j'allie créativité et collaboration pour
    concevoir des solutions innovantes, centrées sur l'expérience
    utilisateur et la qualité logicielle.

contact:
  email: dev@jeromeabel.net
  location: "La Rochelle, périphérie & télétravail"
  website: dev.jeromeabel.net
  github: jeromeabel
  linkedin: jerome-abel

experiences:
  - role: "Ingénieur Front-End"
    org: "Uhlive"
    start: 2025 # VERIFY in Step 3 — About timeline on the site says 2024
    end: null
    summary: "Développement front-end de la Web App (appels téléphoniques) — Vue.js :"
    bullets:
      - "Amélioration des performances Web de 4 à 2,5 secondes"
      - "Modernisation majeure de l'interface avec un nouveau Design System"
      - "Ajout de systèmes modulaires pour les préférences des utilisateurs"
      - "Dynamisation de la culture Product Design (Figma, prototypes, tests, reviews)"
      - "Automatisation du workflow de développement avec les assistants I.A."
  - role: "Développeur Web"
    org: "Raccourci Agency"
    start: 2024
    end: 2025
    summary: "Amélioration des outils internes de l'agence — Vue.js, Kotlin, Node.js, SQL :"
    bullets:
      - "Amélioration de la création des devis avec des modèles personnalisables"
      - "Refonte complète de l'export PDF des devis, complexité réduite de 50%"
      - "Fiabilisation et cohérence des données de comptes clients (scripts)"
      - "Ajout de modules Odoo dans du code legacy (Python 2.7, Odoo 8)"
      - "Augmentation de la délivrabilité de 86% à 95% des emails des clients"
  - role: "Développeur mobile"
    org: "YooHelp"
    start: 2023
    end: 2023
    summary: "Développement de l'application mobile YooHelp avec React Native :"
    bullets:
      - "Conception d'un environnement monorepo mobile et web avec NX"
      - "Rédaction de documentation technique, cahiers des charges et modélisations"
  - role: "Artiste multimédia"
    org: "Freelance"
    start: 2018
    end: 2022
    summary: "Prototypage logiciel et matériel pour la création audiovisuelle :"
    bullets:
      - "Développer un programme de tracking vidéo avec C++/OpenCV"
      - "Créer une application desktop avec Node, Web Sockets et WebGL"
      - "Créer un site Web performant et responsive avec Hugo"
      - "Créer des scripts de télémaintenance 7j/7 en Shell, CRON et Syslog"
  - role: "Développeur multimédia"
    org: "Freelance & Reso-nance Numérique"
    start: 2010
    end: 2018
    summary: "Créations numériques et communauté D.I.Y. à Marseille :"
    bullets:
      - "Développer un framework de création multimédia, téléchargé 5000 fois"
      - "Accompagner 100 projets dans le Fablab LFO et les écoles d'art"
      - "Former 1000 étudiants et élèves aux technologies d'interaction"
      - "Création de robots interactifs présentés 15 fois en France et à l'étranger"
      - "Développer des fonctionnalités Web en PHP, Ajax et SQLITE"
      - "Développer un plug-in VST de spatialisation sonore"

skills:
  - group: "Langages"
    items: ["JavaScript", "TypeScript", "React / Vue", "HTML / CSS"]
  - group: "Méthodes"
    items: ["Agiles", "UML", "ARIA", "WebVitals"]
  - group: "Systèmes"
    items: ["Linux", "Arduino", "Réseaux"]
  - group: "Outils"
    items: ["Git", "Figma", "VS Code", "Claude Code"]
  - group: "Soft skills"
    items: ["Créativité", "Esprit d'équipe", "Polyvalence", "Autonomie"]

languages:
  - { name: "Français", level: "natif" }
  - { name: "Anglais", level: "B2" }

formations:
  - title: "Développeur concepteur logiciel Javascript - React"
    note: "(niveau 6)"
    org: "OpenClassrooms"
    start: 2022
    end: 2023
  - title: "Concepteur-architecte informatique option système et réseaux"
    note: "(RNCP II)"
    org: "CNAM - Paris"
    start: 2005
    end: 2010
  - title: "Certificat d'études d'arts plastiques"
    org: "École nationale des Beaux-Arts de Lyon"
    start: 1999
    end: 2002

interests:
  [
    "Dessins",
    "Guitare",
    "Arts contemporains",
    "Construction métallique",
    "Sciences",
  ]
```

- [ ] **Step 2: Write `data/private.example.yaml`** (committed template) and the real `data/private.yaml`

```yaml
# data/private.example.yaml — copy to data/private.yaml (git-ignored) and fill in.
phone: "+33 X XX XX XX XX"
```

```bash
cp data/private.example.yaml data/private.yaml
```

Then edit `data/private.yaml` with the real number from the reference SVG's CONTACT block (open `~/Documents/personal/cv/CV_JeromeAbel-20260611.pdf` to read it). Do not put it anywhere else.

- [ ] **Step 3: Verify content against the reference PDF**

Open `~/Documents/personal/cv/CV_JeromeAbel-20260611.pdf`. Check every experience block against the YAML: **dates first** (the SVG's text order made date↔job association ambiguous during transcription — in particular Uhlive start 2024 vs 2025, and the YooHelp/Raccourci ranges), then bullets-to-job grouping, then skills columns, then the **FORMATIONS** column (right side, below CONTACT) against the new `formations` entries, then **CENTRES D'INTÉRÊT** against `interests`. Fix the YAML wherever the PDF disagrees. If the Uhlive start year ends up ≠ 2024, note it — the portfolio's `AboutTimeline.astro` says "2024 · Frontend @ uhlive" and one of the two is wrong.

- [ ] **Step 4: Verify YAML parses**

```bash
python3 -c "import yaml; d = yaml.safe_load(open('data/cv.fr.yaml')); print(len(d['experiences']), 'experiences,', len(d['formations']), 'formations,', len(d['skills']), 'skill groups,', len(d['interests']), 'interests')"
```

Expected: `5 experiences, 3 formations, 5 skill groups, 5 interests`. If `import yaml` fails: `sudo apt install python3-yaml`.

- [ ] **Step 5: Verify private.yaml still ignored, then commit**

```bash
git status --short
```

Expected: `data/cv.fr.yaml` and `data/private.example.yaml` untracked; **no `data/private.yaml`**.

```bash
git add data/cv.fr.yaml data/private.example.yaml
git commit -m "feat: seed French CV content from 2026-06 reference"
```

---

### Task 3: Minimal render — header + profile

**Files:**

- Create: `main.typ`
- Create: `template.typ`

**Interfaces:**

- Consumes: Task 2's YAML schema; `data/private.yaml` `{phone}`.
- Produces: `template.typ` exporting `cv(data, phone: none, underlay: none)` and internal helpers `strings`, `t(key, lang)`, `header(data, phone)` (no photo). `main.typ` reading `sys.inputs` `lang` (`en|fr`, default `fr`), `phone` (`"true"|"false"`, default `"false"`), `underlay` (`"true"|"false"`, default `"false"`). Task 4 extends `template.typ`; Task 5 uses the `underlay` input; the Makefile (Task 7) calls `main.typ` with these exact input names.

- [ ] **Step 1: Write `main.typ`**

```typ
#import "template.typ": cv

#let lang = sys.inputs.at("lang", default: "fr")
#assert(lang == "en" or lang == "fr", message: "lang must be en or fr")
#let with-phone = sys.inputs.at("phone", default: "false") == "true"
#let with-underlay = sys.inputs.at("underlay", default: "false") == "true"

#let data = yaml("data/cv." + lang + ".yaml")
#let private = yaml("data/private.yaml")

#cv(
  data,
  phone: if with-phone { private.phone } else { none },
  underlay: if with-underlay { "ref/underlay-faded.png" } else { none },
)
```

- [ ] **Step 2: Write `template.typ`** (header + profile only; sections come in Task 4)

```typ
// All template-owned strings, localized. Content strings live in data/*.yaml.
#let strings = (
  experience: (fr: "Expérience", en: "Experience"),
  formations: (fr: "Formations", en: "Education"),
  skills: (fr: "Compétences", en: "Skills"),
  languages: (fr: "Langues", en: "Languages"),
  interests: (fr: "Centres d'intérêt", en: "Interests"),
  present: (fr: "aujourd'hui", en: "present"),
)
#let t(key, lang) = strings.at(key).at(lang)

#let header(data, phone) = {
  let c = data.contact
  text(size: 20pt, weight: "bold", tracking: 1pt, upper(data.profile.name))
  linebreak()
  text(size: 12pt, tracking: 2pt, upper(data.meta.title))
  v(0.4em)
  text(size: 9pt)[
    #c.email #h(0.8em) #c.website #h(0.8em) git/#c.github #h(0.8em) in/#c.linkedin
    #linebreak()
    #c.location
    #if phone != none [ #h(0.8em) #phone ]
  ]
}

#let cv(data, phone: none, underlay: none) = {
  let lang = data.meta.lang
  set document(title: "CV — " + data.profile.name, author: data.profile.name)
  set page(paper: "a4", margin: (x: 1.4cm, y: 1.2cm))
  set text(font: "Inter", size: 10pt, lang: lang)

  if underlay != none {
    place(top + left, dx: -1.4cm, dy: -1.2cm,
      image(underlay, width: 21cm, height: 29.7cm))
  }

  header(data, phone)
  v(0.6em)
  emph(data.profile.tagline)
}
```

- [ ] **Step 3: Compile and check**

```bash
cd ~/code/projects/cv
typst compile main.typ build/test.pdf
xdg-open build/test.pdf
```

Expected: exit 0; A4 page with name, title, contact row (no phone), italic profile paragraph. Then the phone variant:

```bash
typst compile main.typ build/test-phone.pdf --input phone=true
```

Expected: same page, phone number appended to the contact block.

- [ ] **Step 4: Verify Inter weights render** (variable-font check)

```bash
typst fonts | grep -i inter
```

Expected: `Inter` listed. In `build/test.pdf`, the name must be visibly **bold** vs the body text. If bold does not render (variable-font weight issue), vendor static weights:

```bash
mkdir -p assets/fonts && cd assets/fonts
wget -q https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip
unzip -j Inter-4.1.zip "extras/ttf/Inter-Regular.ttf" "extras/ttf/Inter-Medium.ttf" "extras/ttf/Inter-Bold.ttf" "extras/ttf/Inter-Italic.ttf"
rm Inter-4.1.zip && cd ../..
typst compile main.typ build/test.pdf --font-path assets/fonts
```

If the fallback is needed, every later `typst` command gains `--font-path assets/fonts` (the Task 7 Makefile has a variable for it) — and commit `assets/fonts/` (Inter is OFL-licensed; redistribution fine).

- [ ] **Step 5: Commit**

```bash
git add main.typ template.typ
git commit -m "feat: minimal Typst render — header, contact, profile"
```

---

### Task 4: Full template — sections, experiences, skills, languages

**Files:**

- Modify: `template.typ`

**Interfaces:**

- Consumes: Task 2 schema, Task 3 helpers (`strings`, `t`, `header`).
- Produces: complete one-page render from `cv(data, phone: none, underlay: none)` — helpers `dates(e, lang)`, `section(title, body)`, `experience-entry(e, lang)`, `formation-entry(f, lang)`, `skills-grid(skills)`. Task 5 only tunes numbers (sizes, margins, spacing) inside these functions; Task 6 reuses them unchanged for English.

- [ ] **Step 1: Add helpers to `template.typ`** (below `header`, above `cv`)

```typ
#let dates(e, lang) = {
  let end = if e.end == none { t("present", lang) } else { str(e.end) }
  if str(e.start) == end { str(e.start) } else { str(e.start) + " — " + end }
}

#let section(title, body) = {
  v(0.7em)
  text(size: 11pt, weight: "bold", tracking: 1.5pt, upper(title))
  v(-0.5em)
  line(length: 100%, stroke: 0.5pt + gray)
  body
}

#let experience-entry(e, lang) = block(breakable: false, below: 0.7em)[
  #grid(
    columns: (1fr, auto),
    text(weight: "bold")[#e.role — #e.org],
    text(size: 9pt, fill: gray.darken(30%), dates(e, lang)),
  )
  #emph(text(size: 9pt, e.summary))
  #list(tight: true, marker: [–], ..e.bullets.map(b => text(size: 9pt, b)))
]

#let formation-entry(f, lang) = block(breakable: false, below: 0.5em)[
  #grid(
    columns: (1fr, auto),
    text(weight: "bold")[#f.title #if "note" in f [ #text(size: 9pt, f.note)]],
    text(size: 9pt, fill: gray.darken(30%), dates(f, lang)),
  )
  #text(size: 9pt, f.org)
]

#let skills-grid(skills) = grid(
  columns: (1fr,) * skills.len(),
  column-gutter: 0.8em,
  ..skills.map(g => [
    #text(weight: "bold", size: 8pt, tracking: 1pt, upper(g.group))
    #linebreak()
    #text(size: 9pt, g.items.join([#linebreak()]))
  ])
)
```

- [ ] **Step 2: Extend `cv()`** — append after the `emph(data.profile.tagline)` line:

```typ
  section(t("experience", lang),
    data.experiences.map(e => experience-entry(e, lang)).join())

  section(t("formations", lang),
    data.formations.map(f => formation-entry(f, lang)).join())

  section(t("skills", lang), skills-grid(data.skills))

  section(t("languages", lang),
    data.languages.map(l => [#l.name (#l.level)]).join([ · ]))

  section(t("interests", lang), data.interests.join(", "))
```

- [ ] **Step 3: Compile and check**

```bash
typst compile main.typ build/test.pdf && xdg-open build/test.pdf
```

Expected: exit 0. All 5 experiences with date ranges (Uhlive shows `2025 — aujourd'hui`), 3 formations entries, 5 skill columns, languages line, interests line. Content may overflow to 2 pages — that is Task 5's problem, not a failure here. What must be correct now: every YAML field appears, bullets under the right job, no missing-key compile errors.

- [ ] **Step 4: Commit**

```bash
git add template.typ
git commit -m "feat: full template — experiences, skills, languages sections"
```

---

### Task 5: Underlay migration — align layout to the reference, fit one page

**Files:**

- Create: `ref/underlay.png`, `ref/underlay-faded.png` (git-ignored, deleted at the end)
- Modify: `template.typ` (layout numbers; remove underlay code at the end)
- Modify: `main.typ` (remove underlay input at the end)

**Interfaces:**

- Consumes: the `underlay` input wired in Task 3.
- Produces: final one-page layout; `cv(data, phone: none)` signature (underlay param **removed** — Task 6/7 must not reference it).

- [ ] **Step 1: Export the reference to a faded PNG**

```bash
inkscape --export-type=png --export-dpi=150 \
  -o ref/underlay.png ~/Documents/personal/cv/CV_JeromeAbel_20260611.svg
convert ref/underlay.png -alpha set -channel A -evaluate set 30% ref/underlay-faded.png
```

Expected: `ref/underlay-faded.png` exists, ~1240×1754 px, washed-out.

- [ ] **Step 2: Start live preview with underlay**

```bash
typst watch main.typ build/preview.pdf --input underlay=true &
xdg-open build/preview.pdf
```

- [ ] **Step 3: Align section by section** — header → experiences → formations → skills → interests. Edit only numbers in `template.typ` (margins, `text(size: …)`, `v(…)`, gutters) until the new layout sits on the old one by eye and **everything fits one A4 page**. The goal is familiar proportions, not pixel identity — where the old CV's spacing was a hand-alignment artifact, prefer the cleaner reflowed result. If one page is tight, drop bullet font to 8.5pt and `block(below: 0.5em)` before shrinking anything in the header.

- [ ] **Step 4: Remove the underlay — no trace remains**

In `template.typ`: delete the `underlay: none` param and the `if underlay != none { … }` block. In `main.typ`: delete the `with-underlay` line and the `underlay:` argument. Then:

```bash
kill %1
rm ref/underlay.png ref/underlay-faded.png
typst compile main.typ build/test.pdf
grep -rn underlay main.typ template.typ || echo CLEAN
```

Expected: compile exit 0; `CLEAN`.

- [ ] **Step 5: Final visual check + commit**

Open `build/test.pdf` next to the reference PDF: one page, same overall structure, all content present, readable at print size.

```bash
git add main.typ template.typ
git commit -m "feat: align layout to 2026-06 reference, fit one page"
```

---

### Task 6: English translation + structural parity check

**Files:**

- Create: `data/cv.en.yaml`
- Create: `tools/check-parity.py`

**Interfaces:**

- Consumes: Task 2 schema (identical shape, translated values).
- Produces: `tools/check-parity.py` (exit 0 = identical structure, exit 1 + drift listing) — wired as `make check` in Task 7.

- [ ] **Step 1: Write `data/cv.en.yaml`** — same structure as `cv.fr.yaml`, translated. **If Step 3 of Task 2 changed dates/bullets in the French file, mirror those fixes here.** Seed translation:

```yaml
meta:
  lang: en
  title: "Front-End Engineer"
  updated: 2026-07-18

profile:
  name: "Jérôme Abel"
  tagline: >-
    Front-End Engineer with over ten years of experience in interactive
    multimedia creation, combining creativity and collaboration to build
    innovative solutions focused on user experience and software quality.

contact:
  email: dev@jeromeabel.net
  location: "La Rochelle, France — hybrid/remote"
  website: dev.jeromeabel.net
  github: jeromeabel
  linkedin: jerome-abel

experiences:
  - role: "Front-End Engineer"
    org: "Uhlive"
    start: 2025 # keep in sync with the verified French file
    end: null
    summary: "Front-end development of the web app (phone calls) — Vue.js:"
    bullets:
      - "Improved web performance from 4 to 2.5 seconds"
      - "Major UI modernization with a new Design System"
      - "Added modular systems for user preferences"
      - "Energized the Product Design culture (Figma, prototypes, tests, reviews)"
      - "Automated the development workflow with AI assistants"
  - role: "Web Developer"
    org: "Raccourci Agency"
    start: 2024
    end: 2025
    summary: "Improved the agency's internal tools — Vue.js, Kotlin, Node.js, SQL:"
    bullets:
      - "Improved quote creation with customizable templates"
      - "Full rework of the quote PDF export, complexity cut by 50%"
      - "Made client account data reliable and consistent (scripts)"
      - "Added Odoo modules to legacy code (Python 2.7, Odoo 8)"
      - "Raised client email deliverability from 86% to 95%"
  - role: "Mobile Developer"
    org: "YooHelp"
    start: 2023
    end: 2023
    summary: "Development of the YooHelp mobile app with React Native:"
    bullets:
      - "Designed a mobile + web monorepo environment with NX"
      - "Wrote technical documentation, specifications and models"
  - role: "Multimedia Artist"
    org: "Freelance"
    start: 2018
    end: 2022
    summary: "Software and hardware prototyping for audiovisual creation:"
    bullets:
      - "Built a video-tracking program with C++/OpenCV"
      - "Built a desktop app with Node, WebSockets and WebGL"
      - "Built a fast, responsive website with Hugo"
      - "Wrote 24/7 remote-maintenance scripts in Shell, CRON and Syslog"
  - role: "Multimedia Developer"
    org: "Freelance & Reso-nance Numérique"
    start: 2010
    end: 2018
    summary: "Digital creation and D.I.Y. community in Marseille:"
    bullets:
      - "Built a multimedia creation framework, downloaded 5000 times"
      - "Supported 100 projects in the LFO Fablab and art schools"
      - "Trained 1000 students in interaction technologies"
      - "Created interactive robots shown 15 times in France and abroad"
      - "Built web features in PHP, Ajax and SQLite"
      - "Built a VST plug-in for sound spatialization"

skills:
  - group: "Languages"
    items: ["JavaScript", "TypeScript", "React / Vue", "HTML / CSS"]
  - group: "Methods"
    items: ["Agile", "UML", "ARIA", "WebVitals"]
  - group: "Systems"
    items: ["Linux", "Arduino", "Networks"]
  - group: "Tools"
    items: ["Git", "Figma", "VS Code", "Claude Code"]
  - group: "Soft skills"
    items: ["Creativity", "Team spirit", "Versatility", "Autonomy"]

languages:
  - { name: "French", level: "native" }
  - { name: "English", level: "B2" }

formations:
  - title: "Software Engineer, Javascript - React"
    note: "(level 6)"
    org: "OpenClassrooms"
    start: 2022
    end: 2023
  - title: "IT Systems & Network Architect"
    note: "(RNCP II)"
    org: "CNAM - Paris"
    start: 2005
    end: 2010
  - title: "Certificate in Fine Arts"
    org: "École nationale des Beaux-Arts de Lyon"
    start: 1999
    end: 2002

interests: ["Drawing", "Guitar", "Contemporary art", "Metalworking", "Science"]
```

- [ ] **Step 2: Write `tools/check-parity.py`**

```python
#!/usr/bin/env python3
"""Fail if cv.en.yaml and cv.fr.yaml differ in structure (keys or array lengths)."""
import sys
import yaml


def shape(node, path="$"):
    if isinstance(node, dict):
        out = []
        for key, value in sorted(node.items()):
            out += shape(value, f"{path}.{key}")
        return out
    if isinstance(node, list):
        out = [f"{path}[len={len(node)}]"]
        for i, value in enumerate(node):
            out += shape(value, f"{path}[{i}]")
        return out
    return [path]


def load(lang):
    with open(f"data/cv.{lang}.yaml") as f:
        data = yaml.safe_load(f)
    # meta.lang legitimately differs; everything else must mirror
    data["meta"].pop("lang", None)
    return set(shape(data))


drift = load("en") ^ load("fr")
if drift:
    print("STRUCTURE DRIFT between cv.en.yaml and cv.fr.yaml:")
    for entry in sorted(drift):
        print(" ", entry)
    sys.exit(1)
print("OK: en/fr structurally identical")
```

- [ ] **Step 3: Run the parity check — expect it to pass**

```bash
python3 tools/check-parity.py
```

Expected: `OK: en/fr structurally identical`. If drift is listed, fix the YAML (usually a missing bullet) and rerun.

- [ ] **Step 4: Compile English and check localization**

```bash
typst compile main.typ build/test-en.pdf --input lang=en && xdg-open build/test-en.pdf
```

Expected: exit 0; section headings **EXPERIENCE / EDUCATION / SKILLS / LANGUAGES / INTERESTS**; Uhlive dates read `2025 — present`; still one page. Also verify the bad-input guard:

```bash
typst compile main.typ build/x.pdf --input lang=de; echo "exit=$?"
```

Expected: compile error containing `lang must be en or fr`, `exit=1`.

- [ ] **Step 5: Commit**

```bash
git add data/cv.en.yaml tools/check-parity.py
git commit -m "feat: English translation + en/fr structural parity check"
```

---

### Task 7: Makefile + site sync

**Files:**

- Create: `~/code/projects/cv/Makefile`
- Modify: `~/code/projects/jeromeabel.github.io/public/CV_JeromeAbel_en.pdf` (overwrite), add `public/CV_JeromeAbel_fr.pdf`

**Interfaces:**

- Consumes: `main.typ` inputs (`lang`, `phone`), `tools/check-parity.py`.
- Produces: `make` / `make check` / `make sync` as the repo's public interface (documented in the Task 1 README). The portfolio's About page (`AboutText.astro`, `href="/CV_JeromeAbel_en.pdf"`) serves the new PDF without any site change.

- [ ] **Step 1: Write `Makefile`** — recipe lines MUST start with a TAB. `FONTS` stays empty unless Task 3's static-font fallback was needed (then `FONTS = --font-path assets/fonts`).

```make
FONTS =
SITE_PUBLIC = $(HOME)/code/projects/jeromeabel.github.io/public

all: en fr

en:
	typst compile main.typ build/CV_JeromeAbel_en.pdf --input lang=en --input phone=false $(FONTS)

fr:
	typst compile main.typ build/CV_JeromeAbel_fr.pdf --input lang=fr --input phone=false $(FONTS)

# with-phone variants: built on demand, never synced to the site
en-phone:
	typst compile main.typ build/CV_JeromeAbel_en_phone.pdf --input lang=en --input phone=true $(FONTS)

fr-phone:
	typst compile main.typ build/CV_JeromeAbel_fr_phone.pdf --input lang=fr --input phone=true $(FONTS)

watch:
	typst watch main.typ build/preview.pdf --input lang=fr --input phone=false $(FONTS)

check:
	python3 tools/check-parity.py

sync: check en fr
	cp build/CV_JeromeAbel_en.pdf build/CV_JeromeAbel_fr.pdf $(SITE_PUBLIC)/

.PHONY: all en fr en-phone fr-phone watch check sync
```

- [ ] **Step 2: Verify all targets**

```bash
cd ~/code/projects/cv
make          # expect: both compiles exit 0
make check    # expect: OK: en/fr structurally identical
make en-phone # expect: build/CV_JeromeAbel_en_phone.pdf, phone visible in it
ls -la build/
```

Expected: `CV_JeromeAbel_en.pdf`, `CV_JeromeAbel_fr.pdf`, `CV_JeromeAbel_en_phone.pdf` present.

- [ ] **Step 3: Sync to the portfolio and verify the site serves it**

```bash
make sync
ls -la ~/code/projects/jeromeabel.github.io/public/ | grep CV
```

Expected: `CV_JeromeAbel_en.pdf` (today's date, no longer the old 86.9K file) and `CV_JeromeAbel_fr.pdf`. Then, in the portfolio repo:

```bash
cd ~/code/projects/jeromeabel.github.io
pnpm dev &
sleep 5
curl -sI http://localhost:4321/CV_JeromeAbel_en.pdf | head -3
kill %1
```

Expected: `HTTP/1.1 200`, `content-type: application/pdf`. Open the About page and click _Download CV_ for a final human check — the PDF must be the new Typst render, phone-free.

- [ ] **Step 4: Commit both repos**

```bash
cd ~/code/projects/cv
git add Makefile
git commit -m "feat: Makefile — build, check, phone variants, site sync"
```

Portfolio repo: the new/updated PDFs in `public/` are working-tree changes on the current branch (`feat/seniority-update`) — commit them with that branch's flow (do not create a separate branch just for the PDFs):

```bash
cd ~/code/projects/jeromeabel.github.io
git add public/CV_JeromeAbel_en.pdf public/CV_JeromeAbel_fr.pdf
git commit -m "content(about): new Typst-built CV PDFs (en + fr)"
```

- [ ] **Step 5: Wrap-up checks (from the design doc's open questions)**

- If Task 2 Step 3 found the Uhlive start year ≠ 2024, flag the discrepancy with `AboutTimeline.astro` ("2024 · Frontend @ uhlive") to the user — do not silently edit the site.
- The site button still links only the EN PDF; the FR PDF is reachable by URL only. A language toggle on the button is explicitly out of scope for v1 (design §6).
- tinymist (Typst LSP) is an editor nicety, not a build dependency — install it in the editor if wanted; nothing in this plan depends on it.
