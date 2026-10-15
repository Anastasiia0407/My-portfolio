import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { useScrollProgress } from '../../hooks/useScrollProgress.ts'
import { REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import aboutPhoto1x from '../../assets/about-photo@1x.webp'
import aboutPhoto2x from '../../assets/about-photo@2x.webp'
import './About.css'

// Figma's three heading lines (37:52).
const headingLines = ['I design complex B2B products,', 'shaped by years of using them', 'from the other side of the screen.']
const headingText = headingLines.join(' ')

// Lines → words → characters, each character numbered in reading order (spaces excluded).
let charCount = 0
const headingChars = headingLines.map((line) =>
  line.split(' ').map((word) => [...word].map((char) => ({ char, index: charCount++ }))),
)

export default function About() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)

  // Reveal starts when the heading's top is at 85% of the viewport and completes at 35%.
  useScrollProgress(headingRef, { start: 0.85, end: 0.35, enabled: !reducedMotion })

  return (
    <section id="about" className="about on-light" aria-labelledby="about-title">
      <div className="about__intro">
        <p className="about__eyebrow">about</p>
        <h2
          ref={headingRef}
          id="about-title"
          className="about__heading"
          style={{ '--chars': charCount } as CSSProperties}
        >
          {/* Screen readers get the sentence once; the per-character copy is visual only. */}
          <span className="sr-only">{headingText}</span>
          <span aria-hidden="true">
            {headingChars.map((words, line) => (
              <span key={line} className="about__line">
                {words.map((chars, word) => (
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
            ))}
          </span>
        </h2>
      </div>
      <div className="about__row">
        <p className="about__body">
          Every project starts with understanding how the work really happens: who uses the product,
          what they need to get done, and where they get stuck. From there I design the flows, the
          system behind them and, when it helps, a working prototype in code.
        </p>
        {/* Gradient-map + Bayer dither shaders (37:55) are baked into the image. */}
        <img
          className="about__photo"
          src={aboutPhoto1x}
          srcSet={`${aboutPhoto1x} 756w, ${aboutPhoto2x} 1512w`}
          sizes="(min-width: 1024px) 50vw, 100vw"
          width={756}
          height={480}
          alt="Portrait of Anastasiia Cheban"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  )
}
