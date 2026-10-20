import { StrictMode } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import TmsCase from './cases/tms/TmsCase.tsx'
import SocialTapCase from './cases/socialtap/SocialTapCase.tsx'

/** Prerendered pages, keyed by their built HTML file in dist/ (see scripts/prerender.mjs). */
const pages: Record<string, () => ReactNode> = {
  'index.html': () => <App />,
  'work/tms.html': () => <TmsCase />,
  'work/socialtap.html': () => <SocialTapCase />,
}

export const pageFiles = Object.keys(pages)

export function render(file: string): string {
  return renderToString(<StrictMode>{pages[file]()}</StrictMode>)
}
