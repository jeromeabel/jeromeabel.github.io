# Plan D — Pixel-perfect verification (strict identity)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A dev-only Playwright script that diffs each storied component against the same component on the live preview `https://deploy-preview-104--jeromeabel.netlify.app/`, asserting **strict pixel identity** (0 mismatched pixels beyond antialiasing) for every component that has a stable live-page anchor.

**Architecture:** Strict identity is *earned* by eliminating every non-determinism source before capture: matching render container, fixed viewport, font/image ready-waits, animation freeze, and explicit masks for genuinely time-dependent regions. Each component with a live counterpart is declared in a manifest (story id ↔ live URL + selector + masks). The script captures both sides, normalizes, runs `pixelmatch`, and fails any component over the 0-pixel budget with a saved `expected/actual/diff` triptych. Components with no live anchor (variants not selected on live, all 9 legacy) are skipped and logged.

**Tech Stack:** Playwright, pixelmatch, pngjs, Node ESM script run via pnpm. Requires Plans A + B (stories to diff); Plan C legacy components are auto-skipped.

## Global Constraints

- Depends on **Plan A** (astrobook mounted) and **Plan B** (variant stories exist). Plan C is optional — legacy components are excluded by design.
- **PRECONDITION — preview/local sync:** the deploy preview must be built from the same commit as the local checkout before ANY pixel run. Concretely: commit and push everything (⚠️ `src/config/variants.ts` has uncommitted variant-switch changes as of plan time — `workFeatured`, `worksStrip`, `aboutFacts` all differ from last pushed state; preview-104 shows the OLD selections until pushed), wait for the Netlify preview rebuild to go live, then verify parity. A stale preview silently inverts the variant skip logic in Task 2 Step 3 and turns every diff into noise.
- **Strict identity** (user decision): `pixelmatch` `threshold: 0.1` (AA tolerance only), **0-pixel mismatch budget** beyond AA. A component over budget = failure.
- Tooling is **dev-only**: `pnpm add -D playwright pixelmatch pngjs`; script at `scripts/pixel-check.mjs`; run via a `package.json` script; **never** part of `pnpm build`.
- Output dir `.pixel-report/` is gitignored. Not a CI/build blocker this pass — it produces a review artifact.
- Both sides get, before capture: `document.fonts.ready` awaited, all `<img>.decode()` resolved, `prefers-reduced-motion` forced, and an injected freeze stylesheet:
  `*,*::before,*::after{animation:none!important;transition:none!important;animation-play-state:paused!important}`.
- Two viewports checked per component: **1280×… desktop** and **390×… mobile**.
- Explicit exclusions (skipped, logged with reason, never failed): `HeroAnimation` (non-deterministic canvas), `CustomImage` LQIP fade (image box masked), any variant value not selected on the live site, all 9 legacy components.

---

### Task 1: Install tooling + gitignore report dir

**Files:**
- Modify: `package.json` (devDependencies + a `pixel-check` script)
- Modify: `.gitignore`

- [x] **Step 1: Install**

Run: `pnpm add -D playwright pixelmatch pngjs && pnpm exec playwright install chromium`

- [x] **Step 2: Add the run script to `package.json`**

```json
"scripts": {
  "pixel-check": "node scripts/pixel-check.mjs"
}
```

- [x] **Step 3: Gitignore the report dir**

Add to `.gitignore`:

```
.pixel-report/
```

