/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#c5f135",
        background: "#0f0f0f",
        surface: "#1a1a1a",
        borderDark: "#2a2a2a",
        textSec: "#a0a0a0",
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}

