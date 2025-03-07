---
title: "Extracting Logic into a Composable (v2.1)"
headline: "From February 8 to 9, 2023"
date: 2025-03-07
description: Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus assumenda deleniti itaque molestias odio quidem praesentium, numquam veniam animi ipsam velit iure atque delectus debitis quisquam tempore optio ea corrupti.
series: "Testing a Simple Nuxt Feature"
order: 3
---

(Presenter/Humble Component Pattern)

In this first refactoring, we extract the business logic into a composable (Presenter), leaving the component to solely handle UI rendering (Humble).

## Composable (Presenter)

Code: [useVersion.ts](https://github.com/jeromeabel/nuxt-clean-architecture/blob/feat/version-banner/layers/version-02/composables/useVersion.ts)

```ts
// File: layers/version-02/composables/useVersion.ts
export const useVersion = () => {
  const VERSION_KEY = "app-version";
  const isVisible = ref(false);
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

  return { isVisible, version, close };
};
```

## Component (Humble or Dumb)

Code: [VersionBanner02.vue](https://github.com/jeromeabel/nuxt-clean-architecture/blob/feat/version-banner/layers/version-02/components/VersionBanner02.vue)

```vue
<script lang="ts" setup>
// File: layers/version-02/components/VersionBanner02.vue
// Note: In Nuxt, composables are auto-imported, so you don't need to import it manually.
const { isVisible, version, close } = useVersion();
</script>

<template>
  <div v-if="isVisible">
    New Version {{ version }}
    <button @click="close">Close</button>
  </div>
</template>
```

This should be enough. Let's test it!
