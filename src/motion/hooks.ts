import { useEffect } from 'react'
import type { RefObject } from 'react'
import { motionEnabled, observeEnter } from './observeEnter.ts'
import type { EnterOptions } from './observeEnter.ts'
import { addScrollJob, clamp01, pageTop } from './scrollLoop.ts'

/**
 * Enter reveal: marks each trigger `data-entered` once it enters; CSS (motion.css) fades its
 * `[data-reveal]` children up 24px in `--i` order. Triggers entering together are staggered by
 * `batchStagger` ms (via `--enter-delay`).
 */
export function useReveal(
  root: RefObject<Element | null>,
  {
    selector,
    batchStagger = 0,
    rootMargin,
    threshold,
  }: EnterOptions & { selector?: string; batchStagger?: number } = {},
) {
  useEffect(() => {
    const el = root.current
    if (!el || !motionEnabled()) return
    const triggers = selector ? [...el.querySelectorAll(selector)] : [el]
    return observeEnter(
      triggers,
      (trigger, batchIndex) => {
        if (batchStagger) (trigger as HTMLElement).style.setProperty('--enter-delay', `${batchIndex * batchStagger}ms`)
        trigger.setAttribute('data-entered', '')
      },
      { rootMargin, threshold },
    )
  }, [root, selector, batchStagger, rootMargin, threshold])
}

const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * Count-up for `[data-count]` elements (aria-hidden visual copies; the real value is in the HTML):
 * 0 → value once, 900 ms ease-out, when `root` is half visible — and, with `after`, only once that
 * element's bottom has reached the viewport bottom (e.g. a pin track has released). A row that is
 * already on screen (or past) on load keeps its final values.
 */
