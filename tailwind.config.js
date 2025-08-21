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
          400: '#FFCA28',
          500: '#FFD700',
        },
        purple: {
          500: '#6A1B9A',
        },
        gray: {
          100: '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        '14px': '14px',
        '16px': '16px',
        '32px': '32px',
        '36px': '36px',
        '40px': '40px',
        '48px': '48px',
      },
    },
  },
  plugins: [],
};