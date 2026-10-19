/**
 * The site's public origin, no trailing slash. Vite replaces %SITE_URL% in index.html and
 * work/*.html with it (vite.config.ts), for canonical, og:url and the absolute og:image URL that
 * social previews require. public/robots.txt and public/sitemap.xml are static: update them too
 * when this changes (e.g. to an own domain).
 */
export const SITE_URL = 'https://my-portfolio-two-tawny-2uvzh79ird.vercel.app'
