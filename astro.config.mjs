import { defineConfig, passthroughImageService } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  // site: 'https://dev.jeromeabel.net',
  integrations: [tailwind()],
  // build: {
  //   assets: 'assets',
  //   assetsPrefix: 'https://dev.jeromeabel.net',
  // },
  image: {
    service: passthroughImageService()
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['nofollow, noopener, noreferrer'] },
      ],
    ],
  },
});
