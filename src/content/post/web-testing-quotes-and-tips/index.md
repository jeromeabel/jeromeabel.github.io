---
title: "Web Testing - Quotes and Tips"
date: 2024-09-13
description: After dedicating a few months to my side project, XPCatalyst, and embracing the Test-Driven Development (TDD) approach, I’ve had a series of “Aha!” moments that I’m excited to share the part n°1. Whether you’re just starting out or looking to refine your testing skills, these insights might resonate with you
abstract: After dedicating a few months to my side project, XPCatalyst, and embracing the Test-Driven Development (TDD) approach, I’ve had a series of “Aha!” moments that I’m excited to share the part n°1. Whether you’re just starting out or looking to refine your testing skills, these insights might resonate with you
draft: false
---

## Coding is Testing

When you are coding, you are testing, either manually or automatically.

> "There is always a testing cycle that happens. \[...\] The question just becomes, are the tests automated or not? If they're manual, then they're fundamentally limited, because you're not gonna remember to do all the possible testing all the times."

From Miško Hevery, in the [Web App Testing & Tools](Web App Testing & Tools) course on Frontend Masters

## Testing is Hard

- There are conflicting methodologies and opinions.
- It requires time.
- It’s an engineering discipline with specific terminology.

## ~~Test~~ Strategy First

It may seem obvious, but if you start testing, you have already made many decisions: you’ve set up a project with a specific technology stack, a minimal file structure, and some data models. Even the name of the test file focuses on a specific area of the project.

So, take some time to get an overview of the project and decide what to test, how, and when in a minimal planning test document.

## You Can’t Cover Everything. Pick a Strategy.

Nobody forces you to have 100% test coverage—it's impossible.

So you have to make choices and pick a test strategy among different styles:

- A large majority of unit tests (~80%), fewer integration tests, and even fewer end-to-end (e2e) tests.
- Or, you might prefer a majority of e2e tests to cover user scenarios, with fewer integration and unit tests.
- You might choose between testing before coding ("test-first") or after ("test-last").
- You might opt for Test-Driven Development (TDD) for tricky parts, or just write the simplest code.
- You might start testing from the inside of the application or from the outside.
- You might balance between manual and automated tests. Some people test UI components only manually, for example.
- You might choose to delete some tests if they only helped with coding but don’t serve a critical purpose.

## Tests Are Examples

> "\[The "Thinking Fast and Slow"\] makes a very good point that humans are not very good about being told generalization and expecting them to know how to apply it. Instead, what humans are really good at is, I'm gonna give you a bunch of examples and then you will generalize it for yourself, and then you will know how to apply it. And so what tests are, are actually that. \[...\]
>
> These are a whole bunch of concrete examples that I'm giving you about the system. And then when you read these tests, then you can be like, I can now generalize it into what the thing is actually doing. The opposite is something humans are not good at."

> \[Thinking, Fast and Slow\] makes a very good point that humans are not very good at being told generalizations and expecting them to know how to apply it. Instead, what humans are really good at is getting a bunch of examples and then generalizing it for themselves, and then you will know how to apply it.
>
> And so what tests are, are actually that. These are a whole bunch of concrete examples about the system. When you read these tests, you can generalize what the system is actually doing. The opposite is something humans are not good at.

From Miško Hevery, in the [Web App Testing & Tools](Web App Testing & Tools) course on Frontend Masters

## Thinking About "Specifications" Is More Meaningful Than "Tests"

> I think it’s very useful to think about specifications instead of tests, because if you think about it, a test is something you do to a finished product. So if a product comes down from the production line, for example, you test it if it works as intended, but specifications, typically you write before producing something. So you specify how it should work before you produce a piece of code or even a physical product. "

From Markus Oberlehner - [Writing Good Tests for Vue Applications](https://www.vuemastery.com/conferences/vuejs-live-2023/writing-good-tests-for-vue-applications/) on VueMastery
