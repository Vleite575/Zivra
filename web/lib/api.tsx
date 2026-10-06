'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type User = { id: number; name: string; username: string; bio: string | null; profile_photo_path: string | null; is_public: boolean; email?: string; pending_requests_count?: number; unread_messages_count?: number }
export type Comment = { id: number; content: string; user_id: number; created_at: string; user: User; likes_count: number; is_liked: boolean }
export type Post = { id: number; content: string; media_path: string | null; media_type: 'image' | 'video' | null; created_at: string; user: User; likes_count: number; comments_count: number; is_liked: boolean; comments: Comment[] }
export type Profile = {
  user: User & { followers_count: number; following_count: number; posts_count: number }
  posts: Post[]; isOwnProfile: boolean; isFollowing: boolean; hasRequestedToFollow: boolean; hasPendingRequestFrom: boolean; canSeeContent: boolean
}

export type Message = { id: number; user_id: number; body: string; created_at: string; user?: User }
export type Conversation = {
  id: number; name: string | null; is_group: boolean; unread_count?: number
  members: Pick<User, 'id' | 'name' | 'username' | 'profile_photo_path'>[]
  last_message: Omit<Message, 'user'> | null
}

export class ApiError extends Error {
  constructor(public status: number, public errors: Record<string, string[]> = {}, message = '') { super(message) }
}

let onUnauthorized: (() => void) | null = null

import { BASE } from './base'
export { BASE }

/** Profiles are served by one static page (app/u) via an Apache rewrite, so link with a plain <a>. */
export const profileHref = (username: string) => `${BASE}/${username}`

const xsrf = () => decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '')

export async function api<T = unknown>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && !xsrf()) await fetch(`${BASE}/sanctum/csrf-cookie`)
  const json = init.body && !(init.body instanceof FormData)
  const res = await fetch(BASE + path, {
    ...init,
    headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf(), ...(json ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  })
  // Stale CSRF token (session rotated by login/logout or expired): refresh it and retry once.
  if (res.status === 419 && !retried) {
    await fetch(`${BASE}/sanctum/csrf-cookie`)
    return api<T>(path, init, true)
  }
  // Session gone mid-use: let MeProvider clear the user so the auth guard sends them to /login.
  if (res.status === 401 && path !== '/api/user') onUnauthorized?.()
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.errors, data.message)
  return data
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<ApiError>()
  const reload = useCallback(() => { if (path) api<T>(path).then(setData, setError) }, [path])
  useEffect(reload, [reload])
  return { data, error, setData, reload }
}

export const media = (path: string) => `${BASE}/storage/${path}`
/** Post photos/videos are private files streamed by the API after a permission check. */
export const postMedia = (post: { id: number }) => `${BASE}/api/posts/${post.id}/media`

const MeContext = createContext<{ me: User | null | undefined; setMe: (u: User | null) => void }>({ me: undefined, setMe: () => {} })

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<User | null>()
  useEffect(() => {
    onUnauthorized = () => setMe(null)
    const load = () => api<User>('/api/user').then(setMe, () => setMe(null))
    load()
    // Keep badges (requests, unread messages) fresh while the tab is open.
    const t = setInterval(() => { if (document.visibilityState === 'visible') api<User>('/api/user').then(setMe, () => {}) }, 30000)
    return () => clearInterval(t)
  }, [])
  return <MeContext.Provider value={{ me, setMe }}>{children}</MeContext.Provider>
}

export const useMe = () => useContext(MeContext)
