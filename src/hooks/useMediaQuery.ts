import { useSyncExternalStore } from 'react'

/** Keep in sync with the matching @media rules in component CSS. */
export const DESKTOP_QUERY = '(min-width: 760px)'
export const PINNED_QUERY = '(min-width: 760px) and (prefers-reduced-motion: no-preference)'
export const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)'
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Live matchMedia result. Prerendered HTML assumes `false`; CSS handles the first paint. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
