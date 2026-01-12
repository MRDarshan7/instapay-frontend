/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#ca67f6",   // orange accent
        dark: "#100525",    // app background
        card: "#311957",    // card background
      },
    },
  },
  plugins: [],
};
