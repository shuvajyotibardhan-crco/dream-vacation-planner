// This standalone file explicitly defines the PostCSS plugins.
// It uses the robust CommonJS 'require' pattern which is the most reliable 
// way to load plugins in mixed or stubborn Node environments.
module.exports = {
  plugins: {
    // FINAL FIX: Reverting to the canonical 'tailwindcss' plugin name. 
    // This is the correct, standard name for modern Vite/Tailwind setups.
    'tailwindcss': {}, 
    'autoprefixer': {},
  },
}
