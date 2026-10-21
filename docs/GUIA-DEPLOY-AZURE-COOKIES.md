<!-- Documento: docs/GUIA-DEPLOY-AZURE-COOKIES.md -->

# 🔐 Autenticação Segura com Cookies HttpOnly e Deploy no Azure (React + Express)

[← Voltar ao Índice](../README.md) · [Contrato da API](CONTRATO-DA-API.md) · [Serviços e Tipagens](03-servicos-e-tipagens.md) · [Contexto de Autenticação](05-contexto-de-autenticacao.md)

---

## 🎯 1. Visão Geral e Princípios de Arquitetura

Neste guia, você aprenderá a implementar o padrão recomendado de autenticação na Web moderna integrando um **Front-end em React** hospedado no **Azure Static Web Apps** com uma **API Express** hospedada no **Azure App Service**.

Em sistemas profissionais, a segurança das credenciais é prioridade absoluta. Por isso, a autenticação deste projeto é baseada integralmente em **Cookies HttpOnly**, eliminando o armazenamento de tokens no `localStorage`.

```mermaid
sequenceDiagram
    autonumber
    actor Estudante as Navegador do Usuário
    participant React as Front-end React (Static Web Apps)
    participant Express as API Express (App Service)

    Estudante->>React: Preenche e-mail e senha
    React->>Express: POST /login (credenciais com withCredentials: true)
    Express-->>Estudante: Set-Cookie: token=...; HttpOnly; Secure; SameSite
    Note over Estudante: O navegador armazena o cookie em área protegida.<br/>O JavaScript NÃO tem acesso ao token.
    Express-->>React: Retorna dados públicos do usuário (id, nome, role)
    React->>Estudante: Redireciona para o painel correspondente (/aluno ou /professor)

    Note over Estudante,Express: Recarregar a página (F5) ou Navegação:
    Estudante->>Express: GET /users (O navegador anexa o cookie automaticamente)
    Express-->>React: 200 OK com dados da própria conta autenticada
```

---

## 🛡️ 2. Fundamentos de Segurança: Cookies `HttpOnly` vs `localStorage`

Na arquitetura web, existem dois locais comuns onde desenvolvedores costumam salvar identificadores de sessão:

| Critério | `localStorage` | `HttpOnly Cookie` (Padrão Recomendado) |
|---|---|---|
| **Acesso por JavaScript (`window.localStorage` / `document.cookie`)** | **Sim (Acesso Total)** 🚨 | **Não (Inacessível para scripts)** 🔒 |
| **Proteção contra Ataques XSS (*Cross-Site Scripting*)** | **Vulnerável:** qualquer script injetado rouba o token JWT imediatamente. | **Protegido:** scripts maliciosos não conseguem ler o cookie. |
| **Envio das Credenciais** | Manual (necessita de interceptor HTTP para injetar cabeçalhos). | Automático (gerenciado nativamente pelo navegador). |
| **Inspeção no DevTools (F12)** | Exposto em texto legível na aba *Local Storage*. | Protegido na aba *Cookies* com a flag **HttpOnly** ativa (✔️). |
| **Gerenciamento de Expiração** | Manual via código JavaScript. | Automático pelo navegador via atributo `Max-Age` / `Expires`. |

> [!IMPORTANT]
> **Regra de Ouro da Segurança Web:**
> Tokens JWT de autenticação nunca devem ser gravados em `localStorage` ou `sessionStorage`. O padrão seguro é mantê-los exclusivamente dentro de cookies protegidos com as diretivas `HttpOnly`, `Secure` e `SameSite`.

---

## ⚙️ 3. Implementação no Back-end (Express)

O back-end é responsável por gerar o token JWT e emitir o cabeçalho `Set-Cookie` com os atributos corretos para cada ambiente.

### 1. Suporte a Proxy Reverso (`src/app.ts`)

No Azure App Service, a conexão HTTPS do cliente chega ao servidor através do balanceador ARR da Microsoft. Para que o Express reconheça conexões seguras e o protocolo correto, ative o `trust proxy`:

