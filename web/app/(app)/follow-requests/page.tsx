'use client'
import { api, profileHref, useApi, type User } from '@/lib/api'
import { Avatar } from '@/components/Avatar'

export default function FollowRequests() {
  const { data, error, setData } = useApi<User[]>('/api/follow-requests')
  const answer = async (u: User, accept: boolean) => {
    await api(`/api/follow-requests/${u.id}/${accept ? 'accept' : 'reject'}`, { method: accept ? 'POST' : 'DELETE' })
    setData((list) => list?.filter((x) => x.id !== u.id))
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 md:py-10">
      <h1 className="display text-4xl md:text-5xl">Pedidos</h1>
      <p className="mt-2 text-ink-soft">Quem quer ver seu perfil privado. Só entra quem você aceitar.</p>
      {error && <p className="py-10 text-center text-ink-soft">Não deu pra carregar os pedidos. Atualize a página.</p>}
      {data?.length === 0 && (
        <div className="py-16 text-center">
          <p className="wide text-xl font-bold">Nenhum pedido agora.</p>
          <p className="mt-2 text-ink-soft">Pedidos novos aparecem aqui quando seu perfil está privado.</p>
        </div>
      )}
      <ul className="mt-6 divide-y divide-line">
        {data?.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 py-4">
            <a href={profileHref(u.username)} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar path={u.profile_photo_path} name={u.name} size="size-11" />
              <span className="min-w-0 leading-tight"><span className="block truncate font-bold">{u.name}</span><span className="text-sm text-ink-soft">@{u.username}</span></span>
            </a>
            <button onClick={() => answer(u, true)} className="btn-solid">Aceitar</button>
            <button onClick={() => answer(u, false)} className="rounded-md px-3 py-2.5 font-semibold underline">Recusar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
