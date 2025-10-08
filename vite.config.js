import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FINAL FIX: Using the correct, modern string-based syntax for plugins.
  // This is the standard configuration for ES Module (type: "module") Vite projects,
  // resolving the require() and PostCSS configuration conflicts.
  css: {
    postcss: {
      plugins: [
        // Using string names forces Vite and PostCSS to load the plugins correctly.
        'tailwindcss',
        'autoprefixer',
      ],
    },
  },
})
