---
title: "Fast Images in Astro: What the Framework Automates, and the One Piece It Doesn't"
date: 2026-06-24
description: "Images are the heaviest thing on most pages and usually the LCP element. Astro's astro:assets kills the ffmpeg-and-srcset toil, but two jobs stay yours: the sizes contract and a cache-aware fade no framework ships."
abstract: "From the bash era of resizing images by hand to astro:assets and the Netlify Image CDN: what the framework automates (formats, srcset, sizes, CLS prevention), the Tailwind 4 specificity gotcha, and the one perceived-performance layer — LQIP plus a fade that refuses to animate cached images — that you still have to write yourself."
draft: true
---

Images are almost always the heaviest thing a browser downloads, and on a content page the largest one is usually the [LCP element](/blog/web-performance/02-data-driven) — the metric the user feels first ([web.dev's LCP guide](https://web.dev/articles/optimize-lcp) puts images at the top of the cost list, and matches what I see in the field). So this is the opposite case from [Part 3](/blog/web-performance/03-benchmark-tables), where the win came from taking the DOM away from the framework. Here the framework already owns the hard part well. The work isn't custom code; it's configuration, plus one piece the framework deliberately leaves to you.

I know it's the opposite case because I did images the hard way for years first.

## The way I used to do it

Before `astro:assets`, responsive images meant a folder of bash scripts. The fundamentals haven't changed, so they're worth stating once. Start with the CSS baseline that makes an image fluid:

```css
img { display: block; max-width: 100%; height: auto; }
```

Then `srcset` with `w` descriptors, so the browser picks a file by viewport width *and* device pixel ratio:

```html
<img
  src="640.jpg"
  srcset="640.jpg 640w, 768.jpg 768w, 1024.jpg 1024w,
          1280.jpg 1280w, 1536.jpg 1536w, 2048.jpg 2048w"
  sizes="(max-width: 1023px) 100vw, (max-width: 1536px) 50vw, 768px"
  alt="">
```

The DPR detail is why one width is never enough: for a 1024px CSS slot, a DPR-2 screen wants the 2048px file. And `sizes` is the part no tool can guess — it tells the browser how wide the slot will be *before layout happens*, so it has to match your actual CSS (here: full width below 1024px, half width in a two-column grid, capped at 768px). Get `sizes` wrong and the browser confidently downloads the wrong file. ([MDN on `srcset`/`sizes`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#responsive_images) is the reference I keep open for this.)

Generating all those widths was a loop. This is the manual ancestor of every "blurred placeholder" you've seen — ImageMagick, resizing each source and producing one extra blurred copy at 640px:

```bash
for SIZE in "${SIZES[@]}"; do
  convert "$FILENAME" -resize $SIZE "out/${NAME}_$SIZE.$EXT"
  if [ "$SIZE" == "640x" ]; then
    convert "out/${NAME}_$SIZE.$EXT" -blur 0x8 "out/${NAME}_$SIZE-blur.$EXT"
  fi
done
```

It worked. It was also pure toil: every new breakpoint meant re-running the script and re-typing the `srcset`. Format conversion to AVIF/WebP wasn't even in there — that's a different tool. This is the work Astro deletes.

## What astro:assets removes

The whole script folder collapses into a component. `<Picture>` generates a `<picture>` element with one `<source>` per modern format and an `<img>` fallback:

```astro
---
import { Picture } from "astro:assets";
import hero from "./hero.png"; // 1600x900
---
<Picture src={hero} formats={["avif", "webp"]} layout="constrained"
  width={800} height={600} alt="…" />
```

List formats most-modern-first — the order is display priority. The `layout` prop is the part that replaces the entire gist: Astro generates both `srcset` and `sizes` for you, and emits the markup with the boring-but-critical attributes already set:

```html
<img src="/_astro/hero.hash.webp"
  srcset="…640w, …750w, …800w, …1080w, …1280w, …1600w"
  sizes="(min-width: 800px) 800px, 100vw"
  loading="lazy" decoding="async"
  width="800" height="600" data-astro-image="constrained">
```

That `width`/`height` pair is the quiet win. Astro reads the source dimensions and writes them into the tag, which reserves the space before the image loads and **prevents Cumulative Layout Shift** — the jump where text reflows as images pop in. Hand-rolled `<img>` tags forget this constantly; the framework can't.

None of this needs a server. `astro:assets` runs at build time by default, writing plain hashed files into `/_astro/` — `hero.hash.webp` and friends. That output is just static files, so it ships anywhere a folder ships: GitHub Pages, S3, a USB stick. (This very site is `jeromeabel.github.io` — the manual era ran on exactly that, no image service in sight.) The default [Sharp](https://docs.astro.build/en/guides/images/) service does the resizing during `pnpm build`; you pay the transform cost once, upfront, and serve the result as dead-simple static assets.

Netlify (this site's current adapter) buys one thing on top: the `@astrojs/netlify` adapter routes transforms through the **Netlify Image CDN**, so resizing moves to on-the-fly per request instead of build time. A site with hundreds of images doesn't pay for them upfront, and the CDN caches the variants at the edge. That's the only difference — an optimization on *when* the work happens, not a requirement.

You can point Astro's image service at a third party instead — Cloudinary, Imgix, and others have integrations. I don't, on purpose. The appeal of Sharp-or-Netlify is that the assets stay mine: they live in the repo, they transform in my build or my host's edge, and there's no paid subscription metering my image bandwidth. For a personal site, staying in control of my own data beats outsourcing it to a service I'd have to keep paying.

One gotcha specific to this stack. Astro can inject responsive styles globally:

```js
// astro.config.mjs
image: { responsiveStyles: true }, // default is false
```

The default is `false` — without it (or your own CSS) the generated images aren't actually responsive. It injects deliberately low-specificity rules via `:where([data-astro-image])`. But Tailwind 4 puts its utilities in a cascade layer, which ranks *below* unlayered rules — so **Astro's responsive styles win over your Tailwind classes** unless you turn `responsiveStyles` off. Worth knowing before you spend ten minutes wondering why `object-cover` does nothing.

The fix isn't to fight the cascade — `<Picture>` exposes `fit` and `position` props that pipe directly into those same responsive styles:

```astro
<Picture src={img} layout="constrained" fit="cover" position="top" alt="…" />
```

These are the right lever. A Tailwind class reaches the wrong layer; the props reach the right one. Turning `responsiveStyles` off and owning the CSS entirely is the other valid option.

The props become important once you want the same source image cropped differently per context — a square thumbnail on the grid, a wide landscape cover on the detail page. One import, different props per usage; Astro generates separate output files for each combination at build time:

```astro
{/* grid: square crop */}
<Picture src={img} layout="constrained" width={400} height={400} fit="cover" alt="…" />

{/* detail cover: landscape, focus top */}
<Picture src={img} layout="full-width" width={1200} height={600} fit="cover" position="top" alt="…" />
```

One source file, two cropped outputs, zero extra scripts. In Astro v6, responsive styles are emitted as a hashed class plus `data-astro-fit` / `data-astro-pos` attributes (replacing v5's inline `style="--fit; --pos"`). That distinction matters for the LQIP section below: `pictureAttributes={{ style: "opacity: 0" }}` sets an inline style on the outer `<picture>` element, and because v6's responsive styles live in a class — not an inline style — there's no attribute collision.

## Seven strategies, one benchmark

The [companion playground](https://astro-jeromeabel.netlify.app/optimg) runs all seven strategies side by side over the same 21-image dataset. The benchmark — `pnpm benchmark:optimg http://localhost:8888` — runs Lighthouse 13 three times per strategy and takes the median cold-cache, against `netlify serve` so the Netlify CDN's `/.netlify/images` endpoint resolves correctly:

| Strategy      | LCP (ms) | CLS   | Transfer (KB) |
|---|---|---|---|
| naive         | 4422     | 0.011 | 9179          |
| manual        | 965      | 0.000 | 939           |
| auto          | 1101     | 0.000 | 511           |
| pixel-perfect | 1037     | 0.000 | 230           |
| lqip          | 1251     | 0.000 | 528           |
| cropped       | 1569     | 0.000 | 546           |
| final         | 1057     | 0.000 | 247           |

Each row is a live route — open them and compare in your own browser:
[naive](https://astro-jeromeabel.netlify.app/optimg/naive) ·
[manual](https://astro-jeromeabel.netlify.app/optimg/manual) ·
[auto](https://astro-jeromeabel.netlify.app/optimg/auto) ·
[pixel-perfect](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect) ·
[lqip](https://astro-jeromeabel.netlify.app/optimg/lqip) ·
[cropped](https://astro-jeromeabel.netlify.app/optimg/cropped) ·
[final](https://astro-jeromeabel.netlify.app/optimg/final).

[![The /optimg hub showing this benchmark table rendered in the browser](./optimg-benchmark.png)](https://astro-jeromeabel.netlify.app/optimg)
*Placeholder — pending a real screenshot of [the /optimg hub](https://astro-jeromeabel.netlify.app/optimg). **Capture:** the full benchmark table + strategy cards; no specific image needed.*

Naive is still the measurement floor — raw `<img src>`, no `srcset`, no `width`/`height`, 9179 KB per page. Its CLS is now 0.011 despite missing dimensions because the grid container provides implicit space around each card. A previous run of this benchmark measured CLS at 0.201; the grid layout has since grown structure that absorbs the shift. The lesson stands: reserve space explicitly rather than relying on layout accidents.

Switching to `auto` — nothing beyond `<Picture>` — cuts LCP from 4422 ms to 1101 ms and transfer from 9179 KB to 511 KB before writing a line of extra code. Manual beats auto on LCP this run (965 ms vs 1101 ms) but loses on bytes (939 KB vs 511 KB): hand-encoded JPEGs at fixed widths instead of CDN-negotiated AVIF/WebP per request.

`pixel-perfect` is the byte story: 230 KB and 1037 ms LCP. Token-derived widths mean Astro generates files that match the slot exactly — the CDN never serves a wider file than the device needs.

`lqip` — LQIP placeholder with auto widths — lands at 1251 ms, *slower* than `pixel-perfect` (1037 ms). The placeholder paints immediately so perceived performance is better than the number, but Lighthouse counts LCP when the real image finishes loading. LQIP without accurate sizes is not automatically the fastest strategy on the metric.

`final` (1057 ms, 247 KB) shows what happens when both pieces are active: pixel-perfect widths deliver a smaller file, and the LQIP placeholder fills the slot immediately. It beats `lqip` alone by 194 ms because the real image is 528 KB vs 247 KB — the placeholder buys perceived time, but the download time drives the Lighthouse number. `cropped` (1569 ms, 546 KB) adds per-image aspect ratios but lands 468 ms behind `auto` (1101 ms): each cover request adds a CDN crop transform that the other strategies skip.

## One source, two crops

The `cropped` strategy is the smallest possible addition to `auto`: add `fit="cover"` and an explicit `height`, and Astro generates a cropped variant at build time.

```astro
{/* grid thumbnail: 4:3 */}
<Picture src={image} layout="constrained" fit="cover"
  width={640} height={480} sizes={autoSizes} alt={alt} />

{/* detail cover: 16:9 */}
<Picture src={image} layout="constrained" fit="cover"
  width={1280} height={720} sizes={autoSizes} alt={alt} />
```

Both read the same `image` import. Astro produces two output files — a 640×480 crop and a 1280×720 crop — during `pnpm build`. No server, no runtime transform; the CDN serves static files. What changes between the grid and detail view is the frame the user sees, not when the transform runs.

[![/optimg/cropped — grid thumbnail (4:3) and detail cover (16:9) side by side, same source image](./optimg-cropped.png)](https://astro-jeromeabel.netlify.app/optimg/cropped)
*Placeholder — pending a real screenshot. **Capture:** a `d`-overlay landscape (big baked title) so the reframing is obvious — e.g. `photo-04` (desert dunes). Put the grid thumbnail (4:3, [`/optimg/cropped`](https://astro-jeromeabel.netlify.app/optimg/cropped)) next to its detail cover (16:9, [`/optimg/cropped/photo-04`](https://astro-jeromeabel.netlify.app/optimg/cropped/photo-04)); same source, two crops.*

In the benchmark `cropped` (1569 ms, 546 KB) runs 468 ms behind `auto` (1101 ms): the CDN crop transform adds latency on the detail cover request that straight `auto` skips. The file size is similar — cropping changes the frame, not the bytes. What `cropped` teaches is that one source can serve multiple contexts with different aspect ratios without a script, a server route, or a CMS crop step. For gallery items where `crop: true` is set, the `final` strategy extends this — 16:9 covers and 4:3 thumbnails combined with pixel-perfect widths and the LQIP placeholder.

## The final stack

`final` combines everything: pixel-perfect token widths under a LQIP placeholder, with optional per-image crop. It beats `lqip` alone by 194 ms (1057 ms vs 1251 ms) because smaller files from accurate sizing more than offset the placeholder overhead.

The component adds pixel-perfect props to the `lqip` structure from the next section:

```astro
<div class="reveal-img relative overflow-hidden">
  <!-- 32px blurred placeholder, aspect-matched to the real image -->
  <img class="absolute inset-0 -z-10 h-full w-full object-cover blur-2xl"
    aria-hidden="true" src={placeholder} alt="" />

  <!-- pixel-perfect <Picture> with optional per-item crop -->
  <Picture
    src={image} layout="constrained"
    width={ppWidth} widths={ppWidths} sizes={ppSizes}
    height={finalHeight}
    fit={finalCrop ? "cover" : undefined}
    position={finalCrop ? "top" : undefined}
    pictureAttributes={{ style: "opacity:0" }}
    alt={alt} />
</div>
```

`ppWidth`, `ppWidths`, and `ppSizes` come from the layout tokens. `finalHeight` is only set when `item.crop: true` in `gallery.json`, adjusting the aspect ratio for both the placeholder (via `getImage`) and the real image (via `fit="cover"`). The reveal script is the same as for `lqip` — `img.complete` fires a snap on cached images and a 1.2 s fade on a network load.

[![/optimg/final mid-load with DevTools throttle (Slow 3G, disable cache) — LQIP placeholder visible before the real image streams in](./optimg-final-loading.png)](https://astro-jeromeabel.netlify.app/optimg/final)
*Placeholder — pending a real screenshot. **Capture:** [`/optimg/final`](https://astro-jeromeabel.netlify.app/optimg/final), DevTools throttle Slow 3G + disable cache, snap mid-load. Feature a `d`-overlay title photo (e.g. `photo-01`) so the blurred LQIP placeholder → sharp title transition is legible while the real file streams.*

The 20 ms gap between `pixel-perfect` (1037 ms) and `final` (1057 ms) is the LQIP overhead: a 32px WebP placeholder decoded and painted before the real file streams. On a fast connection the placeholder is gone before it registers; on a slow one it fills the slot immediately instead of a blank rectangle. The Lighthouse number barely moves; the user experience does.

## The one piece Astro doesn't give you

Everything above is bytes and layout. What Astro won't do is *perceived* performance: the user experience between the first paint and the moment the real image is ready. On a slow connection, the gap between "page appeared" and "images loaded" can run several seconds. Without a placeholder, every image slot is an empty white box — the page looks broken. That's the LQIP — low-quality image placeholder — and it's the one custom component still worth writing.

`getImage()` is the server-side escape hatch. I use it to render a tiny blurred placeholder, sized to the real image's aspect ratio so it doesn't distort:

```ts
const aspectRatio = img.width / img.height;
const w = aspectRatio >= 1 ? 32 : Math.round(32 * aspectRatio);
const h = aspectRatio >= 1 ? Math.round(32 / aspectRatio) : 32;
const placeholder = await getImage({ src: img, format: "jpg", width: w, height: h });
```

The placeholder sits behind the real image, blurred; the real `<Picture>` starts invisible. Astro's component props go to the inner `<img>`, so `pictureAttributes` is how you reach the outer element to start it hidden:

```astro
<div class="reveal-img relative overflow-hidden">
  <img class="absolute -z-10 h-full blur-2xl" aria-hidden="true"
    src={placeholder.src} alt="" />
  <Picture src={img} formats={["avif", "webp"]} sizes={sizes} alt={alt}
    pictureAttributes={{ style: "opacity: 0" }} />
</div>
```

There are two ways to make that placeholder look blurry, and they trade off differently. You can bake the blur into the file — the old ImageMagick `-blur 0x8` from the manual era — so the bytes arrive already soft and the browser does zero work. Or you ship a sharp 32px image and blur it in CSS (`blur-2xl`, or a `filter`). Baked-in blur costs nothing at runtime but the look is fixed at build; CSS blur is a live GPU filter — one extra compositing layer — but the radius is a class you can tweak, and on a 32×32 image the filter is so cheap it doesn't register. I use the CSS route precisely because the placeholder is already tiny: there's nothing to optimize, and I'd rather change `blur-2xl` to `blur-xl` in one place than re-run a script. On a large placeholder I'd bake it instead.

Then a small script fades the real image in on load. The one detail that matters — and the bug everyone hits — is the cache guard:

```ts
const showImage = () => {
  picture.style.opacity = "1";
  if (placeholder) placeholder.style.opacity = "0";
};
if (imgElement.complete) showImage();              // cached → snap, no animation
else {
  picture.style.transition = "opacity 1200ms ease";
  imgElement.addEventListener("load", showImage);  // network → fade
}
```

If you animate unconditionally, every back/forward navigation re-runs a 1.2s fade on images the browser already has, and the page strobes. Checking `img.complete` means the animation only ever plays on a real network load. I run this on `astro:page-load` so it survives View Transitions, where a naive `DOMContentLoaded` listener would fire once and never again.

I've now written this twice, and the two versions disagree on the details — which is the useful part:

| Aspect | This site | A comic site I also run |
|---|---|---|
| Placeholder | separate 32px blurred `<img>` behind | none — real `<img>` blurs in on itself |
| Transition | opacity, 1200ms | opacity + `filter: blur(10px)→0`, 400ms |
| `sizes` | hand-written per image type | `widths[]` + `sizes` computed from layout tokens |
| Cache guard | `img.complete` | `img.complete && naturalHeight !== 0` (stronger) |

The second column's guard is the better one: a cached-but-broken image reports `complete: true` with `naturalHeight: 0`, and only the stricter check skips the fade correctly. Same idea, learned twice.

The `sizes` row is the other place the comic site is sharper. Instead of hand-typing breakpoints, it computes `sizes` from the actual layout tokens — page max-width, padding, gap, the two-column grid — so the declared slot width matches what the image really occupies on screen:

```astro
const sizesAttr = [
  `(min-width: 768px) calc((min(100vw, ${pageMaxPx}px) - ${chromePx + gapPx}px) / 2)`,
  `calc(100vw - ${mobileChromePx}px)`,
].join(", ");
```

This is the accurate way to do `sizes`. Hand-written breakpoints drift the moment you change a margin; a `sizes` derived from the same tokens that drive the layout stays honest, and the browser stops over-fetching for a slot that's narrower than you guessed. More work to set up, fewer wasted bytes forever.

### When the extra accuracy actually earns its keep

Which raises the real question: why bother, when Astro's auto `layout` would have generated a perfectly reasonable `srcset` on its own? The answer is the *content* of the image, not the image as a concept.

For a photograph, you don't need pixel accuracy. The browser picks the nearest `srcset` step, scales it a few percent to fill the slot, and that scaling is invisible — a tree blurred by 4% looks like a tree. Auto `layout` is exactly right here, and hand-computing widths would be effort for nothing.

Le concept de la preuve is the opposite case. The images are comic pages — line art and lettering. If the served file is even slightly wider or narrower than the slot, the browser resamples it, and resampling text is where it shows: edges go soft, thin strokes shimmer, the lettering reads as faintly out of focus. There's no "close enough" for a glyph the way there is for foliage. So that site computes the exact display widths from its layout and serves a file that lands on the slot with no scaling at all. The extra math buys sharp text, which is the entire point of the page.

That's the manual-vs-automatic line, and it isn't about how much you trust the framework — it's about what's *in* the picture. Photos, screenshots, hero banners: let `layout` do it. Text, line art, diagrams, anything with hard edges a reader will scrutinize: compute the widths so the browser never has to resample. The framework's default is tuned for the common case; the uncommon case is exactly the one worth the manual work. The companion playground makes this concrete. A grating only *reads* — bars individually visible — when each bar is a few pixels wide at the displayed slot, and a 20-image gallery shows that slot at anything from a ~316px grid thumbnail to a 976px cover. So a single bar width can't demonstrate the effect everywhere: bake bars fine enough for the cover and they collapse to a sub-pixel mush in the grid; bake them coarse enough for the grid and they're crude on the cover. The fix is two stacked gratings baked at source resolution: a **coarse** band (60px period) tuned to read at the grid thumbnail, and a **fine** band (20px period) tuned for the cover. Whatever layout you're viewing, one band is in its sweet spot and the other is the control. Serve the file at exactly the display slot width and the bars reproduce cleanly. Serve it at an off-exact width and the browser resamples; the periodic grid shifts out of phase, and you get *moiré* — alternating light and dark interference bands that signal a sampling mismatch ([Wikipedia: Moiré pattern](https://en.wikipedia.org/wiki/Moir%C3%A9_pattern)). The `pixel-perfect` strategy eliminates it by serving a file that lands on the slot with no scaling at all; `auto` doesn't, and the interference bands are visible. The effect is extreme on a ruled grating, but the same physics governs any hard-edged periodic content: thin letterstrokes, ruled lines, hatching, pixel art. The grating makes the problem impossible to miss.

[![/optimg/auto vs /optimg/pixel-perfect — same grating image at the same viewport, moiré bands visible on auto, clean bars on pixel-perfect](./optimg-moire.png)](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug)
*Placeholder — pending a real screenshot.* **To capture:** open [`/optimg/auto?debug`](https://astro-jeromeabel.netlify.app/optimg/auto?debug) and [`/optimg/pixel-perfect?debug`](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug) side by side at a **≥1024px viewport** (so the lg 3-col thumb is exactly 316px) and focus on the two-grating photos (`photo-12`, `photo-16`, `photo-20`). The coarse top band is the one that reads at this slot: on `auto` the badge shows a wider served file (e.g. `640w`) and the bars shimmer into moiré; on `pixel-perfect` it shows `slot 316 · 316w · ✓ ok` and the bars stay crisp. For the fine band, repeat the comparison on a detail page (`…/auto/photo-12?debug` vs `…/pixel-perfect/photo-12?debug`), where the 976px cover puts the fine grating in its sweet spot.*

## The debug overlay

Every strategy route accepts a `?debug` query parameter that attaches a per-card badge showing what the browser actually loaded versus what the slot required:

[![/optimg/pixel-perfect?debug — cards with per-card badges showing slot, DPR, served width, and verdict](./optimg-debug.png)](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug)
*Placeholder — pending a real screenshot. **Capture:** [`/optimg/pixel-perfect?debug`](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug) at ≥1024px so the lg cards read `slot 316 · 316w · ✓ ok`. Frame the hard-edged overlays where the verdict matters — the `e` moiré photos (`photo-12/16/20`) and an `a`/`c` text-overlay (`photo-11`, `photo-13`). For contrast, the same grid on [`/optimg/naive?debug`](https://astro-jeromeabel.netlify.app/optimg/naive?debug) shows the over-fetch badge.*

```
slot 316 · DPR 1 · 316w · ✓ ok
slot 316 · DPR 2 · 632w · ✓ ok
```

**slot** — CSS display width in pixels at the current viewport. **DPR** — device pixel ratio. **served width** — the `w` parameter from the CDN URL for strategies with `srcset`, or the image's natural width for `naive` and `manual`. **verdict**: `✓ ok` (file covers the slot at this density), `✗ short` (upscaling — real bug), `≫ over` (over-fetch by more than 25%).

For `naive`, the badge shows the full source width with no `srcset` annotation — the over-fetch is explicit. For `pixel-perfect` and `final`, every card should read `✓ ok` at 1× and 2× DPR: the token-derived widths are computed to land the file on the slot at both densities with no resampling.

The overlay persists across grid → detail navigation via `sessionStorage`. A floating "🔍 debug: on" button clears it. Lighthouse runs are never affected — the overlay requires `?debug` in the URL or a manually set session flag, neither of which is present in a fresh browser run.

## Eager hero vs lazy rest

One last lever, and it's the [Part 1](/blog/web-performance/01-tactics-cheatsheet) LCP point made concrete. Astro defaults every image to `loading="lazy"`, which is right for everything *except* the one image that is the LCP element. So the component takes a `type`: a `cover` hero loads eager and high-priority, everything else stays lazy.

```astro
loading={type === "cover" ? "eager" : "lazy"}
fetchpriority={type === "cover" ? "high" : "auto"}
```

`fetchpriority="high"` tells the browser to pull the hero before the lazy images further down. It's two attributes, and it's the difference between the LCP element arriving first or waiting in line behind decorative content.

## What I Learned

- The framework deleted the bash toil — formats, `srcset`, resizing. The `sizes` contract is the one part it can't generate, because only you know your layout.
- Auto `width`/`height` for CLS prevention is the silent win. Smaller files are nice; not shifting the layout is what users actually feel.
- LQIP and fade are perceived performance, not bytes. They won't move a Lighthouse score and that's fine — they're a different axis.
- Numbers in one place: `auto` vs `naive` is 1101 ms vs 4422 ms LCP, 511 KB vs 9179 KB — just `<Picture>`, no extra code. Among automated strategies, `pixel-perfect` (1037 ms, 230 KB) leads on both LCP and bytes; `final` (1057 ms, 247 KB) adds 20 ms and 17 KB for the LQIP perceived-speed layer.
- Measure cold, not warm. Lighthouse runs with an empty cache, so its numbers are first-visit; a manual reload is cached and always looks faster. Compare strategies cold (a 3-run median), and treat the warm reload as the *felt* experience, not the benchmark.
- Never animate a cached image. Guard on `img.complete` (or `complete && naturalHeight !== 0`), or back/forward navigation strobes.
- The output is plain static files. `astro:assets` works on GitHub Pages with no image service at all — Netlify's CDN just moves transform cost off build time. Same `/_astro/` files, different bill.
- You can outsource images to Cloudinary or Imgix, but Sharp-or-Netlify keeps the assets in the repo and off a subscription. For a personal site, owning the data wins.
- Accurate `sizes` comes from your layout tokens, not hand-typed breakpoints — derive it from the same values that drive the grid and it stops drifting.
- Manual vs automatic is decided by image content. Photos tolerate `srcset` stepping — auto `layout` is fine. Text and line art blur when resampled, so compute exact widths and serve a file that lands on the slot with zero scaling.
- Moiré is a visible signal, not decoration. A periodic grating resampled at a mismatched frequency erupts into interference bands — it makes the resampling problem impossible to miss and directly motivates the pixel-perfect approach.
- LQIP blur is a tradeoff: bake it into the file (zero runtime, fixed) or blur in CSS (live, tweakable). On a 32px placeholder, CSS is free — so I tweak instead of re-running scripts.
- Tailwind 4's cascade layer loses to Astro's responsive styles by default. Know which one wins before you debug the wrong file.
- One source, two crops: `fit="cover"` with different `height` values produces separate build-time outputs. No server, no script — one import, two transforms, zero runtime cost.
- LQIP alone isn't the fastest strategy on the LCP metric: `lqip` (1251 ms) is slower than `pixel-perfect` (1037 ms) because auto widths still serve a larger file. Accurate sizing matters more than a placeholder.
- `final` beats `lqip` by 194 ms (1057 ms vs 1251 ms) by combining both: smaller files from pixel-perfect widths reduce real load time, and the LQIP placeholder fills the visible slot immediately.
- The debug overlay (`?debug` on any strategy URL) shows slot width, DPR, served width, and a verdict per card. It's how you verify pixel-perfect is actually working — not by reading the `srcset`, but by watching what the browser chose at your viewport and DPR.
