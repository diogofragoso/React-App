# 04 · Definir os tipos e a comunicação HTTP

[← Anterior](03-ambientes.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](05-autenticacao.md)

**Etapa 4 de 11.** Conclua o [capítulo 3](03-ambientes.md) antes de continuar.

**Objetivo:** Descrever os dados da sessão e criar a instância Axios compartilhada.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Crie `src/types/index.ts` e `src/services/api.ts`. Use `import type` para tipos. O diretório do contexto será `context`, no singular.

**Arquivo: `src/types/index.ts`**

<!-- source: src/types/index.ts -->
```ts
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
  userTypeId?: number;
  role?: string;
}

export interface LoginResponse {
  token?: string;
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
  message?: string;
  errors?: { path: string; message: string }[];
}

export interface CreateUserInput {
  name?: string;
  email: string;
  password: string;
  userTypeId: number;
}

export interface UserTypeOption {
  id: number;
  code: string;
  name: string;
}
```
<!-- endsource -->

`LoginCredentials` descreve a entrada do login. `CreateUserInput` inclui `userTypeId`, escolhido no cadastro. `User.role` é opcional no TypeScript, mas é necessário para acessar os painéis. A API pode retornar `name: null` quando o nome é omitido; o tipo atual declara `name: string`, uma divergência existente. As telas usam `name || email`. `Cliente`, `ClienteInput`, `ApiError` e `UserTypeOption` são tipos presentes no arquivo, sem CRUD ou carregamento dinâmico de perfis nas telas atuais.

**Arquivo: `src/services/api.ts`**

<!-- source: src/services/api.ts -->
```ts
// src/services/api.ts
import axios from 'axios';

// Obtém a URL da API a partir da variável de ambiente VITE_API_URL (ou usa localhost como fallback)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Cria uma instância do Axios com configurações dinâmicas de ambiente
export const api = axios.create({
  baseURL: API_BASE_URL,
  
  // ESSENCIAL PARA HTTP-ONLY COOKIES:
  // Envia cookies automaticamente (incluindo o JWT HttpOnly) em todas as requisições
  // tanto em ambiente local quanto em requisições cross-domain no Azure.
  withCredentials: true,
  timeout: 10000,
});

// Interceptor de Resposta: captura erros 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou não autorizada na API:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);
```
<!-- endsource -->

O Axios lê `VITE_API_URL` e usa localhost:3000 como fallback. `withCredentials: true` permite credenciais nas requisições entre origens e o timeout é de dez segundos. O interceptor de 401 apenas registra um aviso e rejeita o erro; ele não limpa o Context nem redireciona o usuário. O código não cria cabeçalho Bearer a partir de storage.

## Conferência antes de avançar

- [ ] src/types/index.ts e src/services/api.ts existem.
- [ ] Você identificou onde withCredentials e o timeout são configurados.

[← Anterior](03-ambientes.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](05-autenticacao.md)
