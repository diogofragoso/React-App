<!-- Documento: docs/28-erros-http-globais.md -->

# 28 · Tratamento global de erros HTTP

[← Anterior](27-perfis-e-permissoes.md) · [Índice](../README.md) · **Etapa 28 de 36** · [Próxima →](29-variaveis-de-ambiente.md)

**Ponto de partida:** conclua a conferência do capítulo 27 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

401 de recursos privados invalida a sessão; demais erros recebem mensagens coerentes.

**Conceitos praticados:** Axios interceptors, Promise.reject, unknown, cleanup/eject, contratos de erro, efeitos globais.

## 1. Centralizar sem perder o contexto

401 de /login é uma tentativa inválida e precisa aparecer no formulário. 401 de uma rota privada significa sessão inválida; atualizamos o Provider e ProtectedRoute conduz ao login. 403 não significa logout; é falta de permissão. 500 e falta de rede também não devem apagar a sessão.

Um interceptor não usa Hooks diretamente. Aqui é registrado pelo Provider dentro de um efeito e removido no cleanup. Isso evita acumular registros em remontagens e durante desenvolvimento.

**Arquivo: `src/utils/getHttpError.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/utils/getHttpError.ts -->
```typescript
// Arquivo: src/utils/getHttpError.ts
import axios from 'axios';
import type { ApiError } from '../types';

