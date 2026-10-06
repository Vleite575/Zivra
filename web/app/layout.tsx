import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import { MeProvider } from '@/lib/api'
import { ToastProvider } from '@/components/Toast'
import './globals.css'

const archivo = Archivo({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--font-archivo' })

export const metadata: Metadata = {
  title: { default: 'Zivra', template: '%s · Zivra' },
  description: 'Suas fotos e vídeos, só pra quem você escolheu.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MeProvider><ToastProvider>{children}</ToastProvider></MeProvider>
      </body>
    </html>
  )
}
