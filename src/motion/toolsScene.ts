import { useEffect } from 'react'
import type { RefObject } from 'react'
import { motionEnabled } from './observeEnter.ts'
import { addScrollJob, clamp01, pageTop } from './scrollLoop.ts'

/** Section 02 scene timing (motion note 124:15, from the approved prototype). p = progress through the pin. */
export const toolsScene = {
  firstStart: 0.12, // card i starts at firstStart + i × startStep
  startStep: 0.13,
  flight: 0.2, // length of each card's flight in p
  straightenBy: 2.2, // rotation reaches 0 at k = 1 / 2.2
  endScale: 0.4,
  fadeFrom: 0.75, // card opacity 1 → 0 over k 0.75 → 1
  rowAt: 0.9, // a card's row shows once its k passes this
  settleFrom: 0.8, // window settle over p 0.8 → 0.95
  settleSpan: 0.15,
  settleBump: 0.04,
  labelAt: 0.9,
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * "Tools → one window" (113:12853): scroll through the pinned track drives each tool card into the
 * TMS window (translate to the window centre, straighten, scale to 40%, fade), shows its row in the
 * window, then settles the window and shows the end label. Reverses on the way up.
 * Card and window centres are layout offsets (no transforms), measured on resize only; each frame
 * writes transforms, opacity and data-shown attributes.
 */
export function useToolsScene({
  track,
  pin,
  canvas,
}: {
  track: RefObject<HTMLElement | null>
  pin: RefObject<HTMLElement | null>
  canvas: RefObject<HTMLElement | null>
}) {
  useEffect(() => {
    const trackEl = track.current
    const pinEl = pin.current
    const canvasEl = canvas.current
    if (!trackEl || !pinEl || !canvasEl || !motionEnabled()) return
    const cards = [...canvasEl.querySelectorAll<HTMLElement>('[data-card]')]
    const rows = [...canvasEl.querySelectorAll<HTMLElement>('[data-row]')]
    const win = canvasEl.querySelector<HTMLElement>('[data-window]')
    const label = canvasEl.querySelector<HTMLElement>('[data-scene-label]')
    if (!win || !label) return
    const t = toolsScene
    const rotations = cards.map((card) => Number(card.dataset.rotation))
    let top = 0
    let length = 1
    let deltas = cards.map(() => ({ x: 0, y: 0 }))
    const last = { cards: cards.map(() => ''), rows: rows.map(() => false), win: '', label: false }

    // Cards drop their static CSS rotate; their transform (written below in the same task) carries it.
    canvasEl.setAttribute('data-scene', '')

    const setShown = (el: HTMLElement, shown: boolean) => (shown ? el.setAttribute('data-shown', '') : el.removeAttribute('data-shown'))

    const stop = addScrollJob({
      measure() {
        top = pageTop(trackEl)
        length = trackEl.offsetHeight - pinEl.offsetHeight
        const wx = win.offsetLeft + win.offsetWidth / 2
        const wy = win.offsetTop + win.offsetHeight / 2
        // A card's layout box starts at its centre (left/top = centre, then translate −50%).
        deltas = cards.map((card) => ({ x: wx - card.offsetLeft, y: wy - card.offsetTop }))
      },
      update(y) {
        const p = length > 0 ? clamp01((y - top) / length) : 1
        cards.forEach((card, i) => {
          const k = easeInOutCubic(clamp01((p - (t.firstStart + i * t.startStep)) / t.flight))
          const rotate = rotations[i] * (1 - Math.min(1, k * t.straightenBy))
          const scale = 1 - (1 - t.endScale) * k
          const opacity = k <= t.fadeFrom ? 1 : 1 - (k - t.fadeFrom) / (1 - t.fadeFrom)
          const key = `translate(${(deltas[i].x * k).toFixed(2)}px, ${(deltas[i].y * k).toFixed(2)}px) rotate(${rotate.toFixed(3)}deg) scale(${scale.toFixed(4)})|${opacity.toFixed(3)}`
          if (key !== last.cards[i]) {
            last.cards[i] = key
            const [transform, alpha] = key.split('|')
            card.style.transform = transform
            card.style.opacity = alpha
          }
          const shown = k > t.rowAt
          if (rows[i] && shown !== last.rows[i]) setShown(rows[i], (last.rows[i] = shown))
        })
        const s = clamp01((p - t.settleFrom) / t.settleSpan)
        const winKey = (1 + t.settleBump * Math.sin(s * Math.PI)).toFixed(4) + '|' + s.toFixed(3)
        if (winKey !== last.win) {
          last.win = winKey
          const [scale, settle] = winKey.split('|')
          win.style.transform = `scale(${scale})`
          win.style.setProperty('--settle', settle)
        }
        const labelShown = p > t.labelAt
        if (labelShown !== last.label) setShown(label, (last.label = labelShown))
      },
    })

    return () => {
      stop()
      canvasEl.removeAttribute('data-scene')
      for (const card of cards) {
        card.style.transform = ''
        card.style.opacity = ''
      }
      rows.forEach((row) => row.removeAttribute('data-shown'))
      label.removeAttribute('data-shown')
      win.style.transform = ''
      win.style.removeProperty('--settle')
    }
  }, [track, pin, canvas])
}
