# 02 · Configurar TypeScript e Vite

[← Anterior](01-preparar-projeto.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](03-ambientes.md)

**Etapa 2 de 11.** Conclua o [capítulo 1](01-preparar-projeto.md) antes de continuar.

**Objetivo:** Preparar a compilação e a verificação de código com as configurações reais do projeto.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Os imports ficam completos no capítulo 9. Nesta etapa, confira os arquivos; a execução integrada será feita no capítulo 10.

Copie estes arquivos na raiz. `tsconfig.json` referencia separadamente a aplicação e a configuração Node do Vite. Preserve as opções reais: o projeto usa verificações de imports e variáveis não utilizadas, mas não declara `strict: true`. O build executa `tsc -b` antes do Vite.

**Arquivo: `tsconfig.json`**

<!-- source: tsconfig.json -->
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```
<!-- endsource -->

**Arquivo: `tsconfig.app.json`**

<!-- source: tsconfig.app.json -->
```jsonc
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```
<!-- endsource -->

**Arquivo: `tsconfig.node.json`**

<!-- source: tsconfig.node.json -->
```jsonc
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```
<!-- endsource -->

**Arquivo: `vite.config.ts`**

<!-- source: vite.config.ts -->
```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```
<!-- endsource -->

**Arquivo: `.oxlintrc.json`**

<!-- source: .oxlintrc.json -->
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```
<!-- endsource -->

**Arquivo: `.gitignore`**

<!-- source: .gitignore -->
```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr

# Arquivos de Ambiente (Segurança e Isolamento Local)
.env
.env.local
.env.*.local
*.local

# Permite versionar apenas o modelo de exemplo
!.env.example

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```
<!-- endsource -->

## Conferência antes de avançar

- [ ] Os três tsconfig estão na raiz.
- [ ] vite.config.ts e .oxlintrc.json foram copiados.

[← Anterior](01-preparar-projeto.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](03-ambientes.md)
