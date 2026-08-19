---
task: P3-T07
title: Serie-landing and Serie-post masters
phase: 3
status: TODO
prerequisite: P3-T06
---

# P3-T07 — `Serie — *` and `Serie post — *`

Four masters. Mirrors `src/pages/blog/[serie]/index.astro` and `src/pages/blog/[serie]/[post].astro`.

## Serie landing — live anatomy

`main` is the standard document container, `gap-8 lg:gap-12`:

1. **SerieHeader**, `lg:w-2/3` (832), gap `4 lg:8`:
   - breadcrumb `BLOG` + chevron, muted uppercase
   - title row: `lucide:folder` 24px muted + `ui/H1` `Web Performance`
   - `ui/PageDescription` — the serie abstract
   - stats row: `lucide:layers` + `5 parts` + `lucide:clock` + `~1h 05m read`, 14px muted → this is `blog/SerieMeta`
2. **Post list** — live is a bare `div` with a top border holding one `SeriePostListItem` per post.

**Styling divergence, Figma wins.** P2-T07 built `blog/SerieContents` as a bordered radius-8 box with a label and numbered items. Live's landing list is boxless with only a top rule. Same content, different chrome — use the `blog/SerieContents` instance and record the note. Do not rebuild a second list component to match live.

## Serie post — live anatomy

Identical to `Post — *` (P3-T06) with three differences:

- breadcrumb is two-level: `Blog` › `Web Performance` › `Part 4 of 5`
- a `blog/SerieContents` instance sits **after** the body and **before** the nav
- `blog/PostNav` never degrades to prev-only/next-only: at the ends it points at the serie itself (`Web Performance` as prev, `Back to Web Performance` as next). So `type=both` on both frames.

<!-- include: _run-rules.md -->

## Helpers — paste at the top of every run in this brief

<!-- include: _prelude-pages.js -->

---

## Step 1 — build the Serie-landing masters

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);

const build = async (breakpoint) => {
  const mobile = breakpoint === "Mobile";
  const { root, pc } = await shell(`Serie — ${breakpoint}`, breakpoint, V);
  pc.itemSpacing = mobile ? 32 : 48;

  const head = F("SerieHeader", "VERTICAL", { itemSpacing: mobile ? 16 : 32 });
  pc.appendChild(head);
  if (mobile) head.layoutSizingHorizontal = "FILL";
  else { head.layoutSizingHorizontal = "FIXED"; head.resize(832, head.height); }

  const crumb = F("breadcrumb", "HORIZONTAL", { itemSpacing: 4 });
  head.appendChild(crumb);
  crumb.appendChild(await inst("ui/Link/menuInactive"));
  crumb.appendChild(await inst("ui/Icon"));

  const titleRow = F("title", "HORIZONTAL", { itemSpacing: 12 });
  titleRow.counterAxisAlignItems = "CENTER";
  head.appendChild(titleRow); titleRow.layoutSizingHorizontal = "FILL";
  titleRow.appendChild(await inst("ui/Icon"));   // lucide:folder
  const h1 = await inst("ui/H1"); titleRow.appendChild(h1); h1.layoutSizingHorizontal = "FILL";

  const desc = await inst("ui/PageDescription");
  head.appendChild(desc); desc.layoutSizingHorizontal = "FILL";
  head.appendChild(await inst("blog/SerieMeta"));

  const contents = await inst("blog/SerieContents");
  pc.appendChild(contents); contents.layoutSizingHorizontal = "FILL";

  const footer = await inst("app/Footer", new RegExp(`breakpoint=${breakpoint}`));
  root.appendChild(footer); footer.layoutSizingHorizontal = "FILL";
  page.appendChild(root);
  return { name: root.name, id: root.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

Fill: H1 `Web Performance`; description `A working series on measuring, diagnosing and fixing web performance — with the numbers from this site and from production apps.`; SerieMeta `5 parts` · `~1h 05m read`.

## Step 2 — build the Serie-post masters by cloning Post

```js
const V = await VARS();
const page = await PAGES("Pages");
await figma.setCurrentPageAsync(page);
const build = async (breakpoint) => {
  const src = page.children.find((c) => c.name === `Post — ${breakpoint}`);
  if (!src) throw new Error(`Post — ${breakpoint} missing — run P3-T06 first`);
  const old = page.children.find((c) => c.name === `Serie post — ${breakpoint}`);
  if (old) old.remove();  // own debris from a previous run of this task only
  const clone = src.clone();
  clone.name = `Serie post — ${breakpoint}`;
  const pc = clone.findOne((n) => /^PageContent/.test(n.name));
  const contents = await inst("blog/SerieContents");
  const nav = pc.children.find((c) => /PostNav/.test(c.name));
  pc.insertChild(pc.children.indexOf(nav), contents);
  contents.layoutSizingHorizontal = "FILL";
  page.appendChild(clone);
  return { name: clone.name, id: clone.id, stack: pc.children.map((c) => `${c.type}:${c.name}`) };
};
return [await build("Desktop"), await build("Mobile")];
```

Cloning a **page master** is safe — its children are instances, so the clone shares the same masters and nothing detaches. Cloning a **component** is a different thing and stays forbidden.

If `Post — *` is already a COMPONENT (P3-T09 converts them, but a re-run may find it converted), `clone()` returns a COMPONENT too. Convert the clone back with nothing — leave it; P3-T09 handles type normalization. Report which type you got.

## Step 3 — rework the Serie-post breadcrumb and content

Fresh run. In each `Serie post — *`:

- breadcrumb becomes three segments: `Blog` › `Web Performance` › plain text `Part 4 of 5`. On Mobile the live nav is `flex-col md:flex-row` — stack it vertically at 390.
- H1 → `Optimizing Images with Astro (part 1)`, description → its abstract, metadata `12 July 2026` · `8 min read`.
- the `blog/SerieContents` instance keeps `item / current` on index 3, matching that post.

## Step 4 — cold read-back + screenshot

Assert all four frames exist, that `Serie post — *` `PageContent` order is `PostHeader → cover → [TOC on Mobile] → Body → blog/SerieContents → blog/PostNav → All blog link`, and that `Serie — *` holds header + one `blog/SerieContents`.

Screenshot all four against `/blog/web-performance` and one of its posts.

---

## Acceptance

- 4 masters built; Serie-post derived from Post by clone, not hand-rebuilt.
- SerieContents present on both serie routes, `item / current` correct on the post.
- The boxless-vs-boxed landing-list divergence recorded.

---

## Report back

Paste this block back into Claude Code so `progress.md` can be written:

```
TASK: P3-T07
STATUS: done | partial | blocked
RESULT: <the JSON each step returned, trimmed to the interesting fields>
DEVIATIONS: <anything you did differently from this brief, and why>
UNBOUND: <raw values left unbound, with node names — or "none">
```
