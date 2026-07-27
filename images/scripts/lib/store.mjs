import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./content.mjs";
import { SETTINGS } from "../settings.mjs";

export function loadCrops() {
  const file = join(ROOT, SETTINGS.cropsFile);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

export function saveCrops(crops) {
  writeFileSync(
    join(ROOT, SETTINGS.cropsFile),
    JSON.stringify(crops, null, 2) + "\n",
  );
}

export const ILLUSTRATION_FILE = "images/illustration.json";

// Malformed file throws — the CLI exits and the studio refuses to boot
// rather than silently resetting hand-tuned work (studio-design.md §9).
export function loadIllustration() {
  const file = join(ROOT, ILLUSTRATION_FILE);
  if (!existsSync(file)) return { types: {}, images: {} };
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`${ILLUSTRATION_FILE}: ${err.message}`);
  }
  return { types: data.types ?? {}, images: data.images ?? {} };
}

export function saveIllustration(data) {
  writeFileSync(
    join(ROOT, ILLUSTRATION_FILE),
    JSON.stringify(data, null, 2) + "\n",
  );
}
