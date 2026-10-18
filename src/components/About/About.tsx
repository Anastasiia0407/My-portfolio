import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { usePinProgress } from '../../hooks/usePinProgress.ts'
import { REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import './About.css'

// Figma 62:247 (desktop) / 66:280 (mobile). The frames show a mid-reveal state: the first clause dark, the rest grey.
const aboutText =
  'Hi, I’m Anastasiia Cheban, I turn complex problems into clear, usable products. Every product gets my full attention, as if it were my own. With AI in my workflow, I take ideas from first sketch to a working product.'

// The reveal starts from the Figma state: this first clause already dark.
const leadText = 'Hi, I’m Anastasiia Cheban,'

// Words → characters, each character numbered in reading order (spaces excluded).
let charCount = 0
const aboutWords = aboutText.split(' ').map((word) => [...word].map((char) => ({ char, index: charCount++ })))
const leadChars = leadText.replaceAll(' ', '').length

export default function About() {
  const trackRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)

  // The section pins (sticky inside a taller track, see About.css) and the scroll through the pinned
  // range drives the reveal: the lead clause dark at the pin start, every character dark at release.
  usePinProgress({ track: trackRef, pin: pinRef, target: textRef, from: leadChars / charCount, enabled: !reducedMotion })

  return (
    <section ref={trackRef} id="about" className="about on-light" aria-labelledby="about-title">
      <div ref={pinRef} className="about__pin">
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
      </div>
    </section>
  )
}
