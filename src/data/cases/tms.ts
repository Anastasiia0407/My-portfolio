/**
 * TMS case study content (Figma 113:12821 "Case_TMS_desktop", 1512 × 15252).
 * Every text, image, stage position and note lives here; TmsCase.tsx only lays it out.
 * Stage geometry is in Figma px of each stage (unrotated boxes); the Stage component turns it into %.
 */
import dashboard1x from '../../assets/work-03@1x.webp'
import dashboard2x from '../../assets/work-03@2x.webp'
import projectPhoto1x from '../../assets/cases/tms/project-photo@1x.webp'
import projectPhoto2x from '../../assets/cases/tms/project-photo@2x.webp'
import problemBg from '../../assets/cases/tms/problem-bg@1x.webp'
import researchPhoto1x from '../../assets/cases/tms/research-photo@1x.webp'
import researchPhoto2x from '../../assets/cases/tms/research-photo@2x.webp'
import stop01Form1x from '../../assets/cases/tms/stop-01-form@1x.webp'
import stop01Form2x from '../../assets/cases/tms/stop-01-form@2x.webp'
import stop01List1x from '../../assets/cases/tms/stop-01-list@1x.webp'
import stop01List2x from '../../assets/cases/tms/stop-01-list@2x.webp'
import stop02Notifications1x from '../../assets/cases/tms/stop-02-notifications@1x.webp'
import stop02Notifications2x from '../../assets/cases/tms/stop-02-notifications@2x.webp'
import stop03Mobile1x from '../../assets/cases/tms/stop-03-mobile@1x.webp'
import stop03Mobile2x from '../../assets/cases/tms/stop-03-mobile@2x.webp'
import stop04Shipment1x from '../../assets/cases/tms/stop-04-shipment@1x.webp'
import stop04Shipment2x from '../../assets/cases/tms/stop-04-shipment@2x.webp'
import stop04General1x from '../../assets/cases/tms/stop-04-general@1x.webp'
import stop04General2x from '../../assets/cases/tms/stop-04-general@2x.webp'
import stop04Invoice1x from '../../assets/cases/tms/stop-04-invoice@1x.webp'
import stop04Invoice2x from '../../assets/cases/tms/stop-04-invoice@2x.webp'
import stop05Dashboard1x from '../../assets/cases/tms/stop-05-dashboard@1x.webp'
import stop05Dashboard2x from '../../assets/cases/tms/stop-05-dashboard@2x.webp'
import edgeEmpty1x from '../../assets/cases/tms/edge-empty@1x.webp'
import edgeEmpty2x from '../../assets/cases/tms/edge-empty@2x.webp'
import edgeNoResults1x from '../../assets/cases/tms/edge-no-results@1x.webp'
import edgeNoResults2x from '../../assets/cases/tms/edge-no-results@2x.webp'
import edgeColumns1x from '../../assets/cases/tms/edge-columns@1x.webp'
import edgeColumns2x from '../../assets/cases/tms/edge-columns@2x.webp'

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

