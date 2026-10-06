<!-- Documento: docs/25-feedback-com-toasts.md -->

# 25 · Feedback global com toasts

[← Anterior](24-services-por-dominio.md) · [Índice](../README.md) · **Etapa 25 de 36** · [Próxima →](26-logout.md)

**Ponto de partida:** conclua a conferência do capítulo 24 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Feedback de sucesso aparece globalmente mesmo após trocar de página.

**Conceitos praticados:** Context, componentes globais, callbacks, useReducer, actions, reducer puro, useRef.

## 1. Preservar feedback acima das páginas

Um aviso local sumiria quando a página de cadastro fosse desmontada pela navegação. O Provider fica acima das rotas e mantém a fila de mensagens.

Usaremos useReducer para praticar atualizações descritas por ações. O reducer recebe estado e ação e devolve um novo estado. Ele deve ser puro: não gera ids, faz HTTP ou inicia timers. O id é criado no evento notify, usando useRef.

**Arquivo: `src/contexts/ToastContext.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/contexts/ToastContext.ts -->
```typescript
// Arquivo: src/contexts/ToastContext.ts
import { createContext } from 'react';

export interface ToastValue { notify: (message: string) => void }
export const ToastContext = createContext<ToastValue | undefined>(undefined);
```

**Arquivo: `src/contexts/ToastProvider.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/contexts/ToastProvider.tsx -->
```tsx
// Arquivo: src/contexts/ToastProvider.tsx
import { useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { ToastContext } from './ToastContext';

interface Notice { id: number; message: string }
type Action = { type: 'add'; notice: Notice } | { type: 'remove'; id: number };

function reducer(state: Notice[], action: Action): Notice[] {
  if (action.type === 'add') return [...state, action.notice];
  return state.filter(notice => notice.id !== action.id);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notices, dispatch] = useReducer(reducer, []);
  const nextId = useRef(1);
  function notify(message: string) {
    dispatch({ type: 'add', notice: { id: nextId.current++, message } });
  }
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <ToastContainer position="top-end" className="position-fixed p-3" aria-label="Notificações">
        {notices.map(notice => (
          <Toast key={notice.id} autohide delay={5000} role="status" aria-live="polite" aria-atomic="true"
            onClose={() => dispatch({ type: 'remove', id: notice.id })}>
            <Toast.Header><strong className="me-auto">Cadastro de clientes</strong></Toast.Header>
            <Toast.Body>{notice.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
```

**Arquivo: `src/hooks/useToast.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/hooks/useToast.ts -->
```typescript
// Arquivo: src/hooks/useToast.ts
import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast precisa estar dentro de ToastProvider.');
  return context;
}
```

**Arquivo: `src/App.tsx`**

Substitua todo o conteúdo.

<!-- file: src/App.tsx -->
```tsx
// Arquivo: src/App.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { ToastProvider } from './contexts/ToastProvider';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Clientes } from './pages/Clientes';
import { ClienteDetalhes } from './pages/ClienteDetalhes';
import { ClienteNovo } from './pages/ClienteNovo';
import { ClienteEditar } from './pages/ClienteEditar';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/:id" element={<ClienteDetalhes />} />
              <Route path="clientes/novo" element={<ClienteNovo />} />
              <Route path="clientes/:id/editar" element={<ClienteEditar />} />
            </Route>
          </Route>
          <Route path="*" element={<p className="container">Página não encontrada.</p>} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Notificar somente depois do sucesso

**Arquivo: `src/pages/ClienteNovo/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteNovo/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteNovo/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../../services/clienteService';
import { useToast } from '../../hooks/useToast';
import { ClienteForm } from '../../components/ClienteForm';
import type { ClienteInput } from '../../types';

export function ClienteNovo() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save(input: ClienteInput) {
    setSubmitting(true);
    setError(null);
    try {
      await clienteService.create(input);
      notify('Cliente cadastrado com sucesso.');
      navigate('/clientes', { replace: true });
    } catch {
      setError('Não foi possível cadastrar. Confira a conexão e se o e-mail já está em uso.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <h1>Cadastrar cliente</h1>
      {error && <p role="alert">{error}</p>}
      <ClienteForm initialValue={{ name: '', email: '' }} submitting={submitting} onSave={save} />
    </>
  );
}
```

**Arquivo: `src/pages/ClienteEditar/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteEditar/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteEditar/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clienteService } from '../../services/clienteService';
import { useToast } from '../../hooks/useToast';
import { ClienteForm } from '../../components/ClienteForm';
import type { Cliente, ClienteInput } from '../../types';

export function ClienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validId = !!id && /^[1-9]\d*$/.test(id) && Number(id) <= 2147483647;

  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();
    setLoading(true);
    setCliente(null);
    setError(null);
    clienteService.get(Number(id), controller.signal)
      .then(data => { if (!controller.signal.aborted) setCliente(data); })
      .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar o cliente.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, validId]);

  async function save(input: ClienteInput) {
    if (!cliente || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await clienteService.update(cliente.id, input);
      notify('Cliente atualizado com sucesso.');
      navigate('/clientes', { replace: true });
    } catch {
      setError('Não foi possível salvar. Confira a conexão e o e-mail.');
    } finally {
      setSubmitting(false);
    }
  }
  if (!validId) return <p role="alert">Identificador inválido.</p>;
  if (loading) return <p role="status">Carregando cliente…</p>;
  return (
    <>
      <h1>Editar cliente</h1>
      {error && <p role="alert">{error}</p>}
      {cliente && <ClienteForm key={cliente.id}
        initialValue={{ name: cliente.name, email: cliente.email }}
        submitting={submitting} onSave={save} />}
    </>
  );
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
import { useToast } from '../../hooks/useToast';
import { useClientes } from '../../hooks/useClientes';

export function Clientes() {
  const { notify } = useToast();
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
      notify('Cliente excluído com sucesso.');
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

Toast não substitui erros de formulário: mensagens que precisam orientar correção ficam junto dos campos. O aviso global comunica o resultado de uma operação concluída.

Aqui a fila é transitória e não precisa de armazenamento. fechar remove somente a mensagem cujo id corresponde à ação.
## Conferência antes de avançar

- [ ] Cadastro, edição e exclusão mostram aviso após sucesso.
- [ ] Aviso continua visível ao navegar.
- [ ] Fechar um aviso preserva os demais.
- [ ] Falha não mostra mensagem de sucesso.

## Prática do estudante

Explique por que gerar id dentro do reducer quebraria pureza. Compare useReducer e useState: ambos guardam estado, mas o reducer organiza regras de transição.

## Se algo falhar

Se useToast reclamar, confira Provider acima de Routes. Se a mensagem aparecer antes do sucesso, mova notify para depois do await.

Referências: [useReducer](https://react.dev/reference/react/useReducer) · [Toast](https://react-bootstrap.github.io/docs/components/toasts/).

[← Anterior](24-services-por-dominio.md) · [Índice](../README.md) · [Próxima →](26-logout.md)
