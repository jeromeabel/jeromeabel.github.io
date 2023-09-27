/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      sm: '640px',
      md: '960px',
      lg: '1280px',
    },
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
        title: ['Bubbler One', ...defaultTheme.fontFamily.sans],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      animation: {
        'bounce-slow': 'bounce 2.5s ease-in infinite',
      },
      typography: {
        DEFAULT: {
          // Custom CSS here ↓
          css: {
            // color: '#333',
            // 'ul, li, p': { lineHeight: '1.5rem' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
