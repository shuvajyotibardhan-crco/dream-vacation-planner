import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FINAL ATTEMPT: Removing PostCSS configuration from here.
  // It has been moved to a standalone file (postcss.config.js) 
  // to force the Netlify build environment to load it correctly.
})
