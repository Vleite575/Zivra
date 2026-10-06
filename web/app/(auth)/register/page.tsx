'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, useMe, type User } from '@/lib/api'
import { Field, Submit, formJson, useSubmit } from '@/components/Form'
import { Slip } from '@/components/Slip'
import { safeRedirect } from '@/lib/redirect'

type Check = { available: boolean; reserved: boolean }

export default function Register() {
  const { setMe } = useMe()
  const router = useRouter()
  const redirect = useSearchParams().get('redirect')
  const { errors, message, busy, run } = useSubmit()
  const [username, setUsername] = useState('')
  const [check, setCheck] = useState<Check | null>(null)

  useEffect(() => {
    if (username.length < 3) return
    const t = setTimeout(() => api<Check>(`/api/check-username/${encodeURIComponent(username)}`).then(setCheck, () => setCheck(null)), 400)
    return () => clearTimeout(t)
  }, [username])

  const status = username.length < 3 || !check ? null
    : check.available ? <p className="mt-1 text-sm font-semibold text-ink-soft">Nick disponível.</p>
    : <p className="mt-1 text-sm font-semibold text-pencil">{check.reserved ? 'Esse nick é reservado. Escolha outro.' : 'Esse nick já está em uso.'}</p>

  return (
    <Slip title="Criar conta">
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        run(async () => {
          await api('/api/register', { method: 'POST', body: formJson(form) })
          setMe(await api<User>('/api/user'))
          router.replace(safeRedirect(redirect))
        })
      }}>
        <Field label="Nome" name="name" autoComplete="name" required error={errors.name} />
        <Field label="Nick" name="username" autoComplete="username" required maxLength={30} pattern="[a-z0-9_\-]+"
          title="Use letras minúsculas, números, traço ou underline."
          value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase()); setCheck(null) }}
          error={errors.username} hint={status} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required error={errors.email} />
        <Field label="Data de nascimento" name="birth_date" type="date" autoComplete="bday" required error={errors.birth_date}
          hint={<p className="mt-1 text-sm text-ink-soft">Precisa ter 14 anos ou mais.</p>} />
        <Field label="Senha" name="password" type="password" autoComplete="new-password" required minLength={8} error={errors.password} />
        <Field label="Repita a senha" name="password_confirmation" type="password" autoComplete="new-password" required />
        {message && <p role="alert" className="text-sm font-semibold text-pencil">{message}</p>}
        <Submit busy={busy}>Criar minha conta</Submit>
      </form>
      <p className="mt-6 text-center text-sm">
        Já tem conta? <Link href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="font-semibold underline">Entrar</Link>
      </p>
    </Slip>
  )
}
