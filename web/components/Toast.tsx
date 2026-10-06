'use client'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { id: number; text: string }
const ToastContext = createContext<(text: string) => void>(() => {})

/** Small confirmation messages at the bottom ("Post apagado"). Announced to screen readers via role=status. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {toasts.map((t) => (
          <p key={t.id} className="toast-in rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-lg">{t.text}</p>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
