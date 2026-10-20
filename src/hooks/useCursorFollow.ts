import { useEffect } from 'react'
import type { RefObject } from 'react'

const EASE = 0.18 // share of the remaining distance covered per 60 fps frame

/** The last mouse position in the viewport (null: unknown, or the pointer left the window). */
let pointer: { x: number; y: number } | null = null
const listeners = new Set<() => void>()
let tracking = false

/** Tracks the mouse globally (one passive listener for every hook instance). */
function trackPointer(onChange: () => void): () => void {
  listeners.add(onChange)
  if (!tracking) {
    tracking = true
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerOut)
  }
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0 && tracking) {
      tracking = false
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerOut)
    }
  }
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  pointer = { x: event.clientX, y: event.clientY }
  listeners.forEach((listener) => listener())
}

function onPointerOut() {
  pointer = null
  listeners.forEach((listener) => listener())
}

const inside = (el: Element, x: number, y: number) => {
  const r = el.getBoundingClientRect()
  return x >= r.left && x < r.right && y >= r.top && y < r.bottom
}

/**
 * The Works CTA (pink ↗ circle) attached to the mouse. The "host" is the project visual whose CTA
 * follows the pointer: the active one while the pointer is over the panel (pinned), or the one under
 * the pointer (stacked, reduced motion); a project without a CTA (Coming soon) has none. The host gets
 * `--fx`/`--fy` (a translate from the CTA's static Figma position, clamped so the whole circle stays
 * inside the panel or, stacked, the visual), `is-following` (CSS: the translate) and `data-cta-shown`
 * (CSS: fade in). On a new host the CTA is placed at the pointer first, with no easing, then shown;
 * after that it follows with an eased lag in viewport space (none when `instant`), so scrolling under a
 * still cursor doesn't drag it. The last mouse position is tracked globally, so a project that scrolls
 * under a still cursor gets its CTA at the pointer too. On leaving, it fades out and its state resets,
 * so the next enter starts at the pointer again. Writes only custom properties, a class and an
 * attribute; one rect read per frame while following.
 */
