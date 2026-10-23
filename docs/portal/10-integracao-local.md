# 10 · Executar e conferir a integração local

[← Anterior](09-compor-aplicacao.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](11-build-e-publicacao.md)

**Etapa 10 de 11.** Conclua o [capítulo 9](09-compor-aplicacao.md) antes de continuar.

**Objetivo:** Preparar os pré-requisitos da API e verificar login, perfis, cookie e logout no navegador.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Consulte o [projeto Express](../../../express.js_API/README.md) para instalar o backend, configurar PostgreSQL, aplicar seu processo de migrações/contrato e definir `DATABASE_URL` e `JWT_SECRET`. O frontend não cria banco nem tipos de usuário.

Antes de testar cadastro, confira os códigos textuais `"1"` (aluno), `"2"` (professor) e `"3"` (admin) na tabela `public.tipo_user`, mapeada pelo model `UserType` via `@@map("tipo_user")` em `contract.prisma`. O cadastro público aceita somente `"1"` e `"2"`. O backend resolve os IDs e deriva o perfil pelo código, sem exigir IDs fixos. Confira o catálogo no cliente SQL:

```sql
SELECT id, code, name FROM public.tipo_user ORDER BY id;
```

Em um banco de estudo novo, o script `src/scripts/init-rbac.ts` da API prepara os tipos ausentes por código e preserva os IDs existentes. Execute-o no terminal da API com `npx tsx src/scripts/init-rbac.ts` após configurar o banco. Não renumere tipos ou altere referências de contas existentes para reproduzir IDs de exemplos: o cadastro consulta `tipo_user.code` e salva o ID encontrado.

No terminal da API, depois da preparação indicada em seu guia:

```powershell
Set-Location ..\express.js_API
npm.cmd run dev
```

Em outro terminal, na raiz do frontend:

```powershell
npm.cmd run dev -- --port 5173 --strictPort
```

Abra `http://localhost:5173`. A API deve estar em `http://localhost:3000`. Use o mesmo host; não troque apenas um deles por `127.0.0.1`. O backend atual permite localhost:5173 e habilita credenciais no CORS. Em outra origem, confira `FRONTEND_ORIGIN` e a implementação de `src/config/origins.ts` da API. Consulte o [contrato conferido no código](../CONTRATO-DA-API.md) para os formatos das respostas.

Verifique manualmente, com duas contas de teste preparadas em um banco de estudo:

1. Visitante em `/aluno` vê loading e depois `/login`.
2. Login de aluno recebe `role: "aluno"`, cookie e destino `/aluno`.
3. Aluno em `/professor` chega a `/unauthorized`; repita o inverso com professor.
4. F5 no painel dispara `GET /users`, retorna um array de uma conta e restaura o painel se o cookie for aceito.
5. Logout bem-sucedido devolve 204, remove cookie e impede retorno ao painel sem autenticação. Sair pela Home mantém a Home; os painéis e Unauthorized navegam para `/login`.
6. Em DevTools, confira o cookie HttpOnly no domínio da API e ausência de `token`/`user` em Local Storage. Não cole credenciais ou tokens em evidências compartilhadas.
7. Cadastre e-mail novo e depois tente cadastrar o mesmo e-mail novamente: a primeira tentativa deve exibir confirmação e fechar o modal; a segunda deve exibir o erro de conflito (409) mantendo os campos liberados para correção. Sucesso de build não comprova esses cenários.

## Conferência antes de avançar

- [ ] API e frontend usam localhost nas portas combinadas.
- [ ] Você conferiu o catálogo de perfis antes do cadastro.
- [ ] Você executou a conferência manual descrita neste capítulo.

[← Anterior](09-compor-aplicacao.md) · [Índice](../../README.md#percurso-do-estudante) · [Próxima →](11-build-e-publicacao.md)
