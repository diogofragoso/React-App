# Validação da documentação do Portal Acadêmico

[Início](../README.md) · [Implementação](../README.md#percurso-do-estudante) · [Contrato](CONTRATO-DA-API.md)

Revisão de 21 de outubro de 2026. O código do React-App e o contrato lido em express.js_API são a referência. A trilha antiga de 36 capítulos implementa clientes, enquanto `src` implementa o portal acadêmico; ela foi identificada como material complementar em seu índice e em cada capítulo.

## Escopo

O percurso do estudante está organizado em 11 capítulos em `docs/portal`, com índice no README, objetivos, pré-requisitos, navegação e conferência. Inclui dependências, lockfile, configurações TypeScript/Vite/Oxlint, ambientes, tipos, Axios, Context, proteção de rotas, todas as páginas, entrada, arquivos auxiliares e configuração de publicação. Os exemplos são cópias completas do código atual. As explicações registram os comportamentos e limites observados por leitura de código. As ferramentas e o script auxiliar ficam no [guia de manutenção](MANUTENCAO.md); não são capítulos obrigatórios do percurso.

`node docs/scripts/sincronizar-portal.cjs` compara os exemplos com os arquivos de origem, exige cobertura de todos os arquivos de `src` e `public` e verifica links locais e fechamento de blocos Markdown. A opção `--write` sincroniza os blocos, mas a explicação deve ser revisada manualmente quando o código mudar.

A reorganização preservou os 32 exemplos e os arquivos do aplicativo. A reconstrução e a comparação dos arquivos foram repetidas usando os capítulos; os resultados de build abaixo foram obtidos na revisão anterior, sobre o mesmo código. `IMPLEMENTACAO.md` agora apenas encaminha links anteriores ao índice principal.

## Verificações desta revisão

Ambiente: Windows/PowerShell, Node 24.11.1 e npm 11.6.2, usando dependências já instaladas e o lockfile existente.

| Verificação executada | Resultado |
|---|---|
| `node docs/scripts/sincronizar-portal.cjs` | 32 arquivos conferidos, cobertura de src/public e links locais aprovados |
| `npm.cmd run lint` | Sem erros; um aviso existente de `react/only-export-components` em AuthContext |
| `node scripts/test-storage-security.mjs` | Três verificações aprovadas; inspeção textual e simulação, sem renderização React |
| `npm.cmd run build` | TypeScript e Vite aprovados; 395 módulos transformados |
| Reconstrução por `--reconstruir`, seguida de `npm.cmd run build` na pasta gerada | Build aprovado usando exclusivamente os arquivos extraídos dos blocos e o lockfile de referência |
| `git diff --check` | Sem problemas de whitespace nos arquivos rastreados |

A reconstrução usa uma pasta nova em `node_modules/.tmp/portal-documentado-*`, ignorada pelo Git, e resolve as dependências já instaladas nas pastas ancestrais. Não copia `src` diretamente. Os blocos são comparados após normalizar CRLF/LF e remover espaços/quebras finais do arquivo; diferenças de código são rejeitadas. Os bundles JS e CSS da reconstrução e da aplicação têm o mesmo hash. O relatório [portal-atual.json](evidencias/portal-atual.json) registra os arquivos e hashes desta execução.

O primeiro build no sandbox encontrou `spawn EPERM` ao carregar a configuração Vite no Windows. A execução autorizada fora do sandbox concluiu tanto o build da aplicação quanto o da reconstrução. Isso foi uma restrição de execução, não uma falha de TypeScript.

Para repetir a reconstrução na raiz do repositório:

```powershell
node docs/scripts/sincronizar-portal.cjs --reconstruir
```

Entre na pasta exata exibida pelo comando e execute `npm.cmd run build`. Isso não instala dependências novas nem comprova uma instalação limpa por rede. As evidências antigas não são utilizadas como comprovação do portal.

## Limites encontrados no código

- Cadastro: `finally` limpa `loading` em vez de `regLoading`, podendo manter o formulário bloqueado após erro.
- Tipos: `User.name` é string no frontend, mas a API pode retornar null.
- Sessão: 401 global apenas gera aviso; falha de rede na restauração resulta em usuário nulo. Não existe renovação automática.
- Logout: limpa o estado local mesmo com falha remota; cookie ainda válido pode restaurar sessão depois. Não revoga JWT já emitido.
- Catálogo da API: o modal e o service usam aluno 2/professor 3; `init-rbac.ts` ainda descreve aluno 1/admin 2.
- Conteúdo acadêmico é estático e controle de rotas não equivale a autorização de recursos no servidor.

Não foram alterados os arquivos do aplicativo nem o backend para corrigir esses pontos: o objetivo desta revisão é documentar fielmente sua implementação. O roteiro explica o impacto e a verificação necessária.

Não houve instalação limpa por rede, cadastro real, alteração de banco, sessão de navegador ou deploy. O build e as inspeções não comprovam CORS, aceitação de cookies, catálogo do banco, acessibilidade ou disponibilidade em produção.

## Evidências anteriores

O [relatório histórico](RELATORIO-HISTORICO-CLIENTES.md) e os JSON antigos em `docs/evidencias` são da trilha de clientes em 2 de outubro de 2026. Seus 15 testes e build reconstruído não se aplicam às telas atuais. `docs/scripts/validar-guia.cjs` continua disponível para essa trilha complementar; não substitui o verificador do portal.
