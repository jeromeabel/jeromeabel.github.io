# Hero copy — full context pack

> Self-contained. An LLM (or human) reading only this file has everything needed
> to write or critique hero/tagline copy for jeromeabel.net (dev portfolio).
> Updated: 2026-07-19.

## The task

Rewrite the HOME hero tagline (and, cascading, the Work intro and About lead)
for the v3 redesign. The current copy and two rounds of drafts were rejected.
Target: **conversational, human, concrete**. Budget: 4–5 feedback loops with
Jérôme; this file is the shared context between loops.

## Who Jérôme is (facts, not spin)

- French developer, lives in France. Site: https://dev.jeromeabel.net (EN).
  Artistic work lives separately at https://jeromeabel.net.
- ~2010–2021: software artist & creative technologist. Real things he built:
  - **Chimères Orchestra** — fleet of robotic drummers tapping on urban poles
    and street furniture, exhibited across Europe/Africa (Brussels, Dakar,
    Montreal, Dubrovnik, Neuss, Tunis, Dublin, Paris…).
  - **La Malinette** — open-source creative-coding framework (Pure Data based)
    used in schools; 5000+ downloads. Built and maintained it for years.
  - **QSox** — open-source cross-platform audio batch editor (CICM research).
  - Interactive installations, video tracking for performances, wireless art
    pieces 1 km apart, light sculptures, fablab work.
  - Taught electronics/programming/open-source to 1000+ people (fablabs,
    schools, artist residencies).
- ~2021: intensive career change into web development (bootcamp-style).
- Raccourci Agency: Vue + Kotlin. Now: front end at **Uhlive** (uh.live),
  AI-driven call-intelligence product. Vue + TypeScript daily.
- Writes a technical blog: web performance (serie), testing in Nuxt (serie),
  AI-assisted engineering practice (serie "My AI Journey"), Astro how-tos.
- Day-job code is private; public proof = blog + old art/open-source work.

## What the hero must do

1. In ~5 seconds: who is this, why is he different, is he credible.
2. Carry the decided positioning: **arc from artistic problems to product
   problems** — versatility (HCI/IHM, creativity, problem-solving) is the
   story. He's not "a Vue dev"; he's someone who has pointed code at very
   different problems for 15 years and now points it at products.
3. Set the site's voice: it's a personal site with a blog about craft,
   not a LinkedIn profile.
4. Sit under the headline **"Hi, I'm Jérôme."** (headline stays).

## Hard constraints

- No "since 2010" — it appeared 4× across the site (hero, work intro, about,
  facts). At most ONE dated anchor on the whole site (the About facts strip
  keeps "2010"). The hero gets zero dates or at most a loose "a decade".
- No marketing/LinkedIn abstractions. Banned-by-example: "craft" as a noun
  dropped for prestige, "user-centric", "product design mindset",
  "interfaces that feel right", "obsession", "The constant: …", triadic
  em-dash lists that sound like a pitch deck.
- English, but plain — Jérôme is French; the copy must be sayable out loud
  without sounding like a native copywriter wrote it.
- Conversational and human ≠ jokey. Dry, warm, specific.

## Voice evidence (how he actually writes)

From his own project descriptions:

> "As a tribe, they tap on poles in the city to create sound rhythms: an echo
> of human activities in primitive rhythms." (Chimères)

> "Find a bar in Brest, France" (entire description of a side project —
> dry, minimal)

> "Building a minimal comic blog with Astro that stays almost entirely static —
> except for one serverless endpoint that handles votes." (Le concept de la
> preuve — concrete, one honest technical detail)

Current About lead (the one line everyone agrees works):

> "Artist turned web developer — I build things meant to be used, not just seen."

Blog intro: "Web performance, clean architecture, and the craft of web
engineering."

## Current copy being replaced

HOME hero (HeroText.astro):

> "I've been making things with code since 2010 — robotic drum orchestras,
> audio tools, open-source frameworks, and now web applications. Here I write
> about the craft of building them well."

WORK intro (work.astro):

> "Open work since 2010 — art systems, tools, experiments — where you can see
> how I think. What I build at my day job is private; the writing covers how
> I build now."

## Rejected drafts and why (loop 0 + 1)

Rejected as "too used": "Coding since 2010", "making things with code".

Rejected as "too bullshit" (marketing cadence, abstract nouns, thinker-pose):

- A: "I solve problems with code. For a decade they were artistic ones —
  robotic orchestras, interactive machines, tools for artists. Now they're
  product ones: user-centric web apps, built with craft."
- B: "Code has taken me from robotic drum orchestras to AI-powered products.
  The constant: building interfaces people actually use — and writing about
  the craft."
- C: "Fifteen years making machines talk to humans — stages, classrooms,
  browsers. Today I build web products with the same obsession: interfaces
  that feel right."

Diagnosis: all three *tell* the reader what to conclude ("thinker",
"craftsman") instead of *showing* one concrete image and letting the reader
conclude it. The Chimères description proves he doesn't need to.

## Working principles for the next drafts

1. One concrete image beats three categories. "Robot drummers on street
   poles" does more than "art systems, tools, experiments".
2. Plain verbs: build, make, ship, teach, write. No "solve/craft/obsess".
3. The arc can be implicit — putting an art fact next to a web fact IS the
   arc; no need to narrate "now they're product ones".
4. Short. Current tagline is ~35 words; aim ≤30, ideally ~20.
5. It should sound like the start of a conversation, not the end of a pitch.
6. The blog is the living proof of "how he builds now" — the hero may point
   to it, the Work intro must.

## Where drafts live

`hero-copy-approaches.md` (same folder) — analysis + current draft round,
one section per loop, latest loop on top. Add new loops there, never here;
this file only gains *facts* or *new constraints*.
