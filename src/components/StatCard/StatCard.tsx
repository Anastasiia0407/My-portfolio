import './StatCard.css'

export interface Stat {
  value: number
  suffix: string
  text: string
  source: string
  href?: string
}

/** 113:12868: number (a <data> value, so a later stage can count up to it), text, source link. */
export default function StatCard({ stat }: { stat: Stat }) {
  return (
    <li className="stat-card">
      <data className="stat-card__value" value={stat.value}>
        {stat.value}
        {stat.suffix}
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
