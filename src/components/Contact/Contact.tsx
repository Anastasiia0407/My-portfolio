import { contactLinks, owner } from '../../data/site.ts'
import type { ContactLink } from '../../data/site.ts'
import './Contact.css'

function FooterLink({ link }: { link: ContactLink }) {
  return (
    <a
      className="contact__link"
      href={link.href}
      {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {link.label}
    </a>
  )
}

// Stub: the "GET IN TOUCH" vector heading is added in the Contact stage.
export default function Contact() {
  return (
    <footer id="contact" className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="contact__heading">
        get in touch
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
