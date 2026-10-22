# 05 · Compartilhar a sessão com Context

[← Anterior](04-tipos-e-api.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](06-rotas-protegidas.md)

**Etapa 5 de 11.** Conclua o [capítulo 4](04-tipos-e-api.md) antes de continuar.

**Objetivo:** Implementar login, restauração da sessão, logout e o hook useAuth.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Crie `src/context/AuthContext.tsx`. O Provider armazena `user` e `loading`, e oferece `login`, `logout` e `useAuth` para as páginas.

**Arquivo: `src/context/AuthContext.tsx`**

<!-- source: src/context/AuthContext.tsx -->
```tsx
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
          // A API retorna um array contendo a própria conta autenticada
          const currentUser = response.data?.[0] ?? null;
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          // Higienização de segurança: garante que o localStorage não contenha tokens antigos
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
    // Ao efetuar login, o servidor Express define o cookie HttpOnly (token)
    // via cabeçalho Set-Cookie com SameSite=None (ou Lax) e Secure=true.
    const response = await api.post<LoginResponse>('/login', credentials);
    const { user: loggedUser } = response.data;

    // Higieniza o localStorage: o token NUNCA deve ser gravado no localStorage
    // para evitar exposição a ataques de XSS (Cross-Site Scripting).
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      // Notifica o backend para invalidar e limpar o cookie HttpOnly (res.clearCookie)
      await api.post('/logout');
    } catch (err) {
      console.warn('Erro ao efetuar logout na API:', err);
    } finally {
      // Remove quaisquer resíduos locais e limpa o estado da aplicação
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
<!-- endsource -->

Ao montar, o efeito chama `GET /users` e seleciona o primeiro elemento do array. Enquanto a consulta está pendente, `loading` permanece verdadeiro. O cleanup marca a execução como desmontada; não cancela a requisição. Com StrictMode, podem ocorrer requisições adicionais no desenvolvimento. Qualquer erro de restauração, inclusive indisponibilidade da rede, resulta em `user: null`; não existe tela de tentativa novamente.

O login envia as credenciais para `POST /login`, usa `response.data.user` e ignora o token do JSON. O cookie HttpOnly é gerenciado pelo navegador. A propriedade `token` do Context foi preservada por compatibilidade e sempre vale `null`. `localStorage.removeItem` remove resíduos antigos de `token` e `user`; não persiste a sessão.

O logout chama `POST /logout` e limpa o estado local mesmo se a API falhar. Se a limpeza remota falhar, o cookie pode continuar válido e uma atualização da página pode restaurar a sessão. O endpoint remove o cookie; não há revogação do JWT em lista de bloqueio. O `useAuth` retorna um contexto padrão fora do Provider: não há exceção imediata para detectar esse erro de composição. Como `AuthProvider` e `useAuth` são exportados no mesmo arquivo, o Oxlint (`npm.cmd run lint`) emite 1 aviso esperado (`react(only-export-components)`) e 0 erros.

## Conferência antes de avançar

- [ ] O contexto está em src/context, no singular.
- [ ] Você consegue explicar por que o token do JSON não é persistido.

[← Anterior](04-tipos-e-api.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](06-rotas-protegidas.md)
