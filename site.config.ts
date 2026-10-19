/**
 * The site's public origin, no trailing slash. The only place it is set: Vite replaces %SITE_URL% in
 * index.html and work/*.html with it (vite.config.ts), for canonical, og:url and the absolute
 * og:image URL that social previews require.
 *
 * TODO(site-url): replace with the Vercel URL after the first deploy, later with the own domain.
 * `.invalid` is a reserved TLD, so the placeholder can never resolve by accident.
 */
export const SITE_URL = 'https://site-url-todo.invalid'
