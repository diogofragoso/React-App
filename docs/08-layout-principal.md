<!-- Documento: docs/08-layout-principal.md -->

# 08 · Criando o layout principal

[← Anterior](07-rotas-privadas.md) · [Índice](../README.md) · **Etapa 8 de 36** · [Próxima →](09-dashboard.md)

**Ponto de partida:** conclua a conferência do capítulo 07 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Navbar e área principal compartilhadas pelas páginas privadas.

**Conceitos praticados:** componentização, Fragment, composição, Outlet, NavLink, children, responsabilidade de páginas.

## 1. Extrair a estrutura comum

O layout contém navegação e a área de conteúdo. Ele não precisa conhecer o JSX de cada página. Outlet representa a filha escolhida pelo Router; children representa conteúdo passado diretamente entre tags. AuthProvider usa children; o layout de rotas usa Outlet.

**Arquivo: `src/components/AppLayout.tsx`**

Crie este arquivo e copie todo o conteúdo.

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
            <Nav><Nav.Link as={NavLink} to="/" end>Início</Nav.Link></Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container as="main" id="conteudo" tabIndex={-1}><Outlet /></Container>
    </>
  );
}
```

**Arquivo: `src/pages/Home/index.tsx`**

Substitua todo o conteúdo. O main agora pertence ao layout.

<!-- file: src/pages/Home/index.tsx -->
```tsx
// Arquivo: src/pages/Home/index.tsx
export function Home() {
  return (
    <>
      <h1>Página inicial</h1>
      <p>A navegação agora pertence ao layout compartilhado.</p>
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
            </Route>
          </Route>
          <Route path="*" element={<p className="container">Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Reconhecer props e componentes HTML

`as={NavLink}` faz React Bootstrap usar o componente de link do Router. `expand="sm"` controla quando a navegação expande; `end` evita que o link Início fique ativo em todas as URLs iniciadas por /.

A tag main deve aparecer uma vez na região principal. As páginas privadas deixam de criar outro main dentro dele. A página pública de Login continua com seu próprio main.

O link “Pular para o conteúdo” ajuda navegação por teclado. Acessibilidade começa na estrutura e será revisada no capítulo 34.
## Conferência antes de avançar

- [ ] Página privada usa Navbar e um único main.
- [ ] Login continua fora do layout privado.
- [ ] Menu funciona em largura estreita e por teclado.

## Prática do estudante

Crie um rodapé estático no layout. Explique por que ele não deve ser copiado em todas as pages e por que o layout não precisa importar cada page.

## Se algo falhar

Se a página desapareceu após mover o layout, confira o Outlet no layout e a hierarquia de Routes. Não coloque BrowserRouter no layout.

Referências: [Composição por props](https://react.dev/learn/passing-props-to-a-component) · [Navbar](https://react-bootstrap.github.io/docs/components/navbar/).

[← Anterior](07-rotas-privadas.md) · [Índice](../README.md) · [Próxima →](09-dashboard.md)
