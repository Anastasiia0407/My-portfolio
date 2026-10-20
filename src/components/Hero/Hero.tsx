import type { CSSProperties } from 'react'
import Nav from '../Nav/Nav.tsx'
import MobileMenu from '../MobileMenu/MobileMenu.tsx'
import { owner } from '../../data/site.ts'
import { heroPhotoLayout, heroPhotoMobileLayout } from '../../data/figma-layout.generated.ts'
import heroPhoto from '../../assets/hero-photo.webp'
import heroPhotoMobile from '../../assets/hero-photo-mobile.webp'
import heroMask from '../../assets/hero-mask.svg'
import heroMaskMobile from '../../assets/hero-mask-mobile.svg'
import './Hero.css'

type PhotoLayout = typeof heroPhotoLayout | typeof heroPhotoMobileLayout

// Figma composition (desktop 61:183, mobile 66:271): photo rotated about the layer centre,
// masked by the "DESIGNER" vector, blended plus-lighter. Numbers come from build-images.mjs.
const photoStyle = (layout: PhotoLayout) =>
  ({
    '--photo-left': `${layout.boxPercent.left}%`,
    '--photo-top': `${layout.boxPercent.top}%`,
    '--photo-width': `${layout.boxPercent.width}%`,
    '--photo-height': `${layout.boxPercent.height}%`,
    '--photo-origin': `${layout.originPercent.x}% ${layout.originPercent.y}%`,
    '--photo-rotate': `${layout.rotationDeg}deg`,
  }) as CSSProperties

const maskStyle = (layout: PhotoLayout, mask: string) =>
  ({
    '--mask-url': `url("${mask}")`,
    '--mask-ratio': `${layout.view.width} / ${layout.view.height}`,
  }) as CSSProperties

export default function Hero() {
  const letters = [...owner.tagline]

  return (
    <header id="home" className="hero">
      <Nav />
      <MobileMenu />
      <h1 className="hero__title">
        <span className="sr-only">
          {owner.name}, {owner.role}
        </span>
        {/* Desktop (61:182): letters spread across the line. */}
        <span className="hero__tagline" aria-hidden="true">
          {letters.map((letter, index) => (
            <span key={index} className={letter === ' ' ? 'hero__space' : undefined}>
              {letter === ' ' ? ' ' : letter}
            </span>
          ))}
        </span>
        {/* Mobile (66:270): one tracked line, no spaces around the dot. */}
        <span className="hero__tagline-m" aria-hidden="true">
          {owner.tagline.replaceAll(' ', '')}
        </span>
        <span className="hero__role" style={maskStyle(heroPhotoLayout, heroMask)} aria-hidden="true">
          {/* width/height: the webp's intrinsic size (CSS sizes the box). */}
          <img
            className="hero__photo"
            style={photoStyle(heroPhotoLayout)}
            src={heroPhoto}
            width={733}
            height={237}
            alt=""
            decoding="async"
          />
        </span>
        <span
          className="hero__role hero__role-m"
          style={maskStyle(heroPhotoMobileLayout, heroMaskMobile)}
          aria-hidden="true"
        >
          <img
            className="hero__photo"
            style={photoStyle(heroPhotoMobileLayout)}
            src={heroPhotoMobile}
            width={742}
            height={243}
            alt=""
            decoding="async"
          />
        </span>
      </h1>
    </header>
  )
}
