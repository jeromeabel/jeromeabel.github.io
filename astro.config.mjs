import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://jeromeabel.github.io', // for new URL
  integrations: [tailwind()],
  build: {
    assets: 'assets',
    assetsPrefix: 'https://jeromeabel.github.io',
    // assetsPrefix: 'https://dev.jeromeabel.net'
  },
});
