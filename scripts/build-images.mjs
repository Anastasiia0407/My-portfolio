// Turns the raw Figma exports in design-src/ (gitignored) into optimised files in src/assets/,
// and writes the Figma geometry the CSS needs to src/data/figma-layout.generated.ts.
// Originals are downloaded locally through Figma MCP; this script never fetches anything.
// Run: npm run images
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = (path) => join(root, 'design-src/figma', path)
const out = (path) => join(root, 'src/assets', path)
const round = (value, digits = 4) => Number(value.toFixed(digits))

await mkdir(out(''), { recursive: true })

async function webp(pipeline, name, options) {
  const { size, width, height } = await pipeline.clone().webp({ effort: 6, ...options }).toFile(out(name))
  console.log(`${name.padEnd(24)} ${`${width}×${height}`.padEnd(10)} ${(size / 1024).toFixed(0)} KB`)
}

/**
 * Per-channel 256-entry lookup table mapping `originalPath` colours to `adjustedPath` colours,
 * fitted on the two images at the adjusted image's size, smoothed and made monotonic.
 */
async function toneCurve(originalPath, adjustedPath) {
  const adjusted = sharp(adjustedPath).removeAlpha()
  const { width, height } = await adjusted.metadata()
  const a = await adjusted.raw().toBuffer()
  const o = await sharp(originalPath).removeAlpha().resize(width, height).raw().toBuffer()
  return [0, 1, 2].map((c) => {
    const sum = new Float64Array(256)
    const count = new Float64Array(256)
    for (let i = c; i < o.length; i += 3) {
      sum[o[i]] += a[i]
      count[o[i]]++
    }
    // Weighted average over a ±4 window fills sparse levels; then force monotonic.
    const lut = new Uint8Array(256)
    let previous = 0
    for (let v = 0; v < 256; v++) {
      let s = 0
      let n = 0
      for (let k = Math.max(0, v - 4); k <= Math.min(255, v + 4); k++) {
        s += sum[k]
        n += count[k]
      }
      const value = n ? s / n : v
      previous = Math.max(previous, Math.round(value))
      lut[v] = Math.min(255, previous)
    }
    return lut
  })
}

/**
 * Hero "DESIGNER" photo (Figma 61:185 inside mask group 61:183, window 1432×200).
 * In Figma the photo is a 5451.53×8177.29 object-cover layer rotated 10.41° about its centre;
 * its rotated bounding box sits at (-888.32, -4716.9) in window coordinates, blended plus-lighter.
 * We export only the unrotated part of the photo that the window can ever show (plus a margin),
 * at source resolution, and record where it sits so CSS can rotate, mask and blend it.
 */
async function heroPhoto() {
  const angle = 10.41
  const layer = { width: 5451.53, height: 8177.294 }
  const bbox = { x: -888.32, y: -4716.9, width: 6839.068, height: 9027.577 }
  const view = { width: 1432, height: 200 }
  const margin = 8 // Figma px of slack around the visible area

  const input = sharp(src('hero-photo-61-185.png'))
  const { width: sw, height: sh } = await input.metadata()
  const cover = Math.max(layer.width / sw, layer.height / sh) // Figma px per source px
  const imageOffset = { x: (layer.width - sw * cover) / 2, y: (layer.height - sh * cover) / 2 }

  // Window corners → unrotated layer coordinates (origin = layer top-left).
  const centre = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 }
  const rad = (angle * Math.PI) / 180
  const toLayer = ([x, y]) => {
    const dx = x - centre.x
    const dy = y - centre.y
    return {
      x: dx * Math.cos(rad) + dy * Math.sin(rad) + layer.width / 2,
      y: -dx * Math.sin(rad) + dy * Math.cos(rad) + layer.height / 2,
    }
  }
  const corners = [[0, 0], [view.width, 0], [0, view.height], [view.width, view.height]].map(toLayer)
  const xs = corners.map((p) => p.x)
  const ys = corners.map((p) => p.y)

  // Snap the crop to whole source pixels, then express it back in Figma px.
  const crop = {
    left: Math.max(0, Math.floor((Math.min(...xs) - margin - imageOffset.x) / cover)),
    top: Math.max(0, Math.floor((Math.min(...ys) - margin - imageOffset.y) / cover)),
  }
  crop.width = Math.min(sw, Math.ceil((Math.max(...xs) + margin - imageOffset.x) / cover)) - crop.left
  crop.height = Math.min(sh, Math.ceil((Math.max(...ys) + margin - imageOffset.y) / cover)) - crop.top

  const box = {
    x: centre.x - layer.width / 2 + imageOffset.x + crop.left * cover,
    y: centre.y - layer.height / 2 + imageOffset.y + crop.top * cover,
    width: crop.width * cover,
    height: crop.height * cover,
  }
  const origin = { x: centre.x - box.x, y: centre.y - box.y }

  // The layer has a Figma colour adjustment (cooler than the original). Figma only exports the
  // adjusted image at low resolution, so fit a per-channel tone curve original → adjusted
  // and apply it to the full-resolution crop.
  const curve = await toneCurve(src('hero-photo-61-185.png'), src('hero-photo-61-185-preview.png'))
  const raw = await input.clone().extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < raw.data.length; i++) raw.data[i] = curve[i % 3][raw.data[i]]
  await webp(sharp(raw.data, { raw: raw.info }), 'hero-photo.webp', { quality: 82 })

  return {
    nodeIds: { maskGroup: '61:183', mask: '61:184', photo: '61:185' },
    view,
    rotationDeg: angle,
    blendMode: 'plus-lighter',
    /** Unrotated image box in window px; all values also given as % for responsive CSS. */
    box: { x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height) },
    boxPercent: {
      left: round((box.x / view.width) * 100),
      top: round((box.y / view.height) * 100),
      width: round((box.width / view.width) * 100),
      height: round((box.height / view.height) * 100),
    },
    /** transform-origin (the layer centre) as % of the image box. */
    originPercent: { x: round((origin.x / box.width) * 100), y: round((origin.y / box.height) * 100) },
    sourceCrop: { ...crop, sourceWidth: sw, sourceHeight: sh, figmaPxPerSourcePx: round(cover) },
  }
}

