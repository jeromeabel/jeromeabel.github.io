import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://jeromeabel.github.io',
  // site: 'https://dev.jeromeabel.net',
  integrations: [tailwind(), mdx(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  build: {
    assets: 'assets',
    assetsPrefix: 'https://jeromeabel.github.io'
    // assetsPrefix: 'https://dev.jeromeabel.net'
  },
});

