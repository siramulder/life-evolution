import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this repo at https://siramulder.github.io/life-evolution/,
  // not at the domain root. Without this, the built index.html asks for
  // /assets/... and gets 404s -> blank page. Must match the repo name.
  base: '/life-evolution/',
})
