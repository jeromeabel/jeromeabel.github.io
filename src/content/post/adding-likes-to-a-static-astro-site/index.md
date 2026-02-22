---
title: Adding Likes to a Static Astro Site
date: 2026-02-22
description: A hybrid rendering pattern for adding dynamic votes to a fully static site — using Astro, Turso, and vanilla JavaScript, without turning the app into SSR.
abstract: A single server route, two database queries, and optimistic UI — how to add real votes to a static site without converting it to SSR.
img: ./adding-likes-to-a-static-astro-site.jpg
draft: false
---

## Static pages can't count

My comic site is fully static — markdown files rendered at build time, served from a CDN. Fast, cheap, zero server. But I wanted visitors to heart their favorite comics.

The obvious question: where does the count live? Not in a JSON file — two visitors clicking at the same millisecond would overwrite each other. Not in localStorage — that's per-browser, invisible to other visitors. I needed a real database, but only for this one tiny feature.

The constraint: don’t turn the whole site into SSR just to increment a number.


## The hybrid pattern: one server route, everything else stays static

Astro’s hybrid rendering solves this with one line:

```ts
// src/pages/api/vote.ts
export const prerender = false;
```

Everything stays static HTML — prerendered at build time and served from the CDN. Except this one file.

At build time, Astro splits the project:

* `.astro` pages → static files
* `src/pages/api/*.ts` with `prerender = false` → serverless functions

Architecture:

```
Static HTML (CDN)
  └─ <script> → fetch('/api/vote')
       └─ Netlify function
            └─ Turso (remote SQLite)
```

The page is HTML with a `<script>` that wakes up one button.


## Serverless: pay for what you use

When Astro builds the project, the `@astrojs/netlify` adapter packages server routes as Netlify Functions. My `api/vote.ts` becomes a small JavaScript file sitting on Netlify's infrastructure — not a Node.js process running 24/7.

The difference matters:

- **Traditional server:** always on, costs when idle, you handle scaling
- **Serverless function:** spins up per request, then stops. 100 simultaneous votes = 100 parallel executions. No queue, no bottleneck.

The trade-off is cold starts — the first request after idle has a small delay while Netlify spins up a container. For a vote button, that seems ok. The user clicks, the optimistic UI responds instantly, and the serverless function catches up in the background. To be honest, I think it takes too much time, I will test another solution later, but I will keep it as is for now.


## A database in 12 lines

The schema is one table with a composite unique index:

```ts
const Vote = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    comicId: column.text(),
    visitorId: column.text(),
    createdAt: column.date({ default: NOW }),
  },
  indexes: [{ on: ['comicId', 'visitorId'], unique: true }],
});
```

That composite index does double duty:

* Fast lookup by `(comicId, visitorId)`
* Enforces one vote per visitor per comic

The database enforces the rule. The client can’t break it.

Locally, Astro DB runs SQLite in `.astro/content.db`. In production, the same schema connects to Turso. The queries don’t change.


## Two queries in parallel

This is the real constraint in a serverless setup: round-trips cost more than rows.

The index page lists every comic with its vote count.
The naive approach: one query per comic → N sequential queries.

Instead, exactly **two round-trips**, no matter how many comics:

```ts
const [comicsCounts, userVotes] = await Promise.all([
  // Query 1: counts per comic (SQL aggregation)
  db.select({ comicId: Vote.comicId, value: count() })
    .from(Vote)
    .where(inArray(Vote.comicId, comicIds))
    .groupBy(Vote.comicId),

 // Query 2: which comics did this visitor vote for?
  db.select({ comicId: Vote.comicId })
    .from(Vote)
    .where(and(
      inArray(Vote.comicId, comicIds),
      eq(Vote.visitorId, visitorId)
    )),
]);
```

## Drizzle: SQL, but refactorable

Astro DB uses Drizzle ORM under the hood. The queries read like SQL, but they're TypeScript — which means autocomplete, compile-time errors, and safe refactoring.

