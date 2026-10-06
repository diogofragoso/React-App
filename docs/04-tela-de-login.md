<!-- Documento: docs/04-tela-de-login.md -->

# 04 · Construindo a tela de login

[← Anterior](03-servicos-e-tipagens.md) · [Índice](../README.md) · **Etapa 4 de 36** · [Próxima →](05-contexto-de-autenticacao.md)

**Ponto de partida:** conclua a conferência do capítulo 03 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Login real com formulário controlado, loading e mensagem de falha.

**Conceitos praticados:** useState, eventos, onChange, onSubmit, preventDefault, estado como snapshot, JSX dinâmico, ternário, async/await, try/catch/finally, useNavigate.

## 1. Entender o estado com um campo real

`useState('')` fornece o valor do render atual e uma função para pedir uma atualização. Variáveis comuns não preservam a memória entre renders e atribuir `email = ...` não pede uma nova renderização.

Em um campo controlado, `value` vem do estado e `onChange` atualiza esse estado. Cada digitação agenda uma nova renderização. O valor do render atual continua sendo um snapshot: chamar o setter não modifica retroativamente a variável daquela execução.

Hooks precisam ser chamados no topo do componente ou de outro Hook, nunca dentro de if, loops ou handlers. O handler pode **usar** o setter criado pelo Hook.

## 2. Implementar o envio

**Arquivo: `src/pages/Login/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Login/index.tsx -->
```tsx
// Arquivo: src/pages/Login/index.tsx
import { useState } from 'react';
import type { SubmitEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form } from 'react-bootstrap';
import { api } from '../../services/api';
import type { ApiError, LoginResponse } from '../../types';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await api.post<LoginResponse>('/login', { email, password });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = axios.isAxiosError<ApiError>(err)
        ? err.response?.data.error ?? 'Não foi possível entrar. Confira a conexão e as credenciais.'
        : 'Ocorreu um erro inesperado.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 480 }}>
      <h1>Entrar no sistema</h1>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <Form onSubmit={handleSubmit} aria-busy={loading}>
        <Form.Group className="mb-3" controlId="login-email">
          <Form.Label>E-mail</Form.Label>
          <Form.Control type="email" autoComplete="username" value={email}
            onChange={event => setEmail(event.target.value)} required disabled={loading} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="login-password">
          <Form.Label>Senha</Form.Label>
          <Form.Control type="password" autoComplete="current-password" value={password}
            onChange={event => setPassword(event.target.value)} required disabled={loading} />
        </Form.Group>
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </Form>
    </main>
  );
}
```

## 3. Seguir uma tentativa de login

1. Digitar chama onChange; o estado fornece o próximo value.
2. Enter ou clique no botão chama onSubmit.
3. preventDefault evita a submissão HTML que recarregaria a página.
4. loading desabilita campos e botão; o ternário troca o texto.
5. await espera POST /login; catch trata falhas e finally libera o formulário.
6. navigate muda a rota após sucesso; replace evita voltar para o login pelo histórico imediato.

Passe `onSubmit={handleSubmit}`, sem executar a função durante o render. `err: unknown` exige identificar o erro antes de acessar campos, evitando `any`.

> **Nota sobre tipagem no React 19:** Usamos `SubmitEvent<HTMLFormElement>` para tipar o evento de submissão do formulário. O antigo tipo `FormEvent` foi descontinuado (`@deprecated`) nas definições do React 19 porque no DOM nativo o evento disparado no envio é especificamente um `SubmitEvent`.

Nesta etapa, o cookie foi solicitado ao navegador, mas nenhuma memória global conhece o usuário. A Home ainda é pública. O capítulo seguinte liga o resultado do login ao estado compartilhado.
## Conferência antes de avançar

- [ ] Senha incorreta exibe mensagem e mantém o formulário acessível.
- [ ] Login válido envia /login e navega para /.
- [ ] Botão bloqueia durante a requisição; Enter também envia.
- [ ] Não há token em localStorage ou sessionStorage.

## Prática do estudante

Use o throttling de rede no DevTools e observe o texto do botão. Explique por que loading e error são estados distintos e por que a senha nunca deve aparecer em um console.log.

## Se algo falhar

Se ocorrer 400, confira nomes email/password e a validação da API. Se a interface sempre mostra mensagem genérica, confira o campo error no contrato. Um status 200 não comprova sozinho que o cookie foi aceito: a recuperação da sessão verificará isso.

Referências: [State como snapshot](https://react.dev/learn/state-as-a-snapshot) · [Eventos](https://react.dev/learn/responding-to-events) · [Regras dos Hooks](https://react.dev/reference/rules/rules-of-hooks).

[← Anterior](03-servicos-e-tipagens.md) · [Índice](../README.md) · [Próxima →](05-contexto-de-autenticacao.md)
