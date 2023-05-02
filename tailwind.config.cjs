/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
	theme: {
		extend: {
			height: {
				// screen: ['100vh', '100dvh'],
			}
    	},
		container: {
			padding: {
				DEFAULT: '1.5rem',
				sm: '2rem',
				lg: '2.25rem',
				xl: '2.5rem',
				// '2xl': '1remrem',
			},
			center: true,
    	},
	},
	plugins: [],
}