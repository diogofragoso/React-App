<!-- Documento: docs/31-renderizacoes.md -->

# 31 · Entendendo renderizações

[← Anterior](30-revisao-da-arquitetura.md) · [Índice](../README.md) · **Etapa 31 de 36** · [Próxima →](32-otimizacao.md)

**Ponto de partida:** conclua a conferência do capítulo 30 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Estudante observa atualizações e diferencia render, commit e mudança no DOM.

**Conceitos praticados:** pureza, árvore React, state, props, Context, React DevTools Profiler, effects.

## 1. Medir uma interação real

Use React DevTools, selecione componentes e grave no Profiler: login, pesquisa e abertura do modal. Compare quais componentes receberam state, props ou Context novos.

Render executa funções para calcular a interface. Commit aplica mudanças necessárias. Um render não implica que todo o DOM foi refeito. Renderizações podem ser repetidas ou descartadas; por isso o corpo do componente deve ser puro.

## 2. Acrescentar um observador temporário

**Arquivo: `src/components/RenderProbe.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/components/RenderProbe.tsx -->
```tsx
// Arquivo: src/components/RenderProbe.tsx
import { useEffect } from 'react';

export function RenderProbe({ label }: { label: string }) {
  useEffect(() => {
    console.count('Commit observado: ' + label);
  });
  return null;
}
```

**Arquivo: `src/pages/Home/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Home/index.tsx -->
```tsx
// Arquivo: src/pages/Home/index.tsx
import { RenderProbe } from '../../components/RenderProbe';
import { Card } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

export function Home() {
  const { user } = useAuth();
  if (!user) return null;
  const firstName = user.name.trim().split(/\s+/)[0];
  return (
    <>
      <h1>Olá, {firstName}!</h1>
      <RenderProbe label="Home" />
      <Card>
        <Card.Body>
          <Card.Title>Minha conta</Card.Title>
          <dl>
            <dt>Nome</dt><dd>{user.name}</dd>
            <dt>E-mail</dt><dd>{user.email}</dd>
          </dl>
          <p>Próxima entrega: consultar os clientes cadastrados.</p>
        </Card.Body>
      </Card>
    </>
  );
}
```

O contador está em um efeito e observa commits, não todas as tentativas internas de render. StrictMode pode executar o efeito adicionalmente no desenvolvimento; a contagem isolada não é um benchmark.

O objetivo é relacionar uma mudança de dados com uma atualização. Não coloque contadores mutáveis no render nem HTTP para “descobrir se renderizou”.

## 3. Fazer uma hipótese verificável

Antes de otimizar, escreva: “Ao digitar na pesquisa, N cartões com props iguais voltam a renderizar e o commit custa X ms”. Só depois avalie se a percepção do usuário justifica uma mudança.
## Conferência antes de avançar

- [ ] Profiler registra uma interação e os componentes atualizados.
- [ ] Estudante distingue render e commit.
- [ ] Nenhum efeito modifica state apenas para contar renders.

## Prática do estudante

Compare digitar em Login com mostrar um Toast. Qual Provider mudou? Quais consumidores receberam um novo valor? Identifique uma hipótese sem concluir que toda renderização é um problema.

## Se algo falhar

Contagens duplicadas no desenvolvimento podem ser verificações de StrictMode. Meça duração e comportamento percebido, não apenas console.count.

Referências: [Render e commit](https://react.dev/learn/render-and-commit) · [Profiler](https://react.dev/reference/react/Profiler).

[← Anterior](30-revisao-da-arquitetura.md) · [Índice](../README.md) · [Próxima →](32-otimizacao.md)
