/**
 * PostCSS configuration to handle Tailwind CSS compilation.
 * Note: Uses require() for compatibility in Netlify build environment.
 */
export default {
  plugins: [
    require('tailwindcss'), // Ensure Tailwind runs first
    require('autoprefixer'), // Ensure Autoprefixer runs second
  ],
}
