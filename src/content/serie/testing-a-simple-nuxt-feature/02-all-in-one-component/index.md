---
title: "The All-In-One Component"
date: 2025-03-23
description: First implementation of the version banner feature in a single component.
abstract: "This second episode will present the simplest way to implement the version banner feature in a single component. The question becomes: are you confident enough with this version?"
draft: false
img: ./cover.png
---

## Code

👉 [VersionBanner01.vue](https://github.com/jeromeabel/nuxt-clean-architecture/blob/feat/version-banner/layers/version-01/components/VersionBanner01.vue)

## Version 1: Initial Implementation

The first principle is to use Nuxt 4 layers folder to encapsulate the feature.

```vue
<script lang="ts" setup>
// File: layers/version-01/components/VersionBanner01.vue
const VERSION_KEY = "app-version";
const isVisible = ref(false);
// ⓘ useRuntimeConfig() retrieves variables from nuxt.config.ts
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

- **Difficult to test**
- **Too many concerns**: The component handles state, lifecycle hooks (`onMounted()`), business logic, dependencies (`useRuntimeConfig`, `localStorage`), and UI.
- **Implicit Type Assumption**: There's no explicit type check or validation. If `version` is `undefined` or an unexpected type, it could cause unintended behavior.

## Next Step

If you are confident with this single component, well, it is okay. If not, you might follow the rest of the journey to improve our design.

## Specifications v2.1

Let's add the new specifications to have a better design:

- [x] (v1) The application's version is defined in `package.json`.
- [x] (v1) The component displays the current version.
- [x] (v1) The banner remains hidden if the version is already stored in local storage.
- [x] (v1) The user can dismiss the banner.
- **(v2.1) The component should only care about the UI behavior**
- **(v2.1) The version value should be wrapped in an Entity (we won't cover this part)**

## Decision Map

Let's take a look at the current map ([Open 🔎](https://shorturl.at/Bhzqw)):

![Decision Map Graph](/blog/testing-a-simple-nuxt-feature/02-all-in-one-component.svg)
