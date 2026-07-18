# Astro API Endpoints — Blog Post & Playground Realignment

**Date:** 2026-05-07
**Status:** Draft, awaiting review
**Owner:** Jerome Abel
**Repos involved:**
- Blog: `/home/jabel/code/projects/jeromeabel.github.io` (post lives at `src/content/post/api-endpoints-with-astro/index.md`)
- Playground: `/home/jabel/code/projects/astro-playground` (companion runnable code)

---

## 1. Goal

Realign the blog post *Adding API Endpoints to an Astro Project* and its companion playground so they teach a single, coherent progression of server-side request handling in Astro:

1. `GET` endpoint
2. `GET` with dynamic params (`[id].ts`)
3. `POST` with redirect (Pattern A)
4. `POST` with JSON response (Pattern B)
5. Astro Action (Pattern C — modern default)

Reader leaves with: (a) a working mental model of where code runs, (b) the ability to pick the right pattern for a given form, (c) the knowledge that Actions is the modern default but the older patterns are still legitimate.

The post and playground will share one domain (Avengers Retirement Home), one data model (`heroes.ts`), and one URL scheme (`/residents/...` and `/api/residents/...`). The post links to a live Netlify deployment so readers can try each pattern in their browser without cloning.

## 2. Why this realignment

The current blog post draft (`api-endpoints-with-astro/index.md`) and the current playground code have diverged:

- **Different data**: post uses `jsonplaceholder.typicode.com`; playground uses local `heroes.ts`.
- **Different domain**: post uses "subscribers/newsletter"; playground uses "residents/Avengers Retirement Home".
- **Missing patterns in playground**: post teaches POST-redirect and POST-JSON; playground only implements Astro Actions.
- **Demoted Actions in post**: Astro 6 makes Actions the recommended path for forms; the post relegates them to a closing footnote.
- **No deployment story**: post mentions adapters in passing; playground has no adapter and there's no live URL.

A reader following the post cannot copy-paste its core POST examples and see them work in the playground. This spec fixes that.

## 3. Domain model

### 3.1 Theme

Avengers Retirement Home — a retirement home open to all heroes (not just retired Avengers). Heroes apply to *join*; once accepted they become *residents*.

### 3.2 Data

`src/data/heroes.ts` (already present in the playground, no schema changes):

```ts
export type Hero = {
  id: number;
  name: string;
  alias: string;
  email: string;
  retiredYear: number;
};

export const heroes: Hero[];      // 10 heroes — the eligibility roster
export const residents: Hero[];   // pre-seeded with 3 (Tony, Natasha, Thor)
```

`retiredYear` is shown in the UI as flavor (e.g. "retired 2019") but is **not** used as an eligibility filter.

### 3.3 Rules

| Submission | Outcome |
|---|---|
| Email matches a hero in `heroes`, not yet in `residents` | Push to `residents`, show welcome message |
| Email matches a hero already in `residents` | No-op, show "you're already settled in" message |
| Email does not match any hero (e.g. `bob@example.com`) | Reject with humorous message (Pattern A redirects to `/rejected`; Pattern B returns rejection JSON; Pattern C throws `ActionError({ code: "FORBIDDEN" })`) |

`residents` is in-memory only. It resets on dev restart and on every Netlify cold start. This is honest about being a demo and is mentioned in the post's "What I learned" section with a one-line callout pointing readers at "swap for a DB call in production".

## 4. Playground architecture

### 4.1 File structure (target)

```
astro-playground/
├── astro.config.mjs                 ← + @astrojs/netlify adapter
├── package.json                     ← + @astrojs/netlify dep
├── README.md                        ← link to live demo + post
├── src/
│   ├── data/heroes.ts               ← unchanged
│   ├── actions/index.ts             ← rename action `subscribe` → `join`
│   ├── styles/global.css            ← unchanged
│   └── pages/
│       ├── index.astro              ← hub (update link to /residents)
│       ├── residents/
│       │   ├── index.astro          ← residents hub: links + GET-only list
│       │   ├── list.astro           ← GET demo: page calls API via fetch
│       │   ├── join-redirect.astro  ← Pattern A form
│       │   ├── join-json.astro      ← Pattern B form
│       │   └── join-action.astro    ← Pattern C form (Astro Action)
│       ├── welcome.astro            ← redirect target on success
│       ├── rejected.astro           ← redirect target on rejection (reads ?reason=)
│       └── api/residents/
│           ├── index.ts             ← GET — return residents JSON
│           ├── [id].ts              ← GET by id from heroes roster
│           ├── join-redirect.ts     ← POST — validate, mutate, 307
│           └── join-json.ts         ← POST — validate, mutate, JSON
└── (no /subscribers route — deleted)
```

