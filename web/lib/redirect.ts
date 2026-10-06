/** Post-login destination: only same-origin paths, never `//host` or `/\host` (browsers treat both as external). */
export function safeRedirect(target: string | null | undefined, fallback = '/feed'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback
  return target
}
