'use client'
import Link from 'next/link'
import { useState } from 'react'
import { api, profileHref, useApi, useMe, type User } from '@/lib/api'
import { Avatar } from './Avatar'

type Suggestion = User & { followed_by: string | null }
type State = 'idle' | 'following' | 'requested'

function useFollow() {
  const [state, setState] = useState<Record<number, State>>({})
  const follow = async (u: Suggestion) => {
    setState((s) => ({ ...s, [u.id]: u.is_public ? 'following' : 'requested' }))
    try { await api(`/api/follow/${u.id}`, { method: 'POST' }) } catch { setState((s) => ({ ...s, [u.id]: 'idle' })) }
  }
  return [state, follow] as const
}

const reason = (u: Suggestion) => (u.followed_by ? `Seguido por ${u.followed_by}` : 'Sugestão pra você')

function FollowButton({ s, onClick }: { s: State | undefined; onClick: () => void }) {
  if (s === 'following') return <span className="text-sm font-semibold text-ink-soft">Seguindo</span>
  if (s === 'requested') return <span className="text-sm font-semibold text-ink-soft">Solicitado</span>
  return <button onClick={onClick} className="text-sm font-bold text-on-envelope hover:underline dark:text-envelope">Seguir</button>
}

/** Desktop right rail beside the feed: you, who to follow, small print. */
export function FeedSidebar() {
  const { me } = useMe()
  const { data } = useApi<Suggestion[]>('/api/suggestions')
  const [state, follow] = useFollow()
  if (!me) return null
  return (
    <aside className="sticky top-22 hidden w-80 shrink-0 self-start pt-8 lg:block" aria-label="Sugestões">
      <a href={profileHref(me.username)} className="flex items-center gap-3">
        <Avatar path={me.profile_photo_path} name={me.name} size="size-12" />
        <span className="min-w-0 leading-tight"><span className="block truncate font-semibold">{me.username}</span><span className="text-sm text-ink-soft">{me.name}</span></span>
      </a>

      {!!data?.length && (
        <>
          <h2 className="mt-7 font-semibold text-ink-soft">Sugestões pra você</h2>
          <ul className="mt-3 flex flex-col gap-3.5">
            {data.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <a href={profileHref(u.username)}><Avatar path={u.profile_photo_path} name={u.name} size="size-10" /></a>
                <a href={profileHref(u.username)} className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate font-semibold">{u.username}</span>
                  <span className="block truncate text-sm text-ink-soft">{reason(u)}</span>
                </a>
                <FollowButton s={state[u.id]} onClick={() => follow(u)} />
              </li>
            ))}
          </ul>
          <Link href="/search" className="mt-4 inline-block text-sm font-semibold text-ink-soft hover:text-ink">Buscar mais pessoas</Link>
        </>
      )}

      <footer className="mt-8 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <Link href="/privacy" className="hover:underline">Privacidade</Link>
        <Link href="/security" className="hover:underline">Segurança</Link>
        <span>© 2026 Zivra</span>
      </footer>
    </aside>
  )
}

/** Phones and tablets: the same suggestions as a horizontal strip inside the feed. */
export function SuggestionStrip() {
  const { data } = useApi<Suggestion[]>('/api/suggestions')
  const [state, follow] = useFollow()
  if (!data?.length) return null
  return (
    <section aria-label="Sugestões pra você" className="border-y border-line bg-print py-4 sm:rounded-xl sm:border lg:hidden">
      <h2 className="px-4 font-semibold">Sugestões pra você</h2>
      <ul className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {data.map((u) => (
          <li key={u.id} className="flex w-36 shrink-0 flex-col items-center rounded-xl border border-line p-3 text-center">
            <a href={profileHref(u.username)} className="flex flex-col items-center">
              <Avatar path={u.profile_photo_path} name={u.name} size="size-16 text-xl!" />
              <span className="mt-2 w-full truncate text-sm font-semibold">{u.username}</span>
            </a>
            <span className="w-full truncate text-xs text-ink-soft">{reason(u)}</span>
            <span className="mt-2.5">
              {state[u.id] ? <FollowButton s={state[u.id]} onClick={() => {}} /> : <button onClick={() => follow(u)} className="btn-solid px-4 py-1.5 text-sm">Seguir</button>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
