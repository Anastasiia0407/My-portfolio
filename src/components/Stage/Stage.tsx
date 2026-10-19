import { useRef } from 'react'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { usePopIn } from '../../motion/hooks.ts'
import type { MarginNoteData, Size, StageShot as StageShotData } from '../../data/cases/tms.ts'
import { pct, placeIn } from './placeIn.ts'
import './Stage.css'

/**
 * Composed screenshot canvas (e.g. 117:13311): a fixed-ratio box, Figma px → % positions, and
 * `--u` = one Figma px of the stage for sizes that scale with it (type, strokes, radii).
 * - `overlay`: a positioned layer above the canvas (the stop 02 hand-off flow).
 * - `notes`: margin notes, positioned over the stage from 760px and listed under it below.
 * Each child is its own element so later motion stages can address it. Notes pop in one by one
 * when the stage's centre (a 1px sentinel) reaches the viewport centre.
 */
export default function Stage({
  size,
  className,
  overlay,
  notes,
  canvasRef,
  label,
  notesMode = 'pop',
  children,
}: {
  size: Size
  className?: string
  overlay?: ReactNode
  notes?: MarginNoteData[]
  canvasRef?: Ref<HTMLDivElement>
  /** Makes the canvas one image for assistive tech (role="img") with this description. */
  label?: string
  /** 'pop': notes pop in when the stage centre passes the viewport centre; 'scene': a pinned scene shows them by progress. */
  notesMode?: 'pop' | 'scene'
  children: ReactNode
}) {
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  usePopIn(sentinelRef, notesRef)
  const hasNotes = notes && notes.length > 0
  const pop = notesMode === 'pop'

  return (
    <div
      className={`stage${className ? ` ${className}` : ''}`}
      style={{ '--stage-w': size.width, '--stage-h': size.height } as CSSProperties}
    >
      {overlay}
      <div ref={canvasRef} className="stage__canvas" role={label ? 'img' : undefined} aria-label={label}>
        {children}
      </div>
      {hasNotes && (
        <>
          {pop && <span ref={sentinelRef} className="stage__centre" aria-hidden="true" />}
          <div ref={notesRef} className="stage__notes" data-enter={pop || undefined} data-scene-notes={pop ? undefined : ''}>
            {notes.map((note, index) => (
              <MarginNote key={note.text} note={note} size={size} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Framed screenshot (rounded, Figma OUTSIDE stroke in --color-band-border). */
export function StageShot({
  shot,
  size,
  eager,
  layer,
  ref,
}: {
  shot: StageShotData
  size: Size
  eager?: boolean
  /** Scene layer name (useStageScene). */
  layer?: string
  ref?: Ref<HTMLImageElement>
}) {
  return (
    <img
      ref={ref}
      data-layer={layer}
      className="stage__item stage-shot"
      style={{ ...placeIn(shot.box, size), '--r': shot.radius, '--s': shot.stroke } as CSSProperties}
      src={shot.src1x}
      srcSet={`${shot.src1x} 1x, ${shot.src2x} 2x`}
      width={Math.round(shot.box.width)}
      height={Math.round(shot.box.height)}
      alt={shot.alt}
      loading={eager ? undefined : 'lazy'}
      decoding="async"
    />
  )
}

/**
 * Margin note (117:13315): dark pill, pink dot, 16/20 text. Anchored to the stage edge it is
 * closer to, so it stays inside when the type stops shrinking with the stage.
 */
export function MarginNote({ note, size, index = 0 }: { note: MarginNoteData; size: Size; index?: number }) {
  const right = note.x + note.width / 2 > size.width / 2
  const y = pct(note.y, size.height)
  const style = right
    ? ({ '--y': y, '--i': index, '--right': pct(size.width - note.x - note.width, size.width) } as CSSProperties)
    : ({ '--y': y, '--i': index, '--x': pct(note.x, size.width) } as CSSProperties)
  return (
    <p className="margin-note" data-pop data-anchor={right ? 'right' : 'left'} style={style}>
      <span className="margin-note__dot" aria-hidden="true" />
      {note.text}
    </p>
  )
}
