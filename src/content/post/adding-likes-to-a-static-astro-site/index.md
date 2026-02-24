---
title: Adding Likes to a Static Astro Site
date: 2026-02-24
description: Two approaches to adding dynamic votes to a static Astro site — first with Astro DB and Turso (elegant, 667ms), then with PHP and MySQL (fast, 118ms).
abstract: Astro DB + Turso gave me votes in an afternoon. Then I measured the response time. A single PHP file on shared hosting replaced the entire serverless stack.
img: ./adding-likes-to-a-static-astro-site.jpg
draft: false
---

I wanted to add some interactivity to my static comic blog — a heart button so visitors could vote for their favorite strips. The site is built with Astro, fully static, served from Netlify's CDN. The challenge: where does the vote count live?


## Approach 1: Astro's hybrid pattern

Astro has a clean answer. Mark one file as server-rendered, everything else stays static:

```ts
// src/pages/api/vote.ts
export const prerender = false;

export async function GET() {}
export async function POST() {}
```

At build time, Astro splits the project — `.astro` pages become static HTML, and this single TypeScript file becomes a [server endpoint](https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes) with a Netlify Function thanks to the Netlify adapter. The architecture:

```
Static HTML (CDN)
  └─ <script> → fetch('/api/vote')
       └─ Netlify Function (serverless in a .netlify/functions folder)
            └─ Turso (remote SQLite)
```