### 4.2 Naming rationale

- **`/residents/...`** for pages, **`/api/residents/...`** for endpoints — domain noun matches between pages and API.
- **`join-redirect.ts` / `join-json.ts`** instead of `add.ts` / `add2.ts` — names communicate both the domain action (*join*) and the teaching pattern (*redirect* vs *json*).
- **Action named `join`** instead of `subscribe` — matches the new vocabulary.

### 4.3 Data flow per pattern

| Pattern | Browser | Network | Server | Result |
|---|---|---|---|---|
| GET list | `await fetch('/api/residents/')` from page frontmatter | 1 HTTP | reads `residents` | server-rendered list |
| GET by id | direct request to `/api/residents/3` | 1 HTTP | reads `heroes` | one hero JSON |
| POST redirect | `<form method="POST" action="/api/residents/join-redirect">` | 1 HTTP, then redirect | mutates `residents`, returns 307 | full page nav to `/welcome` or `/rejected` |
| POST JSON | `<form>` + JS handler intercepts submit, calls `fetch()` | 1 fetch | mutates `residents`, returns JSON | DOM update in place, no nav |
| Action | `<form action={actions.join}>` | 1 HTTP managed by Astro | Zod-validated `join` handler | page re-renders, reads via `Astro.getActionResult()` |

### 4.4 GET demo (`/residents/list`) — implementation note

Show **two** ways the page can call the GET endpoint:

1. `await fetch(\`${Astro.url.origin}/api/residents/\`)` — closer to how a client-side script would call it.
2. `import { GET } from "../api/residents/index"; await GET(Astro)` — direct import, no HTTP round-trip.

Pick the direct-import version as the default in the page (matches what `subscribers.astro` already does). Mention the fetch alternative in the post's prose, with the trade-off (HTTP roundtrip vs direct call).

### 4.5 Error handling

- Invalid email format: caught client-side by `type="email"` for redirect/JSON; caught by Zod for Action.
- Non-hero email: redirect → `/rejected?reason=...`; JSON → `{ ok: false, msg: ... }`; Action → `ActionError({ code: "FORBIDDEN", message: ... })`.
- Already-resident: all three patterns return success with an idempotent "you're already settled in" message — not an error.
- Server errors: not expected with in-memory data; not specifically handled in this scope.

## 5. Blog post outline

Target length: ~2000 words, ~10 code blocks. (Current draft is ~1500 words; growth comes from full Actions section.)

| # | Section | Length | Maps to playground |
|---|---|---|---|
| 0 | Frontmatter + intro paragraph + live demo link | ~120 words | live Netlify URL at top |
| 1 | Static → server: opting routes in | ~150 words | `astro.config.mjs` snippet |
| 2 | GET: list residents | ~200 words + 2 code blocks | `/residents/list` + `/api/residents/index.ts` |
| 3 | GET by id: dynamic routes | ~120 words + 1 code block | `/api/residents/[id].ts` |
| 4 | POST + redirect (Pattern A) | ~250 words + 3 code blocks | `/residents/join-redirect` + `/welcome` + `/rejected` |
| 5 | POST + JSON (Pattern B) | ~250 words + 2 code blocks | `/residents/join-json` |
| 6 | Astro Actions (Pattern C) | ~250 words + 2 code blocks | `/residents/join-action` + `actions/index.ts` |
| 7 | Comparing the three POST patterns | ~200 words + small table | (no new code) |
| 8 | Astro documentation | ~80 words, 4 links | — |
| 9 | What I learned | ~250 words, 6 bullets | — |

### 5.1 Section 1 — opening idiom change

Current draft leads with `output: "server"` as the primary approach. Change: lead with the per-route opt-in idiom (`export const prerender = false`) on a static-default project, since this is the Astro 6 idiom (the explicit `hybrid` mode was merged into `static` in v5). Mention `output: "server"` as the alternative for sites that should be fully on-demand.

### 5.2 Section 7 — comparison table (proposed)

| Pattern | JS required on client? | Page navigation? | Validation style | When to pick |
|---|---|---|---|---|
| POST + redirect | No | Yes (full nav) | Manual in handler | Progressive enhancement, server-only flows |
| POST + JSON | Yes | No (DOM update) | Manual in handler | Inline feedback, smoother UX |
| Astro Action | No (zero-JS by default) | No (page re-renders) | Zod via `defineAction` | New code in Astro 5+ |

