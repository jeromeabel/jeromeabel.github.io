# API Endpoints Blog & Playground Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Realign the blog post `api-endpoints-with-astro/index.md` and the companion `astro-playground` repo so they teach a single coherent progression — `GET`, `GET [id]`, `POST + redirect`, `POST + JSON`, `Astro Action` — using one shared domain (Avengers Retirement Home), one data file (`heroes.ts`), and one URL scheme (`/residents/...` and `/api/residents/...`), with a live Netlify deployment linked from the post.

**Architecture:** The playground is the source of truth for the runnable code; the blog post mirrors it section-for-section. We refactor the playground first (rename `subscribers` → `residents`, rename action `subscribe` → `join`, add the two missing POST endpoints, add the per-pattern demo pages, plus `welcome` / `rejected` redirect targets). Then we bolt on the `@astrojs/netlify` adapter and deploy. Then we rewrite the post end-to-end against the new playground and remove `draft: true`.

**Tech Stack:**
- Astro 6 (`^6.2.2`), strict TypeScript, Tailwind CSS 4 (Vite plugin)
- `astro:actions` + `astro:schema` (Zod) for Pattern C
- `@astrojs/netlify` adapter for deployment
- Two repos: `astro-playground` (code) and `jeromeabel.github.io` (post)
- Package manager: `pnpm`

**Working directories — read carefully:**
- `PLAYGROUND` = `/home/jabel/code/projects/astro-playground`
- `BLOG` = `/home/jabel/code/projects/jeromeabel.github.io`

Each task header says which repo it touches. Commits go in the repo where the changes live.

**Verification model (no test suite exists, by design — see spec §7):**
- After every code-touching task: `cd PLAYGROUND && pnpm build` (runs `astro check && astro build`) must pass.
- Smoke tests are run manually in the browser at the end of each phase.

---

## File Structure

### Playground — target tree

```
astro-playground/
├── astro.config.mjs                   ← MODIFY: add @astrojs/netlify adapter
├── package.json                       ← MODIFY: add @astrojs/netlify dep
├── README.md                          ← MODIFY: link to live demo + post
├── src/
│   ├── data/heroes.ts                 ← UNCHANGED
│   ├── styles/global.css              ← UNCHANGED
│   ├── actions/index.ts               ← MODIFY: rename `subscribe` → `join`
│   └── pages/
│       ├── index.astro                ← MODIFY: hub link → /residents
│       ├── welcome.astro              ← CREATE: success redirect target
│       ├── rejected.astro             ← CREATE: rejection redirect target (reads ?reason=)
│       ├── residents/
│       │   ├── index.astro            ← CREATE: hub w/ links to all 5 patterns + roster
│       │   ├── list.astro             ← CREATE: GET demo (direct import + fetch alt in comment)
│       │   ├── join-redirect.astro    ← CREATE: Pattern A form
│       │   ├── join-json.astro        ← CREATE: Pattern B form + client script
│       │   └── join-action.astro      ← CREATE: Pattern C form (Astro Action)
│       ├── api/residents/
│       │   ├── index.ts               ← MOVE: was api/subscribers/index.ts
│       │   ├── [id].ts                ← MOVE: was api/subscribers/[id].ts
│       │   ├── join-redirect.ts       ← CREATE: POST → 307
│       │   └── join-json.ts           ← CREATE: POST → JSON
│       └── (old) subscribers.astro    ← DELETE
│       └── (old) api/subscribers/     ← DELETE (after move)
```

### Blog post — single file rewrite

```
jeromeabel.github.io/
└── src/content/post/api-endpoints-with-astro/
    └── index.md                       ← MODIFY: full rewrite per spec §5 outline
```

### File responsibilities (one-liners)

| File | Responsibility |
|---|---|
| `data/heroes.ts` | Source of truth for `heroes` (roster) and `residents` (in-memory join state) |
| `actions/index.ts` | Pattern C — Zod-validated `join` action |
| `api/residents/index.ts` | GET — return `residents` JSON |
| `api/residents/[id].ts` | GET — return one hero by id from `heroes` |
| `api/residents/join-redirect.ts` | POST — Pattern A — mutate + 307 to `/welcome` or `/rejected` |
| `api/residents/join-json.ts` | POST — Pattern B — mutate + JSON `{ ok, msg }` |
| `pages/residents/index.astro` | Hub: link to each pattern + current roster |
| `pages/residents/list.astro` | GET demo page (server-side direct import) |
| `pages/residents/join-redirect.astro` | Pattern A demo: vanilla HTML form |
| `pages/residents/join-json.astro` | Pattern B demo: form + client-side fetch |
| `pages/residents/join-action.astro` | Pattern C demo: form + `actions.join` |
| `pages/welcome.astro` | Success target for Pattern A redirect |
| `pages/rejected.astro` | Rejection target for Pattern A redirect (reads `?reason=`) |

---

# Phase 1 — Playground refactor

Goal of this phase: every endpoint and page in the new structure exists and works locally on `pnpm dev`. Old `/subscribers` files are gone. `pnpm build` is green.

---

### Task 1: Rename `subscribe` action → `join` in `actions/index.ts`

**Repo:** PLAYGROUND

**Files:**
- Modify: `src/actions/index.ts`

- [ ] **Step 1: Replace the file contents**

Open `src/actions/index.ts` and replace its contents with:

```ts
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { heroes, residents } from "../data/heroes";

export const server = {
  join: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
    }),
    handler: ({ email }) => {
      const hero = heroes.find((h) => h.email === email);
      if (!hero) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: `Sorry, ${email} is not on the hero roster.`,
        });
      }
      const firstName = hero.name.split(" ")[0];
      if (residents.find((r) => r.email === email)) {
        return { email, name: hero.name, message: `${firstName}, you're already settled in!` };
      }
      residents.push(hero);
      return {
        email,
        name: hero.name,
        message: `Welcome, ${firstName}! Your slippers await.`,
      };
    },
  }),
};
```

Two changes vs. the old file: action key is `join` (not `subscribe`); rejection message no longer mentions "retired Avengers" (a non-hero is just not on the roster).

- [ ] **Step 2: Verify type-check passes**

Run: `cd /home/jabel/code/projects/astro-playground && pnpm exec astro check`
Expected: `0 errors`. (Existing `subscribers.astro` still references `actions.subscribe` and will fail — that is fine for now; it gets deleted in Task 11. Keep going.)

If you see other unrelated errors, stop and surface them.

- [ ] **Step 3: Do NOT commit yet**

Action rename is half of a paired change with the page that uses it; we'll commit after Task 11 deletes the broken consumer. Move to Task 2.

---

### Task 2: Move `api/subscribers/` → `api/residents/`

**Repo:** PLAYGROUND

**Files:**
- Delete: `src/pages/api/subscribers/index.ts`
- Delete: `src/pages/api/subscribers/[id].ts`
- Create: `src/pages/api/residents/index.ts`
- Create: `src/pages/api/residents/[id].ts`

- [ ] **Step 1: Move the directory with `git mv`**

Run:

```bash
cd /home/jabel/code/projects/astro-playground
git mv src/pages/api/subscribers src/pages/api/residents
```

Expected: no output, `git status` shows two renames.

- [ ] **Step 2: Verify the moved files compile**

The moved files import `../../../data/heroes` — that relative path is unchanged (we moved within `pages/api/`, same depth). Run:

```bash
cd /home/jabel/code/projects/astro-playground
pnpm exec astro check
```

Expected: same error set as before (only the now-broken `subscribers.astro` reference; no new errors introduced by the move).

---

### Task 3: Create `api/residents/join-redirect.ts` (POST → 307)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/api/residents/join-redirect.ts`

