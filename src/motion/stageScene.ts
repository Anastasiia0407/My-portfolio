import { useEffect } from 'react'
import type { RefObject } from 'react'
import { motionEnabled } from './observeEnter.ts'
import { addScrollJob, clamp01, pageTop } from './scrollLoop.ts'

/** Styles a scene layer gets for a progress value. Omitted keys are left to CSS. */
export interface LayerStyle {
  transform?: string
  opacity?: number
  clipPath?: string
}

/** `[data-layer="name"]` elements → their style at progress p (index = position among same-named layers). */
export type SceneLayers = Record<string, (p: number, index: number) => LayerStyle>

export interface SceneSpec {
  layers: SceneLayers
  /** p at which each margin note (in DOM order) shows. The pin releases at p = 1, after the last. */
  notesAt: number[]
}

/** 0 → 1 as p goes from a to b. */
export const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
/** ramp() eased in-out. */
export const eased = (p: number, a: number, b: number) => easeInOut(ramp(p, a, b))

/**
 * Clockwise sweep from 12 o'clock as a clip-path polygon (in % of the clipped box), for drawing a
 * donut: (cx, cy) centre, (rx, ry) radius in % of width / height, `turn` 0 → 1.
 */
export function sweep(cx: number, cy: number, rx: number, ry: number, turn: number): string {
  if (turn <= 0) return 'polygon(0 0, 0 0, 0 0)'
  if (turn >= 1) return 'none'
  const points = [`${cx}% ${cy}%`]
  const end = -90 + 360 * turn
  for (let a = -90; ; a += 10) {
    const angle = Math.min(a, end)
    const r = (angle * Math.PI) / 180
    points.push(`${(cx + rx * Math.cos(r)).toFixed(3)}% ${(cy + ry * Math.sin(r)).toFixed(3)}%`)
    if (angle === end) break
  }
  return `polygon(${points.join(', ')})`
}

/**
 * Pinned scroll scene (Stops 01–05, No dead ends): p = 0 → 1 through `track` (minus the pinned
 * `pin`'s height) drives every `[data-layer]` inside `pin` through `spec.layers`, and shows the
 * margin notes (`[data-pop]`, `data-shown`) at `spec.notesAt`. Geometry is read only on measure;
 * each frame writes transform / opacity / clip-path and attributes, and only when they change.
 * The DOM's own styles are the final state (reduced motion, no JS); `data-scene` on the pin turns on
 * the scene-only layers.
 */
export function useStageScene(track: RefObject<HTMLElement | null>, pin: RefObject<HTMLElement | null>, spec: SceneSpec) {
  useEffect(() => {
    const trackEl = track.current
    const pinEl = pin.current
    if (!trackEl || !pinEl || !motionEnabled()) return
    const counts: Record<string, number> = {}
    const layers = [...pinEl.querySelectorAll<HTMLElement>('[data-layer]')].map((el) => {
      const name = el.dataset.layer ?? ''
      const index = (counts[name] = (counts[name] ?? -1) + 1)
      return { el, style: spec.layers[name], index, last: '', wrote: new Set<'transform' | 'opacity' | 'clipPath'>() }
    })
    const notes = [...pinEl.querySelectorAll<HTMLElement>('[data-pop]')].map((el) => ({ el, shown: null as boolean | null }))
    let top = 0
    let length = 1
    pinEl.setAttribute('data-scene', '')

    const stop = addScrollJob({
      measure() {
        top = pageTop(trackEl)
        length = trackEl.offsetHeight - pinEl.offsetHeight
      },
      update(y) {
        const p = length > 0 ? clamp01((y - top) / length) : 1
        for (const layer of layers) {
          if (!layer.style) continue
          const s = layer.style(p, layer.index)
          const key = `${s.transform ?? ''}|${s.opacity ?? ''}|${s.clipPath ?? ''}`
          if (key === layer.last) continue
          layer.last = key
          if (s.transform !== undefined) {
            layer.el.style.transform = s.transform
            layer.wrote.add('transform')
          }
          if (s.opacity !== undefined) {
            layer.el.style.opacity = String(Math.round(s.opacity * 1000) / 1000)
            layer.wrote.add('opacity')
          }
          if (s.clipPath !== undefined) {
            layer.el.style.clipPath = s.clipPath
            layer.wrote.add('clipPath')
          }
        }
        notes.forEach((note, i) => {
          const shown = p >= (spec.notesAt[i] ?? 1)
          if (shown === note.shown) return
          note.shown = shown
          if (shown) note.el.setAttribute('data-shown', '')
          else note.el.removeAttribute('data-shown')
        })
      },
    })

    return () => {
      stop()
      pinEl.removeAttribute('data-scene')
      // Only undo what the scene wrote; inline styles from the markup (static clip regions) stay.
      for (const { el, wrote } of layers) {
        if (wrote.has('transform')) el.style.transform = ''
        if (wrote.has('opacity')) el.style.opacity = ''
        if (wrote.has('clipPath')) el.style.removeProperty('clip-path')
      }
      notes.forEach(({ el }) => el.removeAttribute('data-shown'))
    }
  }, [track, pin, spec])
}
