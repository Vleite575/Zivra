'use client'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, ApiError, profileHref, useApi, useMe, type Conversation, type Message, type User } from '@/lib/api'
import { Avatar } from '@/components/Avatar'
import { ago } from '@/components/PostCard'
import { IconBack, IconChat, IconClose, IconPlus, IconSend } from '@/components/icons'

type Member = Conversation['members'][number]

const title = (c: Conversation, meId: number) => c.name ?? c.members.find((m) => m.id !== meId)?.name ?? 'Conversa'
const other = (c: Conversation, meId: number) => c.members.find((m) => m.id !== meId) ?? c.members[0]

/** Polls `fn` every `ms` while the tab is visible. ponytail: polling until websockets exist. */
function usePoll(fn: () => void, ms: number) {
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') fn() }, ms)
    return () => clearInterval(t)
  }, [fn, ms])
}

export default function MessagesPage() {
  return <Suspense><Messages /></Suspense>
}

function Messages() {
  const { me } = useMe()
  const router = useRouter()
  const openId = Number(useSearchParams().get('c')) || null
  const { data: list, reload, setData } = useApi<Conversation[]>('/api/conversations')
  usePoll(reload, 8000)
  const [creating, setCreating] = useState(false)
  if (!me) return null

  const open = (id: number | null) => router.replace(id ? `/messages?c=${id}` : '/messages', { scroll: false })
  const current = list?.find((c) => c.id === openId)

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-4.5rem)] max-w-5xl sm:h-[calc(100dvh-3.5rem)] sm:p-4">
      <section aria-label="Conversas" className={`${openId ? 'hidden md:flex' : 'flex'} w-full flex-col border-line bg-print sm:rounded-l-xl sm:border md:w-80 md:shrink-0`}>
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h1 className="text-lg font-bold">Mensagens</h1>
          <button onClick={() => setCreating(true)} aria-label="Nova conversa" className="rounded-lg p-2 hover:bg-ink/5"><IconPlus className="size-6" /></button>
        </header>
        <ul className="flex-1 overflow-y-auto">
          {list?.length === 0 && (
            <li className="px-6 py-12 text-center text-ink-soft">
              Nenhuma conversa ainda.
              <button onClick={() => setCreating(true)} className="btn-solid mt-4 block w-full">Começar conversa</button>
            </li>
          )}
          {list?.map((c) => (
            <li key={c.id}>
              <button onClick={() => open(c.id)} aria-current={c.id === openId ? 'true' : undefined}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink/5 aria-[current=true]:bg-ink/5">
                <ConvAvatar c={c} meId={me.id} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className={`block truncate ${c.unread_count ? 'font-bold' : 'font-semibold'}`}>{title(c, me.id)}</span>
                  <span className={`block truncate text-sm ${c.unread_count ? 'text-ink' : 'text-ink-soft'}`}>
                    {c.last_message ? `${c.last_message.user_id === me.id ? 'Você: ' : ''}${c.last_message.body}` : 'Sem mensagens'}
                  </span>
                </span>
                {!!c.unread_count && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pencil px-1.5 text-xs font-bold text-white">{c.unread_count}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Conversa aberta" className={`${openId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col border-line bg-paper sm:rounded-r-xl sm:border sm:border-l-0`}>
        {current ? (
          <Thread key={current.id} c={current} me={me} onBack={() => open(null)}
            onLeft={() => { setData((l) => l?.filter((x) => x.id !== current.id)); open(null) }}
            onChange={(c) => setData((l) => l?.map((x) => (x.id === c.id ? { ...x, ...c } : x)))} />
        ) : (
          <div className="m-auto max-w-xs px-6 text-center text-ink-soft">
            <IconChat className="mx-auto size-12" />
            <p className="mt-3 font-semibold text-ink">Suas conversas</p>
            <p className="mt-1">Converse com quem você segue e te segue de volta. Crie grupos com até 20 pessoas.</p>
          </div>
        )}
      </section>

      {creating && <NewConversation onClose={() => setCreating(false)} onCreated={(c) => { setCreating(false); reload(); open(c.id) }} />}
    </div>
  )
}

function ConvAvatar({ c, meId }: { c: Conversation; meId: number }) {
  if (!c.is_group) { const o = other(c, meId); return <Avatar path={o.profile_photo_path} name={o.name} size="size-12" /> }
  const [a, b] = c.members.filter((m) => m.id !== meId)
  return (
    <span className="relative size-12 shrink-0">
      <span className="absolute left-0 top-0"><Avatar path={a?.profile_photo_path ?? null} name={a?.name ?? '?'} size="size-8" /></span>
      <span className="absolute bottom-0 right-0 rounded-full ring-2 ring-print"><Avatar path={b?.profile_photo_path ?? null} name={b?.name ?? '?'} size="size-8" /></span>
    </span>
  )
}

function Thread({ c, me, onBack, onLeft, onChange }: { c: Conversation; me: User; onBack: () => void; onLeft: () => void; onChange: (c: Conversation) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const last = messages.at(-1)?.id

  const fetchNew = useCallback(() => {
    api<Message[]>(`/api/conversations/${c.id}/messages${last ? `?after=${last}` : ''}`)
      .then((m) => { if (m.length) setMessages((prev) => [...prev, ...m.filter((x) => !prev.some((p) => p.id === x.id))]) }, () => {})
  }, [c.id, last])
  useEffect(() => { if (!last) fetchNew() }, [fetchNew, last])
  usePoll(fetchNew, 3000)
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }) }, [messages.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText(''); setError('')
    try {
      const m = await api<Message>(`/api/conversations/${c.id}/messages`, { method: 'POST', body: JSON.stringify({ body }) })
      setMessages((prev) => [...prev, m])
      onChange({ ...c, last_message: m, unread_count: 0 })
    } catch (err) {
      setText(body)
      setError(err instanceof ApiError && err.status === 429 ? 'Muitas mensagens seguidas. Espere um pouco.' : 'Não deu pra enviar. Tente de novo.')
    }
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-line bg-print px-3 py-2.5 sm:rounded-tr-xl">
        <button onClick={onBack} aria-label="Voltar" className="rounded-lg p-1.5 hover:bg-ink/5 md:hidden"><IconBack className="size-6" /></button>
        <ConvAvatar c={c} meId={me.id} />
        <button onClick={() => setInfo(true)} className="min-w-0 flex-1 text-left leading-tight">
          <span className="block truncate font-semibold">{title(c, me.id)}</span>
          <span className="block truncate text-sm text-ink-soft">{c.is_group ? `${c.members.length} pessoas` : `@${other(c, me.id).username}`}</span>
        </button>
      </header>

      <ol className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((m, i) => {
          const mine = m.user_id === me.id
          const showName = c.is_group && !mine && messages[i - 1]?.user_id !== m.user_id
          return (
            <li key={m.id} className={`msg-in flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              {showName && <span className="mb-0.5 ml-3 mt-2 text-xs text-ink-soft">{m.user?.name}</span>}
              <p title={ago(m.created_at)} className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 ${mine ? 'rounded-br-md bg-envelope text-on-envelope' : 'rounded-bl-md border border-line bg-print'}`}>{m.body}</p>
            </li>
          )
        })}
        <div ref={bottom} />
      </ol>

      <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-print p-3 sm:rounded-br-xl">
        <label htmlFor="msg" className="sr-only">Mensagem</label>
        <textarea id="msg" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} rows={1} placeholder="Mensagem…"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit() } }}
          className="max-h-32 min-w-0 flex-1 resize-none rounded-2xl border border-line bg-paper px-4 py-2.5 outline-none [field-sizing:content] focus:border-ink" />
        <button disabled={!text.trim()} aria-label="Enviar" className="grid size-11 shrink-0 place-items-center rounded-full bg-envelope text-on-envelope transition-transform active:scale-90 disabled:opacity-40"><IconSend className="size-5" /></button>
      </form>
      {error && <p role="alert" className="bg-print px-4 pb-3 text-sm font-semibold text-pencil">{error}</p>}

      {info && <Info c={c} me={me} onClose={() => setInfo(false)} onLeft={onLeft} onChange={onChange} />}
    </>
  )
}

