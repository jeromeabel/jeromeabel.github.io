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
  { w: 390, name: "mobile" },
];

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

async function shoot(page, url, selector, masks, width) {
  await page.setViewportSize({ width, height: 1200 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.addStyleTag({ content: FREEZE });
  await withTimeout(
    page.evaluate(() => document.fonts.ready),
    10000,
    "document.fonts.ready",
  );
  await withTimeout(
    page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    }),
    10000,
    "image decode",
  );
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
    const page = await browser.newPage();
    let story, live;
    try {
      story = await shoot(
        page,
        `http://localhost:4321${c.storyPath}`,
        c.selector,
        c.masks,
        vp.w,
      );
      live = await shoot(page, c.liveUrl, c.selector, c.masks, vp.w);
    } catch (err) {
      await page.close();
      results.push({
        id: c.id,
        vp: vp.name,
        status: "error",
        error: err.message,
      });
      console.log(`  ERROR ${c.id} @${vp.name}: ${err.message}`);
      continue;
    }
    await page.close();
    const { mismatch, out, sizeMismatch } = diff(story, live);
    const pass = !sizeMismatch && mismatch === 0;
    if (!pass) {
      const tag = `${c.id}.${vp.name}`;
      writeFileSync(`.pixel-report/${tag}.expected.png`, live);
      writeFileSync(`.pixel-report/${tag}.actual.png`, story);
      writeFileSync(`.pixel-report/${tag}.diff.png`, PNG.sync.write(out));
    }
    results.push({
      id: c.id,
      vp: vp.name,
      status: pass ? "pass" : "fail",
      mismatch,
      sizeMismatch,
    });
    // Progress line per component/viewport: without this, a stall (as seen
    // in dev — page.evaluate() hanging on document.fonts.ready with no
    // Playwright-level timeout, see withTimeout above) is silent for the
    // ~13 minutes it takes the whole run to finish, with no signal of
    // which entry is stuck.
    console.log(
      `  [${results.length}] ${c.id} @${vp.name}: ${pass ? "pass" : "fail"}`,
    );
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
    `  FAIL ${f.id} @${f.vp}: ${f.mismatch} px${f.sizeMismatch ? " (size mismatch)" : ""}`,
  );
for (const e of errors) console.log(`  ERROR ${e.id} @${e.vp}: ${e.error}`);
process.exit(fails.length || errors.length ? 1 : 0);
