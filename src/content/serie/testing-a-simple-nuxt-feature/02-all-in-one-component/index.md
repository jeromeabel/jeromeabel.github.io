---
title: "All-In-One Components "
date: 2025-03-07
description: Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus assumenda deleniti itaque molestias odio quidem praesentium, numquam veniam animi ipsam velit iure atque delectus debitis quisquam tempore optio ea corrupti.
abstract: Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus assumenda deleniti itaque molestias odio quidem praesentium, numquam veniam animi ipsam velit iure atque delectus debitis quisquam tempore optio ea corrupti.
---

## Code v1

- [VersionBanner01.vue](https://github.com/jeromeabel/nuxt-clean-architecture/blob/feat/version-banner/layers/version-01/components/VersionBanner01.vue)

## Version 1: Initial Implementation

```vue
<script lang="ts" setup>
// File: layers/version-01/components/VersionBanner01.vue
const VERSION_KEY = "app-version";
const isVisible = ref(false);
// INFOS: useRuntimeConfig() retrieve variables from the config file nuxt.config.ts
const version = useRuntimeConfig().public.version;

const close = () => {
  isVisible.value = false;
  localStorage.setItem(VERSION_KEY, version);
};

onMounted(() => {
  if (localStorage.getItem(VERSION_KEY) !== version) {
    isVisible.value = true;
  }
});
</script>

<template>
  <div v-if="isVisible">
    New Version {{ version }}
    <button @click="close">Close</button>
  </div>
</template>
```

## Issues with this Implementation

- **Difficult to test:**
  - **Too many concerns:** The component handles state, lifecycle hooks (`onMounted()`), business logic, dependencies ( `useRuntimeConfig`, `localStorage`), and UI.
  - **Implicit Type Assumption**: There's no explicit type check or validation. If `version` is `undefined` or an unexpected type, it could cause unintended behavior.

## Specifications v2.1

Let's add the new specifications to have a better design:

- (v1) The application’s version is defined in `package.json`.
- (v1) The component displays the current version.
- (v1) The banner remains hidden if the version is already stored in local storage.
- (v1) The user can dismiss the banner.
- (v2.1) The component should only care about the UI behavior
- (v2.1) The Version should be wrapped in an Entity

## Next Step

What are your thoughts on this implementation? Does this structure seem sufficient, or do you see areas for improvement?

## Decision Map

![Decision Map Graph](/blog/testing-a-simple-nuxt-feature/02-all-in-one-component.svg)
