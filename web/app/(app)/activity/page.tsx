'use client'
import { useState } from 'react'
import { profileHref, useApi, type Comment, type Post, type User } from '@/lib/api'
import { Avatar } from '@/components/Avatar'
import { ago, PostCard } from '@/components/PostCard'
import { PostGrid, Sheet } from '@/components/PostGrid'

type Liked<T> = T & { liked_at: string }
type PostRef = { id: number; user: User }
type ActivityData = {
  liked_posts: Liked<Post>[]; liked_posts_count: number
  comments: (Comment & { post: PostRef })[]; comments_count: number
  liked_comments: Liked<Comment & { post: PostRef }>[]; liked_comments_count: number
}
type Kind = 'liked_posts' | 'comments' | 'liked_comments'
const KINDS: [Kind, string][] = [['liked_posts', 'Posts curtidos'], ['comments', 'Comentários feitos'], ['liked_comments', 'Comentários curtidos']]
const postHref = (p: PostRef) => `${profileHref(p.user.username)}?p=${p.id}`


/** Your own activity: what you liked and commented, newest first with a toggle to flip. */
export default function Activity() {
  const [kind, setKind] = useState<Kind>('liked_posts')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const { data, error, setData } = useApi<ActivityData>(`/api/me/activity?sort=${sort}`)
  return (
    <div className="mx-auto w-full max-w-[600px] px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-bold">Sua atividade</h1>
      <p className="mt-1 text-ink-soft">Só você vê esta página.</p>
      <div role="tablist" aria-label="Tipo de atividade" className="mt-6 grid grid-cols-3 gap-2">
        {KINDS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className="rounded-xl border border-line bg-print px-3 py-3 text-left transition-colors hover:bg-ink/5 aria-selected:border-ink">
            <span className="block text-2xl font-bold tabular-nums">{data ? data[`${k}_count`] : '–'}</span>
            <span className="block text-sm leading-tight text-ink-soft">{label}</span>
          </button>
        ))}
      </div>
      <label className="mt-6 flex items-center gap-2 text-sm">
        Ordem
        <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className="rounded border border-line bg-transparent px-2 py-1">
          <option value="newest">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
        </select>
      </label>
      <div role="tabpanel" className="mt-3">
        {error && <p className="py-8 text-center text-ink-soft">Não deu pra carregar. Atualize a página.</p>}
        {!data && !error && <p className="py-8 text-center text-ink-soft" aria-live="polite">Carregando…</p>}
        {data && <ActivityList data={data} kind={kind} setData={setData} />}
      </div>
    </div>
  )
}

function ActivityList({ data, kind, setData }: { data: ActivityData; kind: Kind; setData: (d: ActivityData) => void }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const row = 'flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-ink/5'
  const items = data[kind]
  if (items.length === 0) return <p className="py-8 text-center text-ink-soft">Nada por aqui ainda.</p>
  if (kind === 'liked_posts') {
    const update = (p: Post) => setData({ ...data, liked_posts: data.liked_posts.map((x) => (x.id === p.id ? { ...x, ...p } : x)) })
    const selected = data.liked_posts.find((p) => p.id === openId)
    return (
      <div className="-mx-4">
        <PostGrid posts={data.liked_posts} onOpen={setOpenId} />
        {selected && <Sheet onClose={() => setOpenId(null)} label={`Post de @${selected.user.username}`}><PostCard post={selected} onChange={update} /></Sheet>}
      </div>
    )
  }
  return (
    <ul className="flex flex-col">
      {kind === 'comments' && data.comments.map((c) => (
        <li key={c.id}>
          <a href={postHref(c.post)} className={row}>
            <Avatar path={c.post.user.profile_photo_path} name={c.post.user.name} size="size-9" />
            <span className="min-w-0 flex-1">
              <span className="block break-words">{c.content}</span>
              <span className="text-xs text-ink-soft">no post de @{c.post.user.username} · <time dateTime={c.created_at}>{ago(c.created_at)}</time>
                {c.likes_count > 0 && ` · ${c.likes_count} ${c.likes_count === 1 ? 'curtida' : 'curtidas'}`}</span>
            </span>
          </a>
        </li>
      ))}
      {kind === 'liked_comments' && data.liked_comments.map((c) => (
        <li key={c.id}>
          <a href={postHref(c.post)} className={row}>
            <Avatar path={c.user.profile_photo_path} name={c.user.name} size="size-9" />
            <span className="min-w-0 flex-1">
              <span className="block break-words"><span className="mr-1.5 font-semibold">{c.user.username}</span>{c.content}</span>
              <span className="text-xs text-ink-soft">no post de @{c.post.user.username} · curtido <time dateTime={c.liked_at}>{ago(c.liked_at)}</time></span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

