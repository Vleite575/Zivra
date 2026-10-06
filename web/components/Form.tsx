'use client'
// Order-form fields: label on the rule, value written on the line, like a photo lab envelope slip.
import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { ApiError } from '@/lib/api'

export type Errors = Record<string, string[]>

export function Field({ label, error, hint, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string[]; hint?: ReactNode }) {
  const id = input.id ?? input.name
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="edge text-xs uppercase text-on-envelope/70">{label}</label>
      <input id={id} {...input} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
        className="border-b-2 border-on-envelope/25 bg-transparent py-2 text-base text-on-envelope outline-none transition-colors placeholder:text-on-envelope/40 focus:border-on-envelope aria-invalid:border-pencil" />
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-pencil">{error[0]}</p>}
      {!error && hint}
    </div>
  )
}

export function Submit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button disabled={busy} className="wide mt-2 rounded-md bg-on-envelope px-6 py-3.5 text-lg font-bold text-envelope transition-opacity disabled:opacity-60">
      {busy ? 'Aguarde…' : children}
    </button>
  )
}

/** Runs an async submit, collecting 422 field errors and a general message. */
export function useSubmit() {
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function run(fn: () => Promise<void>) {
    setBusy(true); setErrors({}); setMessage('')
    try { await fn() } catch (e) {
      if (e instanceof ApiError && e.status === 422) setErrors(e.errors)
      else if (e instanceof ApiError && e.status === 401) setMessage('Sua sessão expirou. Entre de novo.')
      else if (e instanceof ApiError && e.status === 429) setMessage('Muitas tentativas. Espere um minuto e tente de novo.')
      else setMessage('Não deu pra conectar. Confira sua internet e tente de novo.')
    } finally { setBusy(false) }
  }
  return { errors, message, setMessage, busy, run }
}

export const formJson = (form: HTMLFormElement) => JSON.stringify(Object.fromEntries(new FormData(form)))