export function useCursorFollow(
  panel: RefObject<HTMLElement | null>,
  enabled: boolean,
  { pinned, instant }: { pinned: boolean; instant: boolean },
) {
  useEffect(() => {
    const el = panel.current
    if (!el || !enabled) return

    let host: HTMLElement | null = null
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const origin = { x: 0, y: 0, size: 0 }
    let frame = 0
    let last = 0
    let checkFrame = 0
    const fading = new Map<HTMLElement, number>()

    // The fade-out length (--dur-color; the build may write it in s, e.g. ".4s").
    const fadeMs = () => {
      const value = getComputedStyle(el).getPropertyValue('--dur-color').trim()
      const n = parseFloat(value)
      if (Number.isNaN(n)) return 400
      return value.endsWith('ms') ? n : n * 1000
    }

    /** The host for (x, y), if it has a CTA. */
    const hostAt = (x: number, y: number): HTMLElement | null => {
      if (pinned) {
        const active = el.querySelector<HTMLElement>('.works__visual[data-state="active"]')
        return active?.querySelector('.works__cta') && inside(el, x, y) ? active : null
      }
      for (const visual of el.querySelectorAll<HTMLElement>('.works__visual')) {
        if (visual.querySelector('.works__cta') && inside(visual, x, y)) return visual
      }
      return null
    }
    /** The box the CTA stays inside. */
    const boundsOf = (h: HTMLElement) => (pinned ? el : h)

    /** The CTA's static position inside the host (layout offsets: ignore its scale and the figure's transform). */
    const measureOrigin = (h: HTMLElement) => {
      const cta = h.querySelector<HTMLElement>('.works__cta')
      origin.x = 0
      origin.y = 0
      origin.size = cta?.offsetWidth ?? 0
      for (let node: HTMLElement | null = cta; node && node !== h; node = node.offsetParent as HTMLElement | null) {
        origin.x += node.offsetLeft
        origin.y += node.offsetTop
      }
    }

    /** Target: the circle's top-left in the viewport, centred on (x, y) and clamped to the bounds. */
    const aim = (h: HTMLElement, x: number, y: number) => {
      const box = boundsOf(h).getBoundingClientRect()
      target.x = Math.min(Math.max(x - origin.size / 2, box.left), box.right - origin.size)
      target.y = Math.min(Math.max(y - origin.size / 2, box.top), box.bottom - origin.size)
    }

    /** The translate from the static position: viewport position minus the host's origin. Returns
     * whether the host moved since the last write, to keep following. */
    const hostBox = { x: NaN, y: NaN }
    const write = (h: HTMLElement) => {
      const box = h.getBoundingClientRect()
      const moved = box.left !== hostBox.x || box.top !== hostBox.y
      hostBox.x = box.left
      hostBox.y = box.top
      h.style.setProperty('--fx', `${(current.x - box.left - origin.x).toFixed(2)}px`)
      h.style.setProperty('--fy', `${(current.y - box.top - origin.y).toFixed(2)}px`)
      return moved
    }

    const tick = (now: number) => {
      frame = 0
      if (!host || !pointer) return
      aim(host, pointer.x, pointer.y)
      const dt = last ? Math.min(now - last, 64) : 16.67
      last = now
      const k = instant ? 1 : 1 - Math.pow(1 - EASE, dt / 16.67)
      current.x += (target.x - current.x) * k
      current.y += (target.y - current.y) * k
      // A pinned project slides in (a transition on the visual): keep the CTA on the pointer meanwhile.
      const moved = write(host) || host.getAnimations().length > 0
      if (moved || Math.abs(target.x - current.x) > 0.1 || Math.abs(target.y - current.y) > 0.1) frame = requestAnimationFrame(tick)
      else last = 0
    }

    /** Hide the CTA (fade), then drop the follow transform and the position. */
    const release = (h: HTMLElement) => {
      h.removeAttribute('data-cta-shown')
      window.clearTimeout(fading.get(h))
      fading.set(
        h,
        window.setTimeout(() => {
          fading.delete(h)
          if (h === host) return
          h.classList.remove('is-following')
          h.style.removeProperty('--fx')
          h.style.removeProperty('--fy')
        }, fadeMs()),
      )
    }

    /** Place the CTA at the pointer at once (no easing, no transform transition), then show it. */
    const attach = (h: HTMLElement, x: number, y: number) => {
      window.clearTimeout(fading.get(h))
      fading.delete(h)
      measureOrigin(h)
      aim(h, x, y)
      current.x = target.x
      current.y = target.y
      last = 0
      write(h)
      h.classList.add('is-following')
      h.setAttribute('data-cta-shown', '')
    }

    /** Which host is under the pointer now: attach, release or keep following. */
    const check = () => {
      checkFrame = 0
      const next = pointer ? hostAt(pointer.x, pointer.y) : null
      if (next !== host) {
        if (host) release(host)
        host = next
        if (host && pointer) attach(host, pointer.x, pointer.y)
      }
      // Follow in this frame (with `instant`, the CTA is at the pointer with no frame of lag).
      if (host) {
        cancelAnimationFrame(frame)
        tick(performance.now())
      }
    }
    const schedule = () => {
      if (!checkFrame) checkFrame = requestAnimationFrame(check)
    }

    // The first event attaches synchronously, so the CTA is never shown anywhere but at the pointer.
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointer = { x: event.clientX, y: event.clientY }
      check()
    }

    // The active project changes on scroll (React commits after the scroll event): check again.
    const states = new MutationObserver(schedule)
    states.observe(el, { attributes: true, attributeFilter: ['data-state'], subtree: true })

    const stopTracking = trackPointer(schedule)
    el.addEventListener('pointerover', onEnter)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      states.disconnect()
      stopTracking()
      el.removeEventListener('pointerover', onEnter)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
      cancelAnimationFrame(checkFrame)
      fading.forEach((timer) => window.clearTimeout(timer))
      for (const h of el.querySelectorAll<HTMLElement>('.works__visual')) {
        h.classList.remove('is-following')
        h.removeAttribute('data-cta-shown')
        h.style.removeProperty('--fx')
        h.style.removeProperty('--fy')
      }
    }
  }, [panel, enabled, pinned, instant])
}
