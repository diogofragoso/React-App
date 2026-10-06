// Arquivo: docs/scripts/validar-guia.cjs
// Confere Markdown e reconstrói os exemplos sem alterar src da aplicação.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const docs = path.join(root, 'docs');
const snapshot = path.join(docs, '.validacao/projeto');
const output = path.join(docs, 'evidencias/validacao-estatica.json');
const limitArg = process.argv.find(value => value.startsWith('--ate='));
const limit = limitArg ? Number(limitArg.slice(6)) : 36;
const chapters = fs.readdirSync(docs).filter(name => /^\d{2}-.+\.md$/.test(name))
  .sort().filter(name => Number(name.slice(0, 2)) <= limit);
if (!chapters.length) throw new Error('Nenhum capítulo encontrado.');
fs.mkdirSync(snapshot, { recursive: true });
const report = { type: 'verificacao-estatica', chapters: [], links: [], files: [] };
const assembled = new Map();

for (const name of chapters) {
  const content = fs.readFileSync(path.join(docs, name), 'utf8');
  const blocks = [...content.matchAll(/<!-- file: ([^\n]+) -->\r?\n\x60\x60\x60[^\n]*\r?\n([\s\S]*?)\r?\n\x60\x60\x60/g)];
  for (const [, relative, source] of blocks) {
    const target = path.resolve(snapshot, relative);
    if (!target.startsWith(snapshot + path.sep)) throw new Error('Caminho inválido: ' + relative);
    assembled.set(relative, source + '\n');
  }
  for (const [relative, source] of assembled) {
    const target = path.join(snapshot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, source);
  }
  // Cada programa usa somente os exemplos acumulados até aquele capítulo.
  const files = [...assembled.keys()].filter(value => /^src\/.+\.tsx?$/.test(value))
    .map(value => path.join(snapshot, value));
  const options = {
    target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
    lib: ['lib.es2023.d.ts', 'lib.dom.d.ts'], types: ['vite/client'],
    noEmit: true, strict: true, skipLibCheck: true,
    noUnusedLocals: true, noUnusedParameters: true, allowImportingTsExtensions: true,
  };
  const host = ts.createCompilerHost(options);
  const originalExists = host.fileExists.bind(host);
  const knownFiles = new Set([...assembled.keys()].map(value => path.resolve(snapshot, value)));
  host.fileExists = name => {
    const absolute = path.resolve(name);
    if (absolute.startsWith(snapshot + path.sep) && /\.[cm]?tsx?$/.test(absolute)
        && !absolute.includes(path.sep + 'node_modules' + path.sep)) {
      return knownFiles.has(absolute);
    }
    return originalExists(name);
  };
  const program = ts.createProgram(files, options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => {
    const location = diagnostic.file && diagnostic.start !== undefined
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start) : null;
    return {
      file: diagnostic.file ? path.relative(snapshot, diagnostic.file.fileName) : null,
      line: location ? location.line + 1 : null,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    };
  });
  report.chapters.push({ name, files: files.length, errors: diagnostics });
  console.log(name + ': ' + (diagnostics.length ? diagnostics.length + ' erro(s)' : 'TypeScript OK'));
}
for (const name of ['../README.md', ...fs.readdirSync(docs).filter(value => value.endsWith('.md'))]) {
  const absolute = path.resolve(docs, name);
  const content = fs.readFileSync(absolute, 'utf8');
  const fences = content.match(/^\x60\x60\x60/gm) ?? [];
  if (fences.length % 2 !== 0) report.links.push({ name, error: 'Bloco de código sem fechamento.' });
  for (const [, href] of content.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const target = path.resolve(path.dirname(absolute), href.split('#')[0]);
    if (!fs.existsSync(target)) report.links.push({ name, href });
  }
}
report.files = [...assembled.keys()];
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
if (report.chapters.some(chapter => chapter.errors.length) || report.links.length) process.exitCode = 1;
console.log('Evidência: docs/evidencias/validacao-estatica.json');
