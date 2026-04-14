---
title: "Exploring a Data-Driven Approach to Web Performance"
date: 2026-04-15
description: "Six months of performance work on a Vue.js speech analytics app — what the RUM data revealed, where metrics fell short, and what user feedback proved better than any dashboard."
abstract: "A practical account of using field data, lab measurements, and behavioral analytics to drive and evaluate performance improvements on a real B2B tool."
draft: false
---

I work on a speech analytics web app built with Vue.js at [Uhlive](https://uh.live/). Customer analysts use it to search, filter, and review recorded calls — transcripts, tags, metrics. Some customers have over 200,000 calls.

Our performance was bad. Loading times reached 6–8 seconds. Users told us: *"it's a bit long"*, *"it grinds"*. This was enough to focus a development cycle on it.

I tried to measure the before and after of each change. Six months later, the hardest part wasn't finding what to fix — it was knowing whether a fix actually worked.

---

## Field Data to Find the Problem

We gathered data from two main Real User Metrics (RUM) tools: [New Relic](https://newrelic.com/) for backend and frontend metrics and [Amplitude](https://amplitude.com/) for product analytics — user journeys, sessions, actions. We had a few months of baseline before starting — enough to see impact over 2+ weeks.

### What the Data Pointed To

New Relic ranked every page by LCP, giving us a clear picture of the worst performers. Three pages stood out — the three pages our customers use most. We scoped the work there and set a target: move their p75 LCP from "poor" (above 4s) to "good" (under 2.5s).

Amplitude's behavioral data revealed a clear correlation: **worst LCP = worst bounce rate.** During a 7-day snapshot a page showed a 50% bounce rate, compared to 18% on the other main page. The most telling signal: that same page had a **650-second average time spent per session** (time on page before navigating away or ending the session). Users were doing real work — they wanted to stay. But 50% still bounced. High time spent plus high bounce means users tried to use the page and gave up in frustration.

On the same page, when INP (Interaction to Next Paint — how fast the page responds to clicks) exceeded 400ms, Amplitude showed a 42% drop in search-to-action completions — users who searched but didn't open any results.

### Know Your Users

Before optimizing, we needed to understand who we were optimizing for. Our users are call-center analysts on desktop, recent Chrome-based browsers, small to HD screens. No mobile, no old browsers. A useful constraint.

Keep in mind: those users might be on 4-year-old Windows laptops with background processes competing for CPU — what scores 60 on your machine might score 30 on theirs. CPU throttling in Lighthouse gets you closer to their reality.

The user base splits into two distinct profiles:

- **Supervisors** check in periodically — reviewing analytics dashboards, monitoring data quality, browsing the call list to spot trends. Shorter sessions, more page-hopping. A supervisor "bouncing" from Call Details may just be checking one call and moving on — not a performance problem.
- **Analysts** work for hours — picking calls from the list, opening each one, reviewing transcripts and tags. Long sessions on Call Details, high page views on Call List. These are the users who felt the pain of 6-second LCP most acutely.

---

## The Journey in Five Phases

Performance optimizations don't happen in a vacuum. The product can't be paused — new features ship alongside performance work, sometimes competing with it. That tension shaped every phase.

We tracked RUM data (New Relic p75) over 6 months on two pages. Here's what happened.

![Call List: LCP & INP over 6 months](./call-list-lcp-inp-2025-2026.png)


| Phase | Period | Main Driver | LCP Impact | INP Impact |
|-------|--------|-------------|-----------|-----------|
| **1. Backend optimization** | Oct–Nov | Query optimizations + pagination | **−52%** | +202% (tradeoff) |
| **2. Request cleanup** | Nov–Dec | Dead code removal, reduced polling | −22% | **−57%** |
| **3. Virtual scrolling** | Jan–Feb | TanStack Virtual replacing PrimeVue DataTable | **−67%** | **−65%** |
| **4. Feature debt** | Feb–Mar | Adding features, global router growth | +156% | −22% |
| **5. Earning it back** | Mar–Apr | Endpoint migration, filter rewrite | **−63%** | +35% |

### Phase 1 — The backend win (and its tradeoff)

The backend team replaced a heavy endpoint with two specialized ones. On the frontend, we added pagination — no more loading all results at once — and refactored the store to consume the new endpoints. Call List LCP dropped from 8600ms to 4000ms — **the single biggest win in the whole journey.**

But INP spiked from 420ms to 1360ms. Why? The page now loaded faster, delivering more interactive data sooner. The JavaScript tasks that process incoming data competed more aggressively for the main thread. **Faster load = more data to interact with = worse INP.**

### Phase 2 — The boring one that works

Removing dead code paths, deleting deprecated API calls (useless since using the new endpoints) & fields, reducing polling frequency. Nothing exciting. INP dropped 57%. Removing dead code and useless API calls freed the main thread for user interactions.

### Phase 3 — Virtual scrolling breaks the tradeoff

Users wanted to see 100 rows instead of 20 by default. We tried PrimeVue DataTable's built-in virtual scroller, but hit a known bug with row expansion — we use row expansion to show call details, and virtual scroll made it flicker and break ([PrimeVue Issue #3491](https://github.com/primefaces/primevue/issues/3491)). After documented attempts, we replaced PrimeVue entirely with TanStack Table & Virtual.

TanStack's headless approach solved both the performance problem and the UX issue: row expansion worked reliably, scroll behavior was consistent, and column widths stayed stable. The LCP gain came from rendering only visible rows instead of 100 DOM nodes. The INP gain from less DOM to interact with.

LCP: −67%. INP: −65%. This was the only phase that improved both metrics simultaneously, because virtualization decouples rendered DOM from data size. The browser no longer cares whether the list has 100 or 10,000 items.

### Phase 4 — Feature Debt: Performance is a budget (and we spent it)

Over 5 weeks, Call List LCP crept from 1328ms back to 3406ms — **+156%**. No one noticed in real-time.

The cause: a column-sharing feature that added a new blocking API call on every page load, an eager watcher running a function with localStorage for every user, and 53 restructured files adding parse-time overhead. Plus 13 PRs touching global router files, and three new runtime libraries (~45KB combined) landing silently.

Each PR added a small cost. None had a compensating optimization. The budget was gone.

### Phase 5 — Earning it back

Targeted fixes: migrated an endpoint (reversing the Phase 4 blocking call), rewrote the filter bar with cleaner imports to reduce the module graph on that route, and removed alpha-gating logic that was still being evaluated at runtime for every user. LCP dropped from 3406ms to 1266ms — **back below the Phase 3 best.**

The mild INP regression (+35%) echoed Phase 1's pattern, but TanStack Virtual capped its magnitude. The DOM ceiling prevents exponential INP growth.

---

## Lab Data to Find the Fix

For Call List, RUM data told us what was broken. For Call Details, lab data was the only reliable tool.

For each PR, I ran Chrome DevTools performance traces and Lighthouse reports through custom Python scripts. The scripts parsed the trace's `CrRendererMain` thread events and extracted a diagnostic chain — each metric pointing toward the next root cause:

```
Diagnostic funnel — Call Details (before → after)
────────────────────────────────────────────────────
FPS              45fps → 50fps
  ↓ frame cost: 22.8ms  (budget: 16.67ms for 60fps)

Rendering        185ms/s → 135ms/s
  ↓ 6,797 DOM nodes → layout + style recalc on every frame
  ↓ 329 segment components in the transcript alone
  fix: virtual scroll, render only ~20 visible segments

Scripting        807ms/s → 671ms/s
  ↓ FireAnimationFrame × 60/sec evaluating :is-segment-active
  ↓ across 329 segments ≈ 20,000 comparisons/sec
  fix: O(1) active index; watch transitions (~30×/10s) not timecode (~600×/10s)

Longest task     115ms → 76ms
  ↓ analyze_longest_task traced child calls with source locations
  ↓ pointed directly at the composable to rewrite
────────────────────────────────────────────────────
Lighthouse: 33/100 · TBT: 600ms+ · TTI: 28s
```

Each number was a clue. Lighthouse confirmed the structural problems — too many nodes, too much blocking script — but the traces told us *where to cut*. The lab data proved every change worked. The RUM data? Inconclusive — p75 still sits around 3100ms, fluctuating week to week. For Call Details, the gap between lab and field measurements was too wide to trust either one alone.

---

## What Data Can't Prove

**Correlation is not causation.** Slow pages might be slow because they're complex, and complex pages might have higher bounce rates for reasons unrelated to performance. The signal was strong enough to act on — especially when users described the experience as "slow" — but we can't prove the causal link.

**Improving one metric can worsen another.** The LCP/INP tradeoff showed up three times. When data arrives faster, the JavaScript that processes it competes harder for the main thread. The metrics are connected in ways that aren't obvious until you're deep in it.

**Not every PR moves the dashboard.** Some improvements are real but too small for field data to register. Others only matter on the slowest devices. I still think avoiding unnecessary reactive operations on 1,000+ items is a gain, at least for older hardware. But I can't always prove it with a graph.

**Rolling windows blend context away.** New Relic's weekly p75 is a blend of data from the entire period. Our best week (1328ms) likely included some pre-optimization data that made it look better than reality. Our worst-to-best recovery (3406 → 1266ms) was partly the old data aging out. When interpreting RUM trends, always account for this — dramatic week-over-week changes are often the window shifting composition, not just new code.

---

## Ship Perception While You Fix Architecture

![Loading states comparison: blank page vs. skeleton screen with disabled interactions during data fetch](./perception-loading-states.png)

Structural fixes take sprints. Perception fixes can ship in a week. **People will wait for value, but unexplained waits feel slower.**

While we worked on virtualization and payload reduction, we shipped a perception layer:

- **Skeleton screens** replaced blank pages. A 3-second load with a skeleton feels faster than a 2-second load with a white screen. Users start reading the layout before data arrives.
- **Disabled interactions while loading.** Clicking a button that isn't ready causes the frustration of "I clicked and nothing happened." Lock the UI, show a loading state, unlock when ready.
- **Optimistic UI** for high-confidence actions. Show the result immediately and reconcile after the server responds.

This isn't cheating. The worst UX is uncertainty — no feedback, no progress, just a frozen screen.

Trust in a tool is asymmetric: it builds slowly through repeated success and drops fast on failure. An analyst opening 30 calls a day adjusts by day 3 — two fast sessions set an expectation; one regression confirms a fear. A skeleton screen doesn't change load time, but it signals that something is happening — that the tool is working for the user, not against them. Perception fixes buy time while the team works on structural changes.

---

## When Users Tell You What the Dashboard Can't

![./call-details-session-trends.png]

The Call List story is clean: 8600ms → 1500ms, the data proves it. The Call Details story is the opposite.

Call Details LCP bounced between 1400ms and 4600ms across the whole period with no clear trend. We parallelized API calls (5 sequential → 3 parallel), virtualized the transcript (−73% DOM nodes, −94% segment nodes), and optimized the layout. The lab data proved every change worked. But the RUM data stayed inconclusive — and the users told us what the dashboard couldn't:

> I thought I had changed my hardware!

> We forget how long it used to take to open a call — now it's under 2 seconds

"I thought I had changed my hardware." No Core Web Vital captures that. The transcript virtualization made scrolling smooth. The parallel API calls removed the sequential wait. The skeleton screens made the remaining wait feel purposeful. None of this registered clearly in our RUM data — the sample size is smaller for Call Details, the usage patterns are more varied, and the improvements were spread across multiple interaction moments rather than concentrated in a single LCP event.

User feedback is data too. This sprint started because a user said the app felt slow. The proof it worked was someone thinking they got new hardware.

---

## The Business Impact: Amplitude Before and After

Performance improved and users said it felt faster. We wanted to know if usage data agreed.

We compared two standalone 12-week windows in Amplitude's Page Engagement report — one ending before optimizations started (Aug–Oct 2025), one covering the post-optimization period (Jan–Apr 2026). Raw visitor counts dropped ~47% across all pages uniformly.

A caveat on these numbers: we're working with a small user base — around 50–60 weekly active users, roughly 300–550 unique visitors per 12-week window. This is a B2B tool, not a consumer app. With this sample size, a single power user changing their habits can move a metric by a few percent. The trends are directional, not statistically significant in the way a 100K-user A/B test would be.

| Page | Metric | Before (12w) | After (12w) | Change |
|------|--------|-------------:|------------:|-------:|
| **All pages** | Bounce Rate | 17.2% | 14.2% | **−17.4%** |
| **All pages** | Views/Session | 20.0 | 21.1 | +5.5% |
| **All pages** | Time/Session | 392s | 438s | +11.7% |
| **Call List** | Views/Session | 11.7 | 14.3 | **+22.6%** |
| **Call List** | Exit Rate | 17.8% | 13.9% | **−21.7%** |
| **Call List** | Time/Session | 400s | 335s | **−16.2%** |
| **Call Details** | Bounce Rate | 26.5% | 26.3% | −0.7% |
| **Call Details** | Time/Session | 789s | 880s | **+11.5%** |

*Exit rate: the percentage of sessions where a user left the app from a specific page. Bounce rate: the percentage of sessions where that page was the only one visited.*

Three things stand out:

**Call List became a better search tool.** Users browse 22.6% more pages per session while spending 16.2% less time — they find what they need faster. The exit rate dropped 21.7%, meaning users who reach Call List continue deeper into the app instead of leaving. This aligns with what both user types need: supervisors scanning more calls quickly, analysts finding their target calls sooner.

**Call Details held users for real work.** Time spent per session increased 11.5% (789s → 880s) while bounce rate stayed flat. Users who open a call now spend *more* time reviewing transcripts and tags — the work the tool was built for. Before optimization, opening a call was painful (LCP 4–5 seconds, sequential API calls). After parallelizing API calls, virtualizing the transcript, and adding skeletons, the page became usable enough for analysts to settle in and work. (We also added a read/unread indicator per call during this period, which likely contributed to the increased engagement.)

**Overall bounce rate dropped 17.4%.** From 17.2% to 14.2%. Fewer users abandon after the first page. With ~50 weekly users, this represents roughly 1–2 fewer bounces per week — a small absolute change, but a consistent one across the 12-week window.

---

## What I Learned

- **Performance is a budget.** Every feature spends from the same budget — Phase 4 proved you can drain it in 5 weeks without anyone noticing.
- **The LCP/INP tradeoff is real and recurring.** Faster loading means more data competing for the main thread — only virtualization broke this by decoupling DOM size from data size.
- **Business metrics justify the sprint.** "22% more pages per session, 17% fewer bounces" is a business case — "LCP is 8.1s" is not.
- **Performance is a trust contract.** Trust builds through repeated fast sessions and drops faster than it forms. Skeletons are transparency, not tricks.
- **Perception fixes buy time.** Skeletons shipped in days; virtualization took sprints. Users noticed both.
- **Not every change moves the dashboard.** Some PRs didn't register in the metrics — data tells you where to look, not always whether your fix worked.
- **User feedback is the companion to data.** The clearest signal before: "it grinds." After: "I thought I got new hardware." No dashboard gave us that.

---

## What's Next

I'm building a test environment with 10,000 botanical species — expandable rows, the same structure as the call list. The goal is to compare three rendering approaches: a naive `v-for` table, PrimeVue DataTable, and TanStack Virtual. Lighthouse scores the naive table at 100. Users measure 3-second mount times and single-digit FPS.

The gap between synthetic scores and real experience is where the interesting work starts. Since there's no RUM data in a playground, the methodology uses Chrome DevTools traces and Lighthouse reports — the same Python scripts from Call Details, applied to a reproducible benchmark.
