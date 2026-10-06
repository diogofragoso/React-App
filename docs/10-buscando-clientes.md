<!-- Documento: docs/10-buscando-clientes.md -->

# 10 · Buscando os primeiros clientes

[← Anterior](09-dashboard.md) · [Índice](../README.md) · **Etapa 10 de 36** · [Próxima →](11-renderizando-listas.md)

**Ponto de partida:** conclua a conferência do capítulo 09 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Página busca os contatos compartilhados da API com cancelamento.

**Conceitos praticados:** useState com array tipado, useEffect, Axios GET, Promise, loading, erro, cleanup.

## 1. Preparar o recurso certo

GET /users devolve a própria conta. Para aprender listagens e CRUD, usaremos **Cliente**, criado no capítulo 10 da API. Cadastre um contato de estudo pelo Swagger para ver dados reais.

**Arquivo: `src/pages/Clientes/index.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/Clientes/index.tsx -->
```tsx
// Arquivo: src/pages/Clientes/index.tsx
import { useEffect, useState } from 'react';

import axios from 'axios';
import { api } from '../../services/api';
import type { Cliente } from '../../types';





export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);







  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<Cliente[]>('/clientes', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setClientes(data);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setError('Não foi possível carregar os clientes.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);






  return (
    <>
      <h1>Clientes</h1>



      {loading && <p role="status">Carregando clientes…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && <p>{clientes.length} cliente(s) recebido(s).</p>}


    </>
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
            </Route>
          </Route>
          <Route path="*" element={<p className="container">Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**Arquivo: `src/components/AppLayout.tsx`**

Substitua todo o conteúdo.

<!-- file: src/components/AppLayout.tsx -->
```tsx
// Arquivo: src/components/AppLayout.tsx
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <>
      <a className="visually-hidden-focusable" href="#conteudo">Pular para o conteúdo</a>
      <Navbar bg="light" expand="sm" aria-label="Navegação principal">
        <Container>
          <Navbar.Brand as={NavLink} to="/">Cadastro de clientes</Navbar.Brand>
          <Navbar.Toggle aria-controls="menu-principal" />
          <Navbar.Collapse id="menu-principal">
            <Nav>
              <Nav.Link as={NavLink} to="/" end>Início</Nav.Link>
              <Nav.Link as={NavLink} to="/clientes">Clientes</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container as="main" id="conteudo" tabIndex={-1}><Outlet /></Container>
    </>
  );
}
```

## 2. Explicar o tempo da requisição

No primeiro render, clientes é um array vazio e loading é true. O efeito busca os dados; setClientes publica o array e pede nova renderização. O array vazio inicial não significa que o servidor não tem contatos.

O cleanup cancela a chamada ao sair da página. Um cancelamento esperado não vira mensagem de falha. O finally também precisa conferir se o efeito ainda está ativo antes de alterar loading.

Nesta etapa mostramos somente a quantidade recebida; transformar dados em elementos será a próxima entrega.
## Conferência antes de avançar

- [ ] /clientes está dentro da proteção e do layout.
- [ ] GET /clientes usa cookie e exibe a quantidade correta.
- [ ] Sair da página durante a chamada cancela a atualização.

## Prática do estudante

Observe os valores iniciais no React DevTools. Compare ausência de registros, espera e falha de rede. Explique por que arrays tipados precisam de `useState<Cliente[]>([])`.

## Se algo falhar

404 em /clientes normalmente indica que o capítulo 10 da API não foi concluído. 401 pede recuperar a sessão; confira o GET /users antes de depurar o componente.

Referências: [useEffect](https://react.dev/reference/react/useEffect) · [Axios GET](https://axios-http.com/docs/api_intro).

[← Anterior](09-dashboard.md) · [Índice](../README.md) · [Próxima →](11-renderizando-listas.md)
