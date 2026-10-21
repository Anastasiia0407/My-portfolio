import { contactLinks, owner } from './src/data/site.ts'

/**
 * The site's public origin, no trailing slash. Vite replaces %SITE_URL% in index.html and
 * work/*.html with it (vite.config.ts), for canonical, og:url and the absolute og:image URL that
 * social previews require. public/robots.txt and public/sitemap.xml are static: update them too
 * when this changes (e.g. to an own domain).
 */
export const SITE_URL = 'https://anastasiia-cheban.com.ua'

/** The social preview image (public/og-image.jpg, Figma 146:2), as an absolute URL. */
export const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`

/**
 * schema.org structured data for the home page (Person + WebSite), rendered into its <head> as
 * JSON-LD by vite.config.ts. The email and the contact profiles come from src/data/site.ts (the
 * footer links); Behance is listed here only, as it has no footer link.
 */
export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: owner.name,
      jobTitle: 'UX/UI & Product Designer',
      url: SITE_URL,
      image: OG_IMAGE_URL,
      email: contactLinks.email.href.replace(/^mailto:/, ''),
      address: { '@type': 'PostalAddress', addressLocality: 'Lisbon', addressCountry: 'PT' },
      sameAs: [contactLinks.linkedin.href, 'https://www.behance.net/anastascheban3', contactLinks.telegram.href],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Anastasiia Cheban — Portfolio',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#person` },
    },
  ],
}
