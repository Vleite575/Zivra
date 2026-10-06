'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { api, media, useApi, useMe, type Post, type Profile, type User } from '@/lib/api'
import { Shell } from '@/components/Shell'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/Avatar'
import { PostCard } from '@/components/PostCard'
import { FrameCode } from '@/components/Print'
import { IconClose, IconLock } from '@/components/icons'

export default function ProfilePage() {
  const { me } = useMe()
  if (me === undefined) return null
  const page = <ProfileView />
  return me ? <Shell me={me}>{page}</Shell> : (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between bg-envelope px-4 py-4 text-on-envelope sm:px-8">
        <Link href="/" aria-label="Zivra, página inicial"><Logo className="text-2xl" /></Link>
        <nav className="flex gap-2">
          <LoginLink className="rounded-md px-3 py-2 font-semibold">Entrar</LoginLink>
          <Link href="/register" className="rounded-md bg-on-envelope px-4 py-2 font-semibold text-envelope">Criar conta</Link>
        </nav>
      </header>
      {page}
    </div>
  )
}

function LoginLink({ className, children }: { className: string; children: React.ReactNode }) {
  const path = usePathname()
  return <Link href={`/login?redirect=${encodeURIComponent(path)}`} className={className}>{children}</Link>
}

function ProfileView() {
  const { username } = useParams<{ username: string }>()
  const { me } = useMe()
  const router = useRouter()
  const path = usePathname()
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
  const open = (id: number | null) => router.replace(id ? `${path}?p=${id}` : path, { scroll: false })
  const selected = data.posts.find((p) => p.id === openId)

  return (
    <div>
      <section className="border-b border-line px-4 py-8 sm:px-8 md:py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar path={user.profile_photo_path} name={user.name} size="size-24 text-3xl!" />
          <div className="min-w-0 flex-1">
            <h1 className="display break-words text-4xl sm:text-5xl">{user.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-ink-soft">@{user.username}{!user.is_public && <IconLock className="size-4" aria-label="Perfil privado" />}</p>
            {user.bio && <p className="mt-3 max-w-[60ch] whitespace-pre-line">{user.bio}</p>}
            <dl className="mt-5 flex gap-6">
              <Count n={user.posts_count} label="posts" />
              <Count n={user.followers_count} label="seguidores" onClick={data.canSeeContent ? () => setList('followers') : undefined} />
              <Count n={user.following_count} label="seguindo" onClick={data.canSeeContent ? () => setList('following') : undefined} />
            </dl>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            {data.isOwnProfile ? <Link href="/settings" className="btn-outline">Editar perfil</Link>
              : !me ? <LoginLink className="btn-solid">Seguir</LoginLink>
              : data.isFollowing ? <button onClick={() => act('DELETE', `/api/follow/${user.id}`)} className="btn-outline">Seguindo</button>
              : data.hasRequestedToFollow ? <button onClick={() => act('DELETE', `/api/follow/${user.id}`)} className="btn-outline">Cancelar pedido</button>
              : <button onClick={() => act('POST', `/api/follow/${user.id}`)} className="btn-solid">Seguir</button>}
          </div>
        </div>
        {data.hasPendingRequestFrom && (
          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center gap-3 rounded-sm bg-envelope p-4 text-on-envelope">
            <p className="flex-1 font-semibold">{user.name} quer te seguir.</p>
            <button onClick={() => act('POST', `/api/follow-requests/${user.id}/accept`)} className="rounded-md bg-on-envelope px-4 py-2 font-bold text-envelope">Aceitar</button>
            <button onClick={() => act('DELETE', `/api/follow-requests/${user.id}/reject`)} className="rounded-md px-4 py-2 font-semibold underline">Recusar</button>
          </div>
        )}
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
        <ol className="grid grid-cols-3 gap-1 bg-film p-1 sm:gap-3 sm:p-4 md:mx-auto md:my-8 md:max-w-4xl" aria-label="Posts">
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
                {p.is_liked && <span className="absolute inset-1 rounded-[50%] border-[3px] border-pencil" aria-hidden="true" />}
              </button>
              <FrameCode n={p.id} className="mt-1 hidden px-0.5 text-envelope sm:inline-flex" />
            </li>
          ))}
        </ol>
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
  const inner = <><dt className="text-sm text-ink-soft">{label}</dt><dd className="wide text-xl font-bold">{n}</dd></>
  return onClick
    ? <button onClick={onClick} className="flex flex-col-reverse items-start rounded hover:underline">{inner}</button>
    : <div className="flex flex-col-reverse">{inner}</div>
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
            <Link href={`/${u.username}`} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-ink/5">
              <Avatar path={u.profile_photo_path} name={u.name} />
              <span className="min-w-0 leading-tight"><span className="block truncate font-bold">{u.name}</span><span className="text-sm text-ink-soft">@{u.username}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
