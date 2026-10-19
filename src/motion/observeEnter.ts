/** True when the page set up motion (see the inline script in work/*.html) and the user allows it. */
export function motionEnabled(): boolean {
  return (
    document.documentElement.classList.contains('motion') &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

export interface EnterOptions {
  /** IntersectionObserver root margin, e.g. '0px 0px -50% 0px' = the top half of the viewport. */
  rootMargin?: string
  threshold?: number
}

/**
 * Calls `onEnter` once per element: when it enters the (margin-adjusted) viewport, or straight away
 * when it is already in view or above it on load (`initial` = true). Elements that enter in the same
 * observer callback get increasing `batchIndex` values, for staggering.
 */
export function observeEnter(
  elements: Element[],
  onEnter: (element: Element, batchIndex: number, initial: boolean) => void,
  { rootMargin = '0px', threshold = 0 }: EnterOptions = {},
): () => void {
  const seen = new Set<Element>()
  const observer = new IntersectionObserver(
    (entries) => {
      let batchIndex = 0
      for (const entry of entries) {
        const initial = !seen.has(entry.target)
        seen.add(entry.target)
        const visible = entry.isIntersecting && entry.intersectionRatio >= threshold
        const above = entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0)
        if (visible || (initial && above)) {
          observer.unobserve(entry.target)
          onEnter(entry.target, batchIndex++, initial)
        }
      }
    },
    { rootMargin, threshold },
  )
  elements.forEach((element) => observer.observe(element))
  return () => observer.disconnect()
}
