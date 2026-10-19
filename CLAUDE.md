# Anastasiia Cheban — portfolio

Portfolio: home page plus static case-study pages. Vite + React + TypeScript (multi-page), plain CSS with custom properties, prerendered to static HTML. Public repo (github.com/Anastasiia0407/My-portfolio); Vercel deploys `main`.

## Commands

- `npm run dev` — dev server (client-rendered)
- `npm run build` — typecheck → client build → SSR build → `scripts/prerender.mjs` (injects HTML into every page listed in `src/entry-server.tsx`) → `check:assets`
- `npm run preview` — serve `dist/`
- `npm run lint` — ESLint
- `npm run images` — rebuild `src/assets/` + `src/data/figma-layout.generated.ts` from `design-src/figma/` (local originals); `scripts/build-case-images.mjs` does the case images (`design-src/figma/case-tms/` → `src/assets/cases/tms/`)
- `npm run check:assets` — fails if any file in `src/assets/` or `public/` is over 500 KB

## Page

Section order: **Hero → About → Works → Contact** (`src/App.tsx`). Anchors `#home` (Hero, not in the nav), `#about`, `#works`, `#contact`; nav order About, Works, Get in touch.

Two designs: desktop (Figma 37:2, 1512 wide) from 760px, mobile (66:263, 393 wide) below. On mobile `--m = 100vw / 393` (one Figma px at 393). Scaled with `--m`: the hero tagline and "DESIGNER", "SELECTED WORKS", the menu items, and the card visuals (361:490). Fixed: About 28/32, labels and card titles 16/20, footer 16/24 and © 14/20, paddings and gaps, the 40px menu button (tokens `--m-*`). There is no tablet layout: 760–1023 gets the desktop layout, fluid.

