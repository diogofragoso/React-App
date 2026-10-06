<!-- Documento: docs/24-services-por-dominio.md -->

# 24 · Services por domínio

[← Anterior](23-custom-hooks.md) · [Índice](../README.md) · **Etapa 24 de 36** · [Próxima →](25-feedback-com-toasts.md)

**Ponto de partida:** conclua a conferência do capítulo 23 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Services expõem operações tipadas; páginas deixam de conhecer as URLs da API.

**Conceitos praticados:** camada HTTP, services por domínio, responsabilidade única, Promise de dados, propagação de erros.

## 1. Separar transporte, estado e interface

api configura transporte. authService e clienteService conhecem endpoints. Providers e Hooks gerenciam estado. Pages compõem interface e navegação. Não capture todo erro no service e devolva array vazio: isso faria falha de rede parecer ausência de dados.

**Arquivo: `src/services/authService.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/services/authService.ts -->
```typescript
// Arquivo: src/services/authService.ts
import { api } from './api';
import type { LoginCredentials, LoginResponse, User } from '../types';

export const authService = {
  async signIn(credentials: LoginCredentials): Promise<User> {
    const { data } = await api.post<LoginResponse>('/login', credentials);
    return data.user;
  },
  async currentUser(signal?: AbortSignal): Promise<User | null> {
    const { data } = await api.get<User[]>('/users', { signal });
    return data[0] ?? null;
  },
};
```

**Arquivo: `src/services/clienteService.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/services/clienteService.ts -->
```typescript
// Arquivo: src/services/clienteService.ts
import { api } from './api';
import type { Cliente, ClienteInput } from '../types';

export const clienteService = {
  async list(signal?: AbortSignal): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/clientes', { signal });
    return data;
  },
  async get(id: number, signal?: AbortSignal): Promise<Cliente> {
    const { data } = await api.get<Cliente>('/clientes/' + id, { signal });
    return data;
  },
  async create(input: ClienteInput): Promise<Cliente> {
    const { data } = await api.post<Cliente>('/clientes', input);
    return data;
  },
  async update(id: number, input: ClienteInput): Promise<Cliente> {
    const { data } = await api.put<Cliente>('/clientes/' + id, input);
    return data;
  },
  async remove(id: number): Promise<void> {
    await api.delete('/clientes/' + id);
  },
};
```

## 2. Migrar todos os consumidores

Copie os arquivos completos abaixo. O comportamento permanece; as chamadas passam pelos services. Serviços devolvem o corpo já desembrulhado, portanto o consumidor deixa de usar response.data.

**Arquivo: `src/contexts/AuthProvider.tsx`**

Substitua todo o conteúdo.

<!-- file: src/contexts/AuthProvider.tsx -->
```tsx
// Arquivo: src/contexts/AuthProvider.tsx
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
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

  async function signIn(credentials: LoginCredentials) {
    const currentUser = await authService.signIn(credentials);
    version.current += 1;
    setUser(currentUser);
    setSessionError(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{
      user, loading, sessionError,
      retrySession: () => setAttempt(previous => previous + 1), signIn,
    }}>
      {children}
    </AuthContext.Provider>
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
        if (!controller.signal.aborted && !axios.isCancel(err)) setError('Não foi possível carregar os clientes.');
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
import { ClienteForm } from '../../components/ClienteForm';
import type { ClienteInput } from '../../types';

export function ClienteNovo() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save(input: ClienteInput) {
    setSubmitting(true);
    setError(null);
    try {
      await clienteService.create(input);
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
import { ClienteForm } from '../../components/ClienteForm';
import type { Cliente, ClienteInput } from '../../types';

export function ClienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
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

**Arquivo: `src/pages/ClienteDetalhes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteDetalhes/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteDetalhes/index.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
      .catch(() => { if (!controller.signal.aborted) setError('Cliente não encontrado ou indisponível.'); })
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

Não transforme services em Hooks: eles não chamam useState e podem ser usados por testes sem renderizar componentes. AbortSignal atravessa a camada para preservar cancelamento.
## Conferência antes de avançar

- [ ] Páginas de clientes não importam api.
- [ ] Login, recuperação, CRUD e cancelamento mantêm comportamento.
- [ ] Services devolvem tipos corretos, inclusive void no DELETE.

## Prática do estudante

No editor, busque `/clientes` e diferencie URLs de navegação de URLs HTTP. Explique por que somente as HTTP precisam migrar para o service.

## Se algo falhar

Se houver acesso data.user no Provider após a migração, confira que signIn agora devolve User diretamente. Não misture dois formatos de retorno.

Referências: [Axios](https://axios-http.com/docs/intro) · [Separação de estado e lógica](https://react.dev/learn/reusing-logic-with-custom-hooks).

[← Anterior](23-custom-hooks.md) · [Índice](../README.md) · [Próxima →](25-feedback-com-toasts.md)
