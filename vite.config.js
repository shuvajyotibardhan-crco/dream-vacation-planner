import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // DEFINITIVE FIX: Using explicit require() calls. This must be used with 
  // the **.cjs** file extension to prevent Node from throwing the 
  // "Dynamic require... not supported" error, ensuring the plugins load correctly.
  css: {
    postcss: {
      plugins: [
        // Using require() forces PostCSS to recognize the plugins as valid objects/functions
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
})
