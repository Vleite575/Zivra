'use client'
import { useEffect, useRef } from 'react'
import { postMedia, type Post } from '@/lib/api'
import { IconClose, IconComment, IconLoop } from './icons'

/** Masonry grid of post tiles (profile, activity). Clicking a tile calls onOpen. */
export function PostGrid({ posts, onOpen }: { posts: Post[]; onOpen: (id: number) => void }) {
  return (
    <ol aria-label="Posts" className="mx-auto max-w-4xl columns-2 gap-1 px-1 pb-8 sm:columns-3 sm:gap-4 sm:px-4">
      {posts.map((p) => (
        <li key={p.id} className="mb-1 break-inside-avoid sm:mb-4">
          <button onClick={() => onOpen(p.id)} className="group relative block w-full overflow-hidden text-left sm:rounded-xl" aria-label={`Abrir post: ${p.content.slice(0, 60)}`}>
            {p.media_path
              ? (p.media_type === 'video'
                ? <video src={postMedia(p)} preload="metadata" muted className="w-full bg-black" />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={postMedia(p)} alt="" loading="lazy" className="w-full" />)
              : <span className="line-clamp-6 block bg-envelope p-4 text-lg font-semibold leading-snug text-on-envelope">{p.content}</span>}
            <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="flex items-center gap-1"><IconLoop className="size-4" />{p.likes_count}</span>
              <span className="flex items-center gap-1"><IconComment className="size-4" />{p.comments_count}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Native <dialog> sheet: bottom sheet on mobile, centered panel on desktop. */
export function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()} aria-label={label}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none rounded-t-lg bg-paper p-0 text-ink backdrop:bg-film/70 sm:m-auto sm:max-w-xl sm:rounded-lg">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-4 py-3">
        <h2 className="wide font-bold">{label}</h2>
        <button onClick={() => ref.current?.close()} aria-label="Fechar" className="rounded p-1.5 hover:bg-ink/5"><IconClose className="size-5" /></button>
      </div>
      <div className="px-4 sm:px-6">{children}</div>
    </dialog>
  )
}

