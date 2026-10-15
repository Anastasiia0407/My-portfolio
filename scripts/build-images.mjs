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
 * Hero "UX/UI · PRODUCT DESIGN" photo (Figma 58:156 inside mask group 58:154, window 1432×240).
 * In Figma the photo is a 5600×8400 object-cover layer rotated 10.41° about its centre;
 * its rotated bounding box sits at (-889, -4806) in window coordinates, blended plus-lighter.
 * We export only the unrotated part of the photo that the window can ever show (plus a margin),
 * at source resolution, and record where it sits so CSS can rotate, mask and blend it.
 */
async function heroPhoto() {
  const angle = 10.41
  const layer = { width: 5600, height: 8400 }
  const bbox = { x: -889, y: -4806, width: 7025.3276, height: 9273.4396 }
  const view = { width: 1432, height: 240 }
  const margin = 8 // Figma px of slack around the visible area

  const input = sharp(src('hero-photo-58-156.png'))
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

  await webp(input.extract(crop), 'hero-photo.webp', { quality: 82 })

  return {
    nodeIds: { maskGroup: '58:154', mask: '58:155', photo: '58:156' },
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

/**
 * About photo 37:55: Figma's own renders with the gradient-map + Bayer dither shaders baked in
 * (1x via get_screenshot, 2x via download_assets). Lossless keeps every dither pixel and stays
 * within budget; lossy WebP smears the pattern.
 */
async function aboutPhoto() {
  await webp(sharp(src('about-photo-37-55@1x.png')).removeAlpha(), 'about-photo@1x.webp', { lossless: true })
  await webp(sharp(src('about-photo-37-55@2x.png')).removeAlpha(), 'about-photo@2x.webp', { lossless: true })
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
await aboutPhoto()
await svg('hero-mask-58-155.svg', 'hero-mask.svg')
await svg('arrow-40-126.svg', 'arrow-up-right.svg')
await svg('get-in-touch-44-137.svg', 'get-in-touch.svg')

await writeFile(
  join(root, 'src/data/figma-layout.generated.ts'),
  `// Generated by scripts/build-images.mjs from Figma ${'KrK3uJDPRwV4ogpCkaWoiS'}. Do not edit by hand.\n\n` +
    `export const heroPhotoLayout = ${JSON.stringify(hero, null, 2)} as const\n\n` +
    `export const work01Layout = ${JSON.stringify(works, null, 2)} as const\n`,
)
console.log('src/data/figma-layout.generated.ts')
