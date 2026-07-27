import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// lib/ sits at images/scripts/lib → repo root is three levels up.
export const ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

// ============================================================================
// Content scan — entries = { slug, img? } from frontmatter `img:` lines
// ============================================================================
export function scanContent() {
  const entries = [];
  const push = (file, slug) => {
    const head = readFileSync(file, "utf8").slice(0, 2000);
    const m = head.match(/^img(?:_preview)?:\s*(?:"([^"]+)"|(\S+))\s*$/m);
    const rel = m?.[1] ?? m?.[2];
    entries.push({ slug, img: rel ? resolve(dirname(file), rel) : null });
  };

  for (const coll of ["post", "work"]) {
    const base = join(ROOT, "src/content", coll);
    for (const dir of readdirSync(base, { withFileTypes: true })) {
      if (dir.isDirectory()) push(join(base, dir.name, "index.md"), dir.name);
    }
  }
  const serieBase = join(ROOT, "src/content/serie");
  for (const item of readdirSync(serieBase, { withFileTypes: true })) {
    if (item.isFile() && item.name.endsWith(".md")) {
      push(join(serieBase, item.name), item.name.replace(/\.md$/, ""));
    } else if (item.isDirectory()) {
      for (const f of readdirSync(join(serieBase, item.name))) {
        if (f.endsWith(".md")) {
          push(
            join(serieBase, item.name, f),
            `${item.name}--${f.replace(/\.md$/, "")}`,
          );
        }
      }
    }
  }
  return entries;
}
