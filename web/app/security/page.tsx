import type { Metadata } from 'next'
import { DocPage } from '@/components/DocPage'

export const metadata: Metadata = { title: 'Segurança' }

export default function Security() {
  return (
    <DocPage title="Segurança" lead="Como proteger sua conta e controlar quem chega perto de você." updated="6 de outubro de 2026">
      <h2>Sua senha</h2>
      <p>Use uma senha com pelo menos 8 caracteres que você não usa em outro lugar. Se esquecer, peça um link novo na tela de login. Pra trocar, vá em Ajustes.</p>
      <h2>Controle de quem te segue</h2>
      <p>Deixe o perfil privado e cada pessoa nova precisa pedir pra te seguir. Os pedidos ficam em Pedidos, onde você aceita ou recusa.</p>
      <h2>Seus comentários</h2>
      <p>Você pode apagar qualquer comentário que escreveu.</p>
      <h2>Idade mínima</h2>
      <p>A Zivra é pra quem tem 14 anos ou mais. A data de nascimento é conferida no cadastro.</p>
    </DocPage>
  )
}
