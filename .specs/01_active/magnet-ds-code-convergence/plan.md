# Magnet-DS Naming Convergence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename every `src/` component and `Link` CVA variant to its Magnet-DS canon name, collapse the duplicate row/section components onto one canon component each, archive the retired components, and delete the dead token — with byte-identical rendered output everywhere except one deliberate Home-composition change.

**Architecture:** Pure refactor. Every change is a `git mv` plus an import rewrite, a CVA key rename, or a verbatim markup port — no new markup is authored. Because nothing about the design changes, the gate for each task is that the built site is unchanged: `scripts/dist-snapshot.mjs` (added in Task 0) rebuilds `dist/` and prints all 48 prerendered HTML files with the tokens inside every `class="…"` sorted, so cva-recomposition churn normalises away and only real markup deltas survive a `diff`. Retired components are `git mv`d into `src/components/_retired/<domain>/`, never deleted — the folder gives collisions somewhere to go (canon `BlogPreview` needs the name the legacy `BlogPreview` occupies), gives `grep` one place to look, and makes astrobook self-label the retired set by path.

**Tech Stack:** Astro 5 (`.astro` components, `@components/*` path alias), Tailwind CSS v4 (CSS-native `@theme` in `src/styles/global.css`, no `tailwind.config.js`), `class-variance-authority` for `ui/Link`, astrobook (`*.stories.ts`, dev-only at `/styleguide`), Playwright via `scripts/pixel-check.mjs`, pnpm.

**Spec:** `.specs/01_active/magnet-ds-code-convergence/spec.md` — this plan implements its **"Renames and collapses (design.md §7)"** section plus the two token bullets. The authoritative end state is `.specs/02_archives/magnet-ds-final-state/design.md` §3 (canon master table) and §7 (code-debt list).

## Global Constraints

- **Package manager is pnpm.** No linter is configured; `pnpm format:check` (Prettier) is the style gate.
- **`pnpm test` must report `# pass 57` / `# fail 0`** from Task 0 onward. It is 55/2 at HEAD; Task 0 fixes that.
- **`pnpm figma:verify` must keep printing `_none_` under all four headings** — Missing in Figma, Value mismatch, Orphaned in Figma, Unmapped. That is the state at HEAD; only Task 6 touches anything it reads.
- **Rendered output must not change** in Tasks 0–6. The gate is `node scripts/dist-snapshot.mjs`, taken before and after each task. The single exception is Task 1, whose expected delta is enumerated in the task itself. Task 7 is the one intentional user-visible change and is last so it can be dropped without unpicking anything.
- **Class attribute token *order* may change; the token *set* may not.** `node scripts/dist-snapshot.mjs --classes` prints the sorted unique set of class strings across the built site — it must be byte-identical across every task in this plan, including Task 1.
- **Retired code is archived, never deleted.** `git mv` into `src/components/_retired/<domain>/<Name>.astro`, carrying the sibling `*.stories.ts` with it, and fix the relative-import depth (`../styleguide/…` → `../../styleguide/…`, `../../utils/…` → `../../../utils/…`). `@components/*` / `@assets/*` aliases only change when the *target* moves.
- **`scripts/pixel-manifest.mjs` entries are never deleted — the `id` is a historical key.** A rename repoints `storyPath` (and `selector` if it keys on a renamed attribute); a retirement sets `skip: true` with a `reason`. New coverage may add new ids.
- **Astrobook story URLs derive from the file path and the export name:** `/styleguide/dashboard/src/components/<domain>/<component-kebab>/<export-kebab>`. Renaming a file or an export changes the URL, so every rename touches the manifest.
- **Path aliases:** `@components/*` → `src/components/*`, `@layouts/*`, `@assets/*`. `src/utils/` and `src/content/` are imported by direct relative path (`src/utils/repository`), not by alias.
- **There is no component test framework.** `pnpm test` covers `scripts/figma/*.test.mjs` only. `pnpm pixel-check` is the visual gate: ~13 minutes, no id filter, needs `pnpm dev` running. It is run **once**, in Task 8.
- **Commit after every task.** Run `pnpm format:write` before `git add`.

## Out of scope — deferred, with the reason

Recorded here so a reviewer does not read them as gaps:

- **The three route rebuilds** (`/work` Selected, Home composition, serie landing list) and **`work/WorkCard` catalogue/case + `getFeaturedWorks(limit)`** — spec's own "Route rebuilds — size these apart from the renames" section. `WorkCard.astro` is LEGACY and unimported; the Figma `catalogue`/`case` anatomy has no code counterpart, so there is nothing to rename yet. Owned by `.specs/01_active/work-card-redesign/spec.md`.
- **Archiving `WorkOverlayCard` and `WorkGalleryCard`** — on §7's archive list, but both still render live (`WorkOverlayCard` via the Home work section, `WorkGalleryCard` via `work.astro:42`). Archiving them requires the route rebuilds above.
- **Wiring `PostList` / `SerieList` into `blog.astro`** — the second half of §7's row-collapse bullet. `blog.astro` groups posts into year buckets that `PostList` has no notion of, so adopting it would silently drop the year rail: a route-composition decision, not a rename. Task 4 does the half that *is* naming — both wrappers adopt their canon children — and leaves them unwired.
- **Extracting `app/NavLink`** — §7 says `menuActive`/`menuInactive` "express NavLink states". `NavLink` is a Figma-only atom (📎, inline markup in code), so pulling those two out of `Link`'s CVA is a component split, not a rename. Both keys stay in `Link` unchanged.
- **`ArchiveTable` row hover** (`hover:bg-surface/50` vs the flat token) — blocked on the Figma-side decision to add `2 Theme::color/surface-subtle`.
- **`WorkCard.astro:34,42`** hover verbs, `duration-1000`, `scale-105` — the file is a rebuild target, not a rename target.
- **Everything under the spec's "Responsive", "Tooling", and "Figma-side leftovers" headings** — each needs a design decision or Figma-side work first.
- **The breadcrumb `menuInactive` question** — recorded as "Not debt" at R3.1: `ui/Link/menuInactive` never existed in Figma and both breadcrumbs correctly fall back to `textLink` there. No code change.

---

### Task 0: Preflight — restore the test suite and add the refactor gate

`pnpm test` is 55 pass / 2 fail at HEAD. Both failures are `scripts/figma/build-brief.test.mjs`, because R3.6 archived `magnet-ds-final-state` and `BRIEF_DIR` still points into `.specs/01_active/`. Every later task uses `pnpm test` as a gate, so it has to be green first. This task also adds the build-output diff tool the rest of the plan leans on.

**Files:**

- Modify: `scripts/figma/build-brief.mjs:3` (header comment), `scripts/figma/build-brief.mjs:17` (`BRIEF_DIR`)
- Modify: `scripts/figma/README.md:153`
- Create: `scripts/dist-snapshot.mjs`

**Interfaces:**

- Consumes: nothing.
- Produces: `node scripts/dist-snapshot.mjs` → normalised HTML dump of `dist/` on stdout; `node scripts/dist-snapshot.mjs --classes` → sorted unique class-string set on stdout. Both are used as before/after gates by Tasks 1–7.

- [ ] **Step 1: Reproduce the two failures**

```bash
pnpm test 2>&1 | tail -8
```

Expected: `# pass 55`, `# fail 2`. The two failing names are `resolves a real brief by task id with no markers left behind` (`error: unknown task \`P2-T04\``) and `--list reports every brief with its task id` (`1 !== 34`).

- [ ] **Step 2: Confirm where the briefs actually live**

```bash
ls .specs/02_archives/magnet-ds-final-state/figma/*.md | grep -v '/_' | wc -l
```

Expected: `34` — matching the `assert.equal(lines.length, 34)` in `build-brief.test.mjs:72`. (`_run-rules.md` is the 35th file; `briefs()` filters names starting with `_`.)

- [ ] **Step 3: Repoint `BRIEF_DIR`**

In `scripts/figma/build-brief.mjs`, line 17:

```js
const BRIEF_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.specs/02_archives/magnet-ds-final-state/figma",
);
```

And line 3 of the header comment:

```js
// into a Figma agent. Briefs under .specs/02_archives/magnet-ds-final-state/figma/
```

- [ ] **Step 4: Fix the same stale path in the README**

`scripts/figma/README.md:153` — change `.specs/01_active/magnet-ds-final-state/figma/` to `.specs/02_archives/magnet-ds-final-state/figma/`.

- [ ] **Step 5: Run the tests**

```bash
pnpm test 2>&1 | tail -8
```

Expected: `# pass 57`, `# fail 0`.

- [ ] **Step 6: Sanity-check the CLI itself**

```bash
pnpm figma:brief --list | wc -l
pnpm figma:brief P2-T04 | head -3
```

Expected: `34`, and a brief body that starts with markdown (no `<!-- include` markers left).

- [ ] **Step 7: Add the refactor gate**

Create `scripts/dist-snapshot.mjs`:

```js
#!/usr/bin/env node
// dist-snapshot.mjs — build-output gate for pure refactors.
//
// Default mode prints every prerendered HTML file under dist/ with the tokens
// inside each class="…" sorted, so a snapshot taken before a refactor diffs
// cleanly against one taken after: class-order churn (cva recomposition,
// utility reordering) normalises away and only real markup deltas survive.
//
// `--classes` prints the sorted unique set of class strings instead — the
// tightest invariant for a rename: if no class token was added or dropped
// anywhere on the site, this output is byte-identical.
//
// Usage:
//   pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
//   …edit…
//   pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
//   diff /tmp/dist-before.txt /tmp/dist-after.txt
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CLASS_ATTR = /class="([^"]*)"/g;
const sortTokens = (c) => c.trim().split(/\s+/).filter(Boolean).sort().join(" ");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? walk(path)
      : path.endsWith(".html")
        ? [path]
        : [];
  });

const files = walk("dist").sort();

if (process.argv.includes("--classes")) {
  const seen = new Set();
  for (const path of files)
    for (const [, cls] of readFileSync(path, "utf8").matchAll(CLASS_ATTR))
      seen.add(sortTokens(cls));
  for (const cls of [...seen].sort()) console.log(cls);
} else {
  for (const path of files) {
    const html = readFileSync(path, "utf8").replace(
      CLASS_ATTR,
      (_, cls) => `class="${sortTokens(cls)}"`,
    );
    console.log(`--- ${path}\n${html}`);
  }
}
```

