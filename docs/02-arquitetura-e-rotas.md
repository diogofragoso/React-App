<!-- Documento: docs/02-arquitetura-e-rotas.md -->

# 02 · Páginas e primeiras rotas

[← Anterior](01-criacao-basica-do-projeto.md) · [Índice](../README.md) · **Etapa 2 de 36** · [Próxima →](03-servicos-e-tipagens.md)

**Ponto de partida:** conclua a conferência do capítulo 01 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Home e Login com navegação sem recarregar o documento.

**Conceitos praticados:** páginas e componentes, organização, exports nomeados, props, BrowserRouter, Routes, Route, Link, CSS Modules.

## 1. Criar somente as pastas necessárias

Crie `src/pages/Home` e `src/pages/Login`. Uma page também é um componente; o nome indica que representa uma tela da rota. Um componente reutilizável será colocado em `components` quando aparecer uma necessidade real. Não é preciso começar com dezenas de pastas vazias.

**Arquivo: `src/pages/Home/home.module.css`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/Home/home.module.css -->
```css
/* Arquivo: src/pages/Home/home.module.css */
.title { color: #0d6efd; }
```

**Arquivo: `src/pages/Home/index.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/Home/index.tsx -->
```tsx
// Arquivo: src/pages/Home/index.tsx
import { Link } from 'react-router-dom';
import styles from './home.module.css';

export function Home() {
  return (
    <main className="container">
      <h1 className={styles.title}>Página inicial</h1>
      <Link to="/login">Entrar no sistema</Link>
    </main>
  );
}
```

**Arquivo: `src/pages/Login/index.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/Login/index.tsx -->
```tsx
// Arquivo: src/pages/Login/index.tsx
import { Link } from 'react-router-dom';

export function Login() {
  return (
    <main className="container">
      <h1>Login</h1>
      <Link to="/">Voltar para a Home</Link>
    </main>
  );
}
```

CSS Modules gera nomes de classe próprios para o arquivo. O objeto `styles` conecta a classe local ao JSX.

## 2. Definir as rotas

**Arquivo: `src/App.tsx`**

Substitua todo o conteúdo.

<!-- file: src/App.tsx -->
```tsx
// Arquivo: src/App.tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<p className="container">Página não encontrada.</p>} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 3. Seguir o fluxo

`BrowserRouter` acompanha a URL. `Routes` escolhe uma rota; `path` e `element` são **props**, entradas de um componente. `element={<Home />}` passa um elemento React, não a função `Home`.

`Link` permite navegação e preserva o comportamento de um link, incluindo abrir em outra aba. Use link para navegar e botão para executar uma ação. Um `<a href="/login">` pede outro documento ao servidor; um `Link` deixa o Router conduzir essa navegação.

Abra Home, clique no link, use Voltar do navegador e acesse uma URL inexistente. Na aba Network, a navegação por Link não deve carregar um novo documento HTML.
## Conferência antes de avançar

- [ ] As duas páginas e a página não encontrada aparecem.
- [ ] Links e histórico do navegador funcionam.
- [ ] Nenhum BrowserRouter foi duplicado em main.tsx.

## Prática do estudante

Acrescente uma página Sobre com um export nomeado, uma rota `/sobre` e um Link. Explique a diferença entre o caminho do arquivo e o caminho da URL.

## Se algo falhar

Se useNavigate ou Link reclamarem do Router, confira se o componente está dentro de BrowserRouter. Não importe um export nomeado como default.

Referências: [Rotas declarativas no React Router 7](https://reactrouter.com/7.18.4/start/declarative/routing).

[← Anterior](01-criacao-basica-do-projeto.md) · [Índice](../README.md) · [Próxima →](03-servicos-e-tipagens.md)
