<!-- Documento: docs/29-variaveis-de-ambiente.md -->

# 29 · Variáveis de ambiente

[← Anterior](28-erros-http-globais.md) · [Índice](../README.md) · **Etapa 29 de 36** · [Próxima →](30-revisao-da-arquitetura.md)

**Ponto de partida:** conclua a conferência do capítulo 28 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

URL da API vem do ambiente do Vite e permanece pública.

**Conceitos praticados:** env, import.meta.env, modos, tipos, build versus runtime, configuração pública.

## 1. Criar modelos públicos de configuração

Variáveis VITE_ são embutidas no JavaScript entregue ao navegador. Nunca coloque JWT_SECRET, senha de banco ou credenciais privadas nelas.

**Arquivo: `.env.example`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: .env.example -->
```dotenv
VITE_API_URL=http://localhost:3000
```

**Arquivo: `src/vite-env.d.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/vite-env.d.ts -->
```typescript
// Arquivo: src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Arquivo: `src/services/api.ts`**

Substitua todo o conteúdo.

<!-- file: src/services/api.ts -->
```typescript
// Arquivo: src/services/api.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.trim();
if (!baseURL) throw new Error('Defina VITE_API_URL no arquivo .env e reinicie o Vite.');

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});
```

## 2. Configurar no CMD e reiniciar

```bat
copy .env.example .env
npm run dev -- --port 5173 --strictPort
```

Se .env já existir, edite-o em vez de substituí-lo. Acrescente este **trecho** ao `.gitignore` gerado, preservando as regras existentes. O template Vite não necessariamente ignora `.env`:

```gitignore
.env
.env.*
!.env.example
```

Mantenha `.env.example` versionado e use o ambiente do build para valores de produção.

Vite lê o ambiente ao iniciar. Reinicie após alterações. O build usa o valor disponível naquele momento; trocar uma variável no servidor depois de enviar dist não reconfigura o JavaScript já produzido.

Em produção, configure a origem HTTPS real da API e alinhe CORS. Cookie SameSite=Lax deste backend pede uma topologia compatível: preferencialmente frontend e API no mesmo site ou API exposta por proxy. Origens em sites distintos exigem revisar cookies e defesa contra CSRF na API.
## Conferência antes de avançar

- [ ] Cliente HTTP não fixa localhost no código.
- [ ] Variável ausente causa diagnóstico claro.
- [ ] Reiniciar muda a URL efetiva.
- [ ] Nenhum segredo aparece em VITE_.

## Prática do estudante

Compare .env de frontend e backend. Explique por que o mesmo nome 'ambiente' não torna ambos privados.

## Se algo falhar

Se import.meta.env retornar undefined, confira prefixo VITE_, raiz do arquivo e reinício. Se o build apontar para localhost, confira configuração no momento de construir.

Referências: [Ambiente e modos no Vite](https://vite.dev/guide/env-and-mode).

[← Anterior](28-erros-http-globais.md) · [Índice](../README.md) · [Próxima →](30-revisao-da-arquitetura.md)
