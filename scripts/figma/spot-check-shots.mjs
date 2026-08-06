#!/usr/bin/env node
// spot-check-shots.mjs — capture live-route screenshots at given viewports/themes
// for side-by-side comparison against Figma frames (figma-verify Pass 1 spot-check).
// Edit TARGETS below, then: node scripts/figma/spot-check-shots.mjs [outDir]
import { chromium } from "playwright";

const outDir = process.argv[2] || ".";

const TARGETS = [
  {
    url: "http://localhost:4321/blog/api-endpoints-with-astro",
    width: 1280,
    theme: "light",
    name: "post-1280-light",
  },
  {
    url: "http://localhost:4321/blog/api-endpoints-with-astro",
    width: 390,
    theme: "dark",
    name: "post-390-dark",
  },
];

const browser = await chromium.launch();
for (const t of TARGETS) {
  const page = await browser.newPage({
    viewport: { width: t.width, height: 1000 },
  });
  await page.goto(t.url, { waitUntil: "domcontentloaded" });
  if (t.theme === "dark") {
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  await page.screenshot({ path: `${outDir}/${t.name}.png`, fullPage: true });
  await page.close();
  console.log(`saved ${t.name}.png`);
}
await browser.close();
