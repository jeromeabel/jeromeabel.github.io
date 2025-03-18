// @ts-check
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from 'rehype-external-links';
import { remarkReadingTime } from './src/utils/remark-reading-time.mjs';

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://dev.jeromeabel.net",

  // Used for the Netlify Image Service
  adapter: netlify(),

  experimental: {
    svg: true,
    responsiveImages: true,
  },

  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),

    icon({
      include: {
        lucide: ['download', 'arrow-right', 'arrow-left', 'arrow-up-right', 'sun', 'moon', 'handshake',  'clock',  'calendar', 'chevron-right', 'mail'],
        'fa6-brands': ['github', 'linkedin-in', 'bluesky'],
      },
      iconDir: "src/assets/icons"
    })
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [[
      rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow, noopener, noreferrer'],
        },
      ]
    ],
  },
});

