import { media } from '@/lib/api'

export function Avatar({ path, name, size = 'size-9' }: { path: string | null; name: string; size?: string }) {
  return path
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={media(path)} alt="" className={`${size} shrink-0 rounded-full object-cover ring-2 ring-print`} />
    : <span aria-hidden="true" className={`${size} wide grid shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper uppercase`}>{name.slice(0, 1)}</span>
}
