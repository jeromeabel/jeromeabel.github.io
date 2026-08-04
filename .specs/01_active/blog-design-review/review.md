# UX/UI Design Review — Home & Blog pages (v3, Figma)

date: 2026-08-04
scope: `v3/Home — 1920 — Dark` (2001:1670), `v3/Blog — 1920 — Dark` (2116:869),
XP-1 variants (2359:8141, 2361:9617), `Components (new)` page —
Blog Design System v1.0 (`ihWIWmvtQPTWgUxlrVjC2c`).
Focus: PostCardPreviewBig, PostCardPreviewSmall, SerieCard, PostRow.
Companion knowledge artifacts: `.claude/skills/design-expert/` (settled rules
distilled from this review). Visual option mockups: HTML artifact "Blog DS —
UI decisions".

## Verdict summary

Layouts are right (1+3 home, 3-cols series + rows blog) — keep v3, not XP-1.
The open questions all resolve with three principles:

1. **One chip per card/row** — serie chip replaces topic chip on serie posts.
2. **Accent = navigational** — teal only on things that go somewhere; topics stay muted.
3. **Border = aggregate** — SerieCard bordered, post cards borderless, rows hairline.

Taxonomy: split `topic` (single enum of 6, subject) from `stack` (array,
frameworks). Series carry the topic; serie posts inherit it.

---

## 1. Taxonomy — serie + topic + stack

**Current state (audited against content, 21 published posts):** `topic` is a
free-text CSV string mixing subjects and stacks (`"astro, performance"`,
`"nuxt, testing"`). Mislabels exist: `web-performance/01–03` are tagged `astro`
with zero Astro content. Series have no topic field. Figma already ships a
6-variant `PostTopic` set: fullstack, performance, architecture, testing, ui, ai.

**Options considered:**

| Option | Pros | Cons |
|---|---|---|
| A. Multi-topic per post (tags) | Captures overlap (posts genuinely span 2–4 themes) | Chip stacks on cards, meaningless filters at 21 posts, endless tagging debates |
| B. **One topic enum + separate `stack` array** ✅ | Clean chips, honest subjects, framework filtering stays possible, matches `work.stack` convention | Forces one editorial choice per post (feature, not bug) |
| C. Topic derived from serie only | Zero redundancy | Standalone posts left untyped; serie ≠ subject conceptually |

**Recommendation (B):**
- `topic: z.enum(['performance','testing','architecture','full-stack','ai','ui'])`
  — exactly one per post. Distribution check against real content: testing ≈11,
  performance ≈6, architecture ≈4, full-stack ≈4, ai ≈2, ui ≈0 (planned).
- `stack: z.array(z.string()).optional()` — `astro`, `vue`, `nuxt`… Not shown on
  cards/rows; shown on post page. This answers "is knowledge framework-bound?"
  — yes, and that's a *stack* facet, not a topic.
- **Serie gets `topic`** (schema addition); serie posts inherit it. This fixes
  the astro mislabels structurally.
- **Filter UI: not yet.** At 21 posts a scroll beats a filter. Chips stay
  passive labels; revisit at ~40+ posts (rows section only, if ever).
- Migration table: see `design-expert/references/taxonomy.md`.

## 2. Serie chip vs topic chip redundancy

v3 Home already does the right thing silently: featured card shows the serie
chip (`📁 WEB PERFORMANCE · PART 2 OF 5`), small standalone cards show
`FULL-STACK`. XP-1 blog rows show serie chip *above* the title **plus** a boxed
topic on the right — that's the redundancy you sensed. 

**Rule: one chip per card/row; serie wins.** Serie membership implies the topic
(serie carries it), and the folder icon makes the semantic difference readable.
Consistency concern ("one chip might break scanning") is resolved by the *slot*:
both chip types occupy the same position, same size, same case. Scanning
consistency comes from position + typography, not identical semantics.
Consequence: XP-1's two-line rows (chip above title) go away — v3 single-line
rows scan better and are ~30% denser.

## 3. Card borders & padding

Your instinct is correct — codify it as **border = aggregate entity**:

