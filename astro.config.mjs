import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: 'https://jeromeabel.github.io',
  integrations: [tailwind(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  // outDir: './dist',
  // base: './',
  build: {
    assets: 'assets',
    assetsPrefix: 'https://jeromeabel.github.io'
  }
});