import './StatCard.css'

export interface Stat {
  value: number
  suffix: string
  text: string
  source: string
  href?: string
}

/**
 * 113:12868: number, text, source link. The number is a <data> value: screen readers get the final
 * text; the visible copy is aria-hidden so useCountUp can animate it.
 */
export default function StatCard({ stat }: { stat: Stat }) {
  return (
    <li className="stat-card">
      <data className="stat-card__value" value={stat.value}>
        <span className="sr-only">
          {stat.value}
          {stat.suffix}
        </span>
        <span aria-hidden="true" data-count={stat.value} data-suffix={stat.suffix}>
          {stat.value}
          {stat.suffix}
        </span>
      </data>
      <p className="stat-card__text">{stat.text}</p>
      {stat.href ? (
        <a className="stat-card__source" href={stat.href} target="_blank" rel="noopener noreferrer">
          {stat.source}
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <p className="stat-card__source">{stat.source}</p>
      )}
    </li>
  )
}
