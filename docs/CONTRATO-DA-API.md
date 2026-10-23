# Contrato de integração do Portal Acadêmico

[Início](../README.md) · [Implementação](../README.md#percurso-do-estudante) · [Cookies e publicação](GUIA-DEPLOY-AZURE-COOKIES.md)

Contrato conferido por leitura de rotas, controllers, services e schemas do projeto vizinho [express.js_API](../../express.js_API/README.md), em 21 de outubro de 2026. Não é resultado de requisições contra banco ou ambiente publicado. As rotas atuais não têm prefixo `/api`.

| Operação usada pelo portal | Entrada | Sucesso | Uso no React |
|---|---|---|---|
| `POST /users` | `name?`, `email`, `password`, `userTypeCode` | 201, usuário público | Modal de cadastro |
| `POST /login` | `email`, `password` | 200, `{ token, user }` e `Set-Cookie` | `AuthContext.login` |
| `GET /users` | Cookie válido | 200, array contendo somente a própria conta | Restauração de sessão, elemento `[0]` |
| `POST /logout` | Sem corpo obrigatório | 204, limpeza do cookie | `AuthContext.logout` |

Cadastro não autentica automaticamente. `userTypeCode` aceita `"1"` (aluno) ou `"2"` (professor), com padrão `"1"`. O backend resolve o ID por `tipo_user.code`; tipo ausente retorna 400. O nome é opcional; quando informado deve ter de 2 a 100 caracteres após trim. O e-mail é normalizado para minúsculas, validado e limitado a 254 caracteres. A senha deve ter ao menos oito caracteres e até 72 bytes UTF-8. O schema rejeita campos extras.

Exemplo de cadastro:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha-de-estudo",
  "userTypeCode": "1"
}
```

Exemplo de usuário público; IDs e datas são ilustrativos:

```json
{
  "id": 1,
  "name": "Maria Silva",
  "email": "maria@example.com",
  "createdAt": "2026-10-21T12:00:00.000Z",
  "userTypeId": 2,
  "userTypeCode": "1",
  "role": "aluno"
}
```

`name` pode ser `null` quando omitido, embora o tipo atual do frontend declare `string`. `toPublicUser` consulta o tipo pelo ID salvo e retorna `userTypeCode` e `role` mapeado pelo código ("1" → aluno, "2" → professor, "3" → admin), independentemente do ID. O frontend usa `role`, sem derivá-lo de `userTypeId`. Admin não possui painel nem permissão especial nas rotas React.

O modal envia códigos. O script `src/scripts/init-rbac.ts` prepara os códigos textuais "1" (aluno), "2" (professor) e "3" (admin), preservando IDs existentes.

## Sessão e permissões

O cookie `token` tem `httpOnly: true`, `path: '/'` e duração de 15 minutos. O JWT também expira em 15 minutos, não tem refresh token e contém ID de usuário; o perfil é montado a partir da conta no servidor. O middleware confirma que a conta existe.

Em `getCookieOptions`, HTTPS, `x-forwarded-proto: https`, `NODE_ENV=production` ou origem sem `localhost`/`127.0.0.1` ativam `secure: true` e `sameSite: 'none'`. Em HTTP local sem essas condições, usa `secure: false` e `sameSite: 'lax'`. Essa é a heurística implementada, não um teste geral de igualdade de sites. Linked backend não altera automaticamente essa função para Lax.

O Axios usa `withCredentials: true`, sem garantir que o navegador aceite o cookie. O CORS habilita credenciais e reflete origens aceitas por `isOriginAllowed`: as configuradas e subdomínios HTTPS de `azurestaticapps.net` e `azurewebsites.net`. Escritas autenticadas por cookie exigem Origin permitido. A API também aceita Bearer, mas o portal usa somente cookie.

HttpOnly impede leitura do cookie por JavaScript; o JWT continua presente no JSON de login, embora o aplicativo o ignore. HttpOnly não impede scripts injetados de fazer requisições autenticadas. Logout apaga o cookie com as mesmas opções; não revoga cópias do JWT emitido.

`ProtectedRoute` separa as telas por perfil. O backend verifica autenticação e titularidade nas operações de conta; não há endpoints acadêmicos para disciplinas ou notas. `/unauthorized` é uma página React, sem emissão de status HTTP 403 pelo componente.

## Erros

| Status | Significado |
|---|---|
| 400 | JSON ou campos inválidos; `{ error }` ou `{ errors: [{ path, message }] }` |
| 401 | Credenciais, token ou sessão inválidos |
| 403 | Origem ou operação sobre conta alheia não permitida |
| 404 | Conta ou rota inexistente |
| 409 | E-mail duplicado |
| 413 | Corpo da requisição muito grande |
| 429 | Limite de requisições/tentativas |
| 500 | Erro interno |

Login e cadastro também tentam ler `message` por compatibilidade, mas a API local usa `error` ou `errors`. Respostas 204 não têm JSON. O interceptor React somente avisa no console ao receber 401; não expira o Context automaticamente.

## Outras operações da API

`GET`, `PUT` e `DELETE /users/:id` exigem titularidade. Existem ainda `GET`/`POST /clientes` e `GET`/`PUT`/`DELETE /clientes/:id` para contas autenticadas. O portal não chama essas rotas. A [trilha complementar](TRILHA-CLIENTES.md) as utiliza em outra aplicação; não há PATCH nem paginação do servidor.

Fontes locais: [rotas](../../express.js_API/src/routes/user.route.ts), [schema](../../express.js_API/src/schemas/user.schema.ts), [usuário público](../../express.js_API/src/services/user.service.ts), [cookies](../../express.js_API/src/controllers/auth.controller.ts), [autenticação](../../express.js_API/src/middlewares/auth.middleware.ts) e [origens](../../express.js_API/src/config/origins.ts).
