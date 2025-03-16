---
title: "Nuxt Clean Architecture"
date: 2024-11-14
description: Implement a newsletter subscription feature with Nuxt, following a clean architecture
abstract: Implement a newsletter subscription feature that highlights how to organize code into distinct layers using the new Nuxt 4 file structure, making it modular, testable, and scalable.
draft: false
img: ./nuxt-clean-architecture-jerome-abel.png
---

I've been experimenting with Clean Architecture in Nuxt, and I'm excited to share the results with a practical example of a newsletter subscription feature!

🔗 Check it out here in this GitHub repo: https://github.com/jeromeabel/nuxt-clean-architecture

## Key Highlights

- **Presentation Layer**: A lightweight, “Humble” Vue component that delegates all logic to a composable.
- **Domain Layer**: Core business logic and domain entities that are framework-agnostic, ensuring stability and easy testing.
- **Infrastructure Layer**: Adapters for various data sources, including Supabase and an in-memory repository for testing flexibility.

## Key Benefits

- **Separation of Concerns**: Each layer handles distinct responsibilities, so changes in one part don’t impact others.
- **Enhanced Testability**: With Dependency Inversion, we can use an in-memory repository for isolated, reliable testing.
- **Easy Evolution**: The design allows for seamless switching of newsletter providers if requirements change.

## Layers

1. **Presentation**: User interface (UI components and composables).
2. **Domain**: Framework-agnostic business logic, use cases, and entities.
3. **Infrastructure**: Adapters for data sources, e.g., Supabase, in-memory repositories.

![Nuxt Clean Architecture - layers](./2.png)

## Languages

- **Presentation/Infrastructure**: Vue & TypeScript.
- **Domain**: TypeScript only, to stay independent of any framework.

![Nuxt Clean Architecture - Languages](./3.png)

## Terminology Adapters & Ports

- **Primary Adapter**: UI handling.
- **Driver Port**: Use case interface.
- **Driven Port**: Repository interface.
- **Secondary Adapter**: Data source implementations (e.g., Supabase).

![Nuxt Clean Architecture - Languages](./4.png)

## Order of Implementation

1. Define the **UI** in `NewsletterForm.vue`.
2. Create the **Composable** with `useNewsletter`.
3. Develop the **Use Case** (`subscribe-use-case.ts`).
4. Set up **Repository Interfaces** and **Factories**.
5. Implement **Repository** (Supabase/in-memory).

![Nuxt Clean Architecture - Languages](./5.png)

## Newsletter Example

- The form calls `useNewsletter` for state.
- **Use Case** executes the subscription logic.
- Repository (Supabase or in-memory) stores subscription.

![Nuxt Clean Architecture - Testing Approach](./6.png)

## Testing Approach

- **Unit Tests**: Cover validations, repository methods, and individual UI elements.
- **E2E Tests**: Ensure successful subscription flow, error handling, and navigation.

![Nuxt Clean Architecture - Testing Approach](./7.png)
