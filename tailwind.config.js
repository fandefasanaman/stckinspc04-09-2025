/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'inspc': {
          'violet': '#6B2C91',
          'green': '#2D8A47',
          'gold': '#D4AF37',
          'text-primary': '#2C1810',
          'text-secondary': '#5A4A42',
          'bg-light': '#F8F7F5',
          'border-light': '#E5E0DB'
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'opensans': ['Open Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
};
