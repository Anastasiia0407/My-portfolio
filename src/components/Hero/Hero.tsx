import type { CSSProperties } from 'react'
import Nav from '../Nav/Nav.tsx'
import { owner } from '../../data/site.ts'
import { heroPhotoLayout as photo } from '../../data/figma-layout.generated.ts'
import heroPhoto from '../../assets/hero-photo.webp'
import heroMask from '../../assets/hero-mask.svg'
import './Hero.css'

// Figma composition (37:10): photo rotated about the layer centre, masked by the
// "UX/UI DESIGNER" vector, blended plus-lighter. Numbers come from build-images.mjs.
const photoStyle = {
  '--photo-left': `${photo.boxPercent.left}%`,
  '--photo-top': `${photo.boxPercent.top}%`,
  '--photo-width': `${photo.boxPercent.width}%`,
  '--photo-height': `${photo.boxPercent.height}%`,
  '--photo-origin': `${photo.originPercent.x}% ${photo.originPercent.y}%`,
  '--photo-rotate': `${photo.rotationDeg}deg`,
} as CSSProperties

const maskStyle = {
  '--mask-url': `url("${heroMask}")`,
  aspectRatio: `${photo.view.width} / ${photo.view.height}`,
} as CSSProperties

export default function Hero() {
  const letters = [...owner.name.toUpperCase()]

  return (
    <header id="home" className="hero">
      <Nav />
      <h1 className="hero__title">
        <span className="sr-only">
          {owner.name}, {owner.role}
        </span>
        <span className="hero__name" aria-hidden="true">
          {letters.map((letter, index) => (
            <span key={index} className={letter === ' ' ? 'hero__space' : undefined}>
              {letter === ' ' ? ' ' : letter}
            </span>
          ))}
        </span>
        <span className="hero__role" style={maskStyle} aria-hidden="true">
          <img className="hero__photo" style={photoStyle} src={heroPhoto} alt="" decoding="async" />
        </span>
      </h1>
    </header>
  )
}