- [ ] **Step 1: Create the file**

```ts
// src/pages/api/residents/join-redirect.ts
import type { APIRoute, APIContext } from "astro";
import { heroes, residents } from "../../../data/heroes";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }: APIContext) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");

  const hero = heroes.find((h) => h.email === email);
  if (!hero) {
    const reason = `${email} is not on the hero roster.`;
    return redirect(`/rejected?reason=${encodeURIComponent(reason)}`, 307);
  }

  const firstName = hero.name.split(" ")[0];
  if (residents.find((r) => r.email === email)) {
    return redirect(`/welcome?name=${encodeURIComponent(firstName)}&already=1`, 307);
  }

  residents.push(hero);
  return redirect(`/welcome?name=${encodeURIComponent(firstName)}`, 307);
};
```

Notes for the implementer:
- We use `307` (temporary, preserves method semantics) per the existing post draft. Astro's `redirect()` defaults to 302; pass `307` explicitly.
- `String(formData.get("email") ?? "")` is the cleanest narrow — `formData.get` returns `FormDataEntryValue | null`.

- [ ] **Step 2: Verify type-check passes**

Run: `cd /home/jabel/code/projects/astro-playground && pnpm exec astro check`
Expected: still only the pre-existing `subscribers.astro` error; no new errors from this file.

---

### Task 4: Create `api/residents/join-json.ts` (POST → JSON)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/api/residents/join-json.ts`

- [ ] **Step 1: Create the file**

```ts
// src/pages/api/residents/join-json.ts
import type { APIRoute, APIContext } from "astro";
import { heroes, residents } from "../../../data/heroes";

export const prerender = false;

type JoinResponse = { ok: boolean; msg: string };

export const POST: APIRoute = async ({ request }: APIContext) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");

  const hero = heroes.find((h) => h.email === email);
  if (!hero) {
    return json({ ok: false, msg: `Sorry, ${email} is not on the hero roster.` });
  }

  const firstName = hero.name.split(" ")[0];
  if (residents.find((r) => r.email === email)) {
    return json({ ok: true, msg: `${firstName}, you're already settled in!` });
  }

  residents.push(hero);
  return json({ ok: true, msg: `Welcome, ${firstName}! Your slippers await.` });
};

