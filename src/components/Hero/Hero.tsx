import Nav from '../Nav/Nav.tsx'
import { owner } from '../../data/site.ts'
import './Hero.css'

// Stub: the spread name and the "UX/UI DESIGNER" photo mask are built in the Hero stage.
export default function Hero() {
  return (
    <header id="home" className="hero">
      <Nav />
      <h1 className="hero__title">
        <span className="hero__name">{owner.name}</span>{' '}
        <span className="hero__role">{owner.role}</span>
      </h1>
    </header>
  )
}
