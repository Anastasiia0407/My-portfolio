import './About.css'

// Stub: the scroll-linked character reveal and the baked shader photo are built in the About stage.
export default function About() {
  return (
    <section id="about" className="about on-light" aria-labelledby="about-title">
      <p className="about__eyebrow">about</p>
      <h2 id="about-title" className="about__heading">
        I design complex B2B products, shaped by years of using them from the other side of the
        screen.
      </h2>
      <p className="about__body">
        Every project starts with understanding how the work really happens: who uses the product,
        what they need to get done, and where they get stuck. From there I design the flows, the
        system behind them and, when it helps, a working prototype in code.
      </p>
    </section>
  )
}
