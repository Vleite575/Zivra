import { media } from '@/lib/api'

export function Avatar({ path, name, size = 'size-9' }: { path: string | null; name: string; size?: string }) {
  return path
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={media(path)} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
    : <span aria-hidden="true" className={`${size} grid shrink-0 place-items-center rounded-full bg-envelope text-sm font-bold text-on-envelope uppercase`}>{name.slice(0, 1)}</span>
}
