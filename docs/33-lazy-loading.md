<!-- Documento: docs/33-lazy-loading.md -->

# 33 · Lazy loading das páginas

[← Anterior](32-otimizacao.md) · [Índice](../README.md) · **Etapa 33 de 36** · [Próxima →](34-acessibilidade.md)

**Ponto de partida:** conclua a conferência do capítulo 32 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Build divide páginas em módulos carregados quando necessários.

**Conceitos praticados:** lazy, Suspense, import dinâmico, code splitting, default export adaptado.

## 1. Carregar código da página sob demanda

lazy fica fora da função App para manter a identidade do componente. Nossas páginas usam export nomeado; a transformação para `{ default: module.Clientes }` fornece o formato esperado pelo lazy.

**Arquivo: `src/App.tsx`**

Substitua todo o conteúdo.

<!-- file: src/App.tsx -->
```tsx
// Arquivo: src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { AsyncState } from './components/AsyncState';
import { Home } from './pages/Home';

const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Clientes = lazy(() => import('./pages/Clientes').then(module => ({ default: module.Clientes })));
const ClienteNovo = lazy(() => import('./pages/ClienteNovo').then(module => ({ default: module.ClienteNovo })));
const ClienteEditar = lazy(() => import('./pages/ClienteEditar').then(module => ({ default: module.ClienteEditar })));
const ClienteDetalhes = lazy(() => import('./pages/ClienteDetalhes').then(module => ({ default: module.ClienteDetalhes })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<AsyncState status="loading" />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Home />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="clientes/novo" element={<ClienteNovo />} />
                  <Route path="clientes/:id" element={<ClienteDetalhes />} />
                  <Route path="clientes/:id/editar" element={<ClienteEditar />} />
                </Route>
              </Route>
              <Route path="*" element={<p className="container">Página não encontrada.</p>} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Separar espera de código e espera de dados

Suspense espera o import dinâmico. Ele não aguarda automaticamente o GET iniciado por useEffect. Depois de carregar o módulo, a página pode mostrar seu próprio estado de busca. Providers permanecem acima de Suspense para preservar sessão e avisos.

```bat
npm run build
npm run preview -- --port 5173 --strictPort
```

Pare o servidor de desenvolvimento antes do preview na mesma porta. No Network, visite páginas que ainda não foram abertas. O build deve ter chunks de páginas em dist/assets; dependências comuns podem aparecer em chunks compartilhados.

Suspense não trata rejeição do download do módulo. Um produto publicado deve planejar recuperação de chunk ausente e versões antigas em abas abertas, usando estratégia de cache e Error Boundary. Error Boundaries capturam erros de renderização; não substituem catch de HTTP em handlers.
## Conferência antes de avançar

- [ ] Build produz chunks de páginas.
- [ ] Rotas mantêm o comportamento.
- [ ] Fallback de código não elimina loading de dados.

## Prática do estudante

Compare o Network antes e depois de visitar /clientes/novo no preview. Explique por que o servidor de desenvolvimento não é a melhor referência para tamanho final.

## Se algo falhar

Se lazy reclamar de componente inválido, confira o default adaptado. Se chunks antigos derem 404 após deploy, revise cache e retenção de assets antes de alterar React.

Referências: [lazy](https://react.dev/reference/react/lazy) · [Suspense](https://react.dev/reference/react/Suspense).

[← Anterior](32-otimizacao.md) · [Índice](../README.md) · [Próxima →](34-acessibilidade.md)
