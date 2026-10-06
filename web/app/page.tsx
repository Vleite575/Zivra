import Link from 'next/link'
import { Mark } from '@/components/Logo'
import { HeroCta, PublicShell } from '@/components/LandingCta'
import { IconEnvelope, IconFeed, IconLock } from '@/components/icons'
import { BASE } from '@/lib/base'

const mosaic = [
  { id: 1011, alt: 'Garota remando uma canoa num lago', h: 'aspect-[4/5]' },
  { id: 453, alt: 'Banda tocando num show com luz forte', h: 'aspect-square' },
  { id: 1062, alt: 'Cachorro pug enrolado num cobertor', h: 'aspect-[3/4]' },
  { id: 64, alt: 'Garota de óculos escuros segurando flores', h: 'aspect-[4/5]' },
  { id: 488, alt: 'Salada colorida numa tigela de barro', h: 'aspect-square' },
  { id: 237, alt: 'Filhote de labrador preto olhando pra cima', h: 'aspect-[3/4]' },
]

const points = [
  { Icon: IconFeed, title: 'Feed em ordem', text: 'Os posts de quem você segue, do mais novo pro mais antigo. Sem algoritmo escolhendo por você.' },
  { Icon: IconLock, title: 'Perfil privado de verdade', text: 'Deixe o perfil fechado e só entra quem você aceitar.' },
  { Icon: IconEnvelope, title: 'Você no controle', text: 'Aceite ou recuse pedidos, apague seus comentários e exclua a conta quando quiser.' },
]

export default function Landing() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:py-20">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black leading-[1.02] tracking-tight [font-variation-settings:'wdth'_112]">
            Suas fotos, só pra sua galera.
          </h1>
          <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-ink-soft">
            Poste fotos e vídeos curtos do seu dia e veja o que seus amigos compartilharam. Uma rede brasileira, mais íntima, a partir de 14 anos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <HeroCta />
          </div>
        </div>
        <div>
          <div className="columns-3 gap-2 sm:gap-3">
            {mosaic.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={`${BASE}/prints/${p.id}.jpg`} alt={p.alt} className={`mb-2 w-full rounded-xl object-cover sm:mb-3 ${p.h} ${i === 1 ? 'mt-8' : ''}`} />
            ))}
          </div>
          <p className="mt-2 text-right text-xs text-ink-soft">Fotos de exemplo.</p>
        </div>
      </section>

      <section className="border-t border-line bg-print">
        <ul className="mx-auto grid max-w-5xl gap-8 px-4 py-14 md:grid-cols-3">
          {points.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-envelope text-on-envelope"><Icon className="size-6" /></span>
              <div>
                <h2 className="font-bold">{title}</h2>
                <p className="mt-1 text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><Mark className="size-5 text-ink" /> Zivra, feita no Brasil.</span>
          <nav className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink">Privacidade</Link>
            <Link href="/security" className="hover:text-ink">Segurança</Link>
          </nav>
        </div>
      </footer>
    </PublicShell>
  )
}