- **SerieCard: border + padding.** It packages image/meta/title/desc/date-range
  into one navigable "product". XP-1's bordered serie cards with real imagery
  are the best version — port that treatment back into v3.
- **Post cards (home, big & small): borderless, no padding.** The image anchors
  the card; a border double-frames it. v3 correct.
- **PostRow: hairline border-bottom + vertical padding.** List idiom. v3 correct.

## 4. Hover effects

One primitive everywhere + one addition per anatomy (see
`design-expert/references/ui-system.md`): title→teal 150–200ms, whole surface
clickable; bordered card also border→teal; borderless card subtle image
brightness/scale (pick one, site-wide); row gets full-width bg tint.
`prefers-reduced-motion`: color ok, no scale. Focus-visible ring required
(keyboard parity with hover).

## 5. Accent colors — teal vs violet

**Single accent: teal.** Accent marks *interactivity/navigation*: links, serie
chips, CTAs, hovers, serie-card titles. Topics/dates/read-time stay muted —
they're labels. XP-1's violet chips create a second accent competing on
same-role elements; with two accents neither means anything. Violet: drop from
the UI system (keep in illustration palette if wanted — images may carry it,
chrome may not).

## 6. Topic display (accent/box/icon)

- **Neutral, not accent** (passive metadata — reading importance is third layer,
  after title and description).
- **Text, not box.** Boxed grey chips (XP-1 rows) read as buttons/filters —
  false affordance until filtering exists.
- **No icon.** Folder icon is reserved for series — it's what makes the
  "belongs to" meaning legible at a glance. `PostTopic` keeping icon-free
  variants is right; `TagChip-xp-1` box variants: archive.

## 7. Metadata (date, read time)

Mono + uppercase + low contrast is fine as the third reading layer **if** it
clears WCAG AA (4.5:1) at ~12px — several v3 greys look borderline; verify with
`figma:verify` tokens rather than eyeballing. Formats: cards
`May 12, 2026 · 18 min`; rows `May 12 · 18 min` (year lives in the gutter);
series `Mar–Jul 2026 · 6 parts`. XP-1's stacked two-line date/time on rows adds
height for no information — keep v3 inline form.

## 8. Typography

XP-1's display/techy font on card titles (home XP-1) hurts scanning — reserve
display for page H1 (`BLOG`) only. Card/row titles: sans bold. v3 correct.

## 9. Responsive (to design next — missing frames)

Only 1920/1536 frames exist. Needed: 1024/768/390 variants of Home-blog and
Blog page. Rules to design against (full table in
`design-expert/references/ui-system.md`):
- Home 1+3: featured goes full-width image-top; smalls become image-left rows
  (~96px thumb), description hidden under 768.
- Series grid 3→2→1.
- Rows: under 768 wrap to two lines (title / chip + date), year gutter becomes
  inline year heading.
- Touch: whole row/card one tap target; nothing hover-only.

## 10. Mock-data bugs in current frames (fix before user-testing)

- Same description on all three series cards; "Testing a Simple Nuxt Feature"
  card describes web performance. Duplicated placeholder titles
  ("Optimizing Images…" ×6) hide wrapping bugs — vary mock lengths.
- Featured chip says `PART 2 OF 5`, blog page says `6 parts` for the same serie.
- "My Ai Journey" → "My AI Journey".
- Figma `PostTopic` variant `fullstack` vs code `full-stack` — align on next touch.

---

# Round 2 (2026-08-04) — benchmark-informed debates

User feedback on round 1: hover/accent/chip verdicts needed real benchmarks,
not reasoning alone. Two studies run (full data:
`design-expert/references/benchmarks.md`): **A** — 8 dev blogs CSS-verified
(GitHub, Vercel, Astro, Tailwind, Stripe, Josh Comeau, Overreacted, leerob);
**B** — 5 design systems on chip semantics (Primer, Material 3, Atlassian,
shadcn, Carbon).

## Decided in round 2 (user)

- **Taxonomy adopted**: one topic per post, enum of **5** (`ui` deleted),
  `stack` optional array, serie carries topic + posts inherit. Applied to
  `design-expert/references/taxonomy.md` incl. stack usage spec (post-page
  metadata, `article:tag` SEO, related-content signal, future filter).

