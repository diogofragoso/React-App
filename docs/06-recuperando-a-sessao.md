<!-- Documento: docs/06-recuperando-a-sessao.md -->

# 06 · Recuperando a sessão ao abrir a aplicação

[← Anterior](05-contexto-de-autenticacao.md) · [Índice](../README.md) · **Etapa 6 de 36** · [Próxima →](07-rotas-privadas.md)

**Ponto de partida:** conclua a conferência do capítulo 05 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Cookie válido recupera user após F5; sessão inválida e API indisponível têm estados diferentes.

**Conceitos praticados:** useEffect, dependências, cleanup, AbortController, useRef, loading inicial, race conditions, atualização funcional.

## 1. Sincronizar a memória com a sessão externa

Um efeito sincroniza o componente com algo externo: aqui a sessão do servidor. A API do guia não tem /me; GET /users retorna um array com a própria conta autenticada. Esse formato precisa ser conferido antes de usar data[0].

O render calcula a interface; o efeito acontece após a atualização. Chamar HTTP diretamente no corpo do componente faria uma nova chamada a cada render. Uma dependência controla quando o efeito precisa sincronizar novamente; neste caso, attempt muda apenas ao pedir nova tentativa.

## 2. Recuperar com cancelamento e proteção contra respostas antigas

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
import type { LoginCredentials, LoginResponse, User } from '../types';

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
    api.get<User[]>('/users', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted && version.current === currentVersion) {
          setUser(data[0] ?? null);
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
    const { data } = await api.post<LoginResponse>('/login', credentials);
    version.current += 1;
    setUser(data.user);
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

`AbortController` cancela a requisição quando o efeito é limpo. O teste `signal.aborted` impede que um resultado cancelado publique estado.

`useRef` guarda um valor entre renders sem pedir renderização ao alterá-lo. Aqui version identifica a versão da autenticação: uma recuperação iniciada antes de um login não pode sobrescrever o usuário obtido pelo login. Ela não precisa aparecer na tela, por isso não é state.

`setAttempt(previous => previous + 1)` usa a atualização funcional quando o próximo valor depende do anterior. Não mude `previous` por atribuição.

## 3. Conferir três cenários

| Cenário | Resultado esperado |
|---|---|
| Cookie válido e API online | user recebe a conta e loading termina |
| Cookie ausente/expirado; 401 | user fica null e loading termina |
| Falha de rede, timeout ou 500 | sessionError permite nova tentativa; não é tratado como credencial inválida |

StrictMode pode iniciar, cancelar e repetir uma recuperação em desenvolvimento. Isso exercita o cleanup; não significa que o usuário deve fazer login duas vezes. O servidor pode receber um GET mesmo depois do cancelamento local.

A tela de espera será aplicada às rotas no próximo capítulo. No DevTools, observe loading e sessionError.
## Conferência antes de avançar

- [ ] F5 após login recupera a própria conta.
- [ ] Sem cookie, 401 termina a espera.
- [ ] API parada gera erro de recuperação.
- [ ] Resposta antiga não sobrescreve um login mais recente.

## Prática do estudante

Ative rede lenta, recarregue a aplicação e observe o GET /users. Explique por que um efeito não deve ser async diretamente: ele deve retornar cleanup, não uma Promise.

## Se algo falhar

Se o cookie não acompanhar /users, confira Application → Cookies, CORS, withCredentials e host. Não interprete 500 como logout. Não adicione user às dependências desse efeito, pois ele próprio atualiza user.

Referências: [Sincronização com efeitos](https://react.dev/learn/synchronizing-with-effects) · [useRef](https://react.dev/reference/react/useRef) · [Cancelamento no Axios](https://axios-http.com/docs/cancellation).

[← Anterior](05-contexto-de-autenticacao.md) · [Índice](../README.md) · [Próxima →](07-rotas-privadas.md)
