import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FINAL FIX: Explicitly define PostCSS configuration inside Vite config 
  // using the require() syntax. This is the most reliable way to ensure 
  // Netlify's environment loads the plugins correctly.
  css: {
    postcss: {
      plugins: [
        // Using require() guarantees the plugins are loaded as valid PostCSS plugins
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
})
