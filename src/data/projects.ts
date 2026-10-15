/**
 * All Works content. Adding a project, its visuals or its case-study link
 * is a change to this file only.
 */

export interface ProjectVisual {
  /** Optimised image URLs (imported from src/assets). */
  avif?: string
  webp: string
  /** Intrinsic size of the 1x image, used for aspect ratio and to prevent layout shift. */
  width: number
  height: number
  alt: string
}

export interface Project {
  id: string
  /** Display number, e.g. "01". */
  number: string
  title: string
  /** Missing until visuals are exported; the panel shows a placeholder. */
  visual?: ProjectVisual
  /** Missing until the case study exists; the CTA then shows on hover but isn't a link. */
  caseStudyUrl?: string
}

export const projects: Project[] = [
  {
    id: 'project-01',
    number: '01',
    title: 'Web App Menu-Subscription What to Eat',
    // visual: added in the asset-prep stage (Figma node 39:110)
  },
  {
    id: 'project-02',
    number: '02',
    title: 'AI SaaS platform SocialTap',
  },
  {
    id: 'project-03',
    number: '03',
    title: 'TMS platform for a logistics company',
  },
]