function json(body: JoinResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
```

Notes:
- The local `json()` helper keeps the three return sites readable and consistent. It's small enough to live in the same file rather than a shared util.
- Both rejection and "already a resident" return `200` — they're not transport-level errors, just business outcomes the client renders verbatim.

- [ ] **Step 2: Verify type-check**

Run: `cd /home/jabel/code/projects/astro-playground && pnpm exec astro check`
Expected: no new errors.

---

### Task 5: Create `pages/welcome.astro` (success target)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/welcome.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/welcome.astro
export const prerender = false;
import "../styles/global.css";

const name = Astro.url.searchParams.get("name") ?? "Hero";
const already = Astro.url.searchParams.get("already") === "1";
const message = already
  ? `${name}, you're already settled in!`
  : `Welcome, ${name}! Your slippers await.`;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Welcome — Avengers Retirement Home</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <a href="/residents" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back to residents</a>
      <section class="space-y-2">
        <h1 class="text-2xl font-semibold text-emerald-400">{message}</h1>
        <p class="text-zinc-400 text-sm">Enjoy the lounge.</p>
      </section>
    </main>
  </body>
</html>
```

Why `prerender = false`: this page reads `Astro.url.searchParams` at request time, so it has to render on demand.

---

### Task 6: Create `pages/rejected.astro` (rejection target)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/rejected.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/rejected.astro
export const prerender = false;
import "../styles/global.css";

const reason =
  Astro.url.searchParams.get("reason") ??
  "We could not verify your identity.";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Rejected — Avengers Retirement Home</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <a href="/residents" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back to residents</a>
      <section class="space-y-2">
        <h1 class="text-2xl font-semibold text-red-400">Application rejected</h1>
        <p class="text-zinc-400 text-sm">{reason}</p>
      </section>
    </main>
  </body>
</html>
```

---

### Task 7: Create `pages/residents/index.astro` (hub)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/residents/index.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/residents/index.astro
export const prerender = false;
import { GET } from "../api/residents/index.ts";
import type { Hero } from "../../data/heroes";
import "../../styles/global.css";

const response = await GET(Astro);
const residents: Hero[] = await response.json();

const patterns = [
  { href: "/residents/list",          title: "GET — list residents",       blurb: "Fetch JSON from an endpoint." },
  { href: "/residents/join-redirect", title: "POST + redirect (Pattern A)", blurb: "Form posts, server redirects." },
  { href: "/residents/join-json",     title: "POST + JSON (Pattern B)",     blurb: "Form posts via fetch, DOM updates." },
  { href: "/residents/join-action",   title: "Astro Action (Pattern C)",    blurb: "defineAction + Zod, zero JS." },
];
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Avengers Retirement Home — Astro Playground</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-12">

      <a href="/" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back</a>

      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">Avengers Retirement Home</h1>
        <p class="text-zinc-400 text-sm">
          Companion playground for the blog post on Astro API endpoints. Each link
          below shows one server-side pattern.
        </p>
      </section>

      <nav>
        <ul class="space-y-3">
          {patterns.map((p) => (
            <li>
              <a href={p.href} class="block border border-zinc-800 rounded-lg px-5 py-4 hover:bg-zinc-900 transition-colors">
                <span class="font-medium">{p.title}</span>
                <span class="text-zinc-400 text-sm ml-2">{p.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Current residents <span class="text-zinc-600 font-normal normal-case">({residents.length})</span>
        </h2>
        <ul class="divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
          {residents.map((h) => (
            <li class="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span class="font-medium">{h.alias}</span>
                <span class="text-zinc-500 ml-2 text-xs">retired {h.retiredYear}</span>
              </div>
              <span class="text-zinc-400 font-mono text-xs">{h.email}</span>
            </li>
          ))}
        </ul>
      </section>

    </main>
  </body>
</html>
```

Why direct-import `GET(Astro)` instead of `fetch`: matches the convention from the old `subscribers.astro` and avoids an HTTP round-trip when the API and page colocate. The fetch alternative is shown in Task 8 (the dedicated GET demo page).

---

### Task 8: Create `pages/residents/list.astro` (GET demo)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/residents/list.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/residents/list.astro
export const prerender = false;
import type { Hero } from "../../data/heroes";
import "../../styles/global.css";

// Pattern: server-side fetch from inside the page frontmatter.
// Equivalent direct-import alternative (no HTTP roundtrip):
//   import { GET } from "../api/residents/index.ts";
//   const response = await GET(Astro);
const response = await fetch(`${Astro.url.origin}/api/residents/`);
const residents: Hero[] = await response.json();
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>GET demo — Avengers Retirement Home</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <a href="/residents" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back</a>
      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">GET — list residents</h1>
        <p class="text-zinc-400 text-sm">
          This page calls <code class="text-zinc-300">/api/residents/</code> from
          its frontmatter and renders the JSON server-side.
        </p>
      </section>
      <ul class="divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
        {residents.map((h) => (
          <li class="flex items-center justify-between px-4 py-3 text-sm">
            <span class="font-medium">{h.alias}</span>
            <span class="text-zinc-400 font-mono text-xs">{h.email}</span>
          </li>
        ))}
      </ul>
      <p class="text-zinc-500 text-xs">
        Try the dynamic route too:
        <a class="underline hover:text-zinc-300" href="/api/residents/2">/api/residents/2</a>
      </p>
    </main>
  </body>
</html>
```

Note the comment block above the `fetch` call — it documents the direct-import alternative the post will reference (spec §4.4). The page itself uses `fetch` so the rendered code matches what the blog post highlights as the "closer to a client script" approach.

---

### Task 9: Create `pages/residents/join-redirect.astro` (Pattern A)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/residents/join-redirect.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/residents/join-redirect.astro
export const prerender = false;
import "../../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>POST + redirect (Pattern A) — Avengers Retirement Home</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <a href="/residents" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back</a>

      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">POST + redirect (Pattern A)</h1>
        <p class="text-zinc-400 text-sm">
          The form posts to <code class="text-zinc-300">/api/residents/join-redirect</code>.
          The server validates, mutates, and redirects to <code class="text-zinc-300">/welcome</code>
          or <code class="text-zinc-300">/rejected</code>. Works without JavaScript.
        </p>
      </section>

      <form method="POST" action="/api/residents/join-redirect" class="flex gap-3">
        <label class="sr-only" for="email">Hero email address</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="hero@example.com"
          class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
        <button
          type="submit"
          class="bg-zinc-100 text-zinc-950 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
        >
          Apply
        </button>
      </form>

      <p class="text-zinc-500 text-xs">
        Try <code class="text-zinc-300">steve@rogers.com</code> (accepted),
        <code class="text-zinc-300">tony@stark.com</code> (already a resident),
        or <code class="text-zinc-300">peter@parker.com</code> (rejected).
      </p>
    </main>
  </body>
</html>
```

---

### Task 10: Create `pages/residents/join-json.astro` (Pattern B)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/residents/join-json.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/residents/join-json.astro
export const prerender = false;
import "../../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>POST + JSON (Pattern B) — Avengers Retirement Home</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <a href="/residents" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back</a>

      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">POST + JSON (Pattern B)</h1>
        <p class="text-zinc-400 text-sm">
          A client-side handler intercepts the submit, calls
          <code class="text-zinc-300">/api/residents/join-json</code>, and writes the
          response message into the page. No navigation.
        </p>
      </section>

      <form method="POST" id="joinForm" class="flex gap-3">
        <label class="sr-only" for="email">Hero email address</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="hero@example.com"
          class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
        <button
          type="submit"
          class="bg-zinc-100 text-zinc-950 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
        >
          Apply
        </button>
      </form>

      <p id="joinFormMessage" class="text-sm min-h-5"></p>

      <p class="text-zinc-500 text-xs">
        Try <code class="text-zinc-300">steve@rogers.com</code> (accepted),
        <code class="text-zinc-300">tony@stark.com</code> (already a resident),
        or <code class="text-zinc-300">peter@parker.com</code> (rejected).
      </p>

      <script>
        const form = document.getElementById("joinForm") as HTMLFormElement;
        const message = document.getElementById("joinFormMessage")!;

        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          message.textContent = "Submitting…";
          message.className = "text-sm min-h-5 text-zinc-400";

          try {
            const response = await fetch("/api/residents/join-json", {
              method: "POST",
              body: new FormData(form),
            });
            const data = (await response.json()) as { ok: boolean; msg: string };
            message.textContent = data.msg;
            message.className = `text-sm min-h-5 ${data.ok ? "text-emerald-400" : "text-red-400"}`;
          } catch {
            message.textContent = "Network error — try again.";
            message.className = "text-sm min-h-5 text-red-400";
          }
        });
      </script>
    </main>
  </body>
</html>
```

The script is inline (matches Astro convention for one-off page scripts). Cast the response with `as { ok: boolean; msg: string }` so the post can highlight the typed return shape.

---

### Task 11: Create `pages/residents/join-action.astro` (Pattern C)

**Repo:** PLAYGROUND

**Files:**
- Create: `src/pages/residents/join-action.astro`

- [ ] **Step 1: Create the file**

```astro
---
// src/pages/residents/join-action.astro
export const prerender = false;
import { actions } from "astro:actions";
import "../../styles/global.css";

const result = Astro.getActionResult(actions.join);
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Astro Action (Pattern C) — Avengers Retirement Home</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-100">
    <main class="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <a href="/residents" class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">&larr; Back</a>

      <section class="space-y-2">
        <h1 class="text-2xl font-semibold">Astro Action (Pattern C)</h1>
        <p class="text-zinc-400 text-sm">
          The form's <code class="text-zinc-300">action</code> attribute points at the
          <code class="text-zinc-300">join</code> action. Astro handles transport,
          Zod validates the input, and the page reads the result via
          <code class="text-zinc-300">Astro.getActionResult()</code>. Zero JS.
        </p>
      </section>

      <form method="POST" action={actions.join} class="flex gap-3">
        <label class="sr-only" for="email">Hero email address</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="hero@example.com"
          class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
        <button
          type="submit"
          class="bg-zinc-100 text-zinc-950 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
        >
          Apply
        </button>
      </form>

      {result && !result.error && (
        <p class="text-sm text-emerald-400">{result.data.message}</p>
      )}
      {result?.error && (
        <p class="text-sm text-red-400">{result.error.message}</p>
      )}

      <p class="text-zinc-500 text-xs">
        Try <code class="text-zinc-300">steve@rogers.com</code> (accepted),
        <code class="text-zinc-300">tony@stark.com</code> (already a resident),
        or <code class="text-zinc-300">peter@parker.com</code> (rejected).
      </p>
    </main>
  </body>
</html>
```

---

### Task 12: Update `pages/index.astro` hub link + delete `subscribers.astro`

**Repo:** PLAYGROUND

**Files:**
- Modify: `src/pages/index.astro`
- Delete: `src/pages/subscribers.astro`

- [ ] **Step 1: Edit the hub link**

Open `src/pages/index.astro` and change the `examples` array entry from:

```ts
const examples = [
  { href: "/subscribers", title: "Avengers Retirement Home", description: "API routes & Actions" },
];
```

to:

```ts
const examples = [
  { href: "/residents", title: "Avengers Retirement Home", description: "API endpoints & Astro Actions — companion to the blog post" },
];
```

- [ ] **Step 2: Delete the old subscribers page**

Run:

```bash
cd /home/jabel/code/projects/astro-playground
git rm src/pages/subscribers.astro
```

Expected: confirms removal.

- [ ] **Step 3: Run type-check — should now be green**

Run: `cd /home/jabel/code/projects/astro-playground && pnpm exec astro check`
Expected: `0 errors, 0 warnings, 0 hints`. (The pre-existing `actions.subscribe` reference is gone now that `subscribers.astro` is deleted.)

- [ ] **Step 4: Full build**

Run: `cd /home/jabel/code/projects/astro-playground && pnpm build`
Expected: `Complete!` with no errors. The build emits a static `dist/` because no adapter is configured yet — Astro warns about server endpoints needing an adapter but does not fail. Note that warning; we add the adapter in Phase 2.

- [ ] **Step 5: Commit Phase 1 — playground refactor**

Run:

```bash
cd /home/jabel/code/projects/astro-playground
git add -A src/pages src/actions
git status
```

Verify the staged tree is exactly:
- renamed `pages/api/subscribers/*` → `pages/api/residents/*`
- modified `pages/index.astro`, `actions/index.ts`
- new `pages/residents/{index,list,join-redirect,join-json,join-action}.astro`
- new `pages/welcome.astro`, `pages/rejected.astro`
- new `pages/api/residents/{join-redirect,join-json}.ts`
- deleted `pages/subscribers.astro`

Then commit:

```bash
git commit -m "$(cat <<'EOF'
refactor: rename subscribers → residents and add 3 POST patterns

- rename action `subscribe` → `join`; rejection wording no longer assumes "retired"
- move api/subscribers/* → api/residents/*
- add api/residents/join-redirect.ts (Pattern A — POST + 307)
- add api/residents/join-json.ts (Pattern B — POST + JSON)
- add residents/{index,list,join-redirect,join-json,join-action}.astro
- add welcome.astro and rejected.astro as redirect targets
- update hub link in pages/index.astro

Aligns the playground with the blog post realignment spec.
EOF
)"
```

---

### Task 13: Local smoke test — all five patterns

**Repo:** PLAYGROUND (no code changes)

**Files:** none

- [ ] **Step 1: Start the dev server**

Run in a background shell or separate terminal:

```bash
cd /home/jabel/code/projects/astro-playground
pnpm dev
```

Expected: server up at `http://localhost:4321`.

- [ ] **Step 2: Verify each pattern in the browser**

Open each URL and confirm the expected behavior. Use these emails:
- `steve@rogers.com` — accepted (Steve is in `heroes`, not in pre-seeded `residents`)
- `tony@stark.com` — already a resident (idempotent welcome)
- `peter@parker.com` — rejected (not in `heroes`)

| URL | Test | Pass criteria |
|---|---|---|
| `/` | Click "Avengers Retirement Home" | Lands on `/residents` |
| `/residents` | Page loads | Shows hub + roster of 3 (Tony, Natasha, Thor) |
| `/residents/list` | Page loads | Shows roster fetched from `/api/residents/` |
| `/api/residents/` | Direct hit | Returns JSON array of 3 residents |
| `/api/residents/2` | Direct hit | Returns Tony Stark JSON |
| `/api/residents/99` | Direct hit | Returns `{ "error": "Not found" }` with 404 |
| `/residents/join-redirect` | Submit `peter@parker.com` | Redirects to `/rejected?reason=...`, shows the reason |
| `/residents/join-redirect` | Submit `steve@rogers.com` | Redirects to `/welcome?name=Steve`, shows green welcome |
| `/residents/join-redirect` | Submit `steve@rogers.com` again | Redirects to `/welcome?...&already=1`, shows "already settled in" |
| `/residents/join-json` | Submit `peter@parker.com` | Page stays, red message under form |
| `/residents/join-json` | Submit a fresh hero email | Page stays, green message under form |
| `/residents/join-action` | Submit `peter@parker.com` | Page re-renders, red message |
| `/residents/join-action` | Submit a fresh hero email | Page re-renders, green message |
| `/residents` | After all the above | Roster has grown — confirms shared `residents` array |

**Important note on shared state:** because `residents` is a single in-memory array, joins from one pattern persist into the next during the same dev process. Restart `pnpm dev` between full sweeps if you need a clean roster.

- [ ] **Step 3: Stop the dev server**

Kill the dev process. If anything in Step 2 failed, fix the offending file and re-run that single check before moving on. Do not start Phase 2 with a broken pattern.

---

# Phase 2 — Netlify adapter + deploy

Goal: the playground is reachable at a live Netlify URL with all five patterns working.

---

### Task 14: Install `@astrojs/netlify` and update config

**Repo:** PLAYGROUND

**Files:**
- Modify: `package.json` (via pnpm)
- Modify: `astro.config.mjs`

- [ ] **Step 1: Install the adapter**

Run:

```bash
cd /home/jabel/code/projects/astro-playground
pnpm add @astrojs/netlify
```

Expected: dependency added; `pnpm-lock.yaml` updated.

- [ ] **Step 2: Update `astro.config.mjs`**

Replace the file contents with:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()],
  },
});
```

We keep `output` at its default (`"static"` in Astro 6). Per-route `export const prerender = false` already opts every endpoint and dynamic page into on-demand rendering.

- [ ] **Step 3: Verify build**

Run: `cd /home/jabel/code/projects/astro-playground && pnpm build`
Expected: `Complete!` with no errors and **no** "no adapter" warnings. Build artifacts include `.netlify/` for the function bundle.

- [ ] **Step 4: Commit**

```bash
cd /home/jabel/code/projects/astro-playground
git add package.json pnpm-lock.yaml astro.config.mjs
git commit -m "$(cat <<'EOF'
feat: add @astrojs/netlify adapter for on-demand routes

Site stays static by default; the residents API and forms opt into
on-demand rendering via `export const prerender = false`. Required for
the live demo deployment linked from the blog post.
EOF
)"
```

---

### Task 15: Push playground to GitHub and connect to Netlify

**Repo:** PLAYGROUND

**Files:** none

- [ ] **Step 1: Push to GitHub**

Run:

```bash
cd /home/jabel/code/projects/astro-playground
git push origin main
```

If the playground repo has no remote yet, create one first on GitHub (`jeromeabel/astro-playground`) and `git remote add origin git@github.com:jeromeabel/astro-playground.git`.

- [ ] **Step 2: Create the Netlify site (manual — do this in the browser)**

This step requires user action and confirmation:

1. Go to https://app.netlify.com → "Add new site" → "Import an existing project" → GitHub → select `astro-playground`.
2. Build command: `pnpm build` (Netlify auto-detects). Publish directory: `dist`.
3. Suggested site name: `astro-playground-jeromeabel` → URL `https://astro-playground-jeromeabel.netlify.app`. If that name is taken, pick another and **record the actual URL** for use in later tasks.
4. Trigger first deploy.

