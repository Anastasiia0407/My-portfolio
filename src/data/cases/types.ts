/**
 * Shared shapes of case-study content (src/data/cases/<slug>.ts). The page components only lay this
 * out. Stage geometry is in Figma px of each stage (unrotated boxes); the Stage component turns it into %.
 */

/** A box in Figma px. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

/** Framed screenshot on a stage: rounded image (fixed radius, --radius-shot) with Figma's OUTSIDE stroke (in stage px). */
export interface StageShot {
  src1x: string
  src2x: string
  alt: string
  box: Box
  stroke: number
  /** The ring's paint: the shared grey (TMS, default) or Figma's pink → near-black gradient (SocialTap). */
  ring?: 'solid' | 'gradient'
}

/** Dark pill with a pink dot (e.g. 117:13315). x/y/width are the pill's Figma box. */
export interface MarginNoteData {
  text: string
  x: number
  y: number
  width: number
}

export interface StageData {
  size: Size
  shots: StageShot[]
  notes?: MarginNoteData[]
}

/**
 * A stage's scene (SceneStop, pinned). `label` = what the scene shows, for assistive tech
 * (role="img"); `length` = viewports of scroll the pin lasts (track = 100svh + length × 100svh).
 */
export interface SceneData {
  /** Omitted: no single label; the screenshots' alts and the notes are read one by one. */
  label?: string
  length?: number
}

export interface SectionCopy {
  /** Anchor and hook name, e.g. "stop-01". */
  id: string
  eyebrow: string
  /** One string, or explicit lines where Figma breaks the heading by hand. */
  heading: string | string[]
  body?: string
}

/** A flip card (e.g. 157:13744, back 184:86): a label and statement on the light front, and on the dark back. */
export interface FlipCardData {
  label: string
  text: string
  backLabel: string
  backText: string
}

export interface Photo {
  src1x: string
  src2x: string
  alt: string
  width: number
  height: number
}

export interface CaseLinkData {
  label: string
  href: string
}

/** The case nav (top bar and footer). */
export interface CaseNavData {
  back: CaseLinkData
  contact: CaseLinkData
  allWork: CaseLinkData
}

/** Case hero: tagline lines, Figma's title lines from 760px and fitted lines below, meta row, stage. */
export interface CaseHeroData {
  tagline: string[]
  title: string[]
  titleMobile: string[]
  meta: { label: string; value: string }[]
  stage: StageData
}

/** A label and a per-character reveal paragraph (home About layout): "The result", "What was my part". */
export interface CaseStatementData {
  eyebrow: string
  text: string
}
