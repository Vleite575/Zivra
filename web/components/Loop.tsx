'use client'
import { useId } from 'react'

// Red grease-pencil loop drawn around a print: the like mark. Animates its stroke when `drawn` turns true.
// Waxy edge comes from a turbulence displacement plus a second, offset pass of the same stroke.
// No vector-effect: non-scaling strokes break pathLength-based dashes in Chromium.
const D = 'M54 4C80 5 97 22 96 50c-1 29-22 46-48 46C21 96 3 78 4 50 5 22 25 4 52 5c8 0 15 2 20 5'

export function Loop({ drawn, className = '' }: { drawn: boolean; className?: string }) {
  const id = useId().replace(/:/g, '')
  const stroke = (width: number, opacity: number, shift = 0) => (
    <path d={D} transform={shift ? `translate(${shift} ${-shift})` : undefined} fill="none" stroke="var(--pencil)" strokeLinecap="round"
      pathLength={1} strokeDasharray={1} strokeDashoffset={drawn ? 0 : 1}
      style={{ transition: 'stroke-dashoffset 520ms var(--ease-out-expo), opacity 120ms', strokeWidth: width, opacity: drawn ? opacity : 0 }} />
  )
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
      className={`pointer-events-none absolute -inset-[6%] h-[112%] w-[112%] overflow-visible ${className}`}>
      <defs>
        <filter id={`wax-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.1" />
        </filter>
      </defs>
      <g filter={`url(#wax-${id})`}>
        {stroke(1.5, 0.95)}
        {stroke(0.7, 0.55, 0.45)}
      </g>
    </svg>
  )
}
