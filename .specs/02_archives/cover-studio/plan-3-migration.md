# Cover Studio Plan 3 — Migration & Blog Retirement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `pnpm migrate collect` populates the originals library from the blog; `pnpm export` writes generated covers + the frontmatter settings contract back into the blog (dry-run first); the blog's `images/scripts/` studio is retired in a final blog-side commit.

**Architecture:** Two CLI commands in cover-studio (`src/cli/migrate.mjs`, subcommands `collect` and `export`). Export is the ONLY code that writes into the blog repo — it is the best-tested part (design §5): pure plan-builder functions with unit tests, then a thin applier. Retirement happens last, gated on design §7 exit criteria, as a commit in the blog repo.

**Tech Stack:** Node ≥ 20, vitest, Plan-1 lib (`scanContent`, `resolveSettings`, `loadIllustration`, `loadCrops`, `SETTINGS`).

## Global Constraints

- Export writes/overwrites ONLY `cover.gen.png` and the `img:` + `illustration:` frontmatter of exported entries — **never deletes any file, never touches `img_preview:` lines** (they keep pointing at their current files).
- Export naming is fixed: `cover.gen.png` (design §4 — marks generated origin, never clobbers hand-made files, no frontmatter churn on re-export).
- Frontmatter settings contract (design §2): export emits the entry's _resolved effective_ settings so the blog owns everything its future step-2 build needs. Cover-studio `data/` is never a blog build input.
- `collect` must skip `*.gen.png` referenced images (idempotence after export — generated covers are not "originals").
- Old hand-made cover files stay in place (design §6); deleting them is a later manual decision.
- Blog retirement only after: determinism gate passed (Plan 1), studio fully working (Plan 2 exit), collect + export verified (Tasks 1–3 here).
- `library/` is convenience, not archive: the durable backup of hand-made covers is blog git history. The retirement commit removes code/data only — never cover images.

## File Structure

```
cover-studio:
├── src/cli/migrate.mjs        # Task 1 (collect) + Task 2/3 (export)
├── src/cli/migrate.test.mjs   # Tasks 1–2
├── library/                   # Task 1 output (gitignored): <slug>/<original>, manifest.json
└── package.json               # scripts: migrate, export

blog (Task 4 retirement commit only):
├── images/scripts/            # deleted (studio, lib, cli, checks)
├── images/illustration.json   # deleted (lives in cover-studio/data/)
├── images/crops.json          # deleted (same)
├── package.json               # illustrate/crop/studio scripts removed
└── CLAUDE.md                  # Illustration Lab section rewritten to point at cover-studio
```

---

### Task 1: `migrate collect` — originals library

**Files:**

- Create: `src/cli/migrate.mjs`, `src/cli/migrate.test.mjs`
- Modify: `package.json` (`"migrate": "node src/cli/migrate.mjs"`)

**Interfaces:**

