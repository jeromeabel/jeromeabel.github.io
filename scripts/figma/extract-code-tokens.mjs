#!/usr/bin/env node
// extract-code-tokens.mjs — deterministic token extractor (zero LLM tokens).
// Parses src/styles/global.css (@theme, @variant dark, @utility container) into
// tokens.code.json for the figma-blog-fit token pipeline. Code is truth.
// Usage: node scripts/figma/extract-code-tokens.mjs [outPath]  (default ./tokens.code.json)
// Exit: 0 ok · 1 ROOT FONT-SIZE GUARD failed (16px assumption broken — every rem→px
//       conversion would be wrong; do NOT bypass) · 2 source/block missing · 3 unparseable value.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CSS = join(REPO, "src/styles/global.css");
const LAYOUT = join(REPO, "src/layouts/Layout.astro");
const ROOT_PX = 16;
// Tailwind v4 default breakpoint scale (px) — container max-width resolves through this.
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };

function read(p) {
  try { return readFileSync(p, "utf8"); }
  catch { console.error(`MISSING SOURCE: ${p}`); process.exit(2); }
}
const round = (n) => Math.round(n * 1000) / 1000;
const tokens = [];
const push = (name, raw, px, cls, source) => tokens.push({ name, raw, px, class: cls, source });

// Brace-matched block body extractor (handles nested {} inside a block).
function block(css, header) {
  const start = css.indexOf(header);
  if (start === -1) { console.error(`MISSING BLOCK: ${header} in global.css`); process.exit(2); }
  let depth = 0, body = "";
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") { depth++; if (depth === 1) continue; }
    if (ch === "}") { depth--; if (depth === 0) return body; }
    if (depth >= 1) body += ch;
  }
  console.error(`UNCLOSED BLOCK: ${header}`); process.exit(2);
}

const css = read(CSS);

// 1. Root font-size guard — neither Layout.astro nor global.css must override html font-size.
{
  const layout = read(LAYOUT);
  const layoutMatch = layout.match(/html[^{]*\{[^}]*font-size:\s*([\d.]+)px/s);
  if (layoutMatch && Number(layoutMatch[1]) !== ROOT_PX) {
    console.error(
      `ROOT FONT-SIZE GUARD FAILED: Layout.astro sets ${layoutMatch[1]}px, expected ${ROOT_PX}px — ` +
        `all rem→px conversions invalid. Update ROOT_PX only after verifying the app change.`,
    );
    process.exit(1);
  }

  // Check global.css for html { font-size } declaration
  const cssHtmlMatch = css.match(/html[^{]*\{[^}]*font-size:\s*([\d.]+)px/s);
  if (cssHtmlMatch && Number(cssHtmlMatch[1]) !== ROOT_PX) {
    console.error(
      `ROOT FONT-SIZE GUARD FAILED: global.css html rule sets ${cssHtmlMatch[1]}px, expected ${ROOT_PX}px — ` +
        `all rem→px conversions invalid. Update ROOT_PX only after verifying the app change.`,
    );
    process.exit(1);
  }

  // Check global.css for :root { font-size } declaration
  const cssRootMatch = css.match(/:root[^{]*\{[^}]*font-size:\s*([\d.]+)px/s);
  if (cssRootMatch && Number(cssRootMatch[1]) !== ROOT_PX) {
    console.error(
      `ROOT FONT-SIZE GUARD FAILED: global.css :root rule sets ${cssRootMatch[1]}px, expected ${ROOT_PX}px — ` +
        `all rem→px conversions invalid. Update ROOT_PX only after verifying the app change.`,
    );
    process.exit(1);
  }
}

// 2. @theme — font stacks + light semantic colors
{
  const theme = block(css, "@theme");
  for (const m of theme.matchAll(/--(font-[\w-]+):\s*([\s\S]*?);/g))
    push(m[1], m[2].replace(/\s+/g, " ").trim(), null, "font", "global.css @theme");
  for (const m of theme.matchAll(/--(font-[\w-]+):\s*([\s\S]*?);/g)) {
    const stack = m[2].replace(/\s+/g, " ").trim();
    // First family only — Figma FONT_FAMILY variables hold one family, not a
    // fallback stack, so this is the value the diff can actually compare.
    const first = stack.split(",")[0].trim().replace(/^["']|["']$/g, "");
    push(`${m[1]}-primary`, first, null, "font", "global.css @theme");
  }
  for (const m of theme.matchAll(/--(color-[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g))
    push(`light/${m[1]}`, m[2].toLowerCase(), null, "color", "global.css @theme");
}

// 3. @variant dark — dark color overrides
{
  const dark = block(css, "@variant dark");
  for (const m of dark.matchAll(/--(color-[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g))
    push(`dark/${m[1]}`, m[2].toLowerCase(), null, "color", "global.css @variant dark");
}

// 4. @utility container — max-width (breakpoint var → px) + inline padding
{
  const c = block(css, "@utility container");
  const varMatch = c.match(/max-width:\s*var\(--breakpoint-([\w]+)\)/);
  const litMatch = c.match(/max-width:\s*([\d.]+)(rem|px)/);
  if (varMatch) {
    const px = BREAKPOINTS[varMatch[1]];
    if (px == null) { console.error(`UNKNOWN BREAKPOINT: --breakpoint-${varMatch[1]}`); process.exit(3); }
    push("container-max-width", `var(--breakpoint-${varMatch[1]})`, px, "px-css", "global.css @utility container");
  } else if (litMatch) {
    const px = litMatch[2] === "rem" ? round(Number(litMatch[1]) * ROOT_PX) : Number(litMatch[1]);
    push("container-max-width", `${litMatch[1]}${litMatch[2]}`, px, "px-css", "global.css @utility container");
  } else { console.error("UNPARSEABLE container max-width"); process.exit(3); }

  const pad = c.match(/padding-inline:\s*([\d.]+)(rem|px)/);
  if (pad) {
    const px = pad[2] === "rem" ? round(Number(pad[1]) * ROOT_PX) : Number(pad[1]);
    push("container-padding-inline", `${pad[1]}${pad[2]}`, px, "px-css", "global.css @utility container");
  }
}

tokens.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name));
const out = process.argv[2] ?? "tokens.code.json";
writeFileSync(out, JSON.stringify({ rootPx: ROOT_PX, tokens }, null, 2) + "\n");
console.log(`${tokens.length} tokens -> ${out}`);
