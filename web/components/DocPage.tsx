import Link from 'next/link'
import { PublicShell } from './LandingCta'

/** Reading layout for policy pages inside the shared top bar. */
export function DocPage({ title, lead, updated, children }: { title: string; lead: string; updated: string; children: React.ReactNode }) {
  return (
    <PublicShell>
      <article className="mx-auto max-w-2xl px-4 py-12 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-ink-soft">
        <h1 className="text-4xl font-black tracking-tight">{title}</h1>
        <p className="!text-lg">{lead}</p>
        {children}
        <p className="!mt-12 !text-sm">Atualizado em {updated}.</p>
        <nav className="mt-8 flex gap-6 border-t border-line pt-6 text-sm">
          <Link href="/privacy" className="hover:underline">Privacidade</Link>
          <Link href="/security" className="hover:underline">Segurança</Link>
        </nav>
      </article>
    </PublicShell>
  )
}
