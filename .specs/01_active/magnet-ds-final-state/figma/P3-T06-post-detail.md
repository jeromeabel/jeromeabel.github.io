---
task: P3-T06
title: Post-detail master
phase: 3
status: TODO
prerequisite: P3-T03
---

# P3-T06 — `Post — Desktop` / `Post — Mobile`

First of the four detail rebuilds, and the shell P3-T07 / P3-T08 clone. Mirrors `src/pages/blog/[id].astro`.

## Live anatomy (read off the route, inlined here)

`main` is `py-section lg:py-section-lg container flex flex-col gap-8 lg:gap-12`. Its children in order:

1. **PostHeader** — `lg:w-2/3` (832 on Desktop), bottom border, `pb-6 lg:pb-12`, inner gap `4 lg:8`:
   - breadcrumb nav: `ui/Link/menuInactive` labelled `BLOG` + `lucide:chevron-right`, muted, uppercase
   - `ui/H1` — `Optimizing Images with Astro (part 1)`
   - `ui/PageDescription` — the abstract
   - meta row, `flex-col sm:flex-row justify-between`: left cluster = `lucide:calendar` + `12 July 2026` + `lucide:clock` + `8 min read` (both 14px muted); then `blog/PostMetadataTopic` chips (`WEB PERFORMANCE`, `ASTRO`); then `ui/SocialShare`.
2. **Cover** — full-width 16:9 image placeholder, radius 8.
3. **TOC (mobile only)** — the `<details>` box; this is `blog/TableOfContents breakpoint=Mobile`. Desktop frames do not get it.
4. **Body** — `flex items-start gap-12`: `ui/Prose` (flex-1) then the TOC aside, `w-56` = 224, `hidden md:block`, sticky. On Mobile the aside is absent (the `<details>` box above replaces it).
5. **`blog/RelatedWork`**
6. **`blog/PostNav`** — `mt-16`, `type=both`
7. trailing `ui/Link/secondary` — `All blog` with `lucide:arrow-right`.

**Spec divergence, live wins on order.** Spec §4 lists `PostHeader → Prose → SocialShare → PostNav → RelatedWork`. Live puts SocialShare _inside_ the header meta row, RelatedWork _before_ PostNav, and adds the trailing `All blog` link. Build the live order; report the three deltas as spec-amendment candidates.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — build both breakpoints

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);

const build = async (breakpoint) => {
  const mobile = breakpoint === "Mobile";
  const { root, pc } = await shell(`Post — ${breakpoint}`, breakpoint, V);
  pc.itemSpacing = mobile ? 32 : 48;

  // 1. header
  const head = F("PostHeader", "VERTICAL", { itemSpacing: mobile ? 16 : 32 });
  pc.appendChild(head);
  if (mobile) head.layoutSizingHorizontal = "FILL";
  else { head.layoutSizingHorizontal = "FIXED"; head.resize(832, head.height); }
  head.paddingBottom = mobile ? 24 : 48;
  const rule = figma.createRectangle();
  rule.name = "hairline"; rule.resize(100, 1);
  rule.setBoundVariable("fills", V["2 Theme::color/border"]);

  const crumb = F("breadcrumb", "HORIZONTAL", { itemSpacing: 4 });
  head.appendChild(crumb);
  crumb.appendChild(await inst("ui/Link/menuInactive"));
  crumb.appendChild(await inst("ui/Icon"));

  const h1 = await inst("ui/H1"); head.appendChild(h1); h1.layoutSizingHorizontal = "FILL";
  const desc = await inst("ui/PageDescription"); head.appendChild(desc); desc.layoutSizingHorizontal = "FILL";

  const meta = F("metadata", mobile ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 16 });
  head.appendChild(meta); meta.layoutSizingHorizontal = "FILL";
  meta.primaryAxisAlignItems = mobile ? "MIN" : "SPACE_BETWEEN";
  meta.appendChild(await inst("blog/PostMetadataTime"));
  meta.appendChild(await inst("blog/PostMetadataTopic"));
  meta.appendChild(await inst("ui/SocialShare"));
  head.appendChild(rule); rule.layoutSizingHorizontal = "FILL";

  // 2. cover
  const cover = figma.createRectangle();
  cover.name = "cover"; cover.cornerRadius = 8;
  cover.resize(mobile ? 358 : 1280, mobile ? 201 : 720);
  cover.setBoundVariable("fills", V["2 Theme::color/surface"]);
  pc.appendChild(cover); cover.layoutSizingHorizontal = "FILL";

  // 3+4. TOC placement differs by breakpoint
  const body = F("Body", mobile ? "VERTICAL" : "HORIZONTAL", { itemSpacing: 48 });
  body.counterAxisAlignItems = "MIN";
  const prose = await inst("ui/Prose");
  if (mobile) {
    const tocM = await inst("blog/TableOfContents", /breakpoint=Mobile/);
    pc.appendChild(tocM); tocM.layoutSizingHorizontal = "FILL";
    pc.appendChild(body); body.layoutSizingHorizontal = "FILL";
    body.appendChild(prose); prose.layoutSizingHorizontal = "FILL";
  } else {
    pc.appendChild(body); body.layoutSizingHorizontal = "FILL";
    body.appendChild(prose); prose.layoutSizingHorizontal = "FILL";
    const toc = await inst("blog/TableOfContents", /breakpoint=Desktop/);
    body.appendChild(toc);
    toc.layoutSizingHorizontal = "FIXED"; toc.resize(224, toc.height);
  }

  // 5-7
  for (const n of ["blog/RelatedWork", "blog/PostNav"]) {
    const i = await inst(n, n === "blog/PostNav" ? /type=both/ : undefined);
    pc.appendChild(i); i.layoutSizingHorizontal = "FILL";
  }
  const all = await inst("ui/Link/secondary");
  pc.appendChild(all);

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";
  page.appendChild(root);
  return { name: root.name, id: root.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

If `ui/Link/menuInactive` does not exist under that name, use whatever the rename map produced for the muted nav link (`ui/Link/textLink` is the nearest) and say which you used.

## Step 2 — fill real content

Fresh run, one post so the master reads like a real page — `Optimizing Images with Astro (part 1)`:

- breadcrumb label `BLOG`
- `ui/H1` → `Optimizing Images with Astro (part 1)`
- `ui/PageDescription` → `Astro's image pipeline does more than resize. Here's what `<Picture>`, AVIF and LQIP actually buy you, measured on this site.`
- metadata → `12 July 2026` · `8 min read`; topic chips `WEB PERFORMANCE` and `ASTRO`
- trailing link label → `All blog`

## Step 3 — cold read-back + screenshot

Assert `PageContent` children are all INSTANCE except the two named layout frames (`PostHeader`, `Body`) and the cover rectangle. Assert the Desktop frame has the TOC **inside** `Body` at 224 wide, and the Mobile frame has it **above** `Body` at FILL.

Screenshot both against a live post at 1280 and 390.

---

## Acceptance

- Live order built, three spec deltas reported rather than resolved silently.
- TOC placed per breakpoint, correct variant on each.
- One real post's content throughout.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T06
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
