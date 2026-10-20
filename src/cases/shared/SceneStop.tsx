/**
 * The stage of a case section with framed screenshots and margin notes, in one of two modes:
 * - `trigger="pin"` (TMS stops, 760px and up): the stage pins in a scroll track and progress p = 0 → 1
 *   drives its scene, margin notes last (useStageScene).
 * - `trigger="centre"`: no pin; the scene plays once on a timeline when the stage's centre reaches the
 *   viewport centre (useCentreScene).
 * Below 760 the stage is restacked on a #fafafa panel, one screenshot after another with its note under
 * it (MobileGroup / MobileShot, no pin); each step plays once when it enters (useTimedScene).
 * Each screenshot and its overlays are built once (a "piece") and placed either on the desktop stage or
 * in its own full-width mini stage, so overlay geometry (fractions of the screenshot) holds in both.
 * The markup's own state is the final one (reduced motion, no JS); `scene-only` layers exist only
 * while a scene runs. Only transform, opacity and clip-path change.
 */
import { useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import { useCentreScene, useStageScene, useTimedScene } from '../../motion/stageScene.ts'
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'
import type { MarginNoteData, SceneData, SectionCopy, Size, StageShot as Shot } from '../../data/cases/types.ts'
import './scene.css'

/**
 * Section header + stage + the mobile restack. `trigger="pin"`: track = 100svh + `scene.length` ×
 * 100svh (scene.css). `trigger="centre"`: no track; the scene plays for `scene.duration` ms once the
 * stage's centre reaches the viewport centre.
 */
export function SceneStop({
  copy,
  scene,
  spec,
  size,
  notes,
  overlay,
  mobile,
  mobileLoose,
  trigger = 'pin',
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
  /** Steps 64 apart on that panel instead of 32 (TMS Stop 01). */
  mobileLoose?: boolean
  trigger?: 'pin' | 'centre'
  children: ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const desktop = useMediaQuery(DESKTOP_QUERY)
  useStageScene(trackRef, pinRef, spec, desktop && trigger === 'pin')
  useCentreScene(stageRef, spec, scene.duration ?? 0, desktop && trigger === 'centre')
  const titleId = `${copy.id}-title`
  const stage = (
    <Stage size={size} className="stage--panel" notes={notes} overlay={overlay} label={scene.label}>
      {children}
    </Stage>
  )
  return (
    <section
      id={copy.id}
      className={`case-section case-section--scene${trigger === 'centre' ? ' case-section--centre' : ''}`}
      aria-labelledby={titleId}
      style={{ '--pin-w': size.width, '--pin-h': size.height, '--pin-length': scene.length } as CSSProperties}
    >
      <SectionHeader id={titleId} eyebrow={copy.eyebrow} heading={copy.heading} body={copy.body} />
      {trigger === 'pin' ? (
        <div ref={trackRef} className="scene-track">
          <div ref={pinRef} className="scene-pin">
            <div className="scene-panel">{stage}</div>
          </div>
        </div>
      ) : (
        <div ref={stageRef} className="scene-static">
          {stage}
        </div>
      )}
      {/* Below 760: a figure (not role="img") so its screenshots' alts and its notes are read, once. */}
      <figure className={`scene-mobile${mobileLoose ? ' scene-mobile--loose' : ''}`} aria-label={scene.label}>
        {mobile}
      </figure>
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
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const desktop = useMediaQuery(DESKTOP_QUERY)
  useTimedScene(ref, spec, duration, !desktop)
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
