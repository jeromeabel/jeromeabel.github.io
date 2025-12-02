---
title: "A Civilization Concern"
date: 2025-12-01
description: AI is not just another tool upgrade like TypeScript; it is a horizontal disruption. In this chapter, we step away from the IDE to weigh the "civilization concerns" of our industry.
abstract: AI is not just another tool upgrade like TypeScript; it is a horizontal disruption. In this chapter, we step away from the IDE to weigh the "civilization concerns" of our industry.
draft: false
img: ./cover.jpg
---

## Introduction

AI has moved from novelty to necessity in a developer’s workflow, reshaping not only how we write code but how we think about the craft itself.

My own journey began like many others — using chatbots, code completion, and following the endless wave of “AI revolution” headlines. It felt both exciting and unsettling. As a developer still building my craft, I couldn’t help but wonder: _How am I going to keep up? What really matters now?_

So I decided to explore it on my own terms. Over the past months, I began using AI more deliberately — in personal projects, in real engineering workflows. This series captures that transition — from casual experimentation to a more grounded, reflective practice of using AI in everyday development.


## Beyond the IDE

For a frontend developer, the advent of Large Language Models (LLMs) often feels like a natural progression. We’ve moved from vanilla JS to jQuery, to Vue, to meta-frameworks like Nuxt. We are accustomed to tools that handle the heavy lifting. Code is structured language, LLMs operate on language—the connection feels obvious. After years of autocomplete, static analysis, and refactoring assistants, AI feels like the next logical upgrade.[^1]

**But this shift is distinct.**

Previous upgrades were confined to our specialized domain. TypeScript changed how we write JavaScript; it didn’t change how a doctor writes a diagnosis or how an artist composes an image. AI is different because of its **reach**. It is a horizontal disruption, cutting across law, education, art, and engineering simultaneously.

As Dr. Fei-Fei Li recently noted: _"Everybody should care about AI."_ [^2] She’s right, not because of the hype cycle, but because of the sheer ubiquity of the technology.

As engineers, we pride ourselves on **Critical Thinking** [^3]. It is a high-demand skill for tech jobs, and for good reason—we spend our days weighing trade-offs, debugging logic, and anticipating edge cases. However, the current market narrative is often "adapt or die"—a framing that isolates individuals and fuels anxiety. 

But why limit that capability to the codebase?

I believe we should apply our engineering mindset more broadly. By expanding our scope, we could move from purely technical analysis to a **balanced judgment mindset**—one that integrates social and environmental impacts into the equation.

To make sense of this, I’ve found value outside of computer science.

---

## What We Gain, What We Lose

To understand this impact, I’ve found inspiration in thinkers like philosopher Éric Sadin [^4], who uses this kind of framing: **every technology provides gains, and extracts costs**. Bernard Stiegler [^5] called this the _pharmakon_ — the idea that technology is simultaneously the cure and the poison.

The question isn't whether AI is "good" or "bad" (the optimistic vs. pessimistic trap). Instead, it forces a more grounded question: **What exactly are we gaining? And what are we paying for it?**

Technological debates often dismiss social and environmental impacts as "friction" that blocks innovation. Yet, ignoring these factors creates systemic risks. Web 2.0 promised "connecting friends" but delivered the attention economy and cognitive warfare.

Political regulation won’t keep pace. That leaves us—the builders—with the responsibility to think critically.

---

## More, As Usual

Despite the lofty narratives about "intelligence," AI hasn’t disrupted the dominant industrial logic. If anything, it amplifies it: **produce more, consume more, compute more.**

### The Physical Cost

The headlines tell the story. Tech giants—Microsoft, Meta, Google, OpenAI—are racing to secure enormous energy deals to power their AI factories, shifting from megawatts to gigawatts to maintain market leadership. The race has fundamentally transformed how the sector measures power; the new unit of account is no longer server capacity, but available megawatts. [^6]

The International Energy Agency (IEA) confirms this in their "Energy and AI" report. They estimate that data center electricity consumption is set to **more than double by 2030**, reaching roughly 945 TWh. To put that in perspective, that is equivalent to adding the entire electricity consumption of **Japan** to the global grid. [^7]

The narrative that AI is "just a bubble" offers a comfortable escape; it suggests the market will eventually correct the excess. But this view obscures the reality. As Jeff Bezos and recent analysis suggest, this is an **industrial bubble**.[^9] Like the railroads, the financial valuations may fluctuate, but the infrastructure is being poured into the ground to stay. As Jason Snyder points out in Forbes [^8], these are signs that "the substrate of daily life is being rebuilt."

This physical legacy is exactly why we should care. We need a more **sustainable framework** for how we integrate these tools:

- **Measurement:** Comparing a prompt to a Google search is complex. A prompt seems more energy-intensive, but might replace ten searches. However, if trust is low and I have to use Google to verify the AI's output, I haven't saved energy—I've just added the heavy cost of a prompt on top of my usual workflow.
- **Workflow Optimization:** It’s about intentionality—knowing when a task truly benefits from AI versus when it’s just a reflex.
- **Going Local:** Exploring **Local LLMs** offers a way to decouple from the massive energy footprint of the cloud giants.

---

## The Cognitive Cost

While the physical cost is measured in megawatts, the cognitive cost might be measured in **noise**. LLMs are inherently verbose; they can produce an infinity of text, images, and code. Just as we are overloading the grid, we are overloading our mental environment.

It starts with a simple human impulse: **Automation**.

### The Efficiency Bias

