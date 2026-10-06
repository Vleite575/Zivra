'use client'
import { useState } from 'react'
import { api, media, profileHref, useMe, type Comment, type Post } from '@/lib/api'
import { Avatar } from './Avatar'
import { Loop } from './Loop'
import { FrameCode } from './Print'
import { IconComment, IconLoop, IconTrash } from './icons'

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
export function ago(iso: string) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unit, sec] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]] as const) {
    if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit)
  }
  return 'agora'
}

export function PostCard({ post, onChange }: { post: Post; onChange: (p: Post) => void }) {
  const { me } = useMe()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function like() {
    if (!me) return
    onChange({ ...post, is_liked: !post.is_liked, likes_count: post.likes_count + (post.is_liked ? -1 : 1) })
    try {
      const r = await api<{ liked: boolean; likes_count: number }>(`/api/posts/${post.id}/like`, { method: 'POST' })
      onChange({ ...post, is_liked: r.liked, likes_count: r.likes_count })
    } catch { onChange(post) }
  }

  async function comment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    try {
      const c = await api<Comment>(`/api/posts/${post.id}/comments`, { method: 'POST', body: JSON.stringify({ content: text }) })
      onChange({ ...post, comments: [...post.comments, c], comments_count: post.comments_count + 1 })
      setText('')
    } finally { setBusy(false) }
  }

  async function remove(id: number) {
    await api(`/api/comments/${id}`, { method: 'DELETE' })
    onChange({ ...post, comments: post.comments.filter((c) => c.id !== id), comments_count: post.comments_count - 1 })
  }

  return (
    <article className="py-6" aria-labelledby={`post-${post.id}`}>
      <header className="mb-3 flex items-center gap-3">
        <a href={profileHref(post.user.username)}><Avatar path={post.user.profile_photo_path} name={post.user.name} /></a>
        <div className="min-w-0 flex-1 leading-tight">
          <a id={`post-${post.id}`} href={profileHref(post.user.username)} className="block truncate font-bold hover:underline">{post.user.name}</a>
          <span className="text-sm text-ink-soft">@{post.user.username} · <time dateTime={post.created_at}>{ago(post.created_at)}</time></span>
        </div>
      </header>

      <div className="relative bg-white p-3 pb-4 text-on-envelope shadow-[0_18px_40px_-22px_rgb(27_31_59/0.5)] sm:p-4">
        {post.media_path && (post.media_type === 'video'
          ? <video src={media(post.media_path)} controls playsInline preload="metadata" className="w-full bg-film" />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={media(post.media_path)} alt={`Foto de @${post.user.username}`} className="max-h-[70vh] w-full object-cover" loading="lazy" onDoubleClick={() => !post.is_liked && like()} />)}
        <p className={post.media_path ? 'mt-3 whitespace-pre-line text-[15px] leading-relaxed' : 'wide whitespace-pre-line px-1 py-6 text-2xl font-bold leading-snug'}>{post.content}</p>
        <div className="mt-2 flex justify-end text-on-envelope/60"><FrameCode n={post.id} /></div>
        <Loop drawn={post.is_liked} />
      </div>

      <div className="mt-3 flex items-center gap-1">
        <button onClick={like} disabled={!me} aria-pressed={post.is_liked} aria-label={post.is_liked ? 'Tirar curtida' : 'Curtir'}
          className={`flex items-center gap-1.5 rounded-md px-2 py-2 font-semibold transition-colors hover:bg-ink/5 ${post.is_liked ? 'text-pencil' : ''}`}>
          <IconLoop className="size-6" />{post.likes_count}
        </button>
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Comentários"
          className="flex items-center gap-1.5 rounded-md px-2 py-2 font-semibold hover:bg-ink/5">
          <IconComment className="size-6" />{post.comments_count}
        </button>
      </div>

      {open && (
        <div className="mt-2 border-l border-line pl-4">
          <ul className="flex flex-col gap-3">
            {post.comments.map((c) => (
              <li key={c.id} className="group flex items-start gap-2 text-[15px]">
                <p className="flex-1"><a href={profileHref(c.user.username)} className="mr-1.5 font-bold hover:underline">{c.user.username}</a>{c.content}</p>
                {me?.id === c.user_id && (
                  <button onClick={() => remove(c.id)} aria-label="Apagar comentário" className="rounded p-1 text-ink-soft hover:text-pencil">
                    <IconTrash className="size-4" />
                  </button>
                )}
              </li>
            ))}
            {post.comments.length === 0 && <li className="text-sm text-ink-soft">Nenhum comentário ainda.</li>}
          </ul>
          {me && (
            <form onSubmit={comment} className="mt-3 flex items-center gap-2">
              <label htmlFor={`c-${post.id}`} className="sr-only">Escreva um comentário</label>
              <input id={`c-${post.id}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Escreva um comentário"
                className="min-w-0 flex-1 border-b-2 border-line bg-transparent py-2 outline-none focus:border-ink" />
              <button disabled={busy || !text.trim()} className="rounded-md px-3 py-2 font-bold disabled:opacity-40">Enviar</button>
            </form>
          )}
        </div>
      )}
    </article>
  )
}
