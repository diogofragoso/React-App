<!-- Documento: docs/13-detalhes-do-cliente.md -->

# 13 · Detalhes de um cliente

[← Anterior](12-componentes-com-props.md) · [Índice](../README.md) · **Etapa 13 de 36** · [Próxima →](14-cadastro-de-cliente.md)

**Ponto de partida:** conclua a conferência do capítulo 12 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Clique abre o registro correto em uma rota dinâmica.

**Conceitos praticados:** useParams, parâmetro como string, validação de id, efeito dependente de URL, links.

## 1. Criar a página de detalhes

`/clientes/10` no frontend é uma rota de tela; `http://localhost:3000/clientes/10` é uma rota HTTP da API. O Router entrega id como string ou undefined. Validamos antes de enviar a chamada.

**Arquivo: `src/pages/ClienteDetalhes/index.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/ClienteDetalhes/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteDetalhes/index.tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { Cliente } from '../../types';

export function ClienteDetalhes() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
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
      .catch(() => { if (!controller.signal.aborted) setError('Cliente não encontrado ou indisponível.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, validId]);

  if (!validId) return <p role="alert">Identificador inválido.</p>;
  if (loading) return <p role="status">Carregando cliente…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!cliente) return <p>Cliente não encontrado.</p>;
  return (
    <>
      <h1>{cliente.name}</h1>
      <p>{cliente.email}</p>
      <p>Criado em {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}</p>
      <Link to="/clientes">Voltar à lista</Link>
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
            </Route>
          </Route>
          <Route path="*" element={<p className="container">Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Reagir à troca de parâmetro

A página pode continuar montada enquanto a URL muda de um id para outro. Por isso o efeito depende de id. Limpar o cliente anterior e cancelar a chamada anterior impede que um resultado atrasado substitua os dados da URL mais recente.

Os Hooks aparecem antes dos returns condicionais. O if dentro do efeito pode impedir a chamada, sem tornar a chamada do Hook condicional.
## Conferência antes de avançar

- [ ] Cada Link usa o id do cartão.
- [ ] /clientes/abc mostra identificador inválido sem GET.
- [ ] Trocar id busca dados novamente.
- [ ] ID inexistente apresenta falha sem quebrar a aplicação.

## Prática do estudante

Abra dois detalhes em sequência com rede lenta. Observe o cancelamento. Explique por que um array de dependências vazio seria incorreto nesta tela.

## Se algo falhar

Se todos os Links abrirem o mesmo registro, confira cliente.id. Se a página mantiver dados antigos, confira dependências e cleanup.

Referências: [Parâmetros de URL](https://reactrouter.com/7.18.4/start/declarative/url-values) · [useEffect](https://react.dev/reference/react/useEffect).

[← Anterior](12-componentes-com-props.md) · [Índice](../README.md) · [Próxima →](14-cadastro-de-cliente.md)