The primary sales pitch is productivity. We are told to "10x" our output. There is a "laziness bias" in how we adopt these tools; we naturally seek quick answers and less friction.

But efficiency comes with trade-offs.

We are already seeing a "hollowing out" of the talent pipeline. As Sundeep Teki analyzes [^10], automating foundational tasks removes the ladder juniors climb to become seniors. We see this across the creative spectrum—translators, voice actors, and designers being bypassed to save money, flattening human nuance in the process.

### Cognitive Atrophy

In my own work, I’ve felt the "human clipboard" trap [^16]. I’ve caught myself accepting AI solutions without fully validating them. Why? Because the **speed of output** is incompatible with the **speed of comprehension**.

As **Namanyay Goel** brilliantly wrote, there is a cruel irony here: **The skills we need to validate code are exactly the skills that weaken when we stop writing it ourselves.** [^11]

Some days, relying too heavily on the prompt makes me feel—bluntly—stupid, like I’m just **doom-scrolling through code**. This isn't just a feeling; it’s biological. A recent study highlighted by the MIT Media Lab [^12] suggests that "cognitive offloading" changes how our brains wire themselves.

> Repeated essay writing without AI leads to strengthening of brain connectivity... Prior use of AI tools, however, appears to modulate this trajectory.

### The Flood of "Slop"

When we combine this desire for shortcuts with the generative capability of LLMs, the result is **Volume**.

LLMs prioritize plausibility over conciseness. This has led to the invasion of "AI Slop"—low-quality, synthetic content that degrades user experience. As noted by _Le Blog du Modérateur_, a fully synthetic web is neither desirable nor sustainable; it erodes trust and fatigues the audience. [^13]

It also leads to a technical dead end: **Model Collapse**. Research published in Nature [^14] indicates that when models are trained recursively on synthetic data, diversity vanishes. By flooding the web with AI output, we are poisoning the very well from which these tools drink.

### The Political Asphyxiation

Finally, this massive quantity of content creates a political risk. We are moving beyond "fake news" into **personalized realities**.

Steve Bannon, the former political strategist of Donald Trump, famously theorized this tactic: _"Flood the zone with shit."_

> Fascism of the past controlled the airwaves; today’s fascism saturates them. It is no longer censorship, it is asphyxiation. [^15]

By saturating the public space with endless, conflicting, or synthetic information, shared reality—the basis of democratic debate—dissolves.

---

## The Signal in the Noise

Ultimately, engineers are part of the human community before we are writers of code. We cannot separate our work from the world it impacts.

AI is here to stay; that is the baseline. But the shape it takes is not fixed. It relies on our ability to understand broadly, to share our practices, and to maintain our nuance. That is how we craft the future, rather than just enduring it.

In the next post, **Part 2: A Balanced Shift**, I will explore some notes about productivity and learning skills.

---

[^1]: [Beyond Pair Programming with AI - course](https://www.linkedin.com/learning/build-with-ai-beyond-pair-programming-with-ai/pair-programming-with-ai), by Morten Rand-Hendriksen

[^2]: [The Godmother of AI on jobs, robots & why world models are next | Dr. Fei-Fei Li](https://youtu.be/Ctjiatnd6Xk), Lenny's podcast

[^3]: [Critical Thinking during the age of AI](https://addyo.substack.com/p/critical-thinking-during-the-age), by Addy Osmani

[^4]: [Le désert de nous-même](https://www.lechappee.org/collections/pour-en-finir-avec/le-desert-de-nous-memes), by Eric Sadin (fr)

[^5]: [Pharmakon, pharmacologie](https://arsindustrialis.org/vocabulaire-pharmakon-pharmacologie), by Bernard Stiegler (fr)

[^6]: [Course aux gigawatts de l’IA : comment les géants américains mènent la danse](https://www.forbes.fr/business/course-aux-gigawatts-de-lia-comment-les-geants-americains-menent-la-danse/), Forbes (fr)

[^7]: [Energy and AI - report](https://www.iea.org/reports/energy-and-ai/executive-summary), International Energy Agency

[^8]: [The AI Bubble That Isn’t There](https://www.forbes.com/sites/jasonsnyder/2025/11/17/the-ai-bubble-that-isnt-there/), Forbes

[^9]: [Jeff Bezos: AI investments are an industry bubble](https://youtube.com/shorts/ppy_toLPeqQ?si=ciJMaV3g00CZr2QH)

[^10]: [Impact of AI on the 2025 Software Engineering Job Market](https://www.sundeepteki.org/advice/impact-of-ai-on-the-2025-software-engineering-job-market), by Sundeep Teki

[^11]: [AI is Creating a Generation of Illiterate Programmers](https://nmn.gl/blog/ai-illiterate-programmers), by Namanyay Goel 

[^12]: [Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task](https://arxiv.org/abs/2506.08872), MIT Medialab

[^13]: [Le web est-il en train de devenir entièrement synthétique ?](https://www.blogdumoderateur.com/web-devenir-entierement-synthetique), Blog du modérateur (fr)

[^14]: [AI models collapse when trained on recursively generated data](https://www.nature.com/articles/s41586-024-07566-y), Nature

[^15]: [Pourquoi les géants de la tech pactisent avec les religieux au Texas](https://www.telerama.fr/livre/pourquoi-la-tech-deserte-la-silicon-valley-et-se-fore-une-place-au-texas-7028422.php), Telerama (fr)

[^16]: [Avoiding Skill Atrophy in the Age of AI](https://addyo.substack.com/p/avoiding-skill-atrophy-in-the-age), by Addy Osmani