- [ ] **Step 3: Smoke test on the live URL**

Repeat Task 13 Step 2's full table against the live URL. Note that **Netlify cold-starts** the function on first request, so the first hit may take 2–4s. That latency is what the post's "first request may be slow" note refers to.

If anything fails in production but worked locally, stop and diagnose before continuing — usually a missing `prerender = false` on a page that uses `Astro.url` or `Astro.getActionResult()`.

- [ ] **Step 4: Save the live URL**

Capture the final URL into a shell variable for the remaining tasks. Example:

```bash
export PLAYGROUND_URL="https://astro-playground-jeromeabel.netlify.app"
```

You will paste this URL into:
- Playground `README.md` (Task 16)
- Blog post intro, deployment section, and What-I-learned section (Tasks 18–24)

---

### Task 16: Update playground `README.md`

**Repo:** PLAYGROUND

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the file contents**

Substitute `<PLAYGROUND_URL>` with the actual URL captured in Task 15.

```md
# Astro Playground

A collection of examples exploring Astro 6 features.

Companion repository for the blog post
[Adding API Endpoints to an Astro Project](https://dev.jeromeabel.net/blog/api-endpoints-with-astro).

## Live demo

<PLAYGROUND_URL>

## Setup

```sh
pnpm install
pnpm dev
```

## Examples

- **[/residents](./src/pages/residents/index.astro)** — five server-side patterns:
  - `GET /api/residents/` — list residents
  - `GET /api/residents/[id]` — fetch one hero
  - `POST + redirect` (Pattern A) — `pages/residents/join-redirect.astro`
  - `POST + JSON` (Pattern B) — `pages/residents/join-json.astro`
  - `Astro Action` (Pattern C) — `pages/residents/join-action.astro`

The `residents` list lives in memory in `src/data/heroes.ts` and resets on
every cold start — see the blog post for the rationale.
```

