import type { CSSProperties } from 'react'
import type { Box, Size } from '../../data/cases/types.ts'

export const pct = (value: number, of: number) => `${(value / of) * 100}%`

/** A Figma box as --x/--y/--w/--h in % of its stage. */
export function placeIn(box: Box, size: Size) {
  return {
    '--x': pct(box.x, size.width),
    '--y': pct(box.y, size.height),
    '--w': pct(box.width, size.width),
    '--h': pct(box.height, size.height),
  } as CSSProperties
}
