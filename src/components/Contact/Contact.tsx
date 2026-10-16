import { contactLinks, owner } from '../../data/site.ts'
import type { ContactLink } from '../../data/site.ts'
import getInTouch from '../../assets/get-in-touch.svg'
import './Contact.css'

function FooterLink({ link }: { link: ContactLink }) {
  return (
    <a
      className="contact__link touch-target"
      href={link.href}
      {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {link.label}
    </a>
  )
}

export default function Contact() {
  return (
    <footer id="contact" className="contact" aria-labelledby="contact-title">
      {/* 61:192 — vector headline; the text equivalent is the h2's sr-only label. */}
      <h2 id="contact-title" className="contact__heading">
        <span className="sr-only">Get in touch</span>
        <img className="contact__heading-art" src={getInTouch} alt="" width={1432} height={139} aria-hidden="true" />
      </h2>
      <div className="contact__row">
        <p className="contact__copyright">© {owner.name}</p>
        <FooterLink link={contactLinks.email} />
        <FooterLink link={contactLinks.telegram} />
        <FooterLink link={contactLinks.linkedin} />
      </div>
    </footer>
  )
}