- [x] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "chore(pixel-check): add playwright + pixelmatch dev tooling"
```

---

### Task 2: Component anchor manifest

**Files:**
- Create: `scripts/pixel-manifest.mjs`

**Interfaces:**
- Produces: `export const MANIFEST` — array of `{ id, storyPath, liveUrl, selector, masks?, skip?, reason? }` consumed by `pixel-check.mjs`.

- [x] **Step 1: Define the manifest shape and seed it**

```js
// scripts/pixel-manifest.mjs
// story ↔ live-page anchor map for strict pixel diffing.
// id: astrobook story url segment; selector: stable element on the live page.
export const MANIFEST = [
  {
    id: 'ui-link--cta',
    storyPath: '/styleguide/?story=ui-link--cta',       // confirm astrobook's actual story-url format at impl
    liveUrl: 'https://deploy-preview-104--jeromeabel.netlify.app/',
    selector: 'a.hover-fx',                               // the CTA pill; confirm on live DOM
    masks: [],
  },
  {
    id: 'work-workgallerycard--square',
    storyPath: '/styleguide/?story=work-workgallerycard--square',
    liveUrl: 'https://deploy-preview-104--jeromeabel.netlify.app/work',
    selector: 'a[href^="/work/"]',                        // first gallery card
    masks: ['img'],                                       // mask the photo (LQIP/decode timing)
  },
  // …one entry per component with a live anchor…
  // Skipped entries carry skip:true + reason:
  { id: 'hero-heroanimation--default', skip: true, reason: 'non-deterministic canvas animation' },
  { id: 'work-workminicard--minicard', skip: true, reason: 'variant not selected on live (worksStrip=overlay-card)' },
];
```

- [x] **Step 2: Populate real selectors from the live DOM**

For each non-skipped component, load the relevant live page, inspect the DOM, and record a stable selector (prefer a class the component owns; avoid nth-child chains). Confirm astrobook's real story-url format by loading `/styleguide` and copying a story's URL. Add `masks: ['img', …]` for any `<img>`/canvas region inside the component.

- [x] **Step 3: Encode the exclusion rule for variants**

For each `VARIANTS` value NOT equal to the current `src/config/variants.ts` selection, mark its story `skip: true, reason: 'variant not selected on live (<key>=<value>)'`. Read the selections from `variants.ts` **at the commit the preview was built from** (after the sync precondition, that is local HEAD — as of plan time the pushed values were still `workFeatured=gallery-2x2-1x1`, `worksStrip=mini-card`, `aboutFacts=strip`; the local uncommitted values are `gallery-3col-1x1`/`overlay-card`/`grid` — do NOT trust either list, re-derive after the sync). Mark all 9 legacy components `skip: true, reason: 'legacy, not on live site'`.

- [x] **Step 4: Commit**

```bash
git add scripts/pixel-manifest.mjs
git commit -m "feat(pixel-check): component anchor manifest"
```

---

### Task 3: The diff script — strict-identity capture + compare

**Files:**
- Create: `scripts/pixel-check.mjs`

**Interfaces:**
- Consumes: `MANIFEST` from `./pixel-manifest.mjs`.
- Assumes the local astrobook dev server is running at `http://localhost:4321` (Step 4 documents starting it).

- [x] **Step 1: Write the capture helper (shared prep for both sides)**

```js
// scripts/pixel-check.mjs
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { MANIFEST } from './pixel-manifest.mjs';

const VIEWPORTS = [{ w: 1280, name: 'desktop' }, { w: 390, name: 'mobile' }];
const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;animation-play-state:paused!important}`;

