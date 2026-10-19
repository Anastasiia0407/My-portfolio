/**
 * Stops 01–05 and No dead ends (stage 3b): each stage pins in a scroll track and progress p = 0 → 1
 * drives its scene, margin notes last (useStageScene). Layer geometry below is measured from the
 * screenshots (fractions of the image, or Figma stage px) — see the comments per scene.
 * The markup's own state is the final one (reduced motion, no JS); `scene-only` layers exist only
 * while a scene runs.
 */
import { useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import SectionHeader from '../../components/SectionHeader/SectionHeader.tsx'
import Stage, { StageShot } from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import HandoffFlow from '../../components/HandoffFlow/HandoffFlow.tsx'
import { eased, ramp, sweep, useStageScene } from '../../motion/stageScene.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'
import { tmsCase } from '../../data/cases/tms.ts'
import type { Box, MarginNoteData, SceneData, SectionCopy, Size, StageShot as Shot } from '../../data/cases/tms.ts'
import './StopScenes.css'

const { stops, edgeCases, hero } = tmsCase
/** The plain dashboard (closed menus, no panel): images 31 and 35 are this screen plus a state. */
const dashboard = hero.stage.shots[0]

const px = (n: number) => n.toFixed(2)
/** A transform length in Figma px of the stage (scales with it). */
const u = (n: number) => `calc(var(--u) * ${px(n)})`
/** A box in % of a frame, from fractions of the screenshot. */
const inFrame = (x: number, y: number, w: number, h: number) =>
  ({ '--bx': `${x * 100}%`, '--by': `${y * 100}%`, '--bw': `${w * 100}%`, '--bh': `${h * 100}%` }) as CSSProperties
/** clip-path inset() for a fractional rect of the image. */
const insetOf = (x: number, y: number, w: number, h: number, bottomOverride?: number) =>
  `inset(${px(y * 100)}% ${px((1 - x - w) * 100)}% ${px(bottomOverride ?? (1 - y - h) * 100)}% ${px(x * 100)}%)`
/** A fractional rect of a screenshot, in stage px. */
const onShot = (shot: Shot, x: number, y: number, w: number, h: number): Box => ({
  x: shot.box.x + x * shot.box.width,
  y: shot.box.y + y * shot.box.height,
  width: w * shot.box.width,
  height: h * shot.box.height,
})

/** Section header + pinned stage. Track = 100svh + `scene.length` × 100svh (StopScenes.css). */
function PinnedStop({
  copy,
  scene,
  spec,
  size,
  notes,
  overlay,
  compact,
  children,
}: {
  copy: SectionCopy
  scene: SceneData
  spec: SceneSpec
  size: Size
  notes?: MarginNoteData[]
  overlay?: ReactNode
  compact?: boolean
  children: ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  useStageScene(trackRef, pinRef, spec)
  const titleId = `${copy.id}-title`
  return (
    <section
      id={copy.id}
      className={`case-section case-section--scene${compact ? ' case-section--compact' : ''}`}
      aria-labelledby={titleId}
      style={{ '--pin-w': size.width, '--pin-h': size.height, '--pin-length': scene.length } as CSSProperties}
    >
      <SectionHeader id={titleId} eyebrow={copy.eyebrow} heading={copy.heading} body={copy.body} />
      <div ref={trackRef} className="scene-track">
        <div ref={pinRef} className="scene-pin">
          <Stage size={size} className="stage--panel" notes={notes} notesMode="scene" overlay={overlay} label={scene.label}>
            {children}
          </Stage>
        </div>
      </div>
    </section>
  )
}

/** A framed screenshot whose image is built from layers (the first child is the static screenshot). */
function SceneFrame({ shot, size, layer, children }: { shot: Shot; size: Size; layer?: string; children: ReactNode }) {
  return (
    <div
      className="stage__item stage-frame"
      data-layer={layer}
      style={{ ...placeIn(shot.box, size), '--r': shot.radius, '--s': shot.stroke } as CSSProperties}
    >
      {children}
    </div>
  )
}

function FrameImage({
  src1x,
  src2x,
  alt = '',
  className = '',
  layer,
  style,
}: {
  src1x: string
  src2x: string
  alt?: string
  className?: string
  layer?: string
  style?: CSSProperties
}) {
  return (
    <img
      className={`stage-frame__img ${className}`}
      data-layer={layer}
      style={style}
      src={src1x}
      srcSet={`${src1x} 1x, ${src2x} 2x`}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  )
}

/* --- Stop 01 (117:13311): list slides in over the form, its Booking row flashes pink, two notes --- */
const stop01: SceneSpec = {
  layers: {
    list: (p) => {
      const k = eased(p, 0.15, 0.38)
      return { transform: `translate3d(${px(80 * (1 - k))}px, 0, 0)`, opacity: k }
    },
    booking: (p) => ({ opacity: ramp(p, 0.42, 0.5) - ramp(p, 0.56, 0.64) }),
  },
  notesAt: [0.74, 0.88],
}

export function Stop01Scene() {
  const { copy, stage, scene } = stops.sales
  const [form, list] = stage.shots
  // FIFO-010 row (the one Booking row) in image 32.
  const booking = onShot(list, 0.069, 0.218, 0.903, 0.052)
  return (
    <PinnedStop copy={copy} scene={scene} spec={stop01} size={stage.size} notes={stage.notes}>
      <StageShot shot={form} size={stage.size} />
      <StageShot shot={list} size={stage.size} layer="list" />
      <div className="stage__item scene-only scene-highlight" data-layer="booking" style={placeIn(booking, stage.size)} />
    </PinnedStop>
  )
}

/* --- Stop 02 (120:13390): dark fill Sales → TMS → Operations → back to TMS, arrows draw, panel drops --- */
const stop02: SceneSpec = {
  layers: {
    'flow-dark': (p, i) => ({
      opacity: [
        ramp(p, 0.04, 0.12) - ramp(p, 0.22, 0.3),
        ramp(p, 0.22, 0.3) - ramp(p, 0.38, 0.46) + ramp(p, 0.5, 0.58),
        ramp(p, 0.38, 0.46) - ramp(p, 0.5, 0.58),
      ][i],
    }),
    'flow-arrow': (p, i) => {
      const k = i === 0 ? ramp(p, 0.12, 0.22) : ramp(p, 0.3, 0.4)
      return { clipPath: k >= 1 ? 'none' : `inset(0 ${px((1 - k) * 100)}% 0 0)` }
    },
    panel: (p) => {
      const k = eased(p, 0.6, 0.74)
      return { transform: `translate3d(0, ${px(-16 * (1 - k))}px, 0)`, opacity: k }
    },
    'panel-shadow': (p) => ({ opacity: eased(p, 0.6, 0.74) }),
    bell: (p) => ({ opacity: ramp(p, 0.6, 0.66) }),
  },
  notesAt: [0.88],
}

// Image 31 = the plain dashboard + this notifications panel + the bell's unread dot. The panel's soft
// shadow reaches over the whole lower right (`shade`): that area only fades, the panel itself drops.
const panel = [0.7051, 0.0857, 0.2783, 0.5474] as const
const shade = [0.5996, 0.0707, 0.4004, 0.9293] as const
const bell = [0.805, 0.035, 0.023, 0.035] as const
const rectPoints = ([x, y, w, h]: readonly number[]) =>
  [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([a, b]) => `${px(a * 100)}% ${px(b * 100)}%`).join(', ')
/** The shadow area minus the panel (even-odd hole). */
const shadeOnly = `polygon(evenodd, ${rectPoints(shade)}, ${rectPoints(panel)})`

export function Stop02Scene() {
  const { copy, stage, scene, flow } = stops.handoff
  const [shot] = stage.shots
  return (
    <PinnedStop
      copy={copy}
      scene={scene}
      spec={stop02}
      size={stage.size}
      notes={stage.notes}
      compact
      overlay={
        <div className="stage__overlay" style={placeIn(flow.box, stage.size)}>
          <HandoffFlow steps={flow.steps} />
        </div>
      }
    >
      <SceneFrame shot={shot} size={stage.size}>
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} alt={shot.alt} />
        <FrameImage src1x={dashboard.src1x} src2x={dashboard.src2x} className="scene-only" style={{ clipPath: insetOf(...shade) }} />
        <FrameImage src1x={dashboard.src1x} src2x={dashboard.src2x} className="scene-only" style={{ clipPath: insetOf(...bell) }} />
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="panel-shadow" style={{ clipPath: shadeOnly }} />
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="panel" style={{ clipPath: insetOf(...panel) }} />
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="bell" style={{ clipPath: insetOf(...bell) }} />
      </SceneFrame>
    </PinnedStop>
  )
}

/* --- Stop 03 (120:13460): desktop + phone enter; counter → task row → its menu highlight; phone drifts --- */
const stop03: SceneSpec = {
  layers: {
    desk: (p) => {
      const k = eased(p, 0, 0.15)
      return { transform: `translate3d(0, ${u(40 * (1 - k))}, 0)`, opacity: k }
    },
    // Fallback for the inner phone scroll (no long capture in Figma): a drift linked to p, back to rest at the end.
    phone: (p) => {
      const k = eased(p, 0, 0.15)
      return { transform: `translate3d(0, ${u(40 * (1 - k) - 24 * Math.sin(Math.PI * p))}, 0)`, opacity: k }
    },
    hl: (p, i) => ({
      opacity: [
        ramp(p, 0.22, 0.3) - ramp(p, 0.42, 0.5),
        ramp(p, 0.42, 0.5) - ramp(p, 0.92, 0.98),
        ramp(p, 0.58, 0.66) - ramp(p, 0.92, 0.98),
      ][i],
    }),
  },
  notesAt: [0.88],
}

export function Stop03Scene() {
  const { copy, stage, scene } = stops.tasks
  const [desk, phone] = stage.shots
  // In the dashboard: "Tasks at work" counter, the first task row, its "⋯" button.
  const highlights: [Box, number][] = [
    [onShot(desk, 0.532, 0.094, 0.212, 0.141), 10],
    [onShot(desk, 0.083, 0.907, 0.885, 0.074), 6],
    [onShot(desk, 0.929, 0.922, 0.028, 0.043), 6],
  ]
  return (
    <PinnedStop copy={copy} scene={scene} spec={stop03} size={stage.size} notes={stage.notes}>
      <StageShot shot={desk} size={stage.size} layer="desk" />
      <StageShot shot={phone} size={stage.size} layer="phone" />
      {highlights.map(([box, radius], i) => (
        <div
          key={i}
          className="stage__item scene-only scene-highlight"
          data-layer="hl"
          style={{ ...placeIn(box, stage.size), '--hl-r': radius } as CSSProperties}
        />
      ))}
    </PinnedStop>
  )
}

/* --- Stop 04 (120:13531): tab switch (underline slides), then the invoice slides up and its modal scales in --- */
const stop04: SceneSpec = {
  layers: {
    general: (p) => ({ opacity: 1 - ramp(p, 0.16, 0.3) }),
    // From "General information" (x .0827, w .0969) to "Financial terms" (x .2027, w .0751).
    underline: (p) => {
      const k = eased(p, 0.12, 0.28)
      return { transform: `translateX(${px(-159.79 * (1 - k))}%) scaleX(${(1 + 0.2903 * (1 - k)).toFixed(4)})` }
    },
    invoice: (p) => {
      const k = eased(p, 0.42, 0.6)
      return { transform: `translate3d(0, ${u(60 * (1 - k))}, 0)`, opacity: k }
    },
    modal: (p) => {
      const k = eased(p, 0.58, 0.72)
      return { transform: `scale(${(0.96 + 0.04 * k).toFixed(4)})`, opacity: k }
    },
  },
  notesAt: [0.32, 0.88],
}

// Image 34 = image 28 under a 21% black scrim + this modal.
const modal = [0.2188, 0.1263, 0.5527, 0.7398] as const

export function Stop04Scene() {
  const { copy, stage, scene, general } = stops.shipment
  const [page, invoice] = stage.shots
  return (
    <PinnedStop copy={copy} scene={scene} spec={stop04} size={stage.size} notes={stage.notes}>
      <SceneFrame shot={page} size={stage.size}>
        <FrameImage src1x={page.src1x} src2x={page.src2x} alt={page.alt} />
        {/* General information tab and content below the fixed header (header ends at 8.5%, sidebar at 6.4%). */}
        <FrameImage src1x={general.src1x} src2x={general.src2x} className="scene-only" layer="general" style={{ clipPath: 'inset(8.5% 0 0 6.4%)' }} />
        <span className="scene-only scene-box scene-underline" data-layer="underline" style={inFrame(0.2027, 0.1238, 0.0751, 0.0025)} />
      </SceneFrame>
      <SceneFrame shot={invoice} size={stage.size} layer="invoice">
        <FrameImage src1x={invoice.src1x} src2x={invoice.src2x} alt={invoice.alt} />
        <span className="scene-only scene-backdrop" style={{ clipPath: insetOf(...modal) }}>
          <FrameImage src1x={page.src1x} src2x={page.src2x} />
        </span>
        <FrameImage
          src1x={invoice.src1x}
          src2x={invoice.src2x}
          className="scene-only"
          layer="modal"
          style={{ clipPath: insetOf(...modal), transformOrigin: `${(modal[0] + modal[2] / 2) * 100}% ${(modal[1] + modal[3] / 2) * 100}%` }}
        />
      </SceneFrame>
    </PinnedStop>
  )
}

/* --- Stop 05 (120:13599): charts draw, period menu 3 months → 1 year, charts redraw --- */
// Donut (fractions of the image): centre and the sweep radius (beyond the ring) in % of width / height.
const donut = { cx: 23.91, cy: 51.54, rx: 13, ry: 13 * 1.5398 }
// Bars: track x / width, first y, pitch, height; fills in % of the track (30/25/20/10/8/7 %).
const bars = { x: 0.5482, w: 0.4036, y: 0.3665, pitch: 0.0612, h: 0.0203, fills: [29.51, 24.55, 19.47, 9.49, 7.51, 6.59] }
const menu = [0.4102, 0.3263, 0.0928, 0.1805] as const // the open period menu in image 35
const menuOpen = (p: number) => ramp(p, 0.32, 0.4) - ramp(p, 0.56, 0.62)
const menuBottom = (p: number) => menu[1] + menu[3] * menuOpen(p) // lowest visible y of the menu
const drawn = (p: number, a: number, b: number, again: number) => (p < 0.62 ? eased(p, a, b) : eased(p, a + again, b + again))

const stop05: SceneSpec = {
  layers: {
    donut: (p) => ({ clipPath: sweep(donut.cx, donut.cy, donut.rx, donut.ry, drawn(p, 0, 0.2, 0.62)) }),
    bar: (p, i) => ({ transform: `scaleX(${drawn(p, 0.04 + 0.02 * i, 0.18 + 0.02 * i, 0.59).toFixed(4)})` }),
    menu: (p) => ({ clipPath: insetOf(menu[0], menu[1], menu[2], menu[3], (1 - menuBottom(p)) * 100) }),
    'button-open': (p) => ({ opacity: menuOpen(p) > 0 ? 1 : 0 }),
    // The baked "3 months" highlight is covered (with its label rebuilt) once the pick starts moving.
    'menu-cover': (p) => ({ opacity: p >= 0.44 && menuBottom(p) >= 0.417 ? 1 : 0 }),
    'menu-pick': (p) => {
      const k = eased(p, 0.44, 0.52)
      return { transform: `translateY(${px(-191.75 * (1 - k))}%)`, opacity: p >= 0.44 && menuBottom(p) >= 0.4954 ? 1 : 0 }
    },
    period: (p) => ({ opacity: ramp(p, 0.52, 0.56) }),
  },
  notesAt: [0.88],
}

export function Stop05Scene() {
  const { copy, stage, scene } = stops.overview
  const [shot] = stage.shots
  return (
    <PinnedStop copy={copy} scene={scene} spec={stop05} size={stage.size} notes={stage.notes}>
      <SceneFrame shot={shot} size={stage.size}>
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} alt={shot.alt} />
        {/* Image 35 is this dashboard with the menus open: the scene starts from the closed one. */}
        <FrameImage src1x={dashboard.src1x} src2x={dashboard.src2x} className="scene-only" />
        <span className="scene-only scene-box scene-donut-cover" style={inFrame(0.1177, 0.3285, 0.2427, 0)} />
        <FrameImage src1x={dashboard.src1x} src2x={dashboard.src2x} className="scene-only" layer="donut" />
        {bars.fills.map((fill, i) => (
          <span key={i} className="scene-only scene-box scene-bar" style={inFrame(bars.x, bars.y + i * bars.pitch, bars.w, bars.h)}>
            <span className="scene-bar__fill" data-layer="bar" style={{ width: `${fill}%` }} />
          </span>
        ))}
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="button-open" style={{ clipPath: insetOf(0.418, 0.283, 0.086, 0.032) }} />
        <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="menu" style={{ clipPath: insetOf(menu[0], menu[1], menu[2], 0) }} />
        <span className="scene-only scene-box scene-menu-row" data-layer="menu-cover" style={inFrame(0.417, 0.374, 0.082, 0.043)} aria-hidden="true">
          3 months
        </span>
        <span className="scene-only scene-box scene-menu-pick" data-layer="menu-pick" style={inFrame(0.4182, 0.4542, 0.0794, 0.0412)} />
        <span className="scene-only scene-box scene-period" data-layer="period" style={inFrame(0.421, 0.287, 0.062, 0.024)} aria-hidden="true">
          1 year
        </span>
      </SceneFrame>
    </PinnedStop>
  )
}

