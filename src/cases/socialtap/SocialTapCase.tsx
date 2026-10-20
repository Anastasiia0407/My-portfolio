import { useRef } from 'react'
import type { CSSProperties } from 'react'
import '../../styles/tokens.css'
import '../../styles/base.css'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage, { StageShot } from '../../components/Stage/Stage.tsx'
import { socialtapCase } from '../../data/cases/socialtap.ts'
import type { SectionCopy, StageShot as Shot } from '../../data/cases/types.ts'
import { useReveal } from '../../motion/hooks.ts'
import CasePage from '../shared/CasePage.tsx'
import CaseHero from '../shared/CaseHero.tsx'
import FlipGrid from '../shared/FlipGrid.tsx'
import CaseStatement from '../shared/CaseStatement.tsx'
import { MobileGroup, MobileShot, SceneStop } from '../shared/SceneStop.tsx'
import {
  drawer,
  MOBILE_DURATION,
  mobileBack,
  mobileFront,
  mobileSingle,
  mobileSingleScreen,
  mobileTwoScreens,
  ONE_SCREEN_LENGTH,
  singleScreen,
  STAGE_DURATION,
  tile as tileScene,
  TILE_DURATION,
  TWO_SCREENS_LENGTH,
  twoScreens,
} from './scenes.ts'
import './SocialTapCase.css'

const { hero, project, part, worked, stops, result, nav } = socialtapCase

const headingId = (copy: SectionCopy) => `${copy.id}-title`

/** A screenshot as a scene layer, on its stage or in its own full-width mini stage below 760. */
const piece = (layer: string) => (shot: Shot, size: { width: number; height: number }) => <StageShot shot={shot} size={size} layer={layer} />

/** 03's stage is the drawer; 04 and 05 have one screen; the rest a back and a front screen. */
const sceneOf = (id: string, shots: number) => (id === 'profile-drawer' ? drawer : shots === 1 ? singleScreen : twoScreens)

/**
 * SocialTap case study (Figma 177:279; mobile 187:81): the shared case layout, no pinned scenes. Motion
 * (177:541): hero title rise and meta fade, dashboard drift (CaseHero); section headers fade up
 * (SectionHeader); per-character reveals (CaseStatement); flip cards (FlipGrid); and the scenes in
 * scenes.ts, each pinned and driven by scroll.
 */
export default function SocialTapCase() {
  const { tile } = worked
  const projectMediaRef = useRef<HTMLDivElement>(null)
  // Project (177:550): the campaign screen slides up 40 and fades in as the row enters.
  useReveal(projectMediaRef)
  return (
    <CasePage nav={nav} number={socialtapCase.number}>
      {/* Hero 177:280 */}
      <CaseHero hero={hero} number={socialtapCase.number} stageClassName="stage--plum" />

      {/* 01 The project 177:306: text and the campaign screen side by side; below 760 the text comes first. */}
      <section id={project.copy.id} className="case-section" aria-labelledby={headingId(project.copy)}>
        <SectionHeader id={headingId(project.copy)} eyebrow={project.copy.eyebrow} heading={project.copy.heading} />
        <div ref={projectMediaRef} className="case-media case-media--text-first" data-enter>
          <p className="case-media__text">{project.copy.body}</p>
          <div data-reveal style={{ '--reveal-distance': '40px' } as CSSProperties}>
            <Stage size={{ width: project.shot.box.width, height: project.shot.box.height }} className="stage--bare">
              <StageShot shot={project.shot} size={{ width: project.shot.box.width, height: project.shot.box.height }} />
            </Stage>
          </div>
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
          pin={{ length: TWO_SCREENS_LENGTH, mediaScene: tileScene, mediaDuration: TILE_DURATION }}
          media={
            <div className="flip-tile">
              <Stage size={tile.size} className="stage--bare">
                <StageShot shot={tile.shot} size={tile.size} layer="tile" />
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
            copy={copy}
            scene={{ ...scene, length: second ? TWO_SCREENS_LENGTH : ONE_SCREEN_LENGTH }}
            spec={sceneOf(copy.id, stage.shots.length)}
            mobileSpec={second ? mobileTwoScreens : mobileSingleScreen}
            size={stage.size}
            notes={notes}
            mobile={
              second ? (
                <>
                  <MobileGroup trigger="centre" spec={mobileBack} duration={MOBILE_DURATION} notes={[notes[0]]}>
                    <MobileShot shot={first}>{piece('back')}</MobileShot>
                  </MobileGroup>
                  <MobileGroup trigger="centre" spec={mobileFront} duration={MOBILE_DURATION} notes={[notes[1]]}>
                    <MobileShot shot={second}>{piece('front')}</MobileShot>
                  </MobileGroup>
                </>
              ) : (
                // One screen (04, 05; 187:342): a note above it, a note below.
                <MobileGroup
                  trigger="centre"
                  spec={mobileSingle}
                  duration={STAGE_DURATION}
                  notesBefore={[notes[0]]}
                  notes={[notes[1]]}
                >
                  <MobileShot shot={first}>{piece('back')}</MobileShot>
                </MobileGroup>
              )
            }
          >
            {stage.shots.map((shot, i) => (
              <StageShot key={shot.src1x} shot={shot} size={stage.size} layer={i === 0 ? 'back' : 'front'} />
            ))}
          </SceneStop>
        )
      })}

      {/* The result 177:453 */}
      <CaseStatement id="result" statement={result} />
    </CasePage>
  )
}
