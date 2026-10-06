'use client'
import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, BASE, media, profileHref, useApi, useMe, type Post, type Profile, type User } from '@/lib/api'
import { Shell } from '@/components/Shell'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/Avatar'
import { PostCard } from '@/components/PostCard'
import { FrameCode } from '@/components/Print'
import { IconClose, IconLock } from '@/components/icons'
import { Loop } from '@/components/Loop'

const SOLID = 'wide rounded-md bg-on-envelope px-6 py-3 text-center font-bold text-envelope'
const OUTLINE = 'wide rounded-md border-2 border-on-envelope px-6 py-2.5 text-center font-bold'

/**
 * Public profile at /{username}. Static export has no dynamic routes, so Apache rewrites
 * every single-segment path to this page and the nick is read from the browser URL.
 */
export default function ProfilePage() {
  const { me } = useMe()
  const [username, setUsername] = useState<string>()
  useEffect(() => { setUsername(decodeURIComponent(location.pathname.slice(BASE.length).split('/').filter(Boolean)[0] ?? '')) }, [])
  if (me === undefined || !username) return null
  const page = <Suspense><ProfileView username={username} /></Suspense>
  return me ? <Shell me={me}>{page}</Shell> : (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between bg-envelope px-4 py-4 text-on-envelope sm:px-8">
        <Link href="/" aria-label="Zivra, página inicial"><Logo className="text-2xl" /></Link>
        <nav className="flex gap-2">
          <LoginLink username={username} className="rounded-md px-3 py-2 font-semibold">Entrar</LoginLink>
          <Link href="/register" className="rounded-md bg-on-envelope px-4 py-2 font-semibold text-envelope">Criar conta</Link>
        </nav>
      </header>
      {page}
    </div>
  )
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

  return (
    <div>
      <section className="bg-envelope px-4 pb-8 pt-8 text-on-envelope sm:px-8 md:pt-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <Avatar path={user.profile_photo_path} name={user.name} size="size-14 text-xl!" />
            <p className="edge flex items-center gap-1.5 text-sm">@{user.username}{!user.is_public && <IconLock className="size-4" aria-label="Perfil privado" />}</p>
          </div>
          <h1 className="display mt-4 break-words text-5xl sm:text-7xl">{user.name}</h1>
          {user.bio && <p className="mt-4 max-w-[60ch] whitespace-pre-line text-lg">{user.bio}</p>}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <dl className="grid grid-cols-3 divide-x divide-on-envelope/25 border-y border-on-envelope/25 sm:min-w-96">
              <Count n={user.posts_count} label={user.posts_count === 1 ? 'post' : 'posts'} />
              <Count n={user.followers_count} label={user.followers_count === 1 ? 'seguidor' : 'seguidores'} onClick={data.canSeeContent ? () => setList('followers') : undefined} />
              <Count n={user.following_count} label="seguindo" onClick={data.canSeeContent ? () => setList('following') : undefined} />
            </dl>
            {data.isOwnProfile ? <Link href="/settings" className={OUTLINE}>Editar perfil</Link>
              : !me ? <LoginLink username={username} className={SOLID}>Seguir</LoginLink>
              : data.isFollowing ? <button onClick={() => act('DELETE', `/api/follow/${user.id}`)} className={OUTLINE}>Seguindo</button>
              : data.hasRequestedToFollow ? <button onClick={() => act('DELETE', `/api/follow/${user.id}`)} className={OUTLINE}>Cancelar pedido</button>
              : <button onClick={() => act('POST', `/api/follow/${user.id}`)} className={SOLID}>Seguir</button>}
          </div>
          {data.hasPendingRequestFrom && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-sm bg-white p-4">
              <p className="flex-1 font-semibold">{user.name} quer te seguir.</p>
              <button onClick={() => act('POST', `/api/follow-requests/${user.id}/accept`)} className="rounded-md bg-on-envelope px-4 py-2 font-bold text-envelope">Aceitar</button>
              <button onClick={() => act('DELETE', `/api/follow-requests/${user.id}/reject`)} className="rounded-md px-4 py-2 font-semibold underline">Recusar</button>
            </div>
          )}
        </div>
      </section>

      {!data.canSeeContent ? (
        <div className="mx-auto my-16 max-w-sm px-4">
          <div className="relative aspect-[4/3] rounded-sm bg-envelope p-6 text-on-envelope shadow-[0_24px_50px_-24px_rgb(27_31_59/0.5)]">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-envelope-deep [clip-path:polygon(0_0,100%_0,50%_100%)]" />
            <div className="relative flex h-full flex-col items-center justify-end text-center">
              <IconLock className="size-8" />
              <p className="wide mt-2 text-xl font-bold">Envelope fechado</p>
              <p className="text-sm">Siga {user.name} pra ver as fotos. O pedido precisa ser aceito.</p>
            </div>
          </div>
        </div>
      ) : data.posts.length === 0 ? (
        <p className="px-4 py-20 text-center text-ink-soft">{data.isOwnProfile ? 'Você ainda não postou. Seu primeiro quadro aparece aqui.' : 'Nenhum post ainda.'}</p>
      ) : (
        <section aria-label="Folha de contato" className="bg-film">
          <Sprockets />
          <ol className="mx-auto grid max-w-4xl grid-cols-3 gap-x-2 gap-y-4 px-2 py-3 sm:gap-x-4 sm:px-6">
            {data.posts.map((p) => (
              <li key={p.id}>
                <button onClick={() => open(p.id)} className="group relative block w-full text-left" aria-label={`Abrir post: ${p.content.slice(0, 60)}`}>
                  {p.media_path
                    ? (p.media_type === 'video'
                      ? <video src={media(p.media_path)} preload="metadata" muted className="aspect-square w-full bg-black object-cover" />
                      // eslint-disable-next-line @next/next/no-img-element
                      : <img src={media(p.media_path)} alt="" loading="lazy" className="aspect-square w-full object-cover" />)
                    : <span className="wide line-clamp-5 aspect-square w-full bg-white p-3 text-sm font-bold text-on-envelope sm:text-base">{p.content}</span>}
                  <span className="absolute inset-0 transition-colors group-hover:bg-white/10" />
                  <Loop drawn={p.is_liked} />
                </button>
                <FrameCode n={p.id} className="mt-1.5 px-0.5 text-envelope" />
              </li>
            ))}
          </ol>
          <Sprockets />
        </section>
      )}

      {selected && (
        <Sheet onClose={() => open(null)} label={`Post de @${user.username}`}>
          <PostCard post={selected} onChange={setPost} />
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
  const inner = <><dt className="edge text-xs uppercase opacity-75">{label}</dt><dd className="wide text-2xl font-bold">{n}</dd></>
  return onClick
    ? <button onClick={onClick} className="flex flex-col-reverse items-start px-3 py-2 text-left hover:bg-envelope-deep">{inner}</button>
    : <div className="flex flex-col-reverse px-3 py-2">{inner}</div>
}

/** Film rebate: a row of sprocket holes above and below the contact sheet. */
function Sprockets() {
  return <div aria-hidden="true" className="h-5" style={{ background: 'repeating-linear-gradient(90deg, rgb(255 255 255 / 0.75) 0 12px, transparent 12px 24px) left 6px center / 100% 8px no-repeat' }} />
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
