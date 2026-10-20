import type { CSSProperties } from 'react'
import type { Box, StageShot as Shot } from '../../data/cases/types.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'

export const px = (n: number) => n.toFixed(2)
/** A transform length in Figma px of the stage (scales with it). */
export const u = (n: number) => `calc(var(--u) * ${px(n)})`
/** A box in % of a frame, from fractions of the screenshot. */
export const inFrame = (x: number, y: number, w: number, h: number) =>
  ({ '--bx': `${x * 100}%`, '--by': `${y * 100}%`, '--bw': `${w * 100}%`, '--bh': `${h * 100}%` }) as CSSProperties
/** clip-path inset() for a fractional rect of the image. */
export const insetOf = (x: number, y: number, w: number, h: number, bottomOverride?: number) =>
  `inset(${px(y * 100)}% ${px((1 - x - w) * 100)}% ${px(bottomOverride ?? (1 - y - h) * 100)}% ${px(x * 100)}%)`
/** A fractional rect of a screenshot, in stage px. */
export const onShot = (shot: Shot, x: number, y: number, w: number, h: number): Box => ({
  x: shot.box.x + x * shot.box.width,
  y: shot.box.y + y * shot.box.height,
  width: w * shot.box.width,
  height: h * shot.box.height,
})

/** A timeline with nothing to animate: the note pops in once the screenshot is in view. */
export const noteOnly: SceneSpec = { layers: {}, notesAt: [1] }
