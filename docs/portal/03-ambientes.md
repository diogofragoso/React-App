# 03 · Configurar os ambientes

[← Anterior](02-configuracao.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](04-tipos-e-api.md)

**Etapa 3 de 11.** Conclua o [capítulo 2](02-configuracao.md) antes de continuar.

**Objetivo:** Escolher a URL da API para desenvolvimento e produção antes de criar o cliente HTTP.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

`dev` usa o modo development; `dev:prod` usa production, mas continua sendo um servidor de desenvolvimento. `build` gera `dist` no modo production; `build:local` gera `dist` no modo development. `preview` apenas serve o build já gerado, sem trocar sua URL de API.

**Arquivo: `.env.development`**

<!-- source: .env.development -->
```dotenv
# Ambiente de Desenvolvimento Local
# Aponta as requisições do front-end para a API Express rodando no localhost:3000
VITE_API_URL=http://localhost:3000
```
<!-- endsource -->

**Arquivo: `.env.production`**

<!-- source: .env.production -->
```dotenv
# Ambiente de Produção (Nuvem - Azure App Service)
# Aponta as requisições do front-end para a API Express hospedada no Azure
VITE_API_URL=https://expresst13-gtazeuceene4a2d4.canadacentral-01.azurewebsites.net
```
<!-- endsource -->

**Arquivo: `.env.example`**

<!-- source: .env.example -->
```dotenv
# Exemplo de variáveis de ambiente para o React (Vite)
# Copie este arquivo para .env.local para customizar localmente sem comitar segredos.

# Local:
# VITE_API_URL=http://localhost:3000

# Produção:
VITE_API_URL=https://expresst13-gtazeuceene4a2d4.canadacentral-01.azurewebsites.net
```
<!-- endsource -->

O `.env.example` aponta para a nuvem. Copiá-lo diretamente para `.env.local` altera também o desenvolvimento local. Para personalizar somente o desenvolvimento, crie `.env.development.local` com `VITE_API_URL=http://localhost:3000`; para produção, use `.env.production.local` com a URL desejada. Variáveis já definidas no ambiente do processo têm prioridade; arquivos `.local` também podem sobrescrever os arquivos versionados. Reinicie o Vite após alterações e gere outro build para modificar `dist`.

Toda variável `VITE_*` utilizada pelo frontend é pública. Senha do banco e `JWT_SECRET` pertencem à API. A URL versionada é configuração de referência, sem comprovação de disponibilidade nesta revisão.

## Conferência antes de avançar

- [ ] Você identificou a URL usada pelo modo development.
- [ ] Nenhuma variável VITE contém segredo do backend.

[← Anterior](02-configuracao.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](04-tipos-e-api.md)
