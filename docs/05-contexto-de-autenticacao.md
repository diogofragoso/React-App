<!-- Documento: docs/05-contexto-de-autenticacao.md -->

# 05 · Compartilhando autenticação com Context

[← Anterior](04-tela-de-login.md) · [Índice](../README.md) · **Etapa 5 de 36** · [Próxima →](06-recuperando-a-sessao.md)

**Ponto de partida:** conclua a conferência do capítulo 04 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Login atualiza o usuário compartilhado por todas as telas.

**Conceitos praticados:** createContext, useContext, Provider, children, ReactNode, fluxo de dados, props, custom hook inicial.

## 1. Escolher onde o estado deve morar

E-mail e senha pertencem ao formulário. O usuário autenticado é necessário em várias páginas e no cabeçalho, por isso ficará acima delas. Context transporta um valor pela árvore; o estado continua sendo gerenciado por useState. Context não torna todas as variáveis globais e não persiste dados após recarregar.

O fluxo é: Login chama signIn → Provider faz HTTP → Provider atualiza user → consumidores recebem o novo valor. `children` representa os elementos colocados dentro do Provider.

## 2. Criar o contrato do contexto e o Provider

Os campos loading, sessionError e retrySession são preparados para a recuperação da sessão do próximo capítulo. Neste capítulo ficam neutros.

**Arquivo: `src/contexts/AuthContext.ts`**

Crie este arquivo e copie todo o conteúdo.

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
  signIn: (credentials: LoginCredentials) => Promise<void>;
}
export const AuthContext = createContext<AuthValue | undefined>(undefined);
```

**Arquivo: `src/contexts/AuthProvider.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/contexts/AuthProvider.tsx -->
```tsx
// Arquivo: src/contexts/AuthProvider.tsx
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';
import type { LoginCredentials, LoginResponse, User } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(credentials: LoginCredentials) {
    const { data } = await api.post<LoginResponse>('/login', credentials);
    setUser(data.user);
  }

  return (
    <AuthContext.Provider value={{
      user, loading: false, sessionError: null,
      retrySession: () => {}, signIn,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Arquivo: `src/hooks/useAuth.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/hooks/useAuth.ts -->
```typescript
// Arquivo: src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
```

O Hook centraliza a leitura e fornece um erro claro se o Provider faltar. O contexto fica em um arquivo separado do componente para ajudar a atualização de módulos durante o desenvolvimento.

## 3. Envolver as telas e conectar o login

**Arquivo: `src/App.tsx`**

Substitua todo o conteúdo.

<!-- file: src/App.tsx -->
```tsx
// Arquivo: src/App.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<p>Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**Arquivo: `src/pages/Login/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Login/index.tsx -->
```tsx
// Arquivo: src/pages/Login/index.tsx
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import type { ApiError } from '../../types';

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
      const message = axios.isAxiosError<ApiError>(err)
        ? err.response?.data.error ?? 'Não foi possível entrar. Confira a conexão e as credenciais.'
        : 'Ocorreu um erro inesperado.';
      setError(message);
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

## 4. Observar o resultado

Faça login e inspecione AuthProvider no React DevTools: user recebe os dados da resposta. Ao atualizar a página, o estado volta a null. Isso é esperado nesta etapa: memória do React não equivale à sessão guardada no navegador e validada no servidor.
## Conferência antes de avançar

- [ ] Provider aparece acima das páginas na árvore.
- [ ] Login chama signIn e não duplica a lógica HTTP.
- [ ] useAuth fora do Provider apresenta erro explícito.
- [ ] Recarregar perde user; o próximo capítulo resolverá isso.

## Prática do estudante

Desenhe a árvore App → AuthProvider → Login. Mostre em qual componente cada estado mora e explique por que a senha não deve subir para o Context.

## Se algo falhar

Se user nunca mudar, confira se Login chama signIn, se data.user corresponde ao contrato e se existe somente uma instância de AuthProvider.

Referências: [Context](https://react.dev/learn/passing-data-deeply-with-context) · [useContext](https://react.dev/reference/react/useContext).

[← Anterior](04-tela-de-login.md) · [Índice](../README.md) · [Próxima →](06-recuperando-a-sessao.md)
