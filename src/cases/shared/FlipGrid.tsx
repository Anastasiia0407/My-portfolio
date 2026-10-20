import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { FlipCardData } from '../../data/cases/types.ts'
import { DESKTOP_QUERY, FINE_HOVER_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { useCentreReached, useReveal } from '../../motion/hooks.ts'
import { motionEnabled } from '../../motion/observeEnter.ts'
import { addScrollJob, clamp01, pageTop, watchPinFit } from '../../motion/scrollLoop.ts'
import { useCentreScene, useStageScene } from '../../motion/stageScene.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'

/** Hover intent: the pointer must stay this long on a light card before it turns. */
const HOVER_INTENT = 150
/** Scroll fallback: still-light cards turn this long after the trigger, this far apart. */
const FALLBACK_DELAY = 1000
const FALLBACK_STAGGER = 300

/**
 * Flip cards in a 2 × 2 grid with a media tile (TMS 03, motion note 184:81): a label and statement on
 * the light front (what we found), and on the dark back (what we decided). A one-way story:
 * - Hover (fine pointer) turns a light card dark after a 150 ms hover intent; it stays dark.
 * - Scroll fallback: 1000 ms after the grid's centre (desktop) or a card's centre (mobile) reaches
 *   the viewport centre, every still-light card the user hasn't touched turns, 1 → 2 → 3, 300 ms apart.
 * - A click, Enter / Space or a tap toggles a card; it is the only way back to the light side.
 * Each card is a toggle button (aria-pressed = the back shows) that never rotates, so hover can't
 * flicker; only its inner layer turns (rotateY, or a cross-fade with reduced motion). The hidden face
 * is aria-hidden, so the button's name is the visible side's text.
 * With `pin` (the site's pin rule), the grid pins in a scroll track when it fits the screen
 * (100svh − 32): an optional media scene plays over p 0 → 0.225, then the still-light, untouched cards
 * turn at evenly spaced p (last at 0.9, then a 0.1 hold), and turn back when you scroll back up. When
 * it doesn't fit, the scroll fallback above applies and the media scene plays once at the centre.
 */
export default function FlipGrid({
  items,
  media,
  mobileMediaAt,
  pin,
}: {
  items: FlipCardData[]
  /** The fourth cell (a photo or a stage tile). */
  media: ReactNode
  /** Below 760: cards from this index on come after the media (TMS: the photo before Insight 3). */
  mobileMediaAt?: number
  /** Pin the grid (track = 100svh + length × 100svh); `mediaScene` (p 0 → 1) animates the media's layers. */
  pin?: { length: number; mediaScene?: SceneSpec; mediaDuration?: number }
}) {
  const listRef = useRef<HTMLOListElement>(null)
  // The grid is measured for the scroll fallback; the list itself is display: contents and has no box.
  const gridRef = useRef<HTMLDivElement>(null)
  useReveal(listRef, { selector: '.flip-card', batchStagger: 200 })
  const [back, setBack] = useState(() => items.map(() => false))
  const backNow = useRef(back) // the latest sides, for timers
  const touched = useRef(items.map(() => false)) // the user turned this card (hover, click, tap)
  const hoverTimers = useRef<number[]>(items.map(() => 0))
  const timers = useRef<number[]>([])
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const finePointer = useMediaQuery(FINE_HOVER_QUERY)
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)
  const pinnedNow = useRef(false)
  useEffect(() => {
    pinnedNow.current = pinned
  }, [pinned])
  const mediaScene = pin?.mediaScene
  const pinEnabled = !!pin
  // Pinned: the media scene over the first step (p 0 → 0.225), the card flips after it.
  const mediaStep = mediaScene ? 0.225 : 0
  const flipAt = useMemo(
    () => items.map((_, i) => mediaStep + ((0.9 - mediaStep) * (i + 1)) / items.length),
    [items, mediaStep],
  )
  const pinnedMedia = useMemo<SceneSpec>(
    () => ({
      layers: Object.fromEntries(
        Object.entries(mediaScene?.layers ?? {}).map(([name, fn]) => [
          name,
          (p: number, i: number) => fn(Math.min(1, p / mediaStep), i),
        ]),
      ),
      notesAt: [],
    }),
    [mediaScene, mediaStep],
  )

  const show = useCallback((index: number, showBack: boolean) => {
    backNow.current = backNow.current.map((side, i) => (i === index ? showBack : side))
    setBack(backNow.current)
  }, [])

  const userShow = (index: number, showBack: boolean) => {
    window.clearTimeout(hoverTimers.current[index])
    touched.current[index] = true
    show(index, showBack)
  }

  // Pin when the grid fits the screen (and motion is on).
  useEffect(() => {
    const grid = gridRef.current
    const host = trackRef.current
    if (!grid || !host || !pinEnabled || !motionEnabled()) return
    const stop = watchPinFit(grid, host, 32, setPinned)
    return () => {
      stop()
      setPinned(false)
    }
  }, [pinEnabled])
  useStageScene(trackRef, pinRef, pinnedMedia, pinned && !!mediaScene)
  useCentreScene(gridRef, mediaScene ?? pinnedMedia, pin?.mediaDuration ?? 0, pinEnabled && !pinned && !!mediaScene)
  // Pinned: p through the track turns the untouched cards at flipAt, both ways.
  useEffect(() => {
    const track = trackRef.current
    const pinEl = pinRef.current
    if (!pinned || !track || !pinEl) return
    let top = 0
    let length = 1
    return addScrollJob({
      measure() {
        top = pageTop(track)
        length = track.offsetHeight - pinEl.offsetHeight
      },
      update(y) {
        const p = length > 0 ? clamp01((y - top) / length) : 1
        flipAt.forEach((at, i) => {
          const showBack = p >= at
          if (!touched.current[i] && backNow.current[i] !== showBack) show(i, showBack)
        })
      },
    })
  }, [pinned, flipAt, show])

  /** The scroll fallback: turn the still-light, untouched cards among `indexes`, one by one. */
  const onReach = useCallback(
    (index: number) => {
      if (pinnedNow.current) return
      const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
      const indexes = desktop ? items.map((_, i) => i) : [index]
      later(FALLBACK_DELAY, () => {
        indexes
          .filter((i) => !touched.current[i] && !backNow.current[i])
          .forEach((i, k) =>
            later(k * FALLBACK_STAGGER, () => {
              if (!touched.current[i] && !backNow.current[i]) show(i, true)
            }),
          )
      })
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
    <div
      ref={trackRef}
      className="flip-track"
      data-pinned={pinned || undefined}
      style={pin ? ({ '--flip-pin-length': pin.length } as CSSProperties) : undefined}
    >
      <div ref={pinRef} className="flip-pin">
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
              onPointerEnter={(event) => {
                if (!finePointer || event.pointerType !== 'mouse' || backNow.current[i]) return
                window.clearTimeout(hoverTimers.current[i])
                hoverTimers.current[i] = window.setTimeout(() => userShow(i, true), HOVER_INTENT)
              }}
              onPointerLeave={() => window.clearTimeout(hoverTimers.current[i])}
              onClick={() => userShow(i, !backNow.current[i])}
            >
              <span className="flip-card__inner">
                <span className="flip-card__face flip-card__face--front" aria-hidden={back[i] || undefined}>
                  <span className="flip-card__label" data-reveal style={{ '--i': 0 } as CSSProperties}>
                    {item.label}
                  </span>
                  <span className="flip-card__text" data-reveal style={{ '--i': 1 } as CSSProperties}>
                    {item.text}
                  </span>
                </span>
                <span className="flip-card__face flip-card__face--back" aria-hidden={!back[i] || undefined}>
                  <span className="flip-card__label">{item.backLabel}</span>
                  <span className="flip-card__text">{item.backText}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      {media}
    </div>
      </div>
    </div>
  )
}
