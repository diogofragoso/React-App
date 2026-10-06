// Arquivo: docs/scripts/registrar-build.cjs
// Registra um build já executado na reconstrução isolada.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const stage = path.join(root, 'docs/.validacao/projeto');
const evidence = path.join(root, 'docs/evidencias');
const statics = JSON.parse(fs.readFileSync(path.join(evidence, 'validacao-estatica.json'), 'utf8'));
if (!fs.existsSync(path.join(stage, 'dist/index.html'))) throw new Error('Execute o build antes de registrar.');
function record(relative) {
  const content = fs.readFileSync(path.join(stage, relative));
  return { file: relative.replaceAll('\\', '/'), bytes: content.length,
    sha256: crypto.createHash('sha256').update(content).digest('hex') };
}
function walk(relative) {
  return fs.readdirSync(path.join(stage, relative), { withFileTypes: true }).flatMap(entry => {
    const name = path.join(relative, entry.name);
    return entry.isDirectory() ? walk(name) : [record(name)];
  });
}
const build = {
  kind: 'build-verificado', node: process.version,
  command: 'npm exec --yes --package=node@24.15.0 -- npm run build',
  source: statics.files.map(record),
  artifacts: walk('dist'),
};
fs.writeFileSync(path.join(evidence, 'build.json'), JSON.stringify(build, null, 2) + '\n');
const environmentPath = path.join(evidence, 'ambiente.json');
const environment = JSON.parse(fs.readFileSync(environmentPath, 'utf8'));
environment.hostNode = environment.hostNode ?? environment.node;
environment.node = process.version;
environment.npm = '11.12.1';
fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2) + '\n');
const testsPath = path.join(evidence, 'testes.json');
const tests = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
for (const result of tests.testResults ?? []) {
  if (path.isAbsolute(result.name)) result.name = path.relative(stage, result.name).replaceAll('\\', '/');
}
fs.writeFileSync(testsPath, JSON.stringify(tests, null, 2) + '\n');
console.log('Build e ambiente registrados; caminhos locais normalizados no relatório dos testes.');
