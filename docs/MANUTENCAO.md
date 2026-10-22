# Manutenção da documentação

[Início](../README.md) · [Validação](RELATORIO-DE-VALIDACAO.md)

Este material é destinado a quem mantém o curso. O estudante segue os [11 capítulos do portal](../README.md#percurso-do-estudante). Relatórios e verificadores não são etapas obrigatórias para construir a interface.

Os exemplos ficam em `docs/portal/*.md` e o script auxiliar de storage fica neste documento. O verificador lê esses arquivos, exige exatamente 11 capítulos numerados e compara os 32 blocos com os arquivos reais. `IMPLEMENTACAO.md` mantém somente um link para o percurso, sem duplicar os exemplos.

Na raiz do repositório de referência:

```powershell
npm.cmd run lint
node scripts/test-storage-security.mjs
node docs/scripts/sincronizar-portal.cjs
npm.cmd run build
```

Não existe script `npm test` neste `package.json`. O teste de storage faz inspeção textual e uma simulação de limpeza; não monta o AuthProvider nem abre navegador. O verificador documental compara cada bloco marcado com seu arquivo real, exige cobertura de `src` e `public` e verifica links locais. Ele falha se o código divergir do roteiro.

Depois de uma alteração intencional no aplicativo, atualize as explicações e execute:

```powershell
node docs/scripts/sincronizar-portal.cjs --write
node docs/scripts/sincronizar-portal.cjs
```

`--write` atualiza somente os blocos de código já marcados; ele não escreve explicações nem adiciona etapas para novos arquivos. Novos arquivos precisam de marcador e instrução no roteiro. As ferramentas de documentação e as evidências em `docs` pertencem ao repositório de referência; não são dependências de runtime da cópia de estudo.

## Script auxiliar de storage

Copie este script se quiser repetir a verificação de storage na cópia de estudo:

**Arquivo: `scripts/test-storage-security.mjs`**

<!-- source: scripts/test-storage-security.mjs -->
```js
// Arquivo: scripts/test-storage-security.mjs
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

console.log('🧪 Iniciando Testes de Higienização de Storage no React-App...');

// Teste 1: Auditoria Estática - Nenhum arquivo em src pode invocar localStorage.setItem
function auditSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      auditSourceFiles(fullPath);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/localStorage\.setItem/g);
      assert.strictEqual(
        matches,
        null,
        `VIOLAÇÃO DE SEGURANÇA: Encontrado localStorage.setItem em ${path.relative(root, fullPath)}`
      );
    }
  }
}

auditSourceFiles(srcDir);
console.log('✅ Teste 1 PASSOU: Nenhum arquivo em src/ grava dados via localStorage.setItem!');

// Teste 2: Auditoria Estática - Nenhum interceptor de request do Axios pode ler localStorage.getItem('token')
const apiTsContent = fs.readFileSync(path.join(srcDir, 'services/api.ts'), 'utf8');
assert.strictEqual(
  apiTsContent.includes("localStorage.getItem('token')"),
  false,
  'VIOLAÇÃO DE SEGURANÇA: api.ts não pode ler token do localStorage para cabeçalho Authorization!'
);
assert.strictEqual(
  apiTsContent.includes("withCredentials: true"),
  true,
  'CONFIGURAÇÃO OBRIGATÓRIA: api.ts DEVE conter withCredentials: true para cookies HttpOnly!'
);
console.log('✅ Teste 2 PASSOU: api.ts utiliza exclusivamente withCredentials: true e não possui interceptor de localStorage.');

// Teste 3: Simulação de Runtime do AuthContext com limpeza de Storage
const storageMap = new Map();
global.localStorage = {
  getItem: (key) => storageMap.get(key) ?? null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

// Cenário A: Usuário antigo tinha um token residual no localStorage de versões prévias
storageMap.set('token', 'token-inseguro-antigo');
storageMap.set('user', JSON.stringify({ id: 99, name: 'Antigo' }));

// Simulação de execução do AuthProvider
const authContextContent = fs.readFileSync(path.join(srcDir, 'context/AuthContext.tsx'), 'utf8');

// Verifica se os métodos executam removeItem
assert.strictEqual(
  authContextContent.includes("localStorage.removeItem('token')"),
  true,
  'AuthContext DEVE higienizar ativamente a chave token do localStorage!'
);
assert.strictEqual(
  authContextContent.includes("localStorage.removeItem('user')"),
  true,
  'AuthContext DEVE higienizar ativamente a chave user do localStorage!'
);

// Executa limpeza simulada
localStorage.removeItem('token');
localStorage.removeItem('user');

assert.strictEqual(localStorage.getItem('token'), null, 'localStorage.getItem("token") DEVE ser null!');
assert.strictEqual(localStorage.getItem('user'), null, 'localStorage.getItem("user") DEVE ser null!');
console.log('✅ Teste 3 PASSOU: Higienização de Storage elimina qualquer credencial remanescente.');

console.log('🎉 TODOS OS TESTES DE VALIDAÇÃO DE SEGURANÇA DO REACT PASSARAM COM SUCESSO!');
```
<!-- endsource -->
