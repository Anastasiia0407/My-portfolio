/**
 * All Works content. Adding a project, its visuals or its case-study link
 * is a change to this file only.
 */
import { work01Phones, work03Layout } from './figma-layout.generated.ts'
import work01a1x from '../assets/work-01-a@1x.webp'
import work01a2x from '../assets/work-01-a@2x.webp'
import work01b1x from '../assets/work-01-b@1x.webp'
import work01b2x from '../assets/work-01-b@2x.webp'
import work031x from '../assets/work-03@1x.webp'
import work032x from '../assets/work-03@2x.webp'

/** A box in Figma px. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Where something sits on a project's visual stage: `desktop` in the 756×982 Works panel (37:31),
 * `mobile` in the 361×490 card (66:294). Boxes may extend past the stage; the stage clips them.
 */
export interface Placement {
  desktop: Rect
  mobile: Rect
}

export interface ProjectImage {
  src1x: string
  src2x: string
  alt: string
  placement: Placement
  /** Screenshot in a rounded, translucent-bordered frame (project 03's dashboard, 75:45). */
  framed?: boolean
}

export interface Project {
  id: string
  /** Display number, e.g. "01". */
  number: string
  title: string
  /** Desktop "(0X)" counter corner. Default top-right; 03 sits bottom-right (73:890). */
  counter?: 'top' | 'bottom'
  /** Teal gradient band behind the visuals (75:44 / 75:53), built in CSS. */
  band?: Placement
  /** Missing until visuals are exported; the stage shows the neutral placeholder. */
  images?: ProjectImage[]
  /** Missing until the case study exists; then nothing links to it. */
  caseStudyUrl?: string
}

const [phoneA, phoneB] = work01Phones

export const projects: Project[] = [
  {
    id: 'project-01',
    number: '01',
    title: 'What to Eat - menu subscription web app',
    images: [
      { src1x: work01a1x, src2x: work01a2x, alt: 'Weekly menu screen of the What to Eat app', placement: phoneA },
      { src1x: work01b1x, src2x: work01b2x, alt: 'Shopping list screen of the What to Eat app', placement: phoneB },
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
    counter: 'bottom',
    band: work03Layout.band,
    images: [
      {
        src1x: work031x,
        src2x: work032x,
        alt: 'Dashboard of the TMS logistics platform: shipment counts, shipment status chart and tasks',
        placement: work03Layout.image,
        framed: true,
      },
    ],
  },
]
