// The order slip: white paper card with a perforated top edge, holding an auth form.
export function Slip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative rounded-sm bg-white px-6 pb-8 pt-9 text-on-envelope shadow-[0_24px_50px_-24px_rgb(27_31_59/0.55)] sm:px-9">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-3 [background:radial-gradient(circle_at_6px_0,var(--envelope)_4px,transparent_4.5px)_0_0/12px_12px_repeat-x]" />
      <h1 className="display text-4xl">{title}</h1>
      <div className="mt-7">{children}</div>
    </section>
  )
}
