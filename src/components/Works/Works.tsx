import { useRef, useState } from 'react'
import type { CSSProperties, FocusEvent, MouseEvent } from 'react'
import { projects } from '../../data/projects.ts'
import type { Project } from '../../data/projects.ts'
import { work01Layout } from '../../data/figma-layout.generated.ts'
import { useActiveProject, pinnedStepTop } from '../../hooks/useActiveProject.ts'
import { useCursorFollow } from '../../hooks/useCursorFollow.ts'
import { FINE_HOVER_QUERY, PINNED_QUERY, REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery.ts'
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

// Static CTA position from Figma (40:125); the cursor-follow translates it from here.
const ctaStyle = { '--x': `${(224 / panel.width) * 100}%`, '--y': `${(642 / panel.height) * 100}%` } as CSSProperties

type VisualState = 'before' | 'active' | 'after'

function ProjectCta({ project }: { project: Project }) {
  const icon = <img className="works__cta-icon" src={arrow} alt="" width={40} height={40} />
  // No case study yet: still shown on hover, but not a link and not focusable.
  if (!project.caseStudyUrl) {
    return (
      <span className="works__cta" style={ctaStyle} aria-hidden="true">
        {icon}
      </span>
    )
  }
  return (
    <a className="works__cta" style={ctaStyle} href={project.caseStudyUrl} aria-label={`Open case study: ${project.title}`}>
      {icon}
    </a>
  )
}

function ProjectVisual({
  project,
  state,
  hidden,
  figureRef,
}: {
  project: Project
  state: VisualState
  hidden: boolean
  figureRef: (el: HTMLElement | null) => void
}) {
  return (
    <figure ref={figureRef} id={project.id} className="works__visual" data-state={state} aria-hidden={hidden || undefined}>
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
      <span className="works__visual-number" aria-hidden="true">
        ({project.number})
      </span>
      <ProjectCta project={project} />
      <figcaption className="sr-only">{project.title}</figcaption>
    </figure>
  )
}

/**
 * Pinned (≥1024px, motion allowed): the section is (projects + 1) viewports tall and its
 * inner grid sticks, so each project gets one viewport of scroll. Otherwise the projects
 * stack in the right column. Layout switches in CSS; JS only reads scroll and sets state.
 */
export default function Works() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const figuresRef = useRef<(HTMLElement | null)[]>([])

  const pinned = useMediaQuery(PINNED_QUERY)
  const fineHover = useMediaQuery(FINE_HOVER_QUERY)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)

  const scrollIndex = useActiveProject({
    section: sectionRef,
    pin: pinRef,
    figures: figuresRef,
    count: projects.length,
    pinned,
  })

  // Keyboard focus on a title previews that project until the scroll position changes.
  const [focus, setFocus] = useState<{ index: number; at: number } | null>(null)
  const activeIndex = focus && focus.at === scrollIndex ? focus.index : scrollIndex
  const keyboardFocus = focus !== null && focus.at === scrollIndex

  useCursorFollow(panelRef, pinned && fineHover)

  const goTo = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    const section = sectionRef.current
    const pin = pinRef.current
    const figure = figuresRef.current[index]
    if (!section || !pin || !figure) return
    event.preventDefault()
    const behavior = reducedMotion ? 'auto' : 'smooth'
    if (pinned) window.scrollTo({ top: pinnedStepTop(section, pin, index), behavior })
    else figure.scrollIntoView({ block: 'center', behavior })
  }

  const onTitleFocus = (index: number) => (event: FocusEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.matches(':focus-visible')) setFocus({ index, at: scrollIndex })
  }

  const stateOf = (index: number): VisualState =>
    index === activeIndex ? 'active' : index < activeIndex ? 'before' : 'after'

  return (
    <section
      ref={sectionRef}
      id="works"
      className="works on-light"
      aria-labelledby="works-title"
      data-keyboard-focus={keyboardFocus || undefined}
      style={{ '--steps': projects.length, '--active': activeIndex } as CSSProperties}
    >
      <div ref={pinRef} className="works__pin">
        <div className="works__content">
          <div className="works__intro">
            <p className="works__eyebrow">real problems, useful products</p>
            <h2 id="works-title" className="works__title">
              selected works
            </h2>
          </div>
          <ol className="works__list">
            {projects.map((project, index) => {
              const label = `(${project.number}) ${project.title}`
              return (
                <li key={project.id}>
                  <a
                    className={`works__item${index === activeIndex ? ' is-active' : ''}`}
                    href={`#${project.id}`}
                    aria-current={index === activeIndex ? 'step' : undefined}
                    onClick={goTo(index)}
                    onFocus={onTitleFocus(index)}
                    onBlur={() => setFocus(null)}
                  >
                    <span className="works__item-text">{label}</span>
                    {/* SemiBold copy cross-fades over the Medium one: opacity only, no reflow. */}
                    <span className="works__item-strong" aria-hidden="true">
                      {label}
                    </span>
                  </a>
                </li>
              )
            })}
          </ol>
        </div>

        <div ref={panelRef} className="works__panel">
          <p className="works__counter" aria-hidden="true">
            <span className="works__counter-track">
              {projects.map((project) => (
                <span key={project.id}>({project.number})</span>
              ))}
            </span>
          </p>
          {projects.map((project, index) => (
            <ProjectVisual
              key={project.id}
              project={project}
              state={stateOf(index)}
              hidden={pinned && index !== activeIndex}
              figureRef={(el) => {
                figuresRef.current[index] = el
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
