import { useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'
import '../../styles/tokens.css'
import '../../styles/base.css'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import StatCard from '../../components/StatCard/StatCard.tsx'
import { tmsCase } from '../../data/cases/tms.ts'
import type { SectionCopy } from '../../data/cases/types.ts'
import { useCountUp } from '../../motion/hooks.ts'
import { useToolsScene } from '../../motion/toolsScene.ts'
import CasePage from '../shared/CasePage.tsx'
import CaseHero from '../shared/CaseHero.tsx'
import CasePhoto from '../shared/CasePhoto.tsx'
import FlipGrid from '../shared/FlipGrid.tsx'
import CaseStatement from '../shared/CaseStatement.tsx'
import { EdgeCasesScene, Stop01Scene, Stop02Scene, Stop03Scene, Stop04Scene, Stop05Scene } from './StopScenes.tsx'
import './TmsCase.css'

const { hero, project, problem, research, result, nav } = tmsCase

const headingId = (copy: SectionCopy) => `${copy.id}-title`

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
                    '--rot': `${tool.rotation}deg`,
                  } as CSSProperties
                }
              >
                {tool.label}
              </li>
            ))}
          </ul>
          <p className="problem-stage__label" data-scene-label aria-hidden="true">
            <span className="margin-note__dot" />
            {stage.endLabel}
          </p>
        </Stage>
      </div>
    </div>
  )
}

/** TMS case study (Figma 113:12821): the shared case layout plus the 02 tools scene and stats. */
export default function TmsCase() {
  const statsRef = useRef<HTMLUListElement>(null)
  const problemTrackRef = useRef<HTMLDivElement>(null)

  useCountUp(statsRef, { after: problemTrackRef }) // only after the section 02 pin has released

  return (
    <CasePage nav={nav} number={tmsCase.number}>
      {/* Hero 113:12822 */}
      <CaseHero hero={hero} number={tmsCase.number} stageClassName="stage--teal" />

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

      {/* 03 The research 113:12880: header row, then flip cards and the photo in a 2 × 2 grid */}
      <section
        id={research.copy.id}
        className="case-section case-section--flip case-section--research"
        aria-labelledby={headingId(research.copy)}
      >
        <SectionHeader
          id={headingId(research.copy)}
          eyebrow={research.copy.eyebrow}
          heading={research.copy.heading}
          body={research.copy.body}
        />
        <FlipGrid
          items={research.insights}
          media={<CasePhoto photo={research.photo} zoom={1.08} />}
          mobileMediaAt={2}
          pin={{ length: 1 }}
        />
      </section>

      <Stop01Scene />
      <Stop02Scene />
      <Stop03Scene />
      <Stop04Scene />
      <Stop05Scene />
      <EdgeCasesScene />

      {/* The result 120:13690: the home About reveal, scroll-linked, no pin. */}
      <CaseStatement id="result" statement={result} />
    </CasePage>
  )
}
