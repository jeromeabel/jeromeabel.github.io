// @ts-check
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
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
        lucide: ['download', 'arrow-left', 'arrow-right', 'arrow-up-right', 'sun', 'moon', 'handshake',  'clock',  'calendar'],
        'fa6-brands': ['github', 'linkedin-in', 'bluesky',],
      },
    })

  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});
