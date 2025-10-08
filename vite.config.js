import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FINAL FIX: Explicitly define PostCSS configuration inside Vite config.
  // This bypasses environmental issues where Netlify's build process ignores 
  // the external 'postcss.config.js' file.
  css: {
    postcss: {
      plugins: [
        // Load the plugins by name. Netlify/Vite should now be forced to see them.
        'tailwindcss',
        'autoprefixer',
      ],
    },
  },
})
