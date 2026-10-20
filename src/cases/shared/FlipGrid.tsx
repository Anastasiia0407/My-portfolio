import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { FlipCardData } from '../../data/cases/types.ts'
import { DESKTOP_QUERY, FINE_HOVER_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { useCentreReached, useReveal } from '../../motion/hooks.ts'

/** Delay between the cards' first flips on desktop (motion note 184:81). */
const FLIP_STAGGER = 150
/** Hover intent: the pointer must stay this long before a card turns (or turns back on leave). */
const HOVER_INTENT = 150

/**
 * Flip cards in a 2 × 2 grid with a media tile (TMS 03, motion note 184:81): a label and statement on
 * the light front, and on the dark back.
 * When the grid's centre (desktop) or each card's centre (mobile) reaches the viewport centre, the
 * cards turn to their backs, 1 → 2 → 3, 150 ms apart on desktop. Then: hover or keyboard focus
 * shows the front again (fine pointers, after a 150 ms hover intent), a tap or Enter / Space toggles.
 * Each card is a toggle button (aria-pressed = the principle shows); both faces stay in the
 * accessibility tree. CSS turns the card with rotateY, or cross-fades the faces with reduced motion;
 * once a card has been turned by hand (`data-flip="user"`) it uses the calmer interaction timing.
 */
export default function FlipGrid({
  items,
  media,
  mobileMediaAt,
}: {
  items: FlipCardData[]
  /** The fourth cell (a photo or a stage tile). */
  media: ReactNode
  /** Below 760: cards from this index on come after the media (TMS: the photo before Insight 3). */
  mobileMediaAt?: number
}) {
  const listRef = useRef<HTMLOListElement>(null)
  // The grid is measured for the flip trigger; the list itself is display: contents and has no box.
  const gridRef = useRef<HTMLDivElement>(null)
  useReveal(listRef, { selector: '.flip-card', batchStagger: 200 })
  const [back, setBack] = useState(() => items.map(() => false))
  const [armed, setArmed] = useState(() => items.map(() => false))
  const [byUser, setByUser] = useState(() => items.map(() => false))
  const keyboardFocus = useRef(items.map(() => false))
  const hoverTimers = useRef<number[]>(items.map(() => 0))
  const turning = useRef(items.map(() => false)) // a turn (or, reduced motion, a fade) is running
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const finePointer = useMediaQuery(FINE_HOVER_QUERY)
  const timers = useRef<number[]>([])

  const show = useCallback((index: number, showBack: boolean, user = false) => {
    setBack((sides) => sides.map((side, i) => (i === index ? showBack : side)))
    setArmed((flags) => (flags[index] ? flags : flags.map((flag, i) => flag || i === index)))
    if (user) setByUser((flags) => (flags[index] ? flags : flags.map((flag, i) => flag || i === index)))
  }, [])

  /**
   * Hover: turn after the intent delay (leaving before it fires cancels the turn). If the card is
   * still turning, re-target it at once instead: the transition reverses from its current angle.
   */
  const hoverTo = (index: number, showBack: boolean) => {
    window.clearTimeout(hoverTimers.current[index])
    const turn = () => show(index, showBack, true)
    if (turning.current[index]) turn()
    else hoverTimers.current[index] = window.setTimeout(turn, HOVER_INTENT)
  }

  // Track running turns with native listeners (React doesn't dispatch transitionrun). A turn is the
  // card's rotateY, or the back face's fade with reduced motion.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const buttons = [...list.querySelectorAll<HTMLButtonElement>('.flip-card__flip')]
    const isTurn = (button: HTMLButtonElement, event: TransitionEvent) =>
      (event.target === button && event.propertyName === 'transform') ||
      ((event.target as HTMLElement).classList.contains('flip-card__face--back') && event.propertyName === 'opacity')
    const handlers = buttons.map((button, i) => {
      const run = (event: TransitionEvent) => {
        if (isTurn(button, event)) turning.current[i] = true
      }
      const end = (event: TransitionEvent) => {
        if (isTurn(button, event)) turning.current[i] = false
      }
      button.addEventListener('transitionrun', run)
      button.addEventListener('transitionend', end)
      return () => {
        button.removeEventListener('transitionrun', run)
        button.removeEventListener('transitionend', end)
      }
    })
    return () => handlers.forEach((remove) => remove())
  }, [])

  const onReach = useCallback(
    (index: number) => {
      if (!desktop) return show(index, true)
      items.forEach((_, i) => timers.current.push(window.setTimeout(() => show(i, true), i * FLIP_STAGGER)))
    },
    [desktop, items, show],
  )
  useCentreReached(gridRef, desktop ? null : '.flip-card', onReach)
  useEffect(() => {
    const scroll = timers.current
    const hover = hoverTimers.current
    return () => [...scroll, ...hover].forEach((timer) => window.clearTimeout(timer))
  }, [])

  return (
    <div ref={gridRef} className="flip-grid">
      <ol ref={listRef} className="flip-grid__cards">
      {items.map((item, i) => (
        <li
          key={item.label}
          className={`flip-card${mobileMediaAt !== undefined && i >= mobileMediaAt ? ' flip-card--after-media' : ''}`}
          data-enter
        >
          <button
            type="button"
            className="flip-card__flip"
            aria-pressed={back[i]}
            data-side={back[i] ? 'back' : 'front'}
            data-flip={byUser[i] ? 'user' : undefined}
            onPointerEnter={(event) => {
              if (finePointer && event.pointerType === 'mouse' && armed[i]) hoverTo(i, false)
            }}
            onPointerLeave={(event) => {
              if (finePointer && event.pointerType === 'mouse' && armed[i]) hoverTo(i, true)
            }}
            onFocus={(event) => {
              keyboardFocus.current[i] = event.currentTarget.matches(':focus-visible')
              if (keyboardFocus.current[i] && armed[i]) show(i, false, true)
            }}
            onBlur={() => {
              if (keyboardFocus.current[i] && armed[i]) show(i, true, true)
              keyboardFocus.current[i] = false
            }}
            onClick={(event) => {
              // Mouse users flip by hovering; a keyboard click (detail 0) or a tap toggles.
              if (event.detail === 0 || !finePointer) show(i, !back[i], true)
            }}

          >
            <span className="flip-card__face flip-card__face--front">
              <span className="flip-card__label" data-reveal style={{ '--i': 0 } as CSSProperties}>
                {item.label}
              </span>
              <span className="flip-card__text" data-reveal style={{ '--i': 1 } as CSSProperties}>
                {item.text}
              </span>
            </span>
            <span className="flip-card__face flip-card__face--back">
              <span className="flip-card__label">{item.backLabel}</span>
              <span className="flip-card__text">{item.backText}</span>
            </span>
          </button>
        </li>
      ))}
      </ol>
      {media}
    </div>
  )
}
