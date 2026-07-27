// Pure helpers — no node imports, no SETTINGS import. The studio serves this
// file to the browser verbatim (studio-design.md §4), so palette is always an
// explicit argument.

export function hash(str) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — deterministic RNG from string hash
export function rng(seed) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (r, [min, max]) => min + r() * (max - min);

export const color = (palette, key) =>
  palette.accents[key] ?? palette[key] ?? key;

export const accentFor = (palette, slug) => {
  const keys = Object.keys(palette.accents);
  return keys[hash(slug) % keys.length];
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hexOf = ([r, g, b]) =>
  "#" +
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// Blend a color toward white. amount 0 = untouched, 1 = pure white.
export const lighten = (palette, c, amount) =>
  hexOf(rgb(color(palette, c)).map((v) => v + (255 - v) * amount));

// WCAG 2.x relative luminance + contrast ratio (see settings.mjs duotone notes).
export function contrastRatio(palette, a, b) {
  const lum = (c) => {
    const [r, g, bl] = rgb(color(palette, c)).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
