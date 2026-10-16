/**
 * All Works content. Adding a project, its visuals or its case-study link
 * is a change to this file only.
 */
import { work01Layout } from './figma-layout.generated.ts'
import work01a1x from '../assets/work-01-a@1x.webp'
import work01a2x from '../assets/work-01-a@2x.webp'
import work01b1x from '../assets/work-01-b@1x.webp'
import work01b2x from '../assets/work-01-b@2x.webp'

/** One image placed on the visual stage, in Figma px of the 756×982 Works panel (37:31). */
export interface ProjectImage {
  src1x: string
  src2x: string
  alt: string
  x: number
  y: number
  width: number
  height: number
}

export interface Project {
  id: string
  /** Display number, e.g. "01". */
  number: string
  title: string
  /** Missing until visuals are exported; the panel shows the neutral placeholder. */
  images?: ProjectImage[]
  /** Missing until the case study exists; the CTA then shows on hover but isn't a link. */
  caseStudyUrl?: string
}

const place = ({ x, y, width, height }: (typeof work01Layout.phones)[number]) => ({ x, y, width, height })
const [phoneA, phoneB] = work01Layout.phones.map(place)

export const projects: Project[] = [
  {
    id: 'project-01',
    number: '01',
    title: 'What to Eat - menu subscription web app',
    images: [
      { src1x: work01a1x, src2x: work01a2x, alt: 'Weekly menu screen of the What to Eat app', ...phoneA },
      { src1x: work01b1x, src2x: work01b2x, alt: 'Shopping list screen of the What to Eat app', ...phoneB },
    ],
  },
  {
    id: 'project-02',
    number: '02',
    title: 'SocialTap - AI SaaS marketplace',
  },
  {
    id: 'project-03',
    number: '03',
    title: 'TMS - logistics platform (concept)',
  },
]