```ts
const existingVote = await db.select()
  .from(Vote)
  .where(and(
    eq(Vote.comicId, comicId),
    eq(Vote.visitorId, visitorId)
  ))
  .limit(1)
  .get();
```

```sql
SELECT * FROM Vote
WHERE comicId = ? AND visitorId = ?
LIMIT 1;
```

If I rename a column, the compiler catches it. With raw SQL strings, that becomes a runtime error.

Drizzle also stays thin — it's a lightweight wrapper, not an engine like Prisma. No query planner, no custom binary, no schema language to learn. The schema is TypeScript. The queries are TypeScript. Everything stays in one language.


## Turso: hosted SQLite

[Turso](https://docs.turso.tech/) is a managed libSQL platform — essentially hosted SQLite. The free tier gives you 5 GB of storage and 500 million row reads per month. For a comic site, that's essentially unlimited.


Setup:

```bash
turso db create my-project
turso db show my-project --url          # → ASTRO_DB_REMOTE_URL
turso db tokens create my-project       # → ASTRO_DB_APP_TOKEN
```

Add both values as environment variables on Netlify, then push your schema:

```bash
pnpm astro db push --remote
```

Astro DB handles the connection — `astro build --remote` in your build command switches from local SQLite to the hosted Turso instance.


## Anonymous identity with a cookie

No login system — this is a comic blog, not a bank. A UUID cookie is enough:

```ts
function getOrCreateVisitorId(cookies: AstroCookies): string {
  let visitorId = cookies.get("visitorId")?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    cookies.set("visitorId", visitorId, {
      httpOnly: true,     // JS can't read it → XSS protection
      sameSite: "lax",    // blocks cross-site POST → CSRF protection
      secure: true,       // HTTPS only
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }
  return visitorId;
}
```

`HttpOnly` means even if an attacker injects a script (XSS), they can't steal the cookie. `SameSite=lax` means a malicious site can't forge votes. Can someone clear their cookies and vote again? Sure. It's a heart button on a comic site — the threat model is "don't let someone spam-click," not "secure an election."


## Optimistic UI without a framework

The client is a vanilla `<script>`. Buttons carry their comic ID as `data-comic-id` attributes. The script discovers them at runtime, so it works identically on the index page (many buttons) and the detail page (one button) without any routing awareness.

The click handler updates the UI before the server responds:

```ts
const prev = state.get(comicId) ?? { count: 0, voted: false };

const optimistic = {
  voted: !prev.voted,
  count: prev.count + (prev.voted ? -1 : 1),
};

updateButtonUI(button, optimistic);

try {
  const result = await fetchJson("/api/vote", {
    method: "POST",
    body: JSON.stringify({ comicId }),
    headers: { "Content-Type": "application/json" },
  });

  state.set(comicId, result);
  updateButtonUI(button, result);
} catch {
  state.set(comicId, prev);
  updateButtonUI(button, prev);
}
```

A `pending` Set guards against double-clicks — if a POST is already in flight, the second click is ignored. No debounce needed. The button stays visually enabled (no grey flicker), and `finally { pending.delete(comicId) }` clears the guard in all outcomes.

State lives in a `Map<string, VoteState>` inside a closure — not in the DOM. The DOM is the display layer, not the data layer. Rollback is `state.set(comicId, prev)`, not "read the span, parse the string, decrement, hope it's right."


## What I Learned

* One `prerender = false` line is enough to introduce dynamic behavior into a static site
* The hybrid pattern keeps architecture stable — one server route, everything else CDN
* Composite unique indexes enforce business rules better than application code
* In serverless, reduce round-trips first — batch and parallelize queries
* SQL with type safety is a sweet spot — Drizzle feels close to the metal without sacrificing refactors
* Optimistic UI doesn’t require a framework — careful state handling is enough
* Cookie usage