export function useCountUp(root: RefObject<Element | null>, { after, duration = 900 }: { after?: RefObject<Element | null>; duration?: number } = {}) {
  useEffect(() => {
    const el = root.current
    const afterEl = after?.current ?? null
    if (!el || !motionEnabled()) return
    // Only a row that starts fully below the viewport counts up: setting it to 0 is then off screen.
    if (el.getBoundingClientRect().top < window.innerHeight) return
    const counters = [...el.querySelectorAll<HTMLElement>('[data-count]')]
    const show = (value: number) =>
      counters.forEach((counter) => {
        counter.textContent = `${Math.round(Number(counter.dataset.count) * value)}${counter.dataset.suffix ?? ''}`
      })
    let frame = 0
    let started = false
    let halfLine = 0 // scroll position at which the row is half visible (viewport bottom at its middle)
    let releaseLine = 0
    show(0)
    const stopScroll = addScrollJob({
      measure(vh) {
        const rect = el.getBoundingClientRect()
        halfLine = rect.top + window.scrollY + rect.height / 2 - vh
        releaseLine = afterEl ? afterEl.getBoundingClientRect().bottom + window.scrollY - vh : -Infinity
      },
      update(y) {
        if (started || y < halfLine || y < releaseLine) return
        started = true
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          show(easeOut(t))
          if (t < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
    })
    return () => {
      stopScroll()
      cancelAnimationFrame(frame)
      show(1)
    }
  }, [root, after, duration])
}

/**
 * Parallax of `image` inside its clipping `frame`: the image is scaled up just enough to cover
 * ±travel/2 of the frame height and moves from −travel/2 to +travel/2 while the frame crosses the viewport.
 * `zoom` > 1 adds a scale from `zoom` to 1 over the same crossing (03 photo tile, 1.08 → 1).
 */
export function useParallax(frame: RefObject<Element | null>, image: RefObject<HTMLElement | null>, travel = 0.1, zoom = 1) {
  useEffect(() => {
    const frameEl = frame.current
    const imageEl = image.current
    if (!frameEl || !imageEl || !motionEnabled()) return
    const cover = 1 + travel + 0.01 // 1% slack so no edge shows at either end
    let top = 0
    let height = 0
    let last = ''
    const stop = addScrollJob({
      measure() {
        top = pageTop(frameEl)
        height = frameEl.getBoundingClientRect().height
      },
      update(y, vh) {
        const progress = clamp01((y + vh - top) / (vh + height))
        const shift = (progress - 0.5) * travel * height
        const scale = cover * (zoom + (1 - zoom) * progress)
        const transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
        if (transform !== last) imageEl.style.transform = last = transform
      },
    })
    return () => {
      stop()
      imageEl.style.transform = ''
    }
  }, [frame, image, travel, zoom])
}

/**
 * Hero stage (113:12841): the stage scales 0.96 → 1 over the first half viewport of scroll after it
 * starts entering, and the dashboard drifts at `speed` × page speed (it moves down inside the stage,
 * so its clipped bottom edge never lifts into view).
 * Only a fresh load at the top plays the scale: there the pre-paint CSS start state (0.96) is what
 * the scroll position asks for. A restored load (reload, back/forward, #hash — html.motion-restored,
 * set before first paint) or a stage already scrolled into on load starts final: scale 1, and the
 * drift is anchored at the load position, so nothing moves when the app starts.
 */
export function useHeroStage(stage: RefObject<HTMLElement | null>, image: RefObject<HTMLElement | null>, speed = 0.85) {
  useEffect(() => {
    const stageEl = stage.current
    const imageEl = image.current
    if (!stageEl || !imageEl || !motionEnabled()) return
    const restored = document.documentElement.classList.contains('motion-restored')
    let top = 0
    let height = 0
    let anchor: number | null = null // travelled distance at load, when the stage starts final
    let lastScale = ''
    let lastShift = ''
    const stop = addScrollJob({
      measure() {
        top = pageTop(stageEl)
        height = stageEl.getBoundingClientRect().height
      },
      update(y, vh) {
        const start = Math.max(0, top - vh)
        const travelled = Math.min(Math.max(0, y - start), top + height - start)
        if (anchor === null) anchor = restored || travelled > 0 ? travelled : 0
        const final = restored || anchor > 0
        const scale = final ? 'none' : `scale(${(0.96 + 0.04 * clamp01(travelled / (vh * 0.5))).toFixed(4)})`
        const shift = `translate3d(0, ${((1 - speed) * Math.max(0, travelled - anchor)).toFixed(2)}px, 0)`
        if (scale !== lastScale) stageEl.style.transform = lastScale = scale
        if (shift !== lastShift) imageEl.style.transform = lastShift = shift
      },
    })
    return () => {
      stop()
      stageEl.style.transform = ''
      imageEl.style.transform = ''
    }
  }, [stage, image, speed])
}

/**
 * Scroll-linked RevealText without a pin: `--progress` 0 → 1 from the paragraph's top at 95% of the
 * viewport to 40% — or to the end of the page if that comes first, so the reveal always completes.
 */
export function useScrollReveal(target: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = target.current
    if (!el || !motionEnabled()) return
    let start = 0
    let end = 1
    let last = -1
    el.setAttribute('data-progress-active', '')
    const stop = addScrollJob({
      measure(vh) {
        const top = pageTop(el)
        const maxScroll = document.documentElement.scrollHeight - vh
        start = top - vh * 0.95
        end = Math.max(start + 1, Math.min(top - vh * 0.4, maxScroll))
      },
      update(y) {
        const progress = Math.round(clamp01((y - start) / (end - start)) * 10000) / 10000
        if (progress !== last) el.style.setProperty('--progress', String((last = progress)))
      },
    })
    return () => {
      stop()
      el.removeAttribute('data-progress-active')
      el.style.removeProperty('--progress')
    }
  }, [target])
}

/**
 * Calls `onReach(index)` once per element when its vertical centre reaches the viewport centre (or
 * straight away if it is already past on load). Elements: `root`, or its `selector` matches. A plain
 * scroll job, so it also runs with reduced motion. Keep `onReach` stable (useCallback).
 */
export function useCentreReached(root: RefObject<Element | null>, selector: string | null, onReach: (index: number) => void) {
  useEffect(() => {
    const el = root.current
    if (!el) return
    const done = new Set<number>()
    let centres: number[] = []
    const stop = addScrollJob({
      measure() {
        const elements = selector ? [...el.querySelectorAll(selector)] : [el]
        centres = elements.map((element) => {
          const rect = element.getBoundingClientRect()
          return rect.top + window.scrollY + rect.height / 2
        })
      },
      update(y, vh) {
        centres.forEach((centre, index) => {
          if (done.has(index) || centre > y + vh / 2) return
          done.add(index)
          onReach(index)
        })
      },
    })
    return stop
  }, [root, selector, onReach])
}
