import { useRef } from 'react'
import RevealText from '../../components/RevealText/RevealText.tsx'
import type { CaseStatementData } from '../../data/cases/types.ts'
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
import { useParagraphReveal, useScrollReveal } from '../../motion/hooks.ts'

/**
 * A label and a paragraph that reveals per character as it scrolls in (TMS "The result" 120:13690:
 * the home About layout, full viewport, content at the bottom; no pin). Below 760 the reveal follows
 * the paragraph's own position (useParagraphReveal).
 */
export default function CaseStatement({ id, statement }: { id: string; statement: CaseStatementData }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const desktop = useMediaQuery(DESKTOP_QUERY)
  useScrollReveal(textRef, desktop)
  useParagraphReveal(textRef, !desktop)
  return (
    <section id={id} className="case-result" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="case-result__label">
        {statement.eyebrow}
      </h2>
      <RevealText ref={textRef} className="case-result__text" text={statement.text} />
    </section>
  )
}
