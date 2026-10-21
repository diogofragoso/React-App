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
