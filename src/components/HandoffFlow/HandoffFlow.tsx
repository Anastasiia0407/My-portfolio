import { Fragment } from 'react'
import './HandoffFlow.css'

export interface HandoffStep {
  title: string
  text: string
  tone: 'light' | 'dark'
}

/** 120:13391: three steps with pink arrows between them; the TMS step is dark. */
export default function HandoffFlow({ steps }: { steps: HandoffStep[] }) {
  return (
    <ol className="handoff">
      {steps.map((step, index) => (
        <Fragment key={step.title}>
          {index > 0 && (
            <li className="handoff__arrow" role="presentation" aria-hidden="true">
              →
            </li>
          )}
          <li className="handoff__step" data-tone={step.tone}>
            <span className="handoff__title">{step.title}</span>
            <span className="handoff__text">{step.text}</span>
          </li>
        </Fragment>
      ))}
    </ol>
  )
}
