<!-- Documento: docs/22-ordenacao-e-paginacao.md -->

# 22 · Ordenação e paginação

[← Anterior](21-pesquisa-e-filtros.md) · [Índice](../README.md) · **Etapa 22 de 36** · [Próxima →](23-custom-hooks.md)

**Ponto de partida:** conclua a conferência do capítulo 21 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Lista possui ordenação e páginas locais com limites coerentes.

**Conceitos praticados:** sort, cópia de arrays, slice, estado derivado, paginação, parâmetros de consulta.

## 1. Ordenar uma cópia e paginar o resultado filtrado

A ordem é: resposta → filtro → cópia ordenada → fatia da página. sort altera o array que recebe; por isso usamos `[...filtered].sort(...)`.

**Arquivo: `src/pages/Clientes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Clientes/index.tsx -->
```tsx
// Arquivo: src/pages/Clientes/index.tsx
import { useEffect, useState } from 'react';

import axios from 'axios';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Cliente } from '../../types';
import { ClienteCard } from '../../components/ClienteCard';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { AsyncState } from '../../components/AsyncState';


export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(true);
  const pageSize = 5;


  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<Cliente[]>('/clientes', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setClientes(data);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setError('Não foi possível carregar os clientes.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  async function handleDelete(cliente: Cliente) {
    if (deletingId !== null) return;
    setDeletingId(cliente.id);
    setError(null);
    try {
      await api.delete('/clientes/' + cliente.id);
      setClientes(previous => previous.filter(item => item.id !== cliente.id));
      setSelected(null);
    } catch {
      setError('Não foi possível excluir o cliente.');
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
      {loading && <AsyncState status="loading" />}
      {error && <AsyncState status="error" message={error}
        onRetry={() => setAttempt(previous => previous + 1)} />}
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
        error={error}
        onCancel={() => { if (deletingId === null) setSelected(null); }}
        onConfirm={() => { if (selected) void handleDelete(selected); }} />
    </>
  );
}
```

## 2. Ajustar limites sem efeito de sincronização

totalPages nunca fica abaixo de 1; currentPage é limitado ao total atual. Uma exclusão na última página não deixa a interface presa em uma página sem registros. Alterar pesquisa ou ordenação volta à primeira página no próprio evento.

| Estratégia | Onde filtra e pagina | Limitação |
|---|---|---|
| Implementada aqui | Navegador, depois de receber todos os contatos | Não reduz download nem consulta ao banco |
| Evolução futura | API recebe page, pageSize, q e sort | Exige novo contrato, validação, total e ordenação estável no backend |

Axios aceita `params`, mas a API atual não implementa paginação. Não envie esses parâmetros como se o servidor já atendesse. Para uma evolução, documente primeiro o envelope `{ items, total, page, pageSize }` e os limites.

Para compartilhar filtros por URL, use useSearchParams em um exercício separado. Estado local não mantém filtro no F5; isso é uma escolha desta etapa.
## Conferência antes de avançar

- [ ] Nome ordena em ambas as direções sem alterar state original.
- [ ] Busca acontece antes da paginação.
- [ ] Botões respeitam início e fim.
- [ ] Excluir o último item da última página ajusta a página efetiva.

## Prática do estudante

Cadastre seis contatos de estudo para haver duas páginas. Pesquise um contato da segunda página e explique por que ele deve aparecer na primeira página do resultado filtrado.

## Se algo falhar

Se a pesquisa só encontrar itens da página atual, confira a ordem filter → sort → slice. Se a ordem original mudar, confira a cópia antes de sort.

Referências: [Atualização de arrays](https://react.dev/learn/updating-arrays-in-state) · [Parâmetros de URL](https://reactrouter.com/7.18.4/start/declarative/url-values).

[← Anterior](21-pesquisa-e-filtros.md) · [Índice](../README.md) · [Próxima →](23-custom-hooks.md)
