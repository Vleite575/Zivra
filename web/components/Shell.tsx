'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { api, useMe, type User } from '@/lib/api'
import { Logo, Mark } from './Logo'
import { Avatar } from './Avatar'
import { IconEnvelope, IconFeed, IconLogout, IconSettings, IconUser } from './icons'

/** Signed-in chrome: yellow side rail on desktop, top strip + film tab bar on mobile. */
export function Shell({ me, children }: { me: User; children: React.ReactNode }) {
  const { setMe } = useMe()
  const path = usePathname()
  const logout = async () => { await api('/api/logout', { method: 'POST' }); setMe(null) }
  const links = [
    { href: '/feed', label: 'Feed', Icon: IconFeed },
    { href: `/${me.username}`, label: 'Perfil', Icon: IconUser },
    { href: '/follow-requests', label: 'Pedidos', Icon: IconEnvelope },
    { href: '/settings', label: 'Ajustes', Icon: IconSettings },
  ]

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-envelope px-4 text-on-envelope md:hidden">
        <Link href="/feed" aria-label="Zivra, ir para o feed"><Logo className="text-2xl" /></Link>
        <Link href={`/${me.username}`} aria-label="Seu perfil">
          <Avatar path={me.profile_photo_path} name={me.name} />
        </Link>
      </header>

      <aside className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-64 md:shrink-0 md:flex-col md:bg-envelope md:px-6 md:py-8 md:text-on-envelope">
        <Link href="/feed" aria-label="Zivra, ir para o feed"><Logo className="text-4xl" /></Link>
        <nav className="mt-12 flex flex-col gap-1" aria-label="Principal">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}
              className="wide flex items-center gap-3 rounded-md px-3 py-2.5 text-lg font-bold transition-colors duration-200 hover:bg-envelope-deep aria-[current=page]:bg-on-envelope aria-[current=page]:text-envelope">
              <Icon className="size-6" />{label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold hover:bg-envelope-deep">
          <IconLogout className="size-5" />Sair
        </button>
        <Mark className="mt-6 size-5 opacity-40" />
      </aside>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 bg-film text-white/70 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {links.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}
            className="edge flex flex-col items-center gap-1 py-2.5 text-[11px] aria-[current=page]:text-envelope">
            <Icon className="size-6" />{label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
