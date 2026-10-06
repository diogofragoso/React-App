<!-- Documento: docs/07-rotas-privadas.md -->

# 07 · Protegendo rotas privadas

[← Anterior](06-recuperando-a-sessao.md) · [Índice](../README.md) · **Etapa 7 de 36** · [Próxima →](08-layout-principal.md)

**Ponto de partida:** conclua a conferência do capítulo 06 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Home exige sessão; recuperação inicial não causa redirecionamento prematuro.

**Conceitos praticados:** early return, composição, Navigate, Outlet, rotas aninhadas, autenticação e autorização.

## 1. Decidir em ordem

Primeiro aguarde a recuperação; depois mostre um erro recuperável; somente então decida se existe usuário. Se testar apenas `!user` durante loading, a aplicação envia alguém com cookie válido para Login antes de conferir a sessão.

**Arquivo: `src/components/ProtectedRoute.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/components/ProtectedRoute.tsx -->
```tsx
// Arquivo: src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading, sessionError, retrySession } = useAuth();
  if (loading) return <p role="status">Conferindo sessão…</p>;
  if (sessionError) {
    return (
      <Alert variant="danger" role="alert">
        <p>{sessionError}</p>
        <Button onClick={retrySession}>Tentar novamente</Button>
      </Alert>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
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
import { Home } from './pages/Home';
import { Login } from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="*" element={<p>Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Entender a composição de rotas

A rota sem path agrupa filhas sem acrescentar segmento à URL. ProtectedRoute retorna Outlet quando pode exibir a filha. Navigate descreve um redirecionamento na renderização; useNavigate é usado em handlers, como o submit do login.

Esta proteção melhora a navegação da interface. A API precisa continuar verificando token e permissão em cada pedido. Alterar React no DevTools não deve conceder acesso no servidor.

## 3. Testar o acesso direto

Abra / sem cookie: deve terminar em /login. Faça login e recarregue /: espere a conferência, depois Home. Pare a API e recarregue /: deve haver uma tentativa recuperável, sem fingir que a senha está errada.
## Conferência antes de avançar

- [ ] Acesso direto sem sessão redireciona.
- [ ] Sessão válida permanece na Home após F5.
- [ ] Erro de rede oferece nova tentativa.
- [ ] /login permanece público.

## Prática do estudante

Liste as quatro saídas do componente e a condição que conduz a cada uma. Explique por que todos os Hooks foram chamados antes dos returns condicionais.

## Se algo falhar

Se Home estiver sempre vazia, confira Outlet e se a Route filha está dentro do agrupamento. Se a tela piscar para Login no F5, revise a ordem dos returns.

Referências: [Rotas aninhadas](https://reactrouter.com/7.18.4/start/declarative/routing) · [Renderização condicional](https://react.dev/learn/conditional-rendering).

[← Anterior](06-recuperando-a-sessao.md) · [Índice](../README.md) · [Próxima →](08-layout-principal.md)
