<!-- Documento: docs/36-build-e-publicacao.md -->

# 36 · Build e publicação

[← Anterior](35-testes-react.md) · [Índice](../README.md) · **Etapa 36 de 36**

**Ponto de partida:** conclua a conferência do capítulo 35 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Frontend é compilado e preparado para publicação com validação de produção.

**Conceitos praticados:** build, dist, preview, variáveis no build, SPA fallback, HTTPS, cookies, deploy.

## 1. Executar as verificações da aplicação construída

```bat
npm ci
npm test
npm run build
```

build executa a conferência TypeScript e gera dist. O guia não afirma que publicar arquivos comprova autenticação. Antes de subir, configure a URL pública da API no ambiente **do build**, não apenas no servidor que servirá HTML.

## 2. Conferir o resultado local

Pare o servidor de desenvolvimento e use a mesma porta autorizada para frontend:

```bat
npm run preview -- --port 5173 --strictPort
```

Preview serve o build para conferência local; não é um servidor de produção recomendado. Teste login, F5, listagem, novo cliente, edição, cancelamento e confirmação de exclusão, pesquisa, páginas e logout.

| Verificação | Evidência esperada |
|---|---|
| Login | POST /login, cookie aceito e navegação |
| F5 privado | GET /users confirma a própria conta |
| CRUD | Status corretos e dados persistidos |
| Rotas diretas | /clientes/:id abre após reload |
| Ambiente | Network aponta para API de produção |
| Logout | Cookie removido e visita privada pede login |
| Acessibilidade | Teclado, rótulos, foco e mensagens |

## 3. Configurar a hospedagem escolhida

A hospedagem estática precisa devolver index.html para rotas de navegação como /clientes/10, preservando assets reais e sem redirecionar chamadas da API para HTML. BrowserRouter depende desse fallback. Se a aplicação for publicada em subdiretório, revise base do Vite e basename do Router em conjunto.

Frontend e API devem usar HTTPS em produção. O backend do guia marca cookie Secure nesse ambiente e usa SameSite=Lax. Prefira uma topologia no mesmo site; sites diferentes pedem revisão explícita de cookies, CORS e proteção de escrita.

Mantenha HTML com atualização frequente e assets versionados com hashes. Evite remover imediatamente chunks ainda referenciados por abas abertas de versões anteriores. Planeje tela de recuperação de falhas de carregamento; Suspense sozinho só representa espera.

Esta documentação não executa publicação nem escolhe um provedor. O resultado é um build pronto para revisar e uma lista de validação aplicável à hospedagem que você utilizar.

## 4. Conferir também o material didático

Na raiz de react-project, o verificador documental reconstrói os exemplos em docs/.validacao/projeto e confere TypeScript por etapa:

```bat
node docs\scripts\validar-guia.cjs
```

Ele não altera src e não testa um banco. Consulte o [relatório de validação](RELATORIO-DE-VALIDACAO.md) para conhecer o que foi efetivamente executado nesta revisão.
## Conferência antes de avançar

- [ ] Testes e build da aplicação construída passam.
- [ ] Preview permite a sequência completa.
- [ ] Servidor escolhido oferece fallback da SPA.
- [ ] Origens, cookies e HTTPS estão alinhados.
- [ ] Limites de validação foram registrados.

## Prática do estudante

Escreva uma lista de pós-publicação com URLs e resultados esperados. Teste abrir uma rota privada diretamente em outra aba, sem passar pela Home.

## Se algo falhar

404 somente após F5 costuma indicar falta de fallback. API recebendo HTML indica regra de proxy/fallback incorreta. Cookie recusado em HTTPS pede revisar domínio, SameSite, Secure e origem.

Referências: [Publicação com Vite](https://vite.dev/guide/static-deploy.html) · [Variáveis de ambiente](https://vite.dev/guide/env-and-mode).

[← Anterior](35-testes-react.md) · [Índice](../README.md)
