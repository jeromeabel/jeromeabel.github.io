import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://jeromeabel.github.io',
  integrations: [tailwind(), mdx(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  build: {
    assets: 'assets',
    assetsPrefix: 'https://jeromeabel.github.io'
  }
});
