---
title: "Clickable Images in Astro Markdown: Inline Expand and Lightbox"
date: 2026-04-16
description: "How to make images in Astro markdown blog posts clickable — with two modes: inline expand (breaking out of the prose container) and lightbox modal. No dependencies, no MDX required."
abstract: "A step-by-step guide to adding click-to-expand and lightbox behavior to images inside Astro markdown content, using a client-side script, a few CSS rules, and a data attribute on the prose wrapper."
draft: false
---

Images inside markdown blog posts are constrained by the prose container. That's fine for reading flow, but charts, diagrams, and screenshots often need to be seen larger. I wanted a way to click an image and see it bigger — without installing a library, without switching to MDX, and without changing any markdown files.

The result: a `data-expand-image` attribute on the prose wrapper that enables one of two modes — **inline expand** (the image breaks out of the container in place) or **modal** (a lightbox overlay). Zero changes to existing markdown. Works with Astro's View Transitions. Skips small screens where images are already full-width.

---

## The constraint: standard markdown, not MDX

Astro renders markdown via `<Content />` at build time. Unlike MDX, you can't use components inside the content. So the three realistic approaches are:

1. **Client-side script** — find images in the DOM after render, add click handlers. No markdown changes needed.
2. **Remark plugin** — transform the AST at build time to wrap images. More complex, build-time only.
3. **CSS-only** — limited interactions, no modal possible.

I went with option 1. It works for all existing and future posts, and the behavior is opt-in per page.

---

## The design: two modes, one attribute

Rather than a single behavior, I wanted two options:

- **`data-expand-image="inline"`** — click toggles the image between its prose-constrained size and its natural size, breaking out of the container. Good for charts and diagrams where you want to see detail without losing your reading position.
- **`data-expand-image="modal"`** — click opens the image in a centered lightbox overlay. Good for screenshots or photos where you want full focus.

The attribute lives on the `<Prose>` wrapper component, not on individual images. Every image inside that prose section gets the behavior.

```astro
<Prose class="mt-4 md:mx-auto md:mt-8" data-expand-image="inline">
  <Content />
</Prose>
```

No attribute means no zoom — pages that don't need it are completely unaffected.

---

## Step 1: Forward attributes through the Prose component

Astro components don't forward unknown props by default. To let `data-expand-image` pass through to the rendered `<section>`, use rest props:

```astro
---
const { class: className, ...attrs } = Astro.props;
---

<section
  {...attrs}
  class:list={[
    "prose sm:prose-lg lg:prose-xl ...",
    [className],
  ]}
>
  <slot />
</section>
```

The `...attrs` spread passes any extra attributes (like `data-expand-image`) directly to the DOM element.

---

## Step 2: The CSS

The styles are minimal. The script handles sizing via inline styles (since each image has a different natural width), so the CSS only needs to handle cursors, overflow, and the lightbox backdrop.

```css
/* Override overflow on ancestor elements when an image is expanded */
.img-zoom-active {
  overflow: visible !important;
}

@media (min-width: 768px) {
  .prose[data-expand-image] img {
    cursor: zoom-in;
  }

  .prose img.img-expanded {
    cursor: zoom-out;
    max-width: none;
    z-index: 10;
  }
}

/* Lightbox backdrop (used by modal mode) */
.img-lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.img-lightbox-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}

.img-lightbox-backdrop img {
  max-width: 80vw;
  max-height: 80vh;
  object-fit: contain;
}
```

A few things to note:

- **`pointer-events: none` on the backdrop** when inactive. Without this, the invisible backdrop blocks clicks on the page content underneath.
- **`cursor: zoom-in` scoped to `@media (min-width: 768px)`**. On small screens the zoom behavior is disabled (more on that below), so the cursor shouldn't suggest it's clickable.
- **No transitions on the inline expand.** I tried animating `width` and `margin-left` — the image shifts awkwardly because both properties change at different visual rates. Snap in/out is cleaner.

---

## Step 3: The script

The full script, saved as `src/scripts/image-zoom.ts` and loaded in the layout:

