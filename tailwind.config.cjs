/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        title: ['Bubbler One', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2.5s ease-in infinite',
      },
    },
  },
  plugins: [],
};
