import type { CSSProperties } from 'react'
import { projects } from '../../data/projects.ts'
import type { Project } from '../../data/projects.ts'
import { work01Layout } from '../../data/figma-layout.generated.ts'
import placeholder from '../../assets/work-placeholder.svg'
import arrow from '../../assets/arrow-up-right.svg'
import './Works.css'

const { panel } = work01Layout

/** Position on the stage, as % of the Figma panel (756×982). */
function place(x: number, y: number, width: number, height: number) {
  return {
    '--x': `${(x / panel.width) * 100}%`,
    '--y': `${(y / panel.height) * 100}%`,
    '--w': `${(width / panel.width) * 100}%`,
    '--h': `${(height / panel.height) * 100}%`,
  } as CSSProperties
}

// Placeholder covers the same footprint as the project 01 phones.
const [first, last] = [work01Layout.phones[0], work01Layout.phones[work01Layout.phones.length - 1]]
const placeholderStyle = place(first.x, first.y, last.x + last.width - first.x, last.y + last.height - first.y)

// Static CTA position from Figma (40:125); the cursor-follow stage replaces it on hover.
const ctaStyle = { '--x': `${(224 / panel.width) * 100}%`, '--y': `${(642 / panel.height) * 100}%` } as CSSProperties

function ProjectVisual({ project, active }: { project: Project; active: boolean }) {
  return (
    <figure
      id={project.id}
      className={`works__visual${active ? ' is-active' : ''}`}
      aria-hidden={!active || undefined}
    >
      {project.images ? (
        project.images.map((image) => (
          <img
            key={image.src1x}
            className="works__image"
            style={place(image.x, image.y, image.width, image.height)}
            src={image.src1x}
            srcSet={`${image.src1x} 1x, ${image.src2x} 2x`}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        ))
      ) : (
        <img className="works__image works__image--placeholder" style={placeholderStyle} src={placeholder} alt="" />
      )}
      <figcaption className="sr-only">{project.title}</figcaption>
    </figure>
  )
}

// Static stage: project 01 is active. Scroll-driven switching comes in a later stage.
export default function Works() {
  const activeIndex = 0
  const active = projects[activeIndex]

  return (
    <section id="works" className="works on-light" aria-labelledby="works-title">
      <div className="works__content">
        <div className="works__intro">
          <p className="works__eyebrow">real problems, useful products</p>
          <h2 id="works-title" className="works__title">
            selected works
          </h2>
        </div>
        <ol className="works__list">
          {projects.map((project, index) => (
            <li key={project.id}>
              <a
                className={`works__item${index === activeIndex ? ' is-active' : ''}`}
                href={`#${project.id}`}
                aria-current={index === activeIndex ? 'step' : undefined}
              >
                ({project.number}) {project.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div className="works__panel">
        <p className="works__counter" aria-hidden="true">
          ({active.number})
        </p>
        <div className="works__stage">
          {projects.map((project, index) => (
            <ProjectVisual key={project.id} project={project} active={index === activeIndex} />
          ))}
          <span className="works__cta" style={ctaStyle} aria-hidden="true">
            <img className="works__cta-icon" src={arrow} alt="" width={40} height={40} />
          </span>
        </div>
      </div>
    </section>
  )
}
