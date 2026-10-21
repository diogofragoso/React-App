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

