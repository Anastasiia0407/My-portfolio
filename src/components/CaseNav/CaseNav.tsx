import type { ReactNode } from 'react'
import './CaseNav.css'

interface Link {
  label: string
  href: string
}

/** Uppercase text link of the case pages (113:12824 / 113:12826 / 113:12983): same hover, focus and touch rules as the home nav. */
export function CaseLink({
  link,
  back,
  srSuffix,
  className,
}: {
  link: Link
  back?: boolean
  srSuffix?: ReactNode
  className?: string
}) {
  return (
    <a className={`case-link touch-target${className ? ` ${className}` : ''}`} href={link.href}>
      {back && <span aria-hidden="true">← </span>}
      {link.label}
      {srSuffix && <span className="sr-only">{srSuffix}</span>}
    </a>
  )
}

/**
 * Top bar of a case page (113:12823): back to the home Works section, and Get in touch. Below 760
 * the case number takes Get in touch's place (plain text in the link style; the Hero hides its own).
 */
export default function CaseNav({ back, contact, number }: { back: Link; contact: Link; number: string }) {
  return (
    <nav className="case-nav" aria-label="Case study">
      <CaseLink link={back} back srSuffix=" to all work" />
      <CaseLink link={contact} className="case-nav__contact" />
      <span className="case-link case-nav__number" aria-hidden="true">
        {number}
      </span>
    </nav>
  )
}