[Astro DB](https://docs.astro.build/en/guides/astro-db/) provides a built-in ORM powered by Drizzle. The schema is one table:

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

The composite unique index does double duty — fast lookup and one-vote-per-visitor enforcement at the database level. The client can't break this rule.

For the index page (all comics listed with their counts), round-trips matter more than row count. Two queries in parallel, no matter how many comics:

```ts
const [comicsCounts, userVotes] = await Promise.all([
  db.select({ comicId: Vote.comicId, value: count() })
    .from(Vote)
    .where(inArray(Vote.comicId, comicIds))
    .groupBy(Vote.comicId),

  db.select({ comicId: Vote.comicId })
    .from(Vote)
    .where(and(
      inArray(Vote.comicId, comicIds),
      eq(Vote.visitorId, visitorId)
    )),
]);
```

In production, Astro DB connects to [Turso](https://docs.turso.tech/) — hosted SQLite with a generous free tier. Locally, it runs a SQLite file. The queries don't change.

The whole setup took a few hours to wire together. Schema, API route, client-side optimistic UI — done.


## Anonymous identity with a cookie

Both approaches need to know *who* is voting without a login system. A cookie isn't true identification — someone can clear it and vote again — but for a heart button on a comic blog, it's plenty. Simple, built into every browser, no signup flow.

A random ID stored in an `httpOnly` cookie is enough:

```php
$visitorId = $_COOKIE['visitor_id'] ?? null;

if (!$visitorId) {
    $visitorId = bin2hex(random_bytes(16));
    setcookie('visitor_id', $visitorId, [
        'expires'  => time() + 365 * 24 * 60 * 60,
        'path'     => '/',
        'domain'   => '.jeromeabel.net',  // shared across subdomains
        'secure'   => true,               // HTTPS only
        'httponly'  => true,              // JS can't read it
        'samesite' => 'None',             // needed for cross-origin fetch
    ]);
}
```

`httponly` means even if an attacker injects a script (XSS), they can't steal the cookie. `domain=.jeromeabel.net` makes the cookie available to both `api.jeromeabel.net` and `leconceptdelapreuve.jeromeabel.net`. `SameSite=None` is required here — the browser sees `fetch()` from one subdomain to another as a cross-origin request, and `Lax` would block the cookie on those subresource requests. `Secure` is mandatory when using `SameSite=None`. Can someone clear their cookies and vote again? Sure. The threat model is "don't let someone spam-click," not "secure an election."


## Optimistic UI

The vote POST will succeed the vast majority of the time. So the UI updates *before* the server responds — immediate feedback. If the request fails, roll back.

```ts
const prev = state.get(comicId) ?? { count: 0, voted: false };

const optimistic = {
  voted: !prev.voted,
  count: prev.count + (prev.voted ? -1 : 1),
};

updateButtonUI(button, optimistic);

try {
  const result = await fetchJson(API_URL, {
    method: "POST",
    body: JSON.stringify({ comicId }),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  state.set(comicId, result);
  updateButtonUI(button, result);
} catch {
  // Rollback
  state.set(comicId, prev);
  updateButtonUI(button, prev);
}
```

State lives in a `Map<string, VoteState>` inside a closure — not in the DOM. The DOM is the display layer, not the data layer. Rollback is `state.set(comicId, prev)`. A `pending` Set guards against double-clicks — if a POST is already in flight, the second click is ignored.

---

## Too Long to Get

Then I opened DevTools to have numbers data about a bad feeling of frustration. It takes too much time to get the vote counts.

| Phase | Duration |
|-------|----------|
| Queueing | 1.40 ms |
| Stalled | 0.73 ms |
| Request sent | 0.15 ms |
| **Waiting for server response** | **663.18 ms** |
| Content Download | 1.55 ms |
| **Total** | **667.01 ms** |

663ms waiting for the server. The Netlify Function wakes up from a cold start, connects to Turso's remote database, runs two queries over the network, serializes the response. Too much infrastructure, too many network hops, for a feature this small.


## Approach 2: PHP + MySQL on shared hosting

My domain is registered with OVH. The hosting plan includes PHP and MySQL — already paid for, sitting idle. The idea: deploy a single PHP file behind an `api` subdomain.

```
leconceptdelapreuve.jeromeabel.net (Netlify CDN — static, unchanged)
  └─ <script> → fetch('https://api.jeromeabel.net/vote.php')

api.jeromeabel.net (OVH shared hosting)
  └─ PHP (always warm)
       └─ MySQL (OVH internal network — no internet hop)
```

One PHP file handles everything — CORS, cookies, reading counts, toggling votes:

```php
<?php
// vote.php — the entire backend

// Defaults — overridden when required by vote-staging.php
$TABLE = $TABLE ?? 'votes';
$ALLOWED_ORIGINS = $ALLOWED_ORIGINS ?? ['https://leconceptdelapreuve.jeromeabel.net'];
$ALLOWED_ORIGIN_PATTERNS = $ALLOWED_ORIGIN_PATTERNS ?? [];

// CORS — api subdomain ≠ main domain for the browser
// Some servers strip HTTP_ORIGIN, so fallback to getallheaders()
$origin = $_SERVER['HTTP_ORIGIN'] ?? getallheaders()['Origin'] ?? '';

$isAllowedOrigin = in_array($origin, $ALLOWED_ORIGINS, true);
if (!$isAllowedOrigin) {
    foreach ($ALLOWED_ORIGIN_PATTERNS as $pattern) {
        if (preg_match($pattern, $origin) === 1) { $isAllowedOrigin = true; break; }
    }
}

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
```

The toggle logic is a check-then-act: if the visitor already voted, delete the row (un-vote); otherwise insert (vote). Then return the fresh count:

```php
// POST: toggle vote
$check = $pdo->prepare(
    "SELECT id FROM {$tableSql} WHERE comic_id = ? AND visitor_id = ? LIMIT 1"
);
$check->execute([$comicId, $visitorId]);

if ($check->fetch()) {
    $pdo->prepare("DELETE FROM {$tableSql} WHERE comic_id = ? AND visitor_id = ?")
        ->execute([$comicId, $visitorId]);
    $voted = false;
} else {
    $pdo->prepare("INSERT INTO {$tableSql} (comic_id, visitor_id) VALUES (?, ?)")
        ->execute([$comicId, $visitorId]);
    $voted = true;
}

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM {$tableSql} WHERE comic_id = ?");
$countStmt->execute([$comicId]);

echo json_encode(['count' => (int) $countStmt->fetchColumn(), 'voted' => $voted]);
```

The MySQL schema uses the same composite unique index pattern — same constraint, different language:

```sql
CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comic_id VARCHAR(8) NOT NULL,
  visitor_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (comic_id, visitor_id),
  INDEX idx_comic_id (comic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

The cookies work across subdomains because `api.jeromeabel.net` and `leconceptdelapreuve.jeromeabel.net` share the same registrable domain. A cookie set with `domain=.jeromeabel.net` is sent to both. I initially assumed `SameSite=Lax` would be enough since the domains are same-site. It wasn't — browsers treat `fetch()` with `credentials: 'include'` to a different origin as a cross-origin subresource request, and `Lax` blocks cookies on those. `SameSite=None` (with `Secure`) is required.

The result:

| Phase | Duration |
|-------|----------|
| Queueing | 1.83 ms |
| DNS Lookup | 6.23 ms |
| Initial connection | 40.25 ms |
| SSL | 21.75 ms |
| Request sent | 0.07 ms |
| **Waiting for server response** | **53.93 ms** |
| Content Download | 14.67 ms |
| **Total** | **117.90 ms** |

54ms server wait. Down from 663ms. The connection overhead (DNS + SSL) adds ~68ms on first request, but that gets reused on subsequent calls. The site also becomes fully static again — no `prerender = false` routes, no `--remote` build flag, no serverless functions.


## One file, two environments

I didn't want local development to pollute production vote data. PHP's `require` shares the calling script's variable scope, so a 5-line wrapper is enough:

```php
<?php
// vote-staging.php
$TABLE = 'votes_staging';
$ALLOWED_ORIGINS = ['http://localhost:4321'];
$ALLOWED_ORIGIN_PATTERNS = [
    '/^https:\/\/(?:deploy-preview-\d+|branch-[a-z0-9-]+)--leconceptdelapreuve\.netlify\.app$/',
];
require __DIR__ . '/vote.php';
```

When `vote-staging.php` sets `$TABLE` then requires `vote.php`, the variable is already defined — `$TABLE ?? 'votes'` keeps it. Direct requests to `vote.php` get the default production table.

On the Astro side, a config file switches the URL by environment:

```ts
// src/utils/voteConfig.ts
export const VOTE_API_URL =
  import.meta.env.PUBLIC_VOTE_API_URL ??
  (import.meta.env.DEV
    ? "https://api.jeromeabel.net/vote-staging.php"
    : "https://api.jeromeabel.net/vote.php");
```

The `PUBLIC_VOTE_API_URL` env var allows overriding in CI if needed. By default, `pnpm dev` hits the staging endpoint, and production builds hit the real one. Netlify deploy previews also hit the staging table — the regex pattern in `$ALLOWED_ORIGIN_PATTERNS` matches both `deploy-preview-*` and `branch-*` URLs, so branch previews get CORS access to the staging endpoint without touching production data.


## What I Learned

* Astro DB + Turso is genuinely pleasant to work with — schema, ORM, and hosting in one integration
* Serverless cold starts add up when the feature is trivial
* Co-located PHP + MySQL on shared hosting can be faster than a modern serverless stack — because physics wins: same machine, no network hop
* A cookie identity pattern transfers across stacks without changes
* Optimistic UI decouples the user experience from backend latency
