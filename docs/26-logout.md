<!-- Documento: docs/26-logout.md -->

# 26 · Implementando logout

[← Anterior](25-feedback-com-toasts.md) · [Índice](../README.md) · **Etapa 26 de 36** · [Próxima →](27-perfis-e-permissoes.md)

**Ponto de partida:** conclua a conferência do capítulo 25 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Botão Sair solicita remoção do cookie e limpa o usuário compartilhado.

**Conceitos praticados:** POST, Context, estado global, navegação em evento, finally, limites da sessão.

## 1. Encerrar no servidor e atualizar a interface

Limpar user sozinho não remove o cookie HttpOnly. React não pode apagá-lo diretamente. Primeiro pedimos POST /logout, que retorna 204 e instrui o navegador a remover o cookie; depois atualizamos o Context.

**Arquivo: `src/services/authService.ts`**

Substitua todo o conteúdo.

<!-- file: src/services/authService.ts -->
```typescript
// Arquivo: src/services/authService.ts
import { api } from './api';
import type { LoginCredentials, LoginResponse, User } from '../types';

export const authService = {
  async signOut(): Promise<void> { await api.post('/logout'); },
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

**Arquivo: `src/contexts/AuthContext.ts`**

Substitua todo o conteúdo.

<!-- file: src/contexts/AuthContext.ts -->
```typescript
// Arquivo: src/contexts/AuthContext.ts
import { createContext } from 'react';
import type { LoginCredentials, User } from '../types';

export interface AuthValue {
  user: User | null;
  loading: boolean;
  sessionError: string | null;
  retrySession: () => void;
  signOut: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<void>;
}
export const AuthContext = createContext<AuthValue | undefined>(undefined);
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

**Arquivo: `src/components/AppLayout.tsx`**

Substitua todo o conteúdo.

<!-- file: src/components/AppLayout.tsx -->
```tsx
// Arquivo: src/components/AppLayout.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      setError('Não foi possível encerrar a sessão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <a className="visually-hidden-focusable" href="#conteudo">Pular para o conteúdo</a>
      <Navbar bg="light" expand="sm" aria-label="Navegação principal">
        <Container>
          <Navbar.Brand as={NavLink} to="/">Cadastro de clientes</Navbar.Brand>
          <Navbar.Toggle aria-controls="menu-principal" />
          <Navbar.Collapse id="menu-principal">
            <Nav>
              <Nav.Link as={NavLink} to="/" end>Início</Nav.Link>
              <Nav.Link as={NavLink} to="/clientes">Clientes</Nav.Link>
            </Nav>
          <Button className="ms-sm-3" variant="outline-secondary" disabled={busy} onClick={logout}>
              {busy ? 'Saindo…' : 'Sair'}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container as="main" id="conteudo" tabIndex={-1}>
        {error && <p role="alert">{error}</p>}
        <Outlet />
      </Container>
    </>
  );
}
```

## 2. Verificar o efeito real

Clique Sair e confirme POST /logout e remoção do cookie. Abra / de novo: a sessão não deve ser recuperada. Se a chamada falhar por rede, o layout mostra erro; não afirma que o logout foi concluído.

O JWT deste backend não é revogado por logout. Um token já copiado continua válido até expirar. A trilha usa cookie e ignora o token do JSON; revogação imediata e refresh token exigem outra implementação na API.

version também impede que uma recuperação anterior restaure user depois do logout.
## Conferência antes de avançar

- [ ] Sucesso envia POST /logout e termina em /login.
- [ ] F5 não recupera a sessão encerrada.
- [ ] Falha de rede mostra erro e permite repetir.
- [ ] Botão impede operações simultâneas.

## Prática do estudante

Compare limpar state com limpar cookie no servidor. Teste nova visita à Home em outra aba após o logout; ela precisa consultar o servidor para conhecer a mudança.

## Se algo falhar

Se F5 ainda autenticar, confira Set-Cookie de remoção e path do cookie na API. Não tente usar document.cookie para remover um HttpOnly.

Referências: [Sessão e cookies da API](../../api_t13/docs/05-autenticacao-com-jwt.md).

[← Anterior](25-feedback-com-toasts.md) · [Índice](../README.md) · [Próxima →](27-perfis-e-permissoes.md)
