# 06 · Proteger as páginas por perfil

[← Anterior](05-autenticacao.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](07-paginas-publicas.md)

**Etapa 6 de 11.** Conclua o [capítulo 5](05-autenticacao.md) antes de continuar.

**Objetivo:** Criar o componente que aguarda a sessão e decide se a página pode ser exibida.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Crie `src/components/ProtectedRoute.tsx`:

**Arquivo: `src/components/ProtectedRoute.tsx`**

<!-- source: src/components/ProtectedRoute.tsx -->
```tsx
// src/components/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Carregando autenticação...</span>
        </Spinner>
      </Container>
    );
  }

  // 1. Se o usuário não estiver autenticado, redireciona para a página de Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Compara o papel do usuário (em minúsculas) com a lista permitida para esta rota
  const userRole = (user.role || '').toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

  // 3. Se o papel não tiver permissão nesta rota específica, redireciona para Acesso Negado (403)
  if (!normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Acesso autorizado
  return <>{children}</>;
}
```
<!-- endsource -->

A ordem é: aguardar restauração, exigir usuário, comparar o perfil em minúsculas e renderizar `children`. Visitantes vão para `/login`; perfis incompatíveis vão para `/unauthorized`. O guardião guarda a localização em `state.from`, mas o login atual não a utiliza para retorno: o destino depende de `role`. Não substitua este componente pelo exemplo com `Outlet` da trilha complementar.

O redirecionamento controla a interface. Não equivale a uma resposta HTTP 403 nem implementa autorização no servidor. A API local verifica autenticação e titularidade da conta; seus endpoints não fornecem recursos de disciplinas ou notas segregados por aluno/professor.

## Conferência antes de avançar

- [ ] ProtectedRoute recebe allowedRoles e children.
- [ ] Você distingue visitante de usuário autenticado com perfil incompatível.

[← Anterior](05-autenticacao.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](07-paginas-publicas.md)
