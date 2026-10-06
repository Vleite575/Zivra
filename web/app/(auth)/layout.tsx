import Link from 'next/link'
import { Suspense } from 'react'
import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-10 sm:justify-center">
      <Link href="/" aria-label="Zivra, página inicial" className="mb-8"><Logo className="text-4xl" /></Link>
      <main className="w-full max-w-sm">
        <Suspense>{children}</Suspense>
      </main>
      <footer className="mt-10 flex gap-6 text-sm text-ink-soft">
        <Link href="/privacy" className="hover:underline">Privacidade</Link>
        <Link href="/security" className="hover:underline">Segurança</Link>
      </footer>
    </div>
  )
}
