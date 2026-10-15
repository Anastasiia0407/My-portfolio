import { useEffect } from 'react'
import type { RefObject } from 'react'

interface Options {
  /** Viewport fraction (0 = top, 1 = bottom) where the element's top starts the progress. */
  start: number
  /** Viewport fraction where the element's top reaches progress 1. */
  end: number
  enabled: boolean
}

/**
 * Writes the element's scroll progress (0–1) to its `--progress` custom property and sets
 * `data-progress-active` while enabled. One rAF-throttled rect read per scroll frame and a
 * single style write only when the value changes; CSS turns it into opacity.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, { start, end, enabled }: Options) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    let frame = 0
    let last = -1

    const measure = () => {
      frame = 0
      const top = el.getBoundingClientRect().top
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (start * vh - top) / ((start - end) * vh)))
      const rounded = Math.round(progress * 1000) / 1000
      if (rounded !== last) {
        last = rounded
        el.style.setProperty('--progress', String(rounded))
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    el.dataset.progressActive = ''
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      delete el.dataset.progressActive
      el.style.removeProperty('--progress')
    }
  }, [ref, start, end, enabled])
}
