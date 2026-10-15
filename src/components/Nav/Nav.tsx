import { nav } from '../../data/site.ts'
import './Nav.css'

export default function Nav() {
  return (
    <nav className="nav" aria-label="Primary">
      <ul className="nav__list">
        {nav.map((item) => (
          <li key={item.href}>
            <a className="nav__link" href={item.href}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
