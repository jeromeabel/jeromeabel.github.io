# Specs System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat `docs/superpowers/{specs,plans}` files with a single git-tracked specs system under `docs/specs/` — lifecycle folders, a dependency-free bash helper, and a generated INDEX dashboard.

**Architecture:** Status is encoded as folder location. Numbered prefixes (`00_backlog` → `01_active` → `02_archives`) sort in lifecycle order. One bash script (`specs.sh`) does all state transitions with `git mv` and regenerates `INDEX.md` after every change, so the dashboard never drifts. INDEX is a pure folder scan — link text is the slug (matching the design's examples), artifact labels come from the files present in each topic folder.

**Tech Stack:** Bash (`set -euo pipefail`), `git`, `awk`, `grep`, `date` — no external dependencies. Markdown for all artifacts.

## Global Constraints

- `specs.sh` is pure bash + coreutils + git — no other dependencies. Every command starts `set -euo pipefail`.
- **Status = folder location.** There is no `status:` frontmatter field.
- Slugs are kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), **no date prefixes**. Dates live in frontmatter: `created:` on creation, `shipped:` stamped by `archive`.
- `INDEX.md` is **generated only** — never hand-edited. Link text is the **slug** verbatim (per design examples, lines 76-84 of the design doc).
- `specs.sh` resolves its own directory (`docs/specs/`) so it works from any CWD.
- The one-time migration uses plain `mv` + `git add -A` (robust for tracked **and** untracked files — `docs/superpowers/plans/2026-07-18-ui-refinements-v2.md` is untracked). `specs.sh`'s own `activate`/`archive` use `git mv` because they only ever act on committed files.
- Commit after every task.

**Deviation from design (recorded):** The design (line 87) says "titles read from frontmatter," but both INDEX examples (lines 76-84) use the **slug** as link text. Slugs are always present and stable, so INDEX uses the slug — no frontmatter-title parsing. This also means migration is pure `mv` with no per-file frontmatter editing. `title:`/`created:` frontmatter is still written into new stubs as human-readable metadata.

---

### Task 1: Scaffold `docs/specs/` skeleton + conventions file

Creates the folder structure, the conventions `CLAUDE.md`, and `.gitkeep` placeholders so the empty lifecycle folders are tracked. `docs/specs/` already exists and holds one legacy file (`2026-05-07-api-endpoints-blog-and-playground-design.md`) — leave it untouched here; Task 6 migrates it.

**Files:**

- Create: `docs/specs/CLAUDE.md`
- Create: `docs/specs/00_backlog/.gitkeep`
- Create: `docs/specs/01_active/.gitkeep`
- Create: `docs/specs/02_archives/.gitkeep`

**Interfaces:**

- Consumes: nothing.
- Produces: the directory layout `docs/specs/{00_backlog,01_active,02_archives}/` that Task 2's `specs.sh` scans, and `SPECS_DIR = docs/specs/`.

