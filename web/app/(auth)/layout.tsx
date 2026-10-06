import Link from 'next/link'
import { Suspense } from 'react'
import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-envelope text-on-envelope">
      <header className="px-4 py-5 sm:px-8">
        <Link href="/" aria-label="Zivra, página inicial"><Logo className="text-3xl" /></Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center">
        <div className="w-full max-w-md">
          <Suspense>{children}</Suspense>
        </div>
      </main>
      <footer className="flex justify-center gap-6 pb-6 text-sm">
        <Link href="/privacy" className="hover:underline">Privacidade</Link>
        <Link href="/security" className="hover:underline">Segurança</Link>
      </footer>
    </div>
  )
}
