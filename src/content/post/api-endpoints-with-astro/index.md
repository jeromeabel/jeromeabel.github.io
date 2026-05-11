---
title: Adding API Endpoints to an Astro Project
date: 2026-05-11
description: "Astro's file-based routing extends naturally to API endpoints — GET, POST, dynamic params, and three patterns for handling forms."
abstract: "A walkthrough of building server-side routes in Astro: GET endpoints, dynamic [id] routes, two manual POST patterns (redirect and JSON), and Astro Actions — the modern default."
img: ./api-endpoints-with-astro.jpg
draft: false
---

Astro's file-based routing doesn't stop at `.astro` pages. Drop a `.ts` file in the `pages/` directory, export an HTTP method handler, and you have an API endpoint. No Express, no separate server — just the same routing convention you already know.

This post walks through a small companion project *Heroes Retirement Home*: browse the current residents, look them up by id, and apply to join via three different POST patterns. Each section maps to a real page you can try.

- Live demo: [https://astro-jeromeabel.netlify.app/](https://astro-jeromeabel.netlify.app/residents)
- Code: [astro-playground](https://github.com/jeromeabel/astro-playground)

---

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

Either way, a server adapter is required for production. The playground uses [`@astrojs/netlify`](https://docs.astro.build/en/guides/integrations-guide/netlify/), other [adapters](https://docs.astro.build/en/guides/on-demand-rendering/#server-adapters) (Node, Vercel, Cloudflare) work the same way.

---

## The data

The project tracks two lists. `heroes` is the full roster — every retired superhero in the system. `residents` is the subset who've actually moved into the home.

```ts
// src/data/heroes.ts
export type Hero = {
  id: number;
  name: string;
  alias: string;
  email: string;
  retiredYear: number;
};

export const heroes: Hero[] = [
  { id: 1, name: "Bob Dude",     alias: "Super Yellow",     email: "bob@super.com",   retiredYear: 2021 },
  { id: 2, name: "Jane Doe",     alias: "Wonder Great",     email: "jane@super.com",  retiredYear: 2019 },
  // ...
];

export const residents: Hero[] = [heroes[0], heroes[1]];
```

Bob, and Jane have already settled in. The rest can still apply. Every hero has a `@super.com` email — that's how the POST endpoints know an applicant is on the roster.

The data lives in a plain array — there's no database. On Netlify, each serverless function invocation gets its own module scope, so `residents` resets on every cold start. This is intentional: the playground is about routing patterns, not persistence. In production, swap the array for a database call inside the handler — the surrounding scaffolding stays the same.

---

## GET: list residents

The file structure mirrors the URL. A file at `pages/api/residents/index.ts` becomes the route `/api/residents/`:

```
src/pages/
├── api/
│   └── residents/
│       ├── index.ts         → GET /api/residents/
│       ├── [id].ts          → GET /api/residents/:id
│       ├── join-redirect.ts → POST /api/residents/join-redirect
│       └── join-json.ts     → POST /api/residents/join-json
├── residents/
│   ├── index.astro          → /residents (hub)
│   ├── list.astro           → /residents/list (GET demo)
│   ├── [id].astro           → /residents/:id (detail page)
│   └── join-*.astro         → form pages, one per POST pattern
└── index.astro              → /
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

Calling it from a page — a `fetch` inside the frontmatter, with `import.meta.glob` to resolve hero portraits dynamically:

```astro
---
// src/pages/residents/list.astro
import type { ImageMetadata } from "astro";
import { Image } from "astro:assets";
import type { Hero } from "../../data/heroes";

export const prerender = false;

const response = await fetch(`${Astro.url.origin}/api/residents/`);
const residents: Hero[] = await response.json();

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/heroes/*.jpg"
);
---

{residents.map((h) => (
  <a href={`/residents/${h.id}`}>
    <Image
      src={images[`/src/assets/heroes/${h.id}.jpg`]()}
      alt={h.alias}
    />
    <p>{h.alias}</p>
  </a>
))}
```

`import.meta.glob` builds a map of all matching file paths to lazy importers at bundle time. At render time, `images['/src/assets/heroes/1.jpg']()` resolves to the `ImageMetadata` that `<Image>` needs — dimensions, format, and optimized source. This is the [documented pattern](https://docs.astro.build/en/recipes/dynamically-importing-images/) for dynamic image imports in Astro.

Astro also lets you skip the HTTP round-trip by importing the handler directly:

```ts
import { GET } from "../api/residents/index.ts";
const response = await GET(Astro);
const residents: Hero[] = await response.json();
```

The difference matters on Netlify:

```
fetch() — two serverless invocations:

  Browser ──▸ Netlify ──▸ list.astro (fn A)
                              │
                              ├── fetch("/api/residents/")
                              │       │  HTTP request
                              │       ▼
                              │   index.ts (fn B) ← may cold-start
                              │       │
                              │       ▼
                              │   JSON response
                              │
                              └── renders HTML ──▸ Browser
```

```
import { GET } — single invocation, no network:

  Browser ──▸ Netlify ──▸ list.astro (fn A)
                              │
                              ├── GET(Astro) ← function call, same process
                              │       │
                              │       ▼
                              │   JSON (in-memory, no HTTP)
                              │
                              └── renders HTML ──▸ Browser
```

With `fetch()`, the function running `list.astro` makes an HTTP request back into Netlify's infrastructure — potentially triggering a second cold start on `index.ts`. With `import { GET }`, the handler runs as a regular function call inside the same process. No network, no second cold start.

Both work. The `fetch` version is closer to how a client-side script would call the same endpoint — useful if you plan to share the call site between server and client. The direct import is faster but couples the page to the handler's module.

---

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

`params` is an object containing the matched segments — here, `params.id` maps to whatever replaces `[id]` in the URL. Navigating to `/api/residents/1` returns Bob Dude; `/api/residents/99` returns a 404 JSON body.

This route reads from `heroes` (the full roster), not `residents` (the join list), so you can look up any hero whether or not they've moved in.

The detail page calls the endpoint and renders the hero's portrait alongside their info:

```astro
---
// src/pages/residents/[id].astro
import type { ImageMetadata } from "astro";
import { Image } from "astro:assets";
import type { Hero } from "../../data/heroes";

export const prerender = false;

const { id } = Astro.params;
const res = await fetch(`${Astro.url.origin}/api/residents/${id}`);
if (!res.ok) return Astro.redirect("/404");
const hero: Hero = await res.json();

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/heroes/*.jpg"
);
---

<Image
  src={images[`/src/assets/heroes/${hero.id}.jpg`]()}
  alt={hero.alias}
/>
<h1>{hero.alias}</h1>
<p>{hero.name} · {hero.email} · Retired {hero.retiredYear}</p>
```

---

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

The browser handles everything. `<form method="POST">` triggers a native form submission: the browser serializes the fields, sends the POST to the `action` URL, and follows the server's redirect response. The entire round-trip is browser + server — no client-side JavaScript involved:

```
Form submission — the browser does the work:

  Browser                               Netlify (serverless fn)
  ┌─────────────────────┐              ┌──────────────────────────┐
  │ <form method="POST"> │  POST req   │  join-redirect.ts        │
  │   email: chuck@s...  │ ──────────▸ │    parse formData        │
  │   [Submit]           │             │    find hero             │
  │                      │  307 + URL  │    redirect("/welcome")  │
  │                      │ ◂────────── │                          │
  └─────────────────────┘              └──────────────────────────┘
           │
           │  GET /welcome?name=Chuck
           ▼
  ┌─────────────────────┐              ┌──────────────────────────┐
  │ Welcome, Chuck!      │ ◂────────── │  welcome.astro           │
  │                      │    HTML     │    reads query params     │
  └─────────────────────┘              └──────────────────────────┘
```

This is the traditional server-side pattern. It works without JavaScript on the client, which matters for progressive enhancement and for users with JS disabled or failing.

The destination pages read the query params:

```astro
---
// src/pages/rejected.astro
export const prerender = false;
const reason = Astro.url.searchParams.get("reason") ?? "Unknown reason.";
---

<h1>⚠ Application rejected</h1>
<p>{reason}</p>
```

---

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

Note that *both* the rejection and the "already settled in" branches return `200`. They aren't transport-level errors — they're business outcomes the client renders verbatim. The `ok` flag tells the UI which style to use.

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
    message.textContent = data.ok ? data.msg : `⚠ ${data.msg}`;
  });
</script>
```

No page reload, no redirect, no flash of unstyled content. The trade-off: it requires JavaScript on the client.

---

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
  <p class="error">⚠ {result.error.message}</p>
)}
```

`Astro.getActionResult()` reads the result of the most recent submission for that action. The success branch types `result.data` from the handler's return; the error branch types `result.error` from `ActionError`. It's the same code path as Pattern B's JSON, but Astro is doing the wiring for you.

---

## Comparing the three POST patterns

| Pattern | JS required on client? | Page navigation? | Validation style | When to pick |
|---|---|---|---|---|
| POST + redirect | No | Yes (full nav) | Manual in handler | Progressive enhancement, server-only flows |
| POST + JSON | Yes | No (DOM update) | Manual in handler | Inline feedback, smoother UX, single-page flows |
| Astro Action | No (zero-JS by default) | No (page re-renders) | Zod via `defineAction` | New code in Astro 5+ — the modern default |

All three share the same data and the same business rules. They differ in *how the result reaches the user*: a navigation, a JSON response, or a re-rendered page reading `Astro.getActionResult()`.

If you're starting fresh, use Actions. If you need to work without JavaScript and don't want to re-render the whole page, redirect. If you have an existing client-side flow and want a simple JSON contract, return JSON.

---

## Astro documentation

- [Endpoints](https://docs.astro.build/en/guides/endpoints/) — API routes, HTTP methods, static vs. server endpoints
- [Actions](https://docs.astro.build/en/guides/actions/) — `defineAction`, Zod input, `ActionError`, `getActionResult`
- [On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) — `output` modes, per-route `prerender = false`, adapter setup
- [Endpoint Context (APIContext)](https://docs.astro.build/en/reference/api-reference/#endpoint-context) — `params`, `request`, `redirect`, `cookies`

---

## What I learned

- **File-based API routing is Astro's underrated feature.** The same convention that maps `.astro` files to pages maps `.ts` files to endpoints. No router configuration, no middleware setup.
- **Three POST patterns cover most use cases.** Redirect for progressive enhancement, JSON for inline feedback, Actions for new code. Pick by audience and constraints, not by personal preference.
- **Dynamic routes use the same bracket syntax as pages.** `[id].ts` works identically to `[id].astro` — the `params` object is the same.
- **Direct handler imports skip the network.** Calling `GET(Astro)` instead of `fetch()` avoids an HTTP round-trip and a potential cold start when the API and page colocate.
- **`output: "server"` is one option, not the only one.** Per-route `export const prerender = false` keeps the rest of the site static.
- **Astro Actions are the modern default.** Less boilerplate, type-safe, zero-JS by default. The two manual patterns are still useful — you should know they exist — but new forms should reach for Actions first.
- **`import.meta.glob` is the key to dynamic images.** It builds a map at bundle time, letting server-rendered pages resolve the right image from `src/assets/` without hardcoding imports.
- **Dev and production behave differently for in-memory state.** In `pnpm dev`, a single long-running Node.js process handles all requests, so a `residents.push()` survives browser reloads and hard reloads — the module instance stays alive. In production on Netlify, cold starts re-initialize the module and reset the array. It feels like a database in dev; it's ephemeral in prod. The fix is a real database inside the handler — the routing scaffolding stays the same.

Try it: [https://astro-jeromeabel.netlify.app/residents](https://astro-jeromeabel.netlify.app/residents).
