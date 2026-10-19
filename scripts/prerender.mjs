// Injects the server-rendered pages into their built HTML (dist/index.html, dist/work/<case>.html)
// so every page ships real text (SEO, no-JS readers). Runs after `vite build` and `vite build --ssr`.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const ssrDir = `${root}dist-ssr`
const placeholder = '<!--app-html-->'

const { render, pageFiles } = await import(pathToFileURL(`${ssrDir}/entry-server.js`).href)

for (const file of pageFiles) {
  const htmlPath = `${root}dist/${file}`
  const template = await readFile(htmlPath, 'utf8')
  if (!template.includes(placeholder)) {
    throw new Error(`prerender: ${placeholder} not found in dist/${file}`)
  }
  await writeFile(htmlPath, template.replace(placeholder, render(file)))
  console.log(`prerender: dist/${file}`)
}

await rm(ssrDir, { recursive: true, force: true })
