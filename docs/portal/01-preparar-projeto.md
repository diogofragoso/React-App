# 01 · Preparar o projeto

[← Início](../../README.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](02-configuracao.md)

**Etapa 1 de 11.** Use uma cópia existente ou uma pasta de estudo nova e vazia.

**Objetivo:** Instalar as dependências em uma cópia existente ou criar a pasta de estudo com o package.json do portal.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Na cópia existente, preserve seus arquivos e execute na raiz de `React-App`:

```powershell
node --version
npm.cmd --version
npm.cmd ci
```

O lockfile fixa as versões transitivas; `npm ci` reinstala as dependências a partir dele. O Vite e o plugin React instalados declaram Node `^20.19.0 || >=22.12.0`. Esta revisão usa Node 24.11.1; consulte o relatório para os resultados efetivamente obtidos. Os requisitos adicionais do backend devem ser conferidos no projeto da API.

Para implementar do zero, crie uma pasta vazia com outro nome, a partir da pasta pai:

```powershell
New-Item -ItemType Directory React-App-estudo
Set-Location React-App-estudo
```

Não é necessário gerar um template que depois será sobrescrito. Crie o `package.json` abaixo, copie o `package-lock.json` da raiz do repositório de referência e execute `npm.cmd ci`. Se não tiver o lockfile, `npm.cmd install` gera um novo, mas as dependências transitivas podem variar. Nunca escreva um lockfile manualmente. Não copie `node_modules` nem `dist`.

**Arquivo: `package.json`**

<!-- source: package.json -->
```json
{
  "name": "frontendreact",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:prod": "vite --mode production",
    "build": "tsc -b && vite build --mode production",
    "build:local": "tsc -b && vite build --mode development",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "1.20.0",
    "bootstrap": "5.3.8",
    "react": "19.3.0",
    "react-bootstrap": "2.10.10",
    "react-dom": "19.3.0",
    "react-router-dom": "7.18.4"
  },
  "devDependencies": {
    "@types/node": "24.19.0",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.1",
    "oxlint": "1.86.0",
    "typescript": "6.0.3",
    "vite": "8.3.1"
  }
}
```
<!-- endsource -->

React descreve a interface, React DOM a monta no navegador, React Router associa URLs a páginas, Axios comunica com a API e React Bootstrap oferece os componentes visuais. TypeScript verifica os tipos e Vite executa o servidor de desenvolvimento e produz o build. O projeto usa Oxlint, sem configuração de ESLint ou Vitest.

## Conferência antes de avançar

- [ ] A pasta contém package.json e o lockfile de referência.
- [ ] npm.cmd ci concluiu na pasta correta.

[← Início](../../README.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](02-configuracao.md)
