/**
 * SocialTap case study content (Figma 177:279 "Case_SocialTap_desktop", 1512 × 14311; mobile 187:81).
 * Every text, image, stage position and note lives here; SocialTapCase.tsx only lays it out. Copy is
 * Figma's, verbatim. Stage geometry is in Figma px of each stage (1432 × 880).
 * Image alts describe the screenshots (they are not in Figma).
 */
import type { CaseHeroData, CaseNavData, CaseStatementData, FlipCardData, SceneData, SectionCopy, StageData, StageShot } from './types.ts'
import heroDiscovery1x from '../../assets/cases/socialtap/hero-discovery@1x.webp'
import heroDiscovery2x from '../../assets/cases/socialtap/hero-discovery@2x.webp'
import projectCampaigns1x from '../../assets/cases/socialtap/project-campaigns@1x.webp'
import projectCampaigns2x from '../../assets/cases/socialtap/project-campaigns@2x.webp'
import workedProfileDrawer1x from '../../assets/cases/socialtap/worked-profile-drawer@1x.webp'
import workedProfileDrawer2x from '../../assets/cases/socialtap/worked-profile-drawer@2x.webp'
import stop1BrandSearch1x from '../../assets/cases/socialtap/stop-01-brand-search@1x.webp'
import stop1BrandSearch2x from '../../assets/cases/socialtap/stop-01-brand-search@2x.webp'
import stop1CreatorSearch1x from '../../assets/cases/socialtap/stop-01-creator-search@1x.webp'
import stop1CreatorSearch2x from '../../assets/cases/socialtap/stop-01-creator-search@2x.webp'
import stop2Campaigns1x from '../../assets/cases/socialtap/stop-02-campaigns@1x.webp'
import stop2Campaigns2x from '../../assets/cases/socialtap/stop-02-campaigns@2x.webp'
import stop2CampaignCard1x from '../../assets/cases/socialtap/stop-02-campaign-card@1x.webp'
import stop2CampaignCard2x from '../../assets/cases/socialtap/stop-02-campaign-card@2x.webp'
import stop3CreatorProfile1x from '../../assets/cases/socialtap/stop-03-creator-profile@1x.webp'
import stop3CreatorProfile2x from '../../assets/cases/socialtap/stop-03-creator-profile@2x.webp'
import stop3CampaignDrawer1x from '../../assets/cases/socialtap/stop-03-campaign-drawer@1x.webp'
import stop3CampaignDrawer2x from '../../assets/cases/socialtap/stop-03-campaign-drawer@2x.webp'
import stop4AddService1x from '../../assets/cases/socialtap/stop-04-add-service@1x.webp'
import stop4AddService2x from '../../assets/cases/socialtap/stop-04-add-service@2x.webp'
import stop5Onboarding1x from '../../assets/cases/socialtap/stop-05-onboarding@1x.webp'
import stop5Onboarding2x from '../../assets/cases/socialtap/stop-05-onboarding@2x.webp'
import stop6Academy1x from '../../assets/cases/socialtap/stop-06-academy@1x.webp'
import stop6Academy2x from '../../assets/cases/socialtap/stop-06-academy@2x.webp'
import stop6Community1x from '../../assets/cases/socialtap/stop-06-community@1x.webp'
import stop6Community2x from '../../assets/cases/socialtap/stop-06-community@2x.webp'

/** Every screenshot has a 12px outside ring with Figma's pink → near-black gradient (177:279). */
const stroke = 12
const ring = 'gradient' as const

/** The six stages: 1432 × 880, a back screen and a front screen (or one screen) and two notes. */
const stageSize = { width: 1432, height: 880 }
const back = { x: 80, y: 90, width: 760, height: 491.3 }
const front = { x: 600, y: 300, width: 760, height: 491.3 }
const single = { x: 166, y: 84.3, width: 1100, height: 711.1 }

