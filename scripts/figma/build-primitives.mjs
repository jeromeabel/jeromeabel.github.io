#!/usr/bin/env node
// build-primitives.mjs — generate the Figma `1 Primitives` variable set from the
// INSTALLED Tailwind version. Reproducible: re-run after a Tailwind upgrade and
// diff. Units policy: Figma stores pixels, so rem × 16 here; unitless stays
// unitless. Colours: Tailwind v4 ships oklch(), Figma wants sRGB — converted below.
// Usage: node scripts/figma/build-primitives.mjs [outPath]   (default ./primitives.json)
// Exit: 0 ok · 2 tailwind theme.css not found. A value that matches none of the
// parsed shapes (oklch/hex/rem/px/number/percent/em) does NOT fail the build —
// it falls back to type STRING with the raw CSS text as its value.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const THEME = join(REPO, "node_modules/tailwindcss/theme.css");
const BRAND = join(REPO, "scripts/figma/brand-primitives.json");
const ROOT_PX = 16;

// Tailwind namespaces, longest first so `drop-shadow` wins over `shadow`.
const NAMESPACES = [
  "inset-shadow",
  "drop-shadow",
  "text-shadow",
  "font-weight",
  "breakpoint",
  "container",
  "perspective",
  "tracking",
  "leading",
  "spacing",
  "opacity",
  "shadow",
  "radius",
  "aspect",
  "color",
  "blur",
  "text",
  "font",
  "ease",
  "animate",
].sort((a, b) => b.length - a.length);

// Tailwind 4.3 ships these stock palettes; this project uses none of them and
// `1 Primitives` does not carry them. Dropped at generation so the Figma prune
// stays closed instead of reappearing on every regenerate.
const DROPPED_HUES = ["mauve", "mist", "olive", "taupe"];

const HUES = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];

// --- oklch -> sRGB hex (Björn Ottosson's reference conversion) ---------------
function oklchToHex(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h),
    b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const enc = (c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  };
  return "#" + lin.map((c) => enc(c).toString(16).padStart(2, "0")).join("");
}

// --- parse -------------------------------------------------------------------
let css;
try {
  css = readFileSync(THEME, "utf8");
} catch {
  console.error(`MISSING: ${THEME} — run pnpm install`);
  process.exit(2);
}
const brand = JSON.parse(readFileSync(BRAND, "utf8"));
const pkg = JSON.parse(
  readFileSync(join(REPO, "node_modules/tailwindcss/package.json"), "utf8"),
);

const variables = [];
const seen = new Set();
// Must be set from Tailwind's --spacing while parsing theme.css below (rem
// units only — see the `rem` branch and the throw right after the loop). No
// silent default: an unparseable or missing --spacing fails the build loudly
// rather than generating a wrong 36-entry spacing scale off a made-up base.
let spacingBasePx = null;

// Tailwind writes compound namespaces with a dash (`drop-shadow`, `font-weight`,
// `ease-in-out`); `1 Primitives` uses slash separators throughout. Only a dash
// before letters is a separator — a dash before digits is a ramp step, so
// `color/brand/gray-100` and `spacing/0_5` are left alone.
const slashify = (name) => name.replace(/-(?=[a-z]+(?:[/-]|$))/g, "/");

function figmaName(prop) {
  const ns = NAMESPACES.find((n) => prop === n || prop.startsWith(n + "-"));
  if (!ns) return null;
  const leaf = prop === ns ? "DEFAULT" : prop.slice(ns.length + 1);
  if (ns === "color") {
    if (DROPPED_HUES.some((h) => leaf === h || leaf.startsWith(h + "-")))
      return null;
    const hue = HUES.find((h) => leaf === h || leaf.startsWith(h + "-"));
    if (hue) return `color/${hue}/${leaf.slice(hue.length + 1) || "DEFAULT"}`;
    return slashify(`color/${leaf}`);
  }
  return slashify(`${ns}/${leaf}`);
}

