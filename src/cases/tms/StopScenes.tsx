/**
 * TMS Stops 01–05 and No dead ends: each stop's scene (layer functions, note timings) and the pieces
 * built over its screenshots. The section, pin and mobile restack are the shared SceneStop
 * (src/cases/shared/SceneStop.tsx, trigger "pin"): 760px and up, p = 0 → 1 through the pin drives the
 * scene; below 760 each step plays once on a timeline when it enters.
 */
import type { CSSProperties } from 'react'
import { StageShot } from '../../components/Stage/Stage.tsx'
import { placeIn } from '../../components/Stage/placeIn.ts'
import HandoffFlow from '../../components/HandoffFlow/HandoffFlow.tsx'
import { eased, ramp, span, sweep } from '../../motion/stageScene.ts'
import type { SceneSpec } from '../../motion/stageScene.ts'
import { tmsCase } from '../../data/cases/tms.ts'
import type { Box, Size, StageShot as Shot } from '../../data/cases/types.ts'
import { FrameImage, MobileGroup, MobileShot, SceneFrame, SceneStop } from '../shared/SceneStop.tsx'
import { inFrame, insetOf, noteOnly, onShot, px, sequenceSteps, u } from '../shared/stageGeometry.ts'
import './StopScenes.css'

const { stops, edgeCases, hero } = tmsCase
/** The plain dashboard (closed menus, no panel): images 31 and 35 are this screen plus a state. */
const dashboard = hero.stage.shots[0]

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

const m01List: SceneSpec = {
  layers: {
    list: (p) => {
      const k = eased(p, 0, 0.45)
      return { transform: `translate3d(${px(80 * (1 - k))}px, 0, 0)`, opacity: k }
    },
    booking: (p) => ({ opacity: ramp(p, 0.5, 0.6) - ramp(p, 0.82, 0.92) }),
  },
  notesAt: [1],
}

