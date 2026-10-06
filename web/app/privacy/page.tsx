import type { Metadata } from 'next'
import { DocPage } from '@/components/DocPage'

export const metadata: Metadata = { title: 'Privacidade' }

export default function Privacy() {
  return (
    <DocPage title="Privacidade" lead="O que a Zivra guarda sobre você e quem pode ver o que você posta." updated="6 de outubro de 2026">
      <h2>O que a gente coleta</h2>
      <p>Só o necessário pra sua conta funcionar: nome, nick, e-mail, data de nascimento e senha (guardada com criptografia, ninguém consegue ler). Também guardamos o que você posta: textos, fotos, vídeos, curtidas, comentários e quem você segue.</p>
      <h2>Pra que serve</h2>
      <p>Pra mostrar seus posts pra quem pode ver, montar seu feed com quem você segue e perfis públicos, e confirmar que você tem 14 anos ou mais. Seu e-mail e sua data de nascimento nunca aparecem pra outras pessoas.</p>
      <h2>Quem vê seus posts</h2>
      <p>Com perfil público, qualquer pessoa vê seus posts. Com perfil privado, só quem você aceitou. Você muda isso a qualquer hora em Ajustes.</p>
      <h2>Apagar seus dados</h2>
      <p>Em Ajustes, a opção Excluir conta apaga seu perfil, posts, curtidas e comentários na hora.</p>
    </DocPage>
  )
}
