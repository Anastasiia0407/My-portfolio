import { useRef } from 'react'
import RevealText from '../RevealText/RevealText.tsx'
import { revealLength } from '../RevealText/revealLength.ts'
import { usePinProgress } from '../../hooks/usePinProgress.ts'
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { useParagraphReveal } from '../../motion/hooks.ts'
import './About.css'

// Figma 62:247 (desktop) / 66:280 (mobile). The frames show a mid-reveal state: the first clause dark, the rest grey.
const aboutText =
  'Hi, I’m Anastasiia Cheban, I turn complex problems into clear, usable products. Every product gets my full attention, as if it were my own. With AI in my workflow, I take ideas from first sketch to a working product.'

// The reveal starts from the Figma state: this first clause already dark.
const leadText = 'Hi, I’m Anastasiia Cheban,'

const aboutLength = revealLength(aboutText)
const leadLength = revealLength(leadText)

export default function About() {
  const trackRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)
  const desktop = useMediaQuery(DESKTOP_QUERY)

  // From 760: the section pins (sticky inside a taller track, see About.css) and the scroll through
  // the pinned range drives the reveal: the lead clause dark at the pin start, every character dark
  // at release. Below 760: no pin; the paragraph's own position drives it, from the same lead clause.
  usePinProgress({ track: trackRef, pin: pinRef, target: textRef, from: leadLength / aboutLength, enabled: !reducedMotion && desktop })
  useParagraphReveal(textRef, !desktop, leadLength / aboutLength)

  return (
    <section ref={trackRef} id="about" className="about on-light" aria-labelledby="about-title">
      <div ref={pinRef} className="about__pin">
        <h2 id="about-title" className="about__label">
          Who I am
        </h2>
        <RevealText ref={textRef} className="about__text" text={aboutText} />
      </div>
    </section>
  )
}
