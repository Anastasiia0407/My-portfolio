import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { SITE_URL, structuredData } from './site.config.ts'

// Multi-page: every case study is its own static HTML entry, work/<slug>.html, served at /work/<slug>
// (Vite tries <path>.html; Vercel's cleanUrls in vercel.json does the same).
const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** Fills %SITE_URL% in the HTML pages (canonical, og:url, og:image) from site.config.ts. */
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
})

/** The home page's JSON-LD (site.config.ts), in its <head>; "<" escaped so it can't close the tag. */
const jsonLd = (): Plugin => ({
  name: 'json-ld',
  transformIndexHtml: (_html, ctx) =>
    ctx.path === '/index.html'
      ? [
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(structuredData).replaceAll('<', '\\u003c'),
            injectTo: 'head',
          },
        ]
      : undefined,
})

export default defineConfig({
  plugins: [react(), siteUrl(), jsonLd()],
  build: {
    rollupOptions: {
      input: {
        main: page('index.html'),
        tms: page('work/tms.html'),
        socialtap: page('work/socialtap.html'),
      },
    },
  },
})