/**
 * A stage's scene (scenes.ts builds the motion for each kind): `two-screens` = back screen, then the
 * front screen slides in, then the notes; `drawer` = the same, the front sliding in from the stage edge;
 * `one-screen` = the screen, then the notes. `length` = viewports of pinned scroll.
 */
export interface SocialTapScene extends SceneData {
  kind: 'two-screens' | 'drawer' | 'one-screen'
  length: number
}

interface Stop {
  copy: SectionCopy
  scene: SocialTapScene
  stage: StageData
}

export const socialtapCase = {
  number: '02',

  nav: {
    back: { label: 'Back', href: '/#works' },
    contact: { label: 'Get in touch', href: '/#contact' },
    allWork: { label: 'Back to all work', href: '/#works' },
  } satisfies CaseNavData,

  /** 177:280 */
  hero: {
    tagline: ['An AI marketplace where brands find creators, run campaigns and pay,', 'and creators sell their services. Designed in an agency team.'],
    title: ['Social Tap - AI SaaS', 'marketplace'],
    /** 187:88 */
    titleMobile: ['Social Tap -', 'AI SaaS', 'marketplace'],
    meta: [
      { label: 'Role', value: 'UX/UI designer' },
      { label: 'Industry', value: 'AI SaaS · Influencer marketing' },
      { label: 'Platform', value: 'Web app' },
      { label: 'Tools', value: 'Figma, Figma Make, ChatGPT' },
    ],
    /** 177:304: dark gradient stage, image 38 (181:13895). */
    stage: {
      size: { width: 1432, height: 900 },
      shots: [{ src1x: heroDiscovery1x, src2x: heroDiscovery2x, alt: 'Discovery: AI search for creators, with filters on the left and creator cards with portfolio photos', box: { x: 116, y: 120, width: 1200, height: 775.78 }, stroke, ring }],
    },
  } satisfies CaseHeroData,

  /** 177:306 */
  project: {
    copy: {
      id: 'project',
      eyebrow: 'The project',
      heading: ['One product, two sides', 'of a campaign'],
      body: 'Social Tap is an AI platform for influencer marketing. Brands find creators, launch campaigns and pay. Creators sell services, make content with AI tools and get paid. I designed it at an agency, with a senior designer who led the project and reviewed my work.',
    } satisfies SectionCopy,
    /** 181:13912 image 41, 756 × 488.74. */
    shot: { src1x: projectCampaigns1x, src2x: projectCampaigns2x, alt: 'Campaign Tracking: campaign cards with status, budget, proposals and approvals', box: { x: 0, y: 0, width: 756, height: 488.74 }, stroke, ring } satisfies StageShot,
  },

  /** 181:13921 */
  part: {
    eyebrow: 'What was my part',
    text: 'I led UX and UI for Academy & Help and Community - the client reuses both in four other products - and for onboarding, AI search, campaign cards, adding a new service and the drawers with different info (creator’s profile, service proposal etc.) across the whole platform. For the other flows, I designed the UI on top of my partner’s UX and, in some cases, improved the functionality along the way.',
  } satisfies CaseStatementData,

  /** 177:347 */
  worked: {
    copy: {
      id: 'worked',
      eyebrow: 'How I worked',
      heading: 'Same patterns for both sides',
      body: 'Brands and creators look at the same campaign from opposite sides. Wherever a flow existed for both roles, I looked for the shared part first and designed it once, then adjusted the details per role. Three rules came out of it.',
    } satisfies SectionCopy,
    /** Flip cards 177:354 / 177:357 / 177:360; backs from motion note 184:101. */
    cards: [
      { label: 'Problem 1', text: 'Both sides open the same objects: a campaign, a profile, a proposal', backLabel: 'Rule 1', backText: 'One component, two points of view' },
      { label: 'Problem 2', text: 'Long forms with mixed required and optional fields make people quit', backLabel: 'Rule 2', backText: 'One topic per step, optional steps marked' },
      { label: 'Problem 3', text: 'Brands don’t know which of twenty filters matter', backLabel: 'Rule 3', backText: 'Describe the creator, let AI search' },
    ] satisfies FlipCardData[],
    /** 177:363: dark tile (704 × 320 at 1512; 361 × 194 at 393) with image 42 (181:13928) at (72, 72.26), 560 wide, clipped. */
    /** The pinned grid: image 42 slides in, then the three cards turn (viewports of pinned scroll). */
    pinLength: 1.2,
    tile: {
      size: { width: 704, height: 320 },
      shot: { src1x: workedProfileDrawer1x, src2x: workedProfileDrawer2x, alt: 'Discovery with the creator profile drawer open: stats, audience and portfolio', box: { x: 72, y: 72.26, width: 560, height: 362.03 }, stroke, ring } satisfies StageShot,
    },
  },

  stops: [
    /** 177:364 */
    {
      copy: {
        id: 'ai-search',
        eyebrow: 'Who’s here: brands and creators',
        heading: ['Describe it,', 'don’t filter it'],
        body: 'Brands rarely know which of twenty filters matter. In AI search, a brand describes the creator they need in plain words or by voice, and the results come back with a short reason for each match. Creators find campaigns the same way. When nothing fits, the empty state offers to edit the prompt or clear filters instead of a dead end.',
      },
      scene: { kind: 'two-screens', length: 1.2 },
      stage: {
        size: stageSize,
        shots: [
          { src1x: stop1BrandSearch1x, src2x: stop1BrandSearch2x, alt: 'AI search for a brand: a spoken prompt and matching creators, each with a reason for the match', box: back, stroke, ring },
          { src1x: stop1CreatorSearch1x, src2x: stop1CreatorSearch2x, alt: 'AI search for a creator: matching campaigns', box: front, stroke, ring },
        ],
        notes: [
          { text: 'Each match explains why it fits', x: 80, y: 800, width: 292 },
          { text: 'Same search pattern for both roles', x: 1038, y: 230, width: 322 },
        ],
      },
    },
    /** 177:379 */
    {
      copy: {
        id: 'campaign-cards',
        eyebrow: 'Who’s here: brands and creators',
        heading: ['One card, every', 'status'],
        body: 'A campaign lives for weeks: draft, hiring, active, in dispute, completed. I defined which statuses a card can have, grouped them into tabs, and decided what the card shows at each stage. While hiring, it shows budget and proposals; once live, performance and pending approvals. The same rules apply to the cards creators see.',
      },
      scene: { kind: 'two-screens', length: 1.2 },
      stage: {
        size: stageSize,
        shots: [
          { src1x: stop2Campaigns1x, src2x: stop2Campaigns2x, alt: 'Campaign Tracking: the Active tab with campaign cards showing budget, proposals and approvals', box: back, stroke, ring },
          { src1x: stop2CampaignCard1x, src2x: stop2CampaignCard2x, alt: 'Campaign Tracking: the Dispute tab with a campaign card in dispute', box: front, stroke, ring },
        ],
        notes: [
          { text: 'Tabs by stage: active, draft, dispute, completed', x: 80, y: 800, width: 420 },
          { text: 'Card content changes with the status', x: 1000, y: 230, width: 344 },
        ],
      },
    },
    /** 177:402 */
    {
      copy: {
        id: 'profile-drawer',
        eyebrow: 'Who’s here: brand → creator',
        heading: ['One drawer,', 'used everywhere'],
        body: 'Brands review a creator without leaving the search: stats, audience and content open in a side drawer. I built it as a component on the existing design system tokens and reused the same shell for the brand profile, an open campaign seen by a creator, and a creator’s proposal seen by a brand. One pattern to learn, four places to use it.',
      },
      scene: { kind: 'drawer', length: 1.2 },
      stage: {
        size: stageSize,
        shots: [
          { src1x: stop3CreatorProfile1x, src2x: stop3CreatorProfile2x, alt: 'Discovery with the creator profile drawer: performance overview, audience and content', box: back, stroke, ring },
          { src1x: stop3CampaignDrawer1x, src2x: stop3CampaignDrawer2x, alt: 'The same drawer for a creator: an open campaign with its budget, platforms and requirements', box: front, stroke, ring },
        ],
        notes: [
          { text: 'Built on existing design tokens', x: 80, y: 800, width: 289 },
          { text: 'Same shell: creator, brand, campaign, proposal', x: 940, y: 230, width: 414 },
        ],
      },
    },
    /** 177:414 */
    {
      copy: {
        id: 'add-service',
        eyebrow: 'Who’s here: creator',
        heading: ['Steps, not a wall', 'of fields'],
        body: 'A creator’s service has details, pricing, payment setup, examples and requirements for the brand. I split it into collapsible steps with one topic each and marked which are optional. A checklist at the bottom shows what is left before the service can be published, and a draft can be saved at any point.',
      },
      scene: { kind: 'one-screen', length: 1 },
      stage: {
        size: stageSize,
        shots: [
          { src1x: stop4AddService1x, src2x: stop4AddService2x, alt: 'Add New Service: collapsible steps with green checks, the optional Service Examples step open, and what is left to publish', box: single, stroke, ring },
        ],
        notes: [
          { text: 'Optional steps are marked', x: 1100, y: 298.3, width: 258 },
          { text: 'Shows what is left to publish', x: 852, y: 703.3, width: 276 },
        ],
      },
    },
    /** 177:429 */
    {
      copy: {
        id: 'onboarding',
        eyebrow: 'Who’s here: brands and creators',
        heading: 'Show only what starts the work',
        body: 'The product has a lot of features, but a new user needs one result first. The tour for brands points to finding creators and launching the first campaign; for creators, to finishing the profile and adding a service. It can be skipped at any step, and a brand that has already launched a campaign gets a shorter path.',
      },
      scene: { kind: 'one-screen', length: 1 },
      stage: {
        size: stageSize,
        shots: [
          { src1x: stop5Onboarding1x, src2x: stop5Onboarding2x, alt: 'Onboarding: the Skip the tour? dialog over the Discovery page', box: { x: 166, y: 84, width: 1100, height: 711.1 }, stroke, ring },
        ],
        notes: [
          { text: 'One goal per role', x: 80, y: 800, width: 187 },
          { text: 'Skippable at every step', x: 1080, y: 230, width: 236 },
        ],
      },
    },
    /** 177:440 */
    {
      copy: {
        id: 'academy',
        eyebrow: 'Who’s here: brands and creators',
        heading: 'Built once, used in four products',
        body: 'Academy & Help and Community were mine end to end: lessons with progress, support tickets, a feed with posts, comments and member profiles. The client uses them across four other products, so every screen had to work for any role and any brand. A switcher shows how the same flow serves brands and creators.',
      },
      scene: { kind: 'two-screens', length: 1.2 },
      stage: {
        size: stageSize,
        shots: [
          { src1x: stop6Academy1x, src2x: stop6Academy2x, alt: 'Academy: lessons with progress and a getting-started course', box: back, stroke, ring },
          { src1x: stop6Community1x, src2x: stop6Community2x, alt: 'Community: a feed with posts, comments and a video', box: front, stroke, ring },
        ],
        notes: [
          { text: 'Reused in 4 client products', x: 80, y: 800, width: 265 },
          { text: 'Same flow for brands and creators', x: 1020, y: 230, width: 320 },
        ],
      },
    },
  ] satisfies Stop[],

  /** 177:453 */
  result: {
    eyebrow: 'The result',
    text: 'My flows went to development as part of the full product handoff, and Academy & Help and Community now run in four more of the client’s products. I don’t have post-launch numbers. What I took from it: designing inside an existing design system, getting every screen reviewed by a senior designer, and building flows that other products can reuse.',
  } satisfies CaseStatementData,
}

