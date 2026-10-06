<!-- Documento: docs/23-custom-hooks.md -->

# 23 · Extraindo custom hooks

[← Anterior](22-ordenacao-e-paginacao.md) · [Índice](../README.md) · **Etapa 23 de 36** · [Próxima →](24-services-por-dominio.md)

**Ponto de partida:** conclua a conferência do capítulo 22 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Requisição e atualização da coleção ficam em useClientes; a página mantém apresentação e filtros.

**Conceitos praticados:** custom hooks, composição de Hooks, regras dos Hooks, estado local versus estado compartilhado.

## 1. Extrair o que já existe

Agora a listagem combina consulta, cancelamento, erro, seleção, pesquisa e páginas. Extraímos somente a parte de acesso e memória da coleção. Pesquisa e seleção continuam na página, pois são decisões daquela interface.

**Arquivo: `src/hooks/useClientes.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/hooks/useClientes.ts -->
```typescript
// Arquivo: src/hooks/useClientes.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../services/api';
import type { Cliente } from '../types';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<Cliente[]>('/clientes', { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setClientes(data); })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) setError('Não foi possível carregar os clientes.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  async function remove(id: number) {
    await api.delete('/clientes/' + id);
    setClientes(previous => previous.filter(cliente => cliente.id !== id));
    setAttempt(previous => previous + 1);
  }
  return { clientes, loading, error, reload: () => setAttempt(previous => previous + 1), remove };
}
```

**Arquivo: `src/pages/Clientes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Clientes/index.tsx -->
```tsx
// Arquivo: src/pages/Clientes/index.tsx
import { useState } from 'react';

import { Link } from 'react-router-dom';

import type { Cliente } from '../../types';
import { ClienteCard } from '../../components/ClienteCard';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { AsyncState } from '../../components/AsyncState';
import { useClientes } from '../../hooks/useClientes';

export function Clientes() {
  const { clientes, loading, error, reload, remove } = useClientes();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(true);
  const pageSize = 5;
  const [actionError, setActionError] = useState<string | null>(null);



  async function handleDelete(cliente: Cliente) {
    if (deletingId !== null) return;
    setDeletingId(cliente.id);
    setActionError(null);
    try {
      await remove(cliente.id);
      setSelected(null);
    } catch {
      setActionError('Não foi possível excluir o cliente.');
    } finally {
      setDeletingId(null);
    }
  }
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filtered = clientes.filter(cliente =>
    (cliente.name + ' ' + cliente.email).toLocaleLowerCase('pt-BR').includes(normalizedSearch));
  const sorted = [...filtered].sort((a, b) =>
    (ascending ? 1 : -1) * a.name.localeCompare(b.name, 'pt-BR'));
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  if (loading) return <AsyncState status="loading" />;
  if (error) return <AsyncState status="error" message={error} onRetry={reload} />;

  return (
    <>
      <h1>Clientes</h1>
      <Link to="/clientes/novo">Cadastrar cliente</Link>
      <div className="my-3">
        <label htmlFor="pesquisa-clientes">Pesquisar por nome ou e-mail</label>
        <input id="pesquisa-clientes" type="search" className="form-control"
          value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
      </div>
      <button type="button" className="btn btn-outline-primary mb-3"
        onClick={() => { setAscending(previous => !previous); setPage(1); }}>
        Ordem: {ascending ? 'A → Z' : 'Z → A'}
      </button>
      {actionError && <p role="alert">{actionError}</p>}
      {!loading && filtered.length === 0 && !error &&
        <AsyncState status="empty" message="Nenhum cliente corresponde à pesquisa." />}
      {!loading && (
        <ul className="list-unstyled">
          {visible.map(cliente => (
            <li key={cliente.id} className="mb-3">
              <ClienteCard cliente={cliente} onDelete={setSelected} disabled={deletingId !== null} />
            </li>
          ))}
        </ul>
      )}
      <nav aria-label="Paginação de clientes">
        <button type="button" disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}>Anterior</button>
        <span role="status" className="mx-2">Página {currentPage} de {totalPages}</span>
        <button type="button" disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}>Próxima</button>
      </nav>
      <ConfirmDeleteModal cliente={selected} busy={deletingId !== null}
        error={actionError}
        onCancel={() => { if (deletingId === null) setSelected(null); }}
        onConfirm={() => { if (selected) void handleDelete(selected); }} />
    </>
  );
}
```

## 2. Entender o que um Hook compartilha

Um custom hook compartilha **lógica**, não automaticamente o state entre componentes. Duas chamadas de useClientes criam duas coleções e podem disparar dois GETs. Para compartilhar uma única coleção entre telas, seria preciso elevar state, Context ou adotar uma camada de cache com regras próprias.

remove só altera a coleção após sucesso. A nova consulta depois da exclusão confirma o estado do servidor e cancela uma leitura anterior pelo efeito, evitando manter um resultado antigo.

O Hook não navega nem mostra modal. Ele devolve dados e operações; a página decide a experiência.
## Conferência antes de avançar

- [ ] Página perdeu sua implementação local de GET.
- [ ] Busca, ordenação e modal continuam funcionando.
- [ ] Cancelar efeito continua funcionando.
- [ ] Falha de DELETE é tratada pela página; falha de GET, pelo Hook.

## Prática do estudante

Identifique uma segunda repetição no projeto antes de propor outro Hook. Explique por que uma função sem Hooks internos pode ser apenas uma função utilitária.

## Se algo falhar

Se houver chamadas duplicadas em telas distintas, confira quantas vezes useClientes foi chamado. Não espere cache global de um Hook comum.

Referências: [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).

[← Anterior](22-ordenacao-e-paginacao.md) · [Índice](../README.md) · [Próxima →](24-services-por-dominio.md)
