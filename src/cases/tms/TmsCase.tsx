import { Fragment, useEffect, useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'
import '../../styles/tokens.css'
import '../../styles/base.css'
import CaseNav, { CaseLink } from '../../components/CaseNav/CaseNav.tsx'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage, { StageShot } from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import StatCard from '../../components/StatCard/StatCard.tsx'
import InsightRow from '../../components/InsightRow/InsightRow.tsx'
import RevealText from '../../components/RevealText/RevealText.tsx'
import { tmsCase } from '../../data/cases/tms.ts'
import type { Photo, SectionCopy } from '../../data/cases/tms.ts'
import { useCountUp, useHeroStage, useParallax, useReveal, useScrollReveal } from '../../motion/hooks.ts'
import { useToolsScene } from '../../motion/toolsScene.ts'
import '../../motion/motion.css'
import { EdgeCasesScene, Stop01Scene, Stop02Scene, Stop03Scene, Stop04Scene, Stop05Scene } from './StopScenes.tsx'
import './TmsCase.css'

const { hero, project, problem, research, result, nav } = tmsCase

const headingId = (copy: SectionCopy) => `${copy.id}-title`

/** Photo in a fixed-ratio frame that clips it (117:13235, 117:13257); slow parallax inside the frame. */
function CasePhoto({ photo }: { photo: Photo }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  useParallax(frameRef, imageRef, 0.1)
  return (
    <div ref={frameRef} className="case-photo" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
      <img
        ref={imageRef}
        className="case-photo__image"
        src={photo.src1x}
        srcSet={`${photo.src1x} 1x, ${photo.src2x} 2x`}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

/**
 * 02's scene (113:12853, motion note 124:15): blurred photo, the TMS window and five tool cards, all
 * real HTML, in a pinned scroll track. useToolsScene flies the cards into the window and fills its
 * rows. Without motion (reduced, no JS) the track collapses and the final state shows (motion.css).
 */
function ProblemScene({ trackRef }: { trackRef: RefObject<HTMLDivElement | null> }) {
  const { stage } = problem
  const pinRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  useToolsScene({ track: trackRef, pin: pinRef, canvas: canvasRef })
  const percent = (value: number, of: number) => `${(value / of) * 100}%`
  return (
    <div ref={trackRef} className="problem-track">
      <div ref={pinRef} className="problem-pin">
        <Stage size={stage.size} className="problem-stage" canvasRef={canvasRef} label={stage.ariaLabel}>
          <img
            className="problem-stage__bg"
            style={{ '--blur': stage.background.blur } as CSSProperties}
            src={stage.background.src}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div
            className="stage__item tms-window"
            data-window
            style={placeIn(stage.window.box, stage.size)}
          >
            <p className="tms-window__title">{stage.window.title}</p>
            <p className="tms-window__caption">{stage.window.caption}</p>
            <ul className="tms-window__rows" aria-hidden="true">
              {stage.tools.map((tool, index) => (
                <li key={tool.id} className="tms-row" data-row={index}>
                  <span className="tms-row__dot" />
                  <span className="tms-row__label">{tool.row.label}</span>
                  {tool.row.value && <span className="tms-row__value">{tool.row.value}</span>}
                </li>
              ))}
            </ul>
          </div>
          <ul className="problem-stage__tools" aria-hidden="true">
            {stage.tools.map((tool) => (
              <li
                key={tool.id}
                className="tool-card"
                data-card={tool.id}
                data-rotation={tool.rotation}
                style={
                  {
                    '--cx': percent(tool.cx, stage.size.width),
                    '--cy': percent(tool.cy, stage.size.height),
                    '--dx': `${tool.drop.x}%`,
                    '--dy': `${tool.drop.y}px`,
                    '--rot': `${tool.rotation}deg`,
                  } as CSSProperties
                }
              >
                {tool.label}
              </li>
            ))}
          </ul>
          <p className="problem-stage__label" data-scene-label aria-hidden="true">
            {stage.endLabel}
          </p>
        </Stage>
      </div>
    </div>
  )
}

/** TMS case study (Figma 113:12821). Static: no motion in this stage. */
export default function TmsCase() {
  const heroCanvasRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLImageElement>(null)
  const statsRef = useRef<HTMLUListElement>(null)
  const problemTrackRef = useRef<HTMLDivElement>(null)
  const insightsRef = useRef<HTMLOListElement>(null)
  const resultRef = useRef<HTMLParagraphElement>(null)

  useHeroStage(heroCanvasRef, dashboardRef, 0.85)
  useCountUp(statsRef, { after: problemTrackRef }) // only after the section 02 pin has released
  useReveal(insightsRef, { selector: '.insight-row', batchStagger: 200 })
  useScrollReveal(resultRef)

  // Tells the inline script in work/tms.html that motion is wired up (otherwise it drops .motion).
  useEffect(() => {
    document.documentElement.setAttribute('data-motion-ready', '')
  }, [])

  return (
    <div className="case on-light">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="case-header">
        <CaseNav back={nav.back} contact={nav.contact} number={`(${tmsCase.number})`} />
      </header>

      <main id="main">
        {/* Hero 113:12822 */}
        <section className="case-hero" aria-labelledby="case-title">
          <div className="case-hero__intro">
            <div className="case-hero__titles">
              <p className="case-hero__tagline">
                {hero.tagline.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && ' '}
                    <span className="case-hero__tagline-line">{line}</span>
                  </Fragment>
                ))}
              </p>
              {/* Each line rises inside its own mask (motion.css). Figma's lines from 760px, three
                  fitted lines below; screen readers get the title once. */}
              <h1 id="case-title" className="case-hero__title">
                <span className="sr-only">{hero.title.join(' ')}</span>
                {(
                  [
                    ['desktop', hero.title],
                    ['mobile', hero.titleMobile],
                  ] as const
                ).map(([variant, lines]) => (
                  <span key={variant} className={`case-hero__lines case-hero__lines--${variant}`} aria-hidden="true">
                    {lines.map((line, index) => (
                      <span key={line} className="case-hero__mask">
                        <span className="case-hero__line" style={{ '--line': index } as CSSProperties}>
                          {line}{' '}
                        </span>
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
            </div>
            <p className="case-hero__number" aria-hidden="true">
              ({tmsCase.number})
            </p>
          </div>
          <dl className="case-meta">
            {hero.meta.map((item) => (
              <div key={item.label} className="case-meta__item">
                <dt className="case-meta__label">{item.label}</dt>
                <dd className="case-meta__value">{item.value}</dd>
              </div>
            ))}
          </dl>
          <Stage size={hero.stage.size} className="stage--teal case-hero__stage" canvasRef={heroCanvasRef}>
            {hero.stage.shots.map((shot) => (
              <StageShot key={shot.src1x} ref={dashboardRef} shot={shot} size={hero.stage.size} eager />
            ))}
          </Stage>
        </section>

        {/* 01 The project 117:13219 */}
        <section id={project.copy.id} className="case-section" aria-labelledby={headingId(project.copy)}>
          <SectionHeader id={headingId(project.copy)} eyebrow={project.copy.eyebrow} heading={project.copy.heading} />
          <div className="case-media">
            <p className="case-media__text">{project.copy.body}</p>
            <CasePhoto photo={project.photo} />
          </div>
        </section>

        {/* 02 The problem 113:12848 */}
        <section id={problem.copy.id} className="case-section case-section--problem" aria-labelledby={headingId(problem.copy)}>
          <SectionHeader
            id={headingId(problem.copy)}
            eyebrow={problem.copy.eyebrow}
            heading={problem.copy.heading}
            body={problem.copy.body}
          />
          <ProblemScene trackRef={problemTrackRef} />
          <ul ref={statsRef} className="case-stats">
            {problem.stats.map((stat) => (
              <StatCard key={stat.source} stat={stat} />
            ))}
          </ul>
        </section>

        {/* 03 The research 113:12880 */}
        <section id={research.copy.id} className="case-section" aria-labelledby={headingId(research.copy)}>
          <SectionHeader id={headingId(research.copy)} eyebrow={research.copy.eyebrow} heading={research.copy.heading} />
          <div className="case-media">
            <CasePhoto photo={research.photo} />
            <p className="case-media__text">{research.copy.body}</p>
          </div>
          <ol ref={insightsRef} className="case-insights">
            {research.insights.map((item) => (
              <InsightRow key={item.label} item={item} />
            ))}
          </ol>
        </section>

        <Stop01Scene />
        <Stop02Scene />
        <Stop03Scene />
        <Stop04Scene />
        <Stop05Scene />
        <EdgeCasesScene />

        {/* The result 120:13690: the home About reveal, scroll-linked, no pin. */}
        <section id="result" className="case-result" aria-labelledby="result-title">
          <h2 id="result-title" className="case-result__label">
            {result.eyebrow}
          </h2>
          <RevealText ref={resultRef} className="case-result__text" text={result.text} />
        </section>
      </main>

      {/* Case nav 113:12982 */}
      <footer className="case-footer">
        <CaseLink link={nav.allWork} back />
      </footer>
    </div>
  )
}
