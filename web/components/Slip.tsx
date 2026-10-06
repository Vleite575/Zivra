// Auth card: centered panel holding a form.
export function Slip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-print px-6 py-8 sm:px-9">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="mt-6">{children}</div>
    </section>
  )
}