for (const m of css.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)) {
  const [, prop, rawValue] = m;
  // Composite sub-properties (`--text-xl--line-height`) and non-token vars are
  // not standalone tokens — Figma has no field for them.
  if (prop.includes("--")) continue;
  const name = figmaName(prop);
  if (!name || seen.has(name)) continue;
  const raw = rawValue.trim();

  let entry = null;
  const okl = raw.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+|none)/);
  const hex = raw.match(/^#([0-9a-fA-F]{3,8})$/);
  const rem = raw.match(/^(-?[\d.]+)rem$/);
  const px = raw.match(/^(-?[\d.]+)px$/);
  const num = raw.match(/^(-?[\d.]+)$/);
  const pct = raw.match(/^(-?[\d.]+)%$/);
  const em = raw.match(/^(-?[\d.]+)em$/);

  if (okl) {
    // Handle achromatic colors (hue=none for zero-chroma colors)
    const hue = okl[3] === "none" ? 0 : Number(okl[3]);
    entry = {
      type: "COLOR",
      value: oklchToHex(Number(okl[1]) / 100, Number(okl[2]), hue),
    };
  } else if (hex) {
    // Normalize short hex codes to 6-digit format
    let hexVal = hex[1].toLowerCase();
    if (hexVal.length === 3) {
      hexVal = hexVal
        .split("")
        .map((c) => c + c)
        .join("");
    }
    entry = { type: "COLOR", value: "#" + hexVal };
  } else if (rem) {
    const remValue = Number(rem[1]);
    const pxValue = Math.round(remValue * ROOT_PX * 1000) / 1000;
    entry = { type: "FLOAT", value: pxValue };
    // Capture spacing base unit for later synthesis
    if (name === "spacing/DEFAULT") {
      spacingBasePx = pxValue;
    }
  } else if (px) entry = { type: "FLOAT", value: Number(px[1]) };
  else if (num) entry = { type: "FLOAT", value: Number(num[1]) };
  else if (pct) entry = { type: "FLOAT", value: Number(pct[1]) };
  else if (em)
    entry = { type: "FLOAT", value: Number(em[1]) * 100, referenceOnly: true }; // tracking
  else entry = { type: "STRING", value: raw }; // shadows, easings, keyframes

  if (name === "spacing/DEFAULT" && !rem) {
    throw new Error(
      `Expected Tailwind's --spacing to be expressed in rem (e.g. "0.25rem"), ` +
        `got "${raw}" — the spacing scale synthesis below assumes a rem base unit.`,
    );
  }

  // tracking/* must never be bound: Figma coerces bound letter-spacing to px,
  // destroying size-independence. Kept for reference, marked so the Figma build
  // gives it no LETTER_SPACING scope.
  if (name.startsWith("tracking/")) entry.referenceOnly = true;

  seen.add(name);
  variables.push({ name, ...entry });
}

if (spacingBasePx === null) {
  throw new Error(
    "Tailwind's --spacing custom property was not found in theme.css — " +
      "cannot derive the spacing scale base unit.",
  );
}

// Synthesize Tailwind's canonical spacing scale from the base unit.
// These keys match Tailwind's default config; values are multiples of spacingBasePx.
const SPACING_KEYS = [
  "0",
  "px",
  "0.5",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "52",
  "56",
  "60",
  "64",
  "72",
  "80",
  "96",
];
for (const key of SPACING_KEYS) {
  // `1 Primitives` spells fractional steps with an underscore (`spacing/0_5`):
  // a dot reads as a decimal in Figma's variable UI and sorts badly.
  const name = `spacing/${key.replace(".", "_")}`;
  if (seen.has(name)) continue;
  let value;
  if (key === "0") {
    value = 0;
  } else if (key === "px") {
    value = 1; // 1px literal
  } else {
    value = Math.round(Number(key) * spacingBasePx * 1000) / 1000;
  }
  seen.add(name);
  variables.push({ name, type: "FLOAT", value });
}

for (const [name, value] of Object.entries(brand)) {
  if (seen.has(name)) continue;
  seen.add(name);
  variables.push({ name, type: "COLOR", value });
}
// Tailwind ships these but theme.css does not declare them as custom properties.
// Mode-invariant, and they retire the `dark:` hack at WorkCardImage.astro:52.
for (const [name, value] of [
  ["color/white", "#ffffff"],
  ["color/black", "#000000"],
])
  if (!seen.has(name)) {
    seen.add(name);
    variables.push({ name, type: "COLOR", value });
  }

// Same case, FLOAT side: Tailwind ships `rounded-none` / `rounded-full` /
// `leading-7` as utilities without declaring a matching custom property.
for (const [name, value] of [
  ["leading/7", 28],
  ["radius/full", 9999],
  ["radius/none", 0],
])
  if (!seen.has(name)) {
    seen.add(name);
    variables.push({ name, type: "FLOAT", value });
  }

variables.sort((a, b) => a.name.localeCompare(b.name));
const out = process.argv[2] ?? "primitives.json";
writeFileSync(
  out,
  JSON.stringify(
    { generatedFrom: `tailwindcss ${pkg.version}`, variables },
    null,
    2,
  ) + "\n",
);
console.log(`${variables.length} primitives -> ${out}`);
