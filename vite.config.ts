import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Multi-page: every case study is its own static HTML entry, work/<slug>.html, served at /work/<slug>
// (Vite tries <path>.html; Vercel's cleanUrls in vercel.json does the same).
const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        tms: page('work/tms.html'),
      },
    },
  },
})