- Consumes: `scanContent(blogRoot)` (Plan 1 — `[{ slug, img }]` where `img` is the absolute path from the entry's `img:`/`img_preview:` frontmatter, or null), `loadConfig()`.
- Produces: `library/<slug>/<basename>` copies + `library/manifest.json`: `Record<slug, { source: string, file: string, collection: "post"|"work"|"serie", collectedAt: string }>` (`source` = blog-absolute path, `file` = basename in library). Pure planner exported for tests: `collectPlan(entries, blogRoot)` → `{ copies: [{ slug, from, to, collection }], skipped: [{ slug, reason }] }`.

- [ ] **Step 1: Write failing planner tests**

`src/cli/migrate.test.mjs`:

```js
import { test, expect } from "vitest";
import { collectPlan } from "./migrate.mjs";

const BR = "/blog";
test("collect copies originals, derives collection from path", () => {
  const entries = [
    { slug: "a", img: `${BR}/src/content/post/a/photo.jpg` },
    { slug: "w", img: `${BR}/src/content/work/w/shot.png` },
  ];
  const p = collectPlan(entries, BR);
  expect(p.copies).toEqual([
    {
      slug: "a",
      from: `${BR}/src/content/post/a/photo.jpg`,
      to: "a/photo.jpg",
      collection: "post",
    },
    {
      slug: "w",
      from: `${BR}/src/content/work/w/shot.png`,
      to: "w/shot.png",
      collection: "work",
    },
  ]);
});

test("collect skips entries without img and generated covers", () => {
  const p = collectPlan(
    [
      { slug: "none", img: null },
      { slug: "gen", img: `${BR}/src/content/post/gen/cover.gen.png` },
    ],
    BR,
  );
  expect(p.copies).toEqual([]);
  expect(p.skipped).toEqual([
    { slug: "none", reason: "no img" },
    { slug: "gen", reason: "generated cover" },
  ]);
});
```

- [ ] **Step 2: Run to verify FAIL** (`migrate.mjs` missing).

- [ ] **Step 3: Implement**

`collectPlan`: collection = path segment after `src/content/` (`post`/`work`/`serie`); skip `img === null` (`"no img"`) and `basename.endsWith(".gen.png")` (`"generated cover"`); `to = `${slug}/${basename(img)}``.

CLI `collect` command: run planner over `scanContent(cfg.blogRoot)`, `mkdir -p` + `copyFile` each (skip copy if destination exists with same size — re-runs cheap), write `library/manifest.json` with `collectedAt: new Date().toISOString()`, print summary `collected N, skipped M (reasons)`.

- [ ] **Step 4: Run tests, then run for real**

`pnpm test` → PASS. Then `pnpm migrate collect` → library populated; spot-check: `ls library | wc -l` ≈ number of entries with covers; `cat library/manifest.json | head`. Re-run → same result, no errors (idempotent).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate collect — originals library + manifest"
```

---

### Task 2: Export planner — naming, frontmatter rewrite, settings block (pure functions + tests)

**Files:**

- Modify: `src/cli/migrate.mjs`, `src/cli/migrate.test.mjs`

**Interfaces:**

- Consumes: `library/manifest.json` (collection lookup), `resolveSettings`, `loadIllustration`, `SETTINGS`, render outputs in `out/review/` (cover-size file per slug × style: filename per `styles.mjs` naming, e.g. `<slug>_dither-mesh_cover.png`).
- Produces pure functions (Task 3's applier and `--dry-run` both consume these):
  - `exportSettingsBlock(slug, illustration, settings)` → plain object for the `illustration:` YAML block — the frontmatter contract: `{ style, seed, accent, mix: { opacity, blend }, mesh: { …effective settings.mesh cfg…, blobs? } }`, all values from `resolveSettings(slug, illustration, SETTINGS).effective` (style/seed/accent/mix from `effective`, mesh cfg from `effective.settings.mesh`, `blobs` only when materialized in `effective.mesh.blobs`). Omit `accent`/`mix` keys when null.
  - `rewriteFrontmatter(md, coverRel, block)` → new markdown string: `img:` line replaced with `img: ${coverRel}`; any existing `illustration:` block (that key through the last more-indented line) replaced; new `illustration:` block inserted before the closing `---`; **everything else byte-identical, `img_preview:` untouched**.
  - `exportPlan(slugs, styleBySlug, ctx)` → `[{ slug, copyFrom, copyTo, mdPath, frontmatterDiff }]` + `errors: [{ slug, reason }]` (`"no rendered cover for style X"`, `"no style chosen"`, `"unknown collection"`).

- [ ] **Step 1: Write failing tests**

Append to `migrate.test.mjs`:

```js
import { exportSettingsBlock, rewriteFrontmatter } from "./migrate.mjs";
import { SETTINGS } from "../server/lib/settings.mjs";

test("settings block carries resolved effective values", () => {
  const ill = {
    types: {},
    images: { s: { style: "photo-mesh", mesh: { blur: 101 } } },
  };
  const b = exportSettingsBlock("s", ill, SETTINGS);
  expect(b.style).toBe("photo-mesh");
  expect(b.seed).toBe("s"); // seed defaults to slug
  expect(b.mesh.blur).toBe(101); // image override resolved in
  expect(b.mesh.blobs).toBeUndefined(); // not materialized
  expect(b.accent).toBeUndefined(); // null omitted
});

const MD = `---
title: "Post"
img: ./old-cover.png
img_preview: ./preview.png
tags: [a]
---

Body stays.
`;

test("rewriteFrontmatter swaps img, adds illustration block, leaves the rest", () => {
  const out = rewriteFrontmatter(MD, "./cover.gen.png", {
    style: "dither",
    seed: "s",
  });
  expect(out).toContain("img: ./cover.gen.png");
  expect(out).not.toContain("old-cover");
  expect(out).toContain("img_preview: ./preview.png"); // untouched
  expect(out).toContain("illustration:\n  style: dither\n  seed: s");
  expect(out).toContain('title: "Post"');
  expect(out.endsWith("Body stays.\n")).toBe(true);
});

test("rewrite is idempotent — second run replaces, not duplicates", () => {
  const once = rewriteFrontmatter(MD, "./cover.gen.png", {
    style: "dither",
    seed: "s",
  });
  const twice = rewriteFrontmatter(once, "./cover.gen.png", {
    style: "riso",
    seed: "s",
  });
  expect(twice.match(/illustration:/g)).toHaveLength(1);
  expect(twice).toContain("style: riso");
});
```

- [ ] **Step 2: Run to verify FAIL.**

- [ ] **Step 3: Implement the three functions**

- `exportSettingsBlock`: call `resolveSettings`; build the object; strip `null`/`undefined` keys.
- `rewriteFrontmatter`: split on the first two `---` fence lines; within the frontmatter body operate line-wise: replace the `^img:` line; drop an existing `illustration:` block (`^illustration:` line plus following lines matching `/^\s+/`); serialize the new block with a tiny YAML emitter (2-space indent, quote strings containing `:` or `#`, inline `blobs` as a list of `{ cx, cy, … }` maps — write the emitter by hand, ~20 lines; no yaml dependency) and append before the closing fence.
- `exportPlan`: for each slug — chosen style from `illustration.images[slug].style` (error `"no style chosen"` if absent), rendered cover at `out/review/<slug>_<style…>_cover.png` (**check the actual filename pattern in `styles.mjs` `file()` entries for the chosen style — duotone-style names embed the accent — reuse the same naming helper the manifest uses rather than re-deriving**; error if file missing), `mdPath` = `<blogRoot>/src/content/<collection>/<slug>/index.md` (collection from library manifest; error `"unknown collection"` when the slug isn't in it), `copyTo` = same dir + `cover.gen.png`.

- [ ] **Step 4: Run tests** — `pnpm test` PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: export planner — settings block + frontmatter rewrite (pure, tested)"
```

---

### Task 3: Export applier + `--dry-run` + real-entry verification

**Files:**

- Modify: `src/cli/migrate.mjs`, `package.json` (`"export": "node src/cli/migrate.mjs export"`)

**Interfaces:**

- Consumes: Task 2 planner.
- Produces: `pnpm export [--slugs a,b] [--dry-run]`. Dry-run prints per entry: copy line (`out/... → src/content/.../cover.gen.png`), the exact frontmatter diff (old `img:` line → new, the `illustration:` block to be written), and all errors — writes NOTHING. Apply mode executes the plan: `copyFile`, write rewritten markdown; prints summary. Errors never abort other entries.

- [ ] **Step 1: Wire the CLI**

`export` subcommand: default slugs = every entry in `illustration.images` (tuned entries); `--slugs` filters. Build plan → dry-run prints it; apply mode: for each plan item, `copyFile(copyFrom, copyTo)` then `writeFileSync(mdPath, rewriteFrontmatter(readFileSync(mdPath), "./cover.gen.png", block))`. Guard: refuse to run if `git -C <blogRoot> status --porcelain -- src/content` shows changes to a target `index.md` (don't stack onto uncommitted edits); `--force` overrides.

- [ ] **Step 2: Dry-run against the 2 real tuned entries (design §7 exit criterion)**

```bash
pnpm render                      # ensure cover-size outputs exist
pnpm export --dry-run
```

Expected: a correct plan for `adding-likes-to-a-static-astro-site` and `api-endpoints-with-astro` — right collection paths, right rendered source files, frontmatter diff showing `img:` swap + `illustration:` block containing (for the first) 4 materialized blobs, (for the second) `mesh.blur: 101`. Fix planner until the printed plan is right.

- [ ] **Step 3: Apply for real and inspect**

```bash
pnpm export
cd $BLOG && git diff --stat && git diff src/content
```

Expected per entry: 1 new `cover.gen.png`, `index.md` diff = `img:` line + `illustration:` block only; old cover file still present; `img_preview:` untouched. Blog builds clean: `cd $BLOG && pnpm build`. **Leave these blog changes uncommitted or commit them blog-side as `feat: generated covers for tuned entries` — user's call at review; ask at checkpoint.**

Re-run `pnpm export` → binary-identical results, no frontmatter churn (idempotence). Re-run `pnpm migrate collect` → tuned entries now skipped as `"generated cover"`, library originals untouched.

- [ ] **Step 4: Commit (cover-studio side)**

```bash
git add -A && git commit -m "feat: export apply + dry-run with git-clean guard"
```

---

### Task 4: Blog retirement commit

**Files (all in blog repo `~/code/projects/jeromeabel.github.io`, branch `redesign/v3`):**

- Delete: `images/scripts/` (entire tree: `studio.mjs`, `studio/`, `lib/`, `checks/`, `illustrate.mjs`, `settings.mjs`, `legacy/`, `README.md` — keep `transform_thumbnail.sh` ONLY if still referenced elsewhere; grep first), `images/illustration.json`, `images/crops.json`
- Modify: `package.json` (remove `illustrate`, `illustrate:sheet`, `crop`, `studio` scripts), `CLAUDE.md` (Illustration Lab section)

**GATE — verify before touching anything (design §7):** Plan 1 determinism passed; Plan 2 `pnpm dev` full studio working; Task 3 export verified. If any is unmet, stop.

- [ ] **Step 1: Reference sweep**

```bash
cd $BLOG
grep -rn "images/scripts\|illustration.json\|crops.json\|illustrate" --include="*.{json,md,mjs,ts,astro,sh}" . | grep -v node_modules | grep -v .specs
```

Every hit must be either a file being deleted or a doc line being updated in this task. Anything else (e.g. a `src/` import — there should be none; design: "nothing in src/ changes until step-1 exit") = stop and resolve first.

- [ ] **Step 2: Delete + update**

```bash
git rm -r images/scripts images/illustration.json images/crops.json
```

`package.json`: remove the studio-related scripts. `CLAUDE.md`: replace the "Illustration Lab" section body with:

```markdown
## Illustration Lab

Cover/thumbnail generation moved to the standalone studio at
`~/code/projects/cover-studio` (Vue app; `pnpm dev` there). It reads this
repo's content frontmatter and writes back `cover.gen.png` + `illustration:`
frontmatter via `pnpm export`. Spec: `.specs/01_active/cover-studio/design.md`.
```

- [ ] **Step 3: Verify blog still builds**

Run: `pnpm build` in the blog. Expected: clean build (nothing in `src/` referenced the scripts).

- [ ] **Step 4: Commit (blog side)**

```bash
git add -A
git commit -m "chore: retire images/scripts studio — superseded by cover-studio repo

Pipeline, data files and studio UI live in ~/code/projects/cover-studio.
Hand-made cover images intentionally untouched (design §6)."
```

- [ ] **Step 5: Archive the spec**

When the user confirms v3 batch needs are met: `./.specs/specs.sh archive cover-studio` (blog repo). This is the user's call — flag it at the final checkpoint, don't run it unprompted.

---

## Exit criteria (plan 3 = design §7 completion)

- `library/` populated by `pnpm migrate collect`; re-runs idempotent, generated covers skipped.
- `pnpm export --dry-run` correct for the 2 tuned entries; apply verified: `cover.gen.png` + `img:` + `illustration:` block only, blog builds.
- Blog `images/scripts/` + data files removed in a blog-side commit; blog build green.
