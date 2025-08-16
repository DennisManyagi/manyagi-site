/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000',
        fg: '#fff',
        muted: '#bfbfbf',
        card: '#0d0d0d',
        line: '#1a1a1a',
        accent: '#FFD700', // Gold
      },
      borderRadius: {
        DEFAULT: '14px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,.55)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};