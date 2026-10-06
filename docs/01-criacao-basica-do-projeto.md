<!-- Documento: docs/01-criacao-basica-do-projeto.md -->

# 01 · Criação básica do projeto

[Índice](../README.md) · **Etapa 1 de 36** · [Próxima →](02-arquitetura-e-rotas.md)

**Ponto de partida:** pasta nova e vazia ou uma cópia de estudo; nunca inicialize o Vite sobre arquivos existentes. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Primeira tela renderizada com React, TypeScript, Vite e Bootstrap.

**Conceitos praticados:** React, SPA, componente funcional, JSX, createRoot, StrictMode, import/export, CSS.

## 1. Preparar o ambiente e criar uma pasta nova

React descreve interfaces por componentes. Um componente é uma função que retorna JSX, a sintaxe que aproxima marcação e JavaScript. TypeScript ajuda a conferir os tipos; Vite serve os arquivos em desenvolvimento e prepara o build. Bootstrap oferece CSS e React Bootstrap fornece componentes que usam esse CSS.

A SPA navega sem pedir outro documento HTML a cada clique. Ela continua precisando do servidor da API para dados. Renderizar é executar componentes para calcular a interface; o React aplica ao DOM as mudanças necessárias. Um componente pode renderizar novamente sem alterar o DOM.

Use Node.js 24.15.0 ou posterior compatível com as ferramentas, também exigido pelo guia da API. Em uma pasta **pai** do novo projeto:

```bat
node --version
npm --version
npm create vite@9.2.1 frontend-estudo -- --template react-ts --no-interactive
cd frontend-estudo
npm install
npm install --save-exact react@19.3.0 react-dom@19.3.0 bootstrap@5.3.8 react-bootstrap@2.10.10 react-router-dom@7.18.4 axios@1.20.0
npm install --save-dev --save-exact vite@8.3.1 typescript@6.0.3 @vitejs/plugin-react@6.1.1 oxlint@1.86.0 @types/node@24.19.0 @types/react@19.3.0 @types/react-dom@19.3.0
```

O gerador cria arquivos de configuração; preserve-os. Versione o lockfile. Para retomar uma cópia existente com lockfile, execute `npm ci` nela e continue no capítulo correspondente. O nome `frontend-estudo` evita sobrescrever `react-project`.

## 2. Entender a entrada da aplicação

`index.html` contém `<div id="root"></div>` e carrega `/src/main.tsx`. `createRoot` conecta React àquele elemento; `App` é o componente raiz.

`StrictMode` faz verificações extras no desenvolvimento, inclusive ciclos adicionais de efeitos. Ele não é uma configuração de segurança da API. Não o remova para esconder uma requisição repetida.

**Arquivo: `src/main.tsx`**

Substitua todo o conteúdo.

<!-- file: src/main.tsx -->
```tsx
// Arquivo: src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
```

**Arquivo: `src/index.css`**

Substitua todo o conteúdo.

<!-- file: src/index.css -->
```css
/* Arquivo: src/index.css */
body { margin: 0; }
main { padding-block: 1.5rem; }
```

**Arquivo: `src/App.tsx`**

Substitua todo o conteúdo.

<!-- file: src/App.tsx -->
```tsx
// Arquivo: src/App.tsx
import { Button, Card, Container } from 'react-bootstrap';

export default function App() {
  return (
    <Container as="main">
      <Card>
        <Card.Body>
          <h1>Cadastro de clientes</h1>
          <Card.Text>Nosso frontend está pronto para evoluir.</Card.Text>
          <Button type="button" onClick={() => alert('Primeiro evento!')}>
            Experimentar
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
```

## 3. Ler o JSX e executar

`App` começa com maiúscula: `<App />` representa um componente. `<h1>` representa uma tag HTML. `className` define classes CSS; chaves permitem expressões JavaScript. Toda tag precisa ser fechada. Use `<></>` quando precisar agrupar elementos sem acrescentar uma tag ao DOM.

`export default` permite `import App from './App'`. Mais adiante usaremos exports nomeados, como `import { Home } from './pages/Home'`. Os imports locais do frontend são resolvidos pelo Vite; não copie a convenção `.js` de imports NodeNext da API.

```bat
npm run dev -- --port 5173 --strictPort
```

Abra `http://localhost:5173`. Use outro CMD para `npm run build`. O CSS do Bootstrap entra primeiro, permitindo que o CSS local sobrescreva regras quando necessário.
## Conferência antes de avançar

- [ ] Tela apresenta título e botão com estilos.
- [ ] Clique dispara o evento; atualização do arquivo aparece no navegador.
- [ ] Build conclui sem erros de TypeScript.

## Prática do estudante

Troque o texto do botão, acrescente um parágrafo com uma expressão como `{2 + 3}` e explique por que a expressão aparece como 5. Inspecione o HTML gerado: JSX é a descrição escrita no código, o DOM é a árvore real do navegador.

## Se algo falhar

Se faltar estilo, confira o import do Bootstrap em main.tsx. Se #root não existir, confira index.html. Se a porta estiver ocupada, encerre o servidor anterior ou alinhe a nova origem com o CORS da API.

Referências: [Introdução ao React](https://react.dev/learn) · [StrictMode](https://react.dev/reference/react/StrictMode) · [Vite](https://vite.dev/guide/).

[Índice](../README.md) · [Próxima →](02-arquitetura-e-rotas.md)
