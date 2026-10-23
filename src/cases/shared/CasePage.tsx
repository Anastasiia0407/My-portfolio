import { useEffect } from 'react'
import type { ReactNode } from 'react'
import '../../styles/tokens.css'
import '../../styles/base.css'
import CaseNav, { CaseLink } from '../../components/CaseNav/CaseNav.tsx'
import { trackBackToWork } from '../../analytics.ts'
import type { CaseNavData } from '../../data/cases/types.ts'
import '../../motion/motion.css'
import './case.css'

/**
 * Case-study page shell: skip link, the case nav (113:12823), `main` with the sections, and the
 * footer link back to all work (113:12982). Tells the inline script in work/<slug>.html that motion
 * is wired up (otherwise it drops .motion).
 */
export default function CasePage({ nav, number, children }: { nav: CaseNavData; number: string; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-motion-ready', '')
  }, [])

  return (
    <div className="case on-light">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="case-header">
        <CaseNav back={nav.back} contact={nav.contact} number={`(${number})`} />
      </header>

      <main id="main">{children}</main>

      {/* Case nav 113:12982 */}
      <footer className="case-footer">
        <CaseLink link={nav.allWork} back onClick={() => trackBackToWork('footer')} />
      </footer>
    </div>
  )
}