- [ ] **Step 2: Commit**

```bash
cd /home/jabel/code/projects/astro-playground
git add README.md
git commit -m "docs: link README to blog post and live demo"
git push origin main
```

---

# Phase 3 — Blog post rewrite

Goal: `src/content/post/api-endpoints-with-astro/index.md` is the final published copy. `draft: true` removed only at the very end after verification.

The post lives in the BLOG repo. **All Phase 3 tasks happen in `/home/jabel/code/projects/jeromeabel.github.io`.**

The post is rewritten section-by-section. Each task replaces a contiguous slice of the file. Open the existing file once at the start of Phase 3 and keep it open. Sections appear in document order.

---

### Task 17: Replace frontmatter and intro

**Repo:** BLOG

**Files:**
- Modify: `src/content/post/api-endpoints-with-astro/index.md` (lines 1–15 area)

Substitute `<PLAYGROUND_URL>` with the actual URL.

- [ ] **Step 1: Replace the top of the file (frontmatter through the first horizontal rule)**

Old (lines 1–15) starts with `title:` and ends after the first `---` rule following "Code: [astro-playground]...". Replace those 15 lines with:

```md
---
title: Adding API Endpoints to an Astro Project
date: 2024-02-24
description: "Astro's file-based routing extends naturally to API endpoints — GET, POST, dynamic params, and three patterns for handling forms."
abstract: "A walkthrough of building server-side routes in Astro: GET endpoints, dynamic [id] routes, two manual POST patterns (redirect and JSON), and Astro Actions — the modern default."
draft: true
---

Astro's file-based routing doesn't stop at `.astro` pages. Drop a `.ts` file in the `pages/` directory, export an HTTP method handler, and you have an API endpoint. No Express, no separate server — just the same routing convention you already know.

This post walks through a small *Avengers Retirement Home*: heroes can browse the current residents, look themselves up by id, and apply to join via three different POST patterns. I built it as a runnable companion so each section in the post maps to a real page you can try.

- Live demo: [<PLAYGROUND_URL>](<PLAYGROUND_URL>)
- Code: [astro-playground](https://github.com/jeromeabel/astro-playground)

The first request to the demo may take a few seconds — Netlify cold-starts the function before serving.

---
```

Leave `draft: true` for now. We'll flip it in Task 27 once verification passes.

---

### Task 18: Rewrite Section 1 — "Static → server: opting routes in"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "Switching to server mode" (~lines 17–32)

- [ ] **Step 1: Replace the section**

Replace from the heading `## Switching to server mode` through (but not including) the next `## A first GET endpoint` heading with:

