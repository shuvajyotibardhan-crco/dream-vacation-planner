// This standalone file explicitly defines the PostCSS plugins.
// It uses the robust CommonJS 'require' pattern which is the most reliable 
// way to load plugins in mixed or stubborn Node environments.
module.exports = {
  plugins: {
    // DEFINITIVE FIX: Using the fully qualified plugin name as suggested by the Netlify 
    // build error ('@tailwindcss/postcss') to resolve the dependency conflict on the server.
    '@tailwindcss/postcss': {}, 
    'autoprefixer': {},
  },
}
