import { Fragment } from 'react'
import './HandoffFlow.css'

interface HandoffStep {
  title: string
  text: string
  tone: 'light' | 'dark'
}

/**
 * 120:13391: three steps with pink arrows between them; the TMS step is dark. Each step carries an
 * aria-hidden dark copy (`flow-dark` layer) so a scene can move the dark fill from card to card with
 * opacity only; arrows are `flow-arrow` layers.
 */
export default function HandoffFlow({ steps }: { steps: HandoffStep[] }) {
  return (
    <ol className="handoff">
      {steps.map((step, index) => (
        <Fragment key={step.title}>
          {index > 0 && (
            <li className="handoff__arrow" role="presentation" aria-hidden="true" data-layer="flow-arrow">
              →
            </li>
          )}
          <li className="handoff__step" data-tone={step.tone}>
            <span className="handoff__title">{step.title}</span>
            <span className="handoff__text">{step.text}</span>
            <span className="handoff__dark" aria-hidden="true" data-layer="flow-dark">
              <span className="handoff__title">{step.title}</span>
              <span className="handoff__text">{step.text}</span>
            </span>
          </li>
        </Fragment>
      ))}
    </ol>
  )
}
