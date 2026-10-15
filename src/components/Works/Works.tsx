import { projects } from '../../data/projects.ts'
import './Works.css'

// Stub: the pinned scroll, panel, counter and hover CTA are built in the Works stages.
export default function Works() {
  return (
    <section id="works" className="works on-light" aria-labelledby="works-title">
      <p className="works__eyebrow">real problems, useful products</p>
      <h2 id="works-title" className="works__title">
        selected works
      </h2>
      <ol className="works__list">
        {projects.map((project) => (
          <li key={project.id}>
            ({project.number}) {project.title}
          </li>
        ))}
      </ol>
    </section>
  )
}
