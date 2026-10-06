// A developed print: photo on white paper border with a film edge code underneath.
import { IconFrameArrow } from './icons'

export function FrameCode({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span className={`edge inline-flex items-center gap-1 text-xs ${className}`}>
      {String(n).padStart(2, '0')}A <IconFrameArrow />
    </span>
  )
}

export function Print({ src, alt, n, caption, className = '', children }: {
  src: string; alt: string; n?: number; caption?: string; className?: string; children?: React.ReactNode
}) {
  return (
    <figure className={`relative bg-white p-[5%] pb-3 shadow-[0_18px_40px_-18px_rgb(27_31_59/0.45)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-[4/5] w-full object-cover" loading="lazy" />
      {(n !== undefined || caption) && (
        <figcaption className="mt-2 flex items-center justify-between gap-2 text-on-envelope/70">
          {caption && <span className="truncate text-sm font-semibold text-on-envelope">{caption}</span>}
          {n !== undefined && <FrameCode n={n} />}
        </figcaption>
      )}
      {children}
    </figure>
  )
}