function Dialog({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()} aria-label={label}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl bg-print p-0 text-ink backdrop:bg-black/50 sm:m-auto sm:max-w-md sm:rounded-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-line bg-print px-4 py-3">
        <h2 className="font-bold">{label}</h2>
        <button onClick={() => ref.current?.close()} aria-label="Fechar" className="rounded-lg p-1.5 hover:bg-ink/5"><IconClose className="size-5" /></button>
      </div>
      {children}
    </dialog>
  )
}

function ContactPicker({ exclude = [], selected, toggle }: { exclude?: number[]; selected: number[]; toggle: (id: number) => void }) {
  const { data, error } = useApi<User[]>('/api/chat/contacts')
  const list = data?.filter((u) => !exclude.includes(u.id))
  if (error) return <p className="px-4 py-6 text-ink-soft">Não deu pra carregar seus contatos.</p>
  if (list?.length === 0) return <p className="px-4 py-6 text-ink-soft">Ninguém disponível. Você só conversa com quem segue e te segue de volta.</p>
  return (
    <ul className="max-h-[50dvh] overflow-y-auto py-1">
      {list?.map((u) => (
        <li key={u.id}>
          <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-ink/5">
            <Avatar path={u.profile_photo_path} name={u.name} size="size-10" />
            <span className="min-w-0 flex-1 leading-tight"><span className="block truncate font-semibold">{u.username}</span><span className="text-sm text-ink-soft">{u.name}</span></span>
            <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} className="size-5 accent-[var(--envelope-deep)]" />
          </label>
        </li>
      ))}
    </ul>
  )
}

