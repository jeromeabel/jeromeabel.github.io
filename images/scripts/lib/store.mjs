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
