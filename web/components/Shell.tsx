'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { api, BASE, profileHref, type User } from '@/lib/api'
import { Logo } from './Logo'
import { Avatar } from './Avatar'
import { IconEnvelope, IconFeed, IconLogout, IconPlus, IconSearch, IconSettings, IconUser } from './icons'

/**
 * The one app layout: sticky top bar with logo and actions, a centered content column,
 * and a bottom tab bar on phones. Works signed in (me) and for visitors (me = null).
 */
export function Shell({ me, children }: { me: User | null; children: React.ReactNode }) {
  const path = usePathname()
  const on = (href: string) => (path === href ? 'page' : undefined)
  const pending = me?.pending_requests_count ?? 0
  const requestsLabel = pending ? `Pedidos para seguir: ${pending} novos` : 'Pedidos para seguir'
  const badge = pending > 0 && (
    <span aria-hidden="true" className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-pencil px-1 text-[10px] font-bold text-white">{pending > 9 ? '9+' : pending}</span>
  )
  const tab = 'grid place-items-center rounded-lg p-2 text-ink transition-colors hover:bg-ink/5 aria-[current=page]:text-ink [&:not([aria-current])]:text-ink-soft'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-print/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href={me ? '/feed' : '/'} aria-label="Zivra, início"><Logo className="text-2xl" /></Link>
          {me ? (
            <nav aria-label="Principal" className="flex items-center gap-1">
              <Link href="/feed" aria-label="Feed" aria-current={on('/feed')} className={`${tab} hidden sm:grid`}><IconFeed className="size-6" /></Link>
              <Link href="/feed#novo" aria-label="Novo post" className={`${tab} hidden sm:grid`}><IconPlus className="size-6" /></Link>
              <Link href="/search" aria-label="Buscar pessoas" aria-current={on('/search')} className={`${tab} hidden sm:grid`}><IconSearch className="size-6" /></Link>
              <Link href="/follow-requests" aria-label={requestsLabel} aria-current={on('/follow-requests')} className={`${tab} relative hidden sm:grid`}><IconEnvelope className="size-6" />{badge}</Link>
              <UserMenu me={me} />
            </nav>
          ) : (
            <nav className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg px-3 py-2 font-semibold hover:bg-ink/5">Entrar</Link>
              <Link href="/register" className="btn-solid">Criar conta</Link>
            </nav>
          )}
        </div>
      </header>

      <main className={`flex-1 ${me ? 'pb-20 sm:pb-0' : ''}`}>{children}</main>

      {me && (
        <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-print sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <Link href="/feed" aria-label="Feed" aria-current={on('/feed')} className={`${tab} py-3`}><IconFeed className="size-7" /></Link>
          <Link href="/search" aria-label="Buscar pessoas" aria-current={on('/search')} className={`${tab} py-3`}><IconSearch className="size-7" /></Link>
          <Link href="/feed#novo" aria-label="Novo post" className={`${tab} py-3`}><IconPlus className="size-7" /></Link>
          <Link href="/follow-requests" aria-label={requestsLabel} aria-current={on('/follow-requests')} className={`${tab} relative py-3`}><span className="relative"><IconEnvelope className="size-7" />{badge}</span></Link>
          <a href={profileHref(me.username)} aria-label="Seu perfil" className="grid place-items-center py-3">
            <Avatar path={me.profile_photo_path} name={me.name} size="size-7" />
          </a>
        </nav>
      )}
    </div>
  )
}


/** Avatar button with a native popover menu: profile, settings, logout. Light-dismiss comes free with `popover`. */
function UserMenu({ me }: { me: User }) {
  const logout = async () => {
    await api('/api/logout', { method: 'POST' })
    // Full reload: clears every bit of client state and lands on the public home.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${BASE}/`)
  }
  const item = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-ink/5'
  return (
    <>
      <button popoverTarget="user-menu" aria-label="Menu da conta" className="ml-1 rounded-full [anchor-name:--user-menu]">
        <Avatar path={me.profile_photo_path} name={me.name} size="size-8" />
      </button>
      <div id="user-menu" popover="auto"
        className="fixed inset-auto right-4 top-14 m-0 w-60 rounded-xl border border-line bg-print p-1.5 text-ink shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] [position-anchor:--user-menu] [right:anchor(right)] [top:calc(anchor(bottom)+8px)]">
        <div className="border-b border-line px-3 pb-2.5 pt-1.5">
          <p className="truncate font-semibold">{me.name}</p>
          <p className="truncate text-sm text-ink-soft">@{me.username}</p>
        </div>
        <div className="pt-1.5">
          <a href={profileHref(me.username)} className={item}><IconUser className="size-5" />Ver perfil</a>
          <Link href="/settings" className={item} onClick={() => document.getElementById('user-menu')?.hidePopover()}><IconSettings className="size-5" />Ajustes</Link>
          <button onClick={logout} className={`${item} text-pencil`}><IconLogout className="size-5" />Sair</button>
        </div>
      </div>
    </>
  )
}
