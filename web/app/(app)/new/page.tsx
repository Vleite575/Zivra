'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, useMe, type Post } from '@/lib/api'
import { Avatar } from '@/components/Avatar'
import { useToast } from '@/components/Toast'
import { IconCamera, IconClose } from '@/components/icons'

const ACCEPT = 'image/jpeg,image/png,video/mp4,video/quicktime,video/x-msvideo'

export default function NewPost() {
  return (
    <div className="mx-auto w-full max-w-[560px] py-4 sm:px-4 sm:py-8">
      <h1 className="mb-4 px-4 text-2xl font-bold sm:px-0">Novo post</h1>
      <Composer />
    </div>
  )
}

function Composer() {
  const router = useRouter()
  const { me } = useMe()
  const toast = useToast()
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
      await api<Post>('/api/posts', { method: 'POST', body })
      toast('Post publicado')
      router.push('/feed')
    } catch {
      setError('Não deu pra postar. Confira o arquivo (até 20 MB, jpg, png, mp4, mov ou avi) e tente de novo.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="border-y border-line bg-print p-4 sm:rounded-xl sm:border">
      <div className="flex gap-3">
        {me && <Avatar path={me.profile_photo_path} name={me.name} size="size-10" />}
        <div className="min-w-0 flex-1">
          <label htmlFor="content" className="sr-only">O que rolou hoje?</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={280} rows={5} required autoFocus
            placeholder="O que rolou hoje?" className="w-full resize-none bg-transparent py-2 text-lg outline-none placeholder:text-ink-soft" />
          {preview && (
            <div className="relative mt-2 w-48">
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