### 5.3 What I learned (refresh — 6 bullets)

1. File-based API routing is Astro's underrated feature.
2. Three POST patterns cover most use cases — pick by audience.
3. Dynamic routes use the same bracket syntax as pages.
4. Direct handler imports skip the network — useful when API and page colocate.
5. `output: "server"` is one option, not the only one. Per-route `prerender = false` keeps the rest of the site static.
6. Astro Actions are the modern default — less boilerplate, type-safe, zero-JS by default.

## 6. Deployment plan

1. Install `@astrojs/netlify` in the playground.
2. Edit `astro.config.mjs`:
   ```js
   import { defineConfig } from 'astro/config';
   import netlify from '@astrojs/netlify';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     adapter: netlify(),
     vite: { plugins: [tailwindcss()] },
   });
   ```
3. Keep `output: "static"` (Astro 6 default). Each API endpoint and form page already declares `export const prerender = false`.
4. Connect the GitHub repo to Netlify, deploy on a free subdomain.
5. **Suggested live URL:** `astro-playground-jeromeabel.netlify.app` (override at deploy time if taken or if you prefer a different name).
6. Post-deployment update list:
   - Playground `README.md` — link to live demo + back-link to the blog post
   - Blog post intro — link to live demo
   - Blog post "Deploying to Netlify" section — link to live demo
7. Smoke-test before publishing the post: submit `steve@rogers.com` (success), `peter@parker.com` (rejected), `tony@stark.com` (already a resident) — through each of the three POST patterns on the live URL.

## 7. Out of scope

- **Persistence beyond memory.** `residents` resets on every cold start. Mentioned as a one-line callout pointing at "swap for a DB call in production".
- **Auth, sessions, accounts.** Anyone can submit any email.
- **Rate limiting, spam protection, CSRF.** Tutorial scope.
- **Visual polish beyond Tailwind defaults.** Playground stays minimal.
- **Tests.** No test suite exists in the playground today; not adding one for this scope.
- **Diagrams.** Locked: prose + code only.
- **Step-by-step git branches.** Locked: single project, all patterns coexist on `main`.
- **Migrating /subscribers as an archive.** Locked: the existing `/subscribers` route is replaced cleanly by `/residents/...`.

## 8. Implementation order

1. **Playground rename + restructure**
   - Rename `actions/index.ts: subscribe` → `join`
   - Delete `src/pages/subscribers.astro`
   - Create `src/pages/residents/{index,list,join-redirect,join-json,join-action}.astro`
   - Create `src/pages/{welcome,rejected}.astro`
   - Move `api/subscribers/*` → `api/residents/*`
   - Add `api/residents/{join-redirect,join-json}.ts`
   - Update `src/pages/index.astro` hub link
2. **Netlify adapter + deploy**
   - Install `@astrojs/netlify`
   - Update `astro.config.mjs`
   - Push, connect Netlify, deploy
   - Capture final URL
3. **Blog post rewrite**
   - Rewrite end-to-end against new playground (10 sections per outline)
   - Insert live demo URL in 3 places
   - Remove `draft: true` only after final review
4. **Verification**
   - Run all three POST patterns on the live URL
   - Verify code blocks in the post compile (copy-paste check)
   - Verify all anchor links to playground files resolve

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Live demo `residents` array drifts from post text (someone joins, list looks different than post screenshots) | Pre-seed list documented; no screenshots — readers see live state |
| Netlify cold start latency on first request makes demo feel broken | Add a one-line "first request may be slow" note in the demo page |
| Astro 6 minor releases break `defineAction` or adapter API | Pin Astro version in playground `package.json`; mention version in post |
| Netlify subdomain `astro-playground` already taken | Fall back to alternative; update spec post-deploy with the chosen URL |
| Reader confusion if they hit `/subscribers` (old URL) | The blog post is currently `draft: true` — the `/subscribers` URL was never publicly indexed. Default 404 on the deleted route is acceptable; no redirect needed. |

## 10. Acceptance criteria

- [ ] Playground builds (`pnpm build`) with no errors.
- [ ] All five patterns work locally on `pnpm dev`.
- [ ] Live Netlify URL serves the playground; all five patterns work in production.
- [ ] Blog post no longer has `draft: true`.
- [ ] Every code block in the blog post is reproducible from the playground.
- [ ] Live demo URL appears in: blog post intro, blog post deployment section, playground README.
- [ ] No references to `/subscribers`, `add.ts`, `add2.ts`, or `jsonplaceholder` remain in either repo.
