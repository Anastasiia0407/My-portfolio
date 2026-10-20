/**
 * The stage of a case section with framed screenshots and margin notes, pinned ("story" rule):
 * - 760px and up: the stage pins in a scroll track (100svh + `scene.length` × 100svh) and progress
 *   p = 0 → 1 drives its scene, margin notes last (useStageScene).
 * - Below 760 the stage is restacked on a #fafafa panel, one screenshot after another with its note
 *   (MobileGroup / MobileShot). With a `mobileSpec`, the panel pins the same way when it fits the
 *   screen (100svh − 32) and p drives `mobileSpec` over the whole panel; otherwise (or without a
 *   `mobileSpec`) each step plays once on a timeline when it enters or reaches the viewport centre.
 * Each screenshot and its overlays are built once (a "piece") and placed either on the desktop stage or
 * in its own full-width mini stage, so overlay geometry (fractions of the screenshot) holds in both.
 * The markup's own state is the final one (reduced motion, no JS); `scene-only` layers exist only
 * while a scene runs. Only transform, opacity and clip-path change.
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import { useCentreScene, useStageScene, useTimedScene } from '../../motion/stageScene.ts'
import { motionEnabled } from '../../motion/observeEnter.ts'
import { watchPinFit } from '../../motion/scrollLoop.ts'
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'
import type { MarginNoteData, SceneData, SectionCopy, Size, StageShot as Shot } from '../../data/cases/types.ts'
import './scene.css'

/** True while the mobile panel is pinned: its steps then follow the pin, not their own timelines. */
const MobilePinned = createContext(false)

/** Section header + stage + the mobile restack (see above). */
export function SceneStop({
  copy,
  scene,
  spec,
  size,
  notes,
  overlay,
  mobile,
  mobileSpec,
  mobileLength,
  mobileLoose,
  children,
}: {
  copy: SectionCopy
  scene: SceneData
  spec: SceneSpec
  size: Size
  notes?: MarginNoteData[]
  overlay?: ReactNode
  /** The restacked version below 760 (MobileGroup / MobileShot), on a #fafafa panel. */
  mobile: ReactNode
  /** The pinned mobile scene over the whole panel: its layers and notes, in DOM order. */
  mobileSpec?: SceneSpec
  /** Viewports of pinned scroll below 760 (default: scene.length). */
  mobileLength?: number
  /** Steps 64 apart on that panel instead of 32 (TMS Stop 01). */
  mobileLoose?: boolean
  children: ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const mTrackRef = useRef<HTMLDivElement>(null)
  const mPinRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLElement>(null)
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const [mobilePinned, setMobilePinned] = useState(false)
  useStageScene(trackRef, pinRef, spec, desktop)
  // Below 760: pin the panel when it fits (and motion is on); then p drives mobileSpec.
  useEffect(() => {
    const figure = figureRef.current
    const host = mTrackRef.current
    if (!figure || !host || desktop || !mobileSpec || !motionEnabled()) return
    const stop = watchPinFit(figure, host, 32, setMobilePinned)
    return () => {
      stop()
      setMobilePinned(false)
    }
  }, [desktop, mobileSpec])
  useStageScene(mTrackRef, mPinRef, mobileSpec ?? { layers: {}, notesAt: [] }, !desktop && mobilePinned && !!mobileSpec)
  const titleId = `${copy.id}-title`
  return (
    <section
      id={copy.id}
      className="case-section case-section--scene"
      aria-labelledby={titleId}
      style={
        {
          '--pin-w': size.width,
          '--pin-h': size.height,
          '--pin-length': scene.length,
          '--mpin-length': mobileLength ?? scene.length,
        } as CSSProperties
      }
    >
      <SectionHeader id={titleId} eyebrow={copy.eyebrow} heading={copy.heading} body={copy.body} />
      <div ref={trackRef} className="scene-track">
        <div ref={pinRef} className="scene-pin">
          <div className="scene-panel">
            <Stage size={size} className="stage--panel" notes={notes} overlay={overlay} label={scene.label}>
              {children}
            </Stage>
          </div>
        </div>
      </div>
      <div ref={mTrackRef} className="scene-mtrack" data-pinned={mobilePinned || undefined}>
        <div ref={mPinRef} className="scene-mpin">
          {/* Below 760: a figure (not role="img") so its screenshots' alts and its notes are read, once. */}
          <figure ref={figureRef} className={`scene-mobile${mobileLoose ? ' scene-mobile--loose' : ''}`} aria-label={scene.label}>
            <MobilePinned.Provider value={mobilePinned}>{mobile}</MobilePinned.Provider>
          </figure>
        </div>
      </div>
    </section>
  )
}

/** A screenshot as its own stage at full width (or a 240-tall phone, `narrow`), for the restacked mobile stops. */
export function MobileShot({
  shot,
  narrow,
  children,
}: {
  shot: Shot
  narrow?: boolean
  children: (local: Shot, size: Size) => ReactNode
}) {
  const size = { width: shot.box.width, height: shot.box.height }
  const local = { ...shot, box: { x: 0, y: 0, ...size } }
  return (
    <div className={`mshot${narrow ? ' mshot--narrow' : ''}`} style={{ '--stage-w': size.width, '--stage-h': size.height } as CSSProperties}>
      {children(local, size)}
    </div>
  )
}

/** One step of a restacked stop: its screenshot(s), its timeline (played once on enter), its note. */
export function MobileGroup({
  spec,
  duration,
  notes = [],
  notesBefore = [],
  pair,
  center,
  trigger = 'enter',
  children,
}: {
  spec: SceneSpec
  duration: number
  notes?: Pick<MarginNoteData, 'text'>[]
  /** Notes above the screenshot (SocialTap 04 and 05, 187:342). */
  notesBefore?: Pick<MarginNoteData, 'text'>[]
  pair?: boolean
  /** Centre the note under the screenshot (TMS Stop 02). */
  center?: boolean
  /** When the step's timeline plays: on enter (40% visible, TMS) or when its centre reaches the viewport centre. */
  trigger?: 'enter' | 'centre'
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const desktop = useMediaQuery(DESKTOP_QUERY)
  const pinned = useContext(MobilePinned)
  useTimedScene(ref, spec, duration, !desktop && !pinned && trigger === 'enter')
  useCentreScene(ref, spec, duration, !desktop && !pinned && trigger === 'centre')
  const note = (text: string) => (
    <p key={text} className="margin-note" data-pop>
      <span className="margin-note__dot" aria-hidden="true" />
      {text}
    </p>
  )
  return (
    <div ref={ref} className={`mgroup${pair ? ' mgroup--pair' : ''}${center ? ' mgroup--center' : ''}`}>
      {notesBefore.map(({ text }) => note(text))}
      {children}
      {notes.map(({ text }) => note(text))}
    </div>
  )
}

/** A framed screenshot whose image is built from layers (the first child is the static screenshot). */
export function SceneFrame({ shot, size, layer, children }: { shot: Shot; size: Size; layer?: string; children: ReactNode }) {
  return (
    <div
      className="stage__item stage-frame"
      data-layer={layer}
      style={{ ...placeIn(shot.box, size), '--s': shot.stroke } as CSSProperties}
    >
      {children}
    </div>
  )
}

export function FrameImage({
  src1x,
  src2x,
  alt = '',
  className = '',
  layer,
  style,
}: {
  src1x: string
  src2x: string
  alt?: string
  className?: string
  layer?: string
  style?: CSSProperties
}) {
  return (
    <img
      className={`stage-frame__img ${className}`}
      data-layer={layer}
      style={style}
      src={src1x}
      srcSet={`${src1x} 1x, ${src2x} 2x`}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}
