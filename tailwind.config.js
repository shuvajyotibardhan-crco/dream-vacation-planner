/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // CRUCIAL: Looks for classes in your React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