```typescript
document.addEventListener("astro:page-load", () => {
  const prose = document.querySelector<HTMLElement>(
    ".prose[data-expand-image]"
  );
  if (!prose) return;

  const mode = prose.dataset.expandImage; // "inline" or "modal"
  const images = prose.querySelectorAll<HTMLImageElement>("img");
  if (images.length === 0) return;

  // --- Shared ---
  let expandedImg: HTMLImageElement | null = null;
  const overflowParents: HTMLElement[] = [];

  function isExpandable(img: HTMLImageElement) {
    const targetWidth = Math.min(
      img.naturalWidth,
      window.innerWidth * 0.8
    );
    return targetWidth > img.offsetWidth;
  }

  // --- Inline mode ---
  function setOverflowVisible(img: HTMLImageElement) {
    let el: HTMLElement | null = img.parentElement;
    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      if (
        style.overflow !== "visible" ||
        style.overflowX !== "visible"
      ) {
        el.classList.add("img-zoom-active");
        overflowParents.push(el);
      }
      el = el.parentElement;
    }
  }

  function restoreOverflow() {
    overflowParents.forEach((el) =>
      el.classList.remove("img-zoom-active")
    );
    overflowParents.length = 0;
  }

  function toggleInline(img: HTMLImageElement) {
    if (img === expandedImg) {
      img.classList.remove("img-expanded");
      img.style.width = "";
      img.style.marginLeft = "";
      expandedImg = null;
      restoreOverflow();
      return;
    }

    if (expandedImg) {
      expandedImg.classList.remove("img-expanded");
      expandedImg.style.width = "";
      expandedImg.style.marginLeft = "";
      restoreOverflow();
    }

    const targetWidth = Math.min(
      img.naturalWidth,
      window.innerWidth * 0.8
    );
    const currentWidth = img.offsetWidth;
    const marginLeft = -(targetWidth - currentWidth) / 2;

    img.classList.add("img-expanded");
    img.style.width = `${targetWidth}px`;
    img.style.marginLeft = `${marginLeft}px`;
    expandedImg = img;
    setOverflowVisible(img);
  }

  // --- Modal mode ---
  let backdrop: HTMLDivElement | null = null;
  let lightboxImg: HTMLImageElement | null = null;

  function openModal(src: string, alt: string) {
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "img-lightbox-backdrop";
      backdrop.addEventListener("click", closeModal);
      lightboxImg = document.createElement("img");
      backdrop.appendChild(lightboxImg);
      document.body.appendChild(backdrop);
    }
    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
    }
    backdrop.offsetHeight; // force reflow for transition
    backdrop.classList.add("active");
    document.addEventListener("keydown", handleEscape);
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove("active");
    document.removeEventListener("keydown", handleEscape);
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (mode === "modal") closeModal();
      else if (expandedImg) toggleInline(expandedImg);
    }
  }

  // --- Bind ---
  images.forEach((img) => {
    img.addEventListener("click", () => {
      if (img === expandedImg) {
        toggleInline(img);
        return;
      }
      if (!isExpandable(img)) return;
      if (mode === "modal") openModal(img.src, img.alt);
      else toggleInline(img);
    });
  });
});
```

Wire it in the layout alongside other scripts:

```html
<script src="../scripts/image-zoom.ts"></script>
```

---

## The tricky parts

### Why `astro:page-load` instead of `DOMContentLoaded`

If your site uses Astro's View Transitions (`ClientRouter`), `DOMContentLoaded` fires only on the initial full page load. Navigating between pages via client-side routing doesn't trigger it again. `astro:page-load` fires on every navigation — initial load and every subsequent client-side transition.

### Why check expandability at click time

Markdown images are typically lazy-loaded. When the script initializes, images below the fold haven't loaded yet — their `naturalWidth` is `0`. By the time a user scrolls down and clicks, the image is loaded and `naturalWidth` is reliable. Checking at click time avoids the race condition entirely.

### Why the collapse click needs special handling

The `isExpandable` function compares the target expanded width against the image's current `offsetWidth`. But when an image is already expanded, its `offsetWidth` *is* the expanded width — so `isExpandable` returns `false` and the click is silently swallowed. The fix: always let collapse through before checking expandability.

```typescript
if (img === expandedImg) {
  toggleInline(img);
  return;
}
if (!isExpandable(img)) return;
```

### Why small screens are handled without a media query

The `isExpandable` check compares `Math.min(naturalWidth, viewportWidth * 0.8)` against the image's displayed width. On small screens, `viewportWidth * 0.8` is often *smaller* than the image's displayed width (since prose images already fill most of the screen). The function returns `false`, and clicking does nothing. No separate mobile check needed — the math handles it.

### The overflow problem

Astro and Tailwind layouts commonly use `overflow-x: hidden` on containers. When an image expands beyond its container, these overflow rules clip it. The script walks up the DOM tree from the image, finds every ancestor with hidden or auto overflow, and temporarily adds `.img-zoom-active` (which sets `overflow: visible !important`). On collapse, it restores them.

This is the least elegant part of the solution. It works because the scope is narrow — only active while an image is expanded — but it's worth knowing that the `!important` override exists.

### Why no animation on inline expand

I tried CSS transitions on `width` and `margin-left`. The image shifts horizontally as it expands because the margin and width change at different visual rates — it looks like the image is sliding sideways before settling. `transform: scale()` avoids the layout shift but doesn't actually change the image's rendered size in the document flow, so surrounding content doesn't reflow. Snap in/out turned out to be the cleanest UX. The modal mode does use a fade transition on the backdrop, where it feels natural.

---

## Usage

Add the attribute to any page where you want the behavior:

```astro
<!-- Inline expand: image breaks out of prose container -->
<Prose data-expand-image="inline">
  <Content />
</Prose>

<!-- Modal: image opens in a lightbox overlay -->
<Prose data-expand-image="modal">
  <Content />
</Prose>

<!-- No attribute: normal behavior, no click handling -->
<Prose>
  <Content />
</Prose>
```

No changes to markdown files. No new dependencies. Images that are already smaller than the prose container width are ignored — clicking them does nothing.
