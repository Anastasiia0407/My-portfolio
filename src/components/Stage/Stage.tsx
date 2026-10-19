import type { CSSProperties, ReactNode } from 'react'
import type { MarginNoteData, Size, StageShot as StageShotData } from '../../data/cases/tms.ts'
import { pct, placeIn } from './placeIn.ts'
import './Stage.css'

/**
 * Composed screenshot canvas (e.g. 117:13311): a fixed-ratio box, Figma px → % positions, and
 * `--u` = one Figma px of the stage for sizes that scale with it (type, strokes, radii).
 * - `overlay`: a positioned layer above the canvas (the stop 02 hand-off flow).
 * - `notes`: margin notes, positioned over the stage from 760px and listed under it below.
 * Each child is its own element so later motion stages can address it.
 */
export default function Stage({
  size,
  className,
  overlay,
  notes,
  children,
}: {
  size: Size
  className?: string
  overlay?: ReactNode
  notes?: MarginNoteData[]
  children: ReactNode
}) {
  return (
    <div
      className={`stage${className ? ` ${className}` : ''}`}
      style={{ '--stage-w': size.width, '--stage-h': size.height } as CSSProperties}
    >
      {overlay}
      <div className="stage__canvas">{children}</div>
      {notes && notes.length > 0 && (
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
export function StageShot({ shot, size, eager }: { shot: StageShotData; size: Size; eager?: boolean }) {
  return (
    <img
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
export function MarginNote({ note, size }: { note: MarginNoteData; size: Size }) {
  const right = note.x + note.width / 2 > size.width / 2
  const y = pct(note.y, size.height)
  const style = right
    ? ({ '--y': y, '--right': pct(size.width - note.x - note.width, size.width) } as CSSProperties)
    : ({ '--y': y, '--x': pct(note.x, size.width) } as CSSProperties)
  return (
    <p className="margin-note" data-anchor={right ? 'right' : 'left'} style={style}>
      <span className="margin-note__dot" aria-hidden="true" />
      {note.text}
    </p>
  )
}
