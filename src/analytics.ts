import { inject, track } from '@vercel/analytics'

/**
 * Vercel Web Analytics: cookieless page views plus a few custom events. Events carry only the
 * fixed values below — never an address, a link's href or anything typed by the visitor.
 */

/** Loads the analytics script (deferred, after hydration, so it never blocks the first paint). */
export function injectAnalytics() {
  inject({ mode: import.meta.env.DEV ? 'development' : 'production', framework: 'vite' })
}

export type ContactChannel = 'email' | 'linkedin' | 'telegram' | 'behance'

/** A case study opened from the home Works section; project = the URL's slug (tms, socialtap). */
export const trackCaseOpen = (caseStudyUrl: string) =>
  track('case_open', { project: caseStudyUrl.split('/').pop() ?? caseStudyUrl })

/** A contact link clicked: the channel only. */
export const trackContactClick = (channel: ContactChannel) => track('contact_click', { channel })

/** "Back to all work" on a case page: the top nav's Back or the footer link. */
export const trackBackToWork = (position: 'nav' | 'footer') => track('back_to_work', { position })
