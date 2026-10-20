import { useEffect } from 'react'
import type { RefObject } from 'react'
import { motionEnabled, observeEnter } from './observeEnter.ts'
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
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
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
 * A scene's layers and notes inside `root`, set for a progress value. Writes transform / opacity /
 * clip-path only when they change; `clear()` undoes only what it wrote (inline styles from the
 * markup, like static clip regions, stay). `data-scene` on `root` turns on the scene-only layers.
 */
function bindScene(root: HTMLElement, spec: SceneSpec) {
  const counts: Record<string, number> = {}
  const layers = [...root.querySelectorAll<HTMLElement>('[data-layer]')].map((el) => {
    const name = el.dataset.layer ?? ''
    const index = (counts[name] = (counts[name] ?? -1) + 1)
    return { el, style: spec.layers[name], index, last: '', wrote: new Set<'transform' | 'opacity' | 'clipPath'>() }
  })
  const notes = [...root.querySelectorAll<HTMLElement>('[data-pop]')].map((el) => ({ el, shown: null as boolean | null }))
  root.setAttribute('data-scene', '')

  const set = (p: number) => {
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
  }

  const clear = () => {
    root.removeAttribute('data-scene')
    for (const { el, wrote } of layers) {
      if (wrote.has('transform')) el.style.transform = ''
      if (wrote.has('opacity')) el.style.opacity = ''
      if (wrote.has('clipPath')) el.style.removeProperty('clip-path')
    }
    notes.forEach(({ el }) => el.removeAttribute('data-shown'))
  }

  return { set, clear }
}

/** A layer function played over [a, b] of another timeline: p 0 → 1 here maps to a → b there. */
export const span =
  (fn: SceneLayers[string], a: number, b: number): SceneLayers[string] =>
  (p, index) =>
    fn(a + p * (b - a), index)

/**
 * Pinned scroll scene (Stops 01–05, No dead ends, 760px and up): p = 0 → 1 through `track` (minus
 * the pinned `pin`'s height) drives every `[data-layer]` inside `pin` through `spec.layers`, and
 * shows the margin notes (`[data-pop]`, `data-shown`) at `spec.notesAt`. Geometry is read only on
 * measure. The DOM's own styles are the final state (reduced motion, no JS).
 */
export function useStageScene(
  track: RefObject<HTMLElement | null>,
  pin: RefObject<HTMLElement | null>,
  spec: SceneSpec,
  enabled = true,
) {
  useEffect(() => {
    const trackEl = track.current
    const pinEl = pin.current
    if (!trackEl || !pinEl || !enabled || !motionEnabled()) return
    const scene = bindScene(pinEl, spec)
    let top = 0
    let length = 1
    const stop = addScrollJob({
      measure() {
        top = pageTop(trackEl)
        length = trackEl.offsetHeight - pinEl.offsetHeight
      },
      update(y) {
        scene.set(length > 0 ? clamp01((y - top) / length) : 1)
      },
    })
    return () => {
      stop()
      scene.clear()
    }
  }, [track, pin, spec, enabled])
}

/**
 * The same scene played once on a timeline (unpinned mobile stops): p runs 0 → 1 over `duration` ms
 * when `root` is 40% visible, notes last. Below the fold on load it starts from p = 0 (off screen);
 * already on screen (or scrolled past) it stays in its final state, so nothing flashes.
 */
export function useTimedScene(root: RefObject<HTMLElement | null>, spec: SceneSpec, duration: number, enabled = true) {
  useEffect(() => {
    const el = root.current
    if (!el || !enabled || !motionEnabled()) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    const scene = bindScene(el, spec)
    scene.set(0)
    let frame = 0
    const stop = observeEnter(
      [el],
      () => {
        const start = performance.now()
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration)
          scene.set(p)
          if (p < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    return () => {
      stop()
      cancelAnimationFrame(frame)
      scene.clear()
    }
  }, [root, spec, duration, enabled])
}

/**
 * The same scene played once on a timeline when `root`'s centre reaches the viewport centre (stages
 * without a pin, desktop): p runs 0 → 1 over `duration` ms, notes at `spec.notesAt`. Below the fold
 * on load it starts from p = 0 (off screen); already on screen (or scrolled past) it stays in its
 * final state, so nothing flashes. Reduced motion / no JS: the markup's final state.
 */
export function useCentreScene(root: RefObject<HTMLElement | null>, spec: SceneSpec, duration: number, enabled = true) {
  useEffect(() => {
    const el = root.current
    if (!el || !enabled || !motionEnabled()) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    const scene = bindScene(el, spec)
    scene.set(0)
    let frame = 0
    let started = false
    let centre = 0
    const stop = addScrollJob({
      measure() {
        centre = pageTop(el) + el.offsetHeight / 2
      },
      update(y, vh) {
        if (started || centre > y + vh / 2) return
        started = true
        const start = performance.now()
        const step = (now: number) => {
          const p = duration > 0 ? Math.min(1, (now - start) / duration) : 1
          scene.set(p)
          if (p < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
    })
    return () => {
      stop()
      cancelAnimationFrame(frame)
      scene.clear()
    }
  }, [root, spec, duration, enabled])
}