/**
 * Project 01 phones: Figma renders of 39:111 and 39:115 at 2x (frame + screen, as composited in Figma).
 * Positions are in the Works visual panel (37:31, 756×982); 39:108 sits at (-222, 94) in the panel.
 */
async function phones() {
  const parent = { x: -222, y: 94 }
  const items = [
    { name: 'work-01-a', file: 'work-01-a-39-111@2x.png', nodeId: '39:111', x: 306.4001, y: 59.0, width: 259.8, height: 617.2 },
    { name: 'work-01-b', file: 'work-01-b-39-115@2x.png', nodeId: '39:115', x: 634.4002, y: 223.8, width: 260, height: 617.2 },
  ]
  const result = []
  for (const item of items) {
    const two = sharp(src(item.file))
    const { width, height } = await two.metadata()
    await webp(two, `${item.name}@2x.webp`, { quality: 82, alphaQuality: 90 })
    await webp(two.clone().resize(Math.round(width / 2), Math.round(height / 2)), `${item.name}@1x.webp`, {
      quality: 82,
      alphaQuality: 90,
    })
    result.push({
      name: item.name,
      nodeId: item.nodeId,
      x: round(parent.x + item.x),
      y: round(parent.y + item.y),
      width: item.width,
      height: item.height,
    })
  }
  return { panel: { nodeId: '37:31', width: 756, height: 982 }, phones: result }
}

/** Strip Figma-only attributes; keep root width/height/viewBox and the drawing untouched. */
async function svg(from, to) {
  const raw = await readFile(src(from), 'utf8')
  const clean = raw
    .replace(/\s(?:preserveAspectRatio|overflow|style|id)="[^"]*"/g, '')
    .replace(/<g>\s*([\s\S]*?)\s*<\/g>/, '$1')
    .replace(/>\s+</g, '><')
    .trim()
  await writeFile(out(to), `${clean}\n`)
  const { width, height } = await sharp(Buffer.from(clean)).metadata()
  console.log(`${to.padEnd(24)} ${`${width}×${height}`.padEnd(10)} ${(Buffer.byteLength(clean) / 1024).toFixed(1)} KB`)
}

const hero = await heroPhoto()
const works = await phones()
await svg('hero-mask-61-184.svg', 'hero-mask.svg')
await svg('arrow-40-126.svg', 'arrow-up-right.svg')
await svg('get-in-touch-61-192.svg', 'get-in-touch.svg')

await writeFile(
  join(root, 'src/data/figma-layout.generated.ts'),
  `// Generated by scripts/build-images.mjs from Figma ${'KrK3uJDPRwV4ogpCkaWoiS'}. Do not edit by hand.\n\n` +
    `export const heroPhotoLayout = ${JSON.stringify(hero, null, 2)} as const\n\n` +
    `export const work01Layout = ${JSON.stringify(works, null, 2)} as const\n`,
)
console.log('src/data/figma-layout.generated.ts')
