// Fails if any committed image/asset is over budget, so raw design exports
// can't slip into this public repo or the Vercel build.
import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dirs = ['src/assets', 'public']
const maxBytes = 500 * 1024

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

const oversized = []
let count = 0

for (const dir of dirs) {
  for await (const file of walk(join(root, dir))) {
    count++
    const { size } = await stat(file)
    if (size > maxBytes) oversized.push({ file: relative(root, file), size })
  }
}

if (oversized.length > 0) {
  for (const { file, size } of oversized) {
    console.error(`check:assets: ${file} is ${(size / 1024).toFixed(0)} KB (max ${maxBytes / 1024} KB)`)
  }
  process.exit(1)
}

console.log(`check:assets: ${count} file(s) within ${maxBytes / 1024} KB`)
