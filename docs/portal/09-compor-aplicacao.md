# 09 · Conectar rotas e entrada da aplicação

[← Anterior](08-paineis.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](10-integracao-local.md)

**Etapa 9 de 11.** Conclua o [capítulo 8](08-paineis.md) antes de continuar.

**Objetivo:** Compor BrowserRouter, AuthProvider e as páginas, completando os imports da aplicação.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Agora crie os arquivos que compõem todas as telas. `BrowserRouter` envolve `AuthProvider`, que envolve `AppRoutes`. Existe um único router. As rotas protegidas recebem as páginas como `children`.

**Arquivo: `src/routes/index.tsx`**

<!-- source: src/routes/index.tsx -->
```tsx
// Arquivo: src/routes/index.tsx
import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Aluno } from '../pages/Aluno';
import { Professor } from '../pages/Professor';
import { Unauthorized } from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rota Protegida Exclusiva para Alunos */}
      <Route
        path="/aluno"
        element={
          <ProtectedRoute allowedRoles={['aluno']}>
            <Aluno />
          </ProtectedRoute>
        }
      />

      {/* Rota Protegida Exclusiva para Professores */}
      <Route
        path="/professor"
        element={
          <ProtectedRoute allowedRoles={['professor']}>
            <Professor />
          </ProtectedRoute>
        }
      />

      {/* Rota Coringa 404 */}
      <Route
        path="*"
        element={
          <div className="container py-5 text-center">
            <h3>404 - Página não encontrada</h3>
            <a href="/" className="btn btn-primary mt-3">Voltar para o Início</a>
          </div>
        }
      />
    </Routes>
  );
}
```
<!-- endsource -->

**Arquivo: `src/App.tsx`**

<!-- source: src/App.tsx -->
```tsx
// Arquivo: src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```
<!-- endsource -->

**Arquivo: `src/main.tsx`**

<!-- source: src/main.tsx -->
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
<!-- endsource -->

**Arquivo: `index.html`**

<!-- source: index.html -->
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontendreact</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
<!-- endsource -->

`index.html` carrega `src/main.tsx`, que monta `<App />` em `#root`, dentro de StrictMode. Somente o CSS do Bootstrap é importado na entrada atual. `src/index.css`, `src/App.css` e `Login.module.css` não participam do visual atual; o apêndice os preserva para reproduzir todos os arquivos existentes. Não importe o CSS do template como uma etapa adicional, pois isso muda o resultado visual.

| URL | Comportamento atual |
|---|---|
| `/` | Home pública, com estado da sessão |
| `/login` | Login e cadastro; aluno/professor autenticado é encaminhado ao próprio painel |
| `/aluno` | Loading, login para visitante, painel para aluno, acesso negado para outro perfil |
| `/professor` | Loading, login para visitante, painel para professor, acesso negado para outro perfil |
| `/unauthorized` | Página pública de acesso negado |
| Qualquer outra | Interface de 404 definida na rota `*` |

Antes de executar, copie os [arquivos auxiliares existentes](REFERENCIA-ARQUIVOS.md), incluindo o favicon referenciado por `index.html`. Os estilos não importados são preservados nessa referência para permitir a reprodução de todo `src/public`. Com todos os arquivos criados, execute na raiz do frontend `npx.cmd tsc -b` e `npm.cmd run lint` (0 erros e 1 aviso esperado `react(only-export-components)` em `AuthContext.tsx`).

## Conferência antes de avançar

- [ ] Existe somente um BrowserRouter.
- [ ] O Bootstrap é importado em main.tsx.
- [ ] Você copiou os arquivos auxiliares indicados antes de executar.

[← Anterior](08-paineis.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](10-integracao-local.md)
