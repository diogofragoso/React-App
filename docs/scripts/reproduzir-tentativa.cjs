// Copia os blocos do material didático, nunca src nem node_modules do projeto.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const name = process.argv[2];
const stage = Number(process.argv[3]);
assert(/^r[1-9]\d*$/.test(name || ''), 'Informe r1, r2 etc.');
assert([1, 2].includes(stage), 'Etapa 1: pasta e package; etapa 2: demais arquivos.');
const destination = path.resolve(root, '..', name);
assert(path.dirname(destination) === path.dirname(root), 'Destino fora da pasta pai.');
const chapters = fs.readdirSync(path.join(root, 'docs/portal')).filter(file => file.endsWith('.md')).sort();
const documents = [...chapters.map(file => 'docs/portal/' + file), 'docs/MANUTENCAO.md'];
if (stage === 1) {
  assert(!fs.existsSync(destination), 'A tentativa já existe; preserve-a e escolha outro número.');
  fs.mkdirSync(destination);
} else {
  assert(fs.existsSync(path.join(destination, 'package.json')), 'Execute primeiro a etapa 1.');
}
const blocks = [];
for (const document of documents) {
  const text = fs.readFileSync(path.join(root, document), 'utf8');
  for (const [, relative, source] of text.matchAll(/<!-- source: ([^\r\n]+) -->\r?\n```[^\r\n]*\r?\n([\s\S]*?)^```\r?\n<!-- endsource -->/gm)) {
    if ((stage === 1) !== (relative === 'package.json')) continue;
    const target = path.resolve(destination, relative);
    assert(target.startsWith(destination + path.sep), 'Caminho inválido.');
    assert(!fs.existsSync(target), 'Não sobrescreva arquivos em uma tentativa: ' + relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, source, 'utf8');
    blocks.push({ document, file: relative, sha256: crypto.createHash('sha256').update(source).digest('hex') });
  }
}
if (stage === 1) fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(destination, 'package-lock.json'));
fs.writeFileSync(path.join(destination, `reproducao-etapa-${stage}.json`), JSON.stringify({ name, stage, files: blocks }, null, 2) + '\n');
console.log(`${name}: etapa ${stage}, ${blocks.length} blocos copiados da documentação para ${destination}`);