/* --- No dead ends (120:13653): empty states fan out from a stack; phone column switches turn on one by one --- */
const toggleRows = [0.1773, 0.2291, 0.2808, 0.3325, 0.3842, 0.436]
const edge: SceneSpec = {
  layers: {
    fan: (p, i) => {
      const k = eased(p, 0.05, 0.35)
      const [dx, dy] = i === 0 ? [120, 150] : [-108, -138] // both start stacked around (200, 250)
      return { transform: `translate3d(${u(dx * (1 - k))}, ${u(dy * (1 - k))}, 0)` }
    },
    'toggle-on': (p, i) => ({ opacity: eased(p, 0.42 + 0.06 * i, 0.47 + 0.06 * i) }),
    'toggle-knob': (p, i) => ({ transform: `translateX(${px(-95.5 * (1 - eased(p, 0.42 + 0.06 * i, 0.47 + 0.06 * i)))}%)` }),
  },
  notesAt: [0.88],
}

export function EdgeCasesScene() {
  const { copy, stage, scene } = edgeCases
  const [empty, noResults, phone] = stage.shots
  return (
    <PinnedStop copy={copy} scene={scene} spec={edge} size={stage.size} notes={stage.notes}>
      <StageShot shot={empty} size={stage.size} layer="fan" />
      <StageShot shot={noResults} size={stage.size} layer="fan" />
      <StageShot shot={phone} size={stage.size} />
      {toggleRows.map((y) => (
        <span key={y} className="stage__item scene-only scene-toggle" style={placeIn(onShot(phone, 0.8187, y, 0.096, 0.0246), stage.size)}>
          <span className="scene-toggle__on" data-layer="toggle-on" />
          <span className="scene-toggle__knob" data-layer="toggle-knob" />
        </span>
      ))}
    </PinnedStop>
  )
}