```md
## Static → server: opting routes in

By default, Astro renders every route to static HTML at build time. Endpoints that respond to real requests need to run on demand instead. The most surgical way to opt in is per-route, by exporting a flag from the file:

```ts
// src/pages/api/residents/index.ts
export const prerender = false;
```

That's the Astro 6 idiom for a mostly-static project that wants a few server routes. The `hybrid` mode that used to live alongside `static` and `server` was merged into `static` in Astro 5 — the per-route opt-out *is* the modern hybrid.

If you'd rather flip everything to on-demand, set `output: "server"` in `astro.config.mjs` and skip the per-route flag:

```js
// astro.config.mjs
export default defineConfig({
  output: "server",
});
```

Either way, a server adapter is required for production. The playground uses [`@astrojs/netlify`](https://docs.astro.build/en/guides/integrations-guide/netlify/) and is deployed at [<PLAYGROUND_URL>](<PLAYGROUND_URL>) — every code block below corresponds to a route you can hit there. Other [adapters](https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters) (Node, Vercel, Cloudflare) work the same way.

---
```

Substitute `<PLAYGROUND_URL>` with the URL captured in Task 15. After this task, the URL appears in three places in the post: intro (Task 17), here (§1), and the closing paragraph (Task 26).

---

### Task 19: Rewrite Section 2 — "GET: list residents"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "A first GET endpoint" (~lines 34–94)

- [ ] **Step 1: Replace the section**

Replace from the heading `## A first GET endpoint` through (but not including) the next `## Dynamic routes with params` heading with:

```md
## GET: list residents

The file structure mirrors the URL. A file at `pages/api/residents/index.ts` becomes the route `/api/residents/`:

```
src/pages/
├── api/
│   └── residents/
│       ├── index.ts        → GET /api/residents/
│       ├── [id].ts         → GET /api/residents/:id
│       ├── join-redirect.ts → POST /api/residents/join-redirect
│       └── join-json.ts    → POST /api/residents/join-json
├── residents/
│   ├── index.astro         → /residents (hub)
│   ├── list.astro          → /residents/list (GET demo)
│   └── join-*.astro        → form pages, one per POST pattern
└── index.astro             → /
```

The endpoint exports a named function matching the HTTP method — `GET`, `POST`, `PUT`, `DELETE`:

```ts
// src/pages/api/residents/index.ts
import type { APIRoute } from "astro";
import { residents } from "../../../data/heroes";

export const prerender = false;

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(residents), {
    headers: { "Content-Type": "application/json" },
  });
};
```

`residents` is a plain in-memory array exported from `src/data/heroes.ts`. The endpoint serializes whatever is currently there. (More on the in-memory bit at the end.)

Calling it from a page is a standard `fetch` from inside the frontmatter:

```astro
---
// src/pages/residents/list.astro
import type { Hero } from "../../data/heroes";

const response = await fetch(`${Astro.url.origin}/api/residents/`);
const residents: Hero[] = await response.json();
---

<ul>
  {residents.map((h) => (
    <li><b>{h.alias}</b>: {h.email}</li>
  ))}
</ul>
```

Astro also lets you skip the HTTP round-trip by importing the handler directly:

```ts
import { GET } from "../api/residents/index.ts";
const response = await GET(Astro);
const residents: Hero[] = await response.json();
```

Both work. The direct import is faster (no network hop), but the `fetch` version is closer to how a client-side script would call the same endpoint — useful if you plan to share the call site between server and client.

---
```

---

### Task 20: Rewrite Section 3 — "GET by id: dynamic routes"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "Dynamic routes with params" (~lines 96–115)

- [ ] **Step 1: Replace the section**

Replace from the heading `## Dynamic routes with params` through (but not including) the next `## POST with redirect` heading with:

```md
## GET by id: dynamic routes

Adding `[id].ts` to the residents directory creates a dynamic route. The bracket syntax is the same convention Astro uses for dynamic pages:

```ts
// src/pages/api/residents/[id].ts
import type { APIContext, APIRoute } from "astro";
import { heroes } from "../../../data/heroes";

export const prerender = false;

export const GET: APIRoute = ({ params }: APIContext) => {
  const hero = heroes.find((h) => String(h.id) === params.id);
  if (!hero) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(hero), {
    headers: { "Content-Type": "application/json" },
  });
};
```

`params` is an object containing the matched segments — here, `params.id` maps to whatever replaces `[id]` in the URL. Navigating to `/api/residents/2` returns Tony Stark; `/api/residents/99` returns a 404 JSON body.

This route reads from `heroes` (the full roster of 10), not `residents` (the join state), so you can look up any hero whether or not they've joined.

---
```

---

### Task 21: Rewrite Section 4 — "POST + redirect (Pattern A)"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "POST with redirect" (~lines 117–162)

- [ ] **Step 1: Replace the section**

Replace from the heading `## POST with redirect` through (but not including) the next `## POST with JSON response` heading with:

```md
## POST + redirect (Pattern A)

The first pattern for handling form submissions: accept the form, do the work, redirect to a result page. The browser does a full navigation; the server picks the destination.

```ts
// src/pages/api/residents/join-redirect.ts
import type { APIRoute, APIContext } from "astro";
import { heroes, residents } from "../../../data/heroes";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }: APIContext) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");

  const hero = heroes.find((h) => h.email === email);
  if (!hero) {
    const reason = `${email} is not on the hero roster.`;
    return redirect(`/rejected?reason=${encodeURIComponent(reason)}`, 307);
  }

  const firstName = hero.name.split(" ")[0];
  if (residents.find((r) => r.email === email)) {
    return redirect(`/welcome?name=${encodeURIComponent(firstName)}&already=1`, 307);
  }

  residents.push(hero);
  return redirect(`/welcome?name=${encodeURIComponent(firstName)}`, 307);
};
```

Three branches, three redirects. `307` (instead of the default `302`) preserves the request method semantics and is the conventional choice when the target is the result of a POST.

The form is plain HTML — no JavaScript needed:

```astro
<!-- src/pages/residents/join-redirect.astro -->
<form method="POST" action="/api/residents/join-redirect">
  <label for="email">Hero email address</label>
  <input id="email" type="email" name="email" required />
  <button type="submit">Apply</button>
</form>
```

The destination pages read the query params:

```astro
---
// src/pages/rejected.astro
export const prerender = false;
const reason = Astro.url.searchParams.get("reason") ?? "Unknown reason.";
---

<h1>Application rejected</h1>
<p>{reason}</p>
```

This is the traditional server-side pattern. It works without JavaScript on the client, which matters for progressive enhancement and for users with JS disabled or failing.

---
```

---

### Task 22: Rewrite Section 5 — "POST + JSON (Pattern B)"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "POST with JSON response" (~lines 164–225)

- [ ] **Step 1: Replace the section**

