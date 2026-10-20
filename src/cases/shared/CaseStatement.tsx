import { useRef } from 'react'
import RevealText from '../../components/RevealText/RevealText.tsx'
import type { CaseStatementData } from '../../data/cases/types.ts'
import { useStatementReveal } from '../../motion/hooks.ts'

/**
 * A label and a paragraph that reveals per character as you scroll (TMS "The result" 120:13690: the
 * home About layout, one screen, content at the bottom). The section is a scroll track and the block
 * pins while the reveal runs, when it fits the screen (useStatementReveal; otherwise no pin).
 */
export default function CaseStatement({ id, statement }: { id: string; statement: CaseStatementData }) {
  const trackRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  useStatementReveal({ track: trackRef, pin: pinRef, target: textRef })
  return (
    <section ref={trackRef} id={id} className="case-result" aria-labelledby={`${id}-title`}>
      <div ref={pinRef} className="case-result__pin">
        <h2 id={`${id}-title`} className="case-result__label">
          {statement.eyebrow}
        </h2>
        <RevealText ref={textRef} className="case-result__text" text={statement.text} />
      </div>
    </section>
  )
}
