'use client'
import Link from 'next/link'
import { useMe } from '@/lib/api'
import { Shell } from './Shell'

/** Landing uses the same top bar as the app, for visitors and signed-in users alike. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const { me } = useMe()
  return <Shell me={me ?? null}>{children}</Shell>
}

/** Primary hero action: signup for visitors, back to the feed for signed-in users. */
export function HeroCta() {
  const { me } = useMe()
  return me
    ? <Link href="/feed" className="btn-solid px-6 py-3 text-center text-lg">Ir para o feed</Link>
    : (
      <>
        <Link href="/register" className="btn-solid px-6 py-3 text-center text-lg">Criar minha conta</Link>
        <Link href="/login" className="btn-outline px-6 py-3 text-center text-lg">Entrar</Link>
      </>
    )
}
