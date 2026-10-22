# Ambientes, cookies e publicação do portal

[Início](../README.md) · [Implementação completa](../README.md#percurso-do-estudante) · [Contrato](CONTRATO-DA-API.md)

Este documento descreve a configuração presente no repositório. Os arquivos completos de configuração e workflow estão no roteiro de implementação. Não houve publicação nem consulta à disponibilidade dos recursos Azure nesta revisão.

## Desenvolvimento e build

| Comando | Modo e configuração |
|---|---|
| `npm.cmd run dev` | Development, `.env.development`, API localhost:3000 |
| `npm.cmd run dev:prod` | Servidor dev em modo production, URL de `.env.production` |
| `npm.cmd run build:local` | Gera `dist` no modo development |
| `npm.cmd run build` | Gera `dist` no modo production |
| `npm.cmd run preview` | Serve `dist`; não troca o ambiente do bundle |

O `.env.example` aponta para produção. Não o copie para `.env.local` supondo que ativará localhost. Prefira `.env.development.local` ou `.env.production.local` para alterações específicas. Variáveis do processo e arquivos locais podem sobrescrever o valor versionado. Reinicie Vite após alterar configuração; para produção, gere e publique outro build.

`VITE_API_URL` é pública e incorporada ao JavaScript. A instância Axios usa fallback localhost:3000, timeout de dez segundos e credenciais. Não há proxy `/api` em `vite.config.ts`. Definir a URL para `/api` sem configurar roteamento e backend compatíveis não reproduz a arquitetura atual.

## Cookie e origens

`POST /login` retorna `{ token, user }` e define o cookie `token`. O frontend usa `user` e ignora o token do JSON. `GET /users` recupera a própria conta por cookie. Logout devolve 204 e remove o cookie; a Home permanece aberta ao sair, enquanto os painéis e Unauthorized navegam para `/login`.

O backend configura `trust proxy: 1`. A função atual `getCookieOptions` usa Secure e SameSite=None ao detectar HTTPS, produção ou origem sem localhost/127.0.0.1; caso contrário usa HTTP local com SameSite=Lax. O nome, path e opções são reutilizados na limpeza. O JWT e o cookie duram 15 minutos. Não existe refresh nem revogação de JWT no logout.

O CORS do Express habilita credenciais e usa `isOriginAllowed`, incluindo as origens de ambiente e subdomínios Azure aceitos pelo código. Confira a origem efetiva do frontend e o cabeçalho `Access-Control-Allow-Origin` no navegador. `withCredentials` e SameSite=None não anulam políticas de bloqueio de cookies de terceiros. HttpOnly protege a leitura do cookie, sem impedir requisições autenticadas por um script injetado; o token também é devolvido em JSON pela API atual.

Uma arquitetura futura com proxy na mesma origem exigiria conferir prefixos, encaminhamento e opções de cookie no servidor. O código atual não implementa automaticamente essa alternativa nem muda para Lax por existir backend vinculado.

## Configuração Azure existente

O workflow `.github/workflows/azure-static-web-apps-green-pond-0f2bcd00f.yml` reage a push e eventos de pull request em `main`. Usa `app_location: '/'`, `api_location: ''` e `output_location: 'dist'`, com um secret de deploy nomeado no arquivo. O build usa o script de produção do package.json. Para outra instalação, configure o recurso e seu secret correspondente; não copie valores de credenciais para arquivos públicos.

`public/staticwebapp.config.json` é copiado pelo Vite para `dist/staticwebapp.config.json`. Há outra cópia na raiz; mantenha ambas iguais. O fallback reescreve navegação para `index.html`, com exclusões para assets e imagens; existem ainda override de 404 e CSP no arquivo atual. Esses cabeçalhos são a configuração existente, não evidência de revisão completa de segurança.

No backend, confira `NODE_ENV`, `FRONTEND_ORIGIN`, `API_ORIGIN`, `DATABASE_URL` e `JWT_SECRET`, conforme sua configuração local. Os dois últimos são exclusivos do servidor. A URL pública da API versionada em `.env.production` não foi acessada nesta revisão.

## Conferência manual após publicar

1. Verifique a URL da API efetivamente embutida no bundle e a resposta de `POST /login` na aba Network.
2. Confirme o armazenamento do cookie HttpOnly no domínio da API e eventuais motivos de bloqueio no navegador.
3. Confira que `GET /users` envia cookie e retorna um array com a própria conta.
4. Abra `/aluno` ou `/professor` diretamente e pressione F5; valide o fallback e a restauração de sessão.
5. Teste isolamento de perfis e logout; confirme a remoção do cookie e o bloqueio após sair.
6. Confira que Local Storage não contém `token` nem `user`.

Build local e inspeção de arquivos não comprovam estes passos. Os defeitos conhecidos do cadastro e do catálogo de perfis estão no [roteiro](../README.md#percurso-do-estudante).
