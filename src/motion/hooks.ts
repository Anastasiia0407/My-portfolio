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

/**
 * Pop-in for margin notes: `data-entered` on `target` when `sentinel` (a 1px marker at the stage's
 * centre) reaches the viewport centre. CSS pops the notes in one by one.
 */
export function usePopIn(sentinel: RefObject<Element | null>, target: RefObject<Element | null>) {
  useEffect(() => {
    const marker = sentinel.current
    const el = target.current
    if (!marker || !el || !motionEnabled()) return
    return observeEnter([marker], () => el.setAttribute('data-entered', ''), { rootMargin: '0px 0px -50% 0px' })
  }, [sentinel, target])
}

const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * Count-up for `[data-count]` elements (aria-hidden visual copies; the real value is in the HTML):
 * 0 → value once, 900 ms ease-out, when `root` is half visible. Already visible on load: left final.
 */
export function useCountUp(root: RefObject<Element | null>, duration = 900) {
  useEffect(() => {
    const el = root.current
    if (!el || !motionEnabled()) return
    // Only a row that starts fully below the viewport counts up: setting it to 0 is then off screen.
    // Partly or fully visible on load (or scrolled past): the final values stay.
    if (el.getBoundingClientRect().top < window.innerHeight) return
    const counters = [...el.querySelectorAll<HTMLElement>('[data-count]')]
    const show = (value: number) =>
      counters.forEach((counter) => {
        counter.textContent = `${Math.round(Number(counter.dataset.count) * value)}${counter.dataset.suffix ?? ''}`
      })
    let frame = 0
    show(0)
    const stop = observeEnter(
      [el],
      () => {
        const start = performance.now()
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          show(easeOut(t))
          if (t < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
      },
      { threshold: 0.5 },
    )
    return () => {
      stop()
      cancelAnimationFrame(frame)
      show(1)
    }
  }, [root, duration])
}

/**
 * Parallax of `image` inside its clipping `frame`: the image is scaled up just enough to cover
 * ±travel/2 of the frame height and moves from −travel/2 to +travel/2 while the frame crosses the viewport.
 */
export function useParallax(frame: RefObject<Element | null>, image: RefObject<HTMLElement | null>, travel = 0.1) {
  useEffect(() => {
    const frameEl = frame.current
    const imageEl = image.current
    if (!frameEl || !imageEl || !motionEnabled()) return
    const scale = 1 + travel + 0.01 // 1% slack so no edge shows at either end
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
        const transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale})`
        if (transform !== last) imageEl.style.transform = last = transform
      },
    })
    return () => {
      stop()
      imageEl.style.transform = ''
    }
  }, [frame, image, travel])
}

/**
 * Hero stage (113:12841): the stage scales 0.96 → 1 over the first half viewport of scroll after it
 * starts entering, and the dashboard drifts at `speed` × page speed (moves down inside the stage, so
 * its clipped bottom edge never lifts into view).
 */
export function useHeroStage(stage: RefObject<HTMLElement | null>, image: RefObject<HTMLElement | null>, speed = 0.85) {
  useEffect(() => {
    const stageEl = stage.current
    const imageEl = image.current
    if (!stageEl || !imageEl || !motionEnabled()) return
    let top = 0
    let height = 0
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
        const scale = `scale(${(0.96 + 0.04 * clamp01(travelled / (vh * 0.5))).toFixed(4)})`
        const shift = `translate3d(0, ${((1 - speed) * travelled).toFixed(2)}px, 0)`
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
