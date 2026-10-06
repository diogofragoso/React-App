<!-- Documento: docs/14-cadastro-de-cliente.md -->

# 14 · Cadastrando um cliente

[← Anterior](13-detalhes-do-cliente.md) · [Índice](../README.md) · **Etapa 14 de 36** · [Próxima →](15-estado-dos-formularios.md)

**Ponto de partida:** conclua a conferência do capítulo 13 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Formulário cria contato via POST e retorna à lista.

**Conceitos praticados:** formulário controlado, submit, objetos de entrada, POST, feedback, navegação.

## 1. Separar o que entra e o que sai

ClienteInput tem somente name e email. Cliente inclui id e createdAt gerados pelo servidor. Não envie um Cliente completo no POST: a API rejeita campos extras.

**Arquivo: `src/pages/ClienteNovo/index.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/pages/ClienteNovo/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteNovo/index.tsx
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { Cliente, ClienteInput } from '../../types';

export function ClienteNovo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const input: ClienteInput = { name: name.trim(), email: email.trim().toLowerCase() };
    try {
      await api.post<Cliente>('/clientes', input);
      navigate('/clientes', { replace: true });
    } catch {
      setError('Não foi possível cadastrar. Confira a conexão e se o e-mail já está em uso.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <h1>Cadastrar cliente</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit} aria-busy={submitting}>
        <fieldset disabled={submitting}>
          <legend className="h5">Dados do cliente</legend>
          <label htmlFor="cliente-name">Nome</label>
          <input id="cliente-name" name="name" className="form-control mb-3"
            value={name} required minLength={2} maxLength={100}
            onChange={event => setName(event.target.value)} />
          <label htmlFor="cliente-email">E-mail</label>
          <input id="cliente-email" name="email" type="email" className="form-control mb-3"
            value={email} required maxLength={254}
            onChange={event => setEmail(event.target.value)} />
          <button className="btn btn-primary" type="submit">{submitting ? 'Salvando…' : 'Salvar'}</button>
        </fieldset>
      </form>
    </>
  );
}
```

**Arquivo: `src/pages/Clientes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Clientes/index.tsx -->
```tsx
// Arquivo: src/pages/Clientes/index.tsx
import { useEffect, useState } from 'react';

import axios from 'axios';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Cliente } from '../../types';
import { ClienteCard } from '../../components/ClienteCard';




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
      <Link to="/clientes/novo">Cadastrar cliente</Link>


      {loading && <p role="status">Carregando clientes…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && (
        <ul className="list-unstyled">
          {clientes.map(cliente => (
            <li key={cliente.id} className="mb-3">
              <ClienteCard cliente={cliente} />
            </li>
          ))}
        </ul>
      )}


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
import { ClienteDetalhes } from './pages/ClienteDetalhes';
import { ClienteNovo } from './pages/ClienteNovo';

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
            </Route>
          </Route>
          <Route path="*" element={<p className="container">Página não encontrada.</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 2. Conferir o resultado no servidor

O POST ocorre no evento, não em useEffect. A criação é uma ação solicitada pelo usuário; repetir efeitos em desenvolvimento não deve criar contatos.

Após sucesso, navegar à lista monta novamente sua página e dispara o GET. Assim a interface confirma os dados persistidos no servidor. A rota estática /clientes/novo é selecionada pelo Router em vez de tratada como um id dinâmico.

Não use e-mail real: um contato de estudo único evita conflitos 409.
## Conferência antes de avançar

- [ ] POST envia apenas name e email.
- [ ] Sucesso 201 retorna à lista e exibe o novo contato.
- [ ] Falha mantém os dados e permite tentar novamente.
- [ ] Botão e campos ficam bloqueados durante o envio.

## Prática do estudante

Tente cadastrar o mesmo e-mail duas vezes. Identifique o 409 no Network e explique por que a validação do navegador não consegue detectar duplicidade no banco.

## Se algo falhar

Se /novo virar identificador inválido, confira a Route estática. Se a API rejeitar o payload, confira campos extras e normalização.

Referências: [Aprender React](https://react.dev/learn).

[← Anterior](13-detalhes-do-cliente.md) · [Índice](../README.md) · [Próxima →](15-estado-dos-formularios.md)
