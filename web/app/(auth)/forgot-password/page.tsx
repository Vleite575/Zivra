'use client'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Field, Submit, formJson, useSubmit } from '@/components/Form'
import { Slip } from '@/components/Slip'

export default function ForgotPassword() {
  const { errors, message, setMessage, busy, run } = useSubmit()
  return (
    <Slip title="Esqueci a senha">
      <p className="-mt-3 mb-6 text-ink-soft">Mande seu e-mail e a gente envia um link pra criar uma senha nova.</p>
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        run(async () => {
          await api('/api/forgot-password', { method: 'POST', body: formJson(form) })
          setMessage('Link enviado. Confira sua caixa de entrada.')
        })
      }}>
        <Field label="E-mail" name="email" type="email" autoComplete="email" required error={errors.email} />
        {message && <p role="status" className="text-sm font-semibold">{message}</p>}
        <Submit busy={busy}>Enviar link</Submit>
      </form>
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold underline">Voltar pro login</Link></p>
    </Slip>
  )
}
