'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, useApi, useMe, type Post } from '@/lib/api'
import { Avatar } from '@/components/Avatar'
import { PostCard } from '@/components/PostCard'
import { IconCamera, IconClose } from '@/components/icons'

const ACCEPT = 'image/jpeg,image/png,video/mp4,video/quicktime,video/x-msvideo'

export default function Feed() {
  const { data: posts, error, setData } = useApi<Post[]>('/api/feed')
  const update = (p: Post) => setData((list) => list?.map((x) => (x.id === p.id ? p : x)))

  return (
    <div className="mx-auto flex max-w-[500px] flex-col gap-4 py-4 sm:px-4 sm:py-8">
      <Composer onPost={(p) => setData((list) => [p, ...(list ?? [])])} />
      {error && <p className="py-10 text-center text-ink-soft">Não deu pra carregar o feed. Atualize a página.</p>}
      {!posts && !error && <p className="py-10 text-center text-ink-soft" aria-live="polite">Carregando…</p>}
      {posts?.length === 0 && (
        <div className="px-4 py-16 text-center">
          <p className="text-xl font-bold">Seu feed está vazio.</p>
          <p className="mt-2 text-ink-soft">Poste a primeira foto. Pra seguir alguém, abra o perfil da pessoa pelo link dela.</p>
        </div>
      )}
      {posts?.map((p) => <PostCard key={p.id} post={p} onChange={update} />)}
    </div>
  )
}

function Composer({ onPost }: { onPost: (p: Post) => void }) {
  const { me } = useMe()
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
    <form id="novo" onSubmit={submit} className="scroll-mt-20 border-y border-line bg-print p-4 sm:rounded-xl sm:border">
      <div className="flex gap-3">
        {me && <Avatar path={me.profile_photo_path} name={me.name} size="size-10" />}
        <div className="min-w-0 flex-1">
          <label htmlFor="content" className="sr-only">O que rolou hoje?</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={280} rows={2} required
            placeholder="O que rolou hoje?" className="w-full resize-none bg-transparent py-2 text-lg outline-none placeholder:text-ink-soft" />
          {preview && (
            <div className="relative mt-2 w-36">
              {file?.type.startsWith('video')
                ? <video src={preview} className="aspect-[4/5] w-full rounded-lg bg-black object-cover" />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={preview} alt="Prévia do arquivo escolhido" className="aspect-[4/5] w-full rounded-lg object-cover" />}
              <button type="button" onClick={() => { setFile(null); if (input.current) input.current.value = '' }} aria-label="Tirar arquivo"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white"><IconClose className="size-4" /></button>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm font-semibold text-pencil">{error}</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink">
          <IconCamera className="size-6" /> Foto ou vídeo
          <input ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <span className={`ml-auto text-sm tabular-nums ${content.length > 260 ? 'font-bold text-pencil' : 'text-ink-soft'}`}>{content.length}/280</span>
        <button disabled={busy || !content.trim()} className="btn-solid">{busy ? 'Postando…' : 'Postar'}</button>
      </div>
    </form>
  )
}
