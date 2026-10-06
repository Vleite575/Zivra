// Zivra mark: a yellow film frame with navy sprocket holes and a heavy Z. Fixed brand colors, works on light and dark.
const SPROCKETS =
  'M3.5 3h3v2.4h-3ZM10.8 3h3v2.4h-3ZM18.2 3h3v2.4h-3ZM25.5 3h3v2.4h-3Z' +
  'M3.5 26.6h3V29h-3ZM10.8 26.6h3V29h-3ZM18.2 26.6h3V29h-3ZM25.5 26.6h3V29h-3Z'
const Z = 'M7.5 8h17v3.6L14.3 20.4h10.2V24h-17v-3.6L17.7 11.6H7.5Z'

export function Mark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#ffc629" />
      <path d={SPROCKETS + Z} fill="#1b1f3b" />
    </svg>
  )
}

/** Lockup: the mark tilted like a sticker, then the wordmark with a yellow square dot on the i. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.28em] ${className}`}>
      <Mark className="size-[1.2em] -rotate-8" />
      <span className="sr-only">Zivra</span>
      <span aria-hidden="true" className="display leading-none">
        z<span className="relative after:absolute after:left-1/2 after:top-[-0.02em] after:size-[0.24em] after:-translate-x-1/2 after:rounded-[0.05em] after:bg-envelope">ı</span>vra
      </span>
    </span>
  )
}
