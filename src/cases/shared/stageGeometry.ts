import type { CSSProperties } from 'react'
import type { Box, StageShot as Shot } from '../../data/cases/types.ts'
import type { SceneLayers, SceneSpec } from '../../motion/stageScene.ts'

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

/**
 * One pinned scene from consecutive step scenes (the mobile panel's MobileGroups, in DOM order): step
 * i plays over [i, i + 1] × end / n of p, its notes at their own p within that range; the last step
 * ends at `end` (0.9), then the hold. Layer names must not repeat across steps.
 */
export function sequenceSteps(steps: SceneSpec[], end = 0.9): SceneSpec {
  const n = steps.length
  const layers: SceneLayers = {}
  const notesAt: number[] = []
  steps.forEach((step, i) => {
    const a = (i * end) / n
    const b = ((i + 1) * end) / n
    for (const [name, fn] of Object.entries(step.layers)) layers[name] = (p, index) => fn(Math.min(1, Math.max(0, (p - a) / (b - a))), index)
    for (const at of step.notesAt) notesAt.push(a + at * (b - a))
  })
  return { layers, notesAt }
}
