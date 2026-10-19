import './InsightRow.css'

export interface Insight {
  label: string
  insight: string
  principle: string
}

/** 113:12887: label, insight, pink arrow, principle; separate elements for the later row-by-row reveal. */
export default function InsightRow({ item }: { item: Insight }) {
  return (
    <li className="insight-row">
      <p className="insight-row__label">{item.label}</p>
      <p className="insight-row__insight">{item.insight}</p>
      <span className="insight-row__arrow" aria-hidden="true">
        →
      </span>
      <p className="insight-row__principle">
        <span className="sr-only">Principle: </span>
        {item.principle}
      </p>
    </li>
  )
}
