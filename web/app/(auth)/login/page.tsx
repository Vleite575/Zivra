'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, useMe, type User } from '@/lib/api'
import { Field, Submit, formJson, useSubmit } from '@/components/Form'
import { Slip } from '@/components/Slip'
import { safeRedirect } from '@/lib/redirect'

export default function Login() {
  const { setMe } = useMe()
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect')
  const { errors, message, busy, run } = useSubmit()

  return (
    <Slip title="Entrar">
      <form className="flex flex-col gap-6" onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        run(async () => {
          await api('/api/login', { method: 'POST', body: formJson(form) })
          setMe(await api<User>('/api/user'))
          router.replace(safeRedirect(redirect))
        })
      }}>
        <Field label="E-mail" name="email" type="email" autoComplete="email" required error={errors.email} />
        <Field label="Senha" name="password" type="password" autoComplete="current-password" required error={errors.password} />
        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="remember" value="1" className="size-4 accent-[var(--on-envelope)]" /> Manter conectado
          </label>
          <Link href="/forgot-password" className="font-semibold underline">Esqueci a senha</Link>
        </div>
        {message && <p role="alert" className="text-sm font-semibold text-pencil">{message}</p>}
        <Submit busy={busy}>Entrar</Submit>
      </form>
      <p className="mt-6 text-center text-sm">
        Ainda não tem conta? <Link href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} className="font-semibold underline">Criar conta</Link>
      </p>
    </Slip>
  )
}
