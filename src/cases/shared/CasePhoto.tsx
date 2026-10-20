import { useRef } from 'react'
import type { Photo } from '../../data/cases/types.ts'
import { useParallax } from '../../motion/hooks.ts'

/**
 * Photo in a fixed-ratio frame that clips it (117:13235, 157:13855); slow parallax inside the frame,
 * plus an optional scale from `zoom` to 1 (the 03 tile).
 */
export default function CasePhoto({ photo, zoom }: { photo: Photo; zoom?: number }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  useParallax(frameRef, imageRef, 0.1, zoom)
  return (
    <div ref={frameRef} className="case-photo" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
      <img
        ref={imageRef}
        className="case-photo__image"
        src={photo.src1x}
        srcSet={`${photo.src1x} 1x, ${photo.src2x} 2x`}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
