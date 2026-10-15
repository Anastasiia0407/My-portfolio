# Anastasiia Cheban — portfolio

Single-page portfolio. Vite + React + TypeScript, plain CSS with custom properties. Public repo (github.com/Anastasiia0407/My-portfolio), deployed on Vercel from `main`.

## Commands

- `npm run dev` — dev server (client-rendered)
- `npm run build` — typecheck → client build → SSR build → `scripts/prerender.mjs` (injects HTML into `dist/index.html`) → `check:assets`
- `npm run lint` — ESLint
- `npm run check:assets` — fails if any file in `src/assets/` or `public/` is over 500 KB

## Structure

- `src/components/<Name>/<Name>.tsx` + `<Name>.css` — one folder per component, BEM-ish class names (`works__list`)
- `src/data/projects.ts` — all Works content. Adding a project, its visuals or a case-study link is a data-only change. `visual` and `caseStudyUrl` are optional: missing visual → placeholder; missing link → CTA shows on hover but is not a link.
- `src/data/site.ts` — nav anchors, contact links (email / Telegram / LinkedIn), owner name
- `src/styles/tokens.css` — every colour, size, spacing and motion value. Don't hardcode values in component CSS.
- `src/main.tsx` client entry (hydrates prerendered HTML); `src/entry-server.tsx` SSR entry. Font imports stay in `main.tsx` only.
- `design-src/` — **gitignored** raw Figma exports and originals. Only optimised outputs go in `src/assets/`.

## Rules

- No secrets, tokens or keys in the repo. The site needs no env vars. Never write temporary Figma asset URLs into code or scripts.
- Images: AVIF + WebP at 1x/2x within budget; the dithered About photo is lossless WebP/PNG (lossy formats smear the dither).
- Motion: animate transform, opacity and filter only; no layout reads/writes per scroll frame (IntersectionObserver for steps, one rAF loop for progress). Muted text is ink at `--opacity-muted`, so reveals animate opacity, not colour.
- `prefers-reduced-motion`: About text fully dark, Works stacked (not pinned), CTA static, short fades, no smooth scroll.
- Use `100svh`, not `100vh`. External links open in a new tab with `rel="noopener noreferrer"`.
- Commit and push only when the owner asks.

## Figma

fileKey `KrK3uJDPRwV4ogpCkaWoiS`, page frame `37:2` (1512 × 3384). No Figma variables, no motion data.

| Node | What |
|---|---|
| 37:3 / 37:13 | Hero / nav |
| 37:11 + 37:12 | "UX/UI DESIGNER" vector mask over rotated photo (plus-lighter) |
| 37:18 / 37:27 / 37:31 | Works / project list / visual panel |
| 39:110 | Project 01 phones composite |
| 40:125 | Pink CTA button (120px, arrow 40:126) |
| 37:45 / 37:52 / 37:55 | About / animated heading / photo with baked shader |
| 37:56 / 44:137 / 37:62 | Contact / "GET IN TOUCH" vector / footer links |
