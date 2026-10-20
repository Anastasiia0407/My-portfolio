import type { CSSProperties, ReactNode, Ref } from 'react'
import type { MarginNoteData, Size, StageShot as StageShotData } from '../../data/cases/types.ts'
import { pct, placeIn } from './placeIn.ts'
import './Stage.css'

/**
 * Composed screenshot canvas (e.g. 117:13311): a fixed-ratio box, Figma px → % positions, and
 * `--u` = one Figma px of the stage for sizes that scale with it (type, strokes, radii).
 * - `overlay`: a positioned layer above the canvas (the stop 02 hand-off flow).
 * - `notes`: margin notes, positioned over the stage from 760px and listed under it below.
 * Each child is its own element so the scenes can address it; a pinned scene shows the notes by
 * progress (useStageScene).
 */
export default function Stage({
  size,
  className,
  overlay,
  notes,
  canvasRef,
  label,
  children,
}: {
  size: Size
  className?: string
  overlay?: ReactNode
  notes?: MarginNoteData[]
  canvasRef?: Ref<HTMLDivElement>
  /** Makes the canvas one image for assistive tech (role="img") with this description. */
  label?: string
  children: ReactNode
}) {
  const hasNotes = notes && notes.length > 0

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
        <div className="stage__notes">
          {notes.map((note) => (
            <MarginNote key={note.text} note={note} size={size} />
          ))}
        </div>
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
      style={{ ...placeIn(shot.box, size), '--s': shot.stroke } as CSSProperties}
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
export function MarginNote({ note, size }: { note: MarginNoteData; size: Size }) {
  const right = note.x + note.width / 2 > size.width / 2
  const y = pct(note.y, size.height)
  const style = right
    ? ({ '--y': y, '--right': pct(size.width - note.x - note.width, size.width) } as CSSProperties)
    : ({ '--y': y, '--x': pct(note.x, size.width) } as CSSProperties)
  return (
    <p className="margin-note" data-pop data-anchor={right ? 'right' : 'left'} style={style}>
      <span className="margin-note__dot" aria-hidden="true" />
      {note.text}
    </p>
  )
}
