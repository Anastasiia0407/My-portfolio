import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { SITE_URL } from './site.config.ts'

// Multi-page: every case study is its own static HTML entry, work/<slug>.html, served at /work/<slug>
// (Vite tries <path>.html; Vercel's cleanUrls in vercel.json does the same).
const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** Fills %SITE_URL% in the HTML pages (canonical, og:url, og:image) from site.config.ts. */
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
})

export default defineConfig({
  plugins: [react(), siteUrl()],
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        tms: page('work/tms.html'),
      },
    },
  },
})
