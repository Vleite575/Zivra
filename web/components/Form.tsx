'use client'
// Form fields shared by auth and settings.
import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { ApiError } from '@/lib/api'
import { IconEye, IconEyeOff } from './icons'

export type Errors = Record<string, string[]>

export function Field({ label, error, hint, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string[]; hint?: ReactNode }) {
  const id = input.id ?? input.name
  const [shown, setShown] = useState(false)
  const secret = input.type === 'password'
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-semibold text-ink-soft">{label}</label>
      <div className="relative mt-1">
        <input id={id} {...input} type={secret && shown ? 'text' : input.type} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-ink aria-invalid:border-pencil ${secret ? 'pr-11' : ''}`} />
        {secret && (
          <button type="button" onClick={() => setShown(!shown)} aria-label={shown ? 'Esconder senha' : 'Mostrar senha'} aria-pressed={shown}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-ink-soft hover:text-ink">
            {shown ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-pencil">{error[0]}</p>}
      {!error && hint}
    </div>
  )
}

export function Submit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button disabled={busy} className="btn-solid mt-1 py-3">
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
