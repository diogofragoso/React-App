# Portal Acadêmico — React, TypeScript e Vite

Este projeto implementa Home pública, login, cadastro de aluno/professor em modal, restauração de sessão por cookie HttpOnly e duas áreas com acesso por perfil. Disciplinas, notas e turmas dos painéis são conteúdo estático.

Para construir o projeto do zero, siga o percurso abaixo na ordem. Cada capítulo explica o objetivo, apresenta os arquivos completos e termina com uma conferência. Os exemplos correspondem ao código atual do portal.

## Percurso do estudante

Antes de começar, tenha Node.js e npm instalados e uma pasta nova para o estudo. Vite e o plugin React instalados declaram Node `^20.19.0 || >=22.12.0`; a revisão foi executada com Node 24.11.1. A API exige preparação própria, indicada no capítulo 10. Os comandos usam PowerShell e `npm.cmd` para evitar bloqueios de `npm.ps1`; em outros terminais, use os equivalentes com `npm`.

| Etapa | Capítulo | O que você vai construir |
|---|---|---|
| 01 | [Preparar o projeto](docs/portal/01-preparar-projeto.md) | Pasta de estudo, dependências e lockfile |
| 02 | [Configurar TypeScript e Vite](docs/portal/02-configuracao.md) | Compilação, lint e configuração do projeto |
| 03 | [Configurar os ambientes](docs/portal/03-ambientes.md) | URLs da API para desenvolvimento e produção |
| 04 | [Tipos e comunicação HTTP](docs/portal/04-tipos-e-api.md) | Interfaces TypeScript e cliente Axios |
| 05 | [Sessão com Context](docs/portal/05-autenticacao.md) | Login, restauração, logout e useAuth |
| 06 | [Rotas protegidas](docs/portal/06-rotas-protegidas.md) | Acesso por autenticação e perfil |
| 07 | [Home, login e cadastro](docs/portal/07-paginas-publicas.md) | Páginas públicas e modal de cadastro |
| 08 | [Painéis por perfil](docs/portal/08-paineis.md) | Áreas de aluno e professor |
| 09 | [Rotas e entrada da aplicação](docs/portal/09-compor-aplicacao.md) | Composição das páginas e montagem no navegador |
| 10 | [Integração local](docs/portal/10-integracao-local.md) | API, cookies e conferência no navegador |
| 11 | [Build e publicação](docs/portal/11-build-e-publicacao.md) | Artefato dist e configuração de hospedagem |

Os caminhos dos arquivos partem da raiz do frontend. Crie as subpastas indicadas e copie cada arquivo completo. Os imports ficam completos ao final do capítulo 9; a execução integrada acontece no capítulo 10. Não misture arquivos da trilha complementar de clientes com os do portal.

Os limites existentes no código são explicados nos capítulos correspondentes, incluindo a preparação da tabela `public.tipo_user` na API antes do cadastro. Leia essas observações antes dos testes manuais.

## Executar uma cópia existente

Se o código já está completo, execute na raiz de `React-App`:

```powershell
node --version
npm.cmd --version
npm.cmd ci
npm.cmd run dev -- --port 5173 --strictPort
```

O desenvolvimento usa a API em `http://localhost:3000`. Prepare o [projeto Express](../express.js_API/README.md) e confira o [contrato](docs/CONTRATO-DA-API.md). O cadastro exige "1" (aluno) e "2" (professor) em `tipo_user`; os IDs são resolvidos pelo backend.

## Referências para consulta

| Documento | Uso |
|---|---|
| [Contrato da API](docs/CONTRATO-DA-API.md) | Entradas, respostas, perfis e cookies conferidos no backend local |
| [Ambientes e publicação](docs/GUIA-DEPLOY-AZURE-COOKIES.md) | Configuração existente de desenvolvimento, produção e Azure |
| [Trilha complementar de clientes](docs/TRILHA-CLIENTES.md) | 36 capítulos de uma aplicação diferente, preservados para estudo |

## Comandos da aplicação

| Comando real | Resultado |
|---|---|
| `npm.cmd run dev` | Vite no modo development, API de `.env.development` |
| `npm.cmd run dev:prod` | Servidor de desenvolvimento usando `.env.production` |
| `npm.cmd run build` | TypeScript e build de produção em `dist` |
| `npm.cmd run build:local` | TypeScript e build no modo development em `dist` |
| `npm.cmd run preview` | Servir o último build, sem mudar sua URL de API |
| `npm.cmd run lint` | Oxlint |
| `node scripts/test-storage-security.mjs` | Inspeção estática e simulação de limpeza de storage |

Não existe script `npm test` neste projeto. Os testes Vitest dos capítulos antigos pertencem à trilha complementar. O frontend ignora o JWT do JSON de login e usa o cookie; não grava token nem usuário em Local Storage.

## Material para quem mantém o curso

O [guia de manutenção](docs/MANUTENCAO.md) explica os verificadores e a atualização dos exemplos. O [relatório de validação](docs/RELATORIO-DE-VALIDACAO.md) registra resultados e limites. Esses materiais apoiam a revisão do curso e não são etapas obrigatórias para o estudante construir a aplicação.

## Cadastro por código de tipo

Envie `POST /users` com `Content-Type: application/json`:

```json
{"name":"João Silva","email":"joao@example.com","password":"MinhaSenha123","userTypeCode":"1"}
```

`userTypeCode` aceita `"1"` (aluno, padrão) ou `"2"` (professor). O backend consulta `tipo_user.code` e salva o ID correspondente. `userTypeId` no cadastro é rejeitado. Tipo ausente no catálogo retorna 400; sucesso retorna 201 com `userTypeId`, `userTypeCode` e `role`, sem senha. A atualização de conta não permite trocar o tipo. O script `src/scripts/init-rbac.ts` do backend prepara os códigos textuais "1" (aluno), "2" (professor) e "3" (admin), preservando IDs existentes. O código "3" (admin) não é aceito no cadastro público. Exemplos que omitem o tipo usam "1" (aluno).