- [ ] **Step 8: Prove the gate is deterministic**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/snap-a.txt
pnpm build && node scripts/dist-snapshot.mjs > /tmp/snap-b.txt
diff /tmp/snap-a.txt /tmp/snap-b.txt && echo "DETERMINISTIC"
wc -l /tmp/snap-a.txt
node scripts/dist-snapshot.mjs --classes | wc -l
```

Expected: `DETERMINISTIC`, `7724 /tmp/snap-a.txt`, `201`. (The two counts are the HEAD baseline; they will move as later tasks add or drop markup — Task 1 must keep both exactly.)

- [ ] **Step 9: Commit**

```bash
pnpm format:write
git add scripts/figma/build-brief.mjs scripts/figma/README.md scripts/dist-snapshot.mjs
git commit -m "fix(figma): repoint build-brief at the archived brief dir; add dist-snapshot gate

BRIEF_DIR still pointed at .specs/01_active/magnet-ds-final-state/figma,
which R3.6 moved to 02_archives — build-brief.test.mjs has been failing
2/57 ever since. Adds scripts/dist-snapshot.mjs, a class-order-normalised
dump of dist/ used as the before/after gate for the naming convergence."
```

---

### Task 1: `ui/Link` CVA vocabulary

design.md §3 fixes the canon `ui/Link` sub-sets at six: `primary` · `secondary` · `external` · `inline` · `textLink` · `iconOnly` (`size=normal|small`). §7 gives the mapping: `cta→primary`, `icon→iconOnly`, `iconSmall→iconOnly size=small`, `default→inline`, `bold→textLink`. `secondary` and `external` already carry canon names. `menuActive`/`menuInactive` stay untouched (see "Out of scope").

`iconSmall` folding into `iconOnly size=small` is the only structural change: the CVA gains a `size` axis and the shared `iconOnly` chrome moves to the variant while the dimensions move to `compoundVariants`. The class *tokens* are re-partitioned, not changed — the multiset is identical, which is why `--classes` must stay byte-identical.

Call-site census at HEAD (`grep -rn 'variant="' src/`): `secondary` ×11 · `icon` ×6 · `menuInactive` ×5 · `external` ×5 · `iconSmall` ×1 (`ui/SocialShare.astro:53`) · `bold` ×1 (`contact/ContactText.astro:16`) · `cta` ×0 · `default` ×0 explicit (it is the destructuring default). `menuActive` appears only dynamically, via `app/Header.astro:21-22`.

**Files:**

- Modify: `src/components/ui/Link.astro:6-50` (CVA, Props, destructuring, `showLabel`, the `<a>` attributes)
- Modify: `src/components/ui/Link.stories.ts` (export names + args)
- Modify: `src/components/hero/HeroSocials.astro:10,16,22` (`icon` → `iconOnly`)
- Modify: `src/components/contact/ContactText.astro:16` (`bold` → `textLink`), `:28,34,41` (`icon` → `iconOnly`)
- Modify: `src/components/ui/SocialShare.astro:53` (`iconSmall` → `iconOnly` + `size="small"`)
- Modify: `scripts/pixel-manifest.mjs:433-452` (`ui-link--default`, `ui-link--cta`, `ui-link--iconbutton`) and add one new entry

**Interfaces:**

- Consumes: `node scripts/dist-snapshot.mjs` from Task 0.
- Produces: `ui/Link` props `{ label?: string; variant?: "menuActive"|"menuInactive"|"inline"|"textLink"|"primary"|"iconOnly"|"secondary"|"external"; size?: "normal"|"small"; icon?: string }` extending `HTMLAttributes<"a">`. Defaults: `variant="inline"`, `size="normal"`. Rendered `<a>` carries `data-variant={variant}` always and `data-size={size}` only when `variant === "iconOnly"`. Task 2 renames files that pass `variant="external"` / `variant="secondary"` / `variant="menuInactive"` — those keys are unchanged by this task.

- [ ] **Step 1: Take the baseline snapshot**

```bash
pnpm build
node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
node scripts/dist-snapshot.mjs --classes > /tmp/classes-before.txt
```

- [ ] **Step 2: Rewrite the CVA block and the frontmatter**

Replace `src/components/ui/Link.astro` lines 6–50 with:

```ts
const linkVariants = cva("transition-colors", {
  variants: {
    variant: {
      menuActive: "text-foreground underline underline-offset-8",
      menuInactive: "text-foreground-muted hover:text-foreground",
      inline:
        "relative inline-flex items-center border-dashed border-current border-b max-w-fit hover:border-solid hover:text-foreground after:absolute after:-inset-y-2 after:-inset-x-1 after:content-['']",
      textLink: "font-semibold hover:text-white",
      primary:
        "hover-fx rounded-full px-4 lg:px-6 h-10 lg:h-14 inline-flex items-center justify-center gap-5 bg-foreground text-background border border-foreground",
      iconOnly:
        "grid place-items-center rounded-full border border-dashed border-foreground-muted hover:border-solid hover:bg-surface",
      secondary:
        "min-h-11 max-w-fit border-foreground text-foreground flex py-4 justify-between items-center gap-2 rounded-full border w-full px-6 text-xl hover:bg-surface",
      external:
        "text-foreground hover:bg-surface flex w-fit rounded-full border border-dashed px-4 py-2 transition-all hover:border-solid flex items-center gap-1",
    },
    // Only `iconOnly` reads this axis; every other variant ships one size.
    size: { normal: "", small: "" },
  },
  compoundVariants: [
    {
      variant: "iconOnly",
      size: "normal",
      class: "h-10 w-10 lg:h-14 lg:w-14 text-xl lg:text-3xl",
    },
    {
      variant: "iconOnly",
      size: "small",
      class: "h-6 w-6 lg:h-8 lg:w-8 text-sm",
    },
  ],
  defaultVariants: { variant: "inline", size: "normal" },
});

export interface Props extends HTMLAttributes<"a"> {
  label?: string;
  variant?: VariantProps<typeof linkVariants>["variant"];
  size?: VariantProps<typeof linkVariants>["size"];
  icon?: string;
}

const {
  label,
  variant = "inline",
  size = "normal",
  icon,
  class: className,
  ...props
} = Astro.props;

const href = String(props.href || "");
const isVariantExternal = variant === "external";
const isExternal = isVariantExternal || href.startsWith("http");

const externalAttrs = isExternal
  ? { target: "_blank", rel: "nofollow noopener noreferrer" }
  : {};

const showLabel = variant !== "iconOnly";
const iconName = icon || (isVariantExternal ? "lucide:arrow-up-right" : "");
const classes = linkVariants({ variant, size, className });
```

- [ ] **Step 3: Emit `data-size` on icon-only links only**

In the same file, the `<a>` open tag becomes:

```astro
<a
  class={classes}
  title={label}
  data-variant={variant}
  data-size={variant === "iconOnly" ? size : undefined}
  {...externalAttrs}
  {...props}
>
```

Astro drops attributes whose value is `undefined`, so only the 7 icon-only links gain `data-size`. The `<style>` block (`.hover-fx`, used by `primary`) is unchanged.

- [ ] **Step 4: Update the call sites**

```bash
# icon -> iconOnly (6 sites: HeroSocials x3, ContactText x3)
sed -i 's/variant="icon"/variant="iconOnly"/g' \
  src/components/hero/HeroSocials.astro src/components/contact/ContactText.astro
# bold -> textLink (1 site)
sed -i 's/variant="bold"/variant="textLink"/' src/components/contact/ContactText.astro
# iconSmall -> iconOnly size=small (1 site)
sed -i 's/variant="iconSmall"/variant="iconOnly" size="small"/' \
  src/components/ui/SocialShare.astro
# no explicit `cta` or `default` call sites exist — verify:
grep -rn 'variant="\(cta\|default\|icon\|iconSmall\|bold\)"' src/ || echo "no stale keys"
```

Expected from the last line: `no stale keys`.

- [ ] **Step 5: Rewrite the stories to the canon names**

Replace `src/components/ui/Link.stories.ts` with:

```ts
import type { ComponentProps } from "astro/types";
import Link from "./Link.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import StorySection from "../styleguide/StorySection.astro";

export default { component: Link };