```typescript
// src/app.ts
import express from 'express';

export const app = express();

// Permite que o Express identifique conexões HTTPS seguras atrás do Azure ARR
app.set('trust proxy', 1);
```

### 2. Emissão Dinâmica do Cookie (`src/controllers/auth.controller.ts`)

A função `getCookieOptions(req)` define as diretivas de acordo com o ambiente:
- **Nuvem (Azure / HTTPS):** aplica `httpOnly: true`, `secure: true` e `sameSite: 'none'`.
- **Local (`http://localhost`):** aplica `httpOnly: true`, `secure: false` e `sameSite: 'lax'`.

```typescript
// src/controllers/auth.controller.ts
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';

export const getCookieOptions = (req: Request) => {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https' || env.NODE_ENV === 'production';
  const origin = req.get('origin') || '';
  const isCrossDomain = Boolean(origin && !origin.includes('localhost') && !origin.includes('127.0.0.1'));
  const useSecure = isHttps || isCrossDomain;

  return {
    httpOnly: true,
    secure: useSecure,
    sameSite: useSecure ? ('none' as const) : ('lax' as const),
    path: '/',
  };
};

export const login = async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  const options = getCookieOptions(req);
  res.cookie('token', result.token, { ...options, maxAge: 15 * 60 * 1000 });
  res.json(result);
};

export const logout = (req: Request, res: Response) => {
  const options = getCookieOptions(req);
  res.clearCookie('token', options);
  res.status(204).send();
};
```

### 3. Validação de Origens Dinâmicas (`src/middlewares/auth.middleware.ts`)

Em mutações de estado (POST, PUT, DELETE) autenticadas por cookie, o middleware valida a origem da requisição garantindo compatibilidade com subdomínios do Static Web Apps:

```typescript
// src/middlewares/auth.middleware.ts
if (authorization === undefined && unsafe) {
  const origin = req.get('origin');
  if (!origin || !isOriginAllowed(origin)) {
    res.status(403).json({ error: 'Origem obrigatória e confiável para autenticação por cookie.' });
    return;
  }
}
```

---

## 💻 4. Implementação no Front-end (React)

O front-end não manipula o token diretamente: ele apenas delega ao navegador o envio dos cookies e mantém em memória os dados do usuário autenticado.

### 1. Cliente HTTP com Credenciais (`src/services/api.ts`)

A propriedade `withCredentials: true` é obrigatória no Axios para que o navegador inclua cookies em requisições entre origens:

```typescript
// src/services/api.ts
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essencial: habilita o transporte de cookies HttpOnly
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou não autorizada na API:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);
```

### 2. Contexto de Autenticação (`src/context/AuthContext.tsx`)

