import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://dev.jeromeabel.net',
  integrations: [tailwind()],
  build: {
    assets: 'assets',
    assetsPrefix: 'https://dev.jeromeabel.net',
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
