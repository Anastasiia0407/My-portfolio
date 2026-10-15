import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

interface Options {
  section: RefObject<HTMLElement | null>
  /** The sticky element; its height is one scroll step (100svh). */
  pin: RefObject<HTMLElement | null>
  figures: RefObject<(HTMLElement | null)[]>
  count: number
  pinned: boolean
}

/** Scroll offset inside the section where project `index` becomes active (pinned mode). */
export function pinnedStepTop(section: HTMLElement, pin: HTMLElement, index: number): number {
  return window.scrollY + section.getBoundingClientRect().top + index * pin.offsetHeight
}

/**
 * Active project from scroll position. One rAF-throttled read per frame, no writes:
 * - pinned: each project owns one step (pin height) of scroll inside the section;
 * - stacked: the last figure whose top has passed the viewport centre.
 */
export function useActiveProject({ section, pin, figures, count, pinned }: Options): number {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const sectionEl = section.current
      if (!sectionEl) return
      let next = 0
      if (pinned) {
        const step = pin.current?.offsetHeight || window.innerHeight
        const offset = -sectionEl.getBoundingClientRect().top
        // +2px so landing exactly on a step boundary (e.g. after a title click) counts as that step.
        next = Math.floor((offset + 2) / step)
      } else {
        const centre = window.innerHeight / 2
        figures.current.forEach((figure, i) => {
          if (figure && figure.getBoundingClientRect().top <= centre) next = i
        })
      }
      setIndex(Math.min(count - 1, Math.max(0, next)))
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
  }, [section, pin, figures, count, pinned])

  return index
}
