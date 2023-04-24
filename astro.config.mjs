import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://jeromeabel.github.io',
  integrations: [tailwind()],
  // outDir: './dist',
  // base: './',
  build: {
    assets: 'assets',
    assetsPrefix: 'https://jeromeabel.github.io'
  }
});