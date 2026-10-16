import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

interface Options {
  section: RefObject<HTMLElement | null>
  /** The sticky element; its height is one scroll step (100svh). */
  pin: RefObject<HTMLElement | null>
  figures: RefObject<(HTMLElement | null)[]>
  count: number
  /** Desktop with motion: scroll-driven steps. */
  pinned: boolean
  /** Desktop with reduced motion: stacked figures, active one via IntersectionObserver. */
  stacked: boolean
}

/** Scroll offset inside the section where project `index` becomes active (pinned mode). */
export function pinnedStepTop(section: HTMLElement, pin: HTMLElement, index: number): number {
  return window.scrollY + section.getBoundingClientRect().top + index * pin.offsetHeight
}

/**
 * Active Works project.
 * - Pinned: each project owns one step (pin height) of scroll inside the section; one
 *   rAF-throttled rect read per scroll frame, no writes.
 * - Stacked: IntersectionObserver on the figures against a line at the viewport centre;
 *   the figure crossing that line is active (no scroll handler).
 * below 760px there is no active state, so neither runs.
 */
export function useActiveProject({ section, pin, figures, count, pinned, stacked }: Options): number {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (pinned) {
      let frame = 0
      const measure = () => {
        frame = 0
        const sectionEl = section.current
        if (!sectionEl) return
        const step = pin.current?.offsetHeight || window.innerHeight
        const offset = -sectionEl.getBoundingClientRect().top
        // +2px so landing exactly on a step boundary (e.g. after a title click) counts as that step.
        setIndex(Math.min(count - 1, Math.max(0, Math.floor((offset + 2) / step))))
      }
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(measure)
      }
      schedule()
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
      return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
      }
    }

    if (!stacked) return

    const targets = figures.current.filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        // With a zero-height root band only the figure under the centre line intersects.
        const hit = entries.filter((entry) => entry.isIntersecting).at(-1)
        if (hit) setIndex(targets.indexOf(hit.target as HTMLElement))
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [section, pin, figures, count, pinned, stacked])

  return index
}
