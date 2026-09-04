/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b1220",
          900: "#101828",
          800: "#1d2939",
          700: "#344054",
          600: "#475467",
          500: "#667085",
          400: "#98a2b3",
          300: "#d0d5dd",
          200: "#e4e7ec",
          100: "#f2f4f7",
          50: "#f9fafb",
        },
        brand: {
          700: "#1d4ed8",
          600: "#2563eb",
          500: "#3b82f6",
          100: "#dbeafe",
          50: "#eff6ff",
        },
      },
    },
  },
  plugins: [],
};
