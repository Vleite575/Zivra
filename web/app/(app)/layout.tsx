'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMe } from '@/lib/api'
import { Shell } from '@/components/Shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { me } = useMe()
  const router = useRouter()
  const path = usePathname()
  useEffect(() => { if (me === null) router.replace(`/login?redirect=${encodeURIComponent(path)}`) }, [me, path, router])
  if (!me) return null
  return <Shell me={me}>{children}</Shell>
}
