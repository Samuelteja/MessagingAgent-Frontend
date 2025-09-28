// In frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // <-- Import tailwindcss
import autoprefixer from 'autoprefixer' // <-- Import autoprefixer

export default defineConfig({
  plugins: [react()],
  
  // --- THIS IS THE FINAL, DEFINITIVE FIX ---
  // We are explicitly telling Vite to use PostCSS with the correct plugins.
  // This removes any reliance on automatic config file discovery.
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})