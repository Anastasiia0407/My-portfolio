// Share image and icons from Figma renders in design-src/figma/brand/ (gitignored) → public/.
// Re-export the Figma nodes with MCP into design-src, then run `npm run images`.
// - og-146-2.png: frame 146:2 "OG image — Home (1200×630)" → og-image.jpg
// - favicon-137-13721.png (render) + favicon-ac-137-13721.svg (its "AC" vector): node 137:13721
//   → apple-touch-icon.png (180), icon-192.png, icon-512.png from the render (the photo mark);
//   favicon-16.png, favicon-32.png and favicon.ico (16 + 32) as flat letters, because the photo
//   texture turns to noise at that size. Flat colour: the photo's average inside the letters at
//   512px, or #f6f4f2 when that is under 4.5:1 against the #1e1f2d background.
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = (name) => join(root, 'design-src/figma/brand', name)
const out = (name) => join(root, 'public', name)
const BG = '#1e1f2d'
const FALLBACK = '#f6f4f2'
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

// --- OG image ---
const og = await sharp(src('og-146-2.png'))
  .flatten({ background: BG })
  .resize(1200, 630)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out('og-image.jpg'))
console.log(`og-image.jpg          ${og.width}×${og.height} ${kb(og.size)}`)

// --- Photo icons (180 / 192 / 512) ---
const render = src('favicon-137-13721.png')
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const info = await sharp(render).flatten({ background: BG }).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(out(name))
  console.log(`${name.padEnd(21)} ${size}×${size} ${kb(info.size)}`)
}

// --- Letters: the Figma vector placed where the render draws them ---
const vector = await readFile(src('favicon-ac-137-13721.svg'), 'utf8')
const d = vector.match(/\sd="([^"]+)"/)[1]
const [vw, vh] = vector.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number)
const { data: px, info } = await sharp(render).removeAlpha().raw().toBuffer({ resolveWithObject: true })
// Letter bounds in the render: pixels clearly off the background.
const bg = [0x1e, 0x1f, 0x2d]
let box = [Infinity, Infinity, -1, -1]
for (let y = 0; y < info.height; y++)
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 3
    if (Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]) > 60)
      box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)]
  }
const letters = (fill, size = 512) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512"><rect width="512" height="512" fill="${BG}"/><path transform="translate(${box[0]} ${box[1]}) scale(${((box[2] - box[0] + 1) / vw).toFixed(5)} ${((box[3] - box[1] + 1) / vh).toFixed(5)})" d="${d}" fill="${fill}"/></svg>`,
  )

// Average photo colour strictly inside the letters (mask eroded by 3px to skip the anti-aliased edge).
const mask = await sharp(letters('#ffffff')).greyscale().erode(3).raw().toBuffer()
const sum = [0, 0, 0]
let count = 0
for (let p = 0; p < mask.length; p++) {
  if (mask[p] < 255) continue
  sum[0] += px[p * 3]
  sum[1] += px[p * 3 + 1]
  sum[2] += px[p * 3 + 2]
  count++
}
const tone = sum.map((v) => Math.round(v / count))
const hex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (luminance(tone) + 0.05) / (luminance(bg) + 0.05)
const flat = contrast >= 4.5 ? hex(tone) : FALLBACK
console.log(`letters: photo tone ${hex(tone)} = ${contrast.toFixed(2)}:1 on ${BG} → flat fill ${flat}`)

const smallPngs = []
for (const size of [16, 32]) {
  const png = await sharp(letters(flat, size * 8)).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer()
  await writeFile(out(`favicon-${size}.png`), png)
  smallPngs.push({ size, png })
  console.log(`favicon-${size}.png`.padEnd(22), `${size}×${size} ${kb(png.length)}`)
}

// favicon.ico with the 16 and 32 PNGs embedded (ICONDIR + one ICONDIRENTRY per image).
const header = Buffer.alloc(6 + 16 * smallPngs.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(smallPngs.length, 4)
let offset = header.length
smallPngs.forEach(({ size, png }, i) => {
  const e = 6 + 16 * i
  header.writeUInt8(size, e)
  header.writeUInt8(size, e + 1)
  header.writeUInt8(0, e + 2)
  header.writeUInt8(0, e + 3)
  header.writeUInt16LE(1, e + 4)
  header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(png.length, e + 8)
  header.writeUInt32LE(offset, e + 12)
  offset += png.length
})
const ico = Buffer.concat([header, ...smallPngs.map((s) => s.png)])
await writeFile(out('favicon.ico'), ico)
console.log(`favicon.ico           16+32 ${kb(ico.length)}`)
