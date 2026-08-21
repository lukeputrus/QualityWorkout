/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm neutral scale — used for text (dark end) and, tinted onto a
        // cream surface, as our "off-black" rather than true gray/black.
        ink: {
          950: '#221c16',
          800: '#3d342a',
          600: '#6b5f50',
          400: '#a89a86',
          300: '#c7bba7',
        },
        // Warm off-white surfaces — replaces the old near-black app background.
        cream: {
          50: '#fffdf9',
          100: '#f8f1e4',
          200: '#efe3cd',
          300: '#e1d1b2',
        },
        // Muted accents (not neon): terracotta for the male program, sage for
        // the female program — same "considered, boutique studio" register.
        terracotta: {
          400: '#dc9268',
          500: '#c1653f',
          600: '#a04f30',
        },
        sage: {
          400: '#a7b393',
          500: '#84906c',
          600: '#697454',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        phone: '0 30px 60px -20px rgba(34,28,22,0.35), 0 0 0 1px rgba(34,28,22,0.06)',
      },
    },
  },
  plugins: [],
}