Replace from the heading `## POST with JSON response` through (but not including) the next `## A note on Astro Actions` heading with:

```md
## POST + JSON (Pattern B)

The second pattern keeps the page in place. The form posts via a client-side `fetch`, the server returns JSON, and a script writes the message into the DOM:

```ts
// src/pages/api/residents/join-json.ts
import type { APIRoute, APIContext } from "astro";
import { heroes, residents } from "../../../data/heroes";

export const prerender = false;

type JoinResponse = { ok: boolean; msg: string };

export const POST: APIRoute = async ({ request }: APIContext) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");

  const hero = heroes.find((h) => h.email === email);
  if (!hero) {
    return json({ ok: false, msg: `Sorry, ${email} is not on the hero roster.` });
  }

  const firstName = hero.name.split(" ")[0];
  if (residents.find((r) => r.email === email)) {
    return json({ ok: true, msg: `${firstName}, you're already settled in!` });
  }

  residents.push(hero);
  return json({ ok: true, msg: `Welcome, ${firstName}! Your slippers await.` });
};

function json(body: JoinResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
```

Note that *both* the rejection and the "already settled in" branches return `200`. They aren't transport-level errors — they're business outcomes the client renders verbatim. The `ok` flag tells the UI which color to use.

The page wires up a submit handler that intercepts the form:

```astro
<form method="POST" id="joinForm">
  <label for="email">Hero email address</label>
  <input id="email" type="email" name="email" required />
  <button type="submit">Apply</button>
</form>
<p id="joinFormMessage"></p>

<script>
  const form = document.getElementById("joinForm") as HTMLFormElement;
  const message = document.getElementById("joinFormMessage")!;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const response = await fetch("/api/residents/join-json", {
      method: "POST",
      body: new FormData(form),
    });
    const data = (await response.json()) as { ok: boolean; msg: string };
    message.textContent = data.msg;
  });
</script>
```

No page reload, no redirect, no flash of unstyled content. The trade-off: it requires JavaScript on the client.

---
```

---

### Task 23: Replace Section 6 — "Astro Actions (Pattern C)" — promote to a full section

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "A note on Astro Actions" (~lines 227–234)

- [ ] **Step 1: Replace the section**

Replace from the heading `## A note on Astro Actions` through (but not including) the next `## Astro documentation` heading with:

```md
## Astro Actions (Pattern C)

The two POST patterns above are the foundation. Since Astro 5, [Actions](https://docs.astro.build/en/guides/actions/) are the recommended path for most form submissions — less boilerplate, type-safe input and output, and zero-JS by default.

You define the action in `src/actions/index.ts`:

```ts
// src/actions/index.ts
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { heroes, residents } from "../data/heroes";

export const server = {
  join: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
    }),
    handler: ({ email }) => {
      const hero = heroes.find((h) => h.email === email);
      if (!hero) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: `Sorry, ${email} is not on the hero roster.`,
        });
      }
      const firstName = hero.name.split(" ")[0];
      if (residents.find((r) => r.email === email)) {
        return { email, name: hero.name, message: `${firstName}, you're already settled in!` };
      }
      residents.push(hero);
      return { email, name: hero.name, message: `Welcome, ${firstName}! Your slippers await.` };
    },
  }),
};
```

The action object replaces the endpoint file. `accept: "form"` tells Astro to parse `multipart/form-data`; the Zod schema validates and types the input; the handler returns a typed result, or throws `ActionError` for failure. The `code` controls the HTTP status (`FORBIDDEN` → 403).

The page references the action by object identity — no URL string:

```astro
---
// src/pages/residents/join-action.astro
import { actions } from "astro:actions";
const result = Astro.getActionResult(actions.join);
---

<form method="POST" action={actions.join}>
  <input type="email" name="email" required />
  <button type="submit">Apply</button>
</form>

{result && !result.error && (
  <p class="success">{result.data.message}</p>
)}
{result?.error && (
  <p class="error">{result.error.message}</p>
)}
```

`Astro.getActionResult()` reads the result of the most recent submission for that action. The success branch types `result.data` from the handler's return; the error branch types `result.error` from `ActionError`. It's the same code path as Pattern B's JSON, but Astro is doing the wiring for you.

---
```

---

### Task 24: Add new Section 7 — "Comparing the three POST patterns"

**Repo:** BLOG

**Files:**
- Modify: same file, insert a new section before `## Astro documentation`

- [ ] **Step 1: Insert the section**

Immediately before the existing `## Astro documentation` heading, insert:

```md
## Comparing the three POST patterns

| Pattern | JS required on client? | Page navigation? | Validation style | When to pick |
|---|---|---|---|---|
| POST + redirect | No | Yes (full nav) | Manual in handler | Progressive enhancement, server-only flows |
| POST + JSON | Yes | No (DOM update) | Manual in handler | Inline feedback, smoother UX, single-page flows |
| Astro Action | No (zero-JS by default) | No (page re-renders) | Zod via `defineAction` | New code in Astro 5+ — the modern default |

All three share the same data and the same business rules. They differ in *how the result reaches the user*: a navigation, a JSON response, or a re-rendered page reading `Astro.getActionResult()`.

If you're starting fresh, use Actions. If you need to work without JavaScript and don't want to re-render the whole page, redirect. If you have an existing client-side flow and want a simple JSON contract, return JSON.

---
```

---

### Task 25: Rewrite Section 8 — "Astro documentation"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "Astro documentation" (~lines 236–244)

- [ ] **Step 1: Replace the section**

Replace from the heading `## Astro documentation` through (but not including) the next `## What I Learned` heading with:

```md
## Astro documentation

- [Endpoints](https://docs.astro.build/en/guides/endpoints/) — API routes, HTTP methods, static vs. server endpoints
- [Actions](https://docs.astro.build/en/guides/actions/) — `defineAction`, Zod input, `ActionError`, `getActionResult`
- [On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — `output` modes, per-route `prerender = false`, adapter setup
- [Endpoint Context (APIContext)](https://docs.astro.build/en/reference/api-reference/#endpoint-context) — `params`, `request`, `redirect`, `cookies`

---
```

---

### Task 26: Rewrite Section 9 — "What I learned"

**Repo:** BLOG

**Files:**
- Modify: same file, the section currently titled "What I Learned" (~lines 246–253)

- [ ] **Step 1: Replace the section**

Substitute `<PLAYGROUND_URL>` with the actual URL.

Replace from the heading `## What I Learned` to end-of-file with:

