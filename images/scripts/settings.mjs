// ============================================================================
// SETTINGS — every tunable number lives here. Nothing below this block
// contains a magic value.
// ============================================================================
export const SETTINGS = {
  palette: {
    ink: "#1e1e1e",
    paper: "#f5ffe1",
    accents: { teal: "#0d9488", coral: "#ff5a3c" },
  },

  // Output formats. `null` = original dimensions, no crop. Numbers are
  // placeholders until the final layout is decided.
  sizes: {
    cover: null,
    thumb: { w: 575, h: 300 },
    small: { w: 240, h: 140 },
    square: { w: 600, h: 600 },
  },

  // dark→ink, light→paper. Level clips flat gray ends, sigmoidal steepens
  // the midtones (fixes "not enough contrast").
  // `paperLift` (0–1) blends the paper end toward white for a lighter
  // background; `pnpm illustrate` prints the resulting WCAG contrast ratio.
  duotone: {
    level: "14%,86%",
    sigmoidal: "7x50%", // SxM: strength x midpoint
    paperLift: 0.35,
  },

  // 4-step posterize + grain, ink/paper mapped.
  riso: {
    posterizeSteps: 4,
    level: "8%,92%",
    grain: { attenuate: 0.25, blend: "Multiply" },
  },

  // Stipple was too harsh on drawings: pre-blur softens edges, ordered
  // dither is gentler than Floyd-Steinberg monochrome.
  // `pixelate` (% of target size) dithers at reduced resolution and scales
  // back with a Point filter — chunkier dots, the "more pixellized" knob.
  dither: {
    preBlur: "0x0.6",
    level: "22%,78%",
    sigmoidal: "6x50%",
    pixelate: 50,
    method: "o8x8,4", // ordered-dither map,levels ("FloydSteinberg" also valid)
    colors: ["ink", "paper"], // dark color, light color (palette keys or hex)
  },

  // Vectorized hand drawing: mkbitmap + potrace → clean curves, no pixel
  // noise. `threshold` 0–1 (higher = more black), `turdSize` drops specks.
  vector: {
    threshold: 0.5,
    turdSize: 4,
    alphaMax: 1,
  },

  // Composites: subject multiplied over the seeded fluid-gradient mesh.
  // `dither-mesh` uses the dither output, `photo-mesh` a plain contrasty
  // grayscale, `vector-mesh` the traced drawing.
  onMesh: {
    theme: "light",
    level: "12%,88%",
    sigmoidal: "6x50%",
    subjectOpacity: 0.92,
  },

  // Dark-framed screenshot (UI captures, data tables). Inner image scales to
  // `inset` × canvas.
  framed: {
    inset: 0.8,
    shadow: "60x10+0+10",
    frameBg: "#18181b",
  },

  // Seeded fluid-mesh background for entries without a cover. Rendered at
  // each size's dimensions (cover falls back to `fallback` dims).
  mesh: {
    fallback: { w: 1200, h: 630 },
    viewBox: 1000,
    blur: 100,
    blobs: 4, // total shapes; last one is always the accent
    radius: [200, 450],
    tintOpacity: [0.05, 0.14],
    accentOpacity: [0.35, 0.6],
    grain: { attenuate: 0.28, blend: "SoftLight" },
    themes: ["light", "dark"],
  },

  styles: [
    "duotone",
    "riso",
    "dither",
    "vector",
    "framed",
    "mesh",
    "photo-mesh",
    "dither-mesh",
    "vector-mesh",
  ],
  out: "images/out/review",
  cropsFile: "images/crops.json",
};
