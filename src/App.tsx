import './styles/tokens.css'
import './styles/base.css'
import Hero from './components/Hero/Hero.tsx'
import Works from './components/Works/Works.tsx'
import About from './components/About/About.tsx'
import Contact from './components/Contact/Contact.tsx'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Hero />
      <main id="main">
        <About />
        <Works />
      </main>
      <Contact />
    </>
  )
}
