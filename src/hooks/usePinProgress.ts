import { useEffect } from 'react'
import type { RefObject } from 'react'
import { addScrollJob, clamp01, pageTop } from '../motion/scrollLoop.ts'

interface Options {
  /** The scroll track (taller than the viewport). */
  track: RefObject<HTMLElement | null>
  /** The sticky block inside it; the track's extra height (track − pin) is the pinned range. */
  pin: RefObject<HTMLElement | null>
  /** Element that receives `--progress` and `data-progress-active`. */
  target: RefObject<HTMLElement | null>
  /** `--progress` at the pin start (0–1); it runs from here to 1 across the pinned range. */
  from: number
  enabled: boolean
}

/**
 * Scroll progress through a pinned range (position: sticky inside a taller track), written to the
 * target's `--progress`: `from` when the track's top reaches the viewport top, 1 exactly when the
 * pin releases. A job on the shared scroll loop (scrollLoop.ts): geometry read on measure (mount,
 * resize, layout changes), one style write per frame when the value changes; the scroll itself is
 * never intercepted. Measured on mount too, so a reload mid-pin shows the right state.
 */
export function usePinProgress({ track, pin, target, from, enabled }: Options) {
  useEffect(() => {
    const trackEl = track.current
    const pinEl = pin.current
    const el = target.current
    if (!trackEl || !pinEl || !el || !enabled) return

    let top = 0
    let length = 1
    let last = -1
    el.setAttribute('data-progress-active', '')
    const stop = addScrollJob({
      measure() {
        top = pageTop(trackEl)
        length = trackEl.offsetHeight - pinEl.offsetHeight
      },
      update(y) {
        const p = length > 0 ? clamp01((y - top) / length) : 1
        const progress = Math.round((from + p * (1 - from)) * 10000) / 10000
        if (progress !== last) el.style.setProperty('--progress', String((last = progress)))
      },
    })
    return () => {
      stop()
      el.removeAttribute('data-progress-active')
      el.style.removeProperty('--progress')
    }
  }, [track, pin, target, from, enabled])
}
