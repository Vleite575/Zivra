'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Field, Submit, formJson, useSubmit } from '@/components/Form'
import { Slip } from '@/components/Slip'

export default function ResetPassword() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''
  const router = useRouter()
  const { errors, message, busy, run } = useSubmit()
  return (
    <Slip title="Nova senha">
      <form className="flex flex-col gap-6" onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        run(async () => {
          await api('/api/reset-password', { method: 'POST', body: formJson(form) })
          router.replace('/login')
        })
      }}>
        <input type="hidden" name="token" value={token} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required defaultValue={email} error={errors.email} />
        <Field label="Senha nova" name="password" type="password" autoComplete="new-password" required minLength={8} error={errors.password} />
        <Field label="Repita a senha" name="password_confirmation" type="password" autoComplete="new-password" required />
        {message && <p role="alert" className="text-sm font-semibold text-pencil">{message}</p>}
        <Submit busy={busy}>Salvar senha</Submit>
      </form>
    </Slip>
  )
}
