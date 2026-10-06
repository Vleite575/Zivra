'use client'
import { useEffect, useState } from 'react'
import { Print } from './Print'
import { Loop } from './Loop'
import { BASE } from '@/lib/api'

export function HeroPrints() {
  const [drawn, setDrawn] = useState(false)
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 700); return () => clearTimeout(t) }, [])
  return (
    <div>
    <div className="relative mx-auto h-[min(118vw,520px)] w-full max-w-[420px]">
      <Print src={`${BASE}/prints/1011.jpg`} alt="Garota remando uma canoa num lago" n={12} caption="@bia.remos"
        className="absolute left-0 top-6 w-[58%] -rotate-6" />
      <Print src={`${BASE}/prints/453.jpg`} alt="Banda tocando num show com luz forte" n={13} caption="@caio.som"
        className="absolute right-0 top-0 w-[56%] rotate-[5deg]">
        <Loop drawn={drawn} />
      </Print>
      <Print src={`${BASE}/prints/1062.jpg`} alt="Cachorro pug enrolado num cobertor" n={14} caption="@lu.e.o.pug"
        className="absolute bottom-0 left-[20%] w-[60%] -rotate-1" />
    </div>
    <p className="mt-6 text-center text-xs text-on-envelope/70">Fotos e perfis de exemplo.</p>
    </div>
  )
}
