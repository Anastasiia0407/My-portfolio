import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { injectAnalytics } from '../../analytics.ts'
// Fonts are client-only imports: the SSR build externalises node_modules and can't load CSS.
import '@fontsource-variable/onest/wght.css'
import '@fontsource-variable/inter/wght.css'
import TmsCase from './TmsCase.tsx'

const container = document.getElementById('root')!
const page = (
  <StrictMode>
    <TmsCase />
  </StrictMode>
)

// Production HTML is prerendered (scripts/prerender.mjs); dev serves an empty root.
if (container.firstElementChild) {
  hydrateRoot(container, page)
} else {
  createRoot(container).render(page)
}

injectAnalytics()
