// Interface icons: 24px grid, 1.75 stroke, round caps. Authored for Zivra, no icon library.
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
const I = (d: string) => function Icon(p: P) { return <svg {...base} width="1em" height="1em" {...p}><path d={d} /></svg> }

/** Stack of prints: the feed */
export const IconFeed = I('M6 7.5h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V9A1.5 1.5 0 0 1 6 7.5ZM7 4.5h10M4.5 15l4-3.5 3.5 3 2.5-2 5 3.5')
export const IconUser = I('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0')
/** Lab envelope: follow requests */
export const IconEnvelope = I('M4.5 6.5h15v12h-15ZM4.5 6.5l7.5 6 7.5-6M8 15.5h3')
export const IconSettings = I('M5 7h9M18 7h1M5 17h1M10 17h9M16 5v4M8 15v4')
export const IconLogout = I('M14 4.5H7A1.5 1.5 0 0 0 5.5 6v12A1.5 1.5 0 0 0 7 19.5h7M10.5 12h9M16.5 8.5 20 12l-3.5 3.5')
export const IconComment = I('M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4 3.5V16h-.5A1.5 1.5 0 0 1 5 14.5Z')
export const IconCamera = I('M4.5 8.5A1.5 1.5 0 0 1 6 7h2l1.5-2h5L16 7h2a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 17ZM12 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z')
export const IconLock = I('M6.5 11h11v8.5h-11ZM8.5 11V8a3.5 3.5 0 0 1 7 0v3')
export const IconCheck = I('M5 12.5 9.5 17 19 7.5')
export const IconClose = I('M6 6l12 12M18 6 6 18')
export const IconTrash = I('M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7')
export const IconSearch = I('M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM15.5 15.5 20 20')
export const IconPlus = I('M12 5v14M5 12h14')
/** Grease-pencil loop: the like mark */
export const IconLoop = I('M12.5 5.2c4.6.2 7.3 2.7 7 6.4-.3 4-4.2 7-8.6 6.9-4.2-.1-7-2.6-6.9-6 .1-3.7 3.6-6.6 8.3-6.9 1.4-.1 2.6.1 3.6.5')
