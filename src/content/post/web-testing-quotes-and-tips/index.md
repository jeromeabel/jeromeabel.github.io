---
title: "Web Testing - Quotes and Tips"
date: 2024-09-13
description: After dedicating a few months to my side project, XPCatalyst, and embracing the Test-Driven Development (TDD) approach, I’ve had a series of “Aha!” moments that I’m excited to share. Whether you’re just starting out or looking to refine your testing skills, these insights might resonate with you
abstract: After dedicating a few months to my side project, XPCatalyst, and embracing the Test-Driven Development (TDD) approach, I’ve had a series of “Aha!” moments that I’m excited to share. Whether you’re just starting out or looking to refine your testing skills, these insights might resonate with you
draft: false
---

## Coding is Testing

When you are coding, you are testing, either manually or automatically.

> There is always a testing cycle that happens. ... The question just becomes, are the tests automated or not? If they're manual, then they're fundamentally limited, because you're not gonna remember to do all the possible testing all the times.

— [Miško Hevery](https://www.linkedin.com/in/misko-hevery-3883b1/), from the [Web App Testing & Tools](https://frontendmasters.com/courses/web-app-testing/) course on Frontend Masters

## Testing is Hard

- There are conflicting methodologies and opinions.
- It requires time.
- It’s an engineering discipline with specific terminology.

## ~~Test~~ Strategy First

It may seem obvious, but if you start testing, you have already made many decisions: you’ve set up a project with a specific technology stack, a minimal file structure, and some data models. Even the name of the test file focuses on a specific area of the project.

So, take some time to get an overview of the project and decide what to test, how, and when in a minimal planning test document.

## You Can’t Cover Everything - Pick a Strategy

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

> The "Thinking Fast and Slow" makes a very good point that humans are not very good about being told generalization and expecting them to know how to apply it. Instead, what humans are really good at is, I'm gonna give you a bunch of examples and then you will generalize it for yourself, and then you will know how to apply it. And so what tests are, are actually that. ... These are a whole bunch of concrete examples that I'm giving you about the system. And then when you read these tests, then you can be like, I can now generalize it into what the thing is actually doing. The opposite is something humans are not good at.

— From [Miško Hevery](https://www.linkedin.com/in/misko-hevery-3883b1/), in the [Web App Testing & Tools](https://frontendmasters.com/courses/web-app-testing/) course on Frontend Masters

## Thinking About "Specifications" Is More Meaningful Than "Tests"

> I think it’s very useful to think about specifications instead of tests, because if you think about it, a test is something you do to a finished product. So if a product comes down from the production line, for example, you test it if it works as intended, but specifications, typically you write before producing something. So you specify how it should work before you produce a piece of code or even a physical product. "

— [Markus Oberlehner](https://markus.oberlehner.net/) from [Writing Good Tests for Vue Applications](https://www.vuemastery.com/conferences/vuejs-live-2023/writing-good-tests-for-vue-applications/) on VueMastery

---

## Make Writing Tests Easier Than Writing Code

> Set up your environment so that writing/running the test is easier than the application.

— [Miško Hevery](https://www.linkedin.com/in/misko-hevery-3883b1/), frpm the [Web App Testing & Tools](https://frontendmasters.com/courses/web-app-testing/) course on Frontend Masters

## Write Components That Are Easy to Test

> If a component does less, then it will be easier to test. Making smaller components will make them more composable and easier to understand.

— From the [Vue Test Utils documentation](https://test-utils.vuejs.org/guide/essentials/easy-to-test.html)

## A Test Should Not Break on a Refactor

> The rule of thumb is that a test should not break on a refactor, that is, when we change its internal implementation without changing its behavior. If that happens, the test might rely on implementation details.

— From the [Vue Test Utils documentation](https://test-utils.vuejs.org/guide/essentials/easy-to-test.html)

## Take Control Over the Dependencies

Learn the Dependency Inversion Principle

> What the code does is irrelevant! How the code is structured is all that matters for testability!

— From [Miško Hevery](https://www.linkedin.com/in/misko-hevery-3883b1/), in the [Web App Testing & Tools](https://frontendmasters.com/courses/web-app-testing/) course on Frontend Masters

## Decouple Everything

An opinionated strategy, but you might find some interesting details:

- Decoupling from the test framework, so we can switch test frameworks or choose the best framework for the job [...]
- Decoupling from implementation details so we can freely refactor our code.
- Decoupling our tests from the user interface so we can change things around the user interface. And we have this nice domain-specific language, which reads very nicely even for people who don’t know about coding, for example.

— [Markus Oberlehner](https://markus.oberlehner.net/), from [Writing Good Tests for Vue Applications](https://www.vuemastery.com/conferences/vuejs-live-2023/writing-good-tests-for-vue-applications/) on VueMastery

---

## Test Often

Build a habit of continuous testing.

> "Unit testing should be combined with a Continuous Integration (CI) process to ensure that your unit tests are constantly being executed, ideally on each commit to your repository."

— TestDriven.io, from [Vue Unit Testing](https://testdriven.io/blog/vue-unit-testing/)

## Focus on What Matters—Business Logic

Prioritize testing where it counts.

- Focus on testing the core business logic that directly impacts your application’s behavior and value.
- Aim for 100% coverage of business logic, but don’t stress over non-essential areas.
- Avoid testing trivial code like prop validation, simple getters/setters, glue code in controllers.

— Antony Cyrille, from [Essentials - Tests Unitaires](https://www.youtube.com/playlist?list=PLVR5r65x9KDWBl7WnqnZFuKizu7Qfk80g) video series in french

## Break Down Complex Logic for Testability

Simplify your testing by breaking apart complexity.

- Extract complex business logic into separate functions or services to make them easier to test.
- Keep glue code (orchestration) simple so it doesn’t need extensive testing.  

## Think of Your Code as a Public API

What inputs and outputs your code will expose guide you toward better design.

"Writing tests first forces us to think about the public API of our code before we implement it and usually this leads to better code. Second, we get very fast feedback. [...] If you have the specification already from the beginning, then testing the code you just wrote happens automatically in a couple of milliseconds which is much faster than you can do it yourself manually. We usually come up with a better design."

— [Markus Oberlehner](https://markus.oberlehner.net/), from [Writing Good Tests for Vue Applications](https://www.vuemastery.com/conferences/vuejs-live-2023/writing-good-tests-for-vue-applications/) on VueMastery

## Think of Components as Functions

Treat components as black boxes with inputs and outputs.

"Component tests should focus on the component's public interfaces rather than internal implementation details. For most components, the public interface is limited to: events emitted, props, and slots. When testing, remember to test what a component does, not how it does it."

— Vue documentation, from '[Testing](https://vuejs.org/guide/scaling-up/testing)' page

## Test the Output, Not the Implementation

Focus on what your code does, not how it works.

"Test the component's outputs: rendered HTML, emitted events, and side effects like API calls."
By focusing on outputs, you ensure that your tests remain valuable even as the internal implementation changes.

— Natalia Tepluhina, from '[7 ways to make your Vue unit tests better](https://www.youtube.com/watch?v=fpX9fEb7xK0)' video

## Separate Smart and Dumb Components

Testing dumb components in isolation reduces complexity

- Smart components (e.g., pages) handle logic like API calls and routing.
- Dumb components focus only on receiving props and emitting events.
- Separating concerns between smart and dumb components ensures that testing is simpler and more focused.

— Max Pou, from '[3 Tips for Scaling Large Vue.js Application](https://www.maxpou.fr/blog/3-tips-scaling-vue-application/)'

## Two Types of Component Testing

In small (unit tests) or in large (integration tests)

Component testing in small
Testing is performed on the individual components without any dependency on another component of the application, it is called component testing in small. This testing best fits smaller applications.

Component testing in large
Component testing is to validate the individual components with the help of other components, which means when the input or output of one component is required for testing the other component, it is called component testing in large.

— BrowserStack, from [What is Component Testing?](https://www.browserstack.com/guide/what-is-component-testing)

## Unit Tests Cover Decision Branches

Ensure your tests cover all possible logic paths.

- Unit tests should focus on individual functions or methods, ensuring that all possible branches (if/else, switch) are covered.
- Each test should handle one logic branch, making sure all scenarios are accounted for.

## Know What Not to Test

Save time by avoiding tests that don’t add value.

- Don’t test trivial code like DTOs, implementation details, or volatile UI components that frequently change.
- Skip testing third-party libraries—they should be trusted to work as expected.

## Avoid Excessive Mocks

Simplifying your code reduces the need for mocks.

- Overuse of mocks can indicate that your code is too complex. Instead, simplify your logic to make it more testable.
- Focus on clear inputs and outputs in your functions and components.  

## Use `data-test` Attributes for Clear Test Targeting

Make testable elements easy to identify.

"Using `data-test`, it's clear to other developers which elements are used in tests, and they should not be changed."

— TestDriven.io, from [Vue Unit Testing](https://testdriven.io/blog/vue-unit-testing/)
