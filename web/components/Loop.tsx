// Red grease-pencil loop drawn around a print: the like mark. Animates its stroke when `drawn` turns true.
export function Loop({ drawn, className = '' }: { drawn: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
      className={`pointer-events-none absolute -inset-[6%] h-[112%] w-[112%] overflow-visible ${className}`}>
      <path
        d="M54 4C80 5 97 22 96 50c-1 29-22 46-48 46C21 96 3 78 4 50 5 22 25 4 52 5c8 0 15 2 20 5"
        fill="none" stroke="var(--pencil)" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke"
        pathLength={1} strokeDasharray={1} strokeDashoffset={drawn ? 0 : 1}
        style={{ transition: 'stroke-dashoffset 520ms var(--ease-out-expo)', strokeWidth: 3.5 }}
      />
    </svg>
  )
}