Gerencia o ciclo de vida da sessão exclusivamente por cookies HttpOnly:

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, LoginResponse } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  /** @deprecated O token JWT agora fica 100% protegido em cookie HttpOnly gerenciado pelo navegador */
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  loading: false,
  login: async () => { throw new Error('AuthProvider não inicializado.'); },
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restaura a sessão ao carregar a aplicação utilizando exclusivamente o cookie HttpOnly
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        // Envia requisição com withCredentials: true.
        // O navegador anexa automaticamente o cookie HttpOnly 'token'
        const response = await api.get<User[]>('/users');
        if (isMounted) {
          const currentUser = response.data?.[0] ?? null;
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          // Higienização preventiva de segurança
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    // Ao autenticar, o servidor Express define o cookie HttpOnly via cabeçalho Set-Cookie
    const response = await api.post<LoginResponse>('/login', credentials);
    const { user: loggedUser } = response.data;

    // Higieniza o storage para assegurar ausência de dados sensíveis
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      // Solicita ao backend a invalidação do cookie via cabeçalho Set-Cookie (Max-Age=0)
      await api.post('/logout');
    } catch (err) {
      console.warn('Erro ao efetuar logout na API:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token: null, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context ?? defaultAuthContext;
}
```

### 3. Configuração de Roteamento SPA (`public/staticwebapp.config.json`)

Para que as rotas da aplicação (como `/login`, `/aluno`, `/professor`) funcionem corretamente no recarregamento (F5) na nuvem, configure as regras de *fallback*:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{png,jpg,gif,ico,svg}"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'"
  }
}
```

---

## 🚀 5. Estratégias de Deploy no Azure

Existem dois modelos arquiteturais para hospedar sua aplicação no Azure:

### Estratégia A: Backend Vinculado (Linked Backend - Recomendada)

No Azure Static Web Apps, você pode vincular seu Azure App Service como um *backend gerenciado*.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Navegador
    participant SWA as Azure Static Web Apps (/api/*)
    participant AppService as Azure App Service

    Usuario->>SWA: POST /api/login
    Note over SWA,AppService: Roteamento interno na mesma origem
    SWA->>AppService: Repassa requisição
    AppService-->>SWA: Set-Cookie: token=...; HttpOnly; SameSite=Lax
    SWA-->>Usuario: Resposta 200 OK + Cookie First-Party
```

#### Vantagens:
- **Cookies de Primeira Parte (*First-Party*):** Como o front-end e a API compartilham o mesmo domínio, os cookies operam com `SameSite=Lax`. Nenhum navegador aplica restrições de terceiros.
- **Simplificação de CORS:** Não há necessidade de gerenciar cabeçalhos complexos de cross-origin.

#### Configuração no Portal do Azure:
1. Acesse o recurso **Azure Static Web Apps**.
2. No menu lateral, selecione **Configurações** ➔ **Back-ends vinculados**.
3. Clique em **Vincular** e aponte para o seu **Serviço de Aplicativo (App Service)**.
4. No front-end React, aponte a URL base para `/api`:
   ```env
   VITE_API_URL=/api
   ```

---

### Estratégia B: Comunicação Direta Cross-Origin (HTTPS)

Quando o front-end (`azurestaticapps.net`) se comunica diretamente com a URL pública da API (`azurewebsites.net`):

#### Configuração no Azure App Service:
No Portal do Azure (**Seu App Service ➔ Configuração ➔ Configurações do Aplicativo**):
- `NODE_ENV`: `production`
- `FRONTEND_ORIGIN`: `https://<seu-app>.azurestaticapps.net`
- `API_ORIGIN`: `https://expresst13-gtazeuceene4a2d4.canadacentral-01.azurewebsites.net`
- `JWT_SECRET`: *(chave segura com mais de 32 caracteres)*
- `DATABASE_URL`: `postgresql://...`

#### Configuração no React (`.env.production`):
```env
VITE_API_URL=https://expresst13-gtazeuceene4a2d4.canadacentral-01.azurewebsites.net
```

---

## 🧪 6. Roteiro de Validação Prática no DevTools (F12)

Para validar se a autenticação está operando com sucesso:

1. **Abrir as Ferramentas do Desenvolvedor (`F12`):**
   - Acesse a aplicação no navegador.
2. **Conferir o Login:**
   - Realize o login com uma conta de Aluno ou Professor.
   - Na aba **Network (Rede)**, observe a resposta de `POST /login`:
     * O cabeçalho deve conter `Set-Cookie: token=...; HttpOnly; ...`
3. **Auditar os Cookies:**
   - Acesse a aba **Application (Aplicativo)** ➔ **Storage** ➔ **Cookies**.
   - Selecione o domínio da API. O cookie `token` estará listado com a coluna **HttpOnly** marcada (✔️).
4. **Auditar o LocalStorage:**
   - Acesse **Application** ➔ **Storage** ➔ **Local Storage**.
   - **Resultado esperado:** a chave `token` **não existe** no Local Storage.
5. **Testar Atualização de Página (`F5`):**
   - Pressione `F5` em uma rota protegida (`/aluno` ou `/professor`).
   - A requisição `GET /users` enviará o cookie automaticamente e a sessão permanecerá ativa.
6. **Testar Logout:**
   - Clique em **Sair**.
   - O servidor invalida o cookie e a aplicação retorna à tela de login.