- [ ] **Step 1: Create the folders and placeholders**

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
mkdir -p docs/specs/00_backlog docs/specs/01_active docs/specs/02_archives
touch docs/specs/00_backlog/.gitkeep docs/specs/01_active/.gitkeep docs/specs/02_archives/.gitkeep
```

- [ ] **Step 2: Write the conventions file**

Create `docs/specs/CLAUDE.md`:

````markdown
# Specs — conventions

Project ideas and their design/plan artifacts live here. **Status = folder location.**

## Folders

- `00_backlog/` — ideas not started. Either a single `<slug>.md` stub or, if it already has a design, a `<slug>/` folder.
- `01_active/` — in-flight work. `<slug>/` holding `design.md` + `plan.md` (plus `notes.md` / `spec.md` as needed).
- `02_archives/` — shipped topics, same folder shape.

## Rules

- Slugs are kebab-case, no date prefixes (`flashless-dark-mode`, not `2026-07-18-flashless-dark-mode`).
- Dates live in frontmatter: `created:` always; `shipped:` is added by `specs.sh archive`.
- `INDEX.md` is generated — never hand-edit it.

## Helper

```
./docs/specs/specs.sh new <slug> ["title"]   # create a backlog stub
./docs/specs/specs.sh activate <slug>          # backlog → active
./docs/specs/specs.sh archive <slug>           # active → archives (stamps shipped:)
./docs/specs/specs.sh index                    # regenerate INDEX.md
```

`new`, `activate`, and `archive` regenerate `INDEX.md` automatically.
````

- [ ] **Step 3: Verify the structure**

Run: `find docs/specs -type d | sort`
Expected output (order may vary):

```
docs/specs
docs/specs/00_backlog
docs/specs/01_active
docs/specs/02_archives
```

- [ ] **Step 4: Commit**

```bash
git add docs/specs/CLAUDE.md docs/specs/00_backlog/.gitkeep docs/specs/01_active/.gitkeep docs/specs/02_archives/.gitkeep
git commit -m "feat(specs): scaffold docs/specs lifecycle folders + conventions"
```

---

### Task 2: `specs.sh` — helpers + `index` command

Creates the executable with shared helpers and the `index` command. On an empty structure, INDEX shows `_none_` under each section.

**Files:**

- Create: `docs/specs/specs.sh`
- Create: `docs/specs/INDEX.md` (generated by running the script)

**Interfaces:**

- Consumes: the folder layout from Task 1.
- Produces: `specs.sh` with functions `die`, `valid_slug`, `artifacts`, `shipped_date`, `stamp_shipped`, `cmd_index`, and a `case` dispatcher. Later tasks add `cmd_new`, `cmd_activate`, `cmd_archive` and their dispatch cases. `cmd_index` writes `docs/specs/INDEX.md`.

- [ ] **Step 1: Write the failing smoke test**

Run (before the file exists): `bash docs/specs/specs.sh index`
Expected: FAIL with `bash: docs/specs/specs.sh: No such file or directory`.

- [ ] **Step 2: Write `specs.sh` with helpers + `index`**

Create `docs/specs/specs.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Resolve the directory this script lives in — the specs root.
SPECS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKLOG="$SPECS_DIR/00_backlog"
ACTIVE="$SPECS_DIR/01_active"
ARCHIVES="$SPECS_DIR/02_archives"
INDEX="$SPECS_DIR/INDEX.md"

die() { echo "specs.sh: $*" >&2; exit 1; }

