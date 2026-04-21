/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#070708',
          red: '#FA133A',
          bg: '#D6D7D7',
        },
      },
    },
  },
  plugins: [],
}
