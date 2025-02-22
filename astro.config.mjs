// @ts-check
import netlify from '@astrojs/netlify';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  // Used for the Netlify Image Service
  adapter: netlify(),

  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ]
});
