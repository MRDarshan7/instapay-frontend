/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#f97316",   // orange accent
        dark: "#0b0b0b",    // app background
        card: "#141414",    // card background
      },
    },
  },
  plugins: [],
};
