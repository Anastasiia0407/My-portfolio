import { useRef, useState } from 'react'
import type { CSSProperties, FocusEvent, MouseEvent } from 'react'
import { projects, projectStatusLabel } from '../../data/projects.ts'
import type { Placement, Project, ProjectImage } from '../../data/projects.ts'
import { worksStages } from '../../data/figma-layout.generated.ts'
import { useActiveProject, pinnedStepTop } from '../../hooks/useActiveProject.ts'
import { useCursorFollow } from '../../hooks/useCursorFollow.ts'
import {
  DESKTOP_QUERY,
  FINE_HOVER_QUERY,
  PINNED_QUERY,
  REDUCED_MOTION_QUERY,
  useMediaQuery,
} from '../../hooks/useMediaQuery.ts'
import arrow from '../../assets/arrow-up-right.svg'
import './Works.css'

const pct = (value: number, of: number) => `${(value / of) * 100}%`

/** Desktop box as --x/--y/--w/--h and mobile box as --mx/--my/--mw/--mh, in % of each stage. */
function place({ desktop: d, mobile: m }: Placement) {
  const { desktop: ds, mobile: ms } = worksStages
  return {
    '--x': pct(d.x, ds.width),
    '--y': pct(d.y, ds.height),
    '--w': pct(d.width, ds.width),
    '--h': pct(d.height, ds.height),
    '--mx': pct(m.x, ms.width),
    '--my': pct(m.y, ms.height),
    '--mw': pct(m.width, ms.width),
    '--mh': pct(m.height, ms.height),
  } as CSSProperties
}

/** Placement plus rotation and frame geometry (Figma px of each stage) as custom properties. */
function imageStyle({ placement, rotation, frame, src1x }: ProjectImage) {
  return {
    ...place(placement),
    ...(rotation && { '--rot': `${rotation}deg` }),
    ...(frame && {
      '--stroke': frame.desktop.stroke,
      '--radius': frame.desktop.radius,
      '--mstroke': frame.mobile.stroke,
      '--mradius': frame.mobile.radius,
      '--frame-src': `url("${src1x}")`,
    }),
  } as CSSProperties
}

// Static CTA position from Figma (40:125), in panel px (Works.css scales it); the cursor-follow
// translates it from here.
const ctaStyle = { '--cta-x': 224, '--cta-y': 642 } as CSSProperties

const stageStyle = {
  '--stage-w': worksStages.desktop.width,
  '--stage-mw': worksStages.mobile.width,
  '--stage-ratio': `${worksStages.desktop.width} / ${worksStages.desktop.height}`,
  '--stage-mratio': `${worksStages.mobile.width} / ${worksStages.mobile.height}`,
} as CSSProperties

type VisualState = 'before' | 'active' | 'after'

/** Desktop CTA (mouse hover / keyboard). Not shown below 760px or on touch screens, where the visual itself is the link. */
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

/** Status tag (196:14173 / 196:14178): the margin-note pill, e.g. "Coming soon". */
function ProjectTag({ project, className }: { project: Project; className: string }) {
  if (!project.status) return null
  return (
    <span className={`works__tag ${className}`}>
      <span className="works__tag-dot" aria-hidden="true" />
      {projectStatusLabel[project.status]}
    </span>
  )
}

