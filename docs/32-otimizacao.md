<!-- Documento: docs/32-otimizacao.md -->

# 32 · Otimização quando necessária

[← Anterior](31-renderizacoes.md) · [Índice](../README.md) · **Etapa 32 de 36** · [Próxima →](33-lazy-loading.md)

**Ponto de partida:** conclua a conferência do capítulo 31 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Otimização é tratada como experimento medido, com exemplo isolado.

**Conceitos praticados:** memo, useMemo, useCallback, dependências, igualdade de referência, custo de memoização.

## 1. Separar necessidade e mecanismo

Não há evidência de que a pequena lista do tutorial precisa de memoização. A aplicação principal permanece simples; o exemplo serve para comparar mecanismos em uma cópia de estudo com muitos itens.

| Ferramenta | O que mantém |
|---|---|
| memo | Pode reutilizar a renderização do filho quando as props permanecem iguais |
| useMemo | Resultado de um cálculo enquanto as dependências permanecem iguais |
| useCallback | Identidade de uma função enquanto as dependências permanecem iguais |

memo não impede atualizações do state do próprio filho nem do Context que ele consome. useMemo não corrige mutação, dependência errada ou lógica de negócio. Nenhum deles substitui validação ou garante correção do programa.

**Arquivo: `src/examples/MemoDemo.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/examples/MemoDemo.tsx -->
```tsx
// Arquivo: src/examples/MemoDemo.tsx
import { memo, useCallback, useMemo, useState } from 'react';
import type { Cliente } from '../types';

interface RowProps {
  cliente: Cliente;
  onSelect: (cliente: Cliente) => void;
}
const DemoRow = memo(function DemoRow({ cliente, onSelect }: RowProps) {
  return <li><button type="button" onClick={() => onSelect(cliente)}>{cliente.name}</button></li>;
});

export function MemoDemo({ clientes }: { clientes: Cliente[] }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const filtered = useMemo(() => clientes.filter(cliente =>
    cliente.name.toLowerCase().includes(search.toLowerCase())), [clientes, search]);
  const select = useCallback((cliente: Cliente) => setSelectedId(cliente.id), []);
  return (
    <section>
      <h2>Demonstração de memoização</h2>
      <label htmlFor="memo-search">Pesquisar</label>
      <input id="memo-search" value={search} onChange={event => setSearch(event.target.value)} />
      <p>Selecionado: {selectedId ?? 'nenhum'}</p>
      <ul>{filtered.map(cliente => <DemoRow key={cliente.id} cliente={cliente} onSelect={select} />)}</ul>
    </section>
  );
}
```

## 2. Conduzir o experimento

Monte MemoDemo em uma página temporária com uma coleção conhecida. Grave selecionar um item antes e depois de retirar memo de DemoRow. Observe que selecionar não muda search: o cálculo filtrado pode ser reutilizado e select mantém a mesma referência.

Digitar muda search, logo o filtro precisa ser recalculado. Passar objetos recriados em todo render reduz o benefício de memo. A função useCallback usa apenas um setter estável, por isso não depende de selectedId.

Não aplique essa demonstração na listagem principal sem uma medição que justifique complexidade adicional. React Compiler também pode alterar necessidades de otimização quando configurado; ele não é presumido nesta configuração.

Depois da observação, restaure a Home sem o instrumento temporário.

**Arquivo: `src/pages/Home/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Home/index.tsx -->
```tsx
// Arquivo: src/pages/Home/index.tsx
import { Card } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

export function Home() {
  const { user } = useAuth();
  if (!user) return null;
  const firstName = user.name.trim().split(/\s+/)[0];
  return (
    <>
      <h1>Olá, {firstName}!</h1>
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


## Conferência antes de avançar

- [ ] Hipótese, interação e medição foram registradas.
- [ ] Dependências representam os valores usados.
- [ ] Programa funciona com ou sem memoização.

## Prática do estudante

Crie uma coleção de estudo com milhares de itens sem enviar milhares de POSTs à API. Compare tempo e percepção. Explique por que otimização de CPU não reduz um download HTTP grande.

## Se algo falhar

Se o resultado ficar desatualizado, revise dependências. Não use array vazio para forçar cache de valores que mudam.

Referências: [memo](https://react.dev/reference/react/memo) · [useMemo](https://react.dev/reference/react/useMemo) · [useCallback](https://react.dev/reference/react/useCallback).

[← Anterior](31-renderizacoes.md) · [Índice](../README.md) · [Próxima →](33-lazy-loading.md)