/** Framed screenshot on a stage: rounded image with Figma's OUTSIDE stroke (radius and stroke in stage px). */
export interface StageShot {
  src1x: string
  src2x: string
  alt: string
  box: Box
  radius: number
  stroke: number
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
 * Pinned scroll scene of a stop (stage 3b): `length` = viewports of scroll the pin lasts (track =
 * 100svh + length × 100svh); `label` = what the scene shows, for assistive tech (role="img").
 */
export interface SceneData {
  length: number
  label: string
}

export interface SectionCopy {
  /** Anchor and hook name, e.g. "stop-01". */
  id: string
  eyebrow: string
  /** One string, or explicit lines where Figma breaks the heading by hand. */
  heading: string | string[]
  body?: string
}

export interface Photo {
  src1x: string
  src2x: string
  alt: string
  width: number
  height: number
}

/** Frame colour around screenshots: the shared --color-band-border (Figma "Grey/grey 300", #d5d7da). */
const stroke = 12

export const tmsCase = {
  number: '03',

  nav: {
    back: { label: 'Back', href: '/#works' },
    contact: { label: 'Get in touch', href: '/#contact' },
    allWork: { label: 'Back to all work', href: '/#works' },
  },

  /** 113:12822 */
  hero: {
    tagline: ['One workspace where a container’s whole journey lives on one screen,', 'for the teams who chase it all day.'],
    title: ['TMS platform for', 'a logistics company'],
    /** Below 760 (no Figma mobile design): three lines that fit 40 × --m at 320–759. */
    titleMobile: ['TMS platform', 'for a logistics', 'company'],
    meta: [
      { label: 'Role', value: 'UX/UI & Product designer' },
      { label: 'Industry', value: 'B2B SaaS · Logistics' },
      { label: 'Platform', value: 'Web app + mobile' },
      { label: 'Tools', value: 'Figma, FigJam' },
    ],
    /** 113:12841: teal gradient stage, dashboard 113:12842 with a 16px stroke, clipped at the bottom. */
    stage: {
      size: { width: 1432, height: 900 },
      shots: [
        {
          src1x: dashboard1x,
          src2x: dashboard2x,
          alt: 'TMS dashboard: shipment counters, a shipment status chart, containers by type and the task list',
          box: { x: 116, y: 120, width: 1200, height: 780 },
          radius: 24,
          stroke: 16,
        },
      ],
    } satisfies StageData,
  },

  /** 117:13219 */
  project: {
    copy: {
      id: 'project',
      eyebrow: 'The project',
      heading: ['A single platform for', 'a container’s whole journey'],
      body: 'An internal transport management system for a freight forwarding team that moves containers by sea. Four roles touch every shipment (sales, operations, and the head of the company) and each keeps their part in a different tool. The goal: one platform where every role sees the same shipment, but starts from its own day.',
    } satisfies SectionCopy,
    photo: {
      src1x: projectPhoto1x,
      src2x: projectPhoto2x,
      alt: 'Container terminal: cranes over a ship and stacks of containers by the road',
      width: 756,
      height: 480,
    } satisfies Photo,
  },

  /** 113:12848 */
  problem: {
    copy: {
      id: 'problem',
      eyebrow: 'The problem',
      heading: 'Five tools, one shipment',
      body: 'A single container passes through spreadsheets, email threads, carrier portals, a CRM and a folder of PDFs. The same client and booking get typed in again at every step, ETAs go stale between updates, and nobody sees at a glance which deal is stuck. When I worked in logistics, there was no one place to see my tasks and how each deal was moving.',
    } satisfies SectionCopy,
    /**
     * 113:12853: blurred photo (117:13298, 6px blur, stretched to fill), one window, five tilted tool
     * cards. Scroll scene (motion note 124:15): in this order each card flies into the window and adds
     * its row; then the window settles and the label shows. Below 760 the approved prototype: a 4:5
     * stage, window and card start positions (`mobile`, top-left) in % of the stage.
     */
    stage: {
      size: { width: 1432, height: 720 },
      ariaLabel:
        'Five tool cards — Excel tracker, email threads, carrier portal, CRM and PDF documents — fly into one TMS window as you scroll.',
      background: { src: problemBg, blur: 6 },
      window: {
        box: { x: 436, y: 180, width: 560, height: 360 },
        /** Below 760: the approved prototype's 4:5 stage, in %. */
        mobile: { x: 10, y: 28, width: 80, height: 44 },
        title: 'TMS',
        caption: 'status · documents · invoices · tasks',
      },
      endLabel: 'One shipment, one place',
      /**
       * Centre of each card's rotated bounding box (Figma), rotation in degrees (clockwise); `mobile`
       * top-left in % of the 4:5 mobile stage; `row` is what the card adds to the window.
       */
      tools: [
        { id: 'excel', label: 'Excel tracker', cx: 217.2, cy: 146.05, rotation: 8, mobile: { x: 6, y: 7 }, row: { label: 'Shipments & status', value: 'Booking' } },
        { id: 'email', label: 'Email threads', cx: 1170.18, cy: 104.41, rotation: -6, mobile: { x: 50, y: 12 }, row: { label: 'Tasks & comments', value: '3 open' } },
        { id: 'carrier', label: 'Carrier portal', cx: 188.73, cy: 546.45, rotation: -5, mobile: { x: 4, y: 80 }, row: { label: 'ETA & tracking', value: '26.08' } },
        { id: 'crm', label: 'CRM', cx: 1171.72, cy: 541.66, rotation: 6, mobile: { x: 62, y: 84 }, row: { label: 'Client: AgroFood Export' } },
        { id: 'pdf', label: 'PDF documents', cx: 707.85, cy: 642.23, rotation: 3, mobile: { x: 30, y: 90 }, row: { label: 'Documents & invoices', value: '4 files' } },
      ] as { id: string; label: string; cx: number; cy: number; rotation: number; mobile: { x: number; y: number }; row: { label: string; value?: string } }[],
    },
    /** 113:12867. Sources are linked in Figma. */
    stats: [
      {
        value: 68,
        suffix: '%',
        text: 'of freight teams juggle 5+ tools a day',
        source: 'Deep Current, 2026',
        href: 'https://www.thescxchange.com/tech-infrastructure/technology/survey-despite-ai-tools-freight-professionals-make-even-more-decisions-per-day',
      },
      {
        value: 70,
        suffix: '%+',
        text: 'of forwarders lose a quarter of the day to manual work',
        source: 'Ontegos Cloud, 2025',
        href: 'https://www.supplychain247.com/article/freight-forwarding-ai-optimism-vs-data-readiness',
      },
      {
        value: 37,
        suffix: '%',
        text: 'of companies can’t track cargo in transit',
        source: 'Tive, 2025',
        href: 'https://www.tive.com/press-release/new-research-from-tive-reveals-that-37-of-companies-cant-track-in-transit-cargo',
      },
    ],
  },

  /** 113:12880 */
  research: {
    copy: {
      id: 'research',
      eyebrow: 'The research',
      heading: 'Start from the work, not the screens',
      body: 'Before drawing anything I mapped who touches a shipment and what each of them needs to get done in a day. I compared four tools teams already use (CargoWise, SAP TM, Magaya and Bitrix24) and read their user reviews on G2. The pattern: every feature exists, but the tools are slow to learn, overloaded, and the same for every role. That gave the design three rules.',
    } satisfies SectionCopy,
    photo: {
      src1x: researchPhoto1x,
      src2x: researchPhoto2x,
      alt: 'Two CMA CGM containers on terminal trucks',
      width: 612,
      height: 320,
    } satisfies Photo,
    /** 113:12886 */
    insights: [
      { label: 'Insight 1', insight: 'Reviewers value having every shipment detail in one place', principle: 'One source of truth per shipment' },
      { label: 'Insight 2', insight: 'The top complaint: long onboarding and overloaded screens', principle: 'A calm UI with onboarding tips' },
      { label: 'Insight 3', insight: 'Every role is forced into the same rigid views', principle: 'A different starting point for each role' },
    ],
  },

  stops: {
    /** 117:13300 */
    sales: {
      copy: {
        id: 'stop-01',
        eyebrow: 'Who’s here: Sales manager',
        heading: 'Type once, use everywhere',
        body: 'The sales manager creates the shipment: client, route, ports, line, vessel and containers. Clients are picked from the existing list instead of being typed again, and every field entered here flows into documents and invoices later. New shipments land in the list with a Booking status, so operations can filter for what is new today.',
      } satisfies SectionCopy,
      scene: { length: 1.6, label: 'The new shipment form, then the Shipments list slides in over it and the new shipment’s Booking row is highlighted.' } satisfies SceneData,
      stage: {
        size: { width: 1432, height: 960 },
        shots: [
          {
            src1x: stop01Form1x,
            src2x: stop01Form2x,
            alt: 'New shipment form: customer, ports, line, vessel and dates, the container list and attached documents',
            box: { x: 80, y: 90, width: 760, height: 735.879 },
            radius: 24,
            stroke,
          },
          {
            src1x: stop01List1x,
            src2x: stop01List2x,
            alt: 'Shipments list with a status for each shipment; the new shipment FIFO-010 is in Booking',
            box: { x: 760, y: 330, width: 600, height: 412.698 },
            radius: 24,
            stroke,
          },
        ],
        notes: [
          { text: 'Client picked from the list — no retyping', x: 80, y: 890, width: 364 },
          { text: 'Status filter: what’s new today', x: 1073, y: 790, width: 287 },
        ],
      } satisfies StageData,
    },
    /** 120:13379 */
    handoff: {
      copy: {
        id: 'stop-02',
        eyebrow: 'Who’s here: Sales → Operations',
        heading: 'A notification, not a chat',
        body: 'The riskiest moment in a shipment is when sales passes it to operations. In most teams it happens in a message that gets buried. Here, creating the shipment notifies operations, and the notification opens it directly, with client, route and documents already filled in.',
      } satisfies SectionCopy,
      scene: { length: 1.2, label: 'The hand-off lights up from the sales manager to the TMS to the operations manager, then the notifications panel opens on the dashboard with the new shipment.' } satisfies SceneData,
      /** 120:13391, at (86, 100) in the stage, 1260 wide. */
      flow: {
        box: { x: 86, y: 100, width: 1260, height: 118 },
        steps: [
          { title: 'Sales manager', text: 'Creates the shipment', tone: 'light' as const },
          { title: 'TMS', text: 'Notifies operations', tone: 'dark' as const },
          { title: 'Operations manager', text: 'Opens it, already filled in', tone: 'light' as const },
        ],
      },
      stage: {
        size: { width: 1432, height: 960 },
        shots: [
          {
            src1x: stop02Notifications1x,
            src2x: stop02Notifications2x,
            alt: 'Dashboard with the notifications panel open: Andrii Tkachov has created a new shipment FIFO-010',
            box: { x: 262, y: 300, width: 907, height: 589.019 },
            radius: 24,
            stroke,
          },
        ],
        notes: [{ text: 'Opens the shipment, not a chat thread', x: 1010, y: 330, width: 350 }],
      } satisfies StageData,
    },
    /** 120:13449 */
    tasks: {
      copy: {
        id: 'stop-03',
        eyebrow: 'Who’s here: Operations manager',
        heading: 'Tasks first, charts later',
        body: 'Once the container is on its way, the operations manager’s job is to keep it moving. The dashboard leads with four counters and a task list sorted by priority (Book and fill in the shipment, Update ETA, Check BL) each linked to its shipment. On the phone, the same tasks and statuses fit into one scroll.',
      } satisfies SectionCopy,
      scene: { length: 1.2, label: 'The operations dashboard next to the same dashboard on a phone; the Tasks at work counter, the first task and its menu are highlighted in turn.' } satisfies SceneData,
      stage: {
        size: { width: 1432, height: 960 },
        shots: [
          {
            src1x: dashboard1x,
            src2x: dashboard2x,
            alt: 'Operations dashboard: four counters, shipment status and container charts, and the task list sorted by priority',
            box: { x: 80, y: 150, width: 1000, height: 650 },
            radius: 24,
            stroke,
          },
          {
            src1x: stop03Mobile1x,
            src2x: stop03Mobile2x,
            alt: 'The same dashboard on a phone: counters and the shipment status chart in one scroll',
            box: { x: 1122.881, y: 150, width: 244.238, height: 650 },
            radius: 24,
            stroke,
          },
        ],
        notes: [{ text: 'Tasks sorted by priority, each opens its shipment', x: 80, y: 850, width: 432 }],
      } satisfies StageData,
    },
    /** 120:13520 */
    shipment: {
      /** Image 27's General information tab, scaled to image 28's frame (they line up exactly). */
      general: { src1x: stop04General1x, src2x: stop04General2x },
      copy: {
        id: 'stop-04',
        eyebrow: 'Who’s here: Operations manager',
        heading: 'One shipment, one page',
        body: 'Documents, expenses and invoices used to live in separate files. Here they are tabs on the shipment’s own page: the header stays fixed while the content changes underneath. An invoice for the client is built from the shipment data in a couple of clicks, then saved or exported - nothing is typed twice.',
      } satisfies SectionCopy,
      scene: { length: 1.6, label: 'The shipment page switches from General information to Financial terms, then an invoice built from the shipment opens over it.' } satisfies SceneData,
      stage: {
        size: { width: 1432, height: 960 },
        shots: [
          {
            src1x: stop04Shipment1x,
            src2x: stop04Shipment2x,
            alt: 'Shipment page, Financial terms tab: customer, payer, payment status, rate and the expenses table',
            box: { x: 42.609, y: 201.169, width: 834.783, height: 542.167 },
            radius: 24,
            stroke,
          },
          {
            src1x: stop04Invoice1x,
            src2x: stop04Invoice2x,
            alt: 'Invoice FIFO-002 generated from the shipment data, open over the shipment page with Save and export buttons',
            box: { x: 705.699, y: 405.471, width: 676.488, height: 439.359 },
            radius: 24,
            stroke,
          },
        ],
        notes: [
          { text: 'Header stays put, tabs change below it', x: 80, y: 93, width: 355 },
          { text: 'Invoice built from shipment data', x: 1050, y: 823, width: 302 },
        ],
      } satisfies StageData,
    },
    /** 120:13588: the dashboard frame is centred in the stage; its right edge lines up with the note. */
    overview: {
      copy: {
        id: 'stop-05',
        eyebrow: 'Who’s here: Head of company',
        heading: 'Same data, read differently',
        body: 'The head of the company doesn’t wait for a report from the team. The shipments operations work with every day feed the dashboard charts (status split and container types) with a period switch from one month to a year. Nobody compiles anything by hand.',
      } satisfies SectionCopy,
      scene: { length: 1.2, label: 'The dashboard charts draw in, the period menu switches from 3 months to 1 year, and the charts redraw.' } satisfies SceneData,
      stage: {
        size: { width: 1432, height: 960 },
        shots: [
          {
            src1x: stop05Dashboard1x,
            src2x: stop05Dashboard2x,
            alt: 'Dashboard with the period menu open (1 month, 3 months, 9 months, 1 year) over the shipment status chart',
            box: { x: 165.426, y: 100.104, width: 1101.147, height: 715.163 },
            radius: 24,
            stroke,
          },
        ],
        notes: [{ text: 'One click from 1 month to 1 year', x: 965, y: 865, width: 301 }],
      } satisfies StageData,
    },
  },

  /** 120:13647 */
  edgeCases: {
    copy: {
      id: 'edge-cases',
      eyebrow: 'Empty lists, no results, small screens...',
      heading: 'No dead ends',
      body: 'A tool people use all day is judged by its edge cases. An empty list explains what will appear there and who creates it. A search with no results offers to clear the filters in one click instead of a dead end. On the phone, managers choose which columns they need, so a wide table still fits a narrow screen.',
    } satisfies SectionCopy,
    scene: { length: 1.2, label: 'Two empty states fan out — an empty shipments list and a search with no results — and on the phone the table columns are switched on one by one.' } satisfies SceneData,
    stage: {
      size: { width: 1432, height: 840 },
      shots: [
        {
          src1x: edgeEmpty1x,
          src2x: edgeEmpty2x,
          alt: 'Empty shipments list: “You don’t have any shipments yet” and when they will appear',
          box: { x: 80, y: 100, width: 560, height: 363.704 },
          radius: 24,
          stroke,
        },
        {
          src1x: edgeNoResults1x,
          src2x: edgeNoResults2x,
          alt: 'Search with no results: “Oops! We couldn’t find any results” and a Clear all filters button',
          box: { x: 320, y: 400, width: 560, height: 363.704 },
          radius: 24,
          stroke,
        },
        {
          src1x: edgeColumns1x,
          src2x: edgeColumns2x,
          alt: 'Phone screen Customize table view: a switch for each column, ID to Assigned manager',
          box: { x: 1020, y: 80, width: 300, height: 649.6 },
          radius: 24,
          stroke,
        },
      ],
      notes: [{ text: 'Every empty state says what to do next', x: 80, y: 40, width: 358 }],
    } satisfies StageData,
  },

  /** 120:13690: the home About component, static (full ink) for now. */
  result: {
    eyebrow: 'The result',
    text: 'A single workspace where a container’s status, documents and invoices stop living in five places, and each role starts from its own day. This is a self-initiated concept, not a shipped product, so there are no usage numbers. What I would measure first: how long it takes to create a shipment and hand it to operations, compared with today’s spreadsheets and email.',
  },
}
