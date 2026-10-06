'use client'
import Link from 'next/link'
import { useApi, type Post } from '@/lib/api'
import { FeedSidebar, SuggestionStrip } from '@/components/Suggestions'
import { PostCard } from '@/components/PostCard'

export default function Feed() {
  const { data: posts, error, setData } = useApi<Post[]>('/api/feed')
  const update = (p: Post) => setData((list) => list?.map((x) => (x.id === p.id ? p : x)))

  return (
    <div className="mx-auto flex max-w-[884px] justify-center gap-16 sm:px-4">
    <div className="flex w-full max-w-[500px] flex-col gap-4 py-4 sm:py-8">
      <SuggestionStrip />
      {error && <p className="py-10 text-center text-ink-soft">Não deu pra carregar o feed. Atualize a página.</p>}
      {!posts && !error && <p className="py-10 text-center text-ink-soft" aria-live="polite">Carregando…</p>}
      {posts?.length === 0 && (
        <div className="px-4 py-16 text-center">
          <p className="text-xl font-bold">Seu feed está vazio.</p>
          <p className="mt-2 text-ink-soft">Pra seguir alguém, abra o perfil da pessoa pelo link dela.</p>
          <Link href="/new" className="btn-solid mt-6 inline-block">Postar a primeira foto</Link>
        </div>
      )}
      {posts?.map((p) => <PostCard key={p.id} post={p} onChange={update} onDelete={(id) => setData((list) => list?.filter((x) => x.id !== id))} />)}
    </div>
    <FeedSidebar />
    </div>
  )
}