async function shoot(page, url, selector, masks, width) {
  await page.setViewportSize({ width, height: 1200 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  });
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible' });
  return el.screenshot({ mask: (masks || []).map(m => page.locator(m)) });
}
```

- [x] **Step 2: Write the compare loop**

```js
function diff(aBuf, bBuf) {
  const a = PNG.sync.read(aBuf), b = PNG.sync.read(bBuf);
  const width = Math.min(a.width, b.width), height = Math.min(a.height, b.height);
  const out = new PNG({ width, height });
  const mismatch = pixelmatch(
    crop(a, width, height), crop(b, width, height), out.data, width, height,
    { threshold: 0.1 },
  );
  return { mismatch, out, sizeMismatch: a.width !== b.width || a.height !== b.height };
}
function crop(png, w, h) { // return RGBA buffer cropped to w×h from top-left
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0);
  return out.data;
}
```

- [x] **Step 3: Write the driver + report**

```js
mkdirSync('.pixel-report', { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const c of MANIFEST) {
  if (c.skip) { results.push({ id: c.id, status: 'skip', reason: c.reason }); continue; }
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    const story = await shoot(page, `http://localhost:4321${c.storyPath}`, c.selector, c.masks, vp.w);
    const live = await shoot(page, c.liveUrl, c.selector, c.masks, vp.w);
    await page.close();
    const { mismatch, out, sizeMismatch } = diff(story, live);
    const pass = !sizeMismatch && mismatch === 0;
    if (!pass) {
      const tag = `${c.id}.${vp.name}`;
      writeFileSync(`.pixel-report/${tag}.expected.png`, live);
      writeFileSync(`.pixel-report/${tag}.actual.png`, story);
      writeFileSync(`.pixel-report/${tag}.diff.png`, PNG.sync.write(out));
    }
    results.push({ id: c.id, vp: vp.name, status: pass ? 'pass' : 'fail', mismatch, sizeMismatch });
  }
}
await browser.close();
writeFileSync('.pixel-report/summary.json', JSON.stringify(results, null, 2));
const fails = results.filter(r => r.status === 'fail');
console.log(`pixel-check: ${results.filter(r=>r.status==='pass').length} pass, ${fails.length} fail, ${results.filter(r=>r.status==='skip').length} skip`);
for (const f of fails) console.log(`  FAIL ${f.id} @${f.vp}: ${f.mismatch} px${f.sizeMismatch ? ' (size mismatch)' : ''}`);
process.exit(fails.length ? 1 : 0);
```

- [x] **Step 4: Run against a live dev server**

```bash
pnpm dev &            # background astrobook at :4321
# wait for :4321 to answer, then:
pnpm pixel-check
```

Expected: a `summary.json` + per-fail triptychs in `.pixel-report/`, and a console tally. First run WILL surface fails — that's the point; each fail is a real story↔live discrepancy or a selector/mask needing tuning.

- [x] **Step 5: Commit the script (report dir stays gitignored)**

```bash
git add scripts/pixel-check.mjs
git commit -m "feat(pixel-check): strict-identity story-vs-live diff script"
```

---

### Task 4: Triage the first report + tune to green

**Files:**
- Modify: `scripts/pixel-manifest.mjs` (selectors/masks), story files (container wrappers)

- [x] **Step 1: Categorize each fail from `.pixel-report/`**

For every fail triptych, decide which bucket it is:
- **Container mismatch** — story renders the component without the site's `container` wrapper (max-width/padding), so widths differ. Fix: wrap the story's component in the same container the live page uses (add a decorator/wrapper in the story, or a fixed-width container arg).
- **Missing mask** — a genuinely dynamic region (image, canvas, date) wasn't masked. Fix: add to `masks`.
- **Real discrepancy** — the styleguide genuinely renders the component differently (token/font/dark-mode resolution gap). This is a true finding: record it in `notes.md`; it may indicate an astrobook CSS-resolution issue to fix via astrobook's `css`/`head` config.
- **Bad anchor** — selector grabbed the wrong element. Fix the selector.

- [x] **Step 2: Apply fixes and re-run until only real discrepancies remain**

Iterate `pnpm pixel-check` after each manifest/story tweak. Target: every non-skipped component is `pass`, OR is documented in `notes.md` as a real discrepancy with a root-cause note.

- [x] **Step 3: Write the verification summary + commit**

Append a "Pixel verification" section to `docs/specs/01_active/dev-styleguide/notes.md`: pass/fail/skip counts, the skip list with reasons, and any real discrepancies with root cause.

```bash
git add scripts/pixel-manifest.mjs src/components/**/*.stories.ts docs/specs/01_active/dev-styleguide/notes.md
git commit -m "feat(pixel-check): tune manifest/masks; document story-vs-live findings"
```

---

## Self-Review

- **Strict identity honored:** `threshold: 0.1` (AA only) + 0-pixel budget (Global Constraints, Task 3 Step 2–3).
- **Non-determinism eliminated:** font/image waits + reduced-motion + freeze stylesheet + masks (Task 3 Step 1) — the earn-it mechanics from the design.
- **Exclusions logged not failed:** `skip` entries with `reason` (Task 2), surfaced in the summary and `notes.md` (Task 4).
- **Dev-only + no build coupling:** devDeps + gitignored report + manual script (Task 1); never referenced by `pnpm build`.
- **Dependency on B:** variant stories must exist for their manifest entries; legacy (Plan C) auto-skipped.