- **Hero** (`components/Hero`, Figma 37:3 / 66:264): the page `h1` (screen-reader text "Anastasiia Cheban, UX/UI and product designer"). Desktop: tracked tagline "UX/UI · PRODUCT" = letters spread across a box 1387/1432 of the headline width; masked "DESIGNER" = `hero-mask.svg` as CSS mask over `hero-photo.webp`, rotated/positioned from `heroPhotoLayout`, blended `plus-lighter` over ink. Mobile: "UX/UI·PRODUCT" right-aligned, its last letter 16px from the right edge; a vertical "DESIGNER" (`hero-mask-mobile.svg` + `hero-photo-mobile.webp`, `heroPhotoMobileLayout`, −79.59°) anchored 16px from the bottom and right, height `min(828 × --m, 100svh − 32px)`. The two overlap at the bottom, as in Figma.
- **Mobile menu** (`components/MobileMenu`, 66:362, below 760px only): button with two CSS lines that rotate into an X, full-screen blurred overlay. Open: scroll locked, `main`/`footer` inert, focus trapped in button + links, Escape closes and returns focus; a link closes, scrolls and focuses its section. Reduced motion: no morph or fade. The inline `Nav` is desktop-only.
- **About** (`components/About`, 62:245 / 66:278): `h2` "Who I am" + paragraph with a scroll-linked per-character reveal. Pinned like Works: the section is a track `(1 + --about-pin-length) × 100svh` (1.5 desktop, 1.2 below 760, in `tokens.css`), `.about__pin` is sticky, one viewport tall, content at the bottom. `usePinProgress` maps the pinned range to the reveal: pin start = only "Hi, I’m Anastasiia Cheban," dark (Figma state), release = fully dark; reverses on the way up. `#about` lands at the pin start. Reduced motion: no track, no pin, text fully dark.
- **Works** (`components/Works`, 37:18): rendered from `projects.ts`. Pinned only at `(min-width: 760px) and (prefers-reduced-motion: no-preference)`: the section is `(projects + 1) × 100svh`, `.works__pin` is sticky, `useActiveProject` maps scroll to the active project (title, panel). Each panel shows its own "(0X)" (top-right, or bottom-right when the project's `counter` is `bottom`). Pinned, each composition is laid out from the panel's top-left at the panel's width (s = panel width / 756, never scaled by height), clipped only by the panel (`.works__clip`); the counter (top-right, or bottom-right anchored to the panel bottom) and the CTA sit outside that clip, in panel units. Hovering the panel colours the active visuals and `useCursorFollow` moves the CTA, clamped so the whole circle stays inside the panel. ≥760px with reduced motion: projects stack in the panel. <760px: one card per project (visual, then dark title), always in colour, no CTA, no hover, no active state; with a case-study URL the whole card is a link. The layout switch is pure CSS.
- **Contact** (`components/Contact`, 37:56 / 66:310): footer with the "GET IN TOUCH" vector (`h2`, text "Get in touch") and links from `site.ts`. One row from 1024px; 2 × 2 grid (© + email, Telegram + LinkedIn) at 760–1023; below 760, links stacked 16/24 and © last.

## Case pages

- One HTML entry per case: `work/<slug>.html` (in `vite.config.ts` inputs and `src/entry-server.tsx` pages), served at `/work/<slug>` (Vite tries `<path>.html`; `vercel.json` has `cleanUrls`). No router.
- **TMS** (`/work/tms`, Figma 113:12821, desktop only so far; motion notes 124:2, not built yet): `src/cases/tms/` (`main.tsx`, `TmsCase.tsx`, `TmsCase.css`), content in `src/data/cases/tms.ts`. Hero (tagline, h1 lines, "(03)", meta `dl`, teal stage), The project, The problem (stage with real-HTML TMS window + five rotated tool cards over a blurred photo, stat cards), The research (insight rows), Stops 01–05, No dead ends, The result (`RevealText`, static/full ink), footer link. Below 760 everything stacks; no mobile design yet.
- Shared primitives: `CaseNav` (+ `CaseLink`), `SectionHeader` (eyebrow / h2 lines / optional body, side by side from 760), `Stage` (fixed-ratio canvas; Figma px → % via `placeIn`; `--u` = one Figma px of the stage via `cqw`; `StageShot` framed screenshots with outside stroke; `MarginNote` anchored to the nearer edge, listed under the stage below 760; optional `overlay`), `StatCard` (`<data value>`), `InsightRow`, `HandoffFlow`, `RevealText` (also used by home About).
- Links: "← Back" / "← Back to all work" → `/#works`, "Get in touch" → `/#contact`. Project 03's `caseStudyUrl` is `/work/tms`; a project with a case URL makes its Works list title a link to it too.
- Motion (Figma 124:2), stage 2: `src/motion/` — `observeEnter` (IntersectionObserver, fires once; immediately for content in view or above on load), `scrollLoop` (one passive scroll listener + rAF; geometry read only on measure/resize), hooks `useReveal` (sets `data-entered`; CSS fades `[data-reveal]` children up 24px in `--i` order, `data-reveal="fade"`/`"draw"` variants), `usePopIn` (margin notes when the stage centre sentinel passes the viewport centre), `useCountUp` (aria-hidden `[data-count]` copy, only if the row starts below the fold), `useParallax` (photos, ±5% inside a clipping frame, image scaled 1.11), `useHeroStage` (stage 0.96 → 1, dashboard 0.85× page speed, moves down only), `useScrollReveal` (RevealText without a pin; completes by the page end). Hero title/tagline/meta are CSS keyframes. Start states live in `src/motion/motion.css` under `html.motion`, which the inline script in `work/tms.html` sets before first paint (dropped after 4 s if the app never sets `data-motion-ready`). Reduced motion: no class, everything final. `useHeroStage` plays the 0.96 scale only on a fresh load at the top; `html.motion-restored` (reload, back/forward, #hash) starts it final with the drift anchored at the load position.
- Section 02 scene (stage 3a, `src/motion/toolsScene.ts`, timings in `toolsScene`): `.problem-track` = `(1 + --problem-pin-length) × 100svh` with a sticky `.problem-pin`; the stage is fitted to the viewport and keeps the header gap at pin start and to the stats at release (`--pin-offset`). Cards fly to the window centre (offsets measured on resize), rows (`data-shown`) appear at k > 0.9, window settles over p 0.8–0.95, label at p > 0.9. Canvas is `role="img"` with an aria-label; rows and label aria-hidden. Without motion: no track, end state (rows + label, cards hidden). Below 760 a temporary 361×480 % layout. The stats count-up waits for the pin release (`useCountUp(…, { after })`). 
- Stops 01–05 and No dead ends (stage 3b, `src/cases/tms/StopScenes.tsx` + `.css`, engine `src/motion/stageScene.ts`): each stage pins (`.scene-track` = `(1 + --pin-length) × 100svh`, `scene.length` in `tms.ts`: 1.6 for Stops 01/04, 1.2 for the rest), fitted to `100svh − 48px`, centred; track margins keep the header gap at the pin start and Figma's section spacing after the release. `useStageScene` maps p to every `[data-layer]` (transform / opacity / clip-path; layer functions per scene) and shows notes at `notesAt` (last one ≤ 0.88, release at p = 1). Screenshots have no layers in Figma, so states are built from screenshots that line up exactly: image 31 = dashboard + panel, image 35 = dashboard + open menus, image 34 = image 28 under a 21% scrim + modal, image 27 (rescaled, `stop-04-general`) = image 28's General information tab. Rebuilt pieces (bars, menu text, tab underline, switches, highlights) use `--color-ui-*` colours sampled from the screenshots. The markup is the final state (reduced motion, no JS); `.scene-only` layers show only while a scene runs; a scene's stage stays hidden until the app is ready (reload mid-scene). Fallbacks (approved): no phone inner scroll (drift instead), counter → first task → its menu highlights, charts redraw to the same values on "1 year".
- Scale rule (Figma "Scale" constraint, every mockup on both pages): mockups and their overlays are positioned and sized in % of their stage/frame, keep Figma's aspect ratio, and borders, radii and text inside mockups scale with the stage (`--u`, no px minimums from 760 up). Margin notes are not mockups: fixed 16/20 text (`--fs-note`), only their position follows the stage. Exceptions: the section 02 temporary layout below 760, and the px motion distances given in the specs.
- Hero spacing (113:13026): title block top padding `--space-case-hero` (350 at 1512) below the header gap; subtitle breaks from 1280, title from 760.
- Stop 05 is the coded scene (no video; `video-src/` stays git-ignored).
- The hero / stop 03 dashboard reuses `work-03@1x/2x.webp` (same source). Stat sources link to the URLs given in Figma.

## Data

- `src/data/projects.ts` — all Works content. Adding a project, its images or a case-study link is a data-only change. One structure for every project: `images[]` in paint order, each with a `placement` (`desktop` box in the 756×982 panel, `mobile` box in the 361×490 card; Figma px, unrotated), optional `rotation` (deg) and optional `frame` (`solid` ring or `glass` edge; outside stroke and radius per layout). Optional per project: `band` (teal gradient), `counter` (`top`/`bottom`), `caseStudyUrl` (none → the desktop CTA shows on hover but isn't a link; cards and touch visuals aren't links). Cards and stacked mode clip at the stage; pinned mode clips at the panel.
- `src/data/site.ts` — nav items, contact links (mailto / Telegram / LinkedIn; `external` adds `target="_blank" rel="noopener noreferrer"`), owner name/role/tagline.
- `src/data/figma-layout.generated.ts` — generated by `npm run images`; never edit by hand.

## Styles and tokens

- `src/styles/tokens.css` — every colour, type size, spacing, radius and motion value; component CSS uses only these (geometry without a token is the exception). Type is fluid via `clamp()`: `--fs-display-xl` (SELECTED WORKS), `--fs-display-l` (counter), `--fs-display-m`/`--lh-display-m` (About, 40/48 → 24/30), `--fs-name` (Hero tagline), `--fs-ui`, `--fs-nav`. Muted text is ink at `--opacity-muted` (≈ `#a0a0a3`), so reveals animate opacity. `#a0a0a3` on cream is 2.38:1; the owner chose to keep it.
- `src/styles/base.css` — reset, focus (`#FF5CB9` outline, plus an ink ring inside `.on-light` sections), `.sr-only`, `.skip-link`, `.touch-target` (44px hit area without changing layout).
- Components: `src/components/<Name>/<Name>.tsx` + `<Name>.css`, BEM-ish classes.

## Hooks (`src/hooks/`)

- `useMediaQuery` + `DESKTOP_QUERY` / `PINNED_QUERY` / `FINE_HOVER_QUERY` / `REDUCED_MOTION_QUERY` — strings must match the CSS `@media` rules.
- `useActiveProject` — pinned: one rAF-throttled rect read per scroll frame; desktop reduced motion: IntersectionObserver on a centre line; below 760px: off.
- `useCursorFollow` — eased CTA follow inside the Works panel; writes only `--fx/--fy` and `is-following`.
- `usePinProgress` — rAF-throttled; writes `--progress` (`from` → 1) on an element from how far a sticky pin has travelled through its track; drives the About reveal.

## Rules

- Motion: transform, opacity and filter only; no layout writes on scroll; pinning is native sticky (no scroll hijacking, snap or wheel listeners). `prefers-reduced-motion`: no pinning, no reveal (text fully dark), no cursor follow, no menu morph, short fades, no smooth scroll.
- Every hover effect is gated by `@media (hover: hover) and (pointer: fine)`. On touch at any width: visuals always in colour, no pink button or cursor-follow, and the active visual (desktop) or the card (mobile) is the tap target when a case study exists.
- Frames: Figma's code export lists inside borders, but its renders use OUTSIDE strokes. Project 02's ring is a Figma glass effect, approximated by a blurred copy of the image edge under a tint fitted to Figma's renders (`--color-glass-tint` desktop, `--color-glass-tint-m` mobile).
- Use `100svh`, not `100vh`.
- No secrets, tokens or keys in the repo; the site needs no env vars. Never write temporary Figma asset URLs into code or scripts.
- `design-src/` is **gitignored** (Figma originals, check renders). Only optimised outputs go in `src/assets/` and `public/`.
- Images: the hero photo export is the unrotated area the mask can show, at source resolution, with a fitted tone curve for the Figma colour adjustment. Never add fake screenshots; a project without images shows an empty panel.
- `public/`: `favicon.svg` (AC monogram), `apple-touch-icon.png` (180px), `og.jpg` (1200×630, a static capture of the Hero with the headline centred).
- Meta lives in `index.html`. TODO: canonical, `og:url` and an absolute `og:image` once the final domain is known.
- Commit and push only when the owner asks.

## Figma

fileKey `KrK3uJDPRwV4ogpCkaWoiS`, page frame `37:2` (1512 × 3337). No Figma variables, no motion data.

| Node | What |
|---|---|
| 37:3 / 37:13 | Hero / nav |
| 61:182 | Tracked tagline "UX/UI · PRODUCT" |
| 61:183 (61:184 + 61:185) | "DESIGNER" vector mask over rotated photo (plus-lighter) |
| 62:245 / 62:246 / 62:247 | About / "Who I am" / revealed paragraph |
| 37:18 / 37:27 / 37:31 | Works / project list / visual panel |
| 39:111, 39:115 | Project 01 phones |
| 40:125 | Pink CTA button (120px, arrow 40:126) |
| 75:69 / 89:8415 / 89:8413 | Project 02 panel / image 25 / image 24 (−12°) |
| 72:857 / 75:44 / 75:45 / 73:890 | Project 03 panel / teal band / dashboard / bottom "(03)" |
| 37:56 / 61:192 / 37:62 | Contact / "GET IN TOUCH" vector / footer links |
| 66:263 | Mobile page (393 wide): 66:264 Hero (66:270 tagline, 66:271 vertical mask), 66:278 About, 66:281 Works (cards 66:325 / 66:326 with 89:8417 + 89:8419 / 66:340), 66:310 Contact |
| 66:362 | Mobile menu open |
