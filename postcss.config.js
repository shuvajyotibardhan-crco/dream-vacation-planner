/**
 * PostCSS configuration using the modern ES Module syntax (export default)
 * and the object plugin structure required by Vite, resolving the CommonJS conflict.
 */
export default {
  plugins: {
    // These plugins are automatically resolved by name by PostCSS and Vite.
    'tailwindcss': {},
    'autoprefixer': {},
  }
}
