/**
 * One passive scroll listener and one requestAnimationFrame for every scroll-linked effect.
 * Geometry is read only in `measure` (on start, resize and document size changes); `update`
 * gets the scroll position and the cached viewport height and only writes styles.
 */
export interface ScrollJob {
  measure(viewportHeight: number): void
  update(scrollY: number, viewportHeight: number): void
}

const jobs = new Set<ScrollJob>()
let frame = 0
let viewportHeight = 0
let resizeObserver: ResizeObserver | null = null

function tick() {
  frame = 0
  const y = window.scrollY
  for (const job of jobs) job.update(y, viewportHeight)
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick)
}

function remeasure() {
  viewportHeight = window.innerHeight
  for (const job of jobs) job.measure(viewportHeight)
  schedule()
}

export function addScrollJob(job: ScrollJob): () => void {
  if (jobs.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure)
    resizeObserver = new ResizeObserver(remeasure)
    resizeObserver.observe(document.body)
  }
  jobs.add(job)
  viewportHeight = window.innerHeight
  job.measure(viewportHeight)
  job.update(window.scrollY, viewportHeight)
  return () => {
    jobs.delete(job)
    if (jobs.size === 0) {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
      resizeObserver?.disconnect()
      resizeObserver = null
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/** Element top in page coordinates. Only for `measure`. */
export const pageTop = (element: Element) => element.getBoundingClientRect().top + window.scrollY
