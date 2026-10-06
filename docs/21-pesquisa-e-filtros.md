<!-- Documento: docs/21-pesquisa-e-filtros.md -->

# 21 · Pesquisa e filtros

[← Anterior](20-estados-da-interface.md) · [Índice](../README.md) · **Etapa 21 de 36** · [Próxima →](22-ordenacao-e-paginacao.md)

**Ponto de partida:** conclua a conferência do capítulo 20 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Pesquisa local por nome e e-mail sem duplicar a lista em state.

**Conceitos praticados:** filter, includes, normalização, estado derivado, fluxo de renderização.

## 1. Guardar a intenção, derivar o resultado

clientes é a resposta original; search é a intenção do usuário. filtered é calculado a partir dos dois. Copiar filtered para outro state e sincronizá-lo por efeito cria trabalho e risco de divergência.

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



  return (
    <>
      <h1>Clientes</h1>
      <Link to="/clientes/novo">Cadastrar cliente</Link>
      <div className="my-3">
        <label htmlFor="pesquisa-clientes">Pesquisar por nome ou e-mail</label>
        <input id="pesquisa-clientes" type="search" className="form-control"
          value={search} onChange={event => { setSearch(event.target.value);  }} />
      </div>

      {loading && <AsyncState status="loading" />}
      {error && <AsyncState status="error" message={error}
        onRetry={() => setAttempt(previous => previous + 1)} />}
      {!loading && filtered.length === 0 && !error &&
        <AsyncState status="empty" message="Nenhum cliente corresponde à pesquisa." />}
      {!loading && (
        <ul className="list-unstyled">
          {filtered.map(cliente => (
            <li key={cliente.id} className="mb-3">
              <ClienteCard cliente={cliente} onDelete={setSelected} disabled={deletingId !== null} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDeleteModal cliente={selected} busy={deletingId !== null}
        error={error}
        onCancel={() => { if (deletingId === null) setSelected(null); }}
        onConfirm={() => { if (selected) void handleDelete(selected); }} />
    </>
  );
}
```

## 2. Conhecer o alcance da busca

Esta pesquisa percorre os contatos já carregados por GET /clientes. A API do guia não oferece parâmetro q; acrescentá-lo à URL não implementaria pesquisa no servidor.

trim remove espaços nas bordas da busca; toLocaleLowerCase reduz diferenças de maiúsculas. Essa versão não remove acentos. Busca vazia inclui todos os contatos porque toda string inclui a string vazia.

“Sem resultados da pesquisa” é diferente de “nenhum cadastro”. Compare clientes.length e filtered.length para apresentar mensagens mais específicas, se necessário.
## Conferência antes de avançar

- [ ] Pesquisa encontra nome e e-mail.
- [ ] Limpar busca restaura todos os contatos.
- [ ] Pesquisar não envia um novo GET.
- [ ] Array original permanece preservado.

## Prática do estudante

Implemente uma função pura para ignorar acentos usando normalize('NFD') e remoção das marcas combinantes. Compare João/joao sem alterar dados armazenados.

## Se algo falhar

Se remover a busca não restaurar os registros, provavelmente o filtro substituiu clientes em state. Guarde apenas search e derive filtered.

Referências: [Escolhendo a estrutura do estado](https://react.dev/learn/choosing-the-state-structure).

[← Anterior](20-estados-da-interface.md) · [Índice](../README.md) · [Próxima →](22-ordenacao-e-paginacao.md)
