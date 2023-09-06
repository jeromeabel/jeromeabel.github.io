/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        heading: ['Bubbler One', 'sans-serif'],
      },
      container: {
        center: true,
      },
    },
  },
  plugins: [],
};