/** "(01) Title" as two stacked copies (Medium + SemiBold) that cross-fade: opacity only, no reflow. */
function ProjectLabel({ project }: { project: Project }) {
  const label = `(${project.number}) ${project.title}`
  return (
    <>
      <span className="works__label-text">{label}</span>
      <span className="works__label-strong" aria-hidden="true">
        {label}
      </span>
    </>
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
    <figure
      ref={figureRef}
      id={project.id}
      className="works__visual"
      data-state={state}
      data-counter={project.counter ?? 'top'}
      data-status={project.status}
      aria-hidden={hidden || undefined}
    >
      {/* The images' own clipping layer: the panel in pinned mode. The counter and CTA sit above it, unclipped. */}
      <div className="works__clip">
        <div className="works__stage" style={stageStyle}>
          {project.band && <div className="works__band works__image" style={place(project.band)} />}
          {project.images.map((image) =>
            image.frame ? (
              <div
                key={image.src1x}
                className="works__frame works__image"
                data-frame={image.frame.kind}
                style={imageStyle(image)}
              >
                <img
                  className="works__frame-image"
                  src={image.src1x}
                  srcSet={`${image.src1x} 1x, ${image.src2x} 2x`}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <img
                key={image.src1x}
                className="works__image"
                style={imageStyle(image)}
                src={image.src1x}
                srcSet={`${image.src1x} 1x, ${image.src2x} 2x`}
                alt={image.alt}
                loading="lazy"
                decoding="async"
              />
            ),
          )}
        </div>
        {/* Below 760 the tag sits over the card's image (196:14178); on desktop the title row has it. */}
        <ProjectTag project={project} className="works__tag--card" />
      </div>
      <span className="works__number" aria-hidden="true">
        ({project.number})
      </span>
      {!project.status && <ProjectCta project={project} />}
      {/* Visible card title below 760px; visually hidden on desktop, where the list names the project. */}
      <figcaption className={`works__caption works__label${state === 'active' ? ' is-active' : ''}`}>
        <ProjectLabel project={project} />
      </figcaption>
      {project.caseStudyUrl && (
        <a className="works__card-link" href={project.caseStudyUrl} aria-label={`Open case study: ${project.title}`} />
      )}
    </figure>
  )
}

/**
 * Three layouts, switched in CSS (JS only reads scroll / intersections and sets state):
 * - ≥760px, motion allowed: pinned. The section is (projects + 1) viewports tall and its
 *   inner grid sticks, so each project gets one viewport of scroll.
 * - ≥760px, reduced motion: two columns, projects stacked in the right column.
 * - <760px: one card per project (visual, then title). No hover, no active state.
 */
export default function Works() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const figuresRef = useRef<(HTMLElement | null)[]>([])

  const desktop = useMediaQuery(DESKTOP_QUERY)
  const pinned = useMediaQuery(PINNED_QUERY)
  const fineHover = useMediaQuery(FINE_HOVER_QUERY)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)

  const scrollIndex = useActiveProject({
    section: sectionRef,
    pin: pinRef,
    figures: figuresRef,
    count: projects.length,
    pinned,
    stacked: desktop && !pinned,
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
      style={{ '--steps': projects.length } as CSSProperties}
    >
      <div ref={pinRef} className="works__pin">
        <div className="works__content">
          <div className="works__intro">
            <p className="works__eyebrow">Real problems, useful products</p>
            <h2 id="works-title" className="works__title">
              selected works
            </h2>
          </div>
          <ol className="works__list">
            {projects.map((project, index) =>
              project.status ? (
                // Inert (coming soon): plain text and its tag, not a link and not focusable (196:14177).
                <li key={project.id} className="works__row">
                  <span
                    className={`works__item works__item--inert works__label${index === activeIndex ? ' is-active' : ''}`}
                    aria-current={index === activeIndex ? 'step' : undefined}
                  >
                    <ProjectLabel project={project} />
                  </span>
                  <ProjectTag project={project} className="works__tag--row" />
                </li>
              ) : (
                <li key={project.id}>
                  <a
                    className={`works__item works__label${index === activeIndex ? ' is-active' : ''}`}
                    href={project.caseStudyUrl ?? `#${project.id}`}
                    aria-current={index === activeIndex ? 'step' : undefined}
                    onClick={project.caseStudyUrl ? undefined : goTo(index)}
                    onFocus={onTitleFocus(index)}
                    onBlur={() => setFocus(null)}
                  >
                    <ProjectLabel project={project} />
                  </a>
                </li>
              ),
            )}
          </ol>
        </div>

        <div ref={panelRef} className="works__panel">
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
