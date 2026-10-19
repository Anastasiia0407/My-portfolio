// Case study images: raw Figma fills in design-src/figma/case-tms/ (gitignored) → WebP in
// src/assets/cases/tms/. Each screenshot is exported at its Figma box size (1x) and double (2x);
// photos stop at their source resolution. Originals are downloaded through Figma MCP; this script
// never fetches anything. Run: npm run images
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = (name) => join(root, 'design-src/figma/case-tms', name)
const outDir = join(root, 'src/assets/cases/tms')
await mkdir(outDir, { recursive: true })

/**
 * name → source and Figma box (px). `fit: 'fill'` stretches like Figma's non-cover fill (113:12853).
 * The hero / stop 03 dashboard is not here: it is the project 03 screenshot (work-03@1x/2x.webp).
 */
const images = [
  { name: 'project-photo', file: 'project-photo.png', width: 756, height: 480 }, // 117:13235
  { name: 'problem-bg', file: 'problem-bg.png', width: 1432, height: 720, fit: 'fill', quality: 60, scales: [1] }, // 117:13298, blurred
  { name: 'research-photo', file: 'research-photo.png', width: 612, height: 320 }, // 117:13257
  { name: 'stop-01-form', file: 'image-27.png', width: 760, height: 735.879 }, // 117:13312
  { name: 'stop-01-list', file: 'image-32.png', width: 600, height: 412.698 }, // 120:13377
  { name: 'stop-02-notifications', file: 'image-31.png', width: 907, height: 589.019 }, // 120:13403
  { name: 'stop-03-mobile', file: 'image-33.png', width: 244.238, height: 650 }, // 120:13518
  { name: 'stop-04-shipment', file: 'image-28.png', width: 834.783, height: 542.167 }, // 120:13532
  { name: 'stop-04-invoice', file: 'image-34.png', width: 676.488, height: 439.359 }, // 120:13578
  { name: 'stop-05-dashboard', file: 'image-35.png', width: 1101.147, height: 715.163 }, // 120:13639
  { name: 'edge-empty', file: 'image-36.png', width: 560, height: 363.704 }, // 120:13680
  { name: 'edge-no-results', file: 'image-37.png', width: 560, height: 363.704 }, // 120:13685
  { name: 'edge-columns', file: 'image-30.png', width: 300, height: 649.6 }, // 120:13658
]

/**
 * Stop 04 tab switch: image 27 (General information, 4096 wide) has image 28's layout at 4096/3024 the
 * resolution, so scaled to 3024 wide and cut to 28's 3024×1964 it lines up with image 28 exactly.
 */
{
  const general = await sharp(src('image-27.png')).resize(3024).extract({ left: 0, top: 0, width: 3024, height: 1964 }).png().toBuffer()
  for (const scale of [1, 2]) {
    const info = await sharp(general).flatten({ background: '#f6f4f2' }).resize(Math.round(834.783 * scale), Math.round(542.167 * scale), { fit: 'cover' }).webp({ quality: 82, effort: 6 }).toFile(join(outDir, `stop-04-general@${scale}x.webp`))
    console.log(`${`stop-04-general@${scale}x.webp`.padEnd(32)} ${`${info.width}×${info.height}`.padEnd(10)} ${(info.size / 1024).toFixed(0)} KB`)
  }
}

for (const { name, file, width, height, fit = 'cover', quality = 82, scales = [1, 2] } of images) {
  const input = sharp(src(file))
  const meta = await input.metadata()
  for (const scale of scales) {
    // Never upscale past the source: photos (1024 px wide) cap the 2x at their native size.
    const factor = Math.min(scale, Math.max(1, Math.min(meta.width / width, meta.height / height)))
    const w = Math.round(width * factor)
    const h = Math.round(height * factor)
    const pipeline = input
      .clone()
      .flatten({ background: '#f6f4f2' })
      .resize(w, h, { fit })
    const info = await pipeline.webp({ quality, effort: 6 }).toFile(join(outDir, `${name}@${scale}x.webp`))
    console.log(`${`${name}@${scale}x.webp`.padEnd(32)} ${`${info.width}×${info.height}`.padEnd(10)} ${(info.size / 1024).toFixed(0)} KB`)
  }
}