export function Stop01Scene() {
  const { copy, stage, scene } = stops.sales
  const [form, list] = stage.shots
  const formPiece = (shot: Shot, size: Size) => <StageShot shot={shot} size={size} />
  const listPiece = (shot: Shot, size: Size) => (
    <>
      <StageShot shot={shot} size={size} layer="list" />
      {/* FIFO-010 row (the one Booking row) in image 32. */}
      <div className="stage__item scene-only scene-highlight" data-layer="booking" style={placeIn(onShot(shot, 0.069, 0.218, 0.903, 0.052), size)} />
    </>
  )
  return (
    <SceneStop
      mobileLoose
      copy={copy}
      scene={scene}
      spec={stop01}
      mobileSpec={mobile01}
      mobileLength={M_TWO}
      size={stage.size}
      notes={stage.notes}
      mobile={
        <>
          <MobileGroup spec={noteOnly} duration={500} notes={[stage.notes[0]]}>
            <MobileShot shot={form}>{formPiece}</MobileShot>
          </MobileGroup>
          <MobileGroup spec={m01List} duration={2000} notes={[stage.notes[1]]}>
            <MobileShot shot={list}>{listPiece}</MobileShot>
          </MobileGroup>
        </>
      }
    >
      {formPiece(form, stage.size)}
      {listPiece(list, stage.size)}
    </SceneStop>
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

const m02Flow: SceneSpec = {
  layers: { 'flow-dark': span(stop02.layers['flow-dark'], 0, 0.6), 'flow-arrow': span(stop02.layers['flow-arrow'], 0, 0.6) },
  notesAt: [],
}
const m02Panel: SceneSpec = {
  layers: {
    panel: span(stop02.layers.panel, 0.56, 0.78),
    'panel-shadow': span(stop02.layers['panel-shadow'], 0.56, 0.78),
    bell: span(stop02.layers.bell, 0.56, 0.78),
  },
  notesAt: [1],
}

export function Stop02Scene() {
  const { copy, stage, scene, flow } = stops.handoff
  const [shot] = stage.shots
  const notificationsPiece = (shot: Shot, size: Size) => (
    <SceneFrame shot={shot} size={size}>
      <FrameImage src1x={shot.src1x} src2x={shot.src2x} alt={shot.alt} />
      <FrameImage src1x={dashboard.src1x} src2x={dashboard.src2x} className="scene-only" style={{ clipPath: insetOf(...shade) }} />
      <FrameImage src1x={dashboard.src1x} src2x={dashboard.src2x} className="scene-only" style={{ clipPath: insetOf(...bell) }} />
      <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="panel-shadow" style={{ clipPath: shadeOnly }} />
      <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="panel" style={{ clipPath: insetOf(...panel) }} />
      <FrameImage src1x={shot.src1x} src2x={shot.src2x} className="scene-only" layer="bell" style={{ clipPath: insetOf(...bell) }} />
    </SceneFrame>
  )
  return (
    <SceneStop
      copy={copy}
      scene={scene}
      spec={stop02}
      mobileSpec={mobile02}
      mobileLength={M_TWO}
      size={stage.size}
      notes={stage.notes}
      overlay={
        <div className="stage__overlay" style={placeIn(flow.box, stage.size)}>
          <HandoffFlow steps={flow.steps} />
        </div>
      }
      mobile={
        <>
          <MobileGroup spec={m02Flow} duration={2400}>
            <HandoffFlow steps={flow.steps} />
          </MobileGroup>
          <MobileGroup spec={m02Panel} duration={1400} notes={stage.notes} center>
            <MobileShot shot={shot}>{notificationsPiece}</MobileShot>
          </MobileGroup>
        </>
      }
    >
      {notificationsPiece(shot, stage.size)}
    </SceneStop>
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

const m03Desk: SceneSpec = { layers: { hl: span(stop03.layers.hl, 0.18, 1) }, notesAt: [1] }

export function Stop03Scene() {
  const { copy, stage, scene, mobileNotes } = stops.tasks
  const [desk, phone] = stage.shots
  const deskPiece = (shot: Shot, size: Size) => (
    <>
      <StageShot shot={shot} size={size} layer="desk" />
      {/* In the dashboard: "Tasks at work" counter, the first task row, its "⋯" button. */}
      {(
        [
          [onShot(shot, 0.532, 0.094, 0.212, 0.141), 10],
          [onShot(shot, 0.083, 0.907, 0.885, 0.074), 6],
          [onShot(shot, 0.929, 0.922, 0.028, 0.043), 6],
        ] as [Box, number][]
      ).map(([box, radius], i) => (
        <div
          key={i}
          className="stage__item scene-only scene-highlight"
          data-layer="hl"
          style={{ ...placeIn(box, size), '--hl-r': radius } as CSSProperties}
        />
      ))}
    </>
  )
  const phonePiece = (shot: Shot, size: Size) => <StageShot shot={shot} size={size} layer="phone" />
  return (
    <SceneStop
      copy={copy}
      scene={scene}
      spec={stop03}
      mobileSpec={mobile03}
      mobileLength={M_TWO}
      size={stage.size}
      notes={stage.notes}
      mobile={
        <>
          <MobileGroup spec={m03Desk} duration={2600} notes={[mobileNotes[0]]}>
            <MobileShot shot={desk}>{deskPiece}</MobileShot>
          </MobileGroup>
          <MobileGroup spec={noteOnly} duration={500} notes={[mobileNotes[1]]}>
            <MobileShot shot={phone} narrow>
              {phonePiece}
            </MobileShot>
          </MobileGroup>
        </>
      }
    >
      {deskPiece(desk, stage.size)}
      {phonePiece(phone, stage.size)}
    </SceneStop>
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

const m04Page: SceneSpec = {
  layers: { general: span(stop04.layers.general, 0.08, 0.34), underline: span(stop04.layers.underline, 0.08, 0.34) },
  notesAt: [1],
}
const m04Invoice: SceneSpec = {
  layers: {
    invoice: (p) => {
      const k = eased(p, 0, 0.5)
      return { transform: `translate3d(0, ${u(60 * (1 - k))}, 0)`, opacity: k }
    },
    modal: span(stop04.layers.modal, 0.4, 0.76),
  },
  notesAt: [1],
}

export function Stop04Scene() {
  const { copy, stage, scene, general } = stops.shipment
  const [page, invoice] = stage.shots
  const pagePiece = (shot: Shot, size: Size) => (
    <SceneFrame shot={shot} size={size}>
      <FrameImage src1x={shot.src1x} src2x={shot.src2x} alt={shot.alt} />
      {/* General information tab and content below the fixed header (header ends at 8.5%, sidebar at 6.4%). */}
      <FrameImage src1x={general.src1x} src2x={general.src2x} className="scene-only" layer="general" style={{ clipPath: 'inset(8.5% 0 0 6.4%)' }} />
      <span className="scene-only scene-box scene-underline" data-layer="underline" style={inFrame(0.2027, 0.1238, 0.0751, 0.0025)} />
    </SceneFrame>
  )
  const invoicePiece = (shot: Shot, size: Size) => (
    <SceneFrame shot={shot} size={size} layer="invoice">
      <FrameImage src1x={shot.src1x} src2x={shot.src2x} alt={shot.alt} />
      <span className="scene-only scene-backdrop" style={{ clipPath: insetOf(...modal) }}>
        <FrameImage src1x={page.src1x} src2x={page.src2x} />
      </span>
      <FrameImage
        src1x={shot.src1x}
        src2x={shot.src2x}
        className="scene-only"
        layer="modal"
        style={{ clipPath: insetOf(...modal), transformOrigin: `${(modal[0] + modal[2] / 2) * 100}% ${(modal[1] + modal[3] / 2) * 100}%` }}
      />
    </SceneFrame>
  )
  return (
    <SceneStop
      copy={copy}
      scene={scene}
      spec={stop04}
      mobileSpec={mobile04}
      mobileLength={M_TWO}
      size={stage.size}
      notes={stage.notes}
      mobile={
        <>
          <MobileGroup spec={m04Page} duration={1600} notes={[stage.notes[0]]}>
            <MobileShot shot={page}>{pagePiece}</MobileShot>
          </MobileGroup>
          <MobileGroup spec={m04Invoice} duration={1800} notes={[stage.notes[1]]}>
            <MobileShot shot={invoice}>{invoicePiece}</MobileShot>
          </MobileGroup>
        </>
      }
    >
      {pagePiece(page, stage.size)}
      {invoicePiece(invoice, stage.size)}
    </SceneStop>
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

const m05: SceneSpec = {
  layers: Object.fromEntries(Object.entries(stop05.layers).map(([name, fn]) => [name, span(fn, 0, 0.86)])),
  notesAt: [1],
}

export function Stop05Scene() {
  const { copy, stage, scene } = stops.overview
  const [shot] = stage.shots
  const dashboardPiece = (shot: Shot, size: Size) => (
    <SceneFrame shot={shot} size={size}>
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
  )
  return (
    <SceneStop
      copy={copy}
      scene={scene}
      spec={stop05}
      mobileSpec={mobile05}
      mobileLength={M_ONE}
      size={stage.size}
      notes={stage.notes}
      mobile={
        <MobileGroup spec={m05} duration={3600} notes={stage.notes}>
          <MobileShot shot={shot}>{dashboardPiece}</MobileShot>
        </MobileGroup>
      }
    >
      {dashboardPiece(shot, stage.size)}
    </SceneStop>
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

// Below 760 the empty states stack: the second starts over the first and slides down into place.
const mEdgeEmpty: SceneSpec = {
  layers: {
    fan: (p, i) => {
      const k = eased(p, 0, 0.7)
      return { transform: i === 0 ? 'none' : `translate3d(0, calc((-100% - var(--m-gap-s)) * ${(1 - k).toFixed(4)}), 0)` }
    },
  },
  notesAt: [1],
}
const mEdgePhone: SceneSpec = {
  layers: { 'toggle-on': span(edge.layers['toggle-on'], 0.38, 0.82), 'toggle-knob': span(edge.layers['toggle-knob'], 0.38, 0.82) },
  notesAt: [],
}

export function EdgeCasesScene() {
  const { copy, stage, scene } = edgeCases
  const [empty, noResults, phone] = stage.shots
  const emptyPiece = (shot: Shot, size: Size) => <StageShot shot={shot} size={size} layer="fan" />
  const phonePiece = (shot: Shot, size: Size) => (
    <>
      <StageShot shot={shot} size={size} />
      {toggleRows.map((y) => (
        <span key={y} className="stage__item scene-only scene-toggle" style={placeIn(onShot(shot, 0.8187, y, 0.096, 0.0246), size)}>
          <span className="scene-toggle__on" data-layer="toggle-on" />
          <span className="scene-toggle__knob" data-layer="toggle-knob" />
        </span>
      ))}
    </>
  )
  return (
    <SceneStop
      copy={copy}
      scene={scene}
      spec={edge}
      mobileSpec={mobileEdge}
      mobileLength={M_TWO}
      size={stage.size}
      notes={stage.notes}
      mobile={
        <>
          <MobileGroup spec={mEdgeEmpty} duration={1400} notes={stage.notes} pair>
            <MobileShot shot={empty}>{emptyPiece}</MobileShot>
            <MobileShot shot={noResults}>{emptyPiece}</MobileShot>
          </MobileGroup>
          <MobileGroup spec={mEdgePhone} duration={2000}>
            <MobileShot shot={phone} narrow>
              {phonePiece}
            </MobileShot>
          </MobileGroup>
        </>
      }
    >
      {emptyPiece(empty, stage.size)}
      {emptyPiece(noResults, stage.size)}
      {phonePiece(phone, stage.size)}
    </SceneStop>
  )
}

/* Below 760, pinned (the site's pin rule; SceneStop pins the panel when it fits 100svh − 32): the
   steps of each panel in sequence, evenly spaced, the last ending at 0.9. */
const mobile01 = sequenceSteps([noteOnly, m01List])
const mobile02 = sequenceSteps([m02Flow, m02Panel])
const mobile03 = sequenceSteps([m03Desk, noteOnly])
const mobile04 = sequenceSteps([m04Page, m04Invoice])
const mobile05 = sequenceSteps([m05])
const mobileEdge = sequenceSteps([mEdgeEmpty, mEdgePhone])
/** Viewports of pinned scroll below 760: two steps, one step. */
const M_TWO = 1.2
const M_ONE = 1
