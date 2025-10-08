/**
 * PostCSS configuration forcing the Array syntax with require()
 * to ensure compatibility with older PostCSS versions used in Netlify's build environment.
 */
module.exports = {
  plugins: [
    // This explicitly loads the plugins required by Tailwind
    require('tailwindcss'), 
    require('autoprefixer'),
  ],
}
