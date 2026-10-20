/**
 * All Works content. Adding a project, its visuals or its case-study link
 * is a change to this file only.
 */
import { work01Phones, work02Layout, work03Layout } from './figma-layout.generated.ts'
import work01a1x from '../assets/work-01-a@1x.webp'
import work01a2x from '../assets/work-01-a@2x.webp'
import work01b1x from '../assets/work-01-b@1x.webp'
import work01b2x from '../assets/work-01-b@2x.webp'
import work02a1x from '../assets/work-02-a@1x.webp'
import work02a2x from '../assets/work-02-a@2x.webp'
import work02b1x from '../assets/work-02-b@1x.webp'
import work02b2x from '../assets/work-02-b@2x.webp'
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

/**
 * Rounded frame drawn OUTSIDE the image box (Figma outside stroke), in Figma px of each stage.
 * - `solid`: a flat ring (project 03, 75:45).
 * - `glass`: a 12% pink tint over a blurred copy of the image's own edge (project 02, 89:8413/8415).
 */
export interface Frame {
  kind: 'solid' | 'glass'
  desktop: { stroke: number; radius: number }
  mobile: { stroke: number; radius: number }
}

export interface ProjectImage {
  src1x: string
  src2x: string
  alt: string
  /** The unrotated image box. */
  placement: Placement
  /** Degrees, about the box centre (clockwise positive, like CSS). */
  rotation?: number
  frame?: Frame
}

export interface Project {
  id: string
  /** Display number, e.g. "01". */
  number: string
  title: string
  /** Desktop "(0X)" counter corner: top-right (default) or bottom-right (73:890). */
  counter?: 'top' | 'bottom'
  /** Teal gradient band behind the visuals (75:44 / 75:53), built in CSS. */
  band?: Placement
  /** In paint order: later images sit above earlier ones. */
  images: ProjectImage[]
  /** Missing until the case study exists; then nothing links to it. */
  caseStudyUrl?: string
}

const [phoneA, phoneB] = work01Phones

const glassFrame: Frame = {
  kind: 'glass',
  desktop: { stroke: 12, radius: 10.547 },
  mobile: { stroke: 12, radius: 10.547 },
}

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
    images: [
      {
        src1x: work02a1x,
        src2x: work02a2x,
        alt: 'Campaign discovery screen of the SocialTap marketplace',
        placement: work02Layout.a,
        frame: glassFrame,
      },
      {
        src1x: work02b1x,
        src2x: work02b2x,
        alt: 'Creator discovery screen of the SocialTap marketplace',
        placement: work02Layout.b,
        rotation: work02Layout.b.rotationDeg,
        frame: glassFrame,
      },
    ],
    caseStudyUrl: '/work/socialtap',
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
        frame: { kind: 'solid', desktop: { stroke: 19.2, radius: 36 }, mobile: { stroke: 9.6, radius: 18 } },
      },
    ],
    caseStudyUrl: '/work/tms',
  },
]
