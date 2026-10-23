// Ferramentas isoladas: playwright-core e embedded-postgres (veja MANUTENCAO.md).
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const toolsDir = path.join(root, 'node_modules/.tmp/course-validation-tools');
const require = createRequire(path.join(toolsDir, 'package.json'));
const { default: EmbeddedPostgres } = await import(pathToFileURL(require.resolve('embedded-postgres')));
const { chromium } = await import(pathToFileURL(require.resolve('playwright-core')));
const name = process.argv[2];
assert(/^r[1-9]\d*$/.test(name || ''), 'Informe r1, r2 etc.');
const trial = path.resolve(root, '..', name);
const apiRoot = path.resolve(root, '../express.js_API');
const output = path.join(root, 'docs/evidencias', name + '-navegador.json');
const report = { attempt: name, checks: [], failures: [], mockedRequests: false };
const processes = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const secret = crypto.randomBytes(32).toString('hex');
const dbDir = fs.mkdtempSync(path.join(toolsDir, 'postgres-'));
const pg = new EmbeddedPostgres({ databaseDir: dbDir, user: 'course_test', password: secret,
  port: 55432, persistent: true, postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} });
let browser, client;
const check = (name, data = {}) => { report.checks.push({ name, ...data }); console.log('OK: ' + name); };
function start(command, cwd, env = process.env) {
  const child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command], {
    cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const record = { child, command, log: '' };
  child.stdout.on('data', data => { record.log += data; });
  child.stderr.on('data', data => { record.log += data; });
  processes.push(record);
  return record;
}
function stop(record) {
  if (record.child.exitCode === null) spawnSync('taskkill.exe', ['/PID', String(record.child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
}
async function ready(url, record) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    if (record.child.exitCode !== null) throw new Error(record.command + ' encerrou: ' + record.log.slice(-1800));
    await pause(200);
  }
  throw new Error('Servidor não respondeu: ' + url + '\n' + record.log.slice(-1800));
}
async function login(page, email, password) {
  await page.goto('http://localhost:5173/login');
  await page.locator('#formEmail').fill(email);
  await page.locator('#formPassword').fill(password);
  await page.getByRole('button', { name: 'Fazer Login', exact: true }).click();
}
async function openRegister(page) {
  await page.getByRole('button', { name: 'Cadastre-se como Aluno ou Professor' }).click();
}
async function register(page, { email, role = 2, name = 'Conta de estudo' }) {
  await openRegister(page);
  await page.locator('#modalRegName').fill(name);
  await page.locator('#modalRegEmail').fill(email);
  await page.locator('#modalRegPassword').fill('Estudo123!');
  await page.locator('#modalRegUserType').selectOption(String(role));
  const response = page.waitForResponse(response => response.url().endsWith('/users') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar Cadastro' }).click();
  return response;
}
try {
  await pg.initialise(); await pg.start(); await pg.createDatabase('portal_estudo');
  client = pg.getPgClient('portal_estudo', '127.0.0.1'); await client.connect();
  // Schema do backend atual; banco criado exclusivamente para esta tentativa.
  await client.query(`
    CREATE TABLE public.tipo_user (id serial PRIMARY KEY, code text NOT NULL UNIQUE, name text NOT NULL);
    CREATE TABLE public."user" (id serial PRIMARY KEY, "createdAt" timestamptz NOT NULL DEFAULT now(), email text NOT NULL UNIQUE, name text, password text NOT NULL, "userTypeId" integer NOT NULL DEFAULT 2 REFERENCES public.tipo_user(id));
    CREATE TABLE public.cliente (id serial PRIMARY KEY, "createdAt" timestamptz NOT NULL DEFAULT now(), email text NOT NULL UNIQUE, name text NOT NULL);
    CREATE TABLE public.estudante (id serial PRIMARY KEY, created_at timestamp NOT NULL DEFAULT now(), nome_estudante text NOT NULL, email_estudante text NOT NULL);
    CREATE TABLE public.funcionario (id serial PRIMARY KEY, "createdAt" timestamptz NOT NULL DEFAULT now(), name text NOT NULL, email text NOT NULL);
    CREATE TABLE public.tel_cliente (id serial PRIMARY KEY, id_tel_cliente_fk integer NOT NULL REFERENCES public.cliente(id), tel_cliente text NOT NULL);
    CREATE TABLE public.tel_funcionario (id serial PRIMARY KEY, id_tel_funcionario_fk integer NOT NULL REFERENCES public.funcionario(id), tel_funcionario text NOT NULL);
    INSERT INTO public.tipo_user (id,code,name) VALUES (2,'ALUNO','Aluno'),(3,'PROFESSOR','Professor'),(4,'ADMIN','Administrador');
    SELECT setval(pg_get_serial_sequence('public.tipo_user','id'),4,true);
  `);
  check('PostgreSQL real, vazio e isolado', { version: (await client.query('SELECT version()')).rows[0].version });
  const integration = fs.readFileSync(path.join(root, 'docs/portal/10-integracao-local.md'), 'utf8');
  const query = integration.match(/```sql\r?\n([\s\S]*?)\r?\n```/)[1];
  try { const result = await client.query(query); assert(result.rows.length >= 2); check('Consulta de catálogo copiada do capítulo 10'); }
  catch (error) { report.failures.push({ stage: 'capitulo-10-sql', message: error.message, code: error.code }); console.log('FALHA documental SQL: ' + error.message); }
  const api = start('npm.cmd run dev', apiRoot, { ...process.env, NODE_ENV: 'test', PORT: '3000',
    DATABASE_URL: `postgresql://course_test:${secret}@127.0.0.1:55432/portal_estudo`, JWT_SECRET: secret,
    API_ORIGIN: 'http://localhost:3000', FRONTEND_ORIGIN: 'http://localhost:5173' });
  await ready('http://localhost:3000/health', api); check('npm run dev da API respondeu em /health');
  const frontend = start('npm.cmd run dev -- --port 5173 --strictPort', trial);
  await ready('http://localhost:5173', frontend); check('npm run dev do frontend respondeu');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/aluno'); await page.waitForURL('**/login');
  check('Visitante é redirecionado de /aluno para /login');
  assert.equal((await register(page, { email: 'aluno@example.test' })).status(), 201);
  await page.getByText('Conta criada com sucesso!', { exact: false }).waitFor();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  check('Cadastro de aluno pelo modal: POST /users 201');
  await login(page, 'aluno@example.test', 'SenhaIncorreta123!');
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Fazer Login', exact: true }).isEnabled(), true);
  check('Senha inválida mostra erro e permite tentar novamente');
  await login(page, 'aluno@example.test', 'Estudo123!'); await page.waitForURL('**/aluno');
  check('Login de aluno e destino /aluno');
  const cookies = await context.cookies('http://localhost:3000');
  assert(cookies.some(cookie => cookie.name === 'token' && cookie.httpOnly && cookie.sameSite === 'Lax'));
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  assert.equal(await page.evaluate(() => localStorage.getItem('user')), null);
  check('Cookie real HttpOnly/Lax e ausência de token/user em Local Storage');
  const restore = page.waitForResponse(response => response.url().endsWith('/users') && response.request().method() === 'GET' && response.status() === 200);
  await page.reload(); const restored = await (await restore).json(); assert.equal(restored[0].role, 'aluno');
  await page.getByRole('heading', { name: 'Painel do Aluno', exact: false }).waitFor();
  check('F5 restaura sessão por cookie e GET /users retorna o aluno');
  await page.goto('http://localhost:5173/professor'); await page.waitForURL('**/unauthorized');
  check('Aluno não abre painel de professor');
  await page.getByRole('button', { name: 'Trocar de Conta', exact: false }).click(); await page.waitForURL('**/login');
  assert(!(await context.cookies('http://localhost:3000')).some(cookie => cookie.name === 'token'));
  check('Logout remove cookie e volta a /login');
  assert.equal((await register(page, { email: 'professor@example.test', role: 3 })).status(), 201);
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await login(page, 'professor@example.test', 'Estudo123!'); await page.waitForURL('**/professor');
  check('Cadastro e login de professor: destino /professor');
  await page.goto('http://localhost:5173/aluno'); await page.waitForURL('**/unauthorized');
  check('Professor não abre painel de aluno');
  await page.getByRole('button', { name: 'Trocar de Conta', exact: false }).click(); await page.waitForURL('**/login');
  assert.equal((await register(page, { email: 'aluno@example.test' })).status(), 409);
  await page.getByRole('dialog').getByRole('alert').waitFor();
  await pause(200);
  if (!(await page.locator('#modalRegEmail').isEnabled())) {
    report.failures.push({ stage: 'capitulo-07-cadastro-duplicado', message: 'Após HTTP 409, regLoading continua true: campos e botões bloqueados.' });
    check('Falha reproduzida: cadastro duplicado deixa modal bloqueado');
  } else {
    check('Cadastro duplicado mostra erro e libera os campos');
    await page.locator('#modalRegEmail').fill('recuperado@example.test');
    const retry = page.waitForResponse(response => response.url().endsWith('/users') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Confirmar Cadastro' }).click(); assert.equal((await retry).status(), 201);
    await page.getByRole('dialog').waitFor({ state: 'hidden' }); check('Novo envio após erro cria conta sem atualizar a página');
    assert.equal((await register(page, { email: 'semnome@example.test', name: '' })).status(), 201);
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await login(page, 'semnome@example.test', 'Estudo123!'); await page.waitForURL('**/aluno');
    await page.getByText('semnome@example.test', { exact: false }).first().waitFor(); check('Nome opcional aceita null e a tela usa o e-mail');
    await page.goto('http://localhost:5173'); await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await page.getByRole('link', { name: 'Fazer Login / Cadastrar', exact: false }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/'); check('Logout pela Home permanece na Home');
    await page.goto('http://localhost:5173/pagina-inexistente'); await page.getByRole('heading', { name: '404', exact: false }).waitFor();
    check('URL inexistente exibe a página 404');
  }
  await context.close(); await browser.close(); browser = null;
  stop(frontend); await pause(500);
  // Os outros modos são testados sem alterar arquivos da tentativa.
  const prodDev = start('npm.cmd run dev:prod -- --port 5173 --strictPort', trial);
  await ready('http://localhost:5173', prodDev);
  const apiModule = await (await fetch('http://localhost:5173/src/services/api.ts')).text();
  assert(apiModule.includes('https://expresst13-')); check('dev:prod inicia e carrega URL de produção');
  stop(prodDev); await pause(500);
  for (const script of ['build:local', 'build']) {
    const run = start('npm.cmd run ' + script, trial);
    await new Promise((resolve, reject) => { run.child.on('exit', code => code === 0 ? resolve() : reject(new Error(run.log.slice(-2500)))); });
    check('npm run ' + script + ' concluiu');
    assert(fs.existsSync(path.join(trial, 'dist/staticwebapp.config.json'))); check('Configuração SPA incluída em dist: ' + script);
    const preview = start('npm.cmd run preview -- --port 5173 --strictPort', trial);
    await ready('http://localhost:5173', preview);
    assert((await fetch('http://localhost:5173/aluno')).ok); check('preview serve navegação direta: ' + script);
    stop(preview); await pause(500);
  }
  const rows = (await client.query('SELECT email, "userTypeId", name FROM public."user" ORDER BY id')).rows;
  check('Contas persistidas no PostgreSQL real', { accounts: rows });
} catch (error) {
  report.failures.push({ stage: 'execucao', message: error.message });
  console.error(error.stack);
} finally {
  if (browser) await browser.close().catch(() => {});
  for (const record of processes.reverse()) stop(record);
  if (client) await client.end().catch(() => {});
  await pg.stop().catch(error => console.error('Parada do PostgreSQL: ' + error.message));
  report.passed = report.failures.length === 0;
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log('Evidência: ' + output);
}
if (!report.passed) process.exitCode = 1;
