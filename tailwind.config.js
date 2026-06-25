/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep': '#1C1F3A',
        'black-rich': '#0D0D0D',
        'gold': '#C9A84C',
        'amber': '#D4793A',
        'cream': '#FAF7F2',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '.25em',
      }
    },
  },
  plugins: [],
}
