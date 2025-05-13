/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
     extend: {
    colors: {
      primary: "#fdf4ec",
      dark: "#3a2d25",
      accent: "#c2703d",
    },
  },
  },
  plugins: [],
}