valid_slug() {
  [[ "$1" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || die "invalid slug '$1' (use kebab-case: a-z 0-9 -)"
}

# Comma-joined list of artifact files present in a topic folder.
artifacts() {
  local dir="$1" a labels=()
  for a in design plan notes spec; do
    [[ -f "$dir/$a.md" ]] && labels+=("$a")
  done
  local IFS=,
  echo "${labels[*]}"
}

# Print the `shipped:` frontmatter value from a folder's design.md/spec.md (empty if none).
shipped_date() {
  local dir="$1" f
  for f in "$dir/design.md" "$dir/spec.md"; do
    if [[ -f "$f" ]]; then
      awk -F': *' '/^shipped:/ { print $2; exit }' "$f"
      return
    fi
  done
}

# Insert `shipped: <today>` into a file's frontmatter (creating a block if absent).
stamp_shipped() {
  local f="$1" today
  today="$(date +%F)"
  grep -q '^shipped:' "$f" && return 0
  if head -1 "$f" | grep -qx -- '---'; then
    awk -v d="$today" 'NR==1 && $0=="---" { print; print "shipped: " d; next } { print }' \
      "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  else
    { echo "---"; echo "shipped: $today"; echo "---"; echo; cat "$f"; } > "$f.tmp" && mv "$f.tmp" "$f"
  fi
}

cmd_index() {
  {
    echo "# Specs Index"
    echo
    echo "_Generated by specs.sh — do not edit by hand._"
    echo
    echo "## Active"
    if compgen -G "$ACTIVE/*/" >/dev/null; then
      for d in "$ACTIVE"/*/; do
        d="${d%/}"; local slug; slug="$(basename "$d")"
        echo "- [$slug](01_active/$slug/) — $(artifacts "$d")"
      done
    else
      echo "_none_"
    fi
    echo
    echo "## Backlog"
    local any=0
    if compgen -G "$BACKLOG/*/" >/dev/null; then
      for d in "$BACKLOG"/*/; do
        d="${d%/}"; local slug; slug="$(basename "$d")"
        echo "- [$slug](00_backlog/$slug/) — $(artifacts "$d")"
        any=1
      done
    fi
    if compgen -G "$BACKLOG/*.md" >/dev/null; then
      for f in "$BACKLOG"/*.md; do
        local slug; slug="$(basename "$f" .md)"
        echo "- [$slug](00_backlog/$slug.md)"
        any=1
      done
    fi
    [[ $any -eq 0 ]] && echo "_none_"
    echo
    echo "## Done"
    if compgen -G "$ARCHIVES/*/" >/dev/null; then
      for d in "$ARCHIVES"/*/; do
        d="${d%/}"; local slug sd; slug="$(basename "$d")"; sd="$(shipped_date "$d")"
        if [[ -n "$sd" ]]; then
          echo "- [$slug](02_archives/$slug/) — shipped $sd"
        else
          echo "- [$slug](02_archives/$slug/) — $(artifacts "$d")"
        fi
      done
    else
      echo "_none_"
    fi
  } > "$INDEX"
  echo "Wrote $INDEX"
}

case "${1:-}" in
  index) cmd_index ;;
  *)     die "usage: specs.sh {new|activate|archive|index}" ;;
esac
```

- [ ] **Step 3: Make it executable and run `index`**

```bash
chmod +x docs/specs/specs.sh
./docs/specs/specs.sh index
```

Expected: `Wrote /home/jabel/code/projects/jeromeabel.github.io/docs/specs/INDEX.md`

- [ ] **Step 4: Verify the generated INDEX**

Run: `cat docs/specs/INDEX.md`
Expected:

```
# Specs Index

_Generated by specs.sh — do not edit by hand._

## Active
_none_

## Backlog
_none_

## Done
_none_
```

- [ ] **Step 5: Commit**

```bash
git add docs/specs/specs.sh docs/specs/INDEX.md
git commit -m "feat(specs): add specs.sh with index command"
```

---

### Task 3: `specs.sh` — `new` command

Adds `new <slug> ["title"]`: creates a backlog stub from a template and refuses to clobber an existing slug in any lifecycle folder.

**Files:**

- Modify: `docs/specs/specs.sh` (add `cmd_new`, add `new` dispatch case)

**Interfaces:**

- Consumes: `valid_slug`, `cmd_index`, `BACKLOG`/`ACTIVE`/`ARCHIVES` from Task 2.
- Produces: `cmd_new <slug> [title]` → writes `00_backlog/<slug>.md`, then calls `cmd_index`.

- [ ] **Step 1: Verify the command fails before implementation**

Run: `./docs/specs/specs.sh new zz-smoke-test`
Expected: FAIL with `specs.sh: usage: specs.sh {new|activate|archive|index}` (exit 1) — `new` isn't dispatched yet.

- [ ] **Step 2: Add `cmd_new`**

In `docs/specs/specs.sh`, insert this function immediately **before** the `case "${1:-}"` block:

```bash
cmd_new() {
  local slug="${1:-}" title="${2:-}"
  [[ -n "$slug" ]] || die 'usage: specs.sh new <slug> ["title"]'
  valid_slug "$slug"
  [[ -e "$BACKLOG/$slug.md" || -e "$BACKLOG/$slug" || -e "$ACTIVE/$slug" || -e "$ARCHIVES/$slug" ]] \
    && die "slug '$slug' already exists"
  [[ -n "$title" ]] || title="$(echo "$slug" | tr '-' ' ')"
  mkdir -p "$BACKLOG"
  cat > "$BACKLOG/$slug.md" <<EOF
---
title: $title
created: $(date +%F)
---

<what>. <why>.
Ref:
Size: S
EOF
  echo "Created $BACKLOG/$slug.md"
  cmd_index
}
```

- [ ] **Step 3: Add the dispatch case**

In the `case "${1:-}"` block, add a `new` case above `index`:

```bash
  new)   shift; cmd_new "$@" ;;
  index) cmd_index ;;
```

- [ ] **Step 4: Run it and verify the stub + INDEX**

```bash
./docs/specs/specs.sh new zz-smoke-test "Smoke test"
cat docs/specs/00_backlog/zz-smoke-test.md
```

Expected file contents:

```
---
title: Smoke test
created: 2026-07-18
---

<what>. <why>.
Ref:
Size: S
```

Run: `grep zz-smoke-test docs/specs/INDEX.md`
Expected: `- [zz-smoke-test](00_backlog/zz-smoke-test.md)`

- [ ] **Step 5: Verify the guardrails**

```bash
./docs/specs/specs.sh new zz-smoke-test 2>&1 || true    # duplicate
./docs/specs/specs.sh new "Bad Slug" 2>&1 || true        # invalid
```

Expected:

```
specs.sh: slug 'zz-smoke-test' already exists
specs.sh: invalid slug 'Bad Slug' (use kebab-case: a-z 0-9 -)
```

- [ ] **Step 6: Clean up the smoke-test artifact and commit**

```bash
rm docs/specs/00_backlog/zz-smoke-test.md
./docs/specs/specs.sh index
git add docs/specs/specs.sh docs/specs/INDEX.md
git commit -m "feat(specs): add 'new' command"
```

---

### Task 4: `specs.sh` — `activate` command

Adds `activate <slug>`: moves a backlog entry into `01_active/`. Handles both a single-file stub (`<slug>.md` → `01_active/<slug>/spec.md`) and a backlog folder (`<slug>/` → `01_active/<slug>/`).

**Files:**

- Modify: `docs/specs/specs.sh` (add `cmd_activate`, add `activate` dispatch case)

**Interfaces:**

- Consumes: `die`, `cmd_index`, `BACKLOG`/`ACTIVE` from Task 2.
- Produces: `cmd_activate <slug>` → `git mv` backlog entry into `01_active/<slug>/`, then calls `cmd_index`.

- [ ] **Step 1: Verify the command fails before implementation**

Run: `./docs/specs/specs.sh activate zz-smoke-test`
Expected: FAIL with `specs.sh: usage: specs.sh {new|activate|archive|index}` (exit 1).

- [ ] **Step 2: Add `cmd_activate`**

In `docs/specs/specs.sh`, insert immediately **before** the `case "${1:-}"` block:

```bash
cmd_activate() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || die "usage: specs.sh activate <slug>"
  [[ -e "$ACTIVE/$slug" ]] && die "'$slug' is already active"
  mkdir -p "$ACTIVE"
  if [[ -f "$BACKLOG/$slug.md" ]]; then
    mkdir -p "$ACTIVE/$slug"
    git mv "$BACKLOG/$slug.md" "$ACTIVE/$slug/spec.md"
  elif [[ -d "$BACKLOG/$slug" ]]; then
    git mv "$BACKLOG/$slug" "$ACTIVE/$slug"
  else
    die "no backlog entry '$slug' (looked for $BACKLOG/$slug.md and $BACKLOG/$slug/)"
  fi
  echo "Activated $slug"
  cmd_index
}
```

- [ ] **Step 3: Add the dispatch case**

In the `case` block, add above `index`:

```bash
  activate) shift; cmd_activate "$@" ;;
```

- [ ] **Step 4: Test the full stub→active flow**

`activate` uses `git mv`, so the stub must be committed first.

```bash
./docs/specs/specs.sh new zz-smoke-test "Smoke test"
git add docs/specs/00_backlog/zz-smoke-test.md docs/specs/INDEX.md
git commit -m "chore: temp smoke stub"
./docs/specs/specs.sh activate zz-smoke-test
```

Expected: prints `Activated zz-smoke-test` then `Wrote .../INDEX.md`.
Run: `test -f docs/specs/01_active/zz-smoke-test/spec.md && echo OK`
Expected: `OK`
Run: `grep zz-smoke-test docs/specs/INDEX.md`
Expected: `- [zz-smoke-test](01_active/zz-smoke-test/) — spec`

- [ ] **Step 5: Clean up and commit the code**

```bash
git rm -r docs/specs/01_active/zz-smoke-test
./docs/specs/specs.sh index
git add docs/specs/specs.sh docs/specs/INDEX.md
git commit -m "feat(specs): add 'activate' command"
```

(This commit also removes the temp stub committed in Step 4.)

---

### Task 5: `specs.sh` — `archive` command

Adds `archive <slug>`: moves an active topic into `02_archives/` and stamps `shipped:` into its `design.md`/`spec.md` frontmatter.

**Files:**

- Modify: `docs/specs/specs.sh` (add `cmd_archive`, add `archive` dispatch case)

**Interfaces:**

- Consumes: `die`, `stamp_shipped`, `cmd_index`, `ACTIVE`/`ARCHIVES` from Task 2.
- Produces: `cmd_archive <slug>` → `git mv` active folder into `02_archives/<slug>/`, stamps `shipped:`, then calls `cmd_index`.

- [ ] **Step 1: Verify the command fails before implementation**

Run: `./docs/specs/specs.sh archive zz-smoke-test`
Expected: FAIL with `specs.sh: usage: specs.sh {new|activate|archive|index}` (exit 1).

- [ ] **Step 2: Add `cmd_archive`**

In `docs/specs/specs.sh`, insert immediately **before** the `case "${1:-}"` block:

```bash
cmd_archive() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || die "usage: specs.sh archive <slug>"
  [[ -d "$ACTIVE/$slug" ]] || die "no active entry '$slug'"
  [[ -e "$ARCHIVES/$slug" ]] && die "'$slug' is already archived"
  mkdir -p "$ARCHIVES"
  git mv "$ACTIVE/$slug" "$ARCHIVES/$slug"
  local f target=""
  for f in "$ARCHIVES/$slug/design.md" "$ARCHIVES/$slug/spec.md"; do
    [[ -f "$f" ]] && { target="$f"; break; }
  done
  [[ -n "$target" ]] && stamp_shipped "$target"
  echo "Archived $slug"
  cmd_index
}
```

- [ ] **Step 3: Add the dispatch case**

In the `case` block, add above `index`:

```bash
  archive) shift; cmd_archive "$@" ;;
```

- [ ] **Step 4: Test the full lifecycle new→activate→archive**

```bash
./docs/specs/specs.sh new zz-smoke-test "Smoke test"
git add docs/specs/00_backlog/zz-smoke-test.md docs/specs/INDEX.md
git commit -m "chore: temp smoke stub"
./docs/specs/specs.sh activate zz-smoke-test
# a spec.md exists but no design.md/spec.md-stamp target rules: spec.md is a stamp target
./docs/specs/specs.sh archive zz-smoke-test
```

Expected final output: `Archived zz-smoke-test` then `Wrote .../INDEX.md`.
Run: `head -3 docs/specs/02_archives/zz-smoke-test/spec.md`
Expected (date = today):

```
---
shipped: 2026-07-18
title: Smoke test
```

Run: `grep zz-smoke-test docs/specs/INDEX.md`
Expected: `- [zz-smoke-test](02_archives/zz-smoke-test/) — shipped 2026-07-18`

- [ ] **Step 5: Clean up and commit the code**

```bash
git rm -r docs/specs/02_archives/zz-smoke-test
./docs/specs/specs.sh index
git add docs/specs/specs.sh docs/specs/INDEX.md
git commit -m "feat(specs): add 'archive' command with shipped: stamping"
```

---

### Task 6: Migrate existing designs & plans into lifecycle folders

Moves all existing `docs/superpowers/{specs,plans}` files and the two legacy `api-endpoints` files into the new structure, classified by actual status. Deletes the emptied old directories. Removes the `.gitkeep` placeholders now that folders hold content. Regenerates INDEX.

**Classification** (confirmed with the user):

- **Active:** `seniority-update`, `ui-refinements-v2`, `specs-system` (this work — archived on merge via `specs.sh archive`).
- **Archives:** `home-writing-section` (shipped), `api-endpoints-blog-and-playground` (design+plan pair), `site-refinements` (from `site-critique-recommendations` design + `site-refinements` plan — one topic, slug mismatch).
- **Backlog:** `cv-system` (design+plan, separate repo, not started), `illustration-system` (design only), `ux-copy-review-findings` (review notes).

**Files:** moves 15 existing files; deletes `docs/superpowers/`, `docs/plans/`; removes 3 `.gitkeep` files.

> **Note:** This task moves this plan file itself to `docs/specs/01_active/specs-system/plan.md` and its design to `.../design.md`. Remaining tasks (7, 8) do not reference the plan file, so the move is safe. After this task, the plan lives at its new path.

**Interfaces:**

- Consumes: the lifecycle folders (Task 1) and `specs.sh index` (Task 2).
- Produces: populated `00_backlog/`, `01_active/`, `02_archives/` and a regenerated INDEX reflecting all migrated topics.

- [ ] **Step 1: Move the active topics**

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
mkdir -p docs/specs/01_active/seniority-update docs/specs/01_active/ui-refinements-v2 docs/specs/01_active/specs-system
mv docs/superpowers/specs/2026-07-17-seniority-update-design.md   docs/specs/01_active/seniority-update/design.md
mv docs/superpowers/plans/2026-07-17-seniority-update.md          docs/specs/01_active/seniority-update/plan.md
mv docs/superpowers/specs/2026-07-18-ui-refinements-v2-design.md  docs/specs/01_active/ui-refinements-v2/design.md
mv docs/superpowers/plans/2026-07-18-ui-refinements-v2.md         docs/specs/01_active/ui-refinements-v2/plan.md
mv docs/superpowers/specs/2026-07-18-specs-system-design.md       docs/specs/01_active/specs-system/design.md
mv docs/superpowers/plans/2026-07-18-specs-system.md             docs/specs/01_active/specs-system/plan.md
```

- [ ] **Step 2: Move the archived topics**

```bash
mkdir -p docs/specs/02_archives/home-writing-section docs/specs/02_archives/api-endpoints-blog-and-playground docs/specs/02_archives/site-refinements
mv docs/superpowers/specs/2026-07-18-home-writing-section-design.md   docs/specs/02_archives/home-writing-section/design.md
mv docs/superpowers/plans/2026-07-18-home-writing-section.md          docs/specs/02_archives/home-writing-section/plan.md
mv docs/specs/2026-05-07-api-endpoints-blog-and-playground-design.md  docs/specs/02_archives/api-endpoints-blog-and-playground/design.md
mv docs/plans/2026-05-08-api-endpoints-blog-and-playground.md         docs/specs/02_archives/api-endpoints-blog-and-playground/plan.md
mv docs/superpowers/specs/2026-07-18-site-critique-recommendations.md docs/specs/02_archives/site-refinements/design.md
mv docs/superpowers/plans/2026-07-18-site-refinements.md              docs/specs/02_archives/site-refinements/plan.md
```

- [ ] **Step 3: Move the backlog topics**

```bash
mkdir -p docs/specs/00_backlog/cv-system docs/specs/00_backlog/illustration-system docs/specs/00_backlog/ux-copy-review-findings
mv docs/superpowers/specs/2026-07-18-cv-system-design.md          docs/specs/00_backlog/cv-system/design.md
mv docs/superpowers/plans/2026-07-18-cv-system.md                docs/specs/00_backlog/cv-system/plan.md
mv docs/superpowers/specs/2026-07-18-illustration-system-design.md docs/specs/00_backlog/illustration-system/design.md
mv docs/superpowers/specs/2026-07-18-ux-copy-review-findings.md    docs/specs/00_backlog/ux-copy-review-findings/notes.md
```

- [ ] **Step 4: Remove emptied directories and placeholders**

```bash
rm -f docs/specs/00_backlog/.gitkeep docs/specs/01_active/.gitkeep docs/specs/02_archives/.gitkeep
rmdir docs/superpowers/specs docs/superpowers/plans docs/superpowers docs/plans
```

Expected: `rmdir` succeeds silently (dirs are empty). If it errors, an unmigrated file remains — investigate before continuing.

- [ ] **Step 5: Confirm no stray docs remain and regenerate INDEX**

Run: `find docs/superpowers docs/plans -type f 2>/dev/null; ls docs/specs`
Expected: the `find` prints nothing (both dirs gone); `ls docs/specs` shows `00_backlog 01_active 02_archives CLAUDE.md INDEX.md specs.sh`.

```bash
./docs/specs/specs.sh index
cat docs/specs/INDEX.md
```

Expected INDEX (link order within a section may vary):

```
# Specs Index

_Generated by specs.sh — do not edit by hand._

## Active
- [seniority-update](01_active/seniority-update/) — design, plan
- [specs-system](01_active/specs-system/) — design, plan
- [ui-refinements-v2](01_active/ui-refinements-v2/) — design, plan

## Backlog
- [cv-system](00_backlog/cv-system/) — design, plan
- [illustration-system](00_backlog/illustration-system/) — design
- [ux-copy-review-findings](00_backlog/ux-copy-review-findings/) — notes

## Done
- [api-endpoints-blog-and-playground](02_archives/api-endpoints-blog-and-playground/) — design, plan
- [home-writing-section](02_archives/home-writing-section/) — design, plan
- [site-refinements](02_archives/site-refinements/) — design, plan
```

(Archived topics show artifact labels, not a `shipped` date — they were migrated directly, never through `archive`. That's expected; future ships get stamped.)

- [ ] **Step 6: Stage everything and commit**

```bash
git add -A docs/
git status --short docs/
git commit -m "refactor(specs): migrate specs/plans into docs/specs lifecycle folders"
```

Expected in `git status --short`: renames (`R`) for tracked files, one add (`A`) for the previously-untracked `ui-refinements-v2` plan, and deletions of the old directory paths.

---

### Task 7: Seed the backlog with idea stubs

Creates the six backlog idea stubs named in the design (line 95) using `specs.sh new`, then hand-edits each stub's body with real one-liners. INDEX is regenerated by `new` automatically; the final commit captures the edited bodies.

**Files:** creates `docs/specs/00_backlog/{flashless-dark-mode,home-animation-toggle,blog-toc,contact-images-animation,work-about-blog,blog-v2-1}.md`.

**Interfaces:**

- Consumes: `specs.sh new` (Task 3).
- Produces: six backlog stubs and an updated INDEX listing them under Backlog.

- [ ] **Step 1: Create the six stubs**

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
./docs/specs/specs.sh new flashless-dark-mode "Flashless dark mode"
./docs/specs/specs.sh new home-animation-toggle "Home animation toggle"
./docs/specs/specs.sh new blog-toc "Blog table of contents"
./docs/specs/specs.sh new contact-images-animation "Contact images animation"
./docs/specs/specs.sh new work-about-blog "Work / About / Blog relationship"
./docs/specs/specs.sh new blog-v2-1 "Blog v2.1"
```

- [ ] **Step 2: Replace each stub body**

Each file was created with the placeholder body `<what>. <why>.\nRef:\nSize: S`. Replace the body (everything after the closing `---` line) of each file, keeping its frontmatter untouched:

`docs/specs/00_backlog/flashless-dark-mode.md` body:

```
Eliminate the dark-mode flash on first paint. Inline a tiny theme script in `<head>` before CSS, reading `localStorage` + `prefers-color-scheme`, so the correct theme is applied before render.
Ref: https://www.vbesse.com/en/blog/flashless-dark-mode
Size: S
```

`docs/specs/00_backlog/home-animation-toggle.md` body:

```
Give visitors control over homepage scroll/reveal animations. Honor `prefers-reduced-motion` by default and add a visible toggle to pause motion. Accessibility + perceived-performance win.
Size: S
```

`docs/specs/00_backlog/blog-toc.md` body:

```
Add a table of contents to long blog posts and series pages. Auto-generated from headings, sticky on desktop, with scroll-spy highlighting the active section.
Size: M
```

`docs/specs/00_backlog/contact-images-animation.md` body:

```
Animate the currently-static contact-page images (subtle entrance / hover motion), consistent with the site's reveal system and `prefers-reduced-motion`.
Size: S
```

`docs/specs/00_backlog/work-about-blog.md` body:

```
Revisit how the Work, About, and Blog sections connect: navigation, cross-linking, and narrative flow between portfolio, bio, and writing.
Size: M
```

`docs/specs/00_backlog/blog-v2-1.md` body:

```
Follow-up refinements after the blog v2 rebuild: polish reading experience, series navigation, and metadata. Scope to be detailed when picked up.
Size: M
```

- [ ] **Step 3: Regenerate INDEX and verify**

```bash
./docs/specs/specs.sh index
grep -A10 '## Backlog' docs/specs/INDEX.md
```

Expected: the Backlog section lists the three migrated folders **and** the six new stubs, e.g.:

```
## Backlog
- [cv-system](00_backlog/cv-system/) — design, plan
- [illustration-system](00_backlog/illustration-system/) — design
- [ux-copy-review-findings](00_backlog/ux-copy-review-findings/) — notes
- [blog-toc](00_backlog/blog-toc.md)
- [blog-v2-1](00_backlog/blog-v2-1.md)
- [contact-images-animation](00_backlog/contact-images-animation.md)
- [flashless-dark-mode](00_backlog/flashless-dark-mode.md)
- [home-animation-toggle](00_backlog/home-animation-toggle.md)
- [work-about-blog](00_backlog/work-about-blog.md)
```

- [ ] **Step 4: Commit**

```bash
git add docs/specs/00_backlog docs/specs/INDEX.md
git commit -m "feat(specs): seed backlog with six idea stubs"
```

---

### Task 8: Wire the specs system into the project CLAUDE.md

Adds a short "Specs & Planning" section to the project `CLAUDE.md` so the brainstorming and writing-plans skills write into `docs/specs/01_active/<slug>/`, and shipped work is archived via `specs.sh`.

**Files:**

- Modify: `CLAUDE.md` (add a new section after "## Architecture", before "## TypeScript")

**Interfaces:**

- Consumes: the shipped specs system (`docs/specs/`, `specs.sh`).
- Produces: documented workflow integration. Terminal deliverable — nothing depends on it.

- [ ] **Step 1: Add the section**

In `CLAUDE.md`, insert this section immediately before the `## TypeScript` heading:

```markdown
## Specs & Planning

Project ideas and their design/plan artifacts live in `docs/specs/`, organized by lifecycle:
`00_backlog/` (ideas) → `01_active/` (in-flight) → `02_archives/` (shipped). **Status is the folder.**
See `docs/specs/CLAUDE.md` for conventions and `docs/specs/INDEX.md` for the current dashboard.

- The **brainstorming** skill writes designs to `docs/specs/01_active/<slug>/design.md`.
- The **writing-plans** skill writes plans to `docs/specs/01_active/<slug>/plan.md`.
- Ship a topic with `./docs/specs/specs.sh archive <slug>` (stamps `shipped:` and updates INDEX).

Both skills honor an explicit user location override.
```

- [ ] **Step 2: Verify placement**

Run: `grep -n -e '## Architecture' -e '## Specs & Planning' -e '## TypeScript' CLAUDE.md`
Expected: three lines in order — `## Architecture`, then `## Specs & Planning`, then `## TypeScript`.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document specs system workflow in CLAUDE.md"
```

---

## Self-Review

**1. Spec coverage** (design doc sections → tasks):

- Structure / lifecycle folders (lines 11-23) → Task 1.
- Naming & metadata, frontmatter (24-38) → `new` template (Task 3); `shipped:` stamping (Task 5). Slug validation in Task 3.
- Backlog entry format (40-53) → `new` template (Task 3) + seeded stubs (Task 7).
- `specs.sh` commands table (55-66) → Tasks 2 (index), 3 (new), 4 (activate), 5 (archive). Auto-index after mutations: each command calls `cmd_index`.
- INDEX.md three sections (68-87) → Task 2 `cmd_index`. **Recorded deviation:** link text is the slug (matching the doc's own examples), not a frontmatter title.
- Migration (89-97) → Task 6, corrected against the real file inventory and the user's confirmed classification. Date-prefix stripping (line 97) happens via the rename to `design.md`/`plan.md`/`notes.md`. The six backlog seeds (line 95) → Task 7.
- Skills integration (99-101) → Task 8.
- Out of scope (103-107) → honored: no sizing columns, no story/research split, no CI validation.

**2. Placeholder scan:** No `TBD`/`TODO`/"handle edge cases"/"similar to Task N" left. Every code and command step contains literal content. (The `<what>. <why>.` string inside the `new` template is intentional stub-template text, and Task 7 Step 2 replaces it in every seeded file.)

**3. Type/name consistency:** Function names are stable across tasks — `die`, `valid_slug`, `artifacts`, `shipped_date`, `stamp_shipped`, `cmd_index`, `cmd_new`, `cmd_activate`, `cmd_archive`. Variables `SPECS_DIR`/`BACKLOG`/`ACTIVE`/`ARCHIVES`/`INDEX` defined once in Task 2 and reused. Dispatch cases (`new`/`activate`/`archive`/`index`) match their `cmd_*` handlers. Artifact filenames (`design.md`/`plan.md`/`notes.md`/`spec.md`) are consistent between `artifacts()`, migration moves, and `activate`/`archive` targets.
