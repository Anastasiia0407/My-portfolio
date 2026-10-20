/**
 * SocialTap scenes (motion notes 177:541), built from the exported screenshots only: each screen
 * enters (rise 40 + fade) or slides in from the right; the notes pop in last. Every scene is pinned
 * and scroll-driven (the site's pin rule): steps are evenly spaced along p and the last ends at 0.9,
 * then a 0.1 hold before the pin releases; scrolling back reverses them. Distances are in Figma px of
 * the stage or screenshot (`u`), so they scale with it.
 */
import { eased, ramp } from '../../motion/stageScene.ts'
import type { LayerStyle, SceneSpec } from '../../motion/stageScene.ts'
import { u } from '../shared/stageGeometry.ts'
import type { SocialTapScene } from '../../data/cases/socialtap.ts'

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

/** 01, 02, 06: back screen 0 → 0.225, front screen slides in 0.225 → 0.45, notes at 0.675 and 0.9. */
export const twoScreens: SceneSpec = {
  layers: { back: rise(0, 0.225), front: slideIn(160, 0.225, 0.45) },
  notesAt: [0.675, 0.9],
}

/** 03: the same steps; the front screen slides in from the stage's right edge like a drawer (832 = 1432 − 600). */
export const drawer: SceneSpec = {
  layers: { back: rise(0, 0.225), front: slideIn(832, 0.225, 0.45, true) },
  notesAt: [0.675, 0.9],
}

/** 04, 05: the screen 0 → 0.3, notes at 0.6 and 0.9. */
export const singleScreen: SceneSpec = {
  layers: { back: rise(0, 0.3) },
  notesAt: [0.6, 0.9],
}

/**
 * Below 760, the same steps over the whole pinned panel (each screenshot is its own mini stage; small
 * distances, no overflow). Notes in DOM order: under the first screen, under the second (04, 05: above
 * the screen, below it).
 */
export const mobileTwoScreens: SceneSpec = {
  layers: { back: rise(0, 0.225), front: slideIn(60, 0.225, 0.45) },
  notesAt: [0.675, 0.9],
}
export const mobileSingleScreen: SceneSpec = { layers: { back: rise(0, 0.3) }, notesAt: [0.6, 0.9] }

/** Not pinned (the panel doesn't fit the screen): each step plays once at the viewport centre. */
export const MOBILE_DURATION = 1400
export const STAGE_DURATION = 2000
export const mobileBack: SceneSpec = { layers: { back: rise(0, 0.55) }, notesAt: [0.8] }
export const mobileFront: SceneSpec = { layers: { front: slideIn(60, 0, 0.55) }, notesAt: [0.8] }
export const mobileSingle: SceneSpec = { layers: { back: rise(0, 0.4) }, notesAt: [0.65, 0.8] }

/** The desktop and the pinned mobile scene for each stage kind (socialtap.ts `scene.kind`). */
export const sceneKinds: Record<SocialTapScene['kind'], { desktop: SceneSpec; mobile: SceneSpec }> = {
  'two-screens': { desktop: twoScreens, mobile: mobileTwoScreens },
  drawer: { desktop: drawer, mobile: mobileTwoScreens },
  'one-screen': { desktop: singleScreen, mobile: mobileSingleScreen },
}

/** How I worked tile: image 42 slides in from the right and settles from a slight scale (p 0 → 1 of its own range). */
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
