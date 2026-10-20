import '../../styles/tokens.css'
import '../../styles/base.css'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage, { StageShot } from '../../components/Stage/Stage.tsx'
import { socialtapCase } from '../../data/cases/socialtap.ts'
import type { SectionCopy, StageShot as Shot } from '../../data/cases/types.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'
import CasePage from '../shared/CasePage.tsx'
import CaseHero from '../shared/CaseHero.tsx'
import FlipGrid from '../shared/FlipGrid.tsx'
import CaseStatement from '../shared/CaseStatement.tsx'
import { MobileGroup, MobileShot, SceneStop } from '../shared/SceneStop.tsx'
import { noteOnly } from '../shared/stageGeometry.ts'
import './SocialTapCase.css'

const { hero, project, part, worked, stops, result, nav } = socialtapCase

const headingId = (copy: SectionCopy) => `${copy.id}-title`

/**
 * Static stage 3: no layer motion yet. Each stage's notes show once its centre reaches the viewport
 * centre (trigger "centre"); the per-stage scenes come in stage 4.
 */
const notesOnly: SceneSpec = { layers: {}, notesAt: [0, 0] }

/** A screenshot on its stage or in its own full-width mini stage below 760. */
const piece = (shot: Shot, size: { width: number; height: number }) => <StageShot shot={shot} size={size} />

/** SocialTap case study (Figma 177:279; mobile 187:81): the shared case layout, no pinned scenes. */
export default function SocialTapCase() {
  const { tile } = worked
  return (
    <CasePage nav={nav} number={socialtapCase.number}>
      {/* Hero 177:280 */}
      <CaseHero hero={hero} number={socialtapCase.number} stageClassName="stage--plum" />

      {/* 01 The project 177:306: text and the campaign screen side by side; below 760 the text comes first. */}
      <section id={project.copy.id} className="case-section" aria-labelledby={headingId(project.copy)}>
        <SectionHeader id={headingId(project.copy)} eyebrow={project.copy.eyebrow} heading={project.copy.heading} />
        <div className="case-media case-media--text-first">
          <p className="case-media__text">{project.copy.body}</p>
          <Stage size={{ width: project.shot.box.width, height: project.shot.box.height }} className="stage--bare">
            <StageShot shot={project.shot} size={{ width: project.shot.box.width, height: project.shot.box.height }} />
          </Stage>
        </div>
      </section>

      {/* What was my part 181:13921: the per-character reveal, as the home About. */}
      <CaseStatement id="part" statement={part} />

      {/* 03 How I worked 177:347: header row, then flip cards and the dark screenshot tile. */}
      <section id={worked.copy.id} className="case-section case-section--flip" aria-labelledby={headingId(worked.copy)}>
        <SectionHeader
          id={headingId(worked.copy)}
          eyebrow={worked.copy.eyebrow}
          heading={worked.copy.heading}
          body={worked.copy.body}
        />
        <FlipGrid
          items={worked.cards}
          media={
            <div className="flip-tile">
              <Stage size={tile.size} className="stage--bare">
                <StageShot shot={tile.shot} size={tile.size} />
              </Stage>
            </div>
          }
        />
      </section>

      {/* Stops 01–06 (177:364 … 177:440): 1432 × 880 stages, no pin. */}
      {stops.map(({ copy, scene, stage }) => {
        const [first, second] = stage.shots
        const notes = stage.notes ?? []
        return (
          <SceneStop
            key={copy.id}
            trigger="centre"
            copy={copy}
            scene={scene}
            spec={notesOnly}
            size={stage.size}
            notes={notes}
            mobile={
              second ? (
                <>
                  <MobileGroup spec={noteOnly} duration={500} notes={[notes[0]]}>
                    <MobileShot shot={first}>{piece}</MobileShot>
                  </MobileGroup>
                  <MobileGroup spec={noteOnly} duration={500} notes={[notes[1]]}>
                    <MobileShot shot={second}>{piece}</MobileShot>
                  </MobileGroup>
                </>
              ) : (
                // One screen (04, 05; 187:342): a note above it, a note below.
                <MobileGroup spec={noteOnly} duration={500} notesBefore={[notes[0]]} notes={[notes[1]]}>
                  <MobileShot shot={first}>{piece}</MobileShot>
                </MobileGroup>
              )
            }
          >
            {stage.shots.map((shot) => (
              <StageShot key={shot.src1x} shot={shot} size={stage.size} />
            ))}
          </SceneStop>
        )
      })}

      {/* The result 177:453 */}
      <CaseStatement id="result" statement={result} />
    </CasePage>
  )
}