function NewConversation({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Conversation) => void }) {
  const [selected, setSelected] = useState<number[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const group = selected.length > 1

  async function create() {
    try {
      onCreated(await api<Conversation>('/api/conversations', { method: 'POST', body: JSON.stringify({ user_ids: selected, name: group ? name : null }) }))
    } catch (e) { setError(e instanceof ApiError ? Object.values(e.errors)[0]?.[0] ?? e.message : 'Não deu pra criar a conversa.') }
  }

  return (
    <Dialog label="Nova conversa" onClose={onClose}>
      <ContactPicker selected={selected} toggle={toggle} />
      <div className="border-t border-line p-4">
        {group && (
          <label className="mb-3 block">
            <span className="text-sm font-semibold text-ink-soft">Nome do grupo</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5 outline-none focus:border-ink" />
          </label>
        )}
        {error && <p role="alert" className="mb-3 text-sm font-semibold text-pencil">{error}</p>}
        <button onClick={create} disabled={!selected.length || (group && !name.trim())} className="btn-solid w-full py-3">
          {group ? `Criar grupo com ${selected.length} pessoas` : 'Conversar'}
        </button>
      </div>
    </Dialog>
  )
}

function Info({ c, me, onClose, onLeft, onChange }: { c: Conversation; me: User; onClose: () => void; onLeft: () => void; onChange: (c: Conversation) => void }) {
  const [adding, setAdding] = useState<number[]>([])
  const add = async () => {
    for (const id of adding) onChange(await api<Conversation>(`/api/conversations/${c.id}/members`, { method: 'POST', body: JSON.stringify({ user_id: id }) }))
    setAdding([])
  }
  const leave = async () => {
    if (!confirm(c.is_group ? 'Sair do grupo?' : 'Apagar esta conversa da sua lista?')) return
    await api(`/api/conversations/${c.id}/members/me`, { method: 'DELETE' })
    onLeft()
  }
  return (
    <Dialog label={c.is_group ? c.name ?? 'Grupo' : 'Conversa'} onClose={onClose}>
      <ul className="py-1">
        {c.members.map((m: Member) => (
          <li key={m.id}>
            <a href={profileHref(m.username)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink/5">
              <Avatar path={m.profile_photo_path} name={m.name} size="size-10" />
              <span className="leading-tight"><span className="block font-semibold">{m.username}{m.id === me.id && ' (você)'}</span><span className="text-sm text-ink-soft">{m.name}</span></span>
            </a>
          </li>
        ))}
      </ul>
      {c.is_group && (
        <div className="border-t border-line">
          <p className="px-4 pt-3 text-sm font-semibold text-ink-soft">Adicionar pessoas</p>
          <ContactPicker exclude={c.members.map((m) => m.id)} selected={adding} toggle={(id) => setAdding((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} />
          {adding.length > 0 && <div className="px-4 pb-3"><button onClick={add} className="btn-solid w-full">Adicionar {adding.length}</button></div>}
        </div>
      )}
      <div className="border-t border-line p-4">
        <button onClick={leave} className="w-full rounded-lg py-2.5 font-semibold text-pencil hover:bg-pencil/10">{c.is_group ? 'Sair do grupo' : 'Apagar conversa'}</button>
      </div>
    </Dialog>
  )
}
