import Link from 'next/link'
import { Logo } from './Logo'

/** Reading layout for policy pages: envelope header, one readable column. */
export function DocPage({ title, lead, updated, children }: { title: string; lead: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="bg-envelope text-on-envelope">
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-5 sm:px-8">
          <Link href="/" aria-label="Zivra, página inicial"><Logo className="text-2xl" /></Link>
          <h1 className="display mt-12 text-5xl sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-[52ch] text-lg">{lead}</p>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8 [&_h2]:wide [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_p]:mt-3 [&_p]:max-w-[68ch] [&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-ink-soft">
        {children}
        <p className="!mt-12 !text-sm">Atualizado em {updated}.</p>
      </article>
      <footer className="border-t border-line py-6 text-center text-sm text-ink-soft">
        <Link href="/privacy" className="mx-3 hover:underline">Privacidade</Link>
        <Link href="/security" className="mx-3 hover:underline">Segurança</Link>
      </footer>
    </div>
  )
}
