import type { CSSProperties, Ref } from 'react'
import './RevealText.css'

/**
 * Paragraph split into numbered characters for the scroll-linked "typed" reveal (home About 62:247,
 * case "The result" 120:13692). A hook writes `--progress` (0–1) and `data-progress-active` on the
 * paragraph; without them (no JS, reduced motion, or a static page) every character is full ink.
 */
export default function RevealText({
  text,
  className,
  ref,
}: {
  text: string
  className?: string
  ref?: Ref<HTMLParagraphElement>
}) {
  let index = 0
  const words = text.split(' ').map((word) => [...word].map((char) => ({ char, index: index++ })))

  return (
    <p ref={ref} className={`reveal-text${className ? ` ${className}` : ''}`} style={{ '--chars': index } as CSSProperties}>
      {/* Screen readers get the paragraph once; the per-character copy is visual only. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((chars, word) => (
          <span key={word}>
            <span className="reveal-text__word">
              {chars.map(({ char, index }) => (
                <span key={index} className="reveal-text__char" style={{ '--i': index } as CSSProperties}>
                  {char}
                </span>
              ))}
            </span>{' '}
          </span>
        ))}
      </span>
    </p>
  )
}
