// Injects the server-rendered app into dist/index.html so the page ships real text
// (SEO, no-JS readers). Runs after `vite build` and `vite build --ssr`.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const htmlPath = `${root}dist/index.html`
const ssrDir = `${root}dist-ssr`
const placeholder = '<!--app-html-->'

const { render } = await import(pathToFileURL(`${ssrDir}/entry-server.js`).href)
const template = await readFile(htmlPath, 'utf8')

if (!template.includes(placeholder)) {
  throw new Error(`prerender: ${placeholder} not found in dist/index.html`)
}

await writeFile(htmlPath, template.replace(placeholder, render()))
await rm(ssrDir, { recursive: true, force: true })

console.log('prerender: dist/index.html')
