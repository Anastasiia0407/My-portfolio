import { useEffect } from 'react'
import type { RefObject } from 'react'

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
 * pin releases. One rAF-throttled rect read per scroll frame and one style write when the value
 * changes; the scroll itself is never intercepted. Measured on mount too, so a reload mid-pin
 * shows the right state.
 */
export function usePinProgress({ track, pin, target, from, enabled }: Options) {
  useEffect(() => {
    const trackEl = track.current
    const pinEl = pin.current
    const el = target.current
    if (!trackEl || !pinEl || !el || !enabled) return

    let frame = 0
    let last = -1

    const measure = () => {
      frame = 0
      const length = trackEl.offsetHeight - pinEl.offsetHeight
      const offset = -trackEl.getBoundingClientRect().top
      const p = length > 0 ? Math.min(1, Math.max(0, offset / length)) : 1
      const progress = Math.round((from + p * (1 - from)) * 10000) / 10000
      if (progress !== last) {
        last = progress
        el.style.setProperty('--progress', String(progress))
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    el.setAttribute('data-progress-active', '')
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      el.removeAttribute('data-progress-active')
      el.style.removeProperty('--progress')
    }
  }, [track, pin, target, from, enabled])
}
