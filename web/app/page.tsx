import Link from 'next/link'
import { Logo, Mark } from '@/components/Logo'
import { HeroPrints } from '@/components/LandingHero'
import { HeaderCta, HeroCta } from '@/components/LandingCta'
import { Print, FrameCode } from '@/components/Print'
import { IconLock } from '@/components/icons'
import { Loop } from '@/components/Loop'
import { BASE } from '@/lib/api'

const strip = [
  { id: 237, alt: 'Filhote de labrador preto olhando pra cima', who: '@duda' },
  { id: 488, alt: 'Salada colorida numa tigela de barro', who: '@rafa.cozinha' },
  { id: 64, alt: 'Garota de óculos escuros segurando flores', who: '@mel' },
  { id: 349, alt: 'Pessoa sentada olhando o pôr do sol', who: '@joao.p' },
  { id: 1005, alt: 'Rapaz de cachecol olhando o mar', who: '@theo' },
]

export default function Landing() {
  return (
    <div className="flex min-h-dvh flex-col">
      <section className="bg-envelope text-on-envelope">
        <header className="mx-auto flex max-w-6xl items-center justify-end px-4 py-5 sm:px-8">
          <nav className="flex items-center gap-2 sm:gap-4">
            <HeaderCta />
          </nav>
        </header>
        <div className="mx-auto max-w-6xl overflow-hidden px-4 sm:px-8">
          <Logo className="text-[clamp(4.5rem,21vw,17rem)] tracking-tight" />
        </div>

        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 pb-16 pt-8 sm:px-8 md:grid-cols-[1.1fr_1fr] md:pb-24">
          <div>
            <h1 className="display text-[clamp(2.5rem,5.5vw,4.25rem)]">Revelado só pra sua galera.</h1>
            <p className="mt-6 max-w-[34ch] text-lg leading-relaxed sm:text-xl">
              Poste fotos e vídeos curtos do seu dia. Quem te segue vê tudo em ordem, do mais novo pro mais antigo. Sem algoritmo escolhendo por você.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <HeroCta />
            </div>
            <p className="mt-4 text-sm">Grátis. A partir de 14 anos.</p>
          </div>
          <HeroPrints />
        </div>
      </section>

      <section aria-labelledby="ordem" className="bg-film py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 id="ordem" className="display max-w-[16ch] text-4xl sm:text-5xl">Seu feed é um rolo de filme.</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-white/75">
            Cada post é um quadro na ordem em que foi feito. Você vê quem segue e perfis públicos. Nada de sugestão de estranho no meio.
          </p>
        </div>
        <ol className="mt-10 flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8 [scrollbar-width:thin]" aria-label="Exemplo de feed">
          {strip.map((p, i) => (
            <li key={p.id} className="w-56 shrink-0">
              <div className="mb-2 flex justify-between text-envelope"><FrameCode n={i + 21} /><span className="edge text-xs">ZIVRA 400</span></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${BASE}/prints/${p.id}.jpg`} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full rounded-sm object-cover" />
              <p className="mt-2 text-sm text-white/80">{p.who}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-2 max-w-6xl px-4 text-xs text-white/50 sm:px-8">Fotos e perfis de exemplo.</p>
      </section>

      <section aria-labelledby="privado" className="bg-paper py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="relative mx-auto aspect-[4/3] max-w-md rounded-sm bg-envelope p-8 text-on-envelope shadow-[0_24px_50px_-24px_rgb(27_31_59/0.5)]">
              <div className="absolute inset-x-0 top-0 h-1/2 origin-top bg-envelope-deep [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              <div className="relative flex h-full flex-col items-center justify-end gap-2 text-center">
                <IconLock className="size-8" />
                <p className="wide text-xl font-bold">Perfil privado</p>
                <p className="text-sm">Só abre pra quem você aceitou.</p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 id="privado" className="display max-w-[14ch] text-4xl sm:text-5xl">Fecha o envelope quando quiser.</h2>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
              Deixe o perfil privado e cada pessoa nova pede pra te seguir. Você aceita ou recusa. Dá pra mudar a qualquer hora nos ajustes.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="circule" className="bg-print py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-8 md:grid-cols-2">
          <div>
            <h2 id="circule" className="display max-w-[14ch] text-4xl sm:text-5xl">Circule o que você curtiu.</h2>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
              Curtir é marcar a foto com lápis vermelho, como na folha de contato do laboratório. Comente direto embaixo do quadro.
            </p>
          </div>
          <Print src={`${BASE}/prints/64.jpg`} alt="Garota de óculos escuros segurando flores" n={7} caption="@mel"
            className="relative mx-auto w-full max-w-xs rotate-2">
            <Loop drawn />
          </Print>
        </div>
      </section>

      <section className="bg-envelope py-20 text-on-envelope">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:px-8 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-[14ch] text-5xl sm:text-6xl">Seu primeiro rolo começa agora.</h2>
          <Link href="/register" className="wide w-full rounded-md bg-on-envelope px-8 py-4 text-center text-lg font-bold text-envelope md:w-auto">
            Criar minha conta
          </Link>
        </div>
      </section>

      <footer className="bg-film py-8 text-sm text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="flex items-center gap-2"><Mark className="size-5 text-envelope" /> Zivra, feito no Brasil.</span>
          <nav className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">Privacidade</Link>
            <Link href="/security" className="hover:text-white">Segurança</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