export const Inline = {
  args: {
    href: "#",
    variant: "inline",
    label: "Inline link",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const Primary = {
  args: {
    href: "#",
    variant: "primary",
    label: "Get in touch",
  } satisfies ComponentProps<typeof Link>,
};

export const IconOnly = {
  args: {
    href: "#",
    variant: "iconOnly",
    icon: "lucide:mail",
    label: "Menu",
    "aria-label": "Menu",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const IconOnlySmall = {
  args: {
    href: "#",
    variant: "iconOnly",
    size: "small",
    icon: "lucide:mail",
    label: "Share",
    "aria-label": "Share",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const Secondary = {
  args: {
    href: "#",
    variant: "secondary",
    label: "Secondary link",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const TextLink = {
  args: {
    href: "#",
    variant: "textLink",
    label: "dev@jeromeabel.net",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StoryContainer }],
};

export const External = {
  args: {
    href: "https://example.com",
    variant: "external",
    label: "External link",
  } satisfies ComponentProps<typeof Link>,
  decorators: [{ component: StorySection }],
};
```

- [ ] **Step 6: Repoint the pixel manifest**

In `scripts/pixel-manifest.mjs`, replace the four `ui-link--*` entries (lines 432–468) with:

```js
  {
    id: "ui-link--default",
    // Renamed `default` -> `inline` at magnet-ds-code-convergence (design.md
    // §3/§7). Id kept: it is a historical key.
    storyPath: "/styleguide/dashboard/src/components/ui/link/inline",
    liveUrl: `${BASE}/about`,
    selector: 'a[data-variant="inline"]',
    masks: [],
    wrapper: "container",
  },
  {
    id: "ui-link--cta",
    skip: true,
    reason:
      'orphaned variant, no live caller passes variant="primary" (renamed from "cta")',
  },
  {
    id: "ui-link--iconbutton",
    // Renamed `icon` -> `iconOnly size=normal`.
    storyPath: "/styleguide/dashboard/src/components/ui/link/icon-only",
    liveUrl: `${BASE}/`,
    selector: 'a[data-variant="iconOnly"][data-size="normal"]',
    masks: [],
    wrapper: "container",
  },
  {
    id: "ui-link--icononlysmall",
    // New coverage: `iconSmall` folded into `iconOnly size=small`, and the
    // small size only appears inside ui/SocialShare on post pages.
    storyPath: "/styleguide/dashboard/src/components/ui/link/icon-only-small",
    liveUrl: `${BASE}/blog/adding-likes-to-a-static-astro-site`,
    selector: 'a[data-variant="iconOnly"][data-size="small"]',
    masks: [],
    wrapper: "container",
  },
  {
    id: "ui-link--secondary",
    storyPath: "/styleguide/dashboard/src/components/ui/link/secondary",
    liveUrl: `${BASE}/`,
    selector: 'a[data-variant="secondary"]',
    masks: [],
    wrapper: "container",
  },
  {
    id: "ui-link--external",
    storyPath: "/styleguide/dashboard/src/components/ui/link/external",
    liveUrl: `${BASE}/work/malinette`,
    selector: 'a[data-variant="external"]',
    masks: [],
    wrapper: "section",
  },
```

- [ ] **Step 7: Prove the class token set did not move**

```bash
pnpm build
node scripts/dist-snapshot.mjs --classes > /tmp/classes-after.txt
diff /tmp/classes-before.txt /tmp/classes-after.txt && echo "CLASS SETS IDENTICAL"
```

Expected: `CLASS SETS IDENTICAL`. If this fails, the `iconOnly` base + compound partition dropped or gained a token — compare against the two old strings (`icon`: `h-10 w-10 lg:h-14 lg:w-14 grid place-items-center text-xl lg:text-3xl rounded-full border border-dashed border-foreground-muted hover:border-solid hover:bg-surface`; `iconSmall`: the same with `h-6 w-6 lg:h-8 lg:w-8` and `text-sm`).

- [ ] **Step 8: Prove the only markup delta is the two data attributes**

```bash
node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt \
  | grep -E '^[<>]' \
  | grep -vE 'data-variant="(default|inline|icon|iconOnly|iconSmall|bold|textLink)"' \
  && echo "UNEXPECTED DELTA" || echo "ONLY LINK ATTRS CHANGED"
```

Expected: `ONLY LINK ATTRS CHANGED`. The changed lines are exactly: `data-variant="default"` → `"inline"`, `data-variant="icon"` → `"iconOnly" data-size="normal"`, `data-variant="iconSmall"` → `"iconOnly" data-size="small"`, `data-variant="bold"` → `"textLink"`. `menuActive`, `menuInactive`, `secondary` and `external` lines must not appear at all.

- [ ] **Step 9: Check the styleguide renders the new stories**

```bash
pnpm dev &
sleep 5
for v in inline primary icon-only icon-only-small secondary text-link external; do
  printf '%s ' "$v"
  curl -s -o /dev/null -w '%{http_code}\n' \
    "http://localhost:4321/styleguide/dashboard/src/components/ui/link/$v"
done
kill %1
```

Expected: `200` for all seven.

- [ ] **Step 10: Commit**

```bash
pnpm format:write
git add src/components/ui/Link.astro src/components/ui/Link.stories.ts \
  src/components/hero/HeroSocials.astro src/components/contact/ContactText.astro \
  src/components/ui/SocialShare.astro scripts/pixel-manifest.mjs
git commit -m "refactor(ui): rename Link CVA variants to Magnet-DS canon

cta->primary, icon->iconOnly, iconSmall->iconOnly size=small,
default->inline, bold->textLink (design.md §3/§7). iconOnly gains a size
axis via compoundVariants; the class token set is unchanged, so the only
built-HTML delta is the data-variant values plus data-size on icon-only
links. menuActive/menuInactive stay put pending the app/NavLink split."
```

---

### Task 2: Straight component renames

Five one-for-one renames. No markup, props or composition change, so the built site must come out byte-identical.

| From | To | Source |
| --- | --- | --- |
| `blog/TopicChips.astro` | `blog/PostMetadataTopic.astro` | §7 |
| `ui/LinkNavPost.astro` | `blog/PostNav.astro` (moves domain) | §7 |
| `contact/Contact.astro` | `contact/ContactPreview.astro` | §7 |
| `contact/ContactText.astro` | `contact/ContactContent.astro` | §7 |
| `ui/P.astro` | `ui/PageDescription.astro` | design.md §3 `ui/` table + the `pixel-manifest.mjs` rename map (not in §7) |

`ContactImage` and `ContactNoise` stay as internal pieces (§7 says so explicitly).

**Files:**

- Rename: `src/components/blog/TopicChips.astro` + `.stories.ts` → `PostMetadataTopic.*`
- Rename: `src/components/ui/LinkNavPost.astro` + `.stories.ts` → `src/components/blog/PostNav.*`
- Rename: `src/components/contact/Contact.astro` + `.stories.ts` → `ContactPreview.*`
- Rename: `src/components/contact/ContactText.astro` + `.stories.ts` → `ContactContent.*`
- Rename: `src/components/ui/P.astro` + `.stories.ts` → `PageDescription.*`
- Modify importers: `src/pages/blog/[id].astro:4,8,9,91,139,146`, `src/pages/blog/[serie]/[post].astro:4,8,9,120,172,180,188,196`, `src/pages/index.astro:4,18`, `src/pages/blog.astro:6,29,31`, `src/pages/work.astro:6,30,36`, `src/pages/blog/[serie]/index.astro:5,56,58`, `src/components/work/WorkHeader.astro:4,20,22`
- Modify comments: `src/components/styleguide/StoryFlexHeight.astro:4`, `src/components/contact/ContactImage.stories.ts:6-7`
- Modify: `scripts/pixel-manifest.mjs` — `blog-topicchips--default`, `ui-linknavpost--previous`, `ui-linknavpost--next`, `contact-contact--default`, `contact-contacttext--default`, `ui-p--default`

**Interfaces:**

- Consumes: Task 1's `ui/Link` (`ContactContent` passes `variant="textLink"` and `variant="iconOnly"`).
- Produces: `blog/PostMetadataTopic` props `{ topic?: string | undefined }`; `blog/PostNav` props `{ id: string; title: string; type: "prev" | "next" }`; `contact/ContactPreview` and `contact/ContactContent` and `ui/PageDescription` take no props. Task 3 imports `contact/ContactPreview` from `src/pages/index.astro`.

- [ ] **Step 1: Take the baseline snapshot**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
```

- [ ] **Step 2: Move the files**

```bash
git mv src/components/blog/TopicChips.astro       src/components/blog/PostMetadataTopic.astro
git mv src/components/blog/TopicChips.stories.ts  src/components/blog/PostMetadataTopic.stories.ts
git mv src/components/ui/LinkNavPost.astro        src/components/blog/PostNav.astro
git mv src/components/ui/LinkNavPost.stories.ts   src/components/blog/PostNav.stories.ts
git mv src/components/contact/Contact.astro       src/components/contact/ContactPreview.astro
git mv src/components/contact/Contact.stories.ts  src/components/contact/ContactPreview.stories.ts
git mv src/components/contact/ContactText.astro   src/components/contact/ContactContent.astro
git mv src/components/contact/ContactText.stories.ts src/components/contact/ContactContent.stories.ts
git mv src/components/ui/P.astro                  src/components/ui/PageDescription.astro
git mv src/components/ui/P.stories.ts             src/components/ui/PageDescription.stories.ts
```

- [ ] **Step 3: Rewrite every identifier and import path**

```bash
# Component identifiers and alias paths, across src/ (pages, components, stories).
grep -rl 'TopicChips'  src/ | xargs sed -i 's/TopicChips/PostMetadataTopic/g'
grep -rl 'LinkNavPost' src/ | xargs sed -i 's|@components/ui/LinkNavPost.astro|@components/blog/PostNav.astro|g; s/LinkNavPost/PostNav/g'
grep -rl 'ContactText' src/ | xargs sed -i 's/ContactText/ContactContent/g'
sed -i 's|@components/contact/Contact.astro|@components/contact/ContactPreview.astro|; s/\bContact\b/ContactPreview/g' src/pages/index.astro
sed -i 's|"./Contact.astro"|"./ContactPreview.astro"|; s/\bContact\b/ContactPreview/g' src/components/contact/ContactPreview.stories.ts
```

Then fix the three files the blunt passes cannot do safely:

- `src/components/blog/PostNav.stories.ts` — its `StoryContainer` import stays `../styleguide/StoryContainer.astro` (`ui/` and `blog/` are siblings, same depth), so only the identifier changed. Verify it reads `import PostNav from "./PostNav.astro";`.
- `src/components/contact/ContactImage.stories.ts:6-7` — the prose comment now says `ContactContent` (from the `ContactText` pass); change `Contact.astro` to `ContactPreview.astro` in the same comment by hand.
- `src/components/styleguide/StoryFlexHeight.astro:4` — same, `ContactImage next to ContactContent in ContactPreview.astro`.

Now rename `P` → `PageDescription`. `P` is a single letter, so do it explicitly per file rather than with a global `sed`:

```bash
for f in src/pages/blog.astro src/pages/work.astro src/pages/blog/\[id\].astro \
         src/pages/blog/\[serie\]/\[post\].astro src/pages/blog/\[serie\]/index.astro \
         src/components/work/WorkHeader.astro; do
  sed -i 's|import P from "@components/ui/P.astro";|import PageDescription from "@components/ui/PageDescription.astro";|; s|<P>|<PageDescription>|g; s|</P>|</PageDescription>|g; s|<P$|<PageDescription|; s|<P\b|<PageDescription|g' "$f"
done
sed -i 's|"./P.astro"|"./PageDescription.astro"|; s/\bP\b/PageDescription/g' src/components/ui/PageDescription.stories.ts
```

`src/pages/blog.astro:29-31` uses the multi-line form:

```astro
      <PageDescription
        >Web performance, clean architecture, and the craft of web engineering.
      </PageDescription>
```

Check it by eye — the `sed` above handles `<P` at end of line, but confirm no stray `<P` or `</P>` survives:

```bash
grep -rn '</\?P[ >]' src/ && echo "STALE <P> LEFT" || echo "clean"
grep -rn 'TopicChips\|LinkNavPost\|ContactText\|ui/P\.astro' src/ && echo "STALE NAME LEFT" || echo "clean"
```

Expected: `clean` twice.

- [ ] **Step 4: Repoint the six manifest entries**

In `scripts/pixel-manifest.mjs`, change only the `storyPath` values (selectors and liveUrls are unaffected — the markup is identical):

```js
// blog-topicchips--default
    storyPath:
      "/styleguide/dashboard/src/components/blog/post-metadata-topic/default",
// ui-linknavpost--previous
    storyPath: "/styleguide/dashboard/src/components/blog/post-nav/previous",
// ui-linknavpost--next
    storyPath: "/styleguide/dashboard/src/components/blog/post-nav/next",
// contact-contact--default
    storyPath:
      "/styleguide/dashboard/src/components/contact/contact-preview/default",
// contact-contacttext--default
    storyPath:
      "/styleguide/dashboard/src/components/contact/contact-content/default",
// ui-p--default
    storyPath:
      "/styleguide/dashboard/src/components/ui/page-description/default",
```

Then update the rename map in the file header (lines 44–53) so the arrows read as done rather than pending — replace that block with:

```js
// Renamed-but-NOT-retired. Applied in code at magnet-ds-code-convergence; the
// ids below are historical keys and stay put. Canon name on the right:
//   blog-postlistitem--default      -> blog/PostRow  type=post
//   blog-seriepostlistitem--default -> blog/PostRow  type=serie
//   blog-selectedwriting--default   -> blog/BlogPreview
//   blog-topicchips--default        -> blog/PostMetadataTopic
//   ui-linknavpost--previous|next   -> blog/PostNav
//   ui-p--default                   -> ui/PageDescription
//   contact-contact--default        -> contact/ContactPreview
//   contact-contacttext--default    -> contact/ContactContent
//   work-worksstrip--default        -> work/WorkPreview
```

- [ ] **Step 5: Prove the built site is unchanged**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt && echo "IDENTICAL"
```

Expected: `IDENTICAL` — a pure rename must not move a single byte of output.

- [ ] **Step 6: Check the renamed stories resolve**

```bash
pnpm dev &
sleep 5
for p in blog/post-metadata-topic/default blog/post-nav/previous \
         contact/contact-preview/default contact/contact-content/default \
         ui/page-description/default; do
  printf '%s ' "$p"
  curl -s -o /dev/null -w '%{http_code}\n' \
    "http://localhost:4321/styleguide/dashboard/src/components/$p"
done
kill %1
```

Expected: `200` for all five.

- [ ] **Step 7: Commit**

```bash
pnpm format:write
git add -A src scripts/pixel-manifest.mjs
git commit -m "refactor(components): rename to Magnet-DS canon names

TopicChips->PostMetadataTopic, ui/LinkNavPost->blog/PostNav,
Contact->ContactPreview, ContactText->ContactContent (design.md §7) and
ui/P->ui/PageDescription (§3 ui/ table + the pixel-manifest rename map).
Markup untouched: dist/ is byte-identical."
```

---

### Task 3: Collapse the Home-section duplicates onto canon names

§7: `SelectedWriting`/`BlogPreview` → `BlogPreview`, `WorksStrip`/`WorksPreview` → `WorkPreview`, "canon name keeps the currently-rendered markup". Each pair is one live component plus one LEGACY twin that no v3 page imports, and in the blog case the legacy twin is squatting on the canon name — which is why `src/components/_retired/` gets created here.

**Files:**

- Create dir: `src/components/_retired/blog/`, `src/components/_retired/work/`
- Rename: `src/components/blog/BlogPreview.astro` + `.stories.ts` → `src/components/_retired/blog/`
- Rename: `src/components/work/WorksPreview.astro` + `.stories.ts` → `src/components/_retired/work/`
- Rename: `src/components/blog/SelectedWriting.astro` + `.stories.ts` → `src/components/blog/BlogPreview.*`
- Rename: `src/components/work/WorksStrip.astro` + `.stories.ts` → `src/components/work/WorkPreview.*`
- Modify: `src/pages/index.astro:3,6,14,15`
- Modify: `scripts/pixel-manifest.mjs` — `blog-blogpreview--default`, `blog-selectedwriting--default`, `work-workspreview--default`, `work-worksstrip--default`, and the `StoryGrid3`/`WorkOverlayCard`/`WorkGalleryCard` comments that name `WorksStrip.astro`

**Interfaces:**

- Consumes: `contact/ContactPreview` from Task 2 (already imported by `index.astro`).
- Produces: `blog/BlogPreview.astro` (the live Home writing section, `id="writing"`, no props) and `work/WorkPreview.astro` (the live Home work section, no props). Task 4 edits `blog/BlogPreview.astro` to drop its `VARIANTS.homePosts` branch. Task 5 fixes `_retired/blog/BlogPreview.astro`'s import of `SeriePostCard` once that file moves too.

- [ ] **Step 1: Take the baseline snapshot**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
```

- [ ] **Step 2: Archive the two legacy twins**

```bash
mkdir -p src/components/_retired/blog src/components/_retired/work
git mv src/components/blog/BlogPreview.astro       src/components/_retired/blog/BlogPreview.astro
git mv src/components/blog/BlogPreview.stories.ts  src/components/_retired/blog/BlogPreview.stories.ts
git mv src/components/work/WorksPreview.astro      src/components/_retired/work/WorksPreview.astro
git mv src/components/work/WorksPreview.stories.ts src/components/_retired/work/WorksPreview.stories.ts
```

Neither story uses a relative import beyond its own sibling `.astro` (both are `import X from "./X.astro"` plus a `title: "Legacy/X"`), so no depth fix is needed. Leave the `title:` fields alone — they are only read by astrobook and both manifest entries are `skip`.

`_retired/blog/BlogPreview.astro` imports `@components/blog//SeriePostCard.astro` (note the double slash) and `@components/blog/PostCard.astro`; both targets are still in place, so it keeps resolving. Task 5 moves `SeriePostCard` and updates this line.

- [ ] **Step 3: Promote the live components to the canon names**

```bash
git mv src/components/blog/SelectedWriting.astro      src/components/blog/BlogPreview.astro
git mv src/components/blog/SelectedWriting.stories.ts src/components/blog/BlogPreview.stories.ts
git mv src/components/work/WorksStrip.astro           src/components/work/WorkPreview.astro
git mv src/components/work/WorksStrip.stories.ts      src/components/work/WorkPreview.stories.ts
```

- [ ] **Step 4: Rewrite the identifiers**

`src/components/blog/BlogPreview.stories.ts` becomes:

```ts
import BlogPreview from "./BlogPreview.astro";

export default { component: BlogPreview };

export const Default = { args: {} };
```

`src/components/work/WorkPreview.stories.ts` becomes:

```ts
import WorkPreview from "./WorkPreview.astro";

export default { component: WorkPreview };

export const Default = { args: {} };
```

`src/pages/index.astro` lines 3 and 6, and the two usages:

```astro
import BlogPreview from "@components/blog/BlogPreview.astro";
...
import WorkPreview from "@components/work/WorkPreview.astro";
```

```astro
      <BlogPreview />
      <WorkPreview />
```

Then check nothing outside `_retired/` still says the old names:

```bash
grep -rn 'SelectedWriting\|WorksStrip' src/ --include=*.astro --include=*.ts \
  | grep -v '^src/components/_retired/' && echo "STALE NAME LEFT" || echo "clean"
```

Expected: `clean`. (The three `styleguide/Story*.astro` decorator comments and the two `Work*Card.stories.ts` comments name `WorksStrip.astro` as a live grid parent — update those references to `WorkPreview.astro` as part of this step; they are prose, not code.)

- [ ] **Step 5: Update the manifest**

```js
  {
    id: "blog-blogpreview--default",
    skip: true,
    reason:
      "legacy, archived to _retired/blog — the canon blog/BlogPreview is the ex-SelectedWriting markup (design.md §7)",
  },
```

```js
  {
    id: "blog-selectedwriting--default",
    // SelectedWriting took the canon name blog/BlogPreview at
    // magnet-ds-code-convergence; markup and the #writing anchor are unchanged.
    storyPath: "/styleguide/dashboard/src/components/blog/blog-preview/default",
    liveUrl: `${BASE}/`,
    selector: "#writing",
    masks: [],
    wrapper: "none",
  },
```

```js
  {
    id: "work-workspreview--default",
    skip: true,
    reason:
      "legacy, archived to _retired/work — the canon work/WorkPreview is the ex-WorksStrip markup (design.md §7)",
  },
```

```js
  {
    id: "work-worksstrip--default",
    // WorksStrip took the canon name work/WorkPreview; markup unchanged.
    storyPath: "/styleguide/dashboard/src/components/work/work-preview/default",
    liveUrl: `${BASE}/`,
    selector: 'section[class="container flex flex-col gap-4 lg:gap-8"]',
    masks: ["img"],
    wrapper: "none",
  },
```

- [ ] **Step 6: Prove the built site is unchanged**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt && echo "IDENTICAL"
```

Expected: `IDENTICAL`.

- [ ] **Step 7: Note how astrobook treats `_retired/`**

```bash
pnpm dev &
sleep 5
curl -s -o /dev/null -w 'blog-preview %{http_code}\n' \
  http://localhost:4321/styleguide/dashboard/src/components/blog/blog-preview/default
curl -s -o /dev/null -w 'work-preview %{http_code}\n' \
  http://localhost:4321/styleguide/dashboard/src/components/work/work-preview/default
curl -s http://localhost:4321/styleguide | grep -o '_retired' | head -1
kill %1
```

Expected: `200` for both canon stories. Whether `_retired` appears in the dashboard listing is informational — both outcomes are fine (grouped-and-labelled, or hidden). Record which in the commit body so Task 5 does not re-investigate.

- [ ] **Step 8: Commit**

```bash
pnpm format:write
git add -A src scripts/pixel-manifest.mjs
git commit -m "refactor(home): collapse duplicate Home sections onto canon names

SelectedWriting -> blog/BlogPreview and WorksStrip -> work/WorkPreview;
the two LEGACY twins that held those names move to src/components/_retired/
(archived, not deleted — design.md §7). Rendered markup unchanged."
```

---

### Task 4: Collapse the post rows onto `blog/PostRow`

§7: `PostListItem → PostRow type=post`, `SeriePostListItem → PostRow type=serie`, and `SerieList.astro`/`PostList.astro` adopt canon children (`SerieCard` / `PostRow`).

`PostRow.astro` at HEAD is not the canon row — it is the `homePosts: "arrow-rows"` exploration, byte-identical to `PostRowCalm.astro` minus the description `<p>`. `VARIANTS.homePosts` is `"calm-rows"`, so it renders nowhere, and Figma has no master for it. Its body is therefore replaced wholesale by the two verbatim row markups, the `serie` prop goes away, `homePosts` leaves `VARIANTS`, and `blog/BlogPreview` hardcodes `PostRowCalm` (which stays: it is a real Figma master, composed by `work/RelatedWriting`).

The two class strings are copied **byte for byte** — `scripts/pixel-manifest.mjs` selects those rows by exact `class="…"` match.

**Files:**

- Modify: `src/components/blog/PostRow.astro` (full rewrite)
- Modify: `src/components/blog/PostRow.stories.ts` (full rewrite)
- Modify: `src/components/blog/BlogPreview.astro:2-3,27-35` (drop the `VARIANTS` branch)
- Modify: `src/config/variants.ts:7,13,18` (drop `homePosts`)
- Modify: `src/pages/blog.astro:2,43`
- Modify: `src/pages/blog/[serie]/index.astro:2,69`
- Modify: `src/components/blog/PostList.astro:2,12`
- Modify: `src/components/blog/SerieList.astro:2,11-13` + `SerieList.stories.ts`
- Modify: `src/components/blog/SerieListItem.astro:2,33`
- Modify: `scripts/pixel-manifest.mjs` — `blog-postlistitem--default`, `blog-seriepostlistitem--default`, `blog-postrow--arrowrow`, `blog-postrow--withserie`, plus the `VARIANTS` note in the header

**Interfaces:**

- Consumes: `blog/BlogPreview.astro` from Task 3.
- Produces: `blog/PostRow.astro` with props `{ post: CollectionEntry<"post"> | CollectionEntry<"seriePost">; type?: "post" | "serie"; compact?: boolean; index?: number }` — `type` defaults to `"post"`, `compact` applies to `type="post"` only (month-year instead of full date), `index` applies to `type="serie"` only (renders `index + 1` as the order numeral). `blog/PostRowCalm.astro` keeps its `{ post, serie? }` props unchanged. `VARIANTS` loses `homePosts`; the remaining keys are `workFeatured`, `worksStrip`, `aboutFacts`. Task 5 archives `PostListItem` and `SeriePostListItem`, which nothing imports after this task.

- [ ] **Step 1: Take the baseline snapshot**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
```

- [ ] **Step 2: Rewrite `PostRow.astro` as the two-type canon row**

Replace `src/components/blog/PostRow.astro` entirely with:

```astro
---
import { Icon } from "astro-icon/components";
import type { CollectionEntry } from "astro:content";
import { getFormattedDate, getMonthYear } from "src/utils/format-date";
import { getMinutesReadFromBody } from "src/utils/get-minutes-read";

interface Props {
  post: CollectionEntry<"post"> | CollectionEntry<"seriePost">;
  /** `post` = the /blog archive row; `serie` = the numbered serie-landing row. */
  type?: "post" | "serie";
  /** type="post" only: month-year instead of the full date. */
  compact?: boolean;
  /** type="serie" only: zero-based position, rendered as index + 1. */
  index?: number;
}

const { post, type = "post", compact, index = 0 } = Astro.props;

if (!post) {
  throw new Error("Sorry, could not find post");
}

const minutesRead = getMinutesReadFromBody(post.body);
const order = index + 1;
const updatedLabel = post.data.updated
  ? new Date(post.data.updated).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
    })
  : null;
---

{
  type === "serie" ? (
    <a
      href={`/blog/${post.id}`}
      class="border-border hover:bg-surface group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4 text-lg"
    >
      <Icon
        name="lucide:arrow-right"
        class="text-foreground-muted absolute -translate-x-8 transition-transform group-hover:translate-x-2"
      />
      <div class="flex flex-1 items-center gap-0 transition-transform group-hover:translate-x-8">
        <span class="text-foreground-muted">{order}</span>
        <Icon name="lucide:dot" class="text-foreground-muted" />
        <h3>{post.data.title}</h3>
      </div>
      <div class="text-foreground-muted flex gap-2 font-mono text-xs md:text-sm">
        {minutesRead && <p class="hidden sm:block">{minutesRead} -</p>}
        <time>{getFormattedDate(post.data.date)}</time>
      </div>
    </a>
  ) : (
    <a
      href={`/blog/${post.id}`}
      class="border-border hover:bg-surface group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4"
    >
      <Icon
        name="lucide:arrow-right"
        class="text-foreground-muted absolute -translate-x-8 transition-transform group-hover:translate-x-2"
      />
      <h3 class="flex-1 transition-transform group-hover:translate-x-8">
        {post.data.title}
        {updatedLabel && (
          <span class="text-foreground-muted ms-2 font-mono text-xs">
            · updated {updatedLabel}
          </span>
        )}
      </h3>
      <div class="text-foreground-muted flex items-center gap-2 font-mono text-xs md:text-sm">
        {minutesRead && <p class="hidden sm:block">{minutesRead} -</p>}
        <time>
          {compact ? getMonthYear(post.data.date) : getFormattedDate(post.data.date)}
        </time>
      </div>
    </a>
  )
}
```

- [ ] **Step 3: Rewrite `PostRow.stories.ts` for the new axes**

Replace `src/components/blog/PostRow.stories.ts` entirely with:

```ts
import type { ComponentProps } from "astro/types";
import PostRow from "./PostRow.astro";
import StoryContainer from "../styleguide/StoryContainer.astro";
import {
  getAllSeriePosts,
  getAllStandalonePosts,
} from "../../utils/repository";

const posts = await getAllStandalonePosts();
const seriePosts = await getAllSeriePosts();

export default { component: PostRow };

export const Post = {
  args: { post: posts[0], type: "post" } satisfies ComponentProps<
    typeof PostRow
  >,
  decorators: [{ component: StoryContainer }],
};

export const PostCompact = {
  args: {
    post: posts[0],
    type: "post",
    compact: true,
  } satisfies ComponentProps<typeof PostRow>,
  decorators: [{ component: StoryContainer }],
};

export const Serie = {
  args: {
    post: seriePosts[0],
    type: "serie",
    index: 0,
  } satisfies ComponentProps<typeof PostRow>,
  decorators: [{ component: StoryContainer }],
};
```

- [ ] **Step 4: Point the four callers at `PostRow`**

`src/pages/blog.astro` — line 2 and line 43:

```astro
import PostRow from "@components/blog/PostRow.astro";
```

```astro
                <PostRow {post} compact />
```

`src/pages/blog/[serie]/index.astro` — line 2 and line 69:

```astro
import PostRow from "@components/blog/PostRow.astro";
```

```astro
      {posts.map((post, index) => <PostRow {post} type="serie" {index} />)}
```

`src/components/blog/PostList.astro` — line 2 and line 12:

```astro
import PostRow from "@components/blog/PostRow.astro";
```

```astro
  {allPosts.map((post) => <PostRow {post} />)}
```

`src/components/blog/SerieListItem.astro` — line 2 and line 33:

```astro
import PostRow from "@components/blog/PostRow.astro";
```

```astro
    {posts.map((post, index) => <PostRow {post} type="serie" {index} />)}
```

- [ ] **Step 5: Make `SerieList` adopt `SerieCard`**

§7 names `SerieCard` as `SerieList`'s canon child; `SerieListItem` is on the archive list. `SerieList.astro` is LEGACY and unimported, so this changes no rendered output. Replace `src/components/blog/SerieList.astro` entirely with:

```astro
---
import SerieCard from "@components/blog/SerieCard.astro";
import { getAllSeries } from "src/utils/repository";

const allSeries = await getAllSeries();
---

{
  /* LEGACY — main-only, not wired into any v3 page. Kept for styleguide delete-vs-adopt review. See .specs/01_active/dev-styleguide. */
}
<div class="mt-8 grid gap-4 md:grid-cols-2 lg:gap-8">
  {allSeries.map((serie) => <SerieCard {serie} />)}
</div>
```

The grid matches the Series section in `blog.astro:55`, so wiring it in later (deferred — see "Out of scope") is a drop-in.

- [ ] **Step 6: Drop the `homePosts` switch**

`src/components/blog/BlogPreview.astro` — delete the `PostRow` import (line 2) and the `VARIANTS` import (line 7), and replace the `latest.map(...)` block (lines 27–35) with:

```astro
      {latest.map(({ post, serie }) => <PostRowCalm {post} {serie} />)}
```

`src/config/variants.ts` — delete the `HomePostsVariant` type (line 7), the `homePosts:` field in the type literal (line 13), and the `homePosts: "calm-rows"` value (line 18). The file's remaining keys are `workFeatured`, `worksStrip`, `aboutFacts`.

Verify nothing else reads it:

```bash
grep -rn 'homePosts\|HomePostsVariant' src/ scripts/ \
  | grep -v 'scripts/pixel-manifest.mjs' && echo "STALE REF" || echo "clean"
```

Expected: `clean` (the manifest header comment is updated in the next step).

- [ ] **Step 7: Update the manifest**

Repoint the two row entries — selectors are unchanged because the class strings were copied verbatim:

```js
  {
    id: "blog-postlistitem--default",
    // Collapsed onto blog/PostRow type=post at magnet-ds-code-convergence
    // (design.md §7). Markup verbatim, so the selector still matches.
    storyPath: "/styleguide/dashboard/src/components/blog/post-row/post",
    liveUrl: `${BASE}/blog`,
    selector:
      'a[class="border-border hover:bg-surface group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4"]',
    masks: [],
    wrapper: "container",
  },
```

```js
  {
    id: "blog-seriepostlistitem--default",
    // Collapsed onto blog/PostRow type=serie. Markup verbatim.
    storyPath: "/styleguide/dashboard/src/components/blog/post-row/serie",
    liveUrl: `${BASE}/blog/web-performance`,
    selector:
      'a[class="border-border hover:bg-surface group relative flex flex-row items-center justify-between gap-8 overflow-hidden border-b py-4 text-lg"]',
    masks: [],
    wrapper: "container",
  },
```

```js
  {
    id: "blog-postrow--arrowrow",
    skip: true,
    reason:
      "superseded — PostRow's arrow-rows body was dead (homePosts removed) and the component now carries the PostListItem/SeriePostListItem markup",
  },
  {
    id: "blog-postrow--withserie",
    skip: true,
    reason:
      "superseded — PostRow no longer takes a `serie` prop; the serie chrome lives on blog/PostRowCalm",
  },
```

And in the header comment block (lines 21–26), drop the `homePosts:` line from the `VARIANTS` list and note why:

```js
// VARIANTS at the commit this preview was built from (src/config/variants.ts,
// re-derived at impl time, not trusted from the brief or from stale prior context):
//   workFeatured: "gallery-3col-1x1"
//   worksStrip:   "overlay-card"
//   aboutFacts:   "grid"
// (`homePosts` was removed at magnet-ds-code-convergence: PostRow absorbed the
// two list-item markups, so there is no second Home row to switch to.)
```

- [ ] **Step 8: Prove the built site is unchanged**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt && echo "IDENTICAL"
```

Expected: `IDENTICAL`. This is the strongest check in the plan — it proves both verbatim ports landed byte-for-byte across `/blog` (every archive row) and all three serie landing pages.

- [ ] **Step 9: Check the three PostRow stories render**

```bash
pnpm dev &
sleep 5
for v in post post-compact serie; do
  printf '%s ' "$v"
  curl -s -o /dev/null -w '%{http_code}\n' \
    "http://localhost:4321/styleguide/dashboard/src/components/blog/post-row/$v"
done
kill %1
```

Expected: `200` for all three.

- [ ] **Step 10: Commit**

```bash
pnpm format:write
git add -A src scripts/pixel-manifest.mjs
git commit -m "refactor(blog): collapse PostListItem/SeriePostListItem onto PostRow

PostRow gains a type=post|serie axis carrying both markups verbatim
(design.md §7). Its old arrow-rows body was dead — homePosts was pinned to
calm-rows and has no Figma master — so VARIANTS.homePosts goes with it and
BlogPreview hardcodes PostRowCalm. PostList adopts PostRow, SerieList
adopts SerieCard. dist/ is byte-identical."
```

---

### Task 5: Archive the retired components

§7's archive list, minus the two entries that are still rendering live (`WorkOverlayCard`, `WorkGalleryCard` — deferred, see "Out of scope") and minus `SelectedWriting`/`WorksStrip`, whose names were already retired by the Task 3 promotion. Everything here is unimported by any page after Tasks 3 and 4.

`SerieList.astro` is **not** on §7's list and stays live — Task 4 gave it a canon child. `SerieListItem` goes; so does its only remaining consumer relationship. `PostCard.astro` is not on the list and stays put, even though its only importer is now `_retired/blog/BlogPreview.astro`.

**Files:**

- Rename into `src/components/_retired/blog/`: `PostListItem.*`, `SeriePostListItem.*`, `SerieListItem.*`, `SeriePostCard.*`
- Rename into `src/components/_retired/about/`: `AboutValues.*`, `ValueCard.*`
- Rename into `src/components/_retired/skills/`: `Skills.*`, `SkillsText.*`
- Modify: `src/components/_retired/blog/BlogPreview.astro:2` (its `SeriePostCard` import)
- Modify: `src/components/_retired/about/AboutValues.astro:5` (its `ValueCard` import)
- Modify: `src/components/_retired/skills/Skills.astro:6` (its `SkillsText` import)
- Modify: relative imports in the moved `*.stories.ts` files
- Modify: `scripts/pixel-manifest.mjs` — `blog-serielistitem--default`, `blog-seriepostcard--default`, `about-aboutvalues--default`, `about-valuecard--default` reasons (and the `skills-*` entries if any exist)

**Interfaces:**

- Consumes: Tasks 3 and 4 — nothing outside `_retired/` may import any of these files.
- Produces: nothing new. `src/components/{blog,about,skills}/` no longer contain the retired names.

- [ ] **Step 1: Prove nothing live imports them**

```bash
for n in PostListItem SeriePostListItem SerieListItem SeriePostCard \
         AboutValues ValueCard Skills SkillsText; do
  printf '%-20s ' "$n"
  grep -rn "@components/[a-z]*/$n\.astro" src/ \
    | grep -v '^src/components/_retired/' \
    | grep -v "^src/components/[a-z]*/$n\." || echo "(no live importer)"
done
```

Expected: `(no live importer)` on every line except `ValueCard` (imported by `AboutValues`, which is moving too) and `SkillsText` (imported by `Skills`, same). Both are fixed in Step 3.

- [ ] **Step 2: Take the baseline snapshot and move the files**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt

mkdir -p src/components/_retired/about src/components/_retired/skills
for f in blog/PostListItem blog/SeriePostListItem blog/SerieListItem \
         blog/SeriePostCard about/AboutValues about/ValueCard \
         skills/Skills skills/SkillsText; do
  git mv "src/components/$f.astro"      "src/components/_retired/$f.astro"
  git mv "src/components/$f.stories.ts" "src/components/_retired/$f.stories.ts"
done
```

- [ ] **Step 3: Fix the alias imports whose targets moved**

```bash
sed -i 's|@components/blog//SeriePostCard.astro|@components/_retired/blog/SeriePostCard.astro|' \
  src/components/_retired/blog/BlogPreview.astro
sed -i 's|@components/about/ValueCard.astro|@components/_retired/about/ValueCard.astro|' \
  src/components/_retired/about/AboutValues.astro
sed -i 's|@components/skills/SkillsText.astro|@components/_retired/skills/SkillsText.astro|' \
  src/components/_retired/skills/Skills.astro
grep -rn '@components/\(blog\|about\|skills\)/\(SeriePostCard\|ValueCard\|SkillsText\)' src/ \
  && echo "STALE ALIAS" || echo "clean"
```

The three importers are `_retired/blog/BlogPreview.astro:2` (the double slash is in the original — match it exactly), `_retired/about/AboutValues.astro:5` and `_retired/skills/Skills.astro:6`. The `*.stories.ts` files import their own sibling `./X.astro`, which does not move.

Expected: `clean`.

- [ ] **Step 4: Fix the relative-import depth in the moved stories**

Each moved story sits one directory deeper, so `../` becomes `../../`:

```bash
sed -i 's|"\.\./styleguide/|"../../styleguide/|g; s|"\.\./\.\./utils/|"../../../utils/|g; s|"\.\./\.\./assets/|"../../../assets/|g' \
  src/components/_retired/blog/*.stories.ts \
  src/components/_retired/about/*.stories.ts \
  src/components/_retired/skills/*.stories.ts
grep -rn 'from "\.\./' src/components/_retired/
```

Expected from the final `grep`: every path starts `../../` or `../../../`, and none reads `../styleguide/` or `../../utils/`. The affected files are `PostListItem.stories.ts` and `SeriePostListItem.stories.ts` (`StoryContainer` + `repository`), `SerieListItem.stories.ts` and `SeriePostCard.stories.ts` (`repository`), `ValueCard.stories.ts` (`assets/images/values/user.svg?url`) and `SkillsText.stories.ts` (`assets/images/skills_design_flat.svg`).

- [ ] **Step 5: Update the manifest reasons**

The four `skip` entries that named these components as "legacy, not on live site" now have a precise home. For each of `blog-serielistitem--default`, `blog-seriepostcard--default` — and for `about-aboutvalues--default` / `about-valuecard--default` / any `skills-*` entry, which currently carry live `storyPath`/`liveUrl` pairs — set:

```js
  {
    id: "<existing id>",
    skip: true,
    reason:
      "retired by magnet-ds-final-state (design.md §3/§7) — archived to src/components/_retired/, no Figma master",
  },
```

Check first which of them are still non-skip:

```bash
grep -n -A4 'id: "about-aboutvalues--default"\|id: "about-valuecard--default"\|id: "skills-' \
  scripts/pixel-manifest.mjs
```

Convert any that still carry a `storyPath` — the story URL moved under `_retired/`, and none of them has a Figma counterpart to diff against.

- [ ] **Step 6: Prove the built site is unchanged**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt && echo "IDENTICAL"
```

Expected: `IDENTICAL`. Nothing live imported any of these files, so the build cannot have moved.

- [ ] **Step 7: Check the dev server still boots**

```bash
pnpm dev &
sleep 6
curl -s -o /dev/null -w 'styleguide %{http_code}\n' http://localhost:4321/styleguide
curl -s -o /dev/null -w 'home %{http_code}\n' http://localhost:4321/
kill %1
```

Expected: `200` for both. Astrobook compiles every `*.stories.ts` it finds, including the ones under `_retired/`, so a broken relative import from Step 4 surfaces here rather than in the 13-minute pixel run.

- [ ] **Step 8: Commit**

```bash
pnpm format:write
git add -A src scripts/pixel-manifest.mjs
git commit -m "refactor(components): archive the Magnet-DS retired set

git mv into src/components/_retired/<domain>/ — archived, not deleted
(design.md §7): PostListItem, SeriePostListItem, SerieListItem,
SeriePostCard, AboutValues, ValueCard, Skills, SkillsText. WorkOverlayCard
and WorkGalleryCard stay put: both still render live and can only be
archived by the deferred route rebuilds. dist/ is byte-identical."
```

---

### Task 6: Token cleanup

Two bullets from the spec's Tokens section. `--color-accent-hover` is declared twice and used nowhere; the Motion doc declares `--duration-fast`/`-base`/`-slow` that `src/` never defines, and `.reveal` runs 1.3s, off the 150/250/400 scale.

`--ease-out` and `--ease-in-out` need no work: Tailwind v4 ships both as theme defaults (`node_modules/tailwindcss/theme.css`), so the `ease-in-out` in `.reveal` already resolves to the documented curve.

The delete has a tooling side effect: `scripts/figma/token-map.json` maps both declarations to `2 Theme/{Light,Dark}/zz/color/accent-hover`, and those variables still exist in `tokens.figma.json`. Removing the code tokens alone would flip `figma:verify` from clean to two orphans. Removing the map entries *and* ignoring the `zz/` prefix keeps the report honest: the Figma variables are parked (`zz/`), not code-backed.

Adding `--duration-*` cannot perturb `figma:verify` — `scripts/figma/extract-code-tokens.mjs` only emits `--font-*`, `--color-*`, `--spacing-section*` and the `@utility container` values.

**Files:**

- Modify: `src/styles/global.css:49` (comment), `:59` (delete), `:82` (delete), `@theme` block (add durations), `:137-141` (`.reveal`)
- Modify: `scripts/figma/token-map.json:12,24` (delete), `orphanIgnore` (add two prefixes)

**Interfaces:**

- Consumes: nothing.
- Produces: `--duration-fast: 150ms`, `--duration-base: 250ms`, `--duration-slow: 400ms` in `@theme`, usable as `var(--duration-*)` in CSS and as Tailwind `duration-fast|base|slow` utilities. Task 7 does not read them.

- [ ] **Step 1: Record the clean baseline**

```bash
pnpm figma:verify
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
```

Expected from `figma:verify`: `_none_` under all four headings.

- [ ] **Step 2: Confirm `--color-accent-hover` is dead**

```bash
grep -rn 'accent-hover' src/
```

Expected: exactly three hits, all in `src/styles/global.css` — the comment at `:49` and the two declarations at `:59` and `:82`. No utility class (`bg-accent-hover`, `text-accent-hover`, `hover:*-accent-hover`) anywhere.

- [ ] **Step 3: Delete both declarations and fix the comment**

Delete `src/styles/global.css:59`:

```css
  --color-accent-hover: #005f5a; /* teal-800 — 7.28:1, darkens on hover */
```

Delete `src/styles/global.css:82` and the comment line above it:

```css
  /* Accent flips direction in dark: hover brightens instead of darkening. */
  --color-accent-hover: #00d5be; /* teal-400 — 8.94:1, brightens on hover */
```

`src/styles/global.css:49` ends the `--color-surface-hover` rationale with `Same per-mode direction logic as --color-accent-hover.` — that reference now dangles. Replace that sentence with:

```css
     "Raised" = a surface stacked on an already-lifted one (topic chip on a
     hovered row) — it steps AWAY from the background, which in light mode
     means darker; the dark block below flips that direction. */
```

- [ ] **Step 4: Declare the motion durations**

Add to the `@theme` block in `src/styles/global.css`, after the `--spacing-section-lg` pair:

```css
  /* Motion scale. Mirrored in the Magnet-DS Motion doc; --ease-out and
     --ease-in-out already ship as Tailwind v4 theme defaults, so only the
     durations need declaring. */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
```

- [ ] **Step 5: Put `.reveal` on the scale**

`src/styles/global.css:137-141` — the scroll-reveal transition runs 1.3s, which is 3× the top of the documented scale. Replace with:

```css
html[data-motion="on"] .reveal {
  opacity: 0;
  transition:
    opacity var(--duration-slow) 0.1s ease-in-out,
    transform var(--duration-slow) 0.1s ease-in-out;
}
```

This is the one deliberate behaviour change in the task: the reveal animation goes from 1.3s to 400ms. It is not visible in `dist/` (the class is applied by `src/scripts/reveal-anim.ts` at runtime) and it is what the Motion doc specifies.

- [ ] **Step 6: Keep the token diff honest**

In `scripts/figma/token-map.json`, delete these two lines from `map`:

```json
    "light/color-accent-hover": "2 Theme/Light/zz/color/accent-hover",
    "dark/color-accent-hover": "2 Theme/Dark/zz/color/accent-hover",
```

and add these two entries at the top of `orphanIgnore`:

```json
    "2 Theme/Light/zz/",
    "2 Theme/Dark/zz/",
```

- [ ] **Step 7: Verify the token report is still clean**

```bash
pnpm figma:verify
```

Expected: `_none_` under all four headings, exactly as in Step 1. If `Orphaned in Figma` lists `2 Theme/Light/zz/color/accent-hover` or its dark twin, the `orphanIgnore` prefixes are wrong — `diff-tokens.mjs:98` matches by `String.startsWith` on `"<Collection>/<var name>"`, so the prefix must include the trailing slash and the collection name.

- [ ] **Step 8: Verify the CSS actually changed and nothing else did**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt && echo "HTML IDENTICAL"
grep -c 'accent-hover' dist/_astro/*.css || echo "accent-hover gone from the bundle"
grep -o 'duration-slow[^;]*' dist/_astro/*.css | head -2
```

Expected: `HTML IDENTICAL`; `accent-hover gone from the bundle`; and the `--duration-slow` declaration present in the emitted stylesheet.

- [ ] **Step 9: Eyeball the reveal at both motion settings**

```bash
pnpm dev
```

Load `http://localhost:4321/about`, scroll to trigger the reveals, then toggle the motion switch in the header and reload. Expected: sections still fade and rise in, just faster; with motion off they appear immediately. Stop the server.

- [ ] **Step 10: Commit**

```bash
pnpm format:write
git add src/styles/global.css scripts/figma/token-map.json
git commit -m "refactor(tokens): drop dead accent-hover, declare the motion scale

--color-accent-hover was declared in both themes and used nowhere; its two
token-map entries go with it and the parked 2 Theme zz/ prefix moves to
orphanIgnore so figma:verify stays clean rather than reporting the Figma
variables as orphans. Adds --duration-fast/base/slow (150/250/400ms) from
the Magnet-DS Motion doc and puts .reveal on the scale (was 1.3s).
--ease-out/--ease-in-out already ship as Tailwind v4 theme defaults."
```

---

### Task 7: Remove `AboutStrip` from the Home composition

§7: "Remove `AboutStrip` from Home page composition." This is the one change in the plan that a visitor can see — the Home page loses its About section, leaving `Hero → BlogPreview → WorkPreview → ContactPreview`, which is the four-section composition Figma ships. It is last so it can be dropped without unpicking any rename.

**Files:**

- Modify: `src/pages/index.astro:2,16`
- Rename: `src/components/about/AboutStrip.astro` + `.stories.ts` → `src/components/_retired/about/`
- Modify: `scripts/pixel-manifest.mjs` — `about-aboutstrip--default` reason

**Interfaces:**

- Consumes: Tasks 3 and 5 (`_retired/about/` already exists; `index.astro` already imports the canon names).
- Produces: `src/pages/index.astro` renders exactly `Hero`, `BlogPreview`, `WorkPreview`, `ContactPreview`.

- [ ] **Step 1: Take the baseline snapshot**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-before.txt
grep -c 'aria-labelledby\|<section' dist/index.html
```

- [ ] **Step 2: Drop it from the page**

`src/pages/index.astro` — delete line 2 (`import AboutStrip from "@components/about/AboutStrip.astro";`) and line 16 (`<AboutStrip />`). The file becomes:

```astro
---
import BlogPreview from "@components/blog/BlogPreview.astro";
import ContactPreview from "@components/contact/ContactPreview.astro";
import Hero from "@components/hero/Hero.astro";
import WorkPreview from "@components/work/WorkPreview.astro";
import Layout from "@layouts/Layout.astro";
---

<Layout>
  <div>
    <Hero />
    <main class="mb-32 flex flex-col gap-16 lg:gap-24 xl:gap-36">
      <BlogPreview />
      <WorkPreview />
    </main>
    <ContactPreview />
  </div>
</Layout>
```

- [ ] **Step 3: Archive the component**

```bash
git mv src/components/about/AboutStrip.astro      src/components/_retired/about/AboutStrip.astro
git mv src/components/about/AboutStrip.stories.ts src/components/_retired/about/AboutStrip.stories.ts
grep -rn 'AboutStrip' src/ | grep -v '^src/components/_retired/' \
  && echo "STALE REF" || echo "clean"
```

Expected: `clean`. `AboutStrip.astro` imports only `@components/ui/Link.astro`, which does not move, and its story has no relative imports beyond `./AboutStrip.astro` — no depth fix needed.

- [ ] **Step 4: Update the manifest reason**

`about-aboutstrip--default` is already `skip: true`. Its comment says the removal is pending; make it past tense:

```js
  {
    id: "about-aboutstrip--default",
    skip: true,
    // Dropped from the Home composition at magnet-ds-code-convergence
    // (design.md §3 "Retired", §7) and archived to _retired/about. No Figma
    // master remains, so there is nothing to diff. Entry kept: the id is a
    // historical key. Code file is archived, not deleted.
    reason:
      "retired by magnet-ds-final-state — removed from the Home composition, no Figma master (design.md §3/§7)",
  },
```

- [ ] **Step 5: Confirm the delta is confined to the Home page**

```bash
pnpm build && node scripts/dist-snapshot.mjs > /tmp/dist-after.txt
diff /tmp/dist-before.txt /tmp/dist-after.txt | grep '^---' | sort -u
```

Expected: no `--- dist/…` file header appears in the diff other than the `dist/index.html` block — i.e. every changed line belongs to the Home page. The removed markup is the About section and nothing else.

- [ ] **Step 6: Look at the page**

```bash
pnpm dev
```

Load `http://localhost:4321/` in both themes. Expected: `Hero`, then Writing, then Work, then the contact band — no About strip, and no double gap where it used to sit (`main` uses `flex flex-col gap-16 lg:gap-24 xl:gap-36`, so the spacing collapses cleanly). Stop the server.

- [ ] **Step 7: Commit**

```bash
pnpm format:write
git add -A src scripts/pixel-manifest.mjs
git commit -m "feat(home): drop AboutStrip from the Home composition

design.md §7. Home is now Hero -> BlogPreview -> WorkPreview ->
ContactPreview, matching the Figma four-section composition. The component
is archived to _retired/about, not deleted."
```

---

### Task 8: Full gate

Every earlier task gated its own build. This runs the checks that only make sense once, over the finished tree.

**Files:**

- Modify: `.specs/01_active/magnet-ds-code-convergence/spec.md` (strike the shipped bullets)
- Possibly modify: `scripts/pixel-manifest.mjs` (only if the pixel run finds a stale selector)

**Interfaces:**

- Consumes: Tasks 0–7.
- Produces: a green tree ready for `./.specs/specs.sh archive magnet-ds-code-convergence` — which is **not** run here, because the spec's other five sections are still open.

- [ ] **Step 1: Grep the tree for every retired name**

```bash
for n in TopicChips LinkNavPost ContactText SelectedWriting WorksStrip \
         WorksPreview PostListItem SeriePostListItem SerieListItem \
         SeriePostCard AboutValues ValueCard AboutStrip homePosts \
         accent-hover; do
  printf '%-20s ' "$n"
  grep -rl "$n" src/ scripts/ 2>/dev/null \
    | grep -v '^src/components/_retired/' \
    | tr '\n' ' ' || true
  echo
done
```

Expected: only `scripts/pixel-manifest.mjs` may appear, and only in the historical-key comments and `id:` strings. Anything under `src/` outside `_retired/` is a miss — fix it before continuing.

Also check the old `Link` keys and the single-letter component are gone:

```bash
grep -rn 'variant="\(cta\|default\|icon\|iconSmall\|bold\)"' src/ && echo "STALE" || echo "clean"
grep -rn 'ui/P\.astro\|</\?P[ >]' src/ && echo "STALE" || echo "clean"
```

- [ ] **Step 2: Build, format, test**

```bash
pnpm build
pnpm format:check
pnpm test 2>&1 | tail -6
```

Expected: build succeeds (48 HTML files in `dist/`), `format:check` reports no issues, `# pass 57` / `# fail 0`.

- [ ] **Step 3: Token diff still clean**

```bash
pnpm figma:verify
pnpm figma:verify-responsive
```

Expected from `figma:verify`: `_none_` under all four headings. `figma:verify-responsive` is untouched by this plan — record its output as-is rather than acting on it.

- [ ] **Step 4: Compare the finished site against HEAD~8**

```bash
git stash list  # expect empty
node scripts/dist-snapshot.mjs > /tmp/dist-final.txt
git worktree add /tmp/ds-base HEAD~8
(cd /tmp/ds-base && pnpm install --frozen-lockfile && pnpm build \
  && node /home/jabel/code/projects/jeromeabel.github.io/scripts/dist-snapshot.mjs > /tmp/dist-base.txt)
diff /tmp/dist-base.txt /tmp/dist-final.txt
git worktree remove /tmp/ds-base --force
```

Expected: the diff contains exactly two kinds of change — the `data-variant`/`data-size` attribute rewrites from Task 1 (site-wide) and the removed About section on `dist/index.html` from Task 7. Nothing else. Adjust `HEAD~8` if the task count changed.

- [ ] **Step 5: Run the pixel gate**

```bash
pnpm dev &
sleep 8
pnpm pixel-check 2>&1 | tee /tmp/pixel-check.log | tail -40
kill %1
```

This is the ~13-minute run: 3 viewports × 2 themes over every non-`skip` manifest entry. Expected: every entry either passes or is `skip`. For each failure, decide which it is:

- a **selector/storyPath miss** left by a rename → fix the manifest entry and re-run;
- a **real pixel delta** → a task did change rendering, which contradicts its own `diff` gate; find which and fix the component, not the manifest.

Do not mark a failing entry `skip` to make the run green.

- [ ] **Step 6: Mark the shipped bullets in the spec**

In `.specs/01_active/magnet-ds-code-convergence/spec.md`, prefix each shipped bullet under **"Renames and collapses (design.md §7)"** with `~~…~~ ✅` (or delete it and add a one-line "shipped" note under the heading pointing at this plan). Under **Tokens**, strike the `--color-accent-hover`, `--duration-*` and `.reveal` bullets. Leave every other section untouched — the route rebuilds, the responsive convention, the tooling holes and the Figma-side leftovers are still open, which is why the topic stays in `01_active/`.

- [ ] **Step 7: Commit**

```bash
pnpm format:write
git add -A
git commit -m "chore(specs): mark the naming-convergence bullets shipped

Renames, Link CVA, row collapses, archive sweep and the two token bullets
are done. Route rebuilds, the responsive convention, the tooling holes and
the Figma-side leftovers stay open — topic remains in 01_active."
```

---

## Self-review notes

Checked against the spec, section by section:

- **Route rebuilds** — deliberately not covered; each bullet has an entry under "Out of scope" naming the blocker.
- **Renames and collapses** — every bullet has a task. `Link` CVA → Task 1. Row collapses → Task 4 (with the `blog.astro` wiring half deferred and the reason recorded). `TopicChips`/`LinkNavPost`/`Contact`/`ContactText` → Task 2. Home-section duplicates → Task 3. `AboutStrip` removal → Task 7. Archive list → Task 5, minus the two entries that are still live.
- **Responsive** — not covered; the section's own text says the convention is unsettled.
- **Tokens** — the `accent-hover` and motion-vocabulary bullets are Task 6. The `ArchiveTable` hover, the `WorkCard` hover verbs and the Figma-side raw-spacing sweep are deferred with reasons.
- **Tooling / Figma-side leftovers** — not covered, except the `build-brief` path fix in Task 0, which is a prerequisite rather than part of that section.
- **Not debt** — nothing in the plan touches those five items.

Name consistency across tasks: `blog/PostRow` props `{ post, type, compact, index }` are defined in Task 4 and used only there; `ui/Link` props `{ label, variant, size, icon }` are defined in Task 1 and consumed by Tasks 2, 3 and 7; `scripts/dist-snapshot.mjs` is created in Task 0 and invoked identically in every later task; `src/components/_retired/<domain>/` is created in Task 3 and extended in Tasks 5 and 7.
