import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { useScrollProgress } from '../../hooks/useScrollProgress.ts'
import { REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import './About.css'

// Figma 62:247 (desktop) / 66:280 (mobile). The frames show a mid-reveal state: the first clause dark, the rest grey.
const aboutText =
  'Hi, I’m Anastasiia Cheban, I turn complex problems into clear, usable products. Every product gets my full attention, as if it were my own. With AI in my workflow, I take ideas from first sketch to a working product.'

// Words → characters, each character numbered in reading order (spaces excluded).
let charCount = 0
const aboutWords = aboutText.split(' ').map((word) => [...word].map((char) => ({ char, index: charCount++ })))

export default function About() {
  const textRef = useRef<HTMLParagraphElement>(null)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)

  // The paragraph sits at the bottom of a full-height section, so the reveal starts as soon as
  // its top enters the viewport (95%) and completes when its top reaches 25% — while the whole
  // paragraph and the section are still on screen.
  useScrollProgress(textRef, { start: 0.95, end: 0.25, enabled: !reducedMotion })

  return (
    <section id="about" className="about on-light" aria-labelledby="about-title">
      <h2 id="about-title" className="about__label">
        Who I am
      </h2>
      <p ref={textRef} className="about__text" style={{ '--chars': charCount } as CSSProperties}>
        {/* Screen readers get the paragraph once; the per-character copy is visual only. */}
        <span className="sr-only">{aboutText}</span>
        <span aria-hidden="true">
          {aboutWords.map((chars, word) => (
            <span key={word}>
              <span className="about__word">
                {chars.map(({ char, index }) => (
                  <span key={index} className="about__char" style={{ '--i': index } as CSSProperties}>
                    {char}
                  </span>
                ))}
              </span>{' '}
            </span>
          ))}
        </span>
      </p>
    </section>
  )
}
