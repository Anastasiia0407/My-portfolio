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

let probe: HTMLElement | null = null

/**
 * The small viewport height (100svh) in px, read from a hidden fixed probe: steady while the iOS
 * toolbar shows and hides (innerHeight is not). Only for `measure`.
 */
export function smallViewportHeight(): number {
  if (!probe) {
    probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
  }
  return probe.offsetHeight || window.innerHeight
}

/**
 * Whether `block` fits the small viewport with `gutter` px to spare (a pinned block must), re-checked
 * on every measure (resize, layout changes). Calls `onChange` when the answer changes and writes the
 * block's height to `--block-h` on `host` (for the track's margins). Returns a stop function.
 */
export function watchPinFit(block: HTMLElement, host: HTMLElement, gutter: number, onChange: (fits: boolean) => void): () => void {
  let fits: boolean | null = null
  let lastH = -1
  return addScrollJob({
    measure(vh) {
      const h = block.offsetHeight
      if (h !== lastH) host.style.setProperty('--block-h', `${(lastH = h)}px`)
      const next = h > 0 && h <= smallViewportHeight() - gutter && vh > 0
      if (next !== fits) onChange((fits = next))
    },
    update() {},
  })
}
