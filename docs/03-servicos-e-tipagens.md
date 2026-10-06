<!-- Documento: docs/03-servicos-e-tipagens.md -->

# 03 · Comunicação com a API e tipagens

[← Anterior](02-arquitetura-e-rotas.md) · [Índice](../README.md) · **Etapa 3 de 36** · [Próxima →](04-tela-de-login.md)

**Ponto de partida:** conclua a conferência do capítulo 02 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Cliente HTTP configurado e tipos que correspondem à API construída pelo guia.

**Conceitos praticados:** HTTP, Axios, Promise, interfaces, import type, services, cookies HttpOnly, CORS.

## 1. Confirmar o contrato antes de escrever telas

Use a API **concluída pelo guia de api_t13**, e não presuma que o `src` atual daquele repositório corresponde à documentação. Confira Swagger em `http://localhost:3000/api-docs`.

| Operação | Resposta relevante |
|---|---|
| POST /users | 201, usuário público; cadastro inicial com name, email e password |
| POST /login | 200, objeto com token e user; cookie token HttpOnly |
| GET /users | 200, array contendo apenas a própria conta; usamos para recuperar a sessão |
| POST /logout | 204, sem corpo; limpa cookie |
| GET /clientes | 200, array de contatos compartilhados entre contas autenticadas |
| GET /clientes/:id | 200, cliente |
| POST /clientes | 201, cliente; entrada name e email |
| PUT /clientes/:id | 200, cliente; aceita campos editáveis |
| DELETE /clientes/:id | 204, sem corpo |

`/clientes` depende do capítulo 10 da API. Não há `/me`, `/usuarios/me`, `/auth/login`, role ou paginação no servidor. As falhas usam `{ error }` ou `{ errors: [...] }`, e não `{ message }` na raiz.

## 2. Criar a instância HTTP

**Arquivo: `src/services/api.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/services/api.ts -->
```typescript
// Arquivo: src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000,
});
```

**Arquivo: `src/types/index.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/types/index.ts -->
```typescript
// Arquivo: src/types/index.ts
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}
export interface LoginResponse {
  token: string;
  user: User;
}
export interface Cliente {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}
export interface ClienteInput {
  name: string;
  email: string;
}
export interface ApiError {
  error?: string;
  errors?: { path: string; message: string }[];
}
```

TypeScript confere o código antes da execução; um genérico como `api.get<Cliente[]>` não valida o JSON recebido. Aqui a API é conhecida e testada. Uma API externa ou um contrato sujeito a mudanças pode exigir validação em tempo de execução.

Datas atravessam HTTP como strings JSON; não declare `Date` esperando receber seus métodos do servidor. `id` é numérico neste contrato. Senhas e hashes não fazem parte do usuário público.

## 3. Compreender cookies e Promises

Axios retorna uma Promise: o resultado chega depois. `await` espera aquele resultado sem bloquear todo o navegador. A resposta possui `status` e `data`; `data` é o corpo JSON.

O navegador pode guardar o cookie enviado em Set-Cookie e enviá-lo em pedidos posteriores. `withCredentials` habilita credenciais em requisições entre origens; envio e armazenamento também dependem de CORS e das regras de domínio, SameSite e Secure. Não é uma garantia de que qualquer cookie será enviado.

A API precisa permitir exatamente `http://localhost:5173` e `credentials: true`. Use localhost nos dois servidores. Não misture localhost e 127.0.0.1. JavaScript não lê o cookie HttpOnly. Embora o login também devolva token no JSON, esta trilha ignora esse campo e não o armazena.

Para criar a primeira conta, use POST /users no Swagger com `name`, `email` e uma senha válida segundo o schema da API. Não use dados reais de estudantes.
## Conferência antes de avançar

- [ ] API responde a /health e Swagger apresenta as rotas esperadas.
- [ ] Conta de estudo cadastrada e origem 5173 autorizada.
- [ ] Tipos refletem as respostas e não incluem senha em User.

## Prática do estudante

No Network do navegador, identifique método, URL, status e corpo de uma requisição. Explique por que uma chamada GET para um recurso protegido precisa de cookie, mesmo que não tenha corpo.

## Se algo falhar

404 indica rota incorreta; 401 indica autenticação ausente ou inválida. Erro de CORS pode esconder a resposta do JavaScript; confira a origem no servidor e o Network. Não use wildcard com credenciais.

Referências: [Configuração do Axios](https://axios-http.com/docs/req_config) · [Guia de autenticação da API](../../api_t13/docs/05-autenticacao-com-jwt.md).

[← Anterior](02-arquitetura-e-rotas.md) · [Índice](../README.md) · [Próxima →](04-tela-de-login.md)
