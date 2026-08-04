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
./.specs/specs.sh new <slug> ["title"]   # create a backlog stub
./.specs/specs.sh activate <slug>          # backlog → active
./.specs/specs.sh archive <slug>           # active → archives (stamps shipped:)
./.specs/specs.sh index                    # regenerate INDEX.md
```

`new`, `activate`, and `archive` regenerate `INDEX.md` automatically.
