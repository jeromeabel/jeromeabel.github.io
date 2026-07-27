import { execFileSync } from "node:child_process";
import { hash } from "./util.mjs";

export function magick(args) {
  execFileSync("convert", args, { stdio: ["ignore", "inherit", "pipe"] });
}

export function potrace(args) {
  execFileSync("potrace", args, { stdio: ["ignore", "inherit", "pipe"] });
}

export function imageSize(file) {
  const out = execFileSync("identify", ["-format", "%w %h", `${file}[0]`], {
    encoding: "utf8",
  });
  const [w, h] = out.trim().split(" ").map(Number);
  return { w, h };
}

// Seeded grain overlay — `-seed` precedes the paren group so `+noise` is
// deterministic (illustration determinism guardrail, design.md §6).
export function grainArgs(w, h, { attenuate, blend }, seedStr) {
  return [
    "-seed",
    String(hash(seedStr)),
    "(",
    "-size",
    `${w}x${h}`,
    "xc:gray50",
    "-attenuate",
    String(attenuate),
    "+noise",
    "Gaussian",
    "-colorspace",
    "Gray",
    ")",
    "-compose",
    blend,
    "-composite",
  ];
}
