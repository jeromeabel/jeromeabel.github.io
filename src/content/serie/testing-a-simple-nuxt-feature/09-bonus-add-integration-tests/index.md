---
title: "Bonus: Add Integration Tests"
date: 2025-04-07
description: A minimal integration test to verify the behavior of a composable using localStorage in a Nuxt app.
abstract: As a simple bonus, this post shows how to write a basic integration test for the `useVersion` composable using a real localStorage repository. It helps confirm that the logic for displaying a version banner works as expected.
draft: false
---

## Test the Composable With "createLocalStorageVersionRepository"

```ts
// @vitest-environment nuxt
import { describe, it, expect, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useVersion } from "../../composables/useVersion";
import { createLocalStorageVersionRepository } from "../../repositories/version-repository";

const CURRENT_VERSION = "0.0.1";
const OTHER_VERSION = "0.0.2";

mockNuxtImport("useRuntimeConfig", () => () => ({
  public: { version: CURRENT_VERSION },
}));

describe("useVersion", () => {
  const repository = createLocalStorageVersionRepository();

  beforeEach(() => {
    repository.clear();
  });

  describe("should show the banner", () => {
    it("when version is not stored", () => {
      const { init, isVisible } = useVersion(repository);

      init();

      expect(isVisible.value).toBe(true);
    });

    it("when version differs from localStorage", async () => {
      repository.storeVersion(OTHER_VERSION);
      const { init, isVisible } = useVersion(repository);

      init();

      expect(isVisible.value).toBe(true);
    });
  });

  describe("should hide banner", () => {
    it("and return correct initial state", () => {
      const { version, isVisible } = useVersion(repository);

      expect(version).toBe(CURRENT_VERSION);
      expect(isVisible.value).toBe(false);
    });

    it("when the same version is stored", () => {
      repository.storeVersion(CURRENT_VERSION);
      const { init, isVisible } = useVersion(repository);

      init();

      expect(isVisible.value).toBe(false);
    });

    it("and store version in localStorage on closeBanner", () => {
      const { init, close, isVisible } = useVersion(repository);

      init();
      close();

      expect(isVisible.value).toBe(false);
      expect(repository.getStoredVersion()).toBe(CURRENT_VERSION);
    });
  });
});
```
