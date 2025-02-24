// @ts-check
import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://dev.jeromeabel.net",

  // Used for the Netlify Image Service
  adapter: netlify(),

  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    icon(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
