#!/usr/bin/env node
// build-brief.mjs — assemble a self-contained Magnet-DS Figma brief for pasting
// into a Figma agent. Briefs under .specs/01_active/magnet-ds-final-state/figma/
// keep their shared parts (run rules, helper preludes) in `_*.md` / `_*.js`
// siblings and reference them with `<!-- include: _file -->` markers; this
// script resolves those markers and prints the whole brief to stdout.
// `use_figma` has no import and its sandbox scope resets per call, so the
// prelude must still be pasted with every brief — it just lives in one place.
// Usage: node build-brief.mjs <task-id|path>   e.g. build-brief.mjs P2-T04
//        node build-brief.mjs --list
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BRIEF_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.specs/01_active/magnet-ds-final-state/figma",
);
const INCLUDE = /^<!-- include: ([\w.-]+) -->[ \t]*$/gm;

const die = (msg) => {
  console.error(`error: ${msg}`);
  process.exit(1);
};

const briefs = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
        .sort()
    : [];

// A task id ("P2-T04") resolves inside BRIEF_DIR; a path is used as-is and its
// own directory becomes the include root.
function resolveBrief(arg) {
  if (arg.includes("/") || existsSync(arg)) {
    if (!existsSync(arg) || !statSync(arg).isFile())
      die(`no such brief: ${arg}`);
    return arg;
  }
  const id = arg.toUpperCase();
  const hits = briefs(BRIEF_DIR).filter((f) =>
    f.toUpperCase().startsWith(`${id}-`),
  );
  if (hits.length === 0) die(`unknown task \`${arg}\` — try --list`);
  if (hits.length > 1)
    die(`\`${arg}\` matches ${hits.length}: ${hits.join(", ")}`);
  return join(BRIEF_DIR, hits[0]);
}

// Single pass: `_run-rules.md` and the preludes carry no markers of their own.
function expand(path) {
  const root = dirname(path);
  return readFileSync(path, "utf8").replace(INCLUDE, (_, name) => {
    const target = join(root, name);
    if (!existsSync(target))
      die(`${basename(path)}: missing include \`${name}\``);
    const body = readFileSync(target, "utf8").trimEnd();
    return name.endsWith(".js") ? "```js\n" + body + "\n```" : body;
  });
}

const [arg] = process.argv.slice(2);
if (!arg) die("usage: build-brief.mjs <task-id|path> | --list");
if (arg === "--list") {
  for (const f of briefs(BRIEF_DIR))
    console.log(f.split("-").slice(0, 2).join("-").padEnd(7), f);
  process.exit(0);
}
process.stdout.write(expand(resolveBrief(arg)));
