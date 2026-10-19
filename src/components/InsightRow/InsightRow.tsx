import type { CSSProperties } from 'react'
import './InsightRow.css'

export interface Insight {
  label: string
  insight: string
  principle: string
}

const step = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * 113:12887: label, insight, pink arrow, principle. On enter (motion.css): label and insight fade up,
 * then the arrow draws left → right, then the principle fades in.
 */
export default function InsightRow({ item }: { item: Insight }) {
  return (
    <li className="insight-row" data-enter>
      <p className="insight-row__label" data-reveal style={step(0)}>
        {item.label}
      </p>
      <p className="insight-row__insight" data-reveal style={step(0)}>
        {item.insight}
      </p>
      <span className="insight-row__arrow" aria-hidden="true" data-reveal="draw" style={step(1)}>
        →
      </span>
      <p className="insight-row__principle" data-reveal="fade" style={step(2)}>
        <span className="sr-only">Principle: </span>
        {item.principle}
      </p>
    </li>
  )
}
