// Mantém os exemplos do portal idênticos aos arquivos versionados.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const chapters = fs.readdirSync(path.join(root, 'docs/portal'))
  .filter(name => name.endsWith('.md')).sort().map(name => 'docs/portal/' + name);
assert.equal(chapters.filter(name => /\/\d{2}-/.test(name)).length, 11, 'Esperados 11 capítulos do portal.');
const guides = [...chapters, 'docs/MANUTENCAO.md'];
const write = process.argv.includes('--write');
const reconstruct = process.argv.includes('--reconstruir');
const normalize = value => value.replace(/\r\n/g, '\n').trimEnd();
let count = 0;
const covered = new Set();
const documents = guides.map(relative => {
const guide = path.join(root, relative);
const content = fs.readFileSync(guide, 'utf8');
const updated = content.replace(
  /<!-- source: ([^\r\n]+) -->\r?\n```([^\r\n]*)\r?\n[\s\S]*?^```\r?\n<!-- endsource -->/gm,
  (block, relative, language) => {
    const absolute = path.resolve(root, relative);
    assert(absolute.startsWith(root + path.sep), 'Caminho fora do projeto: ' + relative);
    assert(!covered.has(relative), 'Exemplo duplicado: ' + relative);
    covered.add(relative);
    const source = normalize(fs.readFileSync(absolute, 'utf8'));
    const expected = `<!-- source: ${relative} -->\n\x60\x60\x60${language}\n${source}\n\x60\x60\x60\n<!-- endsource -->`;
    if (!write) assert.equal(normalize(block), expected, 'Exemplo divergente: ' + relative);
    count++;
    return expected;
  },
);
return { guide, content, updated };
});
assert(count > 0, 'Nenhum exemplo encontrado.');
// Inclui os arquivos auxiliares para que a reconstrução preserve todo src/public.
function checkDirectory(relative) {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    const file = relative + '/' + entry.name;
    if (entry.isDirectory()) checkDirectory(file);
    else assert(covered.has(file), 'Arquivo ausente no roteiro: ' + file);
  }
}
checkDirectory('src');
checkDirectory('public');
for (const relative of ['package.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json',
  'tsconfig.node.json', 'index.html', '.env.example', '.env.development', '.env.production',
  '.oxlintrc.json', '.gitignore', 'staticwebapp.config.json', 'scripts/test-storage-security.mjs']) {
  assert(covered.has(relative), 'Configuração ausente no roteiro: ' + relative);
}
if (write) for (const document of documents) fs.writeFileSync(document.guide, document.updated, 'utf8');
// Links locais de toda a documentação, incluindo a trilha complementar.
function markdownFiles(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = directory + '/' + entry.name;
    if (entry.isDirectory()) return entry.name.startsWith('.') ? [] : markdownFiles(relative);
    return entry.name.endsWith('.md') ? [relative] : [];
  });
}
const markdown = ['README.md', 'IMPLEMENTACAO.md', ...markdownFiles('docs')];
for (const relative of markdown) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  assert.equal((source.match(/^```/gm) || []).length % 2, 0, 'Bloco sem fechamento: ' + relative);
  for (const [, href] of source.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    assert(fs.existsSync(path.resolve(root, path.dirname(relative), href.split('#')[0])),
      `Link inválido em ${relative}: ${href}`);
  }
}
console.log(`${count} arquivos ${write ? 'sincronizados' : 'idênticos ao código'}; cobertura de src/public e links locais OK.`);
if (reconstruct) {
  // Sempre em uma pasta nova; evita arquivos antigos mascarando omissões do guia.
  fs.mkdirSync(path.join(root, 'node_modules/.tmp'), { recursive: true });
  const snapshot = fs.mkdtempSync(path.join(root, 'node_modules/.tmp/portal-documentado-'));
  const document = documents.map(item => write ? item.updated : item.content).join('\n');
  for (const [, relative, source] of document.matchAll(
    /<!-- source: ([^\r\n]+) -->\r?\n```[^\r\n]*\r?\n([\s\S]*?)^```\r?\n<!-- endsource -->/gm,
  )) {
    const target = path.resolve(snapshot, relative);
    assert(target.startsWith(snapshot + path.sep), 'Destino fora da reconstrução.');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, source);
  }
  fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(snapshot, 'package-lock.json'));
  console.log('Reconstrução criada exclusivamente a partir dos blocos do roteiro: ' + snapshot);
  console.log('As dependências instaladas do repositório serão resolvidas pelas pastas ancestrais.');
}
