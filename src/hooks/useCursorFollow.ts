import { useEffect } from 'react'
import type { RefObject } from 'react'

const EASE = 0.18 // share of the remaining distance covered per 60 fps frame

/**
 * Makes the active project's CTA follow the pointer inside `panel` with an eased lag.
 * Writes only `--fx`/`--fy` (a translate relative to the CTA's static Figma position) and
 * the `is-following` class on the panel; CSS turns them into a transform. The CTA is clamped
 * inside the panel, so it can never cover the title list.
 */
export function useCursorFollow(panel: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = panel.current
    if (!el || !enabled) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const origin = { x: 0, y: 0, size: 0 }
    let hovering = false
    let frame = 0
    let last = 0
    let leaveTimer = 0

    const fadeMs = () => parseFloat(getComputedStyle(el).getPropertyValue('--dur-color')) || 400

    const write = () => {
      el.style.setProperty('--fx', `${current.x.toFixed(2)}px`)
      el.style.setProperty('--fy', `${current.y.toFixed(2)}px`)
    }

    const aim = (event: PointerEvent) => {
      const box = el.getBoundingClientRect()
      const left = Math.min(Math.max(event.clientX - box.left - origin.size / 2, 0), box.width - origin.size)
      const top = Math.min(Math.max(event.clientY - box.top - origin.size / 2, 0), box.height - origin.size)
      target.x = left - origin.x
      target.y = top - origin.y
    }

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16.67
      last = now
      const k = 1 - Math.pow(1 - EASE, dt / 16.67)
      current.x += (target.x - current.x) * k
      current.y += (target.y - current.y) * k
      write()
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      window.clearTimeout(leaveTimer)
      hovering = true
      if (!el.classList.contains('is-following')) {
        // Static position from layout offsets (ignores the CTA's hidden-state scale and the
        // figure's slide transform); every project shares it. Sum offsets up to the panel.
        const cta = el.querySelector<HTMLElement>('[data-state="active"] .works__cta')
        if (!cta) return
        origin.x = 0
        origin.y = 0
        for (let node: HTMLElement | null = cta; node && node !== el; node = node.offsetParent as HTMLElement | null) {
          origin.x += node.offsetLeft
          origin.y += node.offsetTop
        }
        origin.size = cta.offsetWidth
        aim(event)
        current.x = target.x
        current.y = target.y
        write()
        el.classList.add('is-following')
      }
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      if (hovering) aim(event)
    }

    const onLeave = () => {
      hovering = false
      // Keep following while the CTA fades out, then return it to its static position.
      leaveTimer = window.setTimeout(() => {
        if (hovering) return
        stop()
        el.classList.remove('is-following')
      }, fadeMs())
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      window.clearTimeout(leaveTimer)
      stop()
      el.classList.remove('is-following')
    }
  }, [panel, enabled])
}
