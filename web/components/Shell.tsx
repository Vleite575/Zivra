'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { profileHref, type User } from '@/lib/api'
import { Logo } from './Logo'
import { Avatar } from './Avatar'
import { IconEnvelope, IconFeed, IconPlus, IconSettings } from './icons'

/**
 * The one app layout: sticky top bar with logo and actions, a centered content column,
 * and a bottom tab bar on phones. Works signed in (me) and for visitors (me = null).
 */
export function Shell({ me, children }: { me: User | null; children: React.ReactNode }) {
  const path = usePathname()
  const on = (href: string) => (path === href ? 'page' : undefined)
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
              <Link href="/follow-requests" aria-label="Pedidos para seguir" aria-current={on('/follow-requests')} className={tab}><IconEnvelope className="size-6" /></Link>
              <Link href="/settings" aria-label="Ajustes" aria-current={on('/settings')} className={`${tab} hidden sm:grid`}><IconSettings className="size-6" /></Link>
              <a href={profileHref(me.username)} aria-label="Seu perfil" className="ml-1 hidden rounded-full sm:block">
                <Avatar path={me.profile_photo_path} name={me.name} size="size-8" />
              </a>
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
        <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-print sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <Link href="/feed" aria-label="Feed" aria-current={on('/feed')} className={`${tab} py-3`}><IconFeed className="size-7" /></Link>
          <Link href="/feed#novo" aria-label="Novo post" className={`${tab} py-3`}><IconPlus className="size-7" /></Link>
          <Link href="/settings" aria-label="Ajustes" aria-current={on('/settings')} className={`${tab} py-3`}><IconSettings className="size-7" /></Link>
          <a href={profileHref(me.username)} aria-label="Seu perfil" className="grid place-items-center py-3">
            <Avatar path={me.profile_photo_path} name={me.name} size="size-7" />
          </a>
        </nav>
      )}
    </div>
  )
}

