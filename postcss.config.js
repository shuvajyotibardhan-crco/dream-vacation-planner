/**
 * PostCSS configuration for a modern Vite/Tailwind setup.
 * Uses string references for plugins, which Vite and Netlify can resolve correctly.
 */
export default {
  plugins: {
    // TailwindCSS and Autoprefixer packages are resolved automatically by name.
    'tailwindcss': {},
    'autoprefixer': {},
  }
}
