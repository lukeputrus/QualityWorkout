/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08090b',
          900: '#0e1013',
          850: '#14171b',
          800: '#1a1e23',
          700: '#262b32',
          600: '#3a414a',
          400: '#8b929c',
          200: '#d3d7dc',
        },
        lime: {
          400: '#c6ff3d',
          500: '#aef023',
        },
        bloom: {
          400: '#ff5fa2',
          500: '#f0357f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        phone: '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