export function getHttpError(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  if (!axios.isAxiosError<ApiError>(error)) return fallback;
  const status = error.response?.status;
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'A operação não foi permitida.';
  if (status === 429) return 'Muitas tentativas. Aguarde antes de tentar novamente.';
  if (status && status >= 500) return 'O servidor está indisponível. Tente novamente.';
  if (!error.response) return 'Sem resposta da API. Confira a conexão.';
  return error.response.data.error
    ?? error.response.data.errors?.map(issue => issue.message).join(' ')
    ?? fallback;
}
```

**Arquivo: `src/contexts/AuthProvider.tsx`**

Substitua todo o conteúdo.

<!-- file: src/contexts/AuthProvider.tsx -->
```tsx
// Arquivo: src/contexts/AuthProvider.tsx
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';
import { authService } from '../services/authService';
import type { LoginCredentials, User } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const version = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentVersion = version.current;
    setLoading(true);
    setSessionError(null);
    authService.currentUser(controller.signal)
      .then(currentUser => {
        if (!controller.signal.aborted && version.current === currentVersion) {
          setUser(currentUser);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || version.current !== currentVersion) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setUser(null);
        } else {
          setSessionError('Não foi possível conferir a sessão. Tente novamente.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && version.current === currentVersion) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const requestVersions = new WeakMap<object, number>();
    const requestInterceptor = api.interceptors.request.use(config => {
      requestVersions.set(config, version.current);
      return config;
    });
    const interceptor = api.interceptors.response.use(
      response => response,
      (err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401 &&
            err.config?.url !== '/login' && err.config &&
            requestVersions.get(err.config) === version.current) {
          version.current += 1;
          setUser(null);
          setSessionError(null);
          setLoading(false);
        }
        return Promise.reject(err);
      },
    );
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  async function signIn(credentials: LoginCredentials) {
    const currentUser = await authService.signIn(credentials);
    version.current += 1;
    setUser(currentUser);
    setSessionError(null);
    setLoading(false);
  }

  async function signOut() {
    await authService.signOut();
    version.current += 1;
    setUser(null);
    setSessionError(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{
      user, loading, sessionError,
      retrySession: () => setAttempt(previous => previous + 1), signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 2. Preservar a rejeição e melhorar mensagens locais

Promise.reject mantém a falha para o catch da página. Devolver uma resposta de sucesso fictícia esconderia o problema. Não fazemos retries automáticos de POST ou DELETE.

**Arquivo: `src/pages/Login/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Login/index.tsx -->
```tsx
// Arquivo: src/pages/Login/index.tsx
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { getHttpError } from '../../utils/getHttpError';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(getHttpError(err, 'Não foi possível entrar.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 480 }}>
      <h1>Entrar no sistema</h1>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <Form onSubmit={handleSubmit} aria-busy={loading}>
        <Form.Group className="mb-3" controlId="login-email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control type="email" autoComplete="username" value={email}
            onChange={event => setEmail(event.target.value)} required disabled={loading} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="login-password">
          <Form.Label>Senha</Form.Label>
          <Form.Control type="password" autoComplete="current-password" value={password}
            onChange={event => setPassword(event.target.value)} required disabled={loading} />
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </Form>
    </main>
  );
}
```

**Arquivo: `src/hooks/useClientes.ts`**

Substitua todo o conteúdo.

<!-- file: src/hooks/useClientes.ts -->
```typescript
// Arquivo: src/hooks/useClientes.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getHttpError } from '../utils/getHttpError';
import { clienteService } from '../services/clienteService';
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
    clienteService.list(controller.signal)
      .then(data => { if (!controller.signal.aborted) setClientes(data); })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) setError(getHttpError(err));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  async function remove(id: number) {
    await clienteService.remove(id);
    setClientes(previous => previous.filter(cliente => cliente.id !== id));
    setAttempt(previous => previous + 1);
  }
  return { clientes, loading, error, reload: () => setAttempt(previous => previous + 1), remove };
}
```

**Arquivo: `src/pages/ClienteNovo/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteNovo/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteNovo/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../../services/clienteService';
import { getHttpError } from '../../utils/getHttpError';
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
    } catch (err: unknown) {
      setError(getHttpError(err));
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
import { getHttpError } from '../../utils/getHttpError';
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
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(getHttpError(err)); })
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
    } catch (err: unknown) {
      setError(getHttpError(err));
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

**Arquivo: `src/pages/ClienteDetalhes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteDetalhes/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteDetalhes/index.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getHttpError } from '../../utils/getHttpError';
import { clienteService } from '../../services/clienteService';
import type { Cliente } from '../../types';

export function ClienteDetalhes() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
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
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(getHttpError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, validId]);

  if (!validId) return <p role="alert">Identificador inválido.</p>;
  if (loading) return <p role="status">Carregando cliente…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!cliente) return <p>Cliente não encontrado.</p>;
  return (
    <>
      <h1>{cliente.name}</h1>
      <p>{cliente.email}</p>
      <p>Criado em {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}</p>
      <Link to="/clientes">Voltar à lista</Link>
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
import { getHttpError } from '../../utils/getHttpError';
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
    } catch (err: unknown) {
      setActionError(getHttpError(err));
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

A recuperação inicial com 401 encerra loading por meio do interceptor. version impede que sua resposta anterior publique dados após a invalidação. Cada configuração de requisição é associada à versão da sessão em um WeakMap. Assim, um 401 atrasado de uma chamada anterior ao login não apaga uma sessão recém-obtida. Cancelamentos continuam filtrados pelo efeito e não exibem falha ao usuário.
## Conferência antes de avançar

- [ ] Senha incorreta mantém formulário e mostra erro.
- [ ] 401 privado limpa user e redireciona.
- [ ] 403 e 500 não são tratados como logout.
- [ ] Remontagem não acumula interceptors.
- [ ] Mensagens de validação usam error/errors do contrato.

## Prática do estudante

Descreva o comportamento esperado para 400, 401, 403, 404, 409, 429 e 500. Simule primeiro com testes, sem provocar rate limit desnecessariamente na API de estudo.

## Se algo falhar

Se houver loop de redirecionamento, confira exceção de /login e a recuperação da sessão. Se um catch não executar, confira Promise.reject.

Referências: [Interceptors do Axios](https://axios-http.com/docs/interceptors).

[← Anterior](27-perfis-e-permissoes.md) · [Índice](../README.md) · [Próxima →](29-variaveis-de-ambiente.md)
