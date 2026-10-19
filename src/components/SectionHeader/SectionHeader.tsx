import { Fragment, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useReveal } from '../../motion/hooks.ts'
import './SectionHeader.css'

/**
 * Case section header (e.g. 117:13229, 113:12849): eyebrow, heading and an optional body. With a body
 * the two sit side by side ("Header row", 644 | 756) from 760px. On enter, eyebrow, heading and body
 * fade up 24px in that order, 120 ms apart (motion.css).
 */
export default function SectionHeader({
  id,
  eyebrow,
  heading,
  body,
}: {
  /** id of the heading, for the section's aria-labelledby. */
  id: string
  eyebrow: string
  heading: string | string[]
  body?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)
  const lines = Array.isArray(heading) ? heading : [heading]
  const step = (i: number) => ({ '--i': i }) as CSSProperties
  return (
    <div ref={ref} className={`section-header${body ? ' section-header--split' : ''}`} data-enter>
      <div className="section-header__titles">
        <p className="section-header__eyebrow" data-reveal style={step(0)}>
          {eyebrow}
        </p>
        <h2 id={id} className="section-header__heading" data-reveal style={step(1)}>
          {/* The space sits between the lines, not inside one: a trailing space inside an inline
              span that ends a wrapped line is dropped from the accessible name ("FORA"). */}
          {lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && ' '}
              <span className="section-header__line">{line}</span>
            </Fragment>
          ))}
        </h2>
      </div>
      {body && (
        <p className="section-header__body" data-reveal style={step(2)}>
          {body}
        </p>
      )}
    </div>
  )
}
