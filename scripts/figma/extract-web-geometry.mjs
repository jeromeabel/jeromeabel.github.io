#!/usr/bin/env node
// extract-web-geometry.mjs — Playwright over astrobook preview routes; reads a
// fixed getComputedStyle subset per component root into geometry.web.json.
// The "layout exact" prover, web side. Usage: node scripts/figma/extract-web-geometry.mjs
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { MANIFEST } from "../pixel-manifest.mjs";

const VIEWPORTS = [
  { w: 1280, name: "desktop" },
  { w: 768, name: "tablet" },
  { w: 390, name: "mobile" },
];
const THEMES = ["light", "dark"];
const PROPS = [
  "fontSize",
  "fontFamily",
  "fontWeight",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "color",
  "backgroundColor",
  "borderRadius",
  "borderTopColor",
  "width",
];

const browser = await chromium.launch();
const result = {};
for (const c of MANIFEST) {
  if (c.skip) continue;
  const previewPath = c.storyPath.replace(
    "/styleguide/dashboard/",
    "/styleguide/stories/",
  );
  result[c.id] = {};
  for (const vp of VIEWPORTS) {
    result[c.id][vp.name] = {};
    for (const theme of THEMES) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.w, height: 1200 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      if (theme === "dark")
        await page.addInitScript(() =>
          document.documentElement.classList.add("dark"),
        );
      await page.goto(`http://localhost:4321${previewPath}`, {
        waitUntil: "load",
        timeout: 30000,
      });
      const root = await page.$(c.selector);
      const props = root
        ? await root.evaluate((el, keys) => {
            const cs = getComputedStyle(el);
            const o = {};
            for (const p of keys) o[p] = cs[p];
            return o;
          }, PROPS)
        : null;
      result[c.id][vp.name][theme] = { root: props };
      await page.close();
    }
  }
  console.log(`geometry: ${c.id}`);
}
await browser.close();
writeFileSync("geometry.web.json", JSON.stringify(result, null, 2) + "\n");
console.log(`-> geometry.web.json (${Object.keys(result).length} components)`);