## D1-hover — title accent vs underline (revised)

Benchmark: title→accent on hover is minority (2/8); GitHub can color titles
because its cards have no chips. 0/8 sites stack two hover signals.

| Option | Pros | Cons |
|---|---|---|
| A. Title → teal | Strong affordance | Collides with adjacent teal serie chip (user's instinct — confirmed); repaints text |
| B. **Underline decoration appears** (teal decoration, text unchanged — Josh Comeau) ✅ | GitHub-blog-familiar idiom; spends almost no accent budget; typography-native; dark/light safe | Subtler; multi-line underline slightly busy |
| C. Container-only (bg tint / scale — Vercel/Astro) | Quietest; matches whole-surface link | Weak affordance on borderless image cards |
| D. Underline + accent color | — | Double signal, 0/8 precedent |

**Rec: B for cards, C (bg tint) for rows** — one gesture per surface:
rows = bg tint alone; borderless cards = underline + coupled slow image
scale(1.02) (GitHub `:has` gesture); SerieCard = neutral border lighten +
underline + faint lift (NOT border→teal — accent overload, user's concern).

## D1bis — accent budget (benchmark study)

5/8 blogs: zero accent inside cards at rest. Where accent exists: CTAs
("Read more" — Tailwind, Stripe), category links (Stripe), focus outlines
(Astro, Josh). Never titles (except Overreacted's deliberate all-color design).

**Resulting budget** (now in ui-system.md): serie chip (accent category-link,
Stripe precedent) · section CTAs · active nav · focus outlines · hover
underline decoration. Nothing else. **SerieCard `6 parts` meta → muted, not
teal** — it's metadata; the whole card is the link; accent falsely promises a
separate click target (Carbon: don't make tags navigational-looking).

## D2 — topic display (revised: box rehabilitated)

Study B kills the round-1 argument "box = button": static muted boxes are
first-class (Carbon read-only Tag, Primer Label, Atlassian static Tag —
"subtle"). What's off-spec: border + hover + pointer on a dead label.
Study A adds: 0/8 blogs box categories; 6/8 show no topic on cards at all.

| Option | Pros | Cons |
|---|---|---|
| A. Muted plain text | Dev-blog convention (Vercel); quietest | User's worry confirmed risk: reads as one more metadata token next to date · min |
| B. **Muted bg-only box** (no border, no hover, no pointer) ✅ | Visually separates topic from date metadata; design-system-clean; documented upgrade path to filter (Carbon read-only→selectable, Primer Label→Token) | Zero dev-blog precedent; slight weight added to rows |
| C. No topic on cards/rows at all | Majority blog pattern (6/8); kills the debate | Loses scanning info; empty chip slot on standalone rows breaks slot symmetry with serie chip |

**Rec: B.** Addresses "too close to metadata" directly; defers nothing —
filtering upgrade is additive. C stays credible if rows feel heavy in practice.

## D3 — images (revised)

Rest state: **full brightness always** — 3/3 benchmark sites; no dim, no
opacity, no tint at rest (user's "well-enlightened image on first view"
confirmed as the industry norm). LQIP fade ends at 100%.

| Hover option | Pros | Cons |
|---|---|---|
| **Scale 1.02, ~500ms ease-out** ✅ | Only benchmarked image hover (GitHub); depth without color distortion; slow = calm | Needs `overflow:hidden`; disabled under reduced-motion |
| Brighten | No motion | 0/8 precedent; light-mint gradient covers wash out |
| Teal tint overlay | Brand-y | Covers already teal duotone → muddy; 0/8 |
| None (Stripe) | Simplest | Card hover rests entirely on underline |

**Rec: scale**, coupled with title underline as one gesture; reduced-motion
falls back to underline only.

## Round-2 picks — DECIDED (user, 2026-08-04)

1. Hover system confirmed: rows bg tint · cards underline + slow small
   image scale(1.02) · SerieCard neutral border lighten + underline.
2. Topic display: **muted bg-only box** (B).
3. Image hover: **small scale**.

→ Applied to Figma: PostTopic restyle, SerieCard `6 parts` → muted, hover
variants, XP-1 sections archived.
