import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import '../../styles/tokens.css'
import '../../styles/base.css'
import CaseNav, { CaseLink } from '../../components/CaseNav/CaseNav.tsx'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage, { StageShot } from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import StatCard from '../../components/StatCard/StatCard.tsx'
import InsightRow from '../../components/InsightRow/InsightRow.tsx'
import HandoffFlow from '../../components/HandoffFlow/HandoffFlow.tsx'
import RevealText from '../../components/RevealText/RevealText.tsx'
import { tmsCase } from '../../data/cases/tms.ts'
import type { Photo, SectionCopy, StageData } from '../../data/cases/tms.ts'
import { useCountUp, useHeroStage, useParallax, useReveal, useScrollReveal } from '../../motion/hooks.ts'
import '../../motion/motion.css'
import './TmsCase.css'

const { hero, project, problem, research, stops, edgeCases, result, nav } = tmsCase

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

/** Header row + stage: the five "stops" and "No dead ends" share this layout. */
function StopSection({ copy, stage, compact }: { copy: SectionCopy; stage: StageData; compact?: boolean }) {
  return (
    <section id={copy.id} className={`case-section${compact ? ' case-section--compact' : ''}`} aria-labelledby={headingId(copy)}>
      <SectionHeader id={headingId(copy)} eyebrow={copy.eyebrow} heading={copy.heading} body={copy.body} />
      <Stage size={stage.size} className="stage--panel case-section__stage" notes={stage.notes}>
        {stage.shots.map((shot) => (
          <StageShot key={shot.src1x + shot.box.x} shot={shot} size={stage.size} />
        ))}
      </Stage>
    </section>
  )
}

/** 02's stage (113:12853): blurred photo, the TMS window and five tool cards, all real HTML. */
function ProblemStage() {
  const { stage } = problem
  return (
    <Stage size={stage.size} className="case-section__stage problem-stage">
      <img
        className="problem-stage__bg"
        style={{ '--blur': stage.background.blur } as CSSProperties}
        src={stage.background.src}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div className="stage__item tms-window" style={placeIn(stage.window.box, stage.size)}>
        <p className="tms-window__title">{stage.window.title}</p>
        <p className="tms-window__caption">{stage.window.caption}</p>
      </div>
      <ul className="problem-stage__tools" aria-label="Tools a shipment passes through today">
        {stage.tools.map((tool) => (
          <li
            key={tool.id}
            className="tool-card"
            data-tool={tool.id}
            data-tone={tool.tone}
            style={
              {
                '--cx': `${(tool.cx / stage.size.width) * 100}%`,
                '--cy': `${(tool.cy / stage.size.height) * 100}%`,
                '--rot': `${tool.rotation}deg`,
              } as CSSProperties
            }
          >
            {tool.label}
          </li>
        ))}
      </ul>
    </Stage>
  )
}

/** TMS case study (Figma 113:12821). Static: no motion in this stage. */
export default function TmsCase() {
  const { handoff } = stops
  const heroCanvasRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLImageElement>(null)
  const statsRef = useRef<HTMLUListElement>(null)
  const insightsRef = useRef<HTMLOListElement>(null)
  const resultRef = useRef<HTMLParagraphElement>(null)

  useHeroStage(heroCanvasRef, dashboardRef, 0.85)
  useCountUp(statsRef)
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
        <CaseNav back={nav.back} contact={nav.contact} />
      </header>

      <main id="main">
        {/* Hero 113:12822 */}
        <section className="case-hero" aria-labelledby="case-title">
          <div className="case-hero__intro">
            <div className="case-hero__titles">
              <p className="case-hero__tagline">
                {hero.tagline.map((line) => (
                  <span key={line} className="case-hero__tagline-line">
                    {line}{' '}
                  </span>
                ))}
              </p>
              {/* Each line rises inside its own mask (motion.css); below 760px all at once. */}
              <h1 id="case-title" className="case-hero__title">
                {hero.title.map((line, index) => (
                  <span key={line} className="case-hero__mask">
                    <span className="case-hero__line" style={{ '--line': index } as CSSProperties}>
                      {line}{' '}
                    </span>
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
        <section id={problem.copy.id} className="case-section" aria-labelledby={headingId(problem.copy)}>
          <SectionHeader
            id={headingId(problem.copy)}
            eyebrow={problem.copy.eyebrow}
            heading={problem.copy.heading}
            body={problem.copy.body}
          />
          <ProblemStage />
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

        <StopSection copy={stops.sales.copy} stage={stops.sales.stage} />

        {/* Stop 02 120:13379: the hand-off flow sits on the stage, above the screenshot. */}
        <section id={handoff.copy.id} className="case-section case-section--compact" aria-labelledby={headingId(handoff.copy)}>
          <SectionHeader
            id={headingId(handoff.copy)}
            eyebrow={handoff.copy.eyebrow}
            heading={handoff.copy.heading}
            body={handoff.copy.body}
          />
          <Stage
            size={handoff.stage.size}
            className="stage--panel case-section__stage"
            notes={handoff.stage.notes}
            overlay={
              <div className="stage__overlay" style={placeIn(handoff.flow.box, handoff.stage.size)}>
                <HandoffFlow steps={handoff.flow.steps} />
              </div>
            }
          >
            {handoff.stage.shots.map((shot) => (
              <StageShot key={shot.src1x} shot={shot} size={handoff.stage.size} />
            ))}
          </Stage>
        </section>

        <StopSection copy={stops.tasks.copy} stage={stops.tasks.stage} />
        <StopSection copy={stops.shipment.copy} stage={stops.shipment.stage} />
        <StopSection copy={stops.overview.copy} stage={stops.overview.stage} />
        <StopSection copy={edgeCases.copy} stage={edgeCases.stage} />

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
