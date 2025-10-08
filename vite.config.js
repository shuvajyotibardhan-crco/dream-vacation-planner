import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // DEFINITIVE FIX: We must use the standard, string-based ES Module syntax 
  // because your package.json sets "type": "module", which prohibits the 
  // CommonJS 'require()' syntax.
  css: {
    postcss: {
      plugins: [
        // Using string names allows Vite to load these plugins correctly
        // in an ES Module environment without throwing the "Dynamic require" error.
        'tailwindcss',
        'autoprefixer',
      ],
    },
  },
})
