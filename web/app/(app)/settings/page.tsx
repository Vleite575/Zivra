'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, BASE, useMe, type User } from '@/lib/api'
import { Avatar } from '@/components/Avatar'
import { Field, Submit, formJson, useSubmit } from '@/components/Form'
import { IconLock } from '@/components/icons'

export default function Settings() {
  const { me } = useMe()
  if (!me) return null
  return (
    <div className="mx-auto max-w-xl py-6 sm:px-4 md:py-10">
      <h1 className="px-4 text-2xl font-bold sm:px-0">Ajustes</h1>
      <div className="mt-6 flex flex-col gap-4">
        <ProfileForm me={me} />
        <Privacy me={me} />
        <PasswordForm />
        <Logout />
        <DeleteAccount />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-y border-line bg-print px-5 py-6 sm:rounded-xl sm:border sm:px-7">
      <h2 className="mb-5 text-lg font-bold">{title}</h2>
      {children}
    </section>
  )
}

function Saved({ show, children = 'Salvo.' }: { show: boolean; children?: React.ReactNode }) {
  return <p role="status" className={`text-sm font-semibold transition-opacity ${show ? 'opacity-100' : 'opacity-0'}`}>{children}</p>
}

function ProfileForm({ me }: { me: User }) {
  const { setMe } = useMe()
  const { errors, message, busy, run } = useSubmit()
  const [file, setFile] = useState<File | null>(null)
  const [saved, setSaved] = useState(false)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  return (
    <Section title="Perfil">
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault()
        const body = new FormData(e.currentTarget)
        body.append('_method', 'PATCH')
        if (!file) body.delete('profile_photo')
        run(async () => { setMe(await api<User>('/api/profile', { method: 'POST', body })); setSaved(true); setTimeout(() => setSaved(false), 2500) })
      }}>
        <div className="flex items-center gap-4">
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt="Prévia da foto nova" className="size-20 rounded-full object-cover" />
            : <Avatar path={me.profile_photo_path} name={me.name} size="size-20 text-2xl!" />}
          <label className="btn-outline cursor-pointer">
            Trocar foto
            <input type="file" name="profile_photo" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        {errors.profile_photo && <p className="-mt-3 text-sm font-semibold text-pencil">{errors.profile_photo[0]}</p>}
        <Field label="Nome" name="name" defaultValue={me.name} autoComplete="name" required error={errors.name} />
        <Field label="E-mail" name="email" type="email" defaultValue={me.email} autoComplete="email" required error={errors.email} />
        <Bio initial={me.bio ?? ''} error={errors.bio} />
        {message && <p role="alert" className="text-sm font-semibold text-pencil">{message}</p>}
        <div className="flex items-center gap-4"><Submit busy={busy}>Salvar perfil</Submit><Saved show={saved} /></div>
      </form>
    </Section>
  )
}

function Bio({ initial, error }: { initial: string; error?: string[] }) {
  const [bio, setBio] = useState(initial)
  return (
    <div className="flex flex-col">
      <label htmlFor="bio" className="text-sm font-semibold text-ink-soft">Bio</label>
      <textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3}
        className="mt-1 resize-none rounded-lg border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink" />
      <span className="mt-1 self-end text-xs tabular-nums text-ink-soft">{bio.length}/160</span>
      {error && <p className="text-sm font-semibold text-pencil">{error[0]}</p>}
    </div>
  )
}

function Privacy({ me }: { me: User }) {
  const { setMe } = useMe()
  const [busy, setBusy] = useState(false)
  const toggle = async () => {
    setBusy(true)
    try { setMe({ ...me, ...(await api<User>('/api/profile/privacy', { method: 'PATCH', body: JSON.stringify({ is_public: !me.is_public }) })) }) }
    finally { setBusy(false) }
  }
  return (
    <Section title="Privacidade">
      <div className="flex items-start gap-4">
        <IconLock className="mt-1 size-6 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Perfil privado</p>
          <p className="mt-1 text-sm text-ink-soft">Com o perfil privado, cada pessoa nova precisa pedir pra te seguir. Quem já te segue continua vendo.</p>
        </div>
        <button role="switch" aria-checked={!me.is_public} aria-label="Perfil privado" onClick={toggle} disabled={busy}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${me.is_public ? 'bg-line' : 'bg-envelope'}`}>
          <span className={`absolute top-1 size-6 rounded-full bg-print shadow transition-[left] duration-200 ease-out-expo ${me.is_public ? 'left-1' : 'left-7'}`} />
        </button>
      </div>
    </Section>
  )
}

function PasswordForm() {
  const { errors, message, busy, run } = useSubmit()
  const [saved, setSaved] = useState(false)
  return (
    <Section title="Senha">
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        run(async () => { await api('/api/password', { method: 'PUT', body: formJson(form) }); form.reset(); setSaved(true); setTimeout(() => setSaved(false), 2500) })
      }}>
        <Field label="Senha atual" name="current_password" type="password" autoComplete="current-password" required error={errors.current_password} />
        <Field label="Senha nova" name="password" type="password" autoComplete="new-password" required minLength={8} error={errors.password} />
        <Field label="Repita a senha nova" name="password_confirmation" type="password" autoComplete="new-password" required />
        {message && <p role="alert" className="text-sm font-semibold text-pencil">{message}</p>}
        <div className="flex items-center gap-4"><Submit busy={busy}>Trocar senha</Submit><Saved show={saved}>Senha trocada.</Saved></div>
      </form>
    </Section>
  )
}

function DeleteAccount() {
  const dialog = useRef<HTMLDialogElement>(null)
  const { errors, message, busy, run } = useSubmit()
  return (
    <Section title="Excluir conta">
      <p className="text-sm text-ink-soft">Apaga seu perfil, posts, curtidas e comentários. Não dá pra desfazer.</p>
      <button onClick={() => dialog.current?.showModal()} className="mt-4 rounded-md border-2 border-pencil px-4 py-2 font-bold text-pencil">Excluir minha conta</button>
      <dialog ref={dialog} aria-label="Confirmar exclusão" className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-print p-6 text-ink backdrop:bg-black/60">
        <h3 className="text-xl font-bold">Excluir conta?</h3>
        <p className="mt-2 text-sm">Digite sua senha pra confirmar. Tudo será apagado agora.</p>
        <form className="mt-6 flex flex-col gap-6" onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          run(async () => {
            await api('/api/profile', { method: 'DELETE', body: formJson(form) })
            // Full reload on purpose: drops all client state of the deleted account (router.push races the auth guard).
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign(`${BASE}/`)
          })
        }}>
          <Field id="delete-password" label="Senha" name="password" type="password" autoComplete="current-password" required error={errors.password} />
          {message && <p role="alert" className="text-sm font-semibold text-pencil">{message}</p>}
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} className="rounded-md bg-pencil px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Excluindo…' : 'Excluir de vez'}</button>
            <button type="button" onClick={() => dialog.current?.close()} className="rounded-md px-4 py-3 font-semibold underline">Cancelar</button>
          </div>
        </form>
      </dialog>
    </Section>
  )
}

function Logout() {
  return (
    <Section title="Sessão">
      {/* eslint-disable-next-line @next/next/no-location-assign-relative-destination */}
      <button onClick={async () => { await api('/api/logout', { method: 'POST' }); window.location.assign(`${BASE}/`) }} className="btn-outline">Sair da conta</button>
    </Section>
  )
}
