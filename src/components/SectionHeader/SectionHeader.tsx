import './SectionHeader.css'

/**
 * Case section header (e.g. 117:13229, 113:12849): eyebrow, heading and an optional body. With a body
 * the two sit side by side ("Header row", 644 | 756) from 760px. Each part is its own element so the
 * later motion stage can stagger them.
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
  const lines = Array.isArray(heading) ? heading : [heading]
  return (
    <div className={`section-header${body ? ' section-header--split' : ''}`}>
      <div className="section-header__titles">
        <p className="section-header__eyebrow">{eyebrow}</p>
        <h2 id={id} className="section-header__heading">
          {lines.map((line, index) => (
            <span key={index} className="section-header__line">
              {line}{' '}
            </span>
          ))}
        </h2>
      </div>
      {body && <p className="section-header__body">{body}</p>}
    </div>
  )
}
