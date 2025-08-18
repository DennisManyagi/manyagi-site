/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        yellow: {
          400: '#FFCA28', // Added for hover:bg-yellow-400
          500: '#FFD700', // Matches bg-yellow-500
        },
        purple: {
          500: '#6A1B9A',
        },
        gray: {
          100: '#F5F5F5',
          800: '#333333',
        },
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};