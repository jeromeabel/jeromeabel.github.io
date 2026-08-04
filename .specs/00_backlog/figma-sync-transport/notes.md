---
title: Figma ↔ code sync — transport alternatives
created: 2026-08-03
---

Research note. No decision taken, nothing installed. Written after evaluating
[silships/figma-cli](https://github.com/silships/figma-cli) against the current
Figma MCP workflow.

## 1. The actual problem

Not "we can't talk to Figma" — we can. The problem is **where the payload lands**.

`use_figma` (Figma MCP) executes arbitrary Plugin API JavaScript against the open
file and returns the result **into the model context**. Every byte of a binding
dump is billed as tokens, twice (tool result + any reasoning over it).

Evidence from `figma-variables` Plan 2:

| Symptom | Where |
|---|---|
| `bindings.figma.json` is 212 KB (~53k tokens of raw JSON) | repo root |
| A "row-shrinking fallback" had to be documented — drop `name` from each row so a page's response fits | `scripts/figma/dump-bindings.md:85-94` |
| Task 5 stalled twice without advancing the dump | `.superpowers/sdd/plan-2-primitives-merge/progress.md` |
| The audit ran across ~8,400 bindings over many turns, split page-by-page | session log 2026-08-03 |
| MCP `get_metadata` page list is stale — pages had to be re-verified with `getNodeByIdAsync` | `scripts/figma/dump-bindings.md:20-33`, memory `project_figma-design-system` |

So the requirements for any alternative:

- **R1** — run arbitrary Plugin API JS (nothing else can read `boundVariables` with
  variable *names* + collection on our plan).
- **R2** — land the result on **disk**, not in context. Non-negotiable; this is the
  whole point.
- **R3** — read the **live** document, not a cached/CDN snapshot (fixes the stale
  page-list problem).
- **R4** — write access eventually (Plan 2 Task 6 rewrites ~5,000 bindings), but
  read-only is enough to prove the transport.
- **R5** — no Enterprise plan required.

## 2. Alternatives

### A. Status quo — Figma MCP `use_figma` (baseline)

- R1 ✅ R2 ❌ R3 ✅ R4 ✅ R5 ✅
- **Cost**: every dump byte is a token. Large pages force lossy fallbacks.
- **Also gives**: `get_design_context`, `get_screenshot`, Code Connect,
  `get_variable_defs` — none of which the CLI alternatives replace.
- **Verdict**: keep for design→code and verification. Wrong tool for bulk dumps.

### B. silships/figma-cli — Safe Mode (plugin bridge)

- R1 ✅ (`eval`, `eval --file`, `run <script.js>`) R2 ✅ R3 ✅ R4 ✅ R5 ✅
- **Transport**: a normal Figma plugin acts as a WebSocket bridge to a local Node
  CLI. No modification of the Figma app. Plugin must be started manually per session.
- **Why it fits**: `node src/index.js run /tmp/dump-page.js > /tmp/page.json`.
  The existing dump script (`scripts/figma/dump-bindings.md:38-83`) runs nearly
  unchanged — swap the trailing `return {...}` for
  `console.log(JSON.stringify({...}))`. `name` can stay: no payload ceiling. Only a
  `jq` summary enters context.
- **Maturity** (checked 2026-08-03): 839 ★, 112 forks, 11 open issues, MIT,
  created 2026-02-23, last push 2026-07-31, JavaScript. Young but active.
- **Risks**: unvetted third-party code with full Plugin API write access to the live
  DS file `ihWIWmvtQPTWgUxlrVjC2c`. Its own high-level surface (shadcn injection,
  `tokens tailwind`, `lint --fix`) is irrelevant to us and could do damage if
  invoked by accident. Read-only scripts first; the read-only backup
  `Wf4iomVMYUXlFIBV3Z8bx4` must never be the open file when writing.
- **Verdict**: best candidate. Use it as a *script runner*, ignore its feature surface.

### C. silships/figma-cli — Yolo Mode (default)

Same capability as B, different transport: patches Figma Desktop's Electron shell to
enable `--remote-debugging-port=9222` and drives it over Chrome DevTools Protocol.

- **Do not use.** An open unauthenticated CDP port hands any local process full
  control of the logged-in Figma session. The patch also re-breaks on every Figma
  update. Safe Mode buys the same `eval` for the cost of one manual plugin start.

### D. cstueberitz/figma-agent-cli

Assistant-neutral clone of the same idea (yolo CDP + safe plugin mode, arbitrary
Plugin API execution, exports to JSX/CSS/Tailwind).

- **Maturity**: 0 ★, 2 commits, MIT, self-described pre-release.
- **Verdict**: nothing B doesn't have, far less exposure. Keep as a fallback name only.

### E. Roll our own plugin bridge

A Figma dev plugin (~100 LOC: `figma.ui.onmessage` → `eval` → `postMessage`) plus a
tiny local WebSocket server, invoked from a Node script.

- R1–R5 ✅, zero third-party trust, exactly our shape.
- **Cost**: half a day, plus the maintenance. B is the same architecture already built.
- **Verdict**: the correct move **if** B's trial fails or its blast radius feels too
  wide. Not the first move.

### F. Figma REST API — Variables endpoints

- **Blocked**: `GET/POST /v1/files/:key/variables/*` and the
  `file_variables:read` / `file_variables:write` scopes are **Enterprise-plan only**,
  per-user licensed. Fails R5. Off the table for a personal portfolio.

### G. Figma REST API — file/nodes endpoints

`GET /v1/files/:key` returns node JSON that includes a `boundVariables` field with
variable *IDs*.

- **Unverified**: whether variable *names* and collection membership resolve without
  the Enterprise Variables API — probably not, which is exactly what our dump rows
  need (`varName`, `col`).
- **Also**: REST serves a published/snapshot view, so R3 (live doc) is doubtful.
- **Worth 5 minutes of `curl`** before dismissing, since it needs no local bridge at
  all and would be the cheapest possible transport if it worked.

### H. Manual dev plugin, download JSON from the plugin UI

Paste the dump script into a scratch plugin, `postMessage` the JSON to the iframe,
trigger a browser download, move the file into the repo.

- Works today, no dependencies, zero tokens, zero trust surface.
- Manual per page (5 pages), not scriptable, no write path for Task 6.
- **Verdict**: the zero-risk floor. Use it if B is rejected and E isn't worth the day.

### I. Adjacent, different problem — noted so it isn't re-litigated

- **Tokens Studio / Style Dictionary** — sync a token *source of truth* between git
  and Figma. Our tokens already live in Figma (443 primitives) and in
  `src/styles/global.css` `@theme`. Could matter for a future one-way
  Figma→CSS generator; solves nothing about binding inventory.
- **Code Connect** (via MCP) — maps Figma components to `src/components/*`. Different
  axis (component identity, not variable bindings).
- **`DesignSync` tool** — syncs a local component library to a claude.ai design-system
  project. Unrelated to Figma files despite the name.

## 3. Matrix

| | Arbitrary JS | Output to disk | Live doc | Write | Plan req. | Trust | Effort |
|---|---|---|---|---|---|---|---|
| A. MCP `use_figma` | ✅ | ❌ | ✅ | ✅ | any | first-party | none (in place) |
| B. figma-cli Safe | ✅ | ✅ | ✅ | ✅ | any | 3rd-party, 839★ | ~1h |
| C. figma-cli Yolo | ✅ | ✅ | ✅ | ✅ | any | **patches app** | ~1h |
| D. figma-agent-cli | ✅ | ✅ | ✅ | ✅ | any | 3rd-party, 0★ | ~1h |
| E. own bridge | ✅ | ✅ | ✅ | ✅ | any | ours | ~4h |
| F. REST variables | n/a | ✅ | ✅ | ✅ | **Enterprise** | first-party | — |
| G. REST files | ❌ | ✅ | ⚠️ | ❌ | any | first-party | ~10min to test |
| H. manual plugin | ✅ | ✅ | ✅ | ✅ | any | ours | ~30min, manual |

## 4. Recommended path

1. **Test G first** (10 min, no install). `curl` one node from the DS file, check
   whether `boundVariables` resolves names/collections. If yes, everything below is
   moot for reads.
2. **Trial B in Safe Mode**, read-only. Acceptance test is already written: re-dump
   the 5 real pages and compare `byCol` against the known-good baseline in
   `scripts/figma/dump-bindings.md:96-113` —
   `2 Theme` 5066 · `Scale` 4743 · `Radius` 164 · `Typography` 36 · `Container` 9 ·
   `Breakpoint` 7 · `Color Tokens` 29.
   Totals match → transport proven, Plan 2 Task 5/6 unblocks. Mismatch → discard.
3. **Only after a clean read trial**, consider B for the Task 6 write (~5,000 binding
   rewrites), with `bindings.figma.json` as the recovery baseline and a fresh file
   duplicate as the target.
4. **If B is rejected on trust grounds** → H for this dump, E if the pattern recurs.

Keep MCP for everything visual: screenshots, `get_design_context`, verification.
The CLI is a bulk-data transport, not a replacement.

## 5. Open questions

- Does REST `boundVariables` carry resolvable names on a non-Enterprise plan? (G)
- Does figma-cli's Safe-Mode plugin need a paid dev seat, or does a local
  unpublished plugin suffice?
- Does `run` stream stdout cleanly, or does it interleave CLI chatter that would
  need stripping before `jq`?
- Blast radius: can figma-cli be invoked in a way that guarantees no write? (a
  `--dry-run`, or just discipline?)
