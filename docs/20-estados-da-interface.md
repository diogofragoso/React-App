<!-- Documento: docs/20-estados-da-interface.md -->

# 20 · Loading, erro e lista vazia

[← Anterior](19-modal-de-confirmacao.md) · [Índice](../README.md) · **Etapa 20 de 36** · [Próxima →](21-pesquisa-e-filtros.md)

**Ponto de partida:** conclua a conferência do capítulo 19 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Lista diferencia espera, erro, vazio e dados, com nova tentativa.

**Conceitos praticados:** renderização condicional, componente reutilizável, união discriminada, dependência de retry.

## 1. Não confundir estados da interface

Um array vazio antes da resposta é loading; um array vazio depois de uma resposta bem-sucedida é empty. Erro de rede precisa de tentativa, e dados podem continuar visíveis após uma falha de exclusão.

**Arquivo: `src/components/AsyncState.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/components/AsyncState.tsx -->
```tsx
// Arquivo: src/components/AsyncState.tsx
import { Alert, Button, Spinner } from 'react-bootstrap';

type AsyncStateProps =
  | { status: 'loading' }
  | { status: 'empty'; message?: string }
  | { status: 'error'; message: string; onRetry: () => void };

export function AsyncState(props: AsyncStateProps) {
  if (props.status === 'loading') {
    return <p role="status"><Spinner size="sm" aria-hidden="true" /> Carregando…</p>;
  }
  if (props.status === 'error') {
    return (
      <Alert variant="danger" role="alert">
        <p>{props.message}</p>
        <Button onClick={props.onRetry}>Tentar novamente</Button>
      </Alert>
    );
  }
  return <p role="status">{props.message ?? 'Nenhum registro encontrado.'}</p>;
}
```

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




  return (
    <>
      <h1>Clientes</h1>
      <Link to="/clientes/novo">Cadastrar cliente</Link>


      {loading && <AsyncState status="loading" />}
      {error && <AsyncState status="error" message={error}
        onRetry={() => setAttempt(previous => previous + 1)} />}
      {!loading && clientes.length === 0 && !error &&
        <AsyncState status="empty" message="Nenhum cliente cadastrado." />}
      {!loading && (
        <ul className="list-unstyled">
          {clientes.map(cliente => (
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

## 2. Fazer nova tentativa sem recarregar a SPA

O botão incrementa attempt. Essa dependência faz o efeito repetir o GET; o cleanup cancela a execução anterior. Não use window.location.reload para uma operação que o componente pode gerenciar.

A união discriminada usa status para definir quais props existem. TypeScript exige onRetry apenas em error. Isso evita combinações como um erro sem mensagem ou loading com callback desnecessário.

Há diferentes níveis de loading: recuperação de sessão, busca de página e envio de formulário. Não use uma única variável global para bloquear tudo.
## Conferência antes de avançar

- [ ] Rede lenta mostra loading.
- [ ] Falha mostra erro e botão de tentativa.
- [ ] Resposta vazia mostra mensagem, sem tabela vazia enganosa.
- [ ] DELETE com falha preserva dados.

## Prática do estudante

Teste as quatro situações com um banco de estudo. Registre a sequência dos estados, e não somente uma captura da tela final.

## Se algo falhar

Se a mensagem vazia aparecer junto de loading, confira as condições. Se tentar novamente não chamar GET, confira attempt no array de dependências.

Referências: [Renderização condicional](https://react.dev/learn/conditional-rendering).

[← Anterior](19-modal-de-confirmacao.md) · [Índice](../README.md) · [Próxima →](21-pesquisa-e-filtros.md)
