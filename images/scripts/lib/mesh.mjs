// Seeded fluid-gradient mesh — pure, imports only util.mjs. Served to the
// browser verbatim by the studio (studio-design.md §3): the UI renders THIS
// geometry, not a reimplementation.
import { rng, lerp } from "./util.mjs";

// Blob array from a seed. RNG consumption order (op, cx, cy, rx, ry, rot)
// is a compatibility contract — changing it changes every mesh render.
export function generateBlobs(seed, cfg) {
  const r = rng(seed);
  const vb = cfg.viewBox;
  const blobs = [];
  for (let i = 0; i < cfg.blobs; i++) {
    const isAccent = i === cfg.blobs - 1;
    const op = Number(
      lerp(r, isAccent ? cfg.accentOpacity : cfg.tintOpacity).toFixed(2),
    );
    const cx = Math.round(lerp(r, [vb * 0.1, vb * 0.9]));
    const cy = Math.round(lerp(r, [vb * 0.1, vb * 0.9]));
    const rx = Math.round(lerp(r, cfg.radius));
    const ry = Math.round(lerp(r, cfg.radius));
    const rot = Math.round(lerp(r, [-45, 45]));
    blobs.push({ cx, cy, rx, ry, rot, op, fill: isAccent ? "accent" : "tint" });
  }
  return blobs;
}

export function meshSvg(blobs, { bg, tint, accent }, cfg, w, h) {
  const vb = cfg.viewBox;
  const shapes = blobs
    .map(
      (b) =>
        `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="${
          b.fill === "accent" ? accent : tint
        }" opacity="${b.op.toFixed(2)}" transform="rotate(${b.rot} ${b.cx} ${b.cy})"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vb} ${vb}" preserveAspectRatio="xMidYMid slice">
<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${cfg.blur}"/></filter>
<rect width="${vb}" height="${vb}" fill="${bg}"/>
<g filter="url(#b)">${shapes}</g>
</svg>`;
}
