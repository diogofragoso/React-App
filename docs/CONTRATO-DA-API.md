<!-- Documento: docs/CONTRATO-DA-API.md -->

# 🔌 Contrato usado pelo frontend

[Índice](../README.md) · [03 · Tipos e HTTP](03-servicos-e-tipagens.md)

A referência é a **API construída seguindo a documentação de api_t13**. A aplicação inicial daquele repositório pode estar em outra etapa. Confira as rotas no Swagger da cópia concluída antes de integrar.

| Verbo e caminho | Entrada | Resposta | Acesso |
|---|---|---|---|
| POST /users | name, email, password | 201, usuário público | Cadastro público |
| POST /login | email, password | 200, token e user; Set-Cookie | Público |
| GET /users | — | 200, array com a própria conta | Autenticado |
| GET /users/:id | — | 200, conta | Somente titular |
| PUT /users/:id | campos editáveis da conta | 200, conta | Somente titular |
| DELETE /users/:id | — | 204 | Somente titular |
| POST /logout | — | 204; remoção do cookie | Política de origem da API |
| GET /clientes | — | 200, Cliente[] | Autenticado |
| GET /clientes/:id | — | 200, Cliente | Autenticado |
| POST /clientes | name, email | 201, Cliente | Autenticado |
| PUT /clientes/:id | name e/ou email | 200, Cliente | Autenticado |
| DELETE /clientes/:id | — | 204 | Autenticado |

Clientes são contatos compartilhados entre contas autenticadas. Não há campo proprietário nem política de administrador nesta trilha.

## Formatos de dados

```json
{
  "id": 1,
  "name": "Conta de estudo",
  "email": "estudo@example.com",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

User e Cliente têm esses campos públicos. Os nomes representam recursos diferentes: cliente não é uma conta e não recebe senha. Datas são strings JSON. ids são inteiros positivos até 2147483647.

A entrada de cliente contém somente name e email. A API normaliza campos e rejeita campos extras, nome fora do limite e e-mail inválido. E-mail duplicado retorna 409.

## Erros e operações

| Status | Interpretação na interface |
|---|---|
| 400 | Entrada inválida; erros de validação ou formato |
| 401 | Credencial ou sessão inválida |
| 403 | Operação/origem não permitida; não equivale a logout |
| 404 | Recurso ou rota inexistente |
| 409 | Conflito, como e-mail já cadastrado |
| 429 | Limite de tentativas; aguardar |
| 500 | Falha interna; permitir diagnóstico e nova tentativa |

O corpo usa error para mensagem geral ou errors com mensagens de validação. Não presuma response.data.message. DELETE e logout não devolvem JSON em 204.

Não há PATCH nesta API; use PUT conforme seu contrato. Não há busca/paginação no servidor; query parameters não criam essas funcionalidades sozinhos.

## Sessão no navegador

O cookie token é HttpOnly, SameSite=Lax, path=/ e Secure em produção. A autenticação dura 15 minutos no guia. withCredentials habilita o uso de credenciais entre origens, mas armazenamento e envio também dependem das políticas do navegador e do servidor.

A origem de desenvolvimento é http://localhost:5173. Mantenha esse host e porta alinhados com a configuração da API. Escritas por cookie exigem origem permitida. O frontend não deve tentar ler o token do cookie.

O login também devolve token em JSON; a trilha ignora esse campo. Logout limpa o cookie e não revoga um JWT copiado previamente. Não existe refresh token neste contrato.

Referências locais: [autenticação](../../api_t13/docs/05-autenticacao-com-jwt.md), [origens e limites](../../api_t13/docs/07-seguranca-e-rate-limit.md), [clientes](../../api_t13/docs/10-automacao-e-geracao-de-codigo.md).
