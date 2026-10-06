'use client'
import Link from 'next/link'
import { useMe } from '@/lib/api'

/** Primary hero action: signup for visitors, back to the feed for signed-in users. */
export function HeroCta() {
  const { me } = useMe()
  if (me) {
    return (
      <Link href="/feed" className="wide rounded-md bg-on-envelope px-6 py-4 text-center text-lg font-bold text-envelope">
        Ir para o feed
      </Link>
    )
  }
  return (
    <>
      <Link href="/register" className="wide rounded-md bg-on-envelope px-6 py-4 text-center text-lg font-bold text-envelope transition-transform duration-200 ease-out-expo hover:-translate-y-0.5">
        Criar minha conta
      </Link>
      <Link href="/login" className="px-2 py-3 text-center font-semibold underline underline-offset-4">Já tenho conta</Link>
    </>
  )
}
