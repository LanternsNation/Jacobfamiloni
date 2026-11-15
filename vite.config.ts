import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// PWA plugin is added in the PWA step (see below once configured)
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
