'use client'
import { useEffect, useState } from 'react'
import { api, profileHref, type User } from '@/lib/api'
import { Avatar } from '@/components/Avatar'
import { IconSearch } from '@/components/icons'

export default function Search() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ q: string; users: User[] } | null>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) return
    const t = setTimeout(() => api<User[]>(`/api/users?q=${encodeURIComponent(term)}`).then((users) => setResults({ q: term, users })), 300)
    return () => clearTimeout(t)
  }, [q])

  const term = q.trim()
  const shown = term.length >= 2 && results?.q === term ? results.users : null

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-bold">Buscar pessoas</h1>
      <label className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-print px-4 focus-within:border-ink">
        <IconSearch className="size-5 text-ink-soft" />
        <span className="sr-only">Nome ou nick</span>
        <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou nick"
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-ink-soft" />
      </label>
      {term.length < 2 && <p className="mt-6 text-ink-soft">Digite pelo menos 2 letras.</p>}
      {shown?.length === 0 && <p className="mt-6 text-ink-soft">Ninguém encontrado com “{term}”.</p>}
      {shown && shown.length > 0 && (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-print">
          {shown.map((u) => (
            <li key={u.id}>
              <a href={profileHref(u.username)} className="flex items-center gap-3 px-4 py-3 hover:bg-ink/5">
                <Avatar path={u.profile_photo_path} name={u.name} size="size-11" />
                <span className="min-w-0 leading-tight"><span className="block truncate font-semibold">{u.username}</span><span className="text-sm text-ink-soft">{u.name}</span></span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
