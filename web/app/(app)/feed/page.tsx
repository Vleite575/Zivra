'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, useApi, type Post } from '@/lib/api'
import { PostCard } from '@/components/PostCard'
import { IconCamera, IconClose } from '@/components/icons'

const ACCEPT = 'image/jpeg,image/png,video/mp4,video/quicktime,video/x-msvideo'

export default function Feed() {
  const { data: posts, error, setData } = useApi<Post[]>('/api/feed')
  const update = (p: Post) => setData((list) => list?.map((x) => (x.id === p.id ? p : x)))

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 md:py-10">
      <h1 className="display mb-6 hidden text-5xl md:block">Feed</h1>
      <Composer onPost={(p) => setData((list) => [p, ...(list ?? [])])} />
      {error && <p className="py-10 text-center text-ink-soft">Não deu pra carregar o feed. Atualize a página.</p>}
      {!posts && !error && <p className="py-10 text-center text-ink-soft" aria-live="polite">Revelando…</p>}
      {posts?.length === 0 && (
        <div className="py-16 text-center">
          <p className="wide text-xl font-bold">Seu rolo está vazio.</p>
          <p className="mt-2 text-ink-soft">Poste a primeira foto. Pra seguir alguém, abra o perfil da pessoa pelo link dela.</p>
        </div>
      )}
      <div className="divide-y divide-line">
        {posts?.map((p) => <PostCard key={p.id} post={p} onChange={update} />)}
      </div>
    </div>
  )
}

function Composer({ onPost }: { onPost: (p: Post) => void }) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const body = new FormData()
    body.append('content', content)
    if (file) body.append('media', file)
    try {
      onPost(await api<Post>('/api/posts', { method: 'POST', body }))
      setContent(''); setFile(null)
      if (input.current) input.current.value = ''
    } catch {
      setError('Não deu pra postar. Confira o arquivo (até 20 MB, jpg, png, mp4, mov ou avi) e tente de novo.')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="mb-4 rounded-sm bg-envelope p-4 text-on-envelope">
      <label htmlFor="content" className="sr-only">O que rolou hoje?</label>
      <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={280} rows={2} required
        placeholder="O que rolou hoje?" className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-on-envelope/55" />
      {preview && (
        <div className="relative mt-2 w-32">
          {file?.type.startsWith('video')
            ? <video src={preview} className="aspect-[4/5] w-full bg-film object-cover" />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={preview} alt="Prévia do arquivo escolhido" className="aspect-[4/5] w-full object-cover" />}
          <button type="button" onClick={() => { setFile(null); if (input.current) input.current.value = '' }} aria-label="Tirar arquivo"
            className="absolute -right-2 -top-2 rounded-full bg-on-envelope p-1 text-envelope"><IconClose className="size-4" /></button>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-pencil">{error}</p>}
      <div className="mt-3 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 font-semibold hover:bg-envelope-deep">
          <IconCamera className="size-6" /> Foto ou vídeo
          <input ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <span className={`edge ml-auto text-xs ${content.length > 260 ? 'text-pencil' : 'text-on-envelope/60'}`}>{content.length}/280</span>
        <button disabled={busy || !content.trim()} className="wide rounded-md bg-on-envelope px-5 py-2.5 font-bold text-envelope disabled:opacity-50">
          {busy ? 'Postando…' : 'Postar'}
        </button>
      </div>
    </form>
  )
}
