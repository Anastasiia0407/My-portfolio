/**
 * SocialTap scenes (motion notes 177:541), built from the exported screenshots only: each screen
 * enters (rise 40 + fade) or slides in from the right; the notes pop in last, 300 ms apart. Every
 * scene plays once on a timeline when its stage (desktop) or step (mobile) reaches the viewport
 * centre. Distances are in Figma px of the stage or screenshot (`u`), so they scale with it.
 */
import { eased, ramp } from '../../motion/stageScene.ts'
import type { LayerStyle, SceneSpec } from '../../motion/stageScene.ts'
import { u } from '../shared/stageGeometry.ts'

/** Rises 40 and fades in over [a, b]. */
const rise = (a: number, b: number) => (p: number): LayerStyle => {
  const k = eased(p, a, b)
  return { transform: `translate3d(0, ${u(40 * (1 - k))}, 0)`, opacity: k }
}

/** Slides in from `distance` to the right over [a, b]; fades in over its first 40% unless `opaque`. */
const slideIn = (distance: number, a: number, b: number, opaque = false) => (p: number): LayerStyle => {
  const k = eased(p, a, b)
  return { transform: `translate3d(${u(distance * (1 - k))}, 0, 0)`, opacity: opaque ? (p < a ? 0 : 1) : ramp(p, a, a + (b - a) * 0.4) }
}

/** Desktop stage scenes play over this many ms; notes 0.15 apart = 300 ms. */
export const STAGE_DURATION = 2000

/** 01, 02, 06: the back screen enters, then the front screen slides in from the right, then the notes. */
export const twoScreens: SceneSpec = {
  layers: { back: rise(0, 0.35), front: slideIn(160, 0.3, 0.65) },
  notesAt: [0.75, 0.9],
}

/** 03: the back screen enters, then the front screen slides in from the stage's right edge like a drawer (832 = 1432 − 600). */
export const drawer: SceneSpec = {
  layers: { back: rise(0, 0.3), front: slideIn(832, 0.25, 0.7, true) },
  notesAt: [0.78, 0.93],
}

/** 04, 05: the single screen enters, then the notes in order. */
export const singleScreen: SceneSpec = {
  layers: { back: rise(0, 0.4) },
  notesAt: [0.6, 0.75],
}

/** Below 760, one step per screenshot (its own mini stage; small distances, no overflow). */
export const MOBILE_DURATION = 1400
export const mobileBack: SceneSpec = { layers: { back: rise(0, 0.55) }, notesAt: [0.8] }
export const mobileFront: SceneSpec = { layers: { front: slideIn(60, 0, 0.55) }, notesAt: [0.8] }
/** 04, 05 on mobile: a note above, the screen, a note below (2000 ms: notes 300 ms apart). */
export const mobileSingle: SceneSpec = { layers: { back: rise(0, 0.4) }, notesAt: [0.65, 0.8] }

/** How I worked tile: image 42 slides in from the right and settles from a slight scale. */
export const TILE_DURATION = 1100
export const tile: SceneSpec = {
  layers: {
    tile: (p) => {
      const k = eased(p, 0, 1)
      return { transform: `translate3d(${u(120 * (1 - k))}, 0, 0) scale(${(1.04 - 0.04 * k).toFixed(4)})`, opacity: ramp(p, 0, 0.35) }
    },
  },
  notesAt: [],
}
