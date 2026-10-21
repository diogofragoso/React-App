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
