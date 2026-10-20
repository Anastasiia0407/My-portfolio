import { Fragment, useRef } from 'react'
import type { CSSProperties } from 'react'
import Stage, { StageShot } from '../../components/Stage/Stage.tsx'
import type { CaseHeroData } from '../../data/cases/types.ts'
import { useHeroStage } from '../../motion/hooks.ts'

/**
 * Case hero (TMS 113:12822): tagline, the h1 in Figma's lines from 760px and fitted lines below (each
 * line rises in its own mask, motion.css), the case number, the meta row and the stage with its
 * screenshot (0.96 → 1 and a drift at 0.85× page speed, useHeroStage). `stageClassName` sets the
 * stage background, e.g. "stage--teal".
 */
export default function CaseHero({ hero, number, stageClassName }: { hero: CaseHeroData; number: string; stageClassName: string }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  useHeroStage(canvasRef, imageRef, 0.85)
  return (
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
          ({number})
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
      <Stage size={hero.stage.size} className={`${stageClassName} case-hero__stage`} canvasRef={canvasRef}>
        {hero.stage.shots.map((shot) => (
          <StageShot key={shot.src1x} ref={imageRef} shot={shot} size={hero.stage.size} eager />
        ))}
      </Stage>
    </section>
  )
}
