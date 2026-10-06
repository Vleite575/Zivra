'use client'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, BASE, postMedia, profileHref, useApi, useMe, type Post, type Profile, type User } from '@/lib/api'
import { Shell } from '@/components/Shell'
import { Avatar } from '@/components/Avatar'
import { PostCard } from '@/components/PostCard'
import { IconClose, IconComment, IconLock, IconLoop } from '@/components/icons'


/**
 * Public profile at /{username}. Static export has no dynamic routes, so Apache rewrites
 * every single-segment path to this page and the nick is read from the browser URL.
 */
const nickFromUrl = () => decodeURIComponent(location.pathname.slice(BASE.length).split('/').filter(Boolean)[0] ?? '')
const noop = () => () => {}

export default function ProfilePage() {
  const { me } = useMe()
  const username = useSyncExternalStore(noop, nickFromUrl, () => '')
  if (me === undefined || !username) return null
  return <Shell me={me}><Suspense><ProfileView username={username} /></Suspense></Shell>
}

function LoginLink({ username, className, children }: { username: string; className: string; children: React.ReactNode }) {
  return <Link href={`/login?redirect=${encodeURIComponent(`/${username}`)}`} className={className}>{children}</Link>
}

function ProfileView({ username }: { username: string }) {
  const { me } = useMe()
  const router = useRouter()
  const openId = Number(useSearchParams().get('p')) || null
  const { data, error, setData, reload } = useApi<Profile>(`/api/users/${encodeURIComponent(username)}`)
  const [list, setList] = useState<'followers' | 'following' | null>(null)

  if (error?.status === 404) {
    return <div className="px-4 py-24 text-center"><p className="display text-4xl">Esse nick não existe.</p><p className="mt-3 text-ink-soft">Confira se digitou certo.</p></div>
  }
  if (error) return <p className="px-4 py-24 text-center text-ink-soft">Não deu pra carregar o perfil. Atualize a página.</p>
  if (!data) return <p className="px-4 py-24 text-center text-ink-soft" aria-live="polite">Revelando…</p>

  const { user } = data
  const act = (method: string, url: string) => api(url, { method }).then(reload)
  const setPost = (p: Post) => setData({ ...data, posts: data.posts.map((x) => (x.id === p.id ? p : x)) })
  const open = (id: number | null) => router.replace(id ? `/${username}?p=${id}` : `/${username}`, { scroll: false })
  const selected = data.posts.find((p) => p.id === openId)
  const action = data.isOwnProfile ? <Link href="/settings" className="btn-outline">Editar perfil</Link>
    : !me ? <LoginLink username={username} className="btn-solid">Seguir</LoginLink>
    : data.isFollowing ? <button onClick={() => act('DELETE', `/api/follow/${user.id}`)} className="btn-outline">Seguindo</button>
    : data.hasRequestedToFollow ? <button onClick={() => act('DELETE', `/api/follow/${user.id}`)} className="btn-outline">Solicitado</button>
    : <button onClick={() => act('POST', `/api/follow/${user.id}`)} className="btn-solid">Seguir</button>
  const bio = <><p className="font-semibold">{user.name}</p>{user.bio && <p className="mt-1 max-w-[60ch] whitespace-pre-line">{user.bio}</p>}</>

  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pb-6 pt-8 sm:pt-12">
        <div className="flex items-center gap-5 sm:gap-12 sm:px-8">
          <Avatar path={user.profile_photo_path} name={user.name} size="size-20 sm:size-36 text-3xl!" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="flex items-center gap-1.5 truncate text-xl font-semibold">{user.username}{!user.is_public && <IconLock className="size-4" aria-label="Perfil privado" />}</h1>
              <div className="hidden sm:block">{action}</div>
            </div>
            <dl className="mt-4 hidden gap-8 sm:flex">
              <Count n={user.posts_count} label={user.posts_count === 1 ? 'post' : 'posts'} />
              <Count n={user.followers_count} label={user.followers_count === 1 ? 'seguidor' : 'seguidores'} onClick={data.canSeeContent ? () => setList('followers') : undefined} />
              <Count n={user.following_count} label="seguindo" onClick={data.canSeeContent ? () => setList('following') : undefined} />
            </dl>
            <div className="mt-4 hidden sm:block">{bio}</div>
          </div>
        </div>
        <div className="mt-4 sm:hidden">{bio}</div>
        <div className="mt-4 sm:hidden [&>*]:block [&>*]:w-full">{action}</div>
        <dl className="mt-5 grid grid-cols-3 border-y border-line py-3 text-center sm:hidden">
          <Count n={user.posts_count} label={user.posts_count === 1 ? 'post' : 'posts'} />
          <Count n={user.followers_count} label={user.followers_count === 1 ? 'seguidor' : 'seguidores'} onClick={data.canSeeContent ? () => setList('followers') : undefined} />
          <Count n={user.following_count} label="seguindo" onClick={data.canSeeContent ? () => setList('following') : undefined} />
        </dl>
        {data.hasPendingRequestFrom && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-print p-4">
            <p className="flex-1 font-semibold">{user.name} quer te seguir.</p>
            <button onClick={() => act('POST', `/api/follow-requests/${user.id}/accept`)} className="btn-solid">Aceitar</button>
            <button onClick={() => act('DELETE', `/api/follow-requests/${user.id}/reject`)} className="btn-outline">Recusar</button>
          </div>
        )}
      </section>

      {!data.canSeeContent ? (
        <div className="mx-auto my-16 max-w-sm px-4 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full border-2 border-ink"><IconLock className="size-7" /></span>
          <p className="mt-4 text-lg font-bold">Este perfil é privado</p>
          <p className="mt-1 text-ink-soft">Siga {user.name} pra ver as fotos. O pedido precisa ser aceito.</p>
        </div>
      ) : data.posts.length === 0 ? (
        <p className="px-4 py-20 text-center text-ink-soft">{data.isOwnProfile ? 'Você ainda não postou. Seu primeiro post aparece aqui.' : 'Nenhum post ainda.'}</p>
      ) : (
        <ol aria-label="Posts" className="mx-auto max-w-4xl columns-2 gap-1 px-1 pb-8 sm:columns-3 sm:gap-4 sm:px-4">
          {data.posts.map((p) => (
            <li key={p.id} className="mb-1 break-inside-avoid sm:mb-4">
              <button onClick={() => open(p.id)} className="group relative block w-full overflow-hidden text-left sm:rounded-xl" aria-label={`Abrir post: ${p.content.slice(0, 60)}`}>
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
      )}

      {selected && (
        <Sheet onClose={() => open(null)} label={`Post de @${user.username}`}>
          <PostCard post={selected} onChange={setPost} onDelete={(id) => { open(null); setData({ ...data, posts: data.posts.filter((p) => p.id !== id), user: { ...user, posts_count: user.posts_count - 1 } }) }} />
        </Sheet>
      )}
      {list && (
        <Sheet onClose={() => setList(null)} label={list === 'followers' ? 'Seguidores' : 'Seguindo'}>
          <FollowList username={user.username} kind={list} own={data.isOwnProfile} />
        </Sheet>
      )}
    </div>
  )
}

function Count({ n, label, onClick }: { n: number; label: string; onClick?: () => void }) {
  const inner = <><dt className="text-ink-soft">{label}</dt><dd className="font-semibold">{n}</dd></>
  const cls = 'flex flex-col-reverse items-center sm:flex-row-reverse sm:gap-1.5'
  return onClick ? <button onClick={onClick} className={`${cls} hover:opacity-70`}>{inner}</button> : <div className={cls}>{inner}</div>
}


/** Native <dialog> sheet: bottom sheet on mobile, centered panel on desktop. */
function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
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

function FollowList({ username, kind, own }: { username: string; kind: 'followers' | 'following'; own: boolean }) {
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const { data, error } = useApi<User[]>(`/api/users/${encodeURIComponent(username)}/${kind}?sort=${sort}`)
  return (
    <div className="py-4">
      {own && (
        <label className="mb-3 flex items-center gap-2 text-sm">
          Ordem
          <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} className="rounded border border-line bg-transparent px-2 py-1">
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </select>
        </label>
      )}
      {error && <p className="py-6 text-center text-ink-soft">Essa lista é privada.</p>}
      {data?.length === 0 && <p className="py-6 text-center text-ink-soft">{kind === 'followers' ? 'Ninguém segue ainda.' : 'Não segue ninguém ainda.'}</p>}
      <ul className="flex flex-col">
        {data?.map((u) => (
          <li key={u.id}>
            <a href={profileHref(u.username)} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-ink/5">
              <Avatar path={u.profile_photo_path} name={u.name} />
              <span className="min-w-0 leading-tight"><span className="block truncate font-bold">{u.name}</span><span className="text-sm text-ink-soft">@{u.username}</span></span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
