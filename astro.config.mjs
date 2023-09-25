import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // site: 'https://jeromeabel.github.io', // for new URL
  site: 'dev.jeromeabel.net',
  integrations: [tailwind()],
  build: {
    assets: 'assets',
    // assetsPrefix: 'https://jeromeabel.github.io',
    assetsPrefix: 'https://dev.jeromeabel.net'
  },
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['nofollow, noopener, noreferrer'] },
      ],
    ],
  },
});
