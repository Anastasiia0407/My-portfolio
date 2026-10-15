import aboutPhoto1x from '../../assets/about-photo@1x.webp'
import aboutPhoto2x from '../../assets/about-photo@2x.webp'
import './About.css'

// Figma's three heading lines. Static for now; the reveal stage splits them into characters.
const headingLines = ['I design complex B2B products,', 'shaped by years of using them', 'from the other side of the screen.']

export default function About() {
  return (
    <section id="about" className="about on-light" aria-labelledby="about-title">
      <div className="about__intro">
        <p className="about__eyebrow">about</p>
        <h2 id="about-title" className="about__heading">
          {headingLines.map((line, index) => (
            <span key={index} className="about__line">
              {line}{' '}
            </span>
          ))}
        </h2>
      </div>
      <div className="about__row">
        <p className="about__body">
          Every project starts with understanding how the work really happens: who uses the product,
          what they need to get done, and where they get stuck. From there I design the flows, the
          system behind them and, when it helps, a working prototype in code.
        </p>
        {/* Gradient-map + Bayer dither shaders (37:55) are baked into the image. */}
        <img
          className="about__photo"
          src={aboutPhoto1x}
          srcSet={`${aboutPhoto1x} 756w, ${aboutPhoto2x} 1512w`}
          sizes="(min-width: 1024px) 50vw, 100vw"
          width={756}
          height={480}
          alt="Portrait of Anastasiia Cheban"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  )
}
