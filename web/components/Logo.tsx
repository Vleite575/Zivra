// Zivra mark: a film frame with sprocket holes and a Z knocked out. Single color via currentColor.
export const MARK_PATH =
  'M7 0h18a7 7 0 0 1 7 7v18a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7V7a7 7 0 0 1 7-7Z' +
  'M3.5 3h3v2.4h-3ZM10.8 3h3v2.4h-3ZM18.2 3h3v2.4h-3ZM25.5 3h3v2.4h-3Z' +
  'M3.5 26.6h3V29h-3ZM10.8 26.6h3V29h-3ZM18.2 26.6h3V29h-3ZM25.5 26.6h3V29h-3Z' +
  'M8 8.5h16v2.9l-10.8 9.2H24v2.9H8v-2.9l10.8-9.2H8Z'

export function Mark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d={MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className="size-[1.15em]" />
      <span className="display lowercase leading-none">zivra</span>
    </span>
  )
}
