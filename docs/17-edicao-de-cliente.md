<!-- Documento: docs/17-edicao-de-cliente.md -->

# 17 · Editando um cliente

[← Anterior](16-validacao-do-formulario.md) · [Índice](../README.md) · **Etapa 17 de 36** · [Próxima →](18-exclusao-de-cliente.md)

**Ponto de partida:** conclua a conferência do capítulo 16 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Formulário existente carrega e altera um cliente com PUT.

**Conceitos praticados:** preenchimento assíncrono, estado inicial, key e remontagem, composição, PUT e PATCH.

## 1. Montar o formulário depois de carregar

Não renderize ClienteForm com valores vazios esperando que initialValue sincronize sozinho. A página carrega o cliente e só então monta o formulário. A key pelo id reinicia seu estado quando mudar o registro representado.

**Arquivo: `src/pages/ClienteEditar/index.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/ClienteEditar/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteEditar/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { ClienteForm } from '../../components/ClienteForm';
import type { Cliente, ClienteInput } from '../../types';

export function ClienteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validId = !!id && /^[1-9]\d*$/.test(id) && Number(id) <= 2147483647;

  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();
    setLoading(true);
    setCliente(null);
    setError(null);
    api.get<Cliente>('/clientes/' + id, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setCliente(data); })
      .catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar o cliente.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, validId]);

  async function save(input: ClienteInput) {
    if (!cliente || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.put<Cliente>('/clientes/' + cliente.id, input);
      navigate('/clientes', { replace: true });
    } catch {
      setError('Não foi possível salvar. Confira a conexão e o e-mail.');
    } finally {
      setSubmitting(false);
    }
  }
  if (!validId) return <p role="alert">Identificador inválido.</p>;
  if (loading) return <p role="status">Carregando cliente…</p>;
  return (
    <>
      <h1>Editar cliente</h1>
      {error && <p role="alert">{error}</p>}
      {cliente && <ClienteForm key={cliente.id}
        initialValue={{ name: cliente.name, email: cliente.email }}
        submitting={submitting} onSave={save} />}
    </>
  );
}
```

**Arquivo: `src/components/ClienteCard.tsx`**

Substitua todo o conteúdo.

<!-- file: src/components/ClienteCard.tsx -->
```tsx
// Arquivo: src/components/ClienteCard.tsx
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Cliente } from '../types';

interface ClienteCardProps {
  cliente: Cliente;

}

export function ClienteCard({ cliente }: ClienteCardProps) {
  return (
    <Card>
      <Card.Body>
        <h2 className="h5">{cliente.name}</h2>
        <p>{cliente.email}</p>
        <Link to={"/clientes/" + cliente.id}>Ver detalhes</Link>
        <Link className="ms-3" to={"/clientes/" + cliente.id + "/editar"}>Editar</Link>

      </Card.Body>
    </Card>
  );
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
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Clientes } from './pages/Clientes';
import { ClienteDetalhes } from './pages/ClienteDetalhes';
import { ClienteNovo } from './pages/ClienteNovo';
import { ClienteEditar } from './pages/ClienteEditar';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/:id" element={<ClienteDetalhes />} />
              <Route path="clientes/novo" element={<ClienteNovo />} />
              <Route path="clientes/:id/editar" element={<ClienteEditar />} />
            </Route>
          </Route>
          <Route path="*" element={<p className="container">Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Comparar criação e edição

Criação usa POST /clientes; edição usa PUT /clientes/:id. Este backend aceita alterações parciais nessa rota PUT por decisão do contrato do guia. Não envie PATCH, pois não há essa rota. A interface envia os dois campos editáveis.

ClienteForm não conhece o verbo HTTP. A página injeta a decisão pelo callback onSave, sem duplicar validação.
## Conferência antes de avançar

- [ ] Página carrega valores existentes.
- [ ] Salvar envia PUT com id correto.
- [ ] Voltar à lista confirma persistência.
- [ ] Falha mantém o formulário preenchido.

## Prática do estudante

Compare as duas páginas e marque o que pertence ao formulário e o que muda com a operação. Teste um e-mail já utilizado e observe 409.

## Se algo falhar

Campos vazios após GET indicam montagem prematura. Confira cliente && e initialValue. Não envie id ou createdAt na edição.

Referências: [Preservar e reiniciar state](https://react.dev/learn/preserving-and-resetting-state).

[← Anterior](16-validacao-do-formulario.md) · [Índice](../README.md) · [Próxima →](18-exclusao-de-cliente.md)
