'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconTrash } from './icons'

type Options = { title: string; body?: ReactNode; confirmLabel: string; danger?: boolean }

/**
 * App-styled replacement for window.confirm().
 * `const [confirm, dialog] = useConfirm()`; render `{dialog}`; `if (await confirm({...}))`.
 */
export function useConfirm() {
  const [state, setState] = useState<{ opts: Options; resolve: (ok: boolean) => void } | null>(null)
  const confirm = (opts: Options) => new Promise<boolean>((resolve) => setState({ opts, resolve }))
  // Portal to <body>: a dialog inside an animated/faded ancestor can render dimmed in some browsers.
  const dialog = state && createPortal(
    <ConfirmDialog {...state.opts} onClose={(ok) => { state.resolve(ok); setState(null) }} />,
    document.body,
  )
  return [confirm, dialog] as const
}

function ConfirmDialog({ title, body, confirmLabel, danger, onClose }: Options & { onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const done = useRef(false)
  const close = (ok: boolean) => { if (done.current) return; done.current = true; onClose(ok) }
  useEffect(() => { ref.current?.showModal() }, [])

  return (
    <dialog ref={ref} onCancel={() => close(false)} onClick={(e) => e.target === ref.current && close(false)}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-line bg-print p-0 text-ink shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] backdrop:bg-black/60 backdrop:backdrop-blur-[2px]">
      <div className="flex flex-col items-center px-6 pb-2 pt-7 text-center">
        {danger && <span className="mb-4 grid size-12 place-items-center rounded-full bg-pencil/12 text-pencil"><IconTrash className="size-6" /></span>}
        <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
        {body && <p className="mt-1.5 text-ink-soft">{body}</p>}
      </div>
      <div className="mt-5 flex flex-col border-t border-line">
        <button onClick={() => close(true)}
          className={`py-3.5 font-bold transition-colors hover:bg-ink/5 ${danger ? 'text-pencil' : 'text-ink'}`}>{confirmLabel}</button>
        <button autoFocus onClick={() => close(false)} className="border-t border-line py-3.5 text-ink-soft transition-colors hover:bg-ink/5">Cancelar</button>
      </div>
    </dialog>
  )
}
