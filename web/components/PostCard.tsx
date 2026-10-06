'use client'
import { useState } from 'react'
import { api, postMedia, profileHref, useMe, type Comment, type Post } from '@/lib/api'
import { Avatar } from './Avatar'
import { IconComment, IconLoop, IconTrash } from './icons'

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
export function ago(iso: string) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unit, sec] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]] as const) {
    if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), unit)
  }
  return 'agora'
}

export function PostCard({ post, onChange, onDelete }: { post: Post; onChange: (p: Post) => void; onDelete?: (id: number) => void }) {
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

  async function removePost() {
    if (!confirm('Apagar este post? Não dá pra desfazer.')) return
    await api(`/api/posts/${post.id}`, { method: 'DELETE' })
    onDelete?.(post.id)
  }

  async function remove(id: number) {
    await api(`/api/comments/${id}`, { method: 'DELETE' })
    onChange({ ...post, comments: post.comments.filter((c) => c.id !== id), comments_count: post.comments_count - 1 })
  }

  return (
    <article className="overflow-hidden border-line bg-print sm:rounded-xl sm:border" aria-labelledby={`post-${post.id}`}>
      <header className="flex items-center gap-3 px-4 py-3">
        <a href={profileHref(post.user.username)}><Avatar path={post.user.profile_photo_path} name={post.user.name} size="size-8" /></a>
        <div className="min-w-0 flex-1 leading-tight">
          <a id={`post-${post.id}`} href={profileHref(post.user.username)} className="font-semibold hover:underline">{post.user.username}</a>
          <span className="text-ink-soft"> · <time dateTime={post.created_at}>{ago(post.created_at)}</time></span>
        </div>
        {me?.id === post.user.id && onDelete && (
          <button onClick={removePost} aria-label="Apagar post" className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 hover:text-pencil">
            <IconTrash className="size-5" />
          </button>
        )}
      </header>

      {post.media_path ? (
        <div className="relative bg-black">
          {post.media_type === 'video'
            ? <video src={postMedia(post)} controls playsInline preload="metadata" className="max-h-[80vh] w-full" />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={postMedia(post)} alt={`Foto de @${post.user.username}`} className="max-h-[80vh] w-full object-contain" loading="lazy" onDoubleClick={() => !post.is_liked && like()} />}
        </div>
      ) : (
        <p className="relative whitespace-pre-line px-4 pb-2 text-xl font-semibold leading-snug">{post.content}</p>
      )}

      <div className="flex items-center gap-1 px-2 pt-1">
        <button onClick={like} disabled={!me} aria-pressed={post.is_liked} aria-label={post.is_liked ? 'Tirar curtida' : 'Curtir'}
          className={`rounded-lg p-2 transition-colors hover:bg-ink/5 ${post.is_liked ? 'text-pencil' : ''}`}>
          <IconLoop className="size-7" />
        </button>
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Comentários" className="rounded-lg p-2 hover:bg-ink/5">
          <IconComment className="size-7" />
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="font-semibold">{post.likes_count} {post.likes_count === 1 ? 'curtida' : 'curtidas'}</p>
        {post.media_path && (
          <p className="mt-1 whitespace-pre-line"><a href={profileHref(post.user.username)} className="mr-1.5 font-semibold">{post.user.username}</a>{post.content}</p>
        )}
        {post.comments_count > 0 && !open && (
          <button onClick={() => setOpen(true)} className="mt-1 text-ink-soft">
            {post.comments_count === 1 ? 'Ver 1 comentário' : `Ver os ${post.comments_count} comentários`}
          </button>
        )}

        {open && (
          <div className="mt-2">
            <ul className="flex flex-col gap-2">
              {post.comments.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <p className="flex-1"><a href={profileHref(c.user.username)} className="mr-1.5 font-semibold hover:underline">{c.user.username}</a>{c.content}</p>
                  {me?.id === c.user_id && (
                    <button onClick={() => remove(c.id)} aria-label="Apagar comentário" className="rounded p-1 text-ink-soft hover:text-pencil">
                      <IconTrash className="size-4" />
                    </button>
                  )}
                </li>
              ))}
              {post.comments.length === 0 && <li className="text-sm text-ink-soft">Nenhum comentário ainda.</li>}
            </ul>
          </div>
        )}
        {me && (
          <form onSubmit={comment} className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <label htmlFor={`c-${post.id}`} className="sr-only">Adicione um comentário</label>
            <input id={`c-${post.id}`} value={text} onChange={(e) => { setText(e.target.value); setOpen(true) }} maxLength={1000} placeholder="Adicione um comentário…"
              className="min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-ink-soft" />
            <button disabled={busy || !text.trim()} className="font-semibold text-on-envelope disabled:opacity-0 dark:text-envelope">Publicar</button>
          </form>
        )}
      </div>
    </article>
  )
}
