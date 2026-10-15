import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
// Fonts are client-only imports: the SSR build externalises node_modules and can't load CSS.
import '@fontsource-variable/onest/wght.css'
import '@fontsource-variable/inter/wght.css'
import App from './App.tsx'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production HTML is prerendered (scripts/prerender.mjs); dev serves an empty root.
if (container.firstElementChild) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