```md
## What I learned

- **File-based API routing is Astro's underrated feature.** The same convention that maps `.astro` files to pages maps `.ts` files to endpoints. No router configuration, no middleware setup.
- **Three POST patterns cover most use cases.** Redirect for progressive enhancement, JSON for inline feedback, Actions for new code. Pick by audience and constraints, not by personal preference.
- **Dynamic routes use the same bracket syntax as pages.** `[id].ts` works identically to `[id].astro` — the `params` object is the same.
- **Direct handler imports skip the network.** Calling `GET(Astro)` instead of `fetch()` avoids an HTTP round-trip when the API and page colocate. Useful for the page that *also* renders the data.
- **`output: "server"` is one option, not the only one.** Per-route `export const prerender = false` keeps the rest of the site static.
- **Astro Actions are the modern default.** Less boilerplate, type-safe, zero-JS by default. The two manual patterns are still useful — you should know they exist — but new forms should reach for Actions first.

The playground keeps everything in memory: the `residents` array resets on every cold start, so two visits to the live demo can see different state. In production you'd swap the array for a database call inside the handler — the surrounding scaffolding stays exactly the same. Try it: [<PLAYGROUND_URL>](<PLAYGROUND_URL>).
```

(Note: this section ends the file. There's no closing horizontal rule.)

---

### Task 27: Verify the post end-to-end and remove `draft: true`

**Repo:** BLOG

**Files:**
- Modify: `src/content/post/api-endpoints-with-astro/index.md` (frontmatter)

- [ ] **Step 1: Build the blog and confirm no errors**

Run:

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
pnpm build
```

Expected: `Complete!` with no errors. The post is `draft: true` and dev-only, so it should appear in the dev list but not in production listing.

- [ ] **Step 2: Render the post locally and read it through**

Run:

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
pnpm dev
```

Open `http://localhost:4321/blog/api-endpoints-with-astro` and read the rendered post top to bottom. Specifically check:

- No literal `<PLAYGROUND_URL>` placeholder remains anywhere — verify with `grep -n '<PLAYGROUND_URL>' src/content/post/api-endpoints-with-astro/index.md` (should be no matches). The real URL should appear three times in the post (intro, §1 adapter mention, "What I learned" closing).
- All code blocks render with syntax highlighting.
- The comparison table renders.
- All three Astro docs links resolve (right-click → open in new tab → loads).
- All `/api/residents/...` and `/residents/...` paths in the prose match the playground's actual paths.

- [ ] **Step 3: Cross-check code samples against the playground**

For each code block in the post, open the corresponding file in the playground and confirm the post code matches. The post is the playground's mirror; if they drift, the playground wins (update the post).

| Post section | Playground file |
|---|---|
| §1 (`prerender = false`) | any of `api/residents/*.ts` |
| §1 (`output: "server"`) | not in playground — config alternative |
| §2 (`api/residents/index.ts`) | `src/pages/api/residents/index.ts` |
| §2 (page using `fetch`) | `src/pages/residents/list.astro` |
| §2 (page using direct import) | `src/pages/residents/index.astro` (the hub) |
| §3 (`[id].ts`) | `src/pages/api/residents/[id].ts` |
| §4 (`join-redirect.ts`) | `src/pages/api/residents/join-redirect.ts` |
| §4 (form) | `src/pages/residents/join-redirect.astro` |
| §4 (`rejected.astro`) | `src/pages/rejected.astro` |
| §5 (`join-json.ts`) | `src/pages/api/residents/join-json.ts` |
| §5 (form + script) | `src/pages/residents/join-json.astro` |
| §6 (`actions/index.ts`) | `src/actions/index.ts` |
| §6 (`join-action.astro`) | `src/pages/residents/join-action.astro` |

If any block has drifted, edit the post to match.

- [ ] **Step 4: Smoke test the live demo one more time**

Open `<PLAYGROUND_URL>` in a private window. Run through the same email matrix as Task 13. If anything fails, fix in the playground first, redeploy, then re-verify.

- [ ] **Step 5: Remove `draft: true`**

Edit `src/content/post/api-endpoints-with-astro/index.md` and delete the `draft: true` line from the frontmatter. The frontmatter should now be:

```md
---
title: Adding API Endpoints to an Astro Project
date: 2024-02-24
description: "Astro's file-based routing extends naturally to API endpoints — GET, POST, dynamic params, and three patterns for handling forms."
abstract: "A walkthrough of building server-side routes in Astro: GET endpoints, dynamic [id] routes, two manual POST patterns (redirect and JSON), and Astro Actions — the modern default."
---
```

- [ ] **Step 6: Final build and confirm the post is now in production listing**

Run:

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
pnpm build
```

Expected: `Complete!` with the post URL in the build output (`/blog/api-endpoints-with-astro/index.html`).

- [ ] **Step 7: Commit**

```bash
cd /home/jabel/code/projects/jeromeabel.github.io
git add src/content/post/api-endpoints-with-astro/index.md
git rm src/content/post/using-api-endpoints-with-astro/index.md  # the deleted old post
git commit -m "$(cat <<'EOF'
content: rewrite api-endpoints-with-astro post

Realigned to the astro-playground companion repo. The post now teaches
five patterns end-to-end (GET, GET [id], POST+redirect, POST+JSON,
Astro Action), each backed by a reproducible page on the live demo.
Promoted Actions from a footnote to a full section; added a comparison
table.

Removes draft flag.
EOF
)"
```

---

# Acceptance criteria (from spec §10) — final checklist

- [ ] Playground builds (`pnpm build`) with no errors.
- [ ] All five patterns work locally on `pnpm dev`.
- [ ] Live Netlify URL serves the playground; all five patterns work in production.
- [ ] Blog post no longer has `draft: true`.
- [ ] Every code block in the blog post is reproducible from the playground (cross-check table in Task 27 §3).
- [ ] Live demo URL appears in three places: blog post intro (Task 17), blog post §1 adapter mention (Task 18), playground README (Task 16). Bonus mention in "What I learned" closing line (Task 26) — that's a fourth.
- [ ] No references to `/subscribers`, `add.ts`, `add2.ts`, or `jsonplaceholder` remain in either repo. Verify with:

```bash
cd /home/jabel/code/projects/astro-playground
grep -rEn 'subscribers|add\.ts|add2\.ts|jsonplaceholder' --include='*.{ts,astro,md,mjs,json}' src README.md astro.config.mjs || echo "clean"

cd /home/jabel/code/projects/jeromeabel.github.io
grep -n 'subscribers\|add\.ts\|add2\.ts\|jsonplaceholder' src/content/post/api-endpoints-with-astro/index.md || echo "clean"
```

Both should print `clean`.
