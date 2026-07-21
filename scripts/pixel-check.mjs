// scripts/pixel-check.mjs
//
// Strict-identity pixel diff: astrobook story vs. live deploy anchor.
// Dev-only tool — never referenced by `pnpm build`. See docs/specs/01_active/dev-styleguide/.
//
// Usage: pnpm dev (background, :4321) then `pnpm pixel-check`.

import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { MANIFEST } from "./pixel-manifest.mjs";

const VIEWPORTS = [
  { w: 1280, name: "desktop" },
  { w: 768, name: "tablet" },
  { w: 390, name: "mobile" },
];
const THEMES = ["light", "dark"];

// Freezes CSS animations/transitions so both captures are deterministic,
// on top of `reducedMotion: 'reduce'` emulation (belt-and-braces: some
// animations are driven by inline style / JS rAF loops that don't honor
// prefers-reduced-motion media queries).
const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;animation-play-state:paused!important}`;

// page.evaluate() has no built-in timeout (unlike goto/waitFor/locator
// actions), so a stuck in-page promise — e.g. document.fonts.ready never
// settling because a @font-face request stalls on a flaky connection to
// the live deploy preview — hangs the whole run forever with no
// TimeoutError to catch. Found this the hard way: a first real run stalled
// for 15+ minutes on one component with zero progress and no error output.
// Race every await against a hard deadline so a stall surfaces as a
// catchable error instead of a silent hang.
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms: ${label}`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function shoot(page, url, selector, masks, width, theme) {
  await page.setViewportSize({ width, height: 1200 });
  // Same mechanism as the site's real dark-mode toggle (ThemeToggle.astro):
  // add/remove `.dark` on <html>. Applied identically to both the story
  // (Astrobook) and live captures so light/dark pairs are shot in matching
  // themes — otherwise the diff would compare apples to oranges.
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
  if (theme === "dark") {
    await page.addInitScript(() => document.documentElement.classList.add("dark"));
  }
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.addStyleTag({ content: FREEZE });
  await withTimeout(
    page.evaluate(() => document.fonts.ready),
    10000,
    "document.fonts.ready",
  );
  // Best-effort: decode already-loaded images so their painted pixels are
  // stable before capture. Filter to complete images — a lazy/offscreen <img>
  // (common at the 390px mobile viewport, where the page is taller and more
  // images sit below the fold) may never trigger load, so its .decode()
  // promise neither resolves nor rejects and hangs the whole 10s budget.
  // Treat a stall as non-fatal instead of aborting the capture: the component
  // under test always masks its own <img>/canvas regions, so page-level decode
  // state cannot affect the diff.
  try {
    await withTimeout(
      page.evaluate(async () => {
        await Promise.all(
          [...document.images]
            .filter((i) => i.complete && i.naturalWidth > 0)
            .map((i) => i.decode().catch(() => {})),
        );
      }),
      10000,
      "image decode",
    );
  } catch (err) {
    console.log(`  (non-fatal) ${err.message} @ ${url}`);
  }
  const el = page.locator(selector).first();
  await el.waitFor({ state: "visible", timeout: 15000 });
  // .screenshot() resolves with a Buffer of PNG-encoded bytes (default
  // screenshot type is 'png'), which is exactly what PNG.sync.read()
  // downstream expects — no re-encoding needed between capture and diff.
  return withTimeout(
    el.screenshot({ mask: (masks || []).map((m) => page.locator(m)) }),
    15000,
    "element screenshot",
  );
}

function crop(png, w, h) {
  // return RGBA buffer cropped to w×h from top-left
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, 0, 0, w, h, 0, 0);
  return out.data;
}

function diff(aBuf, bBuf) {
  const a = PNG.sync.read(aBuf),
    b = PNG.sync.read(bBuf);
  const width = Math.min(a.width, b.width),
    height = Math.min(a.height, b.height);
  const out = new PNG({ width, height });
  const mismatch = pixelmatch(
    crop(a, width, height),
    crop(b, width, height),
    out.data,
    width,
    height,
    { threshold: 0.1 },
  );
  return {
    mismatch,
    out,
    sizeMismatch: a.width !== b.width || a.height !== b.height,
  };
}

mkdirSync(".pixel-report", { recursive: true });
const browser = await chromium.launch();
const results = [];

for (const c of MANIFEST) {
  if (c.skip) {
    results.push({ id: c.id, status: "skip", reason: c.reason });
    continue;
  }
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      // Fresh page per (component, viewport, theme): addInitScript()
      // persists for the lifetime of a Page, so reusing one page across
      // themes would leak the dark-mode init script from a prior dark
      // capture into a later light capture.
      const page = await browser.newPage();
      let story, live;
      try {
        const previewPath = c.storyPath.replace(
          "/styleguide/dashboard/",
          "/styleguide/stories/",
        );
        story = await shoot(
          page,
          `http://localhost:4321${previewPath}`,
          c.selector,
          c.masks,
          vp.w,
          theme,
        );
        live = await shoot(page, c.liveUrl, c.selector, c.masks, vp.w, theme);
      } catch (err) {
        await page.close();
        results.push({
          id: c.id,
          vp: vp.name,
          theme,
          status: "error",
          error: err.message,
        });
        console.log(`  ERROR ${c.id} @${vp.name}/${theme}: ${err.message}`);
        continue;
      }
      await page.close();
      const { mismatch, out, sizeMismatch } = diff(story, live);
      const pass = !sizeMismatch && mismatch === 0;
      if (!pass) {
        const tag = `${c.id}.${vp.name}.${theme}`;
        writeFileSync(`.pixel-report/${tag}.expected.png`, live);
        writeFileSync(`.pixel-report/${tag}.actual.png`, story);
        writeFileSync(`.pixel-report/${tag}.diff.png`, PNG.sync.write(out));
      }
      results.push({
        id: c.id,
        vp: vp.name,
        theme,
        status: pass ? "pass" : "fail",
        mismatch,
        sizeMismatch,
      });
      // Progress line per component/viewport/theme: without this, a stall
      // (as seen in dev — page.evaluate() hanging on document.fonts.ready
      // with no Playwright-level timeout, see withTimeout above) is silent
      // for the ~13 minutes it takes the whole run to finish, with no
      // signal of which entry is stuck.
      console.log(
        `  [${results.length}] ${c.id} @${vp.name}/${theme}: ${pass ? "pass" : "fail"}`,
      );
    }
  }
}
await browser.close();

writeFileSync(".pixel-report/summary.json", JSON.stringify(results, null, 2));
const fails = results.filter((r) => r.status === "fail");
const errors = results.filter((r) => r.status === "error");
console.log(
  `pixel-check: ${results.filter((r) => r.status === "pass").length} pass, ${fails.length} fail, ${results.filter((r) => r.status === "skip").length} skip, ${errors.length} error`,
);
for (const f of fails)
  console.log(
    `  FAIL ${f.id} @${f.vp}/${f.theme}: ${f.mismatch} px${f.sizeMismatch ? " (size mismatch)" : ""}`,
  );
for (const e of errors) console.log(`  ERROR ${e.id} @${e.vp}/${e.theme}: ${e.error}`);
process.exit(fails.length || errors.length ? 1 : 0);
