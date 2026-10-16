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
 * Hero "DESIGNER" photo crop for one mask window.
 * In Figma the photo is an object-cover layer (`layer`) rotated `angle`° about its centre; its rotated
 * bounding box (`bbox`) is given in mask-window coordinates and it is blended plus-lighter.
 * We export only the unrotated part of the photo that the window can ever show (plus a margin),
 * at source resolution, and record where it sits so CSS can rotate, mask and blend it.
 * The layer has a Figma colour adjustment (cooler than the original) that Figma only exports at
 * low resolution, so a per-channel tone curve (original → adjusted preview) is applied to the crop.
 */
async function heroPhoto({ nodeIds, angle, layer, bbox, view, output }) {
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

  const curve = await toneCurve(src('hero-photo-61-185.png'), src('hero-photo-61-185-preview.png'))
  const raw = await input.clone().extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < raw.data.length; i++) raw.data[i] = curve[i % 3][raw.data[i]]
  await webp(sharp(raw.data, { raw: raw.info }), output, { quality: 82 })

  return {
    nodeIds,
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

const rect = (x, y, width, height) => ({ x: round(x), y: round(y), width: round(width), height: round(height) })

/**
 * Project 01 phones: Figma renders of 39:111 and 39:115 at 2x (frame + screen, as composited in Figma).
 * Desktop positions are in the Works visual panel (37:31, 756×982), where 39:108 sits at (-222, 94);
 * mobile positions are in the card stage (66:294, 361×490), where 66:295 sits at (-100, -9).
 */
async function phones() {
  const desktopParent = { x: -222, y: 94 }
  const mobileParent = { x: -100, y: -9 }
  const items = [
    {
      name: 'work-01-a', file: 'work-01-a-39-111@2x.png', nodeIds: ['39:111', '66:298'],
      desktop: [306.4001, 59.0, 259.8, 617.2], mobile: [143.0003, 30.0001, 144.0266, 342.0317],
    },
    {
      name: 'work-01-b', file: 'work-01-b-39-115@2x.png', nodeIds: ['39:115', '66:302'],
      desktop: [634.4002, 223.8, 260, 617.2], mobile: [267.0001, 125.0001, 144.1375, 342.0317],
    },
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
    const [dx, dy, dw, dh] = item.desktop
    const [mx, my, mw, mh] = item.mobile
    result.push({
      name: item.name,
      nodeIds: item.nodeIds,
      desktop: rect(desktopParent.x + dx, desktopParent.y + dy, dw, dh),
      mobile: rect(mobileParent.x + mx, mobileParent.y + my, mw, mh),
    })
  }
  return result
}

/**
 * Project 03 (desktop 72:857, mobile 66:341): a CSS teal band plus the dashboard screenshot 75:45 / 75:54.
 * Figma's export of 75:45 is clipped by its panel, so the raw 4096×2660 screenshot is used and its
 * 36px radius and 19.2px outside stroke are rebuilt in CSS. The image fills the whole 1200×780 box
 * (the stroke sits outside it), so it is exported at that size.
 * The mobile composition is the desktop one at half size, clipped by the 361×490 card.
 */
async function dashboard() {
  const inner = { width: 1200, height: 780 }
  for (const scale of [1, 2]) {
    const pipeline = sharp(src('work-03-raw1.png')).resize(Math.round(inner.width * scale), Math.round(inner.height * scale), {
      fit: 'cover',
    })
    await webp(pipeline, `work-03@${scale}x.webp`, { quality: 82 })
  }
  return {
    nodeIds: { panel: '72:857', band: '75:44', image: '75:45', mobilePanel: '66:341', mobileBand: '75:53', mobileImage: '75:54' },
    band: { desktop: rect(0, 0, 756, 440), mobile: rect(0, 0, 378, 220) },
    image: { desktop: rect(100, 100, 1200, 780), mobile: rect(50, 50, 600, 390) },
  }
}

/** The mobile mask vector 66:272 is drawn horizontally and rotated −90° in Figma: bake that rotation. */
async function verticalMask(from, to) {
  const raw = await readFile(src(from), 'utf8')
  const w = Number(raw.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)[1])
  const h = Number(raw.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)[2])
  const body = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/\s(?:id)="[^"]*"/g, '')
    .replace(/>\s+</g, '><')
    .trim()
  const clean = `<svg width="${h}" height="${w}" viewBox="0 0 ${h} ${w}" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 ${w}) rotate(-90)">${body}</g></svg>`
  await writeFile(out(to), `${clean}\n`)
  console.log(`${to.padEnd(24)} ${`${h}×${w}`.padEnd(10)} ${(Buffer.byteLength(clean) / 1024).toFixed(1)} KB`)
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

const hero = await heroPhoto({
  nodeIds: { maskGroup: '61:183', mask: '61:184', photo: '61:185' },
  angle: 10.41,
  layer: { width: 5451.53, height: 8177.294 },
  bbox: { x: -888.32, y: -4716.9, width: 6839.068, height: 9027.577 },
  view: { width: 1432, height: 200 },
  output: 'hero-photo.webp',
})
// Mobile (66:271): vertical window 114.525×828 at (262, 0) in the hero; the photo's bounding box
// sits at (-2451.59, -2603.22) in the hero, i.e. (-2713.59, -2603.22) in the window.
const heroMobile = await heroPhoto({
  nodeIds: { maskGroup: '66:271', mask: '66:272', photo: '66:273' },
  angle: -79.59,
  layer: { width: 3136.877, height: 4705.315 },
  bbox: { x: -2713.594, y: -2603.22, width: 5194.578, height: 3935.283 },
  view: { width: 114.525, height: 828 },
  output: 'hero-photo-mobile.webp',
})
const phoneLayout = await phones()
const work03 = await dashboard()
await svg('hero-mask-61-184.svg', 'hero-mask.svg')
await verticalMask('hero-mask-mobile-66-272.svg', 'hero-mask-mobile.svg')
await svg('arrow-40-126.svg', 'arrow-up-right.svg')
await svg('get-in-touch-61-192.svg', 'get-in-touch.svg')

const stages = {
  desktop: { nodeId: '37:31', width: 756, height: 982 },
  mobile: { nodeId: '66:294', width: 361, height: 490 },
}

await writeFile(
  join(root, 'src/data/figma-layout.generated.ts'),
  `// Generated by scripts/build-images.mjs from Figma ${'KrK3uJDPRwV4ogpCkaWoiS'}. Do not edit by hand.\n\n` +
    `export const heroPhotoLayout = ${JSON.stringify(hero, null, 2)} as const\n\n` +
    `export const heroPhotoMobileLayout = ${JSON.stringify(heroMobile, null, 2)} as const\n\n` +
    `/** Works visual stages: desktop panel and mobile card, in Figma px. */\n` +
    `export const worksStages = ${JSON.stringify(stages, null, 2)} as const\n\n` +
    `export const work01Phones = ${JSON.stringify(phoneLayout, null, 2)} as const\n\n` +
    `export const work03Layout = ${JSON.stringify(work03, null, 2)} as const\n`,
)
console.log('src/data/figma-layout.generated.ts')